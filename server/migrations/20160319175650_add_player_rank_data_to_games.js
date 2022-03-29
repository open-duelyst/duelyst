
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('games', function (table) {
			table.integer('player_1_rank')
			table.integer('player_2_rank')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('games', function (table) {
			table.dropColumn('player_1_rank')
			table.dropColumn('player_2_rank')
		})
	])
}
