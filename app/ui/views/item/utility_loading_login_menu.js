const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const UtilityLoadingLoginMenuTmpl = require('app/ui/templates/item/utility_loading_login_menu.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');
const UtilsEngine = require('../../../common/utils/utils_engine');
const UtilityMenuItemView = require('./utility_menu');
const EscMainMenuItemView = require('./esc_main_menu');

/**
 * Loading/login utility menu that gives ability to open main esc menu.
 */
const UtilityLoadingLoginMenuItemView = UtilityMenuItemView.extend({

  id: 'app-utility-desktop-menu',

  template: UtilityLoadingLoginMenuTmpl,

  events: {
    'click button.menu': 'toggleEscMainMenu',
  },

  toggleEscMainMenu() {
    NavigationManager.getInstance().toggleModalViewByClass(EscMainMenuItemView);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = UtilityLoadingLoginMenuItemView;
