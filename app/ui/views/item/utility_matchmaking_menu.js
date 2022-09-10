const Logger = require('app/common/logger');
const NavigationManager = require('app/ui/managers/navigation_manager');
const UtilityMenuItemView = require('./utility_menu');

/**
 * Matchmaking utility menu that shows basic utilities.
 */
const UtilityMatchmakingMenuItemView = UtilityMenuItemView.extend({

  id: 'app-utility-matchmaking-menu',

});

// Expose the class either via CommonJS or the global object
module.exports = UtilityMatchmakingMenuItemView;
