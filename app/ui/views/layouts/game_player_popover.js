// pragma PKGS: game

'use strict';

var SDK = require('app/sdk');
var _ = require('underscore');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var EmotesListCompositeView = require('app/ui/views/composite/emotes-list');
var EmoteItemView = require('app/ui/views/item/emote');
var TransitionRegion = require('app/ui/views/regions/transition');
var InventoryManager = require('app/ui/managers/inventory_manager');
var PlayerPopoverLayoutTempl = require('app/ui/templates/layouts/game_player_popover.hbs');

/**
 * Abstract player popover layout.
 * @type {*|Object|Function}
 */
var PlayerPopoverLayout = Backbone.Marionette.LayoutView.extend({

  className: 'player-popover',

  template: PlayerPopoverLayoutTempl,

  regions: {
    emotesListRegion: { selector: '.emotes-list-region', regionClass: TransitionRegion },
    emoteRegion: { selector: '.emote-region', regionClass: TransitionRegion },
  },

  ui: {
    $playerPopoverContainer: '.player-popover-container',
  },

  /* region MARIONETTE EVENTS */

  onDestroy: function () {
    this.hide();
  },

  /* endregion MARIONETTE EVENTS */

  /* region GETTERS / SETTERS */
  /**
   * @returns {Player} sdk player
   */
  getSdkPlayer: function () {
    return SDK.GameSession.getInstance().getPlayerById(this.model.get('playerId'));
  },

  /* endregion GETTERS / SETTERS */

  /* region SHOW / HIDE */

  show: function () {
    this.stopShowingEmote();
    this.showOptions();
  },

  showOptions: function () {
    if (!this.getIsShowingOptions()) {
      this.ui.$playerPopoverContainer.addClass('active');
      // defer adding click anywhere listener to avoid reacting to click that may have caused this to show
      if (this.onClickAnywhereToHideOptionsBound == null) {
        this.onClickAnywhereToHideOptionsBound = this.onClickAnywhereToHideOptions.bind(this);
      }
      _.defer(function () {
        $(CONFIG.GAME_SELECTOR + ', ' + CONFIG.GAMECANVAS_SELECTOR).on('click', this.onClickAnywhereToHideOptionsBound);
      }.bind(this));
    }
  },

  getIsShowingOptions: function () {
    return this.ui.$playerPopoverContainer instanceof $ && this.ui.$playerPopoverContainer.hasClass('active');
  },

  hide: function () {
    this.stopShowingEmote();
    this.hideOptions();
  },

  hideOptions: function () {
    if (this.onClickAnywhereToHideOptionsBound != null) {
      $(CONFIG.GAME_SELECTOR + ', ' + CONFIG.GAMECANVAS_SELECTOR).off('click', this.onClickAnywhereToHideOptionsBound);
      this.onClickAnywhereToHideOptionsBound = null;
    }
    if (this.ui.$playerPopoverContainer instanceof $) {
      this.ui.$playerPopoverContainer.removeClass('active');
    }
  },

  onClickAnywhereToHideOptions: function (event) {
    var $target = $(event.target);
    if (this.$el instanceof $ && !this.$el.is($target) && this.$el.has($target).length === 0) {
      // close on click anywhere but this panel
      this.hideOptions();
    }
  },

  /* endregion SHOW / HIDE */

  /* region EMOTES */

  showEmote: function (emoteId) {
    // stop showing emotes
    this.stopShowingEmote();
    this.hideOptions();

    var emotesData = SDK.CosmeticsFactory.cosmeticForIdentifier(emoteId);
    if (emotesData != null && emotesData.enabled) {
      // create emote view
      var emoteModel = new Backbone.Model(emotesData);
      emoteModel.set('_canUse', true);
      emoteModel.set('_canPurchase', false);
      var emoteView = new EmoteItemView({ model: emoteModel });
      emoteView.listenTo(emoteView, 'select', this.stopShowingEmote.bind(this));
      this.emoteRegion.show(emoteView);

      // delay and then stop showing
      this._showEmoteTimeoutId = setTimeout(function () {
        this.stopShowingEmote();
      }.bind(this), CONFIG.EMOTE_DURATION * 1000.0);
    }
  },

  stopShowingEmote: function () {
    if (this._showEmoteTimeoutId != null) {
      clearTimeout(this._showEmoteTimeoutId);
      this._showEmoteTimeoutId = null;
      if (this.emoteRegion) {
        this.emoteRegion.empty();
      }
    }
  },

  /* endregion EMOTES */

});

// Expose the class either via CommonJS or the global object
module.exports = PlayerPopoverLayout;
