const _TelemetryManager = {};
_TelemetryManager.instance = null;
_TelemetryManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new TelemetryManager();
  }
  return this.instance;
};
_TelemetryManager.current = _TelemetryManager.getInstance;

module.exports = _TelemetryManager;

const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const Firebase = require('firebase');
const Manager = require('./manager');
const ProfileManager = require('./profile_manager');

var TelemetryManager = Manager.extend({

  _statusReferences: null,
  _statusReferencesIndexHash: null,

  /* region INITIALIZE */

  initialize(options) {
    Manager.prototype.initialize.call(this);

    this._statusReferences = [];
    this._statusReferencesIndexHash = {};

    // this manager does not need to bind to anything
    this.connect();
  },

  /* endregion INITIALIZE */

  /* region CONNECT */

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);
    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);
    this.ready();
  },

  /* endregion CONNECT */

  setSignal(category, type, label, value) {
    const statusRef = new Firebase(process.env.FIREBASE_URL)
      .child('telemetry')
      .child(category)
      .child(type)
      .push();

    let id = 'anon';

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

    const index = this._statusReferences.length - 1;

    this._statusReferencesIndexHash[`${category}:${type}:${label}:${value}`] = index;

    // return the index of this particular status
    return index;
  },

  clearSignal(category, type, label, value) {
    const i = this._statusReferencesIndexHash[`${category}:${type}:${label}:${value}`];
    this.clearSignalByIndex(i);
  },

  clearSignalByIndex(i) {
    if (this._statusReferences[i]) {
      this._statusReferences[i].remove();
      this._statusReferences[i].onDisconnect().cancel();
    }
  },

});
