const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Session = require('app/common/session2');
const generatePushID = require('app/common/generate_push_id');
const Scene = require('app/view/Scene');
const SDK = require('app/sdk');
const Logger = require('app/common/logger');
const Storage = require('app/common/storage');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const Animations = require('app/ui/views/animations');
const NavigationManager = require('app/ui/managers/navigation_manager');
const GamesManager = require('app/ui/managers/games_manager');
const SettingsMenuTemplate = require('app/ui/templates/item/settings_menu.hbs');
const ProfileManager = require('app/ui/managers/profile_manager');
const moment = require('moment');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const openUrl = require('app/common/openUrl');
const ConfirmDialogItemView = require('./confirm_dialog');
const ActivityDialogItemView = require('./activity_dialog');
const ChangeUsernameItemView = require('./change_username');
const AccountInventoryResetModalView = require('./account_inventory_reset_modal');
const RedeemGiftCodeModalView = require('./redeem_gift_code_modal');

const SettingsMenuView = Backbone.Marionette.ItemView.extend({

  className: 'modal duelyst-modal settings-menu',

  /* where are we appending the items views */
  childViewContainer: '.settings-menu-container',

  template: SettingsMenuTemplate,

  /* ui selector cache */
  ui: {
    $versionTag: '#version-tag',
    $resolution: '#resolution',
    $language: '#language',
    $checkboxHiDPIEnabled: '#checkbox-hi-dpi-enabled',
    $buttonLightingQualityLow: '#lighting-quality-low',
    $buttonLightingQualityMedium: '#lighting-quality-medium',
    $buttonLightingQualityHigh: '#lighting-quality-high',
    $buttonShadowQualityLow: '#shadow-quality-low',
    $buttonShadowQualityMedium: '#shadow-quality-medium',
    $buttonShadowQualityHigh: '#shadow-quality-high',
    $buttonBoardQualityLow: '#board-quality-low',
    $buttonBoardQualityHigh: '#board-quality-high',
    $bloom: '#bloom',
    $checkboxDoNotDisturb: '#checkbox-do-not-disturb',
    $checkboxBlockSpectators: '#checkbox-block-spectators',
    $checkboxAlwaysShowStats: '#checkbox-always-show-stats',
    $checkboxShowBattleLog: '#checkbox-show-battlelog',
    $checkboxPlayerDetails: '#checkbox-player-details',
    $checkboxStickyTargeting: '#checkbox-sticky-targeting',
    $checkboxShowInGameTips: '#checkbox-show-in-game-tips',
    $checkboxRazerChromaEnabled: '#checkbox-razer-chroma-enabled',
    $masterVolume: '#master-volume',
    $musicVolume: '#music-volume',
    $voiceVolume: '#voice-volume',
    $effectsVolume: '#effects-volume',
    $resetInventorySection: '#reset_inventory_section',
    // "click .manage-data" : "onManageDataPressed"
  },

  /* Ui events hash */
  events: {
    'click button.logout': 'onLogoutClicked',
    'click button.desktop-quit': 'onDesktopQuitClicked',
    'change #resolution': 'changeResolution',
    'change #language': 'changeLanguage',
    'change #checkbox-hi-dpi-enabled': 'changeHiDPIEnabled',
    'click #lighting-quality-low': 'changeLightingQualityLow',
    'click #lighting-quality-medium': 'changeLightingQualityMedium',
    'click #lighting-quality-high': 'changeLightingQualityHigh',
    'click #shadow-quality-low': 'changeShadowQualityLow',
    'click #shadow-quality-medium': 'changeShadowQualityMedium',
    'click #shadow-quality-high': 'changeShadowQualityHigh',
    'click #board-quality-low': 'changeBoardQualityLow',
    'click #board-quality-high': 'changeBoardQualityHigh',
    'change #bloom': 'changeBloom',
    'change #checkbox-do-not-disturb': 'changeDoNotDisturb',
    'change #checkbox-block-spectators': 'changeBlockSpectators',
    'change #checkbox-always-show-stats': 'changeAlwaysShowStats',
    'change #checkbox-show-battlelog': 'changeShowBattleLog',
    'change #checkbox-player-details': 'changeShowPlayerDetails',
    'change #checkbox-sticky-targeting': 'changeStickyTargeting',
    'change #checkbox-show-in-game-tips': 'changeShowInGameTips',
    'change #checkbox-razer-chroma-enabled': 'changeRazerChromaEnabled',
    'change #master-volume': 'changeMasterVolume',
    'change #music-volume': 'changeMusicVolume',
    'change #voice-volume': 'changeVoiceVolume',
    'change #effects-volume': 'changeEffectsVolume',
    'click .change-username': 'onChangeUsernameClicked',
    'click .reset-inventory': 'onResetAccountInventoryPressed',
    'click .redeem-gift-code': 'onRedeemGiftCodePressed',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,
  _requestId: null,

  initialize() {
    // generate unique id for requests
    this._requestId = generatePushID();

    // check whether changing viewport settings will do anything
    // generate global scale for resolution auto setting
    const $html = $('html');
    const screenWidth = $html.width();
    const screenHeight = $html.height();
    const globalScaleExact = CONFIG.getGlobalScaleForResolution(CONFIG.RESOLUTION_EXACT, screenWidth, screenHeight);
    if (globalScaleExact !== 1.0) {
      // check all resolutions and sort by whether they fit into user's current screen size
      const resolutions = UtilsJavascript.deepCopy(CONFIG.RESOLUTIONS);
      const resolutionsThatFit = [];
      const resolutionsThatDontFit = [];
      for (let i = 0, il = resolutions.length; i < il; i++) {
        const resolutionData = resolutions[i];
        if (resolutionData.value === CONFIG.RESOLUTION_AUTO || resolutionData.value === CONFIG.RESOLUTION_PIXEL_PERFECT) {
          resolutionsThatFit.push(resolutionData);
        } else {
          const resolution = $.trim(resolutionData.description);
          const resWidth = parseInt(resolution.replace(/x[\s\t]*?\d+/, ''));
          const resHeight = parseInt(resolution.replace(/\d+[\s\t]*?x/, ''));
          if (resWidth > screenWidth || resHeight > screenHeight) {
            resolutionsThatDontFit.push(resolutionData);
          } else {
            resolutionsThatFit.push(resolutionData);
          }
        }
      }
      this.model.set('_resolutionsThatFit', resolutionsThatFit);
      if (resolutionsThatDontFit.length > 0) {
        this.model.set('_resolutionsThatDontFit', resolutionsThatDontFit);
      }
    }
  },

  onBeforeRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onRender() {
    this.ui.$bloom.attr('min', CONFIG.BLOOM_MIN);
    this.ui.$bloom.attr('max', CONFIG.BLOOM_MAX);
    this.ui.$bloom.attr('step', 0.05);

    this.ui.$resolution.val(parseFloat(CONFIG.resolution));
    const currentLanguageKey = Storage.get('preferredLanguageKey') || 'en';
    this.ui.$language.val(currentLanguageKey);
    this.ui.$checkboxHiDPIEnabled.prop('checked', CONFIG.hiDPIEnabled);
    this.ui.$bloom.val(parseFloat(this.model.get('bloom')));
    this.ui.$checkboxDoNotDisturb.prop('checked', this.model.get('doNotDisturb'));
    this.ui.$checkboxBlockSpectators.prop('checked', this.model.get('blockSpectators'));
    this.ui.$checkboxAlwaysShowStats.prop('checked', this.model.get('alwaysShowStats'));
    this.ui.$checkboxShowBattleLog.prop('checked', this.model.get('showBattleLog'));
    this.ui.$checkboxPlayerDetails.prop('checked', this.model.get('showPlayerDetails'));
    this.ui.$checkboxStickyTargeting.prop('checked', this.model.get('stickyTargeting'));
    this.ui.$checkboxShowInGameTips.prop('checked', this.model.get('showInGameTips'));
    this.ui.$checkboxRazerChromaEnabled.prop('checked', this.model.get('razerChromaEnabled'));
    this.ui.$masterVolume.val(parseFloat(this.model.get('masterVolume')));
    this.ui.$musicVolume.val(parseFloat(this.model.get('musicVolume')));
    this.ui.$voiceVolume.val(parseFloat(this.model.get('voiceVolume')));
    this.ui.$effectsVolume.val(parseFloat(this.model.get('effectsVolume')));

    this._updateLightingQualityUI();
    this._updateShadowQualityUI();
    this._updateBoardQualityUI();

    if (window.isSteam) {
      this.$el.find('.logout').remove();
    }

    if (!window.isDesktop) {
      this.$el.find('.desktop-quit').remove();
      this.$el.find('#razer-chroma-setting').remove();
    }

    if (moment().utc().isAfter(moment.utc('2016-04-20'))) {
      this.ui.$resetInventorySection.hide();
    }

    this.ui.$versionTag.text(`v${process.env.VERSION}`);

    this.$el.find('[data-toggle=\'tooltip\']').tooltip();
  },

  onShow() {
    // show ZENDSEK widget
    window.zE && window.zE.show && window.zE.show();

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);

    // listen to model events
    this.listenTo(this.model, 'change:lightingQuality', this._updateLightingQualityUI.bind(this));
    this.listenTo(this.model, 'change:shadowQuality', this._updateShadowQualityUI.bind(this));
    this.listenTo(this.model, 'change:boardQuality', this._updateBoardQualityUI.bind(this));

    // change gradient color mapping
    Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
      r: 194, g: 203, b: 220, a: 255,
    }, {
      r: 36, g: 51, b: 65, a: 255,
    });

    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);
  },

  onPrepareForDestroy() {
    // hide ZENDESK widget
    window.zE && window.zE.hide && window.zE.hide();

    // reset gradient color mapping
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  onResize() {
    this.ui.$resolution.val(parseFloat(CONFIG.resolution));
    this.ui.$checkboxHiDPIEnabled.prop('checked', CONFIG.hiDPIEnabled);
  },

  /* event handlers */

  onChangeUsernameClicked(e) {
    NavigationManager.getInstance().showDialogView(new ChangeUsernameItemView({ model: ProfileManager.getInstance().profile }));
  },

  onResetAccountInventoryPressed() {
    NavigationManager.getInstance().showModalView(new AccountInventoryResetModalView());
  },

  onRedeemGiftCodePressed() {
    NavigationManager.getInstance().showModalView(new RedeemGiftCodeModalView());
  },

  onLogoutClicked() {
    const confirmDialogItemView = new ConfirmDialogItemView({ title: 'Are you sure you want to logout?' });
    this.listenToOnce(confirmDialogItemView, 'confirm', () => {
      Session.logout();
    });
    this.listenToOnce(confirmDialogItemView, 'cancel', () => {
      this.stopListening(confirmDialogItemView);
    });
    NavigationManager.getInstance().showDialogView(confirmDialogItemView);
  },

  onDesktopQuitClicked() {
    if (window.isDesktop) {
      const confirmDialogItemView = new ConfirmDialogItemView({ title: 'Are you sure you want to quit?' });
      this.listenToOnce(confirmDialogItemView, 'confirm', () => {
        window.quitDesktop();
      });
      this.listenToOnce(confirmDialogItemView, 'cancel', () => {
        this.stopListening(confirmDialogItemView);
      });
      NavigationManager.getInstance().showDialogView(confirmDialogItemView);
    }
  },

  changeResolution() {
    const res = parseInt(this.ui.$resolution.val());
    if (CONFIG.resolution !== res) {
      CONFIG.resolution = res;
      Storage.set('resolution', res);
      EventBus.getInstance().trigger(EVENTS.request_resize);
    }
  },

  changeLanguage() {
    const languageKey = this.ui.$language.val();
    const currentLanguageKey = Storage.get('preferredLanguageKey') || 'en';
    if (currentLanguageKey != languageKey) {
      Storage.set('preferredLanguageKey', languageKey);
      EventBus.getInstance().trigger(EVENTS.request_reload, { id: 'language_changed', message: 'Language Changed.  Please restart.' });
    }
  },

  changeHiDPIEnabled() {
    const enabled = this.ui.$checkboxHiDPIEnabled.prop('checked');
    if (CONFIG.hiDPIEnabled != enabled) {
      CONFIG.hiDPIEnabled = enabled;
      Storage.set('hiDPIEnabled', enabled);
      EventBus.getInstance().trigger(EVENTS.request_resize);
    }
  },

  changeLightingQualityLow() {
    this.model.set('lightingQuality', CONFIG.LIGHTING_QUALITY_LOW);
  },

  changeLightingQualityMedium() {
    this.model.set('lightingQuality', CONFIG.LIGHTING_QUALITY_MEDIUM);
  },

  changeLightingQualityHigh() {
    this.model.set('lightingQuality', CONFIG.LIGHTING_QUALITY_HIGH);
  },

  changeShadowQualityLow() {
    this.model.set('shadowQuality', CONFIG.SHADOW_QUALITY_LOW);
  },

  changeShadowQualityMedium() {
    this.model.set('shadowQuality', CONFIG.SHADOW_QUALITY_MEDIUM);
  },

  changeShadowQualityHigh() {
    this.model.set('shadowQuality', CONFIG.SHADOW_QUALITY_HIGH);
  },

  changeBoardQualityLow() {
    this.model.set('boardQuality', CONFIG.SHADOW_QUALITY_LOW);
  },

  changeBoardQualityHigh() {
    this.model.set('boardQuality', CONFIG.SHADOW_QUALITY_HIGH);
  },

  changeBloom() {
    this.model.set('bloom', this.ui.$bloom.val());
  },

  changeDoNotDisturb() {
    this.model.set('doNotDisturb', this.ui.$checkboxDoNotDisturb.prop('checked'));
  },

  changeBlockSpectators() {
    this.model.set('blockSpectators', this.ui.$checkboxBlockSpectators.prop('checked'));
  },

  changeAlwaysShowStats() {
    this.model.set('alwaysShowStats', this.ui.$checkboxAlwaysShowStats.prop('checked'));
  },

  changeShowBattleLog() {
    this.model.set('showBattleLog', this.ui.$checkboxShowBattleLog.prop('checked'));
  },

  changeShowPlayerDetails() {
    this.model.set('showPlayerDetails', this.ui.$checkboxPlayerDetails.prop('checked'));
  },

  changeStickyTargeting() {
    this.model.set('stickyTargeting', this.ui.$checkboxStickyTargeting.prop('checked'));
  },

  changeRazerChromaEnabled() {
    this.model.set('razerChromaEnabled', this.ui.$checkboxRazerChromaEnabled.prop('checked'));
  },

  changeShowInGameTips() {
    this.model.set('showInGameTips', this.ui.$checkboxShowInGameTips.prop('checked'));
  },

  changeMasterVolume() {
    this.model.set('masterVolume', this.ui.$masterVolume.val());
  },

  changeMusicVolume() {
    this.model.set('musicVolume', this.ui.$musicVolume.val());
  },

  changeVoiceVolume() {
    this.model.set('voiceVolume', this.ui.$voiceVolume.val());
  },

  changeEffectsVolume() {
    this.model.set('effectsVolume', this.ui.$effectsVolume.val());
  },

  _updateLightingQualityUI() {
    const lightingQuality = this.model.get('lightingQuality');
    if (lightingQuality === CONFIG.LIGHTING_QUALITY_HIGH) {
      // high quality lighting
      this.ui.$buttonLightingQualityHigh.addClass('active');
      this.ui.$buttonLightingQualityMedium.removeClass('active');
      this.ui.$buttonLightingQualityLow.removeClass('active');
    } else if (lightingQuality === CONFIG.LIGHTING_QUALITY_MEDIUM) {
      // medium quality lighting
      this.ui.$buttonLightingQualityMedium.addClass('active');
      this.ui.$buttonLightingQualityLow.removeClass('active');
      this.ui.$buttonLightingQualityHigh.removeClass('active');
    } else {
      // low quality lighting
      this.ui.$buttonLightingQualityLow.addClass('active');
      this.ui.$buttonLightingQualityMedium.removeClass('active');
      this.ui.$buttonLightingQualityHigh.removeClass('active');
    }
  },

  _updateShadowQualityUI() {
    const shadowQuality = this.model.get('shadowQuality');
    if (shadowQuality === CONFIG.SHADOW_QUALITY_HIGH) {
      // high quality shadows
      this.ui.$buttonShadowQualityHigh.addClass('active');
      this.ui.$buttonShadowQualityLow.removeClass('active');
      this.ui.$buttonShadowQualityMedium.removeClass('active');
    } else if (shadowQuality === CONFIG.SHADOW_QUALITY_MEDIUM) {
      // medium quality shadows
      this.ui.$buttonShadowQualityMedium.addClass('active');
      this.ui.$buttonShadowQualityLow.removeClass('active');
      this.ui.$buttonShadowQualityHigh.removeClass('active');
    } else {
      // low quality shadows
      this.ui.$buttonShadowQualityLow.addClass('active');
      this.ui.$buttonShadowQualityMedium.removeClass('active');
      this.ui.$buttonShadowQualityHigh.removeClass('active');
    }
  },

  _updateBoardQualityUI() {
    const boardQuality = this.model.get('boardQuality');
    if (boardQuality === CONFIG.SHADOW_QUALITY_HIGH) {
      // high quality board
      this.ui.$buttonBoardQualityHigh.addClass('active');
      this.ui.$buttonBoardQualityLow.removeClass('active');
    } else {
      // low quality board
      this.ui.$buttonBoardQualityLow.addClass('active');
      this.ui.$buttonBoardQualityHigh.removeClass('active');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = SettingsMenuView;
