// pragma PKGS: card

const Promise = require('bluebird');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const EventBus = require('app/common/eventbus');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsEngine = require('app/common/utils/utils_engine');
const RenderPass = require('app/view/fx/RenderPass');
const XYZRotateTo = require('app/view/actions/XYZRotateTo');
const XYZRotateBy = require('app/view/actions/XYZRotateBy');
const SecondaryXYZRotateBy = require('app/view/actions/SecondaryXYZRotateBy');
const SecondaryXYZRotateTo = require('app/view/actions/SecondaryXYZRotateTo');
const TweenTypes = require('app/view/actions/TweenTypes');
const BaseSprite = require('app/view/nodes/BaseSprite');
const GlowSprite = require('app/view/nodes/GlowSprite');
const BaseLabel = require('app/view/nodes/BaseLabel');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const CardNodeVisualStateTag = require('app/view/nodes/visualStateTags/CardNodeVisualStateTag');
const CausticPrismaticGlowSprite = require('app/view/nodes/fx/CausticPrismaticGlowSprite');
const FXGlowImageMap = require('app/view/nodes/fx/FXGlowImageMap');
const FXCardShineSprite = require('app/view/nodes/fx/FXCardShineSprite');
const FXRarityFlareSprite = require('app/view/nodes/fx/FXRarityFlareSprite');
// var VoronoiPrismaticSprite = require("app/view/nodes/fx/VoronoiPrismaticSprite");
const FXFbmPolarFlareSprite = require('app/view/nodes/fx/FXFbmPolarFlareSprite');
const i18next = require('i18next');
const EntityNode = require('./EntityNode');
const SdkNode = require('./SdkNode');

/** **************************************************************************
 CardNode
 var CardNode = SdkNode
 CardNode.create()
 - node used to display cards as they appear in UI card format
 *************************************************************************** */

var CardNode = SdkNode.extend({

  _actionToShowStateFor: null,
  _actionEventTypeToShowStateFor: null,
  _atkInstructionalLabel: null,
  atkLabel: null,
  _cardBackId: null,
  _cardBackResourceRequestId: null,
  cardBackSprite: null,
  cardBackGlowOutlineSprite: null,
  cardBackgroundSpriteIdentifier: null,
  cardBackgroundSprite: null,
  cardNameLabel: null,
  cardSprite: null,
  _cardStackSprites: null,
  _cardStackLabel: null,
  _containerNode: null, // container for all the card's individual parts
  _containerNodeFront: null, // container for all the card front parts
  _containerNodeBack: null, // container for all the card back parts
  _flipAction: null,
  _flippingToFront: false,
  _glowMapNode: null, // glow effect node under card
  _hpInstructionalLabel: null,
  hpLabel: null,
  _keywordsNode: null,
  _keywordsBG: null,
  _keywordsContainerNode: null,
  _keywordsShowingOnLeft: false,
  _hasKeywords: false,
  _hasModifers: false,
  _keywordsDirty: false,
  _manaGemSprite: null,
  _manaInstructionalLabel: null,
  _manaInstructionalBg: null,
  manaLabel: null,
  _modifiersNode: null,
  _modifiersBG: null,
  _modifiersContainerNode: null,
  _modifiersDirty: false,
  _outlineGlow: null, // selectReveal glow outline sprite
  _outlineGlowAlt: null,
  _outlineGlowBlurred: null,
  _prismaticGlow: null,
  _renderPass: null, // render pass for snapshotting card
  shineNode: null,
  _showingShine: false,
  _showBaseState: true,
  _showingPrismatic: false,
  _showPrismaticShineAction: null,
  _silencedSprite: null, // silenced effect over card
  _signatureCardRing: null,
  _signatureCardSprite: null,
  _snapshotSprite: null, // sprite used to display card snapshot
  _staticContainerNodeFront: null, // container for all the card's non-animated parts
  _unitShadow: null,
  _voronoiEffectSprite: null,

  // used for booster opening to prevent mouse over until reveal is done
  _isAnimationInProgress: false,

  /* region INITIALIZATION */

  ctor(sdkCard) {
    // initialize properties that may be required in init
    this._cardStackSprites = [];

    // set content size to match background plus a little padding
    const cardBackgroundContentSize = this.getCardBackgroundContentSize();
    const contentSize = this.getCardContentSize();

    this._containerNode = new cc.Node();
    this._containerNode.setVisible(false);

    this._containerNodeBack = new cc.Node();
    this._containerNodeBack.setAnchorPoint(0.5, 0.5);
    this._containerNodeBack.setVisible(false);
    this._containerNode.addChild(this._containerNodeBack);

    this._containerNodeFront = new cc.Node();
    this._containerNodeFront.setAnchorPoint(0.5, 0.5);
    this._containerNodeFront.setVisible(false);
    this._containerNode.addChild(this._containerNodeFront);

    this._staticContainerNodeFront = new cc.Node();
    this._staticContainerNodeFront.setAnchorPoint(0.5, 0.5);
    this._staticContainerNodeFront.setVisible(true);
    this._containerNodeFront.addChild(this._staticContainerNodeFront, -1.0);

    // keywords node
    this._keywordsNode = new cc.Node();
    this._keywordsNode.setVisible(false);

    // keywords background
    this._keywordsBG = new cc.DrawNode();
    this._keywordsNode.addChild(this._keywordsBG, -1);
    this._containerNodeFront.addChild(this._keywordsNode, -4);

    // keywords container
    this._keywordsContainerNode = new cc.Node();
    this._keywordsNode.addChild(this._keywordsContainerNode);

    // modifier bar node
    this._modifiersNode = new cc.Node();
    this._modifiersNode.setVisible(false);
    this._modifiersNode.setAnchorPoint(0.5, 0);

    // modifier bar background
    this._modifiersBG = new cc.DrawNode();
    this._modifiersNode.addChild(this._modifiersBG, -1);
    this._containerNodeFront.addChild(this._modifiersNode, -4);

    // modifiers container
    this._modifiersContainerNode = new cc.Node();
    this._modifiersNode.addChild(this._modifiersContainerNode);

    // render pass
    this._renderPass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, contentSize.width, contentSize.height, 1, false);
    this._renderPassStackId = RenderPass.get_new_reset_stack_id();
    this._snapshotSprite = GlowSprite.create(this._renderPass.getTexture());
    this._snapshotSprite.setVisible(false);
    this._snapshotSprite.setAntiAlias(false);
    this._snapshotSprite.setGlowPadding(40.0);
    this._snapshotSprite.setGlowThickness(2.0);
    this._snapshotSprite.setGlowBlurStrength('strong');
    this._snapshotSprite.setGlowVerticalFadeFromTop(0.7);
    this._snapshotSprite.setDissolveFrequency(15.0);

    // snapshot uses renderpass texture directly, which may be scaled up to match device pixel ratio
    this._snapshotSprite.setTextureRect(cc.rect(0, 0, contentSize.width, contentSize.height));

    // fix for HiDPI screens: force quad texture coords to go edge to edge and flip for cocos
    this._snapshotSprite._renderCmd.setTextureCoordsEdgeToEdgeAndFlipped();

    // card specific highlight tweaks
    this._snapshotSprite.highlightColor = cc.color(70.0, 200.0, 255.0, 255.0);
    this._snapshotSprite.highlightFrequency = 0.0; // no pulsating
    this._snapshotSprite.highlightIntensity = 4.0;
    this._snapshotSprite.setHighlightThreshold(0.15);
    this._snapshotSprite.highlightBrightness = 0.9;
    this._snapshotSprite.highlightLevelsInBlack = 10.0;
    this._snapshotSprite.highlightLevelsInWhite = 170.0;
    this._snapshotSprite.highlightLevelsInGamma = 1.1; // 1.1 to reduce brights / increase blacks
    this._snapshotSprite.highlightLevelsOutBlack = 10.0;
    this._snapshotSprite.highlightLevelsOutWhite = 255.0;
    this._snapshotSprite.setHighlightBlurStrength('strong');

    // mana label
    this.manaLabel = new cc.LabelTTF('', RSX.font_bold.name, 24, cc.size(48, 24), cc.TEXT_ALIGNMENT_CENTER);
    this.manaLabel.setFontFillColor({ r: 0, g: 33, b: 159 });
    this.manaLabel.setAnchorPoint(0.51, 0.65);
    this.manaLabel.setVisible(false);
    this._staticContainerNodeFront.addChild(this.manaLabel, 2);

    // card name
    this.cardNameLabel = new cc.LabelTTF('', RSX.font_regular.name, 14, cc.size(0, 0), cc.TEXT_ALIGNMENT_CENTER);
    this.cardNameLabel.setFontFillColor(cc.color.WHITE);
    this._staticContainerNodeFront.addChild(this.cardNameLabel, 2);

    // type
    this.cardTypeLabel = new cc.LabelTTF('', RSX.font_regular.name, 12, cc.size(cardBackgroundContentSize.width, 16), cc.TEXT_ALIGNMENT_CENTER);
    this.cardTypeLabel.setFontFillColor(cc.color(144, 202, 207));
    this._staticContainerNodeFront.addChild(this.cardTypeLabel, 2);

    // faction name
    this.factionNameLabel = new cc.LabelTTF('', RSX.font_bold.name, 14, cc.size(cardBackgroundContentSize.width, 30), cc.TEXT_ALIGNMENT_CENTER);
    this.factionNameLabel.setFontFillColor(cc.color(200, 200, 200, 255));
    this.factionNameLabel.enableStroke(cc.color(0, 0, 0, 255), 2, false);
    this.factionNameLabel.setVisible(false);
    this._staticContainerNodeFront.addChild(this.factionNameLabel, 2);

    // stats
    this.atkLabel = new cc.LabelTTF('', RSX.font_bold.name, 24, cc.size(48, 26), cc.TEXT_ALIGNMENT_CENTER);
    this.atkLabel.setFontFillColor(CONFIG.ATK_COLOR);
    this.atkLabel.setVisible(false);
    this._staticContainerNodeFront.addChild(this.atkLabel, 2);

    this.hpLabel = new cc.LabelTTF('', RSX.font_bold.name, 24, cc.size(48, 26), cc.TEXT_ALIGNMENT_CENTER);
    this.hpLabel.setFontFillColor(CONFIG.HP_COLOR);
    this.hpLabel.setVisible(false);
    this._staticContainerNodeFront.addChild(this.hpLabel, 2);

    // description
    this.cardDescriptionLabel = new BaseLabel('', RSX.font_light.name, 13, cc.size(cardBackgroundContentSize.width - 20, 0), cc.TEXT_ALIGNMENT_CENTER);
    const fontNamesByFormattingTag = {};
    fontNamesByFormattingTag[CONFIG.FORMATTING_ENGINE.boldStart] = RSX.font_bold.name;
    this.cardDescriptionLabel.setFontNamesByFormattingTag(fontNamesByFormattingTag);
    this.cardDescriptionLabel.setFontFillColor(cc.color(144, 202, 207));
    // this.cardDescriptionLabel.setOpacity(200);
    this.cardDescriptionLabel.setLineHeight(16);
    this.cardDescriptionLabel.setAnchorPoint(0.5, 0.5);
    this.cardDescriptionLabel.setPosition(0.0, -90);
    this._staticContainerNodeFront.addChild(this.cardDescriptionLabel, 2);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // card front background
      this.cardBackgroundSprite = GlowSprite.create(RSX.card_neutral_spell.img);
      this._containerNodeFront.addChild(this.cardBackgroundSprite, -3.0);

      // shadow
      this._unitShadow = BaseSprite.create(RSX.unit_shadow.img);
      this._unitShadow.setOpacity(0.0);
      this._staticContainerNodeFront.addChild(this._unitShadow);

      // mana gem
      this._manaGemSprite = BaseSprite.create(RSX.icon_mana.img);
      this._manaGemSprite.setVisible(false);
      this._staticContainerNodeFront.addChild(this._manaGemSprite);

      // rarity sprites
      this._raritySpriteCommon = new BaseSprite(RSX.card_rarity_common.img);
      this._raritySpriteCommon.setVisible(false);
      this._staticContainerNodeFront.addChild(this._raritySpriteCommon, 2);
      this._raritySpriteRare = new BaseSprite(RSX.card_rarity_rare.img);
      this._raritySpriteRare.setVisible(false);
      this._staticContainerNodeFront.addChild(this._raritySpriteRare, 2);
      this._raritySpriteEpic = new BaseSprite(RSX.card_rarity_epic.img);
      this._raritySpriteEpic.setVisible(false);
      this._staticContainerNodeFront.addChild(this._raritySpriteEpic, 2);
      this._raritySpriteLegendary = new BaseSprite(RSX.card_rarity_legendary.img);
      this._raritySpriteLegendary.setVisible(false);
      this._staticContainerNodeFront.addChild(this._raritySpriteLegendary, 2);
      this._raritySpriteMythron = new BaseSprite(RSX.card_rarity_mythron.img);
      this._raritySpriteMythron.setVisible(false);
      this._staticContainerNodeFront.addChild(this._raritySpriteMythron, 2);

      // glow map
      this._glowMapNode = new FXGlowImageMap({
        spriteIdentifier: RSX.card_shadow_map.img,
        // blendSrc: "SRC_ALPHA",
        // blendDst: "ONE",
        scale: 1.0,
        gamma: 2.0,
        glowColor: CONFIG.DEFAULT_GLOW_COLOR,
      });
      this._glowMapNode.setVisible(false);

      // silenced sprite
      this._silencedSprite = new BaseSprite(RSX.card_silenced.img);
      this._silencedSprite.setAnchorPoint(0.5, 0.5);
      this._silencedSprite.setPosition(0.0, -88);
      this._silencedSprite.setVisible(false);
      this._staticContainerNodeFront.addChild(this._silencedSprite, 9999);

      // outline glows for select reveal
      this._outlineGlowUnit = BaseSprite.create(RSX.card_reveal_glow_unit.img);
      this._outlineGlowUnit.setPosition(0.0, 0.0);
      this._outlineGlowUnit.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowUnit.setVisible(false);
      this._outlineGlowUnitAlt = BaseSprite.create(RSX.card_reveal_glow_unit.img);
      this._outlineGlowUnitAlt.setPosition(0.0, 0.0);
      this._outlineGlowUnitAlt.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowUnitAlt.setVisible(false);
      this._outlineGlowUnitBlurred = BaseSprite.create(RSX.card_reveal_glow_unit_blurred.img);
      this._outlineGlowUnitBlurred.setPosition(0.0, 0.0);
      this._outlineGlowUnitBlurred.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowUnitBlurred.setVisible(false);

      this._outlineGlowSpell = BaseSprite.create(RSX.card_reveal_glow_spell.img);
      this._outlineGlowSpell.setPosition(0.0, 0.0);
      this._outlineGlowSpell.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowSpell.setVisible(false);
      this._outlineGlowSpellAlt = BaseSprite.create(RSX.card_reveal_glow_spell.img);
      this._outlineGlowSpellAlt.setPosition(0.0, 0.0);
      this._outlineGlowSpellAlt.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowSpellAlt.setVisible(false);
      this._outlineGlowSpellBlurred = BaseSprite.create(RSX.card_reveal_glow_spell_blurred.img);
      this._outlineGlowSpellBlurred.setPosition(0.0, 0.0);
      this._outlineGlowSpellBlurred.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowSpellBlurred.setVisible(false);

      this._outlineGlowArtifact = BaseSprite.create(RSX.card_reveal_glow_artifact.img);
      this._outlineGlowArtifact.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowArtifact.setVisible(false);
      this._outlineGlowArtifactAlt = BaseSprite.create(RSX.card_reveal_glow_artifact.img);
      this._outlineGlowArtifactAlt.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowArtifactAlt.setVisible(false);
      this._outlineGlowArtifactBlurred = BaseSprite.create(RSX.card_reveal_glow_artifact_blurred.img);
      this._outlineGlowArtifactBlurred.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._outlineGlowArtifactBlurred.setVisible(false);

      // position elements
      const centerPosition = this.getCenterPosition();

      // container elements in center
      this._glowMapNode.setPosition(centerPosition);

      // outline glow elements in the center since they sit above containers
      this._outlineGlowArtifactBlurred.setPosition(centerPosition);
      this._outlineGlowArtifactAlt.setPosition(centerPosition);
      this._outlineGlowArtifact.setPosition(centerPosition);
      this._outlineGlowUnitBlurred.setPosition(centerPosition);
      this._outlineGlowUnitAlt.setPosition(centerPosition);
      this._outlineGlowUnit.setPosition(centerPosition);
      this._outlineGlowSpellBlurred.setPosition(centerPosition);
      this._outlineGlowSpellAlt.setPosition(centerPosition);
      this._outlineGlowSpell.setPosition(centerPosition);

      // contained elements relative to center
      this._manaGemSprite.setPosition(-100, cardBackgroundContentSize.height * 0.5 - 20);
      this.manaLabel.setPosition(-100, cardBackgroundContentSize.height * 0.5 - 17);
      this.atkLabel.setPosition(-61, -32);
      this.hpLabel.setPosition(59, -32);
      this.cardNameLabel.setPosition(0.0, 21.0);
      this.cardTypeLabel.setPosition(0.0, 4.0);
      this.factionNameLabel.setPosition(0.0, -150.0);
      this._raritySpriteCommon.setPosition(0.0, -25.0);
      this._raritySpriteRare.setPosition(0.0, -25.0);
      this._raritySpriteEpic.setPosition(0.0, -25.0);
      this._raritySpriteLegendary.setPosition(0.0, -25.0);
      this._raritySpriteMythron.setPosition(0.0, -25.0);

      // add children after cocos ctor
      this.addChild(this._glowMapNode, -2);

      // add outline glows
      this.addChild(this._outlineGlowUnit, 3);
      this.addChild(this._outlineGlowUnitAlt, 3);
      this.addChild(this._outlineGlowUnitBlurred, 3);
      this.addChild(this._outlineGlowSpell, 3);
      this.addChild(this._outlineGlowSpellAlt, 3);
      this.addChild(this._outlineGlowSpellBlurred, 3);
      this.addChild(this._outlineGlowArtifact, 3);
      this.addChild(this._outlineGlowArtifactAlt, 3);
      this.addChild(this._outlineGlowArtifactBlurred, 3);

      // TODO: for performance, snapshot the non animated elements
      // this.recordStaticSnapshot();
    });

    // do super ctor
    this._super(sdkCard);

    // set content size immediately
    // otherwise content size will not be set until assets load
    // which could cause values that use content size to be incorrect
    this.setContentSize(contentSize);

    // position elements
    const centerPosition = this.getCenterPosition();

    // container elements in center
    this._snapshotSprite.setPosition(centerPosition);
    this._containerNodeFront.setPosition(centerPosition);
    this._containerNodeBack.setPosition(centerPosition);

    // add children after cocos ctor
    this.addChild(this._snapshotSprite, 2);
    this.addChild(this._containerNode, 1);
  },

  getRequiredResources() {
    return SdkNode.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('card'));
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) return this._super();

    return new CardNode.WebGLRenderCmd(this);
  },

  resetShow() {
    this.stopAnimations();
    this.setShowBaseState(true);
    this.setActionToShowStateFor(null);
    this.setActionEventTypeToShowStateFor(null);
    this.hideSnapshot();
    this.hideKeywords();
    this.setKeywordsDirty();
    this.hideModifiers();
    this.setModifiersDirty();
    this.toggleFadeOutlineSpriteGlow(false, 0.0);
    this.setHighlighted(false);
    this.setGlowing(false, 0.0);
    this.stopShowingShine();
    this.stopShowingStack();
    this.stopShowingPrismatic();
    this.resetFlip();
    this.setOpacity(255.0);
    this._containerNodeFront.setVisible(true);
  },

  /* endregion INITIALIZATION */

  /* region COCOS EVENTS */

  onExit() {
    if (this._renderPass != null) {
      this._renderPass.release();
      this._renderPass = null;
    }

    SdkNode.prototype.onExit.call(this);
  },

  /* endregion COCOS EVENTS */

  /* region RESOURCES */

  /**
   * Card nodes should always use card inspect resource packages.
   * @see SdkNode.getCardResourcePackageId
   */
  getCardResourcePackageId(sdkCard) {
    return PKGS.getCardInspectPkgIdentifier(sdkCard.getId());
  },

  /* endregion RESOURCES */

  /* region GETTERS / SETTERS */

  /**
   * Binds a skd card to this node, populating all sprites and visual data.
   * @param {SDK.Card} sdkCard
   * @param {Boolean} [showBaseState=true]
   * @param {Action} [actionToShowStateFor=null]
   * @param {String} [actionEventTypeToShowStateFor=null]
   */
  setSdkCard(sdkCard, showBaseState, actionToShowStateFor, actionEventTypeToShowStateFor) {
    // update card if different
    if (this.sdkCard != sdkCard) {
      // reset last card
      if (this.sdkCard != null) {
        if (this.cardSprite != null) {
          this.cardSprite.destroy();
          this.cardSprite = null;
        }
        if (this._signatureCardRing != null) {
          this._signatureCardRing.destroy();
          this._signatureCardRing = null;
        }
        if (this._signatureCardSprite != null) {
          this._signatureCardSprite.destroy();
          this._signatureCardSprite = null;
        }
        if (this._unitShadow != null) {
          this._unitShadow.fadeToInvisible();
        }
        this.stopShowingPrismatic();
      }

      // update card always after resetting last and before showing new
      this._super(sdkCard);

      // reset visual state for new card
      this.resetShow();
      this._containerNode.setVisible(false);

      if (sdkCard != null) {
        if (showBaseState == null) { showBaseState = true; }
        this.setShowBaseState(showBaseState);
        this.setActionToShowStateFor(actionToShowStateFor);
        this.setActionEventTypeToShowStateFor(actionEventTypeToShowStateFor);

        const isPrismatic = SDK.Cards.getIsPrismaticCardId(sdkCard.getId());

        Promise.all([
          this.whenRequiredResourcesReady(),
          this.whenResourcesReady(this.getCardResourceRequestId()),
        ])
          .spread((requiredRequestId, cardResourceRequestId) => {
            if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(cardResourceRequestId)) return; // load invalidated or resources changed

            this._containerNode.setVisible(true);
            /*
           // TODO: per faction card backgrounds
           var factionBgIdentifier = sdkCard.factionId == SDK.Factions.Neutral ? "neutral" : "f"+sdkCard.factionId;
           var bgSpriteIdentifier;
           if (sdkCard instanceof SDK.Entity) {
           bgSpriteIdentifier = RSX["card_" + factionBgIdentifier + "_unit"].img;
           } else if (sdkCard instanceof SDK.Artifact) {
           bgSpriteIdentifier = RSX["card_" + factionBgIdentifier + "_artifact"].img;
           } else {
           bgSpriteIdentifier = RSX["card_" + factionBgIdentifier + "_spell"].img;
           }
           */
            // neutral card background
            let bgSpriteIdentifier;
            if (sdkCard instanceof SDK.Entity) {
              bgSpriteIdentifier = isPrismatic ? RSX.card_neutral_prismatic_unit.img : RSX.card_neutral_unit.img;
            } else if (sdkCard instanceof SDK.Artifact) {
              bgSpriteIdentifier = isPrismatic ? RSX.card_neutral_prismatic_artifact.img : RSX.card_neutral_artifact.img;
            } else {
              bgSpriteIdentifier = isPrismatic ? RSX.card_neutral_prismatic_spell.img : RSX.card_neutral_spell.img;
            }
            this.cardBackgroundSpriteIdentifier = bgSpriteIdentifier;
            this.cardBackgroundSprite.setTexture(cc.textureCache.getTextureForKey(bgSpriteIdentifier));

            // card options
            const cardOptions = _.extend({}, sdkCard.getCardOptions());
            cardOptions.spriteIdentifier = sdkCard.getAnimResource() && sdkCard.getAnimResource().idle;
            cardOptions.antiAlias = false;

            // card sprite
            this.cardSprite = GlowSprite.create(cardOptions);
            if (cardOptions.scale == null) {
              this.cardSprite.setScale(CONFIG.SCALE);
            }
            this._containerNodeFront.addChild(this.cardSprite, 0);

            let cardSpritePosition;
            if (sdkCard instanceof SDK.Unit) {
              if (sdkCard.isOwnedByPlayer2()) {
                this.cardSprite.setFlippedX(true);
              }

              this.cardSprite.setAnchorPoint(cc.p(0.5, 0));
              cardSpritePosition = cc.p(0.0, 8);
            } else {
              cardSpritePosition = cc.p(0.0, 75);
            }

            const cardSpriteOffset = cardOptions.offset;
            if (cardSpriteOffset != null) {
              cardSpritePosition.x += cardSpriteOffset.x;
              cardSpritePosition.y += cardSpriteOffset.y;
            }
            this.cardSprite.setPosition(cardSpritePosition);

            // shadow
            if (!(sdkCard instanceof SDK.Tile)) {
              this._unitShadow.fadeTo(0.0, (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? 200.0 : 150.0));
              if (sdkCard instanceof SDK.Unit) {
                this._unitShadow.setPosition(0.0, 43);
              } else {
                this._unitShadow.setPosition(0.0, 45);
              }
            }

            if (sdkCard instanceof SDK.Entity && sdkCard.getWasGeneral()) {
              // hide mana sprites
              this._manaGemSprite.setVisible(false);

              const referenceSignatureCard = sdkCard.getReferenceSignatureCard();
              if (referenceSignatureCard != null) {
                const signatureCardPosition = this._manaGemSprite.getPosition();
                signatureCardPosition.x += 3.0;
                signatureCardPosition.y -= 3.0;

                // signature card ring
                this._signatureCardRing = BaseSprite.create(RSX.signature_card_ring_small.img);
                this._signatureCardRing.setPosition(signatureCardPosition);
                this._staticContainerNodeFront.addChild(this._signatureCardRing);

                // signature card sprite
                const signatureCardOptions = _.extend({}, referenceSignatureCard.getCardOptions());
                signatureCardOptions.spriteIdentifier = referenceSignatureCard.getAnimResource() && referenceSignatureCard.getAnimResource().idle;
                signatureCardOptions.antiAlias = false;
                this._signatureCardSprite = BaseSprite.create(signatureCardOptions);
                this._signatureCardSprite.setPosition(signatureCardPosition);
                this._staticContainerNodeFront.addChild(this._signatureCardSprite);
              }
            } else {
              // show mana sprites
              this._manaGemSprite.setVisible(true);
            }

            if (!CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT
            && !(sdkCard instanceof SDK.Tile)
            && SDK.Cards.getIsPrismaticCardId(sdkCard.getId())) {
              this.showPrismatic();
            }

            // rarity
            if (this.raritySprite != null) {
              this.raritySprite.setVisible(false);
              this.raritySprite = null;
            }

            switch (sdkCard.rarityId) {
            case SDK.Rarity.Common:
              this.raritySprite = this._raritySpriteCommon;
              break;
            case SDK.Rarity.Rare:
              this.raritySprite = this._raritySpriteRare;
              break;
            case SDK.Rarity.Epic:
              this.raritySprite = this._raritySpriteEpic;
              break;
            case SDK.Rarity.Legendary:
              this.raritySprite = this._raritySpriteLegendary;
              break;
            case SDK.Rarity.Mythron:
              this.raritySprite = this._raritySpriteMythron;
              break;
            }

            if (this.raritySprite != null) {
              this.raritySprite.setVisible(true);
            }

            // glow for select reveal
            if (this._outlineGlow != null) {
              this._outlineGlow.setVisible(false);
            }
            if (this._outlineGlowAlt != null) {
              this._outlineGlowAlt.setVisible(false);
            }

            if (sdkCard instanceof SDK.Entity) {
              this._outlineGlow = this._outlineGlowUnit;
              this._outlineGlowAlt = this._outlineGlowUnitAlt;
              this._outlineGlowBlurred = this._outlineGlowUnitBlurred;
            } else if (sdkCard instanceof SDK.Artifact) {
              this._outlineGlow = this._outlineGlowArtifact;
              this._outlineGlowAlt = this._outlineGlowArtifactAlt;
              this._outlineGlowBlurred = this._outlineGlowArtifactBlurred;
            } else {
              this._outlineGlow = this._outlineGlowSpell;
              this._outlineGlowAlt = this._outlineGlowSpellAlt;
              this._outlineGlowBlurred = this._outlineGlowSpellBlurred;
            }

            // start animated elements
            this.showInactiveAnimState();
          });

        if (sdkCard instanceof SDK.Entity && sdkCard.getWasGeneral()) {
          // hide mana label
          this.manaLabel.setVisible(false);
        } else {
          // show mana label
          this.manaLabel.setVisible(true);
        }

        // card name
        if (sdkCard.getName().length >= 23) {
          this.cardNameLabel.setFontSize(12);
        } else {
          this.cardNameLabel.setFontSize(14);
        }
        this.cardNameLabel.setString(sdkCard.getName().toUpperCase(), true);

        // race and type
        const raceId = sdkCard.getRaceId();
        const race = SDK.RaceFactory.raceForIdentifier(raceId);
        let raceName = race && race.name;
        const cardType = sdkCard.getType();
        let cardTypeColor;
        if (SDK.CardType.getIsArtifactCardType(cardType)) {
          cardTypeColor = { r: 237, g: 209, b: 68 };
        } else {
          cardTypeColor = { r: 144, g: 202, b: 207 };
        }
        if (!raceName) {
          if (SDK.CardType.getIsArtifactCardType(cardType)) {
            raceName = i18next.t('common.artifact_label');
          } else if (SDK.CardType.getIsSpellCardType(cardType)) {
            raceName = i18next.t('common.spell_label');
          } else if (SDK.CardType.getIsTileCardType(cardType)) {
            raceName = i18next.t('common.tile_label');
          } else if (sdkCard.getIsGeneral()) {
            raceName = i18next.t('common.general_label');
          } else {
            raceName = i18next.t('common.unit_label');
          }
        }
        this.cardTypeLabel.setString(raceName.toUpperCase(), true);
        this.cardTypeLabel.setFontFillColor(cardTypeColor);

        // description
        const description = sdkCard.getDescription(CONFIG.FORMATTING_ENGINE);
        let descriptionLength = description.length;
        if (description.includes('\n')) {
          descriptionLength += 15;
        }
        if (descriptionLength >= 110) {
          this.cardDescriptionLabel.setFontSize(11);
        } else {
          this.cardDescriptionLabel.setFontSize(13);
        }
        this.cardDescriptionLabel.setString(sdkCard.getDescription(CONFIG.FORMATTING_ENGINE), true);

        // faction name
        const faction = SDK.FactionFactory.factionForIdentifier(sdkCard.getFactionId());
        const factionName = faction ? faction.name.toUpperCase() : '';
        this.factionNameLabel.setString(factionName, true);

        // stats
        this.updateStats();
      }
    }
  },

  updateStats() {
    const stateAtAction = this.getStateForActionToShowStateFor();
    const manaCost = (stateAtAction != null && stateAtAction.manaCost != null ? stateAtAction.manaCost : (this.sdkCard && this.sdkCard.manaCost)) || 0;

    if (`${manaCost}` !== this.manaLabel.getString()) {
      this.manaLabel.setString(manaCost, true);
    }

    if (this.sdkCard instanceof SDK.Entity) {
      // stat values and visibility
      let atk;
      let hp;
      if (stateAtAction != null) {
        atk = stateAtAction.atk != null ? stateAtAction.atk : this.sdkCard.atk;
        hp = stateAtAction.hp != null ? stateAtAction.hp : this.sdkCard.maxHP;
      } else {
        atk = this.sdkCard.atk;
        hp = this.sdkCard.maxHP;
      }

      if (this.sdkCard instanceof SDK.Unit) {
        if (`${atk}` !== this.atkLabel.getString()) {
          this.atkLabel.setString(atk, true);
        }
        this.atkLabel.setVisible(true);
        if (`${hp}` !== this.hpLabel.getString()) {
          this.hpLabel.setString(hp, true);
        }
        this.hpLabel.setVisible(true);
      } else {
        if (atk > 0) {
          if (`${atk}` !== this.atkLabel.getString()) {
            this.atkLabel.setString(atk, true);
          }
          this.atkLabel.setVisible(true);
        } else {
          this.atkLabel.setVisible(false);
        }
        if (hp > 0) {
          if (`${hp}` !== this.hpLabel.getString()) {
            this.hpLabel.setString(hp, true);
          }
          this.hpLabel.setVisible(true);
        } else {
          this.hpLabel.setVisible(false);
        }
      }

      // color stats
      if (stateAtAction != null) {
        if (this.atkLabel.isVisible()) {
          const baseATK = stateAtAction.baseATK != null ? stateAtAction.baseATK : this.sdkCard.atk;
          if (atk < baseATK) {
            this.atkLabel.setFontFillColor(CONFIG.NERF_COLOR);
          } else if (atk > baseATK) {
            this.atkLabel.setFontFillColor(CONFIG.BUFF_COLOR);
          } else {
            this.atkLabel.setFontFillColor(cc.color.WHITE);
          }
        }
        if (this.hpLabel.isVisible()) {
          if (stateAtAction.damage != null && stateAtAction.damage !== 0) {
            this.hpLabel.setFontFillColor(CONFIG.NERF_COLOR);
          } else if (stateAtAction.maxHP != null && stateAtAction.baseMaxHP != null && stateAtAction.maxHP > stateAtAction.baseMaxHP) {
            this.hpLabel.setFontFillColor(CONFIG.BUFF_COLOR);
          } else {
            this.hpLabel.setFontFillColor(cc.color.WHITE);
          }
        }
      } else {
        this.atkLabel.setFontFillColor(CONFIG.ATK_COLOR);
        this.hpLabel.setFontFillColor(CONFIG.HP_COLOR);
      }
    } else {
      this.atkLabel.setVisible(false);
      this.hpLabel.setVisible(false);
    }
  },

  /**
   * Sets card highlighted state, showing glow around card.
   */
  setHighlighted(highlighted) {
    if (this.highlighted != highlighted) {
      this.highlighted = highlighted;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        if (this._glowMapNode != null) {
          if (this.highlighted) {
            this.showActiveAnimState();
            if (!this.getGlowing()) {
              this._glowMapNode.setVisible(true);
              this._glowMapNode.stopAllActions();
              this._glowMapNode.runAction(cc.fadeIn(0.1));
            }
          } else {
            if (!this.getGlowing()) {
              this._glowMapNode.stopAllActions();
              this._glowMapNode.runAction(cc.sequence(
                cc.fadeOut(0.1),
                cc.callFunc(() => {
                  this._glowMapNode.setVisible(false);
                }),
              ));
            }
            this.showInactiveAnimState();
          }
        }
      });
    }
  },

  /**
   * Sets card glwoing state, showing glow around card.
   */
  setGlowing(glowing, duration) {
    if (this.glowing != glowing) {
      duration = duration || 0.1;
      this.glowing = glowing;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        if (this._glowMapNode != null) {
          if (this.glowing) {
            this._glowMapNode.setVisible(true);
            this._glowMapNode.stopAllActions();
            this._glowMapNode.setOpacity(0);
            this._glowMapNode.runAction(cc.fadeIn(duration));
          } else {
            this._glowMapNode.stopAllActions();
            this._glowMapNode.runAction(cc.sequence(
              cc.fadeOut(duration),
              cc.callFunc(() => {
                this._glowMapNode.setVisible(false);
              }),
            ));
          }
        }
      });
    }
  },

  getGlowing(glowing) {
    return this.glowing;
  },

  setGlowColor(color) {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      this._glowMapNode.setGlowColor(color);
    });
  },

  toggleFadeOutlineSpriteGlow(glowing, duration) {
    if (this.outlineSpriteGlowing !== glowing) {
      duration = duration || 0.1;
      this.outlineSpriteGlowing = glowing;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        if (this._outlineGlow != null) {
          if (this.outlineSpriteGlowing) {
            this._outlineGlow.setVisible(true);
            this._outlineGlow.fadeTo(duration, 255.0);
          } else {
            this._outlineGlow.fadeToInvisible(duration);
          }
        }
      });
    }
  },

  getOutlineGlowSprite() {
    return this._outlineGlow;
  },

  getOutlineGlowBlurredSprite() {
    return this._outlineGlowBlurred;
  },

  /**
   * Returns whether the card is under a mouse position. Calculates using background size instead of total content size.
   * @param  {Number} screenX
   * @param  {Number} screenY
   * @returns {Boolean}
   */
  getNodeUnderMouse(screenX, screenY) {
    if (!this.whenRequiredResourcesReady().isFulfilled()) return false;

    const contentSize = this.cardBackgroundSprite._contentSize;
    const renderCmd = this._renderCmd;
    const stackMat = renderCmd._stackMatrix.mat;
    const scaleX = stackMat[0];
    const scaleY = stackMat[5];
    let x = stackMat[12] + this.centerOffset.x * 0.5 + CONFIG.CARD_PADDING * 0.5 * scaleX;
    let y = stackMat[13] + this.centerOffset.y * 0.5 + CONFIG.CARD_PADDING * 0.5 * scaleY;
    if (renderCmd.getNeedsPerspectiveProjection()) {
      x += cc.winSize.width * 0.5;
      y += cc.winSize.height * 0.5;
    }
    const width = contentSize.width * scaleX;
    const height = contentSize.height * scaleY;
    return screenX >= x && screenX <= x + width && screenY >= y && screenY <= y + height;
  },

  /**
   * Returns the card content size plus bars size.
   */
  getCardContentSizeWithBars() {
    const cardContentSize = this.getCardContentSize();
    const modifiersContentSize = this.getModifiersContentSize();
    const keywordsContentSize = this.getKeywordsContentSize();
    return cc.size(cardContentSize.width + keywordsContentSize.width, cardContentSize.height + modifiersContentSize.height);
  },

  /**
   * Returns the card background content size plus bars size.
   */
  getCardBackgroundContentSizeWithBars() {
    const cardContentSize = this.getCardBackgroundContentSize();
    const modifiersContentSize = this.getModifiersContentSize();
    const keywordsContentSize = this.getKeywordsContentSize();
    return cc.size(cardContentSize.width + keywordsContentSize.width, cardContentSize.height + modifiersContentSize.height);
  },

  /**
   * Returns the card modifier bar size.
   */
  getModifiersContentSize() {
    return this._modifiersNode.getContentSize();
  },

  /**
   * Returns the card keywords bar size.
   */
  getKeywordsContentSize() {
    return this._keywordsNode.getContentSize();
  },

  /**
   * Returns the card content size, equal to the background content size plus some padding.
   */
  getCardContentSize() {
    const cardBackgroundContentSize = this.getCardBackgroundContentSize();
    return cc.size(cardBackgroundContentSize.width + CONFIG.CARD_PADDING, cardBackgroundContentSize.height + CONFIG.CARD_PADDING);
  },

  /**
   * Returns the card background content size, which is always smaller than the content size of this card.
   */
  getCardBackgroundContentSize() {
    return cc.size(226, 296);
  },

  /**
   * Returns the position of the left side of the card
   */
  getCardLeft() {
    return CONFIG.CARD_PADDING * 0.5;
  },

  /**
   * Returns the position of the right side of the card
   */
  getCardRight() {
    return this.getCardLeft() + this.getCardBackgroundContentSize().width;
  },

  /**
   * Returns the position of the bottom side of the card
   */
  getCardBottom() {
    return CONFIG.CARD_PADDING * 0.5;
  },

  /**
   * Returns the position of the top side of the card
   */
  getCardTop() {
    return this.getCardBottom() + this.getCardBackgroundContentSize().height;
  },

  /**
   * Returns the card background sprite identifier.
   */
  getCardBackgroundSpriteIdentifier() {
    return this.cardBackgroundSpriteIdentifier;
  },

  /**
   * Sets whether this should show the base state of the card.
   * @param {Boolean} val
   */
  setShowBaseState(val) {
    if (this._showBaseState !== val) {
      this._showBaseState = val;
    }
  },

  /**
   * Returns whether this is showing the base state of the card.
   * @returns {Boolean}
   */
  getShowBaseState() {
    return this._showBaseState;
  },

  /**
   * Sets the action at which this card node should show state for.
   * @param {Action|null} val
   */
  setActionToShowStateFor(val) {
    if (this._actionToShowStateFor !== val) {
      this._actionToShowStateFor = val;
    }
  },

  /**
   * Returns the action at which this card node should show state for.
   * @returns {Action|null}
   */
  getActionToShowStateFor() {
    return this._actionToShowStateFor;
  },

  /**
   * Sets the action event type at which this card node should show state for.
   * @param {String} val
   */
  setActionEventTypeToShowStateFor(val) {
    if (this._actionEventTypeToShowStateFor !== val) {
      this._actionEventTypeToShowStateFor = val;
    }
  },

  /**
   * Returns the action event type at which this card node should show state for.
   * @returns {Action|null}
   */
  getActionEventTypeToShowStateFor() {
    return this._actionEventTypeToShowStateFor || EVENTS.update_cache_action;
  },

  /**
   * Returns the state at the action at which this card node should show state for.
   * @returns {Action|null}
   */
  getStateForActionToShowStateFor() {
    if (!this.getShowBaseState()) {
      return this.sdkCard.getActionStateRecord().getStateAtActionForEventType(this.getActionToShowStateFor(), this.getActionEventTypeToShowStateFor());
    }
  },

  getIsAnimationInProgress() {
    return this._isAnimationInProgress;
  },

  /* endregion GETTERS / SETTERS */

  /* region CARD BACK */

  /**
   * Binds the card back based on the owner's chosen card back, or if no owner then the user's chosen card back.
   * NOTE: you should not need to call this method directly, as it is called automatically as needed.
   */
  bindCardBack() {
    // attempt to use this card's owner's card back
    let cardBackId;
    const ownerId = this.sdkCard && this.sdkCard.getOwnerId();
    const ownerSetupData = ownerId && SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(ownerId);
    if (ownerSetupData != null) {
      cardBackId = ownerSetupData.cardBackId;
    }

    // fallback to default card back
    if (!SDK.CosmeticsFactory.isIdentifierForCardBack(cardBackId)) {
      cardBackId = SDK.CosmeticsFactory.getDefaultCardBackIdentifier();
    }

    this.setCardBackId(cardBackId);
  },

  /**
   * Sets card back identifier, loading resources and swapping sprites as needed.
   */
  setCardBackId(cardBackId) {
    if (this._cardBackId !== cardBackId) {
      this._cardBackId = cardBackId;

      // remove previous card back sprites
      if (this.cardBackSprite != null) {
        this.cardBackSprite.destroy();
        this.cardBackSprite = null;
      }
      if (this.cardBackGlowOutlineSprite != null) {
        this.cardBackGlowOutlineSprite.destroy();
        this.cardBackGlowOutlineSprite = null;
      }

      // invalidate previous resources
      if (this._cardBackResourceRequestId != null) {
        this.removeResourceRequestById(this._cardBackResourceRequestId);
        this._cardBackResourceRequestId = null;
      }

      if (this._cardBackId != null) {
        // load new
        const cardBackPkgId = PKGS.getCardBackPkgIdentifier(this._cardBackId);
        const cardBackResourceRequestId = this._cardBackResourceRequestId = `${cardBackPkgId}_${UtilsJavascript.generateIncrementalId()}`;

        // setup promise to wait for resources
        this.addResourceRequest(cardBackResourceRequestId, cardBackPkgId)
          .then((cardBackResourceRequestId) => {
            if (!this.getAreResourcesValid(cardBackResourceRequestId)) return; // card back has changed

            // initialize card back sprites
            const cardBackData = SDK.CosmeticsFactory.cardBackForIdentifier(this._cardBackId);

            // card back
            this.cardBackSprite = GlowSprite.create(cardBackData.img);
            this.cardBackSprite.setFlippedX(true);
            this._containerNodeBack.addChild(this.cardBackSprite, -3.0);

            // glow outline
            this.cardBackGlowOutlineSprite = BaseSprite.create(cardBackData.glowOutlineRSX.img);
            this.cardBackGlowOutlineSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
            this.cardBackGlowOutlineSprite.setFlippedX(true);
            this.cardBackGlowOutlineSprite.setVisible(false);
            this._containerNodeBack.addChild(this.cardBackGlowOutlineSprite, -2.0);
          });
      }
    }
  },

  getCardBackId() {
    // default to normal
    return this._cardBackId;
  },

  getCardBackResourceRequestId() {
    return this._cardBackResourceRequestId;
  },

  /* endregion CARD BACK */

  /* region MODIFIERS */

  getModifiersShowing() {
    return this._modifiersNode.isVisible();
  },

  setModifiersDirty() {
    this._modifiersDirty = true;
  },

  getHasModifiers() {
    return this._hasModifers;
  },

  rebuildModifiers() {
    this._modifiersDirty = false;

    const modifiersBaseHeight = CONFIG.CARD_MODIFIER_PADDING_VERTICAL;
    let modifiersHeight = modifiersBaseHeight;
    const stateAtAction = this.getStateForActionToShowStateFor();
    if (stateAtAction != null) {
      // clear background and container
      this._modifiersContainerNode.removeAllChildren();
      this._modifiersBG.clear();

      // get base size
      const cardBackgroundContentSize = this.getCardBackgroundContentSize();
      var modifiersWidth = cardBackgroundContentSize.width - CONFIG.CARD_MODIFIER_PADDING_HORIZONTAL * 3.0 - 16.0;

      // show modifiers
      modifiersHeight += this._buildModifiers(stateAtAction.modifierStacks, modifiersWidth, modifiersHeight);
    }

    // one or more modifiers are showing
    if (modifiersHeight > modifiersBaseHeight) {
      this._hasModifers = true;

      // draw background rectangle for bar
      const bgWidth = modifiersWidth + CONFIG.CARD_MODIFIER_PADDING_HORIZONTAL * 3.0;
      const bgHeight = modifiersHeight + CONFIG.CARD_MODIFIER_PADDING_VERTICAL;
      const bgBL = cc.p(0, 7);
      const bgTR = cc.p(bgBL.x + bgWidth, -(bgBL.y + bgHeight));
      const bgColor = cc.color(CONFIG.CARD_METADATA_BARS_COLOR);
      this._modifiersBG.drawRect(bgBL, bgTR, bgColor, 0, bgColor);

      // set content size and positions
      this._modifiersNode.setContentSize(bgWidth, bgHeight);
      this._modifiersContainerNode.setPosition(bgWidth * 0.5, 0);
    } else {
      this._hasModifers = false;
      this._modifiersNode.setContentSize(0, 0);
    }
  },

  _buildModifiers(modifierStacks, currentModifiersWidth, currentModifiersHeight) {
    let modifiersHeight = 0;

    if (modifierStacks && modifierStacks.length > 0) {
      // show modifier name and description for each stack type
      for (let i = 0; i < modifierStacks.length; i++) {
        const modifierStack = modifierStacks[i];
        const modifiersOfStackType = modifierStack.modifiers;

        // don't show stack when only contains inherent modifiers
        const numModifiersOfStackType = modifierStack.numActive - modifierStack.numInherent;
        if (numModifiersOfStackType > 0) {
          const modifier = modifiersOfStackType[0];

          // set color/opacity
          var color;
          var opacity;
          if (modifierStack.numActive > 0) {
            color = CONFIG.CARD_MODIFIER_ACTIVE_COLOR;
            opacity = CONFIG.CARD_MODIFIER_ACTIVE_OPACITY;
          } else {
            color = CONFIG.CARD_MODIFIER_INACTIVE_COLOR;
            opacity = CONFIG.CARD_MODIFIER_INACTIVE_OPACITY;
          }

          let modifierNameText = modifier.getAppliedName();
          if (numModifiersOfStackType > 1) {
            modifierNameText += ` (x${numModifiersOfStackType})`;
          }
          const modifierNameLabel = new cc.LabelTTF(modifierNameText, RSX.font_bold.name, 14, cc.size(currentModifiersWidth, 0), cc.TEXT_ALIGNMENT_LEFT);
          modifierNameLabel.setFontFillColor(color);
          modifierNameLabel.setOpacity(opacity);
          modifierNameLabel.setAnchorPoint(0.5, 1);
          modifierNameLabel.setPosition(CONFIG.CARD_MODIFIER_PADDING_HORIZONTAL, -(currentModifiersHeight + modifiersHeight));
          this._modifiersContainerNode.addChild(modifierNameLabel);
          const modifierLabelContentSize = modifierNameLabel.getContentSize();
          modifiersHeight += modifierLabelContentSize.height + CONFIG.CARD_MODIFIER_PADDING_VERTICAL;

          // uncomment below to ignore sub-modifier descriptions for non-inherent modifiers on the same card
          // var parentModifier = modifier.getParentModifier();
          // if (parentModifier == null || parentModifier.getIsInherent() || modifier.getCardAffected() !== parentModifier.getCardAffected()) {
          const modifierDescription = modifier.getAppliedDescription();
          if (modifierDescription != null) {
            const modifierDescriptionLabel = new cc.LabelTTF(modifierDescription, RSX.font_light.name, 12, cc.size(currentModifiersWidth, 0), cc.TEXT_ALIGNMENT_LEFT);
            modifierDescriptionLabel.setFontFillColor(color);
            modifierDescriptionLabel.setOpacity(opacity);
            modifierDescriptionLabel.setAnchorPoint(0.5, 1);
            modifierDescriptionLabel.setLineHeight(14);
            modifierDescriptionLabel.setPosition(CONFIG.CARD_MODIFIER_PADDING_HORIZONTAL, -(currentModifiersHeight + modifiersHeight));
            this._modifiersContainerNode.addChild(modifierDescriptionLabel);
            const modifierDescriptionLabelContentSize = modifierDescriptionLabel.getContentSize();
            modifiersHeight += modifierDescriptionLabelContentSize.height + CONFIG.CARD_MODIFIER_PADDING_VERTICAL * 2.0;
          }
          // }
        }
      }
    }

    return modifiersHeight;
  },

  showModifiers() {
    if (this._modifiersDirty) {
      this.rebuildModifiers();
    }

    if (this._hasModifers) {
      const contentSize = this.getContentSize();
      this._modifiersNode.setPosition(this.getCenterPosition().x - contentSize.width * 0.5, this.getCardBottom() - contentSize.height * 0.5);
      this._modifiersNode.setVisible(true);
    } else {
      this.hideModifiers();
    }
  },

  hideModifiers() {
    this._modifiersNode.setVisible(false);
  },

  /* endregion MODIFIERS */

  /* region KEYWORDS */

  getKeywordsShowing() {
    return this._keywordsNode.isVisible();
  },

  setKeywordsDirty() {
    this._keywordsDirty = true;
  },

  getKeywordsShowingOnLeft() {
    return this._keywordsShowingOnLeft;
  },

  getHasKeywords() {
    return this._hasKeywords;
  },

  rebuildKeywords() {
    this._keywordsDirty = false;

    // clear background and container
    this._keywordsContainerNode.removeAllChildren();
    this._keywordsBG.clear();

    // get keyword classes
    let keywordClasses;
    const stateAtAction = this.getStateForActionToShowStateFor();
    if (stateAtAction != null) {
      // check for action to show state for
      keywordClasses = stateAtAction.keywordClasses;
    } else {
      keywordClasses = this.sdkCard.getKeywordClasses(true);
    }
    if (keywordClasses != null && keywordClasses.length > 0) {
      this._hasKeywords = true;

      // keywords and descriptions
      const paddingLeft = CONFIG.CARD_KEYWORD_PADDING_HORIZONTAL + 5.0;
      const paddingRight = CONFIG.CARD_KEYWORD_PADDING_HORIZONTAL;
      let keywordsHeight = CONFIG.CARD_KEYWORD_PADDING_VERTICAL;
      let maxWidth = 0;
      for (let i = 0; i < keywordClasses.length; i++) {
        const keyword = keywordClasses[i];
        if (!keyword.isHiddenToUI) {
          const keywordName = keyword.getName();
          if (keywordName != null) {
            const keywordNameLabel = new cc.LabelTTF(keywordName, RSX.font_bold.name, 14, cc.size(CONFIG.CARD_KEYWORDS_WIDTH, 0), cc.TEXT_ALIGNMENT_LEFT);
            keywordNameLabel.setFontFillColor(cc.color.WHITE);
            keywordNameLabel.setAnchorPoint(0, 1);
            keywordNameLabel.setPosition(paddingLeft, -keywordsHeight);
            this._keywordsContainerNode.addChild(keywordNameLabel);
            const keywordLabelContentSize = keywordNameLabel.getContentSize();
            keywordsHeight += keywordLabelContentSize.height + CONFIG.CARD_KEYWORD_PADDING_VERTICAL;

            const keywordDescriptionLabel = new cc.LabelTTF(keyword.getKeywordDefinition(), RSX.font_light.name, 12, cc.size(CONFIG.CARD_KEYWORDS_WIDTH, 0), cc.TEXT_ALIGNMENT_LEFT);
            keywordDescriptionLabel.setFontFillColor(cc.color.WHITE);
            keywordDescriptionLabel.setAnchorPoint(0, 1);
            keywordDescriptionLabel.setLineHeight(14);
            keywordDescriptionLabel.setPosition(paddingLeft, -keywordsHeight);
            this._keywordsContainerNode.addChild(keywordDescriptionLabel);
            const keywordDescriptionLabelContentSize = keywordDescriptionLabel.getContentSize();
            keywordsHeight += keywordDescriptionLabelContentSize.height + CONFIG.CARD_KEYWORD_PADDING_VERTICAL * 2.0;
            maxWidth = Math.max(maxWidth, keywordLabelContentSize.width, keywordDescriptionLabelContentSize.width);
          }
        }
      }

      // draw background rectangle for bar
      const bgWidth = maxWidth + paddingLeft + paddingRight;
      const bgHeight = keywordsHeight + CONFIG.CARD_KEYWORD_PADDING_VERTICAL;
      const bgBL = cc.p(0, CONFIG.CARD_KEYWORD_PADDING_VERTICAL);
      const bgTR = cc.p(bgBL.x + bgWidth, -(bgBL.y + bgHeight));
      const bgColor = cc.color(CONFIG.CARD_METADATA_BARS_COLOR.r, CONFIG.CARD_METADATA_BARS_COLOR.g, CONFIG.CARD_METADATA_BARS_COLOR.b, CONFIG.CARD_METADATA_BARS_COLOR.a);
      this._keywordsBG.drawRect(bgBL, bgTR, bgColor, 0, bgColor);

      // set content size
      this._keywordsNode.setContentSize(bgWidth, bgHeight);
    } else {
      this._hasKeywords = false;
      this._keywordsNode.setContentSize(0, 0);
    }
  },

  showKeywords(keywordsOnLeft) {
    if (keywordsOnLeft) {
      this.showKeywordsOnLeft();
    } else {
      this.showKeywordsOnRight();
    }
  },

  showKeywordsOnLeft() {
    this._keywordsShowingOnLeft = true;

    if (this._keywordsDirty) {
      this.rebuildKeywords();
    }

    if (this._hasKeywords) {
      this._keywordsNode.setAnchorPoint(1, 0);
      const contentSize = this.getContentSize();
      this._keywordsNode.setPosition(this.getCardLeft() - contentSize.width * 0.5, this.getCardTop() - contentSize.height * 0.5 - 10);

      this._keywordsNode.setVisible(true);
    } else {
      this.hideKeywords();
    }
  },

  showKeywordsOnRight() {
    this._keywordsShowingOnLeft = false;

    if (this._keywordsDirty) {
      this.rebuildKeywords();
    }

    if (this._hasKeywords) {
      this._keywordsNode.setAnchorPoint(0, 0);
      const contentSize = this.getContentSize();
      this._keywordsNode.setPosition(this.getCardRight() - contentSize.width * 0.5, this.getCardTop() - contentSize.height * 0.5 - 10);

      this._keywordsNode.setVisible(true);
    } else {
      this.hideKeywords();
    }
  },

  hideKeywords() {
    this._keywordsNode.setVisible(false);
    this._keywordsShowingOnLeft = false;
  },

  /* endregion KEYWORDS */

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
      const animResource = this.sdkCard.getAnimResource();
      if (animResource) {
        if (this.sdkCard instanceof SDK.Unit) {
          // TODO: restore showing attack animation
          this.showAnimState(animResource.idle, true);
        } else {
          this.showAnimState(animResource.active || animResource.idle, true);
        }
      }
    }
  },

  showInactiveAnimState() {
    if (!this.highlighted && this.sdkCard != null) {
      const animResource = this.sdkCard.getAnimResource();
      if (animResource) {
        if (this.sdkCard instanceof SDK.Unit) {
          this.showAnimState(animResource.breathing);
        } else {
          this.showAnimState(animResource.idle);
        }
      }
    }
  },

  /* endregion STATES */

  /* region SNAPSHOTTING */

  /**
   * Snapshot container node to render pass texture. This records entire card.
   */
  recordSnapshot() {
    if (this.sdkCard != null) {
      this.resetSnapshot();

      // show container
      this._containerNode.setVisible(true);

      // snapshot container node to render pass texture
      this._renderPass.beginWithResetClear(this._renderPassStackId);
      this._renderPass.visitNode(this._containerNode);
      this._renderPass.endWithReset(this._renderPassStackId);

      // hide container
      this._containerNode.setVisible(false);

      // show snapshot
      this._snapshotSprite.setVisible(true);
    }
  },

  /**
   * Snapshot static container node to render pass texture. Does not record main container.
   */
  recordStaticSnapshot() {
    if (this.sdkCard) {
      this.resetSnapshot();

      // show containers
      this._staticContainerNodeFront.setVisible(true);

      // snapshot container node to render pass texture
      this._renderPass.beginWithResetClear(this._renderPassStackId);
      this._renderPass.visitNode(this._staticContainerNodeFront);
      this._renderPass.endWithReset(this._renderPassStackId);

      // hide containers
      this._staticContainerNodeFront.setVisible(false);

      // show snapshot
      this._snapshotSprite.setOpacity(255);
      this._snapshotSprite.setVisible(true);
    }
  },

  /**
   * Resets the snapshot sprite's animations and effects.
   */
  resetSnapshot() {
    if (this._snapshotSprite != null) {
      this.stopActionByTag(CONFIG.MOVE_TAG);
      this._snapshotSprite.stopActionByTag(CONFIG.SCALE_TAG);
      this._snapshotSprite.stopActionByTag(CONFIG.TINT_TAG);
      this._snapshotSprite.stopActionByTag(CONFIG.CARD_TAG);
      this._snapshotSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
      this._snapshotSprite.setPosition(this.getCenterPosition());
      this._snapshotSprite.setGlowing(false);
      this._snapshotSprite.setHighlighted(false);
      this._snapshotSprite.setLeveled(false);
      this._snapshotSprite.setDissolving(false);
      this._snapshotSprite.setTint(new cc.Color(0, 0, 0, 0));
    }
  },

  hideSnapshot() {
    if (this._snapshotSprite != null) {
      this._snapshotSprite.setVisible(false);
      this._containerNode.setVisible(this.sdkCard != null);
    }
  },

  fadeOutSnapshot(duration) {
    duration = duration || 0.2;
    this._snapshotSprite.runAction(cc.sequence(
      cc.fadeOut(duration),
      cc.hide(),
    ));
    this._containerNode.setVisible(this.sdkCard != null);
  },

  /* endregion SNAPSHOTTING */

  /* region INSPECT */

  showInspect(sdkCard, showBaseState, actionToShowStateFor, actionEventTypeToShowStateFor, keywordsOnLeft, highlighted, showInstructionals) {
    // reset
    if (sdkCard != null) {
      this.setSdkCard(sdkCard, showBaseState, actionToShowStateFor, actionEventTypeToShowStateFor);
    } else {
      this.hideSnapshot();
      this.setShowBaseState(showBaseState);
      this.setActionToShowStateFor(actionToShowStateFor);
      this.setActionEventTypeToShowStateFor(actionEventTypeToShowStateFor);
    }

    if (this.sdkCard) {
      // update stats based on action to show state for
      this.updateStats();

      // always show keywords
      this.showKeywords(keywordsOnLeft);

      // check showing state
      const stateAtAction = this.getStateForActionToShowStateFor();
      if (stateAtAction != null) {
        // show modifiers
        this.showModifiers();
      }

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        // show silenced state unless card is general, sentinel (hidden state), or building
        // generals must always show signature card description, and sentinel and building cannot be dispelled off the card text
        if (stateAtAction != null && (!(this.sdkCard instanceof SDK.Entity) || !this.sdkCard.getWasGeneral()) && (this.sdkCard instanceof SDK.Entity && !this.sdkCard.hasActiveModifierClass(SDK.ModifierSentinel) && !this.sdkCard.hasActiveModifierClass(SDK.ModifierBuilding))) {
          this._silencedSprite.setVisible(stateAtAction.isSilenced);
        } else {
          this._silencedSprite.setVisible(false);
        }
      });

      if (highlighted) {
        this.setHighlighted(true);
      }

      // show prismatic fx
      if (CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT
        && !(this.sdkCard instanceof SDK.Tile)
        && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
        this.showPrismatic();
      }

      // show instructionals as needed
      if (showInstructionals) {
        this.showInstructionals();
      } else {
        this.hideInstructionals();
      }
    }
  },

  stopShowingInspect() {
    this.hideKeywords();
    this.hideModifiers();
    this.setShowBaseState(true);
    this.setActionToShowStateFor(null);
    this.setActionEventTypeToShowStateFor(null);
    this.setHighlighted(false);
  },

  stopShowingInspectAndClear() {
    this.stopShowingInspect();
    this.setSdkCard(null);
  },

  showInstructionals() {
    if (this._atkInstructionalLabel == null) {
      this._atkInstructionalLabel = new cc.LabelTTF(i18next.t('battle.card_instructions_attack'), RSX.font_bold.name, 14, cc.size(48, 16), cc.TEXT_ALIGNMENT_CENTER);
      this._atkInstructionalLabel.setFontFillColor(CONFIG.ATK_COLOR);
      this._atkInstructionalLabel.setPositionX(this.atkLabel.getPositionX());
      this._atkInstructionalLabel.setPositionY(this.atkLabel.getPositionY() - this.atkLabel.getContentSize().height - 10.0);
      this._staticContainerNodeFront.addChild(this._atkInstructionalLabel, 3);
    }
    this._atkInstructionalLabel.setVisible(false);

    if (this._hpInstructionalLabel == null) {
      this._hpInstructionalLabel = new cc.LabelTTF(i18next.t('battle.card_instructions_health'), RSX.font_bold.name, 14, cc.size(48, 16), cc.TEXT_ALIGNMENT_CENTER);
      this._hpInstructionalLabel.setFontFillColor(CONFIG.HP_COLOR);
      this._hpInstructionalLabel.setPositionX(this.hpLabel.getPositionX());
      this._hpInstructionalLabel.setPositionY(this.hpLabel.getPositionY() - this.hpLabel.getContentSize().height - 10.0);
      this._staticContainerNodeFront.addChild(this._hpInstructionalLabel, 3);
    }
    this._hpInstructionalLabel.setVisible(false);

    if (this._manaInstructionalLabel == null) {
      this._manaInstructionalLabel = new cc.LabelTTF(i18next.t('battle.card_instructions_health'), RSX.font_bold.name, 14, cc.size(48, 16), cc.TEXT_ALIGNMENT_CENTER);
      this._manaInstructionalLabel.setFontFillColor({ r: 0, g: 243, b: 255 });
      this._manaInstructionalLabel.setPositionAboveSprite(this._manaGemSprite);
      this._staticContainerNodeFront.addChild(this._manaInstructionalLabel, 3);
    }
    this._manaInstructionalLabel.setVisible(false);

    Promise.all([
      this.whenRequiredResourcesReady(),
      this.whenResourcesReady(this.getCardResourceRequestId()),
    ])
      .spread((requiredRequestId, cardResourceRequestId) => {
        if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(cardResourceRequestId)) return; // load invalidated or resources changed

        if (this._manaInstructionalBg == null) {
          this._manaInstructionalBg = BaseSprite.create(RSX.unit_stats_instructional_bg.img);
          this._manaInstructionalBg.setColor(cc.color(4, 1, 39));
          this._manaInstructionalBg.setPositionCenterOfSprite(this._manaInstructionalLabel);
          this._manaInstructionalBg.setOpacity(CONFIG.OVERLAY_STATS_BG_ALPHA);
          this._staticContainerNodeFront.addChild(this._manaInstructionalBg, 2);
        }
        this._manaInstructionalBg.setVisible(false);

        this._atkInstructionalLabel.setVisible(this.atkLabel.isVisible());
        this._hpInstructionalLabel.setVisible(this.hpLabel.isVisible());
        this._manaInstructionalLabel.setVisible(this.manaLabel.isVisible());
        this._manaInstructionalBg.setVisible(this.manaLabel.isVisible());
      });
  },

  hideInstructionals() {
    Promise.all([
      this.whenRequiredResourcesReady(),
      this.whenResourcesReady(this.getCardResourceRequestId()),
    ])
      .spread((requiredRequestId, cardResourceRequestId) => {
        if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(cardResourceRequestId)) return; // load invalidated or resources changed

        if (this._atkInstructionalLabel != null) {
          this._atkInstructionalLabel.setVisible(false);
        }
        if (this._hpInstructionalLabel != null) {
          this._hpInstructionalLabel.setVisible(false);
        }
        if (this._manaInstructionalLabel != null) {
          this._manaInstructionalLabel.setVisible(false);
        }
        if (this._manaInstructionalBg != null) {
          this._manaInstructionalBg.setVisible(false);
        }
      });
  },

  /* endregion INSPECT */

  /* region PLAY */

  showPlay(sdkCard, actionToShowStateFor, actionEventTypeToShowStateFor, sourceScreenPosition, targetScreenPosition, animateDuration, showDuration, noFlip, showInstructionals) {
    return new Promise((resolve, reject) => {
      if (animateDuration == null) { animateDuration = 0.0; }
      if (showDuration == null) { showDuration = 0.0; }

      // reset
      if (sdkCard != null) {
        this.setSdkCard(sdkCard, false, actionToShowStateFor, actionEventTypeToShowStateFor);
      } else {
        this.hideSnapshot();
        this.setShowBaseState(false);
        this.setActionToShowStateFor(actionToShowStateFor);
        this.setActionEventTypeToShowStateFor(actionEventTypeToShowStateFor);
      }

      if (this.sdkCard) {
        this.stopAnimations();

        // bind card back as card owner may have changed
        this.bindCardBack();

        // hide keywords
        this.hideKeywords();

        // update stats based on action to show state for
        this.updateStats();

        // show modifiers at action
        this.showModifiers();

        // show prismatic fx
        if (CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT
          && !(this.sdkCard instanceof SDK.Tile)
          && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
          this.showPrismatic();
        }

        // show instructionals as needed
        if (showInstructionals) {
          this.showInstructionals();
        } else {
          this.hideInstructionals();
        }

        // get movement and rotation
        const contentSize = this.getContentSize();
        const dx = targetScreenPosition.x - sourceScreenPosition.x;
        const dy = targetScreenPosition.y - sourceScreenPosition.y;
        const anchorX = dx < 0.0 ? 0.0 : 1.0;
        const offsetX = contentSize.width * (dx < 0.0 ? 0.5 : -0.5) * (noFlip ? -1.0 : 1.0);
        const anchorY = 0.0;// dy < 0.0 ? 0.0 : 1.0;
        const angRotX = 30;// * (dy < 0.0 ? -1 : 1);
        const angRotY = 60.0 * (dx < 0.0 ? -1 : 1);
        const angRotZ = 0;
        const sourceScreenPositionWithAnchor = cc.p(sourceScreenPosition.x + offsetX * 0.5, sourceScreenPosition.y + (anchorY - 0.5) * contentSize.height * 0.5);
        const targetScreenPositionWithAnchor = cc.p(targetScreenPosition.x + offsetX, targetScreenPosition.y + (anchorY - 0.5) * contentSize.height);

        // set starting properties
        this.setAnchorPoint(anchorX, anchorY);
        this.setPosition(sourceScreenPositionWithAnchor);
        this.setScale(0.0);
        this.setSecondaryXYZRotation(new cc.kmVec3(angRotX, angRotY, angRotZ));
        if (this._outlineGlow != null) {
          this._outlineGlow.setVisible(false);
        }

        if (noFlip) {
          this.resetFlip(0.0);
          const showPlayAction = cc.spawn(
            cc.sequence(
              cc.moveTo(animateDuration, targetScreenPositionWithAnchor).easing(cc.easeExponentialOut()),
              cc.callFunc(() => {
                this.setAnchorPoint(0.5, 0.5);
                this.setPosition(targetScreenPosition);
              }),
            ),
            cc.scaleTo(animateDuration, 1.0).easing(cc.easeExponentialOut()),
            SecondaryXYZRotateBy.create(animateDuration, -angRotX, -angRotY, -angRotZ).easing(cc.easeExponentialOut()),
          );
          this.addAnimationAction(showPlayAction);
          this.runAction(showPlayAction);
        } else {
          // flip to back
          this.showFlip(0.0);

          // animate to target position
          Promise.all([
            this.whenRequiredResourcesReady(),
            this.whenResourcesReady(this.getCardResourceRequestId()),
            this.whenResourcesReady(this.getCardBackResourceRequestId()),
          ])
            .spread((requiredRequestId, cardResourceRequestId, cardBackResourceRequestId) => {
              if (!this.getAreResourcesValid(requiredRequestId)
              || !this.getAreResourcesValid(cardResourceRequestId)
              || !this.getAreResourcesValid(cardBackResourceRequestId)) return; // load invalidated or resources changed

              this.cardBackSprite.setLeveled(true);
              this.cardBackSprite.setLevelsInWhite(180);
              this.cardBackSprite.setLevelsInBlack(30);
              this.cardBackSprite.setHighlighted(true);
              this.cardBackSprite.setTint(new cc.Color(255, 255, 255, 255));
              this.cardBackSprite.setOpacity(255.0);
              this.cardBackSprite.setVisible(true);
              this.cardBackGlowOutlineSprite.setOpacity(255.0);
              this.cardBackGlowOutlineSprite.setVisible(true);

              const showPlayAction = cc.spawn(
                cc.sequence(
                  cc.moveTo(animateDuration * 0.2, targetScreenPositionWithAnchor).easing(cc.easeExponentialOut()),
                  cc.callFunc(() => {
                    this.setAnchorPoint(0.5, 0.5);
                    this.setPosition(targetScreenPosition);
                  }),
                ),
                cc.scaleTo(animateDuration * 0.2, 1.0).easing(cc.easeExponentialOut()),
                SecondaryXYZRotateBy.create(animateDuration * 0.2, -angRotX, -angRotY, -angRotZ).easing(cc.easeExponentialOut()),
                cc.targetedAction(this.cardBackSprite, cc.sequence(
                  cc.actionTween(animateDuration * 0.1, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeOut(2.0)),
                  cc.spawn(
                    cc.callFunc(() => {
                      this.cardBackSprite.fadeOutHighlight(animateDuration * 0.1);
                    }),
                    cc.actionTween(animateDuration * 0.1, 'levelsInWhite', 180.0, 255.0),
                    cc.actionTween(animateDuration * 0.1, 'levelsInBlack', 30.0, 0.0),
                    cc.targetedAction(this.cardBackGlowOutlineSprite, cc.sequence(
                      cc.delayTime(animateDuration * 0.05),
                      cc.fadeOut(animateDuration * 0.1),
                      cc.hide(),
                    )),
                  ),
                  cc.delayTime(animateDuration * 0.1),
                  cc.callFunc(() => {
                    this.showFlip(animateDuration * 0.3);
                  }),
                )),
              );
              this.addAnimationAction(showPlayAction);
              this.runAction(showPlayAction);
            });
        }

        // delay for show and resolve
        const showDurationAction = cc.sequence(
          cc.delayTime(showDuration),
          cc.callFunc(() => {
            resolve();
          }),
        );
        this.addAnimationAction(showDurationAction);
        this.runAction(showDurationAction);
      }
    })
      .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
  },

  stopShowingPlay(animateDuration) {
    return new Promise((resolve, reject) => {
      if (animateDuration == null) { animateDuration = 0.0; }
      this.stopAnimations();

      if (animateDuration > 0.0) {
        this.whenRequiredResourcesReady().then((requestId) => {
          if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

          // show fade particles
          const particles = new BaseParticleSystem(RSX.card_fade.plist);
          particles.setPosition(this.getPosition());
          particles.setAutoRemoveOnFinish(true);
          this.getParent().addChild(particles, this.getLocalZOrder() - 0.5);

          // animate out
          const cleanupCallback = function () {
            this._outlineGlow.setVisible(false);
            this.setSdkCard(null);
            resolve();
          }.bind(this);
          const stopShowingPlayAction = cc.spawn(
            cc.targetedAction(this._outlineGlow, cc.sequence(
              cc.show(),
              cc.fadeIn(0.1 * animateDuration).easing(cc.easeIn(1.0)),
              cc.delayTime(0.4 * animateDuration),
              cc.fadeOut(0.4 * animateDuration).easing(cc.easeOut(1.0)),
              cc.hide(),
            )),
            cc.sequence(
              cc.delayTime(animateDuration * 0.4),
              cc.fadeTo(animateDuration * 0.5, 0.0),
              cc.callFunc(cleanupCallback),
            ),
          );
          stopShowingPlayAction.setOnCancelledCallback(cleanupCallback);
          this.addAnimationAction(stopShowingPlayAction);
          this.runAction(stopShowingPlayAction);
        });
      } else {
        this.setSdkCard(null);
        resolve();
      }
    })
      .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
  },

  /* endregion PLAY */

  /* region PRISMATIC */

  /**
   * Shows the card as prismatic.
   * @param {Number} [duration=0.0]
   */
  showPrismatic(duration) {
    if (!this._showingPrismatic && this.sdkCard != null) {
      this._showingPrismatic = true;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        // show card shine
        if (CONFIG.SHOW_PRISMATIC_CARD_SHINE && this._showPrismaticShineAction == null) {
          this._showPrismaticShineAction = cc.sequence(
            cc.delayTime(CONFIG.SHOW_PRISMATIC_CARD_SHINE_DELAY * 0.1),
            cc.callFunc(() => {
              this.stopShowingShine();
              this.showShine();
            }),
            cc.delayTime(CONFIG.SHOW_PRISMATIC_CARD_SHINE_DELAY * 0.9),
          ).repeatForever();
          this.runAction(this._showPrismaticShineAction);
        }

        // show prismatic glow
        if (this._prismaticGlow == null) {
          this._prismaticGlow = CausticPrismaticGlowSprite.create();
          this._prismaticGlow.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
          this._containerNodeFront.addChild(this._prismaticGlow, -2.0);
        }

        // update glow based on card size
        if (this.sdkCard instanceof SDK.Entity) {
          const boundingBox = this.sdkCard.getBoundingBox();
          const glowWidth = Math.min(240.0, Math.max(100.0, boundingBox.width * 2.25));
          const glowHeight = Math.min(240.0, Math.max(100.0, boundingBox.height * 2.25));
          this._prismaticGlow.setTextureRect(cc.rect(0, 0, glowWidth, glowHeight));
          this._prismaticGlow.setPosition(0.0, 50.0 + boundingBox.height * 0.5);
        } else {
          this._prismaticGlow.setTextureRect(cc.rect(0, 0, 160.0, 160.0));
          this._prismaticGlow.setPosition(0.0, 90.0);
        }

        this._prismaticGlow.fadeTo(duration, 175.0);
      });
    }
  },

  /**
   * Stops showing the card as prismatic.
   * @param {Number} [duration=0.0]
   */
  stopShowingPrismatic(duration) {
    if (this._showingPrismatic) {
      this._showingPrismatic = false;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        // stop showing card shine
        if (this._showPrismaticShineAction != null) {
          this.stopAction(this._showPrismaticShineAction);
          this._showPrismaticShineAction = null;
          this.stopShowingShine();
        }

        // stop showing prismatic glow
        if (this._prismaticGlow != null) {
          this._prismaticGlow.fadeToInvisible(duration);
        }
      });
    }
  },

  /* endregion PRISMATIC */

  /* region SHINE */

  /**
   * Shows a shine effect on the card.
   * @param {Number} [duration=0.5]
   * @param {Number} [intensity=0.5]
   */
  showShine(duration, intensity) {
    if (!this._showingShine) {
      this._showingShine = true;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        if (duration == null) { duration = 0.5; }
        if (intensity == null) { intensity = 0.5; }
        if (this.shineNode == null) {
          this.shineNode = new FXCardShineSprite(this.cardBackgroundSpriteIdentifier);
          this.shineNode.setPosition(this.cardBackgroundSprite.getPosition());
          this._containerNodeFront.addChild(this.shineNode, this.cardBackgroundSprite.getLocalZOrder());
        } else if (this.shineNode.getTexture().url !== this.cardBackgroundSpriteIdentifier) {
          this.shineNode.setTexture(cc.textureCache.getTextureForKey(this.cardBackgroundSpriteIdentifier));
        }

        this.shineNode.setPhase(-1.0);
        this.shineNode.setIntensity(intensity);
        this.shineNode.setOpacity(255);
        this.shineNode.setVisible(true);
        const shineAction = cc.sequence(
          cc.actionTween(duration, 'phase', -1.0, 1.0).easing(cc.easeOut()),
          cc.hide(),
        );
        this.shineNode.runAction(shineAction);
      });
    }
  },

  stopShowingShine(duration) {
    if (this._showingShine) {
      this._showingShine = false;
      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        if (this.shineNode != null) {
          this.shineNode.stopAllActions();
          this.shineNode.fadeToInvisible(duration);
        }
      });
    }
  },

  /* endregion SHINE */

  /* region STACK */

  /**
   * Shows a stack of fake cards behind this one with a count label, and returns a promise.
   * @param {Number} [duration=CONFIG.ANIMATE_FAST_DURATION]
   * @param {Number} [stackCount=2]
   * @param {Boolean} [fanToLeft=false]
   * @returns {Promise}
   */
  showStack(duration, stackCount, fanToLeft, stackLabelOffset, fanScale) {
    if (duration == null) { duration = CONFIG.ANIMATE_FAST_DURATION; }
    if (stackCount == null) { stackCount = 2; }
    if (stackLabelOffset == null) { stackLabelOffset = cc.p(0, 0); }
    if (fanScale == null) { fanScale = 5; }

    const contentSize = this.getContentSize();
    const centerPosition = this.getCenterPosition();

    if (this.sdkCard != null) {
      return new Promise((resolve, reject) => {
        // wait for resources
        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

          // create card stack sprites
          for (var i = this._cardStackSprites.length; i < stackCount; i++) {
            var cardStackSprite = BaseSprite.create(this.getCardBackgroundSpriteIdentifier());
            cardStackSprite.setLeveled(true);
            cardStackSprite.setLevelsOutWhite(255 - (i + 1) * 75);
            this.addChild(cardStackSprite, -10 - i);
            this._cardStackSprites.push(cardStackSprite);
          }

          // create label
          if (this._cardStackLabel == null) {
            this._cardStackLabel = new cc.LabelTTF(`X${stackCount + 1}`, RSX.font_bold.name, 14, cc.size(100, 30), cc.TEXT_ALIGNMENT_CENTER);
            this._cardStackLabel.setFontFillColor(cc.color(200, 200, 200, 255));
            this._cardStackLabel.enableStroke(cc.color(0, 0, 0, 255), 2, false);
            this._cardStackLabel.setPosition(centerPosition.x - contentSize.width * 0.5 + stackLabelOffset.x, this.getCardBottom() - contentSize.height * 0.5 + stackLabelOffset.y);
            this._containerNodeFront.addChild(this._cardStackLabel, this.cardBackgroundSprite.getLocalZOrder() + 1.0);
          }

          // animate out stack
          for (var i = 0; i < stackCount; i++) {
            var cardStackSprite = this._cardStackSprites[i];
            cardStackSprite.setVisible(true);
            cardStackSprite.setPosition(centerPosition);
            const cardStackPosition = cc.p(
              centerPosition.x + (fanToLeft ? -fanScale : fanScale) * (i + 1),
              centerPosition.y - fanScale * (i + 1),
            );
            cardStackSprite.setRotation(0.0);
            const cardStackRotation = (fanToLeft ? -fanScale : fanScale) * (i + 1);
            cardStackSprite.runAction(
              cc.spawn(
                cc.moveTo(duration, cardStackPosition).easing(cc.easeCubicActionOut()),
                cc.rotateTo(duration, cardStackRotation).easing(cc.easeCubicActionOut()),
              ),
            );
          }

          // delay, show label, then resolve
          this._cardStackLabel.setOpacity(0);
          this._cardStackLabel.setVisible(true);
          this._cardStackLabel.runAction(cc.sequence(
            cc.delayTime(duration),
            cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
            cc.callFunc(resolve),
          ));
        });
      });
    }
  },

  stopShowingStack(duration) {
    if (this._cardStackLabel != null) {
      this._cardStackLabel.fadeToInvisible(duration);
    }

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      for (let i = 0, il = this._cardStackSprites.length; i < il; i++) {
        const cardStackSprite = this._cardStackSprites[i];
        cardStackSprite.fadeToInvisible(duration);
      }
    });
  },

  /* endregion STACK */

  /* region FLIP */

  /**
   * Shows the front of the card.
   * NOTE: usually not necessary to call this manually.
   */
  showFront() {
    this._containerNodeBack.setVisible(false);
    this._containerNodeFront.setVisible(true);
  },

  /**
   * Shows the back of the card.
   * NOTE: usually not necessary to call this manually.
   */
  showBack() {
    this._containerNodeBack.setVisible(true);
    this._containerNodeFront.setVisible(false);
  },

  /**
   * Shows card being flipped from current side to other side.
   * NOTE: in order to show card back, you must first call bindCardBack() and whenCardBackResourcesReady().then
   * @param {Number} [duration=0.5]
   * @param {Boolean} [rotateInPlace=false] whether to rotate in place or with movement and relative angular rotation
   */
  showFlip(duration, rotateInPlace) {
    if (duration == null) { duration = 0.5; }

    // stop any running flip
    if (this._flipAction != null) {
      this.stopAction(this._flipAction);
      this._flipAction = null;

      if (duration > 0.0) {
        if (this._flippingToFront) {
          this.setXYZRotation(new cc.kmVec3(0.0, 0.0, 0.0));
        } else {
          this.setXYZRotation(new cc.kmVec3(0.0, -180.0, 0.0));
        }
      }
    }

    const flipMod = this._flippingToFront ? -1.0 : 1.0;
    const xyzRotation = new cc.kmVec3(0.0, -180.0, 0.0);

    // animate rotation
    if (duration <= 0.0) {
      const targetXYZRotation = this.getXYZRotation();
      targetXYZRotation.x += xyzRotation.x;
      targetXYZRotation.y += xyzRotation.y;
      targetXYZRotation.z += xyzRotation.z;
      this.setXYZRotation(targetXYZRotation);
    } else if (rotateInPlace) {
      this._flipAction = cc.sequence(
        XYZRotateBy.create(duration, xyzRotation.x, xyzRotation.y, xyzRotation.z).easing(cc.easeBackInOut(2.0)),
        cc.callFunc(() => {
          this._flipAction = null;
        }),
      );
      this.runAction(this._flipAction);
    } else {
      // set starting properties
      const contentSize = this.getContentSize();
      const anchorX = flipMod < 0.0 ? 0.3 : 0.7;
      const anchorY = 0.25;
      const angRotX = 40.0 * (xyzRotation.y < 0.0 ? -1.0 : 1.0);
      const angRotY = 60.0 * (xyzRotation.x < 0.0 ? -1.0 : 1.0);
      const angRotZ = 0.0;
      const originalPosition = this.getPosition();
      const originalAnchor = this.getAnchorPoint();
      const startingPosition = cc.p(
        originalPosition.x + (anchorX - 0.5) * contentSize.width * flipMod,
        originalPosition.y + (anchorY - 0.5) * contentSize.height,
      );
      const finalPosition = cc.p(
        originalPosition.x - (anchorX - 0.5) * contentSize.width * flipMod,
        originalPosition.y + (anchorY - 0.5) * contentSize.height,
      );
      const intermediatePositionA = cc.p(
        originalPosition.x - (anchorX - 0.5) * contentSize.width * flipMod * 0.5,
        originalPosition.y + (anchorY - 0.5) * contentSize.height,
      );
      const intermediatePositionB = cc.p(
        originalPosition.x + (anchorX - 0.5) * contentSize.width * flipMod,
        originalPosition.y + (anchorY - 0.5) * contentSize.height,
      );
      this.setAnchorPoint(anchorX, anchorY);
      this.setPosition(startingPosition);

      this._flipAction = cc.sequence(
        cc.spawn(
          // rotate to other side
          XYZRotateBy.create(duration, xyzRotation.x, xyzRotation.y, xyzRotation.z).easing(cc.easeCubicActionInOut()),
          // // rotate relative to motion
          // cc.sequence(
          //   SecondaryXYZRotateBy.create(duration * 0.5, angRotX, angRotY, angRotZ).easing(cc.easeInOut(3.0)),
          //   SecondaryXYZRotateBy.create(duration * 0.5, -angRotX, -angRotY, -angRotZ).easing(cc.easeInOut(3.0))
          // ),
          // move in arc
          cc.sequence(
            // cc.moveTo(duration * 0.33, intermediatePositionA).easing(cc.easeInOut(3.0)),
            // cc.moveTo(duration * 0.33, intermediatePositionB).easing(cc.easeInOut(3.0)),
            cc.moveTo(duration, finalPosition).easing(cc.easeInOut(3.0)),
            cc.callFunc(() => {
              this.setAnchorPoint(originalAnchor);
              this.setPosition(originalPosition);
            }),
          ),
          // move towards camera
          cc.sequence(
            cc.scaleTo(duration * 0.5, 0.8),
            cc.scaleTo(duration * 0.5, 1.0),
          ).easing(cc.easeCubicActionInOut()),
        ),
        cc.callFunc(() => {
          this._flipAction = null;
        }),
      );
      this.runAction(this._flipAction);
    }

    // toggle flip state
    this._flippingToFront = !this._flippingToFront;
  },

  /**
   * Convenience method to reset card flip state back to front.
   */
  resetFlip(duration, rotateInPlace) {
    if (duration == null) { duration = 0.0; }
    if (this._flippingToFront) {
      this.showFlip(duration, rotateInPlace);
    }
  },

  /* endregion FLIP */

  /* region BURN */

  /**
   * Shows card being burned.
   * @param sdkCard
   * @param startDelay
   * @param animateDuration
   * @param dissolveDelay
   * @param dissolveDuration
   * @param sourceScreenPosition
   * @param targetScreenPosition
   * @returns {Promise}
   */
  showBurn(sdkCard, startDelay, animateDuration, dissolveDelay, dissolveDuration, sourceScreenPosition, targetScreenPosition) {
    // reset
    if (sdkCard != null) {
      this.setSdkCard(sdkCard);
    } else {
      this.hideSnapshot();
    }

    if (this.sdkCard != null) {
      return new Promise((resolve, reject) => {
        // stop running animations
        this.stopAnimations();

        // set default delay
        if (startDelay == null) { startDelay = 0.0; }

        // hide by scaling to 0
        this.setScale(0.0);

        // wait for resources
        Promise.all([
          this.whenRequiredResourcesReady(),
          this.whenResourcesReady(this.getCardResourceRequestId()),
        ])
          .spread((requiredRequestId, cardResourceRequestId) => {
            if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(cardResourceRequestId)) return; // load invalidated or resources changed

            const centerPosition = this.getCenterPosition();
            const cardBackgroundContentSize = this.getCardBackgroundContentSize();

            // get movement and rotation
            const dx = targetScreenPosition.x - sourceScreenPosition.x;
            const dy = targetScreenPosition.y - sourceScreenPosition.y;
            let anchorX;
            if (dx < 0.0) { anchorX = 0.0; } else if (dx > 0.0) { anchorX = 1.0; } else { anchorX = 0.5; }
            let anchorY;
            if (dy < 0.0) { anchorY = 0.0; } else if (dy > 0.0) { anchorY = 1.0; } else { anchorY = 0.5; }
            const angRotX = 30;// * (dy < 0.0 ? -1 : 1);
            const angRotY = 60 * (dx < 0.0 ? -1 : 1);
            const angRotZ = 0;
            const contentSize = this.getContentSize();
            const sourceScreenPositionWithAnchor = cc.p(sourceScreenPosition.x + (anchorX - 0.5) * contentSize.width, sourceScreenPosition.y + (anchorY - 0.5) * contentSize.height);
            const targetScreenPositionWithAnchor = cc.p(targetScreenPosition.x + (anchorX - 0.5) * contentSize.width, targetScreenPosition.y + (anchorY - 0.5) * contentSize.height);

            // set starting properties
            this.setAnchorPoint(anchorX, anchorY);
            this.setPosition(sourceScreenPositionWithAnchor);
            this.setSecondaryXYZRotation(new cc.kmVec3(angRotX, angRotY, angRotZ));

            // set starting position
            this.setPosition(sourceScreenPosition);

            // show burn animation
            const burnAction = cc.sequence(
              cc.delayTime(startDelay),
              cc.spawn(
                cc.sequence(
                  cc.moveTo(animateDuration, targetScreenPositionWithAnchor).easing(cc.easeExponentialOut()),
                  cc.callFunc(() => {
                    this.setAnchorPoint(0.5, 0.5);
                    this.setPosition(targetScreenPosition);
                  }),
                ),
                cc.targetedAction(
                  this._outlineGlow,
                  cc.sequence(
                    cc.show(),
                    cc.fadeIn(0.3 * animateDuration).easing(cc.easeIn(1.0)),
                    cc.delayTime(animateDuration),
                    cc.fadeOut(0.2 * animateDuration).easing(cc.easeOut(1.0)),
                    cc.hide(),
                  ),
                ).easing(cc.easeExponentialOut()),
                SecondaryXYZRotateBy.create(animateDuration, -angRotX, -angRotY, -angRotZ).easing(cc.easeExponentialOut()),
                cc.scaleTo(animateDuration, 1.0).easing(cc.easeExponentialOut()),
              ),
              cc.delayTime(dissolveDelay),
              cc.spawn(
                cc.callFunc(() => {
                  // snapshot self
                  this.recordSnapshot();

                  // set snapshot as dissolving
                  this._snapshotSprite.setDissolving(true);

                  // particles
                  const particles = new cc.ParticleSystem(RSX.ptcl_card_appear.plist);
                  particles.setPosVar(cc.p(cardBackgroundContentSize.width * 0.5, cardBackgroundContentSize.height * 0.5));
                  particles.setPosition(centerPosition);
                  this.addChild(particles, -1);
                }),
                cc.targetedAction(this._snapshotSprite, cc.actionTween(dissolveDuration, TweenTypes.DISSOLVE, 0.0, 1.0).easing(cc.easeIn(3.0))),
              ),
              cc.callFunc(() => {
                this.setSdkCard(null);
                resolve();
              }),
            );
            this.addAnimationAction(burnAction);
            this.runAction(burnAction);
          });
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
    }
    return Promise.resolve();
  },

  /* endregion BURN */

  /* region REVEAL */

  /**
   * Shows a card being revealed.
   * @param sdkCard
   * @param sourceScreenPosition
   * @param targetScreenPosition
   * @param [moveDelay=0.0] delay before card is moved to target position
   * @returns {Promise}
   */
  showReveal(sdkCard, sourceScreenPosition, targetScreenPosition, moveDelay) {
    if (moveDelay == null) { moveDelay = 0.0; }

    // reset
    if (sdkCard != null) {
      this.setSdkCard(sdkCard);
    } else {
      this.hideSnapshot();
    }

    if (this.sdkCard != null) {
      return new Promise((resolve, reject) => {
        // stop running animations
        this.stopAnimations();

        // hide everything until snapshot taken
        this._containerNode.setVisible(false);

        this._isAnimationInProgress = true;

        // wait for resources
        Promise.all([
          this.whenRequiredResourcesReady(),
          this.whenResourcesReady(this.getCardResourceRequestId()),
        ])
          .spread((requiredRequestId, cardResourceRequestId) => {
            if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(cardResourceRequestId)) return; // load invalidated or resources changed

            this._outlineGlow.setVisible(true);
            this._outlineGlowBlurred.setVisible(true);

            // snapshot self
            this.recordSnapshot();

            const centerPosition = this.getCenterPosition();
            const cardBackgroundContentSize = this.getCardBackgroundContentSize();
            const moveDuration = (targetScreenPosition == null || cc.pSameAs(sourceScreenPosition, targetScreenPosition)) ? 0 : CONFIG.MOVE_MEDIUM_DURATION;
            const delayBeforeSetVisible = 0.0; // (moveDuration > 0) ? 0 : CONFIG.MOVE_MEDIUM_DURATION;
            const revealDuration = CONFIG.FADE_MEDIUM_DURATION * 2.0;

            // bg shadow
            this.bg_shadow = new BaseSprite(RSX.card_shadow_map.img);
            this.bg_shadow.setOpacity(0);
            this.bg_shadow.setPosition(centerPosition);
            this.addChild(this.bg_shadow, -9999);

            // particles
            var fxFluidPuff = BaseSprite.create({
              spriteIdentifier: RSX.fxFluidCardShapePuff.name,
              color: new cc.Color(100, 200, 255, 255),
              scale: 9.0,
              blendSrc: cc.SRC_ALPHA,
              blendDst: cc.ONE,
            });
            fxFluidPuff.setPosition(centerPosition);
            const fluidPuffAction = cc.sequence(
              UtilsEngine.getAnimationAction(RSX.fxFluidCardShapePuff.name, false),
              cc.fadeOut(0.1),
              cc.removeSelf(),
            );
            this.addAnimationAction(fluidPuffAction);
            fxFluidPuff.runAction(fluidPuffAction);
            this.addChild(fxFluidPuff, -1);

            const fxFluidPuff2 = BaseSprite.create({
              spriteIdentifier: RSX.fxFluidCardShapePuff.name,
              color: new cc.Color(0, 100, 255, 255),
              scale: 8.0,
              flippedX: true,
              blendSrc: cc.SRC_ALPHA,
              blendDst: cc.ONE,
            });
            fxFluidPuff2.setPosition(centerPosition);
            const fluidPuff2Action = cc.sequence(
              cc.delayTime(0.15),
              UtilsEngine.getAnimationAction(RSX.fxFluidCardShapePuff.name, false),
              cc.fadeOut(0.1),
              cc.removeSelf(),
            );
            this.addAnimationAction(fluidPuff2Action);
            fxFluidPuff2.runAction(fluidPuff2Action);
            this.addChild(fxFluidPuff2, -1);

            const particles = new cc.ParticleSystem(RSX.ptcl_card_appear.plist);
            particles.setPosVar(cc.p(cardBackgroundContentSize.width * 0.5, cardBackgroundContentSize.height * 0.5));
            particles.setPosition(centerPosition);
            particles.setAutoRemoveOnFinish(true);
            this.addChild(particles, 1);

            // glow
            this._glowMapNode.setVisible(true);
            this._glowMapNode.setOpacity(255.0);
            this._glowMapNode.stopAllActions();

            // // highlight
            // this._snapshotSprite.setLeveled(true);
            // this._snapshotSprite.setLevelsInWhite(180);
            // this._snapshotSprite.setLevelsInBlack(30);
            // this._snapshotSprite.setHighlighted(true);
            // this._snapshotSprite.setHighlightIntensity(6.0);
            this._snapshotSprite.setTint(new cc.Color(255, 255, 255, 255));

            // fade out glow map
            const glowMapFadeAction = cc.fadeOut(0.4).easing(cc.easeIn(3.0));
            this.addAnimationAction(glowMapFadeAction);
            this._glowMapNode.runAction(glowMapFadeAction);

            this._outlineGlowBlurred.setLeveled(true);
            this._outlineGlowBlurred.setLevelsInWhite(20);

            // tint and animate
            const tintAction = cc.sequence(
              cc.delayTime(revealDuration),
              cc.actionTween(revealDuration / 2.0, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeOut(3.0)),
              cc.targetedAction(this._outlineGlowBlurred, cc.spawn(
                cc.actionTween(0.5, 'levelsInWhite', 20, 255),
                cc.actionTween(0.5, 'levelsInBlack', 0, 20),
                cc.targetedAction(this._outlineGlowBlurred, cc.fadeOut(0.6)),
              )),

              // cc.callFunc(function () {
              //   this._snapshotSprite.fadeOutHighlight(revealDuration);
              //   var levelsAction = cc.sequence(
              //     cc.spawn(
              //       cc.actionTween(revealDuration, "levelsInWhite", 180.0, 255.0),
              //       cc.actionTween(revealDuration, "levelsInBlack", 30.0, 0.0)
              //     ),
              //     cc.callFunc(function () {
              //       this._snapshotSprite.setLeveled(false);
              //     }.bind(this))
              //   );
              //   this.addAnimationAction(levelsAction);
              //   this._snapshotSprite.runAction(levelsAction);
              // }.bind(this))
            );
            this.addAnimationAction(tintAction);
            this._snapshotSprite.runAction(tintAction);

            // show shadow
            const shadowAction = cc.sequence(
              cc.delayTime(revealDuration),
              cc.fadeTo(CONFIG.FADE_FAST_DURATION, 150.0),
            );
            this.addAnimationAction(shadowAction);
            this.bg_shadow.runAction(shadowAction);

            // assemble show reveal sequence
            const showRevealSequence = [];

            if (sourceScreenPosition != null) {
              this.setPosition(sourceScreenPosition);
            }

            if (this.sdkCard.rarityId > SDK.Rarity.Common) {
              // Show rarity flare
              var fxFluidPuff = BaseSprite.create(RSX.fx_fluid_sphere.name);
              fxFluidPuff.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
              fxFluidPuff.setScale(1.0);
              fxFluidPuff.setPosition(this.getCenterPosition());
              fxFluidPuff.setVisible(false);
              fxFluidPuff.setShaderProgram(cc.shaderCache.programForKey('Colorize'));
              this.addChild(fxFluidPuff, 0);

              const rarityFlare = new FXRarityFlareSprite();
              rarityFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
              rarityFlare.setPosition(this.getCenterPosition().x, this.getCenterPosition().y + 50);
              rarityFlare.setVisible(false);
              rarityFlare.setScale(10.0);
              this.addChild(rarityFlare, 10);

              // Run rarity flare action
              const rarityColor = SDK.RarityFactory.rarityForIdentifier(this.sdkCard.rarityId).color;

              const fluidSpriteAnimation = UtilsEngine.getAnimationAction(RSX.fx_fluid_sphere.name);

              rarityFlare.setColor(rarityColor);
              rarityFlare.setVisible(false);

              fxFluidPuff.setColor(rarityColor);
              fxFluidPuff.setVisible(false);
              fxFluidPuff.setFlippedX(Math.random() > 0.5);
              fxFluidPuff.setFlippedY(Math.random() > 0.5);

              // Begin the rarity effect (this happens outside the main sequence so it doesn't stall resolving the returned promise)
              this.runAction(cc.targetedAction(fxFluidPuff, cc.sequence(
                cc.spawn(
                  cc.callFunc(((rarityFlare, fxFluidPuff) => {
                    rarityFlare.setVisible(true);
                    rarityFlare.setOpacity(0);
                    rarityFlare.setPhase(1.0);
                    rarityFlare.runAction(
                      cc.sequence(
                        cc.fadeIn(0.5),
                        cc.delayTime(1.0 + Math.random() * 0.6),
                        cc.spawn(
                          cc.actionTween(1.0, 'phase', 1.0, 0.25),
                        ),
                        cc.removeSelf(),
                      ),
                    );

                    fxFluidPuff.setVisible(true);
                    fxFluidPuff.setOpacity(0);
                  }).bind(this, rarityFlare, fxFluidPuff)),
                  cc.spawn(
                    cc.fadeIn(1.0),
                    fluidSpriteAnimation,
                    cc.sequence(
                      cc.delayTime(fluidSpriteAnimation.getDuration() - CONFIG.ANIMATE_FAST_DURATION),
                      cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
                    ),
                  ),
                ),
                cc.callFunc(() => {
                  // explosion particles
                  const particles = cc.ParticleSystem.create(RSX.core_gem_particles.plist);
                  particles.setStartColor(rarityColor);
                  particles.setEndColor(rarityColor);
                  particles.setPosition(this.getCenterPosition().x, this.getCenterPosition().y - 25);
                  this.addChild(particles, 10);

                  // gem quick rarity polar flare
                  const polarFlare = FXFbmPolarFlareSprite.create();
                  polarFlare.phase = 1.0;
                  polarFlare.timeScale = 1.0;
                  polarFlare.setScale(0.75);
                  polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
                  polarFlare.setTextureRect(cc.rect(0, 0, 100, 100));
                  polarFlare.flareColor = rarityColor;
                  polarFlare.setPosition(this.getCenterPosition().x, this.getCenterPosition().y - 25);
                  this.addChild(polarFlare, 10);
                  polarFlare.runAction(cc.sequence(
                    cc.actionTween(1.0, 'phase', 0.01, 1.0).easing(cc.easeExponentialIn()),
                    cc.callFunc(() => {
                      particles.stopSystem();
                    }),
                    cc.actionTween(1.0, 'phase', 1.00, 0.01).easing(cc.easeExponentialOut()),
                    cc.fadeOut(0.1),
                    cc.delayTime(1.0), // let particles die out
                    cc.callFunc(() => {
                      particles.destroy();
                    }),
                    cc.removeSelf(),
                  ));

                  // this._voronoiEffectSprite = new VoronoiPrismaticSprite();
                  // this._voronoiEffectSprite.setVisible(false);
                  // this._voronoiEffectSprite.setPosition(this.getCenterPosition().x, this.getCenterPosition().y);
                  // this._voronoiEffectSprite.setTextureRect(cc.rect(0, 0, 200, 200));
                  // this.addChild(this._voronoiEffectSprite, 10);
                  // // this._voronoiPrismaticSprite.setScale(0.5);
                  //
                  // // start voronoi at half phase to show it exploding out
                  // var voronoiPhase = 0.0;
                  // this._voronoiEffectSprite.setPhase(voronoiPhase);
                  // this._voronoiEffectSprite.runAction(cc.sequence(
                  //   cc.delayTime(0.5),
                  //   cc.show(),
                  //   cc.spawn(
                  //     cc.fadeTo(0.2, 255.0).easing(cc.easeCubicActionOut()),
                  //     cc.actionTween(0.5, voronoiPhase, 1.0)
                  //   ),
                  //   cc.hide(),
                  //   cc.removeSelf(),
                  //   cc.callFunc(function(){
                  //     this._voronoiEffectSprite.destroy()
                  //   }.bind(this))
                  // ))
                  //
                }),
                cc.removeSelf(),
              )));
            }

            // Add a delay to account for movement to reveal sequence
            showRevealSequence.push(cc.delayTime(revealDuration * 1.5 + moveDelay + delayBeforeSetVisible));

            if (targetScreenPosition != null) {
              showRevealSequence.push(cc.moveTo(moveDuration, targetScreenPosition).easing(cc.easeOut(2.0)));
            }

            // Final clean up in reveal sequence
            showRevealSequence.push(cc.callFunc(() => {
              this.factionNameLabel.setVisible(true);
              // this._glowMapNode.setVisible(false);
              // hide snapshot and show animated card
              this.fadeOutSnapshot(0.1);
            }));

            // fade out outline
            const outlineDelay = (this.sdkCard.rarityId > SDK.Rarity.Common) ? 0.25 : 0.0;
            const outlineGlowAction = cc.sequence(
              cc.delayTime(outlineDelay),
              cc.fadeOut(0.8 + outlineDelay).easing(cc.easeExponentialOut()),
              cc.hide(),
            );
            showRevealSequence.push(cc.targetedAction(this._outlineGlow, outlineGlowAction));
            this.addAnimationAction(outlineGlowAction);

            // add slight extra delay
            // showRevealSequence.push(cc.delayTime(revealDuration));

            // animations complete
            showRevealSequence.push(cc.callFunc(() => {
              resolve();
              this._isAnimationInProgress = false;
            }));

            const showRevealAction = cc.sequence(showRevealSequence);
            this.addAnimationAction(showRevealAction);
            this.runAction(showRevealAction);
          });
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
    }
    return Promise.resolve();
  },

  /* endregion REVEAL */

  /* region SELECTREVEAL */

  /**
   * Shows a card being revealed for selection.
   * @param sdkCard
   * @returns {Promise}
   */
  selectReveal(sdkCard) {
    // reset
    if (sdkCard != null) {
      this.setSdkCard(sdkCard);
    } else {
      this.hideSnapshot();
    }

    if (this.sdkCard != null) {
      return new Promise((resolve, reject) => {
        // speed for phase 1 of animation (rotation + outline)
        const rotationSpeed = 0.5;
        // speed for phase 2 of animation (elements appear on card)
        const animationSpeed = 0.5;
        // amount of time of rotation
        const rotateTime = 1.0;
        // starting time for animation of non-rotation elements
        const baseTime = rotateTime - 0.1;

        // custom back easing with heavy overshoot
        const customEaseBackOut = {
          easing(time1) {
            const overshoot = 4.70158;
            time1 -= 1;
            return time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1;
          },
        };

        // stop all animations
        this.stopAnimations();

        // Prevent asset popping by waiting to be visible until after assets are ready
        this._containerNode.setVisible(false);

        Promise.all([
          this.whenRequiredResourcesReady(),
          this.whenResourcesReady(this.getCardResourceRequestId()),
        ])
          .spread((requiredRequestId, cardResourceRequestId) => {
            if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(cardResourceRequestId)) return; // load invalidated or resources changed

            // begin: animation base states
            this.cardBackgroundSprite.setOpacity(0.0);
            this._outlineGlow.setOpacity(0.0);
            this._outlineGlowAlt.setOpacity(0.0);
            this._unitShadow.setOpacity(0);
            this.cardNameLabel.setOpacity(0);
            this.cardTypeLabel.setOpacity(0);
            if (this.raritySprite != null) {
              this.raritySprite.setOpacity(0);
            }
            this.hpLabel.setOpacity(0);
            this.atkLabel.setOpacity(0);
            this.cardDescriptionLabel.setOpacity(0);

            this.cardSprite.setOpacity(0);
            if (this.sdkCard instanceof SDK.Entity && this.sdkCard.getWasGeneral()) {
              if (this._signatureCardRing != null) {
                this._signatureCardRing.setOpacity(0);
              }
              if (this._signatureCardSprite != null) {
                this._signatureCardSprite.setOpacity(0);
              }
            } else {
              this._manaGemSprite.setOpacity(0);
              this.manaLabel.setOpacity(0);
            }
            this._containerNode.setVisible(true);
            // end: animation base states

            // animation order: cardback, managem, spriteshadow, sprite, name, type, rarity sprite, description text

            const cardBackAction = cc.sequence(
              cc.delayTime(0.6 * rotationSpeed),
              cc.fadeIn(0.3 * rotationSpeed).easing(cc.easeIn(1.0)),
            );
            this.addAnimationAction(cardBackAction);
            this.cardBackgroundSprite.runAction(cardBackAction);

            const glowAction = cc.sequence(
              cc.show(),
              cc.fadeIn(0.3 * rotationSpeed).easing(cc.easeIn(1.0)),
              cc.delayTime(0.5 * rotationSpeed),
              cc.fadeOut(0.3 * rotationSpeed).easing(cc.easeOut(1.0)),
              cc.hide(),
            );
            this.addAnimationAction(glowAction);
            this._outlineGlow.runAction(glowAction);

            const glowActionTwo = cc.sequence(
              cc.show(),
              cc.delayTime(0.3 * rotationSpeed),
              cc.fadeIn(0.3 * rotationSpeed).easing(cc.easeIn(1.0)),
              cc.fadeOut(0.3 * rotationSpeed).easing(cc.easeOut(1.0)),
              cc.hide(),
            );
            this.addAnimationAction(glowActionTwo);
            this._outlineGlowAlt.runAction(glowActionTwo);

            if (this.sdkCard instanceof SDK.Entity && this.sdkCard.getWasGeneral()) {
              if (this._signatureCardRing != null) {
                this._signatureCardRing.setVisible(true);
                const signatureCardRingAction = cc.spawn(
                  cc.sequence(
                    cc.delayTime(baseTime * animationSpeed),
                    cc.fadeIn(0.1 * animationSpeed),
                  ),
                  cc.sequence(
                    cc.scaleTo(0, 1.1, 1.1),
                    cc.delayTime(baseTime * animationSpeed),
                    cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
                  ),
                );
                this.addAnimationAction(signatureCardRingAction);
                this._signatureCardRing.runAction(signatureCardRingAction);
              }

              if (this._signatureCardSprite != null) {
                this._signatureCardSprite.setVisible(true);
                const signatureCardSpriteAction = cc.spawn(
                  cc.sequence(
                    cc.delayTime(baseTime * animationSpeed),
                    cc.fadeIn(0.1 * animationSpeed),
                  ),
                  cc.sequence(
                    cc.scaleTo(0, 1.1, 1.1),
                    cc.delayTime(baseTime * animationSpeed),
                    cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
                  ),
                );
                this.addAnimationAction(signatureCardSpriteAction);
                this._signatureCardSprite.runAction(signatureCardSpriteAction);
              }
            } else {
              const manaGemAction = cc.spawn(
                cc.sequence(
                  cc.delayTime(baseTime * animationSpeed),
                  cc.fadeIn(0.1 * animationSpeed),
                ),
                cc.sequence(
                  cc.scaleTo(0, 1.1, 1.1),
                  cc.delayTime(baseTime * animationSpeed),
                  cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
                ),
              );
              this.addAnimationAction(manaGemAction);
              this._manaGemSprite.runAction(manaGemAction);

              const manaLabelAction = cc.sequence(
                cc.delayTime((baseTime + 0.08) * animationSpeed),
                cc.fadeIn(0.1 * rotationSpeed).easing(cc.easeOut(1.0)),
              );
              this.addAnimationAction(manaLabelAction);
              this.manaLabel.runAction(manaLabelAction);
            }

            if (!(this.sdkCard instanceof SDK.Tile)) {
              const unitShadowAction = cc.sequence(
                cc.delayTime((baseTime - 0.05) * animationSpeed),
                cc.fadeTo(0.1 * animationSpeed, 150.0).easing(cc.easeOut(1.0)),
              );
              this.addAnimationAction(unitShadowAction);
              this._unitShadow.runAction(unitShadowAction);
            }

            this.cardSprite.setTint(new cc.Color(255, 255, 255, 255));
            const cardSpriteAction = cc.spawn(
              cc.sequence(
                cc.delayTime((baseTime + 0.1) * animationSpeed),
                cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
              ),
              cc.sequence(
                cc.delayTime((baseTime + 0.2) * animationSpeed),
                cc.actionTween(0.1 * animationSpeed, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeIn(1.0)),
              ),
            );
            this.addAnimationAction(cardSpriteAction);
            this.cardSprite.runAction(cardSpriteAction);

            const cardNameLabelAction = cc.spawn(
              cc.sequence(
                cc.delayTime((baseTime + 0.2) * animationSpeed),
                cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
              ),
              cc.sequence(
                cc.scaleTo(0, 1.2, 1.2),
                cc.delayTime((baseTime + 0.2) * animationSpeed),
                cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
              ),
            );
            this.addAnimationAction(cardNameLabelAction);
            this.cardNameLabel.runAction(cardNameLabelAction);

            const cardTypeLabelAction = cc.spawn(
              cc.sequence(
                cc.delayTime((baseTime + 0.3) * animationSpeed),
                cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
              ),
              cc.sequence(
                cc.scaleTo(0, 1.2, 1.2),
                cc.delayTime((baseTime + 0.3) * animationSpeed),
                cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
              ),
            );
            this.addAnimationAction(cardTypeLabelAction);
            this.cardTypeLabel.runAction(cardTypeLabelAction);

            if (this.raritySprite != null) {
              const raritySpriteAction = cc.spawn(
                cc.sequence(
                  cc.delayTime((baseTime + 0.5) * animationSpeed),
                  cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
                ),
                cc.sequence(
                  cc.scaleTo(0, 1.35, 1.35),
                  cc.delayTime((baseTime + 0.5) * animationSpeed),
                  cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
                ),
              );
              this.addAnimationAction(raritySpriteAction);
              this.raritySprite.runAction(raritySpriteAction);
            }

            if (this.sdkCard instanceof SDK.Entity) {
              const hpLabelAction = cc.spawn(
                cc.sequence(
                  cc.delayTime((baseTime + 0.7) * animationSpeed),
                  cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
                ),
                cc.sequence(
                  cc.scaleTo(0, 1.5, 1.5),
                  cc.delayTime((baseTime + 0.7) * animationSpeed),
                  cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
                ),
              );
              this.addAnimationAction(hpLabelAction);
              this.hpLabel.runAction(hpLabelAction);

              const atkLabelAction = cc.spawn(
                cc.sequence(
                  cc.delayTime((baseTime + 0.7) * animationSpeed),
                  cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
                ),
                cc.sequence(
                  cc.scaleTo(0, 1.5, 1.5),
                  cc.delayTime((baseTime + 0.7) * animationSpeed),
                  cc.scaleTo(0.2 * animationSpeed, 1, 1).easing(cc.easeOut(1.0)),
                ),
              );
              this.addAnimationAction(atkLabelAction);
              this.atkLabel.runAction(atkLabelAction);

              var cardDescriptionLabelAction = cc.sequence(
                cc.delayTime((baseTime + 0.9) * animationSpeed),
                cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
              );
              this.addAnimationAction(cardDescriptionLabelAction);
              this.cardDescriptionLabel.runAction(cardDescriptionLabelAction);
            } else {
              var cardDescriptionLabelAction = cc.sequence(
                cc.delayTime((baseTime + 0.7) * animationSpeed),
                cc.fadeIn(0.1 * animationSpeed).easing(cc.easeOut(1.0)),
              );
              this.addAnimationAction(cardDescriptionLabelAction);
              this.cardDescriptionLabel.runAction(cardDescriptionLabelAction);
            }

            this.setSecondaryXYZRotation(new cc.kmVec3(-45, 35, 0));
            this.setScale(0.8);
            const revealAction = cc.spawn(
              SecondaryXYZRotateBy.create(rotateTime * rotationSpeed, 45, -35, 0).easing(customEaseBackOut),
              cc.scaleTo(rotateTime * rotationSpeed, 1, 1).easing(customEaseBackOut),
              cc.sequence(
                cc.delayTime(rotateTime * rotationSpeed),
                cc.callFunc(() => {
                  resolve();
                }),
              ),
            );
            this.addAnimationAction(revealAction);
            this.runAction(revealAction);
          });
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
    }
    return Promise.resolve();
  },

  /* endregion SELECTREVEAL */

});

CardNode.create = function (sdkCard, node) {
  return SdkNode.create(sdkCard, node || new CardNode(sdkCard));
};

CardNode.WebGLRenderCmd = function (renderable) {
  cc.Node.WebGLRenderCmd.call(this, renderable);
};
const proto = CardNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
proto.constructor = CardNode.WebGLRenderCmd;

proto.transform = function (parentCmd, recursive) {
  const node = this._node;

  // proto transform
  cc.Node.WebGLRenderCmd.prototype.transform.call(this, parentCmd, recursive);

  // update showing side
  if (this.getIsWorldShowingBackside()) {
    node.showBack();
  } else {
    node.showFront();
  }
};

module.exports = CardNode;
