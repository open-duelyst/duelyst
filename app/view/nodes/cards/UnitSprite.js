// pragma PKGS: game

const CONFIG = require('app/common/config');
const EntitySprite = require('./EntitySprite');

/** **************************************************************************
 UnitSprite
 var UnitSprite = EntitySprite
 UnitSprite.create()
 *************************************************************************** */

const UnitSprite = EntitySprite.extend({
  // occlude and cast shadows
  occludes: true,
  castsShadows: true,
  shadowOffset: CONFIG.DEPTH_OFFSET,

  // draw into depth buffer
  needsDepthDraw: true,
  depthOffset: CONFIG.DEPTH_OFFSET,
  depthModifier: 0.0,

  // by default entities are facing screen
  normal: new cc.kmVec3(0.0, 0.0, -1.0),
  depthRotation: new cc.kmVec3(0.0, 0.0, 0.0),

});

UnitSprite.create = function (options, sprite) {
  return EntitySprite.create(options, sprite || new UnitSprite(options));
};

module.exports = UnitSprite;
