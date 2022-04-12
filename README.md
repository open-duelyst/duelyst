# OPEN DUELYST
🚧 WIP 🚧

## Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/en/download/)

## Setup

- `npm install -g yarn`
- `yarn install --dev`
- `yarn build` to build client
- `yarn watch` to build client continuously
- Modify `development.json` with:
    - Firebase Realtime endpoint and secret
    - Redis connection string
    - Postgres connection string

## Quick Start

- `docker compose up -d` to start all services locally
- Open http://localhost:3000 in a browser to load the game client

## Scripts

- `yarn api` to start api server
- `yarn game` to start game server
- `yarn sp` to start single player game server
- `yarn worker` to start worker
- `NODE_ENV=development yarn migrate:latest` to run database migrations
