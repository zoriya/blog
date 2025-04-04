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



