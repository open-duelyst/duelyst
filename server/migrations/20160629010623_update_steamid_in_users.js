exports.up = function (knex) {
  return knex.schema.raw('ALTER TABLE users ADD CONSTRAINT steamid_index UNIQUE(steam_id)');
};

exports.down = function (knex) {
  return knex.schema.raw('ALTER TABLE users DROP CONSTRAINT steamid_index');
};
