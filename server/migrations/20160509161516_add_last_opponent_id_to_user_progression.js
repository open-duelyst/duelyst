
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_progression', function (table) {
			table.string('last_opponent_id',36)
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_progression', function (table) {
			table.dropColumn('last_opponent_id')
		})
	])
}
