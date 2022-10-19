#!/usr/bin/env bash

# Work around boneskull/yargs dependency using the deprecated git protocol.
apk add git
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://

# Install node-gyp dependencies for bcrypt in API and worker
apk add python3 make gcc g++

# Install dependencies.
yarn install --production

# Use exec to take over the PID from the shell, enabling signal handling.
exec yarn $1
