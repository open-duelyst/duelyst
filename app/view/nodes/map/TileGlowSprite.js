// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileGlowSprite
var TileGlowSprite = BaseSprite
TileGlowSprite.create()
 *************************************************************************** */

const TileGlowSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.tile_glow.frame);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileGlowSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileGlowSprite) || BaseSprite.create(null, new TileGlowSprite());
  }
  return sprite;
};

module.exports = TileGlowSprite;
