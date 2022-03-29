
exports.up = function(knex, Promise) {
  	return Promise.all([
		knex.schema.table('users', function (table) {
			table.integer('total_gold_tips_given').notNullable().defaultTo(knex.raw("0"));
		}),
		knex.schema.table('games', function (table) {
			table.integer('gold_tip_amount');
		}),
		knex.schema.table('user_games', function (table) {
			table.integer('gold_tip_amount');
		})
	]);
  
};

exports.down = function(knex, Promise) {
  	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('total_gold_tips_given');
		}),
		knex.schema.table('games', function (table) {
			table.dropColumn('gold_tip_amount');
		}),
		knex.schema.table('user_games', function (table) {
			table.dropColumn('gold_tip_amount');
		})
	]);
  
};
