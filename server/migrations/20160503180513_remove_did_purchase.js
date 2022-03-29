
exports.up = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.dropColumn('did_purchase_within_7_days');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.boolean('did_purchase_within_7_days');
	});
};
