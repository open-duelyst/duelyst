// pragma PKGS: game

'use strict';

var SDK = require('app/sdk');
var _ = require('underscore');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var EmotesListCompositeView = require('app/ui/views/composite/emotes-list');
var MyPlayerPopoverLayoutTempl = require('app/ui/templates/layouts/game_my_player_popover.hbs');
var TransitionRegion = require('app/ui/views/regions/transition');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var i18next = require('i18next');
var PlayerPopoverLayout = require('./game_player_popover');

var MyPlayerPopoverLayout = PlayerPopoverLayout.extend({

  className: 'player-popover my-player',

  template: MyPlayerPopoverLayoutTempl,

  regions: {
    emotesListRegion: { selector: '.emotes-list-region', regionClass: TransitionRegion },
    emotesTextListRegion: { selector: '.emotes-text-list-region' },
    emoteRegion: { selector: '.emote-region', regionClass: TransitionRegion },
  },

  events: {
    'click .emote-category': 'onSelectEmoteCategory',
    'click .next-page': 'onSelectNextPage',
    'click .previous-page': 'onSelectPreviousPage',
  },

  ui: {
    $playerPopoverContainer: '.player-popover-container',
    $emoteCategoryButtons: '.emote-category',
    $previousPageButton: '.previous-page',
    $nextPageButton: '.next-page',
  },

  _emoteCollectionsByCategoryId: null,
  _emotesWithTextAlwaysVisibleCollection: null,

  _categoryId: null,
  _categoryPageIndex: 0,

  _emoteSentAt: 0,

  /* region INITIALIZE */

  initialize: function () {
    // setup collections
    this._emoteCollectionsByCategoryId = {};
    this._emotesWithTextAlwaysVisibleCollection = new Backbone.Collection();
    this._emotesWithTextAlwaysVisibleCollection.comparator = 'order';

    // get categories
    var categories = [];
    for (var categoryName in SDK.EmoteCategory) {
      // add category
      var categoryId = SDK.EmoteCategory[categoryName];
      var name = i18next.t('battle.emote_category_' + categoryName.toLowerCase());
      categories.push({ id: categoryId, name: categoryName });

      // initialize emotes collection for category
      var emoteCollection = new Backbone.Collection();
      emoteCollection.comparator = function (a, b) {
        return (InventoryManager.getInstance().hasCosmeticById(b.get('id')) - InventoryManager.getInstance().hasCosmeticById(a.get('id'))) || (a.get('order') - b.get('order')) || (a.get('id') - b.get('id'));
      };
      this._emoteCollectionsByCategoryId[categoryId] = emoteCollection;
    }
    categories = _.sortBy(categories, 'id');
    this.model.set('categories', categories);

    // update collections
    this._updateEmoteCollections();
  },

  /* endregion INITIALIZE */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    this._updateCategories();
  },

  onShow: function () {
    // show always visible text only emotes
    var emotesListCompositeView = new EmotesListCompositeView({ collection: this._emotesWithTextAlwaysVisibleCollection });
    emotesListCompositeView.listenTo(emotesListCompositeView, 'childview:select', this.onSelectEmote.bind(this));
    this.emotesTextListRegion.show(emotesListCompositeView);

    // set initial category
    this.setCategory(SDK.EmoteCategory.Default);
  },

  /* endregion MARIONETTE EVENTS */

  /* region CATEGORY */

  onSelectEmoteCategory: function (event) {
    var $target = $(event.target);
    var categoryId = $target.data('categoryid');

    // play effect
    audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    this.setCategory(categoryId);
  },

  setCategory: function (categoryId, pageIndex) {
    if (this._categoryId !== categoryId) {
      // swap category
      this._categoryId = categoryId;
      this._categoryPageIndex = null;
      this._updateCategories();
    }

    // check page index
    if (pageIndex == null) { pageIndex = 0; }
    if (this._categoryPageIndex !== pageIndex) {
      // get emotes for category
      var emoteCollection = this._emoteCollectionsByCategoryId[categoryId];
      var pagesInCategory = Math.ceil(emoteCollection.length / CONFIG.MAX_EMOTES_PER_PAGE);

      // clamp page index
      pageIndex = Math.max(0, Math.min(pagesInCategory - 1, pageIndex));
      this._categoryPageIndex = pageIndex;

      // get emote models on page
      var emoteStartIndex = this._categoryPageIndex * CONFIG.MAX_EMOTES_PER_PAGE;
      var emoteEndIndex = emoteStartIndex + CONFIG.MAX_EMOTES_PER_PAGE;
      var emoteModelsOnPage = emoteCollection.slice(emoteStartIndex, emoteEndIndex);

      // show emotes
      var emotesListCompositeView = new EmotesListCompositeView({ collection: new Backbone.Collection(emoteModelsOnPage) });
      emotesListCompositeView.listenTo(emotesListCompositeView, 'childview:select', this.onSelectEmote.bind(this));
      this.emotesListRegion.show(emotesListCompositeView);

      // show/hide pagination buttons
      if (this._categoryPageIndex > 0) {
        this.ui.$previousPageButton.show();
      } else {
        this.ui.$previousPageButton.show();
      }
      if (this._categoryPageIndex < pagesInCategory - 1) {
        this.ui.$nextPageButton.show();
      } else {
        this.ui.$nextPageButton.show();
      }
    }
  },

  _updateCategories: function () {
    if (this.ui.$emoteCategoryButtons instanceof $) {
      this.ui.$emoteCategoryButtons.each(function (index, element) {
        var $emoteCategoryButton = $(element);
        var categoryId = $emoteCategoryButton.data('categoryid');
        // make the current category active
        if (categoryId === this._categoryId) {
          $emoteCategoryButton.addClass('active');
        } else {
          $emoteCategoryButton.removeClass('active');
        }

        // disable categories with no emotes
        if (this._emoteCollectionsByCategoryId[categoryId].length === 0) {
          $emoteCategoryButton.addClass('disabled');
        } else {
          $emoteCategoryButton.removeClass('disabled');
        }
      }.bind(this));
    }
  },

  /* endregion CATEGORY */

  /* region PAGINATION */

  onSelectNextPage: function () {
    this.showNextPage();
  },

  showNextPage: function (fromCategoryId, fromPageIndex, _attemptedCategoryIds) {
    if (fromCategoryId == null) { fromCategoryId = this._categoryId; }
    if (fromPageIndex == null) { fromPageIndex = this._categoryPageIndex; }
    var categoryId = fromCategoryId;
    var emoteCollection = this._emoteCollectionsByCategoryId[categoryId];
    var pagesInCategory = Math.ceil(emoteCollection.length / CONFIG.MAX_EMOTES_PER_PAGE);
    var targetPageIndex = fromPageIndex + 1;
    if (targetPageIndex > pagesInCategory - 1) {
      // next page takes us into next category
      var categories = this.model.get('categories');
      var index;
      for (var i = 0, il = categories.length; i < il; i++) {
        if (categories[i].id === categoryId) {
          index = i;
          break;
        }
      }
      categoryId = categories[(index + 1) % categories.length].id;
      targetPageIndex = 0;
    }

    // play effect
    audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    if (this._emoteCollectionsByCategoryId[categoryId].length === 0) {
      // skip categories with no emotes
      if (_attemptedCategoryIds == null) { _attemptedCategoryIds = []; }
      if (!_.contains(_attemptedCategoryIds, categoryId)) {
        _attemptedCategoryIds.push(categoryId);
        this.showNextPage(categoryId, targetPageIndex, _attemptedCategoryIds);
      }
    } else {
      this.setCategory(categoryId, targetPageIndex);
    }
  },

  onSelectPreviousPage: function () {
    this.showPreviousPage();
  },

  showPreviousPage: function (fromCategoryId, fromPageIndex, _attemptedCategoryIds) {
    if (fromCategoryId == null) { fromCategoryId = this._categoryId; }
    if (fromPageIndex == null) { fromPageIndex = this._categoryPageIndex; }
    var categoryId = fromCategoryId;
    var targetPageIndex = fromPageIndex - 1;
    if (targetPageIndex < 0) {
      // previous page takes us into previous category
      var categories = this.model.get('categories');
      var index;
      for (var i = 0, il = categories.length; i < il; i++) {
        if (categories[i].id === categoryId) {
          index = i;
          break;
        }
      }
      categoryId = categories[(index - 1 < 0 ? categories.length - 1 : index - 1)].id;
      targetPageIndex = Math.ceil(this._emoteCollectionsByCategoryId[categoryId].length / CONFIG.MAX_EMOTES_PER_PAGE) - 1;
    }

    // play effect
    audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    if (this._emoteCollectionsByCategoryId[categoryId].length === 0) {
      // skip categories with no emotes
      if (_attemptedCategoryIds == null) { _attemptedCategoryIds = []; }
      if (!_.contains(_attemptedCategoryIds, categoryId)) {
        _attemptedCategoryIds.push(categoryId);
        this.showPreviousPage(categoryId, targetPageIndex);
      }
    } else {
      this.setCategory(categoryId, targetPageIndex);
    }
  },

  /* endregion PAGINATION */

  /* region EMOTES */

  _updateEmoteCollections: function () {
    // get all emotes
    var emotesData = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.Emote);

    // get all default text only emotes
    var emotesWithTextModels = [];
    for (var i = 0, il = emotesData.length; i < il; i++) {
      var emoteData = emotesData[i];
      if (emoteData.enabled && emoteData.category == SDK.EmoteCategory.Default && emoteData.title != null && emoteData.img == null) {
        var emoteModel = new Backbone.Model(emoteData);
        emoteModel.set('_canUse', true);
        emoteModel.set('_canPurchase', false);
        emotesWithTextModels.push(emoteModel);
      }
    }

    // reset text emotes
    this._emotesWithTextAlwaysVisibleCollection.reset(emotesWithTextModels);

    // get non-default non-text emotes
    var emoteModelsByCategoryId = {};
    var addEmoteToCategory = function (emoteData, categoryId, canUse, canPurchase) {
      var emoteModel = new Backbone.Model(emoteData);
      emoteModel.set('_canUse', canUse);
      emoteModel.set('_canPurchase', canPurchase);

      if (canPurchase) {
        var saleModel = ShopManager.getInstance().getActiveShopSaleModelForSku(emoteData.sku);
        if (saleModel != null) {
          emoteModel.set('sale_id', saleModel.get('sale_id'));
          emoteModel.set('sale_price', saleModel.get('sale_price'));
          emoteModel.set('sale_discount_percent', saleModel.get('sale_discount_percent'));
        }
      }

      var emoteModels = emoteModelsByCategoryId[categoryId];
      if (emoteModels == null) {
        emoteModels = emoteModelsByCategoryId[categoryId] = [];
      }
      emoteModels.push(emoteModel);
    };
    for (var i = 0, il = emotesData.length; i < il; i++) {
      var emoteData = emotesData[i];
      var emoteId = emoteData.id;
      if (this._emotesWithTextAlwaysVisibleCollection.get(emoteId) == null) {
        var categoryId = emoteData.category;
        if (this.getCanSeeEmote(emoteData)) {
          addEmoteToCategory(emoteData, categoryId, this.getCanUseEmote(emoteData), this.getCanPurchaseEmote(emoteData));
        }

        // special case: faction emotes that all users have by default
        if (categoryId === SDK.EmoteCategory.Faction && InventoryManager.getInstance().getCanAlwaysUseCosmeticById(emoteId)) {
          addEmoteToCategory(emoteData, SDK.EmoteCategory.Default, true, false);
        }
      }
    }
    // reset collections
    var categoryIds = Object.keys(emoteModelsByCategoryId);
    for (var i = 0, il = categoryIds.length; i < il; i++) {
      var categoryId = categoryIds[i];
      var emoteModels = emoteModelsByCategoryId[categoryId];
      this._emoteCollectionsByCategoryId[categoryId].reset(emoteModels);
    }
  },

  getCanSeeEmote: function (emoteData) {
    return InventoryManager.getInstance().getCanSeeCosmeticById(emoteData.id)
      && (emoteData.category !== SDK.EmoteCategory.Faction
        || emoteData.generalId === SDK.Cards.getBaseCardId(SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(this.model.get('playerId')).generalId));
  },

  getCanUseEmote: function (emoteData) {
    if (this.getCanSeeEmote(emoteData)) {
      var emoteId = emoteData.id;
      return InventoryManager.getInstance().getCanUseCosmeticById(emoteId);
    }
    return false;
  },

  getCanPurchaseEmote: function (emoteData) {
    if (this.getCanSeeEmote(emoteData)) {
      var emoteId = emoteData.id;
      return InventoryManager.getInstance().getCanPurchaseCosmeticById(emoteId);
    }
    return false;
  },

  onSelectEmote: function (emoteView) {
    var emoteModel = emoteView && emoteView.model;
    var emoteId = emoteModel && emoteModel.get('id');
    if (emoteId != null) {
      // play effect
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_select.audio, CONFIG.SELECT_SFX_PRIORITY);

      if (InventoryManager.getInstance().getCanPurchaseCosmeticById(emoteId)) {
        // buy emote
        var productData = SDK.CosmeticsFactory.cosmeticProductDataForIdentifier(emoteId);
        var saleData = {};
        if (emoteModel.get('sale_id')) {
          saleData.saleId = emoteModel.get('sale_id');
          saleData.salePrice = emoteModel.get('sale_price');
        }
        return NavigationManager.getInstance().showDialogForConfirmPurchase(productData, saleData)
          .catch(function () {
          // do nothing on cancel
          });
      } else if (InventoryManager.getInstance().getCanUseCosmeticById(emoteId)) {
        // broadcast emote
        var emoteTimestamp = Date.now();
        if (this._emoteSentAt + CONFIG.EMOTE_DELAY * 1000.0 <= emoteTimestamp) {
          this._emoteSentAt = emoteTimestamp;
          SDK.NetworkManager.getInstance().broadcastGameEvent({
            type: EVENTS.show_emote,
            id: emoteId,
            playerId: this.model.get('playerId'),
            timestamp: emoteTimestamp,
          });
        }

        // show emote
        this.showEmote(emoteId);
      }
    }
  },

  /* endregion EMOTES */

});

// Expose the class either via CommonJS or the global object
module.exports = MyPlayerPopoverLayout;
