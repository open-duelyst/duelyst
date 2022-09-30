// Creates the user table user_codex_inventory which stores (in json) an array of what codex ids a player owns/has unlocked

// Also adds these codex ids to the post game rewards

exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_codex_inventory', (table) => {
      table.string('user_id', 36).notNullable();
      table.integer('chapter_id').notNullable();
      table.dateTime('created_at').defaultTo(knex.fn.now());
      table.dateTime('updated_at').defaultTo(knex.fn.now());
      table.primary(['user_id', 'chapter_id']);
    }),
    knex.schema.table('user_rewards', (table) => {
      table.integer('codex_chapter');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_codex_inventory'),
    knex.schema.table('user_rewards', (table) => {
      table.dropColumn('codex_chapter');
    }),
  ]);
};
