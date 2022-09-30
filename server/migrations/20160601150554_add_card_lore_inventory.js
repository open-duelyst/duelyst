exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_card_lore_inventory', (table) => {
      table.string('user_id', 36).notNullable();
      table.integer('card_id').notNullable();
      table.boolean('is_unread').defaultTo(false);
      table.dateTime('created_at').defaultTo(knex.fn.now());
      table.dateTime('updated_at').defaultTo(knex.fn.now());
      table.primary(['user_id', 'card_id']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_card_lore_inventory'),
  ]);
};
