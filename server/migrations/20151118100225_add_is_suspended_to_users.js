
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.boolean('is_suspended').notNullable().defaultTo(false)
			table.dateTime('suspended_at')
			table.string('suspended_memo')
		})
	])
}

exports.down = function(knex, Promise) {
  	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('is_suspended')
			table.dropColumn('suspended_at')
			table.dropColumn('suspended_memo')
		})
	])
}
