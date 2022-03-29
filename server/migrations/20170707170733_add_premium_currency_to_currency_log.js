
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_currency_log', function (table) {
			table.integer('premium_currency')
			table.string('sku',255)
		}).then(function () {
			return knex.raw("CREATE INDEX CONCURRENTLY sku_index ON user_currency_log (sku) WHERE sku IS NOT NULL")
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_currency_log', function (table) {
			table.dropColumn('premium_currency');
			table.dropColumn('sku');
		})
	])
};

exports.config = {
	transaction: false
}
