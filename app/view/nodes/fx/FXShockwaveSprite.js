const CONFIG = require('app/common/config');
const FXProceduralDistortionSprite = require('./FXProceduralDistortionSprite');

/** **************************************************************************
FXShockwaveSprite
var FXShockwaveSprite = FXProceduralDistortionSprite
FXShockwaveSprite.create(
 - procedural shockwave distortion
 *************************************************************************** */

const FXShockwaveSprite = FXProceduralDistortionSprite.extend({
  shaderKey: 'Shockwave',
  // shockwaves should usually lay on the ground
  depthModifier: 1.0,
  // shockwaves default to laying on the ground plane
  xyzRotation: CONFIG.ENTITY_XYZ_ROTATION,
  amplitude: 10.0,
});

FXShockwaveSprite.create = function (options, sprite) {
  return FXProceduralDistortionSprite.create(options, sprite || new FXShockwaveSprite(options));
};

module.exports = FXShockwaveSprite;
