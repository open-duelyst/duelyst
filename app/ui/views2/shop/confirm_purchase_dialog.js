// pragma PKGS: shop

'use strict';

var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var UtilsUI = require('app/common/utils/utils_ui');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var InventoryManager = require('app/ui/managers/inventory_manager');
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
var i18next = require('i18next');
var Session = require('app/common/session2');
var PremiumPurchaseDialog = require('app/ui/views2/shop/premium_purchase_dialog');
var _ = require('underscore');
var CreditCardFormView = require('./credit_card_form');

var Template = require('./templates/confirm_purchase_dialog.hbs');

var ConfirmPurchaseDialogView = Backbone.Marionette.ItemView.extend({

  id: 'confirm_purchase_dialog',
  className: 'modal prompt-modal',
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
    refill_premium_button: '.refill',
    refill_premium_msg: '.refill-premium-msg',
    balance_change_container: '.balance-change-container',
    balance_change_balance_label: '.balance-change-balance-label',
    balance_change_price_label: '.balance-change-price-label',
    balance_change_remaining_label: '.balance-change-remaining-label',
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
    product_type_name: '.product-type-name',
    product_price: '.product-price',
    product_spirit_cost: '.product-spirit-cost',
    product_gold_cost: '.product-gold-cost',
    product_craft_button: '.btn-craft',
    promptSuccessTitle: '.prompt-success .prompt-title',
    quantity: '.quantity',
  },

  /* Ui events hash */
  events: {
    'click .btn-update-card': 'onUpdateCard',
    'click .btn-delete-card': 'onDeleteCard',
    'click .confirm': 'onConfirmPurchase',
    'click .refill': 'onRefillPressed',
    'click .btn-craft': 'onCraftPressed',
    'click .cancel': 'onCancelConfirmPurchase',
    'click .btn-get-help': 'onHelpPress',
    'click .nav-item': 'onNavOptionSelected',
    click: 'onBackgroundPressed',
    'input input.quantity': 'onQuantityChange',
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
  paypalReceiptRef: null,
  productData: null,
  _hasEnoughToPurchase: true,
  _hasValidQuantity: true,
  _quantity: 1,

  templateHelpers: {
    isPaypalEnabled: function () {
      return ServerStatusManager.getInstance().serverStatusModel.get('paypal_enabled');
    },
  },

  /* region INITIALIZE */

  initialize: function (opts) {
    this.productData = opts && opts.productData;
    this.saleData = opts && opts.saleData;

    // Listen for PayPal 'cancel' event if the user closes PayPal window
    if (window.isDesktop) {
      // window.ipcRenderer.on('paypal-cancel', this.onCancelConfirmPurchase.bind(this))
    }
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
    if (window.isDesktop) {
      // this seems to not work since an 'off' function does not exist
      // window.ipcRenderer.off('paypal-cancel', this.onCancelConfirmPurchase.bind(this))
    }
    if (this.paypalReceiptRef) {
      this.paypalReceiptRef.off('child_added');
    }
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

    var productTypeName = null;
    if (productCategoryId != null && SDK.CosmeticsFactory.nameForCosmeticTypeId(productCategoryId)) {
      productTypeName = SDK.CosmeticsFactory.nameForCosmeticTypeId(productCategoryId);
    }

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
    if (productTypeName != null) {
      this.ui.product_type_name.removeClass('hide');
      this.ui.product_type_name.text(productTypeName);
    }
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
      this.ui.quantity.tooltip('destroy').tooltip({ title: helpMessage || i18next.t('common.generic_invalid_input_message'), placement: 'right', trigger: 'manual' }).tooltip('show');
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
    var saleData = this.saleData;
    if (productData != null) {
      this.ui.product_price.html('');

      // gold cost
      var gold = productData.gold;
      if (gold != null && !isNaN(gold) && gold > 0) {
        // Calculate per-Orb cost for purchases which contain more than one Orb.
        var perOrbCost = null;
        if (productData.qty > 1) {
          perOrbCost = gold / productData.qty;
          perOrbCost = perOrbCost.toFixed(0); // Trim decimal points.
        } else {
          perOrbCost = gold;
        }

        // Display the modal.
        const localizedCost = i18next.t('shop.confirm_purchase_dialog_orb_gold_cost', { gold_cost: perOrbCost });
        this.ui.product_gold_cost.html(localizedCost);
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
        this.ui.product_spirit_cost.html(spiritCost + ' ' + i18next.t('common.currency_spirit').toUpperCase());
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
    this.onPremiumCurrencyChange();
  },

  onPremiumCurrencyChange: function () {
    // No products have premium prices as of 1.97.5.
    /*
    if (this.productData && this.productData.price) {
      var price = this.productData.price;
      if (this.saleData && this.saleData.salePrice) {
        price = this.saleData.salePrice;
      }
      if (price > InventoryManager.getInstance().getWalletModelPremiumAmount()) {
        this.ui.confirm_purchase_button.addClass('hide');
        this.ui.refill_premium_button.removeClass('hide');
        this.ui.refill_premium_msg.removeClass('hide');
        this.ui.balance_change_container.addClass('hide');

        var premiumCurrencyNeededToPurchase = price - InventoryManager.getInstance().getWalletModelPremiumAmount();
        this.ui.refill_premium_msg.text(i18next.t('shop.premium_refill_needed_msg', { premium_needed: premiumCurrencyNeededToPurchase }));
      } else {
        this.ui.confirm_purchase_button.removeClass('hide');
        this.ui.refill_premium_button.addClass('hide');
        this.ui.refill_premium_msg.addClass('hide');
        this.ui.balance_change_container.removeClass('hide');

        this.ui.balance_change_balance_label.text('' + InventoryManager.getInstance().getWalletModelPremiumAmount());
        this.ui.balance_change_price_label.text('-' + price);
        this.ui.balance_change_remaining_label.text('' + (InventoryManager.getInstance().getWalletModelPremiumAmount() - price));
      }
    }
    */
  },

  /* endregion EVENTS */

  /* region PURCHASE */

  onRefillPressed: _.throttle(function (e) {
    // this.trigger("cancel");
    // NavigationManager.getInstance().showModalView(new PremiumPurchaseDialog());
  }, 1500, { trailing: false }),

  onConfirmPurchase: function (e, skipPurchaseLimitCheck) {
    var productData = this.productData;

    var saleData = this.saleData;
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
    var category = productData.category_id; // Purchase type e.g. "packs".
    var subCategory = productData.sub_category_name; // Set ID e.g. "Core Set".
    var quantity = productData.qty || this._quantity;

    if (gold == null || isNaN(gold) || gold === 0) {
      return Promise.resolve()
        .bind(this)
        .then(function () {
          this.showError(`Invalid gold cost (${gold})!`);
        });
    }

    // show loading
    this.$el.addClass('loading');
    this.trigger('processing', {
      sku: sku,
      paymentType: 'gold',
    });

    // set up purchase.
    var purchasePromise = null;

    // product: individual boosters
    if (category === 'packs') {
      // Determine which card set to use from the SDK.
      var cardSet = null;
      if (subCategory === 'Core Set') {
        // Duelyst Core Set.
        cardSet = SDK.CardSet.Core;
      } else if (subCategory === 'Shim\'Zar Set') {
        // Denizens of Shim'Zar.
        cardSet = SDK.CardSet.Shimzar;
      } else if (subCategory === 'Combined Set') {
        // Ancient Bonds.
        cardSet = SDK.CardSet.CombinedUnlockables;
      } else if (subCategory === 'Fatebound Set') {
        // Trials of Mythron.
        cardSet = SDK.CardSet.Coreshatter;
      } else if (subCategory === 'Immortal Vanguard Set') {
        // Immortal Vanguard.
        cardSet = SDK.CardSet.Wartech;
      } else if (subCategory === 'Unearthed Prophecy Set') {
        // Unearthed Prophecy.
        cardSet = SDK.CardSet.FirstWatch;
      } else {
        // Rise of the Bloodborn and Ancient Bonds sets are no longer purchaseable.
        // SDK.CardSet.Bloodborn.
        // SDK.CardSet.Unity.
        return Promise.reject(new Error('Unpurchaseable set'));
      }

      purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, cardSet, sku);
    } else {
      // TODO: Add support for bundles, emotes, etc.
      return Promise.resolve()
        .bind(this)
        .then(function () {
          this.showError(`Sorry, ${category} purchases are not yet enabled.`);
        });
    }

    return purchasePromise
      .bind(this)
      .then(function () {
        this.trigger('complete', {
          sku: sku,
          paymentType: 'gold',
        });
        this.flashSuccessInDialog(i18next.t('common.success_title'));
      })
      .catch(function (errorMessage) {
        this.showError(errorMessage);
      });
  },

  /* endregion GOLD CHECKOUT */

  /* region SUCCESS / ERROR */

  flashSuccessInDialog: function (successMessage, revert) {
    if (successMessage == null) { successMessage = i18next.t('common.success_title'); }
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

        this.flashSuccessInDialog(i18next.t('common.success_title'));
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
        this.flashSuccessInDialog(i18next.t('common.success_title'), true);
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
module.exports = ConfirmPurchaseDialogView;
