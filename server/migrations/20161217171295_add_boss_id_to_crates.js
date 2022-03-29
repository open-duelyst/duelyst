exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_cosmetic_chests', function (table) {
			table.integer('boss_id')
		}),
		knex.schema.table('user_cosmetic_chests_opened', function (table) {
			table.integer('boss_id')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_cosmetic_chests', function (table) {
			table.dropColumn('boss_id')
		}),
		knex.schema.table('user_cosmetic_chests_opened', function (table) {
			table.dropColumn('boss_id')
		}),
	])
}