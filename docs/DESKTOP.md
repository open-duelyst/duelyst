# Building the Desktop Client

Follow these steps to build the desktop client:

1. Build the app using either the staging or production config. You can use the
   `scripts/build_staging_app.sh` script for this purpose. This will create all
   necessary resources in the `dist/src` directory.
2. From the `desktop` directory, run `yarn install --include=dev`.
3. Run `yarn build:all`. This will build the staging clients. To build
   production clients, use `yarn build:all:production`.
4. To run the newly-built app, use `yarn start:windows` or `yarn start:mac`.

## Known Issues

- The Windows client does not build successfully without `wine` on Mac.
- The packaging of desktop clients into checksummed ZIP files is disabled.
- The Steam build is not yet working.
