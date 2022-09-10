// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapPathMoveEndSprite
var TileMapPathMoveEndSprite = TileMapScaledSprite
TileMapPathMoveEndSprite.create()
 *************************************************************************** */

const TileMapPathMoveEndSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_path_move_end.frame);
  },
});

TileMapPathMoveEndSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapPathMoveEndSprite) || TileMapScaledSprite.create(new TileMapPathMoveEndSprite());
  }
  return sprite;
};

module.exports = TileMapPathMoveEndSprite;
