exports.up = (knex, Promise) => {
	return Promise.all([
		knex.raw('ALTER TABLE users ALTER COLUMN username DROP NOT NULL;')
	])
}

exports.down = (knex, Promise) => {
	return Promise.all([
		// knex.raw('ALTER TABLE users ALTER COLUMN username SET NOT NULL;')
	])
}
