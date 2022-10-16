const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const Scene = require('app/view/Scene');
const BottomDeckCardNode = require('app/view/nodes/cards/BottomDeckCardNode');
const UtilsPosition = require('app/common/utils/utils_position');
const UtilsEngine = require('app/common/utils/utils_engine');
const Animations = require('app/ui/views/animations');
const GamePlayerTmpl = require('app/ui/templates/layouts/game_player.hbs');
const Firebase = require('firebase');
const ProfileManager = require('app/ui/managers/profile_manager');
const i18next = require('i18next');
const OpponentPlayerPopoverLayout = require('./game_opponent_player_popover');
const MyPlayerPopoverLayout = require('./game_my_player_popover');

/**
 * Abstract player view, override and assign a playerId to the model.
 */

const GamePlayerLayout = Backbone.Marionette.LayoutView.extend({

  // region Properties

  template: GamePlayerTmpl,

  className: 'player',

  regions: {
    popoverRegion: { selector: '.popover-region' },
  },

  ui: {
    $deck: '.deck',
    $deckCountCurrent: '.deck-count-current',
    $deckCountMax: '.deck-count-max',
    $handCountCurrent: '.hand-count-current',
    $handCountMax: '.hand-count-max',
    $manaCountCurrent: '.mana-count-current',
    $manaCountMax: '.mana-count-max',
    $manaIcons: '.mana-icons',
    $generalPortraitImage: '.general-portrait-image',
    $generalHP: '.general-hp',
    $username: '.user-name',
    $rank: '.user-rank',
    $connectionStatus: '.connection-status',
  },

  events: {
    'click .general-portrait': 'onGeneralPortraitClicked',
    'mouseenter .general-portrait': 'onGeneralPortraitStartHover',
    'mouseleave .general-portrait': 'onGeneralPortraitEndHover',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  selectedCard: null, // card selected by this player
  inspectingCard: null, // card inspected by this player

  templateHelpers: {
    generalId() {
      const general = this.getGeneral();
      if (general != null && general.getPortraitHexResource() != null) {
        return general.getId();
      }
      const playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(this.model.get('playerId'));
      return playerSetupData.generalId;
    },
  },

  // endregion Properties

  initialize() {
  },

  // region Getters/Setters

  /**
   * @returns {Player} view player
   */
  getViewPlayer() {
    const gameLayer = Scene.getInstance().getGameLayer();
    return gameLayer && gameLayer.getPlayerById(this.model.get('playerId'));
  },

  /**
   * @returns {Player} sdk player
   */
  getSdkPlayer() {
    return SDK.GameSession.getInstance().getPlayerById(this.model.get('playerId'));
  },

  /**
   * @returns {Entity} general for player
   */
  getGeneral() {
    return SDK.GameSession.getInstance().getGeneralForPlayerId(this.model.get('playerId'));
  },

  // endregion Getters/Setters

  /* region LAYOUT */

  onResize() {
    const sdkPlayer = this.getSdkPlayer();
    const sdkPlayerId = sdkPlayer.getPlayerId();
    let position;
    if (sdkPlayerId === SDK.GameSession.getInstance().getPlayer2().getPlayerId()) {
      position = UtilsEngine.getPlayer2FramePositionForCSS();
    } else {
      position = UtilsEngine.getPlayer1FramePositionForCSS();
    }
    this.setPosition(position);

    // when my player, show deck count under replace
    if (sdkPlayerId === SDK.GameSession.getInstance().getMyPlayerId()) {
      const cardsStartPosition = UtilsEngine.getCardsInHandStartPositionForCSS();
      const deckCountX = -position.x + cardsStartPosition.x - CONFIG.HAND_CARD_SIZE * 1.5 - 5.0;
      const deckCountY = -position.y + UtilsEngine.getGSIWinHeight() - cardsStartPosition.y + 10.0;
      this.ui.$deck.css(
        'transform',
        `translate(${deckCountX / 10.0}rem, ${deckCountY / 10.0}rem)`,
      );
    } else {
      this.ui.$deck.css('transform', '');
    }
  },

  setPosition(position) {
    if (!UtilsPosition.getPositionsAreEqual(this._position, position)) {
      this._position = position;
      if (position != null) {
        this.$el.css('transform', `translate(${position.x / 10.0}rem, ${position.y / 10.0}rem)`);
      } else {
        this.$el.css('transform', '');
      }
    }
  },

  /* endregion LAYOUT */

  /* region MARIONETTE EVENTS */

  onRender() {
    // rebind player properties that do not require action state
    this.bindPlayerNonActionProperties();

    // rebind counts that update in response to actions
    this.bindPlayerByAction();
  },

  onShow() {
    if (!SDK.GameSession.getInstance().isChallenge()) {
      // setup player popover
      if ((!SDK.GameSession.getInstance().getIsSpectateMode() && this.model.get('playerId') === SDK.GameSession.getInstance().getMyPlayerId()) || SDK.GameSession.getInstance().isSandbox()) {
        this.popoverView = new MyPlayerPopoverLayout({ model: new Backbone.Model({ playerId: this.model.get('playerId') }) });
      } else {
        this.popoverView = new OpponentPlayerPopoverLayout({ model: new Backbone.Model({ playerId: this.model.get('playerId') }) });
      }
      this.popoverRegion.show(this.popoverView);
    }

    // listen to game events
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_start_turn, this.onShowStartTurn);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_rollback, this.onShowRollback);
      this.listenTo(gameLayer.getEventBus(), EVENTS.before_show_action, this.onBeforeShowAction);
      this.listenTo(gameLayer.getEventBus(), EVENTS.after_show_action, this.onAfterShowAction);
      this.listenTo(gameLayer.getEventBus(), EVENTS.inspect_card_start, this.onInspectCardStart);
      this.listenTo(gameLayer.getEventBus(), EVENTS.inspect_card_stop, this.onInspectCardStop);
      this.listenTo(gameLayer.getEventBus(), EVENTS.game_selection_changed, this.onSelectionChanged);
    }

    // listen to global events
    this.listenTo(ProfileManager.getInstance().profile, 'change:showPlayerDetails', this.bindUser);
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.listenTo(SDK.NetworkManager.getInstance().getEventBus(), EVENTS.opponent_connection_status_changed, this.bindConnectionStatus);

    // rebind player properties that do not require action state
    this.bindPlayerNonActionProperties();

    // rebind counts that update in response to actions
    this.bindPlayerByAction();
  },

  onDestroy() {
    // remove firebase models
    if (this._firebase_rank_model != null) {
      this._firebase_rank_model.off();
      this._firebase_rank_model = null;
    }
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENT LISTENERS */

  onShowEndTurn(event) {
    this.bindPlayerNonActionProperties();
  },
  onShowStartTurn(event) {
    this.bindPlayerNonActionProperties();
  },
  onShowRollback(event) {
    this.bindPlayerNonActionProperties();
    this.bindPlayerByAction();
  },

  onBeforeShowAction(event) {
    const { action } = event;

    // bind mana/deck before action for play card action
    if (action instanceof SDK.PlayCardAction) {
      this.bindMana();
      this.bindDeck();
    }
  },

  onAfterShowAction(event) {
    const { action } = event;

    // rebind counts that update in response to actions
    this.bindGeneralHP();

    // bind mana/deck after action when not a play card action
    if (!(action instanceof SDK.PlayCardAction)) {
      this.bindMana();
      this.bindDeck();
    }
  },

  onInspectCardStart(event) {
    const scene = Scene.getInstance();
    const gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null && gameLayer.getIsTurnForPlayer(this.getViewPlayer())) {
      let card;
      let isNewCard;
      if (event) {
        card = event.card;
        isNewCard = event.isNewCard;
      }

      // card has not been played yet, so is in hand
      if (card instanceof SDK.Card && !isNewCard && !card.getIsPlayed()) {
        this.inspectingCard = card;
        // show mana cost when not selecting a card and card is own
        if (!this.selectedCard && card.isOwnedBy(this.getSdkPlayer())) {
          this._showManaCost(card);
        }
      } else {
        // clear inspecting
        this.onInspectCardStop();
      }
    }
  },

  onInspectCardStop() {
    if (this.inspectingCard != null) {
      this.inspectingCard = null;

      // remove mana cost when not selecting a card
      if (!this.selectedCard) {
        this._removeManaCost();
      }
    }
  },

  onSelectionChanged(event) {
    const selection = event && event.selection;
    let showingManaCost;
    if (selection instanceof BottomDeckCardNode) {
      const card = selection.getSdkCard();
      if (card instanceof SDK.Card) {
        const scene = Scene.getInstance();
        const gameLayer = scene != null && scene.getGameLayer();
        if (gameLayer != null && gameLayer.getIsTurnForPlayer(this.getViewPlayer())) {
          // card has not been played yet, so is in hand
          if (!selection.getIsPlayed() && selection.isOwnedBy(this.getSdkPlayer())) {
            showingManaCost = true;
            this._showManaCost(card);
          }

          this.selectedCard = card;
        }
      }
    }

    if (!(selection instanceof BottomDeckCardNode) || !showingManaCost) {
      // stop showing selected card
      if (this.selectedCard != null) {
        this.selectedCard = null;
        this._removeManaCost();

        // inspect when there is a card waiting to be inspected
        if (this.inspectingCard) {
          this._showManaCost(this.inspectingCard);
        }
      }
    }
  },

  /* endregion EVENT LISTENERS */

  // region Binding Data

  /**
   * Binds all data to ui that doesn't need action state.
   */
  bindPlayerNonActionProperties() {
    this.bindUser();
    this.bindGeneral();
    this.bindIsCurrentPlayer();
    this.onResize();
  },

  /**
   * Binds all data to ui that MAY use action state.
   */
  bindPlayerByAction() {
    this.bindGeneralHP();
    this.bindMana();
    this.bindDeck();
  },

  bindIsCurrentPlayer() {
    if (this.getSdkPlayer().getIsCurrentPlayer()) this.$el.addClass('current-player');
    else this.$el.removeClass('current-player');
  },

  /**
   * Binds user data to ui.
   */
  bindUser() {
    const player = this.getSdkPlayer();
    // pull username from player or from my player
    const username = player.getUsername() || SDK.GameSession.getInstance().getMyPlayer().getUsername();
    this.ui.$username.text(username);

    // update my player or opponent player
    if (this.getSdkPlayer().getPlayerId() != SDK.GameSession.getInstance().getMyPlayerId()) {
      this.$el.addClass('opponent-player');
      this.$el.removeClass('my-player');
    } else {
      this.$el.removeClass('opponent-player');
      this.$el.addClass('my-player');
    }

    // show or hide player details
    if (ProfileManager.getInstance().get('showPlayerDetails')) {
      this.$el.addClass('show-player-details');
    } else {
      this.$el.removeClass('show-player-details');
    }

    // update rank
    this.bindRank();

    // update connection
    this.bindConnectionStatus();
  },

  bindRank() {
    if (this._firebase_rank_model != null) {
      this._firebase_rank_model.off();
      this._firebase_rank_model = null;
    }

    if (SDK.GameSession.getInstance().isRanked()) {
      // show rank for ranked games
      this._firebase_rank_model = new Firebase(process.env.FIREBASE_URL).child('user-ranking').child(this.model.get('playerId')).child('current')
        .child('rank')
        .once('value', (snapshot) => {
          try {
            this.ui.$rank.text(snapshot.val());
          } catch (error) {
          //
            console.error('There was an error binding user ranking in-game.', error);
          }
        });
    } else {
      // remove rank
      this.ui.$rank.remove();
    }
  },

  bindConnectionStatus() {
    // in non-multiplayer games or for my player, connection status is not relevant
    if (!SDK.GameType.isMultiplayerGameType(SDK.GameSession.getInstance().getGameType()) || SDK.GameSession.getInstance().getIsSpectateMode() || this.getSdkPlayer().getPlayerId() == SDK.GameSession.getInstance().getMyPlayerId()) {
      this.ui.$connectionStatus.remove();
    } else if (SDK.NetworkManager.getInstance().isOpponentConnected) {
      this.ui.$connectionStatus.addClass('connected');
      this.ui.$connectionStatus.attr('data-status-msg', i18next.t('game_ui.connected_label'));
    } else {
      this.ui.$connectionStatus.removeClass('connected');
      this.ui.$connectionStatus.attr('data-status-msg', i18next.t('game_ui.disconnected_label'));
    }
  },

  /**
   * Binds deck and hand data from sdk to ui.
   */
  bindDeck() {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    const action = gameLayer && gameLayer.getLastShownSdkStateRecordingAction();
    const sdkPlayer = this.getSdkPlayer();
    const stateAtAction = sdkPlayer.getActionStateRecord().getStateAtAction(action);
    const currDeckSize = stateAtAction.numCards;
    const currHandSize = stateAtAction.numCardsInHand;
    const maxHandSize = CONFIG.MAX_HAND_SIZE;
    const maxDeckSize = SDK.GameSession.getInstance().isGauntlet() ? CONFIG.MAX_DECK_SIZE_GAUNTLET : CONFIG.MAX_DECK_SIZE;

    this.ui.$deckCountCurrent.text(currDeckSize);
    this.ui.$deckCountMax.text(maxDeckSize);
    this.ui.$handCountCurrent.text(currHandSize);
    this.ui.$handCountMax.text(maxHandSize);
  },

  /**
   * Binds mana data from sdk to ui.
   */
  bindMana() {
    const sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer) {
      let currMana;
      let currMaxMana;
      const maxMana = CONFIG.MAX_MANA;
      const isMyPlayer = sdkPlayer === SDK.GameSession.getInstance().getMyPlayer();

      if (isMyPlayer) {
        // for my player get mana direct from sdk
        // we don't want to delay showing my player's mana changes
        currMana = sdkPlayer.getRemainingMana();
        currMaxMana = sdkPlayer.getMaximumMana();
      } else {
        // for opponent player get mana from state at action
        const scene = Scene.getInstance();
        const gameLayer = scene && scene.getGameLayer();
        const action = gameLayer && gameLayer.getLastShownSdkStateRecordingAction();
        const stateAtAction = sdkPlayer.getActionStateRecord().getStateAtAction(action);
        currMana = stateAtAction.remainingMana;
        currMaxMana = stateAtAction.maximumMana;
      }

      this.ui.$manaCountCurrent.text(currMana);
      this.ui.$manaCountMax.text(sdkPlayer.getBaseMaximumMana());

      // show mana icons
      const $icons = this.ui.$manaIcons;
      const iconCount = $icons.children().length;
      if (iconCount != maxMana) {
        $icons.empty();
        for (var i = 0; i < maxMana; i++) {
          if (i < currMana) {
            $icons.append('<div class=\'mana-icon\'></div>');
          } else {
            $icons.append('<div class=\'mana-icon inactive\'></div>');
          }
        }
      }

      // only show mana icon states for my player
      if (isMyPlayer) {
        const reverseManaIcons = $icons.children().toArray().reverse();
        const missingMana = currMaxMana - currMana;
        const missingMaxMana = maxMana - currMaxMana;
        for (var i = 0; i < maxMana; i++) {
          const $manaIcon = $(reverseManaIcons[i]);
          if (i < missingMaxMana) {
            $manaIcon.addClass('inactive');
          } else {
            $manaIcon.removeClass('inactive');
            if (i < missingMaxMana + missingMana) {
              $manaIcon.addClass('empty');
            } else {
              $manaIcon.removeClass('empty');
            }
          }
        }
      }
    }
  },

  _showManaCost(card) {
    const sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer && sdkPlayer === SDK.GameSession.getInstance().getMyPlayer()) {
      const currMaxMana = sdkPlayer.getMaximumMana();
      const maxMana = CONFIG.MAX_MANA;
      const manaCost = card.getManaCost();
      const manaIcons = this.ui.$manaIcons.children().toArray().reverse();
      let i;

      this._removeManaCost();

      if (!card.getDoesOwnerHaveEnoughManaToPlay()) {
        // owner doesn't have enough mana
        for (i = Math.max(0, maxMana - manaCost); i < maxMana; i++) {
          var $icon = $(manaIcons[i]);
          $icon.addClass('invalid');
        }
      } else {
        // highlight mana
        let manaToShow = manaCost;
        for (i = maxMana - currMaxMana; i < maxMana && manaToShow > 0; i++) {
          var $icon = $(manaIcons[i]);
          if (!$icon.hasClass('empty') && !$icon.hasClass('inactive')) {
            $icon.addClass('select');
            manaToShow--;
          }
        }
      }
    }
  },

  _removeManaCost() {
    const manaIcons = this.ui.$manaIcons.children().toArray();
    for (let i = 0, il = manaIcons.length; i < il; i++) {
      $(manaIcons[i]).removeClass('select invalid');
    }
  },

  /**
   * Binds general data from sdk to ui.
   */
  bindGeneral() {
    // don't bind general HP here, only in response to an action
  },

  bindGeneralHP() {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    const action = gameLayer && gameLayer.getLastShownSdkStateRecordingAction();
    const general = this.getGeneral();
    if (general != null) {
      const stateAtAction = general.getActionStateRecord().getStateAtAction(action);
      this.ui.$generalHP.text(stateAtAction.hp);
    } else {
      this.ui.$generalHP.text(0);
    }
  },

  // endregion Binding Data

  onGeneralPortraitClicked(event) {
    if (!SDK.GameSession.current().getIsSpectateMode() && this.popoverView != null) {
      this.popoverView.show();
    }
  },

  onGeneralPortraitStartHover(event) {
    this.$el.addClass('show-player-details');
  },

  onGeneralPortraitEndHover(event) {
    if (!ProfileManager.getInstance().profile.get('showPlayerDetails')) {
      this.$el.removeClass('show-player-details');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GamePlayerLayout;
