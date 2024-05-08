// pragma PKGS: game rift
const DATA = require('app/data');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const audio_engine = require('../../../audio/audio_engine');
const TweenTypes = require('../../actions/TweenTypes');
const SdkNode = require('./SdkNode');
const BaseSprite = require('../BaseSprite');
const BaseParticleSystem = require('../BaseParticleSystem');
const GlowSprite = require('../GlowSprite');
const CausticPrismaticGlowSprite = require('../fx/CausticPrismaticGlowSprite');
const NodeFactory = require('../../helpers/NodeFactory');
const CardNodeVisualStateTag = require('../visualStateTags/CardNodeVisualStateTag');
const StatsChangeNode = require('./StatsChangeNode');

/** **************************************************************************
BottomDeckCardNode
var BottomDeckCardNode = SdkNode
BottomDeckCardNode.create()
 - node used to display cards in bottom deck / hand
 *************************************************************************** */

const BottomDeckCardNode = SdkNode.extend({

  cardBackgroundSprite: null,
  _cardBackgroundSpriteIdentifier: null,
  cardSprite: null,
  _containerNode: null,
  _glowRings: null,
  handIndex: null,
  highlighted: false,
  _instructionNode: null,
  manaCostLabel: null,
  manaTokenSprite: null,
  _prismaticGlow: null,
  _usable: null,
  sdkCard: null,
  selected: false,
  _showingMulligan: null,
  _showingPrismatic: false,
  _statChangeShowing: false,
  _statChangeQueue: null,
  _statsChangeNode: null,

  ctor(sdkCard) {
    // initialize properties that may be required in init
    this._statChangeQueue = [];
    this._containerNode = new cc.Node();
    const contentSize = cc.size(CONFIG.HAND_CARD_SIZE, CONFIG.HAND_CARD_SIZE);

    // card background
    this.cardBackgroundSprite = BaseSprite.create(RSX.bottom_deck_card_background.img);
    this.cardBackgroundSprite.setAnchorPoint(0.5, 0.5);
    this.cardBackgroundSprite.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5));

    // shadow
    this.shadowSprite = BaseSprite.create(RSX.unit_shadow.img);
    this.shadowSprite.setOpacity(0.0);

    // mana token
    this.manaTokenSprite = BaseSprite.create(RSX.icon_mana.img);
    this.manaTokenSprite.setAnchorPoint(0.49, 0.45);
    this.manaTokenSprite.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5 - 50.0));
    this.manaTokenSprite.setScale(0.65);

    // mana cost
    this.manaCostLabel = new cc.LabelTTF('', RSX.font_bold.name, 18);
    this.manaCostLabel.setAnchorPoint(0.5, 0.5);
    this.manaCostLabel.setPosition(this.manaTokenSprite.getPosition());
    this.manaCostLabel.setOpacity(0);

    // glow rings
    this._glowRings = BaseParticleSystem.create(RSX.ptcl_ring_glow_circle.plist);
    this._glowRings.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5));
    this._glowRings.setPositionType(cc.ParticleSystem.TYPE_RELATIVE);
    this._glowRings.stopSystem();

    // do super ctor
    this._super(sdkCard);

    // setup support nodes
    this.initSupportNodes();

    // set content size to match tile size
    // this must be done after the cocos/super ctor
    this.setContentSize(contentSize);

    // add children after cocos/super ctor
    this.addChild(this._containerNode);
    this._containerNode.addChild(this.cardBackgroundSprite, -3);
    this._containerNode.addChild(this.shadowSprite, -2);
    this._containerNode.addChild(this._glowRings, -1);
    this._containerNode.addChild(this.manaTokenSprite, -1);
    this._containerNode.addChild(this.manaCostLabel, -1);

    this._statsChangeNode.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5));
    this.addChild(this._statsChangeNode, 1);
  },

  initSupportNodes() {
    // node that displays changes in stats
    if (this._statsChangeNode == null) {
      this._statsChangeNode = StatsChangeNode.create(this);
    }
  },

  updateSupportNodePositions() {
    if (this._instructionNode != null) {
      const position = this.getCenterPositionForExternal();
      if (this._instructionNode.getIsLeft()) {
        position.x += CONFIG.INSTRUCTION_NODE_OFFSET;
        position.y -= CONFIG.INSTRUCTION_NODE_OFFSET * 0.25;
      } else if (this._instructionNode.getIsRight()) {
        position.x -= CONFIG.INSTRUCTION_NODE_OFFSET;
        position.y -= CONFIG.INSTRUCTION_NODE_OFFSET * 0.25;
      } else if (this._instructionNode.getIsUp()) {
        position.y -= CONFIG.INSTRUCTION_NODE_OFFSET * 1.5;
      } else if (this._instructionNode.getIsDown()) {
        position.y += CONFIG.INSTRUCTION_NODE_OFFSET * 1.5;
      }
      this._instructionNode.setPosition(position.x, position.y);
    }
  },

  terminateSupportNodes(duration) {
    this._super();

    if (this._statsChangeNode != null) {
      this._statsChangeNode.stopAllActions();
      this._statsChangeNode.destroy(duration);
      this._statsChangeNode = null;
    }
  },

  /** region GETTERS / SETTERS * */

  getIsActive() {
    return true;
  },

  getBoardPosition() {
    return UtilsEngine.transformScreenToBoard(this.getPosition());
  },

  getStatsChangeNode() {
    return this._statsChangeNode;
  },

  /** endregion GETTERS / SETTERS * */

  /** region CARD * */

  setSdkCardFromHandIndex(handIndex, cardFadeDuration) {
    this.handIndex = handIndex;
    if (this.handIndex != null) {
      const sdkCard = SDK.GameSession.getInstance().getMyPlayer().getDeck().getCardInHandAtIndex(this.handIndex);
      this.setSdkCard(sdkCard, cardFadeDuration);
    } else {
      this.setSdkCard(null, cardFadeDuration);
    }
  },

  getHandIndex() {
    return this.handIndex;
  },

  getCardSprite() {
    return this.cardSprite;
  },

  /**
   * Bottom deck card nodes should always use card inspect resource packages.
   * @see SdkNode.getCardResourcePackageId
   */
  getCardResourcePackageId(sdkCard) {
    return PKGS.getCardInspectPkgIdentifier(sdkCard.getId());
  },

  setSdkCard(sdkCard, cardFadeDuration) {
    if (this.sdkCard !== sdkCard) {
      // destroy previous card
      if (this.sdkCard != null) {
        this._usable = null;

        if (!sdkCard) {
          this.manaCostLabel.setString('', true);
        }

        if (this.cardSprite != null) {
          this.cardSprite.destroy(cardFadeDuration);
          this.cardSprite = null;
        }
        this.shadowSprite.fadeToInvisible(cardFadeDuration);
        this.manaCostLabel.fadeToInvisible(cardFadeDuration);

        this.stopShowingPrismatic(cardFadeDuration);
      }

      // update card after resetting last and before showing new
      this._super(sdkCard);

      // setup new card
      if (this.sdkCard != null) {
        const contentSize = this.getContentSize();

        // card options
        const cardOptions = _.extend({}, sdkCard.getCardOptions());
        cardOptions.spriteIdentifier = sdkCard.getBaseAnimResource() && sdkCard.getBaseAnimResource().idle;
        cardOptions.antiAlias = false;
        if (cardOptions.scale == null) {
          cardOptions.scale = CONFIG.SCALE;
        }

        // reposition shadow
        if (this.sdkCard instanceof SDK.Unit) {
          this.shadowSprite.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5 - CONFIG.DEPTH_OFFSET));
        } else {
          this.shadowSprite.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5 - 25.0));
        }

        // when load completes
        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

          // card sprite
          this.cardSprite = GlowSprite.create(cardOptions);
          this.cardSprite.setOpacity(0.0);

          // position card sprite
          const cardSpritePosition = this.cardSprite.getPosition();
          cardSpritePosition.x += contentSize.width * 0.5 + ((cardOptions.offset && cardOptions.offset.x) || 0);
          cardSpritePosition.y += ((cardOptions.offset && cardOptions.offset.y) || 0);

          if (sdkCard instanceof SDK.Unit) {
            this.cardSprite.setAnchorPoint(0.5, 0.0);
            cardSpritePosition.y += contentSize.height * 0.25 - 20.0;
            if (sdkCard.isOwnedByPlayer2()) {
              this.cardSprite.setFlippedX(true);
            }
          } else {
            this.cardSprite.setAnchorPoint(0.5, 0.5);
            cardSpritePosition.y += contentSize.height * 0.5 + 5.0;
          }

          this.cardSprite.setPosition(cardSpritePosition);
          this._containerNode.addChild(this.cardSprite, -1);

          // fade card sprites
          this.cardSprite.fadeTo(cardFadeDuration, 255.0);
          this.manaCostLabel.fadeTo(cardFadeDuration, 255.0);
          this.shadowSprite.fadeTo(cardFadeDuration, (SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId()) ? 200.0 : 150.0));
        });

        if (!CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT
          && !(this.sdkCard instanceof SDK.Tile)
          && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
          this.showPrismatic(cardFadeDuration);
        }
      }

      this.resetHighlightAndSelection();
      this.showInactiveAnimState();
    }
  },

  /** endregion CARD * */

  /** region STATES * */

  showCardBackground(cardBackgroundSpriteIdentifier) {
    // don't show the same frame again
    if (this._cardBackgroundSpriteIdentifier !== cardBackgroundSpriteIdentifier) {
      // swap sprite identifier if a texture is found
      const texture = cc.textureCache.getTextureForKey(cardBackgroundSpriteIdentifier);
      if (texture != null) {
        this._cardBackgroundSpriteIdentifier = cardBackgroundSpriteIdentifier;
        this.cardBackgroundSprite.setTexture(texture);
      }
    }
  },

  showAnimState(animResource, looping) {
    if (this.sdkCard != null) {
      this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
        if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

        this.stopAnimState();
        if (this.cardSprite != null) {
          const animAction = UtilsEngine.getAnimationAction(animResource);
          if (animAction) {
            // show animation and always try to show inactive animation after
            // inactive animation will only play if node is not highlighted
            let animStateAction;
            if (animAction.getDuration() === 0) {
              animStateAction = cc.sequence(
                animAction,
                cc.delayTime(1.0),
                cc.callFunc(this.showInactiveAnimState, this),
              );
            } else {
              animStateAction = cc.sequence(
                animAction,
                cc.callFunc(this.showInactiveAnimState, this),
              );
            }
            if (looping) {
              animStateAction = animStateAction.repeatForever();
            }
            animStateAction.setTag(CONFIG.ANIM_TAG);
            this.cardSprite.runAction(animStateAction);
          }
        }
      });
    }
  },

  stopAnimState() {
    if (this.cardSprite != null) {
      this.cardSprite.stopActionByTag(CONFIG.ANIM_TAG);
    }
  },

  showActiveAnimState() {
    if (this.sdkCard != null) {
      const animResource = this.sdkCard.getBaseAnimResource();
      if (animResource) {
        if (this.sdkCard instanceof SDK.Unit) {
          this.showAnimState(animResource.idle, true);
        } else {
          this.showAnimState(animResource.active || animResource.idle, true);
        }
      }
    }
  },

  showInactiveAnimState() {
    if (!this.highlighted && this.sdkCard != null && (!this.selected || !SDK.GameSession.current().isActive())) {
      const animResource = this.sdkCard.getBaseAnimResource();
      if (animResource) {
        if (this.sdkCard instanceof SDK.Unit) {
          this.showAnimState(animResource.breathing);
        } else {
          this.showAnimState(animResource.idle);
        }
      }
    }
  },

  /** endregion STATES * */

  /** region MULLIGAN * */

  showMulliganState() {
    if (!this.getIsShowingMulliganState()) {
      this._showingMulligan = true;
      const contentSize = this.getContentSize();

      if (this.mulliganReplacedSprite == null) {
        this.mulliganReplacedSprite = BaseSprite.create(RSX.mulligan_replaced.img);
        this.mulliganReplacedSprite.setPosition(cc.p(contentSize.width * 0.5, -10.0));
        this._containerNode.addChild(this.mulliganReplacedSprite, 2);
      }

      if (this.mulliganXSprite == null) {
        this.mulliganXSprite = BaseSprite.create(RSX.mulligan_x.img);
        this.mulliganXSprite.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5));
        this.mulliganXSprite.setOpacity(175);
        this._containerNode.addChild(this.mulliganXSprite, 2);
      }

      this.showCardBackground(RSX.bottom_deck_card_background_replaced.img);
    }
  },

  removeMulliganState() {
    if (this.getIsShowingMulliganState()) {
      this._showingMulligan = false;

      if (this.mulliganReplacedSprite != null) {
        this.mulliganReplacedSprite.destroy();
        this.mulliganReplacedSprite = null;
      }

      if (this.mulliganXSprite != null) {
        this.mulliganXSprite.destroy();
        this.mulliganXSprite = null;
      }

      this.showCardBackground(RSX.bottom_deck_card_background.img);
    }
  },

  getIsShowingMulliganState() {
    return this._showingMulligan;
  },

  /** endregion MULLIGAN * */

  /* region PRISMATIC */

  /**
   * Shows the card as prismatic.
   * @param {Number} [duration=0.0]
   */
  showPrismatic(duration) {
    if (!this._showingPrismatic) {
      this._showingPrismatic = true;

      if (this._prismaticGlow == null) {
        this._prismaticGlow = CausticPrismaticGlowSprite.create();
        this._prismaticGlow.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        const contentSize = this.getContentSize();
        this._prismaticGlow.setTextureRect(cc.rect(0, 0, 127.0, 127.0));
        this._prismaticGlow.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
        this._containerNode.addChild(this._prismaticGlow, -2.5);
      }

      this._prismaticGlow.fadeTo(duration, 175.0);
    }
  },

  /**
   * Stops showing the card as prismatic.
   * @param {Number} [duration=0.0]
   */
  stopShowingPrismatic(duration) {
    if (this._showingPrismatic) {
      this._showingPrismatic = false;

      if (this._prismaticGlow != null) {
        this._prismaticGlow.fadeToInvisible(duration);
      }
    }
  },

  /* endregion PRISMATIC */

  /* region STATS */

  /**
   * Shows stat changes for hp.
   * @param {Number} hpValue
   * @param {String} [hpChangeType=StatsChangeNode.HP_CHANGE_TYPE_MODIFIER]
   * @returns {Number} show duration
   */
  showHPChange(hpValue, hpChangeType) {
    return this.showStatChanges(null, hpValue, hpChangeType);
  },

  /**
   * Shows stat changes for atk.
   * @param {Number} atkValue
   * @returns {Number} show duration
   */
  showATKChange(atkValue) {
    return this.showStatChanges(atkValue);
  },

  /**
   * Shows stat changes for atk and/or hp. Either parameter is optional, but at least one must be defined.
   * @param {Number} [atkValue=null]
   * @param {Number} [hpValue=null]
   * @param {String} [hpChangeType=StatsChangeNode.HP_CHANGE_TYPE_MODIFIER]
   * @returns {Number} show duration
   */
  showStatChanges(atkValue, hpValue, hpChangeType) {
    let showDuration = 0.0;

    if (atkValue != null || hpValue != null) {
      // we're queuing stat change to be shown
      // but we know how long it will show for
      showDuration += CONFIG.ENTITY_STATS_CHANGE_DELAY * 0.5;

      // attempt to squash changes into last stat change
      let squashed = false;
      if (this._statChangeQueue.length > 0) {
        const lastStatChangeData = this._statChangeQueue[this._statChangeQueue.length - 1];
        if (atkValue != null && hpValue == null) {
          // squash attack change if signs match
          var lastAtk = lastStatChangeData.atk;
          var lastAtkSign = lastAtk && lastAtk.match(/([+-])/);
          var atkSign = atkValue.match(/([+-])/);
          if (lastAtkSign == null && atkSign == null) {
            squashed = true;
            lastStatChangeData.atk = `${(parseInt(lastAtk) || 0) + parseInt(atkValue)}`;
          } else if (lastAtkSign != null && atkSign != null && lastAtkSign[1] === atkSign[1]) {
            squashed = true;
            lastStatChangeData.atk = lastAtkSign[1] + ((parseInt(lastAtk && lastAtk.slice(1)) || 0) + parseInt(atkValue.slice(1)));
          }
        } else if (lastStatChangeData.hpChangeType == null || lastStatChangeData.hpChangeType == hpChangeType) {
          // squash change if signs match
          const lastHP = lastStatChangeData.hp;
          const lastHPSign = lastHP && lastHP.match(/([+-])/);
          const hpSign = hpValue.match(/([+-])/);
          const signsMatchNull = lastHPSign == null && hpSign == null;
          const signsMatchNotNull = lastHPSign != null && hpSign != null && lastHPSign[1] === hpSign[1];
          let signsMatch = signsMatchNull || signsMatchNotNull;
          if (signsMatch) {
            // squash atk
            if (atkValue != null) {
              var lastAtk = lastStatChangeData.atk;
              var lastAtkSign = lastAtk && lastAtk.match(/([+-])/);
              var atkSign = atkValue.match(/([+-])/);
              if (lastAtkSign == null && atkSign == null) {
                signsMatch = true;
                lastStatChangeData.atk = `${(parseInt(lastAtk) || 0) + parseInt(atkValue)}`;
              } else if (lastAtkSign != null && atkSign != null && lastAtkSign[1] === atkSign[1]) {
                signsMatch = true;
                lastStatChangeData.atk = lastAtkSign[1] + ((parseInt(lastAtk && lastAtk.slice(1)) || 0) + parseInt(atkValue.slice(1)));
              } else {
                signsMatch = false;
              }
            }

            // squash hp
            if (signsMatch) {
              squashed = true;
              if (signsMatchNull) {
                lastStatChangeData.hp = `${(parseInt(lastHP) || 0) + parseInt(hpValue)}`;
              } else if (signsMatchNotNull) {
                lastStatChangeData.hp = lastHPSign[1] + ((parseInt(lastHP && lastHP.slice(1)) || 0) + parseInt(hpValue.slice(1)));
              }
            }
          }
        }
      }

      if (!squashed) {
        // push to queue
        this._statChangeQueue.push({ atk: atkValue, hp: hpValue, hpChangeType });
        if (!this._statChangeShowing && this._statChangeQueue.length === 1) {
          // delay slightly to allow multiple rapid stat changes to be squashed
          this._statChangeShowing = true;
          this.runAction(cc.sequence(
            cc.delayTime(showDuration * 0.25),
            cc.callFunc(this._showNextStatChange, this),
          ));
        }
      }
    }

    return showDuration;
  },

  _showNextStatChange() {
    if (this._statsChangeNode == null) {
      // don't show stat changes when no stat node to show with
      this._statChangeQueue = [];
    }

    if (this._statChangeQueue.length > 0) {
      this._statChangeShowing = true;
      const statChangeData = this._statChangeQueue.shift();
      const showDuration = this._statsChangeNode.showChanges(statChangeData.atk, statChangeData.hp, statChangeData.hpChangeType);
      if (showDuration > 0.0) {
        // delay and then show next changes
        this.runAction(cc.sequence(
          cc.delayTime(showDuration),
          cc.callFunc(this._showNextStatChange, this),
        ));
      } else {
        this._showNextStatChange();
      }
    } else {
      this._statChangeShowing = false;
    }
  },

  /* endregion STATS */

  /** region USABILITY * */

  updateUsability() {
    if (this.sdkCard) {
      const gameLayer = this.getScene().getGameLayer();

      // update mana
      const manaCost = `${this.sdkCard.getManaCost()}`;
      if (this.manaCostLabel.getString() !== manaCost) {
        this.manaCostLabel.setString(manaCost, true);
      }

      // card is usable when is unowned or has starting hand or enough mana on my turn
      if (this.sdkCard.isOwnedByGameSession()) {
        return this.showUsable();
      } if (!gameLayer.getIsGameActive() || gameLayer.getIsChooseHand()) {
        if (!this.selected) {
          return this.showUsable();
        }
      } else if (gameLayer.getIsTurnForPlayerId(this.sdkCard.getOwnerId())
        && !gameLayer.getIsPlayerSelectionLocked()
        && this.sdkCard.getDoesOwnerHaveEnoughManaToPlay()
        && this.sdkCard.getIsAllowedToBePlayed()) {
        return this.showUsable();
      }
    }

    // fall back to unusable
    this.showUnusable();
  },

  getCanShowMulliganState() {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      if (this.sdkCard && !this.sdkCard.isOwnedByGameSession()) {
        const sdkPlayer = this.sdkCard.getOwner();
        if (sdkPlayer && !sdkPlayer.getHasStartingHand()) {
          return true;
        }
      }
    } else {
      const scene = this.getScene();
      const gameLayer = scene && scene.getGameLayer();
      if (gameLayer && (gameLayer.getIsChooseHand() || gameLayer.getIsSubmitHand())) {
        return true;
      }
    }
    return false;
  },

  showUsable() {
    if (this.getIsShowingMulliganState() && !this.getCanShowMulliganState()) {
      this.removeMulliganState();
    }

    this._usable = true;
    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
      if (this.cardSprite != null) {
        this.cardSprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
      }
    });
    if (this.manaTokenSprite) {
      this.manaTokenSprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    }

    if (this.sdkCard) {
      // when mana cost is changed, change mana cost label color to reflect
      const manaCostChange = this.sdkCard.getManaCostChange();
      if (manaCostChange > 0) {
        this.manaCostLabel.setFontFillColor(CONFIG.MANA_NERF_COLOR);
      } else if (manaCostChange < 0) {
        this.manaCostLabel.setFontFillColor(CONFIG.MANA_BUFF_COLOR);
      } else {
        this.manaCostLabel.setFontFillColor(CONFIG.MANA_COLOR);
      }
    }

    if (!this.highlighted && !this.selected) {
      this.showCardBackground(RSX.bottom_deck_card_background.img);
    }
  },

  showUnusable() {
    if (this.getIsShowingMulliganState() && !this.getCanShowMulliganState()) {
      this.removeMulliganState();
    }

    this._usable = false;
    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
      if (this.cardSprite != null) {
        this.cardSprite.setShaderProgram(cc.shaderCache.programForKey('Monochrome'));
      }
    });
    if (this.manaTokenSprite) {
      this.manaTokenSprite.setShaderProgram(cc.shaderCache.programForKey('Monochrome'));
    }

    // when mana cost is changed to make this unusable, change mana cost label color to reflect
    if (this.sdkCard && this.sdkCard.getManaCostChange() > 0) {
      this.manaCostLabel.setFontFillColor(CONFIG.NERF_COLOR);
    } else {
      this.manaCostLabel.setFontFillColor(cc.color(60, 60, 60));
    }

    if (!this.highlighted && !this.selected) {
      this.showCardBackground(RSX.bottom_deck_card_background_disabled.img);
    }
  },

  /** endregion USABILITY * */

  /** region HIGHLIGHT SELECTION * */

  resetHighlightAndSelection() {
    this.setHighlighted(false);
    this.setSelected(false);

    // check for scene and game layer as it is possible they do not yet exist
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer && gameLayer.getIsMyTurn()) {
      this.showCardBackground(RSX.bottom_deck_card_background.img);
    } else {
      this.showCardBackground(RSX.bottom_deck_card_background_disabled.img);
    }

    this.updateUsability();
  },

  getHighlighted() {
    return this.highlighted;
  },

  _cardNodeGlowTagId: 'CardNodeGlowTagId',
  setHighlighted(highlighted) {
    if (this.highlighted !== highlighted) {
      this.highlighted = highlighted;
      this.updateUsability();

      if (CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT && this.sdkCard != null && !(this.sdkCard instanceof SDK.Tile) && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
        if (this.highlighted) {
          this.showPrismatic(CONFIG.ANIMATE_FAST_DURATION);
        } else {
          this.stopShowingPrismatic(CONFIG.ANIMATE_FAST_DURATION);
        }
      }

      const isPregame = !this.getScene().getGameLayer() || !this.getScene().getGameLayer().getIsGameActive();
      if (isPregame) {
        if (this.highlighted) {
          this.showActiveAnimState();
          this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForPlayerTag(), this._cardNodeGlowTagId);
        } else {
          this.showInactiveAnimState();
          this.removeInjectedVisualStateTagById(this._cardNodeGlowTagId);
        }
        if (!this.selected) {
          if (this.highlighted) {
            this.showCardBackground(RSX.bottom_deck_card_background_highlight.img);
          } else {
            this.showCardBackground(RSX.bottom_deck_card_background.img);
          }
        }
      } else if (!this.selected) {
        const playable = this.sdkCard && this.getScene().getGameLayer().getIsMyTurn() && this.sdkCard.getDoesOwnerHaveEnoughManaToPlay();
        if (!this.highlighted) {
          this.showInactiveAnimState();

          if (playable) {
            this.showCardBackground(RSX.bottom_deck_card_background.img);
          } else {
            this.showCardBackground(RSX.bottom_deck_card_background_disabled.img);
          }
          this.removeInjectedVisualStateTagById(this._cardNodeGlowTagId);
        } else {
          this.showActiveAnimState();

          if (playable) {
            this.showCardBackground(RSX.bottom_deck_card_background_highlight.img);
            this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForPlayerTag(), this._cardNodeGlowTagId);
          } else {
            this.showCardBackground(RSX.bottom_deck_card_background_disabled.img);
            this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForOpponentTag(), this._cardNodeGlowTagId);
          }
        }
      }
    }
  },

  getSelected() {
    return this.selected;
  },

  setSelected(selected) {
    if (this.selected !== selected) {
      this.selected = selected;
      this.updateUsability();

      const isPregame = !this.getScene().getGameLayer().getIsGameActive();

      if (isPregame) {
        if (this.selected) {
          this.showMulliganState();
        } else {
          this.removeMulliganState();
        }
      } else {
        const playable = this.sdkCard && this.getScene().getGameLayer().getIsMyTurn() && this.sdkCard.getDoesOwnerHaveEnoughManaToPlay();

        if (this.selected) {
          // update by selected
          this.showActiveAnimState();

          if (playable) {
            this.showCardBackground(RSX.bottom_deck_card_background_highlight.img);
            this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForPlayerTag(), this._cardNodeGlowTagId);
          } else {
            this.showCardBackground(RSX.bottom_deck_card_background_disabled.img);
            this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForOpponentTag(), this._cardNodeGlowTagId);
          }
        } else {
          // when highlighted, allow highlight to take over
          if (this.highlighted) {
            this.highlighted = false;
            this.setHighlighted(true);
          } else {
            this.showInactiveAnimState();

            if (playable || isPregame) {
              this.showCardBackground(RSX.bottom_deck_card_background.img);
            } else {
              this.showCardBackground(RSX.bottom_deck_card_background_disabled.img);
            }

            this.removeInjectedVisualStateTagById(this._cardNodeGlowTagId);
          }
        }
      }
    }

    this.moveToSelectedPosition();
  },

  moveToSelectedPosition() {
    const targetScreenPosition = cc.p();

    if (this.selected) {
      const isPregame = !this.getScene().getGameLayer().getIsGameActive();
      if (isPregame) {
        targetScreenPosition.y += -20.0;
      } else {
        targetScreenPosition.y += 20.0;
      }
    }

    // Just in case we are currently moving but the current position is the target position
    this._containerNode.stopActionByTag(CONFIG.MOVE_TAG);

    // move slightly to show selection state
    if (!UtilsPosition.getPositionsAreEqualAprox(targetScreenPosition, this._containerNode.getPosition())) {
      const moveAction = cc.moveTo(CONFIG.FADE_FAST_DURATION, targetScreenPosition).easing(cc.easeSineOut());
      moveAction.setTag(CONFIG.MOVE_TAG);
      this._containerNode.runAction(moveAction);
    }
  },

  /** endregion HIGHLIGHT SELECTION * */

  /** region DRAW * */

  stopAnimations() {
    this._super();

    this._containerNode.stopActionByTag(CONFIG.MOVE_TAG);
    const targetScreenPosition = cc.p();
    if (!UtilsPosition.getPositionsAreEqualAprox(targetScreenPosition, this._containerNode.getPosition())) {
      const moveAction = cc.moveTo(CONFIG.FADE_FAST_DURATION, targetScreenPosition).easing(cc.easeSineOut());
      moveAction.setTag(CONFIG.MOVE_TAG);
      this._containerNode.runAction(moveAction);
    }

    this._glowRings.stopSystem();

    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

      this.removeFX();
      if (this.cardSprite != null) {
        this.cardSprite.stopActionByTag(CONFIG.CARD_TAG);
      }
    });
  },

  showDraw(handIndex, showDelay) {
    let showDuration = 0.0;

    // stop any running animations
    this.stopAnimations();

    if (handIndex != null) {
      // set sdk card index if provided
      this.setSdkCardFromHandIndex(handIndex, 0.0);
    }

    if (this.sdkCard) {
      if (showDelay == null) { showDelay = 0.0; }

      // generate draw FX
      const drawFXSprites = NodeFactory.createFX(DATA.dataForIdentifiers('FX.Game.CardDrawFX'));
      const drawFXDelays = UtilsEngine.getDelaysFromFXSprites(drawFXSprites);

      // add show times to show duration
      showDuration = drawFXDelays.showDelay * 0.5 + CONFIG.FADE_FAST_DURATION * 2;

      // get resources promise
      const whenCardResourcesReadyPromise = this.whenResourcesReady(this.getCardResourceRequestId());

      // hide elements
      whenCardResourcesReadyPromise.then((cardResourceRequestId) => {
        if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
        this.cardSprite.fadeToInvisible();
        this.manaCostLabel.fadeToInvisible();
        this.shadowSprite.fadeToInvisible();
      });

      // wait and animate in
      const drawAction = cc.sequence(
        cc.delayTime(showDelay),
        cc.callFunc(() => {
          // loop glowing rings
          this._glowRings.resumeSystem();

          whenCardResourcesReadyPromise.then((cardResourceRequestId) => {
            if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

            // play the card draw sfx
            audio_engine.current().play_effect(RSX.sfx_ui_card_draw.audio);

            // fade elements in
            this.manaCostLabel.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
            this.shadowSprite.fadeTo(CONFIG.FADE_FAST_DURATION, (SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId()) ? 200.0 : 150.0));

            // set sprite draw visuals
            this.cardSprite.setLeveled(true);
            this.cardSprite.setLevelsInWhite(120);
            this.cardSprite.setLevelsInGamma(2.0);
            this.cardSprite.setTint(cc.color(255, 255, 255, 255));
            this.cardSprite.setHighlighted(true);

            // fade sprite in
            this.cardSprite.setVisible(true);
            const drawAction = cc.sequence(
              cc.fadeIn(CONFIG.FADE_FAST_DURATION),
              cc.spawn(
                cc.actionTween(CONFIG.FADE_MEDIUM_DURATION, TweenTypes.TINT_FADE, 1.0, 0.0),
                cc.callFunc(() => {
                  this.cardSprite.fadeOutHighlight(0.8 - CONFIG.FADE_FAST_DURATION, cc.easeIn(2.0));
                }),
              ),
              cc.spawn(
                cc.callFunc(() => {
                  this._glowRings.stopSystem();
                }),
                cc.actionTween(CONFIG.FADE_FAST_DURATION, 'levelsInWhite', 120.0, 255.0),
                cc.actionTween(CONFIG.FADE_FAST_DURATION, 'levelsInGamma', 2.0, 1.0),
              ),
              cc.callFunc(() => {
                this.cardSprite.setLeveled(false);
              }),
            );
            this.addAnimationAction(drawAction);
            this.cardSprite.runAction(drawAction);

            // show draw FX
            this.showFX(drawFXSprites);
          });
        }),
      );
      this.addAnimationAction(drawAction);
      this.runAction(drawAction);
    }

    return showDuration;
  },

  /** endregion DRAW * */

  /** region REMOVE * */

  showRemove() {
    let showDuration = 0.0;

    // stop any running animations
    this.stopAnimations();

    if (this.sdkCard) {
      // generate remove fx
      const removeFXSprites = NodeFactory.createFX(DATA.dataForIdentifiers('FX.Game.CardRemoveFX'));
      const removeFXDelays = UtilsEngine.getDelaysFromFXSprites(removeFXSprites);

      // add show times to show duration
      showDuration += removeFXDelays.showDelay + CONFIG.FADE_FAST_DURATION * 2;

      this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
        if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

        // reset card
        this.cardSprite.setVisible(true);
        this.cardSprite.fadeTo(0.0, 255.0);
        this.cardSprite.setTint(cc.color(255, 255, 255, 0));

        // play the card draw sfx
        audio_engine.current().play_effect(RSX.sfx_ui_card_draw.audio);

        // show remove fx
        this.showFX(removeFXSprites);

        // tint card sprite
        const spriteBurnAction = cc.sequence(
          cc.actionTween(CONFIG.FADE_MEDIUM_DURATION, TweenTypes.TINT_FADE, 0.0, 255.0),
          cc.fadeTo(CONFIG.FADE_FAST_DURATION, 0.0),
          cc.callFunc(() => {
            // clear out sdk card and index
            this.setSdkCardFromHandIndex(null);
          }),
        );
        this.addAnimationAction(spriteBurnAction);
        this.cardSprite.runAction(spriteBurnAction);
      });
    }

    return showDuration;
  },

  /** endregion REMOVE * */

  /** region BURN * */

  showBurn(sdkCard) {
    let showDuration = 0.0;

    // stop any running animations
    this.stopAnimations();

    if (sdkCard != null) {
      // when card provided, force clear out previous and set new
      this.setSdkCard(sdkCard, 0.0, true);
    }

    if (this.sdkCard) {
      // generate burn fx
      const burnFXSprites = NodeFactory.createFX(DATA.dataForIdentifiers('FX.Game.CardBurnFX'));
      const burnFXDelays = UtilsEngine.getDelaysFromFXSprites(burnFXSprites);
      showDuration += burnFXDelays.showDelay;

      // add show times to show duration
      showDuration += CONFIG.FADE_FAST_DURATION * 2;

      // reset
      this.setVisible(true);
      this.setOpacity(0.0);
      this.showUsable();
      this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
        if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

        // reset card
        this.cardSprite.setVisible(true);
        this.cardSprite.fadeTo(0.0, 255.0);
        this.cardSprite.setTint(cc.color(255, 255, 255, 0));

        // play the card draw sfx
        audio_engine.current().play_effect(RSX.sfx_ui_card_draw.audio);

        // move upwards
        this._containerNode.stopActionByTag(CONFIG.MOVE_TAG);
        const targetScreenPosition = cc.p(40.0, 0.0);
        if (!UtilsPosition.getPositionsAreEqualAprox(targetScreenPosition, this._containerNode.getPosition())) {
          const moveAction = cc.moveTo(CONFIG.FADE_FAST_DURATION, targetScreenPosition).easing(cc.easeSineOut());
          moveAction.setTag(CONFIG.MOVE_TAG);
          this._containerNode.runAction(moveAction);
        }

        // fade and show fx
        const burnAction = cc.sequence(
          cc.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0),
          cc.callFunc(() => {
            // play the card burn sfx
            audio_engine.current().play_effect(RSX.sfx_spell_immolation_a.audio);

            // show burn fx
            this.showFX(burnFXSprites);

            // tint card sprite
            const spriteBurnAction = cc.sequence(
              cc.actionTween(CONFIG.FADE_MEDIUM_DURATION, TweenTypes.TINT_FADE, 0.0, 255.0),
              cc.fadeTo(CONFIG.FADE_FAST_DURATION, 0.0),
            );
            this.addAnimationAction(spriteBurnAction);
            this.cardSprite.runAction(spriteBurnAction);
          }),
          cc.delayTime(burnFXDelays.showDelay),
          cc.fadeTo(CONFIG.FADE_FAST_DURATION, 0.0),
          cc.hide(),
          cc.callFunc(() => {
            // clear out sdk card and index
            this.setSdkCardFromHandIndex(null);
          }),
        );
        this.addAnimationAction(burnAction);
        this.runAction(burnAction);
      });
    }

    return showDuration;
  },

  /** endregion BURN * */

  /** region Visual effect state methods * */

  // Overwrite to perform state cleanup for deactivated tags
  _handleDeactivatedVisualStateTags(deactivatedVisualStateTags) {
    SdkNode.prototype._handleDeactivatedVisualStateTags.call(this, deactivatedVisualStateTags);
    for (let i = 0; i < deactivatedVisualStateTags.length; i++) {
      const currentTag = deactivatedVisualStateTags[i];
      if (currentTag.tagType == CardNodeVisualStateTag.showGlowForPlayerTagType || currentTag.tagType == CardNodeVisualStateTag.showGlowForOpponentTagType) {
        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
          if (this.cardSprite != null) {
            this.cardSprite.fadeOutGlow();
          }
        });
      }
    }
  },

  // Overwrite to perform visual activation for activated tags
  _handleActivatedVisualStateTags(activatedVisualStateTags) {
    SdkNode.prototype._handleActivatedVisualStateTags.call(this, activatedVisualStateTags);
    for (let i = 0; i < activatedVisualStateTags.length; i++) {
      const currentTag = activatedVisualStateTags[i];
      if (currentTag.tagType == CardNodeVisualStateTag.showGlowForPlayerTagType) {
        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
          if (this.cardSprite != null) {
            this.cardSprite.showGlowForPlayer();
          }
        });
      } else if (currentTag.tagType == CardNodeVisualStateTag.showGlowForOpponentTagType) {
        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
          if (this.cardSprite != null) {
            this.cardSprite.showGlowForOpponent();
          }
        });
      }
    }
  },

  // endregion visual effect state methods

});

BottomDeckCardNode.create = function (sdkCard, node) {
  return SdkNode.create(sdkCard, node || new BottomDeckCardNode(sdkCard));
};

module.exports = BottomDeckCardNode;
