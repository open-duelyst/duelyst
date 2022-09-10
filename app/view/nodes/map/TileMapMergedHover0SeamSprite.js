// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapMergedHover0SeamSprite
var TileMapMergedHover0SeamSprite = TileMapScaledSprite
TileMapMergedHover0SeamSprite.create()
 *************************************************************************** */

const TileMapMergedHover0SeamSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_merged_hover_0_seam.frame);
  },
});

TileMapMergedHover0SeamSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapMergedHover0SeamSprite) || TileMapScaledSprite.create(new TileMapMergedHover0SeamSprite());
  }
  return sprite;
};

module.exports = TileMapMergedHover0SeamSprite;
