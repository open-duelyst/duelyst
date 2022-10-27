# Contributing to OpenDuelyst

Thanks for your interest in contributing to OpenDuelyst!
This document will introduce you to the code and guide you through making a
change.

## Table of Contents

- [Helpful Links](#helpful-links)
- [Code Structure](#code-structure)
- [Setting up a Development Environment](#dev-environment)
- [Starting the Game Locally](#starting-the-game)
- [Common Troubleshooting Steps](#troubleshooting)
- [Making App (Frontend) Changes](#frontend-changes)
- [Making Server/Worker (Backend) Changes](#backend-changes)
- [Opening Pull Requests](#pull-requests)
- [Versioning](#versioning)
- [Where to Get Help](#get-help)

## Helpful Links <a id="helpful-links" />

- [OpenDuelyst Roadmap](ROADMAP.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Open Issues](https://github.com/open-duelyst/duelyst/issues)
- [Node.js v16 API Reference](https://nodejs.org/dist/latest-v16.x/docs/api/)
- [Redis Documentation](https://redis.io/docs/)
- [Postgres v14 Documentation](https://www.postgresql.org/docs/14/index.html)
- [Firebase API Reference (Frontend)](https://firebase.google.com/docs/reference/node/)
- [Firebase API Reference (Backend)](https://firebase.google.com/docs/reference/admin/node/)
- [Socket.io v4 Documentation](https://socket.io/docs/v4/)
- [JSON Web Token Documentation](https://jwt.io/)
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

## Setting up a Development Environment <a id="dev-environment" />

#### Installing System Dependencies

Before you get started, you'll need Node.js and
[Docker Desktop](https://www.docker.com/products/docker-desktop/)
These will enable you to run the code in containers, and to interact with the
JavaScript build process.

We recommend installing Node.js by using [Volta](https://volta.sh/), which
helps manage Node.js versions for you. We use the latest LTS release of Node,
which is currently v18.

Once you have `npm`, you can use it to install Yarn (the package manager we
use):

```bash
npm install -g yarn@1
npm install -g cross-env
```

Before proceeding, disable the deprecated `git://` protocol for fetching
packages:
```
git config --global url."https://".insteadOf git://
```

#### Installing Node.js Dependencies

Once you have Yarn installed, you can install the dependencies for the game.
Run the following in the repository root directory:

```bash
yarn install --dev  # Install remaining Node.js dependencies.
yarn tsc:chroma-js  # Compile TypeScript dependencies.
```

#### Setting up Firebase

In order to successfully run the game, you will need a
[Firebase Realtime Database](https://firebase.google.com/docs/database/).

Fortunately, Google provides a free version of this service called the
["Spark Pricing Plan"](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

Create a Firebase (Google) account, a Firebase project, and a Firebase Realtime
Database. Be sure to create the Realtime Database in the US Central region, as
the Europe and Singapore regions will give you a URL which is incompatible with
our Firebase client.

Once you have created a Firebase account and a Realtime Database, take note of
your Realtime Database's URL, as you'll need it when building the code. You
will also want to configure the Security Rules for your database. You can copy
these from [firebaseRules.json](firebaseRules.json) in the repo.

#### Building the Code

Now that dependencies are installed, you can build the game code and its
assets. This step will take a few minutes.

```
cross-env FIREBASE_URL=<YOUR_FIREBASE_URL> yarn build
```

Including the Firebase URL is important, since it enables the game client to
communicate with the servers. There's a link button on the front page of the
realtime database you can press to copy the correct URL; don't copy and paste
the address. We want the URl provided on the front page; it should look something
like 'https://[name_of_database]-default-rtdb.firebaseio.com/".

After the initial build, you can save time with `yarn build:app` (code only; no
assets) or `yarn build:web` (frontend HTML/CSS/JS only).

## Starting the Game Locally <a id="starting-the-game" />

#### Additional Firebase Configuration

Now that you have a development environment set up, there's a bit more Firebase
configuration needed. From your Firebase project settings page, click the
"Service Accounts" tab.

First, click "Database Secrets" and create a new legacy token.
Create a file named `.env` in the repo root with the following contents:

```bash
FIREBASE_URL=<YOUR_FIREBASE_URL>
FIREBASE_LEGACY_TOKEN=<YOUR_FIREBASE_LEGACY_TOKEN>
```

Next, still on the Firebase "Service Accounts" page, click on the Service
Accounts popout to open Google Cloud. Create a new service account with the
ability to read from and write to Firebase. You can achieve this by using the
"Firebase Realtime Database Admin" role, but you may want to restrict this
later.

On the Google "Service Accounts" page, clicking "Manage Keys" next to the
newly-created service account will let you create a new JSON key. Do this, and
save it as `serviceAccountKey.json` in the repo root.

Note: Both `.env` and `serviceAccountKey.json` are ignored by Git for this repo,
so these secrets can't be accidentally committed.

#### Starting with Docker

Now that the game has been built and Firebase has been configured, you can
start the servers locally and play a game. We use
[Docker Compose](https://docs.docker.com/compose/) to manage containers for the
game servers, Redis cache, and Postgres database.

As a final step before starting the game servers, the Postgres database must be
initialized. To do this, run `docker compose up migrate`.

Now you can run `docker compose up` to start the game servers and their
dependencies.

Once you see `Duelyst 'development' started on port 3000` in the logs, the
server is ready! Open http://localhost:3000/ in a browser to load the client,
create a user, and play a practice game.

## Common Troubleshooting Steps <a id="troubleshooting" />

After you load Duelyst in your browser, there are two key places to monitor:

1. The browser console, which will relay all errors generated by the app.
Filtering this to only the `warning` and `error` log levels will make things
more readable.

2. The console output of Docker Compose, which will multiplex log output from
all of the game containers. Keep an eye out in particular for any error stack
traces, which will be hard to miss since they span several lines and break from
the typical log format.

Errors from both of these sources should give you both a file and line number
to reference. If not, you can generally search for the error string to find out
where the error is originating in the code. Some errors originate from our
dependencies, so you can also search for error strings in the `node_modules/`
directory if you're having trouble tracking something down.

## Making App (Frontend) Changes <a id="frontend-changes" />

Now that you have the full development environment set up, you can try making
changes to the game client. To do this, edit any code, cards, or resources
desired in the `app/` directory.

When finished, build the game once more:
```
FIREBASE_URL=<YOUR_FIREBASE_URL> yarn build
```

You can now run `docker compose up` again and load the client to test your
changes.

## Making Server/Worker (Backend) Changes <a id="backend-changes" />

When working on the Server or Worker code, you don't need to rebuild the game.
Instead, simply run `docker compose up` again, and load the game client to test
your changes.

Don't forget to run unit tests with `yarn test:unit`, and integration tests
with `yarn test:integration`. If you notice a failing test for code you haven't
changed, please file a new `bug` issue.

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

## Where to Get Help <a id="get-help" />

At the moment, you can get help with OpenDuelyst by opening an issue.
Since this is a volunteer project, it may take a few days for someone to look
at your issue.

You can also join the [OpenDuelyst Discord server](https://discord.gg/HhUWfZ9cxe)
for technical discussion and support.
