const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const UtilityGameMenuTmpl = require('app/ui/templates/item/utility_game_menu.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');
const UtilsEngine = require('../../../common/utils/utils_engine');
const UtilityMenuItemView = require('./utility_menu');
const GameMenuItemView = require('./esc_game_menu');

/**
 * In game utility menu that shows basic utilities plus buttons to exit/concede.
 */
const UtilityGameMenuItemView = UtilityMenuItemView.extend({

  id: 'app-utility-game-menu',

  template: UtilityGameMenuTmpl,

  events: {
    'click button.menu': 'toggleGameMenu',
  },

  /* region LAYOUT */

  onResize() {
    const endPosition = UtilsEngine.getCardsInHandEndPositionForCSS();
    this.$el.css(
      'transform',
      `translate(${(endPosition.x - 40.0) / 10.0}rem, ${(-endPosition.y + CONFIG.HAND_CARD_SIZE * 0.54) / 10.0}rem)`,
    );
  },

  /* endregion LAYOUT */

  toggleGameMenu() {
    NavigationManager.getInstance().toggleModalViewByClass(GameMenuItemView);
  },

  /* region MARIONETTE EVENTS */

  /* endregion MARIONETTE EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = UtilityGameMenuItemView;
