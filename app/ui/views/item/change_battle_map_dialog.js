const Session = require('app/common/session2');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const SDK = require('app/sdk');
const InventoryManager = require('app/ui/managers/inventory_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const ChangeBattleMapItemViewTempl = require('app/ui/templates/item/change_battle_map_dialog.hbs');
const i18next = require('i18next');
const FormPromptDialogItemView = require('./form_prompt_dialog');

var ChangeBattleMapItemView = FormPromptDialogItemView.extend({

  id: 'app-change-battlemap',

  template: ChangeBattleMapItemViewTempl,

  _cosmeticId: null,
  tooltipElement: null,
  _tooltipTimeoutId: null,

  events() {
    return _.extend(FormPromptDialogItemView.prototype.events, {
      'click .clear-selection': 'onClearSelectedBattleMap',
    });
  },

  initialize() {
    this._bindCosmetics();
  },

  onShow() {
    FormPromptDialogItemView.prototype.onShow.apply(this, arguments);

    // listen to events
    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add remove', this.onCosmeticsCollectionChange);

    // show tooltip
    this.showTooltip(this.$el.find('.cosmetic:first'));
  },

  onRender() {
    FormPromptDialogItemView.prototype.onRender.apply(this, arguments);

    // highlight selected battlemap
    const battlemapId = ProfileManager.getInstance().get('battle_map_id');
    if (battlemapId != null) {
      this.$el.find(`.cosmetic[data-cosmetic-id='${battlemapId}']`).addClass('active');
    } else {
      this.$el.find('.clear-selection').addClass('active');
    }
  },

  onPrepareForDestroy() {
    this.stopShowingTooltip();
  },

  onCosmeticsCollectionChange(cosmeticModel) {
    const cosmeticId = cosmeticModel != null && cosmeticModel.get('cosmetic_id');
    const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData != null && cosmeticData.typeId === SDK.CosmeticsTypeLookup.BattleMap) {
      this._bindCosmetics();
      this.render();
    }
  },

  _bindCosmetics() {
    // get all possible profile icons
    const cosmetics = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.BattleMap);
    const visibleCosmetics = [];
    for (let i = 0, il = cosmetics.length; i < il; i++) {
      const cosmeticData = cosmetics[i];
      const cosmeticId = cosmeticData.id;
      // filter for only usable cosmetics
      if (InventoryManager.getInstance().getCanSeeCosmeticById(cosmeticId)) {
        const cosmeticDataCopy = _.extend({}, cosmeticData);
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
      return NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
        .bind(this)
        .then(() => {
          NavigationManager.getInstance().showDialogView(new ChangeBattleMapItemView({ model: new Backbone.Model() }));
        })
        .catch(() => {
          NavigationManager.getInstance().showDialogView(new ChangeBattleMapItemView({ model: new Backbone.Model() }));
        });
    } if (InventoryManager.getInstance().getCanUseCosmeticById(cosmeticId)) {
      this._cosmeticId = cosmeticId;
      FormPromptDialogItemView.prototype.onClickSubmit.apply(this, arguments);
    }
  },

  onClearSelectedBattleMap() {
    this._cosmeticId = null;
    this.onSubmit();
  },

  onSubmit() {
    FormPromptDialogItemView.prototype.onSubmit.apply(this, arguments);

    this.stopShowingTooltip();

    Session.changeBattlemap(this._cosmeticId)
      .bind(this)
      .then(function (res) {
        this.onSuccess(res);
      })
      .catch(function (e) {
      // onError expects a string not an actual error
        this.onError(e.innerMessage || e.message);
      });
  },

  showTooltip(element) {
    if (this.tooltipElement) {
      this.tooltipElement.tooltip('destroy');
    }
    this.tooltipElement = element;
    this._tooltipTimeoutId = setTimeout(() => {
      this._tooltipTimeoutId = null;
      this.tooltipElement.tooltip({
        container: '#app-change-battlemap',
        animation: false,
        html: true,
        title: `<p>${i18next.t('game_setup.battle_map_choose_tooltip')}</p>`,
        template: '<div class=\'tooltip change-battlemap-popover\'><div class=\'tooltip-arrow\'></div><div class=\'tooltip-inner\'></div></div>',
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

});

// Expose the class either via CommonJS or the global object
module.exports = ChangeBattleMapItemView;
