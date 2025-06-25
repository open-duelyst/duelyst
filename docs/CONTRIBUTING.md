# Contributing to OpenDuelyst

This document will introduce you to the code and guide you through making
changes.

## Table of Contents

- [Helpful Links](#helpful-links)
- [Code Structure](#code-structure)
- [Running Tests](#tests)
- [Opening Pull Requests](#pull-requests)
- [Versioning](#versioning)
- [Where to Get Help](#help)

## Helpful Links <a id="helpful-links" />

- [Architecture Documentation](ARCHITECTURE.md)
- [Open Issues](https://github.com/open-duelyst/duelyst/issues)
- [Mocha Unit Testing API Reference](https://mochajs.org/api/)
- [Chai Assertion API Reference](https://www.chaijs.com/api/)

## Code Structure <a id="code-structure" />

An in-depth explanation of the code can be found in the Architecture
Documentation above. It contains some pointers to the specific places in the
code used by each service or component.

To help you get acquainted more quickly, here is a list of files and
directories commonly used when working on the game:

- `app/` contains code for the frontend / game client
- `config/` contains configuration for backend services
- `docker-compose.yaml` contains our Docker container configuration
- `docs` contains documentation, including this guide
- `gulp/` and `gulpfile.babel.js` contain workflow automation, for tasks like
	building the code
- `package.json` contains our Node.js dependencies
- `server` contains code for the HTTP API server and the WebSocket game servers
- `terraform` contains code for provisioning staging and production
	environments
- `test` contains unit and integration tests
- `worker` contains code for the worker, which processes asynchronous
	background jobs

#### Code Style and Linting

For JavaScript code, we use ESLint to enforce code style.
Its configuration can be found in `.eslintrc.json`.
You can run the linter with `yarn lint:js`.
You can automatically format JS code to meet these standards by running
`yarn format:js`.

For CoffeeScript code, we use CoffeeLint to enforce code style.
Its configuration can be found in `coffeelint.json`.
You can run linters with `yarn lint:coffee`, `yarn lint:coffee:app`, or
`yarn lint:coffee:backend`.

#### Regarding JavaScript, CoffeeScript, and TypeScript

Most of the code is written in CoffeeScript, which compiles into JavaScript. We
are considering replacing CoffeeScript with JavaScript (see
[Issue #4](https://github.com/open-duelyst/duelyst/issues/4)).

We should also consider moving to TypeScript where possible.
There is a fairly strict `tsconfig.json` in the repo which has been
preconfigured for new code. After writing new TypeScript code, you can run
`yarn tsc` to build it using this config.

## Running Tests <a id="tests" />

We use `mocha` and `chai` to run unit and integration tests in the project. Both
of these are triggered by `yarn`.

To run unit tests:
```
yarn test:unit
```

To run integration tests:
```
yarn test:integration
```

## Opening Pull Requests <a id="pull-requests" />

Once you have a contribution ready, you can open a pull request to get it
reviewed.

First, fork OpenDuelyst on Github, and push your branch to the fork. Then, when
signed into Github, you'll be prompted to open a pull request when viewing the
OpenDuelyst repo.

If the contribution solves an open issue, you can automatically close that
issue when the PR is merged. To do this, include the text "Closes #1234" in the
PR description (to automatically close issue #1234).

When you open a pull request, some tasks will automatically start in our
Continuous Integration (CI) environment to lint and test the code.

We use [Github Actions](https://github.com/features/actions) for CI, so you can
see the atatus and results of these tasks right in the pull request itself.

Once the PR has been reviewed and accepted, it will be merged into the `main`
branch. At this point, you are now an OpenDuelyst developer. Congratulations!

## Versioning <a id="versioning" />

OpenDuelyst uses [Semantic Versioning](https://semver.org/) for its releases.
In version `1.96.17`, `1` is the `MAJOR` version, `96` is the `MINOR` version,
and `17` is the `PATCH` version.

For OpenDuelyst, the `MAJOR` version should not exceed `1`. Note that the
immediate release after `1.99` is `1.100` and not `2.0.0`.

## Where to Get Help <a id="help" />

At the moment, you can get help with OpenDuelyst by opening an issue. Since this
is a volunteer project, it may take a while for someone to look at your issue.

You can also join the [OpenDuelyst Discord server](https://discord.gg/HhUWfZ9cxe)
for technical discussion and support.
