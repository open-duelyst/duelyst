// pragma PKGS: nongame

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const EventBus = require('app/common/eventbus');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const SDK = require('app/sdk');
const Scene = require('app/view/Scene');
const Analytics = require('app/common/analytics');
const Game = require('app/ui/models/game');
const DeckModel = require('app/ui/models/deck');
const Animations = require('app/ui/views/animations');
const TransitionRegion = require('app/ui/views/regions/transition');
const GameDataManager = require('app/ui/managers/game_data_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const GamesManager = require('app/ui/managers/games_manager');
const ConfirmDialogItemView = require('app/ui/views/item/confirm_dialog');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const moment = require('moment');
const i18next = require('i18next');
const CollectionTmpl = require('./templates/collection.hbs');
const DeckLayout = require('./deck');
const CardsCollectionCompositeView = require('./cards_collection');
const DecksCollectionCompositeView = require('./decks_collection');
const CraftingCompositeView = require('./crafting');
const DeckCardBackSelectView = require('./deck_card_back_select');
const SelectedCardLayout = require('./selected_card');

const CollectionLayout = Backbone.Marionette.LayoutView.extend({

  _deck: null,
  _scrollLast: 0,
  _browsingMode: false,
  _deckCardBackSelectingMode: false,

  id: 'app-collection',

  template: CollectionTmpl,

  regions: {
    cardsRegion: { selector: '.collection-cards-region', regionClass: TransitionRegion },
    sidebarRegion: { selector: '.collection-sidebar-region', regionClass: TransitionRegion },
    selectedCardRegion: { selector: '.collection-selected-card-region' },
  },

  /* ui selector cache */
  ui: {
    $cardsList: '.collection-cards .cards-list',
    $startCraftingModeButton: '.crafting-mode-start',
    $stopCraftingModeButton: '.crafting-mode-stop',
    $searchSubmit: '.search-submit',
    $searchClear: '.search-clear',
    $searchInput: '.search input[type=\'search\']',
    $dismissNew: '.dismiss-new',
    $togglePrismatics: '.toggle-prismatics',
    $togglePrismaticsCrafting: '.toggle-prismatics-crafting',
    $toggleSkins: '.toggle-skins',
    $toggleLoreNotifications: '.toggle-lore-notifications',
  },

  /* Ui events hash */
  events: {
    'click .deck-new': 'onNewDeck',
    'click .deck-delete': 'onDeleteDeck',
    'click .deck-done': 'onSaveDeck',
    'click .deck-cancel': 'onCancelDeck',
    'click .faction-tab': 'onFactionSelected',
    'click .previous-page': 'onPreviousPage',
    'click .next-page': 'onNextPage',
    'click .crafting-mode-start': 'onStartCraftingMode',
    'click .crafting-mode-stop': 'onStopCraftingMode',
    'click .browsing-mode': 'onBrowsingMode',
    'click .search-clear': 'onSearchClear',
    'input .search input[type=\'search\']': 'onSearch',
    'click .dismiss-new': 'onDismissNew',
    'click .toggle-prismatics': 'onToggleShowPrismatics',
    'click .toggle-prismatics-crafting': 'onToggleShowPrismaticsCrafting',
    'click .toggle-skins': 'onToggleShowSkins',
    'click .toggle-lore-notifications': 'onToggleShowLoreNotifications',
    'click .toggle-card-set': 'onToggleFilterCollectionCardSet',
    'click .btn-nav-back': 'onUserBack',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _numUnreadCardsByFactionId: null,

  /* BACKBONE events */

  initialize() {
    this.model.set('factions', GameDataManager.getInstance().visibleFactionsCollection);
    this._decks = InventoryManager.getInstance().getDecksCollection();
    this._numUnreadCardsByFactionId = {};
    // always reset card set filters upon loading collection page
    ProfileManager.getInstance().profile.set('filterCollectionCardSet', 0);
  },

  onRender() {
    if (this.cardsCollectionCompositeView != null && this.cardsCollectionCompositeView.getCurrentSearchQuery()) {
      this.ui.$searchSubmit.removeClass('active');
      this.ui.$searchClear.addClass('active');
    } else {
      this.ui.$searchSubmit.addClass('active');
      this.ui.$searchClear.removeClass('active');
    }

    this.bindToggles();
  },

  onShow() {
    // analytics call
    Analytics.page('Collection', { path: '/#collection' });

    // blur engine fully
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    this._screenBlurId = UtilsJavascript.generateIncrementalId();
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    // always reset card set filters upon loading collection page
    ProfileManager.getInstance().profile.set('filterCollectionCardSet', 0);

    // create cards collection view
    this.cardsCollectionCompositeView = new CardsCollectionCompositeView({ model: new Backbone.Model(), collection: new Backbone.Collection() });
    this.listenTo(this.cardsCollectionCompositeView, 'childview:select', this.onSelectCard);
    this.listenTo(this.cardsCollectionCompositeView, 'change_page', this.onChangePage);
    this.cardsRegion.show(this.cardsCollectionCompositeView);

    // bind counts of new/unread cards
    GameDataManager.getInstance().visibleFactionsCollection.each((faction) => {
      this.bindFactionUnreadCounts(faction.id);
    });

    // bind settings
    this.bindCanDismissNew();
    this.bindToggles();

    this.listenTo(ProfileManager.getInstance().profile, 'change:showPrismaticsInCollection', this.onShowPrismaticsInCollectionChanged);
    this.listenTo(ProfileManager.getInstance().profile, 'change:showPrismaticsWhileCrafting', this.onShowPrismaticsWhileCraftingChanged);
    this.listenTo(ProfileManager.getInstance().profile, 'change:showSkinsInCollection', this.onShowSkinsInCollectionChanged);
    this.listenTo(ProfileManager.getInstance().profile, 'change:showLoreNotifications', this.onShowLoreNotificationsChanged);
    this.listenTo(ProfileManager.getInstance().profile, 'change:filterCollectionCardSet', this.onFilterCollectionCardSetChanged);
    this.listenTo(InventoryManager.getInstance(), EVENTS.cards_collection_change, this.onCardCollectionChanged);
    this.listenTo(InventoryManager.getInstance(), EVENTS.card_lore_collection_change, this.onCardLoreCollectionChanged);
    this.listenTo(InventoryManager.getInstance(), EVENTS.cosmetics_collection_change, this.onCosmeticsCollectionChanged);

    audio_engine.current().play_music(RSX.music_collection.audio);

    this.startBrowsingMode();
  },

  onPrepareForDestroy() {
    // unblur engine fully
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);
    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
  },

  onDestroy() {
    // fetch any deck changes before cleaning up
    this.fetchDeck(this._deck);

    // cleanup mode
    this._cleanupCurrentMode();
  },

  onCardCollectionChanged(event) {
    const model = event && event.model;

    // update faction tabs based on what changed
    const gameDataCardModel = model && GameDataManager.getInstance().getVisibleCardModelById(model.get('id'));
    if (gameDataCardModel != null) {
      this.bindFactionUnreadCounts(gameDataCardModel.get('factionId'));
    }

    // update whether possible to dismiss new/unread cards
    this.bindCanDismissNew();
  },

  onCosmeticsCollectionChanged(event) {
    const model = event && event.model;
    const cosmeticId = model && model.get('id');
    if (cosmeticId != null && SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId)) {
      const cardId = SDK.Cards.getCardIdForCardSkinId(cosmeticId);

      // update faction tabs based on what changed
      const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
      if (gameDataCardModel != null) {
        this.bindFactionUnreadCounts(gameDataCardModel.get('factionId'));
      }

      // update whether possible to dismiss new/unread cards
      this.bindCanDismissNew();
    }
  },

  onCardLoreCollectionChanged(event) {
    const cardId = event && event.card_id;
    if (cardId != null) {
      // set lore read state of any showing card view that matches card id
      if (this.cardsCollectionCompositeView != null && this._browsingMode) {
        this.cardsCollectionCompositeView.children.each((view) => {
          if (view.model.get('baseCardId') === cardId) {
            if (SDK.CardLore.loreForIdentifier(cardId) != null) {
              view.setLoreRead(!InventoryManager.getInstance().isCardLoreUnread(cardId));
            } else {
              view.setLoreRead(true);
            }
          }
        });
      }
    }

    // update faction tab based on what changed
    const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
    if (gameDataCardModel != null) {
      this.bindFactionUnreadLoreCount(gameDataCardModel.get('factionId'));
    }
  },

  bindFactionUnreadCounts(factionId) {
    this.bindFactionUnreadCardCount(factionId);
    this.bindFactionUnreadLoreCount(factionId);
  },

  bindFactionUnreadCardCount(factionId) {
    const count = this._numUnreadCardsByFactionId[factionId] = InventoryManager.getInstance().getUnreadCardCountForFaction(factionId);
    const $badge = $(`.faction-tab[data-factionid=${factionId}] .badge-unread-cards`);
    if (count > 0) {
      $badge.text(count).addClass('active');
    } else {
      $badge.removeClass('active');
    }
  },

  bindFactionUnreadLoreCount(factionId) {
    const count = ProfileManager.getInstance().profile.get('showLoreNotifications') ? InventoryManager.getInstance().getUnreadCardLoreCountForFaction(factionId) : 0;
    const $badge = $(`.faction-tab[data-factionid=${factionId}] .badge-unread-lore`);
    if (count > 0) {
      $badge.addClass('active');
    } else {
      $badge.removeClass('active');
    }
  },

  bindCanDismissNew() {
    let hasUnreadCards = false;
    const factionIds = Object.keys(this._numUnreadCardsByFactionId);
    for (let i = 0, il = factionIds.length; i < il; i++) {
      if (this._numUnreadCardsByFactionId[factionIds[i]] > 0) {
        hasUnreadCards = true;
        break;
      }
    }
    if (hasUnreadCards) {
      this.ui.$dismissNew.removeClass('disabled');
    } else {
      this.ui.$dismissNew.addClass('disabled');
    }
  },

  bindToggles() {
    this.bindTogglePrismaticsInCollection();
    this.bindTogglePrismaticsWhileCrafting();
    this.bindToggleSkinsInCollection();
    this.bindToggleLoreNotifications();
    this.bindFilterCollectionCardSet();
  },

  bindTogglePrismaticsInCollection() {
    if (ProfileManager.getInstance().profile.get('showPrismaticsInCollection')) {
      this.ui.$togglePrismatics.addClass('active');
    } else {
      this.ui.$togglePrismatics.removeClass('active');
    }
  },

  bindTogglePrismaticsWhileCrafting() {
    if (ProfileManager.getInstance().profile.get('showPrismaticsWhileCrafting')
      && (!this._browsingMode && this._deck == null)) {
      this.ui.$togglePrismaticsCrafting.addClass('active');
    } else {
      this.ui.$togglePrismaticsCrafting.removeClass('active');
    }
  },

  bindToggleSkinsInCollection() {
    if (ProfileManager.getInstance().profile.get('showSkinsInCollection')) {
      this.ui.$toggleSkins.addClass('active');
    } else {
      this.ui.$toggleSkins.removeClass('active');
    }
  },

  bindToggleLoreNotifications() {
    if (ProfileManager.getInstance().profile.get('showLoreNotifications')) {
      this.ui.$toggleLoreNotifications.addClass('active');
    } else {
      this.ui.$toggleLoreNotifications.removeClass('active');
    }
  },

  bindFilterCollectionCardSet() {
    const cardSet = ProfileManager.getInstance().profile.get('filterCollectionCardSet') || 0;
    this.$el.find('.toggle-card-set').removeClass('active');
    this.$el.find(`.toggle-card-set[data-card-set=${cardSet}]`).addClass('active');
  },

  /* PAGING THROUGH CARDS */

  onSearch(event) {
    const $target = $(event.target);
    const value = $.trim($target.prop('value'));
    this.cardsCollectionCompositeView.search(value, true);
    if (value) {
      this.ui.$searchSubmit.removeClass('active');
      this.ui.$searchClear.addClass('active');
    } else {
      this.ui.$searchSubmit.addClass('active');
      this.ui.$searchClear.removeClass('active');
    }
  },

  onSearchClear(event) {
    this.ui.$searchInput.prop('value', '');
    this.cardsCollectionCompositeView.search(null);
    this.ui.$searchSubmit.addClass('active');
    this.ui.$searchClear.removeClass('active');
  },

  onDismissNew(event) {
    // hide unread count badges and dismiss button
    $('.faction-tab .badge-unread-cards').removeClass('active');
    this.ui.$dismissNew.addClass('disabled');

    // dismiss all unread cards in inventory
    InventoryManager.getInstance().dismissAllUnreadCards();

    // set all showing card views as read
    if (this.cardsCollectionCompositeView != null) {
      this.cardsCollectionCompositeView.children.each((view) => { view.setRead(true); });
    }
  },

  onShowLoreNotificationsChanged() {
    this.bindToggleLoreNotifications();

    // bind faction unread lore counts for all factions
    GameDataManager.getInstance().visibleFactionsCollection.each((faction) => {
      this.bindFactionUnreadLoreCount(faction.id);
    });

    // set lore read state of any showing card view
    if (this.cardsCollectionCompositeView != null && this._browsingMode) {
      if (!ProfileManager.getInstance().profile.get('showLoreNotifications')) {
        this.cardsCollectionCompositeView.children.each((view) => {
          view.setLoreRead(true);
        });
      } else {
        this.cardsCollectionCompositeView.children.each((view) => {
          const baseCardId = view.model.get('baseCardId');
          if (SDK.CardLore.loreForIdentifier(baseCardId) != null) {
            view.setLoreRead(!InventoryManager.getInstance().isCardLoreUnread(baseCardId));
          } else {
            view.setLoreRead(true);
          }
        });
      }
    }
  },

  onShowPrismaticsInCollectionChanged() {
    this.bindTogglePrismaticsInCollection();
  },

  onShowPrismaticsWhileCraftingChanged() {
    this.bindTogglePrismaticsWhileCrafting();
  },

  onShowSkinsInCollectionChanged() {
    this.bindToggleSkinsInCollection();
  },

  onFilterCollectionCardSetChanged() {
    this.bindFilterCollectionCardSet();
  },

  onToggleShowPrismatics(event) {
    ProfileManager.getInstance().profile.set('showPrismaticsInCollection', !ProfileManager.getInstance().profile.get('showPrismaticsInCollection'));
  },

  onToggleShowPrismaticsCrafting(event) {
    ProfileManager.getInstance().profile.set('showPrismaticsWhileCrafting', !ProfileManager.getInstance().profile.get('showPrismaticsWhileCrafting'));
  },

  onToggleShowSkins(event) {
    ProfileManager.getInstance().profile.set('showSkinsInCollection', !ProfileManager.getInstance().profile.get('showSkinsInCollection'));
  },

  onToggleShowLoreNotifications(event) {
    ProfileManager.getInstance().profile.set('showLoreNotifications', !ProfileManager.getInstance().profile.get('showLoreNotifications'));
  },

  onToggleFilterCollectionCardSet(event) {
    const cardSet = $(event.currentTarget).data('card-set');
    ProfileManager.getInstance().profile.set('filterCollectionCardSet', cardSet);
  },

  onFactionSelected(event) {
    const $target = $(event.currentTarget);
    const factionId = parseInt($target.data('factionid'));
    this.cardsCollectionCompositeView.gotoFactionById(factionId);
  },

  onPreviousPage() {
    this.cardsCollectionCompositeView.gotoPreviousPage();
  },

  onNextPage() {
    this.cardsCollectionCompositeView.gotoNextPage();
  },

  onChangePage() {
    const currentFaction = this.cardsCollectionCompositeView.getCurrentFaction();
    const enabledFactions = this.cardsCollectionCompositeView.getEnabledFactions();
    GameDataManager.getInstance().visibleFactionsCollection.each((faction) => {
      const factionId = faction.get('id');
      const $factionTab = this.$el.find(`[data-factionid=${factionId}]`);
      if ($factionTab.length > 0) {
        // check whether enabled
        if (enabledFactions != null && enabledFactions.get(factionId) != null) {
          $factionTab.removeClass('disabled');
        } else {
          $factionTab.addClass('disabled');
        }

        // check if is current faction
        if (currentFaction != null && currentFaction.get('id') === factionId) {
          $factionTab.addClass('active');
        } else {
          $factionTab.removeClass('active');
        }
      }
    });
  },

  /* DECK MANIPULATION */

  onNewDeck() {
    if (this._decks) {
      // create new deck model
      const model = new DeckModel();
      // it's ok to set updated_at / updated_at client side on RESTful models for sorting since server will ignore this and set it's own
      model.set('created_at', moment().utc().valueOf());
      model.set('updated_at', moment().utc().valueOf());
      this._decks.add(model);

      // if currently selected filter isn't "all cards" or "standard cards"
      const currentSetSelected = ProfileManager.getInstance().profile.get('filterCollectionCardSet');
      if ((currentSetSelected != 0) && (currentSetSelected != 9)) {
        // reset card set filters upon starting a new deck (to make sure all Generals and owned cards are visible)
        ProfileManager.getInstance().profile.set('filterCollectionCardSet', 0);
      }

      this.bindToggles();

      // play confirm
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

      // start building
      this.startDeckBuildingMode(model);
    }
  },

  onCancelDeck() {
    if (CONFIG.DECK_BUILDING_CONFIRM_CANCEL) {
      // make sure they want to cancel their changes before leaving
      var deckModel = this._deck;
      if (deckModel != null) {
        if (!deckModel.hasChanged()) {
          if (this._decks != null && !deckModel.id) {
            this._decks.remove(deckModel);
          }
          NavigationManager.getInstance().showLastRoute();
        } else {
          const deckName = deckModel.get('name');
          const confirmDialogItemView = new ConfirmDialogItemView({ title: i18next.t('collection.deck_change_cancel_msg', { deckName }) });
          this.listenToOnce(confirmDialogItemView, 'confirm', () => {
            // cancel current deck then submit user exit
            const deckModel = this._deck;
            if (deckModel != null) {
              this._deck = null;
              if (this._decks != null && !deckModel.id) {
                this._decks.remove(deckModel);
              } else {
                deckModel.fetch();
              }
            }

            NavigationManager.getInstance().showLastRoute();
          });
          this.listenToOnce(confirmDialogItemView, 'cancel', () => {
            this.stopListening(confirmDialogItemView);
          });
          NavigationManager.getInstance().showDialogView(confirmDialogItemView);
        }
      }
    } else {
      var deckModel = this._deck;
      if (deckModel != null) {
        this._deck = null;
        if (this._decks != null && !deckModel.id) {
          this._decks.remove(deckModel);
        } else if (deckModel.hasChanged()) {
          deckModel.fetch();
        }1;
      }
      NavigationManager.getInstance().showLastRoute();
    }
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
  },

  onSaveDeck(deckModel) {
    // default to currently building deck
    if (this._deck != null) {
      deckModel = this._deck;
    } else if (deckModel instanceof Backbone.View) {
      deckModel = deckModel.model;
    }

    if (deckModel != null && deckModel.hasGeneral()) {
      if (deckModel === this._deck) {
        this._deck = null;
      }
      this.saveDeck(deckModel);

      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      NavigationManager.getInstance().showLastRoute();
    }
  },

  onDeleteDeck(deckView) {
    const deckName = (deckView && deckView.model && deckView.model.get('name')) || i18next.t('collection.default_deck_desc');
    const confirmDialogItemView = new ConfirmDialogItemView({ title: i18next.t('collection.deck_delete_confirm_msg', { deckName }) });
    this.listenToOnce(confirmDialogItemView, 'confirm', () => {
      this.deleteDeck(deckView);
      if (!this._browsingMode) {
        NavigationManager.getInstance().showLastRoute();
      }
    });
    this.listenToOnce(confirmDialogItemView, 'cancel', () => {
      this.stopListening(confirmDialogItemView);
    });
    NavigationManager.getInstance().showDialogView(confirmDialogItemView);
  },

  onSelectCard(cardView) {
    if (!this._browsingMode) {
      this.sidebarRegion.currentView.selectCardView(cardView);
    } else {
      NavigationManager.getInstance().addMinorRoute('select_card', this.onSelectCard, this, [cardView]);

      const selectedView = new SelectedCardLayout({ model: cardView.model, startOffset: cardView.$el.position() });
      this.selectedCardRegion.show(selectedView);
      this.listenToOnce(selectedView, 'close', () => {
        NavigationManager.getInstance().showLastRoute();
      });
    }
  },

  /**
   * Saves a deck to the user's deck list (net synced).
   */
  saveDeck(deckModel) {
    if (deckModel != null && deckModel.hasGeneral()) {
      // it's ok to set updated_at client side on RESTful models for sorting since server will ignore this and set it's own
      deckModel.set('updated_at', moment().utc().valueOf());

      // set default name when none chosen
      var deckName = deckModel.get('name');
      const isValidName = deckName && deckName !== i18next.t(`${CONFIG.DEFAULT_DECK_NAME}`) && deckName.length < 21;
      if (!isValidName) {
        const deckFactionId = deckModel.get('faction_id');
        const factionData = SDK.FactionFactory.factionForIdentifier(deckFactionId);
        var deckName = factionData && factionData.short_name || i18next.t(`${CONFIG.DEFAULT_DECK_NAME}`);
        const deckModelsOfSameFaction = InventoryManager.getInstance().getDecksCollection().filter((existingDeckModel) => existingDeckModel.get('faction_id') === deckFactionId);
        deckName += ` ${deckModelsOfSameFaction.length}`;
        deckModel.set('name', deckName);
      }

      // _flash is a poor-mans' way to let the deck preview ui know to highlight this for a moment as an updated deck
      deckModel.set('_flash', true);

      // save deck
      const request = deckModel.save();
      request.fail((jqXHR, textStatus, errorThrown) => {
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: i18next.t('collection.deck_save_error_msg') }));
        deckModel.fetch();
      });

      if (deckModel.isValid()) {
        NewPlayerManager.getInstance().setNeedsToSeeStarterDecksTab(false);
      }

      // reset last selected deck data
      CONFIG.resetLastSelectedDeckData();
    } else if (deckModel != null && !deckModel.hasGeneral()) {
      NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: i18next.t('collection.deck_save_no_general_error_msg') }));
    }
  },

  /**
   * Deletes a deck from the user's deck list (net synced).
   */
  deleteDeck(deckModel) {
    // default to currently building deck
    if (this._deck != null) {
      deckModel = this._deck;
    } else if (deckModel instanceof Backbone.View) {
      deckModel = deckModel.model;
    }
    if (this._decks && deckModel != null) {
      deckModel.destroy();
      this._decks.remove(deckModel);
      if (deckModel === this._deck) {
        this._deck = null;
      }

      // reset last selected deck data
      CONFIG.resetLastSelectedDeckData();
    }
  },

  fetchDeck(deckModel) {
    if (deckModel != null && deckModel.hasChanged() && this._decks && this._decks.contains(deckModel)) {
      deckModel.fetch();
    }
  },

  /* MODES */

  onStartCraftingMode(event) {
    this.startCraftingMode();
  },

  onStopCraftingMode(event) {
    NavigationManager.getInstance().showLastRoute();
  },

  _cleanupCurrentDeck() {
    if (this._deck) {
      // delete current deck if it has no general
      if (!this._deck.hasGeneral()) {
        this.deleteDeck(this._deck);
      } else if (this._decks != null && !this._deck.id) {
        this._decks.remove(this._deck);
      } else {
        this.fetchDeck(this._deck);
      }

      this._deck = null;
    }
  },

  _cleanupCurrentMode() {
    this._deck = null;

    if (this.selectedCardRegion instanceof Backbone.Marionette.Region) {
      this.selectedCardRegion.empty();
    }

    // toggle classes
    this.$el.removeClass('deck-building crafting deck-card-back-selecting');
    this.ui.$startCraftingModeButton.removeClass('hidden disabled');
    this.ui.$stopCraftingModeButton.addClass('hidden disabled');

    // mode flags
    this._browsingMode = false;
    this._deckCardBackSelectingMode = false;

    // clear popover
    if (this._craftingDuplicatesTimeout != null) {
      clearTimeout(this._craftingDuplicatesTimeout);
      this._craftingDuplicatesTimeout = null;
    }
    if (this.ui.$startCraftingModeButton.popover) {
      this.ui.$startCraftingModeButton.popover('destroy');
    }
  },

  /**
   * Starts browsing mode, locking cards down and showing decks list in sidebar.
   */
  startBrowsingMode() {
    // fetch or clear any deck changes before cleaning up
    this._cleanupCurrentDeck();

    this._cleanupCurrentMode();

    // add mode to route
    NavigationManager.getInstance().resetMinorRoutes();
    NavigationManager.getInstance().addMinorRoute('collection', this.startBrowsingMode, this);

    this._browsingMode = true;

    // change cards mode
    this.cardsCollectionCompositeView.startBrowsingMode();

    if (InventoryManager.getInstance().hasCollectionDuplicates()) {
      this.ui.$startCraftingModeButton.addClass('highlight');
      // show a popover 1 sec in
      this._craftingDuplicatesTimeout = setTimeout(() => {
        if (this.ui.$startCraftingModeButton.popover) {
          this.ui.$startCraftingModeButton.popover({
            animation: true,
            content: i18next.t('collection.duplicate_cards_msg'),
            template: '<div class="popover disenchant-duplicates-popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
          }).popover('show');
        }

        // hide popover after 4
        this._craftingDuplicatesTimeout = setTimeout(() => {
          if (this.ui.$startCraftingModeButton.popover) {
            this.ui.$startCraftingModeButton.popover('destroy');
          }
        }, 4000);
      }, 1000);
    } else {
      this.ui.$startCraftingModeButton.removeClass('highlight');
      this.ui.$startCraftingModeButton.popover('destroy');
    }

    // show decks list in sidebar
    const decksCollectionCompositeView = new DecksCollectionCompositeView({ collection: this._decks });
    this.listenTo(decksCollectionCompositeView, 'childview:select', (event) => {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      this.startDeckBuildingMode(event.model);
    });
    this.listenTo(decksCollectionCompositeView, 'childview:delete', this.onDeleteDeck);
    this.sidebarRegion.show(decksCollectionCompositeView);

    // focus search
    this.ui.$searchInput.focus();
  },

  /**
   * Starts deck building mode, changing cards to usable and showing deck view in sidebar.
   * @param deck deck model
   */
  startDeckBuildingMode(deck) {
    if (this._deck !== deck || this._deckCardBackSelectingMode) {
      this._cleanupCurrentMode();

      // add mode to route
      NavigationManager.getInstance().addMinorRoute('deck_building', this.startDeckBuildingMode, this, [deck]);

      // get deck
      this._deck = deck;

      // show deck in sidebar
      this.cardsCollectionCompositeView.startDeckBuildingMode(this._deck);
      const deckLayout = new DeckLayout({ model: this._deck });
      deckLayout.listenTo(deckLayout, 'deck_card_back_selecting', () => {
        this.startDeckCardBackSelectingMode(this._deck);
      });
      this.sidebarRegion.show(deckLayout);

      this.$el.addClass('deck-building');

      // focus search
      this.ui.$searchInput.focus();
    }
  },

  /**
   * Starts crafting mode, changing card states to show craftable status and showing crafting view in sidebar.
   */
  startCraftingMode() {
    // cleanup current mode
    this._cleanupCurrentMode();

    // add mode to route
    NavigationManager.getInstance().addMinorRoute('crafting', this.startCraftingMode, this);

    // toggle buttons
    this.ui.$startCraftingModeButton.addClass('hidden disabled');
    this.ui.$stopCraftingModeButton.removeClass('hidden disabled');

    // start crafting in the collection
    this.cardsCollectionCompositeView.startCraftingMode();

    // show crafting in sidebar
    const walletDataClone = _.clone(InventoryManager.getInstance().walletModel.attributes);
    const craftingCompositeView = new CraftingCompositeView({ model: new Backbone.Model(walletDataClone), collection: new Backbone.Collection() });
    this.sidebarRegion.show(craftingCompositeView);

    this.$el.addClass('crafting');

    // focus search
    this.ui.$searchInput.focus();
  },

  /**
   * Starts card back selecting mode, changing card states to show card backs and showing card back selection view in sidebar.
   */
  startDeckCardBackSelectingMode(deck) {
    if (this._deck !== deck || !this._deckCardBackSelectingMode) {
      this._cleanupCurrentMode();

      // add mode to route
      NavigationManager.getInstance().addMinorRoute('deck_card_back_selecting', this.startDeckCardBackSelectingMode, this, [deck]);

      // set mode flag
      this._deckCardBackSelectingMode = true;

      // store deck
      this._deck = deck;

      // start card back selecting in the collection
      this.cardsCollectionCompositeView.startDeckCardBackSelectingMode(this._deck);

      // show deck card back select in sidebar
      const deckCardBackSelectView = new DeckCardBackSelectView({ model: this._deck });
      deckCardBackSelectView.listenTo(deckCardBackSelectView, 'select', this.onSaveDeck.bind(this));
      deckCardBackSelectView.listenTo(deckCardBackSelectView, 'cancel', this.onStopDeckCardBackSelectingMode.bind(this));
      this.sidebarRegion.show(deckCardBackSelectView);

      this.$el.addClass('deck-card-back-selecting');

      // focus search
      this.ui.$searchInput.focus();
    }
  },

  onStopDeckCardBackSelectingMode(event) {
    NavigationManager.getInstance().showLastRoute();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CollectionLayout;
