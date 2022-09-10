const Logger = require('app/common/logger');
const UtilsEngine = require('app/common/utils/utils_engine');
const FXSprite = require('./FXSprite');
const FXProjectileSprite = require('./FXProjectileSprite');

/** **************************************************************************
 FXEnergyBeamSprite
 var FXEnergyBeamSprite = FXProjectileSprite
 FXEnergyBeamSprite.create()
 *************************************************************************** */

const FXEnergyBeamSprite = FXProjectileSprite.extend({
  getShowDelay() {
    return this.getBaseDuration();
  },
  getImpactDelay() {
    return this.getBaseDuration();
  },
  getAutoZOrderIndex() {
    const rotation = this.getRotation() % 180.0;
    if (rotation > 0.0) {
      // when beam facing downwards, display it above everything
      return 0.0;
    } if (rotation < 0.0 && this.sourceBoardPosition != null) {
      // when beam facing upwards, use the source position
      return this.sourceBoardPosition.y;
    }
    return FXProjectileSprite.prototype.getAutoZOrderIndex.call(this);
  },

  startTransform() {
    FXSprite.prototype.startTransform.call(this);

    const sourceScreenPosition = this.getSourceOffsetScreenPosition();
    const targetScreenPosition = this.getTargetOffsetScreenPosition();
    if (sourceScreenPosition && targetScreenPosition) {
      this.setPosition(sourceScreenPosition);
      this.setAnchorPoint(cc.p(0.0, 0.5));
      this.setRotation(-Math.atan2(targetScreenPosition.y - sourceScreenPosition.y, targetScreenPosition.x - sourceScreenPosition.x) * 180 / Math.PI);
      // handles own facing
      this.setFlippedX(false);
    }
  },

  startAnimation() {
    this.runAction(cc.sequence(
      UtilsEngine.getAnimationAction(this.getSpriteIdentifier()),
      cc.callFunc(function () {
        this.end();
        this.destroy(CONFIG.FADE_FAST_DURATION);
      }, this),
    ));
  },
  end() {
    // Logger.module("ENGINE").log("FXEnergyBeamSprite:end -> at " + JSON.stringify( this.getPosition() ) );
    this.impact();
  },
});

FXEnergyBeamSprite.create = function (options, sprite) {
  return FXProjectileSprite.create(options, sprite || new FXEnergyBeamSprite(options));
};

module.exports = FXEnergyBeamSprite;
