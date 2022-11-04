const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const chai = require('chai');

const { expect } = chai;
const Promise = require('bluebird');
const sinon = require('sinon');
const _ = require('underscore');
const moment = require('moment');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
const Errors = require('../../../server/lib/custom_errors.coffee');
const UsersModule = require('../../../server/lib/data_access/users.coffee');
const GauntletModule = require('../../../server/lib/data_access/gauntlet.coffee');
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

describe('gauntlet module', function () {
  this.timeout(25000);

  let userId = null;

  const numDeckRarityTests = 3000;

  const fillOutArenaDeck = function (userId) {
    return knex('user_gauntlet_run').first().where('user_id', userId)
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.card_choices[0]));
  };

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

  describe('buyArenaTicketWithGold()', () => {
    it('expect to NOT be able to buy ticket with insufficient gold', () => GauntletModule.buyArenaTicketWithGold(userId)
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_gauntlet_tickets').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('gauntlet-tickets'), 'value'),
      ]))
      .spread((userRow, ticketRows, fbTickets) => {
        expect(userRow.wallet_gold).to.equal(0);
        expect(ticketRows.length).to.equal(0);
        expect(fbTickets.numChildren()).to.equal(0);
      }));

    it('expect to be able to buy a ticket for 150 gold', () => knex('users').where('id', userId).update({ wallet_gold: 150 }).then((numUpdates) => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticket) => {
        expect(ticket).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_gauntlet_tickets').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('gauntlet-tickets'), 'value'),
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
    before(() => knex('user_gauntlet_tickets').where('id', otherUserTicketId).delete()
      .then(() => knex('user_gauntlet_tickets').insert({
        id: otherUserTicketId,
        user_id: 'some-other-user',
      })));

    // before cleanup to check if user already exists and delete
    after(() => knex('user_gauntlet_tickets').where('id', otherUserTicketId).delete());

    it('expect to NOT be able to start a run with an invalid ticket', () => GauntletModule.startRun(userId, 'doesnt-exist')
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ]))
      .spread((gauntletRunRow, fbRun) => {
        expect(gauntletRunRow).to.not.exist;
        expect(fbRun.val()).to.not.exist;
      }));

    it('expect to NOT be able to start a run with another user\'s ticket', () => GauntletModule.startRun(userId, otherUserTicketId)
      .then((result) => {
        expect(result).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ]))
      .spread((gauntletRunRow, fbRun) => {
        expect(gauntletRunRow).to.not.exist;
        expect(fbRun.val()).to.not.exist;
      }));

    it('expect to be able to start a run with a valid ticket', () => knex('user_gauntlet_tickets').where('user_id', userId).first()
      .bind({})
      .then(function (ticketRow) {
        this.ticketId = ticketRow.id;
        return GauntletModule.startRun(userId, ticketRow.id);
      })
      .then((runData) => {
        expect(runData).to.exist;
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.select().from('user_gauntlet_tickets').where({ user_id: userId }),
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ]))
      .spread((ticketRows, gauntletRunRow, fbRun) => {
        expect(ticketRows.length).to.equal(0);
        expect(gauntletRunRow).to.exist;
        expect(fbRun.val()).to.exist;
      }));

    it('expect to ERROR out attempting starting a run in the middle of another one and to NOT use up an arena ticket', () => knex('users').where('id', userId).update({ wallet_gold: 150 }).then((numUpdates) => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticketId) => {
        expect(ticketId).to.exist;
        return GauntletModule.startRun(userId, ticketId);
      })
      .then((runData) => {
        expect(runData).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.not.be.an.instanceof(chai.AssertionError);
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('users').where({ id: userId }),
        knex.select().from('user_gauntlet_tickets').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('gauntlet-tickets'), 'value'),
      ]))
      .spread((userRow, ticketRows, fbTickets) => {
        expect(userRow.wallet_gold).to.equal(0);
        expect(ticketRows.length).to.equal(1);
        expect(fbTickets.numChildren()).to.equal(1);
      }));
  });

  // describe("chooseFaction()", function() {
  //
  //  // before cleanup
  //  before(function(){
  //    return knex("user_gauntlet_run").where({user_id:userId}).delete()
  //  });
  //
  //  it('expect trying to choose a faction with no run in progress to ERROR', function() {
  //    return GauntletModule.chooseFaction(userId,1)
  //    .then(function(arenaData){
  //      expect(arenaData).to.not.exist;
  //    }).catch(function(error){
  //      expect(error).to.exist;
  //      expect(error).to.be.an.instanceof(Errors.NotFoundError);
  //    });
  //  });
  //
  //  it('expect choosing an INVALID faction to fail', function() {
  //
  //    return knex("users").where('id',userId).update({'wallet_gold':150})
  //    .bind({})
  //    .then(function(){
  //      return GauntletModule.buyArenaTicketWithGold(userId);
  //    }).then(function(ticketId){
  //      return GauntletModule.startRun(userId,ticketId);
  //    }).then(function(arenaData){
  //      return knex("user_gauntlet_run").where('user_id',userId).first()
  //    }).then(function(arenaData){
  //
  //      const invalidChoices = _.difference([
  //            SDK.Factions.Faction1,
  //            SDK.Factions.Faction2,
  //            SDK.Factions.Faction3,
  //            SDK.Factions.Faction4,
  //            SDK.Factions.Faction5,
  //            SDK.Factions.Faction6
  //          ],arenaData.faction_choices);
  //
  //      // Logger.module("UNITTEST").log("choices:",arenaData.faction_choices);
  //      // Logger.module("UNITTEST").log("invalid choices:",invalidChoices);
  //
  //      return GauntletModule.chooseFaction(userId,invalidChoices[0])
  //
  //    }).then(function(arenaData){
  //      expect(arenaData).to.not.exist;
  //    }).catch(function(error){
  //      expect(error).to.exist;
  //      expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
  //    });
  //  });
  //
  //  //it('expect choosing a valid faction to work and set initial card choices', function() {
  //  //  return knex("user_gauntlet_run").where('user_id',userId).first()
  //  //  .bind({})
  //  //  .then(function(arenaData){
  //  //    this.factionId = arenaData.faction_choices[0];
  //  //    return GauntletModule.chooseFaction(userId,this.factionId);
  //  //  }).then(function(arenaData){
  //  //    expect(arenaData).to.exist;
  //  //    expect(arenaData.faction_id).to.exist;
  //  //    expect(arenaData.card_choices).to.exist;
  //  //    return DuelystFirebase.connect().getRootRef()
  //  //  }).then(function(rootRef){
  //  //    return Promise.all([
  //  //      knex.first().from("user_gauntlet_run").where({'user_id':userId}),
  //  //      FirebasePromises.once(rootRef.child("user-gauntlet-run").child(userId).child("current"),"value"),
  //  //    ])
  //  //  }).spread(function(gauntletRow,fbRun){
  //  //    expect(gauntletRow.faction_id).to.equal(this.factionId);
  //  //    expect(gauntletRow.card_choices).to.exist;
  //  //    expect(gauntletRow.card_choices.length).to.equal(3);
  //  //    expect(fbRun.val().faction_id).to.equal(this.factionId);
  //  //    expect(fbRun.val().card_choices).to.exist;
  //  //    expect(fbRun.val().card_choices.length).to.equal(3);
  //  //  });
  //  });
  //
  //  //it('expect to ERROR out attempting to choose a faction twice', function() {
  //  //  return knex("user_gauntlet_run").where('user_id',userId).first()
  //  //  .bind({})
  //  //  .then(function(arenaData){
  //  //    return GauntletModule.chooseFaction(userId,arenaData.faction_choices[0])
  //  //  }).then(function(arenaData){
  //  //    expect(arenaData).to.not.exist;
  //  //  }).catch(function(error){
  //  //    expect(error).to.exist;
  //  //    expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
  //  //  });
  //  //});
  //
  // });
  //
  // describe("chooseCard()", function() {
  //
  //  // before cleanup
  //  before(function(){
  //    return knex("user_gauntlet_run").where({user_id:userId}).delete()
  //  });
  //
  //  it('expect trying to choose a card with no run to ERROR out', function() {
  //    return GauntletModule.chooseCard(userId,1)
  //    .then(function(arenaData){
  //      expect(arenaData).to.not.exist;
  //    }).catch(function(error){
  //      expect(error).to.exist;
  //      expect(error).to.be.an.instanceof(Errors.NotFoundError);
  //    });
  //  });
  //
  //  it('expect choosing a card to work and generate new card choices', function() {
  //
  //    return knex("users").where('id',userId).update({'wallet_gold':150})
  //    .bind({})
  //    .then(function(){
  //      return GauntletModule.buyArenaTicketWithGold(userId);
  //    }).then(function(ticketId){
  //      return GauntletModule.startRun(userId,ticketId);
  //    }).then(function(arenaData){
  //      return GauntletModule.chooseFaction(userId,arenaData.faction_choices[0])
  //    }).then(function(arenaData){
  //      expect(arenaData.card_choices).to.exist;
  //      this.previous_card_choices = arenaData.card_choices;
  //      return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){
  //      expect(arenaData).to.exist;
  //      expect(arenaData.card_choices).to.exist;
  //      expect(_.intersection(this.previous_card_choices,arenaData.card_choices)).to.not.equal(3);
  //      return DuelystFirebase.connect().getRootRef()
  //    }).then(function(rootRef){
  //      return Promise.all([
  //        knex.first().from("user_gauntlet_run").where({'user_id':userId}),
  //        FirebasePromises.once(rootRef.child("user-gauntlet-run").child(userId).child("current"),"value"),
  //      ])
  //    }).spread(function(gauntletRow,fbRun){
  //      expect(gauntletRow.deck.length).to.equal(1);
  //      expect(_.intersection(this.previous_card_choices,gauntletRow.card_choices)).to.not.equal(3);
  //      expect(fbRun.val().deck.length).to.equal(1);
  //      expect(_.intersection(this.previous_card_choices,fbRun.val().card_choices)).to.not.equal(3);
  //    });
  //  });
  //
  //  it('expect choosing an invalid card to fail', function() {
  //    return GauntletModule.chooseCard(userId,-100)
  //    .then(function(arenaData){
  //      expect(arenaData).to.not.exist;
  //    }).catch(function(error){
  //      expect(error).to.exist;
  //      expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
  //    });
  //  });
  //
  //  it('expect to be able to choose 30 cards + general and the run to be marked as complete', function() {
  //    //this.timeout(15000);
  //    this.timeout(30000);
  //
  //    return knex.first().from("user_gauntlet_run").where({'user_id':userId})
  //    .bind({})
  //    .then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.card_choices[0])
  //    }).then(function(arenaData){ return GauntletModule.chooseCard(userId,arenaData.general_choices[0])
  //    }).then(function(arenaData){
  //      expect(arenaData.deck.length).to.equal(31);
  //      expect(arenaData.is_complete).to.equal(true);
  //      return DuelystFirebase.connect().getRootRef();
  //    }).then(function(rootRef){
  //      return Promise.all([
  //        knex.first().from("user_gauntlet_run").where({'user_id':userId}),
  //        FirebasePromises.once(rootRef.child("user-gauntlet-run").child(userId).child("current"),"value"),
  //      ])
  //    }).spread(function(gauntletRow,fbRun){
  //
  //      expect(gauntletRow.deck.length).to.equal(31);
  //      expect(gauntletRow.is_complete).to.equal(true);
  //      expect(gauntletRow.completed_at).to.exist;
  //      expect(gauntletRow.general_id).to.exist;
  //      expect(gauntletRow.deck[0]).to.equal(gauntletRow.general_id);
  //
  //      const gameSession = SDK.GameSession.current();
  //      const generalSDKCard = gameSession.getCardCaches().getCardById(gauntletRow.general_id);
  //      expect(generalSDKCard.getIsGeneral()).to.equal(true);
  //
  //      expect(fbRun.val().deck.length).to.equal(31);
  //      expect(fbRun.val().is_complete).to.equal(true);
  //      expect(fbRun.val().general_id).to.exist;
  //      expect(fbRun.val().deck[0]).to.equal(fbRun.val().general_id);
  //
  //      expect(fbRun.val().general_id).to.equal(gauntletRow.general_id);
  //
  //    });
  //  });
  //
  //  it('expect to NOT be able to choose a card after having a complete deck', function() {
  //    return GauntletModule.chooseCard(userId,1)
  //    .then(function(arenaData){
  //      expect(arenaData).to.not.exist;
  //    }).catch(function(error){
  //      expect(error).to.exist;
  //      expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
  //      expect(error.message).to.equal("You can not choose additional cards");
  //    });
  //  });
  //
  //  it('expect general id after having a complete gauntlet deck', function() {
  //    return knex("user_gauntlet_run").where('user_id',userId).first()
  //    .bind({})
  //    .then(function(arenaData){
  //      expect(arenaData).to.exist;
  //      expect(arenaData.general_id).to.exist;
  //    });
  //  });
  //
  //  it('expect increased number of card choices to be from the Unity set', function() {
  //    this.timeout(10000);
  //
  //    const emphasizedSet = SDK.CardSet.Unity;
  //    const numRounds = 10000;
  //    const totalChoices = 0;
  //    const totalSetChoices = 0;
  //    const all = [];
  //    const allPlayableFactions = SDK.FactionFactory.getAllPlayableFactions();
  //    for (var i = 0; i < numRounds; i++) {
  //      const factionId = _.sample(allPlayableFactions).id;
  //      const cardChoicesPromise = GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, i % 30)
  //      .then(function (cardChoices) {
  //        totalChoices += cardChoices.length;
  //        for (var j = 0, jl = cardChoices.length; j < jl; j++) {
  //          const cardId = cardChoices[j];
  //          const sdkCard = _.find(SDK.GameSession.getCardCaches().getCardSet(emphasizedSet).getCards(), function (card) { return card.getId() === cardId; });
  //          if (sdkCard != null) {
  //            totalSetChoices++;
  //          }
  //        }
  //      });
  //      all.push(cardChoicesPromise);
  //    }
  //
  //    return Promise.all(all)
  //    .then(function () {
  //      expect(totalChoices).to.equal(numRounds * 3);
  //      Logger.module("UNITTEST").log(totalSetChoices / totalChoices);
  //      expect(totalSetChoices / totalChoices).to.be.above(0.05);
  //      expect(totalSetChoices / totalChoices).to.be.below(0.1);
  //    });
  //  });
  //
  // });

  describe('getArenaDeck()', () => {
    it('expect to be able to retrive a user\'s active arena deck', () => SyncModule.wipeUserData(userId)
      .then(() => knex('users').where('id', userId).update({ wallet_gold: 150 })).then(() => GauntletModule.buyArenaTicketWithGold(userId)).then((ticketId) => GauntletModule.startRun(userId, ticketId))
      .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.general_choices[0]))
      .then(() => fillOutArenaDeck(userId))
      .then(() => GauntletModule.getArenaDeck(userId))
      .then((deck) => {
        expect(deck).to.exist;
        expect(deck.length).to.equal(31);
      }));

    it('expect the first card in a user\'s active arena deck to be the correct GENERAL', () => {
      let generalId;
      return GauntletModule.getArenaDeck(userId).then((deck) => {
        expect(deck).to.exist;

        generalId = deck.shift();
        const generalCard = SDK.CardFactory.cardForIdentifier(generalId, SDK.GameSession.current());

        expect(generalCard.getIsGeneral()).to.equal(true);
      }).then(() => knex('user_gauntlet_run').first().where('user_id', userId)).then((runRow) => {
        expect(generalId).to.equal(runRow.general_id);
      });
    });
  });

  describe('getRunMatchmakingMetric()', () => {
    it('expect to be able to retrive a user\'s active arena matchmaking metric', () => GauntletModule.getRunMatchmakingMetric(userId).then((metric) => {
      expect(metric).to.exist;
      expect(metric).to.within(0, 12);
    }));

    it('expect metric to equal MAX WINS - win count', () => GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'metric_game_1')
      .then(() => GauntletModule.getRunMatchmakingMetric(userId)).then((metric) => {
        expect(metric).to.exist;
        expect(metric).to.equal(11);
      }));

    it('TODO: expect metric request to fail on run with incomplete deck', () => {
      expect(true).to.exist;
    });

    it('TODO: expect metric request to fail on run that is finished', () => {
      expect(true).to.exist;
    });

    it('TODO: expect metric request to fail when there\'s no run', () => {
      expect(true).to.exist;
    });
  });

  describe('resignRun()', () => {
    let lastResignedAt = null;

    // before cleanup
    before(() => knex('user_gauntlet_run').where({ user_id: userId }).delete());

    it('expect to ERROR out an attempt to resign with no run', () => GauntletModule.resignRun(userId)
      .then((data) => {
        expect(data).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect to be able to resign an active arena run', () => knex('users').where('id', userId).update({ wallet_gold: 150 })
      .bind({})
      .then(() => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticketId) => GauntletModule.startRun(userId, ticketId))
      .then((arenaData) => GauntletModule.resignRun(userId))
      .then((arenaData) => {
        expect(arenaData.ended_at).to.exist;
        expect(arenaData.is_resigned).to.equal(true);
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ]))
      .spread((gauntletRow, fbRun) => {
        expect(gauntletRow.is_resigned).to.equal(true);
        expect(gauntletRow.ended_at).to.exist;

        expect(fbRun.val().is_resigned).to.equal(true);
        expect(fbRun.val().ended_at).to.exist;

        lastResignedAt = gauntletRow.ended_at;
      }));

    it('expect an attempt to resign an ended run to ERROR out and leave data untouched', () => GauntletModule.resignRun(userId)
      .then((data) => {
        expect(data).to.not.exist;
      }).catch((error) => {
        expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ]))
      .spread((gauntletRow, fbRun) => {
        expect(gauntletRow.is_resigned).to.equal(true);
        expect(gauntletRow.ended_at).to.exist;
        expect(gauntletRow.ended_at.valueOf()).to.equal(lastResignedAt.valueOf());

        expect(fbRun.val().is_resigned).to.equal(true);
        expect(fbRun.val().ended_at).to.exist;
      }));

    it('expect to ERROR out attempts to start a run before claiming rewards on a resigned run', () => knex('users').where('id', userId).update({ wallet_gold: 150 })
      .bind({})
      .then(() => GauntletModule.buyArenaTicketWithGold(userId))
      .then((ticketId) => GauntletModule.startRun(userId, ticketId))
      .then((response) => {
        expect(response).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
        expect(error.message).to.equal('Could not start run: rewards not yet claimed.');
      }));
  });

  describe('updateArenaRunWithGameOutcome()', () => {
    const tickets = [];

    before(function () {
      this.timeout(20000);

      return knex('users').where('id', userId).update({ wallet_gold: 2500 }).then((numUpdates) => knex('user_gauntlet_run').where({ user_id: userId }).delete())
        .then(() => Promise.all([
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
        ]))
        .then((ticketData) => {
          _.each(ticketData, (t) => {
            if (t) tickets.push(t);
          });
        });
    });

    after(() => {
    });

    it('expect to FAIL to update arena run with a game if no arena run is active', () => GauntletModule.updateArenaRunWithGameOutcome(userId, 'game 1', true)
      .then((arenaData) => {
        expect(arenaData).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Error);
      }));

    it('expect to FAIL to update arena run with a game if an arena run is over', () => GauntletModule.startRun(userId, tickets.pop())
      .then((arenaData) => GauntletModule.resignRun(userId)).then((arenaData) => GauntletModule.updateArenaRunWithGameOutcome(userId, 'game 1', true)).then((arenaData) => {
        expect(arenaData).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Error);
      }));

    it('expect a won game to update the arena win counter', function () {
      this.timeout(90000);
      const gameId = generatePushId();
      return knex('user_gauntlet_run').where({ user_id: userId }).delete()
        .then(() => GauntletModule.startRun(userId, tickets.pop()))
        .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.general_choices[0]))
        .then((arenaData) => fillOutArenaDeck(userId))
        .then((arenaData) => GauntletModule.updateArenaRunWithGameOutcome(userId, true, gameId))
        .then((arenaData) => {
          expect(arenaData).to.exist;
          expect(arenaData.win_count).to.equal(1);
          expect(arenaData.loss_count).to.equal(0);
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_gauntlet_run').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
          FirebasePromises.once(rootRef.child('user-games').child(userId).child(gameId).child('job_status'), 'value'),
        ]))
        .spread((gauntletRow, fbRun, firebaseGameJobStatusSnapshot) => {
          expect(gauntletRow.win_count).to.equal(1);
          expect(gauntletRow.loss_count).to.equal(0);

          expect(fbRun.val().win_count).to.equal(1);
          expect(fbRun.val().loss_count).to.equal(0);

          expect(firebaseGameJobStatusSnapshot.val().gauntlet).to.equal(true);
        });
    });

    it('expect a lost game to update the arena loss counter', () => GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 2')
      .then((arenaData) => {
        expect(arenaData).to.exist;
        expect(arenaData.win_count).to.equal(1);
        expect(arenaData.loss_count).to.equal(1);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ])).spread((gauntletRow, fbRun) => {
        expect(gauntletRow.win_count).to.equal(1);
        expect(gauntletRow.loss_count).to.equal(1);

        expect(fbRun.val().win_count).to.equal(1);
        expect(fbRun.val().loss_count).to.equal(1);
      }));

    it('expect a draw to update the arena draw counter and not win/loss', () => GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 2', true)
      .then((arenaData) => {
        expect(arenaData).to.exist;
        expect(arenaData.win_count).to.equal(1);
        expect(arenaData.loss_count).to.equal(1);
        expect(arenaData.draw_count).to.equal(1);
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ])).spread((gauntletRow, fbRun) => {
        expect(gauntletRow.win_count).to.equal(1);
        expect(gauntletRow.loss_count).to.equal(1);
        expect(gauntletRow.draw_count).to.equal(1);

        expect(fbRun.val().win_count).to.equal(1);
        expect(fbRun.val().loss_count).to.equal(1);
        expect(fbRun.val().draw_count).to.equal(1);
      }));

    it('expect 3 losses to end the run', () => Promise.all([
      GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 3'),
      GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 4'),
    ]).spread((arenaDataNoFinal, arenaData) => {
      expect(arenaDataNoFinal.ended_at).to.not.exist;

      expect(arenaData).to.exist;
      expect(arenaData.loss_count).to.equal(3);
      expect(arenaData.ended_at).to.exist;
      expect(arenaData.rewards).to.not.exist;
      return DuelystFirebase.connect().getRootRef();
    }).then((rootRef) => Promise.all([
      knex.first().from('user_gauntlet_run').where({ user_id: userId }),
      FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
    ])).spread((gauntletRow, fbRun) => {
      expect(gauntletRow.loss_count).to.equal(3);
      expect(gauntletRow.ended_at).to.exist;
      expect(gauntletRow.rewards).to.not.exist;

      expect(fbRun.val().loss_count).to.equal(3);
      expect(fbRun.val().ended_at).to.exist;
      expect(fbRun.val().rewards).to.not.exist;
    }));

    it('expect to be able to claim rewards for a complete run', () => GauntletModule.claimRewards(userId)
      .then((arenaData) => {
        expect(arenaData).to.exist;
        expect(arenaData.rewards_claimed_at).to.exist;
        expect(arenaData.rewards).to.exist;
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        knex.select().from('user_rewards').where({ user_id: userId }),
        FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
      ])).spread((gauntletRow, rewardRows, fbRun) => {
        const arenaRewards = _.filter(rewardRows, (row) => row.source_id === gauntletRow.ticket_id);

        expect(arenaRewards).to.exist;
        expect(arenaRewards.length).to.be.above(0);

        expect(gauntletRow.rewards_claimed_at).to.exist;
        expect(gauntletRow.reward_ids).to.exist;

        expect(fbRun.val().rewards_claimed_at).to.exist;
        expect(fbRun.val().rewards).to.exist;
      }));

    it('expect NOT to be able to claim rewards TWICE for a complete run', () => knex.select().from('user_rewards').where({ user_id: userId })
      .bind({})
      .then(function (rewardRows) {
        this.rewardCount = rewardRows.length;
        return GauntletModule.claimRewards(userId);
      })
      .then((arenaData) => {
        expect(arenaData).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.ArenaRewardsAlreadyClaimedError);
        return DuelystFirebase.connect().getRootRef();
      })
      .then((rootRef) => Promise.all([
        knex.first().from('user_gauntlet_run').where({ user_id: userId }),
        knex.select().from('user_rewards').where({ user_id: userId }),
      ]))
      .spread(function (gauntletRow, rewardRows) {
        const arenaRewards = _.filter(rewardRows, (row) => row.source_id === gauntletRow.ticket_id);

        expect(arenaRewards).to.exist;
        expect(arenaRewards.length).to.be.equal(this.rewardCount);
      }));

    it('expect an arena run with 3 wins to generate 4 reward slots', function () {
      this.timeout(35000);
      return GauntletModule.startRun(userId, tickets.pop())
        .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.general_choices[0])).then((arenaData) => fillOutArenaDeck(userId)).then((arenaData) => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 1'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 2'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 3'),
        ]))
        .then(() => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 4'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 5'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 6'),
        ]))
        .then(() => GauntletModule.claimRewards(userId))
        .then((arenaData) => {
          expect(arenaData.loss_count).to.equal(3);
          expect(arenaData.ended_at).to.exist;
          expect(arenaData.rewards).to.exist;
          expect(arenaData.rewards.length).to.equal(4);
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_gauntlet_run').where({ user_id: userId }),
          knex.select().from('user_rewards').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
        ]))
        .spread((gauntletRow, rewardRows, fbRun) => {
          const arenaRewards = _.filter(rewardRows, (row) => row.source_id === gauntletRow.ticket_id);

          expect(arenaRewards).to.exist;
          expect(arenaRewards.length).to.be.equal(4);

          expect(gauntletRow.rewards_claimed_at).to.exist;
          expect(gauntletRow.reward_ids).to.exist;

          expect(fbRun.val().rewards_claimed_at).to.exist;
          expect(fbRun.val().rewards).to.exist;
        });
    });

    it('expect an arena run with 7 wins to generate 5 reward slots', function () {
      this.timeout(35000);
      return GauntletModule.startRun(userId, tickets.pop())
        .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.general_choices[0])).then((arenaData) => fillOutArenaDeck(userId)).then((arenaData) => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 1'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 2'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 3'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 4'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 5'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 6'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 7'),
        ]))
        .then(() => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 8'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 9'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 10'),
        ]))
        .then(() => GauntletModule.claimRewards(userId))
        .then((arenaData) => {
          expect(arenaData).to.exist;
          expect(arenaData.loss_count).to.equal(3);
          expect(arenaData.ended_at).to.exist;
          expect(arenaData.rewards).to.exist;
          expect(arenaData.rewards.length).to.be.equal(5);
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_gauntlet_run').where({ user_id: userId }),
          knex.select().from('user_rewards').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
        ]))
        .spread((gauntletRow, rewardRows, fbRun) => {
          const arenaRewards = _.filter(rewardRows, (row) => row.source_id === gauntletRow.ticket_id);

          expect(arenaRewards).to.exist;
          expect(arenaRewards.length).to.be.equal(5);

          expect(gauntletRow.rewards_claimed_at).to.exist;
          expect(gauntletRow.reward_ids).to.exist;

          expect(fbRun.val().rewards_claimed_at).to.exist;
          expect(fbRun.val().rewards).to.exist;
        });
    });

    it('expect an arena run with 10 wins to generate 6 reward slots', function () {
      this.timeout(35000);
      return GauntletModule.startRun(userId, tickets.pop())
        .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.general_choices[0])).then((arenaData) => fillOutArenaDeck(userId)).then((arenaData) => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 1'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 2'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 3'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 4'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 5'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 6'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 7'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 8'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 9'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 10'),
        ]))
        .then(() => Promise.all([

          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 11'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 12'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 13'),
        ]))
        .then(() => GauntletModule.claimRewards(userId))
        .then((arenaData) => {
          expect(arenaData).to.exist;
          expect(arenaData.loss_count).to.equal(3);
          expect(arenaData.ended_at).to.exist;
          expect(arenaData.rewards).to.exist;
          expect(arenaData.rewards.length).to.be.equal(6);

          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_gauntlet_run').where({ user_id: userId }),
          knex.select().from('user_rewards').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
        ]))
        .spread((gauntletRow, rewardRows, fbRun) => {
          const arenaRewards = _.filter(rewardRows, (row) => row.source_id === gauntletRow.ticket_id);

          expect(arenaRewards).to.exist;
          expect(arenaRewards.length).to.be.equal(5); // Only 5 because Card ids are collapsed

          expect(gauntletRow.rewards_claimed_at).to.exist;
          expect(gauntletRow.reward_ids).to.exist;

          expect(fbRun.val().rewards_claimed_at).to.exist;
          expect(fbRun.val().rewards).to.exist;
        });
    });

    it('expect an arena run with 12 wins and 0 losses to end', function () {
      this.timeout(45000);
      return GauntletModule.startRun(userId, tickets.pop())
        .then((arenaData) => GauntletModule.chooseCard(userId, arenaData.general_choices[0])).then((arenaData) => fillOutArenaDeck(userId)).then((arenaData) => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 1'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 2'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 3'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 4'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 5'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 6'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 7'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 8'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 9'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 10'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 11'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 12'),
        ]))
        .then(() => GauntletModule.claimRewards(userId))
        .then((arenaData) => {
          expect(arenaData).to.exist;
          expect(arenaData.loss_count).to.equal(0);
          expect(arenaData.ended_at).to.exist;
          return DuelystFirebase.connect().getRootRef();
        })
        .then((rootRef) => Promise.all([
          knex.first().from('user_gauntlet_run').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-gauntlet-run').child(userId).child('current'), 'value'),
        ]))
        .spread((gauntletRow, fbRun) => {
          expect(gauntletRow.ended_at).to.exist;
          expect(fbRun.val().ended_at).to.exist;
        });
    });
  });

  describe('claimRewards()', () => {
    const tickets = [];

    before(function () {
      this.timeout(10000);

      return knex('users').where('id', userId).update({ wallet_gold: 2500 }).then((numUpdates) => knex('user_gauntlet_run').where({ user_id: userId }).delete())
        .then(() => Promise.all([
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
          GauntletModule.buyArenaTicketWithGold(userId),
        ]))
        .then((ticketData) => {
          _.each(ticketData, (t) => {
            if (t) tickets.push(t);
          });
        });
    });

    after(() => {
    });

    it('expect inventory and wallet to update after claiming rewards', function () {
      this.timeout(40000);
      return Promise.all([
        knex('users').first().where('id', userId),
        knex('user_card_collection').first().where('user_id', userId),
        knex('user_spirit_orbs').select().where('user_id', userId),
        knex('user_gauntlet_tickets').select().where('user_id', userId),
      ]).spread(function (userRow, collectionRow, boosterRows, ticketRows) {
        this.userRow = userRow;
        this.collectionRow = collectionRow;
        this.boosterRows = boosterRows;
        this.ticketRows = ticketRows;

        return GauntletModule.startRun(userId, tickets.pop());
      }).then((arenaData) => GauntletModule.chooseCard(userId, arenaData.general_choices[0])).then((arenaData) => fillOutArenaDeck(userId))
        .then((arenaData) => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 1'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 2'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 3'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 4'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 5'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 6'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, true, 'game 7'),
        ]))
        .then(() => Promise.all([
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 8'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 9'),
          GauntletModule.updateArenaRunWithGameOutcome(userId, false, 'game 10'),
        ]))
        .then(() => GauntletModule.claimRewards(userId))
        .then(function (arenaData) {
          expect(arenaData).to.exist;
          expect(arenaData.loss_count).to.equal(3);
          expect(arenaData.ended_at).to.exist;
          expect(arenaData.rewards).to.exist;
          expect(arenaData.rewards.length).to.be.above(4); // 5 or 6 reward slots because one could include 2 card rewards
          this.rewards = arenaData.reward_ids;
          return DuelystFirebase.connect().getRootRef();
        })
        .then(function (rootRef) {
          return Promise.all([
            knex('user_rewards').select().whereIn('id', this.rewards),
            knex('users').first().where('id', userId),
            knex('user_card_collection').first().where('user_id', userId),
            knex('user_spirit_orbs').select().where('user_id', userId),
            knex('user_gauntlet_tickets').select().where('user_id', userId),
            FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
            FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
            FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs'), 'value'),
            FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('gauntlet-tickets'), 'value'),
          ]);
        })
        .spread(function (rewardRows, userRow, collectionRow, boosterRows, ticketRows, walletSnapshot, collectionSnapshot, boosterPacksSnapshot, ticketsSnapshot) {
          const newCollectionData = collectionSnapshot.val();
          let totalGoldEarned = 0;
          let totalSpiritEarned = 0;

          _.each(rewardRows, (reward) => {
            if (reward.cards) {
              const cardId = reward.cards[0];
              // Logger.module("UNITTEST").log("checking card "+cardId);
              const newCount = newCollectionData[cardId].count;
              let oldCount = 0;
              if (this.collectionRow && this.collectionRow.cards[cardId]) oldCount = this.collectionRow.cards[cardId].count;

              expect(oldCount + 1).to.equal(newCount);
              expect(oldCount + 1).to.equal(collectionRow.cards[cardId].count);
            } else if (reward.gold) {
              totalGoldEarned += parseInt(reward.gold, 10);
            } else if (reward.spirit) {
              totalSpiritEarned += parseInt(reward.spirit, 10);
            }
          });

          // Logger.module("UNITTEST").log("wallet",walletSnapshot.val())

          // check gold
          const oldGold = this.userRow.wallet_gold || 0;
          expect(userRow.wallet_gold).to.equal(oldGold + totalGoldEarned);
          expect((walletSnapshot.val().gold_amount || 0)).to.equal(oldGold + totalGoldEarned);

          // check spirit
          const oldSpirit = this.userRow.wallet_spirit || 0;
          expect(userRow.wallet_spirit).to.equal(oldSpirit + totalSpiritEarned);
          expect((walletSnapshot.val().spirit_amount || 0)).to.equal(oldSpirit + totalSpiritEarned);

          // check boosters
          expect(boosterRows.length).to.equal(this.boosterRows.length + 1);
          expect(boosterPacksSnapshot.numChildren()).to.equal(this.boosterRows.length + 1);

          // check tickets (same as before because we used one and got one)
          expect(ticketRows.length).to.equal(this.ticketRows.length);
          expect(ticketsSnapshot.numChildren()).to.equal(this.ticketRows.length);
        });
    });

    it('expect not to be able to claim rewards twice', () => GauntletModule.claimRewards(userId)
      .then((response) => {
        expect(response).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.ArenaRewardsAlreadyClaimedError);
      }));
  });

  /// /
  describe('generate card rarity output', () => {
    const tickets = [];

    before(() => {
    });

    after(() => {
    });

    it('iterate over card choice rarities', function () {
      this.timeout(40000);

      let numBasics = 0;
      let numCommon = 0;
      let numRare = 0;
      let numEpic = 0;
      let numLegendary = 0;
      const minRaritySum = Number.MAX_SAFE_INTEGER;
      const maxRaritySum = 0;

      let numFactionCards = 0;
      let numNeutralCards = 0;

      const generateDeck = function () {
        const deck = [];
        const factionId = _.random(1, 6);
        return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 1, null)
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 2, deck[deck.length - 1]);
          }).then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 3, deck[deck.length - 1]);
          }).then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 4, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 5, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 6, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 7, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 8, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 9, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 10, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 11, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 12, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 13, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 14, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 15, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 16, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 17, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 18, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 19, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 20, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 21, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 22, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 23, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 24, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 25, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 26, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 27, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 28, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 29, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return GauntletModule._generateCardChoices(Promise.resolve(), knex, userId, factionId, 30, deck[deck.length - 1]);
          })
          .then((cardIds) => {
            deck.push(cardIds[_.random(0, 2)]);
            return Promise.resolve(deck);
          });
      };

      const gatherDeckResults = function (iteration) {
        return generateDeck()
          .then((deck) => {
            let deckRaritySum = 0;
            _.each(deck, (cardId) => {
              const sdkCard = SDK.GameSession.getCardCaches().getCardById(cardId);
              const cardRarity = sdkCard.getRarityId();
              const cardFactionId = sdkCard.getFactionId();

              deckRaritySum += cardRarity;

              if (cardRarity === SDK.Rarity.Fixed) {
                numBasics += 1;
              } else if (cardRarity === SDK.Rarity.Common) {
                numCommon += 1;
              } else if (cardRarity === SDK.Rarity.Rare) {
                numRare += 1;
              } else if (cardRarity === SDK.Rarity.Epic) {
                numEpic += 1;
              } else if (cardRarity === SDK.Rarity.Legendary) {
                numLegendary += 1;
              }

              if (cardFactionId !== SDK.Factions.Neutral) {
                numFactionCards += 1;
              } else {
                numNeutralCards += 1;
              }
            });
            return Promise.resolve();
          });
      };

      const deckPromises = [];
      for (let i = 0; i < numDeckRarityTests; i++) {
        deckPromises.push(gatherDeckResults(i));
      }

      return Promise.all(deckPromises)
        .then(() => {
          const sumCards = numBasics + numCommon + numRare + numEpic + numLegendary;
          console.log('============');
          console.log(`${numDeckRarityTests} Iterations:`);
          console.log(`${((numBasics / sumCards) * 100).toFixed(1)}% basics`);
          console.log(`${((numCommon / sumCards) * 100).toFixed(1)}% common`);
          console.log(`${((numRare / sumCards) * 100).toFixed(1)}% rare`);
          console.log(`${((numEpic / sumCards) * 100).toFixed(1)}% epic`);
          console.log(`${((numLegendary / sumCards) * 100).toFixed(1)}% legendary`);
          console.log('============');
          console.log(`${((numFactionCards / sumCards) * 100).toFixed(1)}% Faction Cards`);
          console.log(`${((numNeutralCards / sumCards) * 100).toFixed(1)}% Neutral Cards`);
          console.log('============');
        });
    });
  });
});
