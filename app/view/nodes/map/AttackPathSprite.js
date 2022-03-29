//pragma PKGS: game
var CONFIG = require('app/common/config');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
AttackPathSprite
var AttackPathSprite = BaseSprite
AttackPathSprite.create()
 - attack path sprites ONLY travel along x axis
 ****************************************************************************/

var AttackPathSprite = BaseSprite.extend({
	needsDepthDraw: true,
	depthModifier: 0.0,

	fadeDistance: CONFIG.PATH_FADE_DISTANCE,
	arcDistance: CONFIG.PATH_ARC_DISTANCE,
	speed: CONFIG.TILESIZE * (1.0 / CONFIG.PATH_MOVE_DURATION),

	_sourceScreenPosition: cc.p(),
	_targetScreenPosition: cc.p(),
	_delta: cc.p(),
	_currentDistance: 0.0,
	_distance: 0.0,
	_maxDistance: 0.0,
	_pathOpacityModifier: 0.0,

	_started: false,

	ctor: function () {
		// initialize properties that may be required in init
		this._sourceScreenPosition = cc.p();
		this._targetScreenPosition = cc.p();
		this._delta = cc.p();

		// do super ctor
		this._super(RSX.tile_path_attack.frame);
	},

	_createRenderCmd: function(){
		if(cc._renderType === cc._RENDER_TYPE_CANVAS) {
			return this._super();
		} else {
			return new AttackPathSprite.WebGLRenderCmd(this);
		}
	},

	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	},

	unuse: function () {
		this._started = false;
	},

	setPath: function (sourceScreenPosition, targetScreenPosition, distance, maxDistance, startPct) {
		this._sourceScreenPosition.x = sourceScreenPosition.x;
		this._sourceScreenPosition.y = sourceScreenPosition.y;
		this._targetScreenPosition.x = targetScreenPosition.x;
		this._targetScreenPosition.y = targetScreenPosition.y;
		this._delta.x = this._targetScreenPosition.x - this._sourceScreenPosition.x;
		this._delta.y = this._targetScreenPosition.y - this._sourceScreenPosition.y;
		this._distance = distance;

		if (!this._started) {
			this._started = true;
			this._maxDistance = maxDistance;
			this._currentDistance = this._maxDistance * startPct;
			this.scheduleUpdate();
		}
	},

	_restartPath: function () {
		this._currentDistance = 0.0;
		this.setPosition(cc.p(this._currentDistance, 0.0));
	},

	update: function (dt) {
		BaseSprite.prototype.update.call(this, dt);
		if (this._distance < this.fadeDistance) {
			if (this._pathOpacityModifier !== 0.0) {
				this._pathOpacityModifier = 0.0;
				this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty);
			}
		} else {
			// move
			var dx = this._targetScreenPosition.x - this._sourceScreenPosition.x;
			var dy = this._targetScreenPosition.y - this._sourceScreenPosition.y;
			var speedModifier = Math.min(1.5, Math.max(1.0, (CONFIG.TILESIZE * 2.0) / this._distance));
			this._currentDistance += this.speed * dt * speedModifier;

			// update position
			var movePct = this._currentDistance / this._maxDistance;
			var arcPct = Math.min(this._currentDistance / this._distance, 1.0);
			var arcModifier = Math.sin(arcPct * Math.PI);
			var nextPosition = cc.p(this._sourceScreenPosition.x + dx * movePct, this._sourceScreenPosition.y + dy * movePct + this.arcDistance * arcModifier);
			this.setDepthOffset(-this.arcDistance * (arcModifier - 0.5) * 2.0);
			this.setAutoZOrderOffset((this.arcDistance / CONFIG.TILESIZE) * arcModifier * 1.5);
			this.setPosition(nextPosition);

			// update rotation
			this.setRotation(cc.radiansToDegrees(-Math.atan2(this._delta.y - this.arcDistance * (arcPct - 0.5) * 2.0 * CONFIG.PATH_ARC_ROTATION_MODIFIER, this._delta.x)));

			// update opacity
			var fadeIn = Math.min(this._currentDistance / this.fadeDistance, 1.0);
			var fadeOut = 1.0 - Math.min(Math.max(this._currentDistance - (this._distance - this.fadeDistance), 0.0) / this.fadeDistance, 1.0);
			this._pathOpacityModifier = fadeIn * fadeOut;
			this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty);

			// restart as needed
			if (movePct >= 1.0) {
				this._restartPath();
			}
		}
	}
});

AttackPathSprite.WebGLRenderCmd = function(renderable){
	BaseSprite.WebGLRenderCmd.call(this, renderable);
};
var proto = AttackPathSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = AttackPathSprite.WebGLRenderCmd;

proto._syncDisplayOpacity = function () {
	BaseSprite.WebGLRenderCmd.prototype._syncDisplayOpacity.call(this);
	this._displayedOpacity *= this._node._pathOpacityModifier;
};
proto._updateDisplayOpacity = function () {
	BaseSprite.WebGLRenderCmd.prototype._updateDisplayOpacity.call(this);
	this._displayedOpacity *= this._node._pathOpacityModifier;
};

AttackPathSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(AttackPathSprite) || BaseSprite.create(null, new AttackPathSprite());
	}
	return sprite;
};

module.exports = AttackPathSprite;
