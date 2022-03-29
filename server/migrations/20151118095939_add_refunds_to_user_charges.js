
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_charges', function (table) {
			table.dateTime('refunded_at')
			table.string('memo')
		})
	])
}

exports.down = function(knex, Promise) {
  	return Promise.all([
		knex.schema.table('user_charges', function (table) {
			table.dropColumn('refunded_at')
			table.dropColumn('memo')
		})
	])
}
