// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedLarge0123Sprite
var TileMapMergedLarge0123Sprite = TileMapScaledSprite
TileMapMergedLarge0123Sprite.create()
 *************************************************************************** */

const TileMapMergedLarge0123Sprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_large_0123.frame);
  },
});

TileMapMergedLarge0123Sprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedLarge0123Sprite) || TileMapScaledSprite.create(new TileMapMergedLarge0123Sprite());
  }
  return sprite;
};

module.exports = TileMapMergedLarge0123Sprite;
