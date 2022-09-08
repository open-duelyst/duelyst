// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveCornerSprite
var TileMapPathMoveCornerSprite = TileMapScaledSprite
TileMapPathMoveCornerSprite.create()
 *************************************************************************** */

const TileMapPathMoveCornerSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_corner.frame);
  },
});

TileMapPathMoveCornerSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveCornerSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveCornerSprite;
