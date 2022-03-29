exports.up = function(knex, Promise) {
	return knex.schema.raw('ALTER TABLE users ADD CONSTRAINT bnea_id_index UNIQUE(bnea_id)');
};

exports.down = function(knex, Promise) {
	return knex.schema.raw('ALTER TABLE users DROP CONSTRAINT bnea_id_index');
};
