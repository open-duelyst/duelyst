//pragma PKGS: progression_reward
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
var EmoteRewardNode = require('./../../nodes/reward/EmoteRewardNode');
var CosmeticRewardNode = require('./../../nodes/reward/CosmeticRewardNode');
var RibbonRewardNode = require('./../../nodes/reward/RibbonRewardNode');
var BaseParticleSystem = require('./../../nodes/BaseParticleSystem');
var FXFireRingSprite = require('./../../nodes/fx/FXFireRingSprite');
var FXDissolveWithDiscFromCenterSprite = require('./../../nodes/fx/FXDissolveWithDiscFromCenterSprite');
var FXFbmPolarFlareSprite = require('./../../nodes/fx/FXFbmPolarFlareSprite');
var FXFbmPolarFlareWipeSprite = require('./../../nodes/fx/FXFbmPolarFlareWipeSprite');
var KeyRewardNode = require('./../../nodes/reward/KeyRewardNode');

/****************************************************************************
 ProgressionRewardLayer
 ****************************************************************************/

var ProgressionRewardLayer = RewardLayer.extend({

	getRequiredResources: function () {
		return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("progression_reward"));
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
		this._super();

		// don't allow continue
		this.setIsContinueOnPressAnywhere(false);
		this.setIsInteractionEnabled(false);
	},

	/* region REWARD CARDS */

	// Show stack is whether or not to show a stack of 3 cards or individual cards
	showRewardCards: function (cardIds, showStack, title, subtitle) {
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

										// show card stack
										if (showStack) {
											cardNode.showStack();
										}

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

			// show titles
			var showTitlesPromise = new Promise(function (resolve) {
				this.runAction(cc.sequence(
					cc.delayTime(2.0),
					cc.callFunc(function () {
						this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(resolve);
					}.bind(this))
				));
			}.bind(this));

			return Promise.all([
				showCardsPromise,
				showTitlesPromise
			]).then(function () {
				this.setIsContinueOnPressAnywhere(true);
				this.setIsInteractionEnabled(true);
				this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}.bind(this));
		}.bind(this));
	},
	/* endregion REWARD CARDS */

	/* region REWARD EMOTES */

	showRewardEmotes: function (emoteIds, title, subtitle) {
		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			audio_engine.current().play_effect(RSX.sfx_emote_reward_long.audio, false);

			var showPromises = [];

			// show emotes
			if (emoteIds && emoteIds.length > 0) {
				var numRewards = emoteIds.length;
				var padding = UtilsEngine.getGSIWinWidth() * 0.2;
				var offsetPerReward = (UtilsEngine.getGSIWinWidth() - padding) / numRewards;
				var offsetX;
				var offsetY = 0.0;
				if (numRewards > 1) {
					offsetX = -(offsetPerReward * numRewards * 0.5) + offsetPerReward * 0.5;
				} else {
					offsetX = 0.0;
				}
				for (var i = 0; i < numRewards; i++) {
					showPromises.push(this._showRewardEmote(emoteIds[i], cc.p(offsetX, offsetY)));
					offsetX += offsetPerReward;
				}
			}

			// show titles
			showPromises.push(new Promise(function (resolve) {
				this.runAction(cc.sequence(
					cc.delayTime(2.0),
					cc.callFunc(function () {
						this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(resolve);
					}.bind(this))
				));
			}.bind(this)));

			return Promise.all(showPromises).then(function () {
				this.setIsContinueOnPressAnywhere(true);
				this.setIsInteractionEnabled(true);
				this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}.bind(this));
		}.bind(this));
	},

	_showRewardEmote: function (emoteId, targetScreenPosition) {
		var emoteRewardNode = new EmoteRewardNode(emoteId);
		emoteRewardNode.setPosition(targetScreenPosition);
		this.addChild(emoteRewardNode);

		return emoteRewardNode.animateReward(true, false);
	},

	/* endregion REWARD EMOTES */

	/* region REWARD Battle Maps */

	showRewardBattleMaps: function (battleMapIds, title, subtitle) {
		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			audio_engine.current().play_effect(RSX.sfx_emote_reward_long.audio, false);

			var showPromises = [];

			// show emotes
			if (battleMapIds && battleMapIds.length > 0) {
				var numRewards = battleMapIds.length;
				var padding = UtilsEngine.getGSIWinWidth() * 0.2;
				var offsetPerReward = (UtilsEngine.getGSIWinWidth() - padding) / numRewards;
				var offsetX;
				var offsetY = 0.0;
				if (numRewards > 1) {
					offsetX = -(offsetPerReward * numRewards * 0.5) + offsetPerReward * 0.5;
				} else {
					offsetX = 0.0;
				}
				for (var i = 0; i < numRewards; i++) {
					showPromises.push(this._showRewardBattleMap(battleMapIds[i], cc.p(offsetX, offsetY)));
					offsetX += offsetPerReward;
				}
			}

			// show titles
			showPromises.push(new Promise(function (resolve) {
				this.runAction(cc.sequence(
					cc.delayTime(2.0),
					cc.callFunc(function () {
						this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(resolve);
					}.bind(this))
				));
			}.bind(this)));

			return Promise.all(showPromises).then(function () {
				this.setIsContinueOnPressAnywhere(true);
				this.setIsInteractionEnabled(true);
				this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}.bind(this));
		}.bind(this));
	},

	_showRewardBattleMap: function (battleMapId, targetScreenPosition) {
		var rewardNode = new CosmeticRewardNode(battleMapId);
		rewardNode.setPosition(targetScreenPosition);
		this.addChild(rewardNode);

		return rewardNode.animateReward(true, false);
	},

	/* endregion REWARD EMOTES */

	/* region REWARD RIBBONS */
	showRewardRibbons: function (ribbonIds, title, subtitle) {
		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			audio_engine.current().play_effect(RSX.sfx_ribbon_reward_long.audio, false);

			var showPromises = [];

			// show ribbons
			if (ribbonIds && ribbonIds.length > 0) {
				var numRewards = ribbonIds.length;
				var padding = UtilsEngine.getGSIWinWidth() * 0.2;
				var offsetPerReward = (UtilsEngine.getGSIWinWidth() - padding) / numRewards;
				var offsetX;
				var offsetY = 0.0;
				if (numRewards > 1) {
					offsetX = -(offsetPerReward * numRewards * 0.5) + offsetPerReward * 0.5;
				} else {
					offsetX = 0.0;
				}
				for (var i = 0; i < numRewards; i++) {
					showPromises.push(this._showRewardRibbon(ribbonIds[i], cc.p(offsetX, offsetY)));
					offsetX += offsetPerReward;
				}
			}

			// show titles
			showPromises.push(new Promise(function (resolve) {
				this.runAction(cc.sequence(
					cc.delayTime(1.0),
					cc.callFunc(function () {
						this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(resolve);
					}.bind(this))
				));
			}.bind(this)));

			return Promise.all(showPromises).then(function () {
				this.setIsContinueOnPressAnywhere(true);
				this.setIsInteractionEnabled(true);
				this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}.bind(this));
		}.bind(this));
	},

	_showRewardRibbon: function (ribbonId, targetScreenPosition) {
		var ribbonRewardNode = new RibbonRewardNode(ribbonId);
		ribbonRewardNode.setPosition(targetScreenPosition);
		this.addChild(ribbonRewardNode);

		return ribbonRewardNode.animateReward(true, false);
	}
	/* endregion REWARD RIBBONS */

});

ProgressionRewardLayer.create = function(layer) {
	return RewardLayer.create(layer || new ProgressionRewardLayer());
};


module.exports = ProgressionRewardLayer;
