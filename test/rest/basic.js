require('coffeescript/register');

const { expect } = require('chai');
const supertest = require('supertest');
const api = require('../../server/express.coffee');
const { version } = require('../../version.json');
const Logger = require('../../app/common/logger.coffee');

// disable the logger for cleaner test output
Logger.enabled = false;
const request = supertest(api);

describe('basic route checks', () => {
  describe('/health', () => {
    it('returns 200', (done) => {
      request
        .get('/health')
        .expect(200, done);
    });
  });

  describe('/session', () => {
    it('returns 400 if no client version set', (done) => {
      request
        .get('/session')
        .expect(400, done);
    });

    it('returns 400 if wrong client version set', (done) => {
      request
        .get('/session')
        .set('Client-Version', 'wrong')
        .expect(400, done);
    });

    it('returns 401 unauthorized if no token provided', (done) => {
      request
        .get('/session')
        .set('Client-Version', version)
        .expect(401, done);
    });
  });

  describe('/api/me/securetest', () => {
    it('returns 400 if wrong client version set', (done) => {
      request
        .get('/api')
        .set('Client-Version', 'wrong')
        .expect(400, done);
    });

    it('returns 401 unauthorized if no token provided', (done) => {
      request
        .get('/api/me/securetest')
        .set('Client-Version', version)
        .expect(401, done);
    });
  });

  describe('/api', () => {
    it('returns 400 if no client version set', (done) => {
      request
        .get('/api')
        .expect(400, done);
    });

    it('returns 400 if wrong client version set', (done) => {
      request
        .get('/api')
        .set('Client-Version', 'wrong')
        .expect(400, done);
    });

    it('returns 401 unauthorized if no token provided', (done) => {
      request
        .get('/api')
        .set('Client-Version', version)
        .expect(401, done);
    });
  });
});
