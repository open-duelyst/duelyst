// pragma PKGS: game
const RSX = require('app/data/resources');
const FXRaySprite = require('./FXRaySprite');

/** **************************************************************************
 FXRay003Sprite
 var FXRay003Sprite = FXRaySprite
 FXRay003Sprite.create()
 *************************************************************************** */

const FXRay003Sprite = FXRaySprite.extend({
  ctor() {
    this._super(RSX.ray_003.frame);
  },
});

FXRay003Sprite.create = function (options, sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(FXRay003Sprite, options) || FXRaySprite.create(options, new FXRay003Sprite(options));
  }
  return sprite;
};

module.exports = FXRay003Sprite;
