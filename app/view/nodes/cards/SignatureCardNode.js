// pragma PKGS: game
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
const InstructionNode = require('./InstructionNode');
const FXGlowImageMap = require('../fx/FXGlowImageMap');
const FXTimerSprite = require('../fx/FXTimerSprite');
const FXLensFlareSprite = require('../fx/FXLensFlareSprite');
const NodeFactory = require('../../helpers/NodeFactory');
const CardNodeVisualStateTag = require('../visualStateTags/CardNodeVisualStateTag');

/** **************************************************************************
SignatureCardNode
var SignatureCardNode = SdkNode
SignatureCardNode.create()
 - node used to display cards in signature card slot
 *************************************************************************** */

const SignatureCardNode = SdkNode.extend({

  isDisabled: false,
  selected: false,
  highlighted: false,
  _usable: null,

  sdkCard: null,
  cardSprite: null,
  cardRingSprite: null,
  cardGlowSprite: null,

  manaCostLabel: null,
  manaTokenSprite: null,
  cooldownTimerSprite: null,
  _cooldownLabel1: null,
  _cooldownLabel2: null,
  cooldownIconSprite: null,
  cooldownLabel: null,

  _explosionParticles: null,
  _flareSprite: null,
  _glowRings: null,

  _activeGlowTagId: 'ActiveGlowTagId',
  _highlightGlowTagId: 'HighlightGlowTagId',

  ctor(sdkCard) {
    // initialize properties that may be required in init
    const contentSize = cc.size(CONFIG.HAND_CARD_SIZE, CONFIG.HAND_CARD_SIZE);

    // card glow
    this.cardGlowSprite = FXGlowImageMap.create(RSX.signature_card_glow.img);
    this.cardGlowSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
    this.cardGlowSprite.setGlowColor(CONFIG.OPPONENT_SIGNATURE_CARD_GLOW);
    this.cardGlowSprite.setVisible(false);
    this.cardGlowSprite.setOpacity(0.0);

    // card ring
    this.cardRingSprite = new BaseSprite(RSX.signature_card_ring.img);
    this.cardRingSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);

    // mana token
    this.manaTokenSprite = new BaseSprite(RSX.icon_mana.img);
    this.manaTokenSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5 - 50.0);
    this.manaTokenSprite.setScale(0.65);

    // mana cost
    this.manaCostLabel = new cc.LabelTTF('', RSX.font_bold.name, 18);
    this.manaCostLabel.setAnchorPoint(0.5, 0.5);
    this.manaCostLabel.setPosition(this.manaTokenSprite.getPosition());

    // cooldown sprite
    this.cooldownTimerSprite = new FXTimerSprite();
    this.cooldownTimerSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
    this.cooldownTimerSprite.setTextureRect(cc.rect(0, 0, contentSize.width, contentSize.height));
    this.cooldownTimerSprite.setColor(CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_COLOR);
    this.cooldownTimerSprite.setOpacity(CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_OPACITY);
    this.cooldownTimerSprite.setBGColor(CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_BG_COLOR);
    this.cooldownTimerSprite.setBGOpacity(CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_BG_OPACITY);
    this.cooldownTimerSprite.setProgress(1.0);
    this.cooldownTimerSprite.setScale(0.7);

    // cooldown icon sprite
    this.cooldownIconSprite = new BaseSprite(RSX.icon_cooldown_counter.img);
    this.cooldownIconSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5 + 50.0);
    this.cooldownIconSprite.setScale(0.5);

    // cooldown label
    const cooldownLabelPosition = this.cooldownIconSprite.getPosition();
    this._cooldownLabel1 = new cc.LabelTTF('', RSX.font_bold.name, 22);
    this._cooldownLabel1.setAnchorPoint(0.5, 0.5);
    this._cooldownLabel1.setPosition(cooldownLabelPosition);
    this._cooldownLabel1.setFontFillColor(CONFIG.SIGNATURE_CARD_COOLDOWN_FONT_COLOR);

    // cooldown label alt
    this._cooldownLabel2 = new cc.LabelTTF('', RSX.font_bold.name, 22);
    this._cooldownLabel2.setAnchorPoint(0.5, 0.5);
    this._cooldownLabel2.setPosition(cooldownLabelPosition);
    this._cooldownLabel2.setFontFillColor(CONFIG.SIGNATURE_CARD_COOLDOWN_FONT_COLOR);

    this.cooldownLabel = this._cooldownLabel1;

    // glow rings
    this._glowRings = new BaseParticleSystem(RSX.ptcl_ring_glow_circle.plist);
    this._glowRings.setPosition(cc.p(contentSize.width * 0.5, contentSize.height * 0.5));
    this._glowRings.setPositionType(cc.ParticleSystem.TYPE_RELATIVE);
    this._glowRings.stopSystem();

    // lens flare that highlights from below
    this._flareSprite = FXLensFlareSprite.create();
    this._flareSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    this._flareSprite.setScale(4.0);
    this._flareSprite.setPulseRate(0.0);
    this._flareSprite.setSpeed(2.0);
    this._flareSprite.setWispSize(0.3);
    this._flareSprite.setArmLength(0.2);
    this._flareSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
    this._flareSprite.setVisible(false);

    // explosion particles
    this._explosionParticles = new BaseParticleSystem(RSX.explosion_small.plist);
    this._explosionParticles.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
    this._explosionParticles.setScale(2.0);
    this._explosionParticles.setAutoRemoveOnFinish(false);
    this._explosionParticles.stopSystem();

    // do super ctor
    this._super(sdkCard);

    // set content size to match tile size
    // this must be done after the cocos/super ctor
    this.setContentSize(contentSize);

    // add children after cocos/super ctor
    this.addChild(this.cardGlowSprite, -5);
    this.addChild(this._flareSprite, -4);
    this.addChild(this.cardRingSprite, -2);
    this.addChild(this.cooldownTimerSprite);
    this.addChild(this.cooldownIconSprite);
    this.addChild(this._cooldownLabel1);
    this.addChild(this._cooldownLabel2);
    this.addChild(this._glowRings);
    this.addChild(this.manaTokenSprite);
    this.addChild(this.manaCostLabel);
    this.addChild(this._explosionParticles);
  },

  /** region GETTERS / SETTERS * */

  getIsActive() {
    return true;
  },

  getBoardPosition() {
    return UtilsEngine.transformScreenToBoard(this.getPosition());
  },

  /** endregion GETTERS / SETTERS * */

  /** region CARD * */

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
          this.manaTokenSprite.fadeToInvisible(cardFadeDuration);
          this.manaCostLabel.setString('', true);
          this.manaCostLabel.fadeToInvisible(cardFadeDuration);
        }

        if (this.cardSprite != null) {
          this.cardSprite.destroy(cardFadeDuration);
          this.cardSprite = null;
        }
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

        // when load completes
        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

          // card sprite
          this.cardSprite = GlowSprite.create(cardOptions);
          this.cardSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
          this.cardSprite.setOpacity(0.0);
          this.addChild(this.cardSprite, -1);

          // fade card sprites
          this.cardSprite.fadeTo(cardFadeDuration, 255.0);
          this.manaTokenSprite.fadeTo(cardFadeDuration, 255.0);
          this.manaCostLabel.fadeTo(cardFadeDuration, 255.0);
        });
      }

      this.resetHighlightAndSelection();
      this.showInactiveAnimState();
    }
  },

  /** endregion CARD * */

  /** region STATES * */

  setIsDisabled(val) {
    if (this.isDisabled !== val) {
      this.isDisabled = val;
      this.setVisible(!this.isDisabled);
    }
  },

  getIsDisabled() {
    return this.isDisabled;
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
    this._showingCooldownAnimState = false;
  },

  showActiveAnimState() {
    if (this.sdkCard != null) {
      if (this.getIsOnCooldown()) {
        this.showCooldownAnimState();
      } else {
        const animResource = this.sdkCard.getBaseAnimResource();
        if (animResource) {
          this.showAnimState(animResource.active || animResource.idle, true);
        }
      }
    }
  },

  showInactiveAnimState() {
    if (this.sdkCard != null && !this.highlighted && (!this.selected || !SDK.GameSession.current().isActive())) {
      if (this.getIsOnCooldown()) {
        this.showCooldownAnimState();
      } else {
        const animResource = this.sdkCard.getBaseAnimResource();
        if (animResource) {
          this.showAnimState(animResource.idle);
        }
      }
    }
  },

  showCooldownAnimState() {
    if (this.sdkCard != null && !this._showingCooldownAnimState) {
      this._showingCooldownAnimState = true;
      const animResource = this.sdkCard.getBaseAnimResource();
      if (animResource) {
        const idleAnim = animResource.idle;
        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

          this.stopAnimState();
          if (this.cardSprite != null) {
            // freeze on first frame of idle while on cooldown
            this._showingCooldownAnimState = true;
            const animation = cc.animationCache.getAnimation(idleAnim);
            const frames = animation && animation.getFrames();
            if (frames != null && frames.length > 0) {
              this.cardSprite.setSpriteFrame(frames[0].getSpriteFrame());
            }
          }
        });
      }
    }
  },

  /** endregion STATES * */

  /** region USABILITY * */

  updateUsability() {
    if (this.sdkCard) {
      const gameLayer = this.getScene().getGameLayer();
      const owner = this.sdkCard.getOwner();

      // update mana
      const manaCost = `${this.sdkCard.getManaCost()}`;
      if (this.manaCostLabel.getString() !== manaCost) {
        this.manaCostLabel.setString(manaCost, true);
      }

      // card is usable when owner has enough mana on my turn AND his signature card is set to be active
      if (owner instanceof SDK.Player && owner.getIsSignatureCardActive()
        && gameLayer.getIsTurnForPlayerId(this.sdkCard.getOwnerId())
        && (this.sdkCard.getOwnerId() !== gameLayer.getMyPlayerId() || !gameLayer.getIsPlayerSelectionLocked())
        && this.sdkCard.getDoesOwnerHaveEnoughManaToPlay()) {
        return this.showUsable();
      }
    }

    // fall back to unusable
    this.showUnusable();
  },

  showUsable() {
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

      // glow whenever active for my player only
      if (this.sdkCard.isOwnedByMyPlayer()) {
        this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForNeutralTag(), this._activeGlowTagId);
      }
    }
  },

  showUnusable() {
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

    // remove active glow
    this.removeInjectedVisualStateTagById(this._activeGlowTagId);
  },

  /** endregion USABILITY * */

  /** region HIGHLIGHT SELECTION * */

  resetHighlightAndSelection() {
    this.setHighlighted(false);
    this.setSelected(false);
    this.updateUsability();
  },

  getHighlighted() {
    return this.highlighted;
  },

  setHighlighted(highlighted) {
    if (this.highlighted !== highlighted) {
      this.highlighted = highlighted;
      this.updateUsability();

      if (!this.selected) {
        if (!this.highlighted) {
          this.showInactiveAnimState();
          this.removeInjectedVisualStateTagById(this._highlightGlowTagId);
        } else {
          this.showActiveAnimState();

          const playable = this.sdkCard != null && this._usable && this.sdkCard.isOwnedByMyPlayer();
          if (playable) {
            this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForPlayerTag(true, 1), this._highlightGlowTagId);
          } else {
            this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForOpponentTag(true, 1), this._highlightGlowTagId);
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

      if (this.selected) {
        // update by selected
        this.showActiveAnimState();

        const playable = this.sdkCard != null && this._usable && this.sdkCard.isOwnedByMyPlayer();
        if (playable) {
          this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForPlayerTag(true, 1), this._highlightGlowTagId);
        } else {
          this.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForOpponentTag(true, 1), this._highlightGlowTagId);
        }
      } else {
        // when highlighted, allow highlight to take over
        if (this.highlighted) {
          this.highlighted = false;
          this.setHighlighted(true);
        } else {
          this.showInactiveAnimState();
          this.removeInjectedVisualStateTagById(this._highlightGlowTagId);
        }
      }
    }
  },

  /** endregion HIGHLIGHT SELECTION * */

  /** region COOLDOWN * */

  getIsOnCooldown() {
    return this.sdkCard == null || !this.sdkCard.getOwner().getIsSignatureCardActive();
  },

  resetCooldown(duration) {
    this.cooldownTimerSprite.setProgress(1.0);
    this.updateCooldown(duration);
  },

  updateCooldown(duration) {
    if (this.sdkCard != null && SDK.GameSession.getInstance().getNumberOfPlayerTurnsUntilPlayerActivatesSignatureCard(this.sdkCard.getOwner()) > 0) {
      this.showCooldown(duration);
    } else {
      this.hideCooldown(duration);
    }
  },

  showCooldown(duration) {
    if (this.sdkCard) {
      if (duration == null) { duration = CONFIG.ANIMATE_MEDIUM_DURATION; }
      const owner = this.sdkCard.getOwner();
      if (!owner.getIsSignatureCardActive()) {
        // show timer sprite
        const progress = SDK.GameSession.getInstance().getProgressUntilPlayerActivatesSignatureCard(owner);
        const cooldownOpacity = CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_OPACITY * Math.max(0.5, progress ** 0.5);
        this.cooldownTimerSprite.fadeTo(duration, cooldownOpacity);
        this.cooldownTimerSprite.animateProgress(duration, progress);
      }

      // animate cooldown
      this._animateCooldownLabelTo(duration);
    }
  },

  hideCooldown(duration) {
    if (this.sdkCard) {
      if (duration == null) { duration = CONFIG.ANIMATE_MEDIUM_DURATION; }

      // hide timer sprite
      this.cooldownTimerSprite.fadeToInvisible(duration);

      // always show cooldown
      this._animateCooldownLabelTo(duration);
    }
  },

  _animateCooldownLabelTo(duration) {
    const owner = this.sdkCard.getOwner();
    const cooldown = SDK.GameSession.getInstance().getNumberOfPlayerTurnsUntilPlayerActivatesSignatureCard(owner, true);
    if (this.cooldownLabel.getString() !== `${cooldown}`) {
      const cooldownLabelLast = this.cooldownLabel;
      if (cooldownLabelLast === this._cooldownLabel1) {
        this.cooldownLabel = this._cooldownLabel2;
      } else {
        this.cooldownLabel = this._cooldownLabel1;
      }

      // set new cooldown
      this.cooldownLabel.setString(cooldown, true);

      // animate to new cooldown
      const cooldownLabelPosition = this.cooldownIconSprite.getPosition();
      const moveDistance = cc.p(0.0, 20.0);

      cooldownLabelLast.stopActionByTag(CONFIG.FADE_TAG);
      cooldownLabelLast.setPosition(cooldownLabelPosition);
      const hideLastAction = cc.sequence(
        cc.spawn(
          cc.fadeOut(duration),
          cc.moveBy(duration, moveDistance).easing(cc.easeExponentialOut()),
        ),
        cc.callFunc(() => {
          cooldownLabelLast.setString(cooldown, true);
          cooldownLabelLast.setVisible(false);
        }),
      );
      hideLastAction.setTag(CONFIG.FADE_TAG);
      cooldownLabelLast.runAction(hideLastAction);

      this.cooldownLabel.stopActionByTag(CONFIG.FADE_TAG);
      this.cooldownLabel.setOpacity(0.0);
      this.cooldownLabel.setPosition(cooldownLabelPosition.x - moveDistance.x, cooldownLabelPosition.y - moveDistance.y);
      this.cooldownLabel.setVisible(true);
      const showNewAction = cc.spawn(
        cc.fadeIn(duration),
        cc.moveBy(duration, moveDistance).easing(cc.easeExponentialOut()),
      );
      showNewAction.setTag(CONFIG.FADE_TAG);
      this.cooldownLabel.runAction(showNewAction);
    }
  },

  /** endregion COOLDOWN * */

  /** region DRAW * */

  stopAnimations() {
    this._super();

    this._glowRings.stopSystem();
    this._explosionParticles.stopSystem();

    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

      this.removeFX();
      if (this.cardSprite != null) {
        this.cardSprite.stopActionByTag(CONFIG.CARD_TAG);
      }
    });
  },

  /**
   * Shows draw of signature card if different from existing.
   * @param {Card} sdkCard
   * @param {Number} [showDelay=0.0]
   * @returns {number} show duration
   */
  showDraw(sdkCard, showDelay) {
    let showDuration = 0.0;
    const lastSdkCard = this.sdkCard;

    if (sdkCard != null) {
      // set sdk card if provided
      this.setSdkCard(sdkCard, 0.0);
    }

    // show draw visuals only if card changes
    if (this.sdkCard && (lastSdkCard == null || this.sdkCard.getBaseCardId() !== lastSdkCard.getBaseCardId())) {
      if (showDelay == null) { showDelay = 0.0; }

      // add show times to show duration
      showDuration = CONFIG.FADE_FAST_DURATION * 2;

      // get resources promise
      const whenCardResourcesReadyPromise = this.whenResourcesReady(this.getCardResourceRequestId());

      // hide elements
      whenCardResourcesReadyPromise.then((cardResourceRequestId) => {
        if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
        this.cardSprite.fadeToInvisible();
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

            // set sprite draw visuals
            this.cardSprite.setLeveled(true);
            this.cardSprite.setLevelsInWhite(120);
            this.cardSprite.setLevelsInGamma(2.0);
            this.cardSprite.setTint(cc.color(255, 255, 255, 255));
            this.cardSprite.setHighlighted(true);

            const tintFadeDuration = 0.8;

            // fade sprite in
            this.cardSprite.setVisible(true);
            const subDrawAction = cc.sequence(
              cc.fadeIn(CONFIG.FADE_FAST_DURATION),
              cc.spawn(
                cc.actionTween(CONFIG.FADE_MEDIUM_DURATION, TweenTypes.TINT_FADE, 1.0, 0.0),
                cc.callFunc(() => {
                  this.cardSprite.fadeOutHighlight(tintFadeDuration - CONFIG.FADE_FAST_DURATION, cc.easeIn(2.0));
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
            this.addAnimationAction(subDrawAction);
            this.cardSprite.runAction(subDrawAction);
          });
        }),
      );
      this.addAnimationAction(drawAction);
      this.runAction(drawAction);
    }

    return showDuration;
  },

  /** endregion DRAW * */

  /** region ACTIVATE * */

  /**
   * Shows activation of signature card.
   * @param {Number} [showDelay=0.0]
   * @returns {Number} show duration
   */
  showActivate(showDelay) {
    let showDuration = 0.0;

    if (this.sdkCard) {
      if (showDelay == null) { showDelay = 0.0; }
      // console.log("show BBS activate", this.sdkCard.getLogName(), this.sdkCard.getOwnerId())
      // stop any running animations
      this.stopAnimations();

      // generate draw FX
      const drawFXSprites = NodeFactory.createFX(DATA.dataForIdentifiers('FX.Game.CardDrawFX'));
      const drawFXDelays = UtilsEngine.getDelaysFromFXSprites(drawFXSprites);

      // add show times to show duration
      showDuration = drawFXDelays.showDelay * 0.5 + CONFIG.FADE_FAST_DURATION * 2;

      // get resources promise
      const whenCardResourcesReadyPromise = this.whenResourcesReady(this.getCardResourceRequestId());

      whenCardResourcesReadyPromise.then((cardResourceRequestId) => {
        if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

        // play the card activation sfx
        audio_engine.current().play_effect(RSX.sfx_ui_card_reveal.audio);

        // show activation visuals
        const drawAction = cc.sequence(
          cc.delayTime(showDelay),
          cc.callFunc(() => {
            // remove cooldown
            this.hideCooldown(0.0);

            // flare
            this._flareSprite.setOpacity(0.0);
            this._flareSprite.setVisible(true);
            const flareAction = cc.sequence(
              cc.fadeIn(0.4).easing(cc.easeCubicActionOut()),
              cc.fadeOut(0.8).easing(cc.easeCubicActionOut()),
              cc.hide(),
            );
            this.addAnimationAction(flareAction);
            this._flareSprite.runAction(flareAction);

            // explosion
            this._explosionParticles.resumeSystem();

            // show draw FX
            this.showFX(drawFXSprites);
          }),
        );
        this.addAnimationAction(drawAction);
        this.cardSprite.runAction(drawAction);
      });
    }

    return showDuration;
  },

  /** endregion ACTIVATE * */

  /** region VISUAL STATE TAGS * */

  // Overwrite to perform state cleanup for deactivated tags
  _handleDeactivatedVisualStateTags(deactivatedVisualStateTags) {
    SdkNode.prototype._handleDeactivatedVisualStateTags.call(this, deactivatedVisualStateTags);
    for (let i = 0; i < deactivatedVisualStateTags.length; i++) {
      const currentTag = deactivatedVisualStateTags[i];
      if (currentTag.tagType == CardNodeVisualStateTag.showGlowForPlayerTagType
        || currentTag.tagType == CardNodeVisualStateTag.showGlowForOpponentTagType
        || currentTag.tagType == CardNodeVisualStateTag.showGlowForNeutralTagType) {
        this.cardGlowSprite.stopAllActions();
        this.cardGlowSprite.fadeToInvisible(CONFIG.FADE_FAST_DURATION);
      }
    }
  },

  // Overwrite to perform visual activation for activated tags
  _handleActivatedVisualStateTags(activatedVisualStateTags) {
    SdkNode.prototype._handleActivatedVisualStateTags.call(this, activatedVisualStateTags);
    for (let i = 0; i < activatedVisualStateTags.length; i++) {
      const currentTag = activatedVisualStateTags[i];

      var glowColor;
      if (currentTag.tagType == CardNodeVisualStateTag.showGlowForPlayerTagType) {
        glowColor = CONFIG.PLAYER_SIGNATURE_CARD_GLOW;
      } else if (currentTag.tagType == CardNodeVisualStateTag.showGlowForOpponentTagType) {
        glowColor = CONFIG.OPPONENT_SIGNATURE_CARD_GLOW;
      } else if (currentTag.tagType == CardNodeVisualStateTag.showGlowForNeutralTagType) {
        glowColor = CONFIG.NEUTRAL_SIGNATURE_CARD_GLOW;
      }

      if (glowColor != null) {
        if (this.cardGlowSprite.isVisible()) {
          this.cardGlowSprite.animateGlowColor(CONFIG.FADE_FAST_DURATION, glowColor);
          this.cardGlowSprite.stopActionByTag(CONFIG.FADE_TAG);
        } else {
          this.cardGlowSprite.setGlowColor(glowColor);
          this.cardGlowSprite.setVisible(true);
        }
        this.cardGlowSprite.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
      }
    }
  },

  /** endregion VISUAL STATE TAGS * */

  updateSupportNodePositions() {
    if (this._instructionNode != null) {
      const position = this.getCenterPositionForExternal();
      if (this._instructionNode._carrotDirection == InstructionNode.DIRECTION_UP) {
        this._instructionNode.setPosition(position.x, position.y - this.getContentSize().height * 0.5);
      } else if (this._instructionNode._carrotDirection == InstructionNode.DIRECTION_DOWN) {
        this._instructionNode.setPosition(position.x, position.y + this.getContentSize().height * 0.5);
      } else if (this._instructionNode._carrotDirection == InstructionNode.DIRECTION_RIGHT) {
        this._instructionNode.setPosition(position.x - this.getContentSize().width * 0.5, position.y);
      } else {
        // assume left
        this._instructionNode.setPosition(position.x + this.getContentSize().width * 0.5, position.y);
      }
    }
  },

});

SignatureCardNode.create = function (sdkCard, node) {
  return SdkNode.create(sdkCard, node || new SignatureCardNode(sdkCard));
};

module.exports = SignatureCardNode;
