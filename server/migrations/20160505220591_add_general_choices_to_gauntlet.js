
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_gauntlet_run', function (table) {
			table.specificType('general_choices','integer[]');
		}),
		knex.schema.table('user_gauntlet_run_complete', function (table) {
			table.specificType('general_choices','integer[]');
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_gauntlet_run', function (table) {
			table.dropColumn('general_choices');
		}),
		knex.schema.table('user_gauntlet_run_complete', function (table) {
			table.dropColumn('general_choices');
		})
	])
}
