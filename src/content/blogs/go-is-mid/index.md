---
title: "Go is mid (by design)"
description: ""
date: 2024-08-10
tags: ["golang", "language"]
draft: true
---

+
 package manager (best existing)
 battery included std
 very simple, very readable

=
 errors
  + as value
  - no tooling arround this (errdefer, ?/try)
  - easy to miss (no warning when you discord an error)

-
 type system (inexistant)
  no sum types
  ptrs (whyyy) - optional? mutable? you cant' know
 std designed before generics (simple things like math.Abs)
 std feels half baked (hard to use API, see sqlx, all the http handlers...)
