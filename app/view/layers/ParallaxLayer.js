var EVENTS = require("app/common/event_types");
var UtilsEngine = require("app/common/utils/utils_engine");
var BaseLayer = require("./BaseLayer");
var ParallaxNode = require("./../nodes/ParallaxNode");

/****************************************************************************
 ParallaxLayer
 ****************************************************************************/

var ParallaxLayer = BaseLayer.extend({

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

	ctor:function () {
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
	setParallaxScale: function (parallaxScale) {
		this.parallaxScale = parallaxScale;
		this.forceParallaxUpdate();
	},
	setParallaxSlop: function (parallaxSlop) {
		this.parallaxSlop = parallaxSlop;
		this.forceParallaxUpdate();
	},
	getParallaxScale: function () {
		return this.parallaxScale * (1.0 + this.parallaxSlop);
	},

	addOrUpdateParallaxedNode: function (node, zOrder, ratio, offset) {
		if (node.getParent() != this.parallaxNode) {
			this.parallaxNode.addChild(node, zOrder, ratio, offset);
		} else {
			this.parallaxNode.setChildParallaxRatioAndOffset(node, ratio, offset);
		}
	},

	resetParallax: function () {
		this.parallaxPosition.x = this.parallaxTargetPosition.x;
		this.parallaxPosition.y = this.parallaxTargetPosition.y;
		this.forceParallaxUpdate();
	},
	forceParallaxUpdate: function () {
		this.parallaxNode._lastPosition.x = this.parallaxNode._lastPosition.y = -100;
		this._dirtyParallax = true;
	},

	onEnter:function () {
		this._super();
		this.resetParallax();
		this.scheduleUpdate();
	},

	onExit:function () {
		this.unscheduleUpdate();
		this._super();
	},

	onResize:function () {
		this._super();

		this.forceParallaxUpdate();
	},

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
		}
	},

	onPointerMove:function(event){
		var location = event && event.getLocation();
		var mx = location.x;
		var my = location.y;
		var position = UtilsEngine.getNodeScreenPosition(this);
		this.parallaxTargetPosition.x = -Math.round(mx - position.x);
		this.parallaxTargetPosition.y = -Math.round(my - position.y);
		this._dirtyParallax = true;
	},

	update: function () {
		if(this._dirtyParallax && !this.getFX().getIsBlurringScreen()) {
			// lerp parallax position
			var lerp = this.parallaxLerp;

			// find difference
			var dx = this.parallaxTargetPosition.x - this.parallaxPosition.x;
			var dy = this.parallaxTargetPosition.y - this.parallaxPosition.y;

			// ramp up
			this.parallaxRamp.x += (dx - this.parallaxRamp.x) * lerp;
			this.parallaxRamp.y += (dy - this.parallaxRamp.y) * lerp;
			var rx = this.parallaxRamp.x * lerp;
			var ry = this.parallaxRamp.y * lerp;
			var rampDecay = this.parallaxRampDecay;
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
			var children = this.getChildren();
			for(var i = 0, il = children.length; i < il; i++) {
				var child = children[i];

				if (child instanceof cc.ParallaxNode) {
					child.setPosition(this.parallaxPosition.x, this.parallaxPosition.y);
				}
			}

			if(this.parallaxPosition.x === this.parallaxTargetPosition.x && this.parallaxPosition.y === this.parallaxTargetPosition.y) {
				this._dirtyParallax = false;
			}
		}
	}
});

ParallaxLayer.create = function(layer) {
	return BaseLayer.create(layer || new ParallaxLayer());
};

module.exports = ParallaxLayer;
