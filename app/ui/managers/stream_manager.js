// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _StreamManager = {};
_StreamManager.instance = null;
_StreamManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new StreamManager();
  }
  return this.instance;
};
_StreamManager.current = _StreamManager.getInstance;

module.exports = _StreamManager;

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const Manager = require('./manager');

var StreamManager = Manager.extend({

  streamerWhitelistCollection: null,
  liveStreamCollection: null,
  hasDismissedStreams: false,

  constructor() {
    this.liveStreamCollection = new DuelystBackbone.Collection();
    this.liveStreamCollection.comparator = function (a, b) {
      const a1 = a.get('streamData').stream ? a.get('streamData').stream.viewers : 0;
      const b1 = b.get('streamData').stream ? a.get('streamData').stream.viewers : 0;
      return a1 < b1;
    };

    // Call the original constructor
    Manager.apply(this, arguments);
  },

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);

    this.streamerWhitelistCollection = new DuelystFirebase.Collection(null, {
      firebase: new Firebase(process.env.FIREBASE_URL).child('streamer-whitelist'),
    });

    this.streamerWhitelistCollection.onSyncOrReady().then(this.onStreamerWhitelistLoaded.bind(this));
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.streamerWhitelistCollection.firebase.off();
    this.streamerWhitelistCollection.off();
  },

  onStreamerWhitelistLoaded() {
    if (this.getConnected()) {
      this.loadStreamStatusFromTwitch();
    }
  },

  loadStreamStatusFromTwitch() {
    this.liveStreamCollection.reset();
    const loadPromises = this.streamerWhitelistCollection.map((model) => Promise.resolve($.ajax({
      url: `https://api.twitch.tv/kraken/streams/${model.get('slug')}?client_id=8katw6xspie7gc9incpljy0xql7k3ls`,
      dataType: 'jsonp',
      timeout: 5000,
    })));
    return Promise.all(loadPromises).then((results) => {
      for (let i = 0; i < results.length; i++) {
        if (results[i] && results[i].stream && results[i].stream.game.toLowerCase() === 'duelyst') {
          const model = this.streamerWhitelistCollection.at(i);
          const streamRecord = results[i].stream;
          this.liveStreamCollection.push({
            name: model.get('name'),
            url: `https://www.twitch.tv/${model.get('slug')}`,
            description: model.get('description'), // 'Noah streams DUELYST daily. Subscribe and submit your decks to the Deck Doctor.',
            avatar_image_url: model.get('avatar_image_url'),
            streamData: results[i],
          });
        }
      }
      this.liveStreamCollection.sort();
      // mark self manager as ready
      if (!this.getIsReady()) {
        this.ready();
      }
    });
  },

  onWhitelistChanged(model) {
    Logger.module('UI').log('StreamManager::onWhitelistChanged');
  },

});
