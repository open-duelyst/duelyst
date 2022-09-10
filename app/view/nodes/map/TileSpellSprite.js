// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileSpellSprite
var TileSpellSprite = BaseSprite
TileSpellSprite.create()
 *************************************************************************** */

const TileSpellSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.tile_spell.frame);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileSpellSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileSpellSprite) || BaseSprite.create(null, new TileSpellSprite());
  }
  return sprite;
};

module.exports = TileSpellSprite;
