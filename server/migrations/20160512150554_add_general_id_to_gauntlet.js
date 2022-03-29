
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_gauntlet_run', function (table) {
			table.integer('general_id');
		}),
		knex.schema.table('user_gauntlet_run_complete', function (table) {
			table.integer('general_id');
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_gauntlet_run', function (table) {
			table.dropColumn('general_id');
		}),
		knex.schema.table('user_gauntlet_run_complete', function (table) {
			table.dropColumn('general_id');
		})
	])
}
