
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('paypal_ipn_errors', function (table) {
			table.string('transaction_id',36).notNullable().primary()
			table.json('body_json',true).notNullable()
			table.string('error_message')
			table.dateTime('created_at').notNullable().defaultTo(knex.fn.now())
			table.dateTime('resolved_at')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTableIfExists('paypal_ipn_errors')
	])
}
