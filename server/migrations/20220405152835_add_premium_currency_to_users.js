exports.up = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.integer('wallet_premium').notNullable().defaultTo(knex.raw("0"))
		table.integer('total_premium_earned').notNullable().defaultTo(knex.raw("0"))
	})
}

exports.down = function(knex, Promise) {
	return knex.schema.table('users', function (table) {
		table.dropColumn('wallet_premium')
		table.dropColumn('total_premium_earned')
	})
}
