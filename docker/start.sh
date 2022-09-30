#!/usr/bin/env bash

# Work around git vs https issue for old packages.
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://

# Install dependencies.
yarn install --dev

# Use exec to take over the PID from the shell, enabling signal handling.
exec yarn $1
