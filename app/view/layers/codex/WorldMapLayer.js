//pragma PKGS: world_map
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var EVENTS = require('app/common/event_types');
var UtilsEngine = require("./../../../common/utils/utils_engine");
var FXCompositeLayer = require("./../FXCompositeLayer");
var BaseSprite = require("./../../nodes/BaseSprite");

/****************************************************************************
 WorldMapLayer
 ****************************************************************************/

var WorldMapLayer = FXCompositeLayer.extend({

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

	ctor:function () {
		this._scrollAcceleration = cc.p();
		this._scrollEasing = {x: false, y: false};
		this._scrollOffset = cc.p();
		this._scrollVelocity = cc.p();
		this._scrollVelocityEdge = cc.p();
		this._scrollRatio = cc.p();
		this._scrollSize = cc.size();
		this._pointerDownPosition = cc.p();
		this._pointerPosition = cc.p();

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// scene elements
			this._bg = BaseSprite.create(RSX.world_map.img);

			// setup scene
			this.getFXLayer().addChild(this._bg);
		}.bind(this));

		// do super ctor
		this._super();
	},

	getRequiredResources: function () {
		return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("world_map"));
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		var previousContentSize = this.getContentSize();

		this._super();

		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

		// set self to middle of screen
		this.setPosition(winCenterPosition);

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			var globalScaleInvertedWinSize = UtilsEngine.getGSIWinSize();

			// update scroll size based on background
			var scale = UtilsEngine.getWindowSizeRelativeNodeScale(this._bg) * 1.5;
			this._bg.setScale(scale);
			var bgWidth = this._bg._contentSize.width * scale;
			var bgHeight = this._bg._contentSize.height * scale;
			this._scrollSize = cc.size(bgWidth - globalScaleInvertedWinSize.width, bgHeight - globalScaleInvertedWinSize.height);

			// get content size scale
			var widthScale = previousContentSize.width > 0 ? globalScaleInvertedWinSize.width / previousContentSize.width : 1.0;
			var heightScale = previousContentSize.height > 0 ? globalScaleInvertedWinSize.height / previousContentSize.height : 1.0;

			// update scroll ratio
			this._scrollRatio.x *= widthScale;
			this._scrollRatio.y *= heightScale;

			// reset accel and velocity
			this._scrollAcceleration.x = this._scrollAcceleration.y = 0.0;
			this._scrollVelocity.x = this._scrollVelocity.y = 0.0;

			this._updateChildPositions();
		}.bind(this));
	},

	_updateChildPositions: function () {
		var scrollWidth = this._scrollSize.width * 0.5;
		var scrollHeight = this._scrollSize.height * 0.5;
		var children = this.getChildren();
		for(var i = 0, il = children.length; i < il; i++) {
			var child = children[i];
			child.setPosition(scrollWidth * this._scrollRatio.x, scrollHeight * this._scrollRatio.y);
		}
	},

	/* endregion LAYOUT */

	/* region EVENTS */

	onEnter:function () {
		this._super();
		this.scheduleUpdate();
	},

	onExit:function () {
		this.unscheduleUpdate();
		this._super();
	},

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().on(EVENTS.pointer_down, this.onPointerDown, this);
			scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
			scene.getEventBus().on(EVENTS.pointer_wheel, this.onPointerWheel, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().off(EVENTS.pointer_down, this.onPointerDown, this);
			scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
			scene.getEventBus().off(EVENTS.pointer_wheel, this.onPointerWheel, this);
		}
	},

	onPointerMove:function(event){
		if (event != null && !event.isStopped) {
			var location = event.getLocation();
			var x = location.x;
			var y = location.y;

			if (this._pointerDown) {
				if (this._pointerDragging) {
					this._scrollVelocity.x += -(x - this._pointerPosition.x) * this.accelerationSpeed;
					this._scrollVelocity.y += -(y - this._pointerPosition.y) * this.accelerationSpeed;
					this._scrollAcceleration.x = this._scrollAcceleration.y = 0;
				} else if (Date.now() - CONFIG.DRAGGING_DELAY * 1000.0 >= this._pointerDownAt) {
					var dx = x - this._pointerDownPosition.x;
					var dy = y - this._pointerDownPosition.y;
					if (Math.sqrt(dx * dx + dy * dy) >= CONFIG.DRAGGING_DISTANCE) {
						this._pointerDragging = true;
					}
				}
			}

			this._pointerPosition.x = x;
			this._pointerPosition.y = y;
		}
	},

	onPointerDown:function(event){
		if (event != null && !event.isStopped) {
			var location = event.getLocation();
			this._pointerDown = true;
			this._pointerDownAt = Date.now();
			this._pointerDownPosition.x = location.x;
			this._pointerDownPosition.y = location.y;
		}
	},

	onPointerUp:function(event){
		this._pointerDown = false;
		this._pointerDragging = false;
		this._scrollAcceleration.x = this._scrollAcceleration.y = 0;
	},

	onPointerWheel:function(event){
		if (event != null && !event.isStopped) {
			var speed = this.pointerWheelSpeed;
			var vx = event.getWheelDeltaX() * speed;
			var vy = event.getWheelDeltaY() * speed;
			this._scrollVelocity.x = vx;
			this._scrollVelocity.y = -vy;
			this._scrollAcceleration.x = this._scrollAcceleration.y = 0.0;
		}
	},

	update: function () {
		if(!this.getFX().getIsBlurringScreen()) {
			var contentSize = this._contentSize;

			// update x/y axis
			this._updateScrollRatioForAxis("x", contentSize.width);
			this._updateScrollRatioForAxis("y", contentSize.height);

			// reposition children
			this._updateChildPositions();
		}
	},

	_updateScrollRatioForAxis: function (axisKey, axisSize) {
		// update velocity
		this._scrollVelocity[axisKey] += this._scrollAcceleration[axisKey];

		// ease velocity as scroll approaches edges
		var edgeModifier = Math.min(1.0, Math.pow(1.0 + Math.pow(Math.abs(this._scrollVelocity[axisKey] / (this.accelerationSpeed * 3.0)), 1.5), 2.0) - 1.0);
		var edgeDist = Math.max(this.edgeDistance, axisSize * this.edgeDistancePct) * edgeModifier;
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
	}

	/* endregion EVENTS */

});

WorldMapLayer.create = function(layer) {
	return FXCompositeLayer.create(layer || new WorldMapLayer());
};

module.exports = WorldMapLayer;
