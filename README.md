# OPEN DUELYST
🚧 WIP 🚧
## Quick Setup
- `npm install`
- `docker compose up -d` to start Redis and Postgres
- Modify `development.json` with:
    - Firebase Realtime endpoint and secret
    - Redis connection string
    - Postgres connection string
- Run the database migrations `NODE_ENV=development npm run migrate:latest`
## Quick Start
- `npm run build` to build client
- `npm run watch` to build client continuously
- `npm run api` to start api server
- `npm run server` to start game server
- `npm run sp` to start single player game server
- `npm run worker` to start worker
