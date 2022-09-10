// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveCornerFromStartSprite
var TileMapPathMoveCornerFromStartSprite = TileMapScaledSprite
TileMapPathMoveCornerFromStartSprite.create()
 *************************************************************************** */

const TileMapPathMoveCornerFromStartSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_corner_from_start.frame);
  },
});

TileMapPathMoveCornerFromStartSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveCornerFromStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerFromStartSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveCornerFromStartSprite;
