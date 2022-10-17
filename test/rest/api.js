require('coffeescript/register');

const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const util = require('util');
const _ = require('underscore');
const request = require('supertest')(api);
const fbUtil = require('../../app/common/utils/utils_firebase');
const config = require('../../config/config');
const DuelystFirebase = require('../../server/lib/duelyst_firebase_module.coffee');
const UsersModule = require('../../server/lib/data_access/users.coffee');
const SDK = require('../../app/sdk.coffee');

// configure where to run the tests against
const api = require('../../server/express.coffee');

const { version } = require('../../version.json');

// disable the logger for cleaner test output
const Logger = require('../../app/common/logger.coffee');

Logger.enabled = false;

// Some global vars to save state
// TODO: move to scope of tests as appropiate
let token;
let boosterId;
const cardIds = [];

describe('api', () => {
  // before cleanup to check if user already exists and delete
  before(function () {
    this.timeout(5000);
    const escapedEmail = fbUtil.escapeEmail('unittestdummy@gmail.com');
    return DuelystFirebase.connect().getRootRef()
      .bind({})
      .then(function (fbRootRef) {
        this.fbRootRef = fbRootRef;
        return UsersModule.userIdForEmail('unittestdummy@gmail.com');
      })
      .then(function (userId) {
        if (!userId) {
          Logger.module('UNITTEST').log('userid not found, continuing...');
        } else {
          this.userId = userId;
          this.fbRootRef.child('username-index').child('unittestdummy').remove();
          this.fbRootRef.child('users').child(userId).remove();
          this.fbRootRef.child('user-transactions').child(userId).remove();
          this.fbRootRef.child('user-inventory').child(userId).remove();
          this.fbRootRef.child('user-logs').child(userId).remove();
          this.fbRootRef.child('user-quests').child(userId).remove();
          this.fbRootRef.child('user-ranking').child(userId).remove();
          this.fbRootRef.child('user-aggregates').child(userId).remove();
          this.fbRootRef.child('user-decks').child(userId).remove();
          this.fbRootRef.child('user-games').child(userId).remove();
          this.fbRootRef.child('user-progression').child(userId).remove();
          this.fbRootRef.child('user-faction-progression').child(userId).remove();
          this.fbRootRef.child('user-challenge-progression').child(userId).remove();
          this.fbRootRef.child('user-arena-run').child(userId).remove();
          this.fbRootRef.child('user-news').child(userId).remove();
          this.fbRootRef.child('user-matchmaking-errors').child(userId).remove();
          this.fbRootRef.child('user-stats').child(userId).remove();
          this.fbRootRef.child('user-rewards').child(userId).remove();
        }
      });
  });

  // Will delete unittestdummy user created after tests run
  after(function () {
    this.timeout(5000);
    const escapedEmail = fbUtil.escapeEmail('unittestdummy@gmail.com');
    return DuelystFirebase.connect().getRootRef()
      .bind({})
      .then(function (fbRootRef) {
        this.fbRootRef = fbRootRef;
        return UsersModule.userIdForEmail('unittestdummy@gmail.com');
      })
      .then(function (userId) {
        if (!userId) {
          Logger.module('UNITTEST').log('userid not found, continuing...');
        } else {
          this.userId = userId;
          this.fbRootRef.child('username-index').child('unittestdummy').remove();
          this.fbRootRef.child('users').child(userId).remove();
          this.fbRootRef.child('user-transactions').child(userId).remove();
          this.fbRootRef.child('user-inventory').child(userId).remove();
          this.fbRootRef.child('user-logs').child(userId).remove();
          this.fbRootRef.child('user-quests').child(userId).remove();
          this.fbRootRef.child('user-ranking').child(userId).remove();
          this.fbRootRef.child('user-aggregates').child(userId).remove();
          this.fbRootRef.child('user-decks').child(userId).remove();
          this.fbRootRef.child('user-games').child(userId).remove();
          this.fbRootRef.child('user-progression').child(userId).remove();
          this.fbRootRef.child('user-faction-progression').child(userId).remove();
          this.fbRootRef.child('user-challenge-progression').child(userId).remove();
          this.fbRootRef.child('user-arena-run').child(userId).remove();
          this.fbRootRef.child('user-news').child(userId).remove();
          this.fbRootRef.child('user-matchmaking-errors').child(userId).remove();
          this.fbRootRef.child('user-stats').child(userId).remove();
          this.fbRootRef.child('user-rewards').child(userId).remove();
        }
      });
  });

  describe('login', () => {
    it('expect 400 if not providing client version header', function (done) {
      this.timeout(1500);
      request
        .post('/session')
        .expect(400, done);
    });
    it('expect 400 if not providing a valid login request parameters', function (done) {
      this.timeout(1500);
      request
        .post('/session')
        .set('Client-Version', version)
        .expect(400, done);
    });
    it('expect 401 if not providing valid login', function (done) {
      this.timeout(1500);
      request
        .post('/session')
        .set('Client-Version', version)
        .send({ email: 'thisemailshouldreallynotexist@notemail.com', password: 'password' })
        .expect(401, done);
    });

    it('expect 401 if providing an invalid password', function (done) {
      this.timeout(1500);
      request
        .post('/session')
        .set('Client-Version', version)
        .send({ email: 'unittestdummy@gmail.com', password: 'thisisnotthepassword' })
        .expect(401, done);
    });

    it('expect a token when logging in with new account credentials', function (done) {
      this.timeout(5000);
      request
        .post('/session')
        .set('Client-Version', version)
        .send({ email: 'unittestdummy@gmail.com', password: 'password' })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          expect(res.body).to.have.property('token');
          expect(jwt.decode(res.body.token).d.id).to.have.length(20);
          expect(jwt.decode(res.body.token).d.email).to.be.equal('unittestdummy@gmail.com');
          token = res.body.token;
          done();
        });
    });
  });

  describe('register', () => {
    it('does not allow you to register without a username', function (done) {
      this.timeout(10000);
      request
        .post('/session/register')
        .set('Client-Version', version)
        .send({ email: 'unittestdummy@gmail.com', password: 'password', keycode: 'kumite14' })
        .expect(400, done);
    });

    it('expect a new user id when registering with valid credentials', function (done) {
      this.timeout(30000);
      request
        .post('/session/register')
        .set('Client-Version', version)
        .send({
          email: 'unittestdummy@gmail.com', username: 'unittestdummy', password: 'password', keycode: 'kumite14',
        })
        .expect(200, done);
    });
  });

  describe('/api/me/', () => {
    it('returns 404', function (done) {
      this.timeout(2500);
      request
        .get('/api')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(404, done);
    });
  });

  describe('/api/me/securetest', () => {
    it('returns 200 OK', function (done) {
      this.timeout(2500);
      request
        .get('/api/me/securetest')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(200, done);
    });
  });

  describe('/api/me/ladder/ranking', () => {
    it('returns 200 OK', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/rank')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(304, done);
    });
  });

  describe('/api/me/quests/daily/generate', () => {
    it('returns 200 OK the first time', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/quests/daily/generate')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          expect(res.body);
          expect(res.body.quests.length).to.not.equal(0);
          done();
        });
    });
    it('returns 304 the next time you try to call it', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/quests/daily/generate')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(304)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });
  });

  describe('/api/me/quests/daily/mulligan', () => {
    it('returns 400 if you don\'t provide a quest index', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/quests/daily/mulligan')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });
    it('returns 200 OK for mulliganing quest 1', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/quests/daily/mulligan')
        .set('Client-Version', version)
        .send({ quest_index: 0 })
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });
    it('returns 200 OK for mulliganing quest 2', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/quests/daily/mulligan')
        .set('Client-Version', version)
        .send({ quest_index: 1 })
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });
    it('returns 200 OK for mulliganing quest 3', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/quests/daily/mulligan')
        .set('Client-Version', version)
        .send({ quest_index: 2 })
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });
    it('returns 304 for subsequent attempts to mulligan a quest for the day', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/quests/daily/mulligan')
        .set('Client-Version', version)
        .send({ quest_index: 1 })
        .set('Authorization', `Bearer ${token}`)
        .expect(304)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });
  });

  describe('/api/me/booster_packs/buy', () => {
    // add some gold to the wallet
    before(function () {
      this.timeout(5000);
      const escapedEmail = fbUtil.escapeEmail('unittestdummy@gmail.com');
      return DuelystFirebase.connect().getRootRef()
        .then((fbRootRef) => UsersModule.userIdForEmail('unittestdummy@gmail.com'))
        .then((userId) => UsersModule.updateWalletWithFunction(userId, (data) => {
          if (data) data.gold_amount = 100;
          return data;
        }))
        .then((walletData) => {
          expect(walletData).to.exist;
        });
    });

    it('returns 400 if not providing currency_type', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/booster_packs/buy')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          // Logger.module("UNITTEST").log(res.body);
          done();
        });
    });

    it('returns 400 if providing currency_type=hard and no SKU', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/booster_packs/buy')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ currency_type: 'hard' })
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          // Logger.module("UNITTEST").log(res.body);
          done();
        });
    });

    it('returns 400 if providing currency_type=hard and bad SKU', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/booster_packs/buy')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ currency_type: 'hard', product_sku: 'BOOSTER' })
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          // Logger.module("UNITTEST").log(res.body);
          done();
        });
    });

    it('returns 200 and booster data if buying with gold', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/booster_packs/buy')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ currency_type: 'soft' })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          expect(res.body).to.exist;
          expect(res.body).to.have.property('id');
          expect(res.body.id).to.have.length(20);
          // Save booster id for next test to unlock
          boosterId = res.body.id;
          done();
        });
    });

    it('returns 403 if not enough gold', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/booster_packs/buy')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ currency_type: 'soft' })
        .expect(403)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          // Logger.module("UNITTEST").log(res.body);
          expect(res.body).to.exist;
          done();
        });
    });
  });

  describe('/api/me/booster_packs/unlock', () => {
    it('expect 400 if not providing a pack_id', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/booster_packs/unlock')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
        .end((err, res) => {
          // Logger.module("UNITTEST").log(res.body);
          done();
        });
    });

    it('expect 200 and unlocked booster data when providing valid booster id', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/booster_packs/unlock')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ booster_pack_id: boosterId })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          expect(res.body).to.be.exist;
          expect(res.body).to.have.keys(['created_at', 'transaction_type', 'cards', 'opened_at']);
          expect(_.size(res.body.cards)).to.equal(5);
          _.each(res.body.cards, (card) => {
            expect(card).to.be.a('number');
            cardIds.push(card);
          });
          done();
        });
    });
  });

  describe('/api/me/shop/customer', () => {
    it('returns 400 for not providing a card_token or card_last_four_digits', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/shop/customer')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(400, done);
    });
  });

  describe('/api/me/craft/disenchant', () => {
    it('returns 400 for not providing card ids', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/craft/disenchant')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(400, done);
    });

    it('returns 500 for providing any fixed card', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/craft/disenchant')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ card_ids: [SDK.Cards.Faction1.SilverguardSquire, SDK.Cards.Faction1.SunstoneMaiden] })
        .expect(500, done);
    });

    it('returns 200 and rewardData when giving valid ids', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/craft/disenchant')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ card_ids: cardIds })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          Logger.module('UNITTEST').log(res.body);
          done();
        });
    });
  });

  describe('/api/me/craft/card', () => {
    before(function () {
      this.timeout(5000);
      const escapedEmail = fbUtil.escapeEmail('unittestdummy@gmail.com');
      return DuelystFirebase.connect().getRootRef()
        .then((fbRootRef) => UsersModule.userIdForEmail('unittestdummy@gmail.com'))
        .then((userId) => UsersModule.updateWalletWithFunction(userId, (walletData) => {
          if (walletData) {
            walletData.spirit_amount = 200;
            // add some rare shards for crafting
            walletData.shards[SDK.RarityFactory.rarityForIdentifier(2).name.toLowerCase()] = 3;
          }
          return walletData;
        }))
        .then((walletData) => {
          expect(walletData).to.exist;
        });
    });

    it('returns 400 for not providing a card', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/craft/card')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .expect(400, done);
    });

    it('returns 500 for providing a fixed card', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/craft/card')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ card_id: SDK.Cards.Faction1.SilverguardSquire })
        .expect(500, done);
    });

    it('returns 200 and rewardData when giving valid ids', function (done) {
      this.timeout(2500);
      request
        .post('/api/me/craft/card')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${token}`)
        .send({ card_id: SDK.Cards.Faction1.IroncliffeGuardian })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          Logger.module('UNITTEST').log(res.body);
          done();
        });
    });
  });
});
