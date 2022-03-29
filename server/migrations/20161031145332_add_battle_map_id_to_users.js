
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.integer('battle_map_id')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('battle_map_id')
		})
	])
}
