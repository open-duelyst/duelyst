// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedLarge03Sprite
var TileMapMergedLarge03Sprite = TileMapScaledSprite
TileMapMergedLarge03Sprite.create()
 *************************************************************************** */

const TileMapMergedLarge03Sprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_large_03.frame);
  },
});

TileMapMergedLarge03Sprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedLarge03Sprite) || TileMapScaledSprite.create(new TileMapMergedLarge03Sprite());
  }
  return sprite;
};

module.exports = TileMapMergedLarge03Sprite;
