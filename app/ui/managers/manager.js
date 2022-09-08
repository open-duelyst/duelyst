/**
 * Abstract manager class, do not use directly.
 */

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const Promise = require('bluebird');

const Manager = Backbone.Marionette.Controller.extend({

  connected: null,
  isReady: null,

  constructor() {
    // Define instance properties off of the prototype chain
    this.connected = null;
    this.isReady = null;

    // Call the original constructor
    Backbone.Marionette.Controller.apply(this, arguments);
  },

  initialize(options) {
    // override in sub class
  },

  getConnected() {
    return this.connected;
  },

  connect() {
    if (!this.connected) {
      this.connected = true;
      this.listenToOnce(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);
      this.trigger('before_connect');
      this.onBeforeConnect();
      this.trigger('connect');
    }
  },

  onBeforeConnect() {
    // override in sub class to do any setup just before connect is triggered
  },

  disconnect() {
    if (this.connected) {
      this.connected = false;
      this.isReady = false;
      this.stopListening();
      this.trigger('before_disconnect');
      this.onBeforeDisconnect();
      this.trigger('disconnect');
    }
  },

  onBeforeDisconnect() {
    // override in sub class to do any setup just before disconnect is triggered
  },

  getIsReady() {
    return this.isReady;
  },

  ready() {
    this.isReady = true;
    this.trigger('ready');
  },

  onConnect(callback) {
    const p = new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
      } else {
        this.listenToOnce(this, 'connect', () => {
          resolve();
        });
      }
    });

    p.nodeify(callback);

    return p;
  },

  onReady(callback) {
    const p = new Promise((resolve, reject) => {
      if (this.isReady) {
        resolve();
      } else {
        this.listenToOnce(this, 'ready', resolve);
      }
    });

    p.nodeify(callback);

    return p;
  },

  _markAsReadyWhenModelsAndCollectionsSynced(modelsAndCollections) {
    const allPromises = [];
    for (let i = 0, il = modelsAndCollections.length; i < il; i++) {
      const modelOrCollection = modelsAndCollections[i];
      if (modelOrCollection != null && modelOrCollection.onSyncOrReady != null) {
        allPromises.push(modelOrCollection.onSyncOrReady());
      }
    }
    Promise.all(allPromises).then(() => {
      Logger.module('UI').log('Manager::_markAsReadyWhenModelsAndCollectionsSynced -> READY');
      this.ready();
    });
  },

});

module.exports = Manager;
