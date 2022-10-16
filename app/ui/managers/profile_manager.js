const _ProfileManager = {};
_ProfileManager.instance = null;
_ProfileManager.getInstance = function (options) {
  if (this.instance == null) {
    this.instance = new ProfileManager(options);
  }
  return this.instance;
};
_ProfileManager.current = _ProfileManager.getInstance;

module.exports = _ProfileManager;

const Logger = require('app/common/logger');
const Profile = require('app/ui/models/profile');
const Firebase = require('firebase');
const Manager = require('./manager');

var ProfileManager = Manager.extend({

  initialize(options) {
    Manager.prototype.initialize.call(this);
  },

  connect(options) {
    this.userId = options.userId;
    Manager.prototype.connect.call(this);
  },

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    this.profile = new Profile(
      null,
      { firebase: `${process.env.FIREBASE_URL}/users/${this.userId}` },
    );
    this._markAsReadyWhenModelsAndCollectionsSynced([this.profile]);
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.userId = null;
    this.profile.firebase.off();
    this.profile = null;
  },

  get(key) {
    if (!this.profile) {
      return null;
    }
    return this.profile.get(key);
  },

  set(key, val, options) {
    if (!this.profile) {
      return;
    }
    return this.profile.set(key, val, options);
  },

});
