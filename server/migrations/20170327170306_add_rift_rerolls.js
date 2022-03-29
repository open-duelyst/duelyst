
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_rift_runs', function (table) {
			table.integer('current_upgrade_reroll_count');
			table.integer('total_reroll_count');
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_rift_runs', function (table) {
			table.dropColumn('current_upgrade_reroll_count');
			table.dropColumn('total_reroll_count');
		})
	])
};
