
exports.up = function(knex, Promise) {
	return knex.schema.table('user_rank_history', function (table) {
		table.dateTime('rewards_claimed_at');
		table.specificType('reward_ids','varchar[]');
	})
};

exports.down = function(knex, Promise) {
	return knex.schema.table('user_rank_history', function (table) {
		table.dropColumn('rewards_claimed_at');
		table.dropColumn('reward_ids');
	})
};
