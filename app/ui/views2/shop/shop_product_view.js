// pragma PKGS: shop

'use strict';

var _ = require('underscore');
var moment = require('moment');
var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var RSX = require('app/data/resources');
var PackageManager = require('app/ui/managers/package_manager');
var GameDataManager = require('app/ui/managers/game_data_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var ShopManager = require('app/ui/managers/shop_manager');
var UtilsUI = require('app/common/utils/utils_ui');

var Template = require('./templates/shop_product_view.hbs');

var ShopProductItemView = Backbone.Marionette.ItemView.extend({

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

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    data.spirit_cost = data.rarity_id ? SDK.RarityFactory.rarityForIdentifier(data.rarity_id).spiritCostCosmetic : 0;
    var saleModel = ShopManager.getInstance().getActiveShopSaleModelForSku(data.sku);

    // From here on, the sale information should operate only on passed through information, otherwise sales could expire mid flow
    if (saleModel != null) {
      data = _.extend(data, saleModel.attributes);

      data.price = saleModel.get('sale_price');
    }
    return data;
  },

  onRender: function () {
    this.bindProductImage();
    if (this.model.get('is_purchased') || this.isBundlePurchased()) {
      this.$el.addClass('purchased');
    }
  },

  bindProductImage: function () {
    var productCategoryId = this.model.get('category_id') || '';
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
    var iconImageResource = RSX[this.model.get('icon_image_resource_name')];
    var iconImageUrl;
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

  onShow: function () {
    var index = this.$el.index();
    var delay = (index + (0.5 - Math.random()) * 2.0) / 10;
    this.$el.css('animation-delay', delay + 's');

    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add', this.onCosmeticAddedToCollection);
  },

  onDestroy: function () {
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
      this._animationGLData = this._animationSpriteData = null;
    }
  },

  onCosmeticAddedToCollection: function (cosmeticModel) {
    // if this product represents a single item that has just been added or the bundle isBundlePurchased method resolves true
    if (cosmeticModel.get('cosmetic_id') === this.model.get('id') || this.isBundlePurchased()) {
      this.model.set('is_purchased', true);
      this.$el.addClass('purchased');
    }
  },

  isBundlePurchased: function () {
    if (this.model.get('type') === 'cosmetics_bundle') {
      var cosmeticsInBundle = this.model.get('bundle_cosmetic_ids');
      return _.reduce(cosmeticsInBundle, function (memo, bundleCosmeticId) {
        return memo && InventoryManager.getInstance().getCosmeticsCollection().find(function (c) { return c.get('cosmetic_id') === bundleCosmeticId; });
      }, true);
    } else {
      return false;
    }
  },

  onProductSelected: function (e) {
    var saleData = {};
    var saleId = $(e.currentTarget).data('sale-id');
    var salePriceStr = $(e.currentTarget).data('sale-price');

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
