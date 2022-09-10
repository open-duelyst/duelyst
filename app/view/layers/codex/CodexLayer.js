// pragma PKGS: codex
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('../../../common/utils/utils_engine');
const FXCompositeLayer = require('../FXCompositeLayer');
const BaseSprite = require('../../nodes/BaseSprite');

/** **************************************************************************
 CodexLayer
 *************************************************************************** */

const CodexLayer = FXCompositeLayer.extend({

  _bg: null,

  /* region INITIALIZE */

  ctor() {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // scene elements
      this._bg = BaseSprite.create(RSX.codex_background.img);

      // setup scene
      this.getFXLayer().addChild(this._bg);
    });

    // do super ctor
    this._super();
  },

  getRequiredResources() {
    return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('codex'));
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

CodexLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new CodexLayer());
};

module.exports = CodexLayer;
