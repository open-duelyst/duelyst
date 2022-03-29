
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('user_rank_ratings', function (table) {
			table.string('user_id',36).notNullable();
			table.dateTime('season_starting_at').notNullable();
			table.integer('rating').notNullable().index();
			table.integer('top_rating').notNullable();
			table.float('rating_deviation').notNullable();
			table.float('volatility').notNullable();
			table.integer('ladder_position');
			table.integer('top_ladder_position');
			table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
			table.dateTime('updated_at').notNullable();
			table.primary(['user_id', 'season_starting_at'])
		}),
		knex.schema.table('user_rank_history', function (table) {
			table.integer('rating');
			table.integer('top_rating');
			table.integer('ladder_position');
			table.integer('top_ladder_position');
		}),
		knex.schema.table('user_rank_events', function (table) {
			table.integer('rating');
			table.integer('rating_delta');
		}),
		knex.schema.table('user_games', function (table) {
			table.integer('rating');
			table.integer('rating_delta');
		}),
		knex.schema.table('users', function (table) {
			table.integer('top_rank_ladder_position');
			table.integer('top_rank_rating');
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTableIfExists('user_rank_ratings'),
		knex.schema.table('user_rank_events', function (table) {
			table.dropColumn('rating');
			table.dropColumn('rating_delta');
		}),
		knex.schema.table('user_games', function (table) {
			table.dropColumn('rating');
			table.dropColumn('rating_delta');
		}),
		knex.schema.table('user_rank_history', function (table) {
			table.dropColumn('rating');
			table.dropColumn('top_rating');
			table.dropColumn('ladder_position');
			table.dropColumn('top_ladder_position');
		}),
		knex.schema.table('users', function (table) {
			table.dropColumn('top_rank_ladder_position');
			table.dropColumn('top_rank_rating');
		})
	])
};
