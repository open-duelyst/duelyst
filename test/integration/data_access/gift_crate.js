const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const chai = require('chai');

const { expect } = chai;
const Promise = require('bluebird');
const _ = require('underscore');
const moment = require('moment');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
const Errors = require('../../../server/lib/custom_errors.coffee');
const UsersModule = require('../../../server/lib/data_access/users.coffee');
const GamesModule = require('../../../server/lib/data_access/games.coffee');
const GiftCrateModule = require('../../../server/lib/data_access/gift_crate.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const generatePushId = require('../../../app/common/generate_push_id');
const config = require('../../../config/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const GiftCrateFactory = require('../../../app/sdk/giftCrates/giftCrateFactory.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');
const NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum.coffee');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe('gift crates module', function () {
  let userId = null;
  this.timeout(25000);

  // before cleanup to check if user already exists and delete
  before(function () {
    this.timeout(25000);
    // Logger.module("UNITTEST").log("creating user");
    return UsersModule.createNewUser('unit-test@duelyst.local', 'unittest', 'hash', 'kumite14')
      .then((userIdCreated) => {
        // Logger.module("UNITTEST").log("created user ",userIdCreated);
        userId = userIdCreated;
      }).catch(Errors.AlreadyExistsError, (error) =>
        // Logger.module("UNITTEST").log("existing user");
        UsersModule.userIdForEmail('unit-test@duelyst.local').then((userIdExisting) => {
          Logger.module('UNITTEST').log('existing user retrieved', userIdExisting);
          userId = userIdExisting;
          return SyncModule.wipeUserData(userIdExisting);
        }).then(() => {
          // Logger.module("UNITTEST").log("existing user data wiped",userId);
        })).catch((error) => {
        Logger.module('UNITTEST').log('unexpected error: ', error);
        throw error;
      });
  });

  describe('unlockGiftCrate()', () => {
    const UNIT_TEST_CRATE = 'UNIT_TEST_CRATE';
    before(() => {
      GiftCrateFactory._generateCache();
      GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE] = {
        availableAt: moment.utc(0).year(2015).month(11).date(20)
          .valueOf(),
        rewards: {
          spirit: 100,
          gold: 100,
          spirit_orbs: 1,
          gauntlet_tickets: 1,
          random_cards: [{ rarity: SDK.Rarity.Common }],
          card_ids: [SDK.Cards.Neutral.SarlacTheEternal],
          crate_keys: ['bronze', 'gold', 'platinum'],
          cosmetics: [SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015],
        },
      };
    });

    it('returns correct rewards hash object', () => GiftCrateModule.addGiftCrateToUser(Promise.resolve(), knex, userId, UNIT_TEST_CRATE)
      .then((crateId) => GiftCrateModule.unlockGiftCrate(userId, crateId)).then((response) => {
        // Logger.module("UNITTEST").log(response)
        expect(_.find(response, (r) => r.spirit).spirit).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit);
        expect(_.find(response, (r) => r.gold).gold).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gold);
        expect(_.find(response, (r) => r.cards).cards.length).to.equal(2);
        expect(_.find(response, (r) => r.spirit_orbs).spirit_orbs).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit_orbs);
        expect(_.find(response, (r) => r.cosmetic_keys).cosmetic_keys).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.crate_keys);
        expect(_.find(response, (r) => r.gauntlet_tickets).gauntlet_tickets).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gauntlet_tickets);
        expect(_.find(response, (r) => r.cosmetic_id).cosmetic_id).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0]);
      }));

    it('awards correct rewards to user inventory', () => SyncModule.wipeUserData(userId).then(() => GiftCrateModule.addGiftCrateToUser(Promise.resolve(), knex, userId, UNIT_TEST_CRATE)).then((crateId) => GiftCrateModule.unlockGiftCrate(userId, crateId)).then((response) => Promise.all([
      knex('users').first().where('id', userId),
      knex('user_spirit_orbs').select().where('user_id', userId),
      knex('user_cosmetic_inventory').select().where('user_id', userId),
      knex('user_gauntlet_tickets').select().where('user_id', userId),
      knex('user_cards').select().where('user_id', userId),
      knex('user_cosmetic_chest_keys').select().where('user_id', userId),
    ]))
      .spread((userRow, spiritOrbRows, cosmeticRows, gauntletTicketRows, cardRows, chestKeyRows) => {
        expect(userRow.wallet_gold).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gold);
        expect(userRow.wallet_spirit).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit);
        expect(spiritOrbRows.length).to.equal(1);
        expect(cosmeticRows.length).to.equal(1);
        expect(parseInt(cosmeticRows[0].cosmetic_id, 10)).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0]);
        expect(gauntletTicketRows.length).to.equal(1);
        expect(cardRows.length).to.equal(2);
        expect(chestKeyRows.length).to.equal(3);
      }));

    it('opening duplicate cosmetics to have cosmetic id in reward hash but spirit in reward inventory', () => SyncModule.wipeUserData(userId).then(() => InventoryModule.giveUserCosmeticId(Promise.resolve(), knex, userId, SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015, 'unit test', 'unit test')).then(() => GiftCrateModule.addGiftCrateToUser(Promise.resolve(), knex, userId, UNIT_TEST_CRATE)).then((crateId) => GiftCrateModule.unlockGiftCrate(userId, crateId))
      .then((response) => {
        expect(parseInt(_.find(response, (r) => r.cosmetic_id).cosmetic_id, 10)).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0]);
        return Promise.all([
          knex('users').first().where('id', userId),
          knex('user_spirit_orbs').select().where('user_id', userId),
          knex('user_cosmetic_inventory').select().where('user_id', userId),
          knex('user_gauntlet_tickets').select().where('user_id', userId),
          knex('user_cards').select().where('user_id', userId),
          knex('user_cosmetic_chest_keys').select().where('user_id', userId),
        ]);
      })
      .spread((userRow, spiritOrbRows, cosmeticRows, gauntletTicketRows, cardRows, chestKeyRows) => {
        expect(userRow.wallet_gold).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.gold);
        expect(userRow.wallet_spirit).to.be.above(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.spirit);
        expect(spiritOrbRows.length).to.equal(1);
        expect(cosmeticRows.length).to.equal(1);
        expect(parseInt(cosmeticRows[0].cosmetic_id, 10)).to.equal(GiftCrateFactory._giftCrateTemplateCache[UNIT_TEST_CRATE].rewards.cosmetics[0]);
        expect(gauntletTicketRows.length).to.equal(1);
        expect(cardRows.length).to.equal(2);
      }));
  });
});
