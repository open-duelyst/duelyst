
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.integer('total_orb_count_set_4');
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('total_orb_count_set_4')
		})
	])
}
