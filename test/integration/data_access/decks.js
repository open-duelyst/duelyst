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
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const DecksModule = require('../../../server/lib/data_access/decks.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const config = require('../../../config/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && true;

describe('decks module', () => {
  let userId = null;

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

  describe('addDeck()', () => {
    it('adds a deck', () => DecksModule.addDeck(userId, SDK.Factions.Lyonar, 'lyonoobs', [SDK.Cards.Faction1.Lightchaser, SDK.Cards.Faction1.Lightchaser, SDK.Cards.Faction1.Lightchaser], 0, 3, 0, 0)
      .then(() => knex('user_decks').select().where('user_id', userId)).then((deckRows) => {
        expect(deckRows.length).to.equal(1);
        expect(deckRows[0].name).to.equal('lyonoobs');
        expect(deckRows[0].cards.length).to.equal(3);
        expect(deckRows[0].cards).to.contain(SDK.Cards.Faction1.Lightchaser);
        expect(deckRows[0].minion_count).to.equal(3);
      }));
  });

  describe('updateDeck()', () => {
    it('updates a deck', () => knex('user_decks').first().where('user_id', userId)
      .then((deckRow) => DecksModule.updateDeck(userId, deckRow.id, SDK.Factions.Lyonar, 'lyonoobs 2', [SDK.Cards.Faction1.Sunriser], 0, 1, 0, 0))
      .then(() => knex('user_decks').select().where('user_id', userId))
      .then((deckRows) => {
        expect(deckRows.length).to.equal(1);
        expect(deckRows[0].name).to.equal('lyonoobs 2');
        expect(deckRows[0].cards.length).to.equal(1);
        expect(deckRows[0].cards).to.contain(SDK.Cards.Faction1.Sunriser);
        expect(deckRows[0].minion_count).to.equal(1);
      }));
  });

  describe('hashCodeForDeck()', () => {
    it('generates a deck digest', () => {
      const digest = DecksModule.hashForDeck([SDK.Cards.Faction1.Sunriser, SDK.Cards.Faction1.Sunriser, SDK.Cards.Faction1.Sunriser], '');
      expect(digest).to.exist;
    });

    it('generates two different digests based on salt', () => {
      const digest1 = DecksModule.hashForDeck([SDK.Cards.Faction1.Sunriser, SDK.Cards.Faction1.Sunriser, SDK.Cards.Faction1.Sunriser], '2');
      const digest2 = DecksModule.hashForDeck([SDK.Cards.Faction1.Sunriser, SDK.Cards.Faction1.Sunriser, SDK.Cards.Faction1.Sunriser], '1');
      expect(digest1).to.not.equal(digest2);
    });
  });
});
