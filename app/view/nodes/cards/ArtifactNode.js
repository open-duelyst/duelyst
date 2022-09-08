// pragma PKGS: game
const _ = require('underscore');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const SdkNode = require('./SdkNode');
const BaseSprite = require('../BaseSprite');
const GlowSprite = require('../GlowSprite');
const CausticPrismaticGlowSprite = require('../fx/CausticPrismaticGlowSprite');

/** *************************************************************************
 ArtifactNode
 var ArtifactNode = SdkNode
 ArtifactNode.create()
 - node used to display artifacts currently active on general
 ************************************************************************** */

const ArtifactNode = SdkNode.extend({

  cardSprite: null,
  _fxHitSprite: null,
  _fxBreakSprite: null,
  durability: 0,
  _durabilityTarget: 0,
  durabilityOnLeft: false,
  _durabilitySprites: null,
  highlighted: false,
  _prismaticGlow: null,
  _showingPrismatic: false,
  _ui_z_order_card_sprite: 1,
  _ui_z_order_durability: 2,
  _ui_z_order_animations: 3,

  /* region INITIALIZE */

  ctor(sdkCard) {
    // initialize properties that may be required in init
    const contentSize = cc.size(CONFIG.ARTIFACT_SIZE, CONFIG.ARTIFACT_SIZE);

    // durability sprites
    this._durabilitySprites = [];
    for (var i = 0, il = CONFIG.MAX_ARTIFACT_DURABILITY; i < il; i++) {
      const durabilitySprite = new BaseSprite(RSX.artifact_durability_point.img);
      durabilitySprite.setVisible(false);
      this._durabilitySprites.push(durabilitySprite);
    }

    // fx hit sprite
    this._fxHitSprite = new BaseSprite(RSX.fxArtifactHit.name);
    this._fxHitSprite.setScale(CONFIG.SCALE);
    this._fxHitSprite.setAntiAlias(false);
    this._fxHitSprite.setAnchorPoint(0.5, 0.5);
    this._fxHitSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
    this._fxHitSprite.setVisible(false);

    // fx break sprite
    this._fxBreakSprite = new BaseSprite(RSX.fxArtifactBreak.name);
    this._fxBreakSprite.setScale(CONFIG.SCALE);
    this._fxBreakSprite.setAntiAlias(false);
    this._fxBreakSprite.setAnchorPoint(0.5, 0.5);
    this._fxBreakSprite.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
    this._fxBreakSprite.setVisible(false);

    // do super ctor
    this._super(sdkCard);

    // set content size
    // this must be done after the cocos/super ctor
    this.setContentSize(contentSize);

    // add nodes
    // this must be done after the cocos/super ctor
    for (var i = 0, il = this._durabilitySprites.length; i < il; i++) {
      this.addChild(this._durabilitySprites[i], this._ui_z_order_durability);
    }
    this.addChild(this._fxHitSprite, this._ui_z_order_animations);
    this.addChild(this._fxBreakSprite, this._ui_z_order_animations);

    // layout
    this.updateLayout();
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  getIsEmpty() {
    return this.sdkCard == null || this._showRemoveAction != null;
  },

  getBoardPosition() {
    return UtilsEngine.transformScreenToBoard(this.getPosition());
  },

  setDurability(val) {
    this.durability = this._durabilityTarget = Math.max(0, Math.min(val || 0, CONFIG.MAX_ARTIFACT_DURABILITY));

    if (this.sdkCard != null) {
      // show durability sprites up to max durability
      for (let i = 0, il = this._durabilitySprites.length; i < il; i++) {
        this._durabilitySprites[i].setVisible(i < this.durability);
      }
    }
  },

  getDurability(val) {
    return this.durability;
  },

  setDurabilityOnLeft(val) {
    if (this.durabilityOnLeft !== val) {
      this.durabilityOnLeft = val;

      // reposition durability sprites
      this.updateDurabilityLayout();
    }
  },

  getDurabilityOnLeft() {
    return this.durabilityOnLeft;
  },

  /* endregion GETTERS / SETTERS */

  /* region LAYOUT */

  /**
   * Updates the internal layout of nodes/sprites in this node.
   */
  updateLayout() {
    this.updateDurabilityLayout();
  },

  /**
   * Updates the internal layout of durability sprites in this node.
   */
  updateDurabilityLayout() {
    if (this._durabilitySprites != null && this._durabilitySprites.length > 0) {
      // show and position all durability sprites
      const contentSize = this.getContentSize();
      const durabilitySpriteContentSize = this._durabilitySprites[0].getContentSize();
      const durabilitySpriteHeight = durabilitySpriteContentSize.height - 8.0;
      const numDurabilitySprites = this._durabilitySprites.length;
      const { durabilityOnLeft } = this;
      const x = durabilityOnLeft ? 0.0 : contentSize.width;
      let y = (contentSize.height - (durabilitySpriteHeight * numDurabilitySprites)) * 0.5 + 8.0;
      for (let i = 0; i < numDurabilitySprites; i++) {
        const durabilitySprite = this._durabilitySprites[i];
        durabilitySprite.setPosition(x + (durabilityOnLeft ? -8.0 : 8.0), y);
        y += durabilitySpriteHeight;
      }
    }
  },

  /* endregion LAYOUT */

  /* region CARD */

  /**
   * Artifact nodes should always use card inspect resource packages.
   * @see SdkNode.getCardResourcePackageId
   */
  getCardResourcePackageId(sdkCard) {
    return PKGS.getCardInspectPkgIdentifier(sdkCard.getId());
  },

  /**
   * Sets the sdk card.
   * @param {SDK.Card} sdkCard
   */
  setSdkCard(sdkCard) {
    const lastSdkCard = this.sdkCard;
    // update card if different
    if (lastSdkCard != sdkCard) {
      // reset last
      if (lastSdkCard != null) {
        // hide all durability sprites
        for (let i = 0, il = this._durabilitySprites.length; i < il; i++) {
          this._durabilitySprites[i].setVisible(false);
        }

        if (this.cardSprite != null) {
          this.cardSprite.destroy();
          this.cardSprite = null;
        }

        this.stopShowingPrismatic();
      }

      // update card always after resetting last and before showing next
      this._super(sdkCard);

      // create new
      if (this.sdkCard != null) {
        const contentSize = this.getContentSize();

        // card options
        const cardOptions = _.extend({}, sdkCard.getCardOptions());
        cardOptions.spriteIdentifier = sdkCard.getBaseAnimResource() && sdkCard.getBaseAnimResource().idle;
        cardOptions.antiAlias = false;
        if (cardOptions.scale == null) { cardOptions.scale = CONFIG.SCALE; }

        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

          // card sprite
          this.cardSprite = GlowSprite.create(cardOptions);

          // position card sprite
          const cardSpritePosition = this.cardSprite.getPosition();
          cardSpritePosition.x += contentSize.width * 0.5;
          cardSpritePosition.y += contentSize.height * 0.5;

          const cardSpriteOffset = cardOptions.offset;
          if (cardSpriteOffset != null) {
            cardSpritePosition.x += cardSpriteOffset.x;
            cardSpritePosition.y += cardSpriteOffset.y;
          }

          this.cardSprite.setAnchorPoint(0.5, 0.5);
          this.cardSprite.setPosition(cardSpritePosition);

          // add card sprite
          this.addChild(this.cardSprite, this._ui_z_order_card_sprite);

          // reposition fx
          this._fxHitSprite.setPosition(cardSpritePosition);
          this._fxBreakSprite.setPosition(cardSpritePosition);
        });

        if (!CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
          this.showPrismatic();
        }

        // reset for new card
        this.setDurability(CONFIG.MAX_ARTIFACT_DURABILITY);
        this.updateLayout();
        this.showInactiveAnimState();
      }
    }
  },

  /* endregion CARD */

  /* region STATES */

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
        this.showAnimState(animResource.active || animResource.idle, true);
      }
    }
  },

  showInactiveAnimState() {
    if (!this.highlighted && this.sdkCard != null) {
      const animResource = this.sdkCard.getBaseAnimResource();
      if (animResource) {
        this.showAnimState(animResource.idle);
      }
    }
  },

  stopAnimations() {
    this._super();

    this._fxHitSprite.setVisible(false);
    this._fxBreakSprite.setVisible(false);

    this._showRemoveAction = null;
  },

  /* endregion STATES */

  /* region HIGHLIGHT SELECTION */

  getHighlighted() {
    return this.highlighted;
  },

  setHighlighted(highlighted) {
    if (this.highlighted !== highlighted) {
      this.highlighted = highlighted;

      if (CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT && this.sdkCard != null && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
        if (this.highlighted) {
          this.showPrismatic();
        } else {
          this.stopShowingPrismatic();
        }
      }

      if (this.sdkCard != null) {
        // animate and glow
        if (this.highlighted) {
          this.showActiveAnimState();

          this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
            if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

            if (this.sdkCard.isOwnedByMyPlayer()) {
              this.cardSprite.showGlowForPlayer();
            } else {
              this.cardSprite.showGlowForOpponent();
            }
          });
        } else {
          this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
            if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
            this.cardSprite.setGlowing(false);
          });
        }
      }
    }
  },

  /* endregion HIGHLIGHT */

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
        const contentSize = this.getContentSize();
        this._prismaticGlow.setTextureRect(cc.rect(0, 0, 150, 150));
        this._prismaticGlow.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
        this.addChild(this._prismaticGlow, this._ui_z_order_card_sprite - 0.5);
      }

      this._prismaticGlow.fadeTo(duration, 255.0);
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

  /* region APPLY */

  /**
   * Shows the animated application of an artifact.
   * @param {SDK.Artifact} sdkCard
   * @param {Number} [showDelay=0.0]
   * @param {Function} [completionCallback]
   * @returns {Number} duration of animation
   */
  showApply(sdkCard, showDelay, completionCallback) {
    const showDuration = 0.0;
    if (showDelay == null) { showDelay = 0.0; }

    if (sdkCard != null) {
      // stop any running animations
      this.stopAnimations();

      // TODO: use animation
      this.setSdkCard(sdkCard);
      if (_.isFunction(completionCallback)) {
        completionCallback();
      }
    }

    return showDuration;
  },

  /* endregion APPLY */

  /* region REMOVE */

  /**
   * Shows the animated removal of an artifact.
   * @param {Number} [showDelay=0.0]
   * @param {Function} [completionCallback]
   * @returns {Number} duration of animation
   */
  showRemove(showDelay, completionCallback) {
    let showDuration = 0.0;
    if (showDelay == null) { showDelay = 0.0; }
    if (!this.getIsEmpty()) {
      // stop any running animations
      this.stopAnimations();

      // get animation data
      const animationAction = UtilsEngine.getAnimationAction(RSX.fxArtifactBreak.name);
      const animationDuration = animationAction.getDuration() * 0.75;

      // set show duration
      showDuration += animationDuration;

      // show fx break animation
      const fxAnimationAction = cc.sequence(
        cc.delayTime(showDelay),
        cc.show(),
        animationAction,
        cc.hide(),
        cc.callFunc(() => {
          // reset card
          this.setSdkCard(null);

          if (_.isFunction(completionCallback)) {
            completionCallback();
          }
        }),
      );
      this.addAnimationAction(fxAnimationAction);
      this._fxBreakSprite.runAction(fxAnimationAction);

      // get resources ready promise
      const whenCardResourcesReadyPromise = this.whenResourcesReady(this.getCardResourceRequestId());

      // create remove action
      this._showRemoveAction = cc.sequence(
        cc.delayTime(showDelay + animationDuration),
        cc.callFunc(() => {
          whenCardResourcesReadyPromise.then((cardResourceRequestId) => {
            if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
            if (this.cardSprite != null) {
              this.cardSprite.destroy();
              this.cardSprite = null;
            }
          });
        }),
      );

      // run remove action
      this.addAnimationAction(this._showRemoveAction);
      this.runAction(this._showRemoveAction);
    }

    return showDuration;
  },

  /* endregion REMOVE */

  /* region DURABILITY CHANGE */

  /**
   * Shows the animated damage of an artifact.
   * @param {Number} durabilityChange
   * @param {Number} [showDelay=0.0]
   * @param {Function} [completionCallback]
   * @returns {Number} duration of animation
   */
  showDurabilityChange(durabilityChange, showDelay, completionCallback) {
    let showDuration = 0.0;
    if (showDelay == null) { showDelay = 0.0; }

    if (durabilityChange !== 0 && !this.getIsEmpty()) {
      // set durability to current durability target
      // this ensures the visual display of durability is correct
      // even when this method is called again before the animations complete
      this.setDurability(this._durabilityTarget);

      const durability = this.getDurability();
      const durabilityTarget = durability + durabilityChange;
      if (durability > 0 && durabilityTarget > -1) {
        // store durability target
        this._durabilityTarget = durability + durabilityChange;

        // stop any running animations
        this.stopAnimations();

        // get animation data
        let animationAction;
        let animationDuration;
        if (durabilityChange < 0) {
          // get hit fx animation
          animationAction = UtilsEngine.getAnimationAction(RSX.fxArtifactHit.name);
          animationDuration = animationAction.getDuration() * 0.75;
        } else {
          // TODO: get repair fx animation
          animationDuration = 0.0;
        }

        // set show duration
        showDuration += animationDuration;

        if (durabilityChange < 0) {
          // show hit fx
          const fxAnimationAction = cc.sequence(
            cc.delayTime(showDelay),
            cc.show(),
            animationAction,
            cc.hide(),
          );
          this.addAnimationAction(fxAnimationAction);
          this._fxHitSprite.runAction(fxAnimationAction);
        } else {
          // TODO: show repair fx
        }

        // create change durability action
        const showDurabilityChangeAction = cc.sequence(
          cc.delayTime(showDelay + animationDuration),
          cc.callFunc(() => {
            this.setDurability(durabilityTarget);

            if (_.isFunction(completionCallback)) {
              completionCallback();
            }
          }),
        );

        // run change action
        this.addAnimationAction(showDurabilityChangeAction);
        this.runAction(showDurabilityChangeAction);
      }
    }

    return showDuration;
  },

  /* endregion DURABILITY CHANGE */

});

ArtifactNode.create = function (sdkCard, node) {
  return SdkNode.create(sdkCard, node || new ArtifactNode(sdkCard));
};

module.exports = ArtifactNode;
