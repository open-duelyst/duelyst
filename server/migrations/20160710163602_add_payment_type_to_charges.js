
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_charges', function (table) {
			table.string('payment_type')
			table.string('sku')
		}),
		knex("user_charges").update({
			payment_type: "paypal"
		}),
		knex("user_charges").where('charge_id','LIKE','ch_%').update({
			payment_type: "stripe"
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_charges', function (table) {
			table.dropColumn('payment_type')
			table.dropColumn('sku')
		})
	])
}
