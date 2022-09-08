// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const TileMapScaledSprite = require('./TileMapScaledSprite');

/** **************************************************************************
TileMapHoverSprite
var TileMapHoverSprite = TileMapScaledSprite
TileMapHoverSprite.create()
 *************************************************************************** */

const TileMapHoverSprite = TileMapScaledSprite.extend({

  ctor() {
    this._super(RSX.tile_hover.frame);
  },
});

TileMapHoverSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapHoverSprite) || TileMapScaledSprite.create(new TileMapHoverSprite());
  }
  return sprite;
};

module.exports = TileMapHoverSprite;
