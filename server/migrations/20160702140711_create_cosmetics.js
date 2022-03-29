require("coffee-script/register");
var _ = require('underscore');
var moment = require('moment');
var ProgressBar = require('progress');
var FirebasePromises = require('../lib/firebase_promises.coffee');
var DuelystFirebase = require('../lib/duelyst_firebase_module.coffee');

exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('user_cosmetic_chests', function (table) {
			table.string('user_id',36).notNullable();
			table.string('chest_id',36).notNullable();
			table.string('chest_type',36).notNullable(); // Matches with key_type
			table.string('transaction_type',36).notNullable(); // crate, achievement, hard
			table.string('transaction_id',36).notNullable(); //Either purchase id for hard transaction type or a guid referring to source (e.g. chest id if 'crate')
			table.dateTime('created_at').defaultTo(knex.fn.now());
			table.primary(['user_id', 'chest_id']);
		}),
		knex.schema.createTable('user_cosmetic_chests_opened', function (table) {
			table.string('user_id',36).notNullable();
			table.string('chest_id',36).notNullable();
			table.string('chest_type',36).notNullable(); // Matches with key_type
			table.string('opened_with_key_id',36).notNullable();
			table.string('transaction_type',36).notNullable(); // crate, achievement, hard
			table.string('transaction_id',36).notNullable(); //Either purchase id for hard transaction type or a guid referring to source (e.g. chest id if 'crate')
			table.specificType('rewarded_cosmetic_ids','integer[]'); // List of cosmetic ids opened (USER MAY HAVE RECEIVED SPIRIT FOR DUPE)
			table.dateTime('created_at').notNullable(); // Carries over from when the chest was created
			table.dateTime('opened_at').defaultTo(knex.fn.now());
			table.primary(['user_id', 'chest_id']);
		}),
		knex.schema.createTable('user_cosmetic_chest_keys', function (table) {
			table.string('user_id',36).notNullable();
			table.string('key_id',36).notNullable();
			table.string('key_type',36).notNullable(); // Matches with chest_type
			table.string('transaction_type',36).notNullable(); // crate, achievement, hard
			table.string('transaction_id',36).notNullable(); //Either purchase id for hard transaction type or a guid referring to source (e.g. chest id if 'crate')
			table.dateTime('created_at').defaultTo(knex.fn.now());
			table.primary(['user_id', 'key_id']);
		}),
		knex.schema.createTable('user_cosmetic_chest_keys_used', function (table) {
			table.string('user_id',36).notNullable();
			table.string('key_id',36).notNullable();
			table.string('key_type',36).notNullable(); // Matches with chest_type
			table.string('used_with_chest_id',36).notNullable();
			table.string('transaction_type',36).notNullable(); // crate, achievement, hard
			table.string('transaction_id',36).notNullable(); //Either purchase id for hard transaction type or a guid referring to source (e.g. chest id if 'crate')
			table.dateTime('created_at').notNullable(); // Carries over from when the key was created
			table.dateTime('used_at').defaultTo(knex.fn.now());
			table.primary(['user_id', 'key_id']);
		}),
		knex.schema.createTable('user_cosmetic_inventory', function (table) {
			table.string('user_id',36).notNullable();
			table.integer('cosmetic_id',36).notNullable(); // Not a guid, this is a lookup id
			table.string('cosmetic_type',36).notNullable().index();
			table.string('sku',255).notNullable(); // e.g. emote-1001
			table.string('transaction_type',36).notNullable(); // crate, achievement, hard
			table.string('transaction_id',36).notNullable(); //Either purchase id for hard transaction type or a guid referring to source (e.g. chest id if 'crate')
			table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
			table.primary(['user_id', 'cosmetic_id']);
		}),
		knex.schema.table('user_rewards', function (table) {
			table.integer('cosmetic_chests');
			table.integer('cosmetic_keys');
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTableIfExists('user_cosmetic_chests'),
		knex.schema.dropTableIfExists('user_cosmetic_chests_opened'),
		knex.schema.dropTableIfExists('user_cosmetic_chest_keys'),
		knex.schema.dropTableIfExists('user_cosmetic_chest_keys_used'),
		knex.schema.dropTableIfExists('user_cosmetic_inventory'),
		knex.schema.table('user_rewards', function (table) {
			table.dropColumn('cosmetic_chests');
			table.dropColumn('cosmetic_keys');
		})
	])
};
