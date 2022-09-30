#!/usr/bin/env bash

# Parse arguments.
ENVIRONMENT=$1
if [ -z $ENVIRONMENT ]; then echo "First arg must be ENVIRONMENT e.g. 'staging'"; exit 1; fi
SERVICE=$2
if [ -z $SERVICE ]; then echo "second arg must be SERVICE e.g. 'sp'"; exit 1; fi
VERSION=$3
if [ -z $VERSION ]; then VERSION=testing; fi

# Reuse environment variables from `.env`
source .env

# Validate configuration.
if [ -z $REDIS_HOST ]; then echo "REDIS_HOST must be set"; exit 1; fi
if [ -z $FIREBASE_URL ]; then echo "FIREBASE_URL must be set"; exit 1; fi
if [ -z $FIREBASE_LEGACY_TOKEN ]; then echo "FIREBASE_LEGACY_TOKEN must be set"; exit 1; fi

docker build \
	-f docker/$SERVICE/Dockerfile \
	-t duelyst-$SERVICE:$VERSION \
	--build-arg REDIS_HOST=${REDIS_HOST} \
	--build-arg FIREBASE_URL=${FIREBASE_URL} \
	--build-arg FIREBASE_LEGACY_TOKEN=${FIREBASE_LEGACY_TOKEN} \
	.
