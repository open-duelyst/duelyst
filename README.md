# OPEN DUELYST
🚧 WIP 🚧

## Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/en/download/)

## Quick Setup

- `npm install -g yarn`
- `yarn install --dev`
- `yarn build` to build client
- `yarn watch` to build client continuously
- `docker compose up -d` to start Redis and Postgres
- Modify `development.json` with:
    - Firebase Realtime endpoint and secret
    - Redis connection string
    - Postgres connection string
- Run the database migrations `NODE_ENV=development yarn migrate:latest`

## Quick Start

- `yarn api` to start api server
- `yarn game` to start game server
- `yarn sp` to start single player game server
- `yarn worker` to start worker
- Open http://localhost:3000 in a browser to load the game client
