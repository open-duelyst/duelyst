// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _NewPlayerManager = {};
_NewPlayerManager.instance = null;
_NewPlayerManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new NewPlayerManager();
  }
  return this.instance;
};
_NewPlayerManager.current = _NewPlayerManager.getInstance;

module.exports = _NewPlayerManager;

const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const NotificationModel = require('app/ui/models/notification');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const Analytics = require('app/common/analytics');
const moment = require('moment'); // WHY WONT THIS WORK
const Promise = require('bluebird');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const NewPlayerFeatureLookup = require('app/sdk/progression/newPlayerProgressionFeatureLookup');
const NewPlayerProgressionStageEnum = require('app/sdk/progression/newPlayerProgressionStageEnum');
const NewPlayerProgressionModuleLookup = require('app/sdk/progression/newPlayerProgressionModuleLookup');
const NewPlayerProgressionHelper = require('app/sdk/progression/newPlayerProgressionHelper');
const i18next = require('i18next');
const ProfileManager = require('./profile_manager');
const NavigationManager = require('./navigation_manager');
const NotificationsManager = require('./notifications_manager');
const InventoryManager = require('./inventory_manager');
const ProgressionManager = require('./progression_manager');
const Manager = require('./manager');

const NewPlayerModuleModel = DuelystBackbone.Model.extend({
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

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    this.newPlayerModulesCollection = new DuelystBackbone.Collection();
    this.newPlayerModulesCollection.model = NewPlayerModuleModel;
    this.newPlayerModulesCollection.url = `${process.env.API_URL}/api/me/new_player_progression`;
    this.newPlayerModulesCollection.fetch();

    this.onReady().then(() => {
      // listen to changes immediately so we don't miss anything
      this.listenTo(ProgressionManager.getInstance(), EVENTS.challenge_completed, this._onChallengeCompleted);
      this.listenTo(ProgressionManager.getInstance(), EVENTS.challenge_attempted, this._onChallengeAttempted);
      this.listenTo(InventoryManager.getInstance(), EVENTS.wallet_change, this._onWalletChange);

      // just in case of data migrations, issue an update on login / ready if we're past the tutorial
      if (this.getCurrentCoreStage() != NewPlayerProgressionStageEnum.Tutorial) {
        this.updateCoreState();
      }
    });

    this._markAsReadyWhenModelsAndCollectionsSynced([this.newPlayerModulesCollection]);
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
  },

  /* endregion CONNECT */

  /* region Core Player Progress */

  getCurrentCoreStage() {
    const coreModule = this.newPlayerModulesCollection && this.newPlayerModulesCollection.get(NewPlayerProgressionModuleLookup.Core);
    return (coreModule && NewPlayerProgressionStageEnum[coreModule.get('stage')]) || NewPlayerProgressionStageEnum.Tutorial;
  },

  setCurrentCoreStage(stage) {
    stage = NewPlayerProgressionStageEnum[stage];
    if (this.getCurrentCoreStage().value < stage.value) {
      return this.setModuleStage(NewPlayerProgressionModuleLookup.Core, stage.key);
    }
    return Promise.resolve();
  },

  canBuyBoosters() {
    return this.canSeeArmory();
  },

  canSeeSpiritOrbs() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuSpiritOrbs, this.getCurrentCoreStage());
  },

  canSeeWatchSection() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuWatch, this.getCurrentCoreStage());
  },

  canSeeCodex() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuCodex, this.getCurrentCoreStage());
  },

  canSeeArmory() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuShop, this.getCurrentCoreStage());
  },

  canAccessCollection() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuCollection, this.getCurrentCoreStage());
  },

  canSeeQuests() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuQuests, this.getCurrentCoreStage());
  },

  canSeeDailyChallenge() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuDailyChallenge, this.getCurrentCoreStage());
  },

  canSeeFreeCardOfTheDay() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuFreeCardOfTheDay, this.getCurrentCoreStage());
  },

  hasSeenFirstQuests() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Quest) == this._moduleStages.read;
  },

  canSeeProfile() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.UtilityMenuProfile, this.getCurrentCoreStage());
  },

  canSeeCrates() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.MainMenuCrates, this.getCurrentCoreStage())
        || this.getHasReceivedCrateProduct();
  },

  canSeeFirstWinOfTheDay() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.FirstWinOfTheDay, this.getCurrentCoreStage());
  },

  canPlayGauntlet() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeGauntlet, this.getCurrentCoreStage());
  },

  canPlayRift() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeGauntlet, this.getCurrentCoreStage());
  },

  canPlayQuickMatch() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeCasual, this.getCurrentCoreStage());
  },

  canPlayRanked() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeRanked, this.getCurrentCoreStage());
  },

  canPlayNonTutorialChallenges() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeSoloChallenges, this.getCurrentCoreStage());
  },

  canPlayBossBattle() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeBossBattle, this.getCurrentCoreStage());
  },

  canPlaySandbox() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModeSandbox, this.getCurrentCoreStage());
  },

  canPlayPractice() {
    return NewPlayerProgressionHelper.isFeatureAvailableAtStage(NewPlayerFeatureLookup.PlayModePractice, this.getCurrentCoreStage());
  },

  canPlayPlayMode(playMode) {
    if (playMode == SDK.PlayModes.Practice) {
      return this.canPlayPractice();
    } if (playMode == SDK.PlayModes.Challenges) {
      return this.canPlayNonTutorialChallenges();
    } if (playMode == SDK.PlayModes.Ranked) {
      return this.canPlayRanked() || this.canPlayQuickMatch(); // Temp, this is needed as long as ranked and casual are bundled
    } if (playMode == SDK.PlayModes.Casual) {
      return this.canPlayQuickMatch();
    } if (playMode == SDK.PlayModes.Gauntlet) {
      return this.canPlayGauntlet();
    } if (playMode == SDK.PlayModes.Rift) {
      return this.canPlayRift();
    } if (playMode == SDK.PlayModes.BossBattle) {
      return this.canPlayBossBattle();
    } if (playMode == SDK.PlayModes.Sandbox) {
      return this.canPlaySandbox();
    } if (playMode == SDK.PlayModes.Developer) {
      return true;// Developer is disabled for players
    } else {
      console.error('NewPlayerManager:canPlayPlayMode Error - Unknown play mode identifier: ' + playMode);
    }
  },

  getEmphasizeQuests() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Quest) == this._moduleStages.unread;
  },

  getEmphasizeMatchmaking() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Matchmaking) == this._moduleStages.unread;
  },

  getEmphasizeStarterDecksTab() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab) == this._moduleStages.unread;
  },

  isDoneWithTutorial() {
    return this.getCurrentCoreStage().value > NewPlayerProgressionStageEnum.Tutorial.value;
  },

  getEmphasizeBoosterUnlock() {
    // return false;//TODO HOTFIX: this popover is working unreliably https://trello.com/c/AZJKZgfY/3370-fix-armory-emphasis-popover
    // return this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) == this._moduleStages.unread;
    // return this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) != this._moduleStages.read;
    return InventoryManager.getInstance().walletModel.get('gold_amount') >= 100 && this.getCurrentCoreStage().value < NewPlayerProgressionHelper.FinalStage.value;
  },

  setHasPurchasedBoosterPack() {
    // If user buys a booster advance booster unlock module
    if (this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) == this._moduleStages.unread) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock, this._moduleStages.read);
    }
  },

  getHasUsedRiftUpgrade() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.RiftUpgradeUsed) == this._moduleStages.read;
  },

  setHasUsedRiftUpgrade(val) {
    if (val && this.getModuleStage(NewPlayerProgressionModuleLookup.RiftUpgradeUsed) != this._moduleStages.read) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.RiftUpgradeUsed, this._moduleStages.read);
    }
  },

  setHasSeenStarterDecksTab(val) {
    // If user buys a booster advance booster unlock module
    if (val && this.getModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab) == this._moduleStages.unread) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab, this._moduleStages.read);
    }
  },

  setNeedsToSeeStarterDecksTab(val) {
    // If user buys a booster advance booster unlock module
    if (val && this.getModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab) === this._moduleStages.inactive) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.StarterDeckTab, this._moduleStages.unread);
    }
  },

  getHasSeenBloodbornSpellInfo() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BloodbornSpellInfo) == this._moduleStages.read;
  },

  setHasSeenBloodbornSpellInfo() {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BloodbornSpellInfo, this._moduleStages.read);
  },

  getHasSeenBattlePetInfo() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BattlePetInfo) == this._moduleStages.read;
  },

  setHasSeenBattlePetInfo() {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BattlePetInfo, this._moduleStages.read);
  },

  getHasSeenBattlePetReminder() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BattlePetReminder) == this._moduleStages.read;
  },

  setHasSeenBattlePetReminder() {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BattlePetReminder, this._moduleStages.read);
  },

  getHasSeenBattlePetActionNotification() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.BattlePetActionNotification) == this._moduleStages.read;
  },

  setHasSeenBattlePetActionNotification() {
    this.setModuleStage(NewPlayerProgressionModuleLookup.BattlePetActionNotification, this._moduleStages.read);
  },

  getHasReceivedCrateProduct() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.ReceivedCrate) == this._moduleStages.read;
  },

  // A crate product can be anything related to crates: cosmetic chests, keys, boss crates, gift crates
  setHasReceivedCrateProduct() {
    this.setModuleStage(NewPlayerProgressionModuleLookup.ReceivedCrate, this._moduleStages.read);
  },

  // A crate product can be anything related to crates: cosmetic chests, keys, boss crates, gift crates
  getHasPlayedRanked() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.Matchmaking) == this._moduleStages.read;
  },

  setHasPlayedRanked(lastGameModel) {
    if (lastGameModel && lastGameModel.get('game_type') == SDK.GameType.Ranked) {
      // FTUE analytics
      if (!this.getHasPlayedRanked()) {
        let outcomeKey = -1;
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

  getHasPlayedSinglePlayer() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.SinglePlayerPlayed) == this._moduleStages.read;
  },

  setHasPlayedSinglePlayer(lastGameModel) {
    if (lastGameModel && lastGameModel.get('game_type') == SDK.GameType.SinglePlayer) {
      // FTUE analytics
      if (!this.getHasPlayedSinglePlayer()) {
        let outcomeKey = -1;
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

  getHasOpenedSpiritOrb() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.SpiritOrbOpened) == this._moduleStages.read;
  },

  setHasOpenedSpiritOrb(val) {
    if (val) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.SpiritOrbOpened, this._moduleStages.read);
    }
  },

  getHasCraftedCard() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.SraftedCard) == this._moduleStages.read;
  },

  setHasCraftedCard(cardId) {
    if (cardId != null) {
      // FTUE analytics
      if (!this.getHasCraftedCard()) {
        Analytics.track('first card crafted', {
          category: Analytics.EventCategory.FTUE,
          cardId,
        }, {
          sendUTMData: true,
          nonInteraction: 1,
        });
      }

      this.setModuleStage(NewPlayerProgressionModuleLookup.CraftedCard, this._moduleStages.read);
    }
  },

  getHasSeenGameGoldTipConfirmation() {
    return this.getModuleStage(NewPlayerProgressionModuleLookup.GameGoldTips) == this._moduleStages.read;
  },

  setHasSeenGameGoldTipConfirmation(val) {
    if (val) this.setModuleStage(NewPlayerProgressionModuleLookup.GameGoldTips, this._moduleStages.read);
  },

  /* endregion Core Player Progress */

  /* region Module Player Progress */

  getModuleStage(moduleName) {
    const module = this.newPlayerModulesCollection && this.newPlayerModulesCollection.get(moduleName);
    return (module && module.get('stage')) || this._moduleStages.inactive;
  },

  setModuleStage(moduleName, stage) {
    if (this.newPlayerModulesCollection == null) {
      return;
    }

    const module = this.newPlayerModulesCollection.get(moduleName);
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
        stage,
      });
    }

    return Promise.resolve($.ajax({
      data: JSON.stringify({ stage }),
      url: `${process.env.API_URL}/api/me/new_player_progression/${moduleName}/stage`,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
    }))
      .bind({})
      .then(function (progressionData) {
        Analytics.track('module stage reached', {
          category: Analytics.EventCategory.FTUE,
          module_and_stage: `${moduleName}:${stage}`,
        }, {
          labelKey: 'module_and_stage',
          sendUTMData: true,
        });

        if (moduleName == NewPlayerProgressionModuleLookup.Core) {
          const newModuleStageIndex = _.indexOf(_.map(NewPlayerProgressionStageEnum.enums, (val) => val.key), stage);
          if (newModuleStageIndex > 0) {
            const completedModuleStage = NewPlayerProgressionStageEnum.enums[newModuleStageIndex - 1];
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

  _onWalletChange() {
    // Check if advancement needed for booster unlock module
    if (this.getModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock) == this._moduleStages.inactive) {
      if (this.canBuyBoosters()) {
        this.setModuleStage(NewPlayerProgressionModuleLookup.BoosterUnlock, this._moduleStages.unread);
      }
    }
  },

  _onChallengeCompleted(challengeCompletedEvent) {
    // this.updateCoreState();
  },

  _onChallengeAttempted(challengeAttemptedEvent) {
    // this.updateCoreState();
  },

  updateCoreState() {
    // If player has completed all tutorial challenges move them to that stage if they are a new player
    if (this.getCurrentCoreStage() == NewPlayerProgressionStageEnum.Tutorial) {
      if (ProgressionManager.getInstance().hasCompletedChallengeCategory(SDK.ChallengeCategory.tutorial.type)) {
        this.setModuleStage(NewPlayerProgressionModuleLookup.Quest, this._moduleStages.unread);
        return this.setCurrentCoreStage(NewPlayerProgressionStageEnum.TutorialDone);
      }
    // otherwise, let's figure out if we need to move the core state forward
    } else if (this.getCurrentCoreStage().value < NewPlayerProgressionHelper.FinalStage.value) {
      const quests = NewPlayerProgressionHelper.questsForStage(this.getCurrentCoreStage());
      if (quests && quests.length > 0) {
        return Promise.resolve($.ajax({
          url: `${process.env.API_URL}/api/me/new_player_progression/core`,
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        }))
          .then((response) => {
            if (response && response.progressionData) {
              const { progressionData } = response;
              const module = this.newPlayerModulesCollection.get(SDK.NewPlayerProgressionModuleLookup.Core);
              if (module && module.get('stage') != progressionData.stage) {
                module.set('stage', progressionData.stage);
                // Analytics for core state since we're not going through setCurrentCoreStage
                const secondsSinceRegistration = Math.floor((new Date().getTime() - ProfileManager.getInstance().profile.getRegistrationDate()) / 1000.0);
                // TODO: Revalidate these values by stepping through
                Analytics.track('module stage reached', {
                  category: Analytics.EventCategory.FTUE,
                  module_and_stage: 'core' + `:${progressionData.stage}`,
                }, {
                  labelKey: 'module_and_stage',
                  sendUTMData: true,
                });

                const newModuleStageIndex = _.indexOf(_.map(NewPlayerProgressionStageEnum.enums, (val) => val.key), progressionData.stage);
                if (newModuleStageIndex > 0) {
                  const completedModuleStage = NewPlayerProgressionStageEnum.enums[newModuleStageIndex - 1];
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
            }
            return { progressionData: null };
          })
          .then((response) => {
          // Check if this is the core stage where codex becomes available and retrieve starter chapters if so
            const coreStageCodexUnlocks = NewPlayerProgressionHelper.featureToCoreStageMapping[NewPlayerFeatureLookup.MainMenuCodex];
            if (this.getCurrentCoreStage().value == coreStageCodexUnlocks.value) {
            // No need to wait up on this before progressing promise
              InventoryManager.getInstance().checkForMissingCodexChapters();
            }

            // Maintain resolving to ajax response
            return Promise.resolve(response);
          });
      }
    }

    return Promise.resolve();
  },

  removeQuestEmphasis() {
    if (this.getModuleStage(NewPlayerProgressionModuleLookup.Quest) == this._moduleStages.unread) {
      this.setModuleStage(NewPlayerProgressionModuleLookup.Quest, this._moduleStages.read);
    }
  },

  shouldStartGeneratingDailyQuests() {
    return this.getCurrentCoreStage().value >= NewPlayerProgressionHelper.DailyQuestsStartToGenerateStage.value;
  },

  isCoreProgressionDone() {
    return this.getCurrentCoreStage().value >= NewPlayerProgressionHelper.FinalStage.value;
  },

  _completeProgression() {
    _.each(this._moduleNames, function (moduleName) {
      this.setModuleStage(moduleName, this._moduleStages.read);
    }, this);

    this.setCurrentCoreStage(NewPlayerProgressionHelper.FinalStage);

    _.each(SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type), (challenge) => {
      ProgressionManager.getInstance().completeChallengeWithType(challenge.type);
    }, this);
  },

  /* endregion EVENT HANDLERS */

});
