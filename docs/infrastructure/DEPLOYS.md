# Deploying OpenDuelyst to AWS

This doc covers the steps required to build, upload, and deploy Docker images
for the game server and static assets for the game client in AWS.

## Requirements

In order to complete this process, the following things are required:

- A Mac computer (for building the Mac client)
- Docker Desktop (for building container images)
- Permissions to publish container images to AWS ECR
- Permissions to deploy AWS ECS services
- Permissions to upload files to AWS S3 buckets
- Permissions to create cache invalidations in AWS CloudFront distributions

## Step 1: Create and Publish Docker Containers

This step requires ECR permissions in AWS.

On a Mac or Linux system, install and configure the AWS CLI. You can confirm
that it works by running `aws sts get-caller-identity`.

Once this is done, you can use a shell script to build and publish containers
for all Duelyst services:

```bash
# From the repo root:
scripts/release_containers.sh <version> <ecr-registry-id>
```

With the arguments populated, the command might look like this:
```
scripts/release_containers.sh 1.2.3 abcd1234
```

The script will first build the base Node.js image used by all services, and
will then build per-service images on top of it. If the builds succeed, the
resulting images will then be uploaded to AWS ECR using the AWS CLI. Each image
will be uploaded into its own public ECR "repository" inside the provided ECR
"registry" (which is unique per AWS account). These repository values match
those used in our Terraform configuration.

## Step 2: Deploy Backend Services

This step requires ECS and EC2 permissions in AWS, but would not require any
permissions if automated.

The deployed version of each backend service is currently managed in Terraform
[here](../terraform/staging/ecs.tf). Update the `deployed_version` attributes
for the backend services, and then run `terraform apply` to create new task
definitions and initiate deployments.

ECS is still missing some configuration to fully automate deployments. We would
need extra capacity (1 more instance is enough) to allow for graceful
deployments with no downtime, as well as configuration to automatically shut
down old tasks once new tasks are healthy.

Until this configuration is in place, we can manually cycle ECS services to get
things deployed:

- In the AWS ECS UI, view the running tasks in the cluster and stop any old
  tasks. This can be done a few at a time to avoid downtime, given enough
  capacity.
- Once all of the new tasks are healthy, it will take a minute or two for the
  load balancer to mark the API service as healthy. This process can be
  accelerated by opening the AWS EC2 Load Balancers UI, viewing the API Target
  Group, and manually initiating target registration by clicking 'Register
  Targets'.
- Once the ECS tasks and LB targets are all healthy, you can also check each
  service in CloudWatch Logs to ensure it's functioning as expected. There is a
  distinct log stream for each backend service in CloudWatch.

If the tasks and load balancer targets are healthy, the backend deployment is
complete.

## Step 3: Build and Upload Web Client

This step requires S3 and CloudFront permissions in AWS.

On a Mac or Linux system, build the web client using the Staging configuration:

```bash
# From the repo root:
FIREBASE_URL=foo API_URL=bar scripts/build_staging_app.sh
```

Note: `FIREBASE_URL` must end in `.firebaseio.com/`, including the slash.
`API_URL` should not include a trailing slash.

This will build the game with all resources bundled with the app. Once it's
done, we can test it out using the desktop client:

```bash
# From the repo root:
cd desktop
yarn build:mac && yarn start:mac # Or windows or linux.
```

Log in and play a practice game. Keep an eye out for visual glitches such as
missing cardbacks. If something like this occurs, rebuilding the app by
rerunning the script will generally resolve the issue.

Once the build looks good, we need to upload it to the assets bucket in S3:

```bash
# From the repo root:
export NODE_ENV=staging
export AWS_ACCESS_KEY=foo
export AWS_SECRET_KEY=bar
export AWS_REGION=my-region
export S3_ASSETS_BUCKET=my-bucket
yarn cdn:upload:web
```

If the build includes changes to static assets and not just the code, you can
sync all resources instead:

```bash
# From the repo root:
export NODE_ENV=staging
export AWS_ACCESS_KEY=foo
export AWS_SECRET_KEY=bar
export AWS_REGION=my-region
export S3_ASSETS_BUCKET=my-bucket
yarn cdn:upload:all
```

Since the web client is heavily cached in CloudFront, we can create a cache
invalidation to get the new version out faster. To do this, open the AWS
CloudFront UI, open the CDN distribution, and click 'Invalidations'. On this
page, create a new invalidation for `/staging/duelyst.js` and click 'Create
invalidation'. This will take a few minutes, after which the updated web client
will be served to end users.
