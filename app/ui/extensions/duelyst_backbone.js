const Promise = require('bluebird');
const _ = require('underscore');

Backbone.Duelyst = {};

Backbone.Duelyst.Model = Backbone.Model.extend({

  constructor() {
    this.isSynced = false;
    this.listenToOnce(this, 'sync', () => {
      this.isSynced = true;
      this.stopListening(this, 'error', this.onReadyError);
      this.trigger('ready');
    });
    this.listenToOnce(this, 'error', this.onReadyError);
    Backbone.Model.apply(this, arguments);
  },

  onReadyError(model, resp, options) {
    this.trigger('ready_error', resp);
  },

  onSyncOrReady(callback) {
    const p = new Promise((resolve, reject) => {
      if (this.isSynced) {
        resolve(this);
      } else {
        this.listenToOnce(this, 'ready', function () {
          resolve(this);
        });
        this.listenToOnce(this, 'ready_error', (resp) => {
          if (resp && resp.responseJSON && resp.responseJSON.message) {
            reject(new Error(resp.responseJSON.message));
          } else {
            reject(new Error('error loading data'));
          }
        });
      }
    });
    p.nodeify(callback);
    return p;
  },

});

Backbone.Duelyst.Collection = Backbone.Collection.extend({

  constructor() {
    this.isSynced = false;
    this.listenToOnce(this, 'sync', () => {
      this.isSynced = true;
      this.stopListening(this, 'error', this.onReadyError);
      this.trigger('ready');
    });
    this.listenToOnce(this, 'error', this.onReadyError);
    Backbone.Collection.apply(this, arguments);
  },

  onReadyError(model, resp, options) {
    this.trigger('ready_error', resp);
  },

  onSyncOrReady(callback) {
    const p = new Promise((resolve, reject) => {
      if (this.isSynced) {
        resolve(this);
      } else {
        this.listenToOnce(this, 'ready', function () {
          resolve(this);
        });
        this.listenToOnce(this, 'ready_error', (resp) => {
          if (resp && resp.responseJSON && resp.responseJSON.message) {
            reject(new Error(resp.responseJSON.message));
          } else {
            reject(new Error('error loading data'));
          }
        });
      }
    });
    p.nodeify(callback);
    return p;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = Backbone.Duelyst;
