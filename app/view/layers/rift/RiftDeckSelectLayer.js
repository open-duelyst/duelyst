// pragma PKGS: play
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Logger = require('app/common/logger');
const FXRiftFireSprite = require('app/view/nodes/fx/FXRiftFireSprite');
const UtilsEngine = require('../../../common/utils/utils_engine');
const FXCompositeLayer = require('../FXCompositeLayer');
const BaseSprite = require('../../nodes/BaseSprite');

/** **************************************************************************
 RiftDeckSelectLayer
 *************************************************************************** */

const RiftDeckSelectLayer = FXCompositeLayer.extend({

  _bg: null,

  /* region INITIALIZE */

  ctor() {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // scene elements
      this._bg = BaseSprite.create(RSX.play_background.img);

      //
      this.riftFire = new FXRiftFireSprite();
      this.riftFire.setPosition(0, 0);
      this.riftFire.setBlendFunc(cc.SRC_ALPHA, cc.ONE);

      const winSize = UtilsEngine.getGSIWinSize();
      this.riftFire.setPosition(0, -winSize.height / 2);
      this.riftFire.setScale(
        winSize.width / this.riftFire.getTextureRect().width,
        (winSize.height * 0.75) / this.riftFire.getTextureRect().height,
      );

      // setup scene
      this.getFXLayer().addChild(this._bg);
      this.getNoFXLayer().addChild(this.riftFire);
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

RiftDeckSelectLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new RiftDeckSelectLayer());
};

module.exports = RiftDeckSelectLayer;
