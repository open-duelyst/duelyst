exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.string('google_play_id');
      table.dateTime('google_play_associated_at');
    }),
    knex.schema.raw('ALTER TABLE users ADD CONSTRAINT google_play_index UNIQUE(google_play_id)'),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('google_play_id');
      table.dropColumn('google_play_associated_at');
    }),
    knex.schema.raw('ALTER TABLE users DROP CONSTRAINT google_play_index'),
  ]);
};
