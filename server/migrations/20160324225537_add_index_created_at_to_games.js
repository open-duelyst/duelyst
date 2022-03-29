
exports.up = function(knex, Promise) {
	return knex.raw("CREATE INDEX CONCURRENTLY created_at ON games (created_at);")
}

exports.down = function(knex, Promise) {
	knex.schema.table('games', function (table) {
		table.dropIndex('created_at')
	})
}

exports.config = {
	transaction: false
}
