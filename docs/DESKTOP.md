# Building the Desktop Client

## One-Time Setup

Install `cross-env` with `npm install -g cross-env`, which is used to support
running the steps below on Windows systems in addition to Mac and Linux systems.

On Mac or Linux, install Wine to enable building Windows desktop clients. On
Mac, use `brew install --cask wine-stable`.

## Build the JavaScript Client

The Desktop build will pull in the JavaScript client code, so we'll build that
first. These commands should be run from the project root directory.

1. Install app dependencies with `yarn install --include=dev`.
2. Build the app with `cross-env NODE_ENV=staging FIREBASE_URL=FOO API_URL=BAR yarn build`.
   `FIREBASE_URL` should have a trailing slash, while `API_URL` should not.

Once this is done, the compiled app will be located in `dist/src/`.

## Build the Desktop Client

These commands should be run from the `desktop/` directory, which has its own
dependencies and scripts.

1. Install desktop dependencies with `yarn install --include=dev`.
2. Run `yarn build:all` to build the staging clients. To build production
   clients, use `yarn build:all:production`. Clients will be in `dist/build`.
3. To run the newly-built app, use `yarn start:mac`, `yarn:start:linux`,  or
   `yarn start:windows`.
4. Run `yarn zip:all` to compress all available desktop clients.

## Known Issues

- The Linux build depends on the `libgconf-2-4` package.
