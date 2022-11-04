// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _ServerStatusManager = {};
_ServerStatusManager.instance = null;
_ServerStatusManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new ServerStatusManager();
  }
  return this.instance;
};
_ServerStatusManager.current = _ServerStatusManager.getInstance;

module.exports = _ServerStatusManager;

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var Manager = require('./manager');
var ChatManager = require('./chat_manager');

var ServerStatusManager = Manager.extend({

  serverStatusModel: null,

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);

    this.serverStatusModel = new DuelystFirebase.Model(null, {
      firebase: new Firebase(process.env.FIREBASE_URL).child('system-status'),
    });

    // what to do when we're ready
    this.onReady().then(function () {
      this.listenTo(this.serverStatusModel, 'change', this.onSystemStatusChanged);
    }.bind(this));

    this._markAsReadyWhenModelsAndCollectionsSynced([this.serverStatusModel]);
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.stopListening(this.serverStatusModel);
  },

  onSystemStatusChanged: function (model) {
    Logger.module('UI').log('ServerStatusManager::onSystemStatusChanged');
    // if the game build has changed we want to notify the user that they need to refresh
    if (this.serverStatusModel.hasChanged('version')) {
      // if the user is not in-game, notify them immediately, otherwise we will wait to notify them until they are finished
      if (!ChatManager.getInstance().getStatusIsInBattle()) {
        this.requestReloadForGameUpdate();
      } else {
        this.listenTo(ChatManager.getInstance(), EVENTS.status, function () {
          if (!ChatManager.getInstance().getStatusIsInBattle()) {
            this.requestReloadForGameUpdate();
            this.stopListening(ChatManager.getInstance());
          }
        }.bind(this));
      }
    }
  },

  requestReloadForGameUpdate: function () {
    var message;
    if (window.isDesktop) {
      message = 'A new version of DUELYST has been deployed. Please quit and restart to avoid any issues.';
    } else {
      message = 'A new version of DUELYST has been deployed. Please reload to avoid any issues.';
    }
    EventBus.getInstance().trigger(EVENTS.request_reload, { id: 'game_update', message: message });
  },

  isShopEnabled: function () {
    return this.serverStatusModel.get('shop_enabled');
  },
});
