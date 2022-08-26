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
var NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum')


// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("users module", function() {

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

	// // after cleanup
	// after(function(){
	// 	this.timeout(25000);
	// 	return DuelystFirebase.connect().getRootRef()
	// 	.bind({})
	// 	.then(function(fbRootRef){
	// 		this.fbRootRef = fbRootRef;
	// 		if (userId)
	// 			return SyncModule.wipeUserData(userId);
	// 	});
	// });
	describe("userIdForEmail()", function() {

		it('expect a user id if email exists', function() {
			return UsersModule.userIdForEmail('unit-test@counterplay.co')
			.then(function(id){
				expect(id).to.exist;
				expect(id).to.have.length(20);
			});
		});

		it('expect null if the email does not exist', function() {
			return UsersModule.userIdForEmail('does@not.exist')
			.then(function(id){
				expect(id).to.be.equal(null);
			});
		});

	})

	describe("createNewUser()", function() {

		before(function(){
			// destroy referal codes
			return Promise.all([
				knex("referral_codes").where('code',"test-referal-20-gold").delete(),
				knex("referral_codes").where('code',"test-referal-10-gold-friend").delete(),
				knex("referral_codes").where('code',"expired-gold-code").delete(),
				knex("referral_codes").where('code',"maxed-gold-code").delete(),
				knex("referral_codes").where('code',"inactive-gold-code").delete()
			])
		})

		describe("registration - when invite codes are active", function() {

			//
			var invitesActiveBefore = null;
			before(function(){
				invitesActiveBefore = config.get('inviteCodesActive')
				config.set('inviteCodesActive',true)
			})
			after(function(){ config.set('inviteCodesActive',invitesActiveBefore) })

			it('expect NOT to be able to create a user with an invalid invite code if invite codes are ACTIVE', function() {
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co';
				return UsersModule.createNewUser(email,'testuser'+rando,'testpassword',"invalid invite")
				.then(function(result){
					expect(result).to.not.exist;
				})
				.catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidInviteCodeError);
				})
			})

			it('expect to be able to create a user with a valid invite code if invite codes are ACTIVE', function() {
				var rando = generatePushId()
				var code = "test-invite-"+rando
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				return knex("invite_codes").insert({code:code})
				.bind({})
				.then(function(){
					return UsersModule.createNewUser(email,username,'testpassword',code)
				})
				.then(function(newUserId){
					this.newUserId = newUserId;
					expect(newUserId).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("users").where('id',this.newUserId).first(),
						FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
					])
				}).spread(function(userRow,userSnapshot){
					expect(userRow.username).to.equal(username)
					expect(userSnapshot.val().username).to.equal(username)
				})
			})

		})

		describe("registration - when invite codes are in-active", function() {

			//
			var invitesActiveBefore = null;
			before(function(){
				invitesActiveBefore = config.get('inviteCodesActive')
				config.set('inviteCodesActive',false)
			})
			after(function(){ config.set('inviteCodesActive',invitesActiveBefore) })

			it('expect to be able to create a user with an invalid invite code if invite codes are INACTIVE', function() {
				var rando = generatePushId()
				var code = "fake-test-invite-"+rando
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				return UsersModule.createNewUser(email,username,'testpassword',code)
				.then(function(newUserId){
					this.newUserId = newUserId;
					expect(newUserId).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("users").where('id',this.newUserId).first(),
						FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
					])
				}).spread(function(userRow,userSnapshot){
					expect(userRow.username).to.equal(username)
					expect(userSnapshot.val().username).to.equal(username)
				})
			})

		})

		describe("registration - with referral codes", function() {

			it('expect a referal code with 20 bonus signup GOLD to work', function() {
				var rando = generatePushId()
				var code = "test-invite-"+rando
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				var referalCode = 'test-referal-20-gold'
				return Promise.all([
					knex("invite_codes").insert({code:code}),
					knex("referral_codes").insert({
						code:referalCode,
						params:{
							gold:20
						}
					})
				])
				.then(function(){
					return UsersModule.createNewUser(email,username,'testpassword',code,referalCode)
				})
				.then(function(newUserId){
					this.newUserId = newUserId
					expect(newUserId).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("users").where('id',this.newUserId).first(),
						knex("referral_codes").where('code',referalCode).first(),
						FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
						FirebasePromises.once(rootRef.child("user-inventory").child(this.newUserId).child('wallet'),"value"),
					])
				}).spread(function(userRow,referralCodeRow,userSnapshot,walletSnapshot){
					expect(userRow.username).to.equal(username)
					expect(userRow.wallet_gold).to.equal(20)
					expect(referralCodeRow.signup_count).to.equal(1)
					expect(userSnapshot.val().username).to.equal(username)
					expect(walletSnapshot.val().gold_amount).to.equal(20)
				})
			});

			it('expect a referal code to be CaSE insensitive', function() {
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				var referalCode = 'TEST-referal-20-Gold'
				return UsersModule.createNewUser(email,username,'testpassword','kumite14',referalCode)
				.then(function(newUserId){
					this.newUserId = newUserId
					expect(newUserId).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("users").where('id',this.newUserId).first(),
						knex("referral_codes").where('code',referalCode.toLowerCase()).first(),
						FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
						FirebasePromises.once(rootRef.child("user-inventory").child(this.newUserId).child('wallet'),"value"),
					])
				}).spread(function(userRow,referralCodeRow,userSnapshot,walletSnapshot){
					expect(userRow.username).to.equal(username)
					expect(userRow.wallet_gold).to.equal(20)
					expect(referralCodeRow.signup_count).to.equal(2)
					expect(userSnapshot.val().username).to.equal(username)
					expect(walletSnapshot.val().gold_amount).to.equal(20)
				})
			});

			it('expect a referal code to trim whitespace', function() {
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				var referalCode = ' TEST-referal-20-Gold '
				return UsersModule.createNewUser(email,username,'testpassword','kumite14',referalCode)
				.then(function(newUserId){
					this.newUserId = newUserId
					expect(newUserId).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("users").where('id',this.newUserId).first(),
						knex("referral_codes").where('code',referalCode.toLowerCase().trim()).first(),
						FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
						FirebasePromises.once(rootRef.child("user-inventory").child(this.newUserId).child('wallet'),"value"),
					])
				}).spread(function(userRow,referralCodeRow,userSnapshot,walletSnapshot){
					expect(userRow.username).to.equal(username)
					expect(userRow.wallet_gold).to.equal(20)
					expect(referralCodeRow.signup_count).to.equal(3)
					expect(userSnapshot.val().username).to.equal(username)
					expect(walletSnapshot.val().gold_amount).to.equal(20)
				})
			});

			// it('expect a referal code with auto friending to work', function() {
			// 	var rando1 = generatePushId()
			// 	var email1 = rando1+'-unit-test@counterplay.co'
			// 	var username1 = rando1.toLowerCase()+'-unit-test'
			// 	var rando2 = generatePushId()
			// 	var email2 = rando2+'-unit-test@counterplay.co'
			// 	var username2 = rando2.toLowerCase()+'-unit-test'
			// 	var referalCode = "test-referal-10-gold-friend"
			// 	var friendId = null
			// 	return UsersModule.createNewUser(email1,username1,'testpassword',"kumite14")
			// 	.then(function(newUserId){
			// 		friendId = this.friendId = newUserId
			// 		return Promise.all([
			// 			knex("referral_codes").insert({
			// 				code:referalCode,
			// 				user_id:friendId,
			// 				params:{
			// 					autoFriend:true,
			// 					gold:10
			// 				}
			// 			})
			// 		])
			// 	}).then(function(){
			// 		return UsersModule.createNewUser(email2,username2,'testpassword',"kumite14",referalCode)
			// 	})
			// 	.then(function(newUserId){
			// 		this.newUserId = newUserId
			// 		expect(newUserId).to.exist;
			// 		return DuelystFirebase.connect().getRootRef()
			// 	}).then(function(rootRef){
			// 		return Promise.all([
			// 			knex("users").where('id',this.newUserId).first(),
			// 			knex("referral_codes").where('code',referalCode).first(),
			// 			FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
			// 			FirebasePromises.once(rootRef.child("users").child(friendId),"value"),
			// 		])
			// 	}).spread(function(userRow,referralCodeRow,userSnapshot,friendSnapshot){
			// 		expect(userRow.wallet_gold).to.equal(10)
			// 		expect(referralCodeRow.signup_count).to.equal(1)
			// 		expect(userSnapshot.val().buddies[friendId]).to.exist
			// 		expect(friendSnapshot.val().buddies[this.newUserId]).to.exist
			// 	})
			// });

			it('expect using an invalid referral code to ERROR out', function() {
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				return Promise.all([])
				.then(function(){
					return UsersModule.createNewUser(email,username,'testpassword',"kumite14","invalid-code")
				})
				.then(function(newUserId){
					expect(newUserId).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
				})
			})

			it('expect using an MAXED-out referral code to error out', function() {
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				return Promise.all([
					knex("referral_codes").insert({
						code:'maxed-gold-code',
						signup_limit:1,
						signup_count:1,
						params:{
							gold:20
						}
					})
				])
				.then(function(){
					return UsersModule.createNewUser(email,username,'testpassword',"kumite14","maxed-gold-code")
				})
				.then(function(newUserId){
					expect(newUserId).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
				})
				// .then(function(newUserId){
				// 	this.newUserId = newUserId
				// 	expect(newUserId).to.exist;
				// 	return DuelystFirebase.connect().getRootRef()
				// }).then(function(rootRef){
				// 	return Promise.all([
				// 		knex("users").where('id',this.newUserId).first(),
				// 		FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
				// 	])
				// }).spread(function(userRow,userSnapshot){
				// 	expect(userRow.username).to.equal(username)
				// 	expect(userRow.referral_code).to.not.exist
				// 	expect(userRow.wallet_gold).to.equal(0)
				// 	expect(userSnapshot.val().username).to.equal(username)
				// })
			})

			it('expect using an expired referal code to error out', function() {
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				var expires = moment().utc().subtract(1,'month').toDate()
				return Promise.all([
					knex("referral_codes").insert({
						code:'expired-gold-code',
						params:{
							gold:20
						},
						expires_at:expires
					})
				])
				.then(function(){
					return UsersModule.createNewUser(email,username,'testpassword',"kumite14","expired-gold-code")
				})
				.then(function(newUserId){
					expect(newUserId).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
				})
				// .then(function(newUserId){
				// 	this.newUserId = newUserId
				// 	expect(newUserId).to.exist;
				// 	return DuelystFirebase.connect().getRootRef()
				// }).then(function(rootRef){
				// 	return Promise.all([
				// 		knex("users").where('id',this.newUserId).first(),
				// 		FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
				// 	])
				// }).spread(function(userRow,userSnapshot){
				// 	expect(userRow.username).to.equal(username)
				// 	expect(userRow.referral_code).to.not.exist
				// 	expect(userRow.wallet_gold).to.equal(0)
				// 	expect(userSnapshot.val().username).to.equal(username)
				// })
			})

			it('expect using an inactive referal code to error out', function() {
				var rando = generatePushId()
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				return Promise.all([
					knex("referral_codes").insert({
						code:'inactive-gold-code',
						params:{
							gold:20
						},
						is_active:false
					})
				])
				.then(function(){
					return UsersModule.createNewUser(email,username,'testpassword',"kumite14","inactive-gold-code")
				})
				.then(function(newUserId){
					expect(newUserId).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
				})
				// .then(function(newUserId){
				// 	this.newUserId = newUserId
				// 	expect(newUserId).to.exist;
				// 	return DuelystFirebase.connect().getRootRef()
				// }).then(function(rootRef){
				// 	return Promise.all([
				// 		knex("users").where('id',this.newUserId).first(),
				// 		FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
				// 	])
				// }).spread(function(userRow,userSnapshot){
				// 	expect(userRow.username).to.equal(username)
				// 	expect(userRow.referral_code).to.not.exist
				// 	expect(userRow.wallet_gold).to.equal(0)
				// 	expect(userSnapshot.val().username).to.equal(username)
				// })
			})

		})

		describe("registration - with campaign data", function() {

			it('expect campaign data to set correctly', function() {
				var rando = generatePushId()
				var code = "test-invite-"+rando
				var email = rando+'-unit-test@counterplay.co'
				var username = rando.toLowerCase()+'-unit-test'
				var referalCode = 'test-referal-20-gold'
				var campaignData = {
					campaign_source:"test_campaign_source",
					campaign_medium:"test_campaign_medium",
					campaign_term:"test_campaign_term",
					campaign_content:"test_campaign_content",
					campaign_name:"test_campaign_name",
					referrer:"test_referrer"
				};
				return UsersModule.createNewUser(email,username,'testpassword',"kumite14",null,campaignData)
				.then(function(newUserId){
					this.newUserId = newUserId
					expect(newUserId).to.exist;

					return knex("users").where('id',this.newUserId).first()
				}).then(function(userRow){
					expect(userRow.campaign_source).to.equal(campaignData.campaign_source);
					expect(userRow.campaign_medium).to.equal(campaignData.campaign_medium);
					expect(userRow.campaign_term).to.equal(campaignData.campaign_term);
					expect(userRow.campaign_content).to.equal(campaignData.campaign_content);
					expect(userRow.campaign_name).to.equal(campaignData.campaign_name);
					expect(userRow.referrer).to.equal(campaignData.referrer);
				})
			});
		});
	});

	describe("updateDaysSeen()", function() {
		var registeredMoment;
		var daysSeenUserId;
		before(function(){
			var rando = generatePushId()
			var email = rando+'-unit-test@counterplay.co'
			var username = rando.toLowerCase()+'-unit-test'
			return UsersModule.createNewUser(email,username,'hash','kumite14')
			.then(function(userIdCreated){
				daysSeenUserId = userIdCreated;
				return knex("users").where('id',daysSeenUserId).first()
			}).then(function(userRow){
				registeredMoment = moment.utc(userRow.created_at);
			})
		});

		it('expect days seen to be empty when user is seen day of registration', function() {
			return UsersModule.updateDaysSeen(daysSeenUserId,registeredMoment)
			.then(function(){
				return knex("users").where('id',daysSeenUserId).first()
			}).then(function(userRow){
				expect(userRow.seen_on_days).to.not.exist;
			})
		});

		it('expect days seen to have recorded day 1 when user is seen 1 day after registration', function() {
			return UsersModule.updateDaysSeen(daysSeenUserId,registeredMoment.clone().add(1,'days'))
			.then(function(){
				return knex("users").where('id',daysSeenUserId).first()
			}).then(function(userRow){
				expect(userRow.seen_on_days).to.exist;
				expect(_.contains(userRow.seen_on_days,1)).to.equal(true);
				expect(userRow.seen_on_days.length).to.equal(1)
			})
		});

		it('expect days seen to not have recorded day 2 when user is seen 2 days after registration', function() {
			return UsersModule.updateDaysSeen(daysSeenUserId,registeredMoment.clone().add(2,'days'))
			.then(function(){
				return knex("users").where('id',daysSeenUserId).first()
			}).then(function(userRow){
				expect(userRow.seen_on_days).to.exist;
				expect(_.contains(userRow.seen_on_days,2)).to.equal(false);
				expect(userRow.seen_on_days.length).to.equal(1)
			})
		});

		it('expect days seen to have recorded day 3 when user is seen 3 days after registration', function() {
			return UsersModule.updateDaysSeen(daysSeenUserId,registeredMoment.clone().add(3,'days'))
				.then(function(){
					return knex("users").where('id',daysSeenUserId).first()
				}).then(function(userRow){
					expect(userRow.seen_on_days).to.exist;
					expect(_.contains(userRow.seen_on_days,3)).to.equal(true);
					expect(userRow.seen_on_days.length).to.equal(2)
				})
		});
	});

	describe("userIdForUsername()", function() {

		it('expect a user id if user exists', function() {
			return UsersModule.userIdForUsername('unittest')
			.then(function(id){
				expect(id).to.exist;
				expect(id).to.have.length(20);
			});
		});

		it('expect null if the username does not exist', function() {
			return UsersModule.userIdForUsername('thisusername_doesnotexist')
			.then(function(id){
				expect(id).to.be.equal(null);
			});
		});
	});

	describe("setPortraitId()", function() {

		it('expect to be able to set a portrait id', function() {
			return UsersModule.setPortraitId(userId, SDK.CosmeticsLookup.ProfileIcon.Tree)
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("users").where('id',userId).first(),
					FirebasePromises.once(rootRef.child("users").child(userId),"value"),
				])
			})
			.spread(function(userRow,userSnapshot){
				expect(userRow.portrait_id).to.equal(SDK.CosmeticsLookup.ProfileIcon.Tree)
				expect(userSnapshot.val().presence.portrait_id).to.equal(SDK.CosmeticsLookup.ProfileIcon.Tree)
			});
		});

		it('expect NOT to be able to set a portrait id you dont own', function() {
			return UsersModule.setPortraitId(userId, SDK.CosmeticsLookup.ProfileIcon.vanar_arcticdisplacer)
			.then(function(response){
				// should never hit this
				expect(response).to.not.exist
			})
			.catch(function(error){
				// Logger.module("UNITTEST").log(error)
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});
		});

	});

	describe("setBattleMapId()", function() {

		it('expect to be able to set a battle map id', function() {

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCosmeticId(trxPromise, tx, userId, SDK.CosmeticsLookup.BattleMap.Magmar, "unit test", generatePushId());
			})
			.then(function(){
				return UsersModule.setBattleMapId(userId, SDK.CosmeticsLookup.BattleMap.Magmar)
			})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("users").where('id',userId).first(),
					FirebasePromises.once(rootRef.child("users").child(userId),"value"),
				])
			})
			.spread(function(userRow,userSnapshot){
				expect(userRow.battle_map_id).to.equal(SDK.CosmeticsLookup.BattleMap.Magmar)
				expect(userSnapshot.val().battle_map_id).to.equal(SDK.CosmeticsLookup.BattleMap.Magmar)
			})

			return trxPromise
		})

		it('expect NOT to be able to set a battle map id you dont own', function() {
			return UsersModule.setPortraitId(userId, SDK.CosmeticsLookup.BattleMap.Redrock)
			.then(function(response){
				// should never hit this
				expect(response).to.not.exist
			})
			.catch(function(error){
				// Logger.module("UNITTEST").log(error)
				expect(error).to.exist
				expect(error).to.be.an.instanceof(Errors.NotFoundError)
			})
		})

		it('expect to be able to CLEAR your selected battle map', function() {
			return UsersModule.setBattleMapId(userId, null)
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("users").where('id',userId).first(),
					FirebasePromises.once(rootRef.child("users").child(userId),"value"),
				])
			})
			.spread(function(userRow,userSnapshot){
				expect(userRow.battle_map_id).to.equal(null)
				expect(userSnapshot.val().battle_map_id).to.equal(undefined)
			})
		})

	})

	// describe("setCardBackId()", function() {
	//
	// 	it('expect to be able to set a card back id', function() {
	// 		return UsersModule.setCardBackId(userId, SDK.CosmeticsLookup.CardBack.Normal)
	// 		.then(function(){
	// 			return DuelystFirebase.connect().getRootRef()
	// 		})
	// 		.then(function(rootRef){
	// 			return Promise.all([
	// 				knex("users").where('id',userId).first(),
	// 				FirebasePromises.once(rootRef.child("users").child(userId),"value"),
	// 			])
	// 		})
	// 		.spread(function(userRow,userSnapshot){
	// 			expect(userRow.card_back_id).to.equal(SDK.CosmeticsLookup.CardBack.Normal)
	// 			expect(userSnapshot.val().presence.card_back_id).to.equal(SDK.CosmeticsLookup.CardBack.Normal)
	// 		});
	// 	});
	//
	// 	it('expect NOT to be able to set a card back id you dont own', function() {
	// 		return UsersModule.setCardBackId(userId, SDK.CosmeticsLookup.CardBack.Test)
	// 		.then(function(){
	// 			// should never hit this
	// 			expect(false).to.equal(true);
	// 		})
	// 		.catch(function(error){
	// 			expect(error).to.exist;
	// 			expect(error).to.be.an.instanceof(Errors.NotFoundError);
	// 		});
	// 	});
	//
	// });

	// describe("createUserReferralCode()", function() {
	//
	// 	it('expect NOT to be able to create an invalid (#%^$%#) referral code', function() {
	// 		return UsersModule.createUserReferralCode(userId,'4#$^634')
	// 		.then(function(response){
	// 			expect(response).to.not.exist
	// 		})
	// 		.catch(function(error){
	// 			expect(error).to.exist
	// 			expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError)
	// 		})
	// 	})
	//
	// 	it('expect to be able to create a referral code', function() {
	// 		return UsersModule.createUserReferralCode(userId,'unittestercode')
	// 		.then(function(response){
	// 			expect(response).to.exist
	// 			return DuelystFirebase.connect().getRootRef()
	// 		}).then(function(rootRef){
	// 			return Promise.all([
	// 				knex("referral_codes").where('code','unittestercode').first()
	// 			])
	// 		}).spread(function(referralCodeRow,userSnapshot,indexSnapshot,walletSnapshot){
	// 			expect(referralCodeRow).to.exist
	// 			expect(referralCodeRow.user_id).to.equal(userId)
	// 		})
	// 	})
	//
	// 	it('expect to NOT be able to create a referral code if you already have one', function() {
	// 		return UsersModule.createUserReferralCode(userId,'unittestercode2')
	// 		.then(function(response){
	// 			expect(response).to.not.exist
	// 		}).catch(function(error){
	// 			expect(error).to.exist;
	// 			expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
	// 		})
	// 	})
	//
	// })

	describe("changeUsername()", function() {

		// // after cleanup
		// after(function(){
		// 	this.timeout(25000);
		// 	return UsersModule.changeUsername(userId,'unittest')
		// });

		it('expect NOT to be able to change to an existing username', function() {
			return UsersModule.changeUsername(userId,'unittest')
			.then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
			});
		});

		it('expect to be able to change to an another username first time for FREE', function() {
			return UsersModule.changeUsername(userId,'unittest_2')
			.then(function(response){
				expect(response).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("users").where('id',userId).first(),
					FirebasePromises.once(rootRef.child("users").child(userId),"value"),
					FirebasePromises.once(rootRef.child("username-index").child('unittest_2'),"value"),
				])
			}).spread(function(userRow,userSnapshot,indexSnapshot){
				expect(userRow.username).to.equal('unittest_2')
				expect(userSnapshot.val().username).to.equal('unittest_2')
				expect(indexSnapshot.val()).to.equal(userId)
			})
		});

		it('expect to NOT be able to change again in the same month', function() {
			return UsersModule.changeUsername(userId,'unittest_3')
			.then(function(response){
				expect(response).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
			});
		});

		it('expect to NOT be able to change again a month later with insufficient (0) gold', function() {
			var systemTime = moment().utc().add(1,'month').add(1,'day');
			return UsersModule.changeUsername(userId,'unittest_3',false,systemTime)
			.then(function(response){
				expect(response).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
					Logger.module("UNITTEST").log(error)
				expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
			});
		});

		it('expect to be able to change again a month later by spending 100 GOLD', function() {
			var systemTime = moment().utc().add(1,'month').add(1,'day');
			return knex.transaction(function(tx){
				return InventoryModule.giveUserGold(null,tx,userId,100)
			}).then(function(){
				return UsersModule.changeUsername(userId,'unittest',false,systemTime)
			}).then(function(response){
				expect(response).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("users").where('id',userId).first(),
					FirebasePromises.once(rootRef.child("users").child(userId),"value"),
					FirebasePromises.once(rootRef.child("username-index").child('unittest'),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child('wallet'),"value"),
				])
			}).spread(function(userRow,userSnapshot,indexSnapshot,walletSnapshot){
				expect(userRow.username).to.equal('unittest')
				expect(userRow.wallet_gold).to.equal(0)
				expect(userSnapshot.val().username).to.equal('unittest')
				expect(indexSnapshot.val()).to.equal(userId)
				expect(walletSnapshot.val().gold_amount).to.equal(0)
			})
		});
	});

	describe("changePassword()", function() {

		// after cleanup
		after(function(){
			this.timeout(25000);
			return UsersModule.changePassword(userId,'newpass','hash')
		})

		it('expect to FAIL changing password if you don\'t provide correct existing password', function() {
			return UsersModule.changePassword(userId,'wrongpass','newpass')
			.then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.BadPasswordError);
			});
		});

		it('expect to be able to change your password', function() {
			return UsersModule.changePassword(userId,'hash','newpass')
			.then(function(response){
				expect(response).exist;
			}).then(function(rootRef){
				return Promise.all([
					knex("users").where('id',userId).first()
				])
			}).spread(function(userRow){
				expect(userRow.password).to.exist;
			})
		});
	});

	describe("iterateNewPlayerCoreProgression()", function(){

		it('expect it to iterate from Tutorial (null stage) to TutorialDone', function() {
			return UsersModule.iterateNewPlayerCoreProgression(userId)
			.then(function(response){
				expect(response).to.exist
				expect(response.progressionData.stage).to.equal(SDK.NewPlayerProgressionStageEnum.TutorialDone.key)
				expect(response.questData).to.exist
			})
		})

		it('expect to have correct beginner quests for TutorialDone stage', function() {

			return knex("user_quests").where('user_id',userId).select()
			.then(function(questRows){
				expect(questRows).to.exist
				begginnerQuests = SDK.NewPlayerProgressionHelper.questsForStage(SDK.NewPlayerProgressionStageEnum.TutorialDone)
				begginnerQuestIds = _.map(begginnerQuests,function(q) { return q.id })
				questRowIds = _.map(questRows,function(q) { return q.quest_type_id })
				expect(_.intersection(questRowIds,begginnerQuestIds).length).to.equal(begginnerQuestIds.length)
			})
		})

		it('expect no change if trying to iterate forward from TutorialDone with unfinished quests', function() {

			return UsersModule.iterateNewPlayerCoreProgression(userId)
			.then(function(response){
				expect(response).to.not.exist
				return Promise.all([
					knex("user_new_player_progression").where('user_id',userId).andWhere('module_name',SDK.NewPlayerProgressionModuleLookup.Core).first(),
					knex("user_quests").where('user_id',userId).select()
				])
			}).spread(function(moduleRow,questRows){
				expect(moduleRow.stage).to.equal(SDK.NewPlayerProgressionStageEnum.TutorialDone.key)
				expect(questRows.length).to.equal(1)
			})

		})

		it('expect to move from TutorialDone to FirstPracticeDuelDone if the first quest is complete', function() {

			gs = SDK.GameSession.create()
			gs.setGameType(SDK.GameType.SinglePlayer)
			SDK.GameSetup.setupNewSession(
				gs,
				{
					userId: userId,
					name: "user1",
					deck: SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1),
				},
				{
					userId: generatePushId(),
					name: "user2",
					deck: SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1),
				}
			)
			gs.setIsRunningAsAuthoritative(true)
			gs.executeAction(gs.players[1].actionResign())

			return QuestsModule.updateQuestProgressWithGame(userId,generatePushId(),gs)
			.then(function(result) {
				return UsersModule.iterateNewPlayerCoreProgression(userId)
			}).then(function(response){
				expect(response).to.exist
				return Promise.all([
					knex("user_new_player_progression").where('user_id',userId).andWhere('module_name',SDK.NewPlayerProgressionModuleLookup.Core).first(),
					knex("user_quests").where('user_id',userId).select()
				])
			}).spread(function(moduleRow,questRows){
				expect(moduleRow.stage).to.equal(SDK.NewPlayerProgressionStageEnum.FirstPracticeDuelDone.key)
				expect(questRows.length).to.equal(1)
			})

		})

		it('expect to not change stage but re-generate FirstPracticeDuelDone quests if any are missing for some reason', function() {

			return knex("user_quests").where('user_id',userId).delete()
			.then(function(){
				return UsersModule.iterateNewPlayerCoreProgression(userId)
			}).then(function(response){
				expect(response).to.exist
				return Promise.all([
					knex("user_new_player_progression").where('user_id',userId).andWhere('module_name',SDK.NewPlayerProgressionModuleLookup.Core).first(),
					knex("user_quests").where('user_id',userId).select()
				])
			}).spread(function(moduleRow,questRows){
				expect(moduleRow.stage).to.equal(SDK.NewPlayerProgressionStageEnum.FirstPracticeDuelDone.key)
				expect(questRows.length).to.equal(1)
			})

		})
		// it('expect to moving to FirstGameDone state to generate 2 begginer quests',function(){
		//
		// })

		// it('expect it to iterate from Tutorial (null stage) to TutorialDone', function() {
		// 	return UsersModule.iterateNewPlayerCoreProgression(userId)
		// 	.then(function(response){
		// 		expect(response).to.not.exist;
		// 	})
		// 	.catch(function(error){
		// 		expect(error).to.exist;
		// 		expect(error).to.be.an.instanceof(Errors.BadPasswordError);
		// 	})
		// })

	})

	describe("updateGameCounters()", function() {

		// it('expect LYONAR RANKED game counter to work', function() {
		// 	return UsersModule.updateGameCounters(userId,SDK.Factions.Lyonar,true,"ranked")
		// 	.bind({})
		// 	.then(function(){
		// 		return DuelystFirebase.connect().getRootRef()
		// 	})
		// 	.then(function(rootRef){
		// 		return Promise.all([
		// 			knex("user_game_counters").where({"user_id",userId,"game_type":"ranked"}).first(),
		// 			knex("user_faction_game_counters").where({"user_id":userId,"game_type":"ranked","faction_id":SDK.Factions.Lyonar}).first(),
		// 			FirebasePromises.once(rootRef.child("user-game-counters").child(userId).child("ranked").child('stats'),"value"),
		// 			FirebasePromises.once(rootRef.child("user-game-counters").child(userId).child("ranked").child('factions').child(SDK.Factions.Lyonar),"value"),
		// 		])
		// 	}).spread(function(counterRow,factionCounterRow,counterSnapshot,factionCounterSnapshot){
		// 		expect(counterRow.game_count).to.equal(1);
		// 		expect(counterRow.win_count).to.equal(1);

		// 		expect(factionCounterRow.game_count).to.equal(1);
		// 		expect(factionCounterRow.win_count).to.equal(1);

		// 		expect(counterSnapshot.val().game_count).to.equal(1);
		// 		expect(counterSnapshot.val().win_count).to.equal(1);

		// 		expect(factionCounterSnapshot.val().game_count).to.equal(1);
		// 		expect(factionCounterSnapshot.val().win_count).to.equal(1);
		// 	});
		// });

		it('expect all game counters to work', function() {
			return Promise.map([
					// lyonar
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,true,"ranked"],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,false,"ranked",false,true], // ranked draw
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,true,"ranked"],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,false,"ranked"],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,true,"ranked"],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.AltGeneral,true,"casual"],
					// songhai
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,true,"casual"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,true,"casual"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,true,"ranked"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,true,"ranked"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,false,"casual"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,false,"casual"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,false,"casual"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,true,"ranked"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,true,"ranked"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.General,false,"ranked"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.AltGeneral,false,"ranked"],
					[userId,SDK.Factions.Songhai,SDK.Cards.Faction2.AltGeneral,true,"ranked"],
					// lyonar friendly
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,true,"friendly",false,false,false,moment().utc().add(1,'month')],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,true,"friendly",false,false,false,moment().utc().add(1,'month')],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,true,"friendly",false,false,false,moment().utc().add(1,'month')],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,false,"friendly",false,false,false,moment().utc().add(1,'month')],
					[userId,SDK.Factions.Lyonar,SDK.Cards.Faction1.General,true,"friendly",false,false,false,moment().utc().add(1,'month')]
			], function(input){
				return UsersModule.updateGameCounters.apply(null,input)
			})
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_game_counters").where({"user_id":userId}).select(),
					knex("user_game_faction_counters").where({"user_id":userId}).select(),
					knex("user_game_general_counters").where({"user_id":userId}).select(),
					knex("user_game_season_counters").where({"user_id":userId}).select(),
					FirebasePromises.once(rootRef.child("user-game-counters").child(userId),"value"),
					FirebasePromises.once(rootRef.child("user-game-counters").child(userId),"value"),
				])
			}).spread(function(counterRows,factionCounterRows,generalCounterRows,seasonCounterRows,counterSnapshot,factionCounterSnapshot){

				var rankedCounter = _.find(counterRows,function(row){ return row.game_type == "ranked" })
				var lyonarRankedFactionCounter = _.find(factionCounterRows,function(row){ return row.faction_id == SDK.Factions.Lyonar && row.game_type == "ranked" })
				var songhaiRankedFactionCounter = _.find(factionCounterRows,function(row){ return row.faction_id == SDK.Factions.Songhai && row.game_type == "ranked" })
				var lyonarCasualAltGeneralCounter = _.find(generalCounterRows,function(row){ return row.general_id == SDK.Cards.Faction1.AltGeneral && row.game_type == "casual" })
				var songhaiRankedAltGeneralCounter = _.find(generalCounterRows,function(row){ return row.general_id == SDK.Cards.Faction2.AltGeneral && row.game_type == "ranked" })
				var lyonarFriendlyFactionCounter = _.find(factionCounterRows,function(row){ return row.faction_id == SDK.Factions.Lyonar && row.game_type == "friendly" })
				var songhaiFriendlyFactionCounter = _.find(factionCounterRows,function(row){ return row.faction_id == SDK.Factions.Songhai && row.game_type == "friendly" })

				expect(rankedCounter.game_count).to.equal(12);
				expect(rankedCounter.win_count).to.equal(8);
				expect(rankedCounter.loss_count).to.equal(3);
				expect(rankedCounter.draw_count).to.equal(1);

				expect(lyonarRankedFactionCounter.game_count).to.equal(5);
				expect(lyonarRankedFactionCounter.win_count).to.equal(3);
				expect(lyonarRankedFactionCounter.win_streak).to.equal(1);
				expect(lyonarRankedFactionCounter.top_win_streak).to.equal(2);
				expect(lyonarRankedFactionCounter.draw_count).to.equal(1);

				expect(songhaiRankedFactionCounter.game_count).to.equal(7);
				expect(songhaiRankedFactionCounter.win_count).to.equal(5);
				expect(songhaiRankedFactionCounter.win_streak).to.equal(1);
				expect(songhaiRankedFactionCounter.top_win_streak).to.equal(4);
				expect(songhaiRankedFactionCounter.loss_count).to.equal(2);
				expect(songhaiRankedFactionCounter.loss_streak).to.equal(0);
				expect(songhaiRankedFactionCounter.top_loss_streak).to.equal(2);

				expect(lyonarCasualAltGeneralCounter.game_count).to.equal(1)
				expect(lyonarCasualAltGeneralCounter.win_count).to.equal(1)

				expect(songhaiRankedAltGeneralCounter.game_count).to.equal(2)
				expect(songhaiRankedAltGeneralCounter.win_count).to.equal(1)

				expect(lyonarFriendlyFactionCounter.game_count).to.equal(5);
				expect(lyonarFriendlyFactionCounter.win_count).to.equal(4);
				expect(lyonarFriendlyFactionCounter.top_win_streak).to.equal(3);

				expect(seasonCounterRows.length).to.equal(3);

				// currently nothing gets written to firebase
				// expect(counterSnapshot.val()["ranked"]["stats"].game_count).to.equal(11);
				// expect(counterSnapshot.val()["ranked"]["stats"].win_count).to.equal(8);
				// expect(counterSnapshot.val()["ranked"]["factions"][SDK.Factions.Lyonar].game_count).to.equal(4);
				// expect(counterSnapshot.val()["ranked"]["factions"][SDK.Factions.Lyonar].win_count).to.equal(3);
				// expect(counterSnapshot.val()["ranked"]["factions"][SDK.Factions.Lyonar].top_win_streak).to.equal(2);
			});
		});

	});

	describe("updateUserProgressionWithGameOutcome()", function() {

		var lastProgressionRow;

		var currentWinRewardCount = 0;
		var currentPlayRewardCount = 0;
		var currentDailyWinRewardCount = 0;
		var walletGoldSoFar = 0;
		var lastDailyWinAt = null;
		var gameCount = 0;

		it('expect game counter to work', function() {
			var gameId = generatePushId()
			return UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, gameId)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value"),
					FirebasePromises.once(rootRef.child("user-games").child(userId).child(gameId).child("job_status"),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot,firebaseGameJobStatusSnapshot){
				expect(progressionRow.game_count).to.equal(1);
				expect(progressionRow.loss_count).to.equal(1);
				expect(progressionRow.loss_streak).to.equal(1);

				expect(progressionSnapshot.val().game_count).to.equal(1);
				expect(progressionSnapshot.val().loss_count).to.equal(1);

				lastProgressionRow = progressionRow;
				expect(firebaseGameJobStatusSnapshot.val()["progression"]).to.equal(true)
			})
		});

		it('expect unscored games to record correctly', function() {

			return Promise.all([
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true)
			])
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				// unchanged game count
				expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count);
				// unchanged loss count
				expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count);
				// unchanged loss streak
				expect(progressionRow.loss_streak).to.equal(lastProgressionRow.loss_streak);
				// 3 more unscored games
				expect(progressionRow.unscored_count).to.equal(lastProgressionRow.unscored_count + 3);

				expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count);
				expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count);
				expect(progressionSnapshot.val().unscored_count).to.equal(progressionRow.unscored_count);

				lastProgressionRow = progressionRow

			})
		});

		it('expect draws to record correctly and not progress rewards counters', function() {

			return Promise.all([
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false, true),
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false, true)
			])
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 2)
				expect(progressionRow.draw_count).to.equal(lastProgressionRow.draw_count + 2)
				expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count)
				expect(progressionRow.loss_streak).to.equal(lastProgressionRow.loss_streak)

				expect(progressionSnapshot.val().draw_count).to.equal(progressionRow.draw_count)
				lastProgressionRow = progressionRow
			})
		})

		// it('expect that unscored games did not earn a PLAY reward', function() {

		// 	return knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).select()
		// 	.then(function(rewardRows){
		// 		expect(rewardRows.length).to.equal(0);
		// 	});
		// });

		it('expect that 2 scored daily plays (losses) record correctly and iterate loss streaks', function() {

			return Promise.all([
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false),
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false),
			])
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 2)
				expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count + 2)
				expect(progressionRow.loss_streak).to.equal(progressionRow.loss_count)
				expect(progressionRow.unscored_count).to.equal(lastProgressionRow.unscored_count)

				expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count)
				expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count)
				expect(progressionSnapshot.val().unscored_count).to.equal(progressionRow.unscored_count)

				lastProgressionRow = progressionRow
			});
		});

		// it('expect a first 3 games 100G reward', function() {
		// 	Promise.all([
		// 		knex("user_rewards").where({"user_id":userId,"reward_type":"first 3 games"}).first(),
		// 		knex("users").where('id',userId).first()
		// 	])
		// 	.bind({})
		// 	.spread(function(rewardRow,userRow){
		// 		expect(rewardRow).to.exist;
		// 		expect(userRow.wallet_gold).to.equal(rewardRow.gold);
		// 		this.rewardId = rewardRow.id;
		// 		walletGoldSoFar = userRow.wallet_gold;
		// 		return DuelystFirebase.connect().getRootRef()
		// 	}).then(function(rootRef){
		// 		return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
		// 	}).then(function(rewardSnapshot){
		// 		expect(rewardSnapshot.val()).to.not.exist;
		// 		expect(rewardSnapshot.val().is_unread).to.equal(true);
		// 	});
		// });

		// it('expect a gold reward for 4 daily plays', function() {

		// 	return UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false)
		// 	.bind({})
		// 	.then(function(){
		// 		return Promise.all([
		// 			knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).first(),
		// 			knex("users").where('id',userId).first()
		// 		])
		// 	}).spread(function(rewardRow,userRow){
		// 		expect(rewardRow).to.exist;
		// 		expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold);
		// 		this.rewardId = rewardRow.id;
		// 		walletGoldSoFar = userRow.wallet_gold;
		// 		return DuelystFirebase.connect().getRootRef()
		// 	}).then(function(rootRef){
		// 		return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
		// 	}).then(function(rewardSnapshot){
		// 		expect(rewardSnapshot.val()).to.not.exist;
		// 		expect(rewardSnapshot.val().is_unread).to.equal(true);
		// 		currentPlayRewardCount += 1;
		// 	});
		// });

		it('expect a reward for the first win of the day and loss streak to reset to 0', function() {

			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false)
			.bind({})
			.then(function(){
				return Promise.all([
					knex("user_rewards").where({"user_id":userId,"reward_type":"daily win"}).first(),
					knex("users").where('id',userId).first()
				])
			}).spread(function(rewardRow,userRow){
				expect(rewardRow).to.exist;
				expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold);
				this.rewardId = rewardRow.id;
				walletGoldSoFar = userRow.wallet_gold;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value"),
					FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot,rewardSnapshot){

				expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count + 1)
				expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1)
				expect(progressionRow.loss_streak).to.equal(0)
				expect(progressionRow.last_daily_win_at.valueOf()).to.not.equal(lastDailyWinAt)

				expect(progressionSnapshot.val().win_count).to.equal(lastProgressionRow.win_count + 1)
				expect(progressionSnapshot.val().game_count).to.equal(lastProgressionRow.game_count + 1)
				expect(rewardSnapshot.val()).to.not.exist;
				// expect(rewardSnapshot.val().is_unread).to.equal(true);

				lastDailyWinAt = progressionRow.last_daily_win_at.valueOf();
				lastProgressionRow = progressionRow
				currentDailyWinRewardCount += 1
			});
		});

		it('expect win streaks to count up for wins', function() {

			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value"),
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionSnapshot.val().win_count).to.equal(lastProgressionRow.win_count + 1)
				expect(progressionSnapshot.val().win_streak).to.equal(2)
				expect(progressionSnapshot.val().game_count).to.equal(lastProgressionRow.game_count + 1)
				lastProgressionRow = progressionRow
			})
		})

		it('expect win streaks to be unaffected by draws', function() {

			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false, true)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value"),
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionSnapshot.val().draw_count).to.equal(lastProgressionRow.draw_count + 1)
				expect(progressionSnapshot.val().win_count).to.equal(lastProgressionRow.win_count)
				expect(progressionSnapshot.val().win_streak).to.equal(2)
				expect(progressionSnapshot.val().game_count).to.equal(lastProgressionRow.game_count+1)
				lastProgressionRow = progressionRow
			})
		})

		it('expect to have received a gold reward for 3 wins', function() {

			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false)
			.bind({})
			.then(function () {
				return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false)
			}).then(function(){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					knex("user_rewards").where({"user_id":userId,"reward_type":"win count"}).first(),
					knex("users").where('id',userId).first()
				])
			}).spread(function(progressionRow,rewardRow,userRow){
				expect(rewardRow).to.exist
				expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold)
				this.rewardId = rewardRow.id
				walletGoldSoFar = userRow.wallet_gold
				currentWinRewardCount += 1
				lastProgressionRow = progressionRow
				return DuelystFirebase.connect().getRootRef()
			})
		})

		it('expect only one first win of the day reward', function() {
			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false)
			.bind({})
			.then(function(){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					knex("user_rewards").where({"user_id":userId,"reward_type":"daily win"}).select(),
					knex("users").where('id',userId).first()
				])
			}).spread(function(progressionRow,rewardRows,userRow){
				expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count + 1)
				expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1)
				expect(rewardRows.length).to.equal(1)
				expect(userRow.wallet_gold).to.equal(walletGoldSoFar)
				expect(progressionRow.last_daily_win_at.valueOf()).to.equal(lastDailyWinAt)
				lastProgressionRow = progressionRow
			})
		})

		it('expect casual game losses to not affect win streaks but bump loss streaks', function() {
			return Promise.all([
					UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'casual', false)
				])
				.bind({})
				.then(function(){
					return DuelystFirebase.connect().getRootRef()
				})
				.then(function(rootRef){
					return Promise.all([
						knex("user_progression").where("user_id",userId).first(),
						FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value")
					])
				}).spread(function(progressionRow,progressionSnapshot){
					expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1)
					expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count)
					expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count + 1)
					expect(progressionRow.loss_streak).to.equal(1)
					expect(progressionRow.win_streak).to.equal(lastProgressionRow.win_streak)

					expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count)
					expect(progressionSnapshot.val().win_count).to.equal(progressionRow.win_count)
					expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count)
					expect(progressionSnapshot.val().win_streak).to.equal(progressionRow.win_streak)

					lastProgressionRow = progressionRow
				})
		})

		it('expect win streaks to reset with losses', function() {

			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value"),
				])
			}).spread(function(progressionRow,progressionSnapshot){

				expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count);
				expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count + 1);
				expect(progressionRow.win_streak).to.equal(0);
				expect(progressionRow.loss_streak).to.equal(2);
				expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1);

				expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count);
				expect(progressionSnapshot.val().win_count).to.equal(progressionRow.win_count);
				expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count);
				expect(progressionSnapshot.val().win_streak).to.equal(progressionRow.win_streak);

				gameCount = progressionSnapshot.val().game_count;
				lastProgressionRow = progressionRow
			});
		});

		// it('expect that 8 daily plays have earned TWO play count rewards', function() {

		// 	return Promise.all([
		// 		knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
		// 		knex("users").where('id',userId).first()
		// 	])
		// 	.bind({})
		// 	.spread(function(rewardRows,userRow){
		// 		expect(rewardRows.length).to.equal(2);
		// 		expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
		// 		this.rewardId = rewardRows[0].id;
		// 		walletGoldSoFar = userRow.wallet_gold;
		// 		return DuelystFirebase.connect().getRootRef()
		// 	}).then(function(rootRef){
		// 		return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
		// 	}).then(function(rewardSnapshot){
		// 		expect(rewardSnapshot.val()).to.not.exist;
		// 		expect(rewardSnapshot.val().is_unread).to.equal(true);
		// 		currentPlayRewardCount += 1;
		// 	});
		// });

		//it('expect that 4 daily wins have earned TWO win count rewards', function() {
		//	return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false)
		//	.bind({})
		//	.then(function(){
		//		return Promise.all([
		//			knex("user_progression").where("user_id",userId).first(),
		//			knex("user_rewards").where({"user_id":userId,"reward_type":"win count"}).orderBy('created_at','desc').select(),
		//			knex("users").where('id',userId).first()
		//		])
		//	}).spread(function(progressionRow,rewardRows,userRow){
		//		expect(rewardRows.length).to.equal(2);
		//		expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
		//		this.rewardId = rewardRows[0].id;
		//		walletGoldSoFar = userRow.wallet_gold;
        //
		//		lastProgressionRow = progressionRow
        //
		//		return DuelystFirebase.connect().getRootRef()
		//	}).then(function(rootRef){
		//		return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
		//	}).then(function(rewardSnapshot){
		//		expect(rewardSnapshot.val()).to.not.exist;
		//		// expect(rewardSnapshot.val().is_unread).to.equal(true);
		//		currentWinRewardCount += 1;
		//	});
		//});

		// it('expect to have recieve a first 10 games 100 GOLD reward', function() {

		// 	var allPromises = [];
		// 	if (gameCount < 10) {
		// 		for (var i=gameCount; i<10; i++) {
		// 			allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false))
		// 		}
		// 		gameCount = 10;
		// 	}

		// 	return Promise.all(allPromises)
		// 	.bind({})
		// 	.then(function(){
		// 		return Promise.all([
		// 			knex("user_rewards").where({"user_id":userId,"reward_type":"first 10 games"}).first(),
		// 			knex("users").where('id',userId).first()
		// 		])
		// 	}).spread(function(rewardRow,userRow){
		// 		expect(rewardRow).to.exist;
		// 		expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold);
		// 		this.rewardId = rewardRow.id;
		// 		walletGoldSoFar = userRow.wallet_gold;
		// 		return DuelystFirebase.connect().getRootRef()
		// 	}).then(function(rootRef){
		// 		return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
		// 	}).then(function(rewardSnapshot){
		// 		expect(rewardSnapshot.val()).to.not.exist;
		// 		expect(rewardSnapshot.val().is_unread).to.equal(true);
		// 	});
		// });

		// it('expect a maximum of 5 daily play gold reward', function() {

		// 	// get up to 24 games
		// 	var allPromises = [];
		// 	if (gameCount < 24) {
		// 		for (var i=gameCount; i<24; i++) {
		// 			allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false))
		// 		}
		// 		gameCount = 24;
		// 	}

		// 	//
		// 	UsersModule.DAILY_REWARD_GAME_CAP = 20;

		// 	return Promise.all(allPromises)
		// 	.bind({})
		// 	.then(function(){
		// 		return Promise.all([
		// 			knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
		// 			knex("users").where('id',userId).first()
		// 		])
		// 	}).spread(function(rewardRows,userRow){
		// 		expect(rewardRows.length).to.equal(5);
		// 		expect(userRow.wallet_gold - walletGoldSoFar).to.equal(3*rewardRows[0].gold);
		// 		this.rewardId = rewardRows[0].id;
		// 		walletGoldSoFar = userRow.wallet_gold;
		// 		currentPlayRewardCount = rewardRows.length;
		// 		return DuelystFirebase.connect().getRootRef()
		// 	});
		// });

		// it('expect games after the daily play reward max to reset last reward game/time', function() {

		// 	return knex("user_progression").where("user_id",userId).first()
		// 	.bind({})
		// 	.then(function(progressionRow){
		// 		this.last_awarded_game_count = progressionRow.last_awarded_game_count;
		// 		return UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false);
		// 	}).then(function(){
		// 		return knex("user_progression").where("user_id",userId).first()
		// 	}).then(function(progressionRow){
		// 		expect(progressionRow.last_awarded_game_count).to.equal(this.last_awarded_game_count+1);
		// 	});
		// });

		it('expect first win of the day reward to require 22 hours and not just midnight rollover', function() {

			var systemTime = moment().utc().add(21,'hours');

			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false, false, systemTime)
			.then(function(){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					knex("user_rewards").where({"user_id":userId,"reward_type":"daily win"}).select(),
					knex("users").where('id',userId).first()
				])
			}).spread(function(progressionRow,rewardRows,userRow){
				expect(rewardRows.length).to.equal(1)
				expect(userRow.wallet_gold).to.equal(walletGoldSoFar)
				expect(progressionRow.last_daily_win_at.valueOf()).to.equal(lastDailyWinAt)
				lastProgressionRow = progressionRow
			})
		})

		it('expect that 6 daily wins have earned TWO win count rewards', function() {
			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false)
			.bind({})
			.then(function() {
				return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false, false)
			}).then(function(){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					knex("user_rewards").where({"user_id":userId,"reward_type":"win count"}).orderBy('created_at','desc').select(),
					knex("users").where('id',userId).first()
				])
			}).spread(function(progressionRow,rewardRows,userRow){
				expect(rewardRows.length).to.equal(2)
				expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold)
				this.rewardId = rewardRows[0].id
				walletGoldSoFar = userRow.wallet_gold
				currentWinRewardCount += 1
				lastProgressionRow = progressionRow
			})
		})

		it('expect first win of the day reward to re-activate after 22 hours', function() {

			var systemTime = moment().utc().add(22,'hours');

			return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false, false, systemTime)
			.then(function(){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					knex("user_rewards").where({"user_id":userId,"reward_type":"daily win"}).orderBy('created_at','desc').select(),
					knex("users").where('id',userId).first()
				])
			}).spread(function(progressionRow,rewardRows,userRow){
				expect(rewardRows.length).to.equal(2);
				expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
				expect(progressionRow.last_daily_win_at.valueOf()).to.not.equal(lastDailyWinAt);
				lastDailyWinAt = progressionRow.last_daily_win_at.valueOf()
				currentDailyWinRewardCount = rewardRows.length;
				this.rewardId = rewardRows[0].id;
				walletGoldSoFar = userRow.wallet_gold;
				lastProgressionRow = progressionRow
			})
		});

		it('expect win counter rewards to restart after UTC midnight', function() {

			var systemTime = moment().utc().startOf("day").add(24,'hours').add(1,'second');

			return knex("user_progression").where("user_id",userId).first()
			.bind({})
			.then(function(progressionRow){

				var winsSoFarToday = progressionRow.win_count - progressionRow.last_awarded_win_count;
				gameCount = progressionRow.game_count;
				var allPromises = [];
				for (var i=winsSoFarToday; i<3; i++) {
					allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false, false, systemTime))
					gameCount += 1;
				}
				return Promise.all(allPromises)

			}).then(function(){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					knex("user_rewards").where({"user_id":userId,"reward_type":"win count"}).orderBy('created_at','desc').select(),
					knex("users").where('id',userId).first()
				])
			}).spread(function(progressionRow,rewardRows,userRow){
				expect(rewardRows.length).to.equal(3)
				expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold)
				this.rewardId = rewardRows[0].id
				walletGoldSoFar = userRow.wallet_gold
				currentPlayRewardCount = rewardRows.length
				lastProgressionRow = progressionRow
			})
		})

		//it('expect win counter rewards to give 15 gold for first 14 wins and 5 gold after', function() {
        //
		//	this.timeout(50000);
        //
		//	var systemTime = moment().utc().startOf("day").add(48,'hours').add(2,'second');
		//	var queryTime = moment().utc().startOf("day").add(48,'hours').add(1,'second');
        //
		//	return knex("user_progression").where("user_id",userId).first()
		//	.bind({})
		//	.then(function(progressionRow){
        //
		//		gameCount = progressionRow.game_count;
		//		var extraGame = 0; // progressionRow.win_count % 2;
		//		var allPromises = [];
		//		for (var i=0; i<20 - extraGame; i++) {
		//			var time = moment(systemTime).add(i,'seconds');
		//			allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false, false, time))
		//			gameCount += 1;
		//		}
		//		return Promise.all(allPromises)
        //
		//	}).then(function(){
		//		return Promise.all([
		//			knex("user_progression").where("user_id",userId).first(),
		//			knex("user_rewards").where({"user_id":userId,"reward_type":"win count"}).andWhere('created_at','>',queryTime.toDate()).orderBy('created_at','asc').select(),
		//			knex("users").where('id',userId).first()
		//		])
		//	}).spread(function(progressionRow,rewardRows,userRow){
		//		expect(rewardRows.length).to.equal(10);
		//		for (var i=0; i<7; i++) {
		//			expect(rewardRows[i].gold).to.equal(15);
		//		}
		//		for (var i=7; i<rewardRows.length; i++) {
		//			expect(rewardRows[i].gold).to.equal(5);
		//		}
		//		lastProgressionRow = progressionRow
		//	})
		//})

		// it('expect play counter rewards to restart after UTC midnight', function() {

		// 	var systemTime = moment().utc().startOf("day").add(24,'hours').add(1,'second');

		// 	return knex("user_progression").where("user_id",userId).first()
		// 	.bind({})
		// 	.then(function(progressionRow){

		// 		var gamesSoFarToday = progressionRow.game_count - progressionRow.last_awarded_game_count;
		// 		gameCount = progressionRow.game_count;
		// 		var allPromises = [];
		// 		for (var i=gamesSoFarToday; i<4; i++) {
		// 			allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false, false, systemTime))
		// 			gameCount += 1;
		// 		}
		// 		return Promise.all(allPromises)

		// 	}).then(function(){
		// 		return Promise.all([
		// 			knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
		// 			knex("users").where('id',userId).first()
		// 		])
		// 	}).spread(function(rewardRows,userRow){
		// 		expect(rewardRows.length).to.equal(6);
		// 		expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
		// 		this.rewardId = rewardRows[0].id;
		// 		walletGoldSoFar = userRow.wallet_gold;
		// 		currentPlayRewardCount = rewardRows.length;
		// 		return DuelystFirebase.connect().getRootRef()
		// 	}).then(function(rootRef){
		// 		return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
		// 	}).then(function(rewardSnapshot){
		// 		expect(rewardSnapshot.val()).to.not.exist;
		// 		expect(rewardSnapshot.val().is_unread).to.equal(true);
		// 	});
		// });

		// it('expect no rewards progression for unscored games', function() {

		// 	return Promise.all([
		// 		UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
		// 		UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
		// 		UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
		// 		UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true)
		// 	]).then(function(){
		// 		return Promise.all([
		// 			knex("user_progression").where("user_id",userId).first(),
		// 			knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
		// 			knex("users").where('id',userId).first()
		// 		])
		// 	}).spread(function(progressionRow,rewardRows,userRow){
		// 		expect(rewardRows.length).to.equal(currentPlayRewardCount)
		// 		expect(userRow.wallet_gold).to.equal(walletGoldSoFar);
		// 		expect(progressionRow.unscored_count).to.equal(7);
		// 	});
		// });

		it('expect casual game wins to not affect win streaks', function() {
			return Promise.all([
				UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'casual', false)
			])
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-progression").child(userId).child("game-counter"),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1)
				expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count + 1)
				expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count)
				expect(progressionRow.win_streak).to.equal(lastProgressionRow.win_streak)

				expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count)
				expect(progressionSnapshot.val().win_count).to.equal(progressionRow.win_count)
				expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count)
				expect(progressionSnapshot.val().win_streak).to.equal(progressionRow.win_streak)

				lastProgressionRow = progressionRow
			})
		})
	});

	describe("updateUserProgressionWithGameOutcome() - codex reward", function() {
		this.timeout(50000);
		before(function(){

			return DuelystFirebase.connect().getRootRef()
				.bind({})
				.then(function(fbRootRef){
					return Promise.all([
						FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId)),
						knex("user_codex_inventory").where('user_id',userId).delete(),
						knex('user_progression').where('user_id',userId).delete(),
						knex("user_rewards").where({"user_id":userId}).delete(),
						knex("user_games").where({"user_id":userId}).delete()
					])
						.then(function() {
							var progressionRowData = {
								user_id: userId,
								game_count: 2,
								win_streak: 0,
								loss_count: 0,
								draw_count: 0,
								unscored_count: 0
							};
							return knex('user_progression').insert(progressionRowData)
						})
				})
		});

		it('expect to receive a codex chapter from reaching 3 game count', function() {
			var gameId = generatePushId();
			gameData = {
				game_type: SDK.GameType.Ranked,
				game_id: gameId,
				is_player_1: true,
				opponent_username: "FakeOpponent",
				opponent_id: generatePushId(),
				opponent_faction_id: SDK.Factions.Lyonar,
				opponent_general_id: SDK.Cards.Faction1.General,
				status: SDK.GameStatus.active,
				faction_id: SDK.Factions.Lyonar,
				general_id: SDK.Cards.Faction1.General
			}
			return GamesModule.newUserGame(userId,gameId,gameData)
				.bind({})
				.then(function () {
					return UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, gameId)
				})
				.then(function(){
					return DuelystFirebase.connect().getRootRef()
				})
				.then(function(rootRef){
					return Promise.all([
						knex('user_codex_inventory').where('user_id',userId).select('chapter_id'),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("codex"),"value"),
						knex("user_rewards").where({"user_id":userId,"reward_category":"codex"}).select(),
						knex("user_games").where({"user_id":userId,"game_id":gameId}).first("reward_ids")
					])
				}).spread(function(codexChapterRows,fbCodexCollection,userCodexRewardRows,userGameRow){
					expect(codexChapterRows.length).to.equal(1);
					expect(_.keys(fbCodexCollection.val()).length).to.equal(1);
					expect(userCodexRewardRows).to.exist;
					expect(userGameRow).to.exist;
					expect(userCodexRewardRows.length).to.equal(1);

					var userCodexRewardRow = userCodexRewardRows[0]

					// check that the reward row is in game row rewards
					var codexGameReward = _.find(userGameRow.reward_ids, function(rewardId) {return rewardId == userCodexRewardRow.id});
					expect(codexGameReward).to.exist;
				});
		});
	});

	describe("createFactionProgressionRecord()",function(){

		it('expect a 0 XP Lyonar record when used for Faction 1', function() {
			return UsersModule.createFactionProgressionRecord(userId, SDK.Factions.Lyonar, generatePushId(), 'ranked')
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where({"user_id":userId,faction_id:SDK.Factions.Lyonar}).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(0)
				expect(progressionRow.loss_count).to.equal(0)
				expect(progressionRow.xp).to.equal(0)

				expect(progressionSnapshot.val()).to.exist
				expect(progressionSnapshot.val().game_count).to.equal(0)
				expect(progressionSnapshot.val().loss_count).to.equal(0)
				expect(progressionSnapshot.val().xp).to.equal(0)
			})
		})

	})

	describe("updateUserFactionProgressionWithGameOutcome()", function() {

		it('expect stats counter to count games correctly after 1 loss', function() {

			var gameId = generatePushId()
			return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, gameId, 'ranked', false)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where({"user_id":userId,faction_id:SDK.Factions.Lyonar}).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value"),
					FirebasePromises.once(rootRef.child("user-games").child(userId).child(gameId).child("job_status"),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot,firebaseGameJobStatusSnapshot){
				expect(progressionRow.game_count).to.equal(1);
				expect(progressionRow.loss_count).to.equal(1);
				expect(progressionRow.xp).to.equal(SDK.FactionProgression.lossXP);

				expect(progressionSnapshot.val()).to.exist;
				expect(progressionSnapshot.val().game_count).to.equal(1);
				expect(progressionSnapshot.val().loss_count).to.equal(1);
				expect(progressionSnapshot.val().xp).to.equal(SDK.FactionProgression.lossXP);

				expect(firebaseGameJobStatusSnapshot.val()["faction_progression"]).to.equal(true)
			});
		});

		it('expect level 1 after 1 loss', function() {
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){

				expect(progressionRow.game_count).to.equal(1);
				expect(progressionRow.win_count).to.equal(0);
				expect(progressionRow.xp).to.equal(SDK.FactionProgression.lossXP);
				expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(1);
				expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp,progressionRow.xp_earned)).to.equal(true);

				expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
			});
		});

		it('expect a basic card reward for level 1', function() {

			return Promise.all([
				knex("user_rewards").where({"user_id":userId,"reward_category":"faction xp"}).orderBy('created_at','desc').select(),
			])
			.bind({})
			.spread(function(rewardRows){
				expect(rewardRows.length).to.equal(1);
				expect(rewardRows[0].cards).to.exist;
				expect(rewardRows[0].cards.length).to.be.above(0);
				this.rewardId = rewardRows[0].id;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
			}).then(function(rewardSnapshot){
				expect(rewardSnapshot.val()).to.not.exist;
				// expect(rewardSnapshot.val().cards).to.exist;
				// expect(rewardSnapshot.val().is_unread).to.equal(true);
			});
		});

		it('expect unscored game counter to work', function() {

			return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, generatePushId(), 'ranked', true)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where({"user_id":userId,faction_id:SDK.Factions.Lyonar}).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(1);
				expect(progressionRow.loss_count).to.equal(1);
				expect(progressionRow.unscored_count).to.equal(1);
				expect(progressionRow.xp_earned).to.equal(0);
				expect(progressionRow.xp).to.equal(SDK.FactionProgression.lossXP);

				expect(progressionSnapshot.val()).to.exist;
				expect(progressionSnapshot.val().game_count).to.equal(1);
				expect(progressionSnapshot.val().loss_count).to.equal(1);
				expect(progressionSnapshot.val().unscored_count).to.equal(1);
				expect(progressionSnapshot.val().xp_earned).to.equal(0);
				expect(progressionSnapshot.val().xp).to.equal(SDK.FactionProgression.lossXP);
			});
		});

		it('expect level 2 and 14 XP after 2 scored losses', function() {

			return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, generatePushId(), 'ranked', false)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(2);
				expect(progressionRow.loss_count).to.equal(2);
				expect(progressionRow.win_count).to.equal(0);
				expect(progressionRow.xp).to.equal(2*SDK.FactionProgression.lossXP);
				expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(2);
				expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp,progressionRow.xp_earned)).to.equal(true);

				expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
			});
		});

		it('expect level 3 and 24 XP after 2 losses and 1 win', function() {


			return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(3);
				expect(progressionRow.loss_count).to.equal(2);
				expect(progressionRow.win_count).to.equal(1);
				expect(progressionRow.xp).to.equal(2*SDK.FactionProgression.lossXP + 1*SDK.FactionProgression.winXP);
				expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(3);
				expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp,progressionRow.xp_earned)).to.equal(true);

				expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
			});
		});

		it('expect level 3 and 24 XP after 2 losses and 1 win and 1 more UNSCORED loss', function() {



			return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', true)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(3);
				expect(progressionRow.unscored_count).to.equal(2);
				expect(progressionRow.xp).to.equal(2*SDK.FactionProgression.lossXP + 1*SDK.FactionProgression.winXP);
				expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(3);
				expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp,progressionRow.xp_earned)).to.equal(false);

				expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
			});
		});

		it('expect level 3 and 31 XP after 3 losses and 1 win', function() {

			return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, generatePushId(), 'ranked', false)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(4);
				expect(progressionRow.unscored_count).to.equal(2);
				expect(progressionRow.xp).to.equal(3*SDK.FactionProgression.lossXP + 1*SDK.FactionProgression.winXP);
				expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(3);
				expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp,progressionRow.xp_earned)).to.equal(false);

				expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
			});
		});

		var xp_cap = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
		it('expect max level ' + SDK.FactionProgression.maxLevel + ' to cap at '+xp_cap+ ' XP', function() {

			this.timeout(500000);

			return SyncModule.wipeUserData(userId)
			.bind({})
			.then(function () {
				var times = [];
				var numWinsNeeded = xp_cap / SDK.FactionProgression.winXP;
				for (var i = 0; i < numWinsNeeded; i++)
					times.push(1)
				return Promise.map(times,function(){
					return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false)
				},{concurrency:1})
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Lyonar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.xp).to.equal(xp_cap);
				expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(SDK.FactionProgression.maxLevel);
				expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
			});
		});

		it('expect level 12 and 220 XP after 22 SONGHAI wins', function() {

			this.timeout(100000);

			var allPromises = []
			for (var i=0; i<22; i++)
				allPromises.push( UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Songhai, true, generatePushId(), 'ranked', false) )

			return Promise.all(allPromises)
			.bind({})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where({"user_id":userId,"faction_id":SDK.Factions.Songhai}).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Songhai).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
				expect(progressionRow.game_count).to.equal(22);
				expect(progressionRow.unscored_count).to.equal(0);
				expect(progressionRow.win_count).to.equal(22);
				expect(progressionRow.xp).to.equal(22*SDK.FactionProgression.winXP);
				expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(12);

				expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
			});
		});

		// it('expect to have received an emote reward for level 12', function() {
		//
		// 	return Promise.all([
		// 		knex("user_rewards").where({"user_id":userId,"reward_category":"faction xp"}).orderBy('created_at','desc').select(),
		// 	])
		// 	.bind({})
		// 	.spread(function(rewardRows){
		// 		var foundSonghaiEmoteRow = false;
		// 		_.each(rewardRows,function(rewardRow) {
		// 			if (rewardRow.emotes && rewardRow.emotes[0] == SDK.CosmeticsLookup.Emote.Faction2Taunt) {
		// 				foundSonghaiEmoteRow = true;
		// 				this.rewardId = rewardRow.id
		// 			}
		// 		}.bind(this))
		// 		expect(foundSonghaiEmoteRow).to.equal(true);
		// 		return DuelystFirebase.connect().getRootRef()
		// 	}).then(function(rootRef){
		// 		this.rootRef = rootRef;
		// 		return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
		// 	}).then(function(rewardSnapshot){
		// 		expect(rewardSnapshot.val()).to.not.exist;
		// 		// expect(rewardSnapshot.val().is_unread).to.equal(true);
		//
		// 		// check inventory too
		// 		return Promise.all([
		// 			knex("user_emotes").where({"user_id":userId,"emote_id":SDK.CosmeticsLookup.Emote.Faction2Taunt}).select(),
		// 			FirebasePromises.once(this.rootRef.child("user-inventory").child(userId).child("emotes").child(SDK.CosmeticsLookup.Emote.Faction2Taunt),"value")
		// 		])
		// 	}).spread(function(emoteRows,emoteSnapshot){
		//
		// 		expect(emoteRows.length).to.equal(1);
		// 		expect(emoteSnapshot.val()).to.exist;
		//
		// 	});
		// });

		it('expect to have received a ribbon reward for 100 SONGHAI faction wins', function() {
				return Promise.all([
					knex("user_faction_progression").where({"user_id":userId,"faction_id":SDK.Factions.Songhai}).update({
						win_count:99
					})
				])
				.bind({})
				.spread(function(){
					this.gameId = generatePushId()
					return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Songhai, true, this.gameId, 'ranked')
				}).then(function(){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					this.rootRef = rootRef;
					return Promise.all([
						knex("user_ribbons").where({'user_id':userId,"ribbon_id":"f2_champion"}).select(),
						knex("user_rewards").where({'user_id':userId,'game_id':this.gameId}).select(),
						FirebasePromises.once(rootRef.child("user-ribbons").child(userId),"value"),
					])
				}).spread(function(ribbonRows,rewardRows,ribbonsSnapshot){
					expect(ribbonsSnapshot.val()).to.exist
					expect(ribbonRows.length).to.be.above(0)
					var ribbonId = ribbonRows[0].ribbon_id
					expect(ribbonsSnapshot.val()[ribbonId]).to.exist
					expect(ribbonsSnapshot.val()[ribbonId].count).to.equal(1)
					expect(rewardRows.length).to.be.above(0)
					expect(rewardRows[0].ribbons.length).to.be.above(0)
					expect(rewardRows[0].ribbons[0]).to.equal(ribbonId)
				})
		})

		it('expect to NOT have received a MAGMAR ribbon reward for SINGLE PLAYER games', function() {
			return Promise.all([
				knex("user_faction_progression").where({"user_id":userId,"faction_id":SDK.Factions.Magmar}).update({
					win_count:99
				})
			])
			.bind({})
			.spread(function(){
				this.gameId = generatePushId()
				return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Magmar, true, this.gameId, SDK.GameType.SinglePlayer)
			}).then(function(){
				return Promise.all([
					knex("user_ribbons").where({'user_id':userId,"ribbon_id":"f5_champion"}).select()
				])
			}).spread(function(ribbonRows,rewardRows,ribbonsSnapshot){
				expect(ribbonRows.length).to.equal(0)
			})
		})

		it('expect to NOT have received a MAGMAR ribbon reward if user record is marked as bot', function() {
			return Promise.all([
				knex("users").update({"is_bot":true}).where('id',userId),
				knex("user_faction_progression").where({"user_id":userId,"faction_id":SDK.Factions.Magmar}).update({
					win_count:99
				})
			])
			.bind({})
			.spread(function(){
				this.gameId = generatePushId()
				return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Magmar, true, this.gameId, SDK.GameType.Ranked)
			}).then(function(){
				return Promise.all([
					knex("user_ribbons").where({'user_id':userId,"ribbon_id":"f3_champion"}).select()
				])
			}).spread(function(ribbonRows,rewardRows,ribbonsSnapshot){
				expect(ribbonRows.length).to.equal(0)
				return Promise.resolve()
			}).then(function(){
				return knex("users").update({"is_bot":false}).where('id',userId)
			})
		})

		it('expect to earn Vanar Faction XP up to level 10 with SINGLE PLAYER games', function() {

				this.timeout(50000)

				var allPromises = [];
				// levels are indexed from 0 so we check 9 here instead of 10
				var xpToLevel10 = SDK.FactionProgression.totalXPForLevel(9);
				var numGamesToLevel10 = xpToLevel10 / SDK.FactionProgression.winXP;
				for (var i=0; i<numGamesToLevel10; i++) {
					allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.SinglePlayer, false))
				}

				return Promise.all(allPromises)
				.bind({})
				.then(function(){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_faction_progression").where({"user_id":userId,"faction_id":SDK.Factions.Vanar}).first(),
						FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Vanar).child('stats'),"value")
					])
				}).spread(function(progressionRow,progressionSnapshot){
						expect(progressionRow.game_count).to.equal(numGamesToLevel10)
						expect(progressionRow.unscored_count).to.equal(0)
						expect(progressionRow.win_count).to.equal(numGamesToLevel10)
						expect(progressionRow.single_player_win_count).to.equal(numGamesToLevel10)
						expect(progressionRow.xp).to.equal(xpToLevel10)
						// levels are indexed from 0 so we check 9 here instead of 10
						expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(9)
						expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp)
				})
		})

		it('expect to NOT earn faction XP after level 10 with SINGLE PLAYER games', function() {
			return knex("user_faction_progression").where("user_id",userId).first()
			.bind({})
			.then(function(row){
				this.previousRow = row
				return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, false, generatePushId(), SDK.GameType.SinglePlayer, false)
			}).then(function(result){
				expect(result).to.not.exist
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).first()
				])
			}).spread(function(progressionRow){
				expect(progressionRow.xp).to.equal(this.previousRow.xp)
				expect(progressionRow.level).to.equal(this.previousRow.level)
				expect(progressionRow.updated_at.valueOf()).to.equal(this.previousRow.updated_at.valueOf())
			})
		})

		it('expect to earn faction XP in casual games', function() {
			return knex("user_faction_progression").where("user_id",userId).andWhere("faction_id",SDK.Factions.Vanar).first()
				.bind({})
				.then(function(row){
					this.previousRow = row;
					return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.Casual, false)
				}).then(function(result){
					return Promise.all([
						knex("user_faction_progression").where("user_id",userId).andWhere("faction_id",SDK.Factions.Vanar).first()
					]);
				}).spread(function(progressionRow){
					if (this.previousRow == null) {
						expect(progressionRow).to.exist;
						expect(progressionRow.xp).to.not.equal(0);
					} else {
						expect(progressionRow.xp).to.not.equal(this.previousRow.xp);
						expect(progressionRow.updated_at.valueOf()).to.not.equal(this.previousRow.updated_at.valueOf());
					}

				});
		});

		it('expect game counter to correctly account for DRAW games', function(){
			return knex("user_faction_progression").where("user_id",userId).andWhere("faction_id",SDK.Factions.Vetruvian).first()
			.bind({})
			.then(function(row){
				this.previousRow = row;
				return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vetruvian, false, generatePushId(), SDK.GameType.Casual, false, true)
			}).then(function(result){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).andWhere("faction_id",SDK.Factions.Vetruvian).first()
				]);
			}).spread(function(progressionRow){
				expect(progressionRow.game_count).to.equal(1)
				expect(progressionRow.draw_count).to.equal(1)
				expect(progressionRow.loss_count).to.equal(0)
				expect(progressionRow.win_count).to.equal(0)
			})
		})

		it('expect to earn faction XP for draws', function() {
			return knex("user_faction_progression").where("user_id",userId).andWhere("faction_id",SDK.Factions.Vetruvian).first()
			.bind({})
			.then(function(row){
				this.previousRow = row;
				return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vetruvian, true, generatePushId(), SDK.GameType.Casual, false, true)
			}).then(function(result){
				return Promise.all([
					knex("user_faction_progression").where("user_id",userId).andWhere("faction_id",SDK.Factions.Vetruvian).first()
				]);
			}).spread(function(progressionRow){
				if (this.previousRow == null) {
					expect(progressionRow).to.exist;
				} else {
					expect(progressionRow.xp).to.be.above(this.previousRow.xp);
				}
				expect(progressionRow.updated_at.valueOf()).to.not.equal(this.previousRow.updated_at.valueOf());
			})
		})

		it('expect to earn faction XP in FRIENDLY games', function() {
			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function(){
					return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.Friendly, false)
				}).then(function(result){
					return Promise.all([
						knex("user_faction_progression").where("user_id",userId).andWhere("faction_id",SDK.Factions.Vanar).first()
					])
				}).spread(function(progressionRow){
					expect(progressionRow).to.exist
					expect(progressionRow.xp).to.not.equal(0)
					expect(progressionRow.friendly_win_count).to.equal(1)
				})
		});

		it('expect to earn faction XP only up to level 10 with FRIENDLY games', function() {

			this.timeout(50000)

			// levels are indexed from 0 so we check 9 here instead of 10
			var xpToLevel10 = SDK.FactionProgression.totalXPForLevel(9);
			var numGamesToLevel10 = xpToLevel10 / SDK.FactionProgression.winXP;

			return SyncModule.wipeUserData(userId)
			.bind({})
			.then(function(){
				var allPromises = [];
				for (var i=0; i<numGamesToLevel10 + 2; i++) {
					allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.Friendly, false))
				}
				return Promise.all(allPromises)
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_faction_progression").where({"user_id":userId,"faction_id":SDK.Factions.Vanar}).first(),
					FirebasePromises.once(rootRef.child("user-faction-progression").child(userId).child(SDK.Factions.Vanar).child('stats'),"value")
				])
			}).spread(function(progressionRow,progressionSnapshot){
					expect(progressionRow.game_count).to.equal(numGamesToLevel10)
					expect(progressionRow.unscored_count).to.equal(0)
					expect(progressionRow.win_count).to.equal(numGamesToLevel10)
					expect(progressionRow.friendly_win_count).to.equal(numGamesToLevel10)
					expect(progressionRow.xp).to.equal(xpToLevel10)
					// levels are indexed from 0 so we check 9 here instead of 10
					expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(9)
					expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp)
			})
		})

		it('expect to NOT have received a ribbon reward for FRIENDLY games', function() {
			return SyncModule.wipeUserData(userId)
			.bind({})
			.then(function(){
				return UsersModule.createFactionProgressionRecord(userId, SDK.Factions.Magmar, generatePushId(), SDK.GameType.Ranked)
			}).then(function(){
				return knex("user_faction_progression").where({"user_id":userId,"faction_id":SDK.Factions.Magmar}).update({
					win_count:99
				})
			}).then(function(updateCount){
				expect(updateCount).to.equal(1)
				this.gameId = generatePushId()
				return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Magmar, true, this.gameId, SDK.GameType.Friendly)
			}).then(function(){
				return Promise.all([
					knex("user_ribbons").where({'user_id':userId}).select()
				])
			}).spread(function(ribbonRows,rewardRows,ribbonsSnapshot){
				expect(ribbonRows.length).to.equal(0)
			})
		})

		it('expect to earn a prismatic faction basic card at level 13', function () {

			this.timeout(250000);

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					var xpToLevel = SDK.FactionProgression.totalXPForLevel(13);
					var numWinsToLevel = xpToLevel / SDK.FactionProgression.winXP;
					var allPromises = [];
					for (var i = 0; i < numWinsToLevel; i++)
						allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false))
					return Promise.all(allPromises)
				}).then(function () {
					return knex("user_rewards").where({"user_id": userId, "reward_category": "faction xp"}).orderBy('created_at', 'desc');
				}).then(function (rewardRows) {
					var cardId = null;
					var rewardId = null;
					_.each(rewardRows, function (rewardRow) {
						if (rewardRow.cards != null && SDK.Cards.getIsPrismaticCardId(rewardRow.cards[0])) {
							expect(cardId).to.equal(null);
							cardId = rewardRow.cards[0];
							rewardId = rewardRow.id;
						}
					});
					expect(cardId).to.not.equal(null);
					this.cardId = cardId;
					this.rewardId = rewardId;
					return DuelystFirebase.connect().getRootRef()
				}).then(function (rootRef) {
					return Promise.all([
						knex.select().from("user_cards").where({'user_id': userId, "card_id": this.cardId}),
						knex.first().from("user_card_collection").where({'user_id': userId}),
						FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId), "value"),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection").child(this.cardId), "value")
					])
				}).spread(function (cardCountRow, cardCollection, rewardSnapshot, fbCardEntry) {
					expect(cardCountRow[0].is_new).to.equal(true);
					expect(cardCountRow[0].is_unread).to.equal(true);
					expect(cardCollection.cards[this.cardId]).to.exist;
					expect(cardCollection.cards[this.cardId].is_new).to.equal(true);
					expect(cardCollection.cards[this.cardId].is_unread).to.equal(true);
					expect(rewardSnapshot.val()).to.not.exist;
					// expect(rewardSnapshot.val().cards).to.exist;
					// expect(rewardSnapshot.val().is_unread).to.equal(true);
					expect(fbCardEntry.val().is_new).to.equal(true);
					expect(fbCardEntry.val().is_unread).to.equal(true);
				});
		});

		it('expect to earn a prismatic neutral basic card at level 17', function () {

			this.timeout(250000);

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					var xpToLevel = SDK.FactionProgression.totalXPForLevel(17);
					var numWinsToLevel = xpToLevel / SDK.FactionProgression.winXP;
					var allPromises = [];
					for (var i = 0; i < numWinsToLevel; i++)
						allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false))
					return Promise.all(allPromises)
				}).then(function () {
					return knex("user_rewards").where({"user_id": userId, "reward_category": "faction xp"}).orderBy('created_at', 'desc');
				}).then(function (rewardRows) {
					var cardId = null;
					var rewardId = null;
					_.each(rewardRows, function (rewardRow) {
						if (rewardRow.cards != null && SDK.Cards.getIsPrismaticCardId(rewardRow.cards[0])) {
							var card = SDK.CardFactory.cardForIdentifier(rewardRow.cards[0], SDK.GameSession.create());
							expect(card).to.exist;
							if (card.getFactionId() === SDK.Factions.Neutral) {
								expect(cardId).to.equal(null);
								cardId = rewardRow.cards[0];
								rewardId = rewardRow.id;
							}
						}
					});
					expect(cardId).to.not.equal(null);
					this.cardId = cardId;
					this.rewardId = rewardId;
					return DuelystFirebase.connect().getRootRef()
				}).then(function (rootRef) {
					return Promise.all([
						knex.select().from("user_cards").where({'user_id': userId, "card_id": this.cardId}),
						knex.first().from("user_card_collection").where({'user_id': userId}),
						FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId), "value"),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection").child(this.cardId), "value")
					])
				}).spread(function (cardCountRow, cardCollection, rewardSnapshot, fbCardEntry) {
					expect(cardCountRow[0].is_new).to.equal(true);
					expect(cardCountRow[0].is_unread).to.equal(true);
					expect(cardCollection.cards[this.cardId]).to.exist;
					expect(cardCollection.cards[this.cardId].is_new).to.equal(true);
					expect(cardCollection.cards[this.cardId].is_unread).to.equal(true);
					expect(rewardSnapshot.val()).to.not.exist;
					// expect(rewardSnapshot.val().cards).to.exist;
					// expect(rewardSnapshot.val().is_unread).to.equal(true);
					expect(fbCardEntry.val().is_new).to.equal(true);
					expect(fbCardEntry.val().is_unread).to.equal(true);
				});
		});

		it('expect to earn a prismatic general card at max level', function () {

			this.timeout(500000);

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					var xpToLevel = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
					var numWinsToLevel = xpToLevel / SDK.FactionProgression.winXP;
					var times = [];
					for (var i = 0; i < numWinsToLevel; i++)
						times.push(1)
					return Promise.map(times,function(){
						return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false)
					},{concurrency:1})
				}).then(function () {
					return knex("user_rewards").where({"user_id": userId, "reward_category": "faction xp"}).orderBy('created_at', 'desc');
				}).then(function (rewardRows) {
					var cardId = null;
					var rewardId = null;
					_.each(rewardRows, function (rewardRow) {
						if (rewardRow.cards != null && SDK.Cards.getIsPrismaticCardId(rewardRow.cards[0]) && SDK.Cards.getBaseCardId(rewardRow.cards[0]) === SDK.Cards.Faction1.General) {
							expect(cardId).to.equal(null);
							cardId = rewardRow.cards[0];
							rewardId = rewardRow.id;
						}
					});
					expect(cardId).to.not.equal(null);
					this.cardId = cardId;
					this.rewardId = rewardId;
					return DuelystFirebase.connect().getRootRef()
				}).then(function (rootRef) {
					return Promise.all([
						knex.select().from("user_cards").where({'user_id': userId, "card_id": this.cardId}),
						knex.first().from("user_card_collection").where({'user_id': userId}),
						FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId), "value"),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection").child(this.cardId), "value")
					])
				}).spread(function (cardCountRow, cardCollection, rewardSnapshot, fbCardEntry) {
					expect(cardCountRow[0].is_new).to.equal(true);
					expect(cardCountRow[0].is_unread).to.equal(true);
					expect(cardCollection.cards[this.cardId]).to.exist;
					expect(cardCollection.cards[this.cardId].is_new).to.equal(true);
					expect(cardCollection.cards[this.cardId].is_unread).to.equal(true);
					expect(rewardSnapshot.val()).to.not.exist;
					// expect(rewardSnapshot.val().cards).to.exist;
					// expect(rewardSnapshot.val().is_unread).to.equal(true);
					expect(fbCardEntry.val().is_new).to.equal(true);
					expect(fbCardEntry.val().is_unread).to.equal(true);
				});
		});

	});

	describe("isAllowedToUseDeck()", function() {

		before(function(){
			this.timeout(5000);
			// clear any existing data
			return DuelystFirebase.connect().getRootRef()
			.then(function(rootRef){
				return SyncModule.wipeUserData(userId)
			});
		});

		it('expect player to be allowed to use a SONGHAI starter level 0 deck in RANKED play', function() {
			var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2,0);
			return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})
		});

		it('expect a player to NOT be able to use a full SONGHAI starter deck at level 0', function() {

			this.timeout(25000);
			return SyncModule.wipeUserData(userId)
			.bind({})
			.then(function () {
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked',null, true)
			}).then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				Logger.module("UNITTEST").log(error);
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});
		});

		it('expect a player to NOT be able to use a full LYONAR starter deck with 10 xp', function() {

			this.timeout(25000);
			return SyncModule.wipeUserData(userId)
			.bind({})
			.then(function () {
				return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Lyonar, xp: 10});
			}).then(function(){
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1,SDK.FactionProgression.maxLevel);
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true);
			})
			.then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});
		});

		it('expect a player to be able to use a full SONGHAI starter deck at level 10', function() {

			var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);

			return knex("user_faction_progression").insert({user_id:userId,faction_id:SDK.Factions.Songhai,xp:maxXp})
			.then(function(){
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true);
			})
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})
		});

		it('expect a player to NOT be able to use a deck with more than 40 cards', function() {
			// extra large starter deck
			var deck = [].concat(
				SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0),
				SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0).slice(1)
			);
			// add a non-basic card the user does not own
			deck.push({id: SDK.Cards.Neutral.RedSynja});
			return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
				.then(function(response){
					expect(response).to.not.exist;
				})
				.catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidDeckError);
				});
		});

		it('expect a player to NOT be able to use a deck with more than 40 basics', function() {

			var deck = [].concat(
				SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0),
				SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0).slice(1),
				SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0).slice(1)
			);
			return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
				.then(function(response){
					expect(response).to.not.exist;
				})
				.catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidDeckError);
				});
		});

		it('expect a player to NOT be able to use cards they don\'t own', function() {

			return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			.then(function (factionProgressionRow) {
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			}).then(function() {
				// starter deck
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last card
				deck.pop();
				// add a card the user does not own
				deck.push({id: SDK.Cards.Neutral.RedSynja})

				return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked',null, true)
			})
			.then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});
		});

		it('expect a player to be able to use a deck with cards they own', function() {
			var txPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserSpirit(txPromise,tx,userId,2000)
			}).then(function(){
				return InventoryModule.craftCard(userId,SDK.Cards.Neutral.RedSynja)
			}).then(function() {
				return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			}).then(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			})
			.then(function() {
						// starter deck
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last card
				deck.pop();
				// add the card we just crafted
				deck.push({ id:SDK.Cards.Neutral.RedSynja })

				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true);
			})
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})

			return txPromise;
		});

		it('expect a player to NOT be able to use a deck with cards that are not yet available', function() {

			var txPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserSpirit(txPromise,tx,userId,2000)
			}).then(function(){
				return InventoryModule.craftCard(userId,SDK.Cards.Neutral.ChaosElemental)
			}).then(function() {
				return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			}).then(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			}).then(function(){
				var chaosElemental = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(c) { return c.getId() === SDK.Cards.Neutral.ChaosElemental });
				chaosElemental.setAvailableAt(moment().utc().add(1,'day'));

				// starter deck
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last card
				deck.pop()
				// add the card we just crafted
				deck.push({ id:SDK.Cards.Neutral.ChaosElemental });

				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			}).then(function(response){
				expect(response).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
				expect(error.message).to.equal("Deck has cards that are not yet available");
			})

			return txPromise
		})

		it('expect a player to be able to use a deck with cards that have become available', function() {

			var txPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserSpirit(txPromise,tx,userId,2000)
			}).then(function(){
				return InventoryModule.craftCard(userId,SDK.Cards.Neutral.FirstSwordofAkrane)
			}).then(function() {
				return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			}).then(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			}).then(function(){
				var firstSwordofAkrane = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(c) { return c.getId() === SDK.Cards.Neutral.FirstSwordofAkrane })
				firstSwordofAkrane.setAvailableAt(moment().utc().subtract(1,'day'));

				// starter deck
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel)
				// remove last card
				deck.pop()
				// add the card we just crafted
				deck.push({id: SDK.Cards.Neutral.FirstSwordofAkrane})
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			})
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})
			.catch(function(error){
				//Logger.module("UNITTEST").log(error)
				expect(error).to.not.exist;
			})

			return txPromise
		});

		it('expect to not be able to enter matchmaking with cross faction cards', function () {

			var cardId = SDK.Cards.Faction1.WindbladeAdept;

			var trxPromise = knex.transaction(function(tx){
				return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			}).then(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			}).then(function () {
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last card
				deck.pop();
				// add the cross faction cards
				deck.push({id: cardId});
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			}).then(function(response){
				expect(response).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});

			return trxPromise;
		});

		it('expect to not be able to enter matchmaking with a prismatic basic that I dont own', function () {

			// use prismatic basic NOT awarded by songhai progression
			var cardId = SDK.Cards.Neutral.KomodoCharger;
			var prismaticCardId = cardId + SDK.Cards.Prismatic;

			var trxPromise = knex.transaction(function(tx){
				return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			}).then(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			}).then(function () {
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last card
				deck.pop();
				// add the prismatic cards
				deck.push({id: prismaticCardId});
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			}).then(function(response){
				expect(response).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});

			return trxPromise;
		});

		it('expect to be able to enter matchmaking with a prismatic basic that I own', function () {

			// use prismatic basic awarded by songhai progression
			var cardId = SDK.Cards.Neutral.ValeHunter;
			var prismaticCardId = cardId + SDK.Cards.Prismatic;

			var trxPromise = knex.transaction(function(tx){
				return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			}).then(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			}).then(function () {
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last card
				deck.pop();
				// add the prismatic cards
				deck.push({id: prismaticCardId});
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			})
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})
			.catch(function(error){
				expect(error).to.not.exist;
			});

			return trxPromise;
		});

		it('expect to not be able to enter matchmaking with more than a combined 3 normal + prismatic copies of a card', function () {

			var cardId = SDK.Cards.Neutral.TwilightMage;
			var prismaticCardId = cardId + SDK.Cards.Prismatic;

			var trxPromise = knex.transaction(function(tx){
				return Promise.all([
					knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first(),
					InventoryModule.giveUserCards(trxPromise,tx,userId,[
						cardId, cardId, cardId,
						prismaticCardId, prismaticCardId, prismaticCardId
					])
				]);
			}).spread(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			}).then(function () {
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last 3 cards
				deck.pop();
				deck.pop();
				deck.pop();
				// add the normal and prismatic cards
				deck.push({id: cardId});
				deck.push({id: prismaticCardId});
				deck.push({id: prismaticCardId});
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			})
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})
			.catch(function(error){
				expect(error).to.not.exist;
			})
			.then(function(){
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove last 4 cards
				deck.pop();
				deck.pop();
				deck.pop();
				deck.pop();
				// add the normal and prismatic cards
				deck.push({id: cardId});
				deck.push({id: cardId});
				deck.push({id: prismaticCardId});
				deck.push({id: prismaticCardId});
				return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
			})
			.then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});

			return trxPromise;
		});

		it('expect to not be able to enter matchmaking with a skin that I dont own', function () {
			var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1);
			var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2);
			// remove general (first card)
			deck.shift();
			// add the skinned card
			deck.unshift({id: skinnedCardId});
			return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked',null, true)
			.then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});
		});

		it('expect to not be able to enter matchmaking with a prismatic skin that I dont own', function () {
			var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1);
			var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2);
			// remove general (first card)
			deck.shift();
			// add the skinned card
			deck.unshift({id: skinnedCardId});
			return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked',null, true)
			.then(function(response){
				expect(response).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});
		});

		it('expect to be able to enter matchmaking with a skin that I own', function () {
			var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1);
			var skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCosmeticId(trxPromise, tx, userId, skinId, "unit test", generatePushId());
			})
			.then(function () {
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2);
				// remove general (first card)
				deck.shift();
				// add the skinned card
				deck.unshift({id: skinnedCardId});
				return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked',null, true)
			})
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})
			.catch(function(error){
				expect(error).to.not.exist;
			});

			return trxPromise;
		});

		it('expect to be able to enter matchmaking with a prismatic skin that I own', function () {
			var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1);
			var skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

			var trxPromise = knex.transaction(function(tx) {
				return InventoryModule.giveUserCosmeticId(trxPromise, tx, userId, skinId, "unit test", generatePushId());
			})
			.then(function (){
				return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).first()
			})
			.then(function (factionProgressionRow){
				var maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
				if (factionProgressionRow == null) {
					return knex("user_faction_progression").insert({user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp});
				} else if (factionProgressionRow.xp != maxXp) {
					return knex("user_faction_progression").where({'user_id': userId, 'faction_id': SDK.Factions.Songhai}).update({xp: maxXp});
				} else {
					return Promise.resolve();
				}
			})
			.then(function () {
				var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
				// remove general (first card)
				deck.shift();
				// add the skinned card
				deck.unshift({id: skinnedCardId});
				return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked',null, true)
			})
			.spread(function(cardsAreValid, skinsAreValid){
				expect(cardsAreValid).to.equal(true);
				expect(skinsAreValid).to.equal(true);
			})
			.catch(function(error){
				expect(error).to.not.exist;
			});

			return trxPromise;
		});

	})


	// describe("tipAnotherPlayerForGame",function(){

	// 	var opponentId = null;

	// 	// before cleanup to check if user already exists and delete
	// 	before(function(){
	// 		this.timeout(25000);
	// 		Logger.module("UNITTEST").log("creating user");
	// 		return UsersModule.createNewUser('unit-test-opponent@counterplay.co','unittestopponent','hash','kumite14')
	// 		.then(function(userIdCreated){
	// 			Logger.module("UNITTEST").log("created user ",userIdCreated);
	// 			opponentId = userIdCreated;
	// 		}).catch(Errors.AlreadyExistsError,function(error){
	// 			Logger.module("UNITTEST").log("existing user");
	// 			return UsersModule.userIdForEmail('unit-test-opponent@counterplay.co').then(function(userIdExisting){
	// 				Logger.module("UNITTEST").log("existing user retrieved",userIdExisting);
	// 				opponentId = userIdExisting;
	// 				return SyncModule.wipeUserData(userIdExisting);
	// 			}).then(function(){
	// 				Logger.module("UNITTEST").log("existing user data wiped",opponentId);
	// 			})
	// 		}).then(function(){

	// 		});
	// 	});

	// 	it('expect to be able to tip another player after a game', function() {
	// 		var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2,0);
	// 		return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
	// 		.then(function(val){
	// 			expect(val).to.equal(true);
	// 		})
	// 	});

	// })

	// region ftue tests
	describe("setNewPlayerFeatureProgression()", function() {

		before(function(){
			this.timeout(5000);
			// clear any existing data
			return DuelystFirebase.connect().getRootRef()
				.then(function(rootRef){
					return SyncModule.wipeUserData(userId)
				});
		});

		it('expect to not be able to set core module to a junk stage value', function() {
			return UsersModule.setNewPlayerFeatureProgression(userId,"core","this_is_a_non_existant_core_stage_value")
				.then(function(response){
					expect(response).to.not.exist;
				}).catch(Errors.BadRequestError,function(e) {
					// Expect this type of error to happen
					expect(e).to.exist;
				}).catch(function (e) {
					// Should be the above error, not a generic error
					expect(e).to.not.exist
				})
		});

		it('expect to not be able to set core module to lower stage value', function() {
			return UsersModule.setNewPlayerFeatureProgression(userId,"core",NewPlayerProgressionStageEnum.TutorialDone)
				.then(function(response){
					UsersModule.setNewPlayerFeatureProgression(userId,"core",NewPlayerProgressionStageEnum.Tutorial)
				}).then(function(response){
					expect(response).to.not.exist;
				}).catch(Errors.BadRequestError,function(e) {
					// Expect this type of error to happen
					expect(e).to.exist;
				}).catch(function (e) {
					// Should be the above error, not a generic error
					expect(e).to.not.exist
				})
		});

		it('expect to generate correct quests for all FTUE stages', function() {
			return Promise.each(NewPlayerProgressionStageEnum.enums,function (enumStage) {
				return knex("user_quests").delete().where('user_id',userId)
					.then(function () {
						return UsersModule.setNewPlayerFeatureProgression(userId, SDK.NewPlayerProgressionModuleLookup.Core, enumStage.key)
					}).then(function () {
						return QuestsModule.generateBeginnerQuests(userId)
					}).then(function () {
						return knex("user_quests").select().where('user_id',userId)
					}).then(function (userQuestRows) {
						var beginnerQuests = SDK.NewPlayerProgressionHelper.questsForStage(enumStage) || []
						expect(beginnerQuests.length).to.equal(userQuestRows.length)

						_.each(beginnerQuests,function (beginnerQuest) {
							var existingQuestRow = _.find(userQuestRows, function (userQuestRow) { return userQuestRow.quest_type_id == beginnerQuest.getId()})
							expect(existingQuestRow).to.exist;
						})
					}).catch(Errors.NoNeedForNewBeginnerQuestsError,function(e) {
						// This is valid if no beginner quests were needed
						var beginnerQuests = SDK.NewPlayerProgressionHelper.questsForStage(enumStage) || []
						expect(beginnerQuests.length).to.equal(0)
					})
			}.bind(this),{concurrency: 1})
		});

		// Not yet implemented
		//it('expect to not be able to skip multiple core module stages', function() {
		//	return SyncModule.wipeUserData(userId)
		//		.then(function(response){
		//			return UsersModule.setNewPlayerFeatureProgression(userId,"core",NewPlayerProgressionStageEnum.Tutorial)
		//		}).then(function(response){
		//			return UsersModule.setNewPlayerFeatureProgression(userId,"core",NewPlayerProgressionStageEnum.FirstGameDone)
		//		}).then(function(response){
		//			expect(response).to.not.exist;
		//		}).catch(Errors.BadRequestError,function(e) {
		//			// Expect this type of error to happen
		//			expect(e).to.exist;
		//		}).catch(function (e) {
		//			// Should be the above error, not a generic error
		//			expect(e).to.not.exist
		//		})
		//});
	});

	// endregion ftue tests

});
