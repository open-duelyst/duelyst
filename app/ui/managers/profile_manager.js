var _ProfileManager = {};
_ProfileManager.instance = null;
_ProfileManager.getInstance = function (options) {
  if (this.instance == null) {
    this.instance = new ProfileManager(options);
  }
  return this.instance;
};
_ProfileManager.current = _ProfileManager.getInstance;

module.exports = _ProfileManager;

var Logger = require('app/common/logger');
var Profile = require('app/ui/models/profile');
var Firebase = require('firebase');
var Manager = require('./manager');

var ProfileManager = Manager.extend({

  initialize: function (options) {
    Manager.prototype.initialize.call(this);
  },

  connect: function (options) {
    this.userId = options.userId;
    Manager.prototype.connect.call(this);
  },

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    this.profile = new Profile(
      null,
      { firebase: process.env.FIREBASE_URL + '/users/' + this.userId },
    );
    this._markAsReadyWhenModelsAndCollectionsSynced([this.profile]);
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.userId = null;
    this.profile.firebase.off();
    this.profile = null;
  },

  get: function (key) {
    if (!this.profile) {
      return null;
    }
    return this.profile.get(key);
  },

  set: function (key, val, options) {
    if (!this.profile) {
      return;
    }
    return this.profile.set(key, val, options);
  },

});
