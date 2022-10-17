/**
 * Abstract manager class, do not use directly.
 */

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var Promise = require('bluebird');

var Manager = Backbone.Marionette.Controller.extend({

  connected: null,
  isReady: null,

  constructor: function () {
    // Define instance properties off of the prototype chain
    this.connected = null;
    this.isReady = null;

    // Call the original constructor
    Backbone.Marionette.Controller.apply(this, arguments);
  },

  initialize: function (options) {
    // override in sub class
  },

  getConnected: function () {
    return this.connected;
  },

  connect: function () {
    if (!this.connected) {
      this.connected = true;
      this.listenToOnce(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);
      this.trigger('before_connect');
      this.onBeforeConnect();
      this.trigger('connect');
    }
  },

  onBeforeConnect: function () {
    // override in sub class to do any setup just before connect is triggered
  },

  disconnect: function () {
    if (this.connected) {
      this.connected = false;
      this.isReady = false;
      this.stopListening();
      this.trigger('before_disconnect');
      this.onBeforeDisconnect();
      this.trigger('disconnect');
    }
  },

  onBeforeDisconnect: function () {
    // override in sub class to do any setup just before disconnect is triggered
  },

  getIsReady: function () {
    return this.isReady;
  },

  ready: function () {
    this.isReady = true;
    this.trigger('ready');
  },

  onConnect: function (callback) {
    var p = new Promise(function (resolve, reject) {
      if (this.connected) {
        resolve();
      } else {
        this.listenToOnce(this, 'connect', function () {
          resolve();
        });
      }
    }.bind(this));

    p.nodeify(callback);

    return p;
  },

  onReady: function (callback) {
    var p = new Promise(function (resolve, reject) {
      if (this.isReady) {
        resolve();
      } else {
        this.listenToOnce(this, 'ready', resolve);
      }
    }.bind(this));

    p.nodeify(callback);

    return p;
  },

  _markAsReadyWhenModelsAndCollectionsSynced: function (modelsAndCollections) {
    var allPromises = [];
    for (var i = 0, il = modelsAndCollections.length; i < il; i++) {
      var modelOrCollection = modelsAndCollections[i];
      if (modelOrCollection != null && modelOrCollection.onSyncOrReady != null) {
        allPromises.push(modelOrCollection.onSyncOrReady());
      }
    }
    Promise.all(allPromises).then(function () {
      Logger.module('UI').log('Manager::_markAsReadyWhenModelsAndCollectionsSynced -> READY');
      this.ready();
    }.bind(this));
  },

});

module.exports = Manager;
