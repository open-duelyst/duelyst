const Templ = require('app/ui/templates/item/announcement_modal.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');
const NewsManager = require('app/ui/managers/news_manager');
const Animations = require('app/ui/views/animations');
const openUrl = require('app/common/openUrl');

const AnnouncementModalView = Backbone.Marionette.ItemView.extend({

  id: 'app-announcement-modal',
  className: 'modal duelyst-modal announcement',
  template: Templ,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  onDestroy() {
    const itemId = this.model.get('id') || this.model.firebase.key();
    NewsManager.getInstance().markNewsItemAsRead(itemId);
  },

  onShow() {
    this.$el.find('.modal-body').find('a').click((e) => {
      openUrl($(e.currentTarget).attr('href'));
      e.stopPropagation();
      e.preventDefault();
    });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = AnnouncementModalView;
