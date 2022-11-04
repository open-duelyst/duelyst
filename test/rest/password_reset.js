require('coffeescript/register');

const { expect } = require('chai');
const supertest = require('supertest');
const api = require('../../server/express.coffee');

const request = supertest(api);

describe('password reset', () => {
  describe('POST /forgot', function () {
    this.timeout(5000);
    it('returns 200 and sends email if given user exists', (done) => {
      request
        .post('/forgot')
        .set('Accept', 'application/json')
        .send({ email: 'unit-test@duelyst.local' })
        .expect(200, done);
    });

    it('returns 400 if email is invalid', (done) => {
      request
        .post('/forgot')
        .set('Accept', 'application/json')
        .send({ email: 'NOTEMAIL' })
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });

    it('returns 400 if user does not exist', (done) => {
      request
        .post('/forgot')
        .set('Accept', 'application/json')
        .send({ email: 'NOTAREALUSER@FOO.COM' })
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.equal(null);
          done();
        });
    });
  });
});
