const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const loginHelpers = require('../../../server/lib/hash_helpers.coffee');

describe('login helpers', () => {
  const password = 'password';
  let returnedHash;
  const invalidHash = 'thisisainvalidhash';

  describe('node.js callback style', () => {
    describe('generate hash function', () => {
      it('expect a hash when given a password', (done) => {
        loginHelpers.generateHash(password, (err, hash) => {
          expect(err).to.be.equal(null);
          expect(hash).to.exist;
          // Save for next test
          returnedHash = hash;
          done();
        });
      });
    });

    describe('compare password function', () => {
      it('expect true when comparing valid password and hash', (done) => {
        loginHelpers.comparePassword(password, returnedHash, (err, match) => {
          expect(err).to.be.equal(null);
          expect(match).to.be.true;
          done();
        });
      });

      it('expect false when comparing bad password and hash', (done) => {
        loginHelpers.comparePassword(password, invalidHash, (err, match) => {
          expect(err).to.be.equal(null);
          expect(match).to.be.false;
          done();
        });
      });
    });
  });

  describe('promises style', () => {
    describe('generate hash function', () => {
      it('expect a hash when given a password', () => loginHelpers.generateHash(password).then(function (hash) {
        expect(hash).to.exist;
        this.hash = hash;
      }));
    });

    describe('compare password function', () => {
      it('expect true when comparing valid password and hash', () => loginHelpers.comparePassword(password, returnedHash).then((match) => {
        expect(match).to.be.true;
      }));

      it('expect false when comparing bad password and hash', () => loginHelpers.comparePassword(password, invalidHash).then((match) => {
        expect(match).to.be.false;
      }));
    });
  });
});
