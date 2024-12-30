---
title: "Our CI is over engineered"
description: ""
date: 2024-11-05
draft: true
tags: ["ci", "bash", "tools"]
---

I recently went to update a simple CI job for [Kyoo](https://github.com/zoriya/kyoo). The job is straightforward but the job definition (in github action) is NOT.

My job definition looks like:

```yml
name: RobotTests
on:
  push:
    branches:
      - master
      - next
  pull_request:


jobs:
  test:
    name: Robot tests Auth
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        ports:
         - "5432:5432"
        env:
          POSTGRES_USER: kyoo
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4

      - name: Robot cache
        uses: actions/setup-python@v5
        with:
          python-version: '3.9'
          cache: 'pip'

      - run: pip install -r requirements.txt

      - uses: actions/setup-go@v5
        with:
          go-version: '^1.22.5'
          cache-dependency-path: ./auth/go.sum

      - name: Install dependencies
        working-directory: ./auth
        run: |
          go mod download
          go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
          go install github.com/swaggo/swag/cmd/swag@latest

      - name: Build
        working-directory: ./auth
        run: |
          sqlc generate
          swag init --parseDependency
          go build -o ./keibi

      - name: Run robot tests
        working-directory: ./auth
        run: |
          ./keibi > logs &
          wget --retry-connrefused --retry-on-http-error=502 http://localhost:4568/health
          robot -d out robot
        env:
          POSTGRES_SERVER: localhost

      - name: Show logs
        working-directory: ./auth
        run: cat logs

      - uses: actions/upload-artifact@v4
        with:
          name: results
          path: auth/out
```

Looking at alternative solutions online, you can find [dagger](https://docs.dagger.io/quickstart/test) which allows you to write your CI like this:

```go
package main

import (
	"context"

	"dagger/hello-dagger/internal/dagger"
)

type HelloDagger struct{}

// Return the result of running unit tests
func (m *HelloDagger) Test(ctx context.Context, source *dagger.Directory) (string, error) {
	// get the build environment container
	// by calling another Dagger Function
	return m.BuildEnv(source).
		// call the test runner
		WithExec([]string{"npm", "run", "test:unit", "run"}).
		// capture and return the command output
		Stdout(ctx)
}
```

When I look at this, and how much fluff is needed to execute some simple commands and have a proper cache, I wonder why did it go so wrong.
My conclusion is that:
- we are scarred of bash
- we like DSL and the false security that *full-fledged languages* offer
- we are afraid of sane defaults.

Both CI samples are simply running a few bash commands, why do we bother ourselves with a wrapper language? Why is setting up caches that bothersome with github actions?

# What if it was bash

Let's imagine a CI that's based on bash (since anyway we are running bash commands).

```bash
# Install dependencies (both python, go & go tools)
pkg add python3 go
pip3 install -r requirements.txt
go mod download
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
go install github.com/swaggo/swag/cmd/swag@latest

# Start a postgres
docker run -name postgres -d -e POSTGRES_USER=kyoo -e POSTGRES_PASSWORD=password \
    --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5 \
    postgres:15

# Build the app
sqlc generate
swag init --parseDependency
go build -o ./keibi

# Run the app in background & wait for it to be ready
POSTGRES_SERVER=localhost ./keibi > logs &
wget --retry-connrefused --retry-on-http-error=502 http://localhost:4568/health

# Run or tests & show our app's logs
robot -d out robot
cat logs
```


<!-- vim: set wrap: -->
