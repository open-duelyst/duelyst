'use strict';

var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var PresenceModel = require('app/ui/models/presence');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var PresenceCollection = require('./presence');

var BuddiesCollection = DuelystFirebase.Collection.extend({

  _presenceCollection: null,

  initialize: function () {
    Logger.module('UI').log('initialize a Buddies collection');
    this._presenceCollection = new PresenceCollection();

    this.listenTo(this, 'add', this.onAdd);
    this.listenTo(this, 'remove', this.onRemove);
  },

  onAdd: function (model) {
    Logger.module('UI').log('BuddiesCollection::onAdd');
    var presenceReferenceURL = process.env.FIREBASE_URL + '/users/' + model.id + '/presence';
    var buddyPresenceModel = new PresenceModel(null, { firebase: presenceReferenceURL });
    buddyPresenceModel.onSyncOrReady().then(function () {
      if (buddyPresenceModel.has('status') && buddyPresenceModel.has('username')) {
        buddyPresenceModel.userId = model.id;
        this._presenceCollection.add(buddyPresenceModel);
        this.trigger('presence_change', buddyPresenceModel);
        buddyPresenceModel.on('change', this.onPresenceChange, this);
      } else {
        Logger.module('UI').log('BuddiesCollection::onPresenceChange -> detected a buddy with no presence record. Might be a deleted user... deleting buddy record');
        // Logger.module("UI").log("BuddiesCollection::onPresenceChange -> destroying buddy",model);
        // this.remove(model);
      }
    }.bind(this));
  },

  onRemove: function (model) {
    Logger.module('UI').log('BuddiesCollection::onRemove');
    var buddyPresenceModel = this._presenceCollection.find(function (p) {
      return p.userId == model.id;
    });
    if (buddyPresenceModel != null) {
      buddyPresenceModel.off('change', this.onPresenceChange, this);
      this._presenceCollection.remove(buddyPresenceModel);
    }
    this.trigger('presence_change', buddyPresenceModel);
  },

  onPresenceChange: function (buddyPresenceModel) {
    if (buddyPresenceModel.has('status')) {
      // lazy init throttle on presence list updates
      if (this._presenceCollectionUpdateThrottled == null) {
        this._presenceCollectionUpdateThrottled = _.throttle(function () {
          this._presenceCollection.sort();
        }.bind(this), 1000 / CONFIG.MAX_BUDDY_LIST_UPDATES_PER_SECOND);
      }

      // update presence collection
      if (buddyPresenceModel.hasChanged('status') || buddyPresenceModel.hasChanged('_lastUnreadMessageAt'))
        this._presenceCollectionUpdateThrottled();

      // if the status has changed, notify anyone listening via presence_change
      if (buddyPresenceModel.hasChanged('status'))
        this.trigger('presence_change', buddyPresenceModel);
    }
  },

  getPresenceCollection: function () {
    return this._presenceCollection;
  },

  getOnlineBuddyCount: function () {
    var count = 0;
    this._presenceCollection.each(function (presence) {
      if (this.getIsBuddyOnlineByPresence(presence)) {
        count++;
      }
    }.bind(this));
    return count;
  },
  getIsBuddyOnlineById: function (buddyId) {
    var presence = this._presenceCollection.find(function (presenceModel) { return presenceModel.userId == buddyId; });
    return this.getIsBuddyOnlineByPresence(presence);
  },
  getIsBuddyOnlineByPresence: function (presence) {
    var status = presence && presence.getStatus();
    return status && status !== 'offline';
  },
});

// Expose the class either via CommonJS or the global object
module.exports = BuddiesCollection;
