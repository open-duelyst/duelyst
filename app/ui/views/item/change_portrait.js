'use strict';

var Session = require('app/common/session2');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var SDK = require('app/sdk');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ChangePortraitItemViewTempl = require('app/ui/templates/item/change_portrait.hbs');
var FormPromptDialogItemView = require('./form_prompt_dialog');

var ChangePortraitItemView = FormPromptDialogItemView.extend({

  id: 'app-change-portrait',

  template: ChangePortraitItemViewTempl,

  _cosmeticId: null,

  initialize: function () {
    this._bindCosmetics();
  },

  onShow: function () {
    FormPromptDialogItemView.prototype.onShow.apply(this, arguments);

    // listen to events
    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add remove', this.onCosmeticsCollectionChange);
  },

  onCosmeticsCollectionChange: function (cosmeticModel) {
    var cosmeticId = cosmeticModel != null && cosmeticModel.get('cosmetic_id');
    var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData != null && cosmeticData.typeId === SDK.CosmeticsTypeLookup.ProfileIcon) {
      this._bindCosmetics();
      this.render();
    }
  },

  _bindCosmetics: function () {
    // get all possible profile icons
    var cosmetics = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.ProfileIcon);
    var visibleCosmetics = [];
    for (var i = 0, il = cosmetics.length; i < il; i++) {
      var cosmeticData = cosmetics[i];
      var cosmeticId = cosmeticData.id;
      // filter for only usable cosmetics
      if (InventoryManager.getInstance().getCanSeeCosmeticById(cosmeticId)) {
        var cosmeticDataCopy = _.extend({}, cosmeticData);
        // Copy any sale information
        var saleModel = ShopManager.getInstance().getActiveShopSaleModelForSku(cosmeticData.sku);
        if (saleModel != null) {
          cosmeticDataCopy = _.extend(cosmeticDataCopy, saleModel.attributes);
        }

        // mark enabled/purchasable
        cosmeticDataCopy._canUse = InventoryManager.getInstance().getCanUseCosmeticById(cosmeticId);
        cosmeticDataCopy._canPurchase = InventoryManager.getInstance().getCanPurchaseCosmeticById(cosmeticId);
        UtilsJavascript.arraySortedInsertByComparator(visibleCosmetics, cosmeticDataCopy, function (a, b) {
          return (Number(a._canUse) - Number(b._canUse)) || (b.id - a.id);
        });
      }
    }

    // set as non-serialized property of model in case model is firebase
    this.model.set('_cosmetics', visibleCosmetics);
  },

  updateValidState: function () {
    this.isValid = this._cosmeticId != null;
  },

  onClickSubmit: function (event) {
    var cosmeticId = $(event.currentTarget).data('cosmetic-id');

    if (InventoryManager.getInstance().getCanPurchaseCosmeticById(cosmeticId)) {
      // buy profile icon
      var productData = SDK.CosmeticsFactory.cosmeticProductDataForIdentifier(cosmeticId);

      // Check for sales data
      var saleData = {};
      var saleId = $(event.currentTarget).data('sale-id');
      var salePriceStr = $(event.currentTarget).data('sale-price');

      if (saleId != null && saleId != '') {
        saleData.saleId = saleId;
      }
      if (salePriceStr != null && salePriceStr != '' && !_.isNaN(parseInt(salePriceStr))) {
        saleData.salePrice = parseInt(salePriceStr);
      }

      return NavigationManager.getInstance().showDialogForConfirmPurchase(productData, saleData)
        .bind(this)
        .then(function () {
          NavigationManager.getInstance().showDialogView(new ChangePortraitItemView({ model: new Backbone.Model() }));
        })
        .catch(function () {
          NavigationManager.getInstance().showDialogView(new ChangePortraitItemView({ model: new Backbone.Model() }));
        });
    } else if (InventoryManager.getInstance().getCanUseCosmeticById(cosmeticId)) {
      this._cosmeticId = cosmeticId;
      FormPromptDialogItemView.prototype.onClickSubmit.apply(this, arguments);
    }
  },

  onSubmit: function () {
    FormPromptDialogItemView.prototype.onSubmit.apply(this, arguments);
    Session.changePortrait(this._cosmeticId)
      .bind(this)
      .then(function (res) {
        this.onSuccess(res);
      })
      .catch(function (e) {
      // onError expects a string not an actual error
        this.onError(e.innerMessage || e.message);
      });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ChangePortraitItemView;
