exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_referrals', (table) => {
      table.string('user_id', 36).notNullable();
      table.string('referred_user_id', 36).notNullable();
      table.integer('level_reached').defaultTo(0);
      table.dateTime('created_at').defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.primary(['user_id', 'referred_user_id']);
    }),
    knex.schema.createTable('user_referral_events', (table) => {
      table.string('referrer_id', 36).notNullable();
      table.string('referred_user_id', 36).notNullable();
      table.string('event_type', 36).notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now()).index();
      table.primary(['referrer_id', 'referred_user_id', 'event_type']);
    }),
    knex.schema.table('users', (table) => {
      table.string('referred_by_user_id', 36);
      table.dateTime('referral_rewards_claimed_at');
      table.dateTime('referral_rewards_updated_at');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_referrals'),
    knex.schema.dropTableIfExists('user_referral_events'),
    knex.schema.table('users', (table) => {
      table.dropColumn('referred_by_user_id');
      table.dropColumn('referral_rewards_claimed_at');
      table.dropColumn('referral_rewards_updated_at');
    }),
  ]);
};
