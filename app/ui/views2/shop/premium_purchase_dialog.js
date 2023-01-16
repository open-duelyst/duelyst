// pragma PKGS: shop

'use strict';

var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var Session = require('app/common/session2');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var UtilsUI = require('app/common/utils/utils_ui');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var InventoryManager = require('app/ui/managers/inventory_manager');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var ServerStatusManager = require('app/ui/managers/server_status_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ShopManager = require('app/ui/managers/shop_manager');
var PackageManager = require('app/ui/managers/package_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Analytics = require('app/common/analytics');
var moment = require('moment');
var Logger = require('app/common/logger');
var Storage = require('app/common/storage');
var Promise = require('bluebird');
var openUrl = require('app/common/openUrl');
var ShopPremiumPacksCollectionView = require('app/ui/views2/shop/shop_premium_packs_collection_view');
var CreditCardFormView = require('./credit_card_form');

var Template = require('./templates/premium_purchase_dialog.hbs');

// TODO: based off ConfirmPurchaseDialogView

var PremiumPurchaseDialogView = Backbone.Marionette.LayoutView.extend({

  // id: "shop-premium-modal",
  className: 'modal prompt-modal shop-premium-modal',
  template: Template,

  /* ui selector cache */
  ui: {
    for_purchase_with_gold: '.for-purchase-with-gold',
    for_normal_purchase: '.for-normal-purchase',
    confirm_purchase_nav: '.confirm_purchase_nav',
    nav_tabs: '.nav-tabs',
    card_form_modal: '#card_form_modal',
    confirm_purchase_dialog: '#confirm_purchase_dialog',
    confirm_purchase_button: '.confirm',
    card_form_error: '#card_form_error',
    card_form_error_message: '#card_form_error .error-message',
    $errorMessage: '.prompt-error .error-message',
    card_info: '#card_info',
    card_ending_digits: '#card_ending_digits',
    product_details_container: '.product-details-container',
    product_cover_image: '.product-cover-image',
    product_icon: '.product-icon',
    product_animation: '.product-animation',
    product_animation_sprite: '.product-animation .sprite',
    product_name: '.product-name',
    product_description: '.product-description',
    product_price: '.product-price',
    product_spirit_cost: '.product-spirit-cost',
    product_gold_cost: '.product-gold-cost',
    product_craft_button: '.btn-craft',
    promptSuccessTitle: '.prompt-success .prompt-title',
    quantity: '.quantity',
    premium_amount: '.premium-amount',
  },

  /* Ui events hash */
  events: {
    'click .btn-update-card': 'onUpdateCard',
    'click .btn-delete-card': 'onDeleteCard',
    'click .confirm': 'onConfirmPurchase',
    'click .btn-craft': 'onCraftPressed',
    'click .cancel': 'onCancelConfirmPurchase',
    'click .btn-get-help': 'onHelpPress',
    'click .nav-item': 'onNavOptionSelected',
    click: 'onBackgroundPressed',
    'input input.quantity': 'onQuantityChange',
  },

  regions: {
    productCollectionRegion: '.shop-product-collection-region',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _animationGLData: null,
  _animationSpriteData: null,
  _animationStartSpriteData: null,
  creditCardFormRegion: null,
  _currentPurchaseType: null,
  _$currentPurchaseTypeNavItem: null,
  _$currentPurchaseTypeTab: null,
  _loadedPkgId: null,
  _loadedPkgPromise: null,
  _loadedPkgValid: false,
  productData: null,
  _hasEnoughToPurchase: true,
  _hasValidQuantity: true,
  _quantity: 1,

  templateHelpers: {
    isPaypalEnabled: function () {
      return false;
    },
  },

  /* region INITIALIZE */

  initialize: function (opts) {
  },

  /* endregion INITIALIZE */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    this.creditCardFormRegion = new Backbone.Marionette.Region({
      el: '#card_form_region',
    });
    this._showCurrentPurchaseType();
    this.onWalletChange();
    if (this._animationSpriteData != null) {
      this._animationGLData = UtilsUI.showCocosSprite(this.ui.product_animation_sprite, this._animationGLData, this._animationSpriteData, null, true, null, this._animationStartSpriteData);
    }
  },

  onShow: function () {
    // play sfx
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);

    // listen to events
    this.listenTo(InventoryManager.getInstance().walletModel, 'change', this.onWalletChange);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onConfirmPurchase.bind(this));
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancelConfirmPurchase.bind(this));

    // show product
    if (this.productData != null) {
      this.showWithProductInfo(this.productData);
    }

    this.$el.addClass('loading');
    ShopManager.getInstance()._retrievePremiumProductsData()
      .then(function (productDatas) {
      // TODO: handle case of this view getting destroyed while products load
        this.$el.removeClass('loading');
        this.productCollectionRegion.show(new ShopPremiumPacksCollectionView({ model: new Backbone.Model({ packProducts: productDatas }) }));
      }.bind(this));
    // this.productCollectionRegion.show(new ShopPremiumPacksCollectionView({model: new Backbone.Model()}));
  },

  onDestroy: function () {
    if (this._successTriggerTimeoutId != null) {
      clearTimeout(this._successTriggerTimeoutId);
      this._successTriggerTimeoutId = null;
    }
    if (this._errorRevertTimeoutId != null) {
      clearTimeout(this._errorRevertTimeoutId);
      this._errorRevertTimeoutId = null;
    }
    this._invalidateAndUnloadLoadedPackages();
    this._releaseAnimation();
  },

  _invalidateAndUnloadLoadedPackages: function () {
    if (this._loadedPkgId != null) {
      this._loadedPkgValid = false;
      PackageManager.getInstance().unloadMajorMinorPackage(this._loadedPkgId);
      this._loadedPkgId = this._loadedPkgPromise = null;
    }
  },

  _releaseAnimation: function () {
    if (this._animationGLData != null) {
      UtilsUI.resetCocosSprite(this._animationGLData);
      this._animationGLData = this._animationSpriteData = this._animationStartSpriteData = null;
    }
  },

  /* region MARIONETTE EVENTS */

  /* region SHOW / HIDE */

  showWithProductInfo: function (productData) {
    // reset previous
    var previousProductData = this.productData;
    if (previousProductData != null) {
      this.ui.product_details_container.removeClass(previousProductData.category_id || '');
    }
    this._invalidateAndUnloadLoadedPackages();
    this._releaseAnimation();
    this._showValidQuantity();
    this._quantity = 1;

    // store new
    this.productData = productData;
    var productId = this.productData.id;
    var productSku = this.productData.sku;
    var productName = this.productData.name || '';
    var productDescription = this.productData.description || '';
    var productCategoryId = this.productData.category_id || '';

    var coverImageResource = RSX[this.productData.cover_image_resource_name];
    var coverImageUrl;
    if (coverImageResource != null) {
      coverImageUrl = coverImageResource.is16Bit ? coverImageResource.img : RSX.getResourcePathForScale(coverImageResource.img, CONFIG.resourceScaleCSS);
    } else {
      coverImageUrl = RSX.getResourcePathForScale(this.productData.cover_image_url, CONFIG.resourceScaleCSS);
    }

    // track in analytics
    Analytics.track('product selected', {
      category: Analytics.EventCategory.Shop,
      product_id: productSku,
    }, {
      labelKey: 'product_id',
    });

    this.ui.product_details_container.addClass(productCategoryId + ' ' + productSku);
    this.ui.product_name.text(productName);
    this.ui.product_description.html(productDescription);
    /*
    // icon/animation
    var animResource = this.productData.anim_resource;
    var animName = animResource && (animResource.breathing || animResource.idle);
    if (animName != null) {
      this.ui.product_icon.hide();
      this.ui.product_animation.show();

      this._loadedPkgValid = true;
      this._loadedPkgId = productId + UtilsJavascript.generateIncrementalId();
      var pkg = [RSX[animName]];
      var animStartName = animResource.attack;
      if (animStartName != null) {
        pkg.push(RSX[animStartName]);
      }
      this._loadedPkgPromise = PackageManager.getInstance().loadMinorPackage(this._loadedPkgId, pkg);
      var loadingPkgId = this._loadedPkgId;
      this._loadedPkgPromise.then(function () {
        if (!this._loadedPkgValid || loadingPkgId !== this._loadedPkgId) return; // product has changed
        this._animationSpriteData = UtilsUI.getCocosSpriteData(animName);
        this._animationStartSpriteData = UtilsUI.getCocosSpriteData(animStartName);
        this._animationGLData = UtilsUI.showCocosSprite(this.ui.product_animation_sprite, this._animationGLData, this._animationSpriteData, null, true, null, this._animationStartSpriteData);
      }.bind(this));

    } else {
    */
    var iconImageResource = RSX[this.productData.icon_image_resource_name];
    var iconImageUrl;
    if (iconImageResource != null) {
      iconImageUrl = iconImageResource.is16Bit ? iconImageResource.img : RSX.getResourcePathForScale(iconImageResource.img, CONFIG.resourceScaleCSS);
    } else {
      iconImageUrl = RSX.getResourcePathForScale(this.productData.icon_image_url, CONFIG.resourceScaleCSS);
    }
    this.ui.product_animation.hide();
    this.ui.product_icon.show();
    this.ui.product_icon.attr('src', iconImageUrl);
    // }

    // cover image
    this.ui.product_cover_image.css('background-image', 'url(' + coverImageUrl + ')');

    this.ui.product_craft_button.attr('disabled', false);

    // reset initial state
    this.$el.removeClass('loading success error');
    this.ui.product_details_container.removeClass('hide');
    this.ui.card_form_error.addClass('hide');
    this.ui.confirm_purchase_button.show();

    // hide all normal purchase UI
    this.ui.for_normal_purchase.addClass('hide');

    // set initial purchase type
    this._currentPurchaseType = 'gold';

    // show all purchase with gold UI
    this.ui.for_purchase_with_gold.removeClass('hide');

    this._showCurrentPurchaseType();
    this._bindProductPrice();
  },

  onBackgroundPressed: function (e) {
    if ($(e.target).hasClass('modal')) {
      this.onCancelConfirmPurchase();
    }
  },

  /* endregion SHOW / HIDE */

  /* region EVENTS */

  onQuantityChange: function (e) {
    var quantity = this.ui.quantity.val();
    var inventoryManager = InventoryManager.getInstance();

    if (quantity) {
      quantity = parseFloat(quantity);
      if (isNaN(quantity)) {
        quantity = 1;
        this._showInvalidQuantity('Quantity must be a number. e.g. 1');
      } else if (quantity <= 0) {
        quantity = Math.max(1, Math.floor(Math.abs(quantity)));
        this._showInvalidQuantity('Quantity must be positive. e.g. ' + quantity);
      } else if (Math.floor(quantity) !== quantity) {
        quantity = Math.floor(quantity);
        this._showInvalidQuantity('Quantity must be an integer. e.g. ' + quantity);
      } else if (this.productData != null && this.productData.sku === 'BLOODBORN_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingBloodbornPacks()) {
        this._showInvalidQuantity('You only need ' + inventoryManager.getRemainingBloodbornPacks() + ' more orbs to complete the Bloodbound set.');
      } else if (this.productData != null && this.productData.sku === 'ANCIENTBONDS_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingAncientBondsPacks()) {
        this._showInvalidQuantity('You only need ' + inventoryManager.getRemainingAncientBondsPacks() + ' more orbs to complete the Ancient Bonds set.');
      } else {
        this._showValidQuantity();
      }
    } else {
      quantity = 1;
      this._showValidQuantity();
    }

    if (this._quantity !== quantity) {
      this._quantity = quantity;
      this._bindProductPrice();
    }
  },

  _showInvalidQuantity: function (helpMessage) {
    this._hasValidQuantity = false;
    var tooltipData = this.ui.quantity.data('bs.tooltip');
    if (tooltipData == null || tooltipData.options.title !== helpMessage) {
      this.ui.quantity.tooltip('destroy').tooltip({ title: helpMessage || 'Invalid input', placement: 'right', trigger: 'manual' }).tooltip('show');
    }
    this._showCanPurchase();
  },

  _showValidQuantity: function () {
    this._hasValidQuantity = true;
    this.ui.quantity.closest('.form-group').removeClass('has-error');
    this.ui.quantity.tooltip('destroy');
    this._showCanPurchase();
  },

  _showCanPurchase: function () {
    if (this._hasValidQuantity && this._hasEnoughToPurchase) {
      this.ui.confirm_purchase_button.removeClass('disabled');
    } else {
      this.ui.confirm_purchase_button.addClass('disabled');
    }
  },

  _bindProductPrice: function () {
    var productData = this.productData;
    if (productData != null) {
      this.ui.product_price.html('');

      // gold cost
      var gold = productData.gold;
      if (gold != null && !isNaN(gold) && gold > 0) {
        this.ui.product_gold_cost.html('<strong>' + gold + '</strong> GOLD');
        if (InventoryManager.getInstance().walletModel.get('gold_amount') >= gold * this._quantity) {
          this._hasEnoughToPurchase = true;
        } else {
          this._hasEnoughToPurchase = false;
        }
      } else {
        this.ui.product_gold_cost.html('');
        this._hasEnoughToPurchase = false;
      }

      // spirit cost
      var spiritCost = productData.rarity_id ? SDK.RarityFactory.rarityForIdentifier(productData.rarity_id).spiritCostCosmetic : 0;
      if (spiritCost) {
        this.ui.product_spirit_cost.html(spiritCost + ' SPIRIT');
        this.ui.product_craft_button.removeClass('hide');
        if (InventoryManager.getInstance().walletModel.get('spirit_amount') < spiritCost) {
          this.ui.product_craft_button.attr('disabled', true);
        }
      } else {
        this.ui.product_spirit_cost.html('');
        this.ui.product_craft_button.addClass('hide');
      }

      this._showCanPurchase();
    }
  },

  onNavOptionSelected: function (e) {
    var $target = $(e.currentTarget);
    var purchaseType = $target.data('purchase-type');
    this.setPurchaseType(purchaseType);
  },

  setPurchaseType: function (purchaseType) {
    if (purchaseType != null && this._currentPurchaseType !== purchaseType) {
      this._currentPurchaseType = purchaseType;
      Storage.set('preferredPurchaseType', this._currentPurchaseType);

      // cleanup previous
      if (this._$currentPurchaseTypeNavItem != null) {
        this._$currentPurchaseTypeNavItem.removeClass('active');
      }
      if (this._$currentPurchaseTypeTab != null) {
        this._$currentPurchaseTypeTab.addClass('hide');
      }

      // show selected tab
      this._showCurrentPurchaseType();
    }
  },

  _showCurrentPurchaseType: function () {
    if (this._currentPurchaseType != null) {
      if (this.ui.confirm_purchase_nav instanceof $) {
        this._$currentPurchaseTypeNavItem = this.ui.confirm_purchase_nav.find('.nav-item[data-purchase-type=\'' + this._currentPurchaseType + '\']');
        this._$currentPurchaseTypeNavItem.addClass('active');
      }

      if (this.ui.nav_tabs instanceof $) {
        this._$currentPurchaseTypeTab = this.ui.nav_tabs.find('.nav-tab[data-purchase-type=\'' + this._currentPurchaseType + '\']');
        this._$currentPurchaseTypeTab.removeClass('hide');
      }
    }
  },

  onWalletChange: function () {
    this.ui.card_ending_digits.text(InventoryManager.getInstance().walletModel.get('card_last_four_digits'));
    this._bindProductPrice();
    this.ui.premium_amount.text(InventoryManager.getInstance().getWalletModelPremiumAmount());
  },

  /* endregion EVENTS */

  /* region PURCHASE */

  onConfirmPurchase: function (e, skipPurchaseLimitCheck) {
    var productData = this.productData;
    var attemptedPurchaseExceedsPurchaseLimit = productData.purchase_limit > 0 && ShopManager.getInstance().getAttemptedPurchaseCount(productData.sku) > 0;

    var quantity = this._quantity;
    var inventoryManager = InventoryManager.getInstance();
    if (this.productData != null && this.productData.sku === 'BLOODBORN_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingBloodbornPacks()) {
      // Ignore the confirmation, this is here for when player's press enter even though they have invalid quantity
      return;
    } else if (this.productData != null && this.productData.sku === 'ANCIENTBONDS_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingAncientBondsPacks()) {
      // Ignore the confirmation, this is here for when player's press enter even though they have invalid quantity
      return;
    }

    if (productData.gold != null) {
      return this._goldCheckout(productData);
    }
  },

  onCancelConfirmPurchase: function (e) {
    this.trigger('cancel');
  },

  /* endregion PURCHASE */

  /* region GOLD CHECKOUT */

  _goldCheckout: function (productData) {
    var sku = productData.sku;
    var gold = productData.gold || 0;
    var quantity = this._quantity;

    // make purchase
    var purchasePromise;
    if (gold != null && !isNaN(gold) && gold > 0) {
      // show loading
      this.$el.addClass('loading');

      this.trigger('processing', {
        sku: sku,
        paymentType: 'gold',
      });

      // product: individual boosters
      if (sku === 'BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Core, sku);
      } else if (sku === 'SHIMZAR_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Shimzar, sku);
      } else if (sku === 'BLOODBORN_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Bloodborn, sku);
      } else if (sku === 'ANCIENTBONDS_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Unity, sku);
      }
    }

    if (purchasePromise == null) {
      return Promise.resolve()
        .bind(this)
        .then(function () {
          this.showError('Invalid premium purchase!');
        });
    } else {
      return purchasePromise
        .bind(this)
        .then(function () {
          this.trigger('complete', {
            sku: sku,
            paymentType: 'gold',
          });

          this.flashSuccessInDialog('SUCCESS!');
        })
        .catch(function (errorMessage) {
          this.showError(errorMessage);
        });
    }
  },

  /* endregion GOLD CHECKOUT */

  /* region SUCCESS / ERROR */

  flashSuccessInDialog: function (successMessage, revert) {
    if (successMessage == null) { successMessage = 'SUCCESS!'; }
    this.ui.promptSuccessTitle.text(successMessage);
    this.$el.removeClass('loading error').addClass('success');
    this._successTriggerTimeoutId = setTimeout(function () {
      if (revert) {
        this.$el.removeClass('success');
      } else {
        this.trigger('success');
      }
    }.bind(this), 2000);
  },

  showError: function (errorMessage, close, noCreditCardError) {
    this.$el.removeClass('loading success').addClass('error');
    if (!noCreditCardError && this._currentPurchaseType === 'creditcard') {
      this.ui.card_form_error.removeClass('hide');
      this.ui.card_form_error_message.text(errorMessage);
    }
    this.ui.$errorMessage.text(errorMessage);
    this._errorRevertTimeoutId = setTimeout(function () {
      if (close) {
        this.onCancelConfirmPurchase();
      } else {
        this.$el.removeClass('error');
      }
    }.bind(this), 2000);
    this.trigger('error', errorMessage);
  },

  /* endregion SUCCESS / ERROR */

  /* region CRAFT */

  onCraftPressed: function (e) {
    var productData = this.productData;
    var productId = productData.id;
    var sku = productData.sku;

    this.$el.addClass('loading');
    this.ui.product_craft_button.addClass('hide');
    this.ui.card_form_error.addClass('hide');
    InventoryManager.getInstance().craftCosmetic(productId)
      .bind(this)
      .then(function () {
        this.trigger('complete', {
          sku: sku,
          paymentType: 'spirit',
        });

        this.flashSuccessInDialog('SUCCESS!');
      })
      .catch(function (errorMessage) {
        this.ui.product_craft_button.removeClass('hide');
        this.showError(errorMessage, false, true);
      });
  },

  /* endregion CRAFT */

  /* region CARD */

  onUpdateCard: function () {
    if (this.creditCardFormRegion == null) return;

    var cardFormView = new CreditCardFormView();
    this.creditCardFormRegion.show(cardFormView);
    Animations.fadeIn.call(cardFormView);
    this.ui.card_info.addClass('hide');
  },

  onDeleteCard: function () {
    if (this.creditCardFormRegion == null) return;

    this.$el.addClass('loading');
    var cardFormView = new CreditCardFormView();
    this.creditCardFormRegion.show(cardFormView);
    this.ui.card_info.addClass('hide');

    return Promise.resolve($.ajax({
      url: process.env.API_URL + '/api/me/shop/customer',
      type: 'DELETE',
      contentType: 'application/json',
      dataType: 'json',
    }))
      .bind(this)
      .then(function () {
        this.flashSuccessInDialog('SUCCESS!', true);
      })
      .catch(function (err) {
        var errorMessage = response.responseJSON && response.responseJSON.message || 'There was a problem deleting your card.';
        this.showError(errorMessage);
      });
  },

  /* endregion CARD */

  /* region HELP */

  onHelpPress: function (e) {
  },

  /* endregion HELP */

});

// Expose the class either via CommonJS or the global object
module.exports = PremiumPurchaseDialogView;
