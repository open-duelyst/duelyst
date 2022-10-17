// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _NewPlayerManager = {};
_NewPlayerManager.instance = null;
_NewPlayerManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new NewPlayerManager();
  }
  return this.instance;
};
_NewPlayerManager.current = _NewPlayerManager.getInstance;

module.exports = _NewPlayerManager;

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var NotificationModel = require('app/ui/models/notification');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var Analytics = require('app/common/analytics');
var moment = require('moment'); // WHY WONT THIS WORK
var Promise = require('bluebird');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var NewPlayerFeatureLookup = require('app/sdk/progression/newPlayerProgressionFeatureLookup');
var NewPlayerProgressionStageEnum = require('app/sdk/progression/newPlayerProgressionStageEnum');
var NewPlayerProgressionModuleLookup = require('app/sdk/progression/newPlayerProgressionModuleLookup');
var NewPlayerProgressionHelper = require('app/sdk/progression/newPlayerProgressionHelper');
var i18next = require('i18next');
var ProfileManager = require('./profile_manager');
var NavigationManager = require('./navigation_manager');
var NotificationsManager = require('./notifications_manager');
var InventoryManager = require('./inventory_manager');
var ProgressionManager = require('./progression_manager');
var Manager = require('./manager');

var NewPlayerModuleModel = DuelystBackbone.Model.extend({
  idAttribute: 'module_name',
});

var NewPlayerManager = Manager.extend({

  newPlayerModulesCollection: null,

  _moduleStages: {
    inactive: 'inactive',
    unread: 'unread',
    read: 'read',
  },

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    this.newPlayerModulesCollection = new DuelystBackbone.Collection();
    this.newPlayerModulesCollection.model = NewPlayerModuleModel;
    this.newPlayerModulesCollection.url = process.env.API_URL + '/api/me/new_player_progression';
    this.newPlayerModulesCollection.fetch();

    this.onReady().then(function () {
      // listen to changes immediately so we don't miss anything
      this.listenTo(ProgressionManager.getInstance(), EVENTS.challenge_completed, this._onChallengeCompleted);
      this.listenTo(ProgressionManager.getInstance(), EVENTS.challenge_attempted, this._onChallengeAttempted);
      this.listenTo(InventoryManager.getInstance(), EVENTS.wallet_change, this._onWalletChange);

      // just in case of data migrations, issue an update on login / ready if we're past the tutorial
      if (this.getCurrentCoreStage() != NewPlayerProgressionStageEnum.Tutorial) {
        this.updateCoreState();
      }
    }.bind(this));

    this._markAsReadyWhenModelsAndCollectionsSynced([this.newPlayerModulesCollection]);
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
  },

  /* endregion CONNECT */

  /* region Core Player Progress */

  getCurrentCoreStage: function () {
    var coreModule = this.newPlayerModulesCollection && this.newPlayerModulesCollection.get(NewPlayerProgressionModuleLookup.Core);
    return (coreModule && NewPlayerProgressionStageEnum[coreModule.get('stage')]) || NewPlayerProgressionStageEnum.Tutorial;
  },

  setCurrentCoreStage: function (stage) {
    stage = NewPlayerProgressionStageEnum[stage];
    if (this.getCurrentCoreStage().value < stage.value) {
      return this.setModuleStage(NewPlayerProgressionModuleLookup.Core, stage.key);
    }
    return Promise.resolve();
  },

  canBuyBoosters: function () {
    return this.canSeeArmory();
  },

  canSeeSpiritOrbs: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuSpiritOrbs, this.getCurrentCoreStage());
  },

  canSeeWatchSection: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuWatch, this.getCurrentCoreStage());
  },

  canSeeCodex: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuCodex, this.getCurrentCoreStage());
  },

  canSeeArmory: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuShop, this.getCurrentCoreStage());
  },

  canAccessCollection: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuCollection, this.getCurrentCoreStage());
  },

  canSeeQuests: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuQuests, this.getCurrentCoreStage());
  },

  canSeeDailyChallenge: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuDailyChallenge, this.getCurrentCoreStage());
  },

  canSeeFreeCardOfTheDay: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuFreeCardOfTheDay, this.getCurrentCoreStage());
  },

  hasSeenFirstQuests: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Quest) == this._moduleStages.read;
  },

  canSeeProfile: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuProfile, this.getCurrentCoreStage());
  },

  canSeeCrates: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuCrates, this.getCurrentCoreStage())
        || this.getHasReceivedCrateProduct();
  },

  canSeeFirstWinOfTheDay: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.FirstWinOfTheDay, this.getCurrentCoreStage());
  },

  canPlayGauntlet: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeGauntlet, this.getCurrentCoreStage());
  },

  canPlayRift: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeGauntlet, this.getCurrentCoreStage());
  },

  canPlayQuickMatch: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeCasual, this.getCurrentCoreStage());
  },

  canPlayRanked: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeRanked, this.getCurrentCoreStage());
  },

  canPlayNonTutorialChallenges: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeSoloChallenges, this.getCurrentCoreStage());
  },

  canPlayBossBattle: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeBossBattle, this.getCurrentCoreStage());
  },

  canPlaySandbox: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeSandbox, this.getCurrentCoreStage());
  },

  canPlayPractice: function () {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModePractice, this.getCurrentCoreStage());
  },

  canPlayPlayMode: function (playMode) {
    if (playMode == SDK.PlayModes.Practice) {
      return this.canPlayPractice();
    } else if (playMode == SDK.PlayModes.Challenges) {
      return this.canPlayNonTutorialChallenges();
    } else if (playMode == SDK.PlayModes.Ranked) {
      return this.canPlayRanked() || this.canPlayQuickMatch(); // Temp, this is needed as long as ranked and casual are bundled
    } else if (playMode == SDK.PlayModes.Casual) {
      return this.canPlayQuickMatch();
    } else if (playMode == SDK.PlayModes.Gauntlet) {
      return this.canPlayGauntlet();
    } else if (playMode == SDK.PlayModes.Rift) {
      return this.canPlayRift();
    } else if (playMode == SDK.PlayModes.BossBattle) {
      return this.canPlayBossBattle();
    } else if (playMode == SDK.PlayModes.Sandbox) {
      return this.canPlaySandbox();
    } else if (playMode == SDK.PlayModes.Developer) {
      return true;// Developer is disabled for players
    } else {
      console.error('NewPlayerManager:canPlayPlayMode Error - Unknown play mode identifier: ' + playMode);
    }
  },

  getEmphasizeQuests: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Quest) == this._moduleStages.unread;
  },

  getEmphasizeMatchmaking: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Matchmaking) == this._moduleStages.unread;
  },

  getEmphasizeStarterDecksTab: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab) == this._moduleStages.unread;
  },

  isDoneWithTutorial: function () {
    return this.getCurrentCoreStage().value > NewPlayerProgressionStageEnum.Tutorial.value;
  },

  getEmphasizeBoosterUnlock: function () {
    // return false;//TODO HOTFIX: this popover is working unreliably https://trello.com/c/AZJKZgfY/3370-fix-armory-emphasis-popover
    // return this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) == this._moduleStages.unread;
    // return this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) != this._moduleStages.read;
    return InventoryManager.getInstance().walletModel.get('gold_amount') >= 100 && this.getCurrentCoreStage().value < NewPlayerProgressionHelper.FinalStage.value;
  },

  setHasPurchasedBoosterPack: function () {
    // If user buys a booster advance booster unlock module
    if (this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) == this._moduleStages.unread) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock, this._moduleStages.read);
    }
  },

  getHasUsedRiftUpgrade: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.RiftUpgradeUsed) == this._moduleStages.read;
  },

  setHasUsedRiftUpgrade: function (val) {
    if (val && this.getModuleStage(NewPlayerProgressionModuleLookup.RiftUpgradeUsed) != this._moduleStages.read) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.RiftUpgradeUsed, this._moduleStages.read);
    }
  },

  setHasSeenStarterDecksTab: function (val) {
    // If user buys a booster advance booster unlock module
    if (val && this.getModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab) == this._moduleStages.unread) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab, this._moduleStages.read);
    }
  },

  setNeedsToSeeStarterDecksTab: function (val) {
    // If user buys a booster advance booster unlock module
    if (val && this.getModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab) === this._moduleStages.inactive) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab, this._moduleStages.unread);
    }
  },

  getHasSeenBloodbornSpellInfo: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BloodbornSpellInfo) == this._moduleStages.read;
  },

  setHasSeenBloodbornSpellInfo: function () {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BloodbornSpellInfo, this._moduleStages.read);
  },

  getHasSeenBattlePetInfo: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BattlePetInfo) == this._moduleStages.read;
  },

  setHasSeenBattlePetInfo: function () {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BattlePetInfo, this._moduleStages.read);
  },

  getHasSeenBattlePetReminder: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BattlePetReminder) == this._moduleStages.read;
  },

  setHasSeenBattlePetReminder: function () {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BattlePetReminder, this._moduleStages.read);
  },

  getHasSeenBattlePetActionNotification: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BattlePetActionNotification) == this._moduleStages.read;
  },

  setHasSeenBattlePetActionNotification: function () {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BattlePetActionNotification, this._moduleStages.read);
  },

  getHasReceivedCrateProduct: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.ReceivedCrate) == this._moduleStages.read;
  },

  // A crate product can be anything related to crates: cosmetic chests, keys, boss crates, gift crates
  setHasReceivedCrateProduct: function () {
    this.setModuleStage(NewPlayerProgressionModuleLookup.ReceivedCrate, this._moduleStages.read);
  },

  // A crate product can be anything related to crates: cosmetic chests, keys, boss crates, gift crates
  getHasPlayedRanked: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Matchmaking) == this._moduleStages.read;
  },

  setHasPlayedRanked: function (lastGameModel) {
    if (lastGameModel && lastGameModel.get('game_type') == SDK.GameType.Ranked) {
      // FTUE analytics
      if (!this.getHasPlayedRanked()) {
        var outcomeKey = -1;
        if (lastGameModel.get('is_winner')) {
          outcomeKey = 1;
        } else if (lastGameModel.get('is_draw')) {
          outcomeKey = 0;
        }
        Analytics.track('first ranked game completed', {
          category: Analytics.EventCategory.FTUE,
          game_id: lastGameModel.get('id'),
          game_outcome: outcomeKey,
        }, {
          sendUTMData: true,
          nonInteraction: 1,
        });
      }

      this.setModuleStage(NewPlayerProgressionModuleLookup.Matchmaking, this._moduleStages.read);
    }
  },

  getHasPlayedSinglePlayer: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.SinglePlayerPlayed) == this._moduleStages.read;
  },

  setHasPlayedSinglePlayer: function (lastGameModel) {
    if (lastGameModel && lastGameModel.get('game_type') == SDK.GameType.SinglePlayer) {
      // FTUE analytics
      if (!this.getHasPlayedSinglePlayer()) {
        var outcomeKey = -1;
        if (lastGameModel.get('is_winner')) {
          outcomeKey = 1;
        } else if (lastGameModel.get('is_draw')) {
          outcomeKey = 0;
        }
        Analytics.track('first single player game completed', {
          category: Analytics.EventCategory.FTUE,
          game_id: lastGameModel.get('id'),
          game_outcome: outcomeKey,
        }, {
          sendUTMData: true,
          nonInteraction: 1,
        });
      }

      if (this.getModuleStage(NewPlayerProgressionModuleLookup.SinglePlayerPlayed) != this._moduleStages.read) {
        return this.setModuleStage(NewPlayerProgressionModuleLookup.SinglePlayerPlayed, this._moduleStages.read);
      }
    }
  },

  getHasOpenedSpiritOrb: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.SpiritOrbOpened) == this._moduleStages.read;
  },

  setHasOpenedSpiritOrb: function (val) {
    if (val) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.SpiritOrbOpened, this._moduleStages.read);
    }
  },

  getHasCraftedCard: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.SraftedCard) == this._moduleStages.read;
  },

  setHasCraftedCard: function (cardId) {
    if (cardId != null) {
      // FTUE analytics
      if (!this.getHasCraftedCard()) {
        Analytics.track('first card crafted', {
          category: Analytics.EventCategory.FTUE,
          cardId: cardId,
        }, {
          sendUTMData: true,
          nonInteraction: 1,
        });
      }

      this.setModuleStage(NewPlayerProgressionModuleLookup.CraftedCard, this._moduleStages.read);
    }
  },

  getHasSeenGameGoldTipConfirmation: function () {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.GameGoldTips) == this._moduleStages.read;
  },

  setHasSeenGameGoldTipConfirmation: function (val) {
    if (val)
      this.setModuleStage(NewPlayerProgressionModuleLookup.GameGoldTips, this._moduleStages.read);
  },

  /* endregion Core Player Progress */

  /* region Module Player Progress */

  getModuleStage: function (moduleName) {
    var module = this.newPlayerModulesCollection && this.newPlayerModulesCollection.get(moduleName);
    return (module && module.get('stage')) || this._moduleStages.inactive;
  },

  setModuleStage: function (moduleName, stage) {
    if (this.newPlayerModulesCollection == null) {
      return;
    }

    var module = this.newPlayerModulesCollection.get(moduleName);
    if (module) {
      if (module.get('stage') != stage) {
        module.set('stage', stage);
      } else {
        // looks like nothing changed...
        return;
      }
    } else {
      this.newPlayerModulesCollection.add({
        module_name: moduleName,
        stage: stage,
      });
    }

    return Promise.resolve($.ajax({
      data: JSON.stringify({ stage: stage }),
      url: process.env.API_URL + '/api/me/new_player_progression/' + moduleName + '/stage',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
    }))
      .bind({})
      .then(function (progressionData) {
        Analytics.track('module stage reached', {
          category: Analytics.EventCategory.FTUE,
          module_and_stage: moduleName + ':' + stage,
        }, {
          labelKey: 'module_and_stage',
          sendUTMData: true,
        });

        if (moduleName == NewPlayerProgressionModuleLookup.Core) {
          var newModuleStageIndex = _.indexOf(_.map(NewPlayerProgressionStageEnum.enums, function (val) { return val.key; }), stage);
          if (newModuleStageIndex > 0) {
            var completedModuleStage = NewPlayerProgressionStageEnum.enums[newModuleStageIndex - 1];
            Analytics.track('completed ftue stage', {
              category: Analytics.EventCategory.Marketing,
              stage_name: completedModuleStage.key,
            }, {
              labelKey: 'stage_name',
              sendUTMData: true,
            });
          }
        }

        this.progressionData = progressionData;
        return this;
      });
  },

  /* endregion Module Player Progress */

  /* region EVENT HANDLERS */

  _onWalletChange: function () {
    // Check if advancement needed for booster unlock module
    if (this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) == this._moduleStages.inactive) {
      if (this.canBuyBoosters()) {
        this.setModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock, this._moduleStages.unread);
      }
    }
  },

  _onChallengeCompleted: function (challengeCompletedEvent) {
    // this.updateCoreState();
  },

  _onChallengeAttempted: function (challengeAttemptedEvent) {
    // this.updateCoreState();
  },

  updateCoreState: function () {
    // If player has completed all tutorial challenges move them to that stage if they are a new player
    if (this.getCurrentCoreStage() == NewPlayerProgressionStageEnum.Tutorial) {
      if (ProgressionManager.getInstance().hasCompletedChallengeCategory(SDK.ChallengeCategory.tutorial.type)) {
        this.setModuleStage(NewPlayerProgressionModuleLookup.Quest, this._moduleStages.unread);
        return this.setCurrentCoreStage(NewPlayerProgressionStageEnum.TutorialDone);
      }
    // otherwise, let's figure out if we need to move the core state forward
    } else if (this.getCurrentCoreStage().value < NewPlayerProgressionHelper.FinalStage.value) {
      var quests = NewPlayerProgressionHelper.questsForStage(this.getCurrentCoreStage());
      if (quests && quests.length > 0) {
        return Promise.resolve($.ajax({
          url: process.env.API_URL + '/api/me/new_player_progression/core',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        }))
          .then(function (response) {
            if (response && response.progressionData) {
              var progressionData = response.progressionData;
              var module = this.newPlayerModulesCollection.get(SDK.NewPlayerProgressionModuleLookup.Core);
              if (module && module.get('stage') != progressionData.stage) {
                module.set('stage', progressionData.stage);
                // Analytics for core state since we're not going through setCurrentCoreStage
                var secondsSinceRegistration = Math.floor((new Date().getTime() - ProfileManager.getInstance().profile.getRegistrationDate()) / 1000.0);
                // TODO: Revalidate these values by stepping through
                Analytics.track('module stage reached', {
                  category: Analytics.EventCategory.FTUE,
                  module_and_stage: 'core' + ':' + progressionData.stage,
                }, {
                  labelKey: 'module_and_stage',
                  sendUTMData: true,
                });

                var newModuleStageIndex = _.indexOf(_.map(NewPlayerProgressionStageEnum.enums, function (val) { return val.key; }), progressionData.stage);
                if (newModuleStageIndex > 0) {
                  var completedModuleStage = NewPlayerProgressionStageEnum.enums[newModuleStageIndex - 1];
                  Analytics.track('completed ftue stage', {
                    category: Analytics.EventCategory.Marketing,
                    stage_name: completedModuleStage.key,
                  }, {
                    labelKey: 'stage_name',
                    sendUTMData: true,
                  });
                }
              }
              return response;
            } else {
              return { progressionData: null };
            }
          }.bind(this))
          .then(function (response) {
          // Check if this is the core stage where codex becomes available and retrieve starter chapters if so
            var coreStageCodexUnlocks = NewPlayerProgressionHelper.featureToCoreStageMapping[NewPlayerFeatureLookup.MainMenuCodex];
            if (this.getCurrentCoreStage().value == coreStageCodexUnlocks.value) {
            // No need to wait up on this before progressing promise
              InventoryManager.getInstance().checkForMissingCodexChapters();
            }

            // Maintain resolving to ajax response
            return Promise.resolve(response);
          }.bind(this));
      }
    }

    return Promise.resolve();
  },

  removeQuestEmphasis: function () {
    if (this.getModuleStage(NewPlayerProgressionModuleLookup.Quest) == this._moduleStages.unread) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.Quest, this._moduleStages.read);
    }
  },

  shouldStartGeneratingDailyQuests: function () {
    return this.getCurrentCoreStage().value >= NewPlayerProgressionHelper.DailyQuestsStartToGenerateStage.value;
  },

  isCoreProgressionDone: function () {
    return this.getCurrentCoreStage().value >= NewPlayerProgressionHelper.FinalStage.value;
  },

  _completeProgression: function () {
    _.each(this._moduleNames, function (moduleName) {
      this.setModuleStage(moduleName, this._moduleStages.read);
    }, this);

    this.setCurrentCoreStage(NewPlayerProgressionHelper.FinalStage);

    _.each(SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type), function (challenge) {
      ProgressionManager.getInstance().completeChallengeWithType(challenge.type);
    }, this);
  },

  /* endregion EVENT HANDLERS */

});
