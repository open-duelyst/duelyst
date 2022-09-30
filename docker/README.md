# Docker

Dockerfiles and scripts for starting and managing our containers.

## Local Development

Use `docker compose up`, which will use the `docker/start` script to run Yarn scripts.

## Building and Pushing Containers to AWS ECR

First, ensure your `.env` file is populated with the following keys and values:
```
REDIS_HOST=foo
FIREBASE_URL=bar
FIREBASE_LEGACY_TOKEN=baz
```

Build containers:
```
# <environment> should be one of ('staging', 'production')
# <service> should be one of ('api', 'game', 'sp', 'worker')
# <version> is added to the image tag; defaults to 'testing'
scripts/build_containers.sh <environment> <service> <version>
```

Test a container:
```
# This should successfully start the SP server.
# Ctrl-C should successfully terminate the container.
docker run -it duelyst-sp
```
