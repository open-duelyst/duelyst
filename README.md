# OPEN DUELYST
🚧 WIP 🚧

## Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/en/download/)

## Quick Setup

- `npm install`
- `npm run build` to build client
- `npm run watch` to build client continuously
- `docker compose up -d` to start Redis and Postgres
- Modify `development.json` with:
    - Firebase Realtime endpoint and secret
    - Redis connection string
    - Postgres connection string
- Run the database migrations `NODE_ENV=development npm run migrate:latest`

## Quick Start

- `npm run api` to start api server
- `npm run game` to start game server
- `npm run sp` to start single player game server
- `npm run worker` to start worker
- Open http://localhost:3000 in a browser to load the game client
