Simple phantom token example project

The `auth` module has 3 endpoints:
 - `/auth/user` `{ "name": "toto" }` -> create a new user & return a session token
 - `/auth/jwt` -> Convert the session token in the `authorization` header (after the `Bearer ` prefix) to a jwt
 - `/.well-known/jwks.json` -> Get a jwks (aka a public key) to verify the jwt's signature

The `api` module only has one enpoint:
 - `/api/me` -> Returns the content of the jwt it gets in the `authorization` header.

Normal flow

```bash
TOKEN=$(curl localhost:7891/auth/user -d '{ "name": "toto" }' | jq .token -r)
curl localhost:7891/api/me -H "authorization: Bearer $TOKEN"
```

when calling `/api/me`, we call it with the opaque token retrieved from the `/auth/user` endpoint.
the gateway will replace intercept this call and send a request to `/auth/jwt` with the `authorization` header.
if `/auth/jwt` returns an error (non 2XX response) -> it simply return this response to the client & abort the request
else, it will replace the `authorization` header with the one from the `/auth/jwt` (or it's body) and then make the request to `/api/me`


https://doc.traefik.io/traefik/middlewares/http/forwardauth/ for more info on how this works on traefik
