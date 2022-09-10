// pragma PKGS: world_map
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const EVENTS = require('app/common/event_types');
const UtilsEngine = require('../../../common/utils/utils_engine');
const FXCompositeLayer = require('../FXCompositeLayer');
const BaseSprite = require('../../nodes/BaseSprite');

/** **************************************************************************
 WorldMapLayer
 *************************************************************************** */

const WorldMapLayer = FXCompositeLayer.extend({

  _scrollAcceleration: null,
  _scrollEasing: null,
  _scrollOffset: null,
  _scrollVelocity: null,
  _scrollVelocityEdge: null,
  _scrollRatio: null,
  _scrollSize: null,
  _pointerDown: false,
  _pointerDownAt: 0,
  _pointerDownPosition: null,
  _pointerDragging: false,
  _pointerPosition: null,

  _bg: null,

  // decay rate of ramp up speed
  velocityDecay: 0.6,
  // speed of scroll by pointer wheel
  pointerWheelSpeed: 1.0,
  // minimum distance from edges to start slowing down scroll
  edgeDistance: 320.0,
  // ideal distance as a percentage from edges of total scroll range to start slowing down scroll
  edgeDistancePct: 0.25,
  // speed of scroll acceleration
  accelerationSpeed: 1.5,

  /* region INITIALIZE */

  ctor() {
    this._scrollAcceleration = cc.p();
    this._scrollEasing = { x: false, y: false };
    this._scrollOffset = cc.p();
    this._scrollVelocity = cc.p();
    this._scrollVelocityEdge = cc.p();
    this._scrollRatio = cc.p();
    this._scrollSize = cc.size();
    this._pointerDownPosition = cc.p();
    this._pointerPosition = cc.p();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // scene elements
      this._bg = BaseSprite.create(RSX.world_map.img);

      // setup scene
      this.getFXLayer().addChild(this._bg);
    });

    // do super ctor
    this._super();
  },

  getRequiredResources() {
    return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('world_map'));
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    const previousContentSize = this.getContentSize();

    this._super();

    const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

    // set self to middle of screen
    this.setPosition(winCenterPosition);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      const globalScaleInvertedWinSize = UtilsEngine.getGSIWinSize();

      // update scroll size based on background
      const scale = UtilsEngine.getWindowSizeRelativeNodeScale(this._bg) * 1.5;
      this._bg.setScale(scale);
      const bgWidth = this._bg._contentSize.width * scale;
      const bgHeight = this._bg._contentSize.height * scale;
      this._scrollSize = cc.size(bgWidth - globalScaleInvertedWinSize.width, bgHeight - globalScaleInvertedWinSize.height);

      // get content size scale
      const widthScale = previousContentSize.width > 0 ? globalScaleInvertedWinSize.width / previousContentSize.width : 1.0;
      const heightScale = previousContentSize.height > 0 ? globalScaleInvertedWinSize.height / previousContentSize.height : 1.0;

      // update scroll ratio
      this._scrollRatio.x *= widthScale;
      this._scrollRatio.y *= heightScale;

      // reset accel and velocity
      this._scrollAcceleration.x = this._scrollAcceleration.y = 0.0;
      this._scrollVelocity.x = this._scrollVelocity.y = 0.0;

      this._updateChildPositions();
    });
  },

  _updateChildPositions() {
    const scrollWidth = this._scrollSize.width * 0.5;
    const scrollHeight = this._scrollSize.height * 0.5;
    const children = this.getChildren();
    for (let i = 0, il = children.length; i < il; i++) {
      const child = children[i];
      child.setPosition(scrollWidth * this._scrollRatio.x, scrollHeight * this._scrollRatio.y);
    }
  },

  /* endregion LAYOUT */

  /* region EVENTS */

  onEnter() {
    this._super();
    this.scheduleUpdate();
  },

  onExit() {
    this.unscheduleUpdate();
    this._super();
  },

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().on(EVENTS.pointer_down, this.onPointerDown, this);
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
      scene.getEventBus().on(EVENTS.pointer_wheel, this.onPointerWheel, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().off(EVENTS.pointer_down, this.onPointerDown, this);
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
      scene.getEventBus().off(EVENTS.pointer_wheel, this.onPointerWheel, this);
    }
  },

  onPointerMove(event) {
    if (event != null && !event.isStopped) {
      const location = event.getLocation();
      const { x } = location;
      const { y } = location;

      if (this._pointerDown) {
        if (this._pointerDragging) {
          this._scrollVelocity.x += -(x - this._pointerPosition.x) * this.accelerationSpeed;
          this._scrollVelocity.y += -(y - this._pointerPosition.y) * this.accelerationSpeed;
          this._scrollAcceleration.x = this._scrollAcceleration.y = 0;
        } else if (Date.now() - CONFIG.DRAGGING_DELAY * 1000.0 >= this._pointerDownAt) {
          const dx = x - this._pointerDownPosition.x;
          const dy = y - this._pointerDownPosition.y;
          if (Math.sqrt(dx * dx + dy * dy) >= CONFIG.DRAGGING_DISTANCE) {
            this._pointerDragging = true;
          }
        }
      }

      this._pointerPosition.x = x;
      this._pointerPosition.y = y;
    }
  },

  onPointerDown(event) {
    if (event != null && !event.isStopped) {
      const location = event.getLocation();
      this._pointerDown = true;
      this._pointerDownAt = Date.now();
      this._pointerDownPosition.x = location.x;
      this._pointerDownPosition.y = location.y;
    }
  },

  onPointerUp(event) {
    this._pointerDown = false;
    this._pointerDragging = false;
    this._scrollAcceleration.x = this._scrollAcceleration.y = 0;
  },

  onPointerWheel(event) {
    if (event != null && !event.isStopped) {
      const speed = this.pointerWheelSpeed;
      const vx = event.getWheelDeltaX() * speed;
      const vy = event.getWheelDeltaY() * speed;
      this._scrollVelocity.x = vx;
      this._scrollVelocity.y = -vy;
      this._scrollAcceleration.x = this._scrollAcceleration.y = 0.0;
    }
  },

  update() {
    if (!this.getFX().getIsBlurringScreen()) {
      const contentSize = this._contentSize;

      // update x/y axis
      this._updateScrollRatioForAxis('x', contentSize.width);
      this._updateScrollRatioForAxis('y', contentSize.height);

      // reposition children
      this._updateChildPositions();
    }
  },

  _updateScrollRatioForAxis(axisKey, axisSize) {
    // update velocity
    this._scrollVelocity[axisKey] += this._scrollAcceleration[axisKey];

    // ease velocity as scroll approaches edges
    const edgeModifier = Math.min(1.0, (1.0 + Math.abs(this._scrollVelocity[axisKey] / (this.accelerationSpeed * 3.0)) ** 1.5) ** 2.0 - 1.0);
    const edgeDist = Math.max(this.edgeDistance, axisSize * this.edgeDistancePct) * edgeModifier;
    if (this._scrollAcceleration[axisKey] < 0 && this._scrollOffset[axisKey] < -axisSize + edgeDist) {
      if (!this._scrollEasing[axisKey]) {
        this._scrollEasing[axisKey] = true;
        this._scrollVelocityEdge[axisKey] = this._scrollVelocity[axisKey];
      }
      var easeVal = (this._scrollOffset[axisKey] + axisSize) / edgeDist;
      this._scrollVelocity[axisKey] = this._scrollVelocityEdge[axisKey] * (easeVal * (2.0 - easeVal));
    } else if (this._scrollAcceleration[axisKey] > 0 && this._scrollOffset[axisKey] > axisSize - edgeDist) {
      if (!this._scrollEasing[axisKey]) {
        this._scrollEasing[axisKey] = true;
        this._scrollVelocityEdge[axisKey] = this._scrollVelocity[axisKey];
      }
      var easeVal = (this._scrollOffset[axisKey] - axisSize) / -edgeDist;
      this._scrollVelocity[axisKey] = this._scrollVelocityEdge[axisKey] * (easeVal * (2.0 - easeVal));
    } else {
      this._scrollEasing[axisKey] = false;
    }

    // update offset
    this._scrollOffset[axisKey] = Math.max(-axisSize, Math.min(axisSize, this._scrollOffset[axisKey] + this._scrollVelocity[axisKey]));

    // decay velocity
    this._scrollVelocity[axisKey] *= this.velocityDecay;

    // set final sliding val
    this._scrollRatio[axisKey] = -this._scrollOffset[axisKey] / axisSize;
  },

  /* endregion EVENTS */

});

WorldMapLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new WorldMapLayer());
};

module.exports = WorldMapLayer;
