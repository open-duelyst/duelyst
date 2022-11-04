const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const chai = require('chai');

const { expect } = chai;
const Promise = require('bluebird');
const _ = require('underscore');
const moment = require('moment');
const CardSetLookup = require('../../../app/sdk/cards/cardSetLookup.coffee');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
const Errors = require('../../../server/lib/custom_errors.coffee');
const UsersModule = require('../../../server/lib/data_access/users.coffee');
const GamesModule = require('../../../server/lib/data_access/games.coffee');
const QuestsModule = require('../../../server/lib/data_access/quests.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const MigrationsModule = require('../../../server/lib/data_access/migrations.coffee');
const GauntletModule = require('../../../server/lib/data_access/gauntlet.coffee');
const InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const generatePushId = require('../../../app/common/generate_push_id');
const config = require('../../../config/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');
const NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum.coffee');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe('migrations module', function () {
  let userId = null;
  let user2Id = null;
  this.timeout(25000);

  // before cleanup to check if user already exists and delete
  before(function () {
    this.timeout(25000);
    Logger.module('UNITTEST').log('creating user');
    const createOrInsertUser = function (userEmail, userName) {
      return UsersModule.createNewUser(userEmail, userName, 'hash', 'kumite14')
        .bind({})
        .then(function (userIdCreated) {
          this.userId = userIdCreated;
          Logger.module('UNITTEST').log('created user ', userIdCreated);
        }).catch(Errors.AlreadyExistsError, function (error) {
          Logger.module('UNITTEST').log('existing user', userName);
          return UsersModule.userIdForEmail(userEmail)
            .bind(this)
            .then(function (userIdExisting) {
              this.userId = userIdExisting;
              Logger.module('UNITTEST').log('existing user retrieved', userIdExisting);
              return SyncModule.wipeUserData(userIdExisting);
            }).then(function () {
              Logger.module('UNITTEST').log('existing user data wiped', this.userId);
            });
        })
        .then(function () {
          return Promise.resolve(this.userId);
        });
    };

    return Promise.all([
      createOrInsertUser('unit-test-1@duelyst.local', 'player 1', 0),
      createOrInsertUser('unit-test-2@duelyst.local', 'player 2', 0),
    ]).spread((player1CreatedId, player2CreatedId) => {
      userId = player1CreatedId;
      user2Id = player2CreatedId;
    });
  });

  describe('checkIfUserNeedsMigrateEmotes20160708()', () => {
    it('expect a player to need emote migration if their last session was last year and they have no cosmetics', () => SyncModule.wipeUserData(user2Id)
      .then(() => knex('users').where('id', user2Id).update('last_session_at', moment.utc('2015-02-02').toDate())).then(() => knex('users').first().where('id', user2Id)).then((userRow) => MigrationsModule.checkIfUserNeedsMigrateEmotes20160708(userRow))
      .then((userNeedsMigrateEmotes) => {
        expect(userNeedsMigrateEmotes).to.equal(true);
      }));

    it('expect a player to not need emote migration if their last session is after the deadline and they have no cosmetics', () => SyncModule.wipeUserData(user2Id)
      .then(() => knex('users').where('id', user2Id).update('last_session_at', moment.utc('2017-02-02').toDate())).then(() => knex('users').first().where('id', user2Id)).then((userRow) => MigrationsModule.checkIfUserNeedsMigrateEmotes20160708(userRow))
      .then((userNeedsMigrateEmotes) => {
        expect(userNeedsMigrateEmotes).to.equal(false);
      }));

    it('expect a player to not need emote migration if their last session was last year and they have cosmetics', () => SyncModule.wipeUserData(user2Id)
      .then(() => knex('users').where('id', user2Id).update('last_session_at', moment.utc('2015-02-02').toDate())).then(() => {
        const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, user2Id, SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015, 'QA Gift', 'migration 20160708'));
        return txPromise;
      }).then(() => knex('users').first().where('id', user2Id))
      .then((userRow) => MigrationsModule.checkIfUserNeedsMigrateEmotes20160708(userRow))
      .then((userNeedsMigrateEmotes) => {
        expect(userNeedsMigrateEmotes).to.equal(false);
      }));
  });

  describe('userMigrateEmotes20160708()', () => {
    // TODO: Pass time to userMigrateEmotes20160708().
    it('expect a user to have all original general emotes after migration', () => SyncModule.wipeUserData(user2Id)
      .then(() => MigrationsModule.userMigrateEmotes20160708(user2Id))
      .then(() => knex('user_cosmetic_inventory').select().where('user_id', user2Id)).then((userCosmeticRows) => {
        let expectedEmoteIds = [];
        for (const key in SDK.CosmeticsLookup.Emote) {
          if (key.includes('Faction') && !key.includes('Alt')) {
            expectedEmoteIds.push(SDK.CosmeticsLookup.Emote[key]);
          }
        }
        // Remove the basic emotes
        expectedEmoteIds = _.difference(expectedEmoteIds, [
          SDK.CosmeticsLookup.Emote.Faction1Happy,
          SDK.CosmeticsLookup.Emote.Faction2Angry,
          SDK.CosmeticsLookup.Emote.Faction3Confused,
          SDK.CosmeticsLookup.Emote.Faction4Frustrated,
          SDK.CosmeticsLookup.Emote.Faction5Sad,
          SDK.CosmeticsLookup.Emote.Faction6Kiss,
        ]);

        expect(userCosmeticRows).to.exist;
        expect(userCosmeticRows.length).to.equal(expectedEmoteIds.length);
        for (let i = 0; i < userCosmeticRows.length; i++) {
          const cosmeticRow = userCosmeticRows[i];
          expect(_.contains(expectedEmoteIds, cosmeticRow.cosmetic_id)).to.equal(true);
        }
      }));

    it('expect a user to have all original general emotes after migration and any others they already had', () => SyncModule.wipeUserData(user2Id)
      .then(() => MigrationsModule.userMigrateEmotes20160708(user2Id)).then(() => {
        const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, user2Id, SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015, 'QA GIFT', 'QA Gift 1'));
        return txPromise;
      }).then(() => knex('user_cosmetic_inventory').select().where('user_id', user2Id))
      .then((userCosmeticRows) => {
        let expectedEmoteIds = [
          SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015,
        ];
        for (const key in SDK.CosmeticsLookup.Emote) {
          if (key.includes('Faction') && !key.includes('Alt')) {
            expectedEmoteIds.push(SDK.CosmeticsLookup.Emote[key]);
          }
        }
        // Remove the basic emotes
        expectedEmoteIds = _.difference(expectedEmoteIds, [
          SDK.CosmeticsLookup.Emote.Faction1Happy,
          SDK.CosmeticsLookup.Emote.Faction2Angry,
          SDK.CosmeticsLookup.Emote.Faction3Confused,
          SDK.CosmeticsLookup.Emote.Faction4Frustrated,
          SDK.CosmeticsLookup.Emote.Faction5Sad,
          SDK.CosmeticsLookup.Emote.Faction6Kiss,
        ]);

        expect(userCosmeticRows).to.exist;
        expect(userCosmeticRows.length).to.equal(expectedEmoteIds.length);
        for (let i = 0; i < userCosmeticRows.length; i++) {
          const cosmeticRow = userCosmeticRows[i];
          expect(_.contains(expectedEmoteIds, cosmeticRow.cosmetic_id)).to.equal(true);
        }
      }));
  });

  describe('checkIfUserNeedsPrismaticBackfillReward()', () => {
    it('expect a player to need prismatic backfill they have no last_session_version', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update('last_session_version', null)).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow))
      .then((userNeedsPrismaticBackfill) => {
        expect(userNeedsPrismaticBackfill).to.equal(true);
      }));

    it('expect a player to need prismatic backfill if their last session is before the version deadline', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update('last_session_version', '1.65.12')).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow))
      .then((userNeedsPrismaticBackfill) => {
        expect(userNeedsPrismaticBackfill).to.equal(true);
      }));

    it('expect a player to not need prismatic backfill if their last session hotfix version is after 1.73.0', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update('last_session_version', '1.73.1')).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow))
      .then((userNeedsPrismaticBackfill) => {
        expect(userNeedsPrismaticBackfill).to.equal(false);
      }));

    it('expect a player to not need prismatic backfill if their last session minor version is after 1.73.0', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update('last_session_version', '1.74.0')).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow))
      .then((userNeedsPrismaticBackfill) => {
        expect(userNeedsPrismaticBackfill).to.equal(false);
      }));

    /* Test disabled: unsafe (function declaration inside loop)
    it('expect a player to not need prismatic backfill if their last session version is before 1.73.0 but they already got backfill reward', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update('last_session_version', '1.69.0')).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow))
      .then((userNeedsPrismaticBackfill) => {
        expect(userNeedsPrismaticBackfill).to.equal(true);

        const dateToOpenSpiritOrbs = moment.utc('2016-07-12 03:30');

        const unlockSpiritOrbPromises = [];
        for (let i = 0; i < 20; i++) {
          const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateToOpenSpiritOrbs)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateToOpenSpiritOrbs));
          unlockSpiritOrbPromises.push(txPromise);
        }

        return Promise.all(unlockSpiritOrbPromises);
      })
      .then(() => MigrationsModule.userBackfillPrismaticRewards(userId))
      .then(() => knex('users').first().where('id', userId))
      .then((userRow) => MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow))
      .then((userNeedsPrismaticBackfill) => {
        expect(userNeedsPrismaticBackfill).to.equal(false);
      }));
      */
  });

  describe('userBackfillPrismaticRewards()', function () {
    this.timeout(100000);

    /* Test disabled: unsafe (function declaration inside loop)
    it('expect a player to receive no prismatic backfill rewards if they have opened 10 spirit orbs before cutoff', () => {
      const dateToOpenSpiritOrbs = moment.utc('2016-07-12 03:30');

      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update('last_session_version', null)).then(() => {
          const unlockSpiritOrbPromises = [];
          for (let i = 0; i < 10; i++) {
            const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateToOpenSpiritOrbs)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateToOpenSpiritOrbs));
            unlockSpiritOrbPromises.push(txPromise);
          }

          return Promise.all(unlockSpiritOrbPromises);
        })
        .then(() =>
          // Get user's inventory to compare later
          Promise.all([
            knex('user_spirit_orbs_opened').where('user_id', userId),
            knex('user_cards').where('user_id', userId),
          ]))
        .spread(function (spiritOrbsOpenedRow, cardRows) {
          expect(spiritOrbsOpenedRow).to.exist;
          expect(spiritOrbsOpenedRow.length).to.equal(10);

          expect(cardRows).to.exist;
          this.previousCardRows = cardRows;

          return MigrationsModule.userBackfillPrismaticRewards(userId);
        })
        .then(() => knex('user_cards').where('user_id', userId))
        .then(function (newCardRows) {
          expect(newCardRows).to.exist;

          const newCardIds = [];

          for (let i = 0; i < newCardRows.length; i++) {
            const newCardRow = newCardRows[i];
            const oldCardRow = _.find(this.previousCardRows, (val) => val.card_id == newCardRow.card_id);
            let numCopiesAdded = 0;
            if (oldCardRow == null) {
              numCopiesAdded = newCardRow.count;
            } else {
              numCopiesAdded = newCardRow.count - oldCardRow.count;
            }
            for (let j = 0; j < numCopiesAdded; j++) {
              newCardIds.push(newCardRow.id);
            }
          }

          expect(newCardIds.length).to.equal(0);
        });
    });
    */

    /* Test disabled: unsafe (function declaration inside loop)
    it('expect a player to receive no prismatic backfill rewards if they have opened 10 spirit orbs before cutoff and 20 after (long)', () => {
      const dateToOpenSpiritOrbs = moment.utc('2016-07-12 03:30');
      const dateAfterCutoff = moment.utc('2016-09-12 03:30');

      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update('last_session_version', null)).then(() => {
          const unlockSpiritOrbPromises = [];
          for (var i = 0; i < 10; i++) {
            const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateToOpenSpiritOrbs)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateToOpenSpiritOrbs));
            unlockSpiritOrbPromises.push(txPromise);
          }

          for (var i = 0; i < 20; i++) {
            const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateAfterCutoff)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateAfterCutoff));
            unlockSpiritOrbPromises.push(txPromise);
          }

          return Promise.all(unlockSpiritOrbPromises);
        })
        .then(() =>
          // Get user's inventory to compare later
          Promise.all([
            knex('user_spirit_orbs_opened').where('user_id', userId),
            knex('user_cards').where('user_id', userId),
          ]))
        .spread(function (spiritOrbsOpenedRow, cardRows) {
          expect(spiritOrbsOpenedRow).to.exist;
          expect(spiritOrbsOpenedRow.length).to.equal(10 + 20);

          expect(cardRows).to.exist;
          this.previousCardRows = cardRows;

          return MigrationsModule.userBackfillPrismaticRewards(userId);
        })
        .then(() => knex('user_cards').where('user_id', userId))
        .then(function (newCardRows) {
          expect(newCardRows).to.exist;

          const newCardIds = [];

          for (let i = 0; i < newCardRows.length; i++) {
            const newCardRow = newCardRows[i];
            const oldCardRow = _.find(this.previousCardRows, (val) => val.card_id == newCardRow.card_id);
            let numCopiesAdded = 0;
            if (oldCardRow == null) {
              numCopiesAdded = newCardRow.count;
            } else {
              numCopiesAdded = newCardRow.count - oldCardRow.count;
            }
            for (let j = 0; j < numCopiesAdded; j++) {
              newCardIds.push(newCardRow.id);
            }
          }

          expect(newCardIds.length).to.equal(0);
        });
    });
    */

    /* Test disabled: unsafe (function declaration inside loop)
    it('expect a player to receive small prismatic backfill reward if they have opened 28 spirit orbs before cutoff (long)', () => {
      const dateToOpenSpiritOrbs = moment.utc('2016-07-12 03:30');

      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update('last_session_version', null)).then(() => {
          const unlockSpiritOrbPromises = [];
          for (let i = 0; i < 28; i++) {
            const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateToOpenSpiritOrbs)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateToOpenSpiritOrbs));
            unlockSpiritOrbPromises.push(txPromise);
          }

          return Promise.all(unlockSpiritOrbPromises);
        })
        .then(() =>
          // Get user's inventory to compare later
          Promise.all([
            knex('user_spirit_orbs_opened').where('user_id', userId),
            knex('user_cards').where('user_id', userId),
          ]))
        .spread(function (spiritOrbsOpenedRow, cardRows) {
          expect(spiritOrbsOpenedRow).to.exist;
          expect(spiritOrbsOpenedRow.length).to.equal(28);

          expect(cardRows).to.exist;
          this.previousCardRows = cardRows;

          return MigrationsModule.userBackfillPrismaticRewards(userId);
        })
        .then(() => knex('user_cards').where('user_id', userId))
        .then(function (newCardRows) {
          expect(newCardRows).to.exist;

          const newCardIds = [];

          for (let i = 0; i < newCardRows.length; i++) {
            const newCardRow = newCardRows[i];
            const oldCardRow = _.find(this.previousCardRows, (val) => val.card_id == newCardRow.card_id);
            let numCopiesAdded = 0;
            if (oldCardRow == null) {
              numCopiesAdded = newCardRow.count;
            } else {
              numCopiesAdded = newCardRow.count - oldCardRow.count;
            }
            for (let j = 0; j < numCopiesAdded; j++) {
              newCardIds.push(newCardRow.card_id);
            }
          }

          expect(newCardIds.length).to.equal(6);

          const gameSession = SDK.GameSession.current();
          const commonPrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Common) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(commonPrismaticCardCount).to.equal(2);

          const rarePrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Rare) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(rarePrismaticCardCount).to.equal(2);

          const epicPrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Epic) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(epicPrismaticCardCount).to.equal(2);
        });
    });
    */

    /* Test disabled: unsafe (function declaration inside loop)
    it('expect a player to receive small prismatic backfill reward if they have opened 28 spirit orbs before cutoff and 25 after (long)', () => {
      const dateToOpenSpiritOrbs = moment.utc('2016-07-12 03:30');
      const dateAfterCutoff = moment.utc('2016-09-12 03:30');

      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update('last_session_version', null)).then(() => {
          const unlockSpiritOrbPromises = [];
          for (var i = 0; i < 28; i++) {
            const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateToOpenSpiritOrbs)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateToOpenSpiritOrbs));
            unlockSpiritOrbPromises.push(txPromise);
          }
          for (var i = 0; i < 25; i++) {
            const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateAfterCutoff)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateAfterCutoff));
            unlockSpiritOrbPromises.push(txPromise);
          }

          return Promise.all(unlockSpiritOrbPromises);
        })
        .then(() =>
          // Get user's inventory to compare later
          Promise.all([
            knex('user_spirit_orbs_opened').where('user_id', userId),
            knex('user_cards').where('user_id', userId),
          ]))
        .spread(function (spiritOrbsOpenedRow, cardRows) {
          expect(spiritOrbsOpenedRow).to.exist;
          expect(spiritOrbsOpenedRow.length).to.equal(28 + 25);

          expect(cardRows).to.exist;
          this.previousCardRows = cardRows;

          return MigrationsModule.userBackfillPrismaticRewards(userId);
        })
        .then(() => knex('user_cards').where('user_id', userId))
        .then(function (newCardRows) {
          expect(newCardRows).to.exist;

          const newCardIds = [];

          for (let i = 0; i < newCardRows.length; i++) {
            const newCardRow = newCardRows[i];
            const oldCardRow = _.find(this.previousCardRows, (val) => val.card_id == newCardRow.card_id);
            let numCopiesAdded = 0;
            if (oldCardRow == null) {
              numCopiesAdded = newCardRow.count;
            } else {
              numCopiesAdded = newCardRow.count - oldCardRow.count;
            }
            for (let j = 0; j < numCopiesAdded; j++) {
              newCardIds.push(newCardRow.card_id);
            }
          }

          expect(newCardIds.length).to.equal(6);

          const gameSession = SDK.GameSession.current();
          const commonPrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Common) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(commonPrismaticCardCount).to.equal(2);

          const rarePrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Rare) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(rarePrismaticCardCount).to.equal(2);

          const epicPrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Epic) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(epicPrismaticCardCount).to.equal(2);
        });
    });
    */

    /* Test disabled: unsafe (function declaration inside loop)
    it('expect a player to receive 2 prismatic backfill reward chunks if they have opened 119 spirit orbs before cutoff (very long)', function () {
      this.timeout(200000);

      const dateToOpenSpiritOrbs = moment.utc('2016-07-12 03:30');

      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update('last_session_version', null)).then(() => {
          const unlockSpiritOrbPromises = [];
          for (let i = 0; i < 119; i++) {
            const txPromise = knex.transaction((tx) => InventoryModule.addBoosterPackToUser(txPromise, tx, userId, CardSetLookup.Core, 'QA gift', 'QA gift id', null, dateToOpenSpiritOrbs)).then((boosterId) => InventoryModule.unlockBoosterPack(userId, boosterId, dateToOpenSpiritOrbs));
            unlockSpiritOrbPromises.push(txPromise);
          }

          return Promise.all(unlockSpiritOrbPromises);
        })
        .then(() =>
          // Get user's inventory to compare later
          Promise.all([
            knex('user_spirit_orbs_opened').where('user_id', userId),
            knex('user_cards').where('user_id', userId),
          ]))
        .spread(function (spiritOrbsOpenedRow, cardRows) {
          expect(spiritOrbsOpenedRow).to.exist;
          expect(spiritOrbsOpenedRow.length).to.equal(119);

          expect(cardRows).to.exist;
          this.previousCardRows = cardRows;

          return MigrationsModule.userBackfillPrismaticRewards(userId);
        })
        .then(() => knex('user_cards').where('user_id', userId))
        .then(function (newCardRows) {
          expect(newCardRows).to.exist;

          const newCardIds = [];

          for (let i = 0; i < newCardRows.length; i++) {
            const newCardRow = newCardRows[i];
            const oldCardRow = _.find(this.previousCardRows, (val) => val.card_id == newCardRow.card_id);
            let numCopiesAdded = 0;
            if (oldCardRow == null) {
              numCopiesAdded = newCardRow.count;
            } else {
              numCopiesAdded = newCardRow.count - oldCardRow.count;
            }
            for (let j = 0; j < numCopiesAdded; j++) {
              newCardIds.push(newCardRow.card_id);
            }
          }

          expect(newCardIds.length).to.equal(20);

          const gameSession = SDK.GameSession.current();
          const commonPrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Common) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(commonPrismaticCardCount).to.equal(8);

          const rarePrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Rare) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(rarePrismaticCardCount).to.equal(6);

          const epicPrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Epic) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(epicPrismaticCardCount).to.equal(4);

          const legendaryPrismaticCardCount = _.reduce(newCardIds, (memo, cardId) => {
            const sdkCard = gameSession.createCardForIdentifier(cardId);
            if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Legendary) {
              return memo + 1;
            }
            return memo;
          }, 0);
          expect(legendaryPrismaticCardCount).to.equal(2);
        });
    });
    */
  });

  describe('checkIfUserNeedsChargeCountsMigration()', () => {
    it('expect a player to need charge counts migrated if they have no last_session_version', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: null,
        purchase_count: 1,
      })).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow))
      .then((needsMigration) => {
        expect(needsMigration).to.equal(true);
      }));

    it('expect a player to need charge counts migrated if their last session is far before the version deadline', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: '1.70.11',
        purchase_count: 1,
      })).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow))
      .then((needsMigration) => {
        expect(needsMigration).to.equal(true);
      }));

    it('expect a player to not need charge counts migrated if their last session hotfix version is before 1.74.11', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: '1.74.10',
        purchase_count: 1,
      })).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow))
      .then((needsMigration) => {
        expect(needsMigration).to.equal(true);
      }));

    it('expect a player to not need charge counts migrated if their last session hotfix version is after 1.74.11', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: '1.74.12',
        purchase_count: 1,
      })).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow))
      .then((needsMigration) => {
        expect(needsMigration).to.equal(false);
      }));

    it('expect a player to not need prismatic backfill if their last session version is at least 1.75.0', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: '1.75.0',
        purchase_count: 1,
      })).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow))
      .then((needsMigration) => {
        expect(needsMigration).to.equal(false);
      }));

    it('expect a player to not need prismatic backfill if their last session version is before 1.74.0 but they have no purchases', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: '1.69.0',
        purchase_count: 0,
      })).then(() => knex('users').first().where('id', userId)).then((userRow) => MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow))
      .then((needsMigration) => {
        expect(needsMigration).to.equal(false);
      }));
  });

  describe('userCreateChargeCountsMigration()', () => {
    it('expect a player that did not purchase a starter bundle to have nothing in their firebase purchase count tree', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: null,
        purchase_count: 0,
        has_purchased_starter_bundle: false,
      })).then(() => MigrationsModule.userCreateChargeCountsMigration(userId)).then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => FirebasePromises.once(rootRef.child('user-purchase-counts').child(userId), 'value'))
      .then((purchaseCountsSnapshot) => {
        expect(purchaseCountsSnapshot.val()).to.not.exist;
      }));

    it('expect a player that purchased a starter bundle to correctly mark it into purchase count tree', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: null,
        purchase_count: 1,
        has_purchased_starter_bundle: true,
      })).then(() => MigrationsModule.userCreateChargeCountsMigration(userId)).then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => FirebasePromises.once(rootRef.child('user-purchase-counts').child(userId), 'value'))
      .then((purchaseCountsSnapshot) => {
        expect(purchaseCountsSnapshot.val().STARTERBUNDLE_201604).to.exist;
        expect(purchaseCountsSnapshot.val().STARTERBUNDLE_201604.count).to.equal(1);
      }));
  });

  describe('checkIfUserNeedsIncompleteGauntletRefund()', () => {
    it('expect a player with an old gauntlet run that is complete to not need a refund', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: null,
      })).then(() => knex('users').where('id', userId).update({ wallet_gold: 150 })).then(() => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticketId) => GauntletModule.startRun(userId, ticketId, moment.utc('2017-04-02 13:00')))
      .then(() => knex('user_gauntlet_run').where('user_id', userId).update({ is_complete: true }))
      .then(() => knex('users').first().where('id', userId))
      .then((userRow) => MigrationsModule.checkIfUserNeedsIncompleteGauntletRefund(userRow))
      .then((needsRefund) => {
        expect(needsRefund).to.equal(false);
      }));

    it('expect a player with a gauntlet run that is not complete and has no faction choices to not need a refund', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: null,
      })).then(() => knex('users').where('id', userId).update({ wallet_gold: 150 })).then(() => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticketId) => GauntletModule.startRun(userId, ticketId, moment.utc('2017-04-02 13:00')))
      .then(() => knex('users').first().where('id', userId))
      .then((userRow) => MigrationsModule.checkIfUserNeedsIncompleteGauntletRefund(userRow))
      .then((needsRefund) => {
        expect(needsRefund).to.equal(false);
      }));

    it('expect a player with an old gauntlet run that is not complete and has faction choices to need a refund', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: null,
      })).then(() => knex('users').where('id', userId).update({ wallet_gold: 150 })).then(() => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticketId) => GauntletModule.startRun(userId, ticketId, moment.utc('2017-04-02 13:00')))
      .then(() => knex('user_gauntlet_run').where('user_id', userId).update({ faction_choices: [1, 2, 3] }))
      .then(() => knex('users').first().where('id', userId))
      .then((userRow) => MigrationsModule.checkIfUserNeedsIncompleteGauntletRefund(userRow))
      .then((needsRefund) => {
        expect(needsRefund).to.equal(true);
      }));
  });

  describe('userIncompleteGauntletRefund()', () => {
    it('expect a player with an old gauntlet run that is not complete to no longer have a run and to now have an arena ticket', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({
        last_session_version: null,
      })).then(() => knex('users').where('id', userId).update({ wallet_gold: 150 })).then(() => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticketId) => GauntletModule.startRun(userId, ticketId, moment.utc('2017-04-02 13:00')))
      .then(() => {
      })
      .then(() => MigrationsModule.userIncompleteGauntletRefund(userId))
      .then(() => knex('user_gauntlet_run').where('user_id', userId).first())
      .then((currentGauntletRun) => {
        expect(currentGauntletRun).to.not.exist;
        return knex('user_gauntlet_tickets').where('user_id', userId).select();
      })
      .then((userGauntletTickets) => {
        expect(userGauntletTickets).to.exist;
        expect(userGauntletTickets.length).to.equal(1);
      }));
  });
});
