// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedHover03Sprite
var TileMapMergedHover03Sprite = TileMapScaledSprite
TileMapMergedHover03Sprite.create()
 *************************************************************************** */

const TileMapMergedHover03Sprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_hover_03.frame);
  },
});

TileMapMergedHover03Sprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedHover03Sprite) || TileMapScaledSprite.create(new TileMapMergedHover03Sprite());
  }
  return sprite;
};

module.exports = TileMapMergedHover03Sprite;
