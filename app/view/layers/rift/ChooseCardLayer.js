// pragma PKGS: rift
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const i18next = require('i18next');
const EVENTS = require('../../../common/event_types');
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
const FXRarityFlareSprite = require('../../nodes/fx/FXRarityFlareSprite');

/** **************************************************************************
 ChooseCardLayer
 *************************************************************************** */

const ChooseCardLayer = BaseLayer.extend({

  delegate: null,
  _currentlyHighlightedNode: null,
  _cardNodes: null,
  _fluidPuffNodes: null,
  _particleFountains: null,
  _rarityFlares: null,
  _selectedNode: null,
  _showingAnimationsPromise: null,

  // ui elements
  titleLabel: null,

  ctor(arenaData) {
    this._cardNodes = [];
    this._fluidPuffNodes = [];
    this._particleFountains = [];
    this._rarityFlares = [];

    // do super ctor
    this._super();

    this.titleLabel = new cc.LabelTTF('', RSX.font_bold.name, 24, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.titleLabel.setPosition(0, 220);
    this.addChild(this.titleLabel);
  },

  showCardOptions(cardIds) {
    // wait to show new cards until animations complete
    return (this._showingAnimationsPromise || Promise.resolve()).then(() => {
      // TODO: cache card nodes and reused for each set of card choices, currently there is a bug with keywords not showing correctly when these card nodes are cached
      _.each(this._cardNodes, (cardNode) => {
        cardNode.destroy();
      });
      this._cardNodes = [];

      // reset
      this.resetSelection();

      let isForGenerals = false;
      const revealDelay = 0.0;
      const xPositioningDelta = 260;
      const numCards = cardIds.length;
      for (let i = 0; i < numCards; i++) {
        const cardId = cardIds[i];
        const sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.current());

        if (sdkCard instanceof SDK.Entity && sdkCard.getIsGeneral()) {
          isForGenerals = true;
        }

        let cardNode = this._cardNodes[i];
        if (!cardNode) {
          cardNode = CardNode.create(sdkCard);
          // Calculate horizontal layout
          const xPosition = ((numCards - 1) * -0.5 + i) * xPositioningDelta * -1; // Cards appear in reverse order thus '* -1'
          cardNode.setPosition(xPosition, 0);
          cardNode.setGlowColor(CONFIG.ARENA_CARD_GLOW_COLOR);
          this.addChild(cardNode);
          this._cardNodes.push(cardNode);

          // disabled until fluid sprite texture is fixed
          const fxFluidPuff = BaseSprite.create(RSX.fx_fluid_sphere.name);
          fxFluidPuff.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
          fxFluidPuff.setScale(1.0);
          fxFluidPuff.setPosition(cardNode.getPosition());
          fxFluidPuff.setVisible(false);
          fxFluidPuff.setShaderProgram(cc.shaderCache.programForKey('Colorize'));
          this._fluidPuffNodes.push(fxFluidPuff);
          this.addChild(fxFluidPuff, 0);

          const rarityFlare = new FXRarityFlareSprite();
          rarityFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
          rarityFlare.setPosition(cardNode.getPosition().x, cardNode.getPosition().y + 50);
          rarityFlare.setVisible(false);
          rarityFlare.setScale(10.0);
          this.addChild(rarityFlare, 10);
          this._rarityFlares.push(rarityFlare);
        } else {
          cardNode.setSdkCard(sdkCard);
        }

        var extraDelayTimeForGlow = 0.0;

        if (sdkCard.rarityId > 1) {
          const rarityColor = SDK.RarityFactory.rarityForIdentifier(sdkCard.rarityId).color;

          const fluidSpriteAnimation = UtilsEngine.getAnimationAction(RSX.fx_fluid_sphere.name);
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
              cc.callFunc(function () {
                const flare = this.parent._rarityFlares[this.i];
                flare.setVisible(true);
                flare.setOpacity(0);
                flare.setPhase(1.0);
                flare.runAction(
                  cc.sequence(
                    cc.fadeIn(0.5),
                    cc.delayTime(1.0 + Math.random() * 0.6),
                    cc.spawn(
                      cc.actionTween(1.0, 'phase', 1.0, 0.25),
                    ),
                    cc.callFunc((() => {
                      // this.setVisible(false)
                    })),
                  ),
                );

                this.parent._fluidPuffNodes[this.i].setVisible(true);
                this.parent._fluidPuffNodes[this.i].setOpacity(0);
                // var particles = BaseParticleSystem.create({
                //   plistFile: RSX.card_reveal_fountain.plist,
                //   type: "Particles",
                //   fadeInAtLifePct:0.1,
                //   fadeOutAtLifePct:0.8
                // });
                // particles.setStartColor(rarityColor);
                // particles.setEndColor(rarityColor);
                // particles.setPosition(this.cardNode.getPosition());
                // particles.setAutoRemoveOnFinish(true);
                // this.parent.addChild(particles,this.i-1);
              }.bind({ parent: this, i, cardNode })),
              cc.spawn(
                cc.fadeIn(1.0),
                fluidSpriteAnimation,
                cc.sequence(
                  cc.delayTime(fluidSpriteAnimation.getDuration() - CONFIG.ANIMATE_FAST_DURATION),
                  cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
                ),
              ),
            ),
            cc.callFunc(function () {
              this.setVisible(false);
            }.bind(this._fluidPuffNodes[i])),
          ));
        }

        cardNode.setScale(1.0);
        cardNode.setOpacity(255);
        cardNode.setVisible(false);
        cardNode.runAction(
          cc.sequence(
            cc.delayTime(revealDelay + (numCards - i) * 0.4),
            cc.callFunc(function () {
              // play reveal sound
              audio_engine.current().play_effect(RSX.sfx_ui_card_reveal.audio, false);

              // show reveal
              this.setVisible(true);
              this.selectReveal().then(() => {
                this.setGlowing(true, 0.1 + extraDelayTimeForGlow / 2.0);
              });
            }.bind(cardNode)),
          ),
        );
      }

      if (isForGenerals) {
        this.titleLabel.setString(i18next.t('rift.select_general_message'));
      } else {
        this.titleLabel.setString(i18next.t('rift.select_card_message'));
      }
      this.titleLabel.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
    });
  },

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  onPointerMove(event) {
    if (event && event.isStopped) {
      return;
    }

    let mouseOverNode;
    if (!this.hasSelection()) {
      // intersect nodes
      const location = event && event.getLocation();
      if (location) {
        for (let i = 0; i < this._cardNodes.length; i++) {
          const node = this._cardNodes[i];
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

  onPointerUp(event) {
    if (event && event.isStopped) {
      return;
    }

    if (!this.hasSelection()) {
      const location = event && event.getLocation();
      if (location) {
        for (let i = 0; i < this._cardNodes.length; i++) {
          const node = this._cardNodes[i];
          if (UtilsEngine.getNodeUnderMouse(node, location.x, location.y)) {
            this.selectNode(node);
            event.stopPropagation();
            break;
          }
        }
      }
    }
  },

  highlightNode(node) {
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
        const sdkCard = this._currentlyHighlightedNode.getSdkCard();

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

  selectNode(selectedNode) {
    if (selectedNode != null && !this.hasSelection()) {
      this._selectedNode = selectedNode;
      const selectedSdkCard = this._selectedNode.getSdkCard();

      // play select audio
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.SELECT_SFX_PRIORITY);

      // get unselected cards
      const unselectedSdkCards = [];
      for (let i = 0; i < this._cardNodes.length; i++) {
        const node = this._cardNodes[i];
        const sdkCard = node.getSdkCard();
        if (selectedSdkCard !== sdkCard) {
          unselectedSdkCards.push(sdkCard);
        }
      }

      // hide title immediately if selected card is for general
      if (selectedSdkCard instanceof SDK.Entity && selectedSdkCard.getIsGeneral()) {
        this.titleLabel.fadeToInvisible(CONFIG.FADE_FAST_DURATION);
      }

      // set up an async promise that allows us to wait for animations to complete before showing anything else
      this._showingAnimationsPromise = this.showSelectedNode(this._selectedNode).finally(() => {
        this._showingAnimationsPromise = null;
      });

      // select card
      this.delegate.selectCard(selectedSdkCard, unselectedSdkCards).catch(() => {
        // reset if there is a problem
        this.resetSelection();
      });
    }
  },

  showSelectedNode(node) {
    return new Promise((resolve, reject) => {
      // emphasize selected card
      node.hideKeywords();
      node.cardBackgroundSprite.highlightIntensity = 6.0;
      node.toggleFadeOutlineSpriteGlow(true);
      node.showShine(0.6, 0.4);

      node.runAction(cc.sequence(
        cc.delayTime(0.6),
        cc.callFunc(() => {
          // show outline
          const tempOutline = new BaseSprite(node.getOutlineGlowSprite().getTexture());
          tempOutline.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
          tempOutline.setPosition(node.getPosition());
          tempOutline.setOpacity(0);
          this.addChild(tempOutline);
          tempOutline.runAction(cc.sequence(
            cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION * 0.5),
            cc.delayTime(0.2),
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            cc.callFunc(() => {
              tempOutline.destroy();
            }),
          ));

          // show particles
          const particles = new BaseParticleSystem(RSX.card_fade.plist);
          particles.setAutoRemoveOnFinish(true);
          particles.setPosition(node.getPosition());
          this.addChild(particles);
        }),
        cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
        cc.delayTime(0.4),
        cc.callFunc(() => {
          node.toggleFadeOutlineSpriteGlow(false, 0.0);
          node.setGlowing(false, 0.0);
        }),
      ));

      // deemphasize unselected cards
      for (let i = 0; i < this._cardNodes.length; i++) {
        const otherNode = this._cardNodes[i];
        if (otherNode != node) {
          const tempOutline = new BaseSprite(otherNode.getOutlineGlowSprite().getTexture());
          tempOutline.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
          tempOutline.setPosition(otherNode.getPosition());
          tempOutline.setScale(0.95);
          tempOutline.setOpacity(0);
          this.addChild(tempOutline);

          otherNode.hideKeywords();
          otherNode.setGlowing(false);
          const fadeAction = cc.sequence(
            cc.scaleBy(CONFIG.ANIMATE_FAST_DURATION, 0.9).easing(cc.easeOut(4.0)),
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
          );
          fadeAction.setTag(CONFIG.FADE_TAG);
          otherNode.runAction(fadeAction);

          tempOutline.runAction(cc.sequence(
            cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
            cc.delayTime(0.2),
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            cc.callFunc(function () {
              this.destroy();
            }.bind(tempOutline)),
          ));
        }
      }

      // wait for animations to complete and resolve
      this._showSelectedCardAction = cc.sequence(
        cc.delayTime(CONFIG.ANIMATE_FAST_DURATION + 1.0),
        cc.callFunc(() => {
          resolve();
        }),
      );
      this.runAction(this._showSelectedCardAction);
    });
  },

  hasSelection() {
    return this._selectedNode != null;
  },

  resetSelection() {
    if (this._showSelectedCardAction != null) {
      this.stopAction(this._showSelectedCardAction);
      this._showSelectedCardAction = null;
    }
    this._selectedNode = null;
    this.highlightNode(null);

    for (let i = 0; i < this._cardNodes.length; i++) {
      const node = this._cardNodes[i];
      node.resetShow();
      node.setGlowColor(CONFIG.ARENA_CARD_GLOW_COLOR);
      node.setGlowing(true);
      node.setLocalZOrder(0);
      node.setScale(1.0);
      node.setOpacity(255.0);
      node.setVisible(true);
    }
  },

  transitionIn() {
    return new Promise((resolve, reject) => {
      this.setOpacity(0.0);
      this.runAction(cc.sequence(
        cc.fadeIn(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  transitionOut() {
    return (this._showingAnimationsPromise || Promise.resolve()).then(() => new Promise((resolve, reject) => {
      this.runAction(cc.sequence(
        cc.fadeOut(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    }));
  },

});

ChooseCardLayer.create = function (layer) {
  return BaseLayer.create(layer || new ChooseCardLayer());
};

module.exports = ChooseCardLayer;
