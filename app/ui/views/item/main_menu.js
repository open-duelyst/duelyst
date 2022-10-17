// pragma PKGS: nongame

'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var UtilsEnv = require('app/common/utils/utils_env');
var Scene = require('app/view/Scene');
var SDK = require('app/sdk');
var Animations = require('app/ui/views/animations');
var MainMenuTmpl = require('app/ui/templates/item/main_menu.hbs');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var QuestsManager = require('app/ui/managers/quests_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var GamesManager = require('app/ui/managers/games_manager');
var ZodiacSymbolModel = require('app/ui/models/zodiac_symbol');
var audio_engine = require('app/audio/audio_engine');
var CrateManager = require('app/ui/managers/crate_manager');
var StreamManager = require('app/ui/managers/stream_manager');
var ServerStatusManager = require('app/ui/managers/server_status_manager');
var i18next = require('i18next');
var ShopSpiritOrbsModalView = require('app/ui/views2/shop/shop_spirit_orbs_modal');
var PlayLayout = require('app/ui/views/layouts/play');
var CosmeticsFactory = require('app/sdk/cosmetics/cosmeticsFactory');
var ShopManager = require('app/ui/managers/shop_manager');
var ShopData = require('app/data/shop.json');

var moment = require('moment');

var QuestBeginnerCompleteSoloChallenges = require('app/sdk/quests/questBeginnerCompleteSoloChallenges');

var MainMenuItemView = Backbone.Marionette.ItemView.extend({

  template: MainMenuTmpl,

  ui: {
    $symbolMainMenuCenter: '.symbol-main-menu-center',
    $symbolMainMenuDiamond: '.symbol-main-menu-diamond',
    $symbolMainMenuIcon: '.symbol-main-menu-icon',
    $symbolMainMenuRingInner: '.symbol-main-menu-ring-inner',
    $symbolMainMenuRingOuter: '.symbol-main-menu-ring-outer',
    $btnWatch: '.watch',
    $btnCollection: '.collection',
    $btnCodex: '.codex',
    $btnCrateInventory: '.crate-inventory',
    $playButton: '.play',
    $playLabel: '.play-label',
    $sceneSwitcher: '.scene-switcher',
    $sceneName: '.scene-name',
    $shopCardsetPromo: '.shop-cardset-promo',
    $purchasePromo: '.purchase-promo',
    $premiumPurchasePromo: '.premium-purchase-promo',
    $bossToastPromo: '.boss-toast-promo',
    $bossEventPromoTimer: '.boss-toast-promo-timer',
    $purchasePromoBtn: '.purchase-promo-btn',
    $premiumPurchasePromoBtn: '.premium-purchase-promo-btn',
  },

  events: {
    'mouseenter .btn': 'activateSymbolMainMenu',
    'mouseleave .btn': 'deactivateSymbolMainMenu',
    'click .btn': 'onClickButton',
    'click .play': 'onClickPlay',
    'click .watch': 'onClickWatch',
    'click .collection': 'onClickCollection',
    'click .codex': 'onClickCodex',
    'click .crate-inventory': 'onClickCrateInventory',
    'click .next-scene': 'onClickNextScene',
    'click .previous-scene': 'onClickPreviousScene',
    'click .btn-cardset-promo': 'onClickShopCardsetPromo',
    'click .purchase-promo': 'onClickPurchasePromo',
    'click .premium-purchase-promo': 'onClickPremiumPurchasePromo',
    'click .boss-toast-promo': 'onClickBossPromo',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _sceneLoadId: null,
  _showNewPlayerUITimeoutId: null,
  _stopLoadingSceneTimeoutId: null,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    if (ProgressionManager.getInstance().getHasActiveBossEvent() && NewPlayerManager.getInstance().canPlayBossBattle()) {
      data.boss_battle = ProgressionManager.getInstance().getCurrentBossEventModels()[0].toJSON();
      data.boss_battle_is_available = true;
      data.boss_battle_is_defeated = ProgressionManager.getInstance().getHasDefeatedBossForEvent(data.boss_battle.boss_id, data.boss_battle.event_id);
    } else if (ProgressionManager.getInstance().getUpcomingBossEventModel() && NewPlayerManager.getInstance().canPlayBossBattle()) {
      data.boss_battle_is_available = false;
      data.boss_battle = ProgressionManager.getInstance().getUpcomingBossEventModel().toJSON();
    }

    if (data.boss_battle) {
      var bossCard = SDK.CardFactory.cardForIdentifier(data.boss_battle.boss_id);
      if (bossCard != null) {
        data.boss_battle_name = bossCard.getName();
        data.boss_battle_portrait = bossCard.getSpeechResource().img;
      }
    }

    return data;
  },

  onShow: function () {
    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.listenTo(EventBus.getInstance(), EVENTS.cosmetic_chest_collection_change, this.bindUnreadCrateCount);
    this.listenTo(EventBus.getInstance(), EVENTS.gift_crate_collection_change, this.bindUnreadCrateCount);
    this.listenTo(EventBus.getInstance(), EVENTS.change_scene, this.onChangeScene);
    this.listenTo(ProfileManager.getInstance().profile, 'change:showLoreNotifications', this.bindUnreadLoreCount);

    this.animateReveal();

    this._showNewPlayerUITimeoutId = setTimeout(function () {
      this._showNewPlayerUITimeoutId = null;
      this._showNewPlayerUI();
    }.bind(this), 1000);

    var showLiveStreamBadgeProbability = ServerStatusManager.getInstance().serverStatusModel.get('live_stream_badge_probability') || -1;
    if (showLiveStreamBadgeProbability < Math.random()) {
      StreamManager.getInstance().hasDismissedStreams = true;
    }

    StreamManager.getInstance().onReady(function () {
      if (this.isDestroyed) return; // this view was destroyed

      if (StreamManager.getInstance().liveStreamCollection.length > 0 && !StreamManager.getInstance().hasDismissedStreams) {
        this.ui.$btnWatch.find('.badge-live').addClass('active');
      }
    }.bind(this));

    var shouldShowBoss = ProgressionManager.getInstance().getHasActiveBossEvent() || ProgressionManager.getInstance().getUpcomingBossEventModel();
    shouldShowBoss = shouldShowBoss && NewPlayerManager.getInstance().canPlayBossBattle();

    var showCardSetPromo = false;
    var showPurchasePromo = false;
    var showPremiumPurchasePromo = false;

    var displacementInRem = 0;
    var standardPromoDisplacement = 18;
    if (shouldShowBoss) {
      this.ui.$bossToastPromo.removeClass('hide');
      this.startBossEventTimer();
      displacementInRem += standardPromoDisplacement;
    }

    if (showCardSetPromo) {
      if (displacementInRem) {
        this.ui.$shopCardsetPromo.css('right', displacementInRem + 'rem');
      }
      this.ui.$shopCardsetPromo.removeClass('hide');

      displacementInRem += standardPromoDisplacement;
    }

    if (showPremiumPurchasePromo) {
      if (displacementInRem) {
        this.ui.$premiumPurchasePromo.css('right', displacementInRem + 'rem');
      }
      this.ui.$premiumPurchasePromo.removeClass('hide');
      this.ui.$premiumPurchasePromoBtn.html(i18next.t('shop.confirm_purchase_dialog_premium_price', { price: ShopData.promos.FROSTFIRE_2017_PREMIUM_CRATE.price }));

      displacementInRem += 16;
    }

    if (showPurchasePromo) {
      if (displacementInRem) {
        this.ui.$purchasePromo.css('right', displacementInRem + 'rem');
      }
      this.ui.$purchasePromo.removeClass('hide');
      this.ui.$purchasePromoBtn.html(i18next.t('shop.confirm_purchase_dialog_premium_price', { price: ShopData.promos.FROSTFIRE_2017_CRATE.price }));

      displacementInRem += 16;
    }
  },

  onBeforeRender: function () {
    // stop any activated symbols
    this.deactivateSymbolMainMenu();

    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    this.$el.find('[data-toggle=\'popover\']').popover('destroy');
  },

  onResize: function () {
    this.updateZodiacSymbols();
  },

  onRender: function () {
    var selectedSceneData = SDK.CosmeticsFactory.sceneForIdentifier(CONFIG.selectedScene);
    this.ui.$sceneName.text(selectedSceneData.name);

    if (!NewPlayerManager.getInstance().canSeeCrates() && CrateManager.getInstance().getGiftCrateCount() == 0) {
      this.ui.$btnCrateInventory.addClass('hide');
    } else {
      this.ui.$btnCrateInventory.removeClass('hide');
    }

    // if we have any openable gift crates, show the count
    if (!NewPlayerManager.getInstance().canSeeCodex()) {
      this.ui.$btnCodex.addClass('hide');
    } else {
      this.ui.$btnCodex.removeClass('hide');
    }

    if (!NewPlayerManager.getInstance().canSeeWatchSection()) {
      this.ui.$btnWatch.addClass('hide');
    } else {
      this.ui.$btnWatch.removeClass('hide');
    }

    if (!NewPlayerManager.getInstance().canAccessCollection()) {
      this.ui.$btnCollection.addClass('disabled');
    } else {
      this.ui.$btnCollection.removeClass('disabled');
    }

    this.updateZodiacSymbols();

    this.bindUnreadCounts();

    this.$el.find('[data-toggle=\'tooltip\']').tooltip();
  },

  onDestroy: function () {
    Logger.module('UI').log('MainMenu.onDestroy');

    this.stopUpdateCrateExpiration();

    // stop any activated symbols
    this.deactivateSymbolMainMenu();

    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    this.$el.find('[data-toggle=\'popover\']').popover('destroy');

    // invalidate responses to any loading scene
    this._sceneLoadId = null;

    if (this._showNewPlayerUITimeoutId != null) {
      clearTimeout(this._showNewPlayerUITimeoutId);
      this._showNewPlayerUITimeoutId = null;
    }
    if (this._stopLoadingSceneTimeoutId != null) {
      clearTimeout(this._stopLoadingSceneTimeoutId);
      this._stopLoadingSceneTimeoutId = null;
    }

    this.stopBossEventTimer();
  },

  onClickPlay: function () {
    EventBus.getInstance().trigger(EVENTS.show_play);
  },

  onClickWatch: function () {
    StreamManager.getInstance().hasDismissedStreams = true;
    EventBus.getInstance().trigger(EVENTS.show_watch);
  },

  onClickCollection: function () {
    EventBus.getInstance().trigger(EVENTS.show_collection);
  },

  onClickCodex: function () {
    EventBus.getInstance().trigger(EVENTS.show_codex);
  },

  onClickCrateInventory: function () {
    EventBus.getInstance().trigger(EVENTS.show_crate_inventory);
  },

  bindUnreadCounts: function () {
    this.bindUnreadCardCount();
    this.bindUnreadLoreCount();
    this.bindUnreadCrateCount();
  },

  bindUnreadCardCount: function () {
    // if we have unread cards, show collection badge
    if (InventoryManager.getInstance().hasUnreadCards()) {
      this.ui.$btnCollection.find('.badge-unread-cards').addClass('active').text(InventoryManager.getInstance().getTotalUnreadCardCount());
    } else {
      this.ui.$btnCollection.find('.badge-unread-cards').removeClass('active');
    }
  },

  bindUnreadLoreCount: function () {
    // if we have unread lore, show collection badge
    if (ProfileManager.getInstance().profile.get('showLoreNotifications') && InventoryManager.getInstance().hasUnreadCardLore()) {
      this.ui.$btnCollection.find('.badge-unread-lore').addClass('active');
    } else {
      this.ui.$btnCollection.find('.badge-unread-lore').removeClass('active');
    }
  },

  bindUnreadCrateCount: function () {
    // if we have any unread crates, show the count
    var crateManager = CrateManager.getInstance();
    if (NewPlayerManager.getInstance().canSeeCrates() || crateManager.getGiftCrateCount() > 0) {
      if (crateManager.getCosmeticChestCountForType(SDK.CosmeticsChestTypeLookup.Boss) > 0) {
        this.beginUpdateCrateExpiration();
      } else {
        this.stopUpdateCrateExpiration();
        var openableCrateType = CrateManager.getInstance().getOpenableChestType();
        if (openableCrateType != null) {
          // TODO: check this label
          this.ui.$btnCrateInventory.find('.badge').addClass('active').text(i18next.t('main_menu.menu_item_crates_can_open_badge', { crate_name: CosmeticsFactory.nameForCosmeticChestType(openableCrateType) }));
        } else {
          var numUnreadCrates = CrateManager.getInstance().getGiftCrateCount() + crateManager.getCosmeticChestCount();
          if (numUnreadCrates > 0) {
            this.ui.$btnCrateInventory.find('.badge').addClass('active').text('' + numUnreadCrates);
          } else {
            this.ui.$btnCrateInventory.find('.badge').removeClass('active');
          }
        }
      }
    }
  },

  updateCrateExpiration: function () {
    var crateManager = CrateManager.getInstance();
    var crateExpirationMoment = crateManager.getNextBossCrateExpirationMoment();
    if (crateExpirationMoment) {
      var momentNowUtc = moment.utc();
      var durationLeft = moment.duration(crateExpirationMoment.valueOf() - momentNowUtc.valueOf());
      var daysRemaining = durationLeft.days();
      var hoursRemaining = durationLeft.hours();
      var minutesRemaining = durationLeft.minutes();
      var minutesRemainingString = '' + minutesRemaining;
      var secondsRemaining = durationLeft.seconds();
      var secondsRemainingString = '' + secondsRemaining;

      hoursRemaining += (daysRemaining * 24);

      var expirationString = '';
      if (hoursRemaining > 0) {
        expirationString += hoursRemaining + ':';
      }
      if (minutesRemaining < 10) {
        minutesRemainingString = '0' + minutesRemainingString;
      }
      if (secondsRemaining < 10) {
        secondsRemainingString = '0' + secondsRemainingString;
      }
      expirationString += minutesRemainingString + ':' + secondsRemainingString;

      this.ui.$btnCrateInventory.find('.badge').addClass('active').text(expirationString);
    }
  },

  beginUpdateCrateExpiration: function () {
    // Make sure there isn't two running:
    this.stopUpdateCrateExpiration();

    this._expirationUpdateInterval = setInterval(this.updateCrateExpiration.bind(this), 1000);
  },

  stopUpdateCrateExpiration: function () {
    if (this._expirationUpdateInterval != null) {
      clearInterval(this._expirationUpdateInterval);
      this._expirationUpdateInterval = null;
    }
  },

  onClickButton: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
  },

  onChangeScene: function () {
    var newSceneData = SDK.CosmeticsFactory.sceneForIdentifier(CONFIG.selectedScene);
    this.ui.$sceneName.text(newSceneData.name);
    this._stopLoadingSceneTimeoutId = setTimeout(function () {
      this.ui.$sceneSwitcher.removeClass('loading');
    }.bind(this), 500);
  },

  onClickNextScene: function () {
    var selectedScene = CONFIG.selectedScene || SDK.CosmeticsFactory.getDefaultSceneIdentifier();
    var scenes = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.Scene);
    var index = -1;
    for (var i = 0, il = scenes.length; i < il; i++) {
      if (scenes[i].id === selectedScene) {
        index = i;
        break;
      }
    }
    // find next usable scene
    var newSceneData;
    while (newSceneData == null) {
      index = (index + 1) % scenes.length;
      var potentialSceneData = scenes[index];
      var potentialSceneId = potentialSceneData.id;
      if (potentialSceneId === selectedScene
        || InventoryManager.getInstance().getCanUseCosmeticById(potentialSceneId)) {
        newSceneData = potentialSceneData;
      }
    }
    var newScene = newSceneData && newSceneData.id;
    if (newScene != selectedScene) {
      this.ui.$sceneSwitcher.addClass('loading');
      ProfileManager.getInstance().profile.setSelectedScene(newScene);
    }
  },

  onClickPreviousScene: function () {
    var selectedScene = CONFIG.selectedScene || SDK.CosmeticsFactory.getDefaultSceneIdentifier();
    var scenes = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.Scene);
    var index = -1;
    for (var i = 0, il = scenes.length; i < il; i++) {
      if (scenes[i].id === selectedScene) {
        index = i;
        break;
      }
    }
    // find previous usable scene
    var newSceneData;
    while (newSceneData == null) {
      index = index <= 0 ? (scenes.length - 1) : (index - 1);
      var potentialSceneData = scenes[index];
      var potentialSceneId = potentialSceneData.id;
      if (potentialSceneId === selectedScene
        || InventoryManager.getInstance().getCanUseCosmeticById(potentialSceneId)) {
        newSceneData = potentialSceneData;
      }
    }
    var newScene = newSceneData && newSceneData.id;
    if (newScene != selectedScene) {
      this.ui.$sceneSwitcher.addClass('loading');
      ProfileManager.getInstance().profile.setSelectedScene(newScene);
    }
  },

  _showNewPlayerUI: function () {
    if (NewPlayerManager.getInstance().getCurrentCoreStage().value == SDK.NewPlayerProgressionStageEnum.TutorialDone.value) {
      this.ui.$playLabel.addClass('emphasis-glow');
      this.ui.$playLabel.popover({
        content: i18next.t('new_player_experience.highlight_practice_game_popover'),
        container: this.$el,
        animation: true,
      });
      this.ui.$playLabel.popover('show');
    }

    if (NewPlayerManager.getInstance().getCurrentCoreStage().value == SDK.NewPlayerProgressionStageEnum.FirstPracticeDuelDone.value) {
      this.ui.$playLabel.addClass('emphasis-glow');
      this.ui.$playLabel.popover({
        content: i18next.t('new_player_experience.highlight_more_practice_games_popover'),
        container: this.$el,
        animation: true,
      });
      this.ui.$playLabel.popover('show');
    }

    if (NewPlayerManager.getInstance().getCurrentCoreStage().value == SDK.NewPlayerProgressionStageEnum.ExtendedPracticeDone.value) {
      this.ui.$playLabel.addClass('emphasis-glow');
      this.ui.$playLabel.popover({
        content: i18next.t('new_player_experience.highlight_ladder_popover'),
        container: this.$el,
        animation: true,
      });
      this.ui.$playLabel.popover('show');
    }

    // if (NewPlayerManager.getInstance().getCurrentCoreStage().value == SDK.NewPlayerProgressionStageEnum.FirstFactionLevelingDone.value) {
    //   this.ui.$playLabel.addClass("emphasis-glow")
    //   this.ui.$playLabel.popover({
    //     content: "Season Ladder Here",
    //     container: this.$el,
    //    animation: true
    //   });
    //   this.ui.$playLabel.popover("show")
    // }

    var soloChallengeQuest = QuestsManager.getInstance().dailyQuestsCollection.find(function (q) {
      return q.get('quest_type_id') == QuestBeginnerCompleteSoloChallenges.Identifier;
    });
    if (soloChallengeQuest) {
      this.ui.$playLabel.addClass('emphasis-glow');
      this.ui.$playLabel.popover({
        content: i18next.t('new_player_experience.highlight_solo_challenge_popover'),
        container: this.$el,
        animation: true,
      });
      this.ui.$playLabel.popover('show');
    }

    if (NewPlayerManager.getInstance().getCurrentCoreStage().value == SDK.NewPlayerProgressionStageEnum.FirstFactionLevelingDone.value) {
    }

    if (NewPlayerManager.getInstance().getCurrentCoreStage().value == SDK.NewPlayerProgressionStageEnum.ExtendedPracticeDone.value) {
      this.ui.$playLabel.addClass('emphasis-glow');
      this.ui.$playLabel.popover({
        content: i18next.t('new_player_experience.highlight_ladder_popover'),
        container: this.$el,
        animation: true,
      });
      this.ui.$playLabel.popover('show');
    }

    // if (NewPlayerManager.getInstance().getCurrentCoreStage().value >= SDK.NewPlayerProgressionStageEnum.ExtendedPracticeDone.value) {
    //  this.ui.$shopCardsetPromo.removeClass("hide")
    // }
  },

  animateReveal: function () {
    // brand
    var brandMain = this.$el.find('.brand-main');
    var delay = 0;
    $(brandMain[0]).css('opacity', 0);
    brandMain[0].animate([
      { opacity: 0.0 },
      { opacity: 1.0 },
    ], {
      duration: 2000,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    // animated reveal
    var buttons = this.$el.find('.animate-reveal:visible');
    for (var i = 0; i < buttons.length; i++) {
      $(buttons[i]).css('opacity', 0);
      buttons[i].animate([
        { opacity: 0.0, transform: 'translateX(10px)' },
        { opacity: 1.0, transform: 'translateX(0px)' },
      ], {
        duration: 200,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      delay += 100;
    }
  },

  activateSymbolMainMenu: function () {
    if (this.ui.$symbolMainMenuIcon instanceof $) {
      if (this.ui.$symbolMainMenuIcon._animation == null) {
        this.ui.$symbolMainMenuIcon._animation = this.ui.$symbolMainMenuIcon[0].animate([
          { transform: 'rotateZ(0deg)' },
          { transform: 'rotateZ(360deg)' },
        ], {
          duration: 2000.0,
          iterations: Infinity,
        });
      } else {
        this.ui.$symbolMainMenuIcon._animation.play();
      }
    }
    if (this.ui.$symbolMainMenuRingInner instanceof $) {
      if (this.ui.$symbolMainMenuRingInner._animation == null) {
        this.ui.$symbolMainMenuRingInner._animation = this.ui.$symbolMainMenuRingInner[0].animate([
          { transform: 'rotateZ(0deg)' },
          { transform: 'rotateZ(-360deg)' },
        ], {
          duration: 12000.0,
          iterations: Infinity,
        });
      } else {
        this.ui.$symbolMainMenuRingInner._animation.play();
      }
    }
    if (this.ui.$symbolMainMenuRingOuter instanceof $) {
      if (this.ui.$symbolMainMenuRingOuter._animation == null) {
        this.ui.$symbolMainMenuRingOuter._animation = this.ui.$symbolMainMenuRingOuter[0].animate([
          { transform: 'rotateZ(0deg)' },
          { transform: 'rotateZ(360deg)' },
        ], {
          duration: 12000.0,
          iterations: Infinity,
        });
      } else {
        this.ui.$symbolMainMenuRingOuter._animation.play();
      }
    }
  },

  deactivateSymbolMainMenu: function () {
    if (this.ui.$symbolMainMenuIcon instanceof $ && this.ui.$symbolMainMenuIcon._animation != null) {
      this.ui.$symbolMainMenuIcon._animation.pause();
    }
    if (this.ui.$symbolMainMenuRingInner instanceof $ && this.ui.$symbolMainMenuRingInner._animation != null) {
      this.ui.$symbolMainMenuRingInner._animation.pause();
    }
    if (this.ui.$symbolMainMenuRingOuter instanceof $ && this.ui.$symbolMainMenuRingOuter._animation != null) {
      this.ui.$symbolMainMenuRingOuter._animation.pause();
    }
  },

  updateZodiacSymbols: function () {
    var $canvases = this.$el.find('.zodiac-symbol-canvas');
    this._zodiacModels || (this._zodiacModels = []);

    $canvases.each(function (i, canvas) {
      var $canvas = $(canvas);
      var $btn = $canvas.closest('.btn');
      var zodiacModel = this._zodiacModels[i];
      if (!zodiacModel) {
        // setup new zodiac symbol
        zodiacModel = this._zodiacModels[i] = new ZodiacSymbolModel({ canvas: canvas });
        zodiacModel.listenTo(this, 'destroy', zodiacModel.stopDrawing.bind(zodiacModel));
      } else {
        // provide canvas to zodiac symbol
        zodiacModel.setCanvas(canvas);
      }

      // listen to button mouse input
      $btn.on('mouseover', zodiacModel.startDrawing.bind(zodiacModel));
      $btn.on('mouseout', zodiacModel.stopDrawing.bind(zodiacModel));

      // always draw once
      zodiacModel.draw();
    }.bind(this));
  },

  onClickShopCardsetPromo: function (e) {
    NavigationManager.getInstance().toggleModalViewByClass(ShopSpiritOrbsModalView, {
      model: new Backbone.Model(),
      selectedCardSetTab: 'wartech',
    });
  },

  onClickPurchasePromo: function (e) {
    var productData = ShopData.promos.FROSTFIRE_2017_CRATE;
    productData = _.extend({}, productData, {
      name: i18next.t('shop.' + productData.name),
      description: i18next.t('shop.' + productData.description),
    });
    NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
      .then(function () {
        CrateManager.getInstance().refreshGiftCrates();
      }).catch(function () {
        // Do nothing on cancel
      });
  },

  onClickPremiumPurchasePromo: function (e) {
    var productData = ShopData.promos.FROSTFIRE_2017_PREMIUM_CRATE;
    productData = _.extend({}, productData, {
      name: i18next.t('shop.' + productData.name),
      description: i18next.t('shop.' + productData.description),
    });
    NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
      .then(function () {
        CrateManager.getInstance().refreshGiftCrates();
      }).catch(function () {
        // Do nothing on cancel
      });
  },

  onClickBossPromo: function (e) {
    if (ProgressionManager.getInstance().getHasActiveBossEvent()) {
      Analytics.track('boss battle promo selected', {
        category: Analytics.EventCategory.Boss,
      });
      EventBus.getInstance().trigger(EVENTS.show_play, SDK.PlayModes.BossBattle);
    }
  },

  updateBossEventTimer: function () {
    var eventMsRemaining = 0;
    var timeRemainingText = '';

    if (ProgressionManager.getInstance().getHasActiveBossEvent()) {
      var eventMsRemaining = ProgressionManager.getInstance().getTimeToActiveBossEventEnds();
      var timeRemainingText = i18next.t('common.available_for_duration_label');
    } else if (ProgressionManager.getInstance().getUpcomingBossEventModel()) {
      var eventMsRemaining = ProgressionManager.getInstance().getTimeToUpcomingBossEventAvailable();
      var timeRemainingText = i18next.t('common.available_in_duration_label');
    } else {
      this.ui.$bossEventPromoTimer.text('');
      return;
    }

    var eventDurationRemaining = moment.duration(eventMsRemaining);

    if (eventDurationRemaining.asDays() > 1) {
      timeRemainingText += eventDurationRemaining.days() + ' Days';
    } else if (eventDurationRemaining.asDays() == 1) {
      timeRemainingText += eventDurationRemaining.days() + ' Day';
    } else if (eventDurationRemaining.asHours() > 1) {
      timeRemainingText += eventDurationRemaining.hours() + ' Hours';
    } else if (eventDurationRemaining.asHours() == 1) {
      timeRemainingText += eventDurationRemaining.hours() + ' Hour';
    } else if (eventDurationRemaining.asMinutes() >= 1) {
      timeRemainingText += eventDurationRemaining.minutes() + ' Minutes';
    } else if (eventDurationRemaining.asMinutes() == 1) {
      timeRemainingText += eventDurationRemaining.minutes() + ' Minute';
    } else {
      timeRemainingText += eventDurationRemaining.seconds() + ' Seconds';
    }

    this.ui.$bossEventPromoTimer.text(timeRemainingText);
  },

  startBossEventTimer: function () {
    this.stopBossEventTimer();
    this._bossEventUpdateInterval = setInterval(this.updateBossEventTimer.bind(this), 1000);
  },

  stopBossEventTimer: function () {
    if (this._bossEventUpdateInterval != null) {
      clearInterval(this._bossEventUpdateInterval);
      this._bossEventUpdateInterval = null;
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = MainMenuItemView;
