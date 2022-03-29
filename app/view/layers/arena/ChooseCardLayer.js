//pragma PKGS: gauntlet
var CONFIG = require('app/common/config');
var EVENTS = require("./../../../common/event_types");
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var RSX = require("app/data/resources");
var UtilsEngine = require('app/common/utils/utils_engine');
var BaseLayer = require("./../BaseLayer");
var BaseParticleSystem = require("./../../nodes/BaseParticleSystem");
var BaseSprite = require('./../../nodes/BaseSprite');
var GlowSprite = require('./../../nodes/GlowSprite');
var CardNode = require('./../../nodes/cards/CardNode');
var ZodiacNode = require('./../../nodes/draw/Zodiac');
var TweenTypes = require('./../../actions/TweenTypes');
var ToneCurve = require('./../../actions/ToneCurve');
var Shake = require('./../../actions/Shake');
var audio_engine = require("./../../../audio/audio_engine");
var Promise = require("bluebird");
var FXRarityFlareSprite = require('./../../nodes/fx/FXRarityFlareSprite');
var i18next = require('i18next')

/****************************************************************************
 ChooseCardLayer
 ****************************************************************************/

var ChooseCardLayer = BaseLayer.extend({

	delegate:null,
	_currentlyHighlightedNode:null,
	_cardNodes:null,
	_fluidPuffNodes:null,
	_particleFountains:null,
	_rarityFlares:null,
	_selectedNode:null,
	_showingAnimationsPromise:null,

	// ui elements
	titleLabel:null,

	ctor:function (arenaData) {
		this._cardNodes = [];
		this._fluidPuffNodes = [];
		this._particleFountains = [];
		this._rarityFlares = [];

		// do super ctor
		this._super();

		this.titleLabel = new cc.LabelTTF("", RSX.font_bold.name, 24, cc.size(500,32), cc.TEXT_ALIGNMENT_CENTER);
		this.titleLabel.setPosition(0,220);
		this.addChild(this.titleLabel);
	},

	showCardOptions:function(cardIds) {
		// wait to show new cards until animations complete
		return (this._showingAnimationsPromise || Promise.resolve()).then(function() {
			// TODO: cache card nodes and reused for each set of card choices, currently there is a bug with keywords not showing correctly when these card nodes are cached
			_.each(this._cardNodes, function (cardNode) {
				cardNode.destroy();
			});
			this._cardNodes = [];

			// reset
			this.resetSelection();

			var isForGenerals = false;
			var revealDelay = 0.0;
			var xPositioningDelta = 260;
			var numCards = cardIds.length;
			for (var i=0; i<numCards; i++) {

				var cardId = cardIds[i];
				var sdkCard = SDK.CardFactory.cardForIdentifier(cardId,SDK.GameSession.current());

				if (sdkCard instanceof SDK.Entity && sdkCard.getIsGeneral()) {
					isForGenerals = true;
				}

				var cardNode = this._cardNodes[i];
				if (!cardNode) {
					cardNode = CardNode.create(sdkCard);
					// Calculate horizontal layout
					var xPosition = ((numCards - 1)*-0.5 + i) * xPositioningDelta * -1; // Cards appear in reverse order thus '* -1'
					cardNode.setPosition(xPosition,0);
					cardNode.setGlowColor(CONFIG.ARENA_CARD_GLOW_COLOR);
					this.addChild(cardNode);
					this._cardNodes.push(cardNode);

					// disabled until fluid sprite texture is fixed
					var fxFluidPuff = BaseSprite.create(RSX.fx_fluid_sphere.name);
					fxFluidPuff.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
					fxFluidPuff.setScale(1.0);
					fxFluidPuff.setPosition(cardNode.getPosition());
					fxFluidPuff.setVisible(false);
					fxFluidPuff.setShaderProgram(cc.shaderCache.programForKey("Colorize"));
					this._fluidPuffNodes.push(fxFluidPuff);
					this.addChild(fxFluidPuff,0);

					var rarityFlare = new FXRarityFlareSprite();
					rarityFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
					rarityFlare.setPosition(cardNode.getPosition().x,cardNode.getPosition().y+50);
					rarityFlare.setVisible(false);
					rarityFlare.setScale(10.0);
					this.addChild(rarityFlare,10);
					this._rarityFlares.push(rarityFlare);
				} else {
					cardNode.setSdkCard(sdkCard);
				}

				var extraDelayTimeForGlow = 0.0;

				if (sdkCard.rarityId > 1) {
					var rarityColor = SDK.RarityFactory.rarityForIdentifier(sdkCard.rarityId).color;

					var fluidSpriteAnimation = UtilsEngine.getAnimationAction(RSX.fx_fluid_sphere.name);
					extraDelayTimeForGlow = fluidSpriteAnimation.getDuration();

					this._rarityFlares[i].setColor(rarityColor);
					this._rarityFlares[i].setVisible(false);

					this._fluidPuffNodes[i].setColor(rarityColor);
					this._fluidPuffNodes[i].setVisible(false);
					this._fluidPuffNodes[i].setFlippedX(Math.random() > 0.5);
					this._fluidPuffNodes[i].setFlippedY(Math.random() > 0.5);
					this._fluidPuffNodes[i].runAction(cc.sequence(
						cc.delayTime(revealDelay + (numCards - i) * 0.4),
						cc.spawn(
							cc.callFunc(function(){

								var flare = this.parent._rarityFlares[this.i];
								flare.setVisible(true);
								flare.setOpacity(0);
								flare.setPhase(1.0);
								flare.runAction(
									cc.sequence(
										cc.fadeIn(0.5),
										cc.delayTime(1.0 + Math.random() * 0.6),
										cc.spawn(
											cc.actionTween(1.0,"phase",1.0,0.25)
										),
										cc.callFunc(function(){
											// this.setVisible(false)
										}.bind(flare))
									)
								);

								this.parent._fluidPuffNodes[this.i].setVisible(true);
								this.parent._fluidPuffNodes[this.i].setOpacity(0);
								// var particles = BaseParticleSystem.create({
								// 	plistFile: RSX.card_reveal_fountain.plist,
								// 	type: "Particles",
								// 	fadeInAtLifePct:0.1,
								// 	fadeOutAtLifePct:0.8
								// });
								// particles.setStartColor(rarityColor);
								// particles.setEndColor(rarityColor);
								// particles.setPosition(this.cardNode.getPosition());
								// particles.setAutoRemoveOnFinish(true);
								// this.parent.addChild(particles,this.i-1);

							}.bind({parent:this,i:i,cardNode:cardNode})),
							cc.spawn(
								cc.fadeIn(1.0),
								fluidSpriteAnimation,
								cc.sequence(
									cc.delayTime(fluidSpriteAnimation.getDuration() - CONFIG.ANIMATE_FAST_DURATION),
									cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)
								)
							)
						),
						cc.callFunc(function(){
							this.setVisible(false);
						}.bind(this._fluidPuffNodes[i]))
					));
				}

				cardNode.setScale(1.0);
				cardNode.setOpacity(255);
				cardNode.setVisible(false);
				cardNode.runAction(
					cc.sequence(
						cc.delayTime(revealDelay + (numCards - i) * 0.4),
						cc.callFunc(function(){
							// play reveal sound
							audio_engine.current().play_effect(RSX.sfx_ui_card_reveal.audio, false);

							// show reveal
							this.setVisible(true);
							this.selectReveal().then(function () {
								this.setGlowing(true, 0.1 + extraDelayTimeForGlow / 2.0);
							}.bind(this));
						}.bind(cardNode))
					)
				);
			}

			if (isForGenerals) {
				this.titleLabel.setString(i18next.t("gauntlet.select_general_label").toUpperCase());
			} else {
				this.titleLabel.setString(i18next.t("gauntlet.select_card_label").toUpperCase());
			}
			this.titleLabel.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
		}.bind(this));
	},

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
		}
	},

	onPointerMove: function(event){
		if (event && event.isStopped) {
			return;
		}

		var mouseOverNode;
		if (!this.hasSelection()) {
			// intersect nodes
			var location = event && event.getLocation();
			if (location) {
				for (var i = 0; i < this._cardNodes.length; i++) {
					var node = this._cardNodes[i];
					if (UtilsEngine.getNodeUnderMouse(node, location.x, location.y)) {
						mouseOverNode = node;
						event.stopPropagation();
						break;
					}
				}
			}
		}
		this.highlightNode(mouseOverNode);
	},

	onPointerUp: function (event) {
		if (event && event.isStopped) {
			return;
		}

		if (!this.hasSelection()) {
			var location = event && event.getLocation();
			if (location) {
				for (var i = 0; i < this._cardNodes.length; i++) {
					var node = this._cardNodes[i];
					if (UtilsEngine.getNodeUnderMouse(node, location.x, location.y)) {
						this.selectNode(node);
						event.stopPropagation();
						break;
					}
				}
			}
		}
	},

	highlightNode: function (node) {
		if (this._currentlyHighlightedNode != node) {
			// cleanup previous
			if (this._currentlyHighlightedNode != null) {
				this._currentlyHighlightedNode.setLocalZOrder(0);
				this._currentlyHighlightedNode.setGlowColor(CONFIG.ARENA_CARD_GLOW_COLOR);
				this._currentlyHighlightedNode.stopShowingInspect();
				this._currentlyHighlightedNode = null;
			}

			if (node != null && !this.hasSelection()) {
				// set new
				this._currentlyHighlightedNode = node;
				var sdkCard = this._currentlyHighlightedNode.getSdkCard();

				// play sound
				audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);

				// show visuals
				this._currentlyHighlightedNode.setLocalZOrder(1);
				this._currentlyHighlightedNode.setGlowColor(CONFIG.ARENA_CARD_GLOW_HIGHLIGHT_COLOR);
				this._currentlyHighlightedNode.showInspect(null, true, null, null, true, true);

				// highlight card
				this.delegate.highlightCard(sdkCard);
			}
		}
	},

	selectNode: function (selectedNode) {
		if (selectedNode != null && !this.hasSelection()) {
			this._selectedNode = selectedNode;
			var selectedSdkCard = this._selectedNode.getSdkCard();

			// play select audio
			audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.SELECT_SFX_PRIORITY);

			// get unselected cards
			var unselectedSdkCards = [];
			for (var i = 0; i < this._cardNodes.length; i++) {
				var node = this._cardNodes[i];
				var sdkCard = node.getSdkCard();
				if (selectedSdkCard !== sdkCard) {
					unselectedSdkCards.push(sdkCard);
				}
			}

			// hide title immediately if selected card is for general
			if (selectedSdkCard instanceof SDK.Entity && selectedSdkCard.getIsGeneral()) {
				this.titleLabel.fadeToInvisible(CONFIG.FADE_FAST_DURATION);
			}

			// set up an async promise that allows us to wait for animations to complete before showing anything else
			this._showingAnimationsPromise = this.showSelectedNode(this._selectedNode).finally(function () {
				this._showingAnimationsPromise = null;
			}.bind(this));

			// select card
			this.delegate.selectCard(selectedSdkCard, unselectedSdkCards).catch(function () {
				// reset if there is a problem
				this.resetSelection();
			}.bind(this));
		}
	},

	showSelectedNode: function (node) {
		return new Promise(function(resolve,reject){
			// emphasize selected card
			node.hideKeywords();
			node.cardBackgroundSprite.highlightIntensity = 6.0;
			node.toggleFadeOutlineSpriteGlow(true);
			node.showShine(0.6,0.4);

			node.runAction(cc.sequence(
				cc.delayTime(0.6),
				cc.callFunc(function(){
					// show outline
					var tempOutline = new BaseSprite(node.getOutlineGlowSprite().getTexture());
					tempOutline.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
					tempOutline.setPosition(node.getPosition());
					tempOutline.setOpacity(0);
					this.addChild(tempOutline);
					tempOutline.runAction(cc.sequence(
						cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION * 0.5),
						cc.delayTime(0.2),
						cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
						cc.callFunc(function(){
							tempOutline.destroy();
						})
					));

					// show particles
					var particles = new BaseParticleSystem(RSX.card_fade.plist);
					particles.setAutoRemoveOnFinish(true);
					particles.setPosition(node.getPosition());
					this.addChild(particles);
				}.bind(this)),
				cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
				cc.delayTime(0.4),
				cc.callFunc(function(){
					node.toggleFadeOutlineSpriteGlow(false,0.0);
					node.setGlowing(false,0.0);
				}.bind(this))
			));

			// deemphasize unselected cards
			for (var i = 0; i < this._cardNodes.length; i++) {
				var otherNode = this._cardNodes[i];
				if (otherNode != node) {
					var tempOutline = new BaseSprite(otherNode.getOutlineGlowSprite().getTexture());
					tempOutline.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
					tempOutline.setPosition(otherNode.getPosition());
					tempOutline.setScale(0.95);
					tempOutline.setOpacity(0);
					this.addChild(tempOutline);

					otherNode.hideKeywords();
					otherNode.setGlowing(false);
					var fadeAction = cc.sequence(
						cc.scaleBy(CONFIG.ANIMATE_FAST_DURATION, 0.9).easing(cc.easeOut(4.0)),
						cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)
					);
					fadeAction.setTag(CONFIG.FADE_TAG);
					otherNode.runAction(fadeAction);

					tempOutline.runAction(cc.sequence(
						cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
						cc.delayTime(0.2),
						cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
						cc.callFunc(function(){
							this.destroy();
						}.bind(tempOutline))
					));
				}
			}

			// wait for animations to complete and resolve
			this._showSelectedCardAction = cc.sequence(
				cc.delayTime(CONFIG.ANIMATE_FAST_DURATION + 1.0),
				cc.callFunc(function(){
					resolve();
				}.bind(this))
			);
			this.runAction(this._showSelectedCardAction);
		}.bind(this));
	},

	hasSelection: function () {
		return this._selectedNode != null;
	},

	resetSelection: function () {
		if (this._showSelectedCardAction != null) {
			this.stopAction(this._showSelectedCardAction);
			this._showSelectedCardAction = null;
		}
		this._selectedNode = null;
		this.highlightNode(null);

		for (var i = 0; i < this._cardNodes.length; i++) {
			var node = this._cardNodes[i];
			node.resetShow();
			node.setGlowColor(CONFIG.ARENA_CARD_GLOW_COLOR);
			node.setGlowing(true);
			node.setLocalZOrder(0);
			node.setScale(1.0);
			node.setOpacity(255.0);
			node.setVisible(true);
		}
	},

	transitionIn: function() {
		return new Promise(function(resolve,reject){
			this.setOpacity(0.0);
			this.runAction(cc.sequence(
				cc.fadeIn(CONFIG.FADE_FAST_DURATION),
				cc.callFunc(function(){
					resolve();
				})
			));
		}.bind(this));
	},

	transitionOut: function() {
		return (this._showingAnimationsPromise || Promise.resolve()).then(function() {
			return new Promise(function(resolve,reject){
				this.runAction(cc.sequence(
					cc.fadeOut(CONFIG.FADE_FAST_DURATION),
					cc.callFunc(function(){
						resolve();
					})
				));
			}.bind(this));
		}.bind(this));
	}

});

ChooseCardLayer.create = function(layer) {
	return BaseLayer.create(layer || new ChooseCardLayer());
};

module.exports = ChooseCardLayer;
