#!/usr/bin/env bash

# Helper function for error handling.
quit () {
	echo $1
	exit 1
}

# Parse arguments.
SERVICE=$1
if [ -z $SERVICE ]; then quit "First argument must be SERVICE e.g. 'sp'!"; fi
VERSION=$2
if [ -z $VERSION ]; then quit "Second argument must be VERSION e.g. '1.96.17'"; fi
REGISTRY=$3
if [ -z $REGISTRY ]; then quit "Third argument must be REGISTRY e.g. 'abcd1234'"; fi

# Check AWS access.
which aws > /dev/null || quit "AWS CLI is not installed. Exiting."
aws sts get-caller-identity > /dev/null || quit "Not authenticated on the AWS CLI. Exiting."

# Log into ECR.
# Note: ECR is in us-east-1; this is independent of the service's region.
echo "Authenticating with ECR."
aws ecr-public get-login-password --region us-east-1 | \
	docker login --username AWS --password-stdin public.ecr.aws || quit "Failed to authenticate."

# Tag and publish the image (SemVer).
LOCAL_IMAGE="duelyst-${SERVICE}:${VERSION}"
REMOTE_IMAGE="public.ecr.aws/${REGISTRY}/duelyst-${SERVICE}:${VERSION}"
echo "Tagging $LOCAL_IMAGE as $REMOTE_IMAGE"
docker tag $LOCAL_IMAGE $REMOTE_IMAGE
echo "Pushing $REMOTE_IMAGE"
docker push $REMOTE_IMAGE

# Tag and publish the image (latest).
REMOTE_IMAGE="public.ecr.aws/${REGISTRY}/duelyst-${SERVICE}:latest"
echo "Tagging $LOCAL_IMAGE as $REMOTE_IMAGE"
docker tag $LOCAL_IMAGE $REMOTE_IMAGE
echo "Pushing $REMOTE_IMAGE"
docker push $REMOTE_IMAGE
