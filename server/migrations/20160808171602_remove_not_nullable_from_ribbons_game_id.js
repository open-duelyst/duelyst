
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.raw('ALTER TABLE user_ribbons ALTER COLUMN game_id DROP NOT NULL;')
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.raw('ALTER TABLE user_ribbons ALTER COLUMN game_id SET NOT NULL;')
	])
};
