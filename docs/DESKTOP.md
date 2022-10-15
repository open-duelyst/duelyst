# Building the Desktop Client

## One-Time Setup

Install `cross-env` with `npm install -g cross-env`, which is used to support
running the steps below on Windows systems in addition to Mac and Linux systems.

On Mac, install Wine with `brew install --cask wine-stable`. You may need to
manually allow it in the Security & Privacy settings in System Preferences.

## Build the JavaScript Client

The Desktop build will pull in the JavaScript client code, so we'll build that
first. These commands should be run from the project root directory.

1. Install app dependencies with `yarn install --include=dev`.
2. Build the app with `cross-env NODE_ENV=staging FIREBASE_URL=FOO API_URL=BAR yarn build`.
   `FIREBASE_URL` and `API_URL` are HTTPS URLs e.g. `https://staging.duelyst.org`.
   `FIREBASE_URL` should have a trailing slash, while `API_URL` should not.

Once this is done, the compiled app will be located in `dist/src/`.

## Build the Desktop Client

These commands should be run from the `desktop/` directory, which has its own
dependencies and scripts.

1. Install desktop dependencies with `yarn install --include=dev`.
2. Run `yarn build:all`. This will build the staging clients. To build
   production clients, use `yarn build:all:production`.
3. To run the newly-built app, use `yarn start:windows` or `yarn start:mac`.
4. To package the app, use `yarn zip:windows` or `yarn zip:mac`.

## Known Issues

- The Steam build is not yet working.
