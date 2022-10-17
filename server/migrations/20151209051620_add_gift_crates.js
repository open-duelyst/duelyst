require('coffeescript/register');
const _ = require('underscore');
const moment = require('moment');

exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_gift_crates', (table) => {
      table.string('user_id', 36).notNullable();
      table.string('crate_id', 36).notNullable();
      table.string('crate_type', 36).notNullable();
      table.boolean('is_unread').notNullable().defaultTo(true).index();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.primary(['user_id', 'crate_id']);// Add transaction id and transaction type, json column for params
    }),
    knex.schema.createTable('user_gift_crates_opened', (table) => {
      table.string('user_id', 36).notNullable();
      table.string('crate_id', 36).notNullable();
      table.string('crate_type', 36).notNullable();
      table.dateTime('created_at').notNullable();
      table.dateTime('rewards_claimed_at').notNullable().defaultTo(knex.fn.now());
      table.specificType('reward_ids', 'varchar[]');
      table.primary(['user_id', 'crate_id']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_gift_crates'),
    knex.schema.dropTableIfExists('user_gift_crates_opened'),
  ]);
};
