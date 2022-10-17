'use strict';

var Session = require('app/common/session2');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var SDK = require('app/sdk');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ChangeBattleMapItemViewTempl = require('app/ui/templates/item/change_battle_map_dialog.hbs');
var i18next = require('i18next');
var FormPromptDialogItemView = require('./form_prompt_dialog');

var ChangeBattleMapItemView = FormPromptDialogItemView.extend({

  id: 'app-change-battlemap',

  template: ChangeBattleMapItemViewTempl,

  _cosmeticId: null,
  tooltipElement: null,
  _tooltipTimeoutId: null,

  events: function () {
    return _.extend(FormPromptDialogItemView.prototype.events, {
      'click .clear-selection': 'onClearSelectedBattleMap',
    });
  },

  initialize: function () {
    this._bindCosmetics();
  },

  onShow: function () {
    FormPromptDialogItemView.prototype.onShow.apply(this, arguments);

    // listen to events
    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add remove', this.onCosmeticsCollectionChange);

    // show tooltip
    this.showTooltip(this.$el.find('.cosmetic:first'));
  },

  onRender: function () {
    FormPromptDialogItemView.prototype.onRender.apply(this, arguments);

    // highlight selected battlemap
    var battlemapId = ProfileManager.getInstance().get('battle_map_id');
    if (battlemapId != null) {
      this.$el.find('.cosmetic[data-cosmetic-id=\'' + battlemapId + '\']').addClass('active');
    } else {
      this.$el.find('.clear-selection').addClass('active');
    }
  },

  onPrepareForDestroy: function () {
    this.stopShowingTooltip();
  },

  onCosmeticsCollectionChange: function (cosmeticModel) {
    var cosmeticId = cosmeticModel != null && cosmeticModel.get('cosmetic_id');
    var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData != null && cosmeticData.typeId === SDK.CosmeticsTypeLookup.BattleMap) {
      this._bindCosmetics();
      this.render();
    }
  },

  _bindCosmetics: function () {
    // get all possible profile icons
    var cosmetics = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.BattleMap);
    var visibleCosmetics = [];
    for (var i = 0, il = cosmetics.length; i < il; i++) {
      var cosmeticData = cosmetics[i];
      var cosmeticId = cosmeticData.id;
      // filter for only usable cosmetics
      if (InventoryManager.getInstance().getCanSeeCosmeticById(cosmeticId)) {
        var cosmeticDataCopy = _.extend({}, cosmeticData);
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
      return NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
        .bind(this)
        .then(function () {
          NavigationManager.getInstance().showDialogView(new ChangeBattleMapItemView({ model: new Backbone.Model() }));
        })
        .catch(function () {
          NavigationManager.getInstance().showDialogView(new ChangeBattleMapItemView({ model: new Backbone.Model() }));
        });
    } else if (InventoryManager.getInstance().getCanUseCosmeticById(cosmeticId)) {
      this._cosmeticId = cosmeticId;
      FormPromptDialogItemView.prototype.onClickSubmit.apply(this, arguments);
    }
  },

  onClearSelectedBattleMap: function () {
    this._cosmeticId = null;
    this.onSubmit();
  },

  onSubmit: function () {
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

  showTooltip: function (element) {
    if (this.tooltipElement) {
      this.tooltipElement.tooltip('destroy');
    }
    this.tooltipElement = element;
    this._tooltipTimeoutId = setTimeout(function () {
      this._tooltipTimeoutId = null;
      this.tooltipElement.tooltip({
        container: '#app-change-battlemap',
        animation: false,
        html: true,
        title: '<p>' + i18next.t('game_setup.battle_map_choose_tooltip') + '</p>',
        template: '<div class=\'tooltip change-battlemap-popover\'><div class=\'tooltip-arrow\'></div><div class=\'tooltip-inner\'></div></div>',
        placement: 'left',
        trigger: 'manual',
      });
      this.tooltipElement.tooltip('show');
    }.bind(this), 1000);
  },

  stopShowingTooltip: function () {
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
