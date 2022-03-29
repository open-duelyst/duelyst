
exports.up = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.integer('soft_wipe_count')
		table.dateTime('last_soft_twipe_at')
	})
}

exports.down = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.dropColumn('soft_wipe_count')
		table.dropColumn('last_soft_twipe_at')
	})
}
