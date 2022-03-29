//pragma PKGS: tooltip

var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var audio_engine = require("app/audio/audio_engine");
var UtilsJavascript = require("app/common/utils/utils_javascript");
var EntitySupportNode = require('./EntitySupportNode');
var BaseSprite = require('./../BaseSprite');
var BaseLabel = require('./../BaseLabel');
var Promise = require("bluebird");

/****************************************************************************
 TooltipNode
 - node used to show instruction for an entity node
 ****************************************************************************/

var TooltipNode = cc.Node.extend({

	_bgResourceRequestId: null,
	bgSprite: null,
	_carrotDirection: null,
	entityNode: null,
	label: null,
	_stopShowingAction: null,

	/* region INITIALIZE */

	ctor: function () {
		this._super();

		this.setCascadeOpacityEnabled(true);

		// text label setup
		this.label = new BaseLabel("", RSX.font_regular.name, 16, cc.size(CONFIG.TOOLTIP_TEXT_MAX_WIDTH, 0.0));
		var colorsByFormattingTag = {};
		colorsByFormattingTag[CONFIG.FORMATTING_ENGINE.emphasisStart] = CONFIG.INSTRUCTION_NODE_HIGHLIGHT_TEXT_COLOR;
		this.label.setColorsByFormattingTag(colorsByFormattingTag);
		this.label.setFontFillColor(CONFIG.INSTRUCTION_NODE_TEXT_COLOR);
		this.label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
		this.label.setAnchorPoint(0.5, 0.5);

		return true;
	},

	getRequiredResources: function () {
		return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("tooltip"));
	},

	/* endregion INITIALIZE */

	showText: function (text, carrotDirection) {
		var showDuration = 0.0;

		// stop any removing
		if (this._stopShowingAction != null) {
			this.stopAction(this._stopShowingAction);
			this._stopShowingAction = null;
		}

		// set carrot
		if (carrotDirection == null) {
			carrotDirection = TooltipNode.DIRECTION_DOWN;
		}
		this._setCarrotDirection(carrotDirection);

		// set text
		this.setText(text);

		this._stoppingShow = false;
		this.setVisible(false);

		Promise.all([
			this.whenRequiredResourcesReady(),
			this.whenResourcesReady(this._bgResourceRequestId)
		])
		.spread(function (requiredRequestId, bgRequestId) {
			if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(bgRequestId)) return; // load invalidated or resources changed

			// play sound
			audio_engine.current().play_effect(RSX.sfx_ui_instructional_enter.audio);

			// show instantly
			this.setOpacity(255.0);
			this.setVisible(true);
		}.bind(this));

		return showDuration;
	},

	stopShowing: function () {
		var showDuration = CONFIG.FADE_FAST_DURATION;
		if (!this._stoppingShow && this.isVisible() && (this._stopShowingAction == null || !this._stopShowingAction.getActive())) {
			this._stoppingShow = true;

			// stop any removing
			if (this._stopShowingAction != null) {
				this.stopAction(this._stopShowingAction);
				this._stopShowingAction = null;
			}

			Promise.all([
				this.whenRequiredResourcesReady(),
				this.whenResourcesReady(this._bgResourceRequestId)
			])
			.spread(function (requiredRequestId, bgRequestId) {
				if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(bgRequestId)) return; // load invalidated or resources changed
				if (this._stoppingShow && (this._stopShowingAction == null || !this._stopShowingAction.getActive())) {
					this._stoppingShow = false;

					// play exit sound
					audio_engine.current().play_effect(RSX.sfx_ui_instructional_exit.audio);

					// animate out
					this._stopShowingAction = cc.sequence(
						cc.fadeTo(showDuration, 0.0),
						cc.callFunc(function () {
							this._stopShowingAction = null;
							this.setVisible(false);
						}.bind(this))
					);
					this.runAction(this._stopShowingAction);
				}
			}.bind(this));
		}

		return showDuration;
	},

	_updateBackground: function() {
		var bgResource = RSX["tooltip_" + this._carrotDirection];
		if (this._bgResourceRequestId != null) {
			this.removeResourceRequestById(this._bgResourceRequestId);
		}
		this._bgResourceRequestId = "tooltip_bg_" + UtilsJavascript.generateIncrementalId();
		this.addResourceRequest(this._bgResourceRequestId, null, [bgResource]);

		Promise.all([
			this.whenRequiredResourcesReady(),
			this.whenResourcesReady(this._bgResourceRequestId)
		])
		.spread(function (requiredRequestId, bgRequestId) {
			if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(bgRequestId)) return; // load invalidated or resources changed

			if (this.bgSprite != null) {
				this.bgSprite.removeChild(this.label);
				this.removeChild(this.bgSprite);
				this.bgSprite = null;
			}


			// Reposition the text to center (considering anchor point)
			var bgOffsetToCenter;
			var centerPositionOffset = cc.p(0, 0);
			if (this._carrotDirection == TooltipNode.DIRECTION_DOWN) {
				this.setAnchorPoint(0.5, 0.0);
				bgOffsetToCenter = cc.p(0, 25);
				centerPositionOffset.y -= 15;
			} else if (this._carrotDirection == TooltipNode.DIRECTION_UP) {
				this.setAnchorPoint(0.5, 1.0);
				bgOffsetToCenter = cc.p(0, -25);
				centerPositionOffset.y += 15;
			} else if (this._carrotDirection == TooltipNode.DIRECTION_LEFT) {
				this.setAnchorPoint(0.0, 0.5);
				bgOffsetToCenter = cc.p(25, 0);
				centerPositionOffset.x -= 20;
			} else {
				// Assume right
				this.setAnchorPoint(1.0, 0.5);
				bgOffsetToCenter = cc.p(-25, 0);
				centerPositionOffset.x += 20;
			}

			// create bg sprite
			this.bgSprite = BaseSprite.create(bgResource.img);
			this.bgSprite.setAntiAlias(false);
			this.addChild(this.bgSprite, 0);

			// set content size to match bg sprite
			this.setContentSize(this.bgSprite.getContentSize());
			this.bgSprite.setPosition(this.getCenterPosition().x + centerPositionOffset.x, this.getCenterPosition().y + centerPositionOffset.y);
			this.bgSprite.addChild(this.label, 1);

			this.label.setPosition(this.bgSprite.getContentSize().width * 0.5 + bgOffsetToCenter.x, this.bgSprite.getContentSize().height * 0.5 + bgOffsetToCenter.y);
		}.bind(this));
	},

	setText: function (value) {
		if (value + "" !== this.label.getString()) {
			// Set the labels string
			this.label.setString(value, true);
		}
	},

	getText: function () {
		return this.label.getString();
	},

	/* endregion TEXT */

	/* region CARROT */

	_setCarrotDirection: function(carrotDirection) {
		if (carrotDirection != this._carrotDirection) {
			this._carrotDirection = carrotDirection;
			this._updateBackground();
		}
	},

	getIsLeft: function () {
		return this._carrotDirection === TooltipNode.DIRECTION_LEFT;
	},

	getIsRight: function () {
		return this._carrotDirection === TooltipNode.DIRECTION_RIGHT;
	},

	getIsUp: function () {
		return this._carrotDirection === TooltipNode.DIRECTION_UP;
	},

	getIsDown: function () {
		return this._carrotDirection === TooltipNode.DIRECTION_DOWN;
	}

	/* endregion CARROT */

});

TooltipNode.create = function(node) {
	return node || new TooltipNode();
};

TooltipNode.DIRECTION_UP = "up";
TooltipNode.DIRECTION_DOWN = "down";
TooltipNode.DIRECTION_LEFT = "left";
TooltipNode.DIRECTION_RIGHT = "right";

module.exports = TooltipNode;
