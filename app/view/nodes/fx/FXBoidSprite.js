const CONFIG = require('app/common/config');
const FXSprite = require('./FXSprite');

/** **************************************************************************
 FXBoidSprite
 var FXBoidSprite = FXSprite
 FXBoidSprite.create()
 - this is (more or less) a puppet sprite that the flock sprite controls
 *************************************************************************** */
const FXBoidSprite = FXSprite.extend({
  usesSubPixelPosition: true,
  // boids can impact at end
  impactAtStart: false,
  impactAtEnd: true,
  // boids loop until removed by flock
  looping: true,
  // velocity
  velocity: null,
  targetVelocity: null,

  ctor(options) {
    this.velocity = cc.p();
    this.targetVelocity = cc.p();
    this._super(options);
  },

  getLifeDuration() {
    return 0.0;
  },
  getShowDelay() {
    return 0.0;
  },
  getImpactDelay() {
    return 0.0;
  },
  end() {
    this.impact();

    this.runAction(cc.sequence(
      cc.FadeOut.create(CONFIG.FADE_MEDIUM_DURATION),
      cc.callFunc(this.destroy, this),
    ));
  },
});

FXBoidSprite.create = function (options, sprite) {
  return FXSprite.create(options, sprite || new FXBoidSprite(options));
};

module.exports = FXBoidSprite;
