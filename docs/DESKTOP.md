# Building the Desktop Client

Follow these steps to build the desktop client:

1. Build the app using either the staging or production config. You can use the
   `scripts/build_staging_app.sh` script for this purpose. This will create all
   necessary resources in the `dist/src` directory.
2. From the `desktop` directory, run `yarn build`. This will build the staging
   clients. To build production clients, use `yarn build:production`.
3. To run the newly-built app, use `yarn start:mac`. Windows support will be
   added soon.

## Known Issues

- The build scripts set environment variables using Linux/Mac format. These
	will not work on Windows. This will be fixed by creating new Windows-specific
	build scripts.
- The Windows client does not build successfully without the `wine` dependency.
- The packaging of desktop clients into checksummed ZIP files is disabled.
- The Steam build is not yet working.
