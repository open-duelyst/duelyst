// pragma PKGS: alwaysloaded

// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _NavigationManager = {};
_NavigationManager.instance = null;
_NavigationManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new NavigationManager();
  }
  return this.instance;
};
_NavigationManager.current = _NavigationManager.getInstance;

module.exports = _NavigationManager;

var Promise = require('bluebird');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var UtilsUI = require('app/common/utils/utils_ui');
var audio_engine = require('app/audio/audio_engine');
var RSX = require('app/data/resources');
var Scene = require('app/view/Scene');
var Animations = require('app/ui/views/animations');
var TransitionRegion = require('app/ui/views/regions/transition');
var NotificationsLayout = require('app/ui/views/layouts/notifications');
var ConfirmDialogItemView = require('app/ui/views/item/confirm_dialog');
var ConfirmPurchaseDialogView = require('app/ui/views2/shop/confirm_purchase_dialog');
var LoadingDialogItemView = require('app/ui/views/item/loading_dialog');
var MaintenanceAnnouncementItemView = require('app/ui/views/item/maintenance_announcement');
var _ = require('underscore');
var ServerStatusManager = require('./server_status_manager');
var ChatManager = require('./chat_manager');
var NotificationsManager = require('./notifications_manager');
var Manager = require('./manager');

var NavigationManager = Manager.extend({

  _appRegion: null,
  _mainRegion: null,
  _horizontalRegion: null,
  _verticalRegion: null,
  _overlayRegion: null,
  _gamecanvasRegion: null,
  _contentRegion: null,
  _modalRegion: null,
  _notificationsRegion: null,
  _blurringModal: false,
  _previousBlurProgramKey: null,
  _maintenanceAnnouncementRegion: null,
  _userTriggeredNavigationLocked: false,
  _userTriggeredNavigationLockId: -1,
  _userTriggeredNavigationLockRequests: null,
  _userNavLockIdContent: 'UserNavLockIdContent',
  _userNavLockIdModal: 'UserNavLockIdModal',
  _userNavLockIdDialog: 'UserNavLockIdDialog',
  _majorRouteStack: null,
  _minorRouteStack: null,

  initialize: function () {
    Manager.prototype.initialize.call(this);

    this._userTriggeredNavigationLockRequests = [];
    this._majorRouteStack = [];
    this._minorRouteStack = [];

    // initialize regions
    this._appRegion = new TransitionRegion({ el: CONFIG.APP_SELECTOR });
    this._mainRegion = new TransitionRegion({ el: CONFIG.MAIN_SELECTOR });
    this._horizontalRegion = new TransitionRegion({ el: CONFIG.HORIZONTAL_SELECTOR });
    this._verticalRegion = new TransitionRegion({ el: CONFIG.VERTICAL_SELECTOR });
    this._overlayRegion = new TransitionRegion({ el: CONFIG.OVERLAY_SELECTOR });
    this._gamecanvasRegion = new TransitionRegion({ el: CONFIG.GAMECANVAS_SELECTOR });
    this._contentRegion = new TransitionRegion({ el: CONFIG.CONTENT_SELECTOR });
    this._modalRegion = new TransitionRegion({ el: CONFIG.MODAL_SELECTOR });
    this._utilityRegion = new TransitionRegion({ el: CONFIG.UTILITY_SELECTOR });
    this._notificationsRegion = new TransitionRegion({ el: CONFIG.NOTIFICATIONS_SELECTOR });
    this._maintenanceAnnouncementRegion = new Backbone.Marionette.Region({ el: CONFIG.MAINTENANCE_ANNOUNCEMENTS_SELECTOR });

    // show ui
    this._notificationsRegion.show(new NotificationsLayout());

    // when server status manager connects, show the system status announcement item view that will auto-update based on system status
    ServerStatusManager.getInstance().onReady().then(function () {
      // add maintenance announcement
      this._maintenanceAnnouncementRegion.show(new MaintenanceAnnouncementItemView({ model: ServerStatusManager.getInstance().serverStatusModel }));
    }.bind(this));

    // attach delegate listeners to the app for special buttons
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-cancel', function (event) {
      // request user triggered action
      this.requestUserTriggeredCancel();
    }.bind(this));
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-skip', function (event) {
      // request user triggered action
      this.requestUserTriggeredSkip();
    }.bind(this));
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-exit', function (event) {
      // request user triggered action
      this.requestUserTriggeredExit();
    }.bind(this));
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-confirm', function (event) {
      // request user triggered action
      this.requestUserTriggeredConfirm();
    }.bind(this));

    // attach delegate listeners to the app for button sounds
    $(CONFIG.APP_SELECTOR).on('mouseenter', 'a, button, .btn', function () {
      // play auto sound for hover
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }.bind(this));
    $(CONFIG.APP_SELECTOR).on('mouseup', 'a, button, .btn', function (event) {
      // play auto sound for click
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);
      // blur/un-focus target to remove ability for user to spam a button by pressing enter
      $(event.target).blur();
    }.bind(this));

    // listen for specific key presses
    $(document).on('keyup', function (event) {
      var keyCode = event.which;
      var $target = $(event.target);
      if (keyCode == cc.KEY.escape) {
        // play sound because key presses don't have auto sounds like buttons
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);
        // request user triggered action
        this.requestUserTriggeredCancel();
      } else if (keyCode == cc.KEY.space) {
        if (!$target.is('input')) {
          // play sound because key presses don't have auto sounds like buttons
          audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);
          // request user triggered action
          this.requestUserTriggeredSkip();
        }
      } else if (keyCode == cc.KEY.enter) {
        if (!$target.is('a, button, .btn')) {
          // play sound because key presses don't have auto sounds like buttons
          audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);
          // request user triggered action
          this.requestUserTriggeredConfirm();
        }
      }
    }.bind(this));

    // listen for before resize
    this.listenTo(EventBus.getInstance(), EVENTS.before_resize, this.onBeforeResize);
    this.onBeforeResize();

    // this manager does not need to bind to anything
    this.connect();
  },

  /* region LAYOUT */

  onBeforeResize: function () {
    // overlay scrollbars on body
    UtilsUI.overlayScrollbars('body');

    // NOTE: this is really a bad place to put the zendesk widget BUT it's needed because their embed script sucks
    // zendesk setup
    if (!window.zendesk) {
      window.zEmbed && window.zEmbed();
      window.zendesk = true;
    }
  },

  /* endregion LAYOUT */

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);

    this.ready();
  },

  /* endregion CONNECT */

  getCurrentView: function (parentView) {
    return parentView && parentView.currentView;
  },

  getIsShowingView: function (parentView) {
    var currentView = this.getCurrentView(parentView);
    return currentView != null && !currentView.isDestroyed;
  },

  getIsShowingViewClass: function (viewClass, parentView) {
    return this.getIsShowingView(parentView) && this.getCurrentView(parentView) instanceof viewClass;
  },

  /**
   * Destroys all views and layers, except for those in an optional list passed in.
   * @param {Array} [dontDestroy=null] array of views/layers to preserve and not destroy/unload
   */
  destroyAllViewsAndLayers: function (dontDestroy) {
    // unload content view
    var contentView = this.getContentView();
    var contentViewPromise = contentView != null && !_.contains(dontDestroy, contentView) ? this.destroyContentView() : Promise.resolve();

    // unload modal view
    var modalView = this.getModalView();
    var modalViewPromise = modalView != null && !_.contains(dontDestroy, modalView) ? this.destroyModalView() : Promise.resolve();

    // unload modal view
    var dialogView = this.getDialogView();
    var dialogViewPromise = dialogView != null && !_.contains(dontDestroy, dialogView) ? this.destroyDialogView() : Promise.resolve();

    // unload utility view
    var utilityView = this.getUtilityView();
    var utilityViewPromise = utilityView != null && !_.contains(dontDestroy, utilityView) ? this.destroyUtilityView() : Promise.resolve();

    // unload content layer
    var contentLayer = Scene.getInstance().getContent();
    var contentLayerPromise = contentLayer != null && !_.contains(dontDestroy, contentLayer) ? Scene.getInstance().destroyContent() : Promise.resolve();

    // unload overlay layer
    var overlayLayer = Scene.getInstance().getOverlay();
    var overlayLayerPromise = overlayLayer != null && !_.contains(dontDestroy, overlayLayer) ? Scene.getInstance().destroyOverlay() : Promise.resolve();

    return Promise.all([
      contentViewPromise,
      modalViewPromise,
      dialogViewPromise,
      utilityViewPromise,
      contentLayerPromise,
      overlayLayerPromise,
    ]);
  },

  /* region CONTENT */
  // content views are major / horizontal navigation elements that retain flow

  showContentViewByClass: function (viewClass, viewOptions) {
    if (!this.getIsShowingContentViewClass(viewClass)) {
      return this.showContentView(new viewClass(viewOptions));
    } else {
      return Promise.resolve();
    }
  },

  showContentView: function (contentView) {
    // dismiss notifications
    NotificationsManager.getInstance().dismissNotificationsThatCantBeShown();

    // temporarily disable user navigation
    this.requestUserTriggeredNavigationLocked(this._userNavLockIdContent);

    return Promise.all([
      this.destroyModalView(),
      this.destroyUtilityView(),
      this._contentRegion.show(contentView),
    ]).then(function () {
      // unlock user navigation
      this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdContent);

      // show notifications
      NotificationsManager.getInstance().showQueuedNotificationsThatCanBeShown();
    }.bind(this));
  },

  destroyContentView: function () {
    if (this.getContentView() != null) {
      // temporarily disable user navigation
      this.requestUserTriggeredNavigationLocked(this._userNavLockIdContent);

      return Promise.all([
        this.destroyModalView(),
        this.destroyUtilityView(),
        this._contentRegion.empty(),
      ]).then(function () {
        // unlock user navigation
        this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdContent);
      }.bind(this));
    } else {
      return Promise.resolve();
    }
  },

  toggleContentViewByClass: function (viewClass, viewOptions) {
    if (this.getIsShowingContentViewClass(viewClass)) {
      return this.destroyContentView(this._contentRegion);
    } else {
      return this.showContentViewByClass(viewClass, viewOptions);
    }
  },

  getContentView: function () {
    return this.getCurrentView(this._contentRegion);
  },

  getIsShowingContentView: function () {
    return this.getIsShowingView(this._contentRegion);
  },

  getIsShowingContentViewClass: function (viewClass) {
    return this.getIsShowingViewClass(viewClass, this._contentRegion);
  },

  destroyNonContentViews: function () {
    return Promise.all([
      this.destroyDialogView(),
      this.destroyModalView(),
      this.destroyUtilityView(),
    ]);
  },

  /* endregion CONTENT */

  /* region MODAL */
  // modal views are minor / vertical navigation elements that interrupt flow

  showModalViewByClass: function (viewClass, viewOptions) {
    if (!this.getIsShowingModalViewClass(viewClass)) {
      return this.showModalView(new viewClass(viewOptions));
    } else {
      return Promise.resolve();
    }
  },

  showModalView: function (modalView) {
    // dismiss notifications
    NotificationsManager.getInstance().dismissNotificationsThatCantBeShown();

    // temporarily disable user navigation
    this.requestUserTriggeredNavigationLocked(this._userNavLockIdModal);

    // blur non-modal content
    this.blurRegionsForModal();

    // show modal
    return this._modalRegion.show(modalView).then(function () {
      // unlock user navigation
      this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdModal);

      // show notifications
      NotificationsManager.getInstance().showQueuedNotificationsThatCanBeShown();
    }.bind(this));
  },

  destroyModalView: function () {
    if (this.getModalView() != null) {
      // unblur non-modal content
      this.unblurRegionsForModal();

      // temporarily disable user navigation
      this.requestUserTriggeredNavigationLocked(this._userNavLockIdModal);
      return this._modalRegion.empty().then(function () {
        // unlock user navigation
        this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdModal);
      }.bind(this));
    } else {
      return Promise.resolve();
    }
  },

  toggleModalViewByClass: function (viewClass, viewOptions) {
    if (this.getIsShowingModalViewClass(viewClass)) {
      return this.destroyModalView();
    } else {
      return this.showModalViewByClass(viewClass, viewOptions);
    }
  },

  getModalView: function () {
    return this.getCurrentView(this._modalRegion);
  },

  getIsShowingModalView: function () {
    return this.getIsShowingView(this._modalRegion);
  },

  getIsShowingModalViewClass: function (viewClass) {
    return this.getIsShowingViewClass(viewClass, this._modalRegion);
  },

  /* endregion MODAL */

  /* region UTILITY */
  // utility views are menus intended to overlay modals and provide access to other views (modals, content, etc) from anywhere

  showUtilityViewByClass: function (viewClass, viewOptions) {
    if (!this.getIsShowingUtilityViewClass(viewClass)) {
      return this.showUtilityView(new viewClass(viewOptions));
    } else {
      return Promise.resolve();
    }
  },

  showUtilityView: function (utilityView) {
    return this._utilityRegion.show(utilityView);
  },

  destroyUtilityView: function () {
    if (this.getUtilityView() != null) {
      return this._utilityRegion.empty();
    } else {
      return Promise.resolve();
    }
  },

  getUtilityView: function () {
    return this.getCurrentView(this._utilityRegion);
  },

  getIsShowingUtilityView: function () {
    return this.getIsShowingView(this._utilityRegion);
  },

  getIsShowingUtilityViewClass: function (viewClass) {
    return this.getIsShowingViewClass(viewClass, this._utilityRegion);
  },

  /* endregion UTILITY */

  /* region DIALOGS */
  // dialog views circumvent routing locks and are used to take away control from the user while an activity completes

  showDialogViewByClass: function (viewClass, viewOptions) {
    if (!this.getIsShowingDialogViewClass(viewClass)) {
      return this.showDialogView(new viewClass(viewOptions));
    } else {
      return Promise.resolve();
    }
  },

  showDialogView: function (dialogView) {
    // dismiss all notifications
    NotificationsManager.getInstance().dismissNotificationsThatCantBeShown();

    // disable all user triggered navigation while dialog is enabled
    this.requestUserTriggeredNavigationLocked(this._userNavLockIdDialog);

    // show dialog and return promise
    return this._overlayRegion.show(dialogView).then(function () {
      NotificationsManager.getInstance().showQueuedNotificationsThatCanBeShown();
    });
  },

  destroyDialogView: function () {
    var dialogView = this.getDialogView();
    if (dialogView != null) {
      this.stopListening(dialogView);
      this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdDialog);
      return this._overlayRegion.empty();
    } else {
      return Promise.resolve();
    }
  },

  getDialogView: function () {
    return this.getCurrentView(this._overlayRegion);
  },

  getIsShowingDialogView: function () {
    return this.getIsShowingView(this._overlayRegion);
  },

  getIsShowingDialogViewClass: function (viewClass) {
    return this.getIsShowingViewClass(viewClass, this._overlayRegion);
  },

  /* endregion DIALOG */

  /* region CONFIRM */

  /**
   * Special confirmation dialog to confirm or cancel an action. Resolves on confirm, rejects on cancel.
   * @returns {Promise}
   */
  showDialogForConfirmation: function (confirmTitle, confirmMessage, buttonLabel) {
    return new Promise(function (resolve, reject) {
      // ask for user confirmation
      var confirmDialogItemView = new ConfirmDialogItemView({ title: confirmTitle, message: confirmMessage, buttonLabel: buttonLabel });
      this.listenToOnce(confirmDialogItemView, 'confirm', function () {
        this.stopListening(confirmDialogItemView);
        resolve(arguments);
      }.bind(this));
      this.listenToOnce(confirmDialogItemView, 'cancel', function () {
        this.stopListening(confirmDialogItemView);
        this.destroyDialogForConfirmation();
        reject();
      }.bind(this));
      this.showDialogView(confirmDialogItemView);
    }.bind(this));
  },

  /**
   * Destroys the special confirm dialog if it is currently showing.
   * @returns {Promise}
   */
  destroyDialogForConfirmation: function () {
    if (this.getIsShowingDialogViewClass(ConfirmDialogItemView)) {
      return this.destroyDialogView();
    } else {
      return Promise.resolve();
    }
  },

  /**
   * Special confirmation dialog to confirm a purchase. Resolves on complete, rejects on cancel or if product already purchased.
   * @param {Object} productData
   * @returns {Promise}
   */
  showDialogForConfirmPurchase: function (productData, saleData) {
    if (productData != null && !productData.is_purchased) {
      return new Promise(function (resolve, reject) {
        // ask for user confirmation
        var confirmPurchaseDialogView = new ConfirmPurchaseDialogView({ model: new Backbone.Model(), productData: productData, saleData: saleData });
        var completedPurchase = false;
        this.listenToOnce(confirmPurchaseDialogView, 'processing', function (purchaseData) {
          // paypal is assumed to be successful
          if (!completedPurchase && purchaseData && (purchaseData.paymentType === 'paypal')) {
            completedPurchase = true;
            this.destroyDialogForConfirmPurchase();
            resolve(purchaseData);
          }
        }.bind(this));
        this.listenToOnce(confirmPurchaseDialogView, 'complete', function (purchaseData) {
          if (!completedPurchase) {
            completedPurchase = true;
            resolve(purchaseData);
          }
        }.bind(this));
        this.listenToOnce(confirmPurchaseDialogView, 'success', function () {
          if (completedPurchase) {
            this.destroyDialogForConfirmPurchase();
          }
        }.bind(this));
        this.listenToOnce(confirmPurchaseDialogView, 'cancel', function () {
          this.destroyDialogForConfirmPurchase();
          reject();
        }.bind(this));

        // show confirm purchase
        this.showDialogView(confirmPurchaseDialogView);
      }.bind(this));
    } else {
      return Promise.reject();
    }
  },

  /**
   * Destroys the special confirm purchase dialog if it is currently showing.
   * @returns {Promise}
   */
  destroyDialogForConfirmPurchase: function () {
    if (this.getIsShowingDialogViewClass(ConfirmPurchaseDialogView)) {
      return this.destroyDialogView();
    } else {
      return Promise.resolve();
    }
  },

  /* endregion CONFIRM */

  /* region LOADING */

  /**
   * Special loading dialog that destroys all views/layers to clear screen for loading without visible jank.
   * @param {Array} [dontDestroy=null] array of views/layers to preserve and not destroy/unload
   * @returns {Promise}
   */
  showDialogForLoad: function (dontDestroy) {
    if (!this.getIsShowingDialogViewClass(LoadingDialogItemView)) {
      // set user status temporarily to loading
      var previousStatus = ChatManager.getInstance().getStatus();
      ChatManager.getInstance().setStatus(ChatManager.STATUS_LOADING);

      return Promise.all([
        this.destroyAllViewsAndLayers(dontDestroy),
        this.showDialogViewByClass(LoadingDialogItemView),
      ]).then(function () {
        // restore previous status
        ChatManager.getInstance().setStatus(previousStatus);
      });
    } else {
      return Promise.resolve();
    }
  },

  /**
   * Destroys the special loading dialog if it is currently showing.
   * @returns {Promise}
   */
  destroyDialogForLoad: function () {
    // remove loading dialog
    if (this.getIsShowingDialogViewClass(LoadingDialogItemView)) {
      return this.destroyDialogView();
    } else {
      return Promise.resolve();
    }
  },

  /* endregion LOADING */

  /* region USER TRIGGERED NAVIGATION */

  setUserTriggeredNavigationLocked: function (val) {
    if (this._userTriggeredNavigationLocked != val) {
      this._userTriggeredNavigationLocked = val;

      this._updateRegionsForUserTriggeredNavigationLock();
    }
  },

  getUserTriggeredNavigationLocked: function () {
    return this._userTriggeredNavigationLocked;
  },

  requestUserTriggeredNavigationLocked: function (id) {
    if (id == null) {
      id = this._userTriggeredNavigationLockId;
    }
    if (!_.contains(this._userTriggeredNavigationLockRequests, id)) {
      var numRequests = this._userTriggeredNavigationLockRequests.length;
      this._userTriggeredNavigationLockRequests.push(id);
      if (numRequests === 0 && this._userTriggeredNavigationLockRequests.length === 1) {
        this.setUserTriggeredNavigationLocked(true);
      }
    }
  },

  requestUserTriggeredNavigationUnlocked: function (id) {
    if (id == null) {
      id = this._userTriggeredNavigationLockId;
    }
    var indexOf = _.lastIndexOf(this._userTriggeredNavigationLockRequests, id);
    if (indexOf !== -1) {
      var numRequests = this._userTriggeredNavigationLockRequests.length;
      this._userTriggeredNavigationLockRequests.splice(indexOf, 1);
      if (numRequests === 1 && this._userTriggeredNavigationLockRequests.length === 0) {
        this.setUserTriggeredNavigationLocked(false);
      }
    }
  },

  _updateRegionsForUserTriggeredNavigationLock: function () {
    // add/remove locked class app wide to disable buttons
    if (this._userTriggeredNavigationLocked) {
      this._mainRegion.$el.addClass('user-triggered-navigation-locked');
    } else {
      this._mainRegion.$el.removeClass('user-triggered-navigation-locked');
    }
  },

  requestUserTriggeredExit: function () {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredExit == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredExit = _.throttle(function () {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_exit');
        } else {
          this.trigger('user_attempt_exit');
        }
      }.bind(this), 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredExit();
  },

  requestUserTriggeredSkip: function () {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredSkip == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredSkip = _.throttle(function () {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_skip');
        } else {
          this.trigger('user_attempt_skip');
        }
      }.bind(this), 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredSkip();
  },

  requestUserTriggeredCancel: function () {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredCancel == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredCancel = _.throttle(function () {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_cancel');
        } else {
          this.trigger('user_attempt_cancel');
        }
      }.bind(this), 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredCancel();
  },

  requestUserTriggeredConfirm: function () {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredConfirm == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredConfirm = _.throttle(function () {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_confirm');
        } else {
          this.trigger('user_attempt_confirm');
        }
      }.bind(this), 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredConfirm();
  },

  /* endregion USER TRIGGERED NAVIGATION */

  /* region HELPERS */

  blurRegionsForModal: function () {
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    this._blurringModal = true;

    if (this._screenBlurId == null) {
      this._screenBlurId = UtilsJavascript.generateIncrementalId();
    }
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    this._updateRegionsForBlur();
  },

  unblurRegionsForModal: function () {
    this._blurringModal = false;

    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);

    this._updateRegionsForBlur();
  },

  _updateRegionsForBlur: function () {
    if (this._blurringModal) {
      Animations.fadeOut.call(this._contentRegion.$el);
      Animations.fadeOut.call(this._utilityRegion.$el);
    } else {
      Animations.fadeIn.call(this._contentRegion.$el);
      Animations.fadeIn.call(this._utilityRegion.$el);
    }
  },

  /* endregion HELPERS */

  /* region ROUTING */

  getHasLastRoute: function () {
    return this._majorRouteStack.length + this._minorRouteStack.length > 1;
  },

  getCurrentRoute: function () {
    return this.getCurrentMinorRoute() || this.getCurrentMajorRoute();
  },

  getCurrentMajorRoute: function () {
    if (this._majorRouteStack.length) {
      return this._majorRouteStack.length[this._majorRouteStack.length - 1];
    }
  },

  getCurrentMinorRoute: function () {
    if (this._minorRouteStack.length) {
      return this._minorRouteStack.length[this._minorRouteStack.length - 1];
    }
  },

  showLastRoute: function () {
    if (this.getHasLastRoute()) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);

      if (this._minorRouteStack.length > 1) {
        // go to last minor route
        this._showLastRouteFromStack(this._minorRouteStack);
      } else {
        // reset minor routes
        this.resetMinorRoutes();

        // go to last major route
        this._showLastRouteFromStack(this._majorRouteStack);
      }
    }
  },

  _showLastRouteFromStack: function (stack) {
    if (stack.length > 1) {
      // remove last route from stack
      stack.pop();

      // get new route from top of stack
      var route = stack[stack.length - 1];
      Logger.module('UI').log('showLastRoute', route.id);
      var context = route.context || this;
      if (route.parameters != null) {
        route.callback.apply(context, route.parameters);
      } else {
        route.callback.call(context);
      }
    }
  },

  /**
   * Adds a major route for going backwards between major UI screens.
   * @param {String} id unique identifier for this route
   * @param {Function} callback method to call to handle the route
   * @param {Object} [context=null] context to call the route callback in
   * @param {Array} [parameters=null] parameters to pass to the route callback
   */
  addMajorRoute: function (id, callback, context, parameters) {
    if (_.isFunction(callback)) {
      var lastRoute = this._majorRouteStack.length && this._majorRouteStack[this._majorRouteStack.length - 1];
      if (lastRoute == null || lastRoute.id !== id) {
        // push route to top of stack
        this._majorRouteStack.push({
          id: id,
          callback: callback,
          context: context,
          parameters: parameters,
        });

        // reset minor routes
        this.resetMinorRoutes();
      }
    }
  },

  /**
   * Adds a minor route for going backwards between minor UI screens within a major UI screen.
   * @param {String} id unique identifier for this route
   * @param {Function} callback method to call to handle the route
   * @param {Object} [context=null] context to call the route callback in
   * @param {Array} [parameters=null] parameters to pass to the route callback
   */
  addMinorRoute: function (id, callback, context, parameters) {
    if (_.isFunction(callback)) {
      var lastRoute = this._minorRouteStack.length && this._minorRouteStack[this._minorRouteStack.length - 1];
      if (lastRoute == null || lastRoute.id !== id) {
        this._minorRouteStack.push({
          id: id,
          callback: callback,
          context: context,
          parameters: parameters,
        });
      }
    }
  },

  /**
   * Removes a route from the major route stack by id.
   * @param {String} id
   */
  removeMajorRoute: function (id) {
    var currentMajorRouteIndex = this._majorRouteStack.length - 1;
    for (var i = currentMajorRouteIndex; i >= 0; i--) {
      var route = this._majorRouteStack[i];
      if (route.id === id) {
        if (i === currentMajorRouteIndex) {
          this.resetMinorRoutes();
        }
        this._majorRouteStack.slice(i, 1);
        break;
      }
    }
  },

  /**
   * Removes a route from the minor route stack by id.
   * @param {String} id
   */
  removeMinorRoute: function (id) {
    for (var i = this._minorRouteStack.length - 1; i >= 0; i--) {
      var route = this._minorRouteStack[i];
      if (route.id === id) {
        this._minorRouteStack.slice(i, 1);
        break;
      }
    }
  },

  /**
   * Resets and clears all routes.
   */
  resetRoutes: function () {
    this.resetMinorRoutes();
    if (this._majorRouteStack.length > 0) {
      this._majorRouteStack.length = 0;
    }
  },

  /**
   * Resets and clears all minor routes.
   */
  resetMinorRoutes: function () {
    if (this._minorRouteStack.length > 0) {
      this._minorRouteStack.length = 0;
    }
  },

  /* endregion ROUTING */

});
