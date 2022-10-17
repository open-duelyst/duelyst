require('coffeescript/register');

const fs = require('fs');
const { expect } = require('chai');
const semver = require('semver');
const { version } = require('../../version.json');

const env = process.env.NODE_ENV;
let request;
if (env === 'production') {
  request = require('supertest')('https://play.duelyst.com/');
} else if (env === 'staging') {
  request = require('supertest')('https://830f78e090fe8aec00891405dfc14.duelyst.com/');
}

// disable the logger for cleaner test output
const Logger = require('../../app/common/logger.coffee');

Logger.enabled = false;

describe('version check', function () {
  this.timeout(5000);
  it(`is newer than the version in ${env}`, (done) => {
    request
      .get('version')
      .set('Accept', 'application/json')
      .send()
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(semver.gt(version, res.body.version)).to.be.true;
        done();
      });
  });
});
