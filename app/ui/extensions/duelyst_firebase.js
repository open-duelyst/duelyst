var Promise = require('bluebird');
var _ = require('underscore');

Backbone.DuelystFirebase = {};

Backbone.DuelystFirebase.Model = Backbone.Firebase.Model.extend({

  constructor: function () {
    this.isSynced = false;
    this.listenToOnce(this, 'sync', function () {
      this.isSynced = true;
      this.trigger('ready');
    });
    Backbone.Firebase.Model.apply(this, arguments);
  },

  onSyncOrReady: function (callback) {
    var p = new Promise(function (resolve, reject) {
      if (this.isSynced) {
        resolve(this);
      } else {
        this.listenToOnce(this, 'ready', function () {
          resolve(this);
        });
      }
    }.bind(this));
    p.nodeify(callback);
    return p;
  },

  _updateModel: function (model) {
    // Find the deleted keys and set their values to null
    // so Firebase properly deletes them.
    var modelObj = model.changedAttributes();
    _.each(model.changed, function (value, key) {
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

  _modelChanged: function (snap) {
    // Unset attributes that have been deleted from the server
    // by comparing the keys that have been removed.
    var newModel = snap.val();
    if (typeof newModel === 'object' && newModel !== null) {
      var diff = _.difference(_.keys(this.attributes), _.keys(newModel));
      var self = this;
      _.each(diff, function (key) {
        if (key.indexOf('_') != 0)
          self.unset(key);
      });
    }
    this._listenLocalChange(false);
    this.set(newModel);
    this._listenLocalChange(true);
    this.trigger('sync', this, null, null);
  },

});

Backbone.DuelystFirebase.Collection = Backbone.Firebase.Collection.extend({

  constructor: function () {
    this.isSynced = false;
    this.listenToOnce(this, 'sync', function () {
      this.isSynced = true;
      this.trigger('ready');
    });
    Backbone.Firebase.Collection.apply(this, arguments);
  },

  onSyncOrReady: function (callback) {
    var p = new Promise(function (resolve, reject) {
      if (this.isSynced) {
        resolve(this);
      } else {
        this.listenToOnce(this, 'ready', function () {
          resolve(this);
        });
      }
    }.bind(this));
    p.nodeify(callback);
    return p;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = Backbone.DuelystFirebase;
