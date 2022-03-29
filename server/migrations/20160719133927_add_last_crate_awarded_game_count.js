
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_progression', function (table) {
			table.integer('last_crate_awarded_game_count')
			table.integer('last_crate_awarded_win_count')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_progression', function (table) {
			table.dropColumn('last_crate_awarded_game_count')
			table.dropColumn('last_crate_awarded_win_count')
		})
	])
}
