exports.up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE gift_codes ADD COLUMN IF NOT EXISTS exclusion_id varchar;'),
    // partial index since it will only be queried when a gift_code has a user and created concurrently for performance reasons
    knex.raw('CREATE INDEX CONCURRENTLY IF NOT EXISTS gift_codes_claimed_by_user_id_index ON gift_codes (claimed_by_user_id) WHERE claimed_by_user_id IS NOT NULL'),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('gift_codes', (table) => {
      table.dropIndex('claimed_by_user_id'); // will use default index name gift_codes_claimed_by_user_id_index
      table.dropColumn('exclusion_id');
    }),
  ]);
};

exports.config = {
  transaction: false,
};
