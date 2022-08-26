var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var GamesModule = require('../../../server/lib/data_access/games.coffee');
var GiftCodesModule = require('../../../server/lib/data_access/gift_codes.coffee');
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

describe("gift codes module", function() {

	var userId = null;
	this.timeout(25000);

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
		}).catch(function(error){
			Logger.module("UNITTEST").log("unexpected error: ",error)
			throw error
		})
	})

	describe("redeemGiftCode()", function() {

		it('throws an error for invalid gift code', function() {
			return GiftCodesModule.redeemGiftCode(userId,"no-such-code")
			.then(function(result){
				expect(result).to.not.exist
			})
			.catch(function(error){
				expect(error).to.exist
				expect(error).to.be.an.instanceof(Errors.NotFoundError)
			})
		})

		describe("kickstarter codes",function(){

			it('marks valid Kickstarter code as claimed and gives user cards', function() {

				var code = "unit-test-"+generatePushId()
				return knex("gift_codes").insert({
					code:code,
					type:'ks-1'
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(){
					return Promise.all([
						knex("gift_codes").where('code',code).first(),
						knex("user_card_collection").where('user_id',userId).first(),
					])
				}).spread(function(giftCodeRow,cardCollectionRow){
					expect(giftCodeRow.claimed_at).to.exist
					expect(giftCodeRow.claimed_by_user_id).to.equal(userId)
					expect(cardCollectionRow.cards).to.exist
					var cardIds = _.keys(cardCollectionRow.cards)
					expect(cardIds.length).to.be.above(0)
				})

			})

			it('throws error if a user attempts to redeem a previously redeemed code', function() {

				var code = "unit-test-"+generatePushId()
				return knex("gift_codes").insert({
					code:code,
					type:'ks-1'
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

		})

		describe("compound REWARD codes",function(){

			it('marks valid REWARD code as claimed and gives user GOLD', function() {
					var code = "unit-test-"+generatePushId()
					return knex("gift_codes").insert({
						code:code,
						type:'rewards',
						rewards:{
							gold:50
						}
					}).then(function(){
						return GiftCodesModule.redeemGiftCode(userId,code)
					}).then(function(result){
						return Promise.all([
							knex("users").where('id',userId).first('wallet_gold','wallet_spirit'),
							knex("gift_codes").where('code',code).first()
						])
					}).spread(function(userRow,giftCodeRow){
						expect(userRow.wallet_gold).to.equal(50)
						expect(userRow.wallet_spirit).to.equal(0)
						expect(giftCodeRow.claimed_at).to.exist
						expect(giftCodeRow.claimed_by_user_id).to.equal(userId)
					})
			})

			it('marks valid REWARD code as claimed and gives user SPIRIT', function() {
					var code = "unit-test-"+generatePushId()
					return knex("gift_codes").insert({
						code:code,
						type:'rewards',
						rewards:{
							spirit:20
						}
					}).then(function(){
						return GiftCodesModule.redeemGiftCode(userId,code)
					}).then(function(result){
						return Promise.all([
							knex("users").where('id',userId).first('wallet_gold','wallet_spirit'),
							knex("gift_codes").where('code',code).first()
						])
					}).spread(function(userRow,giftCodeRow){
						expect(userRow.wallet_gold).to.equal(50)
						expect(userRow.wallet_spirit).to.equal(20)
						expect(giftCodeRow.claimed_at).to.exist
						expect(giftCodeRow.claimed_by_user_id).to.equal(userId)
					})
			})

			it('marks valid REWARD code as claimed and gives user CARDS', function() {
				var code = "unit-teeet-"+generatePushId()
				return SyncModule.wipeUserData(userId)
				.then(function(){
					return knex("gift_codes").insert({
						code:code,
						type:'rewards',
						rewards: {
							card_ids: [SDK.Cards.Neutral.EmeraldRejuvenator, SDK.Cards.Neutral.EmeraldRejuvenator, SDK.Cards.Neutral.RepulsionBeast]
						}
					})
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					return Promise.all([
						knex("user_cards").where('user_id',userId).select(),
						knex("gift_codes").where('code',code).first()
					])
				}).spread(function(userCardRows,giftCodeRow){
						expect(userCardRows).to.exist
						expect(giftCodeRow).to.exist

						expect(userCardRows.length).to.equal(2);
						emeraldRow = _.find(userCardRows,function(cardRow){return cardRow.card_id==SDK.Cards.Neutral.EmeraldRejuvenator});
						expect(emeraldRow).to.exist;
						expect(emeraldRow.count).to.equal(2);
						beastRow = _.find(userCardRows,function(cardRow){return cardRow.card_id==SDK.Cards.Neutral.RepulsionBeast});
						expect(beastRow).to.exist;
						expect(beastRow.count).to.equal(1);
						expect(giftCodeRow.claimed_at).to.exist
						expect(giftCodeRow.claimed_by_user_id).to.equal(userId)
				})
			});

			it('marks valid compound REWARD code as claimed and gives correct rewards', function() {
					var code = "unit-test-"+generatePushId()
					return SyncModule.wipeUserData(userId).then(function(){
						return knex("gift_codes").insert({
							code:code,
							type:'rewards',
							rewards:{
								spirit:25,
								gold:15,
								orbs:3,
								gauntlet_tickets:2
							}
						})
					}).then(function(){
						return GiftCodesModule.redeemGiftCode(userId,code)
					}).then(function(result){
						return Promise.all([
							knex("users").where('id',userId).first('wallet_gold','wallet_spirit'),
							knex("user_spirit_orbs").where('user_id',userId).select(),
							knex("user_gauntlet_tickets").where('user_id',userId).select(),
							knex("gift_codes").where('code',code).first()
						])
					}).spread(function(userRow,orbRows,gauntletTicketRows,giftCodeRow){
						expect(userRow.wallet_gold).to.equal(15)
						expect(userRow.wallet_spirit).to.equal(25)
						expect(giftCodeRow.claimed_at).to.exist
						expect(giftCodeRow.claimed_by_user_id).to.equal(userId)
						expect(orbRows.length).to.equal(3)
						expect(gauntletTicketRows.length).to.equal(2)
						expect(orbRows[0].transaction_type).to.equal('gift code')
						expect(orbRows[0].transaction_id).to.equal(code)
						expect(gauntletTicketRows[0].transaction_type).to.equal('gift code')
						expect(gauntletTicketRows[0].transaction_id).to.equal(code)
					})
			})

			it('claims valid REWARD code containing cosmetics and gives cosmetics to user', function(){
				var code = "unit-test-"+generatePushId()
				return knex("gift_codes").insert({
					code:code,
					type:'rewards',
					rewards:{
						cosmetics:[
							SDK.CosmeticsLookup.Emote.HealingMysticHappy,
							SDK.CosmeticsLookup.CardBack.Agenor
						]
					}
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					return Promise.all([
						knex("user_cosmetic_inventory").where('user_id',userId).select(),
						knex("gift_codes").where('code',code).first()
					])
				}).spread(function(userCosmeticRows,giftCodeRow){
					var healingMysticHappy = _.find(userCosmeticRows,function(c){ return parseInt(c.cosmetic_id) === SDK.CosmeticsLookup.Emote.HealingMysticHappy })
					var agenorCardBack = _.find(userCosmeticRows,function(c){ return parseInt(c.cosmetic_id) === SDK.CosmeticsLookup.CardBack.Agenor })
					expect(healingMysticHappy).to.exist;
					expect(agenorCardBack).to.exist;
					expect(giftCodeRow.claimed_at).to.exist;
					expect(giftCodeRow.claimed_by_user_id).to.equal(userId)
				})
			})

			it('throws error if a user attempts to redeem a previously redeemed REWARDS code', function() {
				var code = "unit-test-"+generatePushId()
				return knex("gift_codes").insert({
					code:code,
					type:'rewards'
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

		})

		describe("codes with expiration",function(){

			it('does not allow use of an expired code',function(){
				var code = "unit-test-"+generatePushId()
				return knex("gift_codes").insert({
					code:code,
					type:'rewards',
					expires_at: moment.utc().subtract(1,'days').toDate(),
					rewards:{
						gold:50
					}
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

			it('allows use of a code before it expires',function(){
				var code = "unit-test-"+generatePushId()
				return knex("gift_codes").insert({
					code:code,
					type:'rewards',
					expires_at: moment.utc().add(1,'days').toDate(),
					rewards:{
						gold:10
					}
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.exist
				})
			})

		})

		describe("codes with registration cutoff",function(){

			it('does not allow use of a code by a user that registered before the cutoff',function(){
				var code = "unit-test-"+generatePushId()
				return Promise.all([
					knex("gift_codes").insert({
						code:code,
						type:'rewards',
						valid_for_users_created_after: moment.utc().add(1,'days').toDate(),
						rewards:{
							gold:50
						}
					}),
					knex("users").where('id',userId).update({
						created_at: moment.utc().toDate()
					})
				]).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

			it('allows use of a code by a user that registered after the cutoff',function(){
				var code = "unit-test-"+generatePushId()
				return Promise.all([
					knex("gift_codes").insert({
						code:code,
						type:'rewards',
						valid_for_users_created_after: moment.utc().subtract(1,'days').toDate(),
						rewards:{
							gold:50
						}
					}),
					knex("users").where('id',userId).update({
						created_at: moment.utc().toDate()
					})
				]).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.exist
				})
			})

		})

		describe("codes with game count limits",function(){

			it('does not allow use of a code by a user that exceeds a game count limit',function(){
				var code = "unit-test-"+generatePushId()
				return Promise.all([
					knex("gift_codes").insert({
						code:code,
						type:'rewards',
						game_count_limit: 9,
						rewards:{
							gold:50
						}
					}),
					UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId())
				]).then(function(){
					return knex("user_progression").where('user_id',userId).update({
						game_count: 10
					})
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

			it('allows use of a code by a user that is below the game count limit',function(){
				var code = "unit-test-"+generatePushId()
				return Promise.all([
					knex("gift_codes").insert({
						code:code,
						type:'rewards',
						game_count_limit: 10,
						rewards:{
							gold:50
						}
					}),
					UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId())
				]).then(function(){
					return knex("user_progression").where('user_id',userId).update({
						game_count: 9
					})
				}).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.exist
				})
			})

		})

		describe("codes with one-use per customer limit",function(){

			before(function(){
				return knex("gift_codes").where("exclusion_id","unit-test-1").andWhere('claimed_by_user_id',userId).delete()
			})

			it('allows one use of a one-per-customer code by a user',function(){
				var code = "unit-test-"+generatePushId()
				return Promise.all([
					knex("gift_codes").insert({
						code:code,
						type:'rewards',
						exclusion_id: "unit-test-1",
						rewards:{
							gold:50
						}
					})
				]).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.exist
				})
			})

			it('does NOT allow use of two of a one-per-customer code type by a user',function(){
				var code = "unit-test-"+generatePushId()
				return Promise.all([
					knex("gift_codes").insert({
						code:code,
						type:'rewards',
						exclusion_id: "unit-test-1",
						rewards:{
							gold:50
						}
					})
				]).then(function(){
					return GiftCodesModule.redeemGiftCode(userId,code)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					Logger.module("UNITTEST").log(error.message)
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
					expect(error.message).to.equal("Gift Code of this type has already been claimed.")
				})
			})

		})

	})

})
