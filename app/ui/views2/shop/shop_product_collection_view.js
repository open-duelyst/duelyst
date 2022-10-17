// pragma PKGS: shop

'use strict';

var _ = require('underscore');
var moment = require('moment');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var NavigationManager = require('app/ui/managers/navigation_manager');
var VirtualCollection = require('backbone-virtual-collection');
var i18next = require('i18next');
var ShopProductView = require('./shop_product_view');
var Template = require('./templates/shop_product_collection_view.hbs');

var ShopProductCollectionView = Backbone.Marionette.CompositeView.extend({

  className: 'product-collection',
  template: Template,
  childView: ShopProductView,
  childViewContainer: '.product-list',
  selectedSubCategory: null,
  subCategoryAll: 'all',
  searchInput: null,

  /* UI elements hash */
  ui: {
    tabs: '.sub-category-menu',
    searchInput: '.search-input-field',
    $searchSubmit: '.search-submit',
    $searchClear: '.search-clear',
  },

  /* UI events hash */
  events: {
    'click .sub-category-menu > li': 'onSubCategoryChanged',
    'keyup .search-input-field': 'onSearchInputChanged',
    'click .search-clear': 'onSearchClear',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  /* region INITIALIZE */

  initialize: function (opts) {
    //
    this.collection = new VirtualCollection(opts.collection, {
      destroy_with: this,
      comparator: function (a, b) {
        return ((a.get('order_id') || 0) - (b.get('order_id') || 0)) || ((a.get('faction_id') || 0) - (b.get('faction_id') || 0)) || ((a.get('general_id') || 0) - (b.get('general_id') || 0)) || ((b.get('rarity_id') || 0) - (a.get('rarity_id') || 0)) || ((a.get('id') || 0) - (b.get('id') || 0));
      },
    });
    this.collection.sort();
    var categories = opts.collection.map(function (item) {
      return item.get('sub_category_name');
    });
    categories = _.uniq(categories);

    // Ordering of (sub) categories
    if (opts.categoryOrdering != null) {
      var categoryOrdering = opts.categoryOrdering;
      categories = _.sortBy(categories, function (category) {
        var orderingIndex = categoryOrdering.indexOf(category);
        if (orderingIndex != -1) {
          return orderingIndex;
        } else {
          return 100;
        }
      });
    }

    categories.unshift('all');
    categories = _.map(categories, function (category, i) {
      return {
        is_active: (i == 0),
        title: category,
        localized_title: SDK.CosmeticsFactory.localizedSubTypeTitle(category),
      };
    });

    if (categories.length == 1) {
      categories = [];
    }
    this.model.set('categories', categories);
  },

  /* endregion INITIALIZE */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    $('li', this.ui.tabs).removeClass('active');
    this.ui.tabs.find('[data-value=\'' + this.selectedSubCategory + '\']').addClass('active');
    if (this.searchInput) {
      this.ui.searchInput.focus().val(this.searchInput);
      this.ui.$searchSubmit.removeClass('active');
      this.ui.$searchClear.addClass('active');
    } else {
      this.ui.$searchSubmit.addClass('active');
      this.ui.$searchClear.removeClass('active');
    }
  },

  onShow: function () {
    this.listenTo(this, 'childview:select_product', this.onSelectProduct);
    this.setSubCategory(this.subCategoryAll);
  },

  /* endregion MARIONETTE EVENTS */

  /* region PURCHASE */

  onSelectProduct: function (view, saleData) {
    var productData = view && view.model && view.model.attributes;

    if (productData.category_id == 'bundles') {
      productData = _.extend({}, productData, {
        name: i18next.t('shop.' + productData.name),
        description: i18next.t('shop.' + productData.description),
      });
    }
    return NavigationManager.getInstance().showDialogForConfirmPurchase(productData, saleData)
      .bind(this)
      .then(function (purchaseData) {
        this.onPurchaseComplete(purchaseData);
      })
      .catch(function () {
      // do nothing on cancel
      });
  },

  onPurchaseComplete: function (purchaseData) {
    // nothing yet
  },

  /* endregion PURCHASE */

  /* region CATEGORIES */

  updateCollectionFilter: function () {
    this.collection.updateFilter(function (model) {
      var matches = true;
      if (this.searchInput) {
        var rarityName = '';
        var productName = model.get('name') || '';
        var subCategoryName = model.get('sub_category_name') || '';
        var description = model.get('description') || '';
        var rarity = SDK.RarityFactory.rarityForIdentifier(model.get('rarity_id'));
        if (rarity) {
          rarityName = rarity.name;
        }
        var found = (
          subCategoryName.toLowerCase().indexOf(this.searchInput.toLowerCase()) >= 0
          || productName.toLowerCase().indexOf(this.searchInput.toLowerCase()) >= 0
          || rarityName.toLowerCase().indexOf(this.searchInput.toLowerCase()) >= 0
          || description.toLowerCase().indexOf(this.searchInput.toLowerCase()) >= 0
        );
        matches = matches && found;
      }
      if (this.selectedSubCategory && this.selectedSubCategory !== this.subCategoryAll) {
        matches = matches && model.get('sub_category_name') && model.get('sub_category_name').toLowerCase().indexOf(this.selectedSubCategory.toLowerCase()) >= 0;
      }
      return matches;
    }.bind(this));
    this.trigger('filter');
  },

  onSubCategoryChanged: function (e) {
    var button = $(e.currentTarget);
    var selectedValue = button.data('value');
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
    this.setSubCategory(selectedValue);
  },

  setSubCategory: function (selectedValue) {
    if (selectedValue !== this.selectedSubCategory) {
      this.selectedSubCategory = selectedValue;
      this.updateCollectionFilter();
      $('li', this.ui.tabs).removeClass('active');
      this.ui.tabs.find('[data-value=\'' + selectedValue + '\']').addClass('active');
      if (selectedValue === 'all') selectedValue = null;
    }
  },

  onSearchInputChanged: _.debounce(function () {
    var searchInput = this.ui.searchInput.val();
    if (this.searchInput !== searchInput) {
      this.searchInput = searchInput;
      this.updateCollectionFilter();
    }
  }, 500),

  onSearchClear: function () {
    if (this.searchInput) {
      this.searchInput = null;
      this.updateCollectionFilter();
    }
  },

  /* endregion CATEGORIES */

});

// Expose the class either via CommonJS or the global object
module.exports = ShopProductCollectionView;
