// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveStartSprite
var TileMapPathMoveStartSprite = TileMapScaledSprite
TileMapPathMoveStartSprite.create()
 *************************************************************************** */

const TileMapPathMoveStartSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_start.frame);
  },
});

TileMapPathMoveStartSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveStartSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveStartSprite;
