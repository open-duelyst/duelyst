// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileAttackSprite
var TileAttackSprite = BaseSprite
TileAttackSprite.create()
 *************************************************************************** */

const TileAttackSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.tile_attack.frame);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileAttackSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileAttackSprite) || BaseSprite.create(null, new TileAttackSprite());
  }
  return sprite;
};

module.exports = TileAttackSprite;
