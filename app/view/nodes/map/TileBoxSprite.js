// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileBoxSprite
var TileBoxSprite = BaseSprite
TileBoxSprite.create()
 *************************************************************************** */

const TileBoxSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.tile_box.frame);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileBoxSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileBoxSprite) || BaseSprite.create(null, new TileBoxSprite());
  }
  return sprite;
};

module.exports = TileBoxSprite;
