// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _StreamManager = {};
_StreamManager.instance = null;
_StreamManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new StreamManager();
  }
  return this.instance;
};
_StreamManager.current = _StreamManager.getInstance;

module.exports = _StreamManager;

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var Manager = require('./manager');

var StreamManager = Manager.extend({

  streamerWhitelistCollection: null,
  liveStreamCollection: null,
  hasDismissedStreams: false,

  constructor: function () {
    this.liveStreamCollection = new DuelystBackbone.Collection();
    this.liveStreamCollection.comparator = function (a, b) {
      var a1 = a.get('streamData').stream ? a.get('streamData').stream.viewers : 0;
      var b1 = b.get('streamData').stream ? a.get('streamData').stream.viewers : 0;
      return a1 < b1;
    };

    // Call the original constructor
    Manager.apply(this, arguments);
  },

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);

    this.streamerWhitelistCollection = new DuelystFirebase.Collection(null, {
      firebase: new Firebase(process.env.FIREBASE_URL).child('streamer-whitelist'),
    });

    this.streamerWhitelistCollection.onSyncOrReady().then(this.onStreamerWhitelistLoaded.bind(this));
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.streamerWhitelistCollection.firebase.off();
    this.streamerWhitelistCollection.off();
  },

  onStreamerWhitelistLoaded: function () {
    if (this.getConnected()) {
      this.loadStreamStatusFromTwitch();
    }
  },

  loadStreamStatusFromTwitch: function () {
    this.liveStreamCollection.reset();
    var loadPromises = this.streamerWhitelistCollection.map(function (model) {
      return Promise.resolve($.ajax({
        url: 'https://api.twitch.tv/kraken/streams/' + model.get('slug') + '?client_id=8katw6xspie7gc9incpljy0xql7k3ls',
        dataType: 'jsonp',
        timeout: 5000,
      }));
    });
    return Promise.all(loadPromises).then(function (results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i] && results[i].stream && results[i].stream.game.toLowerCase() === 'duelyst') {
          var model = this.streamerWhitelistCollection.at(i);
          var streamRecord = results[i].stream;
          this.liveStreamCollection.push({
            name: model.get('name'),
            url: 'https://www.twitch.tv/' + model.get('slug'),
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
    }.bind(this));
  },

  onWhitelistChanged: function (model) {
    Logger.module('UI').log('StreamManager::onWhitelistChanged');
  },

});
