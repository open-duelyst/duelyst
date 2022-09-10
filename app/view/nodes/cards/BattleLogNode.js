// pragma PKGS: game
const _ = require('underscore');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const SdkNode = require('./SdkNode');
const BaseSprite = require('../BaseSprite');

/** *************************************************************************
 BattleLogNode
 var BattleLogNode = SdkNode
 BattleLogNode.create()
 - node used to display battle log entries
 ************************************************************************** */

const BattleLogNode = SdkNode.extend({

  step: null,
  cardSprite: null,
  bgSprite: null,
  bgSpriteFriendly: null,
  bgSpriteEnemy: null,
  highlighted: false,

  /* region INITIALIZATION */

  ctor(step) {
    // initialize properties that may be required in init
    this.bgSpriteFriendly = new BaseSprite(RSX.battlelog_entry_frame_friendly.img);
    this.bgSpriteFriendly.setVisible(false);
    this.bgSpriteEnemy = new BaseSprite(RSX.battlelog_entry_frame_enemy.img);
    this.bgSpriteEnemy.setVisible(false);
    const contentSize = cc.size(CONFIG.BATTLELOG_ENTRY_SIZE, CONFIG.BATTLELOG_ENTRY_SIZE);

    // do super ctor
    this._super();

    // set anchor
    this.setAnchorPoint(0.5, 0.5);

    // set content size
    // this must be done after the cocos/super ctor
    this.setContentSize(contentSize);
    const centerPosition = this.getCenterPosition();

    // add bg
    this.bgSpriteFriendly.setPosition(centerPosition);
    this.bgSpriteEnemy.setPosition(centerPosition);
    this.addChild(this.bgSpriteFriendly);
    this.addChild(this.bgSpriteEnemy);

    // set step
    this.setStep(step);
  },

  /* endregion INITIALIZATION */

  /* region GETTERS / SETTERS */

  /**
   * Battle log nodes should always use card inspect resource packages.
   * @see SdkNode.getCardResourcePackageId
   */
  getCardResourcePackageId(sdkCard) {
    return PKGS.getCardInspectPkgIdentifier(sdkCard.getId());
  },

  setSdkCard(sdkCard, cardFadeDuration) {
    if (this.step != null && this.sdkCard !== sdkCard) {
      // destroy previous card
      if (this.sdkCard != null) {
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

        // set options
        const cardOptions = _.extend({}, sdkCard.getCardOptions());
        cardOptions.spriteIdentifier = sdkCard.getBaseAnimResource() && sdkCard.getBaseAnimResource().idle;
        cardOptions.antiAlias = false;

        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

          // create sprite
          this.cardSprite = BaseSprite.create(cardOptions);

          // flip sprite for player 2
          if (sdkCard instanceof SDK.Entity && sdkCard.isOwnedByPlayer2()) {
            this.cardSprite.setFlippedX(true);
          }

          // set base position of sprite
          let cardSpritePosition;
          if (sdkCard instanceof SDK.Unit) {
            this.cardSprite.setAnchorPoint(cc.p(0.5, 0));
            cardSpritePosition = cc.p(contentSize.width * 0.5, -contentSize.height * 0.5 + 35);
          } else {
            this.cardSprite.setAnchorPoint(0.5, 0.5);
            cardSpritePosition = cc.p(contentSize.width * 0.5, contentSize.height * 0.5);
          }

          // offset sprite
          const { offset } = cardOptions;
          if (offset != null) {
            cardSpritePosition.x += offset.x;
            cardSpritePosition.y += offset.y;
          }

          this.cardSprite.setPosition(cardSpritePosition);
          this.addChild(this.cardSprite);
        });
      }
    }
  },

  /**
   * Sets the step to be shown by this battle log node.
   * @param {SDK.Step} step
   */
  setStep(step) {
    const lastStep = this.step;
    // update if different
    if (lastStep != step) {
      // reset and stop
      this.stopShowingDetails();
      this.setHighlighted(false);

      // set step
      this.step = step;

      // reset last
      if (lastStep != null) {
        if (this.cardSprite != null) {
          this.cardSprite.destroy();
          this.cardSprite = null;
        }
      }

      // update card always after resetting last and before showing new
      if (this.step == null) {
        this.setSdkCard(null);
      } else {
        const action = this.step.getAction();

        // set sdk card
        let sdkCard;
        if (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction) {
          sdkCard = action.getCard();
        } else if (action instanceof SDK.MoveAction) {
          sdkCard = action.getSource();
        } else if (action instanceof SDK.AttackAction) {
          sdkCard = action.getSource();
        }
        this.setSdkCard(sdkCard);
      }

      // update sprites for owner
      this.updateSpritesForOwner();
    }
  },

  getStep() {
    return this.step;
  },

  getIsEmpty() {
    return this.step == null;
  },

  getAction() {
    if (this.step != null) {
      return this.step.getAction();
    }
  },

  /* endregion GETTERS / SETTERS */

  /* region LAYOUT */

  updateSpritesForOwner() {
    // get background based on player id
    let bgSprite;
    if (this.step != null) {
      const playerId = this.step.getPlayerId();
      if (playerId === SDK.GameSession.getInstance().getOpponentPlayerId()) {
        bgSprite = this.bgSpriteEnemy;
      } else {
        bgSprite = this.bgSpriteFriendly;
      }
    }

    if (this.bgSprite != bgSprite) {
      // reset previous
      if (this.bgSprite != null) {
        this.bgSprite.setVisible(false);
        this.bgSprite = null;
      }

      // store new
      this.bgSprite = bgSprite;

      // show new
      if (this.bgSprite != null) {
        this.bgSprite.setVisible(true);
      }
    }
  },

  /* endregion LAYOUT */

  /* region HIGHLIGHT */

  setHighlighted(val) {
    if (this.highlighted != val) {
      this.highlighted = val;
      if (this.highlighted) {
        this.showDetails();
      } else {
        this.stopShowingDetails();
      }
    }
  },

  getHighlighted() {
    return this.highlighted;
  },

  showDetails() {
    if (this.step != null) {
      const scene = this.getScene();
      const gameLayer = scene && scene.getGameLayer();
      if (gameLayer != null) {
        const action = this.step.getAction();

        // show by type
        if (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction) {
          // show inspect
          const sdkCard = this.getSdkCard();
          if (sdkCard != null) {
            gameLayer.showInspectCard(sdkCard, this);
          }
          /*
          var cardsProcessing = [sdkCard];
          var cardsToProcess = [];
          var cards = [];
          while(cardsProcessing.length > 0) {
            var nextCard = cardsProcessing.shift();
            cards.push(nextCard);
            cardsToProcess = cardsToProcess.concat(nextCard.getSubCards());
            if (cardsProcessing.length === 0) {
              cardsProcessing = cardsToProcess;
              cardsToProcess = [];
            }
          }

          // show an instructional arrow for each affected position
          var affectedBoardPositions = [];
          for (var i = 0, il = cards.length; i < il; i++) {
            var card = cards[i];
            if (card instanceof SDK.Spell) {
              var applyEffectPositions = card.getApplyEffectPositions();
              affectedBoardPositions = affectedBoardPositions.concat(applyEffectPositions);
            } else if (card instanceof SDK.Artifact) {
              affectedBoardPositions.push(SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId()).getPosition());
            } else {
              affectedBoardPositions.push(action.getTargetPosition());
            }
          }

          // convert board positions to screen positions
          var affectedScreenPositions = [];
          for (var i = 0, il = affectedBoardPositions.length; i < il; i++) {
            var affectedScreenPosition = UtilsEngine.transformBoardToTileMap(affectedBoardPositions[i]);
            affectedScreenPosition.y += 10.0;
            affectedScreenPositions.push(affectedScreenPosition);
          }

          this._instructionalArrows = [];
          if (affectedScreenPositions.length > 0) {
            // show an instructional arrow for each affected position
            for (var i = 0, il = affectedScreenPositions.length; i < il; i++) {
              var affectedScreenPosition = affectedScreenPositions[i];
              var instructionalArrowRemovalMethod = gameLayer.showPersistentInstructionalArrow(affectedScreenPosition, (il > 2 ? Math.random() * 0.15 : 0.0));
              this._instructionalArrows.push(instructionalArrowRemovalMethod);
            }
          }
          */
        } else if (action instanceof SDK.MoveAction) {
          const tileBoardPath = action.getPath();
          gameLayer.getAltPlayer().showTilePath(tileBoardPath, true);
        } else if (action instanceof SDK.AttackAction) {
          const directScreenPath = [UtilsEngine.transformBoardToTileMap(action.getSourcePosition()), UtilsEngine.transformBoardToTileMap(action.getTargetPosition())];
          gameLayer.getAltPlayer().showDirectPath(directScreenPath, true);
          gameLayer.getAltPlayer().showTargetTile(UtilsEngine.transformTileMapToScreen(directScreenPath[directScreenPath.length - 1]), false, CONFIG.TARGET_ACTIVE_OPACITY, CONFIG.FADE_FAST_DURATION, CONFIG.AGGRO_OPPONENT_COLOR, RSX.tile_attack.frame);
        }
      }
    }
  },

  stopShowingDetails() {
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      // remove paths and targets
      gameLayer.getAltPlayer().removePath();
      gameLayer.getAltPlayer().removeTargetTile();

      // remove arrows
      if (this._instructionalArrows != null && this._instructionalArrows.length > 0) {
        for (let i = 0, il = this._instructionalArrows.length; i < il; i++) {
          this._instructionalArrows[i].destroy(CONFIG.FADE_FAST_DURATION);
        }
        this._instructionalArrows = [];
      }

      // stop inspecting
      const sdkCard = this.getSdkCard();
      if (sdkCard != null) {
        gameLayer.stopShowingInspectCard(sdkCard);
      }
    }
  },

  /* endregion HIGHLIGHT */

  /* region ANIMATION */

  showIn(targetScreenPosition) {
    return new Promise((resolve, reject) => {
      // stop any running animations
      this.stopAnimations();

      // show animation
      const sourceScreenPosition = cc.p(targetScreenPosition.x, targetScreenPosition.y + CONFIG.BATTLELOG_ENTRY_SIZE * 0.5);
      this.setPosition(sourceScreenPosition);
      this.setOpacity(0.0);
      const animationAction = cc.sequence(
        cc.spawn(
          cc.fadeIn(CONFIG.FADE_FAST_DURATION),
          cc.moveTo(CONFIG.MOVE_FAST_DURATION, targetScreenPosition),
        ),
        cc.callFunc(() => {
          resolve();
        }),
      );
      this.addAnimationAction(animationAction);
      this.runAction(animationAction);
    });
  },

  showOut(sourceScreenPosition) {
    return new Promise((resolve, reject) => {
      // stop any running animations
      this.stopAnimations();

      // show animation
      const targetScreenPosition = cc.p(sourceScreenPosition.x, sourceScreenPosition.y - CONFIG.BATTLELOG_ENTRY_SIZE * 0.5);
      const animationAction = cc.sequence(
        cc.spawn(
          cc.fadeOut(CONFIG.FADE_FAST_DURATION),
          cc.moveTo(CONFIG.MOVE_FAST_DURATION, targetScreenPosition),
        ),
        cc.callFunc(() => {
          this.setStep(null);
          resolve();
        }),
      );
      this.addAnimationAction(animationAction);
      this.runAction(animationAction);
    });
  },

  showMoveToNext(targetScreenPosition) {
    return new Promise((resolve, reject) => {
      // stop any running animations
      this.stopAnimations();

      // show animation
      const animationAction = cc.sequence(
        cc.moveTo(CONFIG.MOVE_FAST_DURATION, targetScreenPosition),
        cc.callFunc(() => {
          resolve();
        }),
      );
      this.addAnimationAction(animationAction);
      this.runAction(animationAction);
    });
  },

  /* endregion ANIMATION */

});

BattleLogNode.create = function (step, node) {
  return SdkNode.create(null, node || new BattleLogNode(step));
};

module.exports = BattleLogNode;
