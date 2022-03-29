//pragma PKGS: gauntlet_ticket

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var UtilsEngine = require('app/common/utils/utils_engine');
var XYZRotateBy = require('app/view/actions/XYZRotateBy');
var TweenTypes = require('app/view/actions/TweenTypes');
var BaseSprite = require('./../BaseSprite');
var GlowSprite = require('./../GlowSprite');
var BaseParticleSystem = require('./../BaseParticleSystem');
var FXGlowImageMap = require("./../fx/FXGlowImageMap");
var FXCardShineSprite = require("./../fx/FXCardShineSprite");

/****************************************************************************
 TicketNode
 ****************************************************************************/

var TicketNode = GlowSprite.extend({

	ticketBackgroundSprite: null,

	//selectReveal glow outline sprite
	_outlineGlow: null,
	_outlineGlowTwo: null,

	// glow effect node under card
	_glowMapNode: null,

	/* region INITIALIZATION */

	ctor: function () {
		this._super();

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			this._glowMapNode = new FXGlowImageMap({
				spriteIdentifier: RSX.card_shadow_map.img,
				// blendSrc: "SRC_ALPHA",
				// blendDst: "ONE",
				scale: 1.0,
				gamma: 2.0,
				glowColor: CONFIG.DEFAULT_GLOW_COLOR
			});
			this._glowMapNode.setVisible(false);
			this.addChild(this._glowMapNode, 0);

			// background with base card
			this.ticketBackgroundSprite = GlowSprite.create(RSX.arena_ticket_bg.img);
			this.ticketBackgroundSprite.getTexture().setAliasTexParametersWhenSafeScale();
			this.addChild(this.ticketBackgroundSprite, 1);

			// set content size to match background plus a little padding
			var cardContentSize = this.ticketBackgroundSprite.getContentSize();
			var contentSize = cc.size(cardContentSize.width + 75, cardContentSize.height + 75);

			// card specific highlight tweaks
			this.ticketBackgroundSprite.highlightColor = cc.color(70.0, 200.0, 255.0, 255.0);
			this.ticketBackgroundSprite.highlightFrequency = 0.0; // no pulsating
			this.ticketBackgroundSprite.highlightIntensity = 4.0;
			this.ticketBackgroundSprite.setHighlightThreshold(0.15);
			this.ticketBackgroundSprite.highlightBrightness = 0.9;
			this.ticketBackgroundSprite.highlightLevelsInBlack = 10.0;
			this.ticketBackgroundSprite.highlightLevelsInWhite = 170.0;
			this.ticketBackgroundSprite.highlightLevelsInGamma = 1.1; // 1.1 to reduce brights / increase blacks
			this.ticketBackgroundSprite.highlightLevelsOutBlack = 10.0;
			this.ticketBackgroundSprite.highlightLevelsOutWhite = 255.0;
			this.ticketBackgroundSprite.setHighlightBlurStrength("strong");
		}.bind(this));
	},

	getRequiredResources: function () {
		return GlowSprite.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("gauntlet_ticket"));
	},

	/* endregion INITIALIZATION */


	/**
	 * Sets card glwoing state, showing glow around card.
	 */
	setGlowing: function (glowing,duration) {
		duration = duration || 0.1;
		if (this.glowing !== glowing) {
			this.glowing = glowing;

			this.whenRequiredResourcesReady().then(function (requestId) {
				if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

				if (this.glowing) {
					this._glowMapNode.setVisible(true);
					this._glowMapNode.stopAllActions();
					this._glowMapNode.setOpacity(0);
					this._glowMapNode.runAction(cc.fadeIn(duration));
				} else {
					this._glowMapNode.stopAllActions();
					this._glowMapNode.runAction(cc.sequence(
						cc.fadeOut(duration),
						cc.callFunc(function () {
							this._glowMapNode.setVisible(false);
						}.bind(this))
					));
				}
			}.bind(this));
		}
	},

	getGlowing: function (glowing) {
		return this.glowing;
	},

	setGlowColor: function (color) {
		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			this._glowMapNode.setGlowColor(color);
		}.bind(this));
	},

	toggleFadeOutlineSpriteGlow: function(glowing,duration) {
		duration = duration || 0.1;
		if (this.outlineSpriteGlowing !== glowing) {
			this.outlineSpriteGlowing = glowing;

			this.whenRequiredResourcesReady().then(function (requestId) {
				if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed
				if (this.outlineSpriteGlowing) {
					this._outlineGlow.setVisible(true);
					this._outlineGlow.stopAllActions();
					this._outlineGlow.setOpacity(0);
					this._outlineGlow.runAction(cc.fadeIn(duration));
				} else {
					this._outlineGlow.stopAllActions();
					this._outlineGlow.runAction(cc.sequence(
						cc.fadeOut(duration),
						cc.callFunc(function () {
							this._outlineGlow.setVisible(false);
						}.bind(this))
					));
				}
			}.bind(this));
		}
	},

	getOutlineGlowSprite: function() {
		return this._outlineGlow;
	},

	/* region STATES */

	showShine: function(duration,intensity) {
		duration = duration || 0.5;
		intensity = intensity || 0.5;
		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			if (!this.shineNode) {
				this.shineNode = new FXCardShineSprite({
					spriteIdentifier: RSX.arena_ticket_bg.img,
					scale: 1.0,
					phase: -1.0,
					intensity: intensity
				});
				this.shineNode.setPosition(this.ticketBackgroundSprite.getPosition())
				this._staticContainerNode.addChild(this.shineNode, 1);
			}

			this.shineNode.setOpacity(255);
			this.shineNode.setVisible(true);
			this.shineNode.runAction(
				cc.sequence(
					cc.actionTween(duration, "phase", -1, 1).easing(cc.easeOut()),
					cc.callFunc(function () {
						this.shineNode.setVisible(false);
					}.bind(this))
				)
			)
		}.bind(this));
	},

	/* region REVEAL */

	showReveal: function (delayTime) {
		var showDuration = 0.0;
		var revealDuration = CONFIG.FADE_MEDIUM_DURATION;

		if (delayTime == null) { delayTime = 0.0; }

		// update showDuration
		showDuration += revealDuration + delayTime;

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			var centerPosition = this.getCenterPosition();
			var cardContentSize = this.ticketBackgroundSprite.getContentSize();

			// particles
			var fxFluidPuff = BaseSprite.create({
				spriteIdentifier: RSX.fxFluidCardShapePuff.name,
				color: new cc.Color(100, 200, 255, 255),
				scale: 9.0,
				blendSrc: cc.SRC_ALPHA,
				blendDst: cc.ONE
			});
			fxFluidPuff.setPosition(centerPosition);
			fxFluidPuff.runAction(cc.sequence(
				UtilsEngine.getAnimationAction(RSX.fxFluidCardShapePuff.name, false)),
				cc.fadeOut(0.1),
				cc.callFunc(function () {
					fxFluidPuff.destroy();
				})
			);
			this.addChild(fxFluidPuff, -1);

			var fxFluidPuff2 = BaseSprite.create({
				spriteIdentifier: RSX.fxFluidCardShapePuff.name,
				color: new cc.Color(0, 100, 255, 255),
				scale: 8.0,
				flippedX: true,
				blendSrc: cc.SRC_ALPHA,
				blendDst: cc.ONE
			});
			fxFluidPuff2.setPosition(centerPosition);
			fxFluidPuff2.runAction(cc.sequence(
				cc.delayTime(0.15),
				UtilsEngine.getAnimationAction(RSX.fxFluidCardShapePuff.name, false)),
				cc.fadeOut(0.1),
				cc.callFunc(function () {
					fxFluidPuff2.destroy();
				})
			);
			this.addChild(fxFluidPuff2, -1);

			var particles = new cc.ParticleSystem(RSX.ptcl_card_appear.plist);
			particles.setPosVar(cc.p(cardContentSize.width * 0.5, cardContentSize.height * 0.5));
			particles.setPosition(centerPosition);
			this.addChild(particles, 1);

			// glow
			this._glowMapNode.setVisible(true);
			this._glowMapNode.setOpacity(255.0);
			this._glowMapNode.stopAllActions();
			this._glowMapNode.runAction(cc.sequence(
				cc.fadeOut(0.5).easing(cc.easeIn(3.0)),
				cc.callFunc(function () {
					this._glowMapNode.setVisible(false);
				}.bind(this))
			));

			// highlight and tint
			this.ticketBackgroundSprite.setLeveled(true);
			this.ticketBackgroundSprite.setLevelsInWhite(180);
			this.ticketBackgroundSprite.setLevelsInBlack(30);
			this.ticketBackgroundSprite.setHighlighted(true);
			this.ticketBackgroundSprite.setTint(new cc.Color(255, 255, 255, 255));
			var tintAction = cc.sequence(
				cc.delayTime(revealDuration),
				cc.actionTween(revealDuration / 2.0, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeOut(3.0)),
				cc.callFunc(function () {
					this.ticketBackgroundSprite.fadeOutHighlight(revealDuration);
					this.ticketBackgroundSprite.runAction(cc.actionTween(revealDuration, "levelsInWhite", 180.0, 255.0));
					this.ticketBackgroundSprite.runAction(cc.actionTween(revealDuration, "levelsInBlack", 30.0, 0.0));
				}.bind(this))
			);
			tintAction.setTag(CONFIG.TINT_TAG);
			this.ticketBackgroundSprite.runAction(tintAction);
		}.bind(this));

		return showDuration;
	}

	/* endregion REVEAL */

});

TicketNode.create = function(node) {
	return cc.Node.create(node || new TicketNode());
};

module.exports = TicketNode;
