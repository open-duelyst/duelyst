// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileCardSprite
var TileCardSprite = BaseSprite
TileCardSprite.create()
 *************************************************************************** */

const TileCardSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.tile_card.frame);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileCardSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileCardSprite) || BaseSprite.create(null, new TileCardSprite());
  }
  return sprite;
};

module.exports = TileCardSprite;
