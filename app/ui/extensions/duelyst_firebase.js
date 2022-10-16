const Promise = require('bluebird');
const _ = require('underscore');

Backbone.DuelystFirebase = {};

Backbone.DuelystFirebase.Model = Backbone.Firebase.Model.extend({

  constructor() {
    this.isSynced = false;
    this.listenToOnce(this, 'sync', function () {
      this.isSynced = true;
      this.trigger('ready');
    });
    Backbone.Firebase.Model.apply(this, arguments);
  },

  onSyncOrReady(callback) {
    const p = new Promise((resolve, reject) => {
      if (this.isSynced) {
        resolve(this);
      } else {
        this.listenToOnce(this, 'ready', function () {
          resolve(this);
        });
      }
    });
    p.nodeify(callback);
    return p;
  },

  _updateModel(model) {
    // Find the deleted keys and set their values to null
    // so Firebase properly deletes them.
    const modelObj = model.changedAttributes();
    _.each(model.changed, (value, key) => {
      if (key.indexOf('_') == 0) {
      // ignore all attributes starting with an underscore
        delete modelObj[key];
      } else if (typeof value === 'undefined' || value === null) {
        if (key == 'id') {
          delete modelObj[key];
        } else {
          modelObj[key] = null;
        }
      }
    });
    if (_.size(modelObj)) {
      this.firebase.ref().update(modelObj, this._log);
    }
  },

  _modelChanged(snap) {
    // Unset attributes that have been deleted from the server
    // by comparing the keys that have been removed.
    const newModel = snap.val();
    if (typeof newModel === 'object' && newModel !== null) {
      const diff = _.difference(_.keys(this.attributes), _.keys(newModel));
      const self = this;
      _.each(diff, (key) => {
        if (key.indexOf('_') != 0) self.unset(key);
      });
    }
    this._listenLocalChange(false);
    this.set(newModel);
    this._listenLocalChange(true);
    this.trigger('sync', this, null, null);
  },

});

Backbone.DuelystFirebase.Collection = Backbone.Firebase.Collection.extend({

  constructor() {
    this.isSynced = false;
    this.listenToOnce(this, 'sync', function () {
      this.isSynced = true;
      this.trigger('ready');
    });
    Backbone.Firebase.Collection.apply(this, arguments);
  },

  onSyncOrReady(callback) {
    const p = new Promise((resolve, reject) => {
      if (this.isSynced) {
        resolve(this);
      } else {
        this.listenToOnce(this, 'ready', function () {
          resolve(this);
        });
      }
    });
    p.nodeify(callback);
    return p;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = Backbone.DuelystFirebase;
