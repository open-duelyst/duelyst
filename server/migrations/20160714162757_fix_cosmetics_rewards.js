exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.dropColumn('cosmetic_chests');
      table.dropColumn('cosmetic_keys');
    }).then(() => knex.schema.table('user_rewards', (table) => {
      table.specificType('cosmetic_chests', 'varchar[]');
      table.specificType('cosmetic_keys', 'varchar[]');
    })),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.dropColumn('cosmetic_chests');
      table.dropColumn('cosmetic_keys');
    }).then(() => knex.schema.table('user_rewards', (table) => {
      table.integer('cosmetic_chests');
      table.integer('cosmetic_keys');
    })),
  ]);
};
