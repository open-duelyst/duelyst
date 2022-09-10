// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapLargeSprite
var TileMapLargeSprite = TileMapScaledSprite
TileMapLargeSprite.create()
 *************************************************************************** */

const TileMapLargeSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_large.frame);
  },
});

TileMapLargeSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapLargeSprite) || TileMapScaledSprite.create(new TileMapLargeSprite());
  }
  return sprite;
};

module.exports = TileMapLargeSprite;
