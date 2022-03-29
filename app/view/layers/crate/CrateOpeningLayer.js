//pragma PKGS: crate_opening
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var UtilsEngine = require('app/common/utils/utils_engine');
var RewardLayer = require('app/view/layers/reward/RewardLayer.js');
var BaseSprite = require('app/view/nodes/BaseSprite');
var BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
var FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
var ZodiacNode = require('app/view/nodes/draw/Zodiac');
var RankFactory = require("app/sdk/rank/rankFactory");
var GiftCrateLookup = require("app/sdk/giftCrates/giftCrateLookup");
var moment = require('moment');
var TweenTypes = require("app/view/actions/TweenTypes");
var LootCrateNode = require("app/view/nodes/reward/LootCrateNode");
var GiftCrateNode = require("app/view/nodes/reward/GiftCrateNode");
var FrostfireCrateNode = require("app/view/nodes/reward/FrostfireCrateNode");
var FrostfirePremiumCrateNode = require("app/view/nodes/reward/FrostfirePremiumCrateNode");
var MysteryCrateNode = require("app/view/nodes/reward/MysteryCrateNode");
var MysteryT1CrateNode = require("app/view/nodes/reward/MysteryT1CrateNode");
var MysteryT2CrateNode = require("app/view/nodes/reward/MysteryT2CrateNode");
var MysteryT3CrateNode = require("app/view/nodes/reward/MysteryT3CrateNode");
var MysteryBossCrateNode = require("app/view/nodes/reward/MysteryBossCrateNode");
var audio_engine = require("app/audio/audio_engine");
var CrateManager = require("app/ui/managers/crate_manager");
var Promise = require("bluebird");
var i18next = require('i18next')
var _ = require('underscore');

var NavigationManager = require("app/ui/managers/navigation_manager");
var ShopData = require("app/data/shop.json")

/****************************************************************************
 CrateOpeningLayer
 ****************************************************************************/

var CrateOpeningLayer = RewardLayer.extend({

	_animationResolve: null,
	bgColor: CONFIG.SEASON_BG_COLOR,
	buyNode: null,
	buyButtonText: i18next.t("mystery_crate_label.buy_button_label").toUpperCase(), // text for buy button (when used)
	buyButtonFont: RSX.font_bold.name, // font family for buy button (when used)
	buyButtonTextColor: CONFIG.BUY_BUTTON_TEXT_COLOR,
	buyTextColor: CONFIG.BUY_TEXT_COLOR,
	buyFontSize: 18, // font size for buy text
	buyNodeOffsetFromBottom: cc.p(0, 50),
	buyZOrder: 9998,
	continueButtonText: i18next.t("mystery_crate_label.continue_button_label").toUpperCase(),
	_currentlyHighlightedNode: null,
	//_giftCrateNode: null,
	//_frostfireCrateNode: null,
	//_frostfirePremiumCrateNode: null,
	_isShowingGiftCrates: null,
	_isShowingFrostfireCrates: null,
	_isShowingFrostfirePremiumCrates: null,
	_lootCrateNode: null,
	//_mysteryT1CrateNode: null,
	//_mysteryT2CrateNode: null,
	//_mysteryT3CrateNode: null,
	_mysteryBossCrateNode: null,
	_selectedCrateNodesByType: null,
	_selectableCrateNodesByType: null,
	_showSelectionAction: null,
	_unlockedCrateNode: null,

	// Page Tracking
	_slidingPanelNode: null,
	_currentPage: null,
	_numPages: null,

	/* region INITIALIZE */

	ctor: function () {
		this._selectableCrateNodesByType = {};
		this._selectedCrateNodesByType = {};

		this._isShowingGiftCrates = CrateManager.getInstance().getGiftCrateCount() != 0;
		this._isShowingFrostfireCrates = CrateManager.getInstance().getGiftCrateCount(GiftCrateLookup.FrostfirePurchasable2017) != 0;
		this._isShowingFrostfirePremiumCrates = CrateManager.getInstance().getGiftCrateCount(GiftCrateLookup.FrostfirePremiumPurchasable2017) != 0;

		this._super();
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		// pagination
		this._currentPage = 0;
		var winWidth = UtilsEngine.getGSIWinWidth();
		var numCrates = this.getNumCrateTypesShown();
		var widthPerCrate = CONFIG.CRATE_SIZE.width + CONFIG.CRATE_PADDING;
		var totalCratesWidth = CONFIG.CRATE_PADDING + widthPerCrate * numCrates;
		var cratesPerPage = Math.floor((winWidth - CONFIG.CRATE_PADDING) / widthPerCrate);

		if (winWidth - totalCratesWidth >= -CONFIG.CRATE_OVERFLOW_SLOP) {
			this._numPages = 1;
		} else {
			this._numPages = Math.ceil(numCrates / cratesPerPage);
		}

		// elements
		this.resizeBuyNodes();
	},

	/* endregion LAYOUT */

	/* region RESOURCES */

	getRequiredResources: function () {
		return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("crate_opening"));
	},

	/* endregion RESOURCES */

	/* region SCENE */

	onEnter:function () {
		this._super();

		// don't allow continue when pressing anywhere
		this.setIsContinueOnPressAnywhere(false);

		// show back button
		this.showBackCornerButton(CONFIG.ANIMATE_FAST_DURATION);

		// show selectable crates
		this.showSelectableCrates();

		// listen for chest/key count changes
		EventBus.getInstance().on(EVENTS.cosmetic_chest_collection_change, this.onCrateCollectionsChanged, this);
		EventBus.getInstance().on(EVENTS.cosmetic_chest_key_collection_change, this.onKeyCollectionsChanged, this);
		EventBus.getInstance().on(EVENTS.gift_crate_collection_change, this.onCrateCollectionsChanged, this);

		// hide and animate all crates in after short delay
		var crateTypes = Object.keys(this._selectableCrateNodesByType);
		for (var i = 0; i < crateTypes.length; i++) {
			var crateType = crateTypes[i];
			var node = this._selectableCrateNodesByType[crateType];
			node.stopActionByTag(CONFIG.FADE_TAG);
			node.setScale(0.0);
			node.setVisible(false);
			var showAction = cc.sequence(
				cc.delayTime(0.35 + this.getCrateShowDelayForType(crateType)),
				cc.show(),
				cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut())
			);
			showAction.setTag(CONFIG.FADE_TAG);
			node.runAction(showAction);
		}
	},

	onExit: function() {
		// stop listening for changes
		EventBus.getInstance().off(EVENTS.cosmetic_chest_collection_change, this.onCrateCollectionsChanged, this);
		EventBus.getInstance().off(EVENTS.gift_crate_collection_change, this.onCrateCollectionsChanged, this);
		EventBus.getInstance().off(EVENTS.cosmetic_chest_key_collection_change, this.onKeyCollectionsChanged, this);

		this._super();
	},

	/* endregion SCENE */

	/* region BACKGROUND */

	showBackground: function () {
		return this.showFlatBackground();
	},

	/* endregion BACKGROUND */

	/* region CONTINUE */

	showContinueNode: function () {
		return this.showPressToContinueNode()
			.then(function () {
				// hide continue initially
				this.continueNode.setVisible(false);
				this.continueNode.setEnabled(false);
			}.bind(this));
	},

	/* endregion CONTINUE */

	/* region CRATES */

	createCrateNodeForType: function (lootCrateType) {
		if (lootCrateType === MysteryT3CrateNode.crateType) {
			return new MysteryT3CrateNode();
		} else if (lootCrateType === MysteryT2CrateNode.crateType) {
			return new MysteryT2CrateNode();
		} else if (lootCrateType === MysteryT1CrateNode.crateType) {
			return new MysteryT1CrateNode();
		} else if (lootCrateType === MysteryBossCrateNode.crateType) {
			return new MysteryBossCrateNode();
		} else if (lootCrateType === FrostfireCrateNode.crateType) {
			return new FrostfireCrateNode();
		} else if (lootCrateType === FrostfirePremiumCrateNode.crateType) {
			return new FrostfirePremiumCrateNode();
		} else {
			return new GiftCrateNode();
		}
	},

	getCrateShowDelayForType: function (lootCrateType) {
		return 0.05 * this.getCrateIndexForType(lootCrateType);
	},

	getCrateIndexForType: function(lootCrateType) {
		var offsetFromGiftCrate = 0;
		var offsetFromFrostfireCrate = 0;
		var offsetFromFrostfirePremiumCrate = 0;

		if (this.getIsShowingGiftCrates()) {
			offsetFromGiftCrate += 1;
		}
		if (this.getIsShowingFrostfireCrates()) {
			offsetFromFrostfireCrate += 1;
		}
		if (this.getIsShowingFrostfirePremiumCrates()) {
			offsetFromFrostfirePremiumCrate += 1;
		}
		if (lootCrateType === MysteryT3CrateNode.crateType) {
			return 2 + offsetFromGiftCrate + offsetFromFrostfireCrate + offsetFromFrostfirePremiumCrate;
		} else if (lootCrateType === MysteryT2CrateNode.crateType) {
			return 1 + offsetFromGiftCrate + offsetFromFrostfireCrate + offsetFromFrostfirePremiumCrate;
		} else if (lootCrateType === MysteryT1CrateNode.crateType) {
			return 0 + offsetFromGiftCrate + offsetFromFrostfireCrate + offsetFromFrostfirePremiumCrate;
		} else if (lootCrateType === MysteryBossCrateNode.crateType) {
			return 3 + offsetFromGiftCrate + offsetFromFrostfireCrate + offsetFromFrostfirePremiumCrate;
		} else if (lootCrateType === FrostfireCrateNode.crateType) {
			return 0 + offsetFromGiftCrate;
		} else if (lootCrateType === FrostfirePremiumCrateNode.crateType) {
			return 0 + offsetFromGiftCrate + offsetFromFrostfireCrate;
		} else if (lootCrateType === GiftCrateNode.crateType) {
			return 0;
		} else {
			return null;
		}
	},

	getNumCrateTypesShown: function () {
		var crateTypesShown = 4;
		if (this.getIsShowingGiftCrates()) {
			crateTypesShown += 1;
		}
		if (this.getIsShowingFrostfireCrates()) {
			crateTypesShown += 1;
		}
		if (this.getIsShowingFrostfirePremiumCrates()) {
			crateTypesShown += 1;
		}
		return crateTypesShown;
	},

	getIsShowingScrolling: function () {
		return this.getNeedsScrolling()	&& this._scrollingActive;
	},

	_showScrolling: function () {
		this._scrollingActive = true;

		if (this._slidingPanelLeftArrowNode != null && this._currentPage != 0) {
			this._slidingPanelLeftArrowNode.stopAllActions();
			this._slidingPanelLeftArrowNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION)
		}
		if (this._slidingPanelRightArrowNode != null && (this._currentPage != (this._numPages -1))) {
			this._slidingPanelRightArrowNode.stopAllActions();
			this._slidingPanelRightArrowNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION)
		}
	},

	_hideScrolling: function () {
		this._scrollingActive = false;

		if (this._slidingPanelLeftArrowNode != null) {
			this._slidingPanelLeftArrowNode.stopAllActions();
			this._slidingPanelLeftArrowNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION)
		}
		if (this._slidingPanelRightArrowNode != null) {
			this._slidingPanelRightArrowNode.stopAllActions();
			this._slidingPanelRightArrowNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION)
		}
	},

	getNeedsScrolling: function () {
		return this._numPages > 1;
	},

	getIsShowingGiftCrates: function () {
		return this._isShowingGiftCrates;
	},

	getIsShowingFrostfireCrates: function () {
		return this._isShowingFrostfireCrates;
	},

	getIsShowingFrostfirePremiumCrates: function () {
		return this._isShowingFrostfirePremiumCrates;
	},

	getSelectableCrateNodePositionForType: function (lootCrateType) {
		var winWidth = UtilsEngine.getGSIWinWidth();
		var numCrates = this.getNumCrateTypesShown();
		var widthPerCrate = CONFIG.CRATE_SIZE.width + CONFIG.CRATE_PADDING;
		var totalCratesWidth = CONFIG.CRATE_PADDING + widthPerCrate * numCrates;
		var offsetXPerCrate = CONFIG.CRATE_SIZE.width + CONFIG.CRATE_PADDING;
		var offsetX = -winWidth * 0.5 + CONFIG.CRATE_PADDING + CONFIG.CRATE_SIZE.width * 0.5;
		if (winWidth - totalCratesWidth >= -CONFIG.CRATE_OVERFLOW_SLOP) {
			offsetX += (winWidth - totalCratesWidth) * 0.5;
		}
		var offsetY = 0.0;

		// First Row
		offsetX += offsetXPerCrate * this.getCrateIndexForType(lootCrateType);

		return cc.p(offsetX, offsetY);
	},

	_getOrCreateSlidingPanelNode: function () {
		if (this._slidingPanelNode == null) {
			this._slidingPanelNode = new cc.Node();
			this.addChild(this._slidingPanelNode);

			if (this.getNeedsScrolling()) {

				// Left Arrow
				this._slidingPanelLeftArrowNode = new cc.Node();
				var leftArrowButtonShadow = new BaseSprite(RSX.unit_shadow.img);
				leftArrowButtonShadow.setScale(5.0);
				leftArrowButtonShadow.setRotation(90.0);
				this._slidingPanelLeftArrowNode.addChild(leftArrowButtonShadow);
				var leftArrowButton = new BaseSprite(RSX.sliding_panel_paging_button.img);
				this._slidingPanelLeftArrowNode.addChild(leftArrowButton);
				var leftArrowButtonText = new BaseSprite(RSX.sliding_panel_paging_button_text.img);
				leftArrowButtonText.setScale(0.75);
				leftArrowButtonText.setPositionX(20);
				this._slidingPanelLeftArrowNode.addChild(leftArrowButtonText);
				this._slidingPanelLeftArrowNode.setPosition(UtilsEngine.getGSIWinWidth()*-0.5,0);
				this._slidingPanelLeftArrowNode._hitNode = leftArrowButton;
				this._slidingPanelLeftArrowNode.setOpacity(0.0);
				this._slidingPanelLeftArrowNode.setVisible(false);
				this.addChild(this._slidingPanelLeftArrowNode);

				// Right Arrow
				this._slidingPanelRightArrowNode = new cc.Node();
				var rightArrowButtonShadow = new BaseSprite(RSX.unit_shadow.img);
				rightArrowButtonShadow.setScale(5.0);
				rightArrowButtonShadow.setRotation(90.0);
				this._slidingPanelRightArrowNode.addChild(rightArrowButtonShadow);
				var rightArrowButton = new BaseSprite(RSX.sliding_panel_paging_button.img);
				this._slidingPanelRightArrowNode.addChild(rightArrowButton);
				var rightArrowButtonText = new BaseSprite(RSX.sliding_panel_paging_button_text.img);
				rightArrowButtonText.setScale(0.75);
				rightArrowButtonText.setFlippedX(true);
				rightArrowButtonText.setPositionX(-20);
				this._slidingPanelRightArrowNode.addChild(rightArrowButtonText);
				this._slidingPanelRightArrowNode.setPosition(UtilsEngine.getGSIWinWidth()*0.5,0);
				this._slidingPanelRightArrowNode._hitNode = rightArrowButton;
				this._slidingPanelRightArrowNode.setOpacity(0.0);
				this._slidingPanelRightArrowNode.setVisible(false);
				this.addChild(this._slidingPanelRightArrowNode);

				this._showScrolling();
			}
		}

		return this._slidingPanelNode;
	},

	slidePanel: function(pageDirection) {
		var previousPage = this._currentPage;
		var newPage = previousPage + pageDirection;

		if (newPage < 0 || newPage >= this._numPages) {
			// Outside bounds, do nothing
			return;
		}

		var winWidth = UtilsEngine.getGSIWinWidth();
		var numCrates = this.getNumCrateTypesShown();
		var widthPerCrate = CONFIG.CRATE_SIZE.width + CONFIG.CRATE_PADDING;
		var cratesPerPage = Math.floor((winWidth - CONFIG.CRATE_PADDING) / widthPerCrate);
		var cratesPageWidth = cratesPerPage * widthPerCrate;
		var totalCratesWidth = CONFIG.CRATE_PADDING + widthPerCrate * numCrates;
		var maxSlideX = totalCratesWidth - winWidth;
		var slideX = Math.min(maxSlideX, newPage * cratesPageWidth) * -1.0;

		this._slidingPanelNode.runAction(
			cc.moveTo(CONFIG.ANIMATE_SLOW_DURATION, slideX, 0.0).easing(cc.easeCubicActionInOut())
		);

		if (previousPage == 0) {
			this._slidingPanelLeftArrowNode.stopAllActions();
			this._slidingPanelLeftArrowNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION);
		}

		if (newPage == 0) {
			this._slidingPanelLeftArrowNode.stopAllActions();
			this._slidingPanelLeftArrowNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
		}

		if (newPage == this._numPages - 1) {
			this._slidingPanelRightArrowNode.stopAllActions();
			this._slidingPanelRightArrowNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
		}

		if (previousPage == this._numPages - 1) {
			this._slidingPanelRightArrowNode.stopAllActions();
			this._slidingPanelRightArrowNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION);
		}

		this._currentPage = newPage;

	},

	getOrCreateSelectableCrateNodeForType: function (lootCrateType) {
		var crateNode = this._selectableCrateNodesByType[lootCrateType];

		var slidingPanelNode = this._getOrCreateSlidingPanelNode();

		if (crateNode == null) {
			// create crate as needed
			crateNode = this._selectableCrateNodesByType[lootCrateType] = this.createCrateNodeForType(lootCrateType);
			crateNode.setPosition(this.getSelectableCrateNodePositionForType(lootCrateType));
			if (crateNode.getCrateCount() > 0) {
				crateNode.showIdleState();
			} else {
				crateNode.showStaticState();
			}

			slidingPanelNode.addChild(crateNode);

			// create labels
			crateNode.showCrateTypeLabel();
			crateNode.showCrateCountLabel();
			crateNode.showCrateMaxCountLabel();

			if (crateNode.getCrateCount() > 0 && crateNode instanceof MysteryBossCrateNode) {
				crateNode.showCrateExpirationLabel(CONFIG.ANIMATE_FAST_DURATION);
				crateNode.beginUpdateCrateExpiration();
			}

			// reposition labels
			var centerPosition = crateNode.getCenterPosition();
			var contentSize = crateNode.getContentSize();
			var crateTypeLabel = crateNode.getCrateTypeLabel();
			var crateCountLabel = crateNode.getCrateCountLabel();
			var crateMaxCountLabel = crateNode.getCrateMaxCountLabel();
			crateTypeLabel.setPosition(centerPosition.x, centerPosition.y - contentSize.height * 0.5 - 40.0);
			if (crateNode instanceof MysteryCrateNode) {
				crateCountLabel.setPosition(crateTypeLabel.getPositionX() - 15.0, crateTypeLabel.getPositionY() - 40.0);
				crateMaxCountLabel.setPosition(crateCountLabel.getPositionX() + 31.0, crateCountLabel.getPositionY());
			} else {
				crateCountLabel.setPosition(crateTypeLabel.getPositionX() + 10.0, crateTypeLabel.getPositionY() - 40.0);
				crateMaxCountLabel.setPosition(crateCountLabel.getPositionX() - 26.0, crateCountLabel.getPositionY());
			}
		}

		return crateNode;
	},

	getOrCreateSelectedCrateNodeForType: function (lootCrateType) {
		var crateNode = this._selectedCrateNodesByType[lootCrateType];
		if (crateNode == null) {
			// create crate as needed
			crateNode = this._selectedCrateNodesByType[lootCrateType] = this.createCrateNodeForType(lootCrateType);
			crateNode.showStaticState();
			this.addChild(crateNode);

			// create labels
			crateNode.showCrateTypeLabel();
			crateNode.showCrateCountLabel();
			crateNode.showCrateMaxCountLabel();
			crateNode.showCrateDescriptionLabel();

			// hide labels
			crateNode.getCrateTypeLabel().setVisible(false);
			crateNode.getCrateCountLabel().setVisible(false);
			crateNode.getCrateMaxCountLabel().setVisible(false);
			crateNode.getCrateDescriptionLabel().setVisible(false);
		}

		return crateNode;
	},

	showSelectableCrates: function () {
		// reset minor routes and add starting route
		NavigationManager.getInstance().resetMinorRoutes();
		NavigationManager.getInstance().addMinorRoute("crates", this.showSelectableCrates, this);

		return this.whenRequiredResourcesReady().then(function (requestId) {
			// create crates
			this.getOrCreateSelectableCrateNodeForType(MysteryT3CrateNode.crateType);
			this.getOrCreateSelectableCrateNodeForType(MysteryT2CrateNode.crateType);
			this.getOrCreateSelectableCrateNodeForType(MysteryT1CrateNode.crateType);
			this.getOrCreateSelectableCrateNodeForType(MysteryBossCrateNode.crateType);

			if (this.getIsShowingGiftCrates()) {
				this.getOrCreateSelectableCrateNodeForType(GiftCrateNode.crateType);
			}

			if (this.getIsShowingFrostfireCrates()) {
				this.getOrCreateSelectableCrateNodeForType(FrostfireCrateNode.crateType);
			}

			if (this.getIsShowingFrostfirePremiumCrates()) {
				this.getOrCreateSelectableCrateNodeForType(FrostfirePremiumCrateNode.crateType);
			}

			// reset
			this.resetSelection();

			// format titles
			var titleLabel = this.getOrCreateTitleLabel();
			titleLabel.setFontName(RSX.font_bold.name);

			// show titles
			this.showTitles(
				CONFIG.ANIMATE_FAST_DURATION,
				i18next.t("mystery_crates.mystery_crate_label",{ count:2 }).toUpperCase(), i18next.t("mystery_crates.mystery_crate_screen_instructions"),
				cc.p(0.0, UtilsEngine.getGSIWinHeight() * 0.5 - 120),
				cc.p(0.0, UtilsEngine.getGSIWinHeight() * 0.5 - 160)
			);

			this._showScrolling();
		}.bind(this));
	},

	/* endregion CRATES */

	/* region BUY */

	/**
	 * Shows press to buy button and returns a promise.
	 * @param {Number} [duration=0.0] time in seconds
	 * @param {String} [buttonText=this.buyButtonText]
	 * @param {String} [font=this.buyButtonFont]
	 * @param {Number} [fontSize=this.buyFontSize]
	 * @param {cc.Color} [textColor=this.textColor]
	 * @returns {Promise}
	 */
	showBuyNode: function (duration, buttonText, font, fontSize, textColor) {
		if (duration == null) { duration = 0.0; }
		if (buttonText == null) { buttonText = this.buyButtonText; }
		if (font == null) { font = this.buyButtonFont; }
		if (fontSize == null) { fontSize = this.buyFontSize; }
		if (textColor == null) { textColor = this.buyButtonTextColor; }

		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			this.removeBuyNodes(duration);

			this.buyButtonText = buttonText;
			this.buyFontSize = fontSize;
			this.buyButtonFont = font;
			this.buyButtonTextColor = textColor;

			var buyButtonSprite = new ccui.Scale9Sprite(RSX.button_secondary.img);
			var buyButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_secondary_glow.img);
			var buyButtonSize = buyButtonSprite.getContentSize();
			var buyButtonLabel = new cc.LabelTTF(this.buyButtonText, this.buyButtonFont, this.buyFontSize, null, cc.TEXT_ALIGNMENT_CENTER);
			buyButtonLabel.setFontFillColor(this.buyButtonTextColor);

			this.buyNode = new cc.ControlButton(buyButtonLabel, buyButtonSprite);
			this.buyNode.setPreferredSize(buyButtonSize);
			this.buyNode.setAdjustBackgroundImage(false);
			this.buyNode.setZoomOnTouchDown(false);
			this.buyNode.setBackgroundSpriteForState(buyButtonSprite,cc.CONTROL_STATE_NORMAL);
			this.buyNode.setBackgroundSpriteForState(buyButtonGlowSprite,cc.CONTROL_STATE_HIGHLIGHTED);
			this.addChild(this.buyNode, this.buyZOrder);

			// add as interactive
			this.addInteractiveElement(this.buyNode);

			if (this.isRunning()) {
				// resize when this is already running (in scene)
				// otherwise, resize will occur automatically on first init
				this.resizeBuyNodes();
			}

			if (duration != null && duration > 0.0) {
				this.buyNode.setOpacity(0.0);
				this.buyNode.fadeTo(duration, 255.0);
			}
		}.bind(this));
	},

	/**
	 * Removes current buy node(s).
	 * @param {Number} [duration=0.0] time in seconds
	 */
	removeBuyNodes: function (duration) {
		if (this.buyNode != null) {
			if (duration == null) { duration = 0.0; }
			this.removeInteractiveElement(this.buyNode);
			this.buyNode.destroy(duration);
			this.buyNode = null;
		}
	},

	resizeBuyNodes: function () {
		if (this.buyNode != null) {
			this.buyNode.setPosition(
				this.buyNodeOffsetFromBottom.x,
				-UtilsEngine.getGSIWinHeight() * 0.5 + this.buyNodeOffsetFromBottom.y
			);
		}
	},

	/* endregion BUY */

	/* region EVENTS */

	onCrateCollectionsChanged: function () {
		this.showUnlockUIForSelectedNode();
	},
	onKeyCollectionsChanged: function () {
		this.showUnlockUIForSelectedNode();
	},

	onPointerMove: function(event){
		RewardLayer.prototype.onPointerMove.call(this, event);

		if (event && event.isStopped) {
			return;
		}

		var mouseOverNode;
		if (!this.hasSelection()) {
			// intersect nodes
			var location = event && event.getLocation();
			if (location != null) {
				if (this.getIsShowingScrolling() &&
					(UtilsEngine.getNodeUnderMouse(this._slidingPanelLeftArrowNode._hitNode, location.x, location.y)
					|| UtilsEngine.getNodeUnderMouse(this._slidingPanelRightArrowNode._hitNode, location.x, location.y))) {
					// Do Nothing yet
				} else {
					var crateTypes = Object.keys(this._selectableCrateNodesByType);
					for (var i = 0, il = crateTypes.length; i < il; i++) {
						var crateType = crateTypes[i];
						var node = this._selectableCrateNodesByType[crateType];
						if (node.isVisible()
							&& UtilsEngine.getNodeUnderMouse(node, location.x, location.y)) {
							mouseOverNode = node;
							event.stopPropagation();
							break;
						}
					}
				}
			}
		}
		this.highlightNode(mouseOverNode);
	},

	onPointerUp: function (event) {
		RewardLayer.prototype.onPointerUp.call(this, event);

		if (event && event.isStopped) {
			return;
		}

		var location = event && event.getLocation();
		if (location != null && this.getIsInteractionEnabled()) {
			if (this.hasSelection()) {
				// try buy
				if (this.buyNode != null
					&& this.buyNode.isVisible()
					&& UtilsEngine.getNodeUnderMouse(this.buyNode, location.x, location.y)) {
					event.stopPropagation();
					this.onBuy();
				}
			} else if (this.getIsShowingScrolling() && UtilsEngine.getNodeUnderMouse(this._slidingPanelLeftArrowNode._hitNode, location.x, location.y)) {
				//event.stopPropagation();
				this.slidePanel(-1);
				// this._slidingPanelNode.setPositionX(this._slidingPanelNode.getPositionX() - 20)
			} else if (this.getIsShowingScrolling() && UtilsEngine.getNodeUnderMouse(this._slidingPanelRightArrowNode._hitNode, location.x, location.y)) {
				//event.stopPropagation();
				this.slidePanel(1);
				// this._slidingPanelNode.setPositionX(this._slidingPanelNode.getPositionX() + 20)
			} else {
				// select crate
				// only allow if has at least 1 crate
				var selectedCrateNode = null;
				var crateTypes = Object.keys(this._selectableCrateNodesByType);
				for (var i = 0, il = crateTypes.length; i < il; i++) {
					var crateType = crateTypes[i];
					var node = this._selectableCrateNodesByType[crateType];
					if (node.isVisible()
						&& UtilsEngine.getNodeUnderMouse(node, location.x, location.y)) {
						selectedCrateNode = node;
						event.stopPropagation();
						break;
					}
				}
				this.selectCrateNode(selectedCrateNode);
			}
		}
	},

	highlightNode: function (node) {
		if (this._currentlyHighlightedNode != node) {
			// cleanup previous
			if (this._currentlyHighlightedNode != null) {
				this._currentlyHighlightedNode.setLocalZOrder(0);
				this._currentlyHighlightedNode.stopShowingGlow(CONFIG.ANIMATE_FAST_DURATION);
				this._currentlyHighlightedNode = null;
			}

			if (node != null) {
				// set new
				this._currentlyHighlightedNode = node;

				// play sound
				audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);

				// show visuals
				this._currentlyHighlightedNode.setLocalZOrder(1);
				if (this._currentlyHighlightedNode instanceof LootCrateNode) {
					this._currentlyHighlightedNode.showGlow(CONFIG.ANIMATE_FAST_DURATION);
				}
			}
		}
	},

	selectCrateNode: function (selectedNode) {
		if (this._selectedNode != selectedNode) {
			if (selectedNode == null) {
				// go back to last route
				NavigationManager.getInstance().showLastRoute();
				this._showScrolling();
			} else {
				// add route
				NavigationManager.getInstance().addMinorRoute("select_crate", this.selectCrateNode, this, [selectedNode]);

				// store selected
				this._selectedNode = selectedNode;

				this._hideScrolling();

				// play select audio
				audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.SELECT_SFX_PRIORITY);

				// hide title
				//this.titleLabel.fadeToInvisible(CONFIG.FADE_FAST_DURATION);

				// set up an async promise that allows us to wait for animations to complete before showing anything else
				this._showingAnimationsPromise = this.showSelectedNode(this._selectedNode)
				.finally(function () {
					this._showingAnimationsPromise = null;
				}.bind(this))
				.catch(function () {
					// go back to last route if there is a problem
					NavigationManager.getInstance().showLastRoute();
				}.bind(this));
			}
		}
	},

	showSelectedNode: function (selectedNode) {
		return new Promise(function(resolve,reject){
			// hide titles
			this.stopShowingTitles(CONFIG.ANIMATE_FAST_DURATION);

			// hide selected node
			selectedNode.showStaticState();
			selectedNode.setScale(0.0);
			selectedNode.fadeToInvisible(0.0);

			// animate hiding non-selected nodes
			var crateTypes = Object.keys(this._selectableCrateNodesByType);
			for (var i = 0, il = crateTypes.length; i < il; i++) {
				var crateType = crateTypes[i];
				var node = this._selectableCrateNodesByType[crateType];
				if (node != selectedNode) {
					node.stopActionByTag(CONFIG.FADE_TAG);
					var fadeAction = cc.sequence(
						cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.0).easing(cc.easeBackIn()),
						cc.hide()
					);
					fadeAction.setTag(CONFIG.FADE_TAG);
					node.runAction(fadeAction);
				}
			}
			// copy selected node
			this._selectedCrateNode = this.getOrCreateSelectedCrateNodeForType(selectedNode.getCrateType());
			var sourcePosition = selectedNode.getPosition();
			var slidingPanelNode = this._getOrCreateSlidingPanelNode();
			sourcePosition.x += slidingPanelNode.getPositionX();
			sourcePosition.y += slidingPanelNode.getPositionY();
			this._selectedCrateNode.setPosition(sourcePosition);
			this._selectedCrateNode.showStaticState();
			this._selectedCrateNode.getCrateTypeLabel().fadeToInvisible(0.0);
			this._selectedCrateNode.getCrateCountLabel().fadeToInvisible(0.0);
			this._selectedCrateNode.getCrateMaxCountLabel().fadeToInvisible(0.0);
			this._selectedCrateNode.getCrateDescriptionLabel().fadeToInvisible(0.0);
			if (this._selectedCrateNode instanceof MysteryCrateNode) {
				this._selectedCrateNode.stopShowingKey();
			}

			// move copy of selected node to center
			this._selectedCrateNode.stopActionByTag(CONFIG.FADE_TAG);
			this._selectedCrateNode.setVisible(true);
			this._selectedCrateNode.setOpacity(255.0);
			this._selectedCrateNode.setScale(1.0);
			this._showSelectionAction = cc.targetedAction(this._selectedCrateNode, cc.sequence(
				cc.delayTime(0.1),
				cc.spawn(
					cc.sequence(
						cc.scaleTo(CONFIG.ANIMATE_SLOW_DURATION * 0.5, 1.1).easing(cc.easeOut(2.0)),
						cc.scaleTo(CONFIG.ANIMATE_SLOW_DURATION * 0.5, 1.0).easing(cc.easeIn(2.0))
					),
					cc.moveTo(CONFIG.ANIMATE_SLOW_DURATION, 0.0, 0.0).easing(cc.easeCubicActionInOut())
				),
				cc.callFunc(function () {
					// finish
					resolve();
				})
			));
			this.runAction(this._showSelectionAction);
		}.bind(this))
		.then(function () {
			return this.showUnlockUIForSelectedNode();
		}.bind(this))
		.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
	},

	showUnlockUIForSelectedNode: function () {
		if (!this.isUnlockingSelection() && this._selectedCrateNode != null) {
			var title;
			var titlePosition;
			var subtitle;
			var subtitlePosition;

			// show crate type/count
			this._selectedCrateNode.getCrateTypeLabel().fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			this._selectedCrateNode.getCrateCountLabel().fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			this._selectedCrateNode.getCrateMaxCountLabel().fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			this._selectedCrateNode.getCrateDescriptionLabel().fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);

			// show unlock for crate
			var crateCount = this._selectedCrateNode.getCrateCount();
			if (crateCount > 0) {
				// excite selected node
				this._selectedCrateNode.showExcitedState(CONFIG.ANIMATE_MEDIUM_DURATION);

				if (!this._selectedCrateNode.getUsesKeys()) {
					// remove buy
					this.removeBuyNodes(CONFIG.ANIMATE_FAST_DURATION);

					// update continue button
					this.continueNode.setTitleForState(i18next.t("mystery_crates.unlock_button_label").toUpperCase(),cc.CONTROL_STATE_NORMAL);
					this.continueNode.setTitleForState(i18next.t("mystery_crates.unlock_button_label").toUpperCase(),cc.CONTROL_STATE_HIGHLIGHTED);
					this.continueNode.setEnabled(true);
					this.continueNode.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);
					this.setContinueCallback(this.onUnlock);
				} else {
					// show key
					this._selectedCrateNode.showKey(CONFIG.ANIMATE_MEDIUM_DURATION);

					// show key count
					var keyCount = this._selectedCrateNode.getCrateKeyCount();
					subtitle = i18next.t("mystery_crates.key_count_label",{ count: keyCount, crate_type: SDK.CosmeticsFactory.nameForCosmeticChestType(this._selectedCrateNode.getCrateType())})
					subtitlePosition = cc.p(0.0, -UtilsEngine.getGSIWinHeight() * 0.5 + 120);
					if (keyCount > 0) {
						// remove buy
						this.removeBuyNodes(CONFIG.ANIMATE_FAST_DURATION);

						// update continue button
						this.continueNode.setTitleForState(i18next.t("mystery_crates.unlock_button_label").toUpperCase(),cc.CONTROL_STATE_NORMAL);
						this.continueNode.setTitleForState(i18next.t("mystery_crates.unlock_button_label").toUpperCase(),cc.CONTROL_STATE_HIGHLIGHTED);
						this.continueNode.setEnabled(true);
						this.continueNode.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);
						this.setContinueCallback(this.onUnlock);
					} else {
						// disable continue
						this.continueNode.setEnabled(false);
						this.continueNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
						this.resetContinueCallback();

						// show buy
						this.showBuyNode(CONFIG.ANIMATE_FAST_DURATION, i18next.t("mystery_crates.get_keys_label").toUpperCase());
					}
				}
			} else {
				// idle selected node
				this._selectedCrateNode.showIdleState(CONFIG.ANIMATE_MEDIUM_DURATION);

				// disable continue
				this.continueNode.setEnabled(false);
				this.continueNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
				this.resetContinueCallback();

				// remove buy
				this.removeBuyNodes(CONFIG.ANIMATE_FAST_DURATION);

				// show warning that user doesn't have any of this crate
				subtitle = i18next.t("mystery_crates.no_crates_of_type_warning",{crate_type: SDK.CosmeticsFactory.nameForCosmeticChestType(this._selectedCrateNode.getCrateType())});
				subtitlePosition = cc.p(0.0, -UtilsEngine.getGSIWinHeight() * 0.5 + 120);
				/*
				var keyCount = this._selectedCrateNode.getCrateKeyCount();
				if (keyCount > 0) {
					// show key
					this._selectedCrateNode.showKey(CONFIG.ANIMATE_MEDIUM_DURATION);
					var keySubtitle = "You have " + keyCount + " " + SDK.CosmeticsFactory.nameForCosmeticChestType(this._selectedCrateNode.getCrateType()) +  " Key" + (keyCount === 1 ? "" : "s");
					subtitle = keySubtitle + "\n" + subtitle
				}*/
			}

			// show crate titles
			this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle, titlePosition, subtitlePosition);
		} else {
			this.stopShowingTitles(CONFIG.ANIMATE_FAST_DURATION);
			this.removeBuyNodes(CONFIG.ANIMATE_FAST_DURATION);
			this.continueNode.setEnabled(false);
			this.continueNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
		}
	},

	hasSelection: function () {
		return this._selectedNode != null;
	},

	isUnlockingSelection: function () {
		return this._unlockedCrateNode != null;
	},

	resetSelection: function () {
		if (this._selectedNode != null) {
			// cleanup unlocked
			if (this._unlockedCrateNode != null) {
				this._unlockedCrateNode.destroy(CONFIG.ANIMATE_FAST_DURATION);
				this._unlockedCrateNode = null;
			}

			// cleanup selection
			if (this._showSelectionAction != null) {
				this.stopAction(this._showSelectionAction);
				this._showSelectionAction = null;
			}
			this._selectedNode.showIdleState(CONFIG.ANIMATE_MEDIUM_DURATION);
			this._selectedNode = null;

			// cleanup highlight
			this.highlightNode(null);

			// cleanup titles and interactives
			this.setIsInteractionEnabled(true);
			this.setIsContinueOnPressAnywhere(false);
			this.stopShowingTitles(CONFIG.ANIMATE_FAST_DURATION);
			this.removeBuyNodes(CONFIG.ANIMATE_FAST_DURATION);
			if (this.continueNode instanceof cc.ControlButton) {
				this.continueNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
			} else {
				this.showPressToContinueNode(CONFIG.ANIMATE_FAST_DURATION).then(function () {
					this.continueNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
				}.bind(this));
			}
			if (this.backNode == null) {
				this.showBackCornerButton(CONFIG.ANIMATE_FAST_DURATION);
			} else {
				this.backNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}

			// hide copy of selected crate
			if (this._selectedCrateNode != null) {
				if (this._selectedCrateNode instanceof MysteryCrateNode) {
					this._selectedCrateNode.stopShowingKey(CONFIG.ANIMATE_FAST_DURATION);
				}
				this._selectedCrateNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
				this._selectedCrateNode = null;
			}

			// show non-selected crates
			var crateTypes = Object.keys(this._selectableCrateNodesByType);
			for (var i = 0; i < crateTypes.length; i++) {
				var crateType = crateTypes[i];
				var node = this._selectableCrateNodesByType[crateType];
				node.stopActionByTag(CONFIG.FADE_TAG);
				node.setVisible(true);
				node.setLocalZOrder(0);
				if (node.getCrateCount() > 0) {
					node.showIdleState();
				} else {
					node.showStaticState();
				}
				var resetAction = cc.sequence(
					cc.delayTime(this.getCrateShowDelayForType(crateType)),
					cc.spawn(
						cc.moveTo(CONFIG.ANIMATE_MEDIUM_DURATION, this.getSelectableCrateNodePositionForType(node.getCrateType())).easing(cc.easeCubicActionInOut()),
						cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
						cc.fadeTo(CONFIG.ANIMATE_MEDIUM_DURATION, 255.0)
					)
				);
				resetAction.setTag(CONFIG.FADE_TAG);
				node.runAction(resetAction);
			}
		}
	},

	onBuy: function () {
		if (this._selectedCrateNode != null) {
			var crateType = this._selectedCrateNode.getCrateType();

			// play sfx
			audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

			// open purchase dialog for crate type key
			var keySku = SDK.CosmeticsFactory.keySKUForCosmeticChestType(crateType);
			var productData = ShopData["loot_chest_keys"][keySku];
			productData = _.extend({}, productData, {
				name: i18next.t("shop." + productData.name),
				description: i18next.t("shop." + productData.description)
			})

			return NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
			.bind(this)
			.catch(function () {
				// do nothing on cancel
			});
		}
	},

	onUnlock: function () {
		if (this._selectedCrateNode != null) {
			var crateType = this._selectedCrateNode.getCrateType();

			// store selected as unlocked
			this._unlockedCrateNode = this._selectedCrateNode;

			// clear cached selected node
			// this ensures after we unlock the crate
			// if this crate is selected again, it'll get regenerated
			delete this._selectedCrateNodesByType[crateType];

			// play sfx
			audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

			// disable and reset interaction
			this.disablePressToContinueAndHitboxesAndCallback();
			this.continueNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
			this.backNode.fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);

			// hide labels
			this.stopShowingTitles(CONFIG.ANIMATE_FAST_DURATION);
			this._selectedCrateNode.getCrateTypeLabel().fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
			this._selectedCrateNode.getCrateCountLabel().fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
			this._selectedCrateNode.getCrateMaxCountLabel().fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);
			this._selectedCrateNode.getCrateDescriptionLabel().fadeToInvisible(CONFIG.ANIMATE_FAST_DURATION);

			// unlock crate by type
			return new Promise(function (resolve, reject) {
				/*
				// TESTING
				return resolve([1,
					[
						//{gold: 25},
						// {spirit: 50},

						//{cosmetic_id: SDK.CosmeticsLookup.Emote.Faction1Bow},
						// {cosmetic_id: SDK.CosmeticsLookup.Emote.HealingMysticConfused},
						// {cosmetic_id: SDK.CosmeticsLookup.CardBack.Test},
						// {cosmetic_id: SDK.CosmeticsLookup.ProfileIcon.WhistlingBlade},
						// {cosmetic_id: SDK.CosmeticsLookup.BattleMap.Magmar},
						// {cosmetic_id: SDK.Cards.getCardSkinIdForCardId(SDK.Cards.Faction1.GeneralTier2)},
						// {cosmetic_id: SDK.Cards.getCardSkinIdForCardId(SDK.Cards.Faction2.AltGeneralTier2)},
						// {cosmetic_id: SDK.Cards.getCardSkinIdForCardId(SDK.Cards.Faction5.GeneralTier2)},
						// {cosmetic_id: SDK.CosmeticsLookup.Scene.MagaariEmberHighlands},

						//{spirit_orbs:1},

						// {card_id: SDK.Cards.Neutral.Lightbender + SDK.Cards.Prismatic},

						//{chest_key: {key_type: SDK.CosmeticsChestTypeLookup.Common}}
					]
				]);
				*/
				if (crateType === MysteryT1CrateNode.crateType
					|| crateType === MysteryT2CrateNode.crateType
					|| crateType === MysteryT3CrateNode.crateType
					|| crateType === MysteryBossCrateNode.crateType) {
					var crateId = CrateManager.getInstance().getNextAvailableCosmeticChestIdForType(crateType);
					//var keyId = CrateManager.getInstance().getNextAvailableCosmeticChestKeyIdForType(crateType);
					CrateManager.getInstance().unlockCosmeticChestWithId(crateId)
					.then(function (rewardsData) {
						resolve([crateId, rewardsData])
					}.bind(this));
				} else if (crateType === GiftCrateNode.crateType) {
					var crateId = CrateManager.getInstance().getNextAvailableGiftCrateId();
					CrateManager.getInstance().unlockGiftCrateWithId(crateId)
					.then(function (rewardsData) {
						resolve([crateId, rewardsData])
					}.bind(this));
				} else if (crateType === FrostfireCrateNode.crateType) {
					var crateId = CrateManager.getInstance().getNextAvailableGiftCrateId(GiftCrateLookup.FrostfirePurchasable2017);
					CrateManager.getInstance().unlockGiftCrateWithId(crateId)
						.then(function (rewardsData) {
							resolve([crateId, rewardsData])
						}.bind(this));
				} else if (crateType === FrostfirePremiumCrateNode.crateType) {
					var crateId = CrateManager.getInstance().getNextAvailableGiftCrateId(GiftCrateLookup.FrostfirePremiumPurchasable2017);
					CrateManager.getInstance().unlockGiftCrateWithId(crateId)
						.then(function (rewardsData) {
							resolve([crateId, rewardsData])
						}.bind(this));
				}
			}.bind(this))
			.spread(function (crateId, rewardsData) {
				// store rewards in crate
				this._selectedCrateNode.setRewardsModels(rewardsData);

				// show unlock
				return this._selectedCrateNode.showOpeningAndRewards();
			}.bind(this))
			.then(function () {
				this.showPressAnywhereToContinueNode();
				this.setIsContinueOnPressAnywhere(true);
				this.setIsInteractionEnabled(true);
			}.bind(this))
			.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
		}
	}

	/* endregion EVENTS */

});

CrateOpeningLayer.create = function(layer) {
	return RewardLayer.create(layer || new CrateOpeningLayer());
};

module.exports = CrateOpeningLayer;
