// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileOpponentSprite
var TileOpponentSprite = BaseSprite
TileOpponentSprite.create()
 *************************************************************************** */

const TileOpponentSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.tile_opponent.frame);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileOpponentSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileOpponentSprite) || BaseSprite.create(null, new TileOpponentSprite());
  }
  return sprite;
};

module.exports = TileOpponentSprite;
