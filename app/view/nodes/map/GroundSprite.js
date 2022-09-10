const EnvironmentSprite = require('./EnvironmentSprite');

/** **************************************************************************
GroundSprite
var GroundSprite = EnvironmentSprite
GroundSprite.create()
 *************************************************************************** */

const GroundSprite = EnvironmentSprite.extend({
  // background sprites should be perpendicular to screen (i.e. ground)
  depthRotation: new cc.kmVec3(-Math.PI * 0.5, 0.0, 0.0),
});

GroundSprite.create = function (options, sprite) {
  return EnvironmentSprite.create(options, sprite || new GroundSprite(options));
};

module.exports = GroundSprite;
