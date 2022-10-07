# Building and Testing Docker Images

Dockerfiles and scripts for starting and managing our containers are located in
the `docker/` directory.

## Local Development

Use `docker compose up`, which will use the `docker/start.sh` script to run
Yarn scripts.

## Testing Container Builds

Build a container image:
```
# <service> should be one of ('api', 'game', 'sp', 'worker')
# <version> should match the latest git release; defaults to 'testing'
scripts/build_container.sh <service> <version>
```

Test a container image:
```
# This should successfully start the SP server.
# Ctrl-C should successfully terminate the container.
docker run -it duelyst-sp
```

## Publishing Containers to ECR

Tag and publish a container image:
```
# <service> should be one of ('api', 'game', 'sp', 'worker')
# <version> should match the latest git release
# <registry> is your AWS ECR registry alias
# <repo> is your AWS ECR repository name
scripts/publish_container.sh <service> <version> <registry> <repo>
```
