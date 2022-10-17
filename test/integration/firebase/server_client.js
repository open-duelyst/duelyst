const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');

const config = require('../../../config/config');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');

const firebaseUrl = config.get('firebase.url');
const testRef = '/test-ref-server';
const testObject = { message: 'hello from firebase unit tests', timestamp: Date.now() };

describe('Firebase.ServerClient.IntegrationTests', () => {
  it('should reject on invalid firebase.url', () => DuelystFirebase.connect('invalidurl').getRootRef()
    .then((rootRef) => {
      expect(rootRef).to.not.exist;
    })
    .catch((e) => {
      expect(e).to.exist;
      expect(e).to.be.instanceOf(Error);
      expect(DuelystFirebase.getNumConnections()).to.be.equal(0);
    }));

  it('should resolve on success', () => DuelystFirebase.connect(firebaseUrl).getRootRef()
    .then((rootRef) => {
      expect(rootRef).to.exist;
      expect(rootRef.toString()).to.be.equal(firebaseUrl);
      expect(DuelystFirebase.getNumConnections()).to.be.equal(1);
      DuelystFirebase.disconnect(firebaseUrl);
    }));

  it('should avoid recreating existing connections', () => {
    const firstRef = DuelystFirebase.connect(firebaseUrl).getRootRef();

    return DuelystFirebase.connect(firebaseUrl).getRootRef()
      .then((rootRef) => {
        expect(rootRef).to.exist;
        expect(rootRef.toString()).to.be.equal(firebaseUrl);
        expect(DuelystFirebase.getNumConnections()).to.be.equal(1);
        DuelystFirebase.disconnect(firebaseUrl);
      });
  });

  it('should create new connections for new URLs', () => {
    const anotherUrl = 'https://another-duelyst-project.firebaseio.local/';
    const firstRef = DuelystFirebase.connect(firebaseUrl).getRootRef();

    return DuelystFirebase.connect(anotherUrl).getRootRef()
      .then((rootRef) => {
        expect(rootRef).to.exist;
        expect(DuelystFirebase.getNumConnections()).to.be.equal(2);
        DuelystFirebase.disconnect(firebaseUrl);
        DuelystFirebase.disconnect(anotherUrl);
      });
  });

  it('should write test data', () => DuelystFirebase.connect(firebaseUrl).getRootRef()
    .then((rootRef) => {
      rootRef.child(testRef)
        .set(testObject, (error) => {
          expect(error).to.not.exist;
          DuelystFirebase.disconnect(firebaseUrl);
        });
    }));

  it('should read back test data', () => DuelystFirebase.connect(firebaseUrl).getRootRef()
    .then((rootRef) => {
      rootRef.child(testRef)
        .once('value')
        .then((snapshot) => {
          expect(snapshot.val().to.be.equal(testObject));
          DuelystFirebase.disconnect(firebaseUrl);
        });
    }));
});
