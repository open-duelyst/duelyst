
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.raw("CREATE INDEX CONCURRENTLY user_games_created_at_index ON user_games (created_at)")
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_games', function (table) {
			table.dropIndex('created_at') // will use default index name user_games_created_at_index
		})
	])
}

exports.config = {
	transaction: false
}
