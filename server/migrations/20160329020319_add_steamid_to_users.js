exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.string('steam_id');
    table.dateTime('steam_associated_at');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('steam_id');
    table.dropColumn('steam_associated_at');
  });
};
