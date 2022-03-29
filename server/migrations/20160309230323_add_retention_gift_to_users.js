
exports.up = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.dateTime('last_retention_gift_at')
	})
}

exports.down = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.dropColumn('last_retention_gift_at')
	})
}
