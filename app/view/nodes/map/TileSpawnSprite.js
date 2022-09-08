// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileSpawnSprite
var TileSpawnSprite = BaseSprite
TileSpawnSprite.create()
 *************************************************************************** */

const TileSpawnSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.tile_spawn.frame);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileSpawnSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileSpawnSprite) || BaseSprite.create(null, new TileSpawnSprite());
  }
  return sprite;
};

module.exports = TileSpawnSprite;
