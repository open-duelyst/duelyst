const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const PresenceModel = require('app/ui/models/presence');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const PresenceCollection = require('./presence');

const BuddiesCollection = DuelystFirebase.Collection.extend({

  _presenceCollection: null,

  initialize() {
    Logger.module('UI').log('initialize a Buddies collection');
    this._presenceCollection = new PresenceCollection();

    this.listenTo(this, 'add', this.onAdd);
    this.listenTo(this, 'remove', this.onRemove);
  },

  onAdd(model) {
    Logger.module('UI').log('BuddiesCollection::onAdd');
    const presenceReferenceURL = `${process.env.FIREBASE_URL}/users/${model.id}/presence`;
    const buddyPresenceModel = new PresenceModel(null, { firebase: presenceReferenceURL });
    buddyPresenceModel.onSyncOrReady().then(() => {
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
    });
  },

  onRemove(model) {
    Logger.module('UI').log('BuddiesCollection::onRemove');
    const buddyPresenceModel = this._presenceCollection.find((p) => p.userId == model.id);
    if (buddyPresenceModel != null) {
      buddyPresenceModel.off('change', this.onPresenceChange, this);
      this._presenceCollection.remove(buddyPresenceModel);
    }
    this.trigger('presence_change', buddyPresenceModel);
  },

  onPresenceChange(buddyPresenceModel) {
    if (buddyPresenceModel.has('status')) {
      // lazy init throttle on presence list updates
      if (this._presenceCollectionUpdateThrottled == null) {
        this._presenceCollectionUpdateThrottled = _.throttle(() => {
          this._presenceCollection.sort();
        }, 1000 / CONFIG.MAX_BUDDY_LIST_UPDATES_PER_SECOND);
      }

      // update presence collection
      if (buddyPresenceModel.hasChanged('status') || buddyPresenceModel.hasChanged('_lastUnreadMessageAt')) this._presenceCollectionUpdateThrottled();

      // if the status has changed, notify anyone listening via presence_change
      if (buddyPresenceModel.hasChanged('status')) this.trigger('presence_change', buddyPresenceModel);
    }
  },

  getPresenceCollection() {
    return this._presenceCollection;
  },

  getOnlineBuddyCount() {
    let count = 0;
    this._presenceCollection.each((presence) => {
      if (this.getIsBuddyOnlineByPresence(presence)) {
        count++;
      }
    });
    return count;
  },
  getIsBuddyOnlineById(buddyId) {
    const presence = this._presenceCollection.find((presenceModel) => presenceModel.userId == buddyId);
    return this.getIsBuddyOnlineByPresence(presence);
  },
  getIsBuddyOnlineByPresence(presence) {
    const status = presence && presence.getStatus();
    return status && status !== 'offline';
  },
});

// Expose the class either via CommonJS or the global object
module.exports = BuddiesCollection;
