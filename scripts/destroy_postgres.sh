#!/usr/bin/env bash
docker compose down
docker rm duelyst-db-1
docker rm duelyst-migrate-1
rm -rf .pgdata
