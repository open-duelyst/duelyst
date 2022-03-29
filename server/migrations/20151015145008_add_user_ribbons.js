require("coffee-script/register")
var _ = require('underscore')
var moment = require('moment')
var FirebasePromises = require('../lib/firebase_promises.coffee')
var DuelystFirebase = require('../lib/duelyst_firebase_module.coffee')
var ProgressBar = require('progress')

exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('user_ribbons', function (table) {
			table.string('user_id',36).notNullable()
			table.string('ribbon_id',36).notNullable()
			table.string('game_id',36).notNullable()
			table.dateTime('created_at').notNullable().defaultTo(knex.fn.now())
			table.primary(['user_id', 'ribbon_id', 'created_at'])
		}),
		knex.schema.table('user_rewards', function (table) {
			table.specificType('ribbons','varchar[]');
		}),
		new Promise(function(resolve,reject){
			// add faction ribbons to existing users that have 100 wins with a faction or more
			knex("user_faction_progression").select("user_id","faction_id","win_count","last_game_id").where("win_count",">",99)
			.bind({})
			.then(function(rows){
				this.rows = rows
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				var bar = new ProgressBar('migrating '+this.rows.length+' records [:bar] :percent :etas', {
					complete: '=',
					incomplete: ' ',
					width: 20,
					total: this.rows.length
				})
				return Promise.map(this.rows,function(row){
					var allPromises = []
					var ribbonCount = Math.floor(row["win_count"]/100)
					var ribbonId = "f"+row["faction_id"]+"_champion"
					_(ribbonCount).times(function(n){
						allPromises.push(knex("user_ribbons").insert({
							user_id: row["user_id"],
							ribbon_id: ribbonId,
							game_id: row["last_game_id"] || "n/a",
							created_at: moment().utc().add(n,"milliseconds").toDate()
						}))
					})
					allPromises.push(FirebasePromises.set(rootRef.child("user-ribbons").child(row["user_id"]).child(ribbonId),{
						ribbon_id: ribbonId,
						count: ribbonCount,
						updated_at: moment().utc().valueOf()
					}))
					return Promise.all(allPromises).then(function(){
						bar.tick()
					})
				},{concurrency:20})
			})
			.then(resolve)
			.catch(reject)
		})
	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTableIfExists('user_ribbons'),
		knex.schema.table('user_rewards', function (table) {
			table.dropColumn('ribbons')
		})
	])
}
