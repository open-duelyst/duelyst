var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var expect = require('chai').expect
var _ = require('underscore')

var config = require('../../../config/config.js')
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee')

describe('Firebase.ServerClient.IntegrationTests', function() {
  const firebaseUrl = config.get('firebase.url');
  const testRef = '/test-ref-server';
  const testObject = {message: 'hello from firebase unit tests', timestamp: Date.now()};

  it('should reject on invalid firebase.url', function() {
    return DuelystFirebase.connect('invalidurl').getRootRef()
    .then(function(rootRef) {
      expect(rootRef).to.not.exist;
    })
    .catch(function(e) {
      expect(e).to.exist;
      expect(e).to.be.instanceOf(Error);
      expect(DuelystFirebase.getNumConnections()).to.be.equal(0);
    });
  });

  it('should resolve on success', function() {
    return DuelystFirebase.connect(firebaseUrl).getRootRef()
    .then(function(rootRef) {
      expect(rootRef).to.exist;
      expect(rootRef.toString()).to.be.equal(firebaseUrl);
      expect(DuelystFirebase.getNumConnections()).to.be.equal(1);
      DuelystFirebase.disconnect(firebaseUrl);
    });
  });

  it('should avoid recreating existing connections', function() {
    let firstRef = DuelystFirebase.connect(firebaseUrl).getRootRef();

    return DuelystFirebase.connect(firebaseUrl).getRootRef()
    .then(function(rootRef) {
      expect(rootRef).to.exist;
      expect(rootRef.toString()).to.be.equal(firebaseUrl);
      expect(DuelystFirebase.getNumConnections()).to.be.equal(1);
      DuelystFirebase.disconnect(firebaseUrl);
    });
  });

  it('should create new connections for new URLs', function() {
    let anotherUrl = 'https://another-duelyst-project.firebaseio.local/';
    let firstRef = DuelystFirebase.connect(firebaseUrl).getRootRef();

    return DuelystFirebase.connect(anotherUrl).getRootRef()
    .then(function(rootRef) {
      expect(rootRef).to.exist;
      expect(DuelystFirebase.getNumConnections()).to.be.equal(2);
      DuelystFirebase.disconnect(firebaseUrl);
      DuelystFirebase.disconnect(anotherUrl);
    });
  });

  it('should write test data', function() {
    return DuelystFirebase.connect(firebaseUrl).getRootRef()
    .then(function(rootRef) {
      rootRef.child(testRef)
      .set(testObject, function(error) {
        expect(error).to.not.exist;
        DuelystFirebase.disconnect(firebaseUrl);
      });
    });
  });

  it('should read back test data', function() {
    return DuelystFirebase.connect(firebaseUrl).getRootRef()
    .then(function(rootRef) {
      rootRef.child(testRef)
      .once('value')
      .then(function(snapshot) {
        expect(snapshot.val().to.be.equal(testObject))
        DuelystFirebase.disconnect(firebaseUrl);
      });
    });
  });
});
