
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_rewards', function (table) {
			table.renameColumn('emotes','cosmetics')
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_rewards', function (table) {
			table.renameColumn('cosmetics','emotes')
		})
	])
}
