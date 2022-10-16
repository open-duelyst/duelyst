const Session = require('app/common/session2');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const SDK = require('app/sdk');
const InventoryManager = require('app/ui/managers/inventory_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const ChangePortraitItemViewTempl = require('app/ui/templates/item/change_portrait.hbs');
const FormPromptDialogItemView = require('./form_prompt_dialog');

var ChangePortraitItemView = FormPromptDialogItemView.extend({

  id: 'app-change-portrait',

  template: ChangePortraitItemViewTempl,

  _cosmeticId: null,

  initialize() {
    this._bindCosmetics();
  },

  onShow() {
    FormPromptDialogItemView.prototype.onShow.apply(this, arguments);

    // listen to events
    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add remove', this.onCosmeticsCollectionChange);
  },

  onCosmeticsCollectionChange(cosmeticModel) {
    const cosmeticId = cosmeticModel != null && cosmeticModel.get('cosmetic_id');
    const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData != null && cosmeticData.typeId === SDK.CosmeticsTypeLookup.ProfileIcon) {
      this._bindCosmetics();
      this.render();
    }
  },

  _bindCosmetics() {
    // get all possible profile icons
    const cosmetics = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.ProfileIcon);
    const visibleCosmetics = [];
    for (let i = 0, il = cosmetics.length; i < il; i++) {
      const cosmeticData = cosmetics[i];
      const cosmeticId = cosmeticData.id;
      // filter for only usable cosmetics
      if (InventoryManager.getInstance().getCanSeeCosmeticById(cosmeticId)) {
        let cosmeticDataCopy = _.extend({}, cosmeticData);
        // Copy any sale information
        const saleModel = ShopManager.getInstance().getActiveShopSaleModelForSku(cosmeticData.sku);
        if (saleModel != null) {
          cosmeticDataCopy = _.extend(cosmeticDataCopy, saleModel.attributes);
        }

        // mark enabled/purchasable
        cosmeticDataCopy._canUse = InventoryManager.getInstance().getCanUseCosmeticById(cosmeticId);
        cosmeticDataCopy._canPurchase = InventoryManager.getInstance().getCanPurchaseCosmeticById(cosmeticId);
        UtilsJavascript.arraySortedInsertByComparator(visibleCosmetics, cosmeticDataCopy, (a, b) => (Number(a._canUse) - Number(b._canUse)) || (b.id - a.id));
      }
    }

    // set as non-serialized property of model in case model is firebase
    this.model.set('_cosmetics', visibleCosmetics);
  },

  updateValidState() {
    this.isValid = this._cosmeticId != null;
  },

  onClickSubmit(event) {
    const cosmeticId = $(event.currentTarget).data('cosmetic-id');

    if (InventoryManager.getInstance().getCanPurchaseCosmeticById(cosmeticId)) {
      // buy profile icon
      const productData = SDK.CosmeticsFactory.cosmeticProductDataForIdentifier(cosmeticId);

      // Check for sales data
      const saleData = {};
      const saleId = $(event.currentTarget).data('sale-id');
      const salePriceStr = $(event.currentTarget).data('sale-price');

      if (saleId != null && saleId != '') {
        saleData.saleId = saleId;
      }
      if (salePriceStr != null && salePriceStr != '' && !_.isNaN(parseInt(salePriceStr))) {
        saleData.salePrice = parseInt(salePriceStr);
      }

      return NavigationManager.getInstance().showDialogForConfirmPurchase(productData, saleData)
        .bind(this)
        .then(() => {
          NavigationManager.getInstance().showDialogView(new ChangePortraitItemView({ model: new Backbone.Model() }));
        })
        .catch(() => {
          NavigationManager.getInstance().showDialogView(new ChangePortraitItemView({ model: new Backbone.Model() }));
        });
    } if (InventoryManager.getInstance().getCanUseCosmeticById(cosmeticId)) {
      this._cosmeticId = cosmeticId;
      FormPromptDialogItemView.prototype.onClickSubmit.apply(this, arguments);
    }
  },

  onSubmit() {
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
