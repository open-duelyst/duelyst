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
const QuestsModule = require('../../../server/lib/data_access/quests.coffee');
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

describe('sync module', function () {
  const userId = null;
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
      const userId = player1CreatedId;
      const user2Id = player2CreatedId;
    });
  });

  describe('_syncUserFromSQLToFirebase()', () => {
    it('card-collection in firebase to be removed if user collection data empty in SQL', () => {
      const txPromise = knex.transaction((tx) => {
        InventoryModule.giveUserCards(txPromise, tx, userId, [20157, 10974, 20052, 10014, 10965])
          .then(() => {
            tx.commit();
          })
          .catch((e) => {
            Logger.module('UNITTEST').log(e);
            tx.rollback();
          });
      }).bind({}).then(() => SyncModule._syncUserFromSQLToFirebase(userId)).then(() => DuelystFirebase.connect().getRootRef())
        .then(function (rootRef) {
          this.rootRef = rootRef;
          return Promise.all([
            knex.select().from('user_cards').where({ user_id: userId }),
            knex.first().from('user_card_collection').where({ user_id: userId }),
            FirebasePromises.once(this.rootRef.child('user-inventory').child(userId).child('card-collection'), 'value'),
          ]);
        })
        .spread((cardCountRows, cardCollection, fbCardCollection) => {
          expect(cardCountRows.length).to.equal(5);
          expect(_.keys(fbCardCollection.val()).length).to.equal(5);
        })
        .then(() => SyncModule.wipeUserData(userId))
        .then(() => SyncModule._syncUserFromSQLToFirebase(userId))
        .then(function () {
          return FirebasePromises.once(this.rootRef.child('user-inventory').child(userId).child('card-collection'), 'value');
        })
        .then((fbCardCollection) => {
          expect(fbCardCollection.val()).to.equal(null);
        });

      return txPromise;
    });
  });
});
