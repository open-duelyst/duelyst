
exports.up = function(knex, Promise) {
	return knex.schema.table('user_bosses_defeated', function (table) {
		return table.dropPrimary().primary(['user_id', 'boss_id', 'boss_event_id']);
	})
}

exports.down = function(knex, Promise) {
	return Promise.resolve()
}
