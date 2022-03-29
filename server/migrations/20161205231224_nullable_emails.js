exports.up = (knex, Promise) => {
	return Promise.all([
		knex.raw('ALTER TABLE users ALTER COLUMN email DROP NOT NULL;')
	])
}

exports.down = (knex, Promise) => {
	return Promise.all([
		knex.raw('ALTER TABLE users ALTER COLUMN email SET NOT NULL;')
	])
}
