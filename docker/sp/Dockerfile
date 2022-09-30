# This image is 114MB. node:lts is 856MB.
FROM node:16-alpine

# Work around boneskull/yargs dependency using the deprecated git protocol.
RUN apk add git
RUN git config --global url."https://github.com/".insteadOf git@github.com:
RUN git config --global url."https://".insteadOf git://

# Configure the container.
EXPOSE 8000
ARG REDIS_HOST
ENV REDIS_HOST=${REDIS_HOST}
ARG FIREBASE_URL
ENV FIREBASE_URL=${FIREBASE_URL}
ARG FIREBASE_LEGACY_TOKEN
ENV FIREBASE_LEGACY_TOKEN=${FIREBASE_LEGACY_TOKEN}

# Copy and build the code.
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
# /duelyst/node_modules is 816MB.
RUN yarn install --dev

# Start the service.
ENTRYPOINT ["yarn", "sp"]
