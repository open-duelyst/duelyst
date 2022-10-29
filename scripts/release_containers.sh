#!/usr/bin/env bash

version=$1
registry=$2
if [ -z $version ] || [ -z $registry ]; then
	echo "Usage: release_containers.sh <verison> <ecr-registry-id>"
	exit 1
fi

if [ $(basename $(pwd)) != 'duelyst' ]; then
	echo "Run this from the repo root."
	exit 1
fi

for svc in api game migrate sp worker; do
	./scripts/build_container.sh $svc $version
	./scripts/publish_container.sh $svc $version $registry
done
