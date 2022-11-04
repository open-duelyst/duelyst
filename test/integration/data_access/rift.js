const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const chai = require('chai');

chai.config.includeStack = true;
const { expect } = chai;
const Promise = require('bluebird');
const sinon = require('sinon');
const _ = require('underscore');
const moment = require('moment');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
const Errors = require('../../../server/lib/custom_errors.coffee');
const UsersModule = require('../../../server/lib/data_access/users.coffee');
const RiftModule = require('../../../server/lib/data_access/rift.coffee');
const InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const config = require('../../../config/config');
const CONFIG = require('../../../app/common/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');
const generatePushId = require('../../../app/common/generate_push_id');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe('rift module', function () {
  this.timeout(25000);

  let userId = null;
  let fakeGameSessionData = null;

  const storeUpdateTestCount = 0;
  const swapUpgradeTestCount = 0;

  // before cleanup to check if user already exists and delete
  before(() => {
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
      }).then(() => {
        fakeGameSessionData = {
          players: [
            { // Player 1
              playerId: userId,
              isWinner: true,
            },
            { // Player 2
              playerId: generatePushId(),
              isWinner: false,
            },
          ],
          gameSetupData: {
            players: [
              { // Player 1
                playerId: userId,
                isWinner: true, // ,
                // riftRating: 600
              },
              { // Player 2
                playerId: generatePushId(),
                isWinner: false, // ,
                // riftRating: 200
              },
            ],
          },
        };
      });
  });

  // // after cleanup
  // after(function(){
  //   this.timeout(25000);
  //   return DuelystFirebase.connect().getRootRef()
  //   .bind({})
  //   .then(function(fbRootRef){
  //     this.fbRootRef = fbRootRef;
  //     if (userId) {
  //       // return clearUserData(userId,this.fbRootRef);
  //     }
  //   });
  // });

  describe('buyRiftTicketWithGold()', () => {
    it('expect to NOT be able to buy ticket with insufficient gold', () => RiftModule.buyRiftTicketWithGold(userId)
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_rift_tickets').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('rift-tickets'), 'value'),
      ]))
      .spread((userRow, ticketRows, fbTickets) => {
        expect(userRow.wallet_gold).to.equal(0);
        expect(ticketRows.length).to.equal(0);
        expect(fbTickets.numChildren()).to.equal(0);
      }));

    it(`expect to be able to buy a ticket for ${CONFIG.RIFT_TICKET_GOLD_PRICE} gold`, () => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE }).then((numUpdates) => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticket) => {
        expect(ticket).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_rift_tickets').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('rift-tickets'), 'value'),
      ]))
      .spread((userRow, ticketRows, fbTickets) => {
        expect(userRow.wallet_gold).to.equal(0);
        expect(ticketRows.length).to.equal(1);
        expect(fbTickets.numChildren()).to.equal(1);
      }));
  });

  describe('startRun()', () => {
    const otherUserTicketId = 'invalid-ticket-for-other-user';

    // before cleanup to check if user already exists and delete
    before(() => knex('user_rift_tickets').where('id', otherUserTicketId).delete()
      .then(() => knex('user_rift_tickets').insert({
        id: otherUserTicketId,
        user_id: 'some-other-user',
      })));

    // before cleanup to check if user already exists and delete
    after(() => knex('user_rift_tickets').where('id', otherUserTicketId).delete());

    it('expect to NOT be able to start a run with an invalid ticket', () => RiftModule.startRun(userId, 'doesnt-exist')
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_rift_runs').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child('current'), 'value'),
      ]))
      .spread((runRow, fbRun) => {
        expect(runRow).to.not.exist;
        expect(fbRun.val()).to.not.exist;
      }));

    it('expect to NOT be able to start a run with another user\'s ticket', () => RiftModule.startRun(userId, otherUserTicketId)
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_rift_runs').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child('current'), 'value'),
      ]))
      .spread((runRow, fbRun) => {
        expect(runRow).to.not.exist;
        expect(fbRun.val()).to.not.exist;
      }));

    it('expect to be able to start a run with a valid ticket', () => knex('user_rift_tickets').where('user_id', userId).first()
      .bind({})
      .then(function (ticketRow) {
        this.ticketId = ticketRow.id;
        return RiftModule.startRun(userId, ticketRow.id);
      })
      .then((runData) => {
        expect(runData).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.select().from('user_rift_tickets').where({ user_id: userId }),
          knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', this.ticketId),
          FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child(this.ticketId), 'value'),
        ]);
      })
      .spread((ticketRows, runRow, fbRun) => {
        expect(ticketRows.length).to.equal(0);
        expect(runRow).to.exist;
        expect(fbRun.val()).to.exist;
      }));

    it('expect the started run to have 4 different general choices', () => knex.first().from('user_rift_runs').where('user_id', userId)
      .bind({})
      .then((runRow) => {
        expect(runRow.general_choices.length).to.equal(4);
        _.each(runRow.general_choices, (generalId) => {
          const generalCard = SDK.CardFactory.cardForIdentifier(generalId, SDK.GameSession.current());
          expect(generalCard.getIsGeneral()).to.equal(true);
        });
      }));
  });

  describe('chooseGeneral()', () => {
    // before cleanup
    before(() => knex('user_rift_runs').where({ user_id: userId }).delete());

    it('expect trying to choose a general with no run to ERROR out', () => RiftModule.chooseGeneral(userId, 'fake-ticket-id', 1)
      .then((riftData) => {
        expect(riftData).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect choosing a general to work', () => {
      let runTicketId = null;

      return knex('users').where('id', userId).update({ wallet_gold: 300 })
        .bind({})
        .then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((ticketId) => {
          runTicketId = ticketId;
          return RiftModule.startRun(userId, ticketId);
        })
        .then((riftData) => {
          expect(riftData.general_choices).to.exist;
          return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
        })
        .then((riftData) => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId),
          FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child(runTicketId), 'value'),
        ]))
        .spread((riftRow, fbRun) => {
          expect(riftRow.deck.length).to.equal(40);
          expect(riftRow.general_id).to.equal(riftRow.general_choices[0]);
          expect(riftRow.faction_id).to.exist;
          expect(fbRun.val().deck.length).to.equal(40);
        });
    });

    it('expect choosing an invalid general to fail', () => knex('users').where('id', userId).update({ wallet_gold: 300 })
      .bind({})
      .then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => RiftModule.startRun(userId, ticketId))
      .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, -100))
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
      }));

    it('expect to NOT be able to choose a general twice', () => knex('users').where('id', userId).update({ wallet_gold: 300 })
      .bind({})
      .then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => RiftModule.startRun(userId, ticketId))
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      })
      .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
      }));
  });

  describe('getRiftRunDeck()', () => {
    let runTicketId = null;

    before(() => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        runTicketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      }));

    it('expect to be able to retrive a user\'s rift deck', () => RiftModule.getRiftRunDeck(userId, runTicketId).then((deck) => {
      expect(deck).to.exist;
      expect(deck.length).to.equal(40);
    }));

    it('expect the first card in a user\'s rift deck to be a GENERAL', () => RiftModule.getRiftRunDeck(userId, runTicketId).then((deck) => {
      expect(deck).to.exist;
      const generalId = deck.shift();
      const generalCard = SDK.CardFactory.cardForIdentifier(generalId, SDK.GameSession.current());
      expect(generalCard.getIsGeneral()).to.equal(true);
    }));
  });

  describe('getRunMatchmakingMetric()', () => {
    let runTicketId = null;

    before(() => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        runTicketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      }));

    it('expect to be able to retrive a user\'s active rift matchmaking metric', () => RiftModule.getRunMatchmakingMetric(userId, runTicketId).then((metric) => {
      expect(metric).to.exist;
      expect(metric).to.be.within(0, 100);
    }));

    it('expect metric to equal a percentage of 4000', () => knex('user_rift_runs').where('ticket_id', runTicketId).update({
      win_count: 5,
      loss_count: 5,
      rift_level: 10,
      rift_rating: 400,
    })
      .then(() => RiftModule.getRunMatchmakingMetric(userId, runTicketId))
      .then((metric) => {
        expect(metric).to.exist;
        expect(metric).to.equal(400 / 4000);
      }));
  });

  describe('updateRiftRunWithGameOutcome()', () => {
    let runTicketId = null;

    before(() => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        runTicketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      }));

    it('expect to FAIL to update an invalid run with a game', () => RiftModule.updateRiftRunWithGameOutcome(userId, 'invalid-run-ticket-id', generatePushId(), true, null, 10, fakeGameSessionData)
      .then((riftData) => {
        expect(riftData).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Error);
      }));

    it('expect a won game to update the win counter and increase rift rating', function () {
      this.timeout(90000);
      const gameId = generatePushId();

      let riftRatingBefore;
      return knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', runTicketId)
        .then((riftRunData) => {
          riftRatingBefore = riftRunData.rift_rating || RiftModule.RIFT_DEFAULT_RATING;
          return RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, true, gameId, null, 10, fakeGameSessionData);
        })
        .then((riftData) => {
          expect(riftData).to.exist;
          expect(riftData.win_count).to.equal(1);
          expect(riftData.loss_count).to.equal(0);
          expect(riftData.rift_rating).to.be.above(riftRatingBefore);
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', runTicketId),
          FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child(runTicketId), 'value'),
          FirebasePromises.once(rootRef.child('user-games').child(userId).child(gameId).child('job_status'), 'value'),
        ]))
        .spread((riftRow, fbRun, firebaseGameJobStatusSnapshot) => {
          expect(riftRow.win_count).to.equal(1);
          expect(riftRow.loss_count).to.equal(0);
          expect(riftRow.rift_rating).to.be.above(riftRatingBefore);
          expect(fbRun.val().win_count).to.equal(1);
          expect(fbRun.val().loss_count).to.equal(0);
          expect(fbRun.val().rift_rating).to.be.above(riftRatingBefore);
          expect(firebaseGameJobStatusSnapshot.val().rift).to.equal(true);
        });
    });

    it('expect a lost game to update the loss counter', () => {
      let riftRatingBefore;
      return knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', runTicketId)
        .then((riftRunData) => {
          riftRatingBefore = riftRunData.rift_rating || RiftModule.RIFT_DEFAULT_RATING;
          return RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, false, 'game 2', null, 10, fakeGameSessionData);
        })
        .then((riftData) => {
          expect(riftData).to.exist;
          expect(riftData.win_count).to.equal(1);
          expect(riftData.loss_count).to.equal(1);
          expect(riftData.rift_rating).to.be.below(riftRatingBefore);
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', runTicketId),
          FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child(runTicketId), 'value'),
        ]))
        .spread((riftRow, fbRun) => {
          expect(riftRow.win_count).to.equal(1);
          expect(riftRow.loss_count).to.equal(1);
          expect(fbRun.val().win_count).to.equal(1);
          expect(fbRun.val().loss_count).to.equal(1);
          expect(fbRun.val().rift_rating).to.be.below(riftRatingBefore);
        });
    });

    it('expect 2 losses to update the loss counter', () => RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, false, 'game 2', null, 10, fakeGameSessionData)
      .then((riftData) => {
        expect(riftData).to.exist;
        expect(riftData.win_count).to.equal(1);
        expect(riftData.loss_count).to.equal(2);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', runTicketId),
        FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child(runTicketId), 'value'),
      ])).spread((riftRow, fbRun) => {
        expect(riftRow.win_count).to.equal(1);
        expect(riftRow.loss_count).to.equal(2);
        expect(fbRun.val().win_count).to.equal(1);
        expect(fbRun.val().loss_count).to.equal(2);
      }));

    it('expect a draw to update the draw counter and not win/loss and not affect rating', () => {
      let riftRatingBefore;
      return knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', runTicketId)
        .then((riftRunData) => {
          riftRatingBefore = riftRunData.rift_rating || RiftModule.RIFT_DEFAULT_RATING;
          return RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, false, 'game 2', true, 10, fakeGameSessionData);
        })
        .then((riftData) => {
          expect(riftData).to.exist;
          expect(riftData.win_count).to.equal(1);
          expect(riftData.loss_count).to.equal(2);
          expect(riftData.draw_count).to.equal(1);
          expect(riftData.rift_rating).to.equal(riftRatingBefore);
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', runTicketId),
          FirebasePromises.once(rootRef.child('user-rift-runs').child(userId).child(runTicketId), 'value'),
        ]))
        .spread((riftRow, fbRun) => {
          expect(riftRow.win_count).to.equal(1);
          expect(riftRow.loss_count).to.equal(2);
          expect(riftRow.draw_count).to.equal(1);
          expect(fbRun.val().win_count).to.equal(1);
          expect(fbRun.val().loss_count).to.equal(2);
          expect(fbRun.val().draw_count).to.equal(1);
        });
    });

    it('expect to earn rift points for dealing damage', () => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })
      .then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then(function (ticketId) {
        this.ticketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      })
      .then(function () {
        return RiftModule.updateRiftRunWithGameOutcome(userId, this.ticketId, false, 'game 2', true, 7, fakeGameSessionData);
      })
      .then(function () {
        return knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', this.ticketId);
      })
      .then((riftRow) => {
        expect(riftRow.rift_points).to.equal(7);
        expect(riftRow.rift_level).to.equal(1);
      }));

    it('expect to earn upgrade tokens for leveling up your rift deck', () => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })
      .then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then(function (ticketId) {
        this.ticketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      })
      .then(function () {
        this.gameIds = [];
        _.times(1, () => { this.gameIds.push(generatePushId()); });
        return Promise.map(this.gameIds, (gameId) => RiftModule.updateRiftRunWithGameOutcome(userId, this.ticketId, true, gameId, false, 5, fakeGameSessionData));
      })
      .then(function () {
        return knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', this.ticketId);
      })
      .then(function (riftRow) {
        expect(riftRow.rift_points).to.equal(15);
        expect(riftRow.rift_level).to.equal(2);
        expect(riftRow.upgrades_available_count).to.equal(1);
        _.times(10, () => { this.gameIds.push(generatePushId()); });
        return Promise.map(this.gameIds, (gameId) => RiftModule.updateRiftRunWithGameOutcome(userId, this.ticketId, true, gameId, false, 10, fakeGameSessionData));
      })
      .then(function () {
        return knex.first().from('user_rift_runs').where({ user_id: userId }).andWhere('ticket_id', this.ticketId);
      })
      .then((riftRow) => {
        expect(riftRow.rift_points).to.equal(235);
        expect(riftRow.rift_level).to.equal(7);
        expect(riftRow.upgrades_available_count).to.equal(6);
      }));
  });

  describe('chooseCardToUpgrade()', () => {
    let runTicketId = null;

    beforeEach(() => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        runTicketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      }));

    it('expect NOT to be able to initiate a run upgrade if you don\'t have any upgrade tokens', () => knex('user_rift_runs').where('ticket_id', runTicketId).update({
      upgrades_available_count: 0,
    }).then(() => knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId))
      .then((runRow) => RiftModule.chooseCardToUpgrade(userId, runTicketId, runRow.deck[1]))
      .then((response) => {
        expect(response).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.BadRequestError);
      }));

    it('expect to be able to initiate a run upgrade if you have an upgrade token and to use up the upgrade token', () => {
      const gameIds = [];
      _.times(1, () => { gameIds.push(generatePushId()); });

      let upgradeCountBefore = null;

      return knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId)
        .then((riftRow) => Promise.map(gameIds, (gameId) => RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, false, gameId, true, 10, fakeGameSessionData)))
        .spread((runData) => {
          upgradeCountBefore = runData.upgrades_available_count || 0;
          return RiftModule.chooseCardToUpgrade(userId, runTicketId, runData.deck[1]);
        })
        .then(() => knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId))
        .then((runRow) => {
          expect(runRow.card_id_to_upgrade).to.equal(runRow.deck[1]);
          expect(runRow.upgrades_available_count).to.equal(upgradeCountBefore - 1);
        });
    });

    it('expect initiating a run upgrade to generate 6 card choices', () => {
      const gameIds = [];
      _.times(10, () => { gameIds.push(generatePushId()); });
      return Promise.map(gameIds, (gameId) => RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, true, gameId, null, 10, fakeGameSessionData)).spread((runData) => RiftModule.chooseCardToUpgrade(userId, runTicketId, runData.deck[1])).then(() => knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId)).then((runRow) => {
        expect(runRow.card_id_to_upgrade).to.equal(runRow.deck[1]);
        expect(runRow.upgrades_available_count).to.equal(9);
        expect(runRow.card_choices.length).to.equal(6);
      });
    });
  });

  describe('_getRiftRatingDeltaForGameRiftRatings()', () => {
    it('expect a max rift rating delta for a winner with significantly lower rating', () => {
      const ratingDelta = RiftModule._getRiftRatingDeltaForGameRiftRatings(200, 1000);
      expect(ratingDelta).to.exist;
      expect(ratingDelta).to.equal(RiftModule.RIFT_MAX_RATING_DELTA);
    });

    it('expect a max rift rating delta for a winner a rating a small amount higher than loser rating', () => {
      const ratingDelta = RiftModule._getRiftRatingDeltaForGameRiftRatings(1050, 1000);
      expect(ratingDelta).to.exist;
      expect(ratingDelta).to.equal(RiftModule.RIFT_MAX_RATING_DELTA);
    });

    it('expect a min rift rating delta for a winner with significantly higher rating', () => {
      const ratingDelta = RiftModule._getRiftRatingDeltaForGameRiftRatings(2000, 1000);
      expect(ratingDelta).to.exist;
      expect(ratingDelta).to.equal(RiftModule.RIFT_MIN_RATING_DELTA);
    });

    it('expect a rift rating delta in the middle for a winner with rating 300 higher', () => {
      const ratingDelta = RiftModule._getRiftRatingDeltaForGameRiftRatings(1300, 1000);
      expect(ratingDelta).to.exist;
      expect(ratingDelta).to.equal(20);
    });
  });

  describe('upgradeCard()', () => {
    let runTicketId = null;

    beforeEach(() => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        runTicketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => {
        expect(riftData.general_choices).to.exist;
        return RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]);
      }));

    it('expect NOT to be able to upgrade if no card has been selected for upgrade', () => RiftModule.upgradeCard(userId, runTicketId, SDK.Cards.Faction1.SilverguardSquire)
      .then((response) => {
        expect(response).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.BadRequestError);
      }));

    it('expect NOT to be able to choose an invalid card as an upgrade', () => {
      const gameIds = [];
      _.times(10, () => { gameIds.push(generatePushId()); });
      return Promise.map(gameIds, (gameId) => RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, true, gameId, null, 10, fakeGameSessionData)).spread((runData) => RiftModule.chooseCardToUpgrade(userId, runTicketId, runData.deck[1])).then(() => knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId)).then((runRow) => RiftModule.upgradeCard(userId, runTicketId, SDK.Cards.Faction1.SilverguardSquire))
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        });
    });

    it('expect succesfully upgrading a card to swap it out in the deck', () => {
      const gameIds = [];
      let deckBefore = null;
      let cardIdToUpgrade = null;
      let cardIdSelected = null;
      _.times(10, () => {
        gameIds.push(generatePushId());
      });
      return Promise.map(gameIds, (gameId) => RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, true, gameId, null, 10, fakeGameSessionData)).spread((runData) => {
        deckBefore = runData.deck;
        cardIdToUpgrade = runData.deck[1];
        return RiftModule.chooseCardToUpgrade(userId, runTicketId, cardIdToUpgrade);
      }).then((runData) => {
        cardIdSelected = runData.card_choices[0];
        return RiftModule.upgradeCard(userId, runTicketId, cardIdSelected);
      }).then((response) => knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId))
        .then((runRow) => {
          expect(runRow.deck).to.include(cardIdSelected);
          expect(_.filter(runRow.deck, (c) => c === cardIdToUpgrade).length).to.equal(2);
        });
    });

    /* Test disabled: unsafe (function declaration inside loop)
    // Run with --bail
    for (let i = 0; i < swapUpgradeTestCount; i++) {
      it(`expect repeat succesfully upgrading a card to swap it out in the deck ${i}`, () => {
        const gameIds = [];
        let deckBefore = null;
        let cardIdToUpgrade = null;
        let cardIdSelected = null;
        _.times(10, () => {
          gameIds.push(generatePushId());
        });
        return Promise.map(gameIds, (gameId) => RiftModule.updateRiftRunWithGameOutcome(userId, runTicketId, true, gameId, null, 10, fakeGameSessionData)).spread((runData) => {
          deckBefore = runData.deck;
          cardIdToUpgrade = runData.deck[1];
          return RiftModule.chooseCardToUpgrade(userId, runTicketId, cardIdToUpgrade);
        }).then((runData) => {
          const choices = runData.card_choices;
          console.log(`here choices: ${runData.card_choices}`);
          expect(_.unique(choices).length).to.equal(choices.length);
          cardIdSelected = choices[0];
          return RiftModule.upgradeCard(userId, runTicketId, cardIdSelected);
        }).then((response) => knex.first().from('user_rift_runs').where('user_id', userId).andWhere('ticket_id', runTicketId))
          .then((runRow) => {
            expect(runRow.deck).to.include(cardIdSelected);
            expect(_.filter(runRow.deck, (c) => c === cardIdToUpgrade).length).to.equal(2);
          });
      });
    }
    */
  });

  describe('storeCurrentUpgrade()', () => {
    let runTicketId = null;

    beforeEach(() => SyncModule.wipeUserData(userId));

    it('expect NOT to be able to store an upgrade when you have no current rift run', () => RiftModule.storeCurrentUpgrade(userId, generatePushId())
      .then((response) => {
        expect(response).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect NOT to be able to store an upgrade if not currently performing an upgrade', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        runTicketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
      .then((riftData) => RiftModule.storeCurrentUpgrade(userId, runTicketId))
      // return RiftModule.chooseCardToUpgrade(userId,runTicketId,riftData.deck[10])
      .then((riftData) => {
        // Should not reach
        expect(riftData).to.exist;
        expect(riftData).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.BadRequestError);
      }));

    it('expect to be able to store an upgrade after selecting a card to upgrade', () => {
      let cardChoices = null;
      let runTicketId = null;
      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE })).then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((ticketId) => {
          runTicketId = ticketId;
          return RiftModule.startRun(userId, ticketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, runTicketId, riftData.deck[10]))
        .then((riftData) => {
          cardChoices = riftData.card_choices;
          return RiftModule.storeCurrentUpgrade(userId, runTicketId);
        })
        .then((riftData) => {
          expect(riftData).to.exist;
          return Promise.all([
            knex('user_rift_runs').where('ticket_id', runTicketId).first(),
            knex('user_rift_run_stored_upgrades').where('source_ticket_id', runTicketId).first(),
          ]);
        });// TODO
    });

    it('expect to be able to use a a stored upgrade', () => {
      let cardChoices = null;
      let firstTicketId = null;
      let secondTicketId = null;
      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE * 2 })).then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((ticketId) => {
          firstTicketId = ticketId;
          return RiftModule.startRun(userId, firstTicketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, firstTicketId, riftData.deck[10]))
        .then((riftData) => {
          cardChoices = riftData.card_choices;
          return RiftModule.storeCurrentUpgrade(userId, firstTicketId);
        })
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, firstTicketId, riftData.deck[10]))
        .then((riftData) => {
          cardChoices = riftData.card_choices;
          return RiftModule.storeCurrentUpgrade(userId, firstTicketId);
        })
        .then((riftData) => RiftModule.buyRiftTicketWithGold(userId))
        .then((riftTicketId) => {
          secondTicketId = riftTicketId;
          return RiftModule.startRun(userId, secondTicketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, riftData.ticket_id, riftData.deck[10]))
        .then((riftData) => RiftModule.upgradeCard(userId, riftData.ticket_id, riftData.card_choices[2]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, riftData.ticket_id, riftData.deck[10]))
        .then((riftData) => RiftModule.upgradeCard(userId, riftData.ticket_id, riftData.card_choices[2]));
    });

    /* Test disabled: unsafe (function definition inside loop)
    // Best used with --bail
    for (let i = 0; i < storeUpdateTestCount; i++) {
      it(`expect to be able to use a a stored upgrade ${i}`, () => {
        let cardChoices = null;
        let firstTicketId = null;
        let secondTicketId = null;
        return SyncModule.wipeUserData(userId)
          .bind({})
          .then(() => knex('users').where('id', userId).update({ wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE * 2 })).then(() =>
            // console.log("here test 1")
            RiftModule.buyRiftTicketWithGold(userId))
          .then((ticketId) => {
            // console.log("here test 2")
            firstTicketId = ticketId;
            return RiftModule.startRun(userId, firstTicketId);
          })
          .then((riftData) =>
            // console.log("here test 3")
            RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
          .then((riftData) =>
            // console.log("here test 4")
            RiftModule.chooseCardToUpgrade(userId, firstTicketId, riftData.deck[10]))
          .then((riftData) => {
            // console.log("here test 5")
            cardChoices = riftData.card_choices;
            return RiftModule.storeCurrentUpgrade(userId, firstTicketId);
          })
          .then((riftData) =>
            // console.log("here test 6")
            RiftModule.chooseCardToUpgrade(userId, firstTicketId, riftData.deck[10]))
          .then((riftData) => {
            // console.log("here test 7")
            cardChoices = riftData.card_choices;
            return RiftModule.storeCurrentUpgrade(userId, firstTicketId);
          })
          .then((riftData) =>
            // console.log("here test 8")
            RiftModule.buyRiftTicketWithGold(userId))
          .then((riftTicketId) => {
            // console.log("here test 9")
            secondTicketId = riftTicketId;
            return RiftModule.startRun(userId, secondTicketId);
          })
          .then((riftData) =>
            // console.log("here test 10")
            RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
          .then((riftData) =>
            // console.log("here test 11")
            RiftModule.chooseCardToUpgrade(userId, riftData.ticket_id, riftData.deck[10]))
          .then((riftData) =>
            // console.log("here test 12")
            RiftModule.upgradeCard(userId, riftData.ticket_id, riftData.card_choices[2]))
          .then((riftData) =>
            // console.log("here test 13")
            RiftModule.chooseCardToUpgrade(userId, riftData.ticket_id, riftData.deck[10]))
          .then((riftData) =>
            // console.log("here test 14")
            RiftModule.upgradeCard(userId, riftData.ticket_id, riftData.card_choices[2]));
      });
    }
    */
  });

  describe('rerollCurrentUpgrade()', () => {
    let runTicketId = null;

    beforeEach(() => SyncModule.wipeUserData(userId));

    it('expect NOT to be able to reroll an upgrade when you have no current rift run', () => RiftModule.rerollCurrentUpgrade(userId, generatePushId())
      .then((response) => {
        expect(response).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect NOT to be able to reroll an upgrade if not currently performing an upgrade', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({
        wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE,
        wallet_spirit: 1000,
      })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        runTicketId = ticketId;
        return RiftModule.startRun(userId, ticketId);
      })
      .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
      .then((riftData) => RiftModule.rerollCurrentUpgrade(userId, runTicketId))
      .then((riftData) => {
        // Should not reach
        expect(riftData).to.exist;
        expect(riftData).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.BadRequestError);
      }));

    it('expect to be not able to reroll an upgrade with insufficent spirit', () => {
      let prevCardChoices = null;
      let runTicketId = null;
      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({
          wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE,
          wallet_spirit: 20,
        })).then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((ticketId) => {
          runTicketId = ticketId;
          return RiftModule.startRun(userId, ticketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, runTicketId, riftData.deck[10]))
        .then((riftData) => {
          prevCardChoices = riftData.card_choices;
          return RiftModule.rerollCurrentUpgrade(userId, runTicketId);
        })
        .then((riftData) => {
          // Should not reach
          expect(riftData).to.exist;
          expect(riftData).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
        });
    });

    it('expect to be able to reroll an upgrade after selecting a card to upgrade', () => {
      let prevCardChoices = null;
      let runTicketId = null;
      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({
          wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE,
          wallet_spirit: 1000,
        })).then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((ticketId) => {
          runTicketId = ticketId;
          return RiftModule.startRun(userId, ticketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, runTicketId, riftData.deck[10]))
        .then((riftData) => {
          prevCardChoices = riftData.card_choices;
          return RiftModule.rerollCurrentUpgrade(userId, runTicketId);
        })
        .then((riftData) => {
          expect(riftData).to.exist;
          return Promise.all([
            knex('user_rift_runs').where('ticket_id', runTicketId).first(),
            knex('users').where('id', userId).first(),
          ]);
        })
        .spread((userRiftRunRow, userRow) => {
          expect(userRow.wallet_spirit).to.equal(975);
          expect(userRiftRunRow.current_upgrade_reroll_count).to.equal(1);
          expect(userRiftRunRow.total_reroll_count).to.equal(1);
          expect(userRiftRunRow.card_choices).to.exist;
          expect(userRiftRunRow.card_choices.length).to.equal(6);

          const prevCardStr = _.reduce(prevCardChoices, (memo, cardId) => memo + cardId, '');
          const newCardStr = _.reduce(userRiftRunRow.card_choices, (memo, cardId) => memo + cardId, '');
          expect(prevCardStr).to.not.equal(newCardStr);
        });
    });

    it('expect to be able to choose a card after rerolling an upgrade', () => {
      let cardChoices = null;
      let firstTicketId = null;
      const secondTicketId = null;
      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({
          wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE,
          wallet_spirit: 1000,
        })).then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((ticketId) => {
          firstTicketId = ticketId;
          return RiftModule.startRun(userId, firstTicketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, firstTicketId, riftData.deck[10]))
        .then((riftData) => {
          cardChoices = riftData.card_choices;
          return RiftModule.rerollCurrentUpgrade(userId, firstTicketId);
        })
        .then((riftData) => RiftModule.upgradeCard(userId, riftData.ticket_id, riftData.card_choices[2]))
        .then((riftData) => {
          expect(riftData).to.exist;
          expect(riftData.current_upgrade_reroll_count).to.equal(0);
          expect(riftData.total_reroll_count).to.equal(1);
        })
        .catch((error) => {
          console.log(`here e: ${error}`);
          // Should not reach
          expect(error).to.not.exist;
          expect(error).to.exist;
        });
    });
  });

  describe('sanitizeRunCardChoicesIfNeeded()', () => {
    const sanitizeMoment = moment.utc('2018-02-13');

    beforeEach(() => SyncModule.wipeUserData(userId));

    it('expect to NOT sanitize a run without card choices (after upgrading a card)', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('users').where('id', userId).update({
        wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE,
        wallet_spirit: 1000,
      })).then(() => RiftModule.buyRiftTicketWithGold(userId))
      .then((ticketId) => {
        const firstTicketId = ticketId;
        return RiftModule.startRun(userId, firstTicketId);
      })
      .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
      .then((riftData) => RiftModule.chooseCardToUpgrade(userId, riftData.firstTicketId, riftData.deck[10]))
      .then((riftData) => {
        const cardChoices = riftData.card_choices;
        return RiftModule.rerollCurrentUpgrade(userId, riftData.firstTicketId);
      })
      .then((riftData) => RiftModule.upgradeCard(userId, riftData.ticket_id, riftData.card_choices[2]))
      .then((riftData) => RiftModule.sanitizeRunCardChoicesIfNeeded(riftData, sanitizeMoment))
      .then((riftData) => {
        expect(riftData.updated_at).to.not.equal(sanitizeMoment.toDate());
        expect(riftData.card_choices).to.not.exist;
      }));

    // it('expect to not sanitize a run with duplicate card choices that has been updated after april 29th 12pm utc', function() {
    //  const ticketId = null;
    //  return SyncModule.wipeUserData(userId)
    //    .bind({})
    //    .then(function(){
    //      return knex("users").where('id',userId).update({
    //        'wallet_gold':CONFIG.RIFT_TICKET_GOLD_PRICE,
    //        'wallet_spirit':1000
    //      })
    //    }).then(function(){
    //      return RiftModule.buyRiftTicketWithGold(userId);
    //    }).then(function(purchasedTicketId){
    //      ticketId = purchasedTicketId;
    //      return RiftModule.startRun(userId,ticketId);
    //    }).then(function(riftData){
    //      return RiftModule.chooseGeneral(userId,riftData.ticket_id,riftData.general_choices[0])
    //    }).then(function(riftData){
    //      return RiftModule.chooseCardToUpgrade(userId,ticketId,riftData.deck[10])
    //    }).then(function(riftData) {
    //      cardChoices = riftData.card_choices
    //      return RiftModule.rerollCurrentUpgrade(userId, ticketId);
    //    }).then(function(riftData) {
    //      return knex("user_rift_runs").where('ticket_id', riftData.ticket_id).update({
    //        card_choices: [11088, 20076, 11087, 11087, 20209, 11052],
    //        updated_at: moment.utc("2017-04-29 13:00").toDate()
    //      })
    //    }).then(function() {
    //      return knex("user_rift_runs").first().where('ticket_id',ticketId)
    //    }).then(function(riftData) {
    //      return RiftModule.sanitizeRunCardChoicesIfNeeded(riftData, sanitizeMoment)
    //    }).then(function(riftData) {
    //      expect(moment.utc(riftData.updated_at).valueOf()).to.not.equal(sanitizeMoment.valueOf());
    //      expect(_.unique(riftData.card_choices).length).to.not.equal(riftData.card_choices.length);
    //
    //      return knex("user_rift_runs").first().where('ticket_id',ticketId)
    //    }).then(function(riftData) {
    //      expect(moment.utc(riftData.updated_at).valueOf()).to.not.equal(sanitizeMoment.valueOf());
    //      expect(_.unique(riftData.card_choices).length).to.not.equal(riftData.card_choices.length);
    //    })
    // })

    it('expect to sanitize a run with duplicate card choices after reroll', () => {
      let ticketId = null;
      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({
          wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE,
          wallet_spirit: 1000,
        })).then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((purchasedTicketId) => {
          ticketId = purchasedTicketId;
          return RiftModule.startRun(userId, ticketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, ticketId, riftData.deck[10]))
        .then((riftData) => {
          const cardChoices = riftData.card_choices;
          return RiftModule.rerollCurrentUpgrade(userId, ticketId);
        })
        .then((riftData) => knex('user_rift_runs').where('ticket_id', riftData.ticket_id).update({
          card_choices: [11088, 20076, 11087, 11087, 20209, 11052],
        }))
        .then(() => knex('user_rift_runs').first().where('ticket_id', ticketId))
        .then((riftData) => RiftModule.sanitizeRunCardChoicesIfNeeded(riftData, sanitizeMoment))
        .then((riftData) => {
          expect(moment.utc(riftData.updated_at).valueOf()).to.equal(sanitizeMoment.valueOf());
          expect(_.unique(riftData.card_choices).length).to.equal(riftData.card_choices.length);

          return knex('user_rift_runs').first().where('ticket_id', ticketId);
        })
        .then((riftData) => {
          expect(moment.utc(riftData.updated_at).valueOf()).to.equal(sanitizeMoment.valueOf());
          expect(_.unique(riftData.card_choices).length).to.equal(riftData.card_choices.length);
        });
    });

    it('expect to sanitize a run with duplicate card choices after choosing card to upgrade', () => {
      let ticketId = null;
      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => knex('users').where('id', userId).update({
          wallet_gold: CONFIG.RIFT_TICKET_GOLD_PRICE,
          wallet_spirit: 1000,
        })).then(() => RiftModule.buyRiftTicketWithGold(userId))
        .then((purchasedTicketId) => {
          ticketId = purchasedTicketId;
          return RiftModule.startRun(userId, ticketId);
        })
        .then((riftData) => RiftModule.chooseGeneral(userId, riftData.ticket_id, riftData.general_choices[0]))
        .then((riftData) => RiftModule.chooseCardToUpgrade(userId, ticketId, riftData.deck[10]))
        .then((riftData) => knex('user_rift_runs').where('ticket_id', riftData.ticket_id).update({
          card_choices: [11088, 20076, 11087, 11087, 20209, 11052],
        }))
        .then(() => knex('user_rift_runs').first().where('ticket_id', ticketId))
        .then((riftData) => RiftModule.sanitizeRunCardChoicesIfNeeded(riftData, sanitizeMoment))
        .then((riftData) => {
          expect(moment.utc(riftData.updated_at).valueOf()).to.equal(sanitizeMoment.valueOf());
          expect(_.unique(riftData.card_choices).length).to.equal(riftData.card_choices.length);

          return knex('user_rift_runs').first().where('ticket_id', ticketId);
        })
        .then((riftData) => {
          expect(moment.utc(riftData.updated_at).valueOf()).to.equal(sanitizeMoment.valueOf());
          expect(_.unique(riftData.card_choices).length).to.equal(riftData.card_choices.length);
        });
    });
  });
});
