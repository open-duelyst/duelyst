#!/usr/bin/env bash

# Parse arguments.
SERVICE=$1
if [ -z $SERVICE ]; then echo "First argument must be SERVICE e.g. 'sp'!"; exit 1; fi
VERSION=$2
if [ -z $VERSION ]; then VERSION=testing; fi

# Rebuild the base Node.js image if needed.
echo "Building image for duelyst-nodejs:$VERSION."
docker build \
	-f docker/nodejs.Dockerfile \
	-t duelyst-nodejs:$VERSION \
	. || {
	echo "Failed to build Node.js image!"
	exit 1
}

# Validate service configuration.
source .env
if [ -z $REDIS_HOST ]; then echo "REDIS_HOST must be set!"; exit 1; fi
if [ -z $FIREBASE_URL ]; then echo "FIREBASE_URL must be set!"; exit 1; fi
if [ -z $FIREBASE_LEGACY_TOKEN ]; then echo "FIREBASE_LEGACY_TOKEN must be set!"; exit 1; fi

# Build the service image.
docker build \
	-f docker/$SERVICE.Dockerfile \
	-t duelyst-$SERVICE:$VERSION \
	--build-arg NODEJS_IMAGE_VERSION=$VERSION \
	--build-arg REDIS_HOST=$REDIS_HOST \
	--build-arg FIREBASE_URL=$FIREBASE_URL \
	--build-arg FIREBASE_LEGACY_TOKEN=$FIREBASE_LEGACY_TOKEN \
	. || {
	echo "Failed to build service image!"
	exit 1
}

# Don't push development images to ECR.
if [ $VERSION == 'testing' ]; then
	echo "Done! Not pushing test image to ECR."
	exit 0
fi
