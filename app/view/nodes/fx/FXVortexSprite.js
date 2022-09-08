const CONFIG = require('app/common/config');
const FXProceduralDistortionSprite = require('./FXProceduralDistortionSprite');

/** **************************************************************************
FXVortexSprite
var FXVortexSprite = FXProceduralDistortionSprite
FXVortexSprite.create()
 - procedural vortex distortion
 *************************************************************************** */

const FXVortexSprite = FXProceduralDistortionSprite.extend({
  shaderKey: 'Vortex',
  fadeInDurationPct: 0.2,
  fadeOutDurationPct: 0.2,
  frequency: 15.0,
  amplitude: 0.5,
  // speed of vortex effect
  speed: 1.0,
});

FXVortexSprite.create = function (options, sprite) {
  return FXProceduralDistortionSprite.create(options, sprite || new FXVortexSprite(options));
};

module.exports = FXVortexSprite;
