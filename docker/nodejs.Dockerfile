# Slim images are based on Debian, but with a smaller size footprint.
FROM node:24-slim

# Install bcrypt dependencies and git.
# TODO: Isolate bcrypt dependencies to API images only.
RUN apt-get update && apt-get -y install python3 make gcc g++ git

# Include Node.js dependencies in the image.
WORKDIR /duelyst
COPY package.json /duelyst/
COPY yarn.lock /duelyst/
COPY packages /duelyst/packages
RUN yarn install && yarn cache clean

# Include the code in the image.
COPY version.json /duelyst/
COPY app/*.coffee /duelyst/app/
COPY app/common /duelyst/app/common
COPY app/data /duelyst/app/data
COPY app/localization /duelyst/app/localization
COPY app/sdk /duelyst/app/sdk
COPY bin /duelyst/bin
COPY config /duelyst/config
COPY server /duelyst/server
COPY worker /duelyst/worker
