const Promise = require('bluebird');
const UtilsEngine = require('../../../common/utils/utils_engine');
const FXCompositeLayer = require('../FXCompositeLayer');
const BaseSprite = require('../../nodes/BaseSprite');

/** **************************************************************************
 CodexLayer
 *************************************************************************** */

const CodexLayer = FXCompositeLayer.extend({

  _bg: null,

  /* region INITIALIZE */

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    this._super();

    const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

    // set self to middle of screen
    this.setPosition(winCenterPosition);

    if (this._bg != null) {
      // background
      this._bg.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this._bg));
    }
  },

  /* endregion LAYOUT */

  /**
   * Starts showing a chapter and returns a promise.
   * @param {String} background path to background asset
   * @param {Number} [duration=0.0] duration to show over
   * @returns {Promise}
   */
  showChapter(background, duration) {
    if (duration == null) { duration = 0.0; }

    this.stopShowingChapter(duration);

    // create scene elements
    this._bg = BaseSprite.create(background);
    this.addChild(this._bg);

    // resize once to layout all elements
    this.onResize();

    // TODO: animate elements in
    return Promise.resolve();
  },

  /**
   * Stops showing a chapter and returns a promise.
   * @param {Number} [duration=0.0] duration to remove over
   * @returns {Promise}
   */
  stopShowingChapter(duration) {
    if (duration == null) { duration = 0.0; }

    if (this._bg != null) {
      this._bg.destroy(duration);
      this._bg = null;
    }

    return Promise.resolve();
  },

});

CodexLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new CodexLayer());
};

module.exports = CodexLayer;
