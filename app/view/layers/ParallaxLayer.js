const EVENTS = require('app/common/event_types');
const UtilsEngine = require('app/common/utils/utils_engine');
const BaseLayer = require('./BaseLayer');
const ParallaxNode = require('../nodes/ParallaxNode');

/** **************************************************************************
 ParallaxLayer
 *************************************************************************** */

const ParallaxLayer = BaseLayer.extend({

  // base scale should be set manually
  // usually based on the background size vs window size
  parallaxScale: 1.0,
  // multiplied to base scale as 1.0 + slop
  parallaxSlop: 0.05,
  // speed of parallax to move with mouse
  parallaxLerp: 0.075,
  // decay rate of ramp up speed
  parallaxRampDecay: 0.95,

  parallaxPosition: null,
  parallaxTargetPosition: null,
  parallaxRamp: null,
  parallaxNode: null,
  _dirtyParallax: true,

  ctor() {
    // initialize properties that may be required in init
    this.parallaxPosition = cc.p();
    this.parallaxTargetPosition = cc.p();
    this.parallaxRamp = cc.p();
    this.parallaxNode = ParallaxNode.create();

    // do super ctor
    this._super();

    this.addChild(this.parallaxNode);

    this.resetParallax();
  },
  setParallaxScale(parallaxScale) {
    this.parallaxScale = parallaxScale;
    this.forceParallaxUpdate();
  },
  setParallaxSlop(parallaxSlop) {
    this.parallaxSlop = parallaxSlop;
    this.forceParallaxUpdate();
  },
  getParallaxScale() {
    return this.parallaxScale * (1.0 + this.parallaxSlop);
  },

  addOrUpdateParallaxedNode(node, zOrder, ratio, offset) {
    if (node.getParent() != this.parallaxNode) {
      this.parallaxNode.addChild(node, zOrder, ratio, offset);
    } else {
      this.parallaxNode.setChildParallaxRatioAndOffset(node, ratio, offset);
    }
  },

  resetParallax() {
    this.parallaxPosition.x = this.parallaxTargetPosition.x;
    this.parallaxPosition.y = this.parallaxTargetPosition.y;
    this.forceParallaxUpdate();
  },
  forceParallaxUpdate() {
    this.parallaxNode._lastPosition.x = this.parallaxNode._lastPosition.y = -100;
    this._dirtyParallax = true;
  },

  onEnter() {
    this._super();
    this.resetParallax();
    this.scheduleUpdate();
  },

  onExit() {
    this.unscheduleUpdate();
    this._super();
  },

  onResize() {
    this._super();

    this.forceParallaxUpdate();
  },

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
    }
  },

  onPointerMove(event) {
    const location = event && event.getLocation();
    const mx = location.x;
    const my = location.y;
    const position = UtilsEngine.getNodeScreenPosition(this);
    this.parallaxTargetPosition.x = -Math.round(mx - position.x);
    this.parallaxTargetPosition.y = -Math.round(my - position.y);
    this._dirtyParallax = true;
  },

  update() {
    if (this._dirtyParallax && !this.getFX().getIsBlurringScreen()) {
      // lerp parallax position
      const lerp = this.parallaxLerp;

      // find difference
      const dx = this.parallaxTargetPosition.x - this.parallaxPosition.x;
      const dy = this.parallaxTargetPosition.y - this.parallaxPosition.y;

      // ramp up
      this.parallaxRamp.x += (dx - this.parallaxRamp.x) * lerp;
      this.parallaxRamp.y += (dy - this.parallaxRamp.y) * lerp;
      const rx = this.parallaxRamp.x * lerp;
      const ry = this.parallaxRamp.y * lerp;
      const rampDecay = this.parallaxRampDecay;
      this.parallaxRamp.x *= rampDecay;
      this.parallaxRamp.y *= rampDecay;

      // lerp to
      if (Math.abs(rx) > lerp * 2.0) {
        this.parallaxPosition.x += rx;
      }
      if (Math.abs(ry) > lerp * 2.0) {
        this.parallaxPosition.y += ry;
      }

      // move parallax children
      const children = this.getChildren();
      for (let i = 0, il = children.length; i < il; i++) {
        const child = children[i];

        if (child instanceof cc.ParallaxNode) {
          child.setPosition(this.parallaxPosition.x, this.parallaxPosition.y);
        }
      }

      if (this.parallaxPosition.x === this.parallaxTargetPosition.x && this.parallaxPosition.y === this.parallaxTargetPosition.y) {
        this._dirtyParallax = false;
      }
    }
  },
});

ParallaxLayer.create = function (layer) {
  return BaseLayer.create(layer || new ParallaxLayer());
};

module.exports = ParallaxLayer;
