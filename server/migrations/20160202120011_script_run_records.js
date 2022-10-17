require('coffeescript/register');
const _ = require('underscore');
const moment = require('moment');

exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('script_run_records', (table) => {
      table.string('id', 36).notNullable().primary();
      table.integer('last_batch_processed').notNullable().defaultTo(knex.raw('0'));
      table.specificType('succeeded_in_batch', 'varchar[]');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.boolean('is_complete').notNullable().defaultTo(false).index();
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('script_run_records'),
  ]);
};
