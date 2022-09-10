// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedHover0Sprite
var TileMapMergedHover0Sprite = TileMapScaledSprite
TileMapMergedHover0Sprite.create()
 *************************************************************************** */

const TileMapMergedHover0Sprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_hover_0.frame);
  },
});

TileMapMergedHover0Sprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedHover0Sprite) || TileMapScaledSprite.create(new TileMapMergedHover0Sprite());
  }
  return sprite;
};

module.exports = TileMapMergedHover0Sprite;
