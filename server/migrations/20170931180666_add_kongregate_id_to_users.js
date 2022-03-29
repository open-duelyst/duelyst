exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.string('kongregate_id')
			table.dateTime('kongregate_id_associated_at')
		}),
		knex.schema.raw('ALTER TABLE users ADD CONSTRAINT kongregate_index UNIQUE(kongregate_id)')
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (table) {
			table.dropColumn('kongregate_id')
			table.dropColumn('kongregate_associated_at')
		}),
		knex.schema.raw('ALTER TABLE users DROP CONSTRAINT kongregate_index')
	])
}