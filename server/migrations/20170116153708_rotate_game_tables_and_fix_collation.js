exports.up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE "games" ALTER COLUMN "id" TYPE character varying(36) COLLATE pg_catalog."C";'),
    knex.raw('ALTER TABLE "user_games" ALTER COLUMN "game_id" TYPE character varying(36) COLLATE pg_catalog."C";'),
  ]);
};

exports.down = function (knex) {
  return Promise.all([]);
};
