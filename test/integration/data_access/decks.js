var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var DecksModule = require('../../../server/lib/data_access/decks.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex')

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && true;

describe("decks module", function() {

	var userId = null;

	// before cleanup to check if user already exists and delete
	before(function(){
		this.timeout(25000);
		Logger.module("UNITTEST").log("creating user");
		return UsersModule.createNewUser('unit-test@counterplay.co','unittest','hash','kumite14')
		.then(function(userIdCreated){
			Logger.module("UNITTEST").log("created user ",userIdCreated);
			userId = userIdCreated;
		}).catch(Errors.AlreadyExistsError,function(error){
			Logger.module("UNITTEST").log("existing user");
			return UsersModule.userIdForEmail('unit-test@counterplay.co').then(function(userIdExisting){
				Logger.module("UNITTEST").log("existing user retrieved",userIdExisting);
				userId = userIdExisting;
				return SyncModule.wipeUserData(userIdExisting);
			}).then(function(){
				Logger.module("UNITTEST").log("existing user data wiped",userId);
			})
		})
	});

	// // after cleanup
	// after(function(){
	// 	this.timeout(25000);
	// 	return DuelystFirebase.connect().getRootRef()
	// 	.bind({})
	// 	.then(function(fbRootRef){
	// 		this.fbRootRef = fbRootRef;
	// 		if (userId)
	// 			return clearUserData(userId,this.fbRootRef);
	// 	});
	// });

	describe("addDeck()", function() {

		it('adds a deck', function() {
			return DecksModule.addDeck(userId,SDK.Factions.Lyonar,'lyonoobs',[SDK.Cards.Faction1.Lightchaser,SDK.Cards.Faction1.Lightchaser,SDK.Cards.Faction1.Lightchaser],0,3,0,0)
			.then(function(){
				return knex("user_decks").select().where('user_id',userId);
			}).then(function(deckRows){
				expect(deckRows.length).to.equal(1);
				expect(deckRows[0].name).to.equal('lyonoobs');
				expect(deckRows[0].cards.length).to.equal(3);
				expect(deckRows[0].cards).to.contain(SDK.Cards.Faction1.Lightchaser);
				expect(deckRows[0].minion_count).to.equal(3);
			})
		});

	});

	describe("updateDeck()", function() {

		it('updates a deck', function() {
			return knex("user_decks").first().where('user_id',userId)
			.then(function(deckRow){
				return DecksModule.updateDeck(userId,deckRow.id,SDK.Factions.Lyonar,'lyonoobs 2',[SDK.Cards.Faction1.Sunriser],0,1,0,0)
			}).then(function(){
				return knex("user_decks").select().where('user_id',userId);
			}).then(function(deckRows){
				expect(deckRows.length).to.equal(1);
				expect(deckRows[0].name).to.equal('lyonoobs 2');
				expect(deckRows[0].cards.length).to.equal(1);
				expect(deckRows[0].cards).to.contain(SDK.Cards.Faction1.Sunriser);
				expect(deckRows[0].minion_count).to.equal(1);
			})
		});

	});

	describe("hashCodeForDeck()",function() {

		it('generates a deck digest', function() {
			var digest = DecksModule.hashForDeck([SDK.Cards.Faction1.Sunriser,SDK.Cards.Faction1.Sunriser,SDK.Cards.Faction1.Sunriser])
			expect(digest).to.exist;
		})

		it('generates two different digests based on salt', function() {
			var digest1 = DecksModule.hashForDeck([SDK.Cards.Faction1.Sunriser,SDK.Cards.Faction1.Sunriser,SDK.Cards.Faction1.Sunriser],"2")
			var digest2 = DecksModule.hashForDeck([SDK.Cards.Faction1.Sunriser,SDK.Cards.Faction1.Sunriser,SDK.Cards.Faction1.Sunriser],"1")
			expect(digest1).to.not.equal(digest2);
		})

	})

});
