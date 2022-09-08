// pragma PKGS: rift
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
const ChooseCardLayer = require('./ChooseCardLayer');
const UpgradeCardLayer = require('./UpgradeCardLayer');
const SelectCardFromDeckLayer = require('./SelectCardFromDeckLayer');
const UpgradeInstructionsLayer = require('./UpgradeInstructionsLayer');
const DeckLayer = require('./DeckLayer');
const RunLayer = require('./RunLayer');

/** **************************************************************************
 RiftLayer
 *************************************************************************** */

const RiftLayer = FXCompositeLayer.extend({

  bgGradientSprite: null,
  bgRaysSprite: null,
  vignette: null,
  crestSprite: null,
  riftGlowLineSprite: null,

  // layer on top
  outerLayer: null,
  deckLayer: null,

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

    this.vignette = new BaseSprite(RSX.vignette.img);

    this.riftGlowLineSprite = new BaseSprite(RSX.rift_glow_line.img);
    this.riftGlowLineSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);

    this.bgRaysSprite = FXFbmNoiseRaysSprite.create();
    this.bgRaysSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    this.bgRaysSprite.setOpacity(200);

    this.bgBubblesParticleSystem = new BaseParticleSystem({
      plistFile: RSX.rift_glow_line_particles.plist,
      fadeInAtLifePct: 0.05,
      fadeOutAtLifePct: 0.95,
    });

    this.deckLayer = new DeckLayer();
    this.deckLayer.setAnchorPoint(0, 0);
    this.deckLayer.delegate = this;

    // do super ctor
    this._super();

    this.getFXLayer().addChild(this.bgGradientSprite);
    this.getFXLayer().addChild(this.vignette);
    // this.getFXLayer().addChild(this.bgRaysSprite);
    this.getFXLayer().addChild(this.bgBubblesParticleSystem);
    this.getNoFXLayer().addChild(this.riftGlowLineSprite, 0);
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

    this.riftGlowLineSprite.setPosition(winCenterPosition.x, winCenterPosition.y);
    this.riftGlowLineSprite.setScaleX(UtilsEngine.getGSIWinWidth() / this.riftGlowLineSprite.getContentSize().width);

    this.bgBubblesParticleSystem.setPosVar(cc.p(UtilsEngine.getGSIWinWidth() / 2, 0));
    this.bgBubblesParticleSystem.setPosition(winCenterPosition);

    if (this._crestNode) {
      this._crestNode.setPosition(winCenterPosition.x, winCenterPosition.y);
    }

    if (this._portrait) {
      this._portrait.setPosition(winCenterPosition.x, winCenterPosition.y + 220);
    }

    this.deckLayer.setPosition(UtilsEngine.getGSIWinRight() - 260.0, UtilsEngine.getGSIWinBottom());
  },

  /* endregion LAYOUT */

  /* region EVENTS */

  onEnter() {
    this._super();

    // audio_engine.current().play_music(RSX.music_rift.audio);

    // change gradient color mapping

    this.getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, cc.color(255, 235, 143, 255), cc.color(11, 14, 38, 255), cc.color(143, 0, 0, 255));
    // this.getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, cc.color(200,14,38,255), cc.color(11,14,38,255));
  },

  onExit() {
    this._super();

    // reset gradient color mapping
    this.getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  /* endregion EVENTS */

  /* region UTILITY */

  /**
   * Calls delegate play rift method.
   * @returns {Promise}
   */
  playRiftRun() {
    return this.delegate.startLookingForGame();
  },

  storeCurrentUpgradePack() {
    return this.delegate.storeCurrentUpgradePack();
  },

  rerollCurrentUpgradePack() {
    return this.delegate.rerollCurrentUpgradePack();
  },

  /**
   * Transitions the current screen out.
   * @returns {Promise}
   */
  transitionCurrentScreenOut() {
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
          this._crestNode.setPosition(winCenterPosition.x, winCenterPosition.y);
          this._crestNode.setScale(1.25);
          this._crestNode._factionId = factionId;
          this._crestNodesByFactionId[factionId] = this._crestNode;
          this.getFXLayer().addChild(this._crestNode);
        }

        this._crestNode.setOpacity(0);
        this._crestNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 150);
      }
    }
  },

  /**
   * Shows a portrait by general id, if no general id then by faction id, or clears current if none provided.
   * @param {String} [factionId=null]
   * @param {String} [generalId=null]
   */
  showPortraitForFactionId(factionId, generalId) {

    // if (this._portraitsByGeneralId == null) {
    //   this._portraitsByGeneralId = {};
    // }
    //
    // if (this._portraitsByFactionId == null) {
    //   this._portraitsByFactionId = {};
    // }
    //
    // if (this._portrait == null || this._portrait._generalId != generalId) {
    //   // animate current out
    //   if (this._portrait != null) {
    //     this._portrait.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
    //     this._portrait = null;
    //   }
    //
    //   // show new
    //   if (generalId != null) {
    //     // show new general portrait by general id
    //     this._portrait = this._portraitsByGeneralId[generalId];
    //
    //     if (this._portrait == null) {
    //       var generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);
    //       var portraitHexResource = generalCard.getPortraitHexResource();
    //       this._portrait = BaseSprite.create();
    //       this._portrait.setRequiredTextureResource(portraitHexResource);
    //       var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
    //       this._portrait.setPosition(winCenterPosition.x, winCenterPosition.y + 220);
    //       this._portrait.setScale(0.5);
    //       this._portrait._generalId = generalId;
    //       this._portraitsByGeneralId[generalId] = this._portrait;
    //       this.getNoFXLayer().addChild(this._portrait, this._z_order_faction);
    //     }
    //
    //     this._portrait.setVisible(false);
    //     this._portrait.whenRequiredResourcesReady().then(function (requestId) {
    //       if (!this._portrait.getAreResourcesValid(requestId)) return; // resources have been invalidated
    //       this._portrait.setVisible(true);
    //
    //       // animate in
    //       this._portrait.setOpacity(0.0);
    //       this._portrait.fadeTo(CONFIG.FADE_FAST_DURATION, 255);
    //     }.bind(this));
    //   }
    // }
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

  /* region FACTION SCREEN */

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
   * @param {Object} riftRunData
   * @returns {Promise}
   */
  showCardSelectScreen(riftRunData) {
    // show choose card layer as needed
    // choose card layer should be reused until all card selections are made
    let transitionPromise;
    let showScreenPromise;

    if (!(this.outerLayer instanceof ChooseCardLayer)) {
      transitionPromise = this.transitionCurrentScreenOut();
      showScreenPromise = transitionPromise.then(() => {
        this.outerLayer = new ChooseCardLayer(riftRunData);
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
      this.showFactionVisualsForFactionId(riftRunData.faction_id, null);
      this.deckLayer.showDeck();
    });

    // show card options after showing new screen
    return showScreenPromise.then(() => {
      // Switch between displaying either general choices or card choices, general choices gets priority
      if (riftRunData.general_choices != null) {
        this.outerLayer.showCardOptions(riftRunData.general_choices);
      } else {
        this.outerLayer.showCardOptions(riftRunData.card_choices);
      }
    });
  },

  highlightCard(highlightedSdkCard) {
    this.showBackgroundCrestForFactionId(highlightedSdkCard.factionId);
  },

  selectCardFromDeck(sdkCard) {
    this.delegate.selectCardToUpgrade(sdkCard.id);
  },

  /**
   * Selects a card by reference and calls the delegate selection.
   * @param {SDK.Card} selectedSdkCard
   * @param {Array} unselectedSdkCards list of cards not selected
   * @returns {Promise}
   */
  selectCard(selectedSdkCard, unselectedSdkCards) {
    let selectCardPromise = Promise.resolve();
    const cardIdToRemove = this.dataSource.model.get('card_id_to_upgrade');
    if (selectedSdkCard != null && selectedSdkCard.getIsGeneral && selectedSdkCard.getIsGeneral()) {
      selectCardPromise = this.delegate.selectGeneral(selectedSdkCard, unselectedSdkCards);
    } else {
      selectCardPromise = this.delegate.selectCard(selectedSdkCard, unselectedSdkCards);
    }

    // wait for select to resolve and then add the card to deck
    selectCardPromise.then((riftData) => {
      if (selectedSdkCard != null && selectedSdkCard instanceof SDK.Entity && selectedSdkCard.getIsGeneral()) {
        this.showFactionVisualsForFactionId(selectedSdkCard.getFactionId(), selectedSdkCard.getId());
      } else {
        this.removeCardFromDeck(cardIdToRemove).then(() => {
          this.addCardToDeck(selectedSdkCard.getId());
        });
      }
    });

    return selectCardPromise;
  },

  bindDeck(deckCards) {
    if (deckCards == null) { deckCards = []; }
    this.deckLayer.bindCards(deckCards);
  },

  addCardToDeck(cardId) {
    return this.deckLayer.addCard(cardId);
  },

  removeCardFromDeck(cardId) {
    return this.deckLayer.removeCard(cardId);
  },

  /* endregion CARD SCREEN */

  /* region RUN SCREEN */

  /**
   * Shows rift run screen for data.
   * @param riftRunData
   * @returns {Promise}
   */
  showRiftRunScreen(riftRunData, wonLastGauntletGame) {
    return this.transitionCurrentScreenOut().then(() => {
      this.outerLayer = new RunLayer(riftRunData, wonLastGauntletGame);
      this.outerLayer.delegate = this;
      this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());
      this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);

      if (this.deckLayer.cards.length == 0) {
        this.bindDeck(riftRunData.deck);
      }
      this.deckLayer.showDeck();

      const generalId = this.dataSource.getRiftRunGeneralId();
      this.showFactionVisualsForFactionId(riftRunData.faction_id, generalId);

      return this.outerLayer.transitionIn();
    });
  },

  /* endregion RUN SCREEN */

  showSelectCardToUpgradeScreen(riftRunData) {
    this.showPortraitForFactionId(null, null);
    return this.transitionCurrentScreenOut().then(() => {
      this.outerLayer = new UpgradeInstructionsLayer(riftRunData);

      // this.outerLayer.delegate = this;
      // this.outerLayer.setPosition(
      //   0,
      //   UtilsEngine.getGSIWinHeight()
      // )
      // this.outerLayer.bindCards(riftRunData.deck)
      // this.deckLayer.hideDeck();

      this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());

      this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);
      return this.outerLayer.transitionIn();
    });
  },

  showCardUpgradeScreen(riftRunData) {
    return this.transitionCurrentScreenOut().then(() => {
      this.outerLayer = new UpgradeCardLayer(riftRunData);
      this.outerLayer.delegate = this;
      // this.outerLayer.setPosition(UtilsEngine.getGSIWinCenterPosition());
      this.getNoFXLayer().addChild(this.outerLayer, this._z_order_content);

      this.deckLayer.showDeck();

      const generalId = this.dataSource.getRiftRunGeneralId();
      this.showFactionVisualsForFactionId(riftRunData.faction_id, generalId);

      return this.outerLayer.transitionIn().then(() => this.outerLayer.showUnlockPack()).then(() => {
        let disableStoringUpgrade = false;
        const storedUpgradeCount = ProfileManager.getInstance().profile.get('rift_stored_upgrade_count') || 0;
        if (riftRunData.disable_storing_upgrade) {
          disableStoringUpgrade = true;
        } else if (storedUpgradeCount >= 10) {
          disableStoringUpgrade = true;
        }
        return this.outerLayer.showRevealPack(riftRunData.card_choices, disableStoringUpgrade, riftRunData.current_upgrade_reroll_count, riftRunData.total_reroll_count);
      });
    });
  },

});

RiftLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new RiftLayer());
};

module.exports = RiftLayer;
