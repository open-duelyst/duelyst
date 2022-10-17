var _TelemetryManager = {};
_TelemetryManager.instance = null;
_TelemetryManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new TelemetryManager();
  }
  return this.instance;
};
_TelemetryManager.current = _TelemetryManager.getInstance;

module.exports = _TelemetryManager;

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var Firebase = require('firebase');
var Manager = require('./manager');
var ProfileManager = require('./profile_manager');

var TelemetryManager = Manager.extend({

  _statusReferences: null,
  _statusReferencesIndexHash: null,

  /* region INITIALIZE */

  initialize: function (options) {
    Manager.prototype.initialize.call(this);

    this._statusReferences = [];
    this._statusReferencesIndexHash = {};

    // this manager does not need to bind to anything
    this.connect();
  },

  /* endregion INITIALIZE */

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);
    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);
    this.ready();
  },

  /* endregion CONNECT */

  setSignal: function (category, type, label, value) {
    var statusRef = new Firebase(process.env.FIREBASE_URL)
      .child('telemetry')
      .child(category)
      .child(type)
      .push();

    var id = 'anon';

    // we can only read the id if the profile manager has loaded
    if (ProfileManager.getInstance().isReady === true) {
      id = ProfileManager.getInstance().get('id');
    }
    statusRef.setWithPriority({
      u: id,
      l: label || null,
      v: value || null,
    }, Firebase.ServerValue.TIMESTAMP);

    statusRef.onDisconnect().remove();

    this._statusReferences.push(statusRef);

    var index = this._statusReferences.length - 1;

    this._statusReferencesIndexHash[category + ':' + type + ':' + label + ':' + value] = index;

    // return the index of this particular status
    return index;
  },

  clearSignal: function (category, type, label, value) {
    var i = this._statusReferencesIndexHash[category + ':' + type + ':' + label + ':' + value];
    this.clearSignalByIndex(i);
  },

  clearSignalByIndex: function (i) {
    if (this._statusReferences[i]) {
      this._statusReferences[i].remove();
      this._statusReferences[i].onDisconnect().cancel();
    }
  },

});
