
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_quests', function (table) {
			table.integer('spirit_orbs')
			table.boolean('is_replaceable').notNullable().defaultTo(true)
		}),
		knex.schema.table('user_quests_complete', function (table) {
			table.integer('spirit_orbs')
			table.boolean('is_replaceable').notNullable().defaultTo(true)
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_quests', function (table) {
			table.dropColumn('spirit_orbs')
			table.dropColumn('is_replaceable')
		}),
		knex.schema.table('user_quests_complete', function (table) {
			table.dropColumn('spirit_orbs')
			table.dropColumn('is_replaceable')
		})
	])
}
