# Deploying OpenDuelyst Builds

## Uploading static assets to S3

This process only needs to be completed once (or until you change the contents
of the `resources/` directory). Around 600MB of files will be uploaded to S3
and cached by CloudFront:

1. Build everything with `FIREBASE_URL=foo yarn build`
2. Copy CDN-flagged resources into `dist/` with `yarn cdn:copy`
3. Upload resources to S3:

```
AWS_ACCESS_KEY=foo \
AWS_SECRET_KEY=bar \
AWS_REGION=baz \
S3_ASSETS_BUCKET=your-bucket-name \
yarn cdn:upload:staging
```

## Deploying Frontend Builds

The frontend code is served from S3 and fronted by CloudFront.

Deploying a new version of the frontend build might require the following:

- Creating a new staging build with `scripts/build_staging_app.sh`
- Replacing `duelyst.js` (or any other modified resources) in S3
- Creating a cache invalidation request for `/staging/duelyst.js` (etc.) in
	CloudFront

You can use `yarn cdn:upload:staging` to copy all resources, but we should
create another script for deploying only the files in `dist/src/*` (not
`dist/src/**/*` which includes resources)

## Deploying Backend Builds

The backend code is containerized, uploaded to ECR, and executed in ECS.

Deploying a new version of the backend build might require the following:

- Cutting a new version by updating `package.json` and `version.json`
- Creating a new image with `scripts/build_container.sh`
- Publishing a new image to ECR with `scripts/publish_container.sh`
- Bumping the `deployed_version` in `terraform/staging/ecs.tf`
- Changing the `container_count` in `terraform/staging/ecs.tf`
- Stopping any running (`INACTIVE`) tasks in ECS
	- This can happen when there's not enough ECS-EC2 capacity to start a new
		container
	- The new container can't start, so the old container remains active until
		manually stopping
	- This may also be needed when publishing a new container with the same
		version tag
- Checking event logs in ECS
	- In the ECS UI, open the ECS cluster and the desired ECS service (e.g.
		`duelyst-api-staging`)
	- In the ECS Service UI, click Events to see service events
	- Look for repeated container starts/stops or target deregistration events
	- Viewing a stopped/failed task will show some basic logs in the UI
	- If the failure occurred inside the container, you'll see `Process exit 1`
		or similar
		- For these, see "Checking Logs" below
- Manually registering ALB Target Group targets
	- Once the task is running (not crash-looping), we can check the ALB health
		checks
	- This just makes things faster; target registration/deregistration takes
		two minutes currently
	- There are some configuration changes we can make to increase the speed of
		this process
- Checking Logs
	- To view service logs, open the CloudWatch Logs UI, and select the log group
		for a service
	- Choose the most recent log stream within the log group to view its events
	- You'll be able to see the log output of the service, just like in local
		development
