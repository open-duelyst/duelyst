# OpenDuelyst Quick Start Guide

## Table of Contents

- [Helpful Links](#helpful-links)
- [Installing Dependencies](#dependencies)
- [Building the Code](#build)
- [Building Desktop Clients](#desktop)
- [Starting the Game Server with Docker](#start)
- [Common Troubleshooting Steps](#troubleshoot)

## Helpful Links <a id="helpful-links" />

- [Architecture Documentation](ARCHITECTURE.md)
- [Node.js v16 API Reference](https://nodejs.org/dist/latest-v16.x/docs/api/)
- [Redis Documentation](https://redis.io/docs/)
- [Postgres v14 Documentation](https://www.postgresql.org/docs/14/index.html)
- [Firebase API Reference (Frontend)](https://firebase.google.com/docs/reference/node/)
- [Firebase API Reference (Backend)](https://firebase.google.com/docs/reference/admin/node/)
- [Socket.io v4 Documentation](https://socket.io/docs/v4/)
- [JSON Web Token Documentation](https://jwt.io/)

## Installing Dependencies <a id="dependencies" />

### Node.js

To build the code, you will need Node.js, NPM, and Yarn.

For Windows environments, install Volta, Node.js v24, and Yarn v1.

For Unix environments:
```bash
curl https://get.volta.sh | bash
volta install node@24
volta install yarn@1
```

### Google Firebase

In order to successfully run the game, you will need a 
[Firebase Realtime Database](https://firebase.google.com/docs/database/). This
is a free service which requires a Google Firebase account.

Create a Google Firebase account, a Firebase project, and a Firebase Realtime
Database. Be sure to create the Realtime Database in the US Central region, as
the Europe and Singapore regions will give you a URL which is incompatible with
our Firebase client.

Once you have created a Firebase account and a Realtime Database, take note of
your Realtime Database's URL, as you'll need it when building the code. You
will also want to configure the Security Rules for your database. You can copy
these from [firebaseRules.json](../firebaseRules.json) in the repo.

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

If you would like to enable the shop, set the value of
`/system-status/shop_enabled` in Firebase to `true`. Once this is done, the shop
will appear in the main menu.

## Building the Code <a id="build" />

Now that dependencies are installed, you can build the game code and its
assets. This step will take a few minutes.
```bash
corepack enable
yarn set version berry
yarn workspaces focus
yarn tsc:chroma-js
FIREBASE_URL=<your-firebase-url> yarn build
```

The value of `<your-firebase-url>` should be
`https://<your-database>-default-rtdb.firebaseio.com/`, including the trailing
slash. Including the Firebase URL here enables the game client to communicate
with the server code.

## Building Desktop Clients <a id="desktop" />

After building the app, the desktop clients can be built separately:
```bash
cd desktop
yarn workspaces focus
# replace <platform> with 'mac', 'windows', 'linux', or 'all'
yarn build:<platform>
yarn start:<platform>
```

The compiled client will be in the `dist/src` directory.

On Mac or Linux, install Wine to enable building Windows desktop clients. On
Mac, use `brew install --cask wine-stable`. On Linux, install `libgconf-2-4`
in order to avoid some build errors.

Prebuilt desktop clients can also be downloaded
[here](https://github.com/open-duelyst/duelyst/releases).

## Starting the Game Server with Docker <a id="start" />

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

## Common Troubleshooting Steps <a id="troubleshoot" />

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
