exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('user_daily_challenges_completed', function(table) {
			table.string('user_id', 36).notNullable()
			table.string('challenge_id', 36).notNullable()
			table.dateTime('completed_at').notNullable().defaultTo(knex.fn.now())
			table.specificType('reward_ids','varchar[]')
			table.primary(['user_id', 'challenge_id'])
		}),
		knex.schema.table('users', function (table) {
			table.dateTime('daily_challenge_last_completed_at')
		}),
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTableIfExists('user_daily_challenges_completed'),
		knex.schema.table('users', function (table) {
			table.dropColumn('daily_challenge_last_completed_at')
		})
	])
}
