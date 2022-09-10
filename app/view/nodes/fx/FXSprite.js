const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const UtilsEngine = require('app/common/utils/utils_engine');
const BaseSprite = require('app/view/nodes/BaseSprite');
const BaseLayer = require('app/view/layers/BaseLayer');
const NodeFactory = require('app/view/helpers/NodeFactory');
const Light = require('./Light');

/** **************************************************************************
FXSprite
var FXSprite = BaseSprite
FXSprite.create()
 *************************************************************************** */

var FXSprite = BaseSprite.extend({
  needsDepthDraw: true,
  depthOffset: CONFIG.DEPTH_OFFSET,
  depthModifier: 0.0,
  // fx sprites should alias as they are usually always pixel art
  antiAlias: false,
  // base sprites auto z order
  autoZOrder: true,
  autoZOrderOffset: 0.5,
  // whether fx should activate as soon as it enters a scene
  autoStart: true,
  // whether fx should trigger impact on start
  impactAtStart: true,
  // whether fx should trigger impact on end
  impactAtEnd: false,
  // impact fx options
  impactFX: null,
  // source and target positions in board space
  sourceBoardPosition: null,
  targetBoardPosition: null,
  // source and target positions in screen space
  sourceScreenPosition: null,
  targetScreenPosition: null,
  // absolute offsets from base position
  // note: this is applied in NodeFactory and not by sprite itself
  offset: null,
  // source and target offsets from base position
  sourceOffset: null,
  targetOffset: null,
  // automatic sub fx emissions (fx sprites, lights, particle systems, etc)
  // should be either a string or array of paths to options objects
  emitFX: null,
  // additional lifetime of sprite above animation duration
  duration: 0.0,
  // whether sprite should loop its animation and never end itself
  looping: false,
  // whether fade loops when looping
  fadeLooping: true,
  // how long to fade in
  fadeInDuration: 0.0,
  // how long to fade in, as a percent of animation duration
  fadeInDurationPct: 0.0,
  // how long to fade out, when not living forever
  fadeOutDuration: 0.0,
  // how long to fade out, as a percent of animation duration, when not living forever
  fadeOutDurationPct: 0.0,
  // rate of rotation, synced to fx time
  rotationPerSecond: 0.0,
  // rate of rotation in 3D, synced to fx time
  xyzRotationPerSecond: null,
  // whether to pulse smoothly, i.e. loop from 0 to 1 to 0 if true, else loop 0 to 1
  pulseSmooth: false,
  // pulse scale range, will only pulse if min != max
  pulseScaleMin: 1.0,
  pulseScaleMax: 1.0,
  // at what point in pulse to have sprite faded in/out by if pulsing
  pulseFadeIn: 0.5,
  pulseFadeOut: 0.7,
  // whether to play the animation in reverse
  reverse: false,
  // whether sprite should be removed after playing its animation once
  removeOnEnd: true,
  // whether sprite should be moved to another layer or sprite after playing its animation once
  destinationParent: null,
  destinationZOrder: 0,

  _emitFXSprites: null,
  _impactFXSprites: null,
  _goingToDestination: false,

  _emitFXLifeDuration: 0.0,
  _emitFXShowDelay: 0.0,
  _emitFXImpactDelay: 0.0,
  _impactFXLifeDuration: 0.0,
  _impactFXShowDelay: 0.0,
  _impactFXImpactDelay: 0.0,

  ctor(options) {
    this._super(options);
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXSprite.WebGLRenderCmd(this);
  },

  setDefaultOptions() {
    this._super();

    // auto set fx sprites to match global scale
    this.setScale(CONFIG.SCALE);
  },

  setOptions(options) {
    this._super(options);
    if (options.autoStart != null) this.setAutoStart(options.autoStart);
    if (options.impactAtStart != null) this.setImpactAtStart(options.impactAtStart);
    if (options.impactAtEnd != null) this.setImpactAtEnd(options.impactAtEnd);
    if (options.impactFX) { this.setImpactFX(options.impactFX); }
    if (options.sourceBoardPosition) { this.setSourceBoardPosition(options.sourceBoardPosition); }
    if (options.targetBoardPosition) { this.setTargetBoardPosition(options.targetBoardPosition); }
    if (options.sourceScreenPosition) { this.setSourceScreenPosition(options.sourceScreenPosition, options.sourceOffset); }
    if (options.targetScreenPosition) { this.setTargetScreenPosition(options.targetScreenPosition, options.targetOffset); }
    if (options.emitFX) { this.setEmitFX(options.emitFX); }
    if (options.duration != null) this.setDuration(options.duration);
    if (options.looping != null) { this.setLooping(options.looping); }
    if (options.fadeLooping != null) { this.setFadeLooping(options.fadeLooping); }
    if (options.fadeInDurationPct != null) this.setFadeInDurationPct(options.fadeInDurationPct);
    if (options.fadeOutDurationPct != null) this.setFadeOutDurationPct(options.fadeOutDurationPct);
    if (options.rotationPerSecond != null) { this.setRotationPerSecond(options.rotationPerSecond); }
    if (options.xyzRotationPerSecond != null) { this.setXYZRotationPerSecond(options.xyzRotationPerSecond); }
    if (options.pulseSmooth != null) { this.setPulseSmooth(options.pulseSmooth); }
    if (options.pulseScaleMin != null) { this.setPulseScaleMin(options.pulseScaleMin); }
    if (options.pulseScaleMax != null) { this.setPulseScaleMax(options.pulseScaleMax); }
    if (options.reverse != null) { this.setReverse(options.reverse); }
    if (options.removeOnEnd != null) { this.setRemoveOnEnd(options.removeOnEnd); }
    if (options.destinationParent) {
      this.setDestinationParent(options.destinationParent);
      this.setRemoveOnEnd(false);
    }
    if (options.destinationZOrder != null) { this.setDestinationZOrder(options.destinationZOrder); }
  },

  setAutoStart(autoStart) {
    this.autoStart = autoStart;
  },
  getAutoStart() {
    return this.autoStart;
  },
  setImpactAtStart(impactAtStart) {
    this.impactAtStart = impactAtStart;
  },
  getImpactAtStart() {
    return this.impactAtStart;
  },
  setImpactAtEnd(impactAtEnd) {
    this.impactAtEnd = impactAtEnd;
  },
  getImpactAtEnd() {
    return this.impactAtEnd;
  },
  setImpactFX(impactFX) {
    this.impactFX = impactFX;
    this._impactFXSprites = null;
  },
  getImpactFX() {
    return this.impactFX;
  },
  getImpactFXSprites() {
    if (this.impactFX && !this._impactFXSprites) {
      this._impactFXSprites = NodeFactory.createFX(this.impactFX, {
        targetBoardPosition: UtilsEngine.transformScreenToBoard(this.getTargetOffsetScreenPosition()),
      });
      this._calculateImpactFXTimings();
    }
    return this._impactFXSprites;
  },
  setSourceBoardPosition(sourceBoardPosition) {
    this.sourceBoardPosition = sourceBoardPosition;
  },
  getSourceBoardPosition() {
    return this.sourceBoardPosition || this.getBoardPositionFrom(this.getSource());
  },
  setSourceScreenPosition(sourceScreenPosition, sourceOffset) {
    this.sourceScreenPosition = sourceScreenPosition;
    if (typeof sourceOffset !== 'undefined') {
      this.sourceOffset = sourceOffset;
    }
  },
  getSourceScreenPosition() {
    return this.sourceScreenPosition || this.getScreenPositionFrom(this.getSource());
  },
  getSourceOffsetScreenPosition() {
    let sourceScreenPosition = this.getSourceScreenPosition();
    if (this.sourceOffset) {
      sourceScreenPosition = cc.p(sourceScreenPosition.x + this.sourceOffset.x, sourceScreenPosition.y + this.sourceOffset.y);
    }
    return sourceScreenPosition;
  },
  getSource() {
    return this.sourceScreenPosition;
  },
  setTargetBoardPosition(targetBoardPosition) {
    this.targetBoardPosition = targetBoardPosition;
  },
  getTargetBoardPosition() {
    return this.targetBoardPosition || this.getBoardPositionFrom(this.getTarget());
  },
  setTargetScreenPosition(targetScreenPosition, targetOffset) {
    this.targetScreenPosition = targetScreenPosition;
    if (typeof targetOffset !== 'undefined') {
      this.targetOffset = targetOffset;
    }
  },
  getTargetScreenPosition() {
    return this.targetScreenPosition || this.getScreenPositionFrom(this.getTarget());
  },
  getTargetOffsetScreenPosition() {
    let targetScreenPosition = this.getTargetScreenPosition();
    if (this.targetOffset) {
      targetScreenPosition = cc.p(targetScreenPosition.x + this.targetOffset.x, targetScreenPosition.y + this.targetOffset.y);
    }
    return targetScreenPosition;
  },
  getTarget() {
    return this.targetScreenPosition;
  },
  getScreenPositionFrom(object) {
    if (object instanceof cc.Node) {
      return object.getPosition();
    } if (object instanceof SDK.Unit) {
      return UtilsEngine.transformBoardToTileMap(object.getPosition());
    }
    return object;
  },
  getBoardPositionFrom(object) {
    if (object instanceof cc.Node) {
      return UtilsEngine.transformScreenToBoard(object.getPosition());
    } if (object instanceof SDK.Unit) {
      return object.getPosition();
    }
    return object;
  },
  getAutoZOrderIndex() {
    if (this.targetBoardPosition != null) {
      return this.targetBoardPosition.y;
    }
    return BaseSprite.prototype.getAutoZOrderIndex.call(this);
  },
  setEmitFX(emitFX) {
    this.emitFX = emitFX;
  },
  getEmitFX() {
    return this.emitFX;
  },
  getEmitFXSprites() {
    if (this.emitFX && !this._emitFXSprites) {
      this._emitFXSprites = NodeFactory.createFX(this.emitFX);
      this._calculateEmitFXTimings();
    }
    return this._emitFXSprites;
  },
  setDuration(duration) {
    this.duration = duration || 0.0;
  },
  getDuration() {
    return this.duration;
  },
  setLooping(looping) {
    this.looping = looping;
  },
  getLooping() {
    return this.looping;
  },
  setFadeLooping(fadeLooping) {
    this.fadeLooping = fadeLooping;
  },
  getFadeLooping() {
    return this.fadeLooping;
  },
  setFadeInDuration(fadeInDuration) {
    this.fadeInDuration = fadeInDuration;
  },
  setFadeInDurationPct(fadeInDurationPct) {
    this.fadeInDurationPct = fadeInDurationPct;
  },
  setFadeOutDuration(fadeOutDuration) {
    this.fadeOutDuration = fadeOutDuration;
  },
  setFadeOutDurationPct(fadeOutDurationPct) {
    this.fadeOutDurationPct = fadeOutDurationPct;
  },
  setRotationPerSecond(rotationPerSecond) {
    this.rotationPerSecond = rotationPerSecond;
  },
  setXYZRotationPerSecond(xyzRotationPerSecond) {
    this.xyzRotationPerSecond = xyzRotationPerSecond;
  },
  setPulseSmooth(pulseSmooth) {
    this.pulseSmooth = pulseSmooth;
  },
  setPulseScaleMin(pulseScaleMin) {
    this.pulseScaleMin = pulseScaleMin;
  },
  setPulseScaleMax(pulseScaleMax) {
    this.pulseScaleMax = pulseScaleMax;
  },
  setReverse(reverse) {
    this.reverse = reverse;
  },
  getReverse() {
    return this.reverse;
  },
  setRemoveOnEnd(removeOnEnd) {
    this.removeOnEnd = removeOnEnd;
  },
  getRemoveOnEnd() {
    return this.removeOnEnd;
  },
  setDestinationParent(destinationParent) {
    this.destinationParent = destinationParent;
  },
  getDestinationParent() {
    return this.destinationParent;
  },
  setDestinationZOrder(destinationZOrder) {
    this.destinationZOrder = destinationZOrder;
  },
  getDestinationZOrder() {
    return this.destinationZOrder;
  },

  // delays for sequencing

  getBaseDuration() {
    // base delay is max of duration and animation
    let duration = this.getDuration();
    const animAction = UtilsEngine.getAnimationAction(this.getSpriteIdentifier());
    if (animAction) {
      duration = Math.max(duration, animAction.getDuration());
    }
    return duration;
  },
  getLifeDuration() {
    // life duration is how long the fx should live for
    let duration = this.getBaseDuration();

    // add emit fx delays
    duration = Math.max(duration, this._emitFXLifeDuration);

    return duration;
  },
  getShowDelay() {
    // show delay is how long the fx should be shown for
    let delay = this.getBaseDuration();

    // add impact fx delays
    delay += this.getImpactFXShowDelay();

    return delay;
  },
  getImpactFXShowDelay() {
    return Math.max(this._impactFXShowDelay, this._impactFXImpactDelay);
  },
  getImpactDelay() {
    // impact delay is how long the fx will take to actually hit
    let delay = 0.0;

    // only delay when we'll impact at the end
    if (this.impactAtEnd) {
      delay = this.getBaseDuration();
    }

    return delay;
  },
  _calculateEmitFXTimings() {
    this._emitFXLifeDuration = 0.0;
    this._emitFXShowDelay = 0.0;
    this._emitFXImpactDelay = 0.0;

    // we'll pass the base duration of this sprite
    // so that all emitted can use it if their own duration is 0 or infinite
    const baseDuration = this.getBaseDuration();

    const fxSprites = this.getEmitFXSprites();
    if (fxSprites && fxSprites.length > 0) {
      for (let i = 0, il = fxSprites.length; i < il; i++) {
        const fxSprite = fxSprites[i];

        // handle lights specially
        if (fxSprite instanceof Light) {
          if (!fxSprite.duration) {
            fxSprite.duration = baseDuration;
          }
        }

        if (fxSprite.getLifeDuration) {
          this._emitFXLifeDuration = Math.max(this._emitFXLifeDuration, fxSprite.getLifeDuration(baseDuration));
        }
        if (fxSprite.getShowDelay) {
          this._emitFXShowDelay = Math.max(this._emitFXShowDelay, fxSprite.getShowDelay(baseDuration));
        }
        if (fxSprite.getImpactDelay) {
          this._emitFXImpactDelay = Math.max(this._emitFXImpactDelay, fxSprite.getImpactDelay(baseDuration));
        }
      }
    }
  },
  _calculateImpactFXTimings() {
    this._impactFXLifeDuration = 0.0;
    this._impactFXShowDelay = 0.0;
    this._impactFXImpactDelay = 0.0;

    const fxSprites = this.getImpactFXSprites();
    if (fxSprites && fxSprites.length > 0) {
      for (let i = 0, il = fxSprites.length; i < il; i++) {
        const fxSprite = fxSprites[i];

        // handle lights specially
        if (fxSprite instanceof Light) {
          if (!fxSprite.duration) {
            fxSprite.duration = this.getBaseDuration();
          }
        }

        if (fxSprite.getLifeDuration) {
          this._impactFXLifeDuration = Math.max(this._impactFXLifeDuration, fxSprite.getLifeDuration());
        }
        if (fxSprite.getShowDelay) {
          this._impactFXShowDelay = Math.max(this._impactFXShowDelay, fxSprite.getShowDelay());
        }
        if (fxSprite.getImpactDelay) {
          this._impactFXImpactDelay = Math.max(this._impactFXImpactDelay, fxSprite.getImpactDelay());
        }
      }
    }
  },

  start() {
    this.startTransform();
    this.startEmit();
    this.startAnimation();
    this.startEvents();
  },
  startTransform() {
    // turn some properties off unless parent is a layer
    if (!(this.getParent() instanceof BaseLayer)) {
      this.setAutoZOrder(false);
      this.setNeedsDepthDraw(false);
    }
  },
  getActionForAnimationSequence() {
    return UtilsEngine.getAnimationAction(this.getSpriteIdentifier());
  },
  startAnimation() {
    let needsUpdate = false;

    // main sequence
    const mainDuration = this.getLifeDuration();
    const mainSequenceSteps = [];
    mainSequenceSteps.push(cc.delayTime(mainDuration));

    // animation sequence
    let animAction = this.getActionForAnimationSequence();
    let animationSequenceSteps;
    let animationDuration;
    if (animAction) {
      animationDuration = animAction.getDuration();
      animationSequenceSteps = [];
      if (this.reverse) {
        animAction = animAction.reverse();
      }
      animationSequenceSteps.push(animAction);
    } else {
      animationDuration = 0.0;
    }

    // fade sequence
    let fadeSequenceSteps;
    let fadeDuration;
    if (this.fadeInDuration > 0.0 || this.fadeOutDuration > 0.0 || this.fadeInDurationPct > 0.0 || this.fadeOutDurationPct > 0.0) {
      const duration = animationDuration || mainDuration;
      fadeSequenceSteps = [];

      const fadeDelay = Math.max(0.0, duration - duration * (this.fadeInDurationPct + this.fadeOutDurationPct));
      const fadeInDuration = this.fadeInDuration + duration * this.fadeInDurationPct;
      const fadeOutDuration = this.fadeOutDuration + duration * this.fadeOutDurationPct;
      fadeDuration = fadeInDuration + fadeDelay + fadeOutDuration;

      if (fadeInDuration > 0.0) {
        this.setOpacity(0.0);
        fadeSequenceSteps.push(cc.EaseSineOut.create(cc.fadeIn(fadeInDuration)));
      }
      if (fadeDelay > 0.0) {
        fadeSequenceSteps.push(cc.delayTime(fadeDelay));
      }
      if (fadeOutDuration > 0.0) {
        fadeSequenceSteps.push(cc.EaseSineIn.create(cc.fadeOut(fadeOutDuration)));
      }
    } else {
      fadeDuration = 0.0;
    }

    // record starting rotation
    if (this.rotationPerSecond) {
      this._rotationBase = this.getRotation();
      needsUpdate = true;
    }
    if (this.xyzRotationPerSecond && (this.xyzRotationPerSecond.x !== 0.0 || this.xyzRotationPerSecond.y !== 0.0 || this.xyzRotationPerSecond.z !== 0.0)) {
      this._xyzRotationBase = this.getXYZRotation();
      needsUpdate = true;
    }

    // check if pulse needed
    if (this.pulseScaleMin !== this.pulseScaleMax) {
      needsUpdate = true;
    }

    // ensure all sequences are long enough to sync by adding a delay to compensate at end
    const maxDuration = Math.max(mainDuration, animationDuration, fadeDuration);

    // run animation
    if (animationSequenceSteps && animationSequenceSteps.length > 0) {
      if (this.looping && this.fadeLooping) {
        let animationSequenceAction = cc.sequence(animationSequenceSteps);
        if (animationSequenceAction.getDuration() > 0) {
          animationSequenceAction = animationSequenceAction.repeatForever();
        }
        this.runAction(animationSequenceAction);
      } else {
        if (maxDuration - animationDuration) {
          if (this.removeOnEnd) {
            animationSequenceSteps.push(cc.callFunc(function () { this._texture = null; }, this));
          }
          animationSequenceSteps.push(cc.delayTime(maxDuration - animationDuration));
        }
        this.runAction(cc.sequence(animationSequenceSteps));
      }
    }

    // run fade
    if (fadeSequenceSteps && fadeSequenceSteps.length > 0) {
      if (maxDuration - fadeDuration) {
        fadeSequenceSteps.push(cc.delayTime(maxDuration - fadeDuration));
      }

      let fadeSequenceAction = cc.sequence(fadeSequenceSteps);
      if (this.looping && this.fadeLooping && fadeSequenceAction.getDuration() > 0) {
        fadeSequenceAction = fadeSequenceAction.repeatForever();
      }
      this.runAction(fadeSequenceAction);
    }

    // run main
    if (this.destinationParent) {
      mainSequenceSteps.push(cc.callFunc(this.gotoDestination, this));
    }
    if (maxDuration - mainDuration) {
      mainSequenceSteps.push(cc.delayTime(maxDuration - mainDuration));
    }

    if (mainSequenceSteps && mainSequenceSteps.length > 0) {
      if (this.looping) {
        let mainSequenceAction = cc.sequence(mainSequenceSteps);
        if (mainSequenceAction.getDuration() > 0) {
          mainSequenceAction = mainSequenceAction.repeatForever();
        }
        this.runAction(mainSequenceAction);
      } else {
        mainSequenceSteps.push(cc.callFunc(this.end, this));
        this.runAction(cc.sequence(mainSequenceSteps));
      }
    }

    if (needsUpdate) {
      this.scheduleUpdate();
    }
  },
  startEmit() {
    const emitFXSprites = this.getEmitFXSprites();
    if (emitFXSprites && emitFXSprites.length > 0) {
      for (let i = 0, il = emitFXSprites.length; i < il; i++) {
        const fxSprite = emitFXSprites[i];

        // shift to center
        const fxSpritePosition = fxSprite.getPosition();
        fxSprite.setPosition(fxSpritePosition.x + this._contentSize.width * 0.5, fxSpritePosition.y + this._contentSize.height * 0.5);

        // correct for multiplicative scale
        fxSprite.setScale(fxSprite.getScale() / this.getScale());

        // correct for particle rotation
        if (fxSprite instanceof cc.ParticleSystem) {
          fxSprite.setRotation(-this.getRotation());
        }

        // show sprite
        this.addChild(fxSprite, fxSprite.getLocalZOrder() || 0);
      }
    }
  },
  startEvents() {
    if (this.impactAtStart) {
      this.impact();
    }
  },
  gotoDestination() {
    this._goingToDestination = true;
    if (this.destinationParent && this.getParent() !== this.destinationParent) {
      this.removeFromParent(false);
      this.destinationParent.addChild(this, this.destinationZOrder);
    } else if (this.getLocalZOrder() !== this.destinationZOrder) {
      this.setLocalZOrder(this.destinationZOrder);
    }
    this._goingToDestination = false;
  },
  end() {
    if (this.impactAtEnd) {
      this.impact();
    }
    if (this.removeOnEnd) {
      this.destroy();
    }
  },
  impact() {
    const impactFXSprites = this.getImpactFXSprites();
    if (impactFXSprites && impactFXSprites.length > 0) {
      this.getScene().getGameLayer().addNodes(impactFXSprites, {
        sourceScreenPosition: UtilsEngine.transformScreenToBoard(this.getSourceScreenPosition()),
        targetScreenPosition: UtilsEngine.transformScreenToBoard(this.getPosition()),
      });
    }
  },
  onEnter() {
    BaseSprite.prototype.onEnter.call(this);
    if (!this._goingToDestination) {
      this._setup();
    }
  },
  _setup() {
    if (this.autoStart) {
      this.start();
    }
  },
  onExit() {
    BaseSprite.prototype.onExit.call(this);
    if (!this._goingToDestination) {
      this._teardown();
    }
  },
  _teardown() {
    // override this in subclass
  },
  _restart() {
    this._teardown();
    this._setup();
  },
  _textureLoadedCallback(sender) {
    BaseSprite.prototype._textureLoadedCallback.call(this, sender);
    if (this._running) { this._restart(); }
  },
  removeChild(child, cleanup) {
    BaseSprite.prototype.removeChild.call(this, child, cleanup);
    // special case when no children and this sprite has no actions running or identifier
    if (this._children.length === 0 && this.getNumberOfRunningActions() === 0) {
      this.destroy();
    }
  },
  update(dt) {
    BaseSprite.prototype.update.call(this, dt);

    // synced modifications
    const rotationTime = this.getFX().getTime();
    if (this.rotationPerSecond) {
      this.setRotation(this._rotationBase + this.rotationPerSecond * rotationTime);
    }
    if (this.xyzRotationPerSecond) {
      const rotationXYZ = new cc.kmVec3();
      rotationXYZ.x = this._xyzRotationBase.x + this.xyzRotationPerSecond.x * rotationTime;
      rotationXYZ.y = this._xyzRotationBase.y + this.xyzRotationPerSecond.y * rotationTime;
      rotationXYZ.z = this._xyzRotationBase.z + this.xyzRotationPerSecond.z * rotationTime;
      this.setXYZRotation(rotationXYZ);
    }
    if (this.pulseScaleMin !== this.pulseScaleMax) {
      const pulseTime = this.pulseSmooth ? this.getFX().getLoopingDirectionalTime() : this.getFX().getLoopingTime();
      this.setScale(this.pulseScaleMax * pulseTime + this.pulseScaleMin * (1.0 - pulseTime));

      const { pulseFadeIn } = this;
      const { pulseFadeOut } = this;
      if (pulseTime <= pulseFadeIn) {
        this.setOpacity(255 * Math.min(1.0, pulseTime / pulseFadeIn));
      } else if (pulseTime >= pulseFadeOut) {
        this.setOpacity(255 * (1.0 - pulseTime) / (1.0 - pulseFadeOut));
      }
    }
  },
});

FXSprite.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = FXSprite.WebGLRenderCmd;

FXSprite.create = function (options, sprite) {
  return BaseSprite.create(options, sprite || new FXSprite(options));
};

module.exports = FXSprite;
