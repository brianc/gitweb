gitweb
====

A web backend for better Github merges.

Usage
===

Update `auth.go` with your Github ClientID and ClientSecret. 

Update `main.go` with your Github repo.

Install the included TamperMonkey script and update `webmergeUrl` to your webmerge server and the `@match` URL to your Github repo.

API
---

All of the following accept an HTTP GET:

- `/auth/login` Starts an OAuth handshake to authorize the app

- `/auth/status` Returns the currently logged in user (using the Github API)

```
{"loggedIn":true,"user":"Alan Gardner"}
```

- `/git/rebase?branch=<branch>&msg=<commit message>` - Starts a rebase and squash using the new commit message

```
{"id":"5577006791947779410"}
```

- `/git/merge?branch=<branch>` - Starts a fast-forward-only merge from the branch into master

```
{"id":"5577006791947779410"}
```

- `/job/status?job=<job id>` - Get the stdout, stderr and completion status of the given job

```
{"error":{},"finished":true,"output":"Cloning into '/tmp/webmerge281114230'...\u003cbr\u003eSwitched to a new branch 'rebase_branch'\u003cbr\u003eBranch rebase_branch set up to track remote branch rebase_branch from origin.\u003cbr\u003eOn branch rebase_branch\u003cbr\u003eYour branch is up-to-date with 'origin/rebase_branch'.\u003cbr\u003e\u003cbr\u003enothing to commit, working directory clean\u003cbr\u003e"}
```
