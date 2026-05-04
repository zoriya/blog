---
title: "Jwt should not be persisted"
description: ""
date: 2025-03-26
draft: true
tags: []
---

It's easy to find online resources talking about the merits of JWT. You'll read stuff like "it's better for horizontal scaling", "it's better for perf since you don't need to hit the db on every request" or how it has better security.
Most of those resources either only talk about auth on a surface level or will introduce workarounds for JWTs shortcomings that negate its advantages.

# A story about state

The main benefits of JWT is that the token is stateful, so we can deduce the user's permissions without having to hit the db or an auth server. This is extremely valuable in a microservice context, without a JWT you'll have to ask db 50 times if you have 50 services.

The biggest disadvantage is that the token is stateful. This means the token will drift-offs. If your user gains or loses permissions, is banned or revoked their session, the JWT is still valid and has the permissions at the time of creation.

To mitigate those issues, some people will introduce deny-lists of JWT that should not be accepted by your servers. This re-introduces the initial problem of session: making a db call on each request (and on every service.)


# Single use JWTs

Instead of creating sessions on top of JWTs, we can embrace what JWTs are good at: proving who you are & your permissions over something that doesn't change over time or that expires very quickly.

For example, you could imagine an API that would compute something over a long period of time (say a week.) The API that enqueues the compute could return you a JWT allowing you to access progress/results of said task.
This simplifies auth handling for the compute service that now only has to verify the JWT & you have no risk of your permission changing or being revoked: the JWT only grants you access to a single compute that you started.

# JWTs in microservices

As stated previously, JWTs truly shines in microservices **as long as** you don't need to check for token invalidation on each service. There's a neat way to get this that I implemented recently for [kyoo's v5](https://github.com/zoriya/kyoo): phantom tokens!

The concept is simple:
- use traditional sessions when communicating with the client
- use JWT when communicating across services
- when a user makes a request, have the gateway convert the session (after checking its validity) to a JWT

You get the benefits of JWT (aka no call to db/auth service in every service) while having traditional sessions in the user's perspective (so no manual token refresh needed, no out-of-sync permissions & no token valid after session invalidation).
The main cons of this method are a SPOF on your auth service & bringing some logic to your gateway (especially for kyoo because for k8s releases we want to allow users to choose their gateway. Sorry @acelinkio :p)

## Example implementation 

For a minimal phantom token implementation you would need:
- an auth service to login/logout/stuff that will return a session token
- a route to convert a session token to a short lived jwt
- a gateway that has a middleware to convert the session to a jwt by calling said route
- an api that consumes the jwt


For our example we will use traefik, we can imagine a docker compose like this:

```yaml
services:
  auth:
    build: ./auth
    restart: on-failure
    ports:
      - "8080:8080"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.auth.rule=PathPrefix(`/auth/`)"

  api:
    build: ./api
    restart: on-failure
    ports:
      - "3000:3000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=PathPrefix(`/api/`)"

  traefik:
    image: traefik:v3.3
    restart: on-failure
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entryPoints.web.address=:7891"
      - "--accesslog=true"
    ports:
      - "7891:7891"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
```

The auth service that handles login/logout is very simple, exactly what you'd expect.

For a simple example, we're storing users in memory and we only allow registration (not login), of course you'd have a database and other methods in a real service.

```go
package main

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/jwk"
)

type User struct {
	Name string `json:"name"`
}

func main() {
	users := make(map[string]User)

	http.HandleFunc("/auth/user", func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)
		var u User
		err := decoder.Decode(&u)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// generate random session id
		id := make([]byte, 64)
		_, err = rand.Read(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		token := base64.StdEncoding.EncodeToString(id)

		users[token] = u

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(struct {
			Name  string `json:"name"`
			Token string `json:"token"`
		}{Name: u.Name, Token: token})
	})
	
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Now onto the method to convert a session to a jwt. Nothing too fancy, create a jwt, assign claims to the user's values and sign it.

```go
	rsakey, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/auth/jwt", func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			http.Error(w, "Missing session token", http.StatusUnauthorized)
			return
		}
		token := auth[len("Bearer "):]

		user, ok := users[token]
		if !ok {
			http.Error(w, "Invalid token", http.StatusForbidden)
			return
		}

		claims := make(jwt.MapClaims)
		claims["sub"] = user.Name
		claims["iss"] = "keibi-blog"
		claims["iat"] = &jwt.NumericDate{
			Time: time.Now().UTC(),
		}
		claims["exp"] = &jwt.NumericDate{
			Time: time.Now().UTC().Add(time.Hour),
		}
		jwt := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		t, err := jwt.SignedString(rsakey)
		if err != nil {
			http.Error(w, "Could not sign token", http.StatusInternalServerError)
			return
		}

		w.Header().Add("Authorization", fmt.Sprintf("Bearer %s", t))

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jwt)
	})
```

Great, now we have a way to login, when the user call this method they'll get a session token they can store and send in every subsequent requests. For our phantom token to be useful, we need to configure our gateway to convert the session to a jwt when the request enters the internal network.

Here, we are using traefik but lots of gateways support this more or less natively.

```diff
 services:
   api:
     build: ./api
     restart: on-failure
     ports:
       - "3000:3000"
     labels:
       - "traefik.enable=true"
       - "traefik.http.routers.api.rule=PathPrefix(`/api/`)"
+       - "traefik.http.routers.api.middlewares=phantom-token"
+       - "traefik.http.middlewares.phantom-token.forwardauth.address=http://auth:8080/auth/jwt"
+       - "traefik.http.middlewares.phantom-token.forwardauth.authRequestHeaders=Authorization,X-Api-Key"
+       - "traefik.http.middlewares.phantom-token.forwardauth.authResponseHeaders=Authorization"
```

This simple middleware tells traefik to first call `auth:8080/auth/jwt` with the given `Authorization` header and:
- instantly return an error if the auth service returns a >= 400 status code
- continue with the request to api with a new `Authorization` header containing the jwt.

This allows our api to consume a jwt without having to call the auth at any time. Another service could call this api with an existing jwt or it can be called directly from the outside transparently since traefik handles the token exchange.

Example api:
```ts
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(
	new URL(
		".well-known/jwks.json",
		process.env.AUTH_SERVER ?? "http://auth:8080",
	),
);

Bun.serve({
	routes: {
		"/api/me": async (req) => {
			const auth = req.headers.get("authorization");
			const bearer = auth?.slice(7);
			console.log("auth", auth, "bearer", bearer);
			if (!bearer) return new Response("Forbidden", { status: 403 });

			const { payload } = await jwtVerify(bearer, jwks);
			console.log("success", "jwt payload", payload);
			return new Response(JSON.stringify(payload));
		},
	},
});
```

Notice that this snippet is using jwks to verify the token, for a quick crash course on jwt:
- jwt are signed, in our example with an RSA key.
- the key used to sign the jwt can (and should) be rotated from time to time
- jwt signing keys can be symmetric or asymmetric (with public & private keys)
- a jwk contain a public key to verify a signature
- a jwks contain a list of jwk and a kid (key id) for each of them, code that wants to check the validity of a jwt first fetch the jwks and verify the jwt signature with the corresponding key (the one that matches the jwt's `kid`.
- if the jwt's `kid` is not found in the jwks, the jwks should be fetched again as the key might be a newly rotated one.


We of course need to implement this jwks endpoint to broadcast our keys to the api, it can be as simple as:

```go
http.HandleFunc("/.well-known/jwks.json", func(w http.ResponseWriter, r *http.Request) {
		key, err := jwk.New(rsakey.PublicKey)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		key.Set("use", "sig")
		key.Set("key_ops", "verify")
		set := jwk.NewSet()
		set.Add(key)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(set)
	})
```

You might want to cache as least the previous key so already existing jwts aren't instantly invalidated in case of signing key refresh.

That's it for a super basic phantom token setup!

# The downsides of phantom tokens

## SPOF on auth

Since every request going through your gateway needs to pass through the auth service to generate a jwt, you 100% have a single point of failure on the auth service. 

I don't think it's as bad as it sounds since in any other scenario you would still need to reach out for the auth's service/database to check for expired jwt or to get a session's information. Instead having everything cleanly separated in an auth service makes it easier to be high availability and reduces the scope that might impact the available of the service.

## Logic on the gateway

We do need to add logic to the gateway for phantom tokens to work but this isn't as niche as it sounds. For example [k8s'gateway api added support for it recently ](see https://github.com/kubernetes-sigs/gateway-api/pull/4001) and a lot of gatways support it natively.

- [ ] cilium: https://github.com/cilium/cilium#23797
- [x] envoy gateway: https://github.com/cilium/cilium#23797
- [x] traefik: https://doc.traefik.io/traefik/reference/routing-configuration/http/middlewares/forwardauth/
- [ ] add other proxy to this list by contributing! I was too lazy to find more references

## Long lived flows or websockets

Some flows might outlive the duration of the temporary jwt created by the gateway. One such example is websockets, you can create a jwt and ensure the user has the permissions to create a jwt by handling the first request (the one that will return 101 switching protocol) but if you send a message in your websocket 5 hours later your jwt will have expired.

I couldn't find a silver lining solution for this, the best i came up with for kyoo is to consider the websocket handler as another gateway and refresh the jwt on each new message (excluding keep-alive/pings)

# Afterword

I'm pretty happy with 