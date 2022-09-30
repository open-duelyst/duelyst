exports.up = function (knex) {
  return knex.schema.table('user_rank_history', (table) => {
    table.dateTime('rewards_claimed_at');
    table.specificType('reward_ids', 'varchar[]');
  });
};

exports.down = function (knex) {
  return knex.schema.table('user_rank_history', (table) => {
    table.dropColumn('rewards_claimed_at');
    table.dropColumn('reward_ids');
  });
};
