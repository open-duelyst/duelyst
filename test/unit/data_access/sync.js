var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var GamesModule = require('../../../server/lib/data_access/games.coffee');
var QuestsModule = require('../../../server/lib/data_access/quests.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex')
var NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum')


// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("sync module", function() {

	var userId = null;
	this.timeout(25000);

	// before cleanup to check if user already exists and delete
	before(function(){
		this.timeout(25000);
		Logger.module("UNITTEST").log("creating user");
		var createOrInsertUser = function (userEmail,userName) {
			return UsersModule.createNewUser(userEmail, userName, 'hash', 'kumite14')
				.bind({})
				.then(function (userIdCreated) {
					this.userId = userIdCreated;
					Logger.module("UNITTEST").log("created user ", userIdCreated);
				}).catch(Errors.AlreadyExistsError, function (error) {
					Logger.module("UNITTEST").log("existing user",userName);
					return UsersModule.userIdForEmail(userEmail)
						.bind(this)
						.then(function (userIdExisting) {
							this.userId = userIdExisting;
							Logger.module("UNITTEST").log("existing user retrieved", userIdExisting);
							return SyncModule.wipeUserData(userIdExisting);
						}).then(function () {
							Logger.module("UNITTEST").log("existing user data wiped", this.userId);
						})
				}).then(function () {
					return Promise.resolve(this.userId)
				});
		};

		return Promise.all([
			createOrInsertUser('unit-test-1@counterplay.co',"player 1",0),
			createOrInsertUser('unit-test-2@counterplay.co',"player 2",0)
		]).spread(function(player1CreatedId,player2CreatedId) {
			userId = player1CreatedId;
			user2Id = player2CreatedId;
		})
	})

	describe("_syncUserFromSQLToFirebase()", function() {

		it('card-collection in firebase to be removed if user collection data empty in SQL', function() {

			trxPromise = knex.transaction(function(tx){
				InventoryModule.giveUserCards(trxPromise,tx,userId,[ 20157, 10974, 20052, 10014, 10965 ])
				.then(function(){
					tx.commit()
				})
				.catch(function(e){
					Logger.module("UNITTEST").log(e)
					tx.rollback()
				})
			}).bind({}).then(function(){
				return SyncModule._syncUserFromSQLToFirebase(userId)
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				this.rootRef = rootRef
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(this.rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardCollection,fbCardCollection){
				expect(cardCountRows.length).to.equal(5);
				expect(_.keys(fbCardCollection.val()).length).to.equal(5);
			}).then(function(){
				return SyncModule.wipeUserData(userId)
			}).then(function(){
				return SyncModule._syncUserFromSQLToFirebase(userId)
			}).then(function(){
				return FirebasePromises.once(this.rootRef.child("user-inventory").child(userId).child("card-collection"),"value")
			}).then(function(fbCardCollection){
				expect(fbCardCollection.val()).to.equal(null);
			})

			return trxPromise

		})

	})

})
