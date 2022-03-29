//pragma PKGS: motion_streak

var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var _ = require("underscore");

var MotionStreakRingNode = cc.Node.extend({

	_guideNodes:null,
	_radius:100.0,
	_speed:900.0,
	_spreadFactor:2.5,
	_streakCount:8,
	_streakNodes:null,

	ctor: function (options) {
		// setup properties that may be required during initialization
		this._streakNodes = [];
		this._guideNodes = [];

		this._super(options);

		this.setOptions(options);

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

			for (var i=0; i<this._streakCount; i++) {
				var node = new cc.Node();
				var streak = new cc.MotionStreak(0.35, 4, 20, cc.color(255,255,255), RSX.motion_streak.img);

				this.addChild(streak);
				this._streakNodes.push(streak);

				this.addChild(node);
				this._guideNodes.push(node);
				node.setOpacity(0);
				streak.setOpacity(0);
				streak.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
			}
		}.bind(this));
	},

	setOptions: function (options) {
		this._super(options);

		if (_.isObject(options)) {
			if (options.radius != null) { this.setRadius(options.radius); }
			if (options.speed != null) { this.setSpeed(options.speed); }
			if (options.spreadFactor != null) { this.setSpreadFactor(options.spreadFactor); }
			if (options.streakCount != null) { this.setStreakCount(options.streakCount); }
		}
	},

	setRadius: function (val) {
		this._radius = val;
	},
	getRadius: function () {
		return this._radius;
	},

	setSpeed: function (val) {
		this._speed = val;
	},
	getSpeed: function () {
		return this._speed;
	},

	setSpreadFactor: function (val) {
		this._spreadFactor = val;
	},
	getSpreadFactor: function () {
		return this._spreadFactor;
	},

	setStreakCount: function (val) {
		this._streakCount = val;
	},
	getStreakCount: function () {
		return this._streakCount;
	},

	getRequiredResources: function () {
		return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("motion_streak"));
	},

	onEnter: function () {
		cc.Node.prototype.onEnter.call(this);

		this.scheduleUpdate();
	},

	animate: function() {
		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

			var p1 = cc.p(-this._radius,0);
			var p2 = cc.p(0,this._radius);
			var p3 = cc.p(this._radius,0);
			var p4 = cc.p(0,-this._radius);

			var ringPoints = [p1,p2,p3,p4];

			for (var i=0; i<this._guideNodes.length; i++) {
				var destinationPoint = ringPoints[i%4];
				this._startStreak(i,destinationPoint)
			}
		}.bind(this));
	},

	_startStreak: function(i,destinationPoint) {
		var guide = this._guideNodes[i];
		var streak = this._streakNodes[i];
		var sourcePoint = cc.p(destinationPoint.x,destinationPoint.y)
		var motionPoints = []

		for (var j=0; j<4; j++) {
			var previousPoint = motionPoints[0] || destinationPoint
			var p = cc.p(0,0)
			if (previousPoint.x == 0) {
				p.x += destinationPoint.x * 1/4 + Math.random() * destinationPoint.x * 3/4 || (this._radius - Math.random() * (2 * this._radius))
			} else if (destinationPoint.y == 0) {
				p.y += destinationPoint.y * 1/4 + Math.random() * destinationPoint.y * 3/4 || (this._radius - Math.random() * (2 * this._radius))
			}
			p.x = this._spreadFactor * Math.round(p.x)
			p.y = this._spreadFactor * Math.round(p.y)
			sourcePoint.x += p.x
			sourcePoint.y += p.y
			motionPoints.unshift(p)
		}

		guide.setPosition(sourcePoint)
		streak.setPosition(sourcePoint)
		var sequence = [cc.delayTime(i*0.1)]

		streak.runAction(cc.sequence(
			cc.delayTime(i*0.1),
			cc.fadeIn(0.2)
		))

		for (var j=0; j<4; j++) {
			var p = motionPoints[j]
			var distance = Math.abs(p.x) || Math.abs(p.y)
			var duration = distance / this._speed
			sequence.push(cc.moveBy(duration,cc.p(-p.x,-p.y)))
		}

		var bezierFactor = 0.552284749831;
		var bezierPoints = [
			[
				cc.p(-this._radius, 				this._radius*bezierFactor),
				cc.p(-this._radius*bezierFactor, 	this._radius),
				cc.p(0, 							this._radius)
			],
			[
				cc.p(this._radius*bezierFactor, 	this._radius),
				cc.p(this._radius, 					this._radius*bezierFactor),
				cc.p(this._radius, 					0)
			],
			[
				cc.p(this._radius,					-this._radius*bezierFactor),
				cc.p(this._radius*bezierFactor,		-this._radius),
				cc.p(0,								-this._radius)
			],
			[
				cc.p(-this._radius*bezierFactor,	-this._radius),
				cc.p(-this._radius,					-this._radius*bezierFactor),
				cc.p(-this._radius,					0)
			]
		]

		var dest1 = bezierPoints[(i+0)%4]
		var dest2 = bezierPoints[(i+1)%4]
		var dest3 = bezierPoints[(i+2)%4]
		var dest4 = bezierPoints[(i+3)%4]

		// sequence.push(cc.repeatForever(
		// 	cc.sequence(
		// 		cc.bezierBy(0.2,dest1),
		// 		cc.bezierBy(0.2,dest2),
		// 		cc.bezierBy(0.2,dest3),
		// 		cc.bezierBy(0.2,dest4)
		// 	)
		// ))

		var arcCircumference = Math.PI * this._radius / 2.0
		var arcDuration = arcCircumference / this._speed

		sequence = sequence.concat([
			cc.bezierTo(arcDuration,dest1),
			cc.bezierTo(arcDuration,dest2),
			cc.bezierTo(arcDuration,dest3),
			cc.bezierTo(arcDuration,dest4)
		])

		guide.runAction(cc.sequence(sequence))
	},

	update: function (dt) {
		cc.Node.prototype.update.call(this, dt);

		for (var i=0, il = this._guideNodes.length; i < il; i++) {
			var guide = this._guideNodes[i];
			var streak = this._streakNodes[i];
			streak.setPosition(guide.getPosition());
		}
	}

});

MotionStreakRingNode.create = function(options, node) {
	return node || new MotionStreakRingNode(options);
};

module.exports = MotionStreakRingNode;
