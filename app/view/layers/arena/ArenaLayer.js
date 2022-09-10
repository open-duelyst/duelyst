// pragma PKGS: gauntlet
const RSX = require('app/data/resources');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const generatePushID = require('app/common/generate_push_id');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const UtilsEngine = require('app/common/utils/utils_engine');
const FXCompositeLayer = require('../FXCompositeLayer');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BaseSprite = require('../../nodes/BaseSprite');
const GlowSprite = require('../../nodes/GlowSprite');
const CardNode = require('../../nodes/cards/CardNode');
const ZodiacNode = require('../../nodes/draw/Zodiac');
const TweenTypes = require('../../actions/TweenTypes');
const ToneCurve = require('../../actions/ToneCurve');
const Shake = require('../../actions/Shake');
const audio_engine = require('../../../audio/audio_engine');
const FXFbmNoiseRaysSprite = require('../../nodes/fx/FXFbmNoiseRaysSprite');
const FXFbmNoiseGradientMaskedSprite = require('../../nodes/fx/FXFbmNoiseGradientMaskedSprite');
const ChooseFactionLayer = require('./ChooseFactionLayer');
const ChooseCardLayer = require('./ChooseCardLayer');
const DeckLayer = require('./DeckLayer');
const DeckStatsLayer = require('./DeckStatsLayer');
const RunLayer = require('./RunLayer');
const StartLayer = require('./StartLayer');
const RewardsLayer = require('./RewardsLayer');

/** **************************************************************************
 ArenaLayer
 *************************************************************************** */

const ArenaLayer = FXCompositeLayer.extend({

  bgGradientSprite: null,
  bgRaysSprite: null,
  bgHexSprite: null,
  vignette: null,
  crestSprite: null,
  keyBladeBgSprite: null,

  // layer on top
  outerLayer: null,
  deckLayer: null,
  deckStatsLayer: null,

  delegate: null,
  dataSource: null,

  // ui elements
  titleLabel: null,

  // z order
  _z_order_faction: 1,
  _z_order_content: 2,
  _z_order_deck: 3,

  _requestId: null,

  /* region INITIALIZE */

  ctor() {
    // generate unique id for requests
    this._requestId = generatePushID();

    this.bgGradientSprite = new BaseSprite(RSX.bg_gradient.img);

    this.bgHexSprite = FXFbmNoiseGradientMaskedSprite.create(RSX.bg_hex.img);
    this.bgHexSprite.setScale(0.6);
    this.bgHexSprite.setXYZRotation({ x: 70, y: 0, z: 0 });
    this.bgHexSprite.setOpacity(90);

    this.vignette = new BaseSprite(RSX.vignette.img);

    this.keyBladeBgSprite = new BaseSprite(RSX.key_blade_6.img);
    this.keyBladeBgSprite.setVisible(false);

    this.bgRaysSprite = FXFbmNoiseRaysSprite.create();
    this.bgRaysSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    this.bgRaysSprite.setOpacity(150);
    this.bgRaysSprite.setOpacity(150);

    this.bgBubblesParticleSystem = new BaseParticleSystem({
      plistFile: RSX.bubbles.plist,
      fadeInAtLifePct: 0.05,
      fadeOutAtLifePct: 0.95,
    });

    this.deckLayer = new DeckLayer();
    this.deckLayer.setAnchorPoint(0, 0);

    this.deckStatsLayer = new DeckStatsLayer();
    this.deckStatsLayer.setVisible(false);
    this.deckStatsLayer.delegate = this;

    // do super ctor
    this._super();

    this.getFXLayer().addChild(this.bgGradientSprite);
    this.getFXLayer().addChild(this.keyBladeBgSprite);
    this.getFXLayer().addChild(this.vignette);
    // this.getFXLayer().addChild(this.bgHexSprite);
    this.getFXLayer().addChild(this.bgRaysSprite);
    this.getFXLayer().addChild(this.bgBubblesParticleSystem);
    this.getNoFXLayer().addChild(this.deckStatsLayer, this._z_order_deck);
    this.getNoFXLayer().addChild(this.deckLayer, this._z_order_deck);
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    FXCompositeLayer.prototype.onResize.apply(this, arguments);

    const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

    if (this.outerLayer) this.outerLayer.setPosition(winCenterPosition);

    this.bgGradientSprite.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.bgGradientSprite));
    this.bgGradientSprite.setPosition(winCenterPosition);

    this.bgRaysSprite.setScaleX(UtilsEngine.getWindowWidthRelativeNodeScale(this.bgRaysSprite));
    this.bgRaysSprite.setScaleY(1.5);
    this.bgRaysSprite.setAnchorPoint(0.5, 1.0);
    this.bgRaysSprite.setPosition(winCenterPosition.x, UtilsEngine.getGSIWinTop());

    this.vignette.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.vignette));
    this.vignette.setAnchorPoint(0.5, 0.5);
    this.vignette.setPosition(winCenterPosition.x, winCenterPosition.y);

    this.keyBladeBgSprite.setPosition(winCenterPosition.x, winCenterPosition.y);

    this.bgHexSprite.setPosition(winCenterPosition.x, winCenterPosition.y - 100);
    this.bgHexSprite.setScaleY(0.2);

    this.bgBubblesParticleSystem.setPosVar(cc.p(UtilsEngine.getGSIWinRight(), 100.0));
    this.bgBubblesParticleSystem.setPosition(winCenterPosition.x, UtilsEngine.getGSIWinTop() - 100.0);

    if (this._crestNode) {
      this._crestNode.setPosition(winCenterPosition.x, winCenterPosition.y + 150);
    }

    if (this._portrait) {
      this._portrait.setPosition(winCenterPosition.x, winCenterPosition.y + 320);
    }

    this.deckLayer.setPosition(UtilsEngine.getGSIWinRight() - 260.0, UtilsEngine.getGSIWinBottom());

    this.deckStatsLayer.setPosition(winCenterPosition.x, winCenterPosition.y - 320);
  },

  /* endregion LAYOUT */

  /* region EVENTS */

  onEnter() {
    this._super();

    audio_engine.current().play_music(RSX.music_gauntlet.audio);

    // change gradient color mapping
    this.getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, cc.color(64, 226, 255, 255), cc.color(0, 24, 49, 255));
  },

  onExit() {
    this._super();

    // reset gradient color mapping
    this.getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  /* endregion EVENTS */

  /* region UTILITY */

  /**
   * Calls delegate start arena method.
   * @returns {Promise}
   */
  startNewArenaRun() {
    return this.delegate.startNewArenaRun();
  },

  /**
   * Open purchase dialog.
   * @returns {Promise}
   */
  purchaseTicket() {
    return this.delegate.purchaseTicket();
  },

  /**
   * Calls delegate play arena method.
   * @returns {Promise}
   */
  playArenaRun() {
    return this.delegate.startLookingForGame();
  },

  /**
   * Calls delegate resign arena method.
   * @returns {Promise}
   */
  resignArenaRun() {
    return this.delegate.resignArenaRun();
  },

  /**
   * Transitions the current screen out.
   * @returns {Promise}
   */
  transitionCurrentScreenOut() {
    this.keyBladeBgSprite.stopAllActions();
    this.keyBladeBgSprite.runAction(cc.fadeTo(0.2, 0.0));

    if (this.outerLayer) {
      return this.outerLayer.transitionOut().then(() => {
        this.outerLayer.destroy();
        this.outerLayer = null;
      });
    }
    return Promise.resolve();
  },

  /**
   * Shows visuals for a general and faction, or clears current visuals if none provided.
   * @param {String} [factionId=null]
   * @param {String} [generalId=null]
   */
  showFactionVisualsForFactionId(factionId, generalId) {
    if (factionId != null) {
      const factionData = SDK.FactionFactory.factionForIdentifier(factionId);
      this.deckStatsLayer.setFactionName(factionData.name);
    } else {
      this.deckStatsLayer.setFactionName('');
    }
    this.showBackgroundCrestForFactionId(factionId);
    this.showPortraitForFactionId(factionId, generalId);
  },

  /**
   * Shows a background crest by faction id, or clears current if none provided.
   * @param {String} [factionId=null]
   */
  showBackgroundCrestForFactionId(factionId) {
    if (this._crestNodesByFactionId == null) {
      this._crestNodesByFactionId = {};
    }

    if (this._crestNode == null || this._crestNode._factionId !== factionId) {
      // animate current out
      if (this._crestNode != null) {
        this._crestNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
        this._crestNode = null;
      }

      // show new
      if (factionId != null) {
        this._crestNode = this._crestNodesByFactionId[factionId];

        if (this._crestNode == null) {
          this._crestNode = new BaseSprite();
          this._crestNode.setRequiredTextureResource(SDK.FactionFactory.getCrestResourceForFactionId(factionId));
          const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
          this._crestNode.setPosition(winCenterPosition.x, winCenterPosition.y + 150);
          this._crestNode.setScale(0.75);
          this._crestNode._factionId = factionId;
          this._crestNodesByFactionId[factionId] = this._crestNode;
          this.getFXLayer().addChild(this._crestNode);
        }

        this._crestNode.setOpacity(0);
        this._crestNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 100);
      }
    }
  },

  /**
   * Shows a portrait by general id, if no general id then by faction id, or clears current if none provided.
   * @param {String} [factionId=null]
   * @param {String} [generalId=null]
   */
  showPortraitForFactionId(factionId, generalId) {
    if (this._portraitsByGeneralId == null) {
      this._portraitsByGeneralId = {};
    }

    if (this._portraitsByFactionId == null) {
      this._portraitsByFactionId = {};
    }

    if (this._portrait == null || this._portrait._generalId != generalId) {
      // animate current out
      if (this._portrait != null) {
        this._portrait.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
        this._portrait = null;
      }

      // show new
      if (generalId != null) {
        // show new general portrait by general id
        this._portrait = this._portraitsByGeneralId[generalId];

        if (this._portrait == null) {
          const generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);
          const portraitHexResource = generalCard.getPortraitHexResource();
          this._portrait = BaseSprite.create();
          this._portrait.setRequiredTextureResource(portraitHexResource);
          const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
          this._portrait.setPosition(winCenterPosition.x, winCenterPosition.y + 285);
          this._portrait.setScale(0.5);
          this._portrait._generalId = generalId;
          this._portraitsByGeneralId[generalId] = this._portrait;
          this.getNoFXLayer().addChild(this._portrait, this._z_order_faction);
        }

        this._portrait.setVisible(false);
        this._portrait.whenRequiredResourcesReady().then((requestId) => {
          if (!this._portrait.getAreResourcesValid(requestId)) return; // resources have been invalidated
          this._portrait.setVisible(true);

          // animate in
          this._portrait.setOpacity(0.0);
          this._portrait.fadeTo(CONFIG.FADE_FAST_DURATION, 255);
        });
      }
    }
  },

  /**
   * Shows a shake effect on the currently active layer.
   * @param {Number} [delay=0.0]
   * @param {Number} [duration=0.5]
   * @param {Number} [strength=5.0]
   * @returns {Promise}
   */
  showShake(delay, duration, strength) {
    return new Promise((resolve, reject) => {
      if (this.outerLayer != null) {
        if (delay == null) { delay = 0.0; }
        if (duration == null) { duration = 0.5; }
        if (strength == null) { strength = 5.0; }
        this.outerLayer.runAction(cc.sequence(
          cc.delayTime(delay),
          Shake.create(duration, strength, UtilsEngine.getGSIWinCenterPosition()),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      } else {
        resolve();
      }
    });
  },

  /* endregion UTILITY */

  /* region START SCREEN */

  /**
   * Shows start arena run visuals.
   * @returns {Promise}
   */
  showStartArenaRunScreen() {
    this.showFactionVisualsForFactionId(null, null);

    return this.transitionCurrentScreenOut().then(() => {
      // create new layer for starting a new run
      const ticketCount = this.dataSource.getTicketCount();

      this.keyBladeBgSprite.stopAllActions();
      this.keyBladeBgSprite.setVisible(true);
      this.keyBladeBgSprite.setScale(0.75);
      this.keyBladeBgSprite.setOpacity(125);
      this.keyBladeBgSprite.runAction(cc.spawn(
        // cc.fadeTo(10.0,125),
        cc.scaleTo(20.0, 1.25),
      ));

      this.outerLayer = new StartLayer(ticketCount);
      this.outerLayer.delegate = this;
      this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());
      this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);

      this.deckLayer.hideDeck();
      this.deckStatsLayer.hideDeckStats();

      return this.outerLayer.transitionIn();
    });
  },

  /* endregion START SCREEN */

  /* region FACTION SCREEN */

  /**
   * Shows faction selection visuals for data.
   * @param {Object} arenaRunData
   * @returns {Promise}
   */
  showFactionSelectScreen(arenaRunData) {
    this.showFactionVisualsForFactionId(null, null);

    return this.transitionCurrentScreenOut().then(() => {
      // create new layer for faction choices
      this.outerLayer = new ChooseFactionLayer(arenaRunData);
      this.outerLayer.delegate = this;
      this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());
      this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);

      this.deckLayer.hideDeck();
      this.deckStatsLayer.hideDeckStats();

      return this.outerLayer.transitionIn().then(() => this.outerLayer.showFactionOptions(arenaRunData.faction_choices));
    });
  },

  /**
   * Highlights a faction by id.
   * @param {String} factionId
   */
  highlightFaction(factionId) {
    this.showBackgroundCrestForFactionId(factionId);
  },

  /**
   * Selects a faction by id and calls the delegate selection.
   * @param {String} factionId
   * @returns {Promise}
   */
  selectFaction(factionId) {
    this.showFactionVisualsForFactionId(factionId, null);
    return this.delegate.selectFaction(factionId);
  },

  /* endregion FACTION SCREEN */

  /* region CARD SCREEN */

  /**
   * Shows card selection visuals for data.
   * @param {Object} arenaRunData
   * @returns {Promise}
   */
  showCardSelectScreen(arenaRunData) {
    // show choose card layer as needed
    // choose card layer should be reused until all card selections are made
    let transitionPromise;
    let showScreenPromise;

    // hide play button for now
    this.deckStatsLayer.hidePlayButton();

    if (!(this.outerLayer instanceof ChooseCardLayer)) {
      transitionPromise = this.transitionCurrentScreenOut();
      showScreenPromise = transitionPromise.then(() => {
        this.outerLayer = new ChooseCardLayer(arenaRunData);
        this.outerLayer.delegate = this;
        this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());
        this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);

        return this.outerLayer.transitionIn();
      });
    } else {
      transitionPromise = Promise.resolve();
      showScreenPromise = Promise.resolve();
    }

    // immediately after transition
    transitionPromise = transitionPromise.then(() => {
      this.showFactionVisualsForFactionId(arenaRunData.faction_id, arenaRunData.general_id);
      this.deckLayer.showDeck();
      this.deckStatsLayer.showDeckStats();
    });

    // show card options after showing new screen
    return showScreenPromise.then(() => {
      // Switch between displaying either general choices or card choices, general choices gets priority
      if (arenaRunData.general_choices != null) {
        this.outerLayer.showCardOptions(arenaRunData.general_choices);
      } else {
        this.outerLayer.showCardOptions(arenaRunData.card_choices);
      }
    });
  },

  highlightCard(highlightedSdkCard) {

  },

  /**
   * Selects a card by reference and calls the delegate selection.
   * @param {SDK.Card} selectedSdkCard
   * @param {Array} unselectedSdkCards list of cards not selected
   * @returns {Promise}
   */
  selectCard(selectedSdkCard, unselectedSdkCards) {
    const selectCardPromise = this.delegate.selectCard(selectedSdkCard, unselectedSdkCards);

    // wait for select to resolve and then add the card to deck
    selectCardPromise.then(() => {
      this.addCardToDeck(selectedSdkCard.getId());
      if (selectedSdkCard != null && selectedSdkCard instanceof SDK.Entity && selectedSdkCard.getIsGeneral()) {
        this.showFactionVisualsForFactionId(selectedSdkCard.getFactionId(), selectedSdkCard.getId());
      }
    });

    return selectCardPromise;
  },

  bindDeck(deckCards) {
    if (deckCards == null) { deckCards = []; }
    this.deckStatsLayer.bindCards(deckCards);
    this.deckLayer.bindCards(deckCards);
  },

  addCardToDeck(cardId) {
    this.deckStatsLayer.addCard(cardId);
    this.deckLayer.addCard(cardId);
  },

  /* endregion CARD SCREEN */

  /* region RUN SCREEN */

  /**
   * Shows arena run screen for data.
   * @param arenaRunData
   * @returns {Promise}
   */
  showArenaRunScreen(arenaRunData, wonLastGauntletGame) {
    return this.transitionCurrentScreenOut().then(() => {
      this.outerLayer = new RunLayer(arenaRunData, wonLastGauntletGame);
      this.outerLayer.delegate = this;
      this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());
      this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);

      this.deckLayer.showDeck();
      this.deckStatsLayer.showDeckStats();
      this.deckStatsLayer.showPlayButton();

      const generalId = this.dataSource.getArenaRunGeneralId();
      this.showFactionVisualsForFactionId(arenaRunData.faction_id, generalId);

      return this.outerLayer.transitionIn();
    });
  },

  /* endregion RUN SCREEN */

  /* region REWARDS SCREEN */

  /**
   * Shows arena rewards screen for data.
   * @param arenaRunData
   * @returns {Promise}
   */
  showArenaRewardsScreen(arenaRunData) {
    // show rewards layer as needed
    // rewards layer should be reused until rewards have been claimed
    let transitionPromise;
    let showScreenPromise;
    if (!(this.outerLayer instanceof RewardsLayer)) {
      transitionPromise = this.transitionCurrentScreenOut();
      showScreenPromise = transitionPromise.then(() => {
        this.outerLayer = new RewardsLayer(arenaRunData);
        this.outerLayer.delegate = this;
        this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());
        this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);

        return this.outerLayer.transitionIn();
      });
    } else {
      transitionPromise = Promise.resolve();
      showScreenPromise = Promise.resolve();
    }

    // immediately after transition
    transitionPromise = transitionPromise.then(() => {
      const generalId = this.dataSource.getArenaRunGeneralId();
      this.showFactionVisualsForFactionId(arenaRunData.faction_id, generalId);
      this.deckLayer.hideDeck();
      this.deckStatsLayer.hideDeckStats();
    });

    // show rewards after showing new screen
    return showScreenPromise.then(() => {
      this.outerLayer.showRewards(arenaRunData);
    });
  },

  claimArenaRewards() {
    return this.delegate.claimArenaRewards();
  },

  markArenaRewardsAsSeen() {
    return this.delegate.markArenaRewardsAsSeen();
  },

  /* endregion REWARDS SCREEN */

});

ArenaLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new ArenaLayer());
};

module.exports = ArenaLayer;
