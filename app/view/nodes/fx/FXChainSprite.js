
var FXSprite = require('./FXSprite');

/****************************************************************************
FXChainSprite
var FXChainSprite = FXSprite
FXChainSprite.create()
 ****************************************************************************/

var FXChainSprite = FXSprite.extend({
	// chains should usually react before animation
	// note: chains always react at end of chain, these just change whether it is before or after animation plays
	impactAtStart: true,
	impactAtEnd: false,
	// number of chain segments between source and target
	numSegments: 1,
	// whether chain should automatically try to segment itself
	// to try and keep texture stretching to a minimum
	autoSegment: true,
	// stretch threshold cutoff for auto segementation
	autoSegmentThreshold: 1.25,
	// index of segment between source and target
	_segmentIndex: 0,
	// root segment in chain
	_root: null,
	// next/prev segment in chain
	_next: null,
	_prev: null,
	// whether has started chaining
	_started: false,
	_chaining: false,
	// options to be copied to each chain segment
	_options: null,
	// amount to stretch scale x by
	_stretch: 1.0,

	ctor: function (options) {
		// initialize properties that may be required in init
		this._options = {};
		this._segmentIndex = this._actionOffset = 0;

		// do super ctor
		this._super(options);
	},

	setOptions: function (options) {
		this._super(options);

		if (options.numSegments) { this.setNumSegments(options.numSegments); }
		if (typeof options.autoSegment !== "undefined") { this.setAutoSegment(options.autoSegment); }
		if (typeof options.autoSegmentThreshold !== "undefined") { this.setAutoSegmentThreshold(options.autoSegmentThreshold); }
	},

	getNodeToParentTransform: function () {
		// as we'll use scale to stretch each chain segment
		// we need to temporarily modify the scale when transforming
		var scaleX = this._scaleX;
		this._scaleX *= this._stretch;
		var ret = FXSprite.prototype.getNodeToParentTransform.call(this);
		this._scaleX = scaleX;
		return ret;
	},

	getShowDelay: function () {
		if(this.impactAtEnd) {
			return FXSprite.prototype.getShowDelay.call(this);
		} else {
			return 0.0;
		}
	},
	getImpactDelay: function () {
		// chains always impact immediately
		return 0.0;
	},
	_calculateEmitFXTimings: function () {
		// chains ignore emit fx delay
	},
	_calculateImpactFXTimings: function () {
		// chains ignore impact fx delay
	},

	// copied options

	setNumSegments: function (numSegments) {
		this.numSegments = this._options.numSegments = Math.max(numSegments, 1);
	},
	getNumSegments: function () {
		return this.numSegments;
	},
	setAutoSegment: function (autoSegment) {
		this.autoSegment = this._options.autoSegment = autoSegment;
	},
	getAutoSegment: function () {
		return this.autoSegment;
	},
	setAutoSegmentThreshold: function (autoSegmentThreshold) {
		this.autoSegmentThreshold = this._options.autoSegmentThreshold = autoSegmentThreshold;
	},
	getAutoSegmentThreshold: function () {
		return this.autoSegmentThreshold;
	},

	// extra options to copy from ancestor sprites

	setSpriteIdentifier: function (spriteIdentifier) {
		FXSprite.prototype.setSpriteIdentifier.call(this, spriteIdentifier);
		this._options.spriteIdentifier = spriteIdentifier;
	},
	setImpactFX: function ( impactFX ) {
		FXSprite.prototype.setImpactFX.call(this, impactFX);
		this._options.impactFX = impactFX;
	},
	setEmit: function ( emit ) {
		FXSprite.prototype.setEmit.call(this, emit);
		this._options.emit = emit;
	},
	setSourceScreenPosition: function (sourceScreenPosition, sourceOffset) {
		FXSprite.prototype.setSourceScreenPosition.call(this, sourceScreenPosition, sourceOffset);
		this._options.sourceScreenPosition = sourceScreenPosition;
		this._options.sourceOffset = sourceOffset;
	},
	setTargetScreenPosition: function (targetScreenPosition, targetOffset) {
		FXSprite.prototype.setTargetScreenPosition.call(this, targetScreenPosition, targetOffset);
		this._options.targetScreenPosition = targetScreenPosition;
		this._options.targetOffset = targetOffset;
	},
	setAutoStart: function (autoStart) {
		FXSprite.prototype.setAutoStart.call(this, autoStart);
		this._options.autoStart = autoStart;
	},
	setImpactAtStart: function (impactAtStart) {
		FXSprite.prototype.setImpactAtStart.call(this, impactAtStart);
		this._options.impactAtStart = impactAtStart;
	},
	setImpactAtEnd: function (impactAtEnd) {
		FXSprite.prototype.setImpactAtEnd.call(this, impactAtEnd);
		this._options.impactAtEnd = impactAtEnd;
	},
	setDuration: function (duration) {
		FXSprite.prototype.setDuration.call(this, duration);
		this._options.duration = duration;
	},
	setFadeInDuration: function (fadeInDuration) {
		FXSprite.prototype.setFadeInDuration.call(this, fadeInDuration);
		this._options.fadeInDuration = fadeInDuration;
	},
	setFadeInDurationPct: function (fadeInDurationPct) {
		FXSprite.prototype.setFadeInDurationPct.call(this, fadeInDurationPct);
		this._options.fadeInDurationPct = fadeInDurationPct;
	},
	setFadeOutDuration: function (fadeOutDuration) {
		FXSprite.prototype.setFadeOutDuration.call(this, fadeOutDuration);
		this._options.fadeOutDuration = fadeOutDuration;
	},
	setFadeOutDurationPct: function (fadeOutDurationPct) {
		FXSprite.prototype.setFadeOutDurationPct.call(this, fadeOutDurationPct);
		this._options.fadeOutDurationPct = fadeOutDurationPct;
	},
	setLooping: function (looping) {
		FXSprite.prototype.setLooping.call(this, looping);
		this._options.looping = looping;
	},
	setRemoveOnEnd:function (removeOnEnd) {
		FXSprite.prototype.setRemoveOnEnd.call(this, removeOnEnd);
		this._options.removeOnEnd = removeOnEnd;
	},
	setDestinationParent: function (destinationParent) {
		FXSprite.prototype.setDestinationParent.call(this, destinationParent);
		this._options.destinationParent = destinationParent;
	},
	setDestinationZOrder: function (destinationZOrder) {
		FXSprite.prototype.setDestinationZOrder.call(this, destinationZOrder);
		this._options.destinationZOrder = destinationZOrder;
	},

	// chaining

	chain: function () {
		// make sure to unchain before rechaining
		if(!this._next) {
			this._chaining = true;

			// no need to chain past end
			var nextSegmentIndex = this._segmentIndex + 1;
			if(nextSegmentIndex < this.numSegments) {
				var chainSprite = FXChainSprite.create(this._options);
				chainSprite._segmentIndex = nextSegmentIndex;
				chainSprite._actionOffset = this._actionOffset;

				// two-way link
				this._next = chainSprite;
				chainSprite._prev = this;

				this.getParent().addChild(chainSprite, this.getLocalZOrder());
			}
		}
	},
	unchain: function () {
		if(this._root && this !== this._root) {
			this._root.unchain();
			this._root = null;
		} else {
			this._unchainSelf();
		}
	},
	_unchainSelf: function () {
		this._started = this._chaining = false;
		this._prev = null;
		this._unchainNext();
	},
	_unchainSelfWithEnd: function () {
		this.end();
		this._unchainSelf();
	},
	_unchainNext: function () {
		if(this._next) {
			this._next._unchainSelfWithEnd();
			this._next = null;
		}
	},

	start: function() {
		this._started = true;
		this._root = (this._prev && this._prev._root) || this;

		FXSprite.prototype.start.call(this);
	},
	startTransform: function () {
		FXSprite.prototype.startTransform.call(this);

		// get source and target position
		var sourceScreenPosition = this.getSourceOffsetScreenPosition();
		var targetScreenPosition = this.getTargetOffsetScreenPosition();

		// reset some transforms
		var segmentPosition = cc.p();
		this.setPosition(segmentPosition);
		this.setRotation(0.0);
		this.setAnchorPoint(cc.p(1.0, 0.5));
		this._stretch = 1.0;
		// handles own facing
		this.setFlippedX(false);

		// static segment mode
		var diff = cc.p(targetScreenPosition.x - sourceScreenPosition.x, targetScreenPosition.y - sourceScreenPosition.y);
		var length = cc.kmVec2Length(diff);
		var rect = this.getTextureRect();
		var worldTransform = this.nodeToWorldTransform();
		var worldScale = worldTransform.a; // affine transform scale x
		var worldWidth = rect.width * worldScale;

		// return early when no texture present
		if(!this.getTexture() || !worldWidth) return;

		var lengthPct = length / worldWidth;
		if(this.autoSegment) {
			this.numSegments = Math.ceil(lengthPct / this.autoSegmentThreshold);
		}

		var t = ((this._segmentIndex + 1.0) / this.numSegments);
		segmentPosition.x = sourceScreenPosition.x * (1.0 - t) + targetScreenPosition.x * t;
		segmentPosition.y = sourceScreenPosition.y * (1.0 - t) + targetScreenPosition.y * t;

		// set stretch based on number of segments and distance this segment needs to cover
		var lengthModifier;
		if(this.numSegments > 1) {
			lengthModifier = 1.0 / this.numSegments;
		} else {
			lengthModifier = lengthPct;
		}
		var segmentLength = length * lengthModifier;
		this._stretch = segmentLength / worldWidth;

		// set final properties
		this.setPosition(segmentPosition);
		this.setRotation( -Math.atan2(diff.y, diff.x) * 180 / Math.PI );
	},
	startAnimation: function () {
		if(!this.duration) {
			var looping = this.looping;
			this.looping = false;
		}
		FXSprite.prototype.startAnimation.call(this);
		if(!this.duration) {
			this.looping = looping;
		}
	},
	startEvents: function () {
		// check for impact before animating if we're last in segment
		if(this._segmentIndex >= this.numSegments - 1 && this.impactAtStart) {
			this.impact();
		}

		this.chain();
	},
	end: function() {
		// this is last segment
		if(this._segmentIndex >= this.numSegments - 1 && this.impactAtEnd) {
			this.impact();
		}

		// skip projectile end and do to fx sprite end
		var impactAtEnd = this.impactAtEnd;
		this.impactAtEnd = false;
		FXSprite.prototype.end.call(this);
		this.impactAtEnd = impactAtEnd;
	},
	_restart: function () {
		this.unchain();
		FXSprite.prototype._restart.call(this);
	}
});

FXChainSprite.create = function(options, sprite) {
	return FXSprite.create(options, sprite || new FXChainSprite(options));
};

module.exports = FXChainSprite;
