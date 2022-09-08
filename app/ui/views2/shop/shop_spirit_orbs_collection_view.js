// pragma PKGS: shop

const _ = require('underscore');
const moment = require('moment');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const ShopData = require('app/data/shop.json');
const audio_engine = require('app/audio/audio_engine');
const SDK = require('app/sdk');
const NavigationManager = require('app/ui/managers/navigation_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const ShopManager = require('app/ui/managers/shop_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const ZodiacSymbolModel = require('app/ui/models/zodiac_symbol');
const openUrl = require('app/common/openUrl');
const i18next = require('i18next');
const Template = require('./templates/shop_spirit_orbs_collection_view.hbs');

const ShopSpiritOrbsCollectionView = Backbone.Marionette.ItemView.extend({

  className: 'shop-spirit-orbs-container',
  selectedSubCategory: null,
  initialSubCategory: null,
  template: Template,
  tooltipElement: null,
  events: {
    'click button': 'onSelectProduct',
    'click .nav-tabs li': 'onSubCategoryChanged',
    'click .card-set-link-out-btn': 'onClickCardSetLinkOut',
  },

  /* ui selector cache */
  ui: {
    BOOSTER1_GOLD: 'li.BOOSTER1_GOLD',
    STARTERBUNDLE_201604: 'li.STARTERBUNDLE_201604',
    productForGoldButtons: '.product-for-gold .btn-buy',
    spiritOrbProducts: '.shop-spirit-orbs',
    tabs: '.nav-tabs',
    tabBody: '.tab-body',
    cardSetLinkOutLabel: '.card-set-link-out-label',
    cardSetLinkOutBtn: '.card-set-link-out-btn',
  },

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));

    let packProductsData = {};
    const shopKeysToDisplay = this.getShopKeysToDisplay(model);
    for (var i = 0; i < shopKeysToDisplay.length; i++) {
      const includedShopDatas = ShopData[shopKeysToDisplay[i]];
      if (includedShopDatas != null) {
        packProductsData = _.extend(packProductsData, includedShopDatas);
      }
    }

    // add pack products in sets
    // var packProductsData = ShopData["packs"];
    const packProductKeys = Object.keys(packProductsData);
    const packProductSetsByCardSet = {};
    const packProductSets = [];
    // var cardSetKeys = Object.keys(SDK.CardSet);
    const cardSetKeys = ['Core', 'Shimzar', 'CombinedUnlockables', 'FirstWatch', 'Wartech', 'Coreshatter'];
    for (var i = 0, il = cardSetKeys.length; i < il; i++) {
      const cardSetKey = cardSetKeys[i];
      var cardSetId = SDK.CardSet[cardSetKey];
      var cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
      if (cardSetData != null && cardSetData.enabled) {
        var packProductSet = {
          name: (cardSetData.devName || cardSetData.name).toLocaleLowerCase(),
          title: cardSetData.name || cardSetData.title,
          cardSetId,
          packProducts: [],
        };
        packProductSetsByCardSet[cardSetId] = packProductSet;
        packProductSets.push(packProductSet);
      }
    }
    for (var i = 0, il = packProductKeys.length; i < il; i++) {
      const packProductKey = packProductKeys[i];
      const packProductData = packProductsData[packProductKey];
      const packProductCardSet = packProductData.card_set || SDK.CardSet.Core;
      var packProductSet = packProductSetsByCardSet[packProductCardSet];

      packProductData.purchase_count = ShopManager.getInstance().getPurchaseCount(packProductData.sku);
      // packProductData.attempted_purchase_count = ShopManager.getInstance().getAttemptedPurchaseCount(packProductData.sku)
      packProductData.is_purchase_limit_reached = (packProductData.purchase_limit > 0 && packProductData.purchase_count >= packProductData.purchase_limit);
      packProductData.set_id = packProductCardSet;
      packProductData.localized_name = i18next.t(`shop.${packProductData.name}`, { count: packProductData.qty });

      packProductData.set_is_complete = false;
      if (!InventoryManager.getInstance().canBuyPacksForCardSet(packProductCardSet)) {
        packProductData.set_is_complete = true;
      }

      if (packProductSet != null
        && !packProductData.is_purchase_limit_reached
        // && (packProductData.sku !== "STARTERBUNDLE_201604" || !ProfileManager.getInstance().get("has_purchased_starter_bundle"))
      ) {
        packProductSet.packProducts.push(packProductData);
      }
    }

    // Remove any pack product sets that are empty
    const nonEmptyPackProductSets = _.filter(packProductSets, (packProductSet) => packProductSet.packProducts != null && packProductSet.packProducts.length != 0);

    // Set Initial sub category by availability
    if (nonEmptyPackProductSets[0] != null) {
      var { cardSetId } = nonEmptyPackProductSets[0];
      var cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
      if (!this.initialSubCategory) {
        this.initialSubCategory = cardSetData.devName;
      }
    }

    data.packProductSets = nonEmptyPackProductSets;

    return data;
  },

  initialize(opts) {
    if (opts.selectedCardSetTab != null) {
      this.initialSubCategory = opts.selectedCardSetTab;
    } else {
      const cardSetId = SDK.CardSet.Core;
      const cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
      this.initialSubCategory = cardSetData.devName;
    }
    this.listenTo(ShopManager.getInstance().productPurchaseCountsModel, 'change', this.onPurchaseCountsChanged);
  },

  onRender() {
    this.onWalletChange();
    this.updateZodiacSymbols();
  },

  onResize() {
    this.updateZodiacSymbols();
  },

  onShow() {
    this.listenTo(InventoryManager.getInstance().walletModel, 'change', this.onWalletChange);
    this.onWalletChange();
    this.listenTo(InventoryManager.getInstance().totalOrbCountModel, 'change', this.onTotalOrbCountChange);
    this.setSubCategory(this.initialSubCategory);
  },

  onPrepareForDestroy() {
    this.stopShowingTooltip();
  },

  showTooltip(element) {
    // Destroy old tooltip and tooltip timeout to make sure only new one displays
    this.stopShowingTooltip();

    let title = `<p>${i18next.t('shop.orb_contents_instructions')}</p>`;
    if (this.selectedSubCategory != null) {
      const cardSetData = SDK.CardSetFactory.cardSetForDevName(this.selectedSubCategory);
      if (cardSetData != null && cardSetData.isUnlockableThroughOrbs) {
        title = `<p>${i18next.t('shop.eyos_orb_contents_instructions', { card_set_name: cardSetData.name })}</p>`;
        if (!InventoryManager.getInstance().canBuyPacksForCardSet(cardSetData.id)) {
          title = `<p>${i18next.t('shop.eyos_orb_set_complete_message', { card_set_name: cardSetData.name })}</p>`;
          this.bloodbornTooltipElement = $(`div.${cardSetData.devName}`, this.ui.tabBody).find('li:first');
        }
      }
    }
    this.tooltipElement = element;
    this._tooltipTimeoutId = setTimeout(() => {
      this._tooltipTimeoutId = null;
      this.tooltipElement.tooltip({
        container: '.shop-layout',
        animation: false,
        html: true,
        title,
        template: '<div class=\'tooltip spirit-orb-product-popover\'><div class=\'tooltip-arrow\'></div><div class=\'tooltip-inner\'></div></div>',
        placement: 'left',
        trigger: 'manual',
      });
      this.tooltipElement.tooltip('show');
    }, 1000);
  },

  stopShowingTooltip() {
    if (this._tooltipTimeoutId != null) {
      clearTimeout(this._tooltipTimeoutId);
      this._tooltipTimeoutId = null;
    }
    if (this.tooltipElement) {
      this.tooltipElement.tooltip('destroy');
    }
  },

  showFullsetTooltip() {
    return;
    // Destroy old tooltip and tooltip timeout to make sure only new one displays
    this.stopShowingFullsetTooltip();

    const selectedCardSetData = SDK.CardSetFactory.cardSetForDevName(this.selectedSubCategory);

    if (selectedCardSetData == null || !InventoryManager.getInstance().canBuyPacksForCardSet(selectedCardSetData.id)) {
      return;
    }

    let title = '';

    if (InventoryManager.getInstance().canBuyBloodbornPacks(selectedCardSetData.id)) {
      title = `<p>${i18next.t('shop.eyos_orb_refund_message', { card_set_name: selectedCardSetData.name })}</p>`;
      this.bloodbornTooltipElement = $(`div.${selectedCardSetData.devName}`, this.ui.tabBody).find('li:last');
    }

    this._bloodbornTooltipTimeoutId = setTimeout(() => {
      this._bloodbornTooltipTimeoutId = null;
      this.bloodbornTooltipElement.tooltip({
        container: '.shop-layout',
        animation: false,
        html: true,
        title,
        template: '<div class=\'tooltip spirit-orb-product-popover\'><div class=\'tooltip-arrow\'></div><div class=\'tooltip-inner\'></div></div>',
        placement: 'bottom',
        trigger: 'manual',
      });
      this.bloodbornTooltipElement.tooltip('show');
    }, 1000);
  },

  stopShowingFullsetTooltip() {
    if (this._bloodbornTooltipTimeoutId != null) {
      clearTimeout(this._bloodbornTooltipTimeoutId);
      this._bloodbornTooltipTimeoutId = null;
    }
    if (this.bloodbornTooltipElement) {
      this.bloodbornTooltipElement.tooltip('destroy');
    }
  },

  onWalletChange() {
    const goldInWallet = InventoryManager.getInstance().walletModel.get('gold_amount');
    this.ui.productForGoldButtons.each((index, el) => {
      const $el = $(el);
      const gold = parseInt($el.data('gold'));
      if (goldInWallet < gold) {
        $el.addClass('disabled');
      } else {
        // Rare case, and this prevents us being able to disable purchase buttons for other reasons
        // $el.removeClass("disabled");
      }
    });
  },

  onTotalOrbCountChange() {
    // if (!InventoryManager.getInstance().canBuyBloodbornPacks()) {
    //  // Typical UI Flow is players should only disable this way, should not need to enable
    //  var $bloodbornPurchaseButtons = this.$el.find('[data-card-set='+ SDK.CardSet.Bloodborn +']');
    //  $bloodbornPurchaseButtons.addClass("disabled");
    // }
    //
    // if (!InventoryManager.getInstance().canBuyAncientBondsPacks()) {
    //  // Typical UI Flow is players should only disable this way, should not need to enable
    //  var $unityPurchaseButtons = this.$el.find('[data-card-set='+ SDK.CardSet.Unity +']');
    //  $unityPurchaseButtons.addClass("disabled");
    // }
  },

  updateZodiacSymbols() {
    const $canvases = this.$el.find('.zodiac-symbol-canvas');
    this._zodiacModels || (this._zodiacModels = []);

    $canvases.each((i, canvas) => {
      const $canvas = $(canvas);
      const $btn = $canvas.closest('.btn');
      let zodiacModel = this._zodiacModels[i];
      if (!zodiacModel) {
        // setup new zodiac symbol
        zodiacModel = this._zodiacModels[i] = new ZodiacSymbolModel({ canvas });
        zodiacModel.listenTo(this, 'destroy', zodiacModel.stopDrawing.bind(zodiacModel));
      } else {
        // provide canvas to zodiac symbol
        zodiacModel.setCanvas(canvas);
      }

      // listen to button mouse input
      $btn.on('mouseover', zodiacModel.startDrawing.bind(zodiacModel));
      $btn.on('mouseout', zodiacModel.stopDrawing.bind(zodiacModel));

      // always draw once
      zodiacModel.draw();
    });
  },

  /* region PURCHASE */

  onSelectProduct(e) {
    const productSku = $(e.currentTarget).data('product-sku');

    let productData;
    const displayedProductKeys = this.getShopKeysToDisplay();
    // Search displayed product keys for product data
    for (let i = 0; i < displayedProductKeys.length; i++) {
      productData = ShopData[displayedProductKeys[i]][productSku];
      if (productData != null) {
        break;
      }
    }

    if (productData == null) {
      console.warn('Error in ShopSpiritOrbsCollectionView:onSelectProduct - No product data found');
      return;
    }

    let packProductData = _.extend({
      cover_image_url: 'resources/play/play_mode_rankedladder.jpg',
    }, productData);
    // Localize name and description
    packProductData = _.extend(packProductData, {
      name: i18next.t(`shop.${packProductData.name}`, { count: packProductData.qty }),
      description: i18next.t(`shop.${packProductData.description}`),
    });
    if (packProductData.icon_image_resource_name == null) {
      packProductData.icon_image_url = RSX.shop_1_orb.img;
    }

    const saleData = {};

    const saleModel = ShopManager.getInstance().getActiveShopSaleModelForSku(productSku);

    // From here on, the sale information should operate only on passed through information, otherwise sales could expire mid flow
    if (saleModel != null) {
      saleData.salePrice = saleModel.get('sale_price');
      saleData.saleId = saleModel.get('sale_id');
    }
    console.log(saleData);

    return NavigationManager.getInstance().showDialogForConfirmPurchase(packProductData, saleData)
      .bind(this)
      .then(function (purchaseData) {
        this.onPurchaseComplete(purchaseData);
      })
      .catch(() => {
        // do nothing on cancel
      });
  },

  onPurchaseComplete(purchaseData) {
  },

  /* endregion PURCHASE */

  onSubCategoryChanged(e) {
    const button = $(e.currentTarget);
    const selectedValue = button.data('value');
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
    this.setSubCategory(selectedValue);
  },

  onClickCardSetLinkOut(e) {
    let url = 'https://cards.duelyst.com/';

    const selectedCardSetData = SDK.CardSetFactory.cardSetForDevName(this.selectedSubCategory);
    if (selectedCardSetData != null && selectedCardSetData.cardSetUrl != null) {
      url = selectedCardSetData.cardSetUrl;
      // Skip hero image
      url += '#lyonar';
    }

    openUrl(url);
  },

  setSubCategory(selectedValue) {
    if (selectedValue !== this.selectedSubCategory) {
      this.selectedSubCategory = selectedValue;
      $('li', this.ui.tabs).removeClass('active');
      this.ui.tabs.find(`[data-value='${selectedValue}']`).addClass('active');

      $('div.shop-spirit-orbs', this.ui.tabBody).addClass('hide');
      $(`div.${selectedValue}`, this.ui.tabBody).removeClass('hide');

      // show tooltip
      this.showTooltip($(`div.${selectedValue}`, this.ui.tabBody).find('li:first'));

      const selectedCardSetData = SDK.CardSetFactory.cardSetForDevName(this.selectedSubCategory);

      if (selectedCardSetData.isUnlockableThroughOrbs) {
        this.showFullsetTooltip();
      } else {
        this.stopShowingFullsetTooltip();
      }

      this.ui.cardSetLinkOutBtn.addClass('hide');
      if (!selectedCardSetData.isPreRelease && selectedCardSetData.cardSetUrl) {
        this.ui.cardSetLinkOutLabel.text(i18next.t('shop.view_cards_in_set', { setName: selectedCardSetData.name }));
        _.defer(() => {
          if (this._zodiacModels != null) {
            _.each(this._zodiacModels, (zodiacModel) => {
              zodiacModel.generateStartPoints();
              zodiacModel.generateDestinationPoints();
              zodiacModel.draw();
            });
          }
          this.ui.cardSetLinkOutBtn.removeClass('hide');
        });
      }
    }
  },

  onPurchaseCountsChanged(e) {
    if (ShopManager.getInstance().getPurchaseCount(ShopData.packs.STARTERBUNDLE_201604.sku) > 0 && this.ui.STARTERBUNDLE_201604) {
      this.ui.STARTERBUNDLE_201604.hide();
    }
  },

  getShopKeysToDisplay(model) {
    if (model == null) {
      model = this.model;
    }

    let shopKeysToDisplay = model.get('shopKeysToDisplay');
    if (shopKeysToDisplay == null || shopKeysToDisplay.length == 0) {
      shopKeysToDisplay = ['packs'];
    }
    return shopKeysToDisplay;
  },

});

module.exports = ShopSpiritOrbsCollectionView;
