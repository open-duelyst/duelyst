FROM node:24-bookworm-slim

WORKDIR /duelyst
COPY package.json /duelyst/
COPY .yarnrc.yml /duelyst/
COPY yarn.lock /duelyst/
COPY packages /duelyst/packages
RUN corepack enable
RUN corepack yarn set version berry
RUN corepack yarn workspaces focus -A && corepack yarn cache clean

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

ENTRYPOINT ["yarn", "migrate:latest"]
