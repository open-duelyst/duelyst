# Docker

Dockerfiles and scripts for starting and managing our containers.

## Local Development

Use `docker compose up`, which will use the `docker/start.sh` script to run Yarn scripts.

## Testing Container Builds

Build a container:
```
# <service> should be one of ('api', 'game', 'sp', 'worker')
scripts/build_containers.sh <service>
```

Test a container:
```
# This should successfully start the SP server.
# Ctrl-C should successfully terminate the container.
docker run -it duelyst-sp
```

## Pushing Containers to ECR

Use the same build process as before, but provide a version:
```
# <service> should be one of ('api', 'game', 'sp', 'worker')
# <version> should match the latest git release.
scripts/build_containers.sh <service> <version>
```
