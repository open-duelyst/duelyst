// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapGridSprite
var TileMapGridSprite = TileMapScaledSprite
TileMapGridSprite.create()
 *************************************************************************** */

const TileMapGridSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_grid.frame);
  },
});

TileMapGridSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapGridSprite) || TileMapScaledSprite.create(new TileMapGridSprite());
  }
  return sprite;
};

module.exports = TileMapGridSprite;
