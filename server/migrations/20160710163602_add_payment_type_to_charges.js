exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_charges', (table) => {
      table.string('payment_type');
      table.string('sku');
    }),
    knex('user_charges').update({
      payment_type: 'paypal',
    }),
    knex('user_charges').where('charge_id', 'LIKE', 'ch_%').update({
      payment_type: 'stripe',
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_charges', (table) => {
      table.dropColumn('payment_type');
      table.dropColumn('sku');
    }),
  ]);
};
