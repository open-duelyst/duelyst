// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedHover013Sprite
var TileMapMergedHover013Sprite = TileMapScaledSprite
TileMapMergedHover013Sprite.create()
 *************************************************************************** */

const TileMapMergedHover013Sprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_hover_013.frame);
  },
});

TileMapMergedHover013Sprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedHover013Sprite) || TileMapScaledSprite.create(new TileMapMergedHover013Sprite());
  }
  return sprite;
};

module.exports = TileMapMergedHover013Sprite;
