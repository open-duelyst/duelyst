#!/usr/bin/env bash

# Install bcrypt dependencies and git.
# TODO: Isolate bcrypt dependencies to API images only.
apt-get update && apt-get install -y python3 make gcc g++ git

# Work around boneskull/yargs dependency using the deprecated git protocol.
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://

# Install dependencies.
yarn install --production && yarn cache clean

# Use exec to take over the PID from the shell, enabling signal handling.
exec yarn $1
