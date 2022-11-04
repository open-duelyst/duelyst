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
const GiftCodesModule = require('../../../server/lib/data_access/gift_codes.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
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

describe('gift codes module', function () {
  let userId = null;
  this.timeout(25000);

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
        });
      }).catch((error) => {
        Logger.module('UNITTEST').log('unexpected error: ', error);
        throw error;
      });
  });

  describe('redeemGiftCode()', () => {
    it('throws an error for invalid gift code', () => GiftCodesModule.redeemGiftCode(userId, 'no-such-code')
      .then((result) => {
        expect(result).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    describe('kickstarter codes', () => {
      it('marks valid Kickstarter code as claimed and gives user cards', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'ks-1',
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then(() => Promise.all([
          knex('gift_codes').where('code', code).first(),
          knex('user_card_collection').where('user_id', userId).first(),
        ]))
          .spread((giftCodeRow, cardCollectionRow) => {
            expect(giftCodeRow.claimed_at).to.exist;
            expect(giftCodeRow.claimed_by_user_id).to.equal(userId);
            expect(cardCollectionRow.cards).to.exist;
            const cardIds = _.keys(cardCollectionRow.cards);
            expect(cardIds.length).to.be.above(0);
          });
      });

      it('throws error if a user attempts to redeem a previously redeemed code', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'ks-1',
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then(() => GiftCodesModule.redeemGiftCode(userId, code))
          .then((result) => {
            expect(result).to.not.exist;
          })
          .catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.BadRequestError);
          });
      });
    });

    describe('compound REWARD codes', () => {
      it('marks valid REWARD code as claimed and gives user GOLD', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'rewards',
          rewards: {
            gold: 50,
          },
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => Promise.all([
          knex('users').where('id', userId).first('wallet_gold', 'wallet_spirit'),
          knex('gift_codes').where('code', code).first(),
        ]))
          .spread((userRow, giftCodeRow) => {
            expect(userRow.wallet_gold).to.equal(50);
            expect(userRow.wallet_spirit).to.equal(0);
            expect(giftCodeRow.claimed_at).to.exist;
            expect(giftCodeRow.claimed_by_user_id).to.equal(userId);
          });
      });

      it('marks valid REWARD code as claimed and gives user SPIRIT', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'rewards',
          rewards: {
            spirit: 20,
          },
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => Promise.all([
          knex('users').where('id', userId).first('wallet_gold', 'wallet_spirit'),
          knex('gift_codes').where('code', code).first(),
        ]))
          .spread((userRow, giftCodeRow) => {
            expect(userRow.wallet_gold).to.equal(50);
            expect(userRow.wallet_spirit).to.equal(20);
            expect(giftCodeRow.claimed_at).to.exist;
            expect(giftCodeRow.claimed_by_user_id).to.equal(userId);
          });
      });

      it('marks valid REWARD code as claimed and gives user CARDS', () => {
        const code = `unit-teeet-${generatePushId()}`;
        return SyncModule.wipeUserData(userId)
          .then(() => knex('gift_codes').insert({
            code,
            type: 'rewards',
            rewards: {
              card_ids: [SDK.Cards.Neutral.EmeraldRejuvenator, SDK.Cards.Neutral.EmeraldRejuvenator, SDK.Cards.Neutral.RepulsionBeast],
            },
          })).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => Promise.all([
            knex('user_cards').where('user_id', userId).select(),
            knex('gift_codes').where('code', code).first(),
          ]))
          .spread((userCardRows, giftCodeRow) => {
            expect(userCardRows).to.exist;
            expect(giftCodeRow).to.exist;

            expect(userCardRows.length).to.equal(2);
            const emeraldRow = _.find(userCardRows, (cardRow) => cardRow.card_id === SDK.Cards.Neutral.EmeraldRejuvenator);
            expect(emeraldRow).to.exist;
            expect(emeraldRow.count).to.equal(2);
            const beastRow = _.find(userCardRows, (cardRow) => cardRow.card_id === SDK.Cards.Neutral.RepulsionBeast);
            expect(beastRow).to.exist;
            expect(beastRow.count).to.equal(1);
            expect(giftCodeRow.claimed_at).to.exist;
            expect(giftCodeRow.claimed_by_user_id).to.equal(userId);
          });
      });

      it('marks valid compound REWARD code as claimed and gives correct rewards', () => {
        const code = `unit-test-${generatePushId()}`;
        return SyncModule.wipeUserData(userId).then(() => knex('gift_codes').insert({
          code,
          type: 'rewards',
          rewards: {
            spirit: 25,
            gold: 15,
            orbs: 3,
            gauntlet_tickets: 2,
          },
        })).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => Promise.all([
          knex('users').where('id', userId).first('wallet_gold', 'wallet_spirit'),
          knex('user_spirit_orbs').where('user_id', userId).select(),
          knex('user_gauntlet_tickets').where('user_id', userId).select(),
          knex('gift_codes').where('code', code).first(),
        ]))
          .spread((userRow, orbRows, gauntletTicketRows, giftCodeRow) => {
            expect(userRow.wallet_gold).to.equal(15);
            expect(userRow.wallet_spirit).to.equal(25);
            expect(giftCodeRow.claimed_at).to.exist;
            expect(giftCodeRow.claimed_by_user_id).to.equal(userId);
            expect(orbRows.length).to.equal(3);
            expect(gauntletTicketRows.length).to.equal(2);
            expect(orbRows[0].transaction_type).to.equal('gift code');
            expect(orbRows[0].transaction_id).to.equal(code);
            expect(gauntletTicketRows[0].transaction_type).to.equal('gift code');
            expect(gauntletTicketRows[0].transaction_id).to.equal(code);
          });
      });

      it('claims valid REWARD code containing cosmetics and gives cosmetics to user', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'rewards',
          rewards: {
            cosmetics: [
              SDK.CosmeticsLookup.Emote.HealingMysticHappy,
              SDK.CosmeticsLookup.CardBack.Agenor,
            ],
          },
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => Promise.all([
          knex('user_cosmetic_inventory').where('user_id', userId).select(),
          knex('gift_codes').where('code', code).first(),
        ]))
          .spread((userCosmeticRows, giftCodeRow) => {
            const healingMysticHappy = _.find(userCosmeticRows, (c) => parseInt(c.cosmetic_id, 10) === SDK.CosmeticsLookup.Emote.HealingMysticHappy);
            const agenorCardBack = _.find(userCosmeticRows, (c) => parseInt(c.cosmetic_id, 10) === SDK.CosmeticsLookup.CardBack.Agenor);
            expect(healingMysticHappy).to.exist;
            expect(agenorCardBack).to.exist;
            expect(giftCodeRow.claimed_at).to.exist;
            expect(giftCodeRow.claimed_by_user_id).to.equal(userId);
          });
      });

      it('throws error if a user attempts to redeem a previously redeemed REWARDS code', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'rewards',
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then(() => GiftCodesModule.redeemGiftCode(userId, code))
          .then((result) => {
            expect(result).to.not.exist;
          })
          .catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.BadRequestError);
          });
      });
    });

    describe('codes with expiration', () => {
      it('does not allow use of an expired code', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'rewards',
          expires_at: moment.utc().subtract(1, 'days').toDate(),
          rewards: {
            gold: 50,
          },
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.not.exist;
        })
          .catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.BadRequestError);
          });
      });

      it('allows use of a code before it expires', () => {
        const code = `unit-test-${generatePushId()}`;
        return knex('gift_codes').insert({
          code,
          type: 'rewards',
          expires_at: moment.utc().add(1, 'days').toDate(),
          rewards: {
            gold: 10,
          },
        }).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.exist;
        });
      });
    });

    describe('codes with registration cutoff', () => {
      it('does not allow use of a code by a user that registered before the cutoff', () => {
        const code = `unit-test-${generatePushId()}`;
        return Promise.all([
          knex('gift_codes').insert({
            code,
            type: 'rewards',
            valid_for_users_created_after: moment.utc().add(1, 'days').toDate(),
            rewards: {
              gold: 50,
            },
          }),
          knex('users').where('id', userId).update({
            created_at: moment.utc().toDate(),
          }),
        ]).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.not.exist;
        }).catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        });
      });

      it('allows use of a code by a user that registered after the cutoff', () => {
        const code = `unit-test-${generatePushId()}`;
        return Promise.all([
          knex('gift_codes').insert({
            code,
            type: 'rewards',
            valid_for_users_created_after: moment.utc().subtract(1, 'days').toDate(),
            rewards: {
              gold: 50,
            },
          }),
          knex('users').where('id', userId).update({
            created_at: moment.utc().toDate(),
          }),
        ]).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.exist;
        });
      });
    });

    describe('codes with game count limits', () => {
      it('does not allow use of a code by a user that exceeds a game count limit', () => {
        const code = `unit-test-${generatePushId()}`;
        return Promise.all([
          knex('gift_codes').insert({
            code,
            type: 'rewards',
            game_count_limit: 9,
            rewards: {
              gold: 50,
            },
          }),
          UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId()),
        ]).then(() => knex('user_progression').where('user_id', userId).update({
          game_count: 10,
        })).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.not.exist;
        })
          .catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.BadRequestError);
          });
      });

      it('allows use of a code by a user that is below the game count limit', () => {
        const code = `unit-test-${generatePushId()}`;
        return Promise.all([
          knex('gift_codes').insert({
            code,
            type: 'rewards',
            game_count_limit: 10,
            rewards: {
              gold: 50,
            },
          }),
          UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId()),
        ]).then(() => knex('user_progression').where('user_id', userId).update({
          game_count: 9,
        })).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.exist;
        });
      });
    });

    describe('codes with one-use per customer limit', () => {
      before(() => knex('gift_codes').where('exclusion_id', 'unit-test-1').andWhere('claimed_by_user_id', userId).delete());

      it('allows one use of a one-per-customer code by a user', () => {
        const code = `unit-test-${generatePushId()}`;
        return Promise.all([
          knex('gift_codes').insert({
            code,
            type: 'rewards',
            exclusion_id: 'unit-test-1',
            rewards: {
              gold: 50,
            },
          }),
        ]).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.exist;
        });
      });

      it('does NOT allow use of two of a one-per-customer code type by a user', () => {
        const code = `unit-test-${generatePushId()}`;
        return Promise.all([
          knex('gift_codes').insert({
            code,
            type: 'rewards',
            exclusion_id: 'unit-test-1',
            rewards: {
              gold: 50,
            },
          }),
        ]).then(() => GiftCodesModule.redeemGiftCode(userId, code)).then((result) => {
          expect(result).to.not.exist;
        }).catch((error) => {
          Logger.module('UNITTEST').log(error.message);
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
          expect(error.message).to.equal('Gift Code of this type has already been claimed.');
        });
      });
    });
  });
});
