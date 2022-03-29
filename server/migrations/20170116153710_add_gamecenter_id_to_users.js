exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.string('gamecenter_id')
			table.dateTime('gamecenter_associated_at')
		}),
		knex.schema.raw('ALTER TABLE users ADD CONSTRAINT gamecenter_index UNIQUE(gamecenter_id)')
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('gamecenter_id')
			table.dropColumn('gamecenter_associated_at')
		}),
		knex.schema.raw('ALTER TABLE users DROP CONSTRAINT gamecenter_index')
	])
}