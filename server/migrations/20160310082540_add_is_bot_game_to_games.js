exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_games', function (table) {
			table.boolean('is_bot_game')
		}),
		knex.schema.table('games', function (table) {
			table.boolean('is_bot_game')
		}),
		knex.schema.table('users', function (table) {
			table.boolean('is_bot')
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_games', function (table) {
			table.dropColumn('is_bot_game')
		}),
		knex.schema.table('games', function (table) {
			table.dropColumn('is_bot_game')
		}),
		knex.schema.table('users', function (table) {
			table.dropColumn('is_bot')
		})
	]);
};
