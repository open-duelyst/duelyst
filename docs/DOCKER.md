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

## Notes on Image Sizes

There are a few strategies we use to keep image sizes small:

1. Use an alternative base image, i.e. `node:18-slim` instead of `node:18`
2. Avoid installing Node.js `devDependencies` in container builds
3. Purge the Yarn cache from container builds

#### Comparison of Base Images

Sizes of Docker images built by `scripts/build_container.sh`:

| Service | Image          | Size    | ECR Size | 50 GB Limit |
|---------|----------------|---------|----------|-------------|
| Node.js | node:18        | 942 MB  | N/A      | N/A         |
| Node.js | node:18-slim   | 234 MB  | N/A      | N/A         |
| Node.js | node:18-alpine | 165 MB  | N/A      | N/A         |
| Node.js | node:16        | 858 MB  | N/A      | N/A         |
| Node.js | node:16-slim   | 174 MB  | N/A      | N/A         |
| Node.js | node:16-alpine | 114 MB  | N/A      | N/A         |
| API     | node:18        | 1170 MB | 425 MB   | 117 / 23 ea |
| API     | node:18-slim   | 767 MB  | 254 MB   | 196 / 39 ea |
| API     | node:18-alpine | 626 MB  | 187 MB   | 267 / 53 ea |
| API     | node:16        | 1040 MB | 396 MB   | 126 / 25 ea |
| API     | node:16-slim   | 615 MB  | 214 MB   | 233 / 46 ea |
| API     | node:16-alpine | 530 MB  | 169 MB   | 295 / 59 ea |

Image sizes reported by `docker image ls` include all layers, and are much
higher than the image sizes reported by ECR. ECR gives us 50 GB of storage
for free, so the 50 GB Limit column shows how many total images we can store
for each image, and how many we can store for each of the five services we
build.

The `-alpine` images pull Node.js builds from unofficial-builds.nodejs.org,
while the default and `-slim` images pull official builds from nodejs.org.
While the `-slim` images are 25-35% larger than the `-alpine` images, they're
still small enough to allow us to store several dozen versions in ECR before we
start to approach the 50 GB ECR limit. Additionally, the `-slim` images are
based on Debian, which comes with a more familiar toolchain.

Similarly, Node.js v18 images are 10-20% larger than Node.js v16 images, but we
may be able to get some of this size back by replacing Mocha, Axios, and other
dependencies with their new native counterparts in Node.js v18.

#### Regarding `bcrypt`

We could further reduce image sizes by removing the `bcrypt` dependencies from
the base image layer. These currently include `python3`, `make`, `gcc`, and
`g++`. The `bcrypt` dependency is only used by the API service, during the
login flow in `server/routes/session.coffee`. One option here could be to move
authentication flows (such as JWT signing, granting, and validation) to their
own microservice to isolate this dependency, reducing the image size of all
other services.
