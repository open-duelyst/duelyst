// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveStraightFromStartSprite
var TileMapPathMoveStraightFromStartSprite = TileMapScaledSprite
TileMapPathMoveStraightFromStartSprite.create()
 *************************************************************************** */

const TileMapPathMoveStraightFromStartSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_straight_from_start.frame);
  },
});

TileMapPathMoveStraightFromStartSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveStraightFromStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveStraightFromStartSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveStraightFromStartSprite;
