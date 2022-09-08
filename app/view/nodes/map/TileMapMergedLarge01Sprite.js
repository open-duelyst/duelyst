// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedLarge01Sprite
var TileMapMergedLarge01Sprite = TileMapScaledSprite
TileMapMergedLarge01Sprite.create()
 *************************************************************************** */

const TileMapMergedLarge01Sprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_large_01.frame);
  },
});

TileMapMergedLarge01Sprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedLarge01Sprite) || TileMapScaledSprite.create(new TileMapMergedLarge01Sprite());
  }
  return sprite;
};

module.exports = TileMapMergedLarge01Sprite;
