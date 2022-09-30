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

# Build the service image.
docker build \
	-f docker/$SERVICE.Dockerfile \
	-t duelyst-$SERVICE:$VERSION \
	--build-arg NODEJS_IMAGE_VERSION=$VERSION \
	. || {
	echo "Failed to build service image!"
	exit 1
}

# Don't push development images to ECR.
if [ $VERSION == 'testing' ]; then
	echo "Done! Not pushing test image to ECR."
	exit 0
fi
