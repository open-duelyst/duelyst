exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_rift_runs', (table) => {
      table.string('user_id', 36).notNullable();
      table.string('ticket_id', 36).notNullable().unique();
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('rift_level').notNullable().defaultTo(knex.raw('1'));
      table.integer('rift_points').notNullable().defaultTo(knex.raw('0'));
      table.integer('upgrades_available_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('card_id_to_upgrade');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('started_at');
      table.dateTime('updated_at');
      table.specificType('general_choices', 'integer[]').notNullable();
      table.integer('faction_id');
      table.integer('general_id');
      table.specificType('deck', 'integer[]');
      table.specificType('card_choices', 'integer[]');
      table.specificType('games', 'varchar[]');
      table.specificType('reward_ids', 'varchar[]');
      table.primary(['user_id', 'ticket_id']);
    }),
    knex.schema.createTable('user_rift_tickets', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.string('transaction_type', 36);
      table.string('transaction_id', 36);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_unread').notNullable().defaultTo(true);
    }),
    knex.schema.createTable('user_rift_tickets_used', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.string('transaction_type', 36);
      table.string('transaction_id', 36);
      table.dateTime('used_at').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.table('user_games', (table) => {
      table.string('rift_ticket_id');
      table.integer('rift_points');
      table.integer('rift_points_earned');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_rift_runs'),
    knex.schema.dropTableIfExists('user_rift_tickets'),
    knex.schema.dropTableIfExists('user_rift_tickets_used'),
    knex.schema.table('user_games', (table) => {
      table.dropColumn('rift_ticket_id');
      table.dropColumn('rift_points');
      table.dropColumn('rift_points_earned');
    }),
  ]);
};
