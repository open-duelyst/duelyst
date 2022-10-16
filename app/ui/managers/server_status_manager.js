// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _ServerStatusManager = {};
_ServerStatusManager.instance = null;
_ServerStatusManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new ServerStatusManager();
  }
  return this.instance;
};
_ServerStatusManager.current = _ServerStatusManager.getInstance;

module.exports = _ServerStatusManager;

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const Manager = require('./manager');
const ChatManager = require('./chat_manager');

var ServerStatusManager = Manager.extend({

  serverStatusModel: null,

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);

    this.serverStatusModel = new DuelystFirebase.Model(null, {
      firebase: new Firebase(process.env.FIREBASE_URL).child('system-status'),
    });

    // what to do when we're ready
    this.onReady().then(() => {
      this.listenTo(this.serverStatusModel, 'change', this.onSystemStatusChanged);
    });

    this._markAsReadyWhenModelsAndCollectionsSynced([this.serverStatusModel]);
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.stopListening(this.serverStatusModel);
  },

  onSystemStatusChanged(model) {
    Logger.module('UI').log('ServerStatusManager::onSystemStatusChanged');
    // if the game build has changed we want to notify the user that they need to refresh
    // we check a different key for steam version
    let versionKey;
    if (window.isSteam) {
      versionKey = 'steam_version';
    } else {
      versionKey = 'version';
    }
    if (this.serverStatusModel.hasChanged(versionKey)) {
      // if the user is not in-game, notify them immediately, otherwise we will wait to notify them until they are finished
      if (!ChatManager.getInstance().getStatusIsInBattle()) {
        this.requestReloadForGameUpdate();
      } else {
        this.listenTo(ChatManager.getInstance(), EVENTS.status, () => {
          if (!ChatManager.getInstance().getStatusIsInBattle()) {
            this.requestReloadForGameUpdate();
            this.stopListening(ChatManager.getInstance());
          }
        });
      }
    }
  },

  requestReloadForGameUpdate() {
    let message;
    if (window.isDesktop) {
      message = 'A new version of DUELYST has been deployed. Please quit and restart to avoid any issues.';
    } else {
      message = 'A new version of DUELYST has been deployed. Please reload to avoid any issues.';
    }
    EventBus.getInstance().trigger(EVENTS.request_reload, { id: 'game_update', message });
  },

  isShopEnabled() {
    return this.serverStatusModel.get('shop_enabled');
  },
});
