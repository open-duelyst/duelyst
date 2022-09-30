exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.string('campaign_source');
    table.string('campaign_medium');
    table.string('campaign_term');
    table.string('campaign_content');
    table.string('campaign_name');
    table.string('referrer');
    table.dateTime('first_purchased_at');
    table.boolean('did_purchase_within_7_days');
    table.specificType('seen_on_days', 'integer[]');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('campaign_source');
    table.dropColumn('campaign_medium');
    table.dropColumn('campaign_term');
    table.dropColumn('campaign_content');
    table.dropColumn('campaign_name');
    table.dropColumn('referrer');
    table.dropColumn('first_purchased_at');
    table.dropColumn('did_purchase_within_7_days');
    table.dropColumn('seen_on_days');
  });
};
