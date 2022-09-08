// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveEndFromStartSprite
var TileMapPathMoveEndFromStartSprite = TileMapScaledSprite
TileMapPathMoveEndFromStartSprite.create()
 *************************************************************************** */

const TileMapPathMoveEndFromStartSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_end_from_start.frame);
  },
});

TileMapPathMoveEndFromStartSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveEndFromStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveEndFromStartSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveEndFromStartSprite;
