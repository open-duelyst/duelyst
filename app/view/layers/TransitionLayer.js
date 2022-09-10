const Promise = require('bluebird');
const CONFIG = require('app/common/config');
const BaseLayer = require('./BaseLayer');

/** **************************************************************************
 TransitionLayer
 *************************************************************************** */

const TransitionLayer = BaseLayer.extend({

  // currently running layer
  _currentLayer: null,

  getCurrentLayer() {
    return this._currentLayer;
  },

  getLayerByClass(layerClass) {
    if (this._currentLayer instanceof layerClass) {
      return this._currentLayer;
    }
  },

  /**
   * Convenience method for emptying the layer. Returns a promise that resolves when the layer content has been destroyed.
   * @returns {Promise}
   */
  empty() {
    const currentLayer = this._currentLayer;

    return new Promise((resolve, reject) => {
      // stop current layer
      if (currentLayer != null) {
        currentLayer.stopActionByTag(CONFIG.FADE_TAG);
        currentLayer.onSetupTransitionOut();

        // clear current layer
        this._currentLayer = null;

        // crossfade current layer
        const transitionDuration = CONFIG.VIEW_TRANSITION_DURATION;
        currentLayer.fadeTo(transitionDuration, 0.0);

        // delay for transition duration and then resolve
        this.runAction(cc.sequence(
          cc.delayTime(transitionDuration),
          cc.callFunc(() => {
            currentLayer.onTransitionOut();
            currentLayer.destroy();
            resolve();
          }),
        ));
      } else {
        // no current layer
        resolve();
      }
    });
  },

  /**
   * Shows a layer and returns a promise that resolves when the content has been fully swapped.
   * @param {BaseLayer} [layer=null]
   * @returns {Promise}
   */
  show(layer) {
    // empty first
    const emptyPromise = this.empty();

    // show second
    const showPromise = new Promise((resolve, reject) => {
      // set current
      this._currentLayer = layer;

      if (layer != null) {
        // stop any active fades
        layer.stopActionByTag(CONFIG.FADE_TAG);

        // add hidden layer to scene to trigger loading/setup
        layer.setVisible(false);
        this.addChild(layer);

        // when layer is done loading resources
        layer.whenRequiredResourcesReady().then((requestId) => {
          if (!layer.getAreResourcesValid(requestId)) return resolve(); // load invalidated or resources changed

          // show layer
          layer.setVisible(true);

          layer.onSetupTransitionIn();

          // crossfade current layer
          const transitionDuration = CONFIG.VIEW_TRANSITION_DURATION;
          layer.setOpacity(0.0);
          layer.fadeTo(transitionDuration, 255.0);

          // delay for transition duration and then resolve
          this.runAction(cc.sequence(
            cc.delayTime(transitionDuration),
            cc.callFunc(() => {
              if (layer != null && layer === this._currentLayer) {
                layer.onTransitionIn();
              }
              resolve();
            }),
          ));
        });
      } else {
        // no new layer
        resolve();
      }
    });

    return Promise.all([emptyPromise, showPromise]);
  },

});

TransitionLayer.create = function (color, layer) {
  return layer || new TransitionLayer(color);
};

module.exports = TransitionLayer;
