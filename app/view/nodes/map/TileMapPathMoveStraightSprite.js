// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveStraightSprite
var TileMapPathMoveStraightSprite = TileMapScaledSprite
TileMapPathMoveStraightSprite.create()
 *************************************************************************** */

const TileMapPathMoveStraightSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_straight.frame);
  },
});

TileMapPathMoveStraightSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveStraightSprite) || TileMapScaledSprite.create(new TileMapPathMoveStraightSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveStraightSprite;
