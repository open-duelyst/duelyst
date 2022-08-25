# Client Architecture

The game client is a Backbone.js + Marionette application which runs in the browser. Code can be found in `app/`, and configuration can be found in `app/common/config.js`.

# Server Architecture

Duelyst's backend primarily consists of four CoffeeScript services:

API Server:

- The API server is an Express.js app which handles routes for game clients.
- The service stores user and game data in Postgres and Redis.
- The service listens on port 3000 by default, and it serves the browser client on the default route.
- Code can be found in `server/api.coffee`, and configuration can be found in `config/`.

Game Server:

- The Game server is a Socket.IO WebSocket server which handles multiplayer games.
- The service enqueues tasks in Redis to be picked up by the workers.
- The service listens on port 8000 by default.
- Code can be found in `server/game.coffee`, and configuration can be found in `config/`.

Single Player (SP) Server:

- The SP server is a Socket.IO WebSocket server which handles single-player games.
- The service enqueues tasks in Redis to be picked up by the workers.
- The service listens on port 8000 by default.
- Code can be found in `server/single_player.coffee`, and configuration can be found in `config/`.

Worker:

- The worker uses Kue to poll Redis-backed queues for tasks like game creation and matchmaking.
- Some matchmaking tasks also use Postgres, for server healthchecks and retrieving bot users.
- Code can be found in `worker/worker.coffee`, and configuration can be found in `config/`.
- A Kue GUI is available at `http://localhost:3000` via `docker compose up worker-ui`).

## Other Dependencies

Firebase:

- Client code can be found in `app` (see `new Firebase()` calls) and `server/lib/duelyst_firebase_module.coffee`, and configuration can be found in `config/`

Postgres:

- Stores relational data for users, completed games, database migrations, and more
- Client code can be found in `server/lib/data_access/knex.coffee` and `server/knexfile.js`, and configuration can be found in `config/`
- Migrations can be run via `docker compose up migrate`
- An admin UI is available at `http://localhost:8080` via `docker compose up adminer`

Redis:

- Used as a backing queue for Kue tasks, as well as for matchmaking, game management, player queues, and more
- Client code can be found in `server/redis/index.coffee`, and configuration can be found in `config/`

Consul:

- Not required in single-server deployments, but was historically used for service discovery, matchmaking, and spectating
- Client code can be found in `server/lib/consul.coffee`, and configuration can be found in `config/`
