const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');

/** **************************************************************************
 BaseLayer
 *************************************************************************** */

const BaseLayer = cc.Layer.extend({

  /* region INITIALIZATION */

  ctor() {
    this._eventBus = EventBus.create();

    // do super ctor
    this._super();

    // resize once to ensure layout is correct
    this.onResize();
  },

  start() {
    // start and enable this layer
    // override in subclass
  },

  terminate() {
    // stop and disable this layer
    // override in subclass
    this._eventBus.trigger(EVENTS.terminate, { type: EVENTS.terminate });
    this._stopListeningToEvents();
    if (this._eventBus != null) {
      this._eventBus.off();
    }
  },

  /* endregion INITIALIZATION */

  /* region LAYOUT */

  onResize() {
    // set content size to win size and not global scale inverted win size
    // this ensures correct 3D rotation for layers and any nodes on those layers
    // otherwise the 3D rotation anchor point correction will be off
    this.setContentSize(cc.winSize);
  },

  /* endregion LAYOUT */

  /* region SCENE */

  onEnter() {
    cc.Layer.prototype.onEnter.call(this);
    this._startListeningToEvents();
  },

  onExit() {
    cc.Layer.prototype.onExit.call(this);
    this.terminate();
  },

  /* endregion SCENE */

  /* region EVENTS */

  _startListeningToEvents() {
    this.getScene().getEventBus().on(EVENTS.resize, this.onResize, this);
  },

  _stopListeningToEvents() {
    this.getScene().getEventBus().off(EVENTS.resize, this.onResize, this);
  },

  /* endregion EVENTS  */

  /* region TRANSITION */

  onSetupTransitionIn() {
    // called when layer starts transitioning in
    // but only if a layer is transitioned!
    // override in subclass
  },

  onTransitionIn() {
    // called when layer finished transitioning in
    // but only if a layer is transitioned!
    // override in subclass
    this.start();
  },

  onSetupTransitionOut() {
    // called when layer starts transitioning out
    // but only if a layer is transitioned!
    // override in subclass
    this.terminate();
  },

  onTransitionOut() {
    // called when layer finished transitioning out
    // but only if a layer is transitioned!
    // override in subclass
  },

  /* endregion TRANSITION */
});

BaseLayer.create = function (layer) {
  return layer || new BaseLayer();
};

module.exports = BaseLayer;
