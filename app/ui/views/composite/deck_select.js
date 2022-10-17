// pragma PKGS: alwaysloaded

'use strict';

var Logger = require('app/common/logger');
var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var generatePushID = require('app/common/generate_push_id');
var audio_engine = require('app/audio/audio_engine');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var Analytics = require('app/common/analytics');
var Animations = require('app/ui/views/animations');
var GamesManager = require('app/ui/managers/games_manager');
var GameDataManager = require('app/ui/managers/game_data_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var DecksCollection = require('app/ui/collections/decks');
var DeckModel = require('app/ui/models/deck');
var DeckSlidingPanelItemView = require('app/ui/views/item/deck_sliding_panel');
var DeckSelectTmpl = require('app/ui/templates/composite/deck_select.hbs');
var DeckSelectEmptyTmpl = require('app/ui/templates/item/deck_select_empty.hbs');
var DeckSelectEmptyStandardTmpl = require('app/ui/templates/item/deck_select_empty_standard.hbs');
var RiftDeckSelectEmptyTmpl = require('app/ui/templates/item/rift_deck_select_empty.hbs');
var ArenaDeckSelectEmptyTmpl = require('app/ui/templates/item/arena_deck_select_empty.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
var VirtualCollection = require('backbone-virtual-collection');
var PlayLayer = require('app/view/layers/pregame/PlayLayer');
var ChangeBattleMapItemView = require('app/ui/views/item/change_battle_map_dialog');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var RiftRunDeckView = require('app/ui/views2/rift/rift_run_deck');
var i18next = require('i18next');
var ArenaRunDeckView = require('app/ui/views2/arena/arena_run_deck');
const Chroma = require('app/common/chroma');
var SlidingPanelSelectCompositeView = require('./sliding_panel_select');

var DeckSelectEmptyView = Backbone.Marionette.ItemView.extend({
  tagName: 'li',
  template: DeckSelectEmptyTmpl,
});

var DeckSelectEmptyViewStandard = Backbone.Marionette.ItemView.extend({
  tagName: 'li',
  template: DeckSelectEmptyStandardTmpl,
});

var RiftDeckSelectEmptyView = Backbone.Marionette.ItemView.extend({
  tagName: 'li',
  template: RiftDeckSelectEmptyTmpl,
});

var ArenaDeckSelectEmptyView = Backbone.Marionette.ItemView.extend({
  tagName: 'li',
  template: ArenaDeckSelectEmptyTmpl,
});

var DeckSelectCompositeView = SlidingPanelSelectCompositeView.extend({

  className: 'sliding-panel-select deck-select',

  template: DeckSelectTmpl,

  ui: {
    $decks: '.sliding-panel-select-choices',
    $deckSelectConfirm: '.deck-select-confirm',
    $deckSelectConfirmCasual: '.deck-select-confirm-casual',
    $deckGroups: '.deck-groups',
    $searchSubmit: '.search-submit',
    $searchClear: '.search-clear',
    $searchInput: '.search input[type=\'search\']',
    $battleMapSelect: '.battlemap-select',
  },

  events: {
    'click .deck-select-confirm': 'onConfirmSelection',
    'click .deck-select-confirm-casual': 'onConfirmCasualSelection',
    'click .deck-groups li': 'onDeckGroupChanged',
    'click .search-clear': 'onSearchClear',
    'input .search input[type=\'search\']': 'onSearch',
    'click .battlemap-select': 'onChangeBattleMapPressed',
    'click .deck-color-code-select-list .deck-color-code': 'onDeckColorCodeClicked',
    'click .toggle-faction': 'onFactionSelectClicked',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  selectedDeckGroup: 'starter',
  filterDeckColorCode: 0,
  filterDeckFaction: 0,
  filterLegacy: false,
  _currentSearchQuery: '',
  _currentSearchPattern: null,
  _slidingOffsetXByDeckGroup: null,
  _popoverItem: null,
  _dismissSelectDeckWarningPopover: null,
  _dismissSelectDeckWarningTimeoutId: null,
  _showRiftDecks: false,
  _showGauntletDecks: false,

  slidingPanelsShowDuration: 150.0,
  slidingPanelsShowDelay: 100.0,
  slidingPanelsShowStagger: 20.0,
  slidingPanelsShowStaggerRandom: 10.0,
  slidingPanelShowAnimation: Animations.fadeZoomFlashUpIn,
  slidingPanelsStickySelection: true,

  runsCollection: null,

  _requestId: null,

  templateHelpers: {
    getColorCodes: function () {
      var colorCodes = [];
      for (var count in CONFIG.COLOR_CODES) {
        var colorObj = CONFIG.COLOR_CODES[count];
        if (colorObj.code != 0) {
          colorCodes.push(colorObj);
        } else {
          colorCodes.push({ code: 0, cssClass: 'color-code-blank' });
        }
      }
      return colorCodes;
    },

    hasAnyBattleMapCosmetics: function () {
      return InventoryManager.getInstance().hasAnyBattleMapCosmetics();
    },
  },

  /* region INITIALIZE */

  initialize: function () {
    this._slidingOffsetXByDeckGroup = {};

    // generate unique id for requests
    this._requestId = generatePushID();

    SlidingPanelSelectCompositeView.prototype.initialize.call(this);

    // set decks in collection
    this.getDecks()
      .then(function (decks) {
        this.collection.reset(decks);

        // set starting selected deck group
        if (InventoryManager.getInstance().hasValidCustomDecks()) {
          this.selectedDeckGroup = 'custom';
        } else {
          this.selectedDeckGroup = 'starter';
        }

        // set starting selected deck model
        this.setStartingSelectedDeckModel();

        // update virtual collection filter
        if (this.collection instanceof VirtualCollection) {
          this.collection.updateFilter(this.filterDecks.bind(this));
        }

        this.render();
        this._showSlidingPanels();
      }.bind(this));
  },

  getChildView: function (item) {
    if (item.get('isRift')) {
      return RiftRunDeckView;
    } else if (item.get('isGauntlet')) {
      return ArenaRunDeckView;
    } else {
      return DeckSlidingPanelItemView;
    }
  },

  getEmptyView: function () {
    if (this.selectedDeckGroup == 'rift') {
      return RiftDeckSelectEmptyView;
    } else if (this.selectedDeckGroup == 'gauntlet') {
      return ArenaDeckSelectEmptyView;
    } else if (this.filterLegacy) {
      return DeckSelectEmptyViewStandard;
    } else {
      return DeckSelectEmptyView;
    }
  },

  getDecks: function () {
    var decks = [];

    // find preset decks
    var enabledPlayableFactions = GameDataManager.getInstance().visibleFactionsCollection.where({ isNeutral: false, enabled: true });
    _.each(enabledPlayableFactions, function (factionModel) {
      var factionId = factionModel.get('id');
      var factionProgressionData = ProgressionManager.getInstance().getFactionProgressionStatsModel(factionId);
      var factionLevel = (factionProgressionData && factionProgressionData.get('level')) || 0;
      // add starter deck
      var starterDeck = SDK.FactionFactory.starterDeckForFactionLevel(factionId, factionLevel);
      if (starterDeck != null) {
        var basicCardModels = GameDataManager.getInstance().getFactionCardModels(factionId, {
          rarityId: SDK.Rarity.Fixed,
          isHiddenInCollection: false,
          isUnlockableBasic: false,
          isPrismatic: false,
          isUnlockableWithAchievement: false,
        });

        var factionData = {
          name: factionModel.get('name'),
          faction_id: factionId,
          crestImg: factionModel.get('crestResource').img,
          description: factionModel.get('description'),
          numCardsUnlocked: basicCardModels.length + SDK.FactionProgression.unlockedCardsUpToLevel(factionLevel, factionId, true).length,
          numCardsUnlockable: basicCardModels.length + SDK.FactionProgression.unlockedCardsUpToLevel(SDK.FactionProgression.maxLevel, factionId, true).length,
        };

        var starterDeckModel = new DeckModel(_.extend({}, factionData, {
          id: factionModel.get('name') + ' Starter',
          isStarter: true,
        }));
        starterDeckModel.addCardsData(starterDeck);
        decks.push(starterDeckModel);
      }
    });

    // add all custom user decks
    decks = decks.concat(InventoryManager.getInstance().getDecksCollection().slice(0));

    var gatherDecksPromises = [];

    if (this._showRiftDecks) {
      this.runsCollection = new DuelystBackbone.Collection();
      this.runsCollection.url = process.env.API_URL + '/api/me/rift/runs';
      this.runsCollection.fetch();

      var riftDecksPromise = this.runsCollection.onSyncOrReady().then(function () {
        _.each(this.runsCollection.models, function (runModel) {
          runModel.set('isRift', true);
          runModel.set('id', runModel.get('ticket_id'));
          decks.push(runModel);
        });

        return Promise.resolve(decks);
      }.bind(this));

      gatherDecksPromises.push(riftDecksPromise);
    }

    if (this._showGauntletDecks) {
      this.gauntletDecksCollection = new DuelystBackbone.Collection();
      this.gauntletDecksCollection.url = process.env.API_URL + '/api/me/gauntlet/runs/decks';
      this.gauntletDecksCollection.fetch();

      var gauntletDecksPromise = this.gauntletDecksCollection.onSyncOrReady().then(function () {
        _.each(this.gauntletDecksCollection.models, function (runModel) {
          runModel.set('isGauntlet', true);
          decks.push(runModel);
        });

        return Promise.resolve(decks);
      }.bind(this));

      gatherDecksPromises.push(gauntletDecksPromise);
    }

    return Promise.all(gatherDecksPromises)
      .then(function () {
        return Promise.resolve(decks);
      });
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize: function () {
    var slidingContainerWidth = this._slidingContainerWidth;

    SlidingPanelSelectCompositeView.prototype.onResize.call(this);

    var needsSlide = this._slidingContainerWidth < this._totalViewsWidth;
    if (needsSlide) {
      var slidingScale = slidingContainerWidth != null ? slidingContainerWidth / this._slidingContainerWidth : 0.0;
      var deckGroupKeys = Object.keys(this._slidingOffsetXByDeckGroup);
      for (var i = 0, il = deckGroupKeys.length; i < il; i++) {
        var deckGroup = deckGroupKeys[i];
        this._slidingOffsetXByDeckGroup[deckGroup] *= slidingScale;
      }
    } else {
      this._slidingOffsetXByDeckGroup = {};
    }
  },

  /* endregion LAYOUT */

  /* region MARIONETTE EVENTS */

  onBeforeRender: function () {
    this._destroyFindDeckPopover();
    if (this._dismissSelectDeckWarningPopover != null) {
      this._dismissSelectDeckWarningPopover();
    }
  },

  onRender: function () {
    SlidingPanelSelectCompositeView.prototype.onRender.call(this);

    // mark selected deck group as active
    this.ui.$deckGroups.children('[data-value=\'' + this.selectedDeckGroup + '\']').addClass('active');

    // update deck visuals
    this._updateDecks();

    this._showNewPlayerUI();

    // update search
    if (this._currentSearchQuery) {
      this.ui.$searchInput.prop('value', this._currentSearchQuery);
      this.ui.$searchSubmit.removeClass('active');
      this.ui.$searchClear.addClass('active');
    } else {
      this.ui.$searchSubmit.addClass('active');
      this.ui.$searchClear.removeClass('active');
    }

    this.updateSelectedBattlemapIcon();

    // focus search
    this.ui.$searchInput.focus();
  },

  updateSelectedBattlemapIcon: function () {
    if (ProfileManager.getInstance().get('battle_map_id')) {
      var battleMap = SDK.CosmeticsFactory.cosmeticForIdentifier(ProfileManager.getInstance().get('battle_map_id'));
      this.ui.$battleMapSelect.find('span.icon').css('background-image', 'url(' + battleMap.img + ')').find('i').addClass('hidden');
    } else {
      this.ui.$battleMapSelect.find('span.icon').css('background-image', '').find('i').removeClass('hidden');
    }
  },

  onShow: function () {
    SlidingPanelSelectCompositeView.prototype.onShow.call(this);

    // analytics call
    Analytics.page('Select Deck', { path: '/#deck_selection' });

    // show play layer
    Scene.getInstance().showContentByClass(PlayLayer, true);

    // change fx
    this._updateBackgroundForDeck(this._selectedDeckModel);
  },

  _showNewPlayerUI: function () {

  },

  onPrepareForDestroy: function () {
    // reset gradient color mapping
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
    Scene.getInstance().getFX().requestUnblurSurface(this._requestId);
  },

  onDestroy: function () {
    SlidingPanelSelectCompositeView.prototype.onDestroy.call(this);
    this._destroyFindDeckPopover();
    if (this._dismissSelectDeckWarningPopover != null) {
      this._dismissSelectDeckWarningPopover();
    }
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENTS */

  onDeckColorCodeClicked: function (e) {
    var $target = $(e.target);
    var colorCode = parseInt($target.data('code'));
    var colorCodeData = CONFIG.COLOR_CODES[colorCode];
    if (colorCodeData != null) {
      this.filterDeckColorCode = colorCodeData.code;
    }
    if (this.collection instanceof VirtualCollection) {
      this.collection.updateFilter(this.filterDecks.bind(this));
    }
    this.render();
    this._showSlidingPanels();
  },

  onFactionSelectClicked: function (e) {
    var $target = $(e.currentTarget);
    var factionId = $target.data('faction');
    this.filterDeckFaction = factionId;
    if (this.collection instanceof VirtualCollection) {
      this.collection.updateFilter(this.filterDecks.bind(this));
    }
    this.render();
    this._showSlidingPanels();
  },

  /* endregion EVENTS */

  /* region SEARCH */

  onSearch: function (event) {
    var $target = $(event.target);
    var value = $.trim($target.prop('value'));
    this.search(value, true);
  },

  /**
   * Searches for a string across every deck in the collection and filtering visibility to matches only.
   * @param {String} searchQuery
   * @param {Boolean} [debounced=false] whether to debounce search, only allowing 1 execution per ~300 ms
   */
  search: function (searchQuery, debounced) {
    if (debounced) {
      if (this._searchDebounced == null) {
        this._searchDebounced = _.debounce(this.search.bind(this), 300);
      }
      this._searchDebounced(searchQuery);
    } else {
      // cleanup search query and double check that it is still valid
      searchQuery = UtilsJavascript.escapeStringForRegexSearch($.trim(searchQuery).toLowerCase());
      if (this._currentSearchQuery !== searchQuery) {
        this._currentSearchQuery = searchQuery;
        if (this._currentSearchQuery) {
          // break search query into multiple or statements
          // this way we can combine search terms to capture multiple factions
          this._currentSearchPattern = new RegExp(this._currentSearchQuery.replace(/[\s\t]/g, '|'), 'i');
        } else {
          this._currentSearchPattern = null;
        }

        // reset slide
        this._slidingOffsetX = this._slidingLastOffsetX = 0.0;
        this._slidingOffsetXByDeckGroup[this.selectedDeckGroup] = {};

        // filter decks and show matches
        var collectionModelsToSearch = this.collection instanceof VirtualCollection ? this.collection.collection.models : this.collection.models;
        var currentDecks = this.collection.models.slice(0);
        var foundDecks = [];
        var changed = false;
        for (var i = 0, il = collectionModelsToSearch.length; i < il; i++) {
          var deckModel = collectionModelsToSearch[i];
          if (this.filterDecks(deckModel)) {
            foundDecks.push(deckModel);
            if (!changed) {
              var currentDeckModel = currentDecks[foundDecks.length - 1];
              if (currentDeckModel == null || currentDeckModel.get('id') !== deckModel.get('id')) {
                changed = true;
              }
            }
          }
        }

        if (changed || (foundDecks.length > 0 && foundDecks.length !== currentDecks.length)) {
          if (this.collection instanceof VirtualCollection) {
            this.collection.updateFilter(this.filterDecks.bind(this));
          }
          this.render();
          this._showSlidingPanels();
        }
      }
    }
  },

  onSearchClear: function (event) {
    this.ui.$searchInput.prop('value', '');
    this.search(null);
    this.ui.$searchClear.hide();
    this.ui.$searchSubmit.show();
  },

  /* endregion SEARCH */

  /* region SLIDING */

  _showSlidingPanels: function () {
    // set sliding offset to attempt to center selected deck
    var selectedDeckModelForGroup = this.getSelectedDeckModelInSelectedDeckGroup();
    if (selectedDeckModelForGroup != null) {
      var viewData = this._getSlidingPanelDataForModel(selectedDeckModelForGroup);
      if (this._slidingContainerWidth < this._totalViewsWidth) {
        this._slidingOffsetX = this._slidingLastOffsetX = this._slidingOffsetXByDeckGroup[this.selectedDeckGroup] = Math.min(0.0, Math.max(-this._slidingRange, -(viewData.x + viewData.outerWidth * 0.5) + this._slidingContainerWidth * 0.5));
      }
    }

    // show sliding panels
    SlidingPanelSelectCompositeView.prototype._showSlidingPanels.call(this);
  },

  _updateSlidingPanels: function () {
    this._slidingOffsetXByDeckGroup[this.selectedDeckGroup] = this._slidingOffsetX;
    SlidingPanelSelectCompositeView.prototype._updateSlidingPanels.call(this);
  },

  /* endregion SLIDING */

  /* region SELECTION */

  setStartingSelectedDeckModel: function () {
    var lastSelectedDeckId = CONFIG.lastSelectedDeckId;
    if (lastSelectedDeckId) {
      var collectionToSearch = this.collection instanceof VirtualCollection ? this.collection.collection : this.collection;
      var lastSelectedDeckModel = collectionToSearch.find(function (model) { return model.get('id') === lastSelectedDeckId; });
      if (lastSelectedDeckModel != null) {
        this._selectedDeckModel = lastSelectedDeckModel;
        if (!lastSelectedDeckModel.get('isStarter')) {
          this.selectedDeckGroup = 'custom';
        } else {
          this.selectedDeckGroup = 'starter';
        }
      }
    }
  },

  getSelectedDeckModelInSelectedDeckGroup: function () {
    if (this._selectedDeckModel != null) {
      if (this.selectedDeckGroup === 'starter' && this._selectedDeckModel.get('isStarter')) {
        return this._selectedDeckModel;
      } else if (this.selectedDeckGroup === 'custom' && !this._selectedDeckModel.get('isStarter')) {
        return this._selectedDeckModel;
      }
    }
  },

  filterDecks: function (deckModel) {
    var isInSelectedGroup = true;

    if (this.selectedDeckGroup === 'custom') {
      isInSelectedGroup = !deckModel.get('isStarter') && !deckModel.get('isRift') && !deckModel.get('isGauntlet');
    } else if (this.selectedDeckGroup === 'starter') {
      isInSelectedGroup = deckModel.get('isStarter');
    } else if (this.selectedDeckGroup === 'rift') {
      isInSelectedGroup = deckModel.get('isRift');
    } else if (this.selectedDeckGroup === 'gauntlet') {
      isInSelectedGroup = deckModel.get('isGauntlet');
    }

    if (isInSelectedGroup && this._currentSearchPattern != null) {
      isInSelectedGroup = this._currentSearchPattern.test(deckModel.get('searchableContent'));
    }

    // color codes only valid on custom decks
    if (isInSelectedGroup && this.selectedDeckGroup === 'custom' && this.filterDeckColorCode != 0) {
      if (this.filterDeckColorCode != deckModel.get('color_code')) {
        isInSelectedGroup = false;
      }
    }

    // faction filters valid in any selection except starter list
    if (isInSelectedGroup && this.selectedDeckGroup != 'starter' && this.filterDeckFaction != 0) {
      if (this.filterDeckFaction != deckModel.get('faction_id')) {
        isInSelectedGroup = false;
      }
    }

    // legacy filters valid in any selection except starter list
    if (isInSelectedGroup && this.selectedDeckGroup != 'starter' && this.filterLegacy) {
      if (deckModel.isLegacy()) {
        isInSelectedGroup = false;
      }
    }

    return isInSelectedGroup;
  },

  onDeckGroupChanged: function (e) {
    var li = $(e.currentTarget);
    var newGroup = li.data('value');
    if (newGroup === this.selectedDeckGroup) {
      return;
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);

      this.selectedDeckGroup = newGroup;
      this.ui.$deckGroups.children().removeClass('active');
      li.addClass('active');
      if (this.collection instanceof VirtualCollection) {
        this.collection.updateFilter(this.filterDecks.bind(this));
      }
      this._slidingOffsetX = this._slidingLastOffsetX = this._slidingOffsetXByDeckGroup[this.selectedDeckGroup] || 0.0;
      this.render();
      this._showSlidingPanels();
    }

    if (this.selectedDeckGroup == 'starter') {
      NewPlayerManager.getInstance().setHasSeenStarterDecksTab(true);
    }
  },

  setSelectedChildView: function (childView) {
    // normally sliding panels can be deselected
    // don't allow this for deck select
    if (this._selectedChildView !== childView) {
      SlidingPanelSelectCompositeView.prototype.setSelectedChildView.apply(this, arguments);
    }

    // set deck from selected
    var selectedChildView = this.getSelectedChildView();
    this.setSelectedDeck(selectedChildView && selectedChildView.model);
  },

  setSelectedDeck: function (selectedDeckModel) {
    if (selectedDeckModel != null && this._selectedDeckModel !== selectedDeckModel) {
      this._selectedDeckModel = selectedDeckModel;

      // store selected deck
      CONFIG.lastSelectedDeckId = this._selectedDeckModel.get('id');

      // play select sound
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_select.audio, CONFIG.SELECT_SFX_PRIORITY);

      // tag selected deck as active
      this._updateDecks();

      // emit select event
      this.trigger('select_deck', this._selectedDeckModel);
    }
  },

  onConfirmSelection: function (event) {
    if (this._selectedDeckModel != null) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      this.ui.$deckSelectConfirmCasual.addClass('disabled');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      GamesManager.getInstance().findNewGame(
        UtilsJavascript.deepCopy(this._selectedDeckModel.get('cards')),
        this._selectedDeckModel.get('faction_id'),
        SDK.GameType.Ranked,
        this._selectedDeckModel.get('cards')[0].id,
        this._selectedDeckModel.get('card_back_id'),
        ProfileManager.getInstance().get('battle_map_id'),
      );
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirm);
    }
  },

  onConfirmCasualSelection: function (event) {
    if (this._selectedDeckModel != null) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      this.ui.$deckSelectConfirmCasual.addClass('disabled');
      GamesManager.getInstance().findNewGame(
        UtilsJavascript.deepCopy(this._selectedDeckModel.get('cards')),
        this._selectedDeckModel.get('faction_id'),
        SDK.GameType.Casual,
        this._selectedDeckModel.get('cards')[0].id,
        this._selectedDeckModel.get('card_back_id'),
        ProfileManager.getInstance().get('battle_map_id'),
      );
    } else {
      // show select deck warning
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirmCasual);
    }
  },

  onChangeBattleMapPressed: function (e) {
    var dialog = new ChangeBattleMapItemView({ model: new Backbone.Model() });
    this.listenToOnce(dialog, 'success', this.updateSelectedBattlemapIcon);
    this.listenToOnce(dialog, 'cancel', function () { this.stopListening(dialog); }.bind(this));
    NavigationManager.getInstance().showDialogView(dialog);
  },

  _showSelectDeckWarningPopover: function ($target, message) {
    // defer in case this is showing as a result of an event
    _.defer(function () {
      if (this._dismissSelectDeckWarningPopover != null) {
        this._dismissSelectDeckWarningPopover();
      }
      if (message == null) {
        message = i18next.t('game_setup.must_select_deck_message');
      }

      // show popover
      $target.popover({
        content: message,
        container: this.$el,
        placement: 'top',
      });
      $target.popover('show');

      // set dismiss
      this._dismissSelectDeckWarningPopover = function () {
        if (this._dismissSelectDeckWarningTimeoutId != null) {
          clearTimeout(this._dismissSelectDeckWarningTimeoutId);
          this._dismissSelectDeckWarningTimeoutId = null;
        }
        if (this._dismissSelectDeckWarningPopover != null) {
          $('body').off('click', this._dismissSelectDeckWarningPopover);
          this._dismissSelectDeckWarningPopover = null;
        }
        $target.popover('destroy');
      }.bind(this);
      $('body').one('click', this._dismissSelectDeckWarningPopover);
      this._dismissSelectDeckWarningTimeoutId = setTimeout(this._dismissSelectDeckWarningPopover, 2000);
    }.bind(this));
  },

  _updateBackgroundForDeck: function (deckModel) {
    if (deckModel != null) {
      var factionData = SDK.FactionFactory.factionForIdentifier(deckModel.get('faction_id'));
      if (CONFIG.razerChromaEnabled) {
        // CONFIG.razerChromaIdleColor = new Chroma.Color(
        //   (factionData.gradientColorMapWhite.r + factionData.gradientColorMapBlack.r)/2,
        //   (factionData.gradientColorMapWhite.g + factionData.gradientColorMapBlack.g)/2,
        //   (factionData.gradientColorMapWhite.b + factionData.gradientColorMapBlack.b)/2
        // )
        CONFIG.razerChromaIdleColor = new Chroma.Color(factionData.gradientColorMapWhite.r, factionData.gradientColorMapWhite.g, factionData.gradientColorMapWhite.b);
        Chroma.setAll(CONFIG.razerChromaIdleColor);
      }
      Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, factionData.gradientColorMapWhite, factionData.gradientColorMapBlack);
    } else {
      Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
        r: 194, g: 203, b: 220, a: 255,
      }, {
        r: 36, g: 51, b: 65, a: 255,
      });
    }
  },

  _updateDecks: function () {
    if (this._selectedDeckModel) {
      // update decks based on currently selected deck
      var selectedDeckId = this._selectedDeckModel.get('id');

      this.children.each(function (view) {
        var model = view.model;
        var id = model.get('id');
        // set active
        if (id === selectedDeckId) {
          view.$el.addClass('active');
        } else {
          view.$el.removeClass('active');
        }
      });
    }

    // show popover to direct player to their deck selection
    this._destroyFindDeckPopover();
    this._updateFindDeckPopover();

    // update background based on selected deck
    this._updateBackgroundForDeck(this._selectedDeckModel);
  },

  _updateFindDeckPopover: function () {
    if (this._selectedDeckModel != null) {
      // only show tooltips when we have a selected deck
      if (this.selectedDeckGroup === 'custom' && this._selectedDeckModel.get('isStarter')) {
        // show tooltip to direct player to selected starter deck
        this._popoverItem = this.ui.$deckGroups.children('[data-value="starter"]');
        this._popoverItem.popover({
          content: i18next.t('game_setup.find_selected_deck_msg'),
          container: this.$el,
          placement: 'bottom',
        });
        this._popoverItem.popover('show');
      } else if (this.selectedDeckGroup === 'starter' && !this._selectedDeckModel.get('isStarter')) {
        // show tooltip to direct player to selected custom deck
        this._popoverItem = this.ui.$deckGroups.children('[data-value="custom"]');
        this._popoverItem.popover({
          content: i18next.t('game_setup.find_selected_deck_msg'),
          container: this.$el,
          placement: 'bottom',
        });
        this._popoverItem.popover('show');
      }
    }
  },

  _destroyFindDeckPopover: function () {
    if (this._popoverItem != null) {
      this._popoverItem.popover('destroy');
      this._popoverItem = null;
    }
  },

  /* endregion SELECTION */

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectCompositeView;
