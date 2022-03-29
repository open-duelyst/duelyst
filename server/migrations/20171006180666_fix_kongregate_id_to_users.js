exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('kongregate_id_associated_at')
			table.dateTime('kongregate_associated_at')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('kongregate_associated_at')
		})
	])
}