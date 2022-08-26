var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var GamesModule = require('../../../server/lib/data_access/games.coffee');
var GiftCrateModule = require('../../../server/lib/data_access/gift_crate.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var _ = require('underscore');
var SDK = require('../../../app/sdk.coffee');
var GiftCrateFactory = require('../../../app/sdk/giftCrates/giftCrateFactory')
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex')
var NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum')

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("gift crates module", function() {

	var userId = null;
	this.timeout(25000);

	// before cleanup to check if user already exists and delete
	before(function(){
		this.timeout(25000);
		// Logger.module("UNITTEST").log("creating user");
		return UsersModule.createNewUser('unit-test@counterplay.co','unittest','hash','kumite14')
		.then(function(userIdCreated){
			// Logger.module("UNITTEST").log("created user ",userIdCreated);
			userId = userIdCreated;
		}).catch(Errors.AlreadyExistsError,function(error){
			// Logger.module("UNITTEST").log("existing user");
			return UsersModule.userIdForEmail('unit-test@counterplay.co').then(function(userIdExisting){
				Logger.module("UNITTEST").log("existing user retrieved",userIdExisting);
				userId = userIdExisting;
				return SyncModule.wipeUserData(userIdExisting);
			}).then(function(){
				// Logger.module("UNITTEST").log("existing user data wiped",userId);
			})
		}).catch(function(error){
			Logger.module("UNITTEST").log("unexpected error: ",error)
			throw error
		})
	})

	describe("unlockGiftCrate()", function() {

		var UNIT_TEST_CRATE = "UNIT_TEST_CRATE"
		before(function(){
			GiftCrateFactory._generateCache()
			GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE] = {
				availableAt: moment.utc(0).year(2015).month(11).date(20).valueOf(),
				rewards: {
					spirit: 100,
					gold: 100,
					spirit_orbs: 1,
					gauntlet_tickets: 1,
					random_cards: [ { rarity: SDK.Rarity.Common } ],
					card_ids: [ SDK.Cards.Neutral.SarlacTheEternal ],
					crate_keys: ["bronze","gold","platinum"],
					cosmetics: [SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015],
				}
			}
		})

		it("returns correct rewards hash object",function(){
			return GiftCrateModule.addGiftCrateToUser(Promise.resolve(),knex,userId,UNIT_TEST_CRATE)
			.then(function(crateId){
				return GiftCrateModule.unlockGiftCrate(userId,crateId)
			}).then(function(response){
				// Logger.module("UNITTEST").log(response)
				expect(_.find(response,function(r){ return r.spirit }).spirit).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit)
				expect(_.find(response,function(r){ return r.gold }).gold).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gold)
				expect(_.find(response,function(r){ return r.cards }).cards.length).to.equal(2)
				expect(_.find(response,function(r){ return r.spirit_orbs }).spirit_orbs).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit_orbs)
				expect(_.find(response,function(r){ return r.cosmetic_keys }).cosmetic_keys).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.crate_keys)
				expect(_.find(response,function(r){ return r.gauntlet_tickets }).gauntlet_tickets).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gauntlet_tickets)
				expect(_.find(response,function(r){ return r.cosmetic_id }).cosmetic_id).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0])
			})
		})

		it("awards correct rewards to user inventory",function(){
			return SyncModule.wipeUserData(userId).then(function(){
				return GiftCrateModule.addGiftCrateToUser(Promise.resolve(),knex,userId,UNIT_TEST_CRATE)
			}).then(function(crateId){
				return GiftCrateModule.unlockGiftCrate(userId,crateId)
			}).then(function(response){
				return Promise.all([
					knex("users").first().where("id",userId),
					knex("user_spirit_orbs").select().where("user_id",userId),
					knex("user_cosmetic_inventory").select().where("user_id",userId),
					knex("user_gauntlet_tickets").select().where("user_id",userId),
					knex("user_cards").select().where("user_id",userId),
					knex("user_cosmetic_chest_keys").select().where("user_id",userId)
				])
			}).spread(function(userRow,spiritOrbRows,cosmeticRows,gauntletTicketRows,cardRows,chestKeyRows){
				expect(userRow.wallet_gold).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gold)
				expect(userRow.wallet_spirit).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit)
				expect(spiritOrbRows.length).to.equal(1)
				expect(cosmeticRows.length).to.equal(1)
				expect(parseInt(cosmeticRows[0].cosmetic_id)).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0])
				expect(gauntletTicketRows.length).to.equal(1)
				expect(cardRows.length).to.equal(2)
				expect(chestKeyRows.length).to.equal(3)
			})
		})

		it("opening duplicate cosmetics to have cosmetic id in reward hash but spirit in reward inventory",function(){
			return SyncModule.wipeUserData(userId).then(function(){
				return InventoryModule.giveUserCosmeticId(Promise.resolve(), knex, userId, SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015, "unit test", "unit test")
			}).then(function(){
				return GiftCrateModule.addGiftCrateToUser(Promise.resolve(),knex,userId,UNIT_TEST_CRATE)
			}).then(function(crateId){
				return GiftCrateModule.unlockGiftCrate(userId,crateId)
			}).then(function(response){
				expect(parseInt(_.find(response,function(r){ return r.cosmetic_id }).cosmetic_id)).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0])
				return Promise.all([
					knex("users").first().where("id",userId),
					knex("user_spirit_orbs").select().where("user_id",userId),
					knex("user_cosmetic_inventory").select().where("user_id",userId),
					knex("user_gauntlet_tickets").select().where("user_id",userId),
					knex("user_cards").select().where("user_id",userId),
					knex("user_cosmetic_chest_keys").select().where("user_id",userId)
				])
			}).spread(function(userRow,spiritOrbRows,cosmeticRows,gauntletTicketRows,cardRows,chestKeyRows){
				expect(userRow.wallet_gold).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gold)
				expect(userRow.wallet_spirit).to.be.above(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit)
				expect(spiritOrbRows.length).to.equal(1)
				expect(cosmeticRows.length).to.equal(1)
				expect(parseInt(cosmeticRows[0].cosmetic_id)).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0])
				expect(gauntletTicketRows.length).to.equal(1)
				expect(cardRows.length).to.equal(2)
			})
		})

	})

})
