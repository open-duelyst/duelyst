const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const TweenTypes = require('../actions/TweenTypes');
const RenderPass = require('../fx/RenderPass');
const BaseSprite = require('./BaseSprite');
const BaseParticleSystem = require('./BaseParticleSystem');
const Light = require('./fx/Light');

/** **************************************************************************
 GlowSprite
 var GlowSprite = BaseSprite
 GlowSprite.create()
 *************************************************************************** */

var GlowSprite = BaseSprite.extend({
  // whether this sprite is a light source
  isLightSource: false,
  // position offset from this sprite's center
  lightSourceOffset: null,
  // options used to create light
  lightSourceOptions: null,
  // light source, generated automatically
  _light: null,

  // whether sprite is glowing
  glowing: false,
  // how heavily to blur glow, values are "weak"(default), "medium", "strong"
  glowBlurStrength: 'weak',
  // how thick the glow should be, from 0 to infinity, where 0 is a very slight or no outline for glow (but still may glow)
  glowThickness: 1.0,
  _glowThicknessTarget: 1.0,
  // position of glow vertical fade from top of sprite going down
  glowVerticalFadeFromTop: 0.55,
  // speed of glow vertical fade, where higher will fade more aggressively
  glowVerticalFadeSpeed: 9.0,
  // amount of extra space around sprite to provide as padding for glow in pixels
  // this helps with sprites that are close/exact to the edge of their texture
  glowPadding: 20.0,
  // starting rgba color for gradient glow, from 0 to 255
  // will add its own alpha to the final effect and increase intensity
  // note: this is actually applied in the glow noise pass, not in the glow pass itself, for efficiency
  glowRampFrom: cc.color(255.0, 255.0, 255.0, 0.0),
  // transition rgba color for glow, between start and primary
  // will add its own alpha to the final effect and increase intensity
  // note: this is actually applied in the glow noise pass, not in the glow pass itself, for efficiency
  glowRampTransition: cc.color(255.0, 255.0, 255.0, 0.0),
  // ending rgba color for glow, from 0 to 255
  glowColorTo: cc.color(255.0, 255.0, 255.0, 255.0),
  // how fast the glow should pulse
  glowFrequency: 0.5,
  // when pulsing glow, range of pulse
  glowMaxAlpha: 255,
  _glowMaxAlphaTarget: 255,
  glowMinAlpha: 255,
  _glowMinAlphaTarget: 255,

  // fractal brownian motion in glow
  glowNoiseColor: cc.color(255.0, 255.0, 255.0, 255.0),
  // how far from glow the noise can be seen
  glowNoiseExpandModifier: 0.0,

  // whether sprite is highlighted
  highlighted: false,
  // how heavily to blur highlight, values are "weak", "medium", "strong"(default)
  highlightBlurStrength: 'strong',
  // rgba color of highlight from 0 to 255 (usually set by the entity)
  highlightColor: cc.color(255.0, 255.0, 255.0, 255.0),
  // how fast the highlight should pulse (usually set by the entity)
  highlightFrequency: 1.0,
  // when pulsing highlight, range of pulse (usually set by the entity)
  highlightMaxAlpha: 255,
  _highlightMaxAlphaTarget: 255,
  highlightMinAlpha: 255,
  _highlightMinAlphaTarget: 255,
  // how much of the highlight color to use vs the sprite color
  highlightBrightness: 0.9,
  // threshold for highpass where a color must meet or exceed to be bloomed
  highlightThreshold: 0.3,
  // when a color is bloomed, how intense the effect should be
  highlightIntensity: 4.0,
  // position of glow vertical fade from top of sprite going down
  highlightVerticalFadeFromTop: 1.0,
  // speed of glow vertical fade, where higher will fade more aggressively
  highlightVerticalFadeSpeed: 3.0,
  // properties for adjusting levels (based on photoshop's functionality)
  highlightLevelsInBlack: 15.0,
  highlightLevelsOutBlack: 0.0,
  highlightLevelsInWhite: 200.0,
  highlightLevelsInGamma: 2.0,
  highlightLevelsOutWhite: 255.0,

  // whether unit should display prismatic fx
  isPrismatic: false,
  // frequency (size) of prismatic effect
  prismaticFrequency: 10.0,
  // amplitude (strength) of prismatic effect
  prismaticAmplitude: 0.1,
  // speed of prismatic effect
  prismaticSpeed: 0.01,
  // min range of smoothstep on prismatic effect
  prismaticSmoothstepMin: 0.05,
  // max range of smoothstep on prismatic effect
  prismaticSmoothstepMax: 0.15,

  ctor(options) {
    this._super(options);

    this.glowColorTo = cc.color(this.glowColorTo.r, this.glowColorTo.g, this.glowColorTo.b, this.glowColorTo.a);
    this.glowRampFrom = cc.color(this.glowRampFrom.r, this.glowRampFrom.g, this.glowRampFrom.b, this.glowRampFrom.a);
    this.glowRampTransition = cc.color(this.glowRampTransition.r, this.glowRampTransition.g, this.glowRampTransition.b, this.glowRampTransition.a);
    this.glowNoiseColor = cc.color(this.glowNoiseColor.r, this.glowNoiseColor.g, this.glowNoiseColor.b, this.glowNoiseColor.a);
    this.highlightColor = cc.color(this.highlightColor.r, this.highlightColor.g, this.highlightColor.b, this.highlightColor.a);
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new GlowSprite.WebGLRenderCmd(this);
  },

  onEnter() {
    BaseSprite.prototype.onEnter.call(this);

    if (this.isLightSource) {
      this.isLightSource = false;
      this.setIsLightSource(true);
    }

    this.scheduleUpdate();
  },

  onExit() {
    this.unscheduleUpdate();
    this.setIsLightSource(false);

    BaseSprite.prototype.onExit.call(this);
  },

  setIsLightSource(isLightSource, lightSourceOptions) {
    if (this.isLightSource !== isLightSource || (lightSourceOptions && this.lightSourceOptions !== lightSourceOptions)) {
      // destroy previous
      if (this._light) {
        this._light.destroy(CONFIG.FADE_MEDIUM_DURATION);
        this._light = null;
      }

      // set new
      this.isLightSource = isLightSource;

      if (this.isLightSource) {
        // check for new options
        if (lightSourceOptions) {
          this.lightSourceOptions = lightSourceOptions;
        }

        // create light
        this._light = Light.create(this.lightSourceOptions);
        const centerPosition = this.getCenterPosition();
        if (this.lightSourceOffset) {
          centerPosition.x += this.lightSourceOffset.x;
          centerPosition.y += this.lightSourceOffset.y;
        }
        this._light.setPosition(centerPosition);
        this.addChild(this._light);
      }
    }
  },
  setLightSourceOffset(lightSourceOffset) {
    this.lightSourceOffset = lightSourceOffset;
    if (this._light) {
      const centerPosition = this.getCenterPosition();
      if (this.lightSourceOffset) {
        centerPosition.x += this.lightSourceOffset.x;
        centerPosition.y += this.lightSourceOffset.y;
      }
      this._light.setPosition(centerPosition);
    }
  },
  getLight() {
    return this._light;
  },

  setGlowing(glowing) {
    glowing || (glowing = false);
    if (this.glowing !== glowing) {
      this.glowing = glowing;
      this.setGlowHighlightNeedsRebuild();
    }
  },
  getGlowing() {
    return this.glowing;
  },
  setGlowHighlightNeedsRebuild() {
    this._renderCmd.setGlowHighlightNeedsRebuild();
  },
  setGlowBlurStrength(glowBlurStrength) {
    if (glowBlurStrength != null) {
      this.glowBlurStrength = glowBlurStrength;
    }
  },
  setGlowThickness(glowThickness) {
    if (glowThickness != null) {
      this.glowThickness = this._glowThicknessTarget = glowThickness;
    }
  },
  setGlowVerticalFadeFromTop(glowVerticalFadeFromTop) {
    if (glowVerticalFadeFromTop != null) {
      this.glowVerticalFadeFromTop = glowVerticalFadeFromTop;
    }
  },
  setGlowVerticalFadeSpeed(glowVerticalFadeSpeed) {
    if (glowVerticalFadeSpeed != null) {
      this.glowVerticalFadeSpeed = glowVerticalFadeSpeed;
    }
  },
  setGlowPadding(glowPadding) {
    if (glowPadding != null) {
      this.glowPadding = glowPadding;
    }
  },
  setGlowRampFrom(r, g, b, a) {
    if (arguments.length === 1) {
      const c = arguments[0];
      r = c.r;
      g = c.g;
      b = c.b;
      a = c.a;
    }
    this.glowRampFrom.r = r;
    this.glowRampFrom.g = g;
    this.glowRampFrom.b = b;
    if (a != null) this.glowRampFrom.a = a;
  },
  setGlowRampTransition(r, g, b, a) {
    if (arguments.length === 1) {
      const c = arguments[0];
      r = c.r;
      g = c.g;
      b = c.b;
      a = c.a;
    }
    this.glowRampTransition.r = r;
    this.glowRampTransition.g = g;
    this.glowRampTransition.b = b;
    if (a != null) this.glowRampTransition.a = a;
  },
  setGlowColorTo(r, g, b, a) {
    if (arguments.length === 1) {
      const c = arguments[0];
      r = c.r;
      g = c.g;
      b = c.b;
      a = c.a;
    }
    this.glowColorTo.r = r;
    this.glowColorTo.g = g;
    this.glowColorTo.b = b;
    if (a != null) this.glowColorTo.a = a;
  },
  setGlowFrequency(glowFrequency) {
    if (glowFrequency != null) {
      this.glowFrequency = glowFrequency;
    }
  },
  setGlowMaxAlpha(glowMaxAlpha) {
    if (glowMaxAlpha != null) {
      this.glowMaxAlpha = this._glowMaxAlphaTarget = glowMaxAlpha;
    }
  },
  setGlowMinAlpha(glowMinAlpha) {
    if (glowMinAlpha != null) {
      this.glowMinAlpha = this._glowMinAlphaTarget = glowMinAlpha;
    }
  },

  setGlowNoiseColor(r, g, b, a) {
    if (arguments.length === 1) {
      const c = arguments[0];
      r = c.r;
      g = c.g;
      b = c.b;
      a = c.a;
    }
    this.glowNoiseColor.r = r;
    this.glowNoiseColor.g = g;
    this.glowNoiseColor.b = b;
    if (a != null) this.glowNoiseColor.a = a;
  },
  setGlowNoiseExpandModifier(glowNoiseExpandModifier) {
    if (glowNoiseExpandModifier != null) {
      this.glowNoiseExpandModifier = glowNoiseExpandModifier;
    }
  },

  showGlowForAttackableTarget() {
    this.setGlowRampFrom(CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_FROM);
    this.setGlowRampTransition(CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_TRANSITION);
    this.setGlowColorTo(CONFIG.ATTACKABLE_TARGET_GLOW_COLOR_TO);
    this.setGlowNoiseColor(CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_NOISE_COLOR);
    // this.setGlowMinAlpha(0);
    this.fadeInGlow();
  },

  showGlowForPlayer() {
    this.setGlowRampFrom(CONFIG.PLAYER_CARD_GLOW_RAMP_FROM_COLOR);
    this.setGlowRampTransition(CONFIG.PLAYER_CARD_GLOW_RAMP_TRANSITION_COLOR);
    this.setGlowColorTo(CONFIG.PLAYER_CARD_GLOW_RAMP_TO_COLOR);
    this.setGlowNoiseColor(CONFIG.PLAYER_CARD_GLOW_RAMP_NOISE_COLOR);
    // this.setGlowMinAlpha(255);
    this.fadeInGlow();
  },

  showGlowForInstructional() {
    this.setGlowRampFrom(CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_FROM_COLOR);
    this.setGlowRampTransition(CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_TRANSITION_COLOR);
    this.setGlowColorTo(CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_TO_COLOR);
    this.setGlowNoiseColor(CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_NOISE_COLOR);
    // this.setGlowMinAlpha(0);
    this.fadeInGlow();
  },

  showGlowForOpponent() {
    this.setGlowRampFrom(CONFIG.OPPONENT_CARD_GLOW_RAMP_FROM_COLOR);
    this.setGlowRampTransition(CONFIG.OPPONENT_CARD_GLOW_RAMP_TRANSITION_COLOR);
    this.setGlowColorTo(CONFIG.OPPONENT_CARD_GLOW_RAMP_TO_COLOR);
    this.setGlowNoiseColor(CONFIG.OPPONENT_CARD_GLOW_RAMP_NOISE_COLOR);
    // this.setGlowMinAlpha(255);
    this.fadeInGlow();
  },

  setHighlighted(highlighted) {
    highlighted || (highlighted = false);
    if (this.highlighted !== highlighted) {
      this.highlighted = highlighted;
      this.setGlowHighlightNeedsRebuild();
    }
  },
  getHighlighted() {
    return this.highlighted;
  },
  setHighlightBlurStrength(highlightBlurStrength) {
    if (highlightBlurStrength != null) {
      this.highlightBlurStrength = highlightBlurStrength;
    }
  },
  setHighlightColor(color) {
    if (color != null) {
      this.highlightColor.r = color.r;
      this.highlightColor.g = color.g;
      this.highlightColor.b = color.b;
      if (color.a != null) this.highlightColor.a = color.a;
    }
  },
  setHighlightFrequency(highlightFrequency) {
    if (highlightFrequency != null) {
      this.highlightFrequency = highlightFrequency;
    }
  },
  setHighlightMinAlpha(highlightMinAlpha) {
    if (highlightMinAlpha != null) {
      this.highlightMinAlpha = this._highlightMinAlphaTarget = highlightMinAlpha;
    }
  },
  setHighlightMaxAlpha(highlightMaxAlpha) {
    if (highlightMaxAlpha != null) {
      this.highlightMaxAlpha = this._highlightMaxAlphaTarget = highlightMaxAlpha;
    }
  },
  setHighlightBrightness(highlightBrightness) {
    if (highlightBrightness != null) {
      this.highlightBrightness = highlightBrightness;
    }
  },
  setHighlightThreshold(highlightThreshold) {
    if (highlightThreshold != null) {
      this.highlightThreshold = highlightThreshold;
    }
  },
  setHighlightIntensity(highlightIntensity) {
    if (highlightIntensity != null) {
      this.highlightIntensity = highlightIntensity;
    }
  },
  setHighlightVerticalFadeFromTop(highlightVerticalFadeFromTop) {
    if (highlightVerticalFadeFromTop != null) {
      this.highlightVerticalFadeFromTop = highlightVerticalFadeFromTop;
    }
  },
  setHighlightVerticalFadeSpeed(highlightVerticalFadeSpeed) {
    if (highlightVerticalFadeSpeed != null) {
      this.highlightVerticalFadeSpeed = highlightVerticalFadeSpeed;
    }
  },
  showHighlight(highlightColor, highlightFrequency, highlightMinAlpha, highlightMaxAlpha) {
    this.setHighlightColor(highlightColor);
    this.setHighlightFrequency(highlightFrequency);
    this.setHighlightMinAlpha(highlightMinAlpha);
    this.setHighlightMaxAlpha(highlightMaxAlpha);
    this.fadeInHighlight();
  },

  setIsPrismatic(val) {
    if (this.isPrismatic != val) {
      this.isPrismatic = val;
    }
  },

  getIsPrismatic() {
    return this.isPrismatic;
  },

  setPrismaticFrequency(val) {
    if (this.prismaticFrequency != val) {
      this.prismaticFrequency = val;
    }
  },

  getPrismaticFrequency() {
    return this.prismaticFrequency;
  },

  setPrismaticAmplitude(val) {
    if (this.prismaticAmplitude != val) {
      this.prismaticAmplitude = val;
    }
  },

  getPrismaticAmplitude() {
    return this.prismaticAmplitude;
  },

  setPrismaticSpeed(val) {
    if (this.prismaticSpeed != val) {
      this.prismaticSpeed = val;
    }
  },

  getPrismaticSpeed() {
    return this.prismaticSpeed;
  },

  setPrismaticSmoothstepMin(val) {
    if (this.prismaticSmoothstepMin != val) {
      this.prismaticSmoothstepMin = val;
    }
  },

  getPrismaticSmoothstepMin() {
    return this.prismaticSmoothstepMin;
  },

  setPrismaticSmoothstepMax(val) {
    if (this.prismaticSmoothstepMax != val) {
      this.prismaticSmoothstepMax = val;
    }
  },

  getPrismaticSmoothstepMax() {
    return this.prismaticSmoothstepMax;
  },

  fadeInGlow(duration, easing) {
    let needsFade = !this.glowing;
    if (this._glowFadeAction) {
      this.stopAction(this._glowFadeAction);
      this._glowFadeAction = null;
      needsFade = true;
    }
    if (needsFade) {
      this.setGlowing(true);
      this.glowMaxAlpha = 0;
      this.glowMinAlpha = 0;
      if (duration == null) { duration = CONFIG.FADE_FAST_DURATION; }
      let tweenAction = cc.actionTween(duration, TweenTypes.GLOW_FADE, 0.0, 1.0);
      if (easing != null) {
        tweenAction = tweenAction.easing(easing);
      }
      this._glowFadeAction = cc.sequence(
        tweenAction,
        cc.callFunc(function () {
          this.glowMaxAlpha = this._glowMaxAlphaTarget;
          this.glowMinAlpha = this._glowMinAlphaTarget;
          this._glowFadeAction = null;
        }, this),
      );
      this.runAction(this._glowFadeAction);
    }
  },

  fadeOutGlow(duration, easing) {
    let needsFade = this.glowing;
    if (this._glowFadeAction) {
      this.stopAction(this._glowFadeAction);
      this._glowFadeAction = null;
      needsFade = true;
    }
    if (needsFade) {
      if (duration == null) { duration = CONFIG.FADE_FAST_DURATION; }
      let tweenAction = cc.actionTween(duration, TweenTypes.GLOW_FADE, 1.0, 0.0);
      if (easing != null) {
        tweenAction = tweenAction.easing(easing);
      }
      this._glowFadeAction = cc.sequence(
        tweenAction,
        cc.callFunc(function () {
          this.setGlowing(false);
          this.glowMaxAlpha = this._glowMaxAlphaTarget;
          this.glowMinAlpha = this._glowMinAlphaTarget;
          this._glowFadeAction = null;
        }, this),
      );
      this.runAction(this._glowFadeAction);
    }
  },

  fadeInHighlight(duration, easing) {
    let needsFade = !this.highlighted;
    if (this._highlightFadeAction) {
      this.stopAction(this._highlightFadeAction);
      this._highlightFadeAction = null;
      needsFade = true;
    }
    if (needsFade) {
      this.setHighlighted(true);
      this.highlightMaxAlpha = 0;
      this.highlightMinAlpha = 0;
      if (duration == null) { duration = CONFIG.FADE_MEDIUM_DURATION; }
      let tweenAction = cc.actionTween(duration, TweenTypes.HIGHLIGHT_FADE, 0.0, 1.0);
      if (easing != null) {
        tweenAction = tweenAction.easing(easing);
      }
      this._highlightFadeAction = cc.sequence(
        tweenAction,
        cc.callFunc(function () {
          this.highlightMaxAlpha = this._highlightMaxAlphaTarget;
          this.highlightMinAlpha = this._highlightMinAlphaTarget;
          this._highlightFadeAction = null;
        }, this),
      );
      this.runAction(this._highlightFadeAction);
    }
  },

  fadeOutHighlight(duration, easing) {
    let needsFade = this.highlighted;
    if (this._highlightFadeAction) {
      this.stopAction(this._highlightFadeAction);
      this._highlightFadeAction = null;
      needsFade = true;
    }
    if (needsFade) {
      if (duration == null) { duration = CONFIG.FADE_MEDIUM_DURATION; }
      let tweenAction = cc.actionTween(duration, TweenTypes.HIGHLIGHT_FADE, 1.0, 0.0);
      if (easing != null) {
        tweenAction = tweenAction.easing(easing);
      }
      this._highlightFadeAction = cc.sequence(
        tweenAction,
        cc.callFunc(function () {
          this.setHighlighted(false);
          this.highlightMaxAlpha = this._highlightMaxAlphaTarget;
          this.highlightMinAlpha = this._highlightMinAlphaTarget;
          this._highlightFadeAction = null;
        }, this),
      );
      this.runAction(this._highlightFadeAction);
    }
  },

  updateTweenAction(value, key) {
    if (key === TweenTypes.GLOW_FADE) {
      this.glowMaxAlpha = this._glowMaxAlphaTarget * value;
      this.glowMinAlpha = this._glowMinAlphaTarget * value;
    } else if (key === TweenTypes.HIGHLIGHT_FADE) {
      this.highlightMaxAlpha = this._highlightMaxAlphaTarget * value;
      this.highlightMinAlpha = this._highlightMinAlphaTarget * value;
    } else if (key === TweenTypes.GLOW_THICKNESS) {
      this.glowThickness = this._glowThicknessTarget * value;
    } else {
      BaseSprite.prototype.updateTweenAction.call(this, value, key);
    }
  },
});

GlowSprite.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);

  this._glowHighlightNeedsRebuild = true;
  this._glowWidth = 0;
  this._glowHeight = 0;
  this._glowPadded = false;
  this._glowMVMatrix = null;
  this._glowPassMatrix = null;
  this._glowPaddingMatrix = null;
};
const proto = GlowSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = GlowSprite.WebGLRenderCmd;

proto.getNeedsComposite = function () {
  return BaseSprite.WebGLRenderCmd.prototype.getNeedsComposite.call(this) || this.getNeedsGlowHighlight();
};

proto.setCompositeNeedsRebuild = function () {
  this._compositeNeedsRebuild = true;
  this.setGlowHighlightNeedsRebuild();
};

proto.getDepthTestSize = function () {
  if (this.getIsGlowingHighlighting()) {
    return cc.size(this._glowWidth, this._glowHeight);
  }
  return BaseSprite.WebGLRenderCmd.prototype.getDepthTestSize.call(this);
};

proto.getNeedsGlowHighlight = function () {
  return this._node.getGlowing() || this._node.getHighlighted();
};

proto.getIsGlowingHighlighting = function () {
  return this._glowHighlightCompositePass != null;
};

proto.setGlowHighlightNeedsRebuild = function () {
  this._glowHighlightNeedsRebuild = true;
};

proto.rebuildCompositePasses = function () {
  BaseSprite.WebGLRenderCmd.prototype.rebuildCompositePasses.call(this);
  if (this._glowHighlightNeedsRebuild) {
    this.rebuildGlowHighlightPasses();
  }
};
proto.rebuildGlowHighlightPasses = function () {
  const node = this._node;
  const needsGlowHighlight = this.getNeedsGlowHighlight();
  const isCompositing = this.getIsCompositing();
  let width;
  let height;
  if (needsGlowHighlight && isCompositing) {
    width = this._compositePass.getWidth();
    height = this._compositePass.getHeight();
  } else {
    width = height = 0;
  }
  this._glowHighlightNeedsRebuild = false;

  if (!needsGlowHighlight || width == null || width <= 0 || height == null || height <= 0) {
    this.releaseGlowHighlightPasses();
  } else {
    // calculate size
    const padding = Math.ceil(node.glowPadding * 0.5) * 2.0;
    this._glowPadded = padding != 0;
    this._glowWidth = width + padding;
    this._glowHeight = height + padding;

    // glow matrices
    this._glowMVMatrix = cc.kmMat4Identity(new cc.kmMat4());
    this._glowPaddingMatrix = cc.kmMat4Translation(new cc.kmMat4(), -padding * 0.5, -padding * 0.5, 0);
    // glow pass matrix needs to offset for padding
    // glow pass matrix needs to scale the drawing down for the difference between the composite size and glow size
    this._glowPassMatrix = cc.kmMat4Translation(new cc.kmMat4(), padding * 0.5, padding * 0.5, 0);
    this._glowPassMatrix.mat[0] = width / this._glowWidth;
    this._glowPassMatrix.mat[5] = height / this._glowHeight;

    // render passes
    if (this._glowHighlightCompositePass != null) {
      this._glowHighlightCompositePass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._glowWidth, this._glowHeight, 1.0, true);
    } else {
      this._glowHighlightCompositePass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._glowWidth, this._glowHeight, 1.0, true);
    }
    if (this._blurAPass != null) {
      this._blurAPass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._glowWidth, this._glowHeight, 1.0, true);
    } else {
      this._blurAPass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._glowWidth, this._glowHeight, 1.0, true);
    }
    if (this._blurBPass != null) {
      this._blurBPass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._glowWidth, this._glowHeight, 1.0, true);
    } else {
      this._blurBPass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._glowWidth, this._glowHeight, 1.0, true);
    }
  }
};
proto.releasePasses = function () {
  BaseSprite.WebGLRenderCmd.prototype.releasePasses.call(this);
  this.releaseGlowHighlightPasses();
};
proto.releaseGlowHighlightPasses = function () {
  if (this._glowHighlightCompositePass) {
    this._glowHighlightCompositePass.release();
    this._glowHighlightCompositePass = null;
  }
  if (this._blurAPass) {
    this._blurAPass.release();
    this._blurAPass = null;
  }
  if (this._blurBPass) {
    this._blurBPass.release();
    this._blurBPass = null;
  }
  this._glowPadded = false;
  this._glowWidth = this._glowHeight = 0;
};

proto.rebuild = function () {
  BaseSprite.WebGLRenderCmd.prototype.rebuild.call(this);

  const needsGlowHighlight = this.getNeedsGlowHighlight();
  const isGlowingHighlighting = this.getIsGlowingHighlighting();

  // rebuild glow highlight as needed
  if (this._glowHighlightNeedsRebuild || (needsGlowHighlight && !isGlowingHighlighting) || (!needsGlowHighlight && isGlowingHighlighting)) {
    this.rebuildGlowHighlightPasses();
  }
};

proto.drawCompositeVerticalBeforePasses = function () {
  const node = this._node;

  BaseSprite.WebGLRenderCmd.prototype.drawCompositeVerticalBeforePasses.call(this);

  // draw glow before
  // TODO: convert to CompositeVerticalBeforePass
  if (node.getGlowing()) {
    this.drawGlow();
  }
};

proto.drawCompositeVerticalAfterPasses = function () {
  const node = this._node;
  const gl = cc._renderContext;

  BaseSprite.WebGLRenderCmd.prototype.drawCompositeVerticalAfterPasses.call(this);

  // draw prismatic effect after
  // TODO: convert to CompositeVerticalAfterPass
  if (node.getIsPrismatic()) {
    this.drawPrismatic();
  }

  // draw highlight after
  // TODO: convert to CompositeVerticalAfterPass
  if (node.getHighlighted()) {
    this.drawHighlight();
  }
};

proto.drawGlow = function () {
  if (this.getIsGlowingHighlighting()) {
    const node = this._node;
    const gl = cc._renderContext;

    // instead of applying the padding matrix on top of the stack
    // we'll merge it and use it as the model view for drawing that needs to account for padding
    cc.kmMat4Multiply(this._glowMVMatrix, this._stackMatrix, this._glowPaddingMatrix);

    // begin with a single reset clear to set the drawing to the passes space
    this._glowHighlightCompositePass.beginWithResetClear(this._renderPassStackId);

    if (this._glowPadded) {
      cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
      cc.current_stack.stack.push(cc.current_stack.top);
      cc.current_stack.top = this._glowPassMatrix;
    }

    const glowProgram = cc.shaderCache.programForKey('Glow');
    glowProgram.use();
    glowProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
    glowProgram.setUniformLocationWith2f(glowProgram.loc_size, this._glowWidth, this._glowHeight);
    glowProgram.setUniformLocationWith4f(glowProgram.loc_color, node.glowColorTo.r / 255, node.glowColorTo.g / 255, node.glowColorTo.b / 255, node.glowColorTo.a / 255);
    glowProgram.setUniformLocationWith1f(glowProgram.loc_time, node.getFX().getLoopingTimeForFrequency(node.glowFrequency));
    glowProgram.setUniformLocationWith1f(glowProgram.loc_pulseMax, node.glowMaxAlpha / 255.0);
    glowProgram.setUniformLocationWith1f(glowProgram.loc_pulseMin, node.glowMinAlpha / 255.0);
    glowProgram.setUniformLocationWith1f(glowProgram.loc_thickness, node.glowThickness);
    cc.glBlendFunc(gl.ONE, gl.ZERO);
    cc.glBindTexture2DN(0, this._compositePass.getTexture());
    this._glowHighlightCompositePass.render();

    if (this._glowPadded) {
      cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
      cc.kmGLPopMatrix();
    }

    // blur
    let blurProgram;
    if (node.glowBlurStrength === 'strong') {
      blurProgram = cc.shaderCache.programForKey('BlurStrong');
    } else if (node.glowBlurStrength === 'medium') {
      blurProgram = cc.shaderCache.programForKey('BlurMedium');
    } else {
      blurProgram = cc.shaderCache.programForKey('BlurWeak');
    }

    // blur: horizontal pass
    // begin redirecting to the blur pass, but don't reset or clear
    this._blurBPass.beginWithResetClear(this._renderPassStackId);
    blurProgram.use();
    blurProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
    blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 1.0 / this._glowHighlightCompositePass.getWidth());
    blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 0.0);
    cc.glBlendFunc(gl.ONE, gl.ZERO);
    cc.glBindTexture2DN(0, this._glowHighlightCompositePass.getTexture());
    this._blurBPass.render();
    this._blurBPass.endWithReset(this._renderPassStackId);

    // blur: vertical pass
    // begin redirecting to the blur pass, but don't reset or clear
    this._blurAPass.beginWithResetClear(this._renderPassStackId);
    blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 0.0);
    blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 1.0 / (this._blurBPass.getHeight() * this._blurBPass.getScale()));
    cc.glBlendFunc(gl.ONE, gl.ZERO);
    cc.glBindTexture2DN(0, this._blurBPass.getTexture());

    this._blurAPass.render();
    this._blurAPass.endWithReset(this._renderPassStackId);

    // end with reset to set drawing space back to screen space
    this._glowHighlightCompositePass.endWithReset(this._renderPassStackId);

    // draw composited glow with noise
    const glowNoiseProgram = cc.shaderCache.programForKey('GlowNoise');
    glowNoiseProgram.use();
    if (RenderPass.is_rendering_reset_for_stack(this._renderPassStackId)) {
      glowNoiseProgram._setUniformForMVPMatrixWithMat4(this._glowPaddingMatrix);
    } else {
      glowNoiseProgram._setUniformForMVPMatrixWithMat4(this._glowMVMatrix);
    }
    glowNoiseProgram.setUniformLocationWith4f(glowNoiseProgram.loc_color, (node.glowNoiseColor.r - node.glowColorTo.r) / 255, (node.glowNoiseColor.g - node.glowColorTo.g) / 255, (node.glowNoiseColor.b - node.glowColorTo.b) / 255, node.glowNoiseColor.a / 255);
    glowNoiseProgram.setUniformLocationWith4f(glowNoiseProgram.loc_rampFrom, node.glowRampFrom.r / 255, node.glowRampFrom.g / 255, node.glowRampFrom.b / 255, node.glowRampFrom.a / 255);
    glowNoiseProgram.setUniformLocationWith4f(glowNoiseProgram.loc_rampTransition, node.glowRampTransition.r / 255, node.glowRampTransition.g / 255, node.glowRampTransition.b / 255, node.glowRampTransition.a / 255);
    glowNoiseProgram.setUniformLocationWith1f(glowNoiseProgram.loc_time, node.getFX().getTime() * 0.05);
    glowNoiseProgram.setUniformLocationWith1f(glowNoiseProgram.loc_expandModifier, node.glowNoiseExpandModifier);
    glowNoiseProgram.setUniformLocationWith1f(glowNoiseProgram.loc_verticalFadeFromTop, node.glowVerticalFadeFromTop);
    glowNoiseProgram.setUniformLocationWith1f(glowNoiseProgram.loc_verticalFadeSpeed, node.glowVerticalFadeSpeed);
    cc.glBindTexture2DN(0, this._blurAPass.getTexture());
    cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Emil: ADDITIVE GLOW SHOULD USE cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE)
    this._glowHighlightCompositePass.render();
  }
};

proto.drawHighlight = function () {
  if (this.getIsGlowingHighlighting()) {
    const node = this._node;
    const gl = cc._renderContext;

    // instead of applying the padding matrix on top of the stack
    // we'll merge it and use it as the model view for drawing that needs to account for padding
    cc.kmMat4Multiply(this._glowMVMatrix, this._stackMatrix, this._glowPaddingMatrix);

    // begin with a single reset clear to set the drawing to the passes space
    this._glowHighlightCompositePass.beginWithResetClear(this._renderPassStackId);

    if (this._glowPadded) {
      cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
      cc.current_stack.stack.push(cc.current_stack.top);
      cc.current_stack.top = this._glowPassMatrix;
    }

    // draw highlight
    const highlightProgram = cc.shaderCache.programForKey('Highlight');
    highlightProgram.use();
    highlightProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
    highlightProgram.setUniformLocationWith4f(highlightProgram.loc_color, node.highlightColor.r / 255, node.highlightColor.g / 255, node.highlightColor.b / 255, node.highlightColor.a / 255);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_time, node.getFX().getLoopingTimeForFrequency(node.highlightFrequency));
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_pulseMax, node.highlightMaxAlpha / 255.0);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_pulseMin, node.highlightMinAlpha / 255.0);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_brightness, node.highlightBrightness);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_threshold, node.highlightThreshold);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_intensity, node.highlightIntensity);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_verticalFadeFromTop, node.highlightVerticalFadeFromTop);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_verticalFadeSpeed, node.highlightVerticalFadeSpeed);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_inBlack, node.highlightLevelsInBlack / 255.0);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_inWhite, node.highlightLevelsInWhite / 255.0);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_inGamma, node.highlightLevelsInGamma);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_outBlack, node.highlightLevelsOutBlack / 255.0);
    highlightProgram.setUniformLocationWith1f(highlightProgram.loc_outWhite, node.highlightLevelsOutWhite / 255.0);
    cc.glBlendFunc(gl.ONE, gl.ZERO);
    cc.glBindTexture2DN(0, this._compositePass.getTexture());
    this._glowHighlightCompositePass.render();

    if (this._glowPadded) {
      cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
      cc.kmGLPopMatrix();
    }

    // blur
    let blurProgram;
    if (node.highlightBlurStrength === 'strong') {
      blurProgram = cc.shaderCache.programForKey('BlurStrong');
    } else if (node.highlightBlurStrength === 'medium') {
      blurProgram = cc.shaderCache.programForKey('BlurMedium');
    } else {
      blurProgram = cc.shaderCache.programForKey('BlurWeak');
    }

    // blur: horizontal pass
    // begin redirecting to the blur pass, but don't reset or clear
    this._blurAPass.beginWithResetClear(this._renderPassStackId);
    blurProgram.use();
    blurProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
    blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 1.0 / this._glowHighlightCompositePass.getWidth());
    blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 0.0);
    cc.glBlendFunc(gl.ONE, gl.ZERO);
    cc.glBindTexture2DN(0, this._glowHighlightCompositePass.getTexture());
    this._blurAPass.render();
    this._blurAPass.endWithReset(this._renderPassStackId);

    // end with reset to set drawing space back to screen space
    this._glowHighlightCompositePass.endWithReset(this._renderPassStackId);

    // blur: vertical pass
    if (RenderPass.is_rendering_reset_for_stack(this._renderPassStackId)) {
      blurProgram._setUniformForMVPMatrixWithMat4(this._glowPaddingMatrix);
    } else {
      blurProgram._setUniformForMVPMatrixWithMat4(this._glowMVMatrix);
    }
    blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 0.0);
    blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 1.0 / (this._blurAPass.getHeight() * this._blurAPass.getScale()));
    cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE);
    cc.glBindTexture2DN(0, this._blurAPass.getTexture());
    this._blurBPass.render();
  }
};

proto.drawPrismatic = function () {
  const node = this._node;
  const gl = cc._renderContext;

  const chromaticProgram = cc.shaderCache.programForKey('Chromatic');
  chromaticProgram.use();
  this.setDefaultMatricesForDraw(chromaticProgram, node);
  chromaticProgram.setUniformLocationWith1f(chromaticProgram.loc_time, node.getFX().getTime() * node.getPrismaticSpeed());
  chromaticProgram.setUniformLocationWith1f(chromaticProgram.loc_frequency, node.getPrismaticFrequency());
  chromaticProgram.setUniformLocationWith1f(chromaticProgram.loc_amplitude, node.getPrismaticAmplitude());
  chromaticProgram.setUniformLocationWith1f(chromaticProgram.loc_smoothstepMin, node.getPrismaticSmoothstepMin());
  chromaticProgram.setUniformLocationWith1f(chromaticProgram.loc_smoothstepMax, node.getPrismaticSmoothstepMax());
  cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // uncomment if using noise map based chromatic shader
  // cc.glBindTexture2DN(1, cc.textureCache.getTextureForKey(RSX.noise.img));
  if (this.getIsCompositing()) {
    chromaticProgram.setUniformLocationWith2f(chromaticProgram.loc_aberrationScale, 1.0, 1.0);
    cc.glBindTexture2DN(0, this._compositePass.getTexture());
    this._compositePass.render();
  } else {
    chromaticProgram.setUniformLocationWith2f(chromaticProgram.loc_aberrationScale, node._rect.width / node._texture._contentSize.width, node._rect.height / node._texture._contentSize.height);
    cc.glBindTexture2DN(0, node._texture);

    // bind quad buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
    if (this._quadDirty) {
      this._quadDirty = false;
      gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
    }

    // vertex attributes
    cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

    // draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
};

GlowSprite.create = function (options, sprite) {
  return BaseSprite.create(options, sprite || new GlowSprite(options));
};

module.exports = GlowSprite;
