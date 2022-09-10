// pragma PKGS: gauntlet
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const i18next = require('i18next');
const BaseLayer = require('../BaseLayer');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BaseSprite = require('../../nodes/BaseSprite');
const GlowSprite = require('../../nodes/GlowSprite');
const CardNode = require('../../nodes/cards/CardNode');
const ZodiacNode = require('../../nodes/draw/Zodiac');
const TweenTypes = require('../../actions/TweenTypes');
const ToneCurve = require('../../actions/ToneCurve');
const Shake = require('../../actions/Shake');
const audio_engine = require('../../../audio/audio_engine');
const UnitNode = require('../../nodes/cards/UnitNode');
const DeckHistogramNode = require('../../nodes/arena/DeckHistogramNode');

/** **************************************************************************
 DeckStatsLayer
 *************************************************************************** */

const DeckStatsLayer = BaseLayer.extend({

  cards: null,
  cardCounts: null,
  spellCountLabel: null,
  minionCountLabel: null,
  artifactCountLabel: null,
  histogram: null,
  controlBarBackground: null,
  playButton: null,
  resignButton: null,
  _mouseOverButton: null,

  /* region INITIALIZE */

  ctor() {
    this.cards = [];
    this.cardCounts = {};

    // do super ctor
    this._super();

    this.controlBarBackground = new BaseSprite(RSX.gauntlet_control_bar_bg.img);
    this.controlBarBackground.setPosition(0, 20);
    this.addChild(this.controlBarBackground);

    this.cardCountLabel = new cc.LabelTTF('0', RSX.font_bold.name, 16, cc.size(32, 24), cc.TEXT_ALIGNMENT_RIGHT);
    this.cardCountLabel.setAnchorPoint(0, 0);
    this.cardCountLabel.setPosition(175 - 75, -17);
    this.addChild(this.cardCountLabel);

    const cardCountLabelLegend = new cc.LabelTTF(`/  ${CONFIG.MAX_DECK_SIZE_GAUNTLET}`, RSX.font_light.name, 16, cc.size(500, 24), cc.TEXT_ALIGNMENT_LEFT);
    cardCountLabelLegend.setAnchorPoint(0, 0);
    cardCountLabelLegend.setPosition(215 - 75, -17);
    this.addChild(cardCountLabelLegend);

    this.artifactCountLabel = new cc.LabelTTF('0', RSX.font_bold.name, 16, cc.size(32, 24), cc.TEXT_ALIGNMENT_RIGHT);
    this.artifactCountLabel.setAnchorPoint(0, 0);
    this.artifactCountLabel.setPosition(175 - 75, 10);
    this.addChild(this.artifactCountLabel);

    const artifactCountLabelLegend = new cc.LabelTTF(i18next.t('common.artifact_label', { count: 2 }).toUpperCase(), RSX.font_light.name, 16, cc.size(500, 24), cc.TEXT_ALIGNMENT_LEFT);
    artifactCountLabelLegend.setAnchorPoint(0, 0);
    artifactCountLabelLegend.setPosition(215 - 75, 10);
    this.addChild(artifactCountLabelLegend);

    this.spellCountLabel = new cc.LabelTTF('0', RSX.font_bold.name, 16, cc.size(32, 24), cc.TEXT_ALIGNMENT_RIGHT);
    this.spellCountLabel.setAnchorPoint(0, 0);
    this.spellCountLabel.setPosition(175 - 75, 34);
    this.addChild(this.spellCountLabel);

    const spellCountLabelLegend = new cc.LabelTTF(i18next.t('common.spell_label', { count: 2 }).toUpperCase(), RSX.font_light.name, 16, cc.size(500, 24), cc.TEXT_ALIGNMENT_LEFT);
    spellCountLabelLegend.setAnchorPoint(0, 0);
    spellCountLabelLegend.setPosition(215 - 75, 34);
    this.addChild(spellCountLabelLegend);

    this.minionCountLabel = new cc.LabelTTF('0', RSX.font_bold.name, 16, cc.size(32, 24), cc.TEXT_ALIGNMENT_RIGHT);
    this.minionCountLabel.setAnchorPoint(0, 0);
    this.minionCountLabel.setPosition(175 - 75, 58);
    this.addChild(this.minionCountLabel);

    const minionCountLabelLegend = new cc.LabelTTF(i18next.t('common.unit_label', { count: 2 }).toUpperCase(), RSX.font_light.name, 16, cc.size(500, 24), cc.TEXT_ALIGNMENT_LEFT);
    minionCountLabelLegend.setAnchorPoint(0, 0);
    minionCountLabelLegend.setPosition(215 - 75, 58);
    this.addChild(minionCountLabelLegend);

    this.factionLabel = new cc.LabelTTF('', RSX.font_light.name, 18, cc.size(500, 24), cc.TEXT_ALIGNMENT_CENTER);
    this.factionLabel.setAnchorPoint(0.5, 0);
    this.factionLabel.setPosition(-275, 58);
    // this.addChild(this.factionLabel);

    this.cards = [];

    this.histogram = new DeckHistogramNode();
    this.histogram.setPosition(cc.p(-200, 5));
    this.addChild(this.histogram);

    const resignButtonSprite = new ccui.Scale9Sprite(RSX.button_cancel.img);
    const resignButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_cancel_glow.img);
    this.resignButton = new cc.ControlButton(i18next.t('gauntlet.resign_run_button_label').toUpperCase(), resignButtonSprite, 24);
    this.resignButton.setPreferredSize(resignButtonSprite.getContentSize());
    this.resignButton.setAdjustBackgroundImage(false);
    this.resignButton.setZoomOnTouchDown(false);
    this.resignButton.setTitleTTFForState(RSX.font_light.name, cc.CONTROL_STATE_NORMAL);
    this.resignButton.setBackgroundSpriteForState(resignButtonSprite, cc.CONTROL_STATE_NORMAL);
    this.resignButton.setBackgroundSpriteForState(resignButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.resignButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.resignButton.setPosition(-300, 22);
    this.addChild(this.resignButton);

    const confirmButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
    const confirmButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
    this.playButton = new cc.ControlButton(i18next.t('main_menu.menu_item_play').toUpperCase(), confirmButtonSprite, 32);
    this.playButton.setPreferredSize(confirmButtonSprite.getContentSize());
    this.playButton.setAdjustBackgroundImage(false);
    this.playButton.setZoomOnTouchDown(false);
    this.playButton.setTitleTTFForState(RSX.font_bold.name, cc.CONTROL_STATE_NORMAL);
    this.playButton.setBackgroundSpriteForState(confirmButtonSprite, cc.CONTROL_STATE_NORMAL);
    this.playButton.setBackgroundSpriteForState(confirmButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.playButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.playButton.setPosition(314, 22);
    this.addChild(this.playButton);
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
    }
  },

  resetMouseOverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(false);
      this._mouseOverButton = null;
    }
  },

  onPointerMove(event) {
    if (event && event.isStopped) {
      return;
    }

    let mouseOverButton;
    const location = event && event.getLocation();
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

  onPointerUp(event) {
    if (event && event.isStopped) {
      return;
    }

    const location = event && event.getLocation();
    if (location) {
      if (this.resignButton instanceof cc.ControlButton && this.resignButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.resignButton, location.x, location.y)) {
        this.onResignPressed();
      }
      if (this.playButton instanceof cc.ControlButton && this.playButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.playButton, location.x, location.y)) {
        this.onPlayPressed();
      }
    }
  },

  onHoverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(true);
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  onResignPressed() {
    // disable resign button
    this.hideResignButton();

    // play show audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);

    // resign run
    this.delegate.resignArenaRun().catch(() => {
      // reset if there is a problem
      this.showResignButton();
    });
  },

  onPlayPressed() {
    // disable play button
    this.hidePlayButton();

    // play confirm audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

    // resign run
    this.delegate.playArenaRun().catch(() => {
      // reset if there is a problem
      this.showPlayButton();
    });
  },

  /* endregion EVENTS */

  /* region BUTTON STATES */

  showPlayButton() {
    this.playButton.setEnabled(true);
    this.playButton.setOpacity(0.0);
    this.playButton.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
  },

  hidePlayButton() {
    this.playButton.setEnabled(false);
    this.playButton.fadeTo(CONFIG.FADE_FAST_DURATION, 0.0);
  },

  /* endregion BUTTON STATES */

  /* region STATES */

  showDeckStats() {
    this.setVisible(true);
    this.showResignButton();
  },

  hideDeckStats() {
    this.setVisible(false);
  },

  showResignButton() {
    if (this._showStartButtonPromise == null) {
      this._hideStartButtonPromise = null;
      this._showStartButtonPromise = new Promise((resolve, reject) => {
        this.resignButton.setEnabled(true);
        this.resignButton.setOpacity(0.0);
        this.resignButton.stopActionByTag(CONFIG.FADE_TAG);
        const fadeAction = cc.sequence(
          cc.fadeIn(CONFIG.FADE_FAST_DURATION),
          cc.callFunc(() => {
            resolve();
          }),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.resignButton.runAction(fadeAction);
      });
    }
    return this._showStartButtonPromise;
  },

  hideResignButton() {
    if (this._hideStartButtonPromise == null) {
      this._showStartButtonPromise = null;
      this._hideStartButtonPromise = new Promise((resolve, reject) => {
        this.resignButton.setEnabled(false);
        this.resignButton.stopActionByTag(CONFIG.FADE_TAG);
        const fadeAction = cc.sequence(
          cc.fadeOut(CONFIG.FADE_FAST_DURATION),
          cc.callFunc(() => {
            resolve();
          }),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.resignButton.runAction(fadeAction);
      });
    }
    return this._hideStartButtonPromise;
  },

  /* endregion STATES */

  /* region DECK STATE */

  setFactionName(factionName) {
    this.factionLabel.setString(`${factionName.toLocaleUpperCase()}`);
  },

  getCardCountById(cardId) {
    return (this.cardCounts && this.cardCounts[cardId]) || 0;
  },

  bindCards(cardIds) {
    Logger.module('ENGINE').log('DeckStatsLayer -> bindCards');
    this.cardCounts = _.countBy(cardIds, (cId) => cId);

    this.cards = _.map(_.keys(this.cardCounts), (cId) => SDK.CardFactory.cardForIdentifier(parseInt(cId), SDK.GameSession.getInstance()));

    const manaCounts = {};
    let minionCount = 0;
    let spellCount = 0;
    let artifactCount = 0;
    let totalCount = 0;
    _.each(this.cards, (card) => {
      const count = this.getCardCountById(card.getId());

      // set mana count for histogram
      // treat cards with mana cost > 9 as 9 cost cards for deck stats
      const manaCost = Math.max(0, Math.min(9, card.getManaCost()));
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
    });

    this.histogram.bindManaCounts(manaCounts);

    this.minionCountLabel.setString(`${minionCount}`);
    this.spellCountLabel.setString(`${spellCount}`);
    this.artifactCountLabel.setString(`${artifactCount}`);
    this.cardCountLabel.setString(`${totalCount}`);
  },

  addCard(cardId) {
    Logger.module('ENGINE').log('DeckStatsLayer -> addCard', cardId);
    let sdkCard = _.find(this.cards, (card) => card.getId() === cardId);

    // create new card as needed
    if (!sdkCard) {
      sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());
      this.cards.push(sdkCard);
    }

    // update count
    const count = (this.cardCounts[cardId] || 0) + 1;
    this.cardCounts[cardId] = count;

    // update histogram
    const cardType = sdkCard.getType();
    let manaCostForHistogram = sdkCard.getManaCost();
    let manaCount = 0;
    let histogramCount = 0;
    let countLabel;
    if (sdkCard instanceof SDK.Spell) {
      countLabel = this.spellCountLabel;
    } else if (sdkCard instanceof SDK.Artifact) {
      countLabel = this.artifactCountLabel;
    } else {
      countLabel = this.minionCountLabel;
    }
    let totalCount = 0;

    // treat cards with mana cost > 9 as 9 cost cards for deck histogram
    if (manaCostForHistogram > 9) {
      manaCostForHistogram = 9;
    }
    _.each(this.cards, (card) => {
      const cardCount = this.getCardCountById(card.getId());

      // update mana count at cost
      // treat cards with mana cost > 9 as 9 cost cards for deck stats
      const manaCost = Math.max(0, Math.min(9, card.getManaCost()));
      if (manaCost === manaCostForHistogram) {
        manaCount += cardCount;
      }

      // check card type
      if (card.getType() === cardType) {
        histogramCount += cardCount;
      }

      // count all cards
      totalCount += cardCount;
    });
    this.histogram.addItem(manaCostForHistogram, manaCount);
    countLabel.setString(`${histogramCount}`);
    this.cardCountLabel.setString(`${totalCount}`);
  },

  /* endregion DECK STATE */

});

DeckStatsLayer.create = function (layer) {
  return BaseLayer.create(layer || new DeckStatsLayer());
};

module.exports = DeckStatsLayer;
