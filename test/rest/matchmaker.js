require('coffeescript/register');

const { expect } = require('chai');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const api = require('../../server/express.coffee');
const { version } = require('../../version.json');

const UsersModule = require('../../server/lib/data_access/users.coffee');
const SyncModule = require('../../server/lib/data_access/sync.coffee');
const Errors = require('../../server/lib/custom_errors.coffee');
const Logger = require('../../app/common/logger.coffee');
const GameType = require('../../app/sdk/gameType.coffee');

const request = supertest(api);

// disable the logger for cleaner test output
Logger.enabled = false;

describe('matchmaking', () => {
  let userId1;
  let userId2;

  let p1Token;
  let p1Id;
  let p2Token;
  let p2Id;
  let matchmakingToken1;
  let matchmakingToken2;

  // before cleanup to check if user already exists and delete
  before(function () {
    this.timeout(25000);
    Logger.module('UNITTEST').log('creating users');
    return UsersModule.createNewUser('unit-test@duelyst.local', 'unittest', 'hash', 'kumite14')
      .then((userIdCreated) => {
        Logger.module('UNITTEST').log('created user 1 ', userIdCreated);
        userId1 = userIdCreated;
      }).catch(Errors.AlreadyExistsError, (error) => {
        Logger.module('UNITTEST').log('existing user 1');
        return UsersModule.userIdForEmail('unit-test@duelyst.local').then((userIdExisting) => {
          Logger.module('UNITTEST').log('existing user 1 retrieved', userIdExisting);
          userId1 = userIdExisting;
          return SyncModule.wipeUserData(userIdExisting);
        }).then(() => {
          Logger.module('UNITTEST').log('existing user 1 data wiped', userId1);
        });
      }).then(() => UsersModule.createNewUser('unit-test2@duelyst.local', 'unittest', 'hash', 'kumite14'))
      .then((userIdCreated) => {
        Logger.module('UNITTEST').log('created user 2 ', userIdCreated);
        userId2 = userIdCreated;
      })
      .catch(Errors.AlreadyExistsError, (error) => {
        Logger.module('UNITTEST').log('existing user 2');
        return UsersModule.userIdForEmail('unit-test@duelyst.local').then((userIdExisting) => {
          Logger.module('UNITTEST').log('existing user 2 retrieved', userIdExisting);
          userId2 = userIdExisting;
          return SyncModule.wipeUserData(userIdExisting);
        }).then(() => {
          Logger.module('UNITTEST').log('existing user 2 data wiped', userId2);
        });
      })
      .catch((error) => {
        Logger.module('UNITTEST').log('unexpected error: ', error);
        throw error;
      });
  });

  // Get a token for player 1
  describe('login player 1', () => {
    it('expect a player 1 token when logging in', function (done) {
      this.timeout(5000);
      request
        .post('/session')
        .set('Client-Version', version)
        .send({ email: 'unit-test@duelyst.local', password: 'hash' })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          expect(res.body).to.have.property('token');
          expect(jwt.decode(res.body.token).d.id).to.have.length(20);
          expect(jwt.decode(res.body.token).d.email).to.be.equal('unit-test@duelyst.local');
          p1Token = res.body.token;
          p1Id = jwt.decode(res.body.token).d.id;
          done();
        });
    });
  });

  // Get a token for player 2
  describe('login player 2', (done) => {
    it('expect a player 2 token when logging in', function (done) {
      this.timeout(5000);
      request
        .post('/session')
        .set('Client-Version', version)
        .send({ email: 'unit-test2@duelyst.local', password: 'hash' })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          expect(res.body).to.have.property('token');
          expect(jwt.decode(res.body.token).d.id).to.have.length(20);
          expect(jwt.decode(res.body.token).d.email).to.be.equal('unit-test2@duelyst.local');
          p2Token = res.body.token;
          p2Id = jwt.decode(res.body.token).d.id;
          done();
        });
    });
  });

  describe('POST /matchmaking', () => {
    it('returns 400 for if no client version', (done) => {
      request
        .post('/matchmaking')
        .set('Accept', 'application/json')
        .send()
        .expect(400, done);
    });

    it('returns 400 for if wrong client version', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', 'wrong')
        .set('Accept', 'application/json')
        .send()
        .expect(400, done);
    });

    it('returns 401 for if no login data', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Accept', 'application/json')
        .send()
        .expect(401, done);
    });

    it('returns 400 if no matchmaking request data', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .set('Accept', 'application/json')
        .send()
        .expect(400, done);
    });

    it('returns 400 with invalid deck message with a deck with fewer than 40 cards', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .set('Accept', 'application/json')
        .send({ deck: [1000], factionId: 1, gameType: GameType.Ranked })
        .expect(400)
        .end((err, res) => {
          expect(res.status).to.be.equal(400);
          // expect(res.body).to.have.property('error');
          // expect(res.body.error).to.be.equal('Deck has fewer than 40 cards')
          done();
        });
    });

    it('returns 400 with invalid general message if deck has no general', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .set('Accept', 'application/json')
        .send({
          deck: [
            1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
            1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
            1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
            1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
          ],
          factionId: 1,
          gameType: GameType.Ranked,
        })
        .expect(400)
        .end((err, res) => {
          expect(res.status).to.be.equal(400);
          // expect(res.body).to.have.property('error');
          // expect(res.body.error).to.be.equal('First card in the deck must be a general')
          done();
        });
    });

    it('returns 400 with invalid deck message if sent an invalid deck with more than 3 of a card', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .set('Accept', 'application/json')
        .send({
          deck: [
            1, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
          ],
          factionId: 1,
          gameType: GameType.Ranked,
        })
        .expect(400)
        .end((err, res) => {
          expect(res.status).to.be.equal(400);
          // expect(res.body).to.have.property('error');
          // expect(res.body.error).to.be.equal('Deck has more than 3 of a card')
          done();
        });
    });

    it('returns 200 when using a valid deck', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .set('Accept', 'application/json')
        .send({
          deck: [
            1, 8, 8, 8, 9, 9, 9, 11, 11, 11,
            30004, 30004, 30004, 20066, 20066,
            20066, 20044, 20044, 20044, 20047,
            20047, 20047, 10205, 10205, 10205,
            20090, 20090, 20090, 10017, 10017,
            10017, 19031, 19031, 19031, 10204,
            10204, 10204, 10206, 10206, 10206,
          ],
          factionId: 1,
          gameType: GameType.Ranked,
          name: 'Player 1',
          ranking: { rank: 30 },
        })
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.have.property('token');
          // matchmakingToken1 = res.body.token;
          done();
        });
    });
  });

  describe('GET /matchmaking', () => {
    it('returns 200 and current token', (done) => {
      request
        .get('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .expect(200)
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.have.property('id');
          done();
        });
    });
  });

  describe('DELETE /matchmaking', () => {
    it('returns 204', (done) => {
      request
        .del('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .expect(204)
        .end((err, res) => {
          expect(res.status).to.be.equal(204);
          done();
        });
    });
  });

  describe('GET /matchmaking (after delete)', () => {
    it('returns 404', (done) => {
      request
        .get('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .expect(404)
        .end((err, res) => {
          expect(res.status).to.be.equal(404);
          done();
        });
    });
  });

  // TODO: before() : probe redis to get the current game id
  // Player 1 joins
  describe('matchmaking POST player 1', () => {
    it('returns 200', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p1Token}`)
        .set('Accept', 'application/json')
        .send({
          deck: [
            1, 8, 8, 8, 9, 9, 9, 11, 11, 11,
            30004, 30004, 30004, 20066, 20066,
            20066, 20044, 20044, 20044, 20047,
            20047, 20047, 10205, 10205, 10205,
            20090, 20090, 20090, 10017, 10017,
            10017, 19031, 19031, 19031, 10204,
            10204, 10204, 10206, 10206, 10206,
          ],
          factionId: 1,
          gameType: GameType.Ranked,
          name: 'Player 1',
          ranking: { rank: 30 },
        })
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.have.property('tokenId');
          matchmakingToken1 = res.body.tokenId;
          done();
        });
    });
  });

  // Player 2 joins
  describe('matchmaking POST player 2', () => {
    it('returns 200', (done) => {
      request
        .post('/matchmaking')
        .set('Client-Version', version)
        .set('Authorization', `Bearer ${p2Token}`)
        .set('Accept', 'application/json')
        .send({
          deck: [
            1, 8, 8, 8, 9, 9, 9, 11, 11, 11,
            30004, 30004, 30004, 20066, 20066,
            20066, 20044, 20044, 20044, 20047,
            20047, 20047, 10205, 10205, 10205,
            20090, 20090, 20090, 10017, 10017,
            10017, 19031, 19031, 19031, 10204,
            10204, 10204, 10206, 10206, 10206,
          ],
          factionId: 1,
          gameType: GameType.Ranked,
          name: 'Player 2',
          ranking: { rank: 30 },
        })
        .expect(200)
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.have.property('tokenId');
          matchmakingToken2 = res.body.tokenId;
          expect(matchmakingToken2).to.not.be.equal(matchmakingToken1);
          done();
        });
    });
  });

  // TODO: after() : probe redis again to see if game id ++
});
