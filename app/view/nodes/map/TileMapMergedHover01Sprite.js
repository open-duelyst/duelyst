// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedHover01Sprite
var TileMapMergedHover01Sprite = TileMapScaledSprite
TileMapMergedHover01Sprite.create()
 *************************************************************************** */

const TileMapMergedHover01Sprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_hover_01.frame);
  },
});

TileMapMergedHover01Sprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedHover01Sprite) || TileMapScaledSprite.create(new TileMapMergedHover01Sprite());
  }
  return sprite;
};

module.exports = TileMapMergedHover01Sprite;
