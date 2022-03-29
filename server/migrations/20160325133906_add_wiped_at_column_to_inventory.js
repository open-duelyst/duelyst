
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_spirit_orbs_opened', function (table) {
			table.dateTime('wiped_at')
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_spirit_orbs_opened', function (table) {
			table.dropColumn('wiped_at')
		})
	])
};
