'use strict';

var Templ = require('app/ui/templates/item/announcement_modal.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var NewsManager = require('app/ui/managers/news_manager');
var Animations = require('app/ui/views/animations');
var openUrl = require('app/common/openUrl');

var AnnouncementModalView = Backbone.Marionette.ItemView.extend({

  id: 'app-announcement-modal',
  className: 'modal duelyst-modal announcement',
  template: Templ,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  onDestroy: function () {
    var itemId = this.model.get('id') || this.model.firebase.key();
    NewsManager.getInstance().markNewsItemAsRead(itemId);
  },

  onShow: function () {
    this.$el.find('.modal-body').find('a').click(function (e) {
      openUrl($(e.currentTarget).attr('href'));
      e.stopPropagation();
      e.preventDefault();
    });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = AnnouncementModalView;
