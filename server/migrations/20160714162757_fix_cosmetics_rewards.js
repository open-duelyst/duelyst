exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_rewards', function (table) {
			table.dropColumn('cosmetic_chests')
			table.dropColumn('cosmetic_keys')
		}).then(function() {
			return knex.schema.table('user_rewards', function (table) {
				table.specificType('cosmetic_chests','varchar[]')
				table.specificType('cosmetic_keys','varchar[]')
			})
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('user_rewards', function (table) {
			table.dropColumn('cosmetic_chests')
			table.dropColumn('cosmetic_keys')
		}).then(function() {
			return knex.schema.table('user_rewards', function (table) {
				table.integer('cosmetic_chests')
				table.integer('cosmetic_keys')
			})
		})
	])
};
