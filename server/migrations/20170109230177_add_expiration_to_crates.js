exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_cosmetic_chests', function (table) {
			table.dateTime('expires_at');
		}),
		knex.schema.table('user_cosmetic_chests_opened', function (table) {
			table.dateTime('expires_at');
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_cosmetic_chests', function (table) {
			table.dropColumn('expires_at')
		}),
		knex.schema.table('user_cosmetic_chests_opened', function (table) {
			table.dropColumn('expires_at')
		}),
	])
}
