// pragma PKGS: game

const SDK = require('app/sdk');
const _ = require('underscore');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const EmotesListCompositeView = require('app/ui/views/composite/emotes-list');
const EmoteItemView = require('app/ui/views/item/emote');
const TransitionRegion = require('app/ui/views/regions/transition');
const InventoryManager = require('app/ui/managers/inventory_manager');
const PlayerPopoverLayoutTempl = require('app/ui/templates/layouts/game_player_popover.hbs');

/**
 * Abstract player popover layout.
 * @type {*|Object|Function}
 */
const PlayerPopoverLayout = Backbone.Marionette.LayoutView.extend({

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

  onDestroy() {
    this.hide();
  },

  /* endregion MARIONETTE EVENTS */

  /* region GETTERS / SETTERS */
  /**
   * @returns {Player} sdk player
   */
  getSdkPlayer() {
    return SDK.GameSession.getInstance().getPlayerById(this.model.get('playerId'));
  },

  /* endregion GETTERS / SETTERS */

  /* region SHOW / HIDE */

  show() {
    this.stopShowingEmote();
    this.showOptions();
  },

  showOptions() {
    if (!this.getIsShowingOptions()) {
      this.ui.$playerPopoverContainer.addClass('active');
      // defer adding click anywhere listener to avoid reacting to click that may have caused this to show
      if (this.onClickAnywhereToHideOptionsBound == null) {
        this.onClickAnywhereToHideOptionsBound = this.onClickAnywhereToHideOptions.bind(this);
      }
      _.defer(() => {
        $(`${CONFIG.GAME_SELECTOR}, ${CONFIG.GAMECANVAS_SELECTOR}`).on('click', this.onClickAnywhereToHideOptionsBound);
      });
    }
  },

  getIsShowingOptions() {
    return this.ui.$playerPopoverContainer instanceof $ && this.ui.$playerPopoverContainer.hasClass('active');
  },

  hide() {
    this.stopShowingEmote();
    this.hideOptions();
  },

  hideOptions() {
    if (this.onClickAnywhereToHideOptionsBound != null) {
      $(`${CONFIG.GAME_SELECTOR}, ${CONFIG.GAMECANVAS_SELECTOR}`).off('click', this.onClickAnywhereToHideOptionsBound);
      this.onClickAnywhereToHideOptionsBound = null;
    }
    if (this.ui.$playerPopoverContainer instanceof $) {
      this.ui.$playerPopoverContainer.removeClass('active');
    }
  },

  onClickAnywhereToHideOptions(event) {
    const $target = $(event.target);
    if (this.$el instanceof $ && !this.$el.is($target) && this.$el.has($target).length === 0) {
      // close on click anywhere but this panel
      this.hideOptions();
    }
  },

  /* endregion SHOW / HIDE */

  /* region EMOTES */

  showEmote(emoteId) {
    // stop showing emotes
    this.stopShowingEmote();
    this.hideOptions();

    const emotesData = SDK.CosmeticsFactory.cosmeticForIdentifier(emoteId);
    if (emotesData != null && emotesData.enabled) {
      // create emote view
      const emoteModel = new Backbone.Model(emotesData);
      emoteModel.set('_canUse', true);
      emoteModel.set('_canPurchase', false);
      const emoteView = new EmoteItemView({ model: emoteModel });
      emoteView.listenTo(emoteView, 'select', this.stopShowingEmote.bind(this));
      this.emoteRegion.show(emoteView);

      // delay and then stop showing
      this._showEmoteTimeoutId = setTimeout(() => {
        this.stopShowingEmote();
      }, CONFIG.EMOTE_DURATION * 1000.0);
    }
  },

  stopShowingEmote() {
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
