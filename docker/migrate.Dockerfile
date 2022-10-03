# Build on top of the prebuilt Node.js image for OpenDuelyst.
ARG NODEJS_IMAGE_VERSION
FROM duelyst-nodejs:${NODEJS_IMAGE_VERSION}

# Install dev dependencies as well.
RUN yarn install --include=dev && yarn cache clean

# Start the service.
ENTRYPOINT ["yarn", "migrate:latest"]
