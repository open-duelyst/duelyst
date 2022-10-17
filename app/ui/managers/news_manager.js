// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _NewsManager = {};
_NewsManager.instance = null;
_NewsManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new NewsManager();
  }
  return this.instance;
};
_NewsManager.current = _NewsManager.getInstance;

module.exports = _NewsManager;

var Promise = require('bluebird');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var NotificationModel = require('app/ui/models/notification');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var Analytics = require('app/common/analytics');
var moment = require('moment');
var NavigationManager = require('./navigation_manager');
var NotificationsManager = require('./notifications_manager');
var Manager = require('./manager');
var ProfileManager = require('./profile_manager');

var NewsManager = Manager.extend({

  newsItemsIndexCollection: null,
  readNewsItemsCollection: null,
  unreadNewsItemsCollection: null,
  lastReadItemAt: null,

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');

        this.newsItemsIndexCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('news').child('index').limitToLast(10),
        });

        this.readNewsItemsCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('user-news').child(userId).child('read')
            .limitToLast(20),
        });

        // what to do when we're ready
        this.onReady().then(function () {
          if (this.readNewsItemsCollection.last()) {
            this.lastReadItemAt = this.readNewsItemsCollection.last().get('read_at');
          }

          var unreadItems = this.newsItemsIndexCollection.filter(function (newsItem) {
            return !this.readNewsItemsCollection.get(newsItem.get('id'));
          }.bind(this));

          this.unreadNewsItems = new Backbone.Collection(unreadItems);
        }.bind(this));

        this._markAsReadyWhenModelsAndCollectionsSynced([this.newsItemsIndexCollection, this.readNewsItemsCollection]);
      });
  },

  /* endregion CONNECT */

  markNewsItemAsRead: function (item) {
    var itemModel = item;
    if (typeof item == 'string') {
      itemModel = this.newsItemsIndexCollection.get(item);
    }

    this.lastReadItemAt = moment().valueOf();

    if (itemModel) {
      var key = itemModel.get('id');
      var priority = itemModel.get('created_at');

      if (!this.readNewsItemsCollection.get(key)) {
        this.readNewsItemsCollection.add({
          id: key,
          read_at: Firebase.ServerValue.TIMESTAMP,
          '.priority': priority,
        });
      }
    }
  },

  getFirstUnreadAnnouncement: function () {
    var unread = this.unreadNewsItems.filter(function (newsItem) {
      return (newsItem.get('type') == 'announcement' && newsItem.get('created_at') > this.lastReadItemAt);
    }.bind(this));

    var announcement = _.last(unread);

    // only show announcements from AFTER the user registered
    if (announcement && announcement.get('created_at') > ProfileManager.getInstance().profile.get('created_at'))
      return announcement;
    else
      return null;
  },

  getFirstUnreadAnnouncementContentAsync: function (callback) {
    var announcement = this.getFirstUnreadAnnouncement();

    if (announcement) {
      var fbRef = new Firebase(process.env.FIREBASE_URL).child('news/content/' + announcement.get('id'));
      var content = new DuelystFirebase.Model(null, {
        firebase: fbRef,
      });
      return content.onSyncOrReady();
    } else {
      return Promise.reject(new Error('no unread announcements'));
    }
  },

});
