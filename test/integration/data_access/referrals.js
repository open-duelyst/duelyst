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
var ReferralsModule = require('../../../server/lib/data_access/referrals.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex')
var FirstReferralPurchaseAchievement = require('../../../app/sdk/achievements/referralBasedAchievements/firstReferralPurchaseAchievement.coffee')

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("referrals module", function() {

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

	describe('referral program', function(){

		var newUserId = null
		var oldUserId = null
		var oldUserWithEventsId = null
		var userWithRankedGame = null

		before(function(){

			var rando1 = generatePushId()
			var email1 = rando1+'-unit-test@counterplay.co'
			var username1 = rando1.toLowerCase()+'-unit-test'

			var rando2 = generatePushId()
			var email2 = rando2+'-unit-test@counterplay.co'
			var username2 = rando2.toLowerCase()+'-unit-test'

			var rando3 = generatePushId()
			var email3 = rando3+'-unit-test@counterplay.co'
			var username3 = rando3.toLowerCase()+'-unit-test'

			var rando4 = generatePushId()
			var email4 = rando4+'-unit-test@counterplay.co'
			var username4 = rando4.toLowerCase()+'-unit-test'

			return Promise.all([
				UsersModule.createNewUser(email1,username1,'testpassword','kumite14'),
				UsersModule.createNewUser(email2,username2,'testpassword','kumite14'),
				UsersModule.createNewUser(email3,username3,'testpassword','kumite14'),
				UsersModule.createNewUser(email4,username4,'testpassword','kumite14'),
				SyncModule.wipeUserData(userId)
			]).spread(function(newUserId1,newUserId2,newUserId3,newUserId4){
				newUserId = newUserId1
				oldUserId = newUserId2
				oldUserWithEventsId = newUserId3
				userWithRankedGame = newUserId4
				return Promise.all([
					knex("users").where('id',oldUserId).update({
						created_at: moment().utc().subtract(40,'days').toDate()
					}),
					knex("users").where('id',oldUserWithEventsId).update({
						created_at: moment().utc().subtract(15,'days').toDate(),
						top_rank:13,
						purchase_count:2
					}),
					UsersModule.updateUserProgressionWithGameOutcome(userWithRankedGame,generatePushId(),true,generatePushId())
				])
			})
		})

		describe('markUserAsReferredByFriend()',function() {

			it('expect to fail to mark a user as referred with invalid user id', function() {
				return ReferralsModule.markUserAsReferredByFriend(newUserId,'invalidUserId-C$N#Qrnv')
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.NotFoundError)
				})
			})

			it('expect to be able to mark a user as referred by a friend and gain 100 starting GOLD', function() {
				return ReferralsModule.markUserAsReferredByFriend(newUserId,userId)
				.then(function(response){
					expect(response).to.exist
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("users").where('id',newUserId).first(),
						knex("user_referrals").where('user_id',userId),
						knex("user_referral_events").where('referrer_id',userId).select(),
						FirebasePromises.once(rootRef.child("users").child(newUserId),"value"),
						FirebasePromises.once(rootRef.child("users").child(userId),"value")
					])
				}).spread(function(userRow,referralRows,referralEventRows,userSnapshot,friendSnapshot){
					expect(userRow.referred_by_user_id).to.equal(userId)
					expect(userRow.wallet_gold).to.equal(100)
					expect(referralRows.length).to.equal(1)
					expect(referralRows[0].referred_user_id).to.equal(newUserId)
					expect(referralEventRows.length).to.equal(0)
					// expect(userSnapshot.val().buddies[userId]).to.exist
					// expect(friendSnapshot.val().buddies[newUserId]).to.exist
				})
			})

			it('expect to NOT be able to set a referrer for a user that registered over 30 days ago', function() {
				return ReferralsModule.markUserAsReferredByFriend(oldUserId,userId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.not.be.an.instanceof(chai.AssertionError)
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

			it('expect to NOT be able to set a referrer for a user that has played a ranked game', function() {
				return ReferralsModule.markUserAsReferredByFriend(userWithRankedGame,userId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.not.be.an.instanceof(chai.AssertionError)
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
					expect(error.message).to.equal("Can not set referral info on players who have played ranked games.")
				})
			})

			it('expect to be fail to change a users referrer after it\'s been set', function() {
				return ReferralsModule.markUserAsReferredByFriend(newUserId,userId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError)
				})
			})

			it('expect to backfill referral events for users who have already achieved certain milestones but marked late', function() {
				return ReferralsModule.markUserAsReferredByFriend(oldUserWithEventsId,newUserId)
				.then(function(response){
					expect(response).to.exist
					return Promise.all([
						knex("users").where('id',oldUserWithEventsId).first(),
						knex("user_referral_events").where('referrer_id',newUserId).select()
					])
				}).spread(function(userRow,referralEventRows){
					expect(userRow.referred_by_user_id).to.equal(newUserId)
					expect(referralEventRows.length).to.equal(2)
				})
			})

			it('expect to NOT be able to mark self as referred by someone you referred', function() {
				return ReferralsModule.markUserAsReferredByFriend(userId,newUserId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
					expect(error.message).to.equal("User can not be marked as referred by one of their referrals.")
				})
			})

			it('expect to NOT be able to mark self as referred by self', function() {
				return ReferralsModule.markUserAsReferredByFriend(userId,userId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
					expect(error.message).to.equal("Can not be marked as referred by self.")
				})
			})
		})

		describe("processReferralEventForUser()", function() {

			it('expect to fail to process anything for an user with no referrer', function() {
				return ReferralsModule.processReferralEventForUser(userId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.NotFoundError)
				})
			})

			it('expect to update referral event for a user with a referrer', function() {
				return ReferralsModule.processReferralEventForUser(newUserId,userId,'silver')
				.then(function(response){
					expect(response).to.exist
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_referrals").where('user_id',userId).select(),
						knex("user_referral_events").where('referrer_id',userId).select()
					])
				}).spread(function(referralRows,referralEventRows){
					expect(referralRows.length).to.equal(1)
					expect(referralRows[0].level_reached).to.equal(1)
					expect(referralEventRows.length).to.equal(1)
					expect(_.pluck(referralEventRows,"event_type")).to.have.members(['silver'])
				})
			})

			it('expect referral row record "level" to iterate upwards with events', function() {
				return ReferralsModule.processReferralEventForUser(newUserId,userId,'gold')
				.then(function(response){
					expect(response).to.exist
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_referrals").where('user_id',userId).select(),
						knex("user_referral_events").where('referrer_id',userId).select()
					])
				}).spread(function(referralRows,referralEventRows){
					expect(referralRows.length).to.equal(1)
					expect(referralRows[0].level_reached).to.equal(2)
					expect(referralEventRows.length).to.equal(2)
					expect(_.pluck(referralEventRows,"event_type")).to.have.members(['silver', 'gold'])
				})
			})

			it('expect off master flow events (such as "purchase") to not change referral record level', function() {
				return ReferralsModule.processReferralEventForUser(newUserId,userId,'purchase')
				.then(function(response){
					expect(response).to.exist
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_referrals").where('user_id',userId).select(),
						knex("user_referral_events").where('referrer_id',userId).select()
					])
				}).spread(function(referralRows,referralEventRows){
					expect(referralRows.length).to.equal(1)
					expect(referralRows[0].level_reached).to.equal(2)
					expect(referralEventRows.length).to.equal(3)
					expect(_.pluck(referralEventRows,"event_type")).to.have.members(['silver', 'gold', 'purchase'])
				})
			})

			// it('expect stats to increment correctly', function() {
			// 	return ReferralsModule.processReferralEventForUser(generatePushId(),'unittestercode','gold')
			// 	.then(function(response){
			// 		expect(response).to.exist
			// 		return DuelystFirebase.connect().getRootRef()
			// 	}).then(function(rootRef){
			// 		return Promise.all([
			// 			knex("referral_codes").where('code','unittestercode').first(),
			// 			knex("referral_events").where('code','unittestercode').select()
			// 		])
			// 	}).spread(function(referralCodeRow,referralEventRows){
			// 		expect(referralCodeRow).to.exist
			// 		expect(referralCodeRow.event_stats_json['gold']).to.equal(2)
			// 		expect(referralEventRows.length).to.equal(2)
			// 	})
			// })

		})

		describe("claimReferralRewards()", function() {

			var noReferralUserId = null

			before(function(){
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				return UsersModule.createNewUser(email,username,'testpassword','kumite14')
				.then(function(userId){
					noReferralUserId = userId
				})
			})

			it('expect to fail to claim anything if you don\'t have any rewards waiting', function() {
				return ReferralsModule.claimReferralRewards(noReferralUserId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

			it('expect to be able to claim referral rewards and receive rewards', function() {
				return ReferralsModule.claimReferralRewards(userId)
				.then(function(response){
					expect(response).to.exist
					return Promise.all([
						knex("users").where('id',userId).first(),
						knex("user_rewards").where('user_id',userId).andWhere('reward_category','referral').select()
					])
				}).spread(function(userRow,rewardRows){
					expect(userRow.referral_rewards_claimed_at).to.exist
					expect(rewardRows.length).to.equal(2)
					var rewards = _.reduce(rewardRows,function(memo,r){
						memo.spirit_orbs += (r.spirit_orbs || 0)
						memo.gold += (r.gold || 0)
						return memo
					},{
						spirit_orbs:0,
						gold:0
					})
					expect(rewards.spirit_orbs).to.equal(1)
					expect(rewards.gold).to.equal(200)
				})
			})

			it('expect claiming again with no new rewards added to ERROR out', function() {
				return ReferralsModule.claimReferralRewards(userId)
				.then(function(response){
					expect(response).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})
			})

		})

		describe("referral hidden achievement", function() {

			it('expect first purchase by a referral achievement to have awarded ROOK emote', function() {
				// NOTE: purchase event fires above no need to do here so commented out

				// return ReferralsModule.processReferralEventForUser(newUserId,userId,'purchase')
				// .then(function(response){
				// 	return Promise.delay(500)
				// })
				return Promise.resolve()
				.then(function(){
					return Promise.all([
						knex("user_achievements").where('user_id',userId).select(),
						knex("user_cosmetic_inventory").where('user_id',userId).select()
					])
				}).spread(function(achievementRows,emoteRows){
					expect(achievementRows.length).to.equal(1)
					expect(achievementRows[0].achievement_id).to.equal(FirstReferralPurchaseAchievement.id)
					expect(emoteRows.length).to.equal(1)
					expect(parseInt(emoteRows[0].cosmetic_id)).to.equal(SDK.CosmeticsLookup.Emote.OtherRook)
				})
			})

		})

	})


});
