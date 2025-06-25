#!/usr/bin/env bash

# Validate input.
if [ -z $FIREBASE_URL ]; then
	echo "Error: FIREBASE_URL must be set in order to build the app!"
	exit 1
fi
if [ -z $API_URL ]; then
	echo "Error: API_URL must be set in order to build the app!"
fi

# Clean and reinstall dependencies.
rm -rf node_modules
yarn workspaces focus || exit 1

# Build the game client.
NODE_ENV=staging yarn build:withallrsx || exit 1
