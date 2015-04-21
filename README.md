gitweb
====

A web backend for better Github merges.

![Gitweb screenshot](https://raw.githubusercontent.com/alanctgardner/gitweb/docs/gitweb-screen.png  "Gitweb screenshot")

Usage
===

Install `webmerge.js` as a TamperMonkey script (may also work in GreaseMonkey).

Note - the server will use your Github OAuth credentials to pull down repos. If you don't trust
a 3rd party with write access to your repos, you can build and run the server:

- Register a new Github application to get OAuth ID and Secret (https://github.com/settings/applications/new)
- Update `auth.go` with your application credentials
- Update the TamperMonkey script with your server address
- You may also need to create a directory in `/tmp` for repos to be checked out in

API
---

- `GET /auth/login` Starts an OAuth handshake to authorize the app

- `GET /auth/status` Returns the currently logged in user (using the Github API)

```
{"loggedIn":true,"user":"Alan Gardner"}
```

- `POST /git/rebase?branch=<branch>&repo=<repo>&msg=<commit message>` - Starts a rebase and squash using the new commit message

```
{"id":"5577006791947779410"}
```

- `POST /git/merge?branch=<branch>&repo=<repo>` - Starts a fast-forward-only merge from the branch into master

```
{"id":"5577006791947779410"}
```

- `GET /job/status?job=<job id>` - Get the stdout, stderr and completion status of the given job

```
{"error":{},"finished":true,"output":"Cloning into '/tmp/webmerge281114230'...\u003cbr\u003eSwitched to a new branch 'rebase_branch'\u003cbr\u003eBranch rebase_branch set up to track remote branch rebase_branch from origin.\u003cbr\u003eOn branch rebase_branch\u003cbr\u003eYour branch is up-to-date with 'origin/rebase_branch'.\u003cbr\u003e\u003cbr\u003enothing to commit, working directory clean\u003cbr\u003e"}
```

Notes
----

- Git commits use your Github-registered email and name. Your Github email must be public. 
- Repos for the REST API are of the form `github.com/<user>/<repo>.git`. No `https` prefix. 
