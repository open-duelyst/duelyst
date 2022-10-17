'use strict';

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var BottomDeckCardNode = require('app/view/nodes/cards/BottomDeckCardNode');
var UtilsPosition = require('app/common/utils/utils_position');
var UtilsEngine = require('app/common/utils/utils_engine');
var Animations = require('app/ui/views/animations');
var GamePlayerTmpl = require('app/ui/templates/layouts/game_player.hbs');
var Firebase = require('firebase');
var ProfileManager = require('app/ui/managers/profile_manager');
var i18next = require('i18next');
var OpponentPlayerPopoverLayout = require('./game_opponent_player_popover');
var MyPlayerPopoverLayout = require('./game_my_player_popover');

/**
 * Abstract player view, override and assign a playerId to the model.
 */

var GamePlayerLayout = Backbone.Marionette.LayoutView.extend({

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
    generalId: function () {
      var general = this.getGeneral();
      if (general != null && general.getPortraitHexResource() != null) {
        return general.getId();
      } else {
        var playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(this.model.get('playerId'));
        return playerSetupData.generalId;
      }
    },
  },

  // endregion Properties

  initialize: function () {
  },

  // region Getters/Setters

  /**
   * @returns {Player} view player
   */
  getViewPlayer: function () {
    var gameLayer = Scene.getInstance().getGameLayer();
    return gameLayer && gameLayer.getPlayerById(this.model.get('playerId'));
  },

  /**
   * @returns {Player} sdk player
   */
  getSdkPlayer: function () {
    return SDK.GameSession.getInstance().getPlayerById(this.model.get('playerId'));
  },

  /**
   * @returns {Entity} general for player
   */
  getGeneral: function () {
    return SDK.GameSession.getInstance().getGeneralForPlayerId(this.model.get('playerId'));
  },

  // endregion Getters/Setters

  /* region LAYOUT */

  onResize: function () {
    var sdkPlayer = this.getSdkPlayer();
    var sdkPlayerId = sdkPlayer.getPlayerId();
    var position;
    if (sdkPlayerId === SDK.GameSession.getInstance().getPlayer2().getPlayerId()) {
      position = UtilsEngine.getPlayer2FramePositionForCSS();
    } else {
      position = UtilsEngine.getPlayer1FramePositionForCSS();
    }
    this.setPosition(position);

    // when my player, show deck count under replace
    if (sdkPlayerId === SDK.GameSession.getInstance().getMyPlayerId()) {
      var cardsStartPosition = UtilsEngine.getCardsInHandStartPositionForCSS();
      var deckCountX = -position.x + cardsStartPosition.x - CONFIG.HAND_CARD_SIZE * 1.5 - 5.0;
      var deckCountY = -position.y + UtilsEngine.getGSIWinHeight() - cardsStartPosition.y + 10.0;
      this.ui.$deck.css(
        'transform',
        'translate(' + deckCountX / 10.0 + 'rem, ' + deckCountY / 10.0 + 'rem)',
      );
    } else {
      this.ui.$deck.css('transform', '');
    }
  },

  setPosition: function (position) {
    if (!UtilsPosition.getPositionsAreEqual(this._position, position)) {
      this._position = position;
      if (position != null) {
        this.$el.css('transform', 'translate(' + position.x / 10.0 + 'rem, ' + position.y / 10.0 + 'rem)');
      } else {
        this.$el.css('transform', '');
      }
    }
  },

  /* endregion LAYOUT */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    // rebind player properties that do not require action state
    this.bindPlayerNonActionProperties();

    // rebind counts that update in response to actions
    this.bindPlayerByAction();
  },

  onShow: function () {
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
    var scene = Scene.getInstance();
    var gameLayer = scene && scene.getGameLayer();
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

  onDestroy: function () {
    // remove firebase models
    if (this._firebase_rank_model != null) {
      this._firebase_rank_model.off();
      this._firebase_rank_model = null;
    }
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENT LISTENERS */

  onShowEndTurn: function (event) {
    this.bindPlayerNonActionProperties();
  },
  onShowStartTurn: function (event) {
    this.bindPlayerNonActionProperties();
  },
  onShowRollback: function (event) {
    this.bindPlayerNonActionProperties();
    this.bindPlayerByAction();
  },

  onBeforeShowAction: function (event) {
    var action = event.action;

    // bind mana/deck before action for play card action
    if (action instanceof SDK.PlayCardAction) {
      this.bindMana();
      this.bindDeck();
    }
  },

  onAfterShowAction: function (event) {
    var action = event.action;

    // rebind counts that update in response to actions
    this.bindGeneralHP();

    // bind mana/deck after action when not a play card action
    if (!(action instanceof SDK.PlayCardAction)) {
      this.bindMana();
      this.bindDeck();
    }
  },

  onInspectCardStart: function (event) {
    var scene = Scene.getInstance();
    var gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null && gameLayer.getIsTurnForPlayer(this.getViewPlayer())) {
      var card;
      var isNewCard;
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

  onInspectCardStop: function () {
    if (this.inspectingCard != null) {
      this.inspectingCard = null;

      // remove mana cost when not selecting a card
      if (!this.selectedCard) {
        this._removeManaCost();
      }
    }
  },

  onSelectionChanged: function (event) {
    var selection = event && event.selection;
    var showingManaCost;
    if (selection instanceof BottomDeckCardNode) {
      var card = selection.getSdkCard();
      if (card instanceof SDK.Card) {
        var scene = Scene.getInstance();
        var gameLayer = scene != null && scene.getGameLayer();
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
  bindPlayerNonActionProperties: function () {
    this.bindUser();
    this.bindGeneral();
    this.bindIsCurrentPlayer();
    this.onResize();
  },

  /**
   * Binds all data to ui that MAY use action state.
   */
  bindPlayerByAction: function () {
    this.bindGeneralHP();
    this.bindMana();
    this.bindDeck();
  },

  bindIsCurrentPlayer: function () {
    if (this.getSdkPlayer().getIsCurrentPlayer())
      this.$el.addClass('current-player');
    else
      this.$el.removeClass('current-player');
  },

  /**
   * Binds user data to ui.
   */
  bindUser: function () {
    var player = this.getSdkPlayer();
    // pull username from player or from my player
    var username = player.getUsername() || SDK.GameSession.getInstance().getMyPlayer().getUsername();
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

  bindRank: function () {
    if (this._firebase_rank_model != null) {
      this._firebase_rank_model.off();
      this._firebase_rank_model = null;
    }

    if (SDK.GameSession.getInstance().isRanked()) {
      // show rank for ranked games
      this._firebase_rank_model = new Firebase(process.env.FIREBASE_URL).child('user-ranking').child(this.model.get('playerId')).child('current')
        .child('rank')
        .once('value', function (snapshot) {
          try {
            this.ui.$rank.text(snapshot.val());
          } catch (error) {
          //
            console.error('There was an error binding user ranking in-game.', error);
          }
        }.bind(this));
    } else {
      // remove rank
      this.ui.$rank.remove();
    }
  },

  bindConnectionStatus: function () {
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
  bindDeck: function () {
    var scene = Scene.getInstance();
    var gameLayer = scene && scene.getGameLayer();
    var action = gameLayer && gameLayer.getLastShownSdkStateRecordingAction();
    var sdkPlayer = this.getSdkPlayer();
    var stateAtAction = sdkPlayer.getActionStateRecord().getStateAtAction(action);
    var currDeckSize = stateAtAction.numCards;
    var currHandSize = stateAtAction.numCardsInHand;
    var maxHandSize = CONFIG.MAX_HAND_SIZE;
    var maxDeckSize = SDK.GameSession.getInstance().isGauntlet() ? CONFIG.MAX_DECK_SIZE_GAUNTLET : CONFIG.MAX_DECK_SIZE;

    this.ui.$deckCountCurrent.text(currDeckSize);
    this.ui.$deckCountMax.text(maxDeckSize);
    this.ui.$handCountCurrent.text(currHandSize);
    this.ui.$handCountMax.text(maxHandSize);
  },

  /**
   * Binds mana data from sdk to ui.
   */
  bindMana: function () {
    var sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer) {
      var currMana;
      var currMaxMana;
      var maxMana = CONFIG.MAX_MANA;
      var isMyPlayer = sdkPlayer === SDK.GameSession.getInstance().getMyPlayer();

      if (isMyPlayer) {
        // for my player get mana direct from sdk
        // we don't want to delay showing my player's mana changes
        currMana = sdkPlayer.getRemainingMana();
        currMaxMana = sdkPlayer.getMaximumMana();
      } else {
        // for opponent player get mana from state at action
        var scene = Scene.getInstance();
        var gameLayer = scene && scene.getGameLayer();
        var action = gameLayer && gameLayer.getLastShownSdkStateRecordingAction();
        var stateAtAction = sdkPlayer.getActionStateRecord().getStateAtAction(action);
        currMana = stateAtAction.remainingMana;
        currMaxMana = stateAtAction.maximumMana;
      }

      this.ui.$manaCountCurrent.text(currMana);
      this.ui.$manaCountMax.text(sdkPlayer.getBaseMaximumMana());

      // show mana icons
      var $icons = this.ui.$manaIcons;
      var iconCount = $icons.children().length;
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
        var reverseManaIcons = $icons.children().toArray().reverse();
        var missingMana = currMaxMana - currMana;
        var missingMaxMana = maxMana - currMaxMana;
        for (var i = 0; i < maxMana; i++) {
          var $manaIcon = $(reverseManaIcons[i]);
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

  _showManaCost: function (card) {
    var sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer && sdkPlayer === SDK.GameSession.getInstance().getMyPlayer()) {
      var currMaxMana = sdkPlayer.getMaximumMana();
      var maxMana = CONFIG.MAX_MANA;
      var manaCost = card.getManaCost();
      var manaIcons = this.ui.$manaIcons.children().toArray().reverse();
      var i;

      this._removeManaCost();

      if (!card.getDoesOwnerHaveEnoughManaToPlay()) {
        // owner doesn't have enough mana
        for (i = Math.max(0, maxMana - manaCost); i < maxMana; i++) {
          var $icon = $(manaIcons[i]);
          $icon.addClass('invalid');
        }
      } else {
        // highlight mana
        var manaToShow = manaCost;
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

  _removeManaCost: function () {
    var manaIcons = this.ui.$manaIcons.children().toArray();
    for (var i = 0, il = manaIcons.length; i < il; i++) {
      $(manaIcons[i]).removeClass('select invalid');
    }
  },

  /**
   * Binds general data from sdk to ui.
   */
  bindGeneral: function () {
    // don't bind general HP here, only in response to an action
  },

  bindGeneralHP: function () {
    var scene = Scene.getInstance();
    var gameLayer = scene && scene.getGameLayer();
    var action = gameLayer && gameLayer.getLastShownSdkStateRecordingAction();
    var general = this.getGeneral();
    if (general != null) {
      var stateAtAction = general.getActionStateRecord().getStateAtAction(action);
      this.ui.$generalHP.text(stateAtAction.hp);
    } else {
      this.ui.$generalHP.text(0);
    }
  },

  // endregion Binding Data

  onGeneralPortraitClicked: function (event) {
    if (!SDK.GameSession.current().getIsSpectateMode() && this.popoverView != null) {
      this.popoverView.show();
    }
  },

  onGeneralPortraitStartHover: function (event) {
    this.$el.addClass('show-player-details');
  },

  onGeneralPortraitEndHover: function (event) {
    if (!ProfileManager.getInstance().profile.get('showPlayerDetails')) {
      this.$el.removeClass('show-player-details');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GamePlayerLayout;
