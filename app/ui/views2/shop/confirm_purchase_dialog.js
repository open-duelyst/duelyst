// pragma PKGS: shop

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsUI = require('app/common/utils/utils_ui');
const audio_engine = require('app/audio/audio_engine');
const Animations = require('app/ui/views/animations');
const InventoryManager = require('app/ui/managers/inventory_manager');
const EVENTS = require('app/common/event_types');
const ServerStatusManager = require('app/ui/managers/server_status_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const ShopManager = require('app/ui/managers/shop_manager');
const PackageManager = require('app/ui/managers/package_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const Analytics = require('app/common/analytics');
const moment = require('moment');
const Logger = require('app/common/logger');
const Storage = require('app/common/storage');
const Promise = require('bluebird');
const openUrl = require('app/common/openUrl');
const i18next = require('i18next');
const Session = require('app/common/session2');
const PremiumPurchaseDialog = require('app/ui/views2/shop/premium_purchase_dialog.js');
const _ = require('underscore');
const CreditCardFormView = require('./credit_card_form');

const Template = require('./templates/confirm_purchase_dialog.hbs');

const ConfirmPurchaseDialogView = Backbone.Marionette.ItemView.extend({

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
    isPaypalEnabled() {
      return ServerStatusManager.getInstance().serverStatusModel.get('paypal_enabled');
    },
    isSteam() {
      return window.isSteam;
    },
    hasSufficientPremiumCurrency() {
      if (this.productData != null) {
        if (this.saleData != null) {
          return InventoryManager.getInstance().getWalletModelPremiumAmount() > this.saleData.salePrice;
        }
        return InventoryManager.getInstance().getWalletModelPremiumAmount() > this.productData.price;
      }
      // Shouldn't happen
      return true;
    },
  },

  /* region INITIALIZE */

  initialize(opts) {
    this.productData = opts && opts.productData;
    this.saleData = opts && opts.saleData;

    // Listen for PayPal 'cancel' event if the user closes PayPal window
    if (window.isDesktop) {
      // window.ipcRenderer.on('paypal-cancel', this.onCancelConfirmPurchase.bind(this))
    }
  },

  /* endregion INITIALIZE */

  /* region MARIONETTE EVENTS */

  onRender() {
    this.creditCardFormRegion = new Backbone.Marionette.Region({
      el: '#card_form_region',
    });
    this._showCurrentPurchaseType();
    this.onWalletChange();
    if (this._animationSpriteData != null) {
      this._animationGLData = UtilsUI.showCocosSprite(this.ui.product_animation_sprite, this._animationGLData, this._animationSpriteData, null, true, null, this._animationStartSpriteData);
    }
  },

  onShow() {
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

  onDestroy() {
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

  _invalidateAndUnloadLoadedPackages() {
    if (this._loadedPkgId != null) {
      this._loadedPkgValid = false;
      PackageManager.getInstance().unloadMajorMinorPackage(this._loadedPkgId);
      this._loadedPkgId = this._loadedPkgPromise = null;
    }
  },

  _releaseAnimation() {
    if (this._animationGLData != null) {
      UtilsUI.resetCocosSprite(this._animationGLData);
      this._animationGLData = this._animationSpriteData = this._animationStartSpriteData = null;
    }
  },

  /* region MARIONETTE EVENTS */

  /* region SHOW / HIDE */

  showWithProductInfo(productData) {
    // reset previous
    const previousProductData = this.productData;
    if (previousProductData != null) {
      this.ui.product_details_container.removeClass(previousProductData.category_id || '');
    }
    this._invalidateAndUnloadLoadedPackages();
    this._releaseAnimation();
    this._showValidQuantity();
    this._quantity = 1;

    // store new
    this.productData = productData;
    const productId = this.productData.id;
    const productSku = this.productData.sku;
    const productName = this.productData.name || '';
    const productDescription = this.productData.description || '';
    const productCategoryId = this.productData.category_id || '';

    let productTypeName = null;
    if (productCategoryId != null && SDK.CosmeticsFactory.nameForCosmeticTypeId(productCategoryId)) {
      productTypeName = SDK.CosmeticsFactory.nameForCosmeticTypeId(productCategoryId);
    }

    const coverImageResource = RSX[this.productData.cover_image_resource_name];
    let coverImageUrl;
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

    this.ui.product_details_container.addClass(`${productCategoryId} ${productSku}`);
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
    const iconImageResource = RSX[this.productData.icon_image_resource_name];
    let iconImageUrl;
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
    this.ui.product_cover_image.css('background-image', `url(${coverImageUrl})`);

    this.ui.product_craft_button.attr('disabled', false);

    // reset initial state
    this.$el.removeClass('loading success error');
    this.ui.product_details_container.removeClass('hide');
    this.ui.card_form_error.addClass('hide');
    this.ui.confirm_purchase_button.show();

    if (this.productData.price != null) {
      // hide all purchase with gold UI
      this.ui.for_purchase_with_gold.addClass('hide');

      // show all normal purchase UI
      this.ui.for_normal_purchase.removeClass('hide');

      // set initial purchase type
      const purchaseType = 'premium';
      this._currentPurchaseType = purchaseType;

      // update credit card data
      if (InventoryManager.getInstance().walletModel.get('card_last_four_digits')) {
        // empty out the credit card form and show credit card data
        if (this.creditCardFormRegion != null) {
          this.creditCardFormRegion.empty();
          this.ui.card_info.removeClass('hide');
        }
      } else {
        // show credit card form
        if (this.creditCardFormRegion != null) {
          const cardFormView = new CreditCardFormView();
          this.creditCardFormRegion.show(cardFormView);
          this.ui.card_info.addClass('hide');
        }
      }
    } else {
      // hide all normal purchase UI
      this.ui.for_normal_purchase.addClass('hide');

      // set initial purchase type
      this._currentPurchaseType = 'gold';

      if (InventoryManager.getInstance().walletModel.get('gold_amount') < productData.gold * 2) {
        // if we have gold for only one of this products, just buy it
        this._goldCheckout(productData);
      } else {
        // show all purchase with gold UI
        this.ui.for_purchase_with_gold.removeClass('hide');
      }
    }

    this._showCurrentPurchaseType();
    this._bindProductPrice();
  },

  onBackgroundPressed(e) {
    if ($(e.target).hasClass('modal')) {
      this.onCancelConfirmPurchase();
    }
  },

  /* endregion SHOW / HIDE */

  /* region EVENTS */

  onQuantityChange(e) {
    let quantity = this.ui.quantity.val();
    const inventoryManager = InventoryManager.getInstance();

    if (quantity) {
      quantity = parseFloat(quantity);
      if (isNaN(quantity)) {
        quantity = 1;
        this._showInvalidQuantity('Quantity must be a number. e.g. 1');
      } else if (quantity <= 0) {
        quantity = Math.max(1, Math.floor(Math.abs(quantity)));
        this._showInvalidQuantity(`Quantity must be positive. e.g. ${quantity}`);
      } else if (Math.floor(quantity) !== quantity) {
        quantity = Math.floor(quantity);
        this._showInvalidQuantity(`Quantity must be an integer. e.g. ${quantity}`);
      } else if (this.productData != null && this.productData.sku === 'BLOODBORN_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingBloodbornPacks()) {
        this._showInvalidQuantity(`You only need ${inventoryManager.getRemainingBloodbornPacks()} more orbs to complete the Bloodbound set.`);
      } else if (this.productData != null && this.productData.sku === 'ANCIENTBONDS_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingAncientBondsPacks()) {
        this._showInvalidQuantity(`You only need ${inventoryManager.getRemainingAncientBondsPacks()} more orbs to complete the Ancient Bonds set.`);
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

  _showInvalidQuantity(helpMessage) {
    this._hasValidQuantity = false;
    const tooltipData = this.ui.quantity.data('bs.tooltip');
    if (tooltipData == null || tooltipData.options.title !== helpMessage) {
      this.ui.quantity.tooltip('destroy').tooltip({ title: helpMessage || i18next.t('common.generic_invalid_input_message'), placement: 'right', trigger: 'manual' }).tooltip('show');
    }
    this._showCanPurchase();
  },

  _showValidQuantity() {
    this._hasValidQuantity = true;
    this.ui.quantity.closest('.form-group').removeClass('has-error');
    this.ui.quantity.tooltip('destroy');
    this._showCanPurchase();
  },

  _showCanPurchase() {
    if (this._hasValidQuantity && this._hasEnoughToPurchase) {
      this.ui.confirm_purchase_button.removeClass('disabled');
    } else {
      this.ui.confirm_purchase_button.addClass('disabled');
    }
  },

  _bindProductPrice() {
    const { productData } = this;
    const { saleData } = this;
    if (productData != null) {
      // price
      let { price } = productData;
      if (saleData != null && saleData.salePrice != null) {
        price = saleData.salePrice;
      }
      if (price != null && !isNaN(price) && price > 0) {
        this.ui.product_gold_cost.html('');
        this.ui.product_price.html(i18next.t('shop.confirm_purchase_dialog_premium_price', { price }));
        this._hasEnoughToPurchase = true;
      } else {
        this.ui.product_price.html('');

        // gold cost
        const { gold } = productData;
        if (gold != null && !isNaN(gold) && gold > 0) {
          this.ui.product_gold_cost.html(i18next.t('shop.confirm_purchase_dialog_orb_gold_cost', { gold_cost: gold }));
          if (InventoryManager.getInstance().walletModel.get('gold_amount') >= gold * this._quantity) {
            this._hasEnoughToPurchase = true;
          } else {
            this._hasEnoughToPurchase = false;
          }
        } else {
          this.ui.product_gold_cost.html('');
          this._hasEnoughToPurchase = false;
        }
      }

      // spirit cost
      const spiritCost = productData.rarity_id ? SDK.RarityFactory.rarityForIdentifier(productData.rarity_id).spiritCostCosmetic : 0;
      if (spiritCost) {
        this.ui.product_spirit_cost.html(`${spiritCost} ${i18next.t('common.currency_spirit').toUpperCase()}`);
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

  onNavOptionSelected(e) {
    const $target = $(e.currentTarget);
    const purchaseType = $target.data('purchase-type');
    this.setPurchaseType(purchaseType);
  },

  setPurchaseType(purchaseType) {
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

  _showCurrentPurchaseType() {
    if (this._currentPurchaseType != null) {
      if (this.ui.confirm_purchase_nav instanceof $) {
        this._$currentPurchaseTypeNavItem = this.ui.confirm_purchase_nav.find(`.nav-item[data-purchase-type='${this._currentPurchaseType}']`);
        this._$currentPurchaseTypeNavItem.addClass('active');
      }

      if (this.ui.nav_tabs instanceof $) {
        this._$currentPurchaseTypeTab = this.ui.nav_tabs.find(`.nav-tab[data-purchase-type='${this._currentPurchaseType}']`);
        this._$currentPurchaseTypeTab.removeClass('hide');
      }
    }
  },

  onWalletChange() {
    this.ui.card_ending_digits.text(InventoryManager.getInstance().walletModel.get('card_last_four_digits'));
    this._bindProductPrice();
    this.onPremiumCurrencyChange();
  },

  onPremiumCurrencyChange() {
    if (this.productData && this.productData.price) {
      let { price } = this.productData;
      if (this.saleData && this.saleData.salePrice) {
        price = this.saleData.salePrice;
      }
      if (price > InventoryManager.getInstance().getWalletModelPremiumAmount()) {
        this.ui.confirm_purchase_button.addClass('hide');
        this.ui.refill_premium_button.removeClass('hide');
        this.ui.refill_premium_msg.removeClass('hide');
        this.ui.balance_change_container.addClass('hide');

        const premiumCurrencyNeededToPurchase = price - InventoryManager.getInstance().getWalletModelPremiumAmount();
        this.ui.refill_premium_msg.text(i18next.t('shop.premium_refill_needed_msg', { premium_needed: premiumCurrencyNeededToPurchase }));
      } else {
        this.ui.confirm_purchase_button.removeClass('hide');
        this.ui.refill_premium_button.addClass('hide');
        this.ui.refill_premium_msg.addClass('hide');
        this.ui.balance_change_container.removeClass('hide');

        this.ui.balance_change_balance_label.text(`${InventoryManager.getInstance().getWalletModelPremiumAmount()}`);
        this.ui.balance_change_price_label.text(`-${price}`);
        this.ui.balance_change_remaining_label.text(`${InventoryManager.getInstance().getWalletModelPremiumAmount() - price}`);
      }
    }
  },

  /* endregion EVENTS */

  /* region PURCHASE */

  onRefillPressed: _.throttle((e) => {
    // if (!window.isSteam) {
    //   Session.initPremiumPurchase()
    //   .then(function (url) {
    //     if (window.isDesktop) {
    //       window.ipcRenderer.send('create-window', {
    //         url: url,
    //         width: 920,
    //         height: 660
    //       })
    //     } else {
    //       openUrl(url)
    //     }
    //   })
    // } else {
    //   this.trigger("cancel");
    //   NavigationManager.getInstance().showModalView(new PremiumPurchaseDialog());
    // }
  }, 1500, { trailing: false }),

  onConfirmPurchase(e, skipPurchaseLimitCheck) {
    const { productData } = this;

    const { saleData } = this;
    const attemptedPurchaseExceedsPurchaseLimit = productData.purchase_limit > 0 && ShopManager.getInstance().getAttemptedPurchaseCount(productData.sku) > 0;

    const quantity = this._quantity;
    const inventoryManager = InventoryManager.getInstance();
    if (this.productData != null && this.productData.sku === 'BLOODBORN_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingBloodbornPacks()) {
      // Ignore the confirmation, this is here for when player's press enter even though they have invalid quantity
      return;
    } if (this.productData != null && this.productData.sku === 'ANCIENTBONDS_BOOSTER1_GOLD' && quantity > inventoryManager.getRemainingAncientBondsPacks()) {
      // Ignore the confirmation, this is here for when player's press enter even though they have invalid quantity
      return;
    }

    if (productData.price != null) {
      return this._premiumCheckout(productData, saleData);
    } if (productData.gold != null) {
      return this._goldCheckout(productData);
    }
  },

  onCancelConfirmPurchase(e) {
    this.trigger('cancel');
  },

  /* endregion PURCHASE */

  /* region NORMAL CHECKOUT */

  _normalCheckout(productData) {
    const { sku } = productData;
    const price = productData.price || 0;

    // make purchase
    let purchasePromise;
    if (price != null && !isNaN(price) && price > 0) {
      // show loading
      this.$el.addClass('loading');
      this.ui.card_form_error.addClass('hide');

      let submitCreditCardPromise;
      if (this.creditCardFormRegion != null && this.creditCardFormRegion.currentView != null) {
        // submit credit card and wait for response
        submitCreditCardPromise = this.creditCardFormRegion.currentView.submit()
          .bind(this)
          .then(function (cardFormResponse) {
            this.creditCardFormRegion.empty();
            this.ui.card_info.removeClass('hide');
            return cardFormResponse.stored ? null : cardFormResponse.token;
          });
      } else {
        // use saved credit card
        if (InventoryManager.getInstance().walletModel.get('card_last_four_digits')) {
          this.ui.card_ending_digits.text(InventoryManager.getInstance().walletModel.get('card_last_four_digits'));
        }
        submitCreditCardPromise = Promise.resolve();
      }

      purchasePromise = submitCreditCardPromise
        .bind(this)
        .then(function (cardToken) {
          this.trigger('processing', {
            sku,
            paymentType: 'stripe',
          });

          return InventoryManager.getInstance().purchaseProductSku(sku, cardToken);
        });
    }

    if (purchasePromise == null) {
      return Promise.resolve()
        .bind(this)
        .then(function () {
          this.showError('Invalid purchase!');
        });
    }
    return purchasePromise
      .then(function () {
        // track monetization in analytics
        Analytics.track('premium product purchased', {
          category: Analytics.EventCategory.Shop,
          sku,
          price,
        }, {
          labelKey: 'sku',
          valueKey: 'price',
        });
        // Analytics.trackMonetizationEvent(sku, price);

        this.trigger('complete', {
          sku,
          paymentType: 'stripe',
        });

        this.flashSuccessInDialog('SUCCESS!');
      })
      .catch(function (errorMessage) {
        this.showError(errorMessage);
      });
  },

  /* endregion NORMAL CHECKOUT */

  /* region PREMIUM CHECKOUT */

  _premiumCheckout(productData, saleData) {
    const { sku } = productData;
    let price = productData.price || 0;

    if (saleData != null && saleData.salePrice != null) {
      price = saleData.salePrice;
    }

    // make purchase
    let purchasePromise;
    if (price != null && !isNaN(price) && price > 0) {
      // show loading
      this.$el.addClass('loading');
      this.ui.card_form_error.addClass('hide');

      purchasePromise = InventoryManager.getInstance().purchaseProductWithPremiumCurrency(sku, saleData);
    }

    if (purchasePromise == null) {
      return Promise.resolve()
        .bind(this)
        .then(function () {
          this.showError('Invalid purchase!');
        });
    }
    return purchasePromise
      .bind(this)
      .then(function () {
        // track monetization in analytics
        Analytics.track('premium product purchased', {
          category: Analytics.EventCategory.Shop,
          sku,
          price,
        }, {
          labelKey: 'sku',
          valueKey: 'price',
        });
        // Analytics.trackMonetizationEvent(sku, price);

        this.trigger('complete', {
          sku,
          paymentType: 'premium',
        });

        this.flashSuccessInDialog('SUCCESS!');
      })
      .catch((errorMessage) => {
        this.showError(errorMessage);
      });
  },

  /* endregion PREMIUM CHECKOUT */

  /* region GOLD CHECKOUT */

  _goldCheckout(productData) {
    const { sku } = productData;
    const gold = productData.gold || 0;
    const quantity = this._quantity;

    // make purchase
    let purchasePromise;
    if (gold != null && !isNaN(gold) && gold > 0) {
      // show loading
      this.$el.addClass('loading');

      this.trigger('processing', {
        sku,
        paymentType: 'gold',
      });

      // product: individual boosters
      if (sku === 'BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Core);
      } else if (sku === 'SHIMZAR_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Shimzar);
      } else if (sku === 'BLOODBORN_BOOSTER1_GOLD') {
        // purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Bloodborn);
        return Promise.reject(new Error('Unpurchaseable set'));
      } else if (sku === 'ANCIENTBONDS_BOOSTER1_GOLD') {
        // purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Unity);
        return Promise.reject(new Error('Unpurchaseable set'));
      } else if (sku === 'FIRSTWATCH_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.FirstWatch);
      } else if (sku === 'WARTECH_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Wartech);
      } else if (sku === 'COMBINED_UNLOCKABLES_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.CombinedUnlockables);
      } else if (sku === 'FATE_BOOSTER1_GOLD') {
        purchasePromise = InventoryManager.getInstance().buyBoosterPacksWithGold(quantity, SDK.CardSet.Coreshatter);
      }
    }

    if (purchasePromise == null) {
      return Promise.resolve()
        .bind(this)
        .then(function () {
          this.showError('Invalid purchase!');
        });
    }
    return purchasePromise
      .bind(this)
      .then(function () {
        this.trigger('complete', {
          sku,
          paymentType: 'gold',
        });

        this.flashSuccessInDialog(i18next.t('common.success_title'));
      })
      .catch(function (errorMessage) {
        this.showError(errorMessage);
      });
  },

  /* endregion GOLD CHECKOUT */

  /* region STEAM CHECKOUT */

  _steamCheckout(productData) {
    const { sku } = productData;

    // track in analytics
    Analytics.track('product selected', {
      category: Analytics.EventCategory.Shop,
      product_id: sku,
    }, {
      labelKey: 'product_id',
    });

    this.$el.addClass('loading');

    // if (sku === "STARTERBUNDLE_201604") {
    //   ProfileManager.getInstance().set("has_tried_purchase_starter_bundle",true);
    // }
    ShopManager.getInstance().markAttemptedPurchase(sku);

    this.trigger('processing', {
      sku,
      paymentType: 'steam',
    });

    return InventoryManager.getInstance().purchaseProductSkuOnSteam(sku, Storage.get('steam_ticket'))
      .bind(this)
      .then(function (res) {
      // open [steam] browser then flash success
      // check platform here to determine if to use steam browser
        if (window.steamworksOverlayEnabled) {
          window.steamworks.activateGameOverlayToWebPage(res.steamurl);
        } else {
          openUrl(res.steamurl);
        }

        this.trigger('complete', {
          sku,
          paymentType: 'steam',
        });

        this.flashSuccessInDialog('Complete the transaction in the browser...');
      })
      .catch(function (errorMessage) {
        this.showError(errorMessage);
      });
  },

  /* endregion STEAM CHECKOUT */

  /* region SUCCESS / ERROR */

  flashSuccessInDialog(successMessage, revert) {
    if (successMessage == null) { successMessage = i18next.t('common.success_title'); }
    this.ui.promptSuccessTitle.text(successMessage);
    this.$el.removeClass('loading error').addClass('success');
    this._successTriggerTimeoutId = setTimeout(() => {
      if (revert) {
        this.$el.removeClass('success');
      } else {
        this.trigger('success');
      }
    }, 2000);
  },

  showError(errorMessage, close, noCreditCardError) {
    this.$el.removeClass('loading success').addClass('error');
    if (!noCreditCardError && this._currentPurchaseType === 'creditcard') {
      this.ui.card_form_error.removeClass('hide');
      this.ui.card_form_error_message.text(errorMessage);
    }
    this.ui.$errorMessage.text(errorMessage);
    this._errorRevertTimeoutId = setTimeout(() => {
      if (close) {
        this.onCancelConfirmPurchase();
      } else {
        this.$el.removeClass('error');
      }
    }, 2000);
    this.trigger('error', errorMessage);
  },

  /* endregion SUCCESS / ERROR */

  /* region CRAFT */

  onCraftPressed(e) {
    const { productData } = this;
    const productId = productData.id;
    const { sku } = productData;

    this.$el.addClass('loading');
    this.ui.product_craft_button.addClass('hide');
    this.ui.card_form_error.addClass('hide');
    InventoryManager.getInstance().craftCosmetic(productId)
      .bind(this)
      .then(function () {
        this.trigger('complete', {
          sku,
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

  onUpdateCard() {
    if (this.creditCardFormRegion == null) return;

    const cardFormView = new CreditCardFormView();
    this.creditCardFormRegion.show(cardFormView);
    Animations.fadeIn.call(cardFormView);
    this.ui.card_info.addClass('hide');
  },

  onDeleteCard() {
    if (this.creditCardFormRegion == null) return;

    this.$el.addClass('loading');
    const cardFormView = new CreditCardFormView();
    this.creditCardFormRegion.show(cardFormView);
    this.ui.card_info.addClass('hide');

    return Promise.resolve($.ajax({
      url: `${process.env.API_URL}/api/me/shop/customer`,
      type: 'DELETE',
      contentType: 'application/json',
      dataType: 'json',
    }))
      .bind(this)
      .then(function () {
        this.flashSuccessInDialog(i18next.t('common.success_title'), true);
      })
      .catch(function (err) {
        const errorMessage = response.responseJSON && response.responseJSON.message || 'There was a problem deleting your card.';
        this.showError(errorMessage);
      });
  },

  /* endregion CARD */

  /* region HELP */

  onHelpPress(e) {
  },

  /* endregion HELP */

});

// Expose the class either via CommonJS or the global object
module.exports = ConfirmPurchaseDialogView;
