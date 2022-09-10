// pragma PKGS: play
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Logger = require('app/common/logger');
const UtilsEngine = require('../../../common/utils/utils_engine');
const FXCompositeLayer = require('../FXCompositeLayer');
const BaseSprite = require('../../nodes/BaseSprite');

/** **************************************************************************
 PlayLayer
 *************************************************************************** */

const PlayLayer = FXCompositeLayer.extend({

  _bg: null,

  /* region INITIALIZE */

  ctor() {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // scene elements
      this._bg = BaseSprite.create(RSX.play_background.img);

      // setup scene
      this.getFXLayer().addChild(this._bg);
    });

    // do super ctor
    this._super();
  },

  getRequiredResources() {
    return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('play'));
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    this._super();

    const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

    // set self to middle of screen
    this.setPosition(winCenterPosition);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // background
      this._bg.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this._bg));
    });
  },

  /* endregion LAYOUT */

});

PlayLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new PlayLayer());
};

module.exports = PlayLayer;
