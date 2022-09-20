# Duelyst

This is the source code for Duelyst, a digital collectible card game and turn-based strategy hybrid developed by Counterplay Games and released in 2016.

## Client/Server Architecture

For client and server architecture notes, see [ARCHITECTURE.md](ARCHITECTURE.md).

## JavaScript, CoffeeScript, and TypeScript

Most of the code is written in CoffeeScript, which compiles into JavaScript.
We should consider moving to TypeScript where possible.

## Setting up a development environment

#### Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/en/download/) with NPM

#### Building the code

Install Yarn (can use `sudo` on Mac/Linux):
```
npm install -g yarn
```

Compile TypeScript dependencies:
```
yarn tsc:chroma-js
```

Install NPM dependencies:
```
yarn install --dev
```

Build the game:
```
# Mac / Linux:
FIREBASE_URL=<my-firebase-url> yarn build

# Windows:
$env:FIREBASE_URL = '<my-firebase-url>'
yarn build
```

The above build command builds the game and its required resources for the first time, which will take a few minutes. Use it when making changes to resources like cards, codex data, cosmetics, etc.

Once the initial build is done, you can save time by rebuilding only the app (takes about 50 seconds):
```
# Mac / Linux:
FIREBASE_URL=<my-firebase-url> yarn build:app

# Windows:
$env:FIREBASE_URL = '<my-firebase-url>'
yarn build
```

Or rebuild only the HTML/CSS and localization files (takes about 5 seconds):
```
yarn build:web
```

When working in the `server` or `worker` directories, no rebuilds are needed. See below for instructions to test changes in Docker instead.

#### Starting a test environment in Docker

- Create a [Firebase Realtime Database](https://firebase.google.com/docs/database/) in Google Cloud
  - Set `FIREBASE_URL` in a `.env` file in the repo root
    - E.g. `FIREBASE_URL=https://my-example-project.firebaseio.com/`
  - Retrieve your Firebase Database legacy token in `Settings > Service Accounts > Database Secrets`, and put it in `.env` as well
    - E.g. `FIREBASE_LEGACY_TOKEN=abcdefg1234567890abcdefg1234567890`
  - Create a new service account with read+write access to your realtime database
  - Create a new JSON key for the service account, and store it in a `serviceAccountKey.json` file in the repo root
- Run database migrations with `docker compose up migrate`
- Start the game's backend services with `docker compose up`
- Once you see `Duelyst 'development' started on port 3000` in the logs, open http://localhost:3000 in a browser to load the game client

#### Contributing

If you'd like to contribute to Duelyst, check the [open issues](https://github.com/open-duelyst/duelyst/issues) for project ideas.
