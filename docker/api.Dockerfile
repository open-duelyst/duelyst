# Build on top of the prebuilt Node.js image for OpenDuelyst.
ARG NODEJS_IMAGE_VERSION
FROM duelyst-nodejs-bcrypt:${NODEJS_IMAGE_VERSION}

# Build the code.
RUN yarn install --production && yarn cache clean

# Start the service.
EXPOSE 3000
ENTRYPOINT ["yarn", "api"]
