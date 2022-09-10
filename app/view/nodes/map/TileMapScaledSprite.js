const CONFIG = require('app/common/config');
const _ = require('underscore');
const UtilsEngine = require('app/common/utils/utils_engine');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
TileMapScaledSprite
var TileMapScaledSprite = BaseSprite
TileMapScaledSprite.create()
 *************************************************************************** */

const TileMapScaledSprite = BaseSprite.extend({
  antiAlias: false,
  ctor(options) {
    this._super(options);

    // force scale to match tilesize
    this.setScale(CONFIG.TILESIZE / this.getContentSize().width);
  },

  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

TileMapScaledSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(TileMapScaledSprite) || BaseSprite.create(null, new TileMapScaledSprite(options));
  }
  return sprite;
};

module.exports = TileMapScaledSprite;
