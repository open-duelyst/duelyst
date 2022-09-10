exports.up = (knex, Promise) => Promise.all([
  knex.raw('ALTER TABLE users ALTER COLUMN username DROP NOT NULL;'),
]);

exports.down = (knex, Promise) => Promise.all([
  // knex.raw('ALTER TABLE users ALTER COLUMN username SET NOT NULL;')
]);
