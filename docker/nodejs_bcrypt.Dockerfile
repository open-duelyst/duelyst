# This image is 114MB vs. 856MB for node:lts.
FROM node:16-alpine

# Work around boneskull/yargs dependency using the deprecated git protocol.
RUN apk add git
RUN git config --global url."https://github.com/".insteadOf git@github.com:
RUN git config --global url."https://".insteadOf git://

# Add Python and other build utils for bcrypt.
RUN apk add python3 make gcc g++

# Include the code in the image.
WORKDIR /duelyst
COPY package.json /duelyst/
COPY version.json /duelyst/
COPY app/*.coffee /duelyst/app/
COPY app/common /duelyst/app/common
COPY app/data /duelyst/app/data
COPY app/sdk /duelyst/app/sdk
COPY bin /duelyst/bin
COPY config /duelyst/config
COPY packages /duelyst/packages
COPY server /duelyst/server
COPY worker /duelyst/worker
