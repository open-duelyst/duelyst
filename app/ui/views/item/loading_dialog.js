// pragma PKGS: alwaysloaded

const RSX = require('app/data/resources');
const GAME_TIPS = require('app/data/game_tips');
const Animations = require('app/ui/views/animations');
const LoadingDialogViewTempl = require('app/ui/templates/item/loading_dialog.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');

const LoadingDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-loading-dialog',
  className: 'dialog',

  template: LoadingDialogViewTempl,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize() {
    this.model = new Backbone.Model({
      tip: this.options.tip || GAME_TIPS.random_tip(),
      background: this.options.background,
    });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = LoadingDialogItemView;
