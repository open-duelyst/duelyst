# Build on top of the prebuilt Node.js image for OpenDuelyst.
ARG NODEJS_IMAGE_VERSION
FROM duelyst-nodejs:${NODEJS_IMAGE_VERSION}

# Add Python and other build utils for bcrypt.
# FIXME: Doing this after packing the code in the base image breaks the layer cache.
RUN apk add python3 make gcc g++

# Build the code.
RUN yarn install --production && yarn cache clean

# Start the service.
EXPOSE 3000
ENTRYPOINT ["yarn", "api"]
