//pragma PKGS: gauntlet
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EVENTS = require('app/common/event_types');
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
var UnitNode = require("./../../nodes/cards/UnitNode");
var DeckHistogramNode = require("./../../nodes/arena/DeckHistogramNode");
var i18next = require('i18next')

/****************************************************************************
 DeckStatsLayer
 ****************************************************************************/

var DeckStatsLayer = BaseLayer.extend({

	cards:null,
	cardCounts:null,
	spellCountLabel:null,
	minionCountLabel:null,
	artifactCountLabel:null,
	histogram:null,
	controlBarBackground:null,
	playButton:null,
	resignButton:null,
	_mouseOverButton:null,

	/* region INITIALIZE */

	ctor:function () {
		this.cards = [];
		this.cardCounts = {};

		// do super ctor
		this._super();

		this.controlBarBackground = new BaseSprite(RSX.gauntlet_control_bar_bg.img);
		this.controlBarBackground.setPosition(0,20);
		this.addChild(this.controlBarBackground);

		this.cardCountLabel = new cc.LabelTTF("0", RSX.font_bold.name, 16, cc.size(32,24), cc.TEXT_ALIGNMENT_RIGHT);
		this.cardCountLabel.setAnchorPoint(0,0);
		this.cardCountLabel.setPosition(175-75,-17);
		this.addChild(this.cardCountLabel);

		var cardCountLabelLegend = new cc.LabelTTF("/  " + CONFIG.MAX_DECK_SIZE_GAUNTLET, RSX.font_light.name, 16, cc.size(500,24), cc.TEXT_ALIGNMENT_LEFT);
		cardCountLabelLegend.setAnchorPoint(0,0);
		cardCountLabelLegend.setPosition(215-75,-17);
		this.addChild(cardCountLabelLegend);

		this.artifactCountLabel = new cc.LabelTTF("0", RSX.font_bold.name, 16, cc.size(32,24), cc.TEXT_ALIGNMENT_RIGHT);
		this.artifactCountLabel.setAnchorPoint(0,0);
		this.artifactCountLabel.setPosition(175-75,10);
		this.addChild(this.artifactCountLabel);

		var artifactCountLabelLegend = new cc.LabelTTF(i18next.t("common.artifact_label",{count:2}).toUpperCase(), RSX.font_light.name, 16, cc.size(500,24), cc.TEXT_ALIGNMENT_LEFT);
		artifactCountLabelLegend.setAnchorPoint(0,0);
		artifactCountLabelLegend.setPosition(215-75,10);
		this.addChild(artifactCountLabelLegend);

		this.spellCountLabel = new cc.LabelTTF("0", RSX.font_bold.name, 16, cc.size(32,24), cc.TEXT_ALIGNMENT_RIGHT);
		this.spellCountLabel.setAnchorPoint(0,0);
		this.spellCountLabel.setPosition(175-75,34);
		this.addChild(this.spellCountLabel);

		var spellCountLabelLegend = new cc.LabelTTF(i18next.t("common.spell_label",{count:2}).toUpperCase(), RSX.font_light.name, 16, cc.size(500,24), cc.TEXT_ALIGNMENT_LEFT);
		spellCountLabelLegend.setAnchorPoint(0,0);
		spellCountLabelLegend.setPosition(215-75,34);
		this.addChild(spellCountLabelLegend);

		this.minionCountLabel = new cc.LabelTTF("0", RSX.font_bold.name, 16, cc.size(32,24), cc.TEXT_ALIGNMENT_RIGHT);
		this.minionCountLabel.setAnchorPoint(0,0);
		this.minionCountLabel.setPosition(175-75,58);
		this.addChild(this.minionCountLabel);

		var minionCountLabelLegend = new cc.LabelTTF(i18next.t("common.unit_label",{count:2}).toUpperCase(), RSX.font_light.name, 16, cc.size(500,24), cc.TEXT_ALIGNMENT_LEFT);
		minionCountLabelLegend.setAnchorPoint(0,0);
		minionCountLabelLegend.setPosition(215-75,58);
		this.addChild(minionCountLabelLegend);

		this.factionLabel = new cc.LabelTTF("", RSX.font_light.name, 18, cc.size(500,24), cc.TEXT_ALIGNMENT_CENTER);
		this.factionLabel.setAnchorPoint(0.5,0);
		this.factionLabel.setPosition(-275,58);
		// this.addChild(this.factionLabel);

		this.cards = [];

		this.histogram = new DeckHistogramNode();
		this.histogram.setPosition(cc.p(-200,5));
		this.addChild(this.histogram);

		var resignButtonSprite = new ccui.Scale9Sprite(RSX.button_cancel.img);
		var resignButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_cancel_glow.img);
		this.resignButton = new cc.ControlButton(i18next.t("gauntlet.resign_run_button_label").toUpperCase(), resignButtonSprite, 24);
		this.resignButton.setPreferredSize(resignButtonSprite.getContentSize());
		this.resignButton.setAdjustBackgroundImage(false);
		this.resignButton.setZoomOnTouchDown(false);
		this.resignButton.setTitleTTFForState(RSX.font_light.name,cc.CONTROL_STATE_NORMAL);
		this.resignButton.setBackgroundSpriteForState(resignButtonSprite,cc.CONTROL_STATE_NORMAL);
		this.resignButton.setBackgroundSpriteForState(resignButtonGlowSprite,cc.CONTROL_STATE_HIGHLIGHTED);
		this.resignButton.setTitleColorForState(cc.color(255,255,255),cc.CONTROL_STATE_NORMAL);
		this.resignButton.setPosition(-300,22);
		this.addChild(this.resignButton);

		var confirmButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
		var confirmButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
		this.playButton = new cc.ControlButton(i18next.t("main_menu.menu_item_play").toUpperCase(), confirmButtonSprite, 32);
		this.playButton.setPreferredSize(confirmButtonSprite.getContentSize());
		this.playButton.setAdjustBackgroundImage(false);
		this.playButton.setZoomOnTouchDown(false);
		this.playButton.setTitleTTFForState(RSX.font_bold.name,cc.CONTROL_STATE_NORMAL);
		this.playButton.setBackgroundSpriteForState(confirmButtonSprite,cc.CONTROL_STATE_NORMAL);
		this.playButton.setBackgroundSpriteForState(confirmButtonGlowSprite,cc.CONTROL_STATE_HIGHLIGHTED);
		this.playButton.setTitleColorForState(cc.color(255,255,255),cc.CONTROL_STATE_NORMAL);
		this.playButton.setPosition(314,22);
		this.addChild(this.playButton);
	},

	/* endregion INITIALIZE */

	/* region EVENTS */

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
			scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
		}
	},

	resetMouseOverButton: function () {
		if (this._mouseOverButton != null) {
			this._mouseOverButton.setHighlighted(false);
			this._mouseOverButton = null;
		}
	},

	onPointerMove: function(event) {
		if (event && event.isStopped) {
			return;
		}

		var mouseOverButton;
		var location = event && event.getLocation();
		if (location) {
			if (this.resignButton instanceof cc.ControlButton && this.resignButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.resignButton, location.x, location.y)) {
				mouseOverButton = this.resignButton;
			}
			if (this.playButton instanceof cc.ControlButton && this.playButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.playButton, location.x, location.y)) {
				mouseOverButton = this.playButton;
			}
		}

		if (this._mouseOverButton != mouseOverButton) {
			this.resetMouseOverButton();

			this._mouseOverButton = mouseOverButton;

			if (this._mouseOverButton != null) {
				this.onHoverButton();
			}
		}
	},

	onPointerUp: function(event) {
		if (event && event.isStopped) {
			return;
		}

		var location = event && event.getLocation();
		if (location) {
			if (this.resignButton instanceof cc.ControlButton && this.resignButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.resignButton, location.x, location.y)) {
				this.onResignPressed();
			}
			if (this.playButton instanceof cc.ControlButton && this.playButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.playButton, location.x, location.y)) {
				this.onPlayPressed();
			}
		}
	},

	onHoverButton: function () {
		if (this._mouseOverButton != null) {
			this._mouseOverButton.setHighlighted(true);
			audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
		}
	},

	onResignPressed: function (){
		// disable resign button
		this.hideResignButton();

		// play show audio
		audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);

		// resign run
		this.delegate.resignArenaRun().catch(function () {
			// reset if there is a problem
			this.showResignButton();
		}.bind(this));
	},

	onPlayPressed: function (){
		// disable play button
		this.hidePlayButton();

		// play confirm audio
		audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

		// resign run
		this.delegate.playArenaRun().catch(function () {
			// reset if there is a problem
			this.showPlayButton();
		}.bind(this));
	},

	/* endregion EVENTS */

	/* region BUTTON STATES */

	showPlayButton: function () {
		this.playButton.setEnabled(true);
		this.playButton.setOpacity(0.0);
		this.playButton.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
	},

	hidePlayButton: function () {
		this.playButton.setEnabled(false);
		this.playButton.fadeTo(CONFIG.FADE_FAST_DURATION, 0.0);
	},

	/* endregion BUTTON STATES */

	/* region STATES */

	showDeckStats: function () {
		this.setVisible(true);
		this.showResignButton();
	},

	hideDeckStats: function () {
		this.setVisible(false);
	},

	showResignButton: function () {
		if (this._showStartButtonPromise == null) {
			this._hideStartButtonPromise = null;
			this._showStartButtonPromise = new Promise(function (resolve, reject) {
				this.resignButton.setEnabled(true);
				this.resignButton.setOpacity(0.0);
				this.resignButton.stopActionByTag(CONFIG.FADE_TAG);
				var fadeAction = cc.sequence(
					cc.fadeIn(CONFIG.FADE_FAST_DURATION),
					cc.callFunc(function () {
						resolve();
					})
				);
				fadeAction.setTag(CONFIG.FADE_TAG);
				this.resignButton.runAction(fadeAction);
			}.bind(this));
		}
		return this._showStartButtonPromise;
	},

	hideResignButton: function () {
		if (this._hideStartButtonPromise == null) {
			this._showStartButtonPromise = null;
			this._hideStartButtonPromise = new Promise(function (resolve, reject) {
				this.resignButton.setEnabled(false);
				this.resignButton.stopActionByTag(CONFIG.FADE_TAG);
				var fadeAction = cc.sequence(
					cc.fadeOut(CONFIG.FADE_FAST_DURATION),
					cc.callFunc(function () {
						resolve();
					})
				);
				fadeAction.setTag(CONFIG.FADE_TAG);
				this.resignButton.runAction(fadeAction);
			}.bind(this));
		}
		return this._hideStartButtonPromise;
	},

	/* endregion STATES */

	/* region DECK STATE */

	setFactionName: function (factionName) {
		this.factionLabel.setString("" + factionName.toLocaleUpperCase());
	},

	getCardCountById: function (cardId) {
		return (this.cardCounts && this.cardCounts[cardId]) || 0;
	},

	bindCards: function(cardIds) {
		Logger.module("ENGINE").log("DeckStatsLayer -> bindCards");
		this.cardCounts = _.countBy(cardIds,function(cId) { return cId; });

		this.cards = _.map(_.keys(this.cardCounts),function(cId) {
			return SDK.CardFactory.cardForIdentifier(parseInt(cId),SDK.GameSession.getInstance());
		});

		var manaCounts = {};
		var minionCount = 0;
		var spellCount = 0;
		var artifactCount = 0;
		var totalCount = 0;
		_.each(this.cards,function(card) {
			var count = this.getCardCountById(card.getId());

			// set mana count for histogram
			// treat cards with mana cost > 9 as 9 cost cards for deck stats
			var manaCost = Math.max(0, Math.min(9, card.getManaCost()))
			manaCounts[manaCost] = (manaCounts[manaCost] || 0) + count;

			// check card type
			if (card instanceof SDK.Spell) {
				spellCount += count;
			} else if (card instanceof SDK.Artifact) {
				artifactCount += count;
			} else {
				minionCount += count;
			}

			// count all cards
			totalCount += count;
		}.bind(this));

		this.histogram.bindManaCounts(manaCounts);

		this.minionCountLabel.setString(""+minionCount);
		this.spellCountLabel.setString(""+spellCount);
		this.artifactCountLabel.setString(""+artifactCount);
		this.cardCountLabel.setString(""+ totalCount);
	},

	addCard: function(cardId) {
		Logger.module("ENGINE").log("DeckStatsLayer -> addCard", cardId);
		var sdkCard = _.find(this.cards,function(card) {
			return card.getId() === cardId;
		});

		// create new card as needed
		if (!sdkCard) {
			sdkCard = SDK.CardFactory.cardForIdentifier(cardId,SDK.GameSession.getInstance());
			this.cards.push(sdkCard);
		}

		// update count
		var count = (this.cardCounts[cardId] || 0) + 1;
		this.cardCounts[cardId] = count;

		// update histogram
		var cardType = sdkCard.getType();
		var manaCostForHistogram = sdkCard.getManaCost();
		var manaCount = 0;
		var histogramCount = 0;
		var countLabel;
		if (sdkCard instanceof SDK.Spell) {
			countLabel = this.spellCountLabel;
		} else if (sdkCard instanceof SDK.Artifact) {
			countLabel = this.artifactCountLabel;
		} else {
			countLabel = this.minionCountLabel
		}
		var totalCount = 0;

		// treat cards with mana cost > 9 as 9 cost cards for deck histogram
		if (manaCostForHistogram > 9) {
			manaCostForHistogram = 9
		}
		_.each(this.cards,function(card) {
			var cardCount = this.getCardCountById(card.getId());

			// update mana count at cost
			// treat cards with mana cost > 9 as 9 cost cards for deck stats
			var manaCost = Math.max(0, Math.min(9, card.getManaCost()))
			if (manaCost === manaCostForHistogram) {
				manaCount += cardCount;
			}

			// check card type
			if (card.getType() === cardType) {
				histogramCount += cardCount;
			}

			// count all cards
			totalCount += cardCount;
		}.bind(this));
		this.histogram.addItem(manaCostForHistogram, manaCount);
		countLabel.setString("" + histogramCount);
		this.cardCountLabel.setString(""+ totalCount);
	}

	/* endregion DECK STATE */

});

DeckStatsLayer.create = function(layer) {
	return BaseLayer.create(layer || new DeckStatsLayer());
};

module.exports = DeckStatsLayer;
