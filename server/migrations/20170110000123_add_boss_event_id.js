exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_cosmetic_chests', function (table) {
			table.string('boss_event_id')
		}),
		knex.schema.table('user_cosmetic_chests_opened', function (table) {
			table.string('boss_event_id')
		}),
		knex.schema.table('user_bosses_defeated', function (table) {
			table.string('boss_event_id').notNullable();
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_cosmetic_chests', function (table) {
			table.dropColumn('boss_event_id')
		}),
		knex.schema.table('user_cosmetic_chests_opened', function (table) {
			table.dropColumn('boss_event_id')
		}),
		knex.schema.table('user_bosses_defeated', function (table) {
			table.dropColumn('boss_event_id')
		})
	])
}
