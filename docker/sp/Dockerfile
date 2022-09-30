# This image is 114MB. node:lts is 856MB.
FROM node:16-alpine

# Work around boneskull/yargs dependency using the deprecated git protocol.
RUN apk add git
RUN git config --global url."https://github.com/".insteadOf git@github.com:
RUN git config --global url."https://".insteadOf git://

# Copy and build the code.
# /duelyst/node_modules is 285MB.
# /duelyst/node_modules/aws-sdk is 75MB.
WORKDIR /duelyst
COPY package.json /duelyst/
COPY version.json /duelyst/
RUN mkdir /duelyst/app
COPY app/*.coffee /duelyst/app/
COPY app/common /duelyst/app/common
COPY app/data /duelyst/app/data
COPY app/sdk /duelyst/app/sdk
COPY bin /duelyst/bin
COPY config /duelyst/config
COPY packages /duelyst/packages
COPY server /duelyst/server
COPY worker /duelyst/worker
RUN yarn install --production
RUN yarn cache clean

# Configure the service.
# TODO: Make this customizable by service so we can share the image.
EXPOSE 8000
ARG REDIS_HOST
ENV REDIS_HOST=${REDIS_HOST}
ARG FIREBASE_URL
ENV FIREBASE_URL=${FIREBASE_URL}
ARG FIREBASE_LEGACY_TOKEN
ENV FIREBASE_LEGACY_TOKEN=${FIREBASE_LEGACY_TOKEN}

# Start the service.
ENTRYPOINT ["yarn", "sp"]
