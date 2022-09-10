// pragma PKGS: shop

const _ = require('underscore');
const moment = require('moment');
const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const RSX = require('app/data/resources');
const PackageManager = require('app/ui/managers/package_manager');
const GameDataManager = require('app/ui/managers/game_data_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const ShopManager = require('app/ui/managers/shop_manager');
const UtilsUI = require('app/common/utils/utils_ui');

const Template = require('./templates/shop_product_view.hbs');

const ShopProductItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'shop-product-item',
  template: Template,

  ui: {
    product_item_container: '.product-item-container',
    product_icon: '.product-icon',
    product_animation: '.product-animation',
    product_animation_sprite: '.product-animation .sprite',
  },

  events: {
    'click .product-item-container': 'onProductSelected',
  },

  _animationGLData: null,
  _animationSpriteData: null,
  _loadedPkgId: null,
  _loadedPkgPromise: null,
  _loadedPkgValid: false,

  serializeModel(model) {
    let data = model.toJSON.apply(model, _.rest(arguments));
    data.spirit_cost = data.rarity_id ? SDK.RarityFactory.rarityForIdentifier(data.rarity_id).spiritCostCosmetic : 0;
    const saleModel = ShopManager.getInstance().getActiveShopSaleModelForSku(data.sku);

    // From here on, the sale information should operate only on passed through information, otherwise sales could expire mid flow
    if (saleModel != null) {
      data = _.extend(data, saleModel.attributes);

      data.price = saleModel.get('sale_price');
    }
    return data;
  },

  onRender() {
    this.bindProductImage();
    if (this.model.get('is_purchased') || this.isBundlePurchased()) {
      this.$el.addClass('purchased');
    }
  },

  bindProductImage() {
    const productCategoryId = this.model.get('category_id') || '';
    this.ui.product_item_container.addClass(productCategoryId);

    this._releaseAnimation();

    /*
    var animResource = this.model.get("anim_resource");
    var animName = animResource && (animResource.breathing || animResource.idle);
    if (animName != null) {
      this.$el.hide();
      this.ui.product_icon.hide();
      this.ui.product_animation.show();
      if (this._loadedPkgId == null) {
        this._loadedPkgValid = true;
        this._loadedPkgId = this.model.get("id") + UtilsJavascript.generateIncrementalId();
        this._loadedPkgPromise = PackageManager.getInstance().loadMinorPackage(this._loadedPkgId, [RSX[animName]]);
      }
      var loadingPkgId = this._loadedPkgId;
      this._loadedPkgPromise.then(function () {
        if (!this._loadedPkgValid || loadingPkgId !== this._loadedPkgId) return; // product has changed
        this.$el.show();
        this._animationSpriteData = UtilsUI.getCocosSpriteData(animName);
        this._animationGLData = UtilsUI.showCocosSprite(this.ui.product_animation_sprite, this._animationGLData, this._animationSpriteData, null, true);
      }.bind(this));
    } else {
    */
    const iconImageResource = RSX[this.model.get('icon_image_resource_name')];
    let iconImageUrl;
    if (iconImageResource != null) {
      iconImageUrl = iconImageResource.is16Bit ? iconImageResource.img : RSX.getResourcePathForScale(iconImageResource.img, CONFIG.resourceScaleCSS);
    } else {
      iconImageUrl = RSX.getResourcePathForScale(this.model.get('icon_image_url'), CONFIG.resourceScaleCSS);
    }
    this.$el.show();
    this.ui.product_animation.hide();
    this.ui.product_icon.show().attr('src', iconImageUrl);
    // }
  },

  onShow() {
    const index = this.$el.index();
    const delay = (index + (0.5 - Math.random()) * 2.0) / 10;
    this.$el.css('animation-delay', `${delay}s`);

    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add', this.onCosmeticAddedToCollection);
  },

  onDestroy() {
    this._invalidateAndUnloadLoadedPackages();
    this._releaseAnimation();
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
      this._animationGLData = this._animationSpriteData = null;
    }
  },

  onCosmeticAddedToCollection(cosmeticModel) {
    // if this product represents a single item that has just been added or the bundle isBundlePurchased method resolves true
    if (cosmeticModel.get('cosmetic_id') === this.model.get('id') || this.isBundlePurchased()) {
      this.model.set('is_purchased', true);
      this.$el.addClass('purchased');
    }
  },

  isBundlePurchased() {
    if (this.model.get('type') === 'cosmetics_bundle') {
      const cosmeticsInBundle = this.model.get('bundle_cosmetic_ids');
      return _.reduce(cosmeticsInBundle, (memo, bundleCosmeticId) => memo && InventoryManager.getInstance().getCosmeticsCollection().find((c) => c.get('cosmetic_id') === bundleCosmeticId), true);
    }
    return false;
  },

  onProductSelected(e) {
    const saleData = {};
    const saleId = $(e.currentTarget).data('sale-id');
    const salePriceStr = $(e.currentTarget).data('sale-price');

    if (saleId != null && saleId != '') {
      saleData.saleId = saleId;
    }
    if (salePriceStr != null && salePriceStr != '' && !_.isNaN(parseInt(salePriceStr))) {
      saleData.salePrice = parseInt(salePriceStr);
    }
    // var gold = parseInt($el.data("gold"));

    if (!this.model.get('is_purchased') && !this.isBundlePurchased()) {
      this.trigger('select_product', saleData);
    }
  },

});

module.exports = ShopProductItemView;
