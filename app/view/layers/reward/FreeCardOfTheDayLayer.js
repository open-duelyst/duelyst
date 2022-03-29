//pragma PKGS: free_card_of_the_day
var CONFIG = require('app/common/config');
var UtilsEngine = require('app/common/utils/utils_engine');
var SDK = require('app/sdk');
var Promise = require('bluebird');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var audio_engine = require("./../../../audio/audio_engine");
var RewardLayer = require('./RewardLayer');
var BaseSprite = require('./../../nodes/BaseSprite');
var GlowSprite = require('./../../nodes/GlowSprite');
var CardNode = require('./../../nodes/cards/CardNode');
var BaseParticleSystem = require('./../../nodes/BaseParticleSystem');
var FXFireRingSprite = require('./../../nodes/fx/FXFireRingSprite');
var FXDissolveWithDiscFromCenterSprite = require('./../../nodes/fx/FXDissolveWithDiscFromCenterSprite');
var FXFbmPolarFlareSprite = require('./../../nodes/fx/FXFbmPolarFlareSprite');
var FXFbmPolarFlareWipeSprite = require('./../../nodes/fx/FXFbmPolarFlareWipeSprite');
var CoreGemNode = require("app/view/nodes/gem/CoreGemNode");

/****************************************************************************
 FreeCardOfTheDayLayer
 ****************************************************************************/

var FreeCardOfTheDayLayer = RewardLayer.extend({

	coreGem: null,

	getRequiredResources: function () {
		return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("free_card_of_the_day"))
	},

	showBackground: function () {
		return this.showFlatBackground();
	},

	showContinueNode: function () {
		return this._super().then(function () {
			this.continueNode.setVisible(false);
		}.bind(this));
	},

	onEnter: function () {
		this._previousBlurProgramKey = this.getFX().surfaceBlurShaderProgramKey;
		this.getFX().surfaceBlurShaderProgramKey = "BlurFullScreenMega";
		this._super();

		// don't allow continue
		this.setIsContinueOnPressAnywhere(false);
		this.setIsInteractionEnabled(false);
	},

	onExit:function () {
		this.getFX().surfaceBlurShaderProgramKey = this._previousBlurProgramKey;
		this._super();
	},

	onPointerUp: function (event) {
		if (event && event.isStopped) {
			return;
		}

		if (this.coreGem) {
			// explosion particles
			var explosionParticles = cc.ParticleSystem.create(RSX.explosion.plist)
			explosionParticles.setPosition(this.coreGem.getPosition())
			explosionParticles.setAutoRemoveOnFinish(true)
			this.addChild(explosionParticles)
			this.coreGem.destroy()
			this.coreGem = null
			this.showRewardCards([this.cardId])
			this.getOrCreateSubtitleLabel().runAction(cc.fadeOut(0.2))
		} else {
			this._super(event)
		}
	},
	/* region REWARD CARDS */

	showCoreGem: function(cardId) {
		this.cardId = cardId
		return this.whenRequiredResourcesReady().then(function (requestId) {
			this.coreGem = new CoreGemNode(cardId)
			this.coreGem.setPosition(cc.p(0,70))
			this.addChild(this.coreGem)
			this.coreGem.transitionIn()
			// this.coreGem.fadeOutReticle(0.0)
			this.coreGem.whenRequiredResourcesReady().then(function(){
				this.coreGem.innerDarkRingSprite.setVisible(false)
			}.bind(this))
			this.coreGem.fadeInReticle(0.3)

			// show titles
			var showTitlesPromise = new Promise(function (resolve) {
				this.runAction(cc.sequence(
					cc.delayTime(0.5),
					cc.callFunc(function () {
						this.showTitles(CONFIG.ANIMATE_FAST_DURATION, "Free Card of The Day", "Press Anywhere to Reveal").then(resolve)
					}.bind(this))
				));
			}.bind(this))
		}.bind(this))
	},

	// Show stack is whether or not to show a stack of 3 cards or individual cards
	showRewardCards: function (cardIds) {
		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			audio_engine.current().play_effect(RSX.sfx_card_reward_long.audio, false);

			var showCardsPromise = new Promise(function (resolve) {
				var spacingBetweenCardCenters = 250;
				var centerPosition = cc.p(0, 70);

				var cardsLength = cardIds.length;
				var startingCenterXOffset = (cardsLength - 1) * -0.5 * spacingBetweenCardCenters;

				for (var c = 0; c < cardsLength; c++) {
					_.delay(function(c){

						var cardId = cardIds[c];
						var lastCard = c === cardsLength - 1;
						var cardCenterPosition = cc.p(centerPosition.x + startingCenterXOffset + c * spacingBetweenCardCenters, centerPosition.y);
						var flareSprite = FXFireRingSprite.create();
						flareSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
						flareSprite.setTimeScale(0.5);
						flareSprite.setPhase(0.5);
						flareSprite.setPosition(cardCenterPosition);
						flareSprite.setScale(1.75);
						flareSprite.setVisible(false);
						flareSprite.setFlippedY(true);
						this.addChild(flareSprite, 0);

						//TODO: The following commented line should work, however when the cardnode reveal gets the description, it fails to use the correct options
						// https://trello.com/c/40ebEr6N/53-when-grabbing-card-from-cache-getdescription-fails-to-obey-options-correctly
						//var sdkCard = SDK.GameSession.getCardCaches().getCardById(cardId);
						var sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());

						var cardNode = CardNode.create();
						cardNode.setVisible(false);
						cardNode.setPosition(cardCenterPosition);
						this.addChild(cardNode, 5);

						// card dissolve-in sprite
						var cardDissolveSpriteIdentifier;
						if (sdkCard instanceof SDK.Entity) {
							cardDissolveSpriteIdentifier = SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? RSX.card_neutral_prismatic_unit.img : RSX.card_neutral_unit.img;
						} else if (sdkCard instanceof SDK.Artifact) {
							cardDissolveSpriteIdentifier = SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? RSX.card_neutral_prismatic_artifact.img : RSX.card_neutral_artifact.img;
						} else {
							cardDissolveSpriteIdentifier = SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? RSX.card_neutral_prismatic_spell.img : RSX.card_neutral_spell.img;
						}
						var cardDissolve = FXDissolveWithDiscFromCenterSprite.create(cardDissolveSpriteIdentifier);
						cardDissolve.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
						cardDissolve.setScale(1.0);
						cardDissolve.setAnchorPoint(cc.p(0.5, 0.5));
						cardDissolve.setPosition(cardCenterPosition);
						this.addChild(cardDissolve, 0);

						// gold flaring
						var polarFlare = FXFbmPolarFlareSprite.create();
						polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
						polarFlare.setTextureRect(cc.rect(0, 0, 512, 640));
						polarFlare.setAnchorPoint(cc.p(0.5, 0.5));
						polarFlare.setPosition(cardCenterPosition);
						this.addChild(polarFlare, 0);

						var particles = BaseParticleSystem.create(RSX.ptcl_spiral_assemble_for_card_reward.plist);
						particles.setAnchorPoint(cc.p(0.5, 0.5));
						particles.setPosition(cardCenterPosition);
						this.addChild(particles);

						cardDissolve.runAction(cc.actionTween(2.0, "phase", 0.0, 1.0));
						polarFlare.runAction(cc.sequence(
							cc.actionTween(1.0, "phase", 0.01, 1.0),
							cc.delayTime(0.5),
							cc.callFunc(function (cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard) {

								// play reveal sound
								audio_engine.current().play_effect(RSX.sfx_ui_card_reveal.audio, false);

								// show card reveal
								cardNode.setVisible(true);
								cardNode.showReveal(sdkCard, cardCenterPosition, null);
								cardNode.factionNameLabel.setOpacity(0);

								// finalize animation
								cardNode.runAction(cc.sequence(
									cc.delayTime(1.5),
									cc.callFunc(function (cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard) {

										cardDissolve.setVisible(false);
										cardDissolve.destroy();

										flareSprite.setVisible(true);
										flareSprite.runAction(cc.EaseCubicActionOut.create(cc.scaleTo(1.5, 9.0)));

										// all done
										resolve();
									}.bind(this, cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard))
								));

							}.bind(this, cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard)),
							cc.delayTime(0.5),
							cc.actionTween(1.0, "phase", 1.0, 0.01)
						));
					}.bind(this,c),c*500)
				}
			}.bind(this));

			return Promise.all([
				showCardsPromise,
			]).then(function () {
				this.setIsContinueOnPressAnywhere(true);
				this.setIsInteractionEnabled(true);
				this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}.bind(this));
		}.bind(this));
	},
	/* endregion REWARD CARDS */

});

FreeCardOfTheDayLayer.create = function(layer) {
	return RewardLayer.create(layer || new FreeCardOfTheDayLayer());
};


module.exports = FreeCardOfTheDayLayer;
