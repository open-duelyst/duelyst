// pragma PKGS: game
const _ = require('underscore');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
InstructionalArrowSprite
var InstructionalArrowSprite = BaseSprite
InstructionalArrowSprite.create()
 *************************************************************************** */

const InstructionalArrowSprite = BaseSprite.extend({

  antiAlias: false,
  needsDepthDraw: true,

  ctor() {
    this._super(RSX.instructional_arrow.img);
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },
  setDefaultOptions() {
    this.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
  },
});

InstructionalArrowSprite.create = function (sprite) {
  if (sprite == null) {
    sprite = cc.pool.getFromPool(InstructionalArrowSprite) || BaseSprite.create(null, new InstructionalArrowSprite());
  }
  return sprite;
};

module.exports = InstructionalArrowSprite;
