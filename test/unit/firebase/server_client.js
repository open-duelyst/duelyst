const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');

const config = require('../../../config/config');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');

describe('Firebase.ServerClient.UnitTests', () => {
  const firebaseUrl = 'https://duelyst-unit-tests.firebaseio.local/';

  describe('#connect()', () => {
    it('should reject on empty firebase.url', () => DuelystFirebase.connect('').getRootRef()
      .then((rootRef) => {
        expect(rootRef).to.not.exist;
      })
      .error((e) => {
        expect(e).to.exist;
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.eql('firebase.url must be set');
        expect(DuelystFirebase.getNumConnections()).to.be.equal(0);
      }));
  });
});
