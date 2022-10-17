'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var UtilityLoadingLoginMenuTmpl = require('app/ui/templates/item/utility_loading_login_menu.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var UtilsEngine = require('../../../common/utils/utils_engine');
var UtilityMenuItemView = require('./utility_menu');
var EscMainMenuItemView = require('./esc_main_menu');

/**
 * Loading/login utility menu that gives ability to open main esc menu.
 */
var UtilityLoadingLoginMenuItemView = UtilityMenuItemView.extend({

  id: 'app-utility-desktop-menu',

  template: UtilityLoadingLoginMenuTmpl,

  events: {
    'click button.menu': 'toggleEscMainMenu',
  },

  toggleEscMainMenu: function () {
    NavigationManager.getInstance().toggleModalViewByClass(EscMainMenuItemView);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = UtilityLoadingLoginMenuItemView;
