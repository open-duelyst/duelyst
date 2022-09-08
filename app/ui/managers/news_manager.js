// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _NewsManager = {};
_NewsManager.instance = null;
_NewsManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new NewsManager();
  }
  return this.instance;
};
_NewsManager.current = _NewsManager.getInstance;

module.exports = _NewsManager;

const Promise = require('bluebird');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const NotificationModel = require('app/ui/models/notification');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const Analytics = require('app/common/analytics');
const moment = require('moment');
const NavigationManager = require('./navigation_manager');
const NotificationsManager = require('./notifications_manager');
const Manager = require('./manager');
const ProfileManager = require('./profile_manager');

var NewsManager = Manager.extend({

  newsItemsIndexCollection: null,
  readNewsItemsCollection: null,
  unreadNewsItemsCollection: null,
  lastReadItemAt: null,

  /* region CONNECT */

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        const userId = ProfileManager.getInstance().get('id');

        this.newsItemsIndexCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('news').child('index').limitToLast(10),
        });

        this.readNewsItemsCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('user-news').child(userId).child('read')
            .limitToLast(20),
        });

        // what to do when we're ready
        this.onReady().then(() => {
          if (this.readNewsItemsCollection.last()) {
            this.lastReadItemAt = this.readNewsItemsCollection.last().get('read_at');
          }

          const unreadItems = this.newsItemsIndexCollection.filter((newsItem) => !this.readNewsItemsCollection.get(newsItem.get('id')));

          this.unreadNewsItems = new Backbone.Collection(unreadItems);
        });

        this._markAsReadyWhenModelsAndCollectionsSynced([this.newsItemsIndexCollection, this.readNewsItemsCollection]);
      });
  },

  /* endregion CONNECT */

  markNewsItemAsRead(item) {
    let itemModel = item;
    if (typeof item === 'string') {
      itemModel = this.newsItemsIndexCollection.get(item);
    }

    this.lastReadItemAt = moment().valueOf();

    if (itemModel) {
      const key = itemModel.get('id');
      const priority = itemModel.get('created_at');

      if (!this.readNewsItemsCollection.get(key)) {
        this.readNewsItemsCollection.add({
          id: key,
          read_at: Firebase.ServerValue.TIMESTAMP,
          '.priority': priority,
        });
      }
    }
  },

  getFirstUnreadAnnouncement() {
    const unread = this.unreadNewsItems.filter((newsItem) => (newsItem.get('type') == 'announcement' && newsItem.get('created_at') > this.lastReadItemAt));

    const announcement = _.last(unread);

    // only show announcements from AFTER the user registered
    if (announcement && announcement.get('created_at') > ProfileManager.getInstance().profile.get('created_at')) return announcement;
    return null;
  },

  getFirstUnreadAnnouncementContentAsync(callback) {
    const announcement = this.getFirstUnreadAnnouncement();

    if (announcement) {
      const fbRef = new Firebase(process.env.FIREBASE_URL).child(`news/content/${announcement.get('id')}`);
      const content = new DuelystFirebase.Model(null, {
        firebase: fbRef,
      });
      return content.onSyncOrReady();
    }
    return Promise.reject(new Error('no unread announcements'));
  },

});
