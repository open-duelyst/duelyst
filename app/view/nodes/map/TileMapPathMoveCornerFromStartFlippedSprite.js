// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveCornerFromStartFlippedSprite
var TileMapPathMoveCornerFromStartFlippedSprite = TileMapScaledSprite
TileMapPathMoveCornerFromStartFlippedSprite.create()
 *************************************************************************** */

const TileMapPathMoveCornerFromStartFlippedSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_corner_from_start.frame);
    this.setFlippedY(true);
  },
});

TileMapPathMoveCornerFromStartFlippedSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveCornerFromStartFlippedSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerFromStartFlippedSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveCornerFromStartFlippedSprite;
