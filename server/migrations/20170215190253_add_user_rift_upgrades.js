exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.integer('rift_stored_upgrade_count');
    }),
    knex.schema.table('user_rift_runs', (table) => {
      table.specificType('stored_upgrades', 'varchar[]');
      table.boolean('disable_storing_upgrade');
    }),
    knex.schema.createTable('user_rift_run_stored_upgrades', (table) => {
      table.string('id', 36).notNullable();
      table.string('user_id', 36).notNullable();
      table.string('source_ticket_id', 36).notNullable();
      table.string('assigned_ticket_id', 36);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.specificType('card_choices', 'integer[]');
      table.primary(['id']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('rift_stored_upgrade_count');
    }),
    knex.schema.table('user_rift_runs', (table) => {
      table.dropColumn('stored_upgrades');
      table.dropColumn('disable_storing_upgrade');
    }),
    knex.schema.dropTableIfExists('user_rift_run_stored_upgrades'),
  ]);
};
