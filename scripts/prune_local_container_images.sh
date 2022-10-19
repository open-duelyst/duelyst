#!/usr/bin/env bash

ecr_registry_id=$1
if [ -z $ecr_registry_id ]; then
	echo "Usage: prune_local_container_images.sh <ECR-REGISTRY-ID>"
	exit 1
fi

current_version=$(git tag -l | tail -1)
echo "Pruning unused Docker images"
echo "Preserving current version ${current_version}"

# Valid versions start with '1.9'.
local_versions=$(docker image ls | awk '{print $2}' | sort -u | grep '1\.9')

for svc in api game migrate nodejs sp worker; do
	for v in $local_versions; do
		if [ $v == $current_version ]; then
			continue
		fi
		docker rmi duelyst-${svc}:$v 2&>/dev/null
		docker rmi public.ecr.aws/${ecr_registry_id}/duelyst-${svc}:$v 2&>/dev/null
	done
done
echo "Done!"
