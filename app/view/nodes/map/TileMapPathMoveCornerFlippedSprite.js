// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveCornerFlippedSprite
var TileMapPathMoveCornerFlippedSprite = TileMapScaledSprite
TileMapPathMoveCornerFlippedSprite.create()
 *************************************************************************** */

const TileMapPathMoveCornerFlippedSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_corner.frame);
    this.setFlippedY(true);
  },
});

TileMapPathMoveCornerFlippedSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveCornerFlippedSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerFlippedSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveCornerFlippedSprite;
