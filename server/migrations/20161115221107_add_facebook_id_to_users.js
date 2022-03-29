exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.string('facebook_id')
			table.dateTime('facebook_associated_at')
		}),
		knex.schema.raw('ALTER TABLE users ADD CONSTRAINT facebook_index UNIQUE(facebook_id)')
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('facebook_id')
			table.dropColumn('facebook_associated_at')
		}),
		knex.schema.raw('ALTER TABLE users DROP CONSTRAINT facebook_index')
	])
}