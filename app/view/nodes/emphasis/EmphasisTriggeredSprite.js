// pragma PKGS: game
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
EmphasisTriggeredSprite
var EmphasisTriggeredSprite = BaseSprite
EmphasisTriggeredSprite.create()
 *************************************************************************** */

const EmphasisTriggeredSprite = BaseSprite.extend({
  ctor() {
    this._super(RSX.modifier_triggered.img);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
});

EmphasisTriggeredSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(EmphasisTriggeredSprite) || BaseSprite.create(null, new EmphasisTriggeredSprite());
  }
  return sprite;
};

module.exports = EmphasisTriggeredSprite;
