// pragma PKGS: alwaysloaded

// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _NavigationManager = {};
_NavigationManager.instance = null;
_NavigationManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new NavigationManager();
  }
  return this.instance;
};
_NavigationManager.current = _NavigationManager.getInstance;

module.exports = _NavigationManager;

const Promise = require('bluebird');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsUI = require('app/common/utils/utils_ui');
const audio_engine = require('app/audio/audio_engine');
const RSX = require('app/data/resources');
const Scene = require('app/view/Scene');
const Animations = require('app/ui/views/animations');
const TransitionRegion = require('app/ui/views/regions/transition');
const NotificationsLayout = require('app/ui/views/layouts/notifications');
const ConfirmDialogItemView = require('app/ui/views/item/confirm_dialog');
const ConfirmPurchaseDialogView = require('app/ui/views2/shop/confirm_purchase_dialog');
const LoadingDialogItemView = require('app/ui/views/item/loading_dialog');
const MaintenanceAnnouncementItemView = require('app/ui/views/item/maintenance_announcement');
const _ = require('underscore');
const ServerStatusManager = require('./server_status_manager');
const ChatManager = require('./chat_manager');
const NotificationsManager = require('./notifications_manager');
const Manager = require('./manager');

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

  initialize() {
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
    ServerStatusManager.getInstance().onReady().then(() => {
      // add maintenance announcement
      this._maintenanceAnnouncementRegion.show(new MaintenanceAnnouncementItemView({ model: ServerStatusManager.getInstance().serverStatusModel }));
    });

    // attach delegate listeners to the app for special buttons
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-cancel', (event) => {
      // request user triggered action
      this.requestUserTriggeredCancel();
    });
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-skip', (event) => {
      // request user triggered action
      this.requestUserTriggeredSkip();
    });
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-exit', (event) => {
      // request user triggered action
      this.requestUserTriggeredExit();
    });
    $(CONFIG.APP_SELECTOR).on('click', '.btn-user-confirm', (event) => {
      // request user triggered action
      this.requestUserTriggeredConfirm();
    });

    // attach delegate listeners to the app for button sounds
    $(CONFIG.APP_SELECTOR).on('mouseenter', 'a, button, .btn', () => {
      // play auto sound for hover
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    });
    $(CONFIG.APP_SELECTOR).on('mouseup', 'a, button, .btn', (event) => {
      // play auto sound for click
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);
      // blur/un-focus target to remove ability for user to spam a button by pressing enter
      $(event.target).blur();
    });

    // listen for specific key presses
    $(document).on('keyup', (event) => {
      const keyCode = event.which;
      const $target = $(event.target);
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
    });

    // listen for before resize
    this.listenTo(EventBus.getInstance(), EVENTS.before_resize, this.onBeforeResize);
    this.onBeforeResize();

    // this manager does not need to bind to anything
    this.connect();
  },

  /* region LAYOUT */

  onBeforeResize() {
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

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);

    this.ready();
  },

  /* endregion CONNECT */

  getCurrentView(parentView) {
    return parentView && parentView.currentView;
  },

  getIsShowingView(parentView) {
    const currentView = this.getCurrentView(parentView);
    return currentView != null && !currentView.isDestroyed;
  },

  getIsShowingViewClass(viewClass, parentView) {
    return this.getIsShowingView(parentView) && this.getCurrentView(parentView) instanceof viewClass;
  },

  /**
   * Destroys all views and layers, except for those in an optional list passed in.
   * @param {Array} [dontDestroy=null] array of views/layers to preserve and not destroy/unload
   */
  destroyAllViewsAndLayers(dontDestroy) {
    // unload content view
    const contentView = this.getContentView();
    const contentViewPromise = contentView != null && !_.contains(dontDestroy, contentView) ? this.destroyContentView() : Promise.resolve();

    // unload modal view
    const modalView = this.getModalView();
    const modalViewPromise = modalView != null && !_.contains(dontDestroy, modalView) ? this.destroyModalView() : Promise.resolve();

    // unload modal view
    const dialogView = this.getDialogView();
    const dialogViewPromise = dialogView != null && !_.contains(dontDestroy, dialogView) ? this.destroyDialogView() : Promise.resolve();

    // unload utility view
    const utilityView = this.getUtilityView();
    const utilityViewPromise = utilityView != null && !_.contains(dontDestroy, utilityView) ? this.destroyUtilityView() : Promise.resolve();

    // unload content layer
    const contentLayer = Scene.getInstance().getContent();
    const contentLayerPromise = contentLayer != null && !_.contains(dontDestroy, contentLayer) ? Scene.getInstance().destroyContent() : Promise.resolve();

    // unload overlay layer
    const overlayLayer = Scene.getInstance().getOverlay();
    const overlayLayerPromise = overlayLayer != null && !_.contains(dontDestroy, overlayLayer) ? Scene.getInstance().destroyOverlay() : Promise.resolve();

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

  showContentViewByClass(viewClass, viewOptions) {
    if (!this.getIsShowingContentViewClass(viewClass)) {
      return this.showContentView(new viewClass(viewOptions));
    }
    return Promise.resolve();
  },

  showContentView(contentView) {
    // dismiss notifications
    NotificationsManager.getInstance().dismissNotificationsThatCantBeShown();

    // temporarily disable user navigation
    this.requestUserTriggeredNavigationLocked(this._userNavLockIdContent);

    return Promise.all([
      this.destroyModalView(),
      this.destroyUtilityView(),
      this._contentRegion.show(contentView),
    ]).then(() => {
      // unlock user navigation
      this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdContent);

      // show notifications
      NotificationsManager.getInstance().showQueuedNotificationsThatCanBeShown();
    });
  },

  destroyContentView() {
    if (this.getContentView() != null) {
      // temporarily disable user navigation
      this.requestUserTriggeredNavigationLocked(this._userNavLockIdContent);

      return Promise.all([
        this.destroyModalView(),
        this.destroyUtilityView(),
        this._contentRegion.empty(),
      ]).then(() => {
        // unlock user navigation
        this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdContent);
      });
    }
    return Promise.resolve();
  },

  toggleContentViewByClass(viewClass, viewOptions) {
    if (this.getIsShowingContentViewClass(viewClass)) {
      return this.destroyContentView(this._contentRegion);
    }
    return this.showContentViewByClass(viewClass, viewOptions);
  },

  getContentView() {
    return this.getCurrentView(this._contentRegion);
  },

  getIsShowingContentView() {
    return this.getIsShowingView(this._contentRegion);
  },

  getIsShowingContentViewClass(viewClass) {
    return this.getIsShowingViewClass(viewClass, this._contentRegion);
  },

  destroyNonContentViews() {
    return Promise.all([
      this.destroyDialogView(),
      this.destroyModalView(),
      this.destroyUtilityView(),
    ]);
  },

  /* endregion CONTENT */

  /* region MODAL */
  // modal views are minor / vertical navigation elements that interrupt flow

  showModalViewByClass(viewClass, viewOptions) {
    if (!this.getIsShowingModalViewClass(viewClass)) {
      return this.showModalView(new viewClass(viewOptions));
    }
    return Promise.resolve();
  },

  showModalView(modalView) {
    // dismiss notifications
    NotificationsManager.getInstance().dismissNotificationsThatCantBeShown();

    // temporarily disable user navigation
    this.requestUserTriggeredNavigationLocked(this._userNavLockIdModal);

    // blur non-modal content
    this.blurRegionsForModal();

    // show modal
    return this._modalRegion.show(modalView).then(() => {
      // unlock user navigation
      this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdModal);

      // show notifications
      NotificationsManager.getInstance().showQueuedNotificationsThatCanBeShown();
    });
  },

  destroyModalView() {
    if (this.getModalView() != null) {
      // unblur non-modal content
      this.unblurRegionsForModal();

      // temporarily disable user navigation
      this.requestUserTriggeredNavigationLocked(this._userNavLockIdModal);
      return this._modalRegion.empty().then(() => {
        // unlock user navigation
        this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdModal);
      });
    }
    return Promise.resolve();
  },

  toggleModalViewByClass(viewClass, viewOptions) {
    if (this.getIsShowingModalViewClass(viewClass)) {
      return this.destroyModalView();
    }
    return this.showModalViewByClass(viewClass, viewOptions);
  },

  getModalView() {
    return this.getCurrentView(this._modalRegion);
  },

  getIsShowingModalView() {
    return this.getIsShowingView(this._modalRegion);
  },

  getIsShowingModalViewClass(viewClass) {
    return this.getIsShowingViewClass(viewClass, this._modalRegion);
  },

  /* endregion MODAL */

  /* region UTILITY */
  // utility views are menus intended to overlay modals and provide access to other views (modals, content, etc) from anywhere

  showUtilityViewByClass(viewClass, viewOptions) {
    if (!this.getIsShowingUtilityViewClass(viewClass)) {
      return this.showUtilityView(new viewClass(viewOptions));
    }
    return Promise.resolve();
  },

  showUtilityView(utilityView) {
    return this._utilityRegion.show(utilityView);
  },

  destroyUtilityView() {
    if (this.getUtilityView() != null) {
      return this._utilityRegion.empty();
    }
    return Promise.resolve();
  },

  getUtilityView() {
    return this.getCurrentView(this._utilityRegion);
  },

  getIsShowingUtilityView() {
    return this.getIsShowingView(this._utilityRegion);
  },

  getIsShowingUtilityViewClass(viewClass) {
    return this.getIsShowingViewClass(viewClass, this._utilityRegion);
  },

  /* endregion UTILITY */

  /* region DIALOGS */
  // dialog views circumvent routing locks and are used to take away control from the user while an activity completes

  showDialogViewByClass(viewClass, viewOptions) {
    if (!this.getIsShowingDialogViewClass(viewClass)) {
      return this.showDialogView(new viewClass(viewOptions));
    }
    return Promise.resolve();
  },

  showDialogView(dialogView) {
    // dismiss all notifications
    NotificationsManager.getInstance().dismissNotificationsThatCantBeShown();

    // disable all user triggered navigation while dialog is enabled
    this.requestUserTriggeredNavigationLocked(this._userNavLockIdDialog);

    // show dialog and return promise
    return this._overlayRegion.show(dialogView).then(() => {
      NotificationsManager.getInstance().showQueuedNotificationsThatCanBeShown();
    });
  },

  destroyDialogView() {
    const dialogView = this.getDialogView();
    if (dialogView != null) {
      this.stopListening(dialogView);
      this.requestUserTriggeredNavigationUnlocked(this._userNavLockIdDialog);
      return this._overlayRegion.empty();
    }
    return Promise.resolve();
  },

  getDialogView() {
    return this.getCurrentView(this._overlayRegion);
  },

  getIsShowingDialogView() {
    return this.getIsShowingView(this._overlayRegion);
  },

  getIsShowingDialogViewClass(viewClass) {
    return this.getIsShowingViewClass(viewClass, this._overlayRegion);
  },

  /* endregion DIALOG */

  /* region CONFIRM */

  /**
   * Special confirmation dialog to confirm or cancel an action. Resolves on confirm, rejects on cancel.
   * @returns {Promise}
   */
  showDialogForConfirmation(confirmTitle, confirmMessage, buttonLabel) {
    return new Promise((resolve, reject) => {
      // ask for user confirmation
      const confirmDialogItemView = new ConfirmDialogItemView({ title: confirmTitle, message: confirmMessage, buttonLabel });
      this.listenToOnce(confirmDialogItemView, 'confirm', function () {
        this.stopListening(confirmDialogItemView);
        resolve(arguments);
      }.bind(this));
      this.listenToOnce(confirmDialogItemView, 'cancel', () => {
        this.stopListening(confirmDialogItemView);
        this.destroyDialogForConfirmation();
        reject();
      });
      this.showDialogView(confirmDialogItemView);
    });
  },

  /**
   * Destroys the special confirm dialog if it is currently showing.
   * @returns {Promise}
   */
  destroyDialogForConfirmation() {
    if (this.getIsShowingDialogViewClass(ConfirmDialogItemView)) {
      return this.destroyDialogView();
    }
    return Promise.resolve();
  },

  /**
   * Special confirmation dialog to confirm a purchase. Resolves on complete, rejects on cancel or if product already purchased.
   * @param {Object} productData
   * @returns {Promise}
   */
  showDialogForConfirmPurchase(productData, saleData) {
    if (productData != null && !productData.is_purchased) {
      return new Promise((resolve, reject) => {
        // ask for user confirmation
        const confirmPurchaseDialogView = new ConfirmPurchaseDialogView({ model: new Backbone.Model(), productData, saleData });
        let completedPurchase = false;
        this.listenToOnce(confirmPurchaseDialogView, 'processing', (purchaseData) => {
          // paypal and steam are assumed to be successful
          if (!completedPurchase && purchaseData && (purchaseData.paymentType === 'paypal')) {
            completedPurchase = true;
            this.destroyDialogForConfirmPurchase();
            resolve(purchaseData);
          }
        });
        this.listenToOnce(confirmPurchaseDialogView, 'complete', (purchaseData) => {
          if (!completedPurchase) {
            completedPurchase = true;
            resolve(purchaseData);
          }
        });
        this.listenToOnce(confirmPurchaseDialogView, 'success', () => {
          if (completedPurchase) {
            this.destroyDialogForConfirmPurchase();
          }
        });
        this.listenToOnce(confirmPurchaseDialogView, 'cancel', () => {
          this.destroyDialogForConfirmPurchase();
          reject();
        });

        // show confirm purchase
        this.showDialogView(confirmPurchaseDialogView);
      });
    }
    return Promise.reject();
  },

  /**
   * Destroys the special confirm purchase dialog if it is currently showing.
   * @returns {Promise}
   */
  destroyDialogForConfirmPurchase() {
    if (this.getIsShowingDialogViewClass(ConfirmPurchaseDialogView)) {
      return this.destroyDialogView();
    }
    return Promise.resolve();
  },

  /* endregion CONFIRM */

  /* region LOADING */

  /**
   * Special loading dialog that destroys all views/layers to clear screen for loading without visible jank.
   * @param {Array} [dontDestroy=null] array of views/layers to preserve and not destroy/unload
   * @returns {Promise}
   */
  showDialogForLoad(dontDestroy) {
    if (!this.getIsShowingDialogViewClass(LoadingDialogItemView)) {
      // set user status temporarily to loading
      const previousStatus = ChatManager.getInstance().getStatus();
      ChatManager.getInstance().setStatus(ChatManager.STATUS_LOADING);

      return Promise.all([
        this.destroyAllViewsAndLayers(dontDestroy),
        this.showDialogViewByClass(LoadingDialogItemView),
      ]).then(() => {
        // restore previous status
        ChatManager.getInstance().setStatus(previousStatus);
      });
    }
    return Promise.resolve();
  },

  /**
   * Destroys the special loading dialog if it is currently showing.
   * @returns {Promise}
   */
  destroyDialogForLoad() {
    // remove loading dialog
    if (this.getIsShowingDialogViewClass(LoadingDialogItemView)) {
      return this.destroyDialogView();
    }
    return Promise.resolve();
  },

  /* endregion LOADING */

  /* region USER TRIGGERED NAVIGATION */

  setUserTriggeredNavigationLocked(val) {
    if (this._userTriggeredNavigationLocked != val) {
      this._userTriggeredNavigationLocked = val;

      this._updateRegionsForUserTriggeredNavigationLock();
    }
  },

  getUserTriggeredNavigationLocked() {
    return this._userTriggeredNavigationLocked;
  },

  requestUserTriggeredNavigationLocked(id) {
    if (id == null) {
      id = this._userTriggeredNavigationLockId;
    }
    if (!_.contains(this._userTriggeredNavigationLockRequests, id)) {
      const numRequests = this._userTriggeredNavigationLockRequests.length;
      this._userTriggeredNavigationLockRequests.push(id);
      if (numRequests === 0 && this._userTriggeredNavigationLockRequests.length === 1) {
        this.setUserTriggeredNavigationLocked(true);
      }
    }
  },

  requestUserTriggeredNavigationUnlocked(id) {
    if (id == null) {
      id = this._userTriggeredNavigationLockId;
    }
    const indexOf = _.lastIndexOf(this._userTriggeredNavigationLockRequests, id);
    if (indexOf !== -1) {
      const numRequests = this._userTriggeredNavigationLockRequests.length;
      this._userTriggeredNavigationLockRequests.splice(indexOf, 1);
      if (numRequests === 1 && this._userTriggeredNavigationLockRequests.length === 0) {
        this.setUserTriggeredNavigationLocked(false);
      }
    }
  },

  _updateRegionsForUserTriggeredNavigationLock() {
    // add/remove locked class app wide to disable buttons
    if (this._userTriggeredNavigationLocked) {
      this._mainRegion.$el.addClass('user-triggered-navigation-locked');
    } else {
      this._mainRegion.$el.removeClass('user-triggered-navigation-locked');
    }
  },

  requestUserTriggeredExit() {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredExit == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredExit = _.throttle(() => {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_exit');
        } else {
          this.trigger('user_attempt_exit');
        }
      }, 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredExit();
  },

  requestUserTriggeredSkip() {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredSkip == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredSkip = _.throttle(() => {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_skip');
        } else {
          this.trigger('user_attempt_skip');
        }
      }, 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredSkip();
  },

  requestUserTriggeredCancel() {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredCancel == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredCancel = _.throttle(() => {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_cancel');
        } else {
          this.trigger('user_attempt_cancel');
        }
      }, 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredCancel();
  },

  requestUserTriggeredConfirm() {
    // when user triggered navigation is allowed
    if (this._throttled_requestUserTriggeredConfirm == null) {
      // throttle to prevent spamming
      this._throttled_requestUserTriggeredConfirm = _.throttle(() => {
        if (!this.getUserTriggeredNavigationLocked()) {
          this.trigger('user_triggered_confirm');
        } else {
          this.trigger('user_attempt_confirm');
        }
      }, 300, { trailing: false });
    }
    this._throttled_requestUserTriggeredConfirm();
  },

  /* endregion USER TRIGGERED NAVIGATION */

  /* region HELPERS */

  blurRegionsForModal() {
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    this._blurringModal = true;

    if (this._screenBlurId == null) {
      this._screenBlurId = UtilsJavascript.generateIncrementalId();
    }
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    this._updateRegionsForBlur();
  },

  unblurRegionsForModal() {
    this._blurringModal = false;

    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);

    this._updateRegionsForBlur();
  },

  _updateRegionsForBlur() {
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

  getHasLastRoute() {
    return this._majorRouteStack.length + this._minorRouteStack.length > 1;
  },

  getCurrentRoute() {
    return this.getCurrentMinorRoute() || this.getCurrentMajorRoute();
  },

  getCurrentMajorRoute() {
    if (this._majorRouteStack.length) {
      return this._majorRouteStack.length[this._majorRouteStack.length - 1];
    }
  },

  getCurrentMinorRoute() {
    if (this._minorRouteStack.length) {
      return this._minorRouteStack.length[this._minorRouteStack.length - 1];
    }
  },

  showLastRoute() {
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

  _showLastRouteFromStack(stack) {
    if (stack.length > 1) {
      // remove last route from stack
      stack.pop();

      // get new route from top of stack
      const route = stack[stack.length - 1];
      Logger.module('UI').log('showLastRoute', route.id);
      const context = route.context || this;
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
  addMajorRoute(id, callback, context, parameters) {
    if (_.isFunction(callback)) {
      const lastRoute = this._majorRouteStack.length && this._majorRouteStack[this._majorRouteStack.length - 1];
      if (lastRoute == null || lastRoute.id !== id) {
        // push route to top of stack
        this._majorRouteStack.push({
          id,
          callback,
          context,
          parameters,
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
  addMinorRoute(id, callback, context, parameters) {
    if (_.isFunction(callback)) {
      const lastRoute = this._minorRouteStack.length && this._minorRouteStack[this._minorRouteStack.length - 1];
      if (lastRoute == null || lastRoute.id !== id) {
        this._minorRouteStack.push({
          id,
          callback,
          context,
          parameters,
        });
      }
    }
  },

  /**
   * Removes a route from the major route stack by id.
   * @param {String} id
   */
  removeMajorRoute(id) {
    const currentMajorRouteIndex = this._majorRouteStack.length - 1;
    for (let i = currentMajorRouteIndex; i >= 0; i--) {
      const route = this._majorRouteStack[i];
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
  removeMinorRoute(id) {
    for (let i = this._minorRouteStack.length - 1; i >= 0; i--) {
      const route = this._minorRouteStack[i];
      if (route.id === id) {
        this._minorRouteStack.slice(i, 1);
        break;
      }
    }
  },

  /**
   * Resets and clears all routes.
   */
  resetRoutes() {
    this.resetMinorRoutes();
    if (this._majorRouteStack.length > 0) {
      this._majorRouteStack.length = 0;
    }
  },

  /**
   * Resets and clears all minor routes.
   */
  resetMinorRoutes() {
    if (this._minorRouteStack.length > 0) {
      this._minorRouteStack.length = 0;
    }
  },

  /* endregion ROUTING */

});
