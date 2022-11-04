const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');

const chai = require('chai');
const Promise = require('bluebird');
const sinon = require('sinon');
const _ = require('underscore');
const moment = require('moment');

const expect = chai.expect;
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
const Errors = require('../../../server/lib/custom_errors.coffee');
const UsersModule = require('../../../server/lib/data_access/users.coffee');
const InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const config = require('../../../config/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');
const generatePushId = require('../../../app/common/generate_push_id');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe('inventory module', function () {
  this.timeout(25000);

  let userId = null;
  let fbRootRef = null;
  const unlockableCardSets = [SDK.CardSet.Bloodborn, SDK.CardSet.Unity];

  // before cleanup to check if user already exists and delete
  before(function () {
    this.timeout(25000);
    Logger.module('UNITTEST').log('creating user');
    return UsersModule.createNewUser('unit-test@duelyst.local', 'unittest', 'hash', 'kumite14')
      .then((userIdCreated) => {
        Logger.module('UNITTEST').log('created user ', userIdCreated);
        userId = userIdCreated;
      }).catch(Errors.AlreadyExistsError, (error) => {
        Logger.module('UNITTEST').log('existing user');
        return UsersModule.userIdForEmail('unit-test@duelyst.local').then((userIdExisting) => {
          Logger.module('UNITTEST').log('existing user retrieved', userIdExisting);
          userId = userIdExisting;
          return SyncModule.wipeUserData(userIdExisting);
        }).then(() => {
          Logger.module('UNITTEST').log('existing user data wiped', userId);

          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => {
          fbRootRef = rootRef;
        });
      });
  });

  // // after cleanup
  // after(function(){
  //   this.timeout(25000);
  //   return DuelystFirebase.connect().getRootRef()
  //   .bind({})
  //   .then(function(fbRootRef){
  //     this.fbRootRef = fbRootRef;
  //     if (userId)
  //       return clearUserData(userId,this.fbRootRef);
  //   });
  // });

  describe('getAllCollectibleSdkCards()', () => {
    it('expect to contain an ACHIEVEMENT card', () => {
      const anyAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (c) => c.getIsUnlockableWithAchievement());
      expect(anyAchievementCard).to.exist;
    });
    it('expect to contain a prismatic ACHIEVEMENT card', () => {
      const anyPrismaticAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (c) => c.getIsUnlockablePrismaticWithAchievement());
      expect(anyPrismaticAchievementCard).to.exist;
    });
    it('expect to contain a Seven Sisters cards in Legendary group', () => {
      let sunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCardIds(), (c) => c === SDK.Cards.Faction1.SunSister);
      sunSister = sunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCards(), (c) => c.getId() === SDK.Cards.Faction1.SunSister);
      expect(sunSister).to.exist;
    });
    it('expect to contain a prismatic Seven Sisters cards in Legendary group', () => {
      let prismaticSunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCardIds(), (c) => c === SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic);
      prismaticSunSister = prismaticSunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCards(), (c) => c.getId() === SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic);
      expect(prismaticSunSister).to.exist;
    });
  });

  describe('getAllNonUnlockableCollectibleSdkCards()', () => {
    it('expect NOT to contain any ACHIEVEMENT cards', () => {
      const anyAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getIsUnlockable(false).getCards(), (c) => c.getIsUnlockableWithAchievement());
      expect(anyAchievementCard).to.not.exist;
    });
    it('expect NOT to contain prismatic ACHIEVEMENT cards', () => {
      const anyPrismaticAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getIsUnlockable(false).getCards(), (c) => c.getIsUnlockableWithAchievement() && c.getIsUnlockablePrismaticWithAchievement());
      expect(anyPrismaticAchievementCard).to.not.exist;
    });
    it('expect NOT to contain a Seven Sisters cards in Legendary group', () => {
      let sunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false)
        .getCardIds(), (c) => c === SDK.Cards.Faction1.SunSister);
      sunSister = sunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false)
        .getCards(), (c) => c.getId() === SDK.Cards.Faction1.SunSister);
      expect(sunSister).to.not.exist;
    });
    it('expect NOT to contain a prismatic Seven Sisters cards in Legendary group', () => {
      let prismaticSunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false)
        .getCardIds(), (c) => c === SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic);
      prismaticSunSister = prismaticSunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false)
        .getCards(), (c) => c.getId() === SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic);
      expect(prismaticSunSister).to.not.exist;
    });
  });

  describe('buyBoosterPacksWithGold()', () => {
    it('expect NOT to be able to buy booster packs with NO gold', () => InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core)
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
      }));

    it('expect to be able to buy a booster pack for 100 GOLD', () => knex('users').where('id', userId).update({ wallet_gold: 100 })
      .bind({})
      .then(() => InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core))
      .then(function (boosterIds) {
        expect(boosterIds).to.exist;
        expect(boosterIds.length).to.equal(1);
        this.spiritOrbId = boosterIds[0];
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.first().from('users').where('id', userId),
          knex.select().from('user_spirit_orbs').where('user_id', userId),
          knex.first().from('user_currency_log').where({ user_id: userId, memo: `spirit orb ${this.spiritOrbId}` }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs'), 'value'),
        ]);
      })
      .spread(function (userRow, spiritOrbRows, currencyLogRow, firebaseWalletSnapshot, firebaseBoostersSnapshot) {
        expect(userRow.wallet_gold).to.equal(0);
        expect(currencyLogRow).to.exist;
        expect(currencyLogRow.gold).to.equal(-100);

        let numOrbsFound = 0;
        for (let j = 0, jl = spiritOrbRows.length; j < jl; j++) {
          const spiritOrbRow = spiritOrbRows[j];
          if (spiritOrbRow.id === this.spiritOrbId) {
            numOrbsFound++;
            break;
          }
        }
        expect(numOrbsFound).to.equal(1);

        const fbWallet = firebaseWalletSnapshot.val();
        expect(fbWallet).to.exist;
        expect(fbWallet.gold_amount).to.equal(0);
        expect(fbWallet.updated_at).to.equal(userRow.wallet_updated_at.valueOf());

        const fbBoosters = firebaseBoostersSnapshot.val();
        expect(fbBoosters).to.exist;
      }));

    it('expect to be able to buy 3 booster packs for 300 GOLD', () => knex('users').where('id', userId).update({ wallet_gold: 300 })
      .bind({})
      .then(() => InventoryModule.buyBoosterPacksWithGold(userId, 3, SDK.CardSet.Core))
      .then(function (boosterIds) {
        this.boosterIds = boosterIds;
        expect(boosterIds).to.exist;
        expect(boosterIds.length).to.equal(3);
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.first().from('users').where('id', userId),
          knex.select().from('user_spirit_orbs').where('user_id', userId),
          knex.first().from('user_currency_log').where({ user_id: userId, memo: `spirit orb ${this.boosterIds[this.boosterIds.length - 1]}` }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs'), 'value'),
        ]);
      })
      .spread(function (userRow, spiritOrbRows, currencyLogRow, firebaseWalletSnapshot, firebaseBoostersSnapshot) {
        expect(userRow.wallet_gold).to.equal(0);
        expect(currencyLogRow).to.exist;
        expect(currencyLogRow.gold).to.equal(-100);

        let numOrbsFound = 0;
        for (let i = 0, il = this.boosterIds.length; i < il; i++) {
          const boosterId = this.boosterIds[i];
          for (let j = 0, jl = spiritOrbRows.length; j < jl; j++) {
            const spiritOrbRow = spiritOrbRows[j];
            if (spiritOrbRow.id === boosterId) {
              numOrbsFound++;
              break;
            }
          }
        }
        expect(numOrbsFound).to.equal(3);

        const fbWallet = firebaseWalletSnapshot.val();
        expect(fbWallet).to.exist;
        expect(fbWallet.gold_amount).to.equal(0);
        expect(fbWallet.updated_at).to.equal(userRow.wallet_updated_at.valueOf());

        const fbBoosters = firebaseBoostersSnapshot.val();
        expect(fbBoosters).to.exist;
      }));

    it('expect NOT to be able to buy booster packs with INSUFFICIENT gold', () => knex('users').where('id', userId).update({ wallet_gold: 20 })
      .then((result) => InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core))
      .then((result) => {
        expect(result).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
      }));

    it('expect to be able to buy a shimzar booster pack for 100 GOLD', () => knex('users').where('id', userId).update({ wallet_gold: 100 })
      .bind({})
      .then(() => InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Shimzar))
      .then(function (boosterIds) {
        expect(boosterIds).to.exist;
        expect(boosterIds.length).to.equal(1);
        this.spiritOrbId = boosterIds[0];
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.first().from('users').where('id', userId),
          knex.select().from('user_spirit_orbs').where('user_id', userId),
          knex.first().from('user_currency_log').where({ user_id: userId, memo: `spirit orb ${this.spiritOrbId}` }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs'), 'value'),
        ]);
      })
      .spread(function (userRow, spiritOrbRows, currencyLogRow, firebaseWalletSnapshot, firebaseBoostersSnapshot) {
        expect(userRow.wallet_gold).to.equal(0);
        expect(currencyLogRow).to.exist;
        expect(currencyLogRow.gold).to.equal(-100);

        let numOrbsFound = 0;
        for (let j = 0, jl = spiritOrbRows.length; j < jl; j++) {
          const spiritOrbRow = spiritOrbRows[j];
          if (spiritOrbRow.id === this.spiritOrbId) {
            numOrbsFound++;
            break;
          }
        }
        expect(numOrbsFound).to.equal(1);

        const fbWallet = firebaseWalletSnapshot.val();
        expect(fbWallet).to.exist;
        expect(fbWallet.gold_amount).to.equal(0);
        expect(fbWallet.updated_at).to.equal(userRow.wallet_updated_at.valueOf());

        const fbBoosters = firebaseBoostersSnapshot.val();
        expect(fbBoosters).to.exist;
      }));
  });

  /* Test disabled: unsafe (function declaration inside loop)
  for (let i = 0; i < unlockableCardSets.length; i++) {
    const cardSetId = unlockableCardSets[i];
    const cardSetSDKData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
    describe(`addBoosterPackToUser() - ${cardSetSDKData.name}`, () => {
      it(`expect to be able to add 5 ${cardSetSDKData.name} packs to a user`, function () {
        this.timeout(100000);

        return SyncModule.wipeUserData(userId)
          .then(() => {
            const txPromise = knex.transaction((tx) => knex('users').where('id', userId)
              .bind({})
              .then(() => {
                const promises = [];
                for (let i = 0, il = 5; i < il; i++) {
                  promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, 'soft', i));
                }
                return Promise.all(promises);
              }));

            return txPromise;
          });
      });

      it(`expect to be able to add 13 ${cardSetSDKData.name} packs to a user`, function () {
        this.timeout(100000);

        return SyncModule.wipeUserData(userId)
          .then(() => {
            const txPromise = knex.transaction((tx) => knex('users').where('id', userId)
              .bind({})
              .then(() => {
                const promises = [];
                for (let i = 0, il = 13; i < il; i++) {
                  promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, 'soft', i));
                }
                return Promise.all(promises);
              }));

            return txPromise;
          });
      });

      it(`expect to be able to add 5 ${cardSetSDKData.name} packs to a user, but then fail to add 10 more`, function () {
        this.timeout(100000);

        return SyncModule.wipeUserData(userId)
          .then(() => {
            const txPromise = knex.transaction((tx) => knex('users').where('id', userId)
              .bind({})
              .then(() => {
                const promises = [];
                for (let i = 0, il = 5; i < il; i++) {
                  promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, 'soft', i));
                }
                return Promise.all(promises);
              }));

            return txPromise
              .then(() => {
                const txFailPromise = knex.transaction((tx) => knex('users').where('id', userId)
                  .bind({})
                  .then(() => {
                    const promises = [];
                    for (let i = 0, il = 10; i < il; i++) {
                      promises.push(InventoryModule.addBoosterPackToUser(txFailPromise, tx, userId, cardSetId, 'soft', i));
                    }
                    return Promise.all(promises);
                  }));
                return txFailPromise;
              }).then((results) => {
                // Should never reach here
                expect(results).to.not.exist;
                expect(results).to.exist;
              }).catch((error) => {
                expect(error).to.exist;
                expect(error).to.not.be.an.instanceof(chai.AssertionError);
                expect(error).to.be.an.instanceof(Errors.MaxOrbsForSetReachedError);
              });
          });
      });
    });
  }
  */

  describe('addRemainingOrbsForCardSetToUser', () => {
    it('expect to be able to add a full set of orbs to user with no orbs for that set, expect no gold to be awarded', () => SyncModule.wipeUserData(userId)
      .then(() => {
        const txPromise = knex.transaction((tx) => InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, false, 'qa unit test', generatePushId()));
        return txPromise;
      }).then(() => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_spirit_orbs').where('user_id', userId).andWhere('card_set', SDK.CardSet.Bloodborn),
      ])).spread((userRow, userOrbRows) => {
        expect(userRow.wallet_gold).to.equal(0);
        expect(userRow.total_orb_count_set_3).to.equal(13);
        expect(userOrbRows.length).to.equal(13);
      }));

    it('expect to be able to add a full set of orbs to user with 3 orbs for that set, expect 900 gold to be awarded', function () {
      this.timeout(100000);
      return SyncModule.wipeUserData(userId)
        .then(() => {
          const txPromise = knex.transaction((tx) => Promise.all([
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
          ]));
          return txPromise;
        }).then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, false, 'qa unit test', generatePushId()));
          return txPromise;
        }).then(() => Promise.all([
          knex('users').where('id', userId).first(),
          knex('user_spirit_orbs').where('user_id', userId).andWhere('card_set', SDK.CardSet.Bloodborn),
        ]))
        .spread((userRow, userOrbRows) => {
          expect(userRow.wallet_gold).to.equal(3 * 300);
          expect(userRow.total_orb_count_set_3).to.equal(13);
          expect(userOrbRows.length).to.equal(13);
        });
    });

    it('expect to be not fail when trying to add remaining set of orbs to user with max orbs for that set, expect no gold to be awarded', function () {
      this.timeout(100000);
      return SyncModule.wipeUserData(userId)
        .then(() => {
          const txPromise = knex.transaction((tx) => Promise.all([
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()), // 5
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()), // 10
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa unit test', generatePushId()),
          ]));
          return txPromise;
        }).then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, false, 'qa unit test', generatePushId()));
          return txPromise;
        }).then((result) => {
          // Never reach
          expect(result).to.exist;
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.MaxOrbsForSetReachedError);

          return Promise.all([
            knex('users').where('id', userId).first(),
            knex('user_spirit_orbs').where('user_id', userId).andWhere('card_set', SDK.CardSet.Bloodborn),
          ]);
        })
        .spread((userRow, userOrbRows) => {
          expect(userRow.wallet_gold).to.equal(0);
          expect(userRow.total_orb_count_set_3).to.equal(13);
          expect(userOrbRows.length).to.equal(13);
        });
    });
  });

  describe('buyRemainingSpiritOrbsWithSpirit', () => {
    it('expect to fail to buy remaining orbs with spirit with insufficient spirit', () => SyncModule.wipeUserData(userId)
      .then(() => {
        const txPromise = knex.transaction((tx) => {
          console.log(`user id: ${userId}`);
          return InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Bloodborn);
        });
        return txPromise;
      }).then((result) => {
        // Should not reach
        expect(result).to.exist;
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
      }));

    it('expect to fail to buy remaining orbs for set with no spirit cost', () => SyncModule.wipeUserData(userId)
      .then(() => {
        const txPromise = knex.transaction((tx) => InventoryModule.giveUserSpirit(txPromise, tx, userId, 4000, 'qa gift'));
        return txPromise;
      }).then(() => {
        const txPromise = knex.transaction((tx) => {
          console.log(`user id: ${userId}`);
          return InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Core);
        });
        return txPromise;
      }).then((result) => {
        // Should not reach
        expect(result).to.exist;
        expect(result).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
      }));

    it('expect to be able to buy entire set of spirit orbs with sufficient spirit', () => {
      const fullSetSpiritCost = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Bloodborn).fullSetSpiritCost;
      return SyncModule.wipeUserData(userId)
        .then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.giveUserSpirit(txPromise, tx, userId, fullSetSpiritCost, 'qa gift'));
          return txPromise;
        }).then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Bloodborn));
          return txPromise;
        }).then((result) => {
          // Should not reach
          expect(result).to.exist;
          expect(result).to.equal(13);

          return Promise.all([
            knex('user_spirit_orbs').where('user_id', userId).andWhere('card_set', SDK.CardSet.Bloodborn),
            knex('users').first('wallet_spirit').where('id', userId),
          ]);
        })
        .spread((spiritOrbs, userRow) => {
          expect(spiritOrbs).to.exist;
          expect(spiritOrbs.length).to.equal(13);
          for (let i = 0; i < spiritOrbs.length; i++) {
            expect(spiritOrbs[i].card_set).to.equal(SDK.CardSet.Bloodborn);
          }
          expect(userRow.wallet_spirit).to.equal(0);
        });
    });

    it('expect to be able to buy remaining set of spirit orbs with sufficient spirit and get correct spirit refund (and no gold)', () => {
      const fullSetSpiritCost = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Bloodborn).fullSetSpiritCost;
      return SyncModule.wipeUserData(userId)
        .then(() => {
          const txPromise = knex.transaction((tx) => Promise.all([
            InventoryModule.giveUserSpirit(txPromise, tx, userId, fullSetSpiritCost, 'qa gift'),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa gift'),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa gift'),
            InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, 'qa gift'),
          ]));
          return txPromise;
        }).then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Bloodborn));
          return txPromise;
        }).then((result) => {
          // Should not reach
          expect(result).to.exist;
          expect(result).to.equal(10);

          return Promise.all([
            knex('user_spirit_orbs').where('user_id', userId).andWhere('card_set', SDK.CardSet.Bloodborn),
            knex('users').first('wallet_spirit', 'wallet_gold').where('id', userId),
          ]);
        })
        .spread((spiritOrbs, userRow) => {
          expect(spiritOrbs).to.exist;
          expect(spiritOrbs.length).to.equal(13);
          for (let i = 0; i < spiritOrbs.length; i++) {
            expect(spiritOrbs[i].card_set).to.equal(SDK.CardSet.Bloodborn);
          }
          expect(userRow.wallet_spirit).to.equal(3 * 300);
          expect(userRow.wallet_gold).to.equal(0);
        });
    });
  });

  /* Test disabled: unsafe (function declaration inside loop)
  for (let i = 0; i < unlockableCardSets.length; i++) {
    const cardSetId = unlockableCardSets[i];
    const cardSetSDKData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
    describe(`unlockBoosterPack() - ${cardSetSDKData.name} set`, () => {
      it('expect to open 13 bloodborn orbs 3 times and always end up with exactly the same cards', function () {
        this.timeout(50000);
        const allBBCardIds = SDK.GameSession.getCardCaches().getCardSet(cardSetId).getIsUnlockable(true).getIsPrismatic(false)
          .getCardIds();
        expect(allBBCardIds.length).to.equal(39);

        const iterations = 3;
        let count = 0;

        const stepIt = function () {
          count += 1;
          if (count > iterations) {
            return Promise.resolve();
          }

          return SyncModule.wipeUserData(userId)
            .then(() => {
              const txPromise = knex.transaction((tx) => knex('users').where('id', userId)
                .bind({})
                .then(() => {
                  const promises = [];
                  for (let i = 0; i < 13; i++) {
                    promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, 'soft', i));
                  }
                  return Promise.all(promises);
                }));

              return txPromise;
            }).then(() => {
              const txPromise = knex.transaction((tx) => tx('user_spirit_orbs').where('user_id', userId)
                .bind({})
                .then((spiritOrbRows) => {
                  const promises = [];
                  expect(spiritOrbRows.length).to.equal(13);
                  for (let i = 0; i < spiritOrbRows.length; i++) {
                    promises.push(InventoryModule.unlockBoosterPack(userId, spiritOrbRows[i].id));
                  }
                  return Promise.all(promises);
                }));
              return txPromise;
            }).then(() => knex('user_cards').where('user_id', userId))
            .then((userCardRows) => {
              expect(userCardRows.length).to.equal(39);
              for (let i = 0; i < userCardRows.length; i++) {
                const row = userCardRows[i];
                expect(row.count).to.equal(3);
                expect(_.contains(allBBCardIds, row.card_id)).to.equal(true);
                const sdkCard = SDK.GameSession.getCardCaches().getCardById(row.card_id);
                expect(sdkCard.getCardSetId()).to.equal(cardSetId);
              }

              return stepIt();
            });
        };

        return stepIt();
      });
    });
  }
  */

  describe('unlockBoosterPack()', () => {
    const openedBoosterId = null;

    it('expect NOT to be able to unlock and INVALID booster pack ID', () => InventoryModule.unlockBoosterPack(userId, 'invalid-pack-id')
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect NOT to be able to unlock a booster that does not belong to you', () => knex('user_spirit_orbs').insert({
      id: 'valid-pack-id',
      user_id: 'some-other-test-user',
    }).then(() => InventoryModule.unlockBoosterPack(userId, 'valid-pack-id')).then((result) => {
      expect(result).to.not.exist;
    })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect to get 5 core set cards for unlocking one of your core set boosters', () => knex('users').where('id', userId).update({ wallet_gold: 100 })
      .bind({})
      .then(() => InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core))
      .then(function (boosterIds) {
        expect(boosterIds).to.exist;
        expect(boosterIds.length).to.equal(1);
        const openedBoosterId = boosterIds[0];
        this.boosterId = openedBoosterId;
        return InventoryModule.unlockBoosterPack(userId, openedBoosterId);
      })
      .then((result) => {
        expect(result).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.first().from('user_spirit_orbs').where({ id: this.boosterId }),
          knex.first().from('user_spirit_orbs_opened').where({ id: this.boosterId }),
          knex.select().from('user_cards').where({ user_id: userId }),
          knex.select().from('user_card_log').where({ user_id: userId }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs').child(this.boosterId), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs-opened').child(this.boosterId), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
        ]);
      })
      .spread((spiritOrb, spiritOrbUsed, cardCountRows, cardLogRows, cardCollection, fbPack, fbPackUsed, fbCardCollection) => {
        expect(spiritOrb).to.not.exist;

        expect(spiritOrbUsed).to.exist;
        expect(spiritOrbUsed.cards).to.exist;
        expect(spiritOrbUsed.cards.length).to.equal(5);

        expect(cardCountRows).to.exist;
        expect(cardCountRows.length).to.be.above(0);

        expect(cardLogRows).to.exist;
        expect(cardLogRows.length).to.be.above(0);

        expect(cardCollection).to.exist;

        expect(fbPack.val()).to.not.exist;
        // expect(fbPackUsed.val()).to.exist;

        expect(fbCardCollection.val()).to.exist;
        expect(fbCardCollection.val()).to.exist;

        const allCards = SDK.GameSession.getCardCaches().getCards();
        _.each(spiritOrbUsed.cards, (cardId) => {
          const card = _.find(allCards, (c) => c.getId() === cardId);
          const cardCountRow = _.find(cardCountRows, (row) => row.card_id === cardId);
          const cardLogCardRows = _.filter(cardLogRows, (row) => row.card_id === cardId);
          const cardCollectionItem = cardCollection.cards[cardId];
          const fbCardCollectionItem = fbCardCollection.val()[cardId];

          expect(card).to.exist;
          expect(card.getCardSetId()).to.equal(SDK.CardSet.Core);
          expect(cardCountRow).to.exist;
          expect(cardLogCardRows.length).to.be.above(0);
          expect(cardCollectionItem).to.exist;
          expect(fbCardCollectionItem).to.exist;

          expect(cardCountRow.count).to.equal(cardLogCardRows.length);
          expect(cardCollectionItem.count).to.equal(cardLogCardRows.length);
          expect(fbCardCollectionItem.count).to.equal(cardLogCardRows.length);
        });
      }));

    it('expect to get 5 shimzar set cards for unlocking one of your shimzar set boosters', () => knex('users').where('id', userId).update({ wallet_gold: 100 })
      .bind({})
      .then(() => InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Shimzar))
      .then(function (boosterIds) {
        expect(boosterIds).to.exist;
        expect(boosterIds.length).to.equal(1);
        const openedBoosterId = boosterIds[0];
        this.boosterId = openedBoosterId;
        return InventoryModule.unlockBoosterPack(userId, openedBoosterId);
      })
      .then((result) => {
        expect(result).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.first().from('user_spirit_orbs').where({ id: this.boosterId }),
          knex.first().from('user_spirit_orbs_opened').where({ id: this.boosterId }),
          knex.select().from('user_cards').where({ user_id: userId }),
          knex.select().from('user_card_log').where({ user_id: userId }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs').child(this.boosterId), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs-opened').child(this.boosterId), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
        ]);
      })
      .spread((spiritOrb, spiritOrbUsed, cardCountRows, cardLogRows, cardCollection, fbPack, fbPackUsed, fbCardCollection) => {
        expect(spiritOrb).to.not.exist;

        expect(spiritOrbUsed).to.exist;
        expect(spiritOrbUsed.cards).to.exist;
        expect(spiritOrbUsed.cards.length).to.equal(5);

        expect(cardCountRows).to.exist;
        expect(cardCountRows.length).to.be.above(0);

        expect(cardLogRows).to.exist;
        expect(cardLogRows.length).to.be.above(0);

        expect(cardCollection).to.exist;

        expect(fbPack.val()).to.not.exist;
        // expect(fbPackUsed.val()).to.exist;

        expect(fbCardCollection.val()).to.exist;
        expect(fbCardCollection.val()).to.exist;

        const allCards = SDK.GameSession.getCardCaches().getCards();
        _.each(spiritOrbUsed.cards, (cardId) => {
          const card = _.find(allCards, (c) => c.getId() === cardId);
          const cardCountRow = _.find(cardCountRows, (row) => row.card_id === cardId);
          const cardLogCardRows = _.filter(cardLogRows, (row) => row.card_id === cardId);
          const cardCollectionItem = cardCollection.cards[cardId];
          const fbCardCollectionItem = fbCardCollection.val()[cardId];

          expect(card).to.exist;
          expect(card.getCardSetId()).to.equal(SDK.CardSet.Shimzar);
          expect(cardCountRow).to.exist;
          expect(cardLogCardRows.length).to.be.above(0);
          expect(cardCollectionItem).to.exist;
          expect(fbCardCollectionItem).to.exist;

          expect(cardCountRow.count).to.equal(cardLogCardRows.length);
          expect(cardCollectionItem.count).to.equal(cardLogCardRows.length);
          expect(fbCardCollectionItem.count).to.equal(cardLogCardRows.length);
        });
      }));

    it('expect cards you received from the booster to be marked as NEW and UNREAD', () => DuelystFirebase.connect().getRootRef()
      .then((rootRef) => Promise.all([
        knex.select().from('user_cards').where({ user_id: userId }),
        knex.select().from('user_card_log').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ])).spread((cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
        _.each(cardCountRows, (row) => {
          expect(row.is_new).to.equal(true);
          expect(row.is_unread).to.equal(true);
          expect(cardCollection.cards[row.card_id].is_new).to.equal(true);
          expect(cardCollection.cards[row.card_id].is_unread).to.equal(true);
          expect(fbCardCollection.val()[row.card_id].is_new).to.equal(true);
          expect(fbCardCollection.val()[row.card_id].is_unread).to.equal(true);
        });
      }));

    it('expect unlocking a booster to mark it as used', () => DuelystFirebase.connect().getRootRef()
      .then((rootRef) => Promise.all([
        knex.first().from('user_spirit_orbs').where({ id: openedBoosterId }),
        knex.first().from('user_spirit_orbs_opened').where({ id: openedBoosterId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs').child(openedBoosterId), 'value'),
      ])).spread((spiritOrb, spiritOrbUsed, fbPack) => {
        expect(spiritOrb).to.not.exist;
        expect(spiritOrbUsed).to.exist;
        expect(fbPack.val()).to.not.exist;
      }));

    it('expect that unlocking 5 packs concurrently works', () => knex('users').where('id', userId).update({ wallet_gold: 500 })
      .bind({})
      .then(() => InventoryModule.buyBoosterPacksWithGold(userId, 5, SDK.CardSet.Core))
      .then((boosterIds) => {
        const all = [];
        _.each(boosterIds, (boosterId) => {
          all.push(InventoryModule.unlockBoosterPack(userId, boosterId));
        });
        return Promise.all(all);
      })
      .then((results) => {
        expect(results).to.exist;
        expect(results.length).to.equal(5);
      }));

    /* Test disabled: slow
    it('expect that no unlockable cards are rewarded by unlocking ~100 boosters', function() {
      this.timeout(100000);

      return SyncModule.wipeUserData(userId)
        .then(function () {
          const txPromise = knex.transaction(function (tx) {
            return knex("users").where('id',userId)
              .bind({})
              .then(function(){
                const promises = [];
                for (let i = 0, il = 100; i < il; i++) {
                  promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i));
                }
                return Promise.all(promises);
              });
          });

        return txPromise
        .then(function(boosterIds){
          return Promise.map(boosterIds,function(boosterId){
            return InventoryModule.unlockBoosterPack(userId,boosterId);
          });
        }).then(function(results) {
            const allCards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();
            for (let i = 0, il = results.length; i < il; i++) {
              const cardIds = results[i].cards;
              for (var j = 0, jl = cardIds.length; j < jl; j++) {
                const cardId = cardIds[j];
                const card = _.find(allCards, function (c) { return c.id === cardId});
                expect(card).to.exist;
                expect(card.getIsUnlockable()).to.equal(false);
              }
            }
        });
      });
    });

    it('expect that no skinned cards are rewarded by unlocking ~100 boosters', function() {
      this.timeout(100000);

      return SyncModule.wipeUserData(userId)
        .then(function () {
          const txPromise = knex.transaction(function (tx) {
            return knex("users").where('id',userId)
              .bind({})
              .then(function(){
                const promises = [];
                for (let i = 0, il = 100; i < il; i++) {
                  promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i));
                }
                return Promise.all(promises);
              });
          });

          return txPromise
            .then(function(boosterIds){
              return Promise.map(boosterIds,function(boosterId){
                return InventoryModule.unlockBoosterPack(userId,boosterId);
              });
            }).then(function(results) {
              const cardCaches = SDK.GameSession.getCardCaches();
              for (let i = 0, il = results.length; i < il; i++) {
                const cardIds = results[i].cards;
                for (var j = 0, jl = cardIds.length; j < jl; j++) {
                  const cardId = cardIds[j];
                  const card = cardCaches.getCardById(cardId);
                  expect(card).to.exist;
                  expect(SDK.Cards.getIsSkinnedCardId(card.getId())).to.equal(false);
                }
              }
            });
        });
    });

    //
    it('expect that no legacy cards are rewarded by unlocking ~500 boosters', function() {
      this.timeout(200000);

      return SyncModule.wipeUserData(userId)
        .then(function () {
          const txPromise = knex.transaction(function (tx) {
            return knex("users").where('id',userId)
              .bind({})
              .then(function(){
                const promises = [];
                const arrayToMap = []
                for (let i = 0, il = 500; i < il; i++) {
                  //promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i));
                  arrayToMap.push(1);
                }
                //return Promise.all(promises);
                return Promise.map(arrayToMap, function (i) {
                  return InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i)
                }, {concurrency:2})
              });
          });

          return txPromise
            .then(function(boosterIds){
              return Promise.map(boosterIds,function(boosterId){
                return InventoryModule.unlockBoosterPack(userId,boosterId);
              });
            }).then(function(results) {
              const cardCaches = SDK.GameSession.getCardCaches();
              for (let i = 0, il = results.length; i < il; i++) {
                const cardIds = results[i].cards;
                for (var j = 0, jl = cardIds.length; j < jl; j++) {
                  const cardId = cardIds[j];
                  const card = cardCaches.getCardById(cardId);
                  expect(card).to.exist;
                  expect(card.getIsLegacy()).to.equal(false);
                }
              }
            });
        });
    });
    */
  });

  describe('giveUserCosmeticId()', () => {
    const openedBoosterId = null;

    it('expect a user to be able to receive a cosmetic by id', () => knex('user_cosmetic_inventory').where('user_id', userId).delete()
      .then(() => {
        const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, SDK.CosmeticsLookup.Emote.HealingMysticHappy, 'QA GIFT', 'QA GIFT 1'));
        return txPromise;
      })
      .then((result) => {
        expect(result).to.exist;
        expect(result.cosmetic_id).to.exist;
        // Spirit is only present if they already have this cosmetic id
        expect(result.spirit).to.not.exist;
        expect(result.cosmetic_id).to.equal(SDK.CosmeticsLookup.Emote.HealingMysticHappy);

        return knex('user_cosmetic_inventory').first().where('user_id', userId);
      })
      .then((cosmeticRow) => {
        expect(cosmeticRow).to.exist;
        expect(cosmeticRow.user_id).to.equal(userId);
        expect(cosmeticRow.transaction_type).to.equal('QA GIFT');
        expect(cosmeticRow.transaction_id).to.equal('QA GIFT 1');
      }));

    it('expect a user to receive spirit the second time they receive the same cosmetic by id', () => knex('user_cosmetic_inventory').where('user_id', userId).delete()
      .bind({})
      .then(() => knex('users').where('id', userId).first('wallet_spirit'))
      .then(function (userRow) {
        this.userSpiritBefore = userRow.wallet_spirit;

        const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, SDK.CosmeticsLookup.Emote.HealingMysticHappy, 'QA GIFT', 'QA GIFT 1'));
        return txPromise;
      })
      .then(() => {
        const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, SDK.CosmeticsLookup.Emote.HealingMysticHappy, 'QA GIFT', 'QA GIFT 1'));
        return txPromise;
      })
      .then((result) => {
        expect(result).to.exist;
        expect(result.cosmetic_id).to.exist;
        expect(result.spirit).to.exist;

        return knex('users').where('id', userId).first('wallet_spirit');
      })
      .then(function (userRow) {
        expect(userRow.wallet_spirit > this.userSpiritBefore).to.equal(true);
      }));
  });

  describe('craftCard()', () => {
    before(() => SyncModule.wipeUserData(userId));

    // save current state of allCardsAvailable as the next few tests will change it
    const allCardsAvailableBefore = config.get('allCardsAvailable');

    describe('when ALL_CARDS_AVAILABLE is FALSE', () => {
      // before cleanup to check if user already exists and delete
      before(function () {
        this.timeout(25000);
        process.env.ALL_CARDS_AVAILABLE = false;
        config.set('allCardsAvailable', false);
        InventoryModule._allCollectibleCards = null;
        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then((fbRootRef) => Promise.all([
            FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('card-collection')),
            knex('user_cards').where('user_id', userId).delete(),
            knex('user_card_log').where('user_id', userId).delete(),
            knex('user_card_collection').where('user_id', userId).delete(),
          ]));
      });

      it('expect NOT to be able to craft a COMMON card with 0 spirit', () => InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser)
        .then((result) => {
          expect(result).to.not.exist;
        }).catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
        }));

      it('expect to be able to craft a COMMON card with 40 spirit in wallet', () => knex('users').where('id', userId).update({
        wallet_spirit: 40,
      }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser))
        .then((result) => {
          expect(result).to.exist;
        }));

      it('expect the crafted card to appear in your inventory as new/unread', () => DuelystFirebase.connect().getRootRef()
        .then((rootRef) => Promise.all([
          knex.select().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.Lightchaser }),
          knex.select().from('user_card_log').where({ user_id: userId, card_id: SDK.Cards.Faction1.Lightchaser }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
        ])).spread((cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
          expect(cardCountRows).to.exist;
          expect(cardCountRows.length).to.equal(1);
          expect(cardCountRows[0].count).to.equal(1);
          expect(cardCountRows[0].is_unread).to.equal(true);
          expect(cardCountRows[0].is_new).to.equal(true);

          expect(cardLogRows).to.exist;
          expect(cardLogRows.length).to.equal(1);
          expect(cardLogRows[0].source_type).to.equal('craft');

          expect(cardCollection).to.exist;
          expect(cardCollection.cards).to.exist;
          expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser].count).to.equal(1);
          expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser].is_unread).to.equal(true);
          expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser].is_new).to.equal(true);

          expect(fbCardCollection.val()).to.exist;
          expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].count).to.equal(1);
          expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].is_unread).to.equal(true);
          expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].is_new).to.equal(true);
        }));

      it('expect to be left with 0 spirit in wallet', () => knex('users').first().where('id', userId).then((userRow) => {
        expect(userRow.wallet_spirit).to.equal(0);
      }));

      it('expect NOT to be able to craft a RARE card with 40 spirit in wallet', () => knex('users').where('id', userId).update({
        wallet_spirit: 40,
      }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.IroncliffeGuardian))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
        }));

      it('expect to be able to craft a RARE card with 100 spirit in wallet', () => knex('users').where('id', userId).update({
        wallet_spirit: 100,
      }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.IroncliffeGuardian))
        .then((result) => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex.select().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.IroncliffeGuardian }),
          knex.select().from('user_card_log').where({ user_id: userId, card_id: SDK.Cards.Faction1.IroncliffeGuardian }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
        ]))
        .spread((cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
          expect(cardCountRows).to.exist;
          expect(cardCountRows.length).to.equal(1);
          expect(cardCountRows[0].count).to.equal(1);
          expect(cardCountRows[0].is_unread).to.equal(true);
          expect(cardCountRows[0].is_new).to.equal(true);

          expect(cardLogRows).to.exist;
          expect(cardLogRows.length).to.equal(1);
          expect(cardLogRows[0].source_type).to.equal('craft');

          expect(cardCollection).to.exist;
          expect(cardCollection.cards).to.exist;
          expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
          expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].is_unread).to.equal(true);
          expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].is_new).to.equal(true);

          expect(fbCardCollection.val()).to.exist;
          expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
          expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].is_unread).to.equal(true);
          expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].is_new).to.equal(true);
        }));

      it('expect NOT to be able to craft a BASIC card', () => knex('users').where('id', userId).update({
        wallet_spirit: 100,
      }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.SilverguardKnight))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        }));

      it('expect NOT to be able to craft a normal ACHIEVEMENT card', () => knex('users').where('id', userId).update({
        wallet_spirit: 900,
      }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Neutral.SwornSister))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        }));

      it('expect NOT to be able to craft a card unlocked only through spirit orbs', () => knex('users').where('id', userId).update({
        wallet_spirit: 900,
      }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction5.Drogon))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        }));

      it('expect NOT to be able to craft a card that becomes available in the future', () => {
        const sunstoneTemplar = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (card) => card.id === SDK.Cards.Faction1.SunstoneTemplar);
        sunstoneTemplar.setAvailableAt(moment().utc().add(1, 'days'));

        return knex('users').where('id', userId).update({
          wallet_spirit: 1000,
        }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.SunstoneTemplar))
          .then((result) => {
            expect(result).to.not.exist;
          })
          .catch((error) => {
            expect(error).to.not.be.an.instanceof(chai.AssertionError);
            expect(error).to.be.an.instanceof(Errors.BadRequestError);
            expect(error.message).to.equal(`Could not craft card ${SDK.Cards.Faction1.SunstoneTemplar}. It's not yet available.`);
          });
      });

      it('expect to be able to craft a card that is NOW available', () => {
        const sunstoneTemplar = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (card) => card.id === SDK.Cards.Faction1.SunstoneTemplar);
        sunstoneTemplar.setAvailableAt(moment().utc().subtract(1, 'days'));

        return knex('users').where('id', userId).update({
          wallet_spirit: 1000,
        }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.SunstoneTemplar))
          .then((result) => DuelystFirebase.connect().getRootRef())
          .then((rootRef) => Promise.all([
            knex.select().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.SunstoneTemplar }),
            knex.select().from('user_card_log').where({ user_id: userId, card_id: SDK.Cards.Faction1.SunstoneTemplar }),
            knex.first().from('user_card_collection').where({ user_id: userId }),
            FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
          ]))
          .spread((cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
            expect(cardCountRows).to.exist;
            expect(cardCountRows.length).to.equal(1);
            expect(cardCountRows[0].count).to.equal(1);
            expect(cardCountRows[0].is_unread).to.equal(true);
            expect(cardCountRows[0].is_new).to.equal(true);

            expect(cardLogRows).to.exist;
            expect(cardLogRows.length).to.equal(1);
            expect(cardLogRows[0].source_type).to.equal('craft');

            expect(cardCollection).to.exist;
            expect(cardCollection.cards).to.exist;
            expect(cardCollection.cards[SDK.Cards.Faction1.SunstoneTemplar].count).to.equal(1);
            expect(cardCollection.cards[SDK.Cards.Faction1.SunstoneTemplar].is_unread).to.equal(true);
            expect(cardCollection.cards[SDK.Cards.Faction1.SunstoneTemplar].is_new).to.equal(true);

            expect(fbCardCollection.val()).to.exist;
            expect(fbCardCollection.val()[SDK.Cards.Faction1.SunstoneTemplar].count).to.equal(1);
            expect(fbCardCollection.val()[SDK.Cards.Faction1.SunstoneTemplar].is_unread).to.equal(true);
            expect(fbCardCollection.val()[SDK.Cards.Faction1.SunstoneTemplar].is_new).to.equal(true);
          });
      });

      it('expect to not be able to craft a card with a skin applied', () => knex('users').where('id', userId).update({
        wallet_spirit: 10000,
      })
        .then(() => InventoryModule.craftCard(userId, SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1)))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        }));

      it('expect to not be able to craft a prismatic card with a skin applied', () => knex('users').where('id', userId).update({
        wallet_spirit: 10000,
      })
        .then(() => InventoryModule.craftCard(userId, SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1)))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        }));
    });

    describe('when ALL_CARDS_AVAILABLE is TRUE', () => {
      // before cleanup to check if user already exists and delete
      before(function () {
        this.timeout(25000);
        process.env.ALL_CARDS_AVAILABLE = true;
        config.set('allCardsAvailable', true);
        InventoryModule._allCollectibleCards = null;
        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then((fbRootRef) => Promise.all([
            FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('card-collection')),
            knex('user_cards').where('user_id', userId).delete(),
            knex('user_card_log').where('user_id', userId).delete(),
            knex('user_card_collection').where('user_id', userId).delete(),
          ]));
      });

      // before cleanup to check if user already exists and delete
      after(function () {
        this.timeout(25000);
        process.env.ALL_CARDS_AVAILABLE = allCardsAvailableBefore;
        config.set('allCardsAvailable', allCardsAvailableBefore);
        InventoryModule._allCollectibleCards = null;
      });

      it('expect to be able to craft a card that becomes available in the future', () => {
        const sunstoneTemplar = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (card) => card.id === SDK.Cards.Faction1.SunstoneTemplar);
        sunstoneTemplar.setAvailableAt(moment().utc().add(5, 'days'));

        return knex('users').where('id', userId).update({
          wallet_spirit: 1000,
        }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.SunstoneTemplar))
          .then((result) => {
            expect(result).to.exist;
          });
      });
    });
  });

  describe('disenchantCard()', () => {
    // before cleanup to check if user already exists and delete
    before(function () {
      this.timeout(25000);
      return DuelystFirebase.connect().getRootRef()
        .bind({})
        .then((fbRootRef) => Promise.all([
          FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('card-collection')),
          knex('user_cards').where('user_id', userId).delete(),
          knex('user_card_log').where('user_id', userId).delete(),
          knex('user_card_collection').where('user_id', userId).delete(),
        ]));
    });

    it('expect NOT to be able to disenchant a COMMON card you do not own', () => InventoryModule.disenchantCards(userId, [SDK.Cards.Faction1.Lightchaser])
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect to be able to disenchant a COMMON card and receive 10 spirit', () => knex('users').where('id', userId).update({
      wallet_spirit: 40,
    }).then(() => InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser))
      .then(() => InventoryModule.disenchantCards(userId, [SDK.Cards.Faction1.Lightchaser]))
      .then((result) => {
        expect(result).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.Lightchaser }),
        knex.select().from('user_card_log').where({ user_id: userId, card_id: SDK.Cards.Faction1.Lightchaser }).orderBy('created_at', 'desc'),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
      ]))
      .spread((userRow, cardCountRows, cardLogRows, cardCollection, fbCardCollection, fbWallet) => {
        // expect 10 spirit in wallet
        expect(userRow.wallet_spirit).to.equal(10);
        expect(fbWallet.val().spirit_amount).to.equal(10);

        // expect no card counts
        expect(cardCountRows).to.exist;
        expect(cardCountRows.length).to.equal(0);

        // expect 2 log statements, one for craft, and one for the disenchant
        expect(cardLogRows).to.exist;
        expect(cardLogRows.length).to.equal(2);
        expect(cardLogRows[0].source_type).to.equal('disenchant');
        expect(cardLogRows[1].source_type).to.equal('craft');

        expect(cardCollection).to.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser]).to.not.exist;

        expect(fbCardCollection.val()).to.not.exist;
      }));

    it('expect to be able to disenchant a set of COMMON,RARE,EPIC, and LEGENDARY cards for 480 spirit', () => knex('users').where('id', userId).update({
      wallet_spirit: 1390,
    }).then(() => Promise.all([
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser),
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.IroncliffeGuardian),
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Sunriser),
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.GrandmasterZir),
    ]))
      .then(() => InventoryModule.disenchantCards(userId, [
        SDK.Cards.Faction1.Lightchaser,
        SDK.Cards.Faction1.IroncliffeGuardian,
        SDK.Cards.Faction1.Sunriser,
        SDK.Cards.Faction1.GrandmasterZir,
      ]))
      .then((result) => {
        expect(result).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.Lightchaser }),
        knex.select().from('user_card_log').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ]))
      .spread((userRow, cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
        // expect 480 spirit in wallet
        expect(userRow.wallet_spirit).to.equal(480);

        // expect no card counts
        expect(cardCountRows).to.exist;
        expect(cardCountRows.length).to.equal(0);

        // expect 8 log statements so far
        expect(cardLogRows).to.exist;
        expect(cardLogRows.length).to.equal(10);

        expect(cardCollection).to.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser]).to.not.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian]).to.not.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.Sunriser]).to.not.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.GrandmasterZir]).to.not.exist;

        expect(fbCardCollection.val()).to.not.exist;
      }));

    it('expect NOT to be able to disenchant a RARE card you do not own with a COMMON in your inventory', () => knex('users').where('id', userId).update({
      wallet_spirit: 40,
    }).then(() => Promise.all([
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser),
    ]))
      .then(() => InventoryModule.disenchantCards(userId, [SDK.Cards.Faction1.IroncliffeGuardian]))
      .then((result) => {
        expect(result).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect inventory to look right after 1/3 copies of a card are disenchanted', () => knex('users').where('id', userId).update({
      wallet_spirit: 200,
    }).then(() => Promise.all([
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.IroncliffeGuardian),
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.IroncliffeGuardian),
    ]))
      .then(() => InventoryModule.disenchantCards(userId, [SDK.Cards.Faction1.IroncliffeGuardian]))
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex.first().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.IroncliffeGuardian }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ]))
      .spread((cardCountRow, cardCollection, fbCardCollection) => {
        // expect no card counts
        expect(cardCountRow).to.exist;
        expect(cardCountRow.count).to.equal(1);

        expect(cardCollection).to.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian]).to.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);

        expect(fbCardCollection.val()).to.exist;
        expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
      }));

    it('expect inventory to look right after a single card from a larger collection is disechanted', () => InventoryModule.disenchantCards(userId, [SDK.Cards.Faction1.Lightchaser])
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex.select().from('user_cards').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ])).spread((cardCountRows, cardCollection, fbCardCollection) => {
        // expect no card counts
        expect(cardCountRows).to.exist;

        expect(cardCollection).to.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser]).to.not.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian]).to.exist;
        expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);

        expect(fbCardCollection.val()).to.exist;
        expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser]).to.not.exist;
        expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
      }));

    it('expect to be able to disenchant DUPLICATE cards', () => knex('users').where('id', userId).update({
      wallet_spirit: 160,
    }).then(() => Promise.all([
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser),
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser),
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser),
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser),
    ]))
      .then(() => InventoryModule.disenchantDuplicateCards(userId))
      .then((result) => {
        expect(result).to.exist;
        expect(result.wallet.spirit_amount).to.equal(10);
        expect(result.rewards.length).to.equal(1);
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.Lightchaser }),
        knex.select().from('user_card_log').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ]))
      .spread((userRow, cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
        // expect 480 spirit in wallet
        expect(userRow.wallet_spirit).to.equal(10);

        // expect no card counts
        expect(cardCountRows).to.exist;
        expect(cardCountRows.length).to.equal(1);
        expect(cardCountRows[0].count).to.equal(3);

        expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].count).to.equal(3);
      }));

    it('expect disenchanting duplicates again right after to have no effect', () => InventoryModule.disenchantDuplicateCards(userId)
      .then((result) => {
        expect(result).to.exist;
        expect(result.wallet.spirit_amount).to.equal(10);
        expect(result.rewards.length).to.equal(0);
      }));

    it('expect LOCKING when disenchant DUPLICATES to work to avoid race conditions', () => knex('users').where('id', userId).update({
      wallet_spirit: 40,
    }).then(() => Promise.all([
      InventoryModule.craftCard(userId, SDK.Cards.Faction1.Lightchaser),
    ]))
      .then(() => Promise.all([
        InventoryModule.disenchantDuplicateCards(userId),
        InventoryModule.disenchantDuplicateCards(userId),
        InventoryModule.disenchantDuplicateCards(userId),
      ]))
      .spread((result1, result2, result3) =>
        // expect(result1).to.exist;
        // expect(result2.wallet.spirit_amount).to.equal(10);
        // expect(result3.rewards.length).to.equal(1);
        DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_cards').where({ user_id: userId, card_id: SDK.Cards.Faction1.Lightchaser }),
        knex.select().from('user_card_log').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ]))
      .spread((userRow, cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
        // expect 480 spirit in wallet
        expect(userRow.wallet_spirit).to.equal(10);

        // expect no card counts
        expect(cardCountRows).to.exist;
        expect(cardCountRows.length).to.equal(1);
        expect(cardCountRows[0].count).to.equal(3);

        expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].count).to.equal(3);
      }));

    it('expect NOT to be able to disenchant an BASIC card', () => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [SDK.Cards.Spell.Tempest])).then(() => InventoryModule.disenchantCards(userId, [SDK.Cards.Spell.Tempest])).then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      });

      return txPromise;
    });

    it('expect NOT to be able to disenchant an ACHIEVEMENT card', () => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [SDK.Cards.Neutral.SwornSister])).then(() => InventoryModule.disenchantCards(userId, [SDK.Cards.Neutral.SwornSister])).then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.BadRequestError);
      });

      return txPromise;
    });

    it('expect to NOT be able to disenchant a card with a skin applied', () => {
      const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1);
      const skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, skinId))
        .then(() => InventoryModule.disenchantCards(userId, [skinnedCardId]))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to NOT be able to disenchant a prismatic card with a skin applied', () => {
      const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1);
      const skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, skinId))
        .then(() => InventoryModule.disenchantCards(userId, [skinnedCardId]))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });
  });

  describe('giveUserNewPurchasableCosmetic()', () => {
    it('to be able to give each permutation of rarity and/or cosmetic type', () => {
      let permutations = [];
      const cosmeticTypeVals = _.values(SDK.CosmeticsTypeLookup);
      cosmeticTypeVals.push(null);
      const rarityIdVals = [SDK.Rarity.Common, SDK.Rarity.Rare, SDK.Rarity.Epic, SDK.Rarity.Legendary, null];

      for (let i = 0; i < cosmeticTypeVals.length; i++) {
        for (let j = 0; j < rarityIdVals.length; j++) {
          permutations.push([rarityIdVals[j], cosmeticTypeVals[i]]);
        }
      }

      const emptyPermutations = [
        [SDK.Rarity.Common, SDK.CosmeticsTypeLookup.CardBack],
        [SDK.Rarity.Rare, SDK.CosmeticsTypeLookup.CardBack],
        [SDK.Rarity.Legendary, SDK.CosmeticsTypeLookup.CardBack],
        [SDK.Rarity.Epic, SDK.CosmeticsTypeLookup.ProfileIcon],
        [SDK.Rarity.Legendary, SDK.CosmeticsTypeLookup.ProfileIcon],
        [SDK.Rarity.Common, SDK.CosmeticsTypeLookup.MainMenuPlate],
        [SDK.Rarity.Rare, SDK.CosmeticsTypeLookup.MainMenuPlate],
        [SDK.Rarity.Epic, SDK.CosmeticsTypeLookup.MainMenuPlate],
        [SDK.Rarity.Legendary, SDK.CosmeticsTypeLookup.MainMenuPlate],
        [null, SDK.CosmeticsTypeLookup.MainMenuPlate],
        [SDK.Rarity.Common, SDK.CosmeticsTypeLookup.CardSkin],
        [SDK.Rarity.Rare, SDK.CosmeticsTypeLookup.CardSkin],
        [SDK.Rarity.Epic, SDK.CosmeticsTypeLookup.CardSkin],
        [SDK.Rarity.Legendary, SDK.CosmeticsTypeLookup.Emote],
      ];

      permutations = _.filter(permutations, (permutation) => _.find(emptyPermutations, (emptyPermutation) => emptyPermutation[0] === permutation[0] && emptyPermutation[1] === permutation[1]) == null);

      return Promise.each(permutations, (params) => {
        const cosmeticsMatchingParams = _.filter(SDK.CosmeticsFactory.getAllCosmetics(), (cosmeticData) => {
          if (!cosmeticData.purchasable) {
            return false;
          } if (params[0] != null && params[0] !== cosmeticData.rarityId) {
            return false;
          } if (params[1] != null && params[1] !== cosmeticData.typeId) {
            return false;
          }
          return true;
        });

        const purchasableCosmeticExistsForParams = (cosmeticsMatchingParams.length !== 0);

        if (!purchasableCosmeticExistsForParams) {
          return Promise.resolve();
        }
        return SyncModule.wipeUserData(userId).then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, 'qa gift', generatePushId(), params[0], params[1], null));
          return txPromise;
        }).then(() => knex('user_cosmetic_inventory').where('user_id', userId)).then((userCosmeticsRows) => {
          expect(userCosmeticsRows).to.exist;
          expect(userCosmeticsRows.length).to.equal(1);

          const cosmeticRow = userCosmeticsRows[0];
          const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticRow.cosmetic_id);
          expect(cosmeticData).to.exist;
          if (params[0] != null) {
            expect(cosmeticData.rarityId).to.equal(params[0]);
          }
          if (params[1] != null) {
            expect(cosmeticData.typeId).to.equal(params[1]);
          }
        });
      }, { concurrency: 1 });
    });

    it('to give a user the last cosmetic id they dont have for a rarity, and then give them spirit the next time', () => {
      let rareCosmetics = _.clone(SDK.CosmeticsFactory.cosmeticsForRarity(SDK.Rarity.Rare));
      rareCosmetics = _.filter(rareCosmetics, (rareCosmetic) => rareCosmetic.purchasable === true);
      const lastCosmeticToGive = rareCosmetics.pop();

      return SyncModule.wipeUserData(userId)
        .then(() => Promise.map(rareCosmetics, (cosmeticData) => {
          const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, cosmeticData.id, 'qa gift', generatePushId()));
          return txPromise;
        }, { concurrency: 1 })).then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, 'qa gift', generatePushId(), SDK.Rarity.Rare, null, null));
          return txPromise;
        }).then((res) => {
          expect(res).to.exist;
          expect(res.spirit).to.not.exist;
          expect(Object.keys(res).length).to.equal(1);
          expect(res.cosmetic_id).to.equal(lastCosmeticToGive.id);

          return FirebasePromises.once(fbRootRef.child('user-inventory').child(userId).child('cosmetic-inventory').child(res.cosmetic_id), 'value');
        })
        .then((fbCosmeticSnapshot) => {
          expect(fbCosmeticSnapshot).to.exist;
          expect(fbCosmeticSnapshot.val()).to.exist;

          const txPromise = knex.transaction((tx) => InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, 'qa gift', generatePushId(), SDK.Rarity.Rare, null, null));
          return txPromise;
        })
        .then((res) => {
          expect(res).to.exist;
          expect(res.cosmetic_id).to.exist;
          expect(res.spirit).to.exist;
          expect(Object.keys(res).length).to.equal(2);
        });
    });

    it('to give a user the last cosmetic id they dont have for a rarity when using optimization', () => {
      let rareCosmetics = _.clone(SDK.CosmeticsFactory.cosmeticsForRarity(SDK.Rarity.Rare));
      rareCosmetics = _.filter(rareCosmetics, (rareCosmetic) => rareCosmetic.purchasable === true);
      const lastCosmeticToGive = rareCosmetics.pop();
      const cosmeticsOwnedId = _.map(rareCosmetics, (cosmeticData) => cosmeticData.id);

      return SyncModule.wipeUserData(userId)
        .then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, 'qa gift', generatePushId(), SDK.Rarity.Rare, null, cosmeticsOwnedId));
          return txPromise;
        }).then((res) => {
          expect(res).to.exist;
          expect(res.spirit).to.not.exist;
          expect(Object.keys(res).length).to.equal(1);
          expect(res.cosmetic_id).to.equal(lastCosmeticToGive.id);

          return FirebasePromises.once(fbRootRef.child('user-inventory').child(userId).child('cosmetic-inventory').child(res.cosmetic_id), 'value');
        }).then((fbCosmeticSnapshot) => {
          expect(fbCosmeticSnapshot).to.exist;
          expect(fbCosmeticSnapshot.val()).to.exist;
        });
    });

    it('to give a user cosmetics in order of reward order', () => {
      const rareCosmetics = _.clone(SDK.CosmeticsFactory.cosmeticsForRarity(SDK.Rarity.Rare));
      const lastRewardOrder = null;

      return SyncModule.wipeUserData(userId)
        .then(() => Promise.each(rareCosmetics, (cosmeticData) => {
          const txPromise = knex.transaction((tx) => InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, 'qa gift', generatePushId(), SDK.Rarity.Rare, null, null));
          const retPromise = txPromise.then((rewardData) => {
            const cosmeticsData = SDK.CosmeticsFactory.cosmeticForIdentifier(rewardData.cosmetic_id);
            if (lastRewardOrder == null) {
              const lastRewardOrder = cosmeticsData.rewardOrder;
            }
            expect(cosmeticsData.rewardOrder).to.be.at.least(lastRewardOrder);
            const lastRewardOrder = cosmeticsData.rewardOrder;
          });
          return retPromise;
        }, { concurrency: 1 }));
    });
  });

  describe('giveUserCards()', () => {
    // before cleanup to check if user already exists and delete
    before(function () {
      this.timeout(25000);
      return DuelystFirebase.connect().getRootRef()
        .bind({})
        .then((fbRootRef) => Promise.all([
          FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('card-collection')),
          knex('user_cards').where('user_id', userId).delete(),
          knex('user_card_log').where('user_id', userId).delete(),
          knex('user_card_collection').where('user_id', userId).delete(),
        ]));
    });

    it('to work with giving some cards', () => {
      const txPromise = knex.transaction((tx) => {
        InventoryModule.giveUserCards(txPromise, tx, userId, [20157, 10974, 20052, 10014, 10965])
          .then(() => {
            tx.commit();
          })
          .catch((e) => {
            Logger.module('UNITTEST').log(e);
            tx.rollback();
          });
      }).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex.select().from('user_cards').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ])).spread((cardCountRows, cardCollection, fbCardCollection) => {
        expect(cardCountRows.length).to.equal(5);
        expect(_.keys(fbCardCollection.val()).length).to.equal(5);
      });

      return txPromise;
    });

    it('expect duplicates to add up in the collection', () => {
      const txPromise = knex.transaction((tx) => {
        InventoryModule.giveUserCards(txPromise, tx, userId, [20157, 10974, 20052, 10014, 10965])
          .then(() => {
            tx.commit();
          })
          .catch((e) => {
            Logger.module('UNITTEST').log(e);
            tx.rollback();
          });
      }).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex.select().from('user_cards').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ])).spread((cardCountRows, cardCollection, fbCardCollection) => {
        expect(cardCountRows.length).to.equal(5);
        expect(_.keys(fbCardCollection.val()).length).to.equal(5);
        expect(fbCardCollection.val()[20157].count).to.equal(2);
        expect(fbCardCollection.val()[10974].count).to.equal(2);
        expect(fbCardCollection.val()[20052].count).to.equal(2);
        expect(fbCardCollection.val()[10014].count).to.equal(2);
        expect(fbCardCollection.val()[10965].count).to.equal(2);
      });

      return txPromise;
    });

    it('expect giving [] empty array of cards to do nothing', () => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [])).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex.select().from('user_cards').where({ user_id: userId }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ])).spread((cardCountRows, cardCollection, fbCardCollection) => {
        expect(cardCountRows.length).to.equal(5);
        expect(_.reduce(cardCountRows, (memo, row) => memo + row.count, 0)).to.equal(10);
      });

      return txPromise;
    });
  });

  describe('giveUserCodexChapter()', () => {
    before(function () {
      this.timeout(25000);
      return DuelystFirebase.connect().getRootRef()
        .bind({})
        .then((fbRootRef) => Promise.all([
          FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('codex')),
          knex('user_codex_inventory').where('user_id', userId).delete(),
        ]));
    });

    it('to correctly give a user a codex chapter', () => {
      const txPromise = knex.transaction((tx) => {
        InventoryModule.giveUserCodexChapter(txPromise, tx, userId, SDK.CodexChapters.Chapter3)
          .then((chapterIdAwarded) => {
            expect(chapterIdAwarded).to.equal(SDK.CodexChapters.Chapter3);
            tx.commit();
          })
          .catch((e) => {
            Logger.module('UNITTEST').log(e);
            tx.rollback();
          });
        return null;
      });

      return txPromise
        .then(() =>
        // Delay for the firebase write to complete
          Promise.delay(2000)).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
          knex('user_codex_inventory').where('user_id', userId).select('chapter_id'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('codex'), 'value'),
        ])).spread((codexChapterRows, fbCodexCollection) => {
          expect(codexChapterRows.length).to.equal(1);
          expect(_.keys(fbCodexCollection.val()).length).to.equal(1);
        });
    });

    it('to correctly handle giving a user a codex chapter they already own', () => {
      const txPromise = knex.transaction((tx) => {
        InventoryModule.giveUserCodexChapter(txPromise, tx, userId, SDK.CodexChapters.Chapter3)
          .then((chapterIdAwarded) => {
            expect(chapterIdAwarded).to.equal(null);
            tx.commit();
          })
          .catch((e) => {
            Logger.module('UNITTEST').log(e);
            tx.rollback();
          });
        return null;
      });

      return txPromise
        .then(() =>
          // Delay for the firebase write to complete
          Promise.delay(2000)).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
          knex('user_codex_inventory').where('user_id', userId).select('chapter_id'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('codex'), 'value'),
        ])).spread((codexChapterRows, fbCodexCollection) => {
          expect(codexChapterRows.length).to.equal(1);
          expect(_.keys(fbCodexCollection.val()).length).to.equal(1);
        });
    });
  });

  describe('giveUserMissingCodexChapters()', () => {
    before(function () {
      this.timeout(25000);
      return DuelystFirebase.connect().getRootRef()
        .bind({})
        .then((fbRootRef) => Promise.all([
          FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('codex')),
          knex('user_codex_inventory').where('user_id', userId).delete(),
          knex('user_progression').where('user_id', userId).delete(),
        ])
          .then(() => {
            const progressionRowData = {
              user_id: userId,
              game_count: 5,
              win_streak: 0,
              loss_count: 0,
              draw_count: 0,
              unscored_count: 0,
            };
            return knex('user_progression').insert(progressionRowData);
          }));
    });

    it('to correctly give a user their missing codex chapters', () => {
      const numCodexChapters = 0;

      return knex('user_progression').where('user_id', userId).first('game_count')
        .then((progressionRow) => {
          const gameCount = (progressionRow && progressionRow.game_count) || 0;
          const numCodexChapters = SDK.Codex.chapterIdsOwnedByGameCount(gameCount).length;
          return InventoryModule.giveUserMissingCodexChapters(userId);
        })
        .then((chapterIdsAwarded) => {
          expect(chapterIdsAwarded.length).to.equal(numCodexChapters);

          // Delay for the firebase write to complete
          return Promise.delay(2000);
        })
        .then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex('user_codex_inventory').where('user_id', userId).select('chapter_id'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('codex'), 'value'),
        ]))
        .spread((codexChapterRows, fbCodexCollection) => {
          expect(codexChapterRows.length).to.equal(numCodexChapters);
          expect(_.keys(fbCodexCollection.val()).length).to.equal(numCodexChapters);
        })
        .catch((e) => {
          expect(e).to.not.exist;
        });
    });
  });

  describe('markCardAsReadInUserCollection()', () => {
    // before cleanup to check if user already exists and delete
    before(function () {
      this.timeout(25000);
      return DuelystFirebase.connect().getRootRef()
        .bind({})
        .then((fbRootRef) => Promise.all([
          FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('card-collection')),
          FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child('card-lore')),
          knex('user_cards').where('user_id', userId).delete(),
          knex('user_card_log').where('user_id', userId).delete(),
          knex('user_card_collection').where('user_id', userId).delete(),
          knex('user_card_lore_inventory').where('user_id', userId).delete(),
        ]))
        .then(() => {
          const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [20157, 10974]));
          return txPromise;
        });
    });

    it('to mark a card as read', () => InventoryModule.markCardAsReadInUserCollection(userId, 20157)
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex.select().from('user_cards').where({ user_id: userId, card_id: 20157 }),
        knex.first().from('user_card_collection').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
      ])).spread((cardCountRows, cardCollection, fbCardCollection) => {
        expect(cardCountRows[0].is_unread).to.equal(false);
        // NOTE: because the card collection and firebase data update is dererred to the next time inventory is updated, for now they should be TRUE and thus out of sync
        expect(cardCollection.cards[20157].is_unread).to.equal(true);
        expect(fbCardCollection.val()[20157].is_unread).to.equal(true);
      }));

    it('to mark a card\'s lore as read', () => InventoryModule.markCardLoreAsReadInUserCollection(userId, 20157)
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex.select().from('user_card_lore_inventory').where({ user_id: userId, card_id: 20157 }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-lore'), 'value'),
      ])).spread((cardCountRows, fbCardCollection) => {
        expect(cardCountRows[0].is_unread).to.equal(false);
        expect(fbCardCollection.val()[20157].is_unread).to.equal(false);
      }));
  });

  describe('debitGoldFromUser()', () => {
    it('to debit gold correctly', () => {
      const txPromise = knex.transaction((tx) => {
        InventoryModule.giveUserGold(txPromise, tx, userId, 100)
          .then(() => InventoryModule.debitGoldFromUser(txPromise, tx, userId, -50))
          .then(tx.commit)
          .catch(tx.rollback);
      }).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
      ])).spread((userRow, walletRef) => {
        expect(userRow.wallet_gold).to.equal(50);
        expect(walletRef.val().gold_amount).to.equal(50);
      });

      return txPromise;
    });

    it('to NOT be able debit gold if insufficient funds', () => {
      const txPromise = knex.transaction((tx) => {
        InventoryModule.debitGoldFromUser(txPromise, tx, userId, -100)
          .then(tx.commit)
          .catch(tx.rollback);
      }).then((r) => {
        expect(r).to.not.exist;
      }).catch((e) => {
        expect(e).to.not.be.an.instanceof(chai.AssertionError);
        expect(e).to.be.an.instanceof(Errors.InsufficientFundsError);
      }).then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex.first().from('users').where({ id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
        ]))
        .spread((userRow, walletRef) => {
          expect(userRow.wallet_gold).to.equal(50);
          expect(walletRef.val().gold_amount).to.equal(50);
        });

      return txPromise;
    });
  });

  describe('debitSpiritFromUser()', () => {
    before(() => {
      // Give user an initial amount of spirit to test with
      const txPromise = knex.transaction((tx) => {
        InventoryModule.giveUserSpirit(txPromise, tx, userId, 11)
          .then(tx.commit)
          .catch(tx.rollback);
      });
      return txPromise;
    });

    it('to debit spirit correctly', () => {
      const spiritBefore = null;
      const spiritToCredit = 100;
      const spiritToDebit = 25;
      return knex.first().from('users').where({ id: userId })
        .then((userRow) => {
          const spiritBefore = userRow.wallet_spirit;

          const txPromise = knex.transaction((tx) => {
            InventoryModule.giveUserSpirit(txPromise, tx, userId, spiritToCredit)
              .then(() => InventoryModule.debitSpiritFromUser(txPromise, tx, userId, -1 * spiritToDebit))
              .then(tx.commit)
              .catch(tx.rollback);
          });
          return txPromise;
        })
        .then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex.first().from('users').where({ id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
        ]))
        .spread((userRow, walletRef) => {
          expect(userRow.wallet_spirit).to.equal(spiritBefore + spiritToCredit - spiritToDebit);
          expect(walletRef.val().spirit_amount).to.equal(spiritBefore + spiritToCredit - spiritToDebit);// expected 85 to equal 95//95 is correct
        });
    });

    it('to NOT be able debit spirit if insufficient funds', () => {
      const spiritBefore = null;

      return knex.first().from('users').where({ id: userId })
        .then((userRow) => {
          const spiritBefore = userRow.wallet_spirit;

          const txPromise = knex.transaction((tx) => {
            InventoryModule.debitSpiritFromUser(txPromise, tx, userId, -1 * spiritBefore - 100)
              .then(tx.commit)
              .catch(tx.rollback);
          });
          return txPromise;
        })
        .then((r) => {
          expect(r).to.not.exist;
        })
        .catch((e) => {
          expect(e).to.not.be.an.instanceof(chai.AssertionError);
          expect(e).to.be.an.instanceof(Errors.InsufficientFundsError);
        })
        .then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex.first().from('users').where({ id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
        ]))
        .spread((userRow, walletRef) => {
          expect(userRow.wallet_spirit).to.equal(spiritBefore);
          expect(walletRef.val().spirit_amount).to.equal(spiritBefore);
        });
    });
  });

  describe('softWipeUserCardInventory()', function () {
    this.timeout(100000);

    before(() => {
      InventoryModule.SOFTWIPE_AVAILABLE_UNTIL = moment().utc().add(4, 'days');
    });

    describe('if a user attempts to soft wipe after a wipe period has expired', () => {
      it('should throw a BadRequestError', () => InventoryModule.softWipeUserCardInventory(userId, moment(InventoryModule.SOFTWIPE_AVAILABLE_UNTIL).add(1, 'day'))
        .then((r) => {
          expect(r).to.not.exist;
        }).catch((e) => {
          expect(e).to.not.be.an.instanceof(chai.AssertionError);
          expect(e).to.be.an.instanceof(Errors.BadRequestError);
        }));
    });

    describe('if a user has not opened any orbs and has no cards', () => {
      before(() => SyncModule.wipeUserData(userId));
      it('should not make any changes to the account and throw a BadRequestError', () => InventoryModule.softWipeUserCardInventory(userId)
        .then((r) => {
          expect(r).to.not.exist;
        }).catch((e) => {
          expect(e).to.not.be.an.instanceof(chai.AssertionError);
          expect(e).to.be.an.instanceof(Errors.BadRequestError);
        }));
    });

    describe('if a user has only opened spirit orbs and has no other cards', () => {
      before(() => SyncModule.wipeUserData(userId)
        .then(() => knex('users').where('id', userId).update({ wallet_gold: 200 })).then(() => InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core)).then((boosterIds) => {
          const all = [];
          _.each(boosterIds, (boosterId) => {
            all.push(InventoryModule.unlockBoosterPack(userId, boosterId));
          });
          return Promise.all(all);
        })
        .then(() => InventoryModule.softWipeUserCardInventory(userId))
        .catch((error) => {
          console.error(error);
          throw error;
        }));
      it('should wipe the collection entirely', () => Promise.all([
        knex('user_cards').where('user_id', userId),
        knex('user_card_collection').first().where('user_id', userId),
      ]).spread((cardCountRows, cardCollectionRow) => {
        expect(cardCountRows.length).to.equal(0);
        expect(_.keys(cardCollectionRow.cards).length).to.equal(0);
      }));
      it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', () => Promise.all([
        knex('user_spirit_orbs').where('user_id', userId),
        knex('user_spirit_orbs_opened').where('user_id', userId),
      ]).spread((orbs, orbsOpened) => {
        expect(orbs.count).to.equal(orbsOpened.count);
        _.each(orbsOpened, (openedOrb) => {
          expect(openedOrb.wiped_at).to.exist;
        });
      }));
      it('should have created card log ledger items for the wipe', () => knex('user_card_log').where('user_id', userId)
        .then((cardLogRows) => {
          // count all debits
          const debits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (!cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
            // count all credits
          const credits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
          expect(credits).to.equal(debits);
        }));
    });

    describe('if a user attempts to soft wipe past maximum allowed soft-wipe count', () => {
      InventoryModule.MAX_SOFTWIPE_COUNT = 1;
      it('should throw a BadRequestError', () => InventoryModule.softWipeUserCardInventory(userId)
        .then((r) => {
          expect(r).to.not.exist;
        }).catch((e) => {
          expect(e).to.not.be.an.instanceof(chai.AssertionError);
          expect(e).to.be.an.instanceof(Errors.BadRequestError);
        }));
    });

    describe('if a user has not opened any orbs and has some BASIC cards', () => {
      before(() => SyncModule.wipeUserData(userId)
        .then(() => knex('users').where('id', userId).update({ wallet_gold: 200 })).then(() => knex.transaction((tx) => InventoryModule.giveUserCards(null, tx, userId, [11, 11, 11], 'faction xp'))));
      it('should not make any changes to the account and throw a BadRequestError', () => InventoryModule.softWipeUserCardInventory(userId)
        .then((r) => {
          expect(r).to.not.exist;
        }).catch((e) => {
          expect(e).to.not.be.an.instanceof(chai.AssertionError);
          expect(e).to.be.an.instanceof(Errors.BadRequestError);
        }));
      it('should still have BASIC cards in the inventory', () => Promise.all([
        knex('user_cards').where('user_id', userId).andWhere('card_id', 11),
        knex('user_card_collection').first().where('user_id', userId),
      ]).spread((cardCountRows, cardCollectionRow) => {
        expect(cardCountRows.length).to.equal(1);
        expect(cardCountRows[0].count).to.equal(3);
        expect(cardCollectionRow.cards[11].count).to.equal(3);
      }));
      it('should leave card log ledger items unchanged', () => knex('user_card_log').where('user_id', userId)
        .then((cardLogRows) => {
          // count all debits
          const debits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (!cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
            // count all credits
          const credits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
          expect(credits).to.equal(3);
          expect(debits).to.equal(0);
        }));
    });

    describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards', () => {
      before(() => SyncModule.wipeUserData(userId)
        .then(() => knex('users').where('id', userId).update({ wallet_gold: 300 })).then(() => InventoryModule.buyBoosterPacksWithGold(userId, 3, SDK.CardSet.Core)).then((boosterIds) => {
          const all = [];
          _.each(boosterIds, (boosterId) => {
            all.push(InventoryModule.unlockBoosterPack(userId, boosterId));
          });
          return Promise.all(all);
        })
        .then(() => knex.transaction((tx) => Promise.all([
          InventoryModule.giveUserCards(null, tx, userId, [11, 11, 11], 'faction xp'),
          InventoryModule.giveUserCards(null, tx, userId, [19005, 19005], 'bogus achievement'),
          InventoryModule.giveUserCards(null, tx, userId, [10307, 10307], 'gauntlet'),
        ])))
        .then(() => InventoryModule.softWipeUserCardInventory(userId))
        .catch((error) => {
          console.error(error);
          throw error;
        }));

      it('should still have BASIC cards in the inventory and card ledger count should be accurate', () => Promise.all([
        knex('user_cards').where('user_id', userId),
        knex('user_card_collection').first().where('user_id', userId),
      ]).spread((cardCountRows, cardCollectionRow) => {
        expect(cardCountRows.length).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 11).count).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 19005).count).to.equal(2);
        expect(_.find(cardCountRows, (c) => c.card_id === 10307).count).to.equal(2);
        expect(_.keys(cardCollectionRow.cards).length).to.equal(3);
        expect(cardCollectionRow.cards[11].count).to.equal(3);
        expect(cardCollectionRow.cards[19005].count).to.equal(2);
        expect(cardCollectionRow.cards[10307].count).to.equal(2);
      }));
      it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', () => Promise.all([
        knex('user_spirit_orbs').where('user_id', userId),
        knex('user_spirit_orbs_opened').where('user_id', userId),
      ]).spread((orbs, orbsOpened) => {
        expect(orbs.count).to.equal(orbsOpened.count);
        _.each(orbsOpened, (openedOrb) => {
          expect(openedOrb.wiped_at).to.exist;
        });
      }));
      it('should have created card log ledger items for the wipe', () => knex('user_card_log').where('user_id', userId)
        .then((cardLogRows) => {
          // count all debits
          const debits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (!cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
            // count all credits
          const credits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
          expect(credits).to.equal(22);
          expect(debits).to.equal(15);
        }));
    });

    describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted some orb cards', () => {
      before(() => SyncModule.wipeUserData(userId)
        .then(() => knex('users').where('id', userId).update({ wallet_gold: 300 })).then(() => InventoryModule.buyBoosterPacksWithGold(userId, 3, SDK.CardSet.Core)).then((boosterIds) => {
          const all = [];
          _.each(boosterIds, (boosterId) => {
            all.push(InventoryModule.unlockBoosterPack(userId, boosterId));
          });
          return Promise.all(all);
        })
        .then((orbResults) => InventoryModule.disenchantCards(userId, orbResults[0].cards))
        .then(() => knex.transaction((tx) => Promise.all([
          InventoryModule.giveUserCards(null, tx, userId, [11, 11, 11], 'faction xp'),
          InventoryModule.giveUserCards(null, tx, userId, [19005, 19005], 'bogus achievement'),
          InventoryModule.giveUserCards(null, tx, userId, [10307, 10307], 'gauntlet'),
        ])))
        .then(() => InventoryModule.softWipeUserCardInventory(userId)));

      it('should still have BASIC and ACHIEVEMENT cards in the inventory and card ledger count should be accurate', () => Promise.all([
        knex('user_cards').where('user_id', userId),
        knex('user_card_collection').first().where('user_id', userId),
      ]).spread((cardCountRows, cardCollectionRow) => {
        expect(cardCountRows.length).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 11).count).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 19005).count).to.equal(2);
        expect(_.find(cardCountRows, (c) => c.card_id === 10307).count).to.equal(2);
        expect(_.keys(cardCollectionRow.cards).length).to.equal(3);
        expect(cardCollectionRow.cards[11].count).to.equal(3);
        expect(cardCollectionRow.cards[19005].count).to.equal(2);
        expect(cardCollectionRow.cards[10307].count).to.equal(2);
      }));
      it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', () => Promise.all([
        knex('user_spirit_orbs').where('user_id', userId),
        knex('user_spirit_orbs_opened').where('user_id', userId),
      ]).spread((orbs, orbsOpened) => {
        expect(orbs.count).to.equal(orbsOpened.count);
        _.each(orbsOpened, (openedOrb) => {
          expect(openedOrb.wiped_at).to.exist;
        });
      }));
      it('should have created card log ledger items for the wipe', () => knex('user_card_log').where('user_id', userId)
        .then((cardLogRows) => {
          // count all debits
          const debits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (!cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
            // count all credits
          const credits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
          expect(credits).to.equal(27);
          expect(debits).to.equal(20);
        }));
      it('should set users wallet spirit to 0 and create a currency ledger item for it', () => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_currency_log').whereNotNull('spirit').andWhere('user_id', userId).select(),
      ]).spread((userRow, currencyLogRows) => {
        expect(userRow.wallet_spirit).to.equal(0);
        expect(currencyLogRows.length).to.equal(2);
        expect(_.find(currencyLogRows, (c) => c.memo === 'soft wipe')).to.exist;
      }));
    });

    describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted their ACHIEVEMENT cards', () => {
      before(() => SyncModule.wipeUserData(userId)
        .then(() => knex('users').where('id', userId).update({ wallet_gold: 300 })).then(() => InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core)).then((boosterIds) => {
          const all = [];
          _.each(boosterIds, (boosterId) => {
            all.push(InventoryModule.unlockBoosterPack(userId, boosterId));
          });
          return Promise.all(all);
        })
        .then(() => knex.transaction((tx) => Promise.all([
          InventoryModule.giveUserCards(null, tx, userId, [11, 11, 11], 'faction xp'),
          InventoryModule.giveUserCards(null, tx, userId, [19005, 19005], 'bogus achievement'),
          InventoryModule.giveUserCards(null, tx, userId, [10307, 10307], 'gauntlet'),
        ])))
        .then((orbResults) => InventoryModule.disenchantCards(userId, [19005, 19005]))
        .then(() => InventoryModule.softWipeUserCardInventory(userId)));

      it('should restore BASIC and ACHIEVEMENT cards in the inventory', () => Promise.all([
        knex('user_cards').where('user_id', userId),
        knex('user_card_collection').first().where('user_id', userId),
      ]).spread((cardCountRows, cardCollectionRow) => {
        expect(cardCountRows.length).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 11).count).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 19005).count).to.equal(2);
        expect(_.find(cardCountRows, (c) => c.card_id === 10307).count).to.equal(2);
        expect(_.keys(cardCollectionRow.cards).length).to.equal(3);
        expect(cardCollectionRow.cards[11].count).to.equal(3);
        expect(cardCollectionRow.cards[19005].count).to.equal(2);
        expect(cardCollectionRow.cards[10307].count).to.equal(2);
      }));
      it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', () => Promise.all([
        knex('user_spirit_orbs').where('user_id', userId),
        knex('user_spirit_orbs_opened').where('user_id', userId),
      ]).spread((orbs, orbsOpened) => {
        expect(orbs.count).to.equal(orbsOpened.count);
        _.each(orbsOpened, (openedOrb) => {
          expect(openedOrb.wiped_at).to.exist;
        });
      }));
      it('should have created card log ledger items for the wipe', () => knex('user_card_log').where('user_id', userId)
        .then((cardLogRows) => {
          // count all debits
          const debits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (!cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
            // count all credits
          const credits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
          expect(credits).to.equal(17 + 2);
          expect(debits).to.equal(10 + 2);
        }));
      it('should set users wallet spirit to 0 and create a currency ledger item for it', () => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_currency_log').whereNotNull('spirit').andWhere('user_id', userId).select(),
      ]).spread((userRow, currencyLogRows) => {
        expect(userRow.wallet_spirit).to.equal(0);
        expect(currencyLogRows.length).to.equal(2);
        expect(_.find(currencyLogRows, (c) => c.memo === 'soft wipe')).to.exist;
      }));
    });

    describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted their entire collection', () => {
      before(() => SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({ wallet_gold: 300 })).then(() => InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core))
        .then((boosterIds) => {
          const all = [];
          _.each(boosterIds, (boosterId) => {
            all.push(InventoryModule.unlockBoosterPack(userId, boosterId));
          });
          return Promise.all(all);
        })
        .then(function (orbs) {
          this.orbs = orbs;
          return knex.transaction((tx) => Promise.all([
            InventoryModule.giveUserCards(null, tx, userId, [11, 11, 11], 'faction xp'),
            InventoryModule.giveUserCards(null, tx, userId, [19005, 19005], 'bogus achievement'),
            InventoryModule.giveUserCards(null, tx, userId, [10307, 10307], 'gauntlet'),
          ]));
        })
        .then(function (orbResults) {
          return Promise.all([
            InventoryModule.disenchantCards(userId, this.orbs[0].cards),
            InventoryModule.disenchantCards(userId, this.orbs[1].cards),
            InventoryModule.disenchantCards(userId, [19005, 19005, 10307, 10307]),
          ]);
        })
        .then(() => InventoryModule.softWipeUserCardInventory(userId)));

      it('should restore BASIC and ACHIEVEMENT cards in the inventory', () => Promise.all([
        knex('user_cards').where('user_id', userId),
        knex('user_card_collection').first().where('user_id', userId),
      ]).spread((cardCountRows, cardCollectionRow) => {
        expect(cardCountRows.length).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 11).count).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 19005).count).to.equal(2);
        expect(_.find(cardCountRows, (c) => c.card_id === 10307).count).to.equal(2);
        expect(_.keys(cardCollectionRow.cards).length).to.equal(3);
        expect(cardCollectionRow.cards[11].count).to.equal(3);
        expect(cardCollectionRow.cards[19005].count).to.equal(2);
        expect(cardCollectionRow.cards[10307].count).to.equal(2);
      }));
      it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', () => Promise.all([
        knex('user_spirit_orbs').where('user_id', userId),
        knex('user_spirit_orbs_opened').where('user_id', userId),
      ]).spread((orbs, orbsOpened) => {
        expect(orbs.count).to.equal(orbsOpened.count);
        _.each(orbsOpened, (openedOrb) => {
          expect(openedOrb.wiped_at).to.exist;
        });
      }));
      it('should have created card log ledger items for the wipe', () => knex('user_card_log').where('user_id', userId)
        .then((cardLogRows) => {
          // count all debits
          const debits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (!cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
            // count all credits
          const credits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
          expect(credits).to.equal(17 + 10 + 4);
          expect(debits).to.equal(10 + 10 + 4);
        }));
      it('should set users wallet spirit to 0 and create a currency ledger item for it', () => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_currency_log').whereNotNull('spirit').andWhere('user_id', userId).select(),
      ]).spread((userRow, currencyLogRows) => {
        expect(userRow.wallet_spirit).to.equal(0);
        expect(_.find(currencyLogRows, (c) => c.memo === 'soft wipe')).to.exist;
      }));
    });

    describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted all non-basic cards and crafted other cards', () => {
      before(() => SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({ wallet_gold: 300 })).then(() => InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core))
        .then((boosterIds) => {
          const all = [];
          _.each(boosterIds, (boosterId) => {
            all.push(InventoryModule.unlockBoosterPack(userId, boosterId));
          });
          return Promise.all(all);
        })
        .then(function (orbs) {
          this.orbs = orbs;
          return knex.transaction((tx) => Promise.all([
            InventoryModule.giveUserCards(null, tx, userId, [11, 11, 11], 'faction xp'),
            InventoryModule.giveUserCards(null, tx, userId, [19005, 19005], 'bogus achievement'),
            InventoryModule.giveUserCards(null, tx, userId, [10307, 10307], 'gauntlet'),
          ]));
        })
        .then(function (orbResults) {
          return Promise.all([
            InventoryModule.disenchantCards(userId, this.orbs[0].cards),
            InventoryModule.disenchantCards(userId, this.orbs[1].cards),
            InventoryModule.disenchantCards(userId, [19005, 19005, 10307, 10307]),
          ]);
        })
        .then((orbResults) => Promise.all([
          InventoryModule.craftCard(userId, 10985),
        ]))
        .then(() => InventoryModule.softWipeUserCardInventory(userId)));

      it('should restore BASIC and ACHIEVEMENT cards in the inventory', () => Promise.all([
        knex('user_cards').where('user_id', userId),
        knex('user_card_collection').first().where('user_id', userId),
      ]).spread((cardCountRows, cardCollectionRow) => {
        expect(cardCountRows.length).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 11).count).to.equal(3);
        expect(_.find(cardCountRows, (c) => c.card_id === 19005).count).to.equal(2);
        expect(_.find(cardCountRows, (c) => c.card_id === 10307).count).to.equal(2);
        expect(_.keys(cardCollectionRow.cards).length).to.equal(3);
        expect(cardCollectionRow.cards[11].count).to.equal(3);
        expect(cardCollectionRow.cards[19005].count).to.equal(2);
        expect(cardCollectionRow.cards[10307].count).to.equal(2);
      }));
      it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', () => Promise.all([
        knex('user_spirit_orbs').where('user_id', userId),
        knex('user_spirit_orbs_opened').where('user_id', userId),
      ]).spread((orbs, orbsOpened) => {
        expect(orbs.count).to.equal(orbsOpened.count);
        _.each(orbsOpened, (openedOrb) => {
          expect(openedOrb.wiped_at).to.exist;
        });
      }));
      it('should have created card log ledger items for the wipe', () => knex('user_card_log').where('user_id', userId)
        .then((cardLogRows) => {
          // count all debits
          const debits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (!cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
            // count all credits
          const credits = _.reduce(cardLogRows, (memo, cardLogItem) => {
            if (cardLogItem.is_credit) {
              memo += 1;
            }
            return memo;
          }, 0);
          expect(credits).to.equal(17 + 10 + 4 + 1);
          expect(debits).to.equal(10 + 10 + 4 + 1);
        }));
      it('should set users wallet spirit to 0 and create a currency ledger item for it', () => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_currency_log').whereNotNull('spirit').andWhere('user_id', userId).select(),
      ]).spread((userRow, currencyLogRows) => {
        expect(userRow.wallet_spirit).to.equal(0);
        expect(_.find(currencyLogRows, (c) => c.memo === 'soft wipe')).to.exist;
      }));
    });
  });

  describe('prismatics', () => {
    beforeEach(() => SyncModule.wipeUserData(userId));

    it('expect to be able to craft a prismatic non-basic', () => {
      const cardIdToCraft = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
      const cardToCraft = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (card) => card.id === cardIdToCraft);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToCraft))
        .then((result) => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex.select().from('user_cards').where({ user_id: userId, card_id: cardIdToCraft }),
          knex.select().from('user_card_log').where({ user_id: userId, card_id: cardIdToCraft }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
        ]))
        .spread((cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
          expect(cardCountRows).to.exist;
          expect(cardCountRows.length).to.equal(1);
          expect(cardCountRows[0].count).to.equal(1);
          expect(cardCountRows[0].is_unread).to.equal(true);
          expect(cardCountRows[0].is_new).to.equal(true);

          expect(cardLogRows).to.exist;
          expect(cardLogRows.length).to.equal(1);
          expect(cardLogRows[0].source_type).to.equal('craft');

          expect(cardCollection).to.exist;
          expect(cardCollection.cards).to.exist;
          expect(cardCollection.cards[cardIdToCraft].count).to.equal(1);
          expect(cardCollection.cards[cardIdToCraft].is_unread).to.equal(true);
          expect(cardCollection.cards[cardIdToCraft].is_new).to.equal(true);

          expect(fbCardCollection.val()).to.exist;
          expect(fbCardCollection.val()[cardIdToCraft].count).to.equal(1);
          expect(fbCardCollection.val()[cardIdToCraft].is_unread).to.equal(true);
          expect(fbCardCollection.val()[cardIdToCraft].is_new).to.equal(true);
        });
    });

    it('expect to be able to disenchant a prismatic non-basic', () => {
      const cardIdToDisenchant = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
      const cardToDisenchant = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (card) => card.id === cardIdToDisenchant);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToDisenchant.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToDisenchant))
        .then(() => InventoryModule.disenchantCards(userId, [cardIdToDisenchant]))
        .then((result) => {
          expect(result).to.exist;
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.select().from('user_cards').where({ user_id: userId, card_id: cardIdToDisenchant }),
          knex.select().from('user_card_log').where({ user_id: userId, card_id: cardIdToDisenchant }).orderBy('created_at', 'desc'),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
        ]))
        .spread((cardCountRows, cardLogRows, cardCollection, fbCardCollection) => {
        // expect no card counts
          expect(cardCountRows).to.exist;
          expect(cardCountRows.length).to.equal(0);

          // expect 2 log statements, one for craft, and one for the disenchant
          expect(cardLogRows).to.exist;
          expect(cardLogRows.length).to.equal(2);
          expect(cardLogRows[0].source_type).to.equal('disenchant');
          expect(cardLogRows[1].source_type).to.equal('craft');

          expect(cardCollection).to.exist;
          expect(cardCollection.cards[cardIdToDisenchant]).to.not.exist;

          expect(fbCardCollection.val()).to.not.exist;
        });
    });

    it('expect crafting a prismatic non-basic to cost more spirit than the normal version', () => {
      const cardIdToCraft = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
      const cardToCraft = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (card) => card.id === cardIdToCraft);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCost,
      }).then(() => InventoryModule.craftCard(userId, cardIdToCraft))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error instanceof Errors.InsufficientFundsError).to.equal(true);
        });
    });

    it('expect disenchanting a prismatic non-basic to reward more spirit than the normal version', () => {
      const cardIdToDisenchant = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
      const cardToDisenchant = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (card) => card.id === cardIdToDisenchant);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToDisenchant.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToDisenchant))
        .then(() => InventoryModule.disenchantCards(userId, [cardIdToDisenchant]))
        .then((result) => {
          expect(result).to.exist;
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('users').where({ id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
        ]))
        .spread((userRow, fbWallet) => {
        // expect prismatic disenchant spirit in wallet
          expect(userRow.wallet_spirit).to.equal(rarityData.spiritRewardPrismatic);
          expect(fbWallet.val().spirit_amount).to.equal(rarityData.spiritRewardPrismatic);
        })
        .then(() => knex('users').where('id', userId).update({
          wallet_spirit: rarityData.spiritCost,
        }))
        .then(() => InventoryModule.craftCard(userId, SDK.Cards.getBaseCardId(cardIdToDisenchant)))
        .then(() => InventoryModule.disenchantCards(userId, [SDK.Cards.getBaseCardId(cardIdToDisenchant)]))
        .then((result) => {
          expect(result).to.exist;
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('users').where({ id: userId }),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
        ]))
        .spread((userRow, fbWallet) => {
        // expect normal disenchant spirit in wallet
          expect(userRow.wallet_spirit).to.equal(rarityData.spiritReward);
          expect(fbWallet.val().spirit_amount).to.equal(rarityData.spiritReward);
        });
    });

    it('expect to not be able to craft a prismatic basic card', () => {
      const cardIdToCraft = SDK.Cards.Faction1.WindbladeAdept + SDK.Cards.Prismatic;
      const gameSession = SDK.GameSession.create();
      const cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToCraft))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to not be able to disenchant a prismatic basic card', () => {
      const cardIdToDisenchant = SDK.Cards.Faction1.WindbladeAdept + SDK.Cards.Prismatic;

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [cardIdToDisenchant])).then(() => InventoryModule.disenchantCards(userId, [cardIdToDisenchant])).then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
      });

      return txPromise;
    });

    it('expect to not be able to craft a prismatic bloodborn card without base card', () => {
      const cardIdToCraft = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
      const gameSession = SDK.GameSession.create();
      const cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToCraft))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to not be able to craft a prismatic unity card without base card', () => {
      const cardIdToCraft = SDK.Cards.Faction3.Sirocco + SDK.Cards.Prismatic;
      const gameSession = SDK.GameSession.create();
      const cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToCraft))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to not be able to craft an unlockable achievement prismatic card if the normal version is locked', () => {
      const cardIdToCraft = SDK.Cards.Neutral.SwornSister + SDK.Cards.Prismatic;
      const gameSession = SDK.GameSession.create();
      const cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToCraft))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to be able to craft an unlockable achievement prismatic card if the normal version is unlocked', () => {
      const cardIdToCraft = SDK.Cards.Neutral.SwornSister + SDK.Cards.Prismatic;
      const gameSession = SDK.GameSession.create();
      const cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
      const baseCardId = SDK.Cards.getBaseCardId(cardIdToCraft);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [
        baseCardId,
        baseCardId,
        baseCardId,
      ])).then(() => Promise.all([
        knex('user_cards').first().where({ user_id: userId, card_id: baseCardId }),
        knex('users').where('id', userId).update({ wallet_spirit: rarityData.spiritCostPrismatic }),
      ])).spread((cardRow) => {
        expect(cardRow).to.exist;
        expect(cardRow.count).to.be.above(0);
        return InventoryModule.craftCard(userId, cardIdToCraft);
      }).then((result) => {
        expect(result).to.exist;
        return knex('user_cards').first().where({ user_id: userId, card_id: cardIdToCraft });
      })
        .then((cardRow) => {
          expect(cardRow).to.exist;
          expect(cardRow.count).to.be.above(0);
        });

      return txPromise;
    });

    it('expect to be able to disenchant an unlockable achievement prismatic card if the normal version is unlocked', () => {
      const cardIdToDisenchant = SDK.Cards.Neutral.SwornSister + SDK.Cards.Prismatic;
      const baseCardId = SDK.Cards.getBaseCardId(cardIdToDisenchant);

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [
        cardIdToDisenchant,
      ])).then(() => InventoryModule.disenchantCards(userId, [cardIdToDisenchant])).then((result) => {
        expect(result).to.exist;
        return knex('user_cards').first().where({ user_id: userId, card_id: cardIdToDisenchant });
      }).then((cardRow) => {
        expect(cardRow).to.not.exist;
      });

      return txPromise;
    });

    /// /

    it('expect to not be able to craft a spirit orb unlockable prismatic card if the normal version is locked', () => {
      const cardIdToCraft = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
      const gameSession = SDK.GameSession.create();
      const cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      return knex('users').where('id', userId).update({
        wallet_spirit: rarityData.spiritCostPrismatic,
      }).then(() => InventoryModule.craftCard(userId, cardIdToCraft))
        .then((result) => {
          expect(result).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to be able to craft a spirit orb unlockable prismatic card if the normal version is unlocked', () => {
      const cardIdToCraft = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
      const gameSession = SDK.GameSession.create();
      const cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
      const baseCardId = SDK.Cards.getBaseCardId(cardIdToCraft);
      const rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [
        baseCardId,
        baseCardId,
        baseCardId,
      ])).then(() => Promise.all([
        knex('user_cards').first().where({ user_id: userId, card_id: baseCardId }),
        knex('users').where('id', userId).update({ wallet_spirit: rarityData.spiritCostPrismatic }),
      ])).spread((cardRow) => {
        expect(cardRow).to.exist;
        expect(cardRow.count).to.be.above(0);
        return InventoryModule.craftCard(userId, cardIdToCraft);
      }).then((result) => {
        expect(result).to.exist;
        return knex('user_cards').first().where({ user_id: userId, card_id: cardIdToCraft });
      })
        .then((cardRow) => {
          expect(cardRow).to.exist;
          expect(cardRow.count).to.be.above(0);
        });

      return txPromise;
    });

    it('expect to be able to disenchant a spirit orb unlockable prismatic card if the normal version is unlocked', () => {
      const cardIdToDisenchant = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
      const baseCardId = SDK.Cards.getBaseCardId(cardIdToDisenchant);

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCards(txPromise, tx, userId, [
        cardIdToDisenchant,
      ])).then(() => InventoryModule.disenchantCards(userId, [cardIdToDisenchant])).then((result) => {
        expect(result).to.exist;
        return knex('user_cards').first().where({ user_id: userId, card_id: cardIdToDisenchant });
      }).then((cardRow) => {
        expect(cardRow).to.not.exist;
      });

      return txPromise;
    });
  });

  describe('Test cached card methods', () => {
    after(() => {
      // after we're all done make sure to rebuild cache one more time
      const cards = SDK.GameSession.getCardCaches().getCards();
    });

    it('expect cache to contain cards in each major category', () => {
      expect(SDK.GameSession.getCardCaches().getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getCardIds().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getCardsData().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction1).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction2).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction3).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction4).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction5).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction6).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Neutral).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Common).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Rare).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Epic).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Spell).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Artifact).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Tile).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Neutral).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Golem).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Arcanyst).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Dervish).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Mech).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Vespyr).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Structure).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.BattlePet).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Warmaster).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getIsCollectible(false).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getIsUnlockable(true).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getIsUnlockable(false).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getIsPrismatic(true).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getIsPrismatic(false).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getIsSkinned(true).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getIsSkinned(false).getCards().length > 0).to.equal(true);

      expect(SDK.GameSession.getCardCaches().getIsHiddenInCollection(true).getCards().length > 0).to.equal(true);
      expect(SDK.GameSession.getCardCaches().getIsHiddenInCollection(false).getCards().length > 0).to.equal(true);
    });

    it('expect only prismatic cards in all cards filtered by prismatic', () => {
      const cards = SDK.GameSession.getCardCaches().getIsPrismatic(true).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(SDK.Cards.getIsPrismaticCardId(cards[i].getId())).to.equal(true);
      }
    });

    it('expect only non-prismatic cards in all cards filtered by non-prismatic', () => {
      const cards = SDK.GameSession.getCardCaches().getIsPrismatic(false).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(SDK.Cards.getIsPrismaticCardId(cards[i].getId())).to.equal(false);
      }
    });

    it('expect only collectible cards in all cards filtered by collectible', () => {
      const cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getIsCollectible()).to.equal(true);
      }
    });

    it('expect only non-collectible cards in all cards filtered by non-collectible', () => {
      const cards = SDK.GameSession.getCardCaches().getIsCollectible(false).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getIsCollectible()).to.equal(false);
      }
    });

    it('expect only unlockable cards in all cards filtered by unlockable', () => {
      const cards = SDK.GameSession.getCardCaches().getIsUnlockable(true).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getIsUnlockable()).to.equal(true);
      }
    });

    it('expect only non-unlockable cards in all cards filtered by non-unlockable', () => {
      const cards = SDK.GameSession.getCardCaches().getIsUnlockable(false).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getIsUnlockable()).to.equal(false);
      }
    });

    it('expect only general cards in all cards filtered by general', () => {
      const cards = SDK.GameSession.getCardCaches().getIsGeneral(true).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i] instanceof SDK.Entity && cards[i].getIsGeneral()).to.equal(true);
      }
    });

    it('expect only non-general cards in all cards filtered by non-general', () => {
      const cards = SDK.GameSession.getCardCaches().getIsGeneral(false).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(!(cards[i] instanceof SDK.Entity) || !cards[i].getIsGeneral()).to.equal(true);
      }
    });

    it('expect only rare cards in all cards filtered by rare', () => {
      const cards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Rare).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Rare);
      }
    });

    it('expect only faction 1 cards in all cards filtered by faction 1', () => {
      const cards = SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction1).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getFactionId()).to.equal(SDK.Factions.Faction1);
      }
    });

    it('expect only common faction 2 cards in all cards filtered by faction 2 commons', () => {
      const cards = SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction2).getRarity(SDK.Rarity.Common).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getFactionId()).to.equal(SDK.Factions.Faction2);
        expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Common);
      }
    });

    it('expect only core set epic faction 3 cards in all cards filtered by core set faction 3 epics', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction3).getRarity(SDK.Rarity.Epic)
        .getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getCardSetId()).to.equal(SDK.CardSet.Core);
        expect(cards[i].getFactionId()).to.equal(SDK.Factions.Faction3);
        expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Epic);
      }
    });

    it('expect only shimzar set neutral cards in all cards filtered by shimzar set neutrals', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getFaction(SDK.Factions.Neutral).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getCardSetId()).to.equal(SDK.CardSet.Shimzar);
        expect(cards[i].getFactionId()).to.equal(SDK.Factions.Neutral);
      }
    });

    it('expect only shimzar set rare cards in all cards filtered by shimzar set rares', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getRarity(SDK.Rarity.Rare).getCards();
      expect(cards.length > 0).to.equal(true);
      for (let i = 0, il = cards.length; i < il; i++) {
        expect(cards[i].getCardSetId()).to.equal(SDK.CardSet.Shimzar);
        expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Rare);
      }
    });

    it('expect to be able to get card data for Silverguard Knight', () => {
      const cards = SDK.GameSession.getCardCaches().getCards();

      const siverguardKnight = _.find(cards, (c) => c.id === SDK.Cards.Faction1.SilverguardKnight);
      expect(siverguardKnight).to.exist;
    });

    it('expect to be able to get card data for Argeon Highmayne', () => {
      const cards = SDK.GameSession.getCardCaches().getCards();

      const argeonHighmayne = _.find(cards, (c) => c.id === SDK.Cards.Faction1.General);
      expect(argeonHighmayne).to.exist;
    });

    it('expect to be able to get card data for Sarlac', () => {
      const cards = SDK.GameSession.getCardCaches().getCards();

      const sarlac = _.find(cards, (c) => c.id === SDK.Cards.Neutral.SarlacTheEternal);
      expect(sarlac).to.exist;
    });

    it('expect not to be able collect a Silverguard Knight', () => {
      const cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();

      const siverguardKnight = _.find(cards, (c) => c.id === SDK.Cards.Faction1.SilverguardKnight);
      expect(siverguardKnight).to.not.exist;
    });

    it('expect not to be able collect an Argeon Highmayne', () => {
      const cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();

      const argeonHighmayne = _.find(cards, (c) => c.id === SDK.Cards.Faction1.General);
      expect(argeonHighmayne).to.not.exist;
    });

    it('expect to be able to collect Sarlac', () => {
      const cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();

      const sarlac = _.find(cards, (c) => c.id === SDK.Cards.Neutral.SarlacTheEternal);
      expect(sarlac).to.exist;
    });

    it('expect to be able to get collectible card data for Sarlac when filtering by legendary rarity', () => {
      const cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getRarity(SDK.Rarity.Legendary).getCards();

      const sarlac = _.find(cards, (c) => c.id === SDK.Cards.Neutral.SarlacTheEternal);
      expect(sarlac).to.exist;
    });

    it('expect Sarlac card id to exist in collectible card ids', () => {
      const cardIds = SDK.GameSession.getCardCaches().getIsCollectible(true).getCardIds();

      const sarlac = _.find(cardIds, (id) => id === SDK.Cards.Neutral.SarlacTheEternal);
      expect(sarlac).to.exist;
    });

    it('expect Sarlac card id to exist in collectible card ids filtered by legendary', () => {
      const cardIds = SDK.GameSession.getCardCaches().getIsCollectible(true).getRarity(SDK.Rarity.Legendary).getCardIds();

      const sarlac = _.find(cardIds, (id) => id === SDK.Cards.Neutral.SarlacTheEternal);
      expect(sarlac).to.exist;
    });

    it('expect Sarlac card id to not exist in collectible card ids filtered by epic', () => {
      const cardIds = SDK.GameSession.getCardCaches().getIsCollectible(true).getRarity(SDK.Rarity.Epic).getCardIds();

      const sarlac = _.find(cardIds, (id) => id === SDK.Cards.Neutral.SarlacTheEternal);
      expect(sarlac).to.not.exist;
    });

    it('expect Kron card to not exist in collectible cards filtered by core set', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getIsCollectible(true).getCards();

      const kron = _.find(cards, (card) => card.getId() === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.not.exist;
    });

    it('expect Kron card to exist in collectible cards filtered by shimzar set', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getCards();

      const kron = _.find(cards, (card) => card.getId() === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect Kron card to exist in collectible cards filtered by shimzar set legendaries', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getRarity(SDK.Rarity.Legendary)
        .getCards();

      const kron = _.find(cards, (card) => card.getId() === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect Kron card to exist in collectible cards filtered by shimzar set neutrals', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral)
        .getCards();

      const kron = _.find(cards, (card) => card.getId() === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect Kron card to exist in collectible cards filtered by shimzar set neutral legendaries', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral)
        .getRarity(SDK.Rarity.Legendary)
        .getCards();

      const kron = _.find(cards, (card) => card.getId() === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect Kron card id to not exist in collectible card ids filtered by core set', () => {
      const cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getIsCollectible(true).getCards();

      const kron = _.find(cards, (id) => id === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.not.exist;
    });

    it('expect Kron card id to exist in collectible card ids filtered by shimzar set', () => {
      const cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getCardIds();

      const kron = _.find(cardIds, (id) => id === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect Kron card id to exist in collectible card ids filtered by shimzar set legendaries', () => {
      const cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getRarity(SDK.Rarity.Legendary)
        .getCardIds();

      const kron = _.find(cardIds, (id) => id === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect Kron card id to exist in collectible card ids filtered by shimzar set neutrals', () => {
      const cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral)
        .getCardIds();

      const kron = _.find(cardIds, (id) => id === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect Kron card id to exist in collectible card ids filtered by shimzar set neutral legendaries', () => {
      const cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral)
        .getRarity(SDK.Rarity.Legendary)
        .getCardIds();

      const kron = _.find(cardIds, (id) => id === SDK.Cards.Neutral.InquisitorKron);
      expect(kron).to.exist;
    });

    it('expect November season cards (Mogwai) to NOT be available before 1st November', () => {
      const allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
      process.env.ALL_CARDS_AVAILABLE = false;
      const novemberMoment = moment('2015-10-15+0000', 'YYYY-MM Z').utc();
      const cards = SDK.GameSession.getCardCaches(novemberMoment).getIsCollectible(true).getCards();

      const mogwai = _.find(cards, (c) => c.getId() === SDK.Cards.Neutral.Mogwai);
      expect(mogwai).to.not.exist;

      process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;
    });

    it('expect November season cards (Mogwai) to be available after 1st November', () => {
      const allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
      process.env.ALL_CARDS_AVAILABLE = false;

      const novemberMoment = moment('2015-11-30+0000', 'YYYY-MM Z').utc();
      const cards = SDK.GameSession.getCardCaches(novemberMoment).getIsCollectible(true).getCards();

      const mogwai = _.find(cards, (c) => c.getId() === SDK.Cards.Neutral.Mogwai);
      expect(mogwai).to.exist;

      process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;
    });

    it('expect December season cards (Jaxi) to NOT be available before 1st December', () => {
      const allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
      process.env.ALL_CARDS_AVAILABLE = false;

      const novemberMoment = moment('2015-11-30+0000', 'YYYY-MM Z').utc();
      const cards = SDK.GameSession.getCardCaches(novemberMoment).getIsCollectible(true).getCards();

      const jaxi = _.find(cards, (c) => c.getId() === SDK.Cards.Neutral.Jaxi);
      expect(jaxi).to.not.exist;

      process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;
    });

    it('expect December season cards (Jaxi) to become available after 1st December', () => {
      const allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
      process.env.ALL_CARDS_AVAILABLE = false;

      const decemberMoment = moment('2015-12-01+0000', 'YYYY-MM Z').utc();
      const cards = SDK.GameSession.getCardCaches(decemberMoment).getIsCollectible(true).getCards();

      const jaxi = _.find(cards, (c) => c.getId() === SDK.Cards.Neutral.Jaxi);
      expect(jaxi).to.exist;

      process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;
    });

    it('expect cache not to update on each call', () => {
      const cardCache1 = SDK.GameSession.getCardCaches();
      const cardCache2 = SDK.GameSession.getCardCaches();

      expect(cardCache1).to.equal(cardCache2);
    });

    it('expect cache to rebuild when requested in a difference month', () => {
      const novemberMoment = moment('2020-11-01+0000', 'YYYY-MM Z').utc();
      const decemberMoment = moment('2020-12-01+0000', 'YYYY-MM Z').utc();

      // Build for novemeber (the cache timestamp should be november now (even if for some reason it already was)
      const novemberCardCache = SDK.GameSession.getCardCaches(novemberMoment);
      const decemberCardCache = SDK.GameSession.getCardCaches(decemberMoment);

      expect(novemberCardCache).to.not.equal(decemberCardCache);
    });
  });

  describe('craftCosmetic()', () => {
    it('expect to be able to craft a COMMON cosmetic with 500 spirit in wallet', () => Promise.all([
      knex('users').where('id', userId).update({
        wallet_spirit: 500,
      }),
      knex('user_cosmetic_inventory').where('user_id', userId).delete(),
    ]).then(() => InventoryModule.craftCosmetic(userId, SDK.CosmeticsLookup.Emote.Faction1Angry)).then((result) => {
      expect(result).to.exist;
      return Promise.all([
        knex('user_cosmetic_inventory').first().where('user_id', userId),
        knex('users').first().where('id', userId),
      ]);
    }).spread((cosmeticRow, userRow) => {
      expect(cosmeticRow).to.exist;
      expect(cosmeticRow.user_id).to.equal(userId);
      expect(parseInt(cosmeticRow.cosmetic_id, 10)).to.equal(SDK.CosmeticsLookup.Emote.Faction1Angry);

      expect(userRow).to.exist;
      expect(userRow.wallet_spirit).to.equal(0);
    }));

    it('expect to NOT be able to craft a COMMON cosmetic with 499 spirit in wallet', () => Promise.all([
      knex('users').where('id', userId).update({
        wallet_spirit: 499,
      }),
      knex('user_cosmetic_inventory').where('user_id', userId).delete(),
    ]).then(() => InventoryModule.craftCosmetic(userId, SDK.CosmeticsLookup.Emote.Faction1Angry)).then((result) => {
      expect(result).to.not.exist;
    }).catch((err) => {
      expect(err).to.exist;
      expect(err).to.not.be.an.instanceof(chai.AssertionError);
      expect(err).to.be.an.instanceof(Errors.InsufficientFundsError);
    }));

    it('expect to NOT be able to craft a COMMON cosmetic they already own', () => Promise.all([
      knex('users').where('id', userId).update({
        wallet_spirit: 200,
      }),
      knex('user_cosmetic_inventory').where('user_id', userId).delete(),
    ]).then(() => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, SDK.CosmeticsLookup.Emote.Faction1Angry, 'QA GIFT', 'QA GIFT ID'));
      return txPromise;
    }).then(() => InventoryModule.craftCosmetic(userId, SDK.CosmeticsLookup.Emote.Faction1Angry)).then((result) => {
      expect(result).to.not.exist;
    })
      .catch((err) => {
        expect(err).to.exist;
        expect(err).to.not.be.an.instanceof(chai.AssertionError);
        expect(err).to.be.an.instanceof(Errors.AlreadyExistsError);
      }));
  });

  describe('claimFreeCardOfTheDay', () => {
    before(() => SyncModule.wipeUserData(userId));

    it('expect to be able to claim a free card of the day', () => InventoryModule.claimFreeCardOfTheDay(userId)
      .bind({})
      .then(function (cardId) {
        expect(cardId).to.exist;
        this.cardId = cardId;
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex('users').first().where('id', userId),
        knex('user_cards').select().where('user_id', userId),
        FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
      ]))
      .spread(function (userRow, cardCountRows, userSnapshot) {
        expect(userRow.free_card_of_the_day_claimed_at).to.exist;
        expect(userRow.free_card_of_the_day_claimed_count).to.equal(1);
        expect(cardCountRows.length).to.equal(1);
        expect(cardCountRows[0].card_id).to.equal(this.cardId);
        expect(userSnapshot.val().free_card_of_the_day_claimed_at).to.equal(userRow.free_card_of_the_day_claimed_at.valueOf());
      }));

    it('expect NOT to be able to claim a free card of the day twice on the same day', () => InventoryModule.claimFreeCardOfTheDay(userId)
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.BadRequestError);
      }));

    it('expect to be able to claim a free card of the day on the next day (midnight rollover)', () => {
      const systemTime = moment.utc().add(1, 'day');
      return InventoryModule.claimFreeCardOfTheDay(userId, systemTime)
        .bind({})
        .then(function (cardId) {
          expect(cardId).to.exist;
          this.cardId = cardId;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('users').first().where('id', userId),
          knex('user_cards').select().where('user_id', userId),
          FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
        ]))
        .spread(function (userRow, cardCountRows, userSnapshot) {
          expect(userRow.free_card_of_the_day_claimed_at.valueOf()).to.equal(systemTime.valueOf());
          expect(userRow.free_card_of_the_day_claimed_count).to.equal(2);
          expect(cardCountRows.length).to.equal(2);
          expect(cardCountRows[1].card_id).to.equal(this.cardId);
          expect(userSnapshot.val().free_card_of_the_day_claimed_at).to.equal(userRow.free_card_of_the_day_claimed_at.valueOf());
        });
    });
  });
});
