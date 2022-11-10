# User Agent Parsing
UAParser = require 'ua-parser-js'
uaparser = new UAParser()
uaparser.setUA(window.navigator.userAgent)
userAgent = uaparser.getResult()
# userAgent now contains : browser, os, device, engine objects

# ---- Marionette Application ---- #
#
App = new Backbone.Marionette.Application()

# require Firebase via browserify but temporarily alias it global scope
Firebase = window.Firebase = require 'firebase'
Promise = require 'bluebird'
moment = require 'moment'
semver = require 'semver'
querystring = require 'query-string'

# core
Storage = require 'app/common/storage'
Logger = window.Logger = require 'app/common/logger'

# Disable detailed logging in production.
Logger.enabled = process.env.NODE_ENV != 'production'

Landing = require 'app/common/landing'
Session = window.Session = require 'app/common/session2'
CONFIG = window.CONFIG = require 'app/common/config'
RSX = window.RSX = require 'app/data/resources'
PKGS = window.PKGS = require 'app/data/packages'
EventBus = window.EventBus = require 'app/common/eventbus'
EVENTS = require 'app/common/event_types'
SDK = window.SDK = require 'app/sdk'
Analytics = window.Analytics = require 'app/common/analytics'
AnalyticsUtil = require 'app/common/analyticsUtil'
UtilsJavascript = require 'app/common/utils/utils_javascript'
UtilsEnv = require 'app/common/utils/utils_env'
UtilsPointer = require 'app/common/utils/utils_pointer'
audio_engine = window.audio_engine = require 'app/audio/audio_engine'
openUrl = require('app/common/openUrl')
i18next = require('i18next')

# models and collections
CardModel = require 'app/ui/models/card'
DuelystFirebase = require 'app/ui/extensions/duelyst_firebase'
DuelystBackbone = require 'app/ui/extensions/duelyst_backbone'

# Managers / Controllers
PackageManager = window.PackageManager = require 'app/ui/managers/package_manager'
ProfileManager = window.ProfileManager = require 'app/ui/managers/profile_manager'
GameDataManager = window.GameDataManager = require 'app/ui/managers/game_data_manager'
GamesManager = window.GamesManager = require 'app/ui/managers/games_manager'
CrateManager = window.CrateManager = require 'app/ui/managers/crate_manager'
NotificationsManager = window.NotificationsManager = require 'app/ui/managers/notifications_manager'
NavigationManager = window.NavigationManager = require 'app/ui/managers/navigation_manager'
ChatManager = window.ChatManager = require 'app/ui/managers/chat_manager'
InventoryManager = window.InventoryManager = require 'app/ui/managers/inventory_manager'
QuestsManager = window.QuestsManager = require 'app/ui/managers/quests_manager'
TelemetryManager = window.TelemetryManager = require 'app/ui/managers/telemetry_manager'
ProgressionManager = window.ProgressionManager = require 'app/ui/managers/progression_manager'
ServerStatusManager = window.ServerStatusManager = require 'app/ui/managers/server_status_manager'
NewsManager = window.NewsManager = require 'app/ui/managers/news_manager'
NewPlayerManager = window.NewPlayerManager = require 'app/ui/managers/new_player_manager'
AchievementsManager = window.AchievementsManager = require 'app/ui/managers/achievements_manager'
TwitchManager = window.TwitchManager = require 'app/ui/managers/twitch_manager'
ShopManager = window.ShopManager = require 'app/ui/managers/shop_manager'
StreamManager = window.StreamManager = require 'app/ui/managers/stream_manager'

# Views
Helpers = require 'app/ui/views/helpers'

LoaderItemView = require 'app/ui/views/item/loader'

UtilityLoadingLoginMenuItemView = require 'app/ui/views/item/utility_loading_login_menu'
UtilityMainMenuItemView = require 'app/ui/views/item/utility_main_menu'
UtilityMatchmakingMenuItemView = require 'app/ui/views/item/utility_matchmaking_menu'
UtilityGameMenuItemView = require 'app/ui/views/item/utility_game_menu'
EscGameMenuItemView = require 'app/ui/views/item/esc_game_menu'
EscMainMenuItemView = require 'app/ui/views/item/esc_main_menu'

LoginMenuItemView = require 'app/ui/views/item/login_menu'


Discord = if window.isDesktop then require('app/common/discord') else null

SelectUsernameItemView = require 'app/ui/views/item/select_username'

Scene = require 'app/view/Scene'
GameLayer = require 'app/view/layers/game/GameLayer'

MainMenuItemView = require 'app/ui/views/item/main_menu'
CollectionLayout = require 'app/ui/views2/collection/collection'

PlayLayout = require 'app/ui/views/layouts/play'
PlayLayer = require 'app/view/layers/pregame/PlayLayer'

WatchLayout = require 'app/ui/views2/watch/watch_layout'
ShopLayout = require 'app/ui/views2/shop/shop_layout'

CodexLayout = require 'app/ui/views2/codex/codex_layout'
CodexLayer = require 'app/view/layers/codex/CodexLayer'

TutorialLessonsLayout = require 'app/ui/views2/tutorial/tutorial_lessons_layout'
QuestLogLayout = require 'app/ui/views2/quests/quest_log_layout'

BoosterPackUnlockLayout = require 'app/ui/views/layouts/booster_pack_collection'
BoosterPackOpeningLayer = require 'app/view/layers/booster/BoosterPackOpeningLayer'

VictoryLayer = require 'app/view/layers/postgame/VictoryLayer'
UnlockFactionLayer = require 'app/view/layers/reward/UnlockFactionLayer.js'
ProgressionRewardLayer = require 'app/view/layers/reward/ProgressionRewardLayer.js'
CosmeticKeyRewardLayer = require 'app/view/layers/reward/CosmeticKeyRewardLayer.js'
LadderProgressLayer = require 'app/view/layers/postgame/LadderProgressLayer'
RiftProgressLayer = require 'app/view/layers/postgame/RiftProgressLayer'
CurrencyRewardLayer = require 'app/view/layers/reward/CurrencyRewardLayer.js'
GauntletTicketRewardLayer = require 'app/view/layers/reward/GauntletTicketRewardLayer.js'
BoosterRewardLayer = require 'app/view/layers/reward/BoosterRewardLayer.js'
LootCrateRewardLayer = require 'app/view/layers/reward/LootCrateRewardLayer.js'
FreeCardOfTheDayLayer = require 'app/view/layers/reward/FreeCardOfTheDayLayer.js'

CrateOpeningLayer = require 'app/view/layers/crate/CrateOpeningLayer'
EndOfSeasonLayer = require 'app/view/layers/season/EndOfSeasonLayer'

ResumeGameItemView = require 'app/ui/views/item/resume_game'
FindingGameItemView = require 'app/ui/views/item/finding_game'
ReconnectToGameItemView = require 'app/ui/views/item/reconnect_to_game'

GameLayout = require 'app/ui/views/layouts/game'
TutorialLayout = require 'app/ui/views/layouts/tutorial'

VictoryItemView = require 'app/ui/views/item/victory'

MessagesCompositeView = require 'app/ui/views/composite/messages'

ConfirmDialogItemView = require 'app/ui/views/item/confirm_dialog'
PromptDialogItemView = require 'app/ui/views/item/prompt_dialog'
ActivityDialogItemView = require 'app/ui/views/item/activity_dialog'
ErrorDialogItemView = require 'app/ui/views/item/error_dialog'
AnnouncementModalView = require 'app/ui/views/item/announcement_modal'
ShopSpecialProductAvailableDialogItemView = require 'app/ui/views2/shop/shop_special_product_available_dialog'

ReplayEngine = require 'app/replay/replayEngine'

AnalyticsTracker = require 'app/common/analyticsTracker'

# require the Handlebars Template Helpers extension here since it modifies core Marionette code
require 'app/ui/extensions/handlebars_template_helpers'

localStorage.debug = 'session:*'

#
# --- Utility ---- #
#

App._screenBlurId = "AppScreenBlurId"
App._userNavLockId = "AppUserNavLockId"
App._queryStringParams = querystring.parse(location.search) # query string params

App.getIsLoggedIn = ->
  return Storage.get('token')

# region AI DEV ROUTES #

if process.env.AI_TOOLS_ENABLED

  ###
    Before using AI DEV ROUTES, make sure you have a terminal open and run `node server/ai/phase_ii_ai.js`.
  ###

  window.ai_v1_findNextActions = (playerId, difficulty) ->
    return new Promise (resolve, reject) ->
      request = $.ajax
        url: "http://localhost:5001/v1_find_next_actions",
        data: JSON.stringify({
          game_session_data: SDK.GameSession.getInstance().generateGameSessionSnapshot(),
          player_id: playerId,
          difficulty: difficulty
        }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'

      request.done (res)->
        actionsData = JSON.parse(res.actions)
        actions = []
        for actionData in actionsData
          action = SDK.GameSession.getInstance().deserializeActionFromFirebase(actionData)
          actions.push(action)
        console.log("v1_find_next_actions -> ", actions)
        resolve(actions)

      request.fail (jqXHR)->
        if (jqXHR.responseJSON && jqXHR.responseJSON.message)
          errorMessage = jqXHR.responseJSON.message
        else
          errorMessage = "Something went wrong."
        reject(errorMessage)
    .catch App._error

  window.ai_v2_findActionSequence = (playerId, depthLimit, msTimeLimit) ->
    return new Promise (resolve, reject) ->
      request = $.ajax
        url: "http://localhost:5001/v2_find_action_sequence",
        data: JSON.stringify({
          game_session_data: SDK.GameSession.getInstance().generateGameSessionSnapshot(),
          player_id: playerId,
          depth_limit: depthLimit,
          ms_time_limit: msTimeLimit
        }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'

      request.done (res)->
        sequenceActionsData = JSON.parse(res.sequence_actions)
        console.log("ai_v2_findActionSequence -> ", sequenceActionsData)
        resolve(sequenceActionsData)

      request.fail (jqXHR)->
        if (jqXHR.responseJSON && jqXHR.responseJSON.message)
          errorMessage = jqXHR.responseJSON.message
        else
          errorMessage = "Something went wrong."
        reject(errorMessage)
    .catch App._error

  window.ai_gameStarted = false
  window.ai_gameRunning = false
  window.ai_gameStepsData = null
  window.ai_gameStepsDataPromise = null
  window.ai_gamePromise = null
  window.ai_gameNeedsMulligan = false

  window.ai_stopAIvAIGame = () ->
    if window.ai_gameStarted
      window.ai_gameStarted = false
      window.ai_gameRunning = false
      window.ai_gameStepsData = null
      window.ai_gameNeedsMulligan = false

      if window.ai_gameStepsDataPromise?
        window.ai_gameStepsDataPromise.cancel()
        window.ai_gameStepsDataPromise = null

      if window.ai_gamePromise?
        window.ai_gamePromise.cancel()
        window.ai_gamePromise = null

    return new Promise (resolve, reject) ->
      request = $.ajax
        url: "http://localhost:5001/stop_game",
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'

      request.done (res)->
        resolve()

      request.fail (jqXHR)->
        if (jqXHR.responseJSON && jqXHR.responseJSON.message)
          errorMessage = jqXHR.responseJSON.message
        else
          errorMessage = "Something went wrong."
        reject(errorMessage)
    .catch App._error

  window.ai_pauseAIvAIGame = () ->
    if window.ai_gameRunning
      window.ai_gameRunning = false

  window.ai_resumeAIvAIGame = () ->
    if !window.ai_gameRunning
      window.ai_gameRunning = true
      window.ai_stepAIvAIGame()

  window.ai_runAIvAIGame = (ai1Version, ai2Version, ai1GeneralId, ai2GeneralId, depthLimit, msTimeLimit, ai1NumRandomCards, ai2NumRandomCards) ->
    # pick random general if none provided
    if !ai1GeneralId? then ai1GeneralId = _.sample(_.sample(SDK.FactionFactory.getAllPlayableFactions()).generalIds)
    if !ai2GeneralId? then ai2GeneralId = _.sample(_.sample(SDK.FactionFactory.getAllPlayableFactions()).generalIds)
    ai1FactionId = SDK.FactionFactory.factionIdForGeneralId(ai1GeneralId)
    ai2FactionId = SDK.FactionFactory.factionIdForGeneralId(ai2GeneralId)

    # stop running game
    window.ai_gamePromise = ai_stopAIvAIGame().then () ->
      Logger.module("APPLICATION").log("ai_runAIvAIGame - > requesting for v#{ai1Version} w/ general #{SDK.CardFactory.cardForIdentifier(ai1GeneralId, SDK.GameSession.getInstance()).getName()} vs v#{ai2Version} w/ general #{SDK.CardFactory.cardForIdentifier(ai2GeneralId, SDK.GameSession.getInstance()).getName()}")
      window.ai_gameStarted = true
      window.ai_gameRunning = true

      # request run simulation
      startSimulationPromise = new Promise (resolve, reject) ->
        request = $.ajax
          url: "http://localhost:5001/start_game",
          data: JSON.stringify({
            ai_1_version: ai1Version
            ai_1_general_id: ai1GeneralId
            ai_2_version: ai2Version
            ai_2_general_id: ai2GeneralId,
            depth_limit: depthLimit,
            ms_time_limit: msTimeLimit,
            ai_1_num_random_cards: ai1NumRandomCards,
            ai_2_num_random_cards: ai2NumRandomCards
          }),
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json'

        request.done (res)->
          resolve(JSON.parse(res.game_session_data))

        request.fail (jqXHR)->
          if (jqXHR.responseJSON && jqXHR.responseJSON.message)
            errorMessage = jqXHR.responseJSON.message
          else
            errorMessage = "Something went wrong."
          reject(errorMessage)

      # start loading
      loadingPromise = NavigationManager.getInstance().showDialogForLoad().then () ->
        return PackageManager.getInstance().loadGamePackageWithoutActivation([ai1FactionId, ai2FactionId])

      return Promise.all([
        startSimulationPromise,
        loadingPromise
      ])
    .spread (sessionData) ->
      Logger.module("APPLICATION").log("ai_runAIvAIGame - > starting #{sessionData.gameId} with data:", sessionData)
      # reset and deserialize
      SDK.GameSession.reset()
      SDK.GameSession.getInstance().deserializeSessionFromFirebase(sessionData)

      # switch session game type to sandbox
      SDK.GameSession.getInstance().setGameType(SDK.GameType.Sandbox)

      # set game user id to match player 1
      SDK.GameSession.getInstance().setUserId(SDK.GameSession.getInstance().getPlayer1Id())

      return App._startGame()
    .then () ->
      Logger.module("APPLICATION").log("ai_runAIvAIGame - > #{SDK.GameSession.getInstance().getGameId()} running")
      # stop running game when game is terminated
      Scene.getInstance().getGameLayer().getEventBus().on(EVENTS.terminate, window.ai_stopAIvAIGame)

      # listen for finished showing step
      # wait for active (ai will already have mulliganed)
      return Scene.getInstance().getGameLayer().whenStatus(GameLayer.STATUS.ACTIVE).then () ->
        Scene.getInstance().getGameLayer().getEventBus().on(EVENTS.after_show_step, window.ai_stepAIvAIGame)

        # execute first step in sequence
        window.ai_stepAIvAIGame()
    .cancellable()
    .catch Promise.CancellationError, (e)->
      Logger.module("APPLICATION").log("ai_runAIvAIGame -> promise chain cancelled")
    .catch App._error
    return ai_gamePromise

  window.ai_runAIvAIGameFromCurrentSession = (ai1Version, ai2Version, depthLimit, msTimeLimit) ->
    # stop running game
    window.ai_gamePromise = ai_stopAIvAIGame().then () ->
      Logger.module("APPLICATION").log("ai_runAIvAIGameFromCurrentSession - > requesting for v#{ai1Version} vs v#{ai2Version}")
      window.ai_gameStarted = true
      window.ai_gameRunning = true

      # set as non authoritative
      # all steps will be coming from ai simulation server
      SDK.GameSession.getInstance().setIsRunningAsAuthoritative(false)

      # request run simulation
      return new Promise (resolve, reject) ->
        request = $.ajax
          url: "http://localhost:5001/start_game_from_data",
          data: JSON.stringify({
            ai_1_version: ai1Version
            ai_2_version: ai2Version
            depth_limit: depthLimit,
            ms_time_limit: msTimeLimit,
            game_session_data: SDK.GameSession.getInstance().generateGameSessionSnapshot()
          }),
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json'

        request.done (res)->
          resolve()

        request.fail (jqXHR)->
          if (jqXHR.responseJSON && jqXHR.responseJSON.message)
            errorMessage = jqXHR.responseJSON.message
          else
            errorMessage = "Something went wrong."
          reject(errorMessage)
    .then () ->
      # stop running game when game is terminated
      Scene.getInstance().getGameLayer().getEventBus().on(EVENTS.terminate, window.ai_stopAIvAIGame)

      # listen for finished showing step
      Scene.getInstance().getGameLayer().whenStatus(GameLayer.STATUS.ACTIVE).then () ->
        Scene.getInstance().getGameLayer().getEventBus().on(EVENTS.after_show_step, window.ai_stepAIvAIGame)

        if window.ai_gameNeedsMulligan
          Logger.module("APPLICATION").log("ai_stepAIvAIGame -> mulligan complete")
          window.ai_gameNeedsMulligan = false
          window.ai_stepAIvAIGame()

      # check if needs mulligan
      window.ai_gameNeedsMulligan = SDK.GameSession.getInstance().isNew()

      # execute first step in sequence
      window.ai_stepAIvAIGame()
      .cancellable()
      .catch Promise.CancellationError, (e)->
        Logger.module("APPLICATION").log("ai_runAIvAIGameFromCurrentSession -> promise chain cancelled")
    .catch App._error

    return ai_gamePromise

  window.ai_stepAIvAIGame = (event) ->
    if event?.step?.action instanceof SDK.EndTurnAction then return # ignore auto stepping due to end turn action as start turn will cause auto step

    Logger.module("APPLICATION").log("ai_stepAIvAIGame -> #{SDK.GameSession.getInstance().getGameId()} step queue length #{Scene.getInstance().getGameLayer()._stepQueue.length}")
    if !window.ai_gameStepsDataPromise? and Scene.getInstance().getGameLayer()._stepQueue.length == 0
      # request step game
      window.ai_gameStepsDataPromise = new Promise (resolve, reject) ->
        request = $.ajax
          url: "http://localhost:5001/step_game",
          data: JSON.stringify({
            game_id: SDK.GameSession.getInstance().getGameId()
          }),
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json'

        request.done (res)->
          if res.steps?
            resolve(JSON.parse(res.steps))
          else
            resolve([])

        request.fail (jqXHR)->
          if (jqXHR.responseJSON && jqXHR.responseJSON.message)
            errorMessage = jqXHR.responseJSON.message
          else
            errorMessage = "Something went wrong."
          reject(errorMessage)
      .then (stepsData) ->
        Logger.module("APPLICATION").log("ai_stepAIvAIGame -> steps:", stepsData.slice(0))
        window.ai_gameStepsData = stepsData
      .cancellable()
      .catch Promise.CancellationError, (e)->
        Logger.module("APPLICATION").log("ai_stepAIvAIGame -> promise chain cancelled")

    return window.ai_gameStepsDataPromise.then () ->
      if window.ai_gameRunning and !SDK.GameSession.getInstance().isOver() and window.ai_gameStepsData? and window.ai_gameStepsData.length > 0
        # remove and deserialize next step in sequence
        stepData = window.ai_gameStepsData.shift()
        step = SDK.GameSession.getInstance().deserializeStepFromFirebase(stepData)
        Logger.module("APPLICATION").log("ai_stepAIvAIGame -> step:", step)

        # execute step
        SDK.GameSession.getInstance().executeAuthoritativeStep(step)

        # check game status and steps data
        if SDK.GameSession.getInstance().isOver() or window.ai_gameStepsData.length == 0
          Logger.module("APPLICATION").log("ai_stepAIvAIGame -> done")
          window.ai_gameStepsData = null
          window.ai_gameStepsDataPromise = null
        else if step.action instanceof SDK.EndTurnAction
          # auto step to start turn
          Logger.module("APPLICATION").log("ai_stepAIvAIGame -> continuing end turn")
          window.ai_stepAIvAIGame()
        else if window.ai_gameNeedsMulligan
          # auto step to next mulligan
          Logger.module("APPLICATION").log("ai_stepAIvAIGame -> continuing mulligan")
          window.ai_stepAIvAIGame()

  window.ai_runHeadlessAIvAIGames = (numGames, ai1Version, ai2Version, ai1GeneralId, ai2GeneralId, depthLimit, msTimeLimit, ai1NumRandomCards, ai2NumRandomCards) ->
    Logger.module("APPLICATION").log("ai_runHeadlessAIvAIGames - > requesting #{numGames} games with v#{ai1Version} vs v#{ai2Version}")

    # request run games
    return new Promise (resolve, reject) ->
      request = $.ajax
        url: "http://localhost:5001/run_headless_games",
        data: JSON.stringify({
          ai_1_version: ai1Version
          ai_1_general_id: ai1GeneralId
          ai_2_version: ai2Version
          ai_2_general_id: ai2GeneralId,
          num_games: numGames,
          depth_limit: depthLimit,
          ms_time_limit: msTimeLimit,
          ai_1_num_random_cards: ai1NumRandomCards,
          ai_2_num_random_cards: ai2NumRandomCards
        }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'

      request.done (res)->
        resolve()

      request.fail (jqXHR)->
        if (jqXHR.responseJSON && jqXHR.responseJSON.message)
          errorMessage = jqXHR.responseJSON.message
        else
          errorMessage = "Something went wrong."
        reject(errorMessage)

# endregion AI DEV ROUTES #

#
# --- Main ---- #
#

App.getIsShowingMain = () ->
  # temporary method to check if the user can navigate to main (i.e. not already there)
  # this does NOT work for switching between main sub-screens
  return NavigationManager.getInstance().getIsShowingContentViewClass(LoginMenuItemView) or NavigationManager.getInstance().getIsShowingContentViewClass(MainMenuItemView) or NavigationManager.getInstance().getIsShowingContentViewClass(ResumeGameItemView)

App.main = ->
  if !App._mainPromise?
    App._mainPromise = App._startPromise.then(() ->
      Logger.module("APPLICATION").log("App:main")
      # get and reset last game data
      lastGameType = CONFIG.lastGameType
      wasSpectate = CONFIG.lastGameWasSpectate
      wasTutorial = CONFIG.lastGameWasTutorial
      wasDeveloper = CONFIG.lastGameWasDeveloper
      wasDailyChallenge = CONFIG.lastGameWasDailyChallenge
      CONFIG.resetLastGameData()

      # destroy game and clear game data
      App.cleanupGame()

      # always make sure we're disconnected from the last game
      SDK.NetworkManager.getInstance().disconnect()

      # reset routes to main
      NavigationManager.getInstance().resetRoutes()
      NavigationManager.getInstance().addMajorRoute("main", App.main, App)

      # always restore user triggered navigation
      NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(App._userNavLockId)

      if App._queryStringParams["replayId"]?
        Logger.module("APPLICATION").log("jumping straight into replay...")
        App.setCallbackWhenCancel(()-> alert('all done!'))
        return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
          EventBus.getInstance().trigger(EVENTS.start_replay, {
            replayId: App._queryStringParams["replayId"]
          })
          return Promise.resolve()
        )
      else
        if !App.getIsLoggedIn()
          return App._showLoginMenu()
        else
          # all good, show main menu
          return App.managersReadyDeferred.promise.then(() ->
            # set user as loading
            ChatManager.getInstance().setStatus(ChatManager.STATUS_LOADING)

            # # EULA ACCEPTANCE CHECK HERE SO IT FIRES FOR ALREADY LOGGED IN PLAYERS

            # # strings used for session storage and profile storage
            # sessionAcceptedEula = Storage.namespace() + '.hasAcceptedEula'
            # storageAcceptedEula = 'hasAcceptedEula'
            # storageSentAcceptedEulaNotify = 'hasSentAcceptedEulaNotify'

            # # the user has accepted terms in the local session, ensure we are set in profile storage
            # if window.sessionStorage.getItem(sessionAcceptedEula)
            #   ProfileManager.getInstance().set(storageAcceptedEula, true)

            # # check in profile storage if the user has accepted terms
            # if !ProfileManager.getInstance().get(storageAcceptedEula)
            #   # TODO - This is not actually good, but we need to make a new terms and conditions page
            #   return App._showTerms()
            # # user has accepted, check if they have sent notification
            # else
            #   if !ProfileManager.getInstance().get(storageSentAcceptedEulaNotify)
            #     ProfileManager.getInstance().set(storageSentAcceptedEulaNotify, true)

            # check for an active game
            lastGameModel = null
            if GamesManager.getInstance().playerGames.length > 0
              lastGameModel = GamesManager.getInstance().playerGames.first()

            # calculate minutes since last game
            msSinceLastGame = moment().utc().valueOf() - (lastGameModel?.get("created_at") || 0)
            minutesSinceLastGame = moment.duration(msSinceLastGame).asMinutes()

            # if the last game is an active multiplayer game within last 45 minutes, show the continue game screen
            if lastGameModel? and lastGameModel.get("cancel_reconnect") != true and (lastGameModel.get("status") == "active" || lastGameModel.get("status") == "new") and lastGameModel.get("created_at") and minutesSinceLastGame < CONFIG.MINUTES_ALLOWED_TO_CONTINUE_GAME and SDK.GameType.isMultiplayerGameType(lastGameModel.get("game_type"))
              # has active game, prompt user to resume
              Logger.module("UI").log("Last active game was on ", new Date(lastGameModel.get("created_at")), "with data", lastGameModel)
              return App._resumeGame(lastGameModel)
            else if not NewPlayerManager.getInstance().isDoneWithTutorial()
              # show tutorial layout
              return App._showTutorialLessons()
            else if QuestsManager.getInstance().hasUnreadQuests()
              # show main menu
              return App._showMainMenu()
            else
              # try to return to selection for previous game type
              if wasSpectate
                return App._showMainMenu()
              else if wasDailyChallenge
                QuestsManager.getInstance().markDailyChallengeCompletionAsUnread()
                return App._showMainMenu()
              else if lastGameType == SDK.GameType.Ranked and !NewPlayerManager.getInstance().getEmphasizeBoosterUnlock()
                return App.showPlay(SDK.PlayModes.Ranked, true)
              else if lastGameType == SDK.GameType.Casual and !NewPlayerManager.getInstance().getEmphasizeBoosterUnlock()
                return App.showPlay(SDK.PlayModes.Casual, true)
              else if lastGameType == SDK.GameType.Gauntlet
                return App.showPlay(SDK.PlayModes.Gauntlet, true)
              else if lastGameType == SDK.GameType.Challenge and !wasTutorial
                return App.showPlay(SDK.PlayModes.Challenges, true)
              else if lastGameType == SDK.GameType.SinglePlayer
                return App.showPlay(SDK.PlayModes.Practice, true)
              else if lastGameType == SDK.GameType.BossBattle
                return App.showPlay(SDK.PlayModes.BossBattle, true)
              else if lastGameType == SDK.GameType.Sandbox and !wasDeveloper
                return App.showPlay(SDK.PlayModes.Sandbox, true)
              else if lastGameType == SDK.GameType.Rift
                return App.showPlay(SDK.PlayModes.Rift, true)
              else
                return App._showMainMenu()
          )
    ).finally () ->
      App._mainPromise = null
      return Promise.resolve()
  return App._mainPromise

App._showLoginMenu = (options) ->
  Logger.module("APPLICATION").log("App:_showLoginMenu")
  return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null,
    (() ->
      # analytics call
      Analytics.page("Login",{ path: "/#login" })

      # show main scene
      viewPromise = Scene.getInstance().showMain()

      # show login menu
      contentPromise = NavigationManager.getInstance().showContentView(new LoginMenuItemView(options))

      # show utility menu for desktop only
      if window.isDesktop
        utilityPromise = NavigationManager.getInstance().showUtilityView(new UtilityLoadingLoginMenuItemView())
      else
        utilityPromise = Promise.resolve()

      return Promise.all([
        viewPromise,
        contentPromise,
        utilityPromise
      ])
    )
  )

App._showSelectUsername = (data) ->
  Logger.module("APPLICATION").log("App:_showSelectUsername")
  return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null,
    (() ->
      # show main scene
      viewPromise = Scene.getInstance().showMain()

      # show selection dialog
      selectUsernameModel = new Backbone.Model({})
      selectUsernameItemView = new SelectUsernameItemView({model: selectUsernameModel})
      selectUsernameItemView.listenToOnce(selectUsernameItemView, "success", () =>
        # TODO: move this into SelectUsernameItemView
        # We refresh token so the username property is now included
        Session.refreshToken()
        .then (refreshed) ->
          return
      )

      contentPromise = NavigationManager.getInstance().showDialogView(selectUsernameItemView)

      return Promise.all([
        NavigationManager.getInstance().destroyModalView(),
        NavigationManager.getInstance().destroyContentView(),
        viewPromise,
        contentPromise
      ])
    )
  )

App._showTerms = (options = {}) ->
  Logger.module("APPLICATION").log("App:_showTerms")
  return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null,
    (() ->
      # show main scene
      viewPromise = Scene.getInstance().showMain()

      if App.getIsLoggedIn()
        ProfileManager.getInstance().set('hasAcceptedEula', true)
        mainPromise = App.main()
      else
        window.sessionStorage.setItem(Storage.namespace() + '.hasAcceptedEula', true)
        mainPromise = App._showLoginMenu({type: 'register'})

      return Promise.all([
        viewPromise,
        # contentPromise
        mainPromise
      ])
    )
  )

App._showTutorialLessons = (lastCompletedChallenge) ->
  Logger.module("APPLICATION").log("App:_showTutorialChallenges")

  return PackageManager.getInstance().loadAndActivateMajorPackage "nongame", null, null, () ->
    # analytics call
    Analytics.page("Tutorial Lessons",{ path: "/#tutorial_lessons" })

    # set status as online
    ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

    # show main scene
    viewPromise = Scene.getInstance().showMain().then(() ->
      # play main layer music
      mainLayer = Scene.getInstance().getMainLayer()
      if mainLayer? then mainLayer.playMusic()
    )

    # show main menu
    tutorialLessonsLayoutView = new TutorialLessonsLayout({
      lastCompletedChallenge:lastCompletedChallenge,
    })
    contentPromise = NavigationManager.getInstance().showContentView(tutorialLessonsLayoutView)

    return Promise.all([
      viewPromise,
      contentPromise
    ])

App._showMainMenu = () ->
  Logger.module("APPLICATION").log("App:_showMainMenu")

  return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
    # analytics call
    Analytics.page("Main Menu",{ path: "/#main_menu" })

    # notify Discord status
    if Discord
      presence = {
        instance: 0
        details: 'In Main Menu'
        largeImageKey: 'idle'
      }
      Discord.updatePresence(presence)

    # show main scene
    viewPromise = Scene.getInstance().showMain().then(() ->
      # play main layer music
      mainLayer = Scene.getInstance().getMainLayer()
      if mainLayer? then mainLayer.playMusic()
    )

    endOfSeasonRewardsPromise = App.showEndOfSeasonRewards()

    return endOfSeasonRewardsPromise.then( () ->

      # show achievement rewards
      achievementsPromise = App.showAchievementCompletions()

      return achievementsPromise
      .then(()->
        # show twitch rewards
        twitchRewardPromise = App.showTwitchRewards()
        return twitchRewardPromise
      ).then(() ->
        # set status as online
        ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

        # show main menu
        contentPromise = NavigationManager.getInstance().showContentView(new MainMenuItemView({model: ProfileManager.getInstance().profile}))

        # show utility menu
        utilityPromise = NavigationManager.getInstance().showUtilityView(new UtilityMainMenuItemView({model: ProfileManager.getInstance().profile}))

        if NewsManager.getInstance().getFirstUnreadAnnouncement()
          # show announcment UI if we have an unread announcement
          modalPromise = NewsManager.getInstance().getFirstUnreadAnnouncementContentAsync().then((announcementContentModel)->
            return NavigationManager.getInstance().showModalView(new AnnouncementModalView({model:announcementContentModel}))
          )
        else
          # show quests if any quests
          modalPromise = Promise.resolve()
          if QuestsManager.getInstance().hasUnreadQuests() or QuestsManager.getInstance().hasUnreadDailyChallenges()
            modalPromise = NavigationManager.getInstance().toggleModalViewByClass(QuestLogLayout,{
              collection: QuestsManager.getInstance().getQuestCollection(),
              model: ProgressionManager.getInstance().gameCounterModel
              showConfirm:true
            })

        return Promise.all([
          viewPromise,
          contentPromise,
          modalPromise,
          utilityPromise
        ])
      )
    )
  )


#
# --- Major Layouts ---- #
#

App.showPlay = (playModeIdentifier, showingDirectlyFromGame) ->
  if !App.getIsLoggedIn()
    return Promise.reject()
  else
    return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
      # force play mode to string
      if !_.isString(playModeIdentifier) then playModeIdentifier = ""

      # add mode to route
      NavigationManager.getInstance().addMajorRoute("play_" + playModeIdentifier, App.showPlay, App, [playModeIdentifier])

      # if currently in play modes, show new play mode direct
      currentContentView = NavigationManager.getInstance().getContentView()
      if currentContentView instanceof PlayLayout
        return currentContentView.showPlayMode(playModeIdentifier)
      else
        if showingDirectlyFromGame
          # show play layer
          viewPromise = Scene.getInstance().showContentByClass(PlayLayer, true)

          # show achievement rewards
          achievementsPromise = App.showAchievementCompletions()
        else
          achievementsPromise = viewPromise = Promise.resolve()

        return achievementsPromise.then(() ->
          # set status as online
          ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

          # show UI
          return Promise.all([
            viewPromise,
            NavigationManager.getInstance().showContentView(new PlayLayout({model: new Backbone.Model({playModeIdentifier: playModeIdentifier})}))
          ]).then ()->
            # update available shop specials with current top rank and win count model and notify user if a new one has become available
            if ShopManager.getInstance().isNewSpecialAvailable
              ShopManager.getInstance().markNewAvailableSpecialAsRead()
              NavigationManager.getInstance().showDialogView(new ShopSpecialProductAvailableDialogItemView({
                model: ShopManager.getInstance().availableSpecials.at(ShopManager.getInstance().availableSpecials.length-1)
              }))
        )
    )

App.showWatch = ()->
  if !App.getIsLoggedIn() or NavigationManager.getInstance().getContentView() instanceof WatchLayout
    return Promise.reject()
  else
    return PackageManager.getInstance().loadAndActivateMajorPackage "nongame", null, null, () ->
      Analytics.page("Watch",{ path: "/#watch" })

      # set status as online
      ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

      # add mode to route
      NavigationManager.getInstance().addMajorRoute("watch", App.showWatch, App)

      # show layout
      return NavigationManager.getInstance().showContentView(new WatchLayout())

App.showShop = ()->
  if !App.getIsLoggedIn()
    return Promise.reject()
  else
    return PackageManager.getInstance().loadAndActivateMajorPackage "nongame", null, null, () ->
      Analytics.page("Shop",{ path: "/#shop" })
      # add mode to route
      NavigationManager.getInstance().addMajorRoute("shop", App.showShop, App)
      # show layout
      NavigationManager.getInstance().showContentView(new ShopLayout())

App.showCollection = () ->
  if !App.getIsLoggedIn() or NavigationManager.getInstance().getContentView() instanceof CollectionLayout
    return Promise.reject()
  else
    return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
      # set status as online
      ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

      # add mode to route
      NavigationManager.getInstance().addMajorRoute("collection", App.showCollection, App)

      # notify Discord status
      if Discord
        presence = {
          instance: 0
          details: 'Browsing Collection'
          largeImageKey: 'idle'
        }
        Discord.updatePresence(presence)

      # show UI
      return Promise.all([
        Scene.getInstance().showMain()
        NavigationManager.getInstance().showContentView(new CollectionLayout({model: new Backbone.Model()}))
      ])
    )

App.showCodex = () ->
  if !App.getIsLoggedIn() or NavigationManager.getInstance().getContentView() instanceof CodexLayout
    return Promise.reject()
  else
    return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
      # set status as online
      ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

      # add mode to route
      NavigationManager.getInstance().addMajorRoute("codex", App.showCodex, App)

      # show UI
      return Promise.all([
        Scene.getInstance().showContent(new CodexLayer(), true),
        NavigationManager.getInstance().showContentView(new CodexLayout({model: new Backbone.Model()}))
      ])
    )

App.showBoosterPackUnlock = () ->
  if !App.getIsLoggedIn() or NavigationManager.getInstance().getContentView() instanceof BoosterPackUnlockLayout
    return Promise.reject()
  else
    return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
      # set status as online
      ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

      # add route
      NavigationManager.getInstance().addMajorRoute("booster_pack_unlock", App.showBoosterPackUnlock, App)

      # show UI
      return Promise.all([
        Scene.getInstance().showContent(new BoosterPackOpeningLayer(), true),
        NavigationManager.getInstance().showContentView(new BoosterPackUnlockLayout())
      ])
    )

App.showCrateInventory = () ->
  if !App.getIsLoggedIn() or Scene.getInstance().getOverlay() instanceof CrateOpeningLayer
    return Promise.reject()
  else
    return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
      # set status as online
      ChatManager.getInstance().setStatus(ChatManager.STATUS_ONLINE)

      # add route
      NavigationManager.getInstance().addMajorRoute("crate_inventory", App.showCrateInventory, App)

      # show UI
      return Promise.all([
        NavigationManager.getInstance().destroyContentView(),
        Scene.getInstance().showOverlay(new CrateOpeningLayer())
      ])
    )

#
# --- Session Events ---- #
#

App.onLogin = (data) ->
  Logger.module("APPLICATION").log "User logged in: #{data.userId}"

  # save token to localStorage
  Storage.set('token', data.token)

  # setup ajax headers for jquery/backbone requests
  $.ajaxSetup
    headers: {
      Authorization: "Bearer #{data.token}"
      "Client-Version": window.BUILD_VERSION
    }

  # check is new signup flag is passed
  # can't use analytics data since the first login may have
  # already happened on /register page
  if Landing.isNewSignup()
    Landing.addPixelsToHead()
    Landing.firePixels()

  # check for null username here
  # dialog should be uncancelleable
  # dialog success should re-trigger session login so new token contains all required params
  if !Session.username
    return App._showSelectUsername(data)

  # Trigger the eventbus login event for the utilty menus
  EventBus.getInstance().trigger EVENTS.session_logged_in

  # connect all managers
  ProfileManager.getInstance().connect({userId: data.userId})
  GameDataManager.getInstance().connect()
  GamesManager.getInstance().connect()
  ChatManager.getInstance().connect()
  QuestsManager.getInstance().connect()
  InventoryManager.getInstance().connect()
  NavigationManager.getInstance().connect()
  NotificationsManager.getInstance().connect()
  ProgressionManager.getInstance().connect()
  ServerStatusManager.getInstance().connect()
  TelemetryManager.getInstance().connect()
  NewsManager.getInstance().connect()
  NewPlayerManager.getInstance().connect()
  AchievementsManager.getInstance().connect()
  TwitchManager.getInstance().connect()
  CrateManager.getInstance().connect()
  ShopManager.getInstance().connect()
  StreamManager.getInstance().connect()

  TelemetryManager.getInstance().clearSignal("session","not-logged-in")
  TelemetryManager.getInstance().setSignal("session","logged-in")

  Promise.all([
    ProfileManager.getInstance().onReady(),
    InventoryManager.getInstance().onReady(),
    QuestsManager.getInstance().onReady(),
    GamesManager.getInstance().onReady(),
    GameDataManager.getInstance().onReady(),
    ChatManager.getInstance().onReady(),
    ProgressionManager.getInstance().onReady(),
    ServerStatusManager.getInstance().onReady(),
    NewPlayerManager.getInstance().onReady(),
    AchievementsManager.getInstance().onReady(),
    TwitchManager.getInstance().onReady(),
    CrateManager.getInstance().onReady()
  ]).then () ->
    # update resolution values as of login
    App._updateLastResolutionValues()

    # we're all done loading managers
    App.managersReadyDeferred.resolve()

    # setup analytics
    App.onLoginAnalyticsSetup(data)
    # show the main screen
    return App.main()

  .catch (err) ->
    App.managersReadyDeferred.reject()
    Logger.module("APPLICATION").log("ERROR initializing managers")
    if err == null then err = new Error("ERROR initializing managers")
    App._error(err.message)
    throw err
  .finally () ->
    # NavigationManager.getInstance().destroyDialogView()

App.onLoginAnalyticsSetup = (loginData) ->
  # region analytics data
  # Include users analytics data retrieved with session
  identifyParams = {}
  utmParams = {}
  hadPreviousSession = false
  if loginData.analyticsData?
    utmParams = _.extend(utmParams, loginData.analyticsData)
    if (utmParams.first_purchased_at?)
      # Shouldn't be necessary but just in case
      utmParams.first_purchased_at = moment.utc(utmParams.first_purchased_at).toISOString()
    if loginData.analyticsData.last_session_at
      delete utmParams.last_session_at
      hadPreviousSession = true

  # identify the user with the partial data until we connect managers
  Analytics.identify(loginData.userId, identifyParams, utmParams)


  if not hadPreviousSession
    Analytics.track("first login",{
      category:Analytics.EventCategory.FTUE,
    },{
      nonInteraction:1
      sendUTMData:true
    })
    Analytics.track("registered", {
      category:Analytics.EventCategory.Marketing
    },{
      sendUTMData:true
      nonInteraction:1
    })

  # endregion analytics data

  # region analytics data
  # identify the user with their current rank
  gamesManager = GamesManager.getInstance()
  rank = gamesManager.rankingModel.get("rank")
  # default rank to 30 if it's null
  rank = 30 if (!rank?)
  # top rank
  topRank = gamesManager.topRankingModel.get("top_rank")
  topRank = gamesManager.topRankingModel.get("rank") if(!topRank?)
  topRank = 30 if(!topRank?)
  # game count
  gameCount = ProgressionManager.getInstance().getGameCount()

  # set up the params to pass for the identify call
  identifyParams.rank = rank
  identifyParams.top_ever_rank = topRank
  identifyParams.game_count = gameCount
  # if we know the registration date
  if ProfileManager.getInstance().get("created_at")
    # turn it to a sortable
    registered_at = moment.utc(ProfileManager.getInstance().get("created_at")).toISOString()
    # set it on the identifyParams
    identifyParams.registration_date = registered_at

  # if this user has an LTV parameter
  if ProfileManager.getInstance().get("ltv")
    # set it on the identifyParams
    identifyParams.ltv = ProfileManager.getInstance().get("ltv")

  # Check if today is a recorded seen on day and add it to identifyParams
  todaysSeenOnIndex = AnalyticsUtil.recordedDayIndexForRegistrationAndSeenOn(moment.utc(ProfileManager.getInstance().get("created_at")),moment.utc())
  if todaysSeenOnIndex?
    identifyParams[AnalyticsUtil.nameForSeenOnDay(todaysSeenOnIndex)] = 1

  # re-identify the user with better data now that we have managers connected and pass in the custom dimensions
  Analytics.identify(ProfileManager.getInstance().get('id'), identifyParams, utmParams)

  Analytics.track("login", {
    category:Analytics.EventCategory.Marketing
  },{
    sendUTMData:true
    nonInteraction:1
  })
  # endregion analytics data

App.onLogout = () ->
  Logger.module("APPLICATION").log "User logged out."

  TelemetryManager.getInstance().clearSignal("session","logged-in")
  TelemetryManager.getInstance().setSignal("session","not-logged-in")

  # create a new deferred object for managers loading process
  App.managersReadyDeferred = new Promise.defer()

  # destroy out any login specific menus
  NavigationManager.getInstance().destroyNonContentViews()

  # stop playing any music
  audio_engine.current().stop_music()

  Analytics.reset()

  # reset config
  CONFIG.reset()

  # remove token
  Storage.remove('token')

  # remove ajax headers with new call to ajaxSetup
  $.ajaxSetup
    headers: {
      Authorization: ""
    }

  # Trigger the eventbus logout event for the ui/managers
  EventBus.getInstance().trigger EVENTS.session_logged_out

  # go back to main to show login menu
  App.main()

# just logs the error for debugging
App.onSessionError = (error) ->
  Logger.module("APPLICATION").log "Session Error: #{error.message}"

#
# ---- Pointer ---- #
#
App._$canvasMouseClassEl = null
App._currentMouseClass = null

App.onCanvasMouseState = (e) ->
  if e?.state? then mouseClass = "mouse-" + e.state.toLowerCase() else mouseClass = "mouse-auto"
  if App._currentMouseClass != mouseClass
    App._$canvasMouseClassEl ?= $(CONFIG.GAMECANVAS_SELECTOR)
    if App._currentMouseClass == "mouse-auto"
      App._$canvasMouseClassEl.addClass(mouseClass)
    else if mouseClass == "mouse-auto"
      App._$canvasMouseClassEl.removeClass(App._currentMouseClass)
    else
      App._$canvasMouseClassEl.removeClass(App._currentMouseClass).addClass(mouseClass)
    App._currentMouseClass = mouseClass

App.onPointerDown = (event) ->
  # update pointer
  if event?
    $app = $(CONFIG.APP_SELECTOR)
    offset = $app.offset()
    UtilsPointer.setPointerFromDownEvent(event, $app.height(), offset.left, offset.top)

  # trigger pointer event
  pointerEvent = UtilsPointer.getPointerEvent()
  pointerEvent.type = EVENTS.pointer_down
  pointerEvent.target = event.target
  EventBus.getInstance().trigger(pointerEvent.type, pointerEvent)
  # before passing event to view, stop propagation when the target of the pointer event is not the game canvas
  # however, continue pass the event down to the view and let listeners decide whether to use it
  if !$(CONFIG.GAMECANVAS_SELECTOR).is(event.target)
    pointerEvent.stopPropagation()
  Scene.getInstance().getEventBus().trigger(pointerEvent.type, pointerEvent)

  return true

App.onPointerUp = (event) ->
  # update pointer
  if event?
    $app = $(CONFIG.APP_SELECTOR)
    offset = $app.offset()
    UtilsPointer.setPointerFromUpEvent(event, $app.height(), offset.left, offset.top)

  # trigger pointer event
  pointerEvent = UtilsPointer.getPointerEvent()
  pointerEvent.type = EVENTS.pointer_up
  pointerEvent.target = event.target
  EventBus.getInstance().trigger(pointerEvent.type, pointerEvent)
  # before passing event to view, stop propagation when the target of the pointer event is not the game canvas
  # however, continue pass the event down to the view and let listeners decide whether to use it
  if !$(CONFIG.GAMECANVAS_SELECTOR).is(event.target)
    pointerEvent.stopPropagation()
  Scene.getInstance().getEventBus().trigger(pointerEvent.type, pointerEvent)

  return true

App.onPointerMove = (event) ->
  # update pointer
  if event?
    $app = $(CONFIG.APP_SELECTOR)
    offset = $app.offset()
    UtilsPointer.setPointerFromMoveEvent(event, $app.height(), offset.left, offset.top)

  # trigger pointer events
  pointerEvent = UtilsPointer.getPointerEvent()
  pointerEvent.type = EVENTS.pointer_move
  pointerEvent.target = event.target
  EventBus.getInstance().trigger(pointerEvent.type, pointerEvent)
  # before passing event to view, stop propagation when the target of the pointer event is not the game canvas
  # however, continue pass the event down to the view and let listeners decide whether to use it
  if !$(CONFIG.GAMECANVAS_SELECTOR).is(event.target)
    pointerEvent.stopPropagation()
  Scene.getInstance().getEventBus().trigger(pointerEvent.type, pointerEvent)

  return true

App.onPointerWheel = (event) ->
  # update pointer
  if event?
    target = event.target
    $app = $(CONFIG.APP_SELECTOR)
    offset = $app.offset()
    UtilsPointer.setPointerFromWheelEvent(event.originalEvent, $app.height(), offset.left, offset.top)

  # trigger pointer events
  pointerEvent = UtilsPointer.getPointerEvent()
  pointerEvent.type = EVENTS.pointer_wheel
  pointerEvent.target = target
  EventBus.getInstance().trigger(pointerEvent.type, pointerEvent)
  # before passing event to view, stop propagation when the target of the pointer event is not the game canvas
  # however, continue pass the event down to the view and let listeners decide whether to use it
  if !$(CONFIG.GAMECANVAS_SELECTOR).is(target)
    pointerEvent.stopPropagation()
  Scene.getInstance().getEventBus().trigger(pointerEvent.type, pointerEvent)

  return true

#
# --- Game Invites ---- #
#

App._inviteAccepted = ()->
  Logger.module("APPLICATION").log("App._inviteAccepted")
  App.showPlay(SDK.PlayModes.Friend)

App._inviteRejected = () ->
  Logger.module("APPLICATION").log("App._inviteRejected")
  return App.main().then(() ->
    return NavigationManager.getInstance().showDialogView(new PromptDialogItemView({title: i18next.t("buddy_list.message_rejected_game_invite")}))
  )

App._inviteCancelled = () ->
  App._cleanupMatchmakingListeners()
  Logger.module("APPLICATION").log("App._inviteCancelled")
  return App.main().then(() ->
    return NavigationManager.getInstance().showDialogView(new PromptDialogItemView({title: i18next.t("buddy_list.message_cancelled_game_invite")}))
  )

#
# --- Game Spectate ---- #
#
App._spectateGame = (e) ->
  if ChatManager.getInstance().getStatusIsInBattle()
    Logger.module("APPLICATION").log("App._spectateGame -> cannot start game when already in a game!")
    return

  gameListingData = e.gameData
  playerId = e.playerId
  spectateToken = e.token

  Logger.module("APPLICATION").log("App._spectateGame", gameListingData)
  NavigationManager.getInstance().showDialogForLoad()
  .then ()->
    # load resources for game
    return PackageManager.getInstance().loadGamePackageWithoutActivation([
      gameListingData["faction_id"],
      gameListingData["opponent_faction_id"]
    ])
  .then () ->
    # listen to join game events
    joinGamePromise = App._subscribeToJoinGameEventsPromise()

    # join game and if a game server is assigned to this listing, connect there
    SDK.NetworkManager.getInstance().connect(
      gameListingData["game_type"],
      gameListingData["game_id"],
      playerId,
      gameListingData["game_server"],
      ProfileManager.getInstance().get('id'),
      spectateToken,
    )

    return joinGamePromise.then((gameSessionData) ->

      # reset and deserialize
      SDK.GameSession.reset()
      SDK.GameSession.getInstance().deserializeSessionFromFirebase(gameSessionData)
      SDK.GameSession.getInstance().setUserId(playerId)
      SDK.GameSession.getInstance().setIsSpectateMode(true)

      # do not start games that are already over
      if !SDK.GameSession.getInstance().isOver()
        return App._startGame()
      else
        return Promise.reject()

    ).catch((errorMessage) ->
      return App._error(errorMessage)
    )

# See games_manager spectateBuddyGame method, works same way
App.spectateBuddyGame = (buddyId) ->
  return new Promise (resolve, reject) ->
    request = $.ajax({
      url: process.env.API_URL + '/api/me/spectate/' + buddyId,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    })

    request.done (response) ->
      App._spectateGame({
        gameData: response.gameData,
        token: response.token,
        playerId: buddyId
      })
      resolve(response)

    request.fail (response) ->
      error = response && response.responseJSON && response.responseJSON.error || 'SPECTATE request failed'
      EventBus.getInstance().trigger(EVENTS.ajax_error, error)
      reject(new Error(error))

# Event handler fired when spectate is pressed in Discord with spectateSecret passed in
# We use the buddyId as the spectateSecret
App.onDiscordSpectate = (args...) ->
  buddyId = args[0]
  Logger.module("DISCORD").log("attempting to spectate #{buddyId}")

  # we wait until managers are loaded as we need to be logged in
  return App.managersReadyDeferred.promise.then () ->
    # do nothing if they are already in game or in queue
    if ChatManager.getInstance().getStatusIsInBattle() || ChatManager.getInstance().getStatusQueue()
      Logger.module("DISCORD").log("cannot spectate game when already in a game!")
      return

    # do nothing if they are attempting to spectate theirselves
    if ProfileManager.getInstance().get('id') == buddyId
      Logger.module("DISCORD").log("cannot spectate yourself!")
      return

    # fire spectate request
    return App.main().then () ->
      App.spectateBuddyGame(buddyId)

#
# --- Game Matchmaking ---- #
#

App._error = (errorMessage) ->
  Logger.module("APPLICATION").log("App._error", errorMessage)
  # always unlock user triggered navigation
  NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(App._userNavLockId)

  if errorMessage?
    # if we're in the process of loading the main menu
    # show the error dialog and don't go to main menu
    # to avoid infinite loop of loading main menu
    if App._mainPromise or process.env.NODE_ENV == "local"
      return NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({message:errorMessage}))
    else
      # otherwise load the main menu and show the error dialog
      return App.main().then () ->
        return NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({message:errorMessage}))
  else
    return App.main()

App._cleanupMatchmakingListeners = ()->
  # remove all found game listeners as new ones will be registered when we re-enter matchmaking
  GamesManager.getInstance().off("found_game")
  # force reject the existing found game promise when we cancel
  # this is important because this promise is wrapped around the "found_game" event and a chain of stuff is waiting for it to resolve!
  # if we don't cancel here, we will have a promise that never resolves and thus leaks memory
  if App._foundGamePromise?
    App._foundGamePromise.cancel()

App._matchmakingStart = () ->
  Logger.module("APPLICATION").log("App._matchmakingStart")

App._matchmakingCancel = () ->
  Logger.module("APPLICATION").log("App._matchmakingCancel")
  App._cleanupMatchmakingListeners()

App._matchmakingError = (errorMessage) ->
  Logger.module("APPLICATION").log("App._matchmakingError", errorMessage)
  App._cleanupMatchmakingListeners()
  return App._error(errorMessage)

App._playerDataFromGameListingData = (gameListingData) ->
  myPlayerIsPlayer1 = gameListingData.is_player_1
  playerDataModel= new Backbone.Model({
    myPlayerIsPlayer1: myPlayerIsPlayer1
    myPlayerId: ProfileManager.getInstance().get('id')
    myPlayerUsername: ProfileManager.getInstance().get("username")
    myPlayerFactionId: gameListingData.faction_id
    myPlayerGeneralId: gameListingData.general_id
    opponentPlayerId: gameListingData.opponent_id
    opponentPlayerUsername: gameListingData.opponent_username
    opponentPlayerFactionId: gameListingData.opponent_faction_id
    opponentPlayerGeneralId: gameListingData.opponent_general_id
  })
  if myPlayerIsPlayer1
    playerDataModel.set({
      player1Id: playerDataModel.get("myPlayerId"),
      player1Username: playerDataModel.get("myPlayerUsername"),
      player1FactionId: playerDataModel.get("myPlayerFactionId"),
      player1GeneralId: playerDataModel.get("myPlayerGeneralId"),
      player2Id: playerDataModel.get("opponentPlayerId"),
      player2Username: playerDataModel.get("opponentPlayerUsername"),
      player2FactionId: playerDataModel.get("opponentPlayerFactionId"),
      player2GeneralId: playerDataModel.get("opponentPlayerGeneralId")
    })
  else
    playerDataModel.set({
      player1Id: playerDataModel.get("opponentPlayerId"),
      player1Username: playerDataModel.get("opponentPlayerUsername"),
      player1FactionId: playerDataModel.get("opponentPlayerFactionId"),
      player1GeneralId: playerDataModel.get("opponentPlayerGeneralId"),
      player2Id: playerDataModel.get("myPlayerId"),
      player2Username: playerDataModel.get("myPlayerUsername"),
      player2FactionId: playerDataModel.get("myPlayerFactionId"),
      player2GeneralId: playerDataModel.get("myPlayerGeneralId")
    })

  return playerDataModel

App._findingGame = (gameMatchRequestData) ->
  if ChatManager.getInstance().getStatusIsInBattle()
    Logger.module("APPLICATION").log("App._findingGame -> cannot start game when already in a game!")
    return

  Logger.module("APPLICATION").log("App._findingGame", gameMatchRequestData)
  # analytics call
  Analytics.page("Finding Game",{ path: "/#finding_game" })

  # notify Discord status
  if Discord
    presence = {
      instance: 0
      largeImageKey: 'idle'
    }
    if gameMatchRequestData.gameType == 'ranked'
      presence.details = 'In Ranked Queue'
    else if gameMatchRequestData.gameType == 'gauntlet'
      presence.details = 'In Gauntlet Queue'
    else if gameMatchRequestData.gameType == 'rift'
      presence.details = 'In Rift Queue'
    else
      presence.details = 'In Queue'
    Discord.updatePresence(presence)

  # set the chat presence status to in-queue so your buddies see that you're unreachable
  ChatManager.getInstance().setStatus(ChatManager.STATUS_QUEUE)

  # add route
  NavigationManager.getInstance().addMajorRoute("finding_game", App._findingGame, App, [gameMatchRequestData])

  # initialize finding game view
  findingGameItemView = new FindingGameItemView({model: new Backbone.Model({gameType: gameMatchRequestData.gameType, factionId: gameMatchRequestData.factionId, generalId: gameMatchRequestData.generalId})})

  # initialize found game promise
  gameListingData = null

  # load find game assets and show finding game
  showFindingGamePromise = PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
    return Promise.all([
      Scene.getInstance().showContentByClass(PlayLayer, true),
      Scene.getInstance().showFindingGame(gameMatchRequestData.factionId, gameMatchRequestData.generalId),
      NavigationManager.getInstance().showContentView(findingGameItemView),
      NavigationManager.getInstance().showUtilityView(new UtilityMatchmakingMenuItemView({model: ProfileManager.getInstance().profile}))
    ])
  )

  # load my game assets as soon as possible
  loadGamePromise = showFindingGamePromise.then () ->
    Logger.module("APPLICATION").log("App._findingGame -> showFindingGamePromise DONE")
    return PackageManager.getInstance().loadGamePackageWithoutActivation([gameMatchRequestData.factionId])

  # save this promise to app object so it can be cancelled in the event of "cancelMatchmaking"
  # this is important because this promise is wrapped around the "found_game" event and a chain of stuff is waiting for it to resolve!
  # if we don't cancel this later, we will have a promise that never resolves and thus leaks memory
  App._foundGamePromise = new Promise((resolve, reject) ->

    # listen for next found game
    onFoundGame = (foundGameListingData) ->

      Logger.module("APPLICATION").log("App._findingGame -> onFoundGame()", foundGameListingData)
      # stop listening
      GamesManager.getInstance().off("found_game", onFoundGame)

      # store found data
      gameListingData = foundGameListingData
      showFindingGamePromise.then () ->
        # don't allow user triggered navigation now that we've found a game
        NavigationManager.getInstance().requestUserTriggeredNavigationLocked(App._userNavLockId)
        NavigationManager.getInstance().destroyNonContentViews()
        Logger.module("APPLICATION").log("App._findingGame -> onFoundGame() App._foundGamePromise RESOLVED")
        resolve(foundGameListingData)

    GamesManager.getInstance().once("found_game", onFoundGame)

  ).cancellable()

  # wait show finding game and found game, then join found game
  return Promise.all([
    showFindingGamePromise,
    App._foundGamePromise
  ]).then(() ->
    Logger.module("APPLICATION").log("App._findingGame -> show found game", gameListingData)
    # analytics call
    Analytics.page("Found Game",{ path: "/#found_game" })

    # get found game data from game listing data
    playerDataModel = App._playerDataFromGameListingData(gameListingData)

    # show found game
    return Promise.all([
      Scene.getInstance().showVsForGame(playerDataModel.get("myPlayerFactionId"), playerDataModel.get("opponentPlayerFactionId"), playerDataModel.get("myPlayerIsPlayer1"), CONFIG.ANIMATE_MEDIUM_DURATION, playerDataModel.get("myPlayerGeneralId"), playerDataModel.get("opponentPlayerGeneralId")),
      Scene.getInstance().showNewGame(playerDataModel.get("player1GeneralId"), playerDataModel.get("player2GeneralId")),
      findingGameItemView.showFoundGame(playerDataModel)
    ]).then(() ->
      # join found game
      return App._joinGame(gameListingData, loadGamePromise)
    )
  ).catch Promise.CancellationError, (e)->
    Logger.module("APPLICATION").log("App._findingGame -> promise chain cancelled")

App._resumeGame = (lastGameModel) ->
  if ChatManager.getInstance().getStatusIsInBattle()
    Logger.module("APPLICATION").log("App._resumeGame -> cannot start game when already in a game!")
    return


  gameListingData = lastGameModel?.attributes
  Logger.module("APPLICATION").log("App._resumeGame", gameListingData)
  # analytics call
  Analytics.page("Resume Game",{ path: "/#resume_game" })

  # set status to in game
  ChatManager.getInstance().setStatus(ChatManager.STATUS_GAME)

  # get resume game data from game listing data
  playerDataModel= App._playerDataFromGameListingData(gameListingData)
  # playerDataModel.set("gameModel", lastGameModel)

  # initialize resume ui
  gameResumeItemView = new ResumeGameItemView({model: playerDataModel})

  # initialize continue promise
  continueGamePromise = new Promise((resolve, reject) ->
    onContinueGame = () ->
      stopListeningForContinueGame()

      # don't allow user triggered navigation now that user has decided to continue
      NavigationManager.getInstance().requestUserTriggeredNavigationLocked(App._userNavLockId)
      NavigationManager.getInstance().destroyNonContentViews()

      resolve()

    onCancelContinueGame = (errorMessage) ->
      stopListeningForContinueGame()

      # don't try to reconnect to this game again
      lastGameModel.set("cancel_reconnect",true)

      reject(errorMessage)

    stopListeningForContinueGame = () ->
      gameResumeItemView.stopListening(gameResumeItemView, "continue", onContinueGame)
      gameResumeItemView.stopListening(lastGameModel, "change")
      gameResumeItemView.stopListening(NavigationManager.getInstance(), "user_triggered_cancel", onContinueGame)

    # listen for continue
    gameResumeItemView.listenToOnce(gameResumeItemView, "continue", onContinueGame)

    # listen for game over
    gameResumeItemView.listenTo(lastGameModel, "change", () ->
      if lastGameModel.get("status") == "over" then onCancelContinueGame("Oops... looks like that game is over!")
    )

    # listen for cancel
    gameResumeItemView.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_cancel, () ->
      if !NavigationManager.getInstance().getIsShowingModalView() then onCancelContinueGame()
    )
  )

  # load assets
  loadAndShowResumeGamePromise = PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
    # show UI
    return Promise.all([
      Scene.getInstance().showContentByClass(PlayLayer, true),
      Scene.getInstance().showVsForGame(playerDataModel.get("myPlayerFactionId"), playerDataModel.get("opponentPlayerFactionId"), playerDataModel.get("myPlayerIsPlayer1"), CONFIG.ANIMATE_MEDIUM_DURATION, playerDataModel.get("myPlayerGeneralId"), playerDataModel.get("opponentPlayerGeneralId")),
      NavigationManager.getInstance().showContentView(gameResumeItemView),
      NavigationManager.getInstance().showUtilityView(new UtilityMatchmakingMenuItemView({model: ProfileManager.getInstance().profile}))
    ])
  )

  # wait for load, show resume game, and click continue, then join in progress game
  Promise.all([
    loadAndShowResumeGamePromise,
    continueGamePromise
  ]).then(() ->
    Logger.module("APPLICATION").log("App._resumeGame -> joining game")

    # join found game
    return App._joinGame(gameListingData)
  ).catch((errorMessage) ->
    return App._error(errorMessage)
  )

  # only return show promise
  return loadAndShowResumeGamePromise

#
# --- Single Player ---- #
#

App._startSinglePlayerGame = (myPlayerDeck, myPlayerFactionId, myPlayerGeneralId, myPlayerCardBackId, myPlayerBattleMapId, aiGeneralId, aiDifficulty, aiNumRandomCards) ->
  if ChatManager.getInstance().getStatusIsInBattle()
    Logger.module("APPLICATION").log("App._startSinglePlayerGame -> cannot start game when already in a game!")
    return

  Logger.module("APPLICATION").log("App._startSinglePlayerGame")
  # analytics call
  Analytics.page("Single Player Game",{ path: "/#single_player" })

  # set status to in game
  ChatManager.getInstance().setStatus(ChatManager.STATUS_GAME)

  aiGeneralName = null
  aiGeneralCard = SDK.GameSession.getCardCaches().getCardById(aiGeneralId)
  if (aiGeneralCard?)
    aiGeneralName = aiGeneralCard.getName()

  # request single player game
  App._singlePlayerGamePromise = new Promise((resolve, reject) ->
    request = $.ajax
      url: process.env.API_URL + '/api/me/games/single_player',
      data: JSON.stringify({
        deck: myPlayerDeck,
        cardBackId: myPlayerCardBackId,
        battleMapId: myPlayerBattleMapId,
        hasPremiumBattleMaps: InventoryManager.getInstance().hasAnyBattleMapCosmetics(),
        ai_general_id: aiGeneralId,
        ai_difficulty: aiDifficulty,
        ai_num_random_cards: aiNumRandomCards,
        ai_username: aiGeneralName
      }),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'

    request.done (res)->
      resolve(res)

    request.fail (jqXHR)->
      reject(jqXHR and jqXHR.responseJSON and (jqXHR.responseJSON.error or jqXHR.responseJSON.message) or "Connection error. Please retry.")
  ).cancellable()

  # init finding game view
  findingGameItemView = new FindingGameItemView({model: new Backbone.Model({gameType: SDK.GameType.SinglePlayer})})
  findingGameItemView.listenTo(findingGameItemView, "destroy", App._cancelSinglePlayer)

  # show ui
  return Promise.all([
    Scene.getInstance().showContentByClass(PlayLayer, true),
    Scene.getInstance().showFindingGame(myPlayerFactionId, myPlayerGeneralId),
    NavigationManager.getInstance().showContentView(findingGameItemView),
    NavigationManager.getInstance().showUtilityView(new UtilityMatchmakingMenuItemView({model: ProfileManager.getInstance().profile}))
  ]).then(() ->
    # when we have single player game data
    return App._singlePlayerGamePromise?.then((gameListingData) ->
      App._singlePlayerGamePromise = null

      # don't allow user triggered navigation now that we've found a game
      NavigationManager.getInstance().requestUserTriggeredNavigationLocked(App._userNavLockId)

      # get found game data from game listing data
      playerDataModel = App._playerDataFromGameListingData(gameListingData)

      # show found game
      return Promise.all([
        Scene.getInstance().showVsForGame(playerDataModel.get("myPlayerFactionId"), playerDataModel.get("opponentPlayerFactionId"), playerDataModel.get("myPlayerIsPlayer1"), CONFIG.ANIMATE_MEDIUM_DURATION, playerDataModel.get("myPlayerGeneralId"), playerDataModel.get("opponentPlayerGeneralId")),
        Scene.getInstance().showNewGame(playerDataModel.get("player1GeneralId"), playerDataModel.get("player2GeneralId")),
        NavigationManager.getInstance().destroyNonContentViews(),
        findingGameItemView.showFoundGame(playerDataModel)
      ]).then(() ->
        # join found game
        return App._joinGame(gameListingData)
      )
    )
  ).catch(Promise.CancellationError, (e)->
    Logger.module("APPLICATION").log("App:_startSinglePlayerGame -> promise chain cancelled")
  ).catch((errorMessage) ->
    return App._error(if errorMessage? then "Failed to start single player game: " + errorMessage)
  )

App._cancelSinglePlayer = () ->
  if App._singlePlayerGamePromise?
    App._singlePlayerGamePromise.cancel()
    App._singlePlayerGamePromise = null

App._startBossBattleGame = (myPlayerDeck, myPlayerFactionId, myPlayerGeneralId, myPlayerCardBackId, myPlayerBattleMapId, aiGeneralId) ->
  if ChatManager.getInstance().getStatusIsInBattle()
    Logger.module("APPLICATION").log("App._startBossBattleGame -> cannot start game when already in a game!")
    return

  Logger.module("APPLICATION").log("App._startBossBattleGame")

  # analytics call
  Analytics.page("Boss Battle Game",{ path: "/#boss_battle" })

  # don't allow user triggered navigation
  NavigationManager.getInstance().requestUserTriggeredNavigationLocked(App._userNavLockId)

  # set user as in game
  ChatManager.getInstance().setStatus(ChatManager.STATUS_GAME)

  aiGeneralName = null
  aiGeneralCard = SDK.GameSession.getCardCaches().getCardById(aiGeneralId)
  if (aiGeneralCard?)
    aiGeneralName = aiGeneralCard.getName()

  # request boss battle game
  bossBattleGamePromise = new Promise((resolve, reject) ->
    request = $.ajax
      url: process.env.API_URL + '/api/me/games/boss_battle',
      data: JSON.stringify({
        deck: myPlayerDeck,
        cardBackId: myPlayerCardBackId,
        battleMapId: myPlayerBattleMapId,
        ai_general_id: aiGeneralId,
        ai_username: aiGeneralName
      }),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'

    request.done (res)->
      resolve(res)

    request.fail (jqXHR)->
      reject(jqXHR and jqXHR.responseJSON and (jqXHR.responseJSON.error or jqXHR.responseJSON.message) or "Connection error. Please retry.")
  )

  # get ui promise
  if CONFIG.LOAD_ALL_AT_START
    ui_promise = Promise.resolve()
  else
    ui_promise = NavigationManager.getInstance().showDialogForLoad()

  return Promise.all([
      bossBattleGamePromise,
      ui_promise
    ]).spread (gameListingData) ->
      return App._joinGame(gameListingData)
    .catch (errorMessage) ->
      return App._error(if errorMessage? then "Failed to start boss battle: " + errorMessage)

#
# --- Replays ---- #
#

App._startGameForReplay = (replayData) ->
  if ChatManager.getInstance().getStatusIsInBattle()
    Logger.module("APPLICATION").log("App._startGameForReplay -> cannot start game when already in a game!")
    return

  userId = replayData.userId
  gameId = replayData.gameId
  replayId = replayData.replayId
  promotedDivisionName = replayData.promotedDivisionName

  # check for invalid replay data
  if !replayId?
    if !gameId?
      throw new Error("Cannot replay game without game id!")
    if !userId? and !promotedDivisionName?
      throw new Error("Cannot replay game without user id or division name!")

  # don't allow user triggered navigation
  NavigationManager.getInstance().requestUserTriggeredNavigationLocked(App._userNavLockId)

  # show loading
  return NavigationManager.getInstance().showDialogForLoad()
  .bind {}
  .then () ->
    # load replay data
    if replayId?
      url = "#{process.env.API_URL}/replays/#{replayId}"
    else if promotedDivisionName?
      url = "#{process.env.API_URL}/api/me/games/watchable/#{promotedDivisionName}/#{gameId}/replay_data?playerId=#{userId}"
    else
      url = "#{process.env.API_URL}/api/users/#{userId}/games/#{gameId}/replay_data"

    return new Promise (resolve, reject) ->
      request = $.ajax({
        url: url  ,
        type: 'GET',
        contentType: 'application/json',
        dataType: 'json'
      })
      request.done (response)->
        resolve(response)
      .fail (response)->
        reject(new Error("Error downloading replay data: #{response?.responseJSON?.message}"))
  .then (replayResponseData) ->
    @.replayResponseData = replayResponseData
    gameSessionData = replayResponseData.gameSessionData
    gameUIData = replayResponseData.mouseUIData
    replayData = replayResponseData.replayData

    # validate data
    gameSetupData = gameSessionData?.gameSetupData
    if !gameSetupData?
      throw new Error("ReplayEngine -> loaded game does not have valid replay data!")

    # store data
    @_loadedGameSessionData = gameSessionData
    @_loadedGameUIEventData = gameUIData

    # load resources for game
    return PackageManager.getInstance().loadGamePackageWithoutActivation([
      gameSetupData.players[0].factionId
      gameSetupData.players[1].factionId
    ])
  .then () ->
    # create new game instance but don't deserialize from existing data
    SDK.GameSession.reset()

    if userId? # if we explicity requested to spectate a user perspective
      SDK.GameSession.getInstance().setUserId(userId)
    else if @.replayResponseData?.replayData # check if the server response includes a shared replay record so we can use that to determine who to spectate
      SDK.GameSession.getInstance().setUserId(@.replayResponseData?.replayData.user_id)
    else # ultimately spectate player 1 if nothing provided
      SDK.GameSession.getInstance().setUserId(@_loadedGameSessionData.players[0].playerId)

    SDK.GameSession.getInstance().setGameType(@_loadedGameSessionData.gameType)
    SDK.GameSession.getInstance().setIsRunningAsAuthoritative(false)
    SDK.GameSession.getInstance().setIsSpectateMode(true)
    SDK.GameSession.getInstance().setIsReplay(true)

    # setup GameSession from replay data
    SDK.GameSetup.setupNewSessionFromExistingSessionData(SDK.GameSession.getInstance(), @_loadedGameSessionData)

    return App._startGame()
  .then () ->
    # start watching replay
    ReplayEngine.getInstance().watchReplay(@_loadedGameSessionData, @_loadedGameUIEventData)
  .catch (errorMessage) ->
    ReplayEngine.getInstance().stopCurrentReplay()
    return App._error(errorMessage)

#
# --- Game Connecting ---- #
#
App._unsubscribeFromJoinGameEvents = () ->
  SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.join_game)
  SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.reconnect_failed)

App._subscribeToJoinGameEventsPromise = () ->
  App._unsubscribeFromJoinGameEvents()

  return new Promise((resolve, reject) ->
    # wait for join_game event
    SDK.NetworkManager.getInstance().getEventBus().once(EVENTS.join_game, (response) ->
      # handle response
      if response.error
        reject(response.error)
      else
        resolve(response.gameSessionData)
    )

    SDK.NetworkManager.getInstance().getEventBus().once(EVENTS.spectate_game, (response) ->
      # handle response
      if response.error
        reject(response.error)
      else
        resolve(response.gameSessionData)
    )

    # wait for reconnect_failed event
    SDK.NetworkManager.getInstance().getEventBus().once(EVENTS.reconnect_failed, () ->
      # reject and cancel reconnect
      reject("Reconnect failed!")
    )
  ).finally(() ->
    # reset join game listeners
    App._unsubscribeFromJoinGameEvents()
  )

App._joinGame = (gameListingData, loadMyGameResourcesPromise, loadOpponentGameResourcesPromise) ->
  Logger.module("APPLICATION").log("App._joinGame", gameListingData)

  # load my resources for game
  loadMyGameResourcesPromise ?= PackageManager.getInstance().loadGamePackageWithoutActivation([gameListingData["faction_id"]])

  # load opponent resources for game
  loadOpponentGameResourcesPromise ?= PackageManager.getInstance().loadMinorPackage(PKGS.getFactionGamePkgIdentifier(gameListingData["opponent_faction_id"]), null, "game")

  return Promise.all([
    loadMyGameResourcesPromise,
    loadOpponentGameResourcesPromise
  ]).then(() ->
    # listen to join game events
    joinGamePromise = App._subscribeToJoinGameEventsPromise()

    # join game and if a game server is assigned to this listing, connect there
    SDK.NetworkManager.getInstance().connect(
      gameListingData["game_type"],
      gameListingData["game_id"],
      ProfileManager.getInstance().get('id'),
      gameListingData["game_server"],
    )

    return joinGamePromise.then((gameSessionData) ->
      return App._startGameWithData(gameSessionData)
    ).catch((errorMessage) ->
      return App._error(errorMessage)
    )
  )

App._onReconnectToGame = (gameId) ->
  Logger.module("APPLICATION").log("App._onReconnectToGame", gameId)
  # destroy the current game
  App.cleanupGame()

  # start listening to join game events
  joinGamePromise = App._subscribeToJoinGameEventsPromise()

  # blur the view in engine
  Scene.getInstance().getFX().requestBlurScreen(App._screenBlurId)

  return Promise.all([
    # show user we're reconnecting
    NavigationManager.getInstance().showContentView(new ReconnectToGameItemView()),
    NavigationManager.getInstance().showUtilityView(new UtilityMatchmakingMenuItemView({model: ProfileManager.getInstance().profile}))
  ]).then(() ->
    return joinGamePromise.then((gameSessionData) ->
      # start game
      return App._startGameWithData(gameSessionData)
    ).catch((errorMessage) ->
      return App._error(errorMessage)
    ).finally(() ->
      App.cleanupReconnectToGame()
    )
  )

App.cleanupReconnectToGame = () ->
  # unsubscribe from events
  App._unsubscribeFromJoinGameEvents()

  # unblur screen
  Scene.getInstance().getFX().requestUnblurScreen(App._screenBlurId)

#
# --- Game Events ---- #
#

App._onNetworkGameEvent = (eventData) ->
  if (eventData.type == EVENTS.step)
    Logger.module("APPLICATION").log("App._onNetworkGameEvent -> step", eventData)
    # step event
    if eventData.step?
      # deserialize step
      sdkStep = SDK.GameSession.getInstance().deserializeStepFromFirebase(eventData.step)
      # if we are spectating, and connected in the middle of a followup (so we don't have a snapshot), error out to main menu in the event of a rollback since we have nothing to roll back to
      if (SDK.GameSession.getInstance().getIsSpectateMode() and sdkStep.getAction() instanceof SDK.RollbackToSnapshotAction and !SDK.GameSession.getInstance().getRollbackSnapshotData())
        return App._error("You fell out of sync. Please try to spectate again to sync up.")
      # mark step as transmitted
      sdkStep.setTransmitted(true)
      # execute step
      SDK.GameSession.getInstance().executeAuthoritativeStep(sdkStep)
      if sdkStep.getAction()
        AnalyticsTracker.sendAnalyticsForExplicitAction(sdkStep.getAction())
  else if (eventData.type == EVENTS.invalid_action)
    if eventData.playerId == SDK.GameSession.getInstance().getMyPlayerId()
      if eventData.desync
        # player is out of sync with server
        # force them to reconnect to game
        Analytics.track("player desync", {category:Analytics.EventCategory.Debug}, {nonInteraction:1})
        App._error("Your current match appears to be out of sync. To avoid any issues, please select CONTINUE and reconnect to your match.")
      else
        # player isn't out of sync but may need to know their action was invalid
        # this may happen if a player attempts to submit actions after their turn is over
        SDK.GameSession.getInstance().onAuthoritativeInvalidAction(eventData)
  else if (eventData.type == EVENTS.network_game_hover)
    Scene.getInstance().getGameLayer()?.onNetworkHover(eventData)
  else if (eventData.type == EVENTS.network_game_select)
    Scene.getInstance().getGameLayer()?.onNetworkSelect(eventData)
  else if (eventData.type == EVENTS.network_game_mouse_clear)
    Scene.getInstance().getGameLayer()?.onNetworkMouseClear(eventData)
  else if (eventData.type == EVENTS.turn_time)
    # if we are behind in step count for some reason from the server step counter
    if (!SDK.GameSession.getInstance().getIsSpectateMode() and eventData.stepCount > SDK.GameSession.getInstance().getStepCount())
      # we're going to start a pseudo-timeout to reload the game
      Logger.module("APPLICATION").warn("App._onNetworkGameEvent -> seems like game session is behind server step count")
      # if we haven't already detected a potential desync state and recorded the moment it started
      if not App._gameDesyncStartedAt
        # record the moment the suspected desync started
        App._gameDesyncStartedAt = moment.utc()
        # otherwise if we suspect a desync state is already in progress and we have the time it started, see if it's been more than 10s
      else if moment.duration(moment.utc() - App._gameDesyncStartedAt).asSeconds() > 10.0
        # if it's been more than 10s in a desync state, fire off the error state
        App._error("Your current match appears to be out of sync. To avoid any issues, please select CONTINUE and reconnect to your match.")
        App._gameDesyncStartedAt = null
        return
    else
      # if we're up to date with our step count, just clear out any suspected desync starting point
      App._gameDesyncStartedAt = null
    # the game session emits events from here that inform UI etc.
    SDK.GameSession.getInstance().setTurnTimeRemaining(eventData.time)
  else if (eventData.type == EVENTS.show_emote)
    EventBus.getInstance().trigger(EVENTS.show_emote, eventData)

App._onOpponentConnectionStatusChanged = (eventData) ->
  # when opponent disconnects, force mouse clear
  if !SDK.NetworkManager.getInstance().isOpponentConnected
    Scene.getInstance().getGameLayer()?.onNetworkMouseClear({type:EVENTS.network_game_mouse_clear, timestamp: Date.now()})

App._onNetworkGameError = (errorData) ->
  return App._error(JSON.stringify(errorData))

App._onGameServerShutdown = (errorData) ->
  if errorData.ip
    ip = errorData.ip
    lastGameModel = GamesManager.getInstance().playerGames.first()
    lastGameModel.set('gameServer',ip)

    # reconnect
    SDK.NetworkManager.getInstance().reconnect(ip)

    # show reconnecting
    return App._onReconnectToGame()
  else
    return App._error("Game server error, no ip!")

#
# --- Game Setup ---- #
#

App._startGameWithChallenge = (challenge) ->
  if ChatManager.getInstance().getStatusIsInBattle()
    Logger.module("APPLICATION").log("App._startGameWithChallenge -> cannot start game when already in a game!")
    return
  Logger.module("APPLICATION").log("App:_startGameWithChallenge")

  # don't allow user triggered navigation
  NavigationManager.getInstance().requestUserTriggeredNavigationLocked(App._userNavLockId)

  # set user as in game
  ChatManager.getInstance().setStatus(ChatManager.STATUS_CHALLENGE)

  if not challenge instanceof SDK.ChallengeRemote
    # mark challenge as attempted
    ProgressionManager.getInstance().markChallengeAsAttemptedWithType(challenge.type)

  # challenge handles setting up game session
  SDK.GameSession.reset()
  SDK.GameSession.getInstance().setUserId(ProfileManager.getInstance().get('id'))
  challenge.setupSession(SDK.GameSession.getInstance())

  # get ui promise
  if CONFIG.LOAD_ALL_AT_START
    ui_promise = Promise.resolve()
  else
    ui_promise = NavigationManager.getInstance().showDialogForLoad()

  return ui_promise.then () ->
    return PackageManager.getInstance().loadGamePackageWithoutActivation([
      SDK.GameSession.getInstance().getGeneralForPlayer1().getFactionId(),
      SDK.GameSession.getInstance().getGeneralForPlayer2().getFactionId()
    ], [
      "tutorial",
      PKGS.getChallengePkgIdentifier(SDK.GameSession.getInstance().getChallenge().getType())
    ])
  .then () ->
    return App._startGame()
  .catch (errorMessage) ->
    return App._error(errorMessage)

App._startGameWithData = (sessionData) ->
  Logger.module("APPLICATION").log("App._startGameWithData", sessionData)
  # reset and deserialize
  SDK.GameSession.reset()
  SDK.GameSession.getInstance().deserializeSessionFromFirebase(sessionData)
  SDK.GameSession.getInstance().setUserId(ProfileManager.getInstance().get('id'))

  # do not start games that are already over
  if !SDK.GameSession.getInstance().isOver()
    return App._startGame()
  else
    return Promise.reject()

App._startGame = () ->
  gameSession = SDK.GameSession.getInstance()
  Logger.module("APPLICATION").log("App:_startGame", gameSession.getStatus())

  if gameSession.getIsSpectateMode()
    ChatManager.getInstance().setStatus(ChatManager.STATUS_WATCHING)
  else if gameSession.isChallenge()
    ChatManager.getInstance().setStatus(ChatManager.STATUS_CHALLENGE)
  else
    ChatManager.getInstance().setStatus(ChatManager.STATUS_GAME)

  NotificationsManager.getInstance().dismissNotificationsThatCantBeShown()

  if Discord
    getFactionImage = (factionId, opponent = false) ->
      s = {key: '', text: ''}
      switch factionId
        when 1 then s = {key: 'f1', text: 'Lyonar'}
        when 2 then s = {key: 'f2', text: 'Songhai'}
        when 3 then s = {key: 'f3', text: 'Vetruvian'}
        when 4 then s = {key: 'f4', text: 'Abyssian'}
        when 5 then s = {key: 'f5', text: 'Magmar'}
        when 6 then s = {key: 'f6', text: 'Vanar'}
        else s = {key: 'neutral', text: 'Neutral'}
      if opponent
        s.key += '_small'
      return s

    opponentName = SDK.GameSession.getInstance().getOpponentPlayer().getUsername()
    opponentFaction = SDK.GameSession.getInstance().getGeneralForPlayer(SDK.GameSession.getInstance().getOpponentPlayer()).factionId
    opponentFactionImage = getFactionImage(opponentFaction, true)
    playerName = SDK.GameSession.getInstance().getMyPlayer().getUsername()
    playerId = SDK.GameSession.getInstance().getMyPlayerId()
    playerRank = GamesManager.getInstance().getCurrentRank()
    playerFaction = SDK.GameSession.getInstance().getGeneralForPlayer(SDK.GameSession.getInstance().getMyPlayer()).factionId
    playerFactionImage = getFactionImage(playerFaction, false)

    presence = {
      startTimestamp: Math.floor((new Date).getTime()/1000),
      instance: 1
      largeImageKey: playerFactionImage.key
      largeImageText: playerFactionImage.text
      smallImageKey: opponentFactionImage.key
      smallImageText: opponentFactionImage.text
    }

    if gameSession.getIsSpectateMode()
      if gameSession.getIsReplay()
        presence.details = "Watching: #{playerName} vs. #{opponentName} replay"
        presence.state = "Spectating"
      else
        presence.details = "Watching: #{playerName} vs. #{opponentName} live"
        presence.state = "Spectating"
    else if gameSession.isRanked()
      presence.details = "Ranked: vs. #{opponentName}"
      presence.state = "In Match"
      # check if block is enabled before allowing spectate
      if !ProfileManager.getInstance().profile.get("blockSpectators")
        presence.spectateSecret = playerId
    else if gameSession.isGauntlet()
      presence.details = "Gauntlet: vs. #{opponentName}"
      presence.state = "In Match"
      # check if block is enabled before allowing spectate
      if !ProfileManager.getInstance().profile.get("blockSpectators")
        presence.spectateSecret = playerId
    else if gameSession.isRift()
      presence.details = "Rift: vs. #{opponentName}"
      presence.state = "In Match"
      # check if block is enabled before allowing spectate
      if !ProfileManager.getInstance().profile.get("blockSpectators")
        presence.spectateSecret = playerId
    else if gameSession.isFriendly()
      presence.details = "Friendly: vs. #{opponentName}"
      presence.state = "In Game"
      # check if block is enabled before allowing spectate
      if !ProfileManager.getInstance().profile.get("blockSpectators")
        presence.spectateSecret = playerId
    else if gameSession.isBossBattle()
      presence.details = "Boss Battle: vs. #{opponentName}"
      presence.state = "Playing Solo"
    else if gameSession.isSinglePlayer() || gameSession.isSandbox() || gameSession.isChallenge()
      presence.state = "Playing Solo"
    Discord.updatePresence(presence)

  # analytics call
  Analytics.page("Game",{ path: "/#game" })

  # reset routes as soon as we lock into a game
  NavigationManager.getInstance().resetRoutes()

  # record last game data
  CONFIG.resetLastGameData()
  CONFIG.lastGameType = gameSession.getGameType()
  CONFIG.lastGameWasSpectate = gameSession.getIsSpectateMode()
  CONFIG.lastGameWasTutorial = gameSession.isTutorial()
  CONFIG.lastGameWasDeveloper = UtilsEnv.getIsInDevelopment() && gameSession.getIsDeveloperMode()
  CONFIG.lastGameWasDailyChallenge = gameSession.isDailyChallenge()

  # listen to game network events
  App._subscribeToGameNetworkEvents()

  # get game UI view class
  challenge = gameSession.getChallenge()
  if challenge? and !(challenge instanceof SDK.Sandbox)
    gameUIViewClass = TutorialLayout
  else
    gameUIViewClass = GameLayout

  # load resources for game session
  load_promises = [
    # load battlemap assets required for game
    PackageManager.getInstance().loadMinorPackage(PKGS.getBattleMapPkgIdentifier(gameSession.getBattleMapTemplate().getMap()), null, "game")
  ]

  # load all cards in my player's hand
  preloaded_package_ids = []
  for cardIndex in gameSession.getMyPlayer().getDeck().getHand()
    card = gameSession.getCardByIndex(cardIndex)
    if card?
      # get unique id for card preload
      card_id = card.id
      card_pkg_id = PKGS.getCardGamePkgIdentifier(card_id)
      card_preload_pkg_id = card_pkg_id + "_preload_" + UtilsJavascript.generateIncrementalId()
      preloaded_package_ids.push(card_preload_pkg_id)
      load_promises.push(PackageManager.getInstance().loadMinorPackage(card_preload_pkg_id, PKGS.getPkgForIdentifier(card_pkg_id), "game"))

  # load all cards and modifiers on board
  for card in gameSession.getBoard().getCards(null, allowUntargetable=true)
    # get unique id for card preload
    card_id = card.getId()
    card_pkg_id = PKGS.getCardGamePkgIdentifier(card_id)
    card_resources_pkg = PKGS.getPkgForIdentifier(card_pkg_id)
    card_preload_pkg_id = card_pkg_id + "_preload_" + UtilsJavascript.generateIncrementalId()
    preloaded_package_ids.push(card_preload_pkg_id)

    # include signature card resources
    if card instanceof SDK.Entity and card.getWasGeneral()
      referenceSignatureCard = card.getReferenceSignatureCard()
      if referenceSignatureCard?
        signature_card_id = referenceSignatureCard.getId()
        signature_card_pkg_id = PKGS.getCardGamePkgIdentifier(signature_card_id)
        signature_card_resources_pkg = PKGS.getPkgForIdentifier(signature_card_pkg_id)
        card_resources_pkg = [].concat(card_resources_pkg, signature_card_resources_pkg)

    # load card resources
    load_promises.push(PackageManager.getInstance().loadMinorPackage(card_preload_pkg_id, card_resources_pkg, "game"))

    # modifiers
    for modifier in card.getModifiers()
      if modifier?
        # get unique id for modifier preload
        modifier_type = modifier.getType()
        modifier_preload_package_id = modifier_type + "_preload_" + UtilsJavascript.generateIncrementalId()
        preloaded_package_ids.push(modifier_preload_package_id)
        load_promises.push(PackageManager.getInstance().loadMinorPackage(modifier_preload_package_id, PKGS.getPkgForIdentifier(modifier_type), "game"))

        # load artifact card if modifier is applied by an artifact
        if modifier.getIsFromArtifact()
          artifact_card = modifier.getSourceCard()
          if artifact_card?
            # get unique id for artifact card preload
            artifact_card_id = artifact_card.getId()
            artifact_card_pkg_id = PKGS.getCardInspectPkgIdentifier(artifact_card_id)
            artifact_card_preload_pkg_id = artifact_card_pkg_id + "_preload_" + UtilsJavascript.generateIncrementalId()
            preloaded_package_ids.push(artifact_card_preload_pkg_id)
            load_promises.push(PackageManager.getInstance().loadMinorPackage(artifact_card_preload_pkg_id, PKGS.getPkgForIdentifier(artifact_card_pkg_id), "game"))

  return Promise.all(load_promises).then(() ->
    # destroy all views/layers
    return NavigationManager.getInstance().destroyAllViewsAndLayers()
  ).then(() ->
    return PackageManager.getInstance().activateGamePackage()
  ).then(() ->
    # show game and ui
    overlay_promise = Scene.getInstance().destroyOverlay()
    game_promise = Scene.getInstance().showGame()
    content_promise = NavigationManager.getInstance().showContentView(new gameUIViewClass({challenge: challenge}))
    utility_promise = NavigationManager.getInstance().showUtilityView(new UtilityGameMenuItemView({model: ProfileManager.getInstance().profile}))

    # listen to game local events
    App._subscribeToGameLocalEvents()

    # wait for game to show as active (not status active) then unload all preloaded packages
    scene = Scene.getInstance()
    gameLayer = scene? && scene.getGameLayer()
    if !gameLayer? or gameLayer.getStatus() == GameLayer.STATUS.ACTIVE
      PackageManager.getInstance().unloadMajorMinorPackages(preloaded_package_ids)
    else
      onActiveGame = () ->
        gameLayer.getEventBus().off(EVENTS.show_active_game, onActiveGame)
        gameLayer.getEventBus().off(EVENTS.terminate, onTerminate)
        PackageManager.getInstance().unloadMajorMinorPackages(preloaded_package_ids)
      onTerminate = () ->
        gameLayer.getEventBus().off(EVENTS.show_active_game, onActiveGame)
        gameLayer.getEventBus().off(EVENTS.terminate, onTerminate)
      gameLayer.getEventBus().on(EVENTS.show_active_game, onActiveGame)
      gameLayer.getEventBus().on(EVENTS.terminate, onTerminate)

    return Promise.all([
      overlay_promise,
      game_promise,
      content_promise,
      utility_promise
    ])
  ).then(() ->
    # enable user triggered navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(App._userNavLockId)
  )

########

App.onAfterShowEndTurn = () ->
  Logger.module("APPLICATION").log "App:onAfterShowEndTurn"
  # if we're playing in sandbox mode, we need to let the player play both sides so we swap players here
  if SDK.GameSession.getInstance().isSandbox()
    # swap test user id
    player1 = SDK.GameSession.getInstance().getPlayer1()
    player2 = SDK.GameSession.getInstance().getPlayer2()
    if player1.getIsCurrentPlayer() then SDK.GameSession.getInstance().setUserId(player1.getPlayerId()) else SDK.GameSession.getInstance().setUserId(player2.getPlayerId())

#
# --- Game Cleanup ---- #
#

App.cleanupGame = () ->
  Logger.module("APPLICATION").log "App.cleanupGame"
  # cleanup reconnect
  App.cleanupReconnectToGame()

  # cleanup events
  App.cleanupGameEvents()

  # terminate the game layer
  Scene.getInstance().getGameLayer()?.terminate()

  # reset the current instance of the game session
  SDK.GameSession.reset()

App.cleanupGameEvents = () ->
  Logger.module("APPLICATION").log "App.cleanupGameEvents"
  # cleanup events
  App._unsubscribeFromGameLocalEvents()
  App._unsubscribeFromGameNetworkEvents()

#
# --- Game Over Views ---- #
#

App._onGameOver = () ->
  Logger.module("APPLICATION").log "App:_onGameOver"

  # start loading data as soon as game is over, don't wait for animations
  App._startLoadingGameOverData()

  # disconnect from game room on network side
  # defer it until the call stack clears so any actions that caused the game to be over get broadcast during the current JS tick
  _.defer () ->
    SDK.NetworkManager.getInstance().disconnect()

#
# --- Game Turn Over---- #
#

App._onEndTurn = (e) ->
  AnalyticsTracker.sendAnalyticsForCompletedTurn(e.turn)

###*
# This method de-registers all game listeners and initiates the game over screen flow. For visual sequencing purposes, it fires when it recieves an event that all game actions are done showing in the game layer.
# @public
###
App.onShowGameOver = () ->
  Logger.module("APPLICATION").log "App:onShowGameOver"

  # analytics call
  Analytics.page("Game Over",{ path: "/#game_over" })

  App.cleanupGameEvents()
  App.showVictoryWhenGameDataReady()

###*
# Load progression, rank, etc... data after a game is over.
# @private
###
App._startLoadingGameOverData = ()->

  # for specated games, don't load any data
  if SDK.GameSession.current().getIsSpectateMode()
    App._gameOverDataThenable = Promise.resolve([null,[]])
    return

  # resolve when the last game is confirmed as "over"
  whenGameJobsProcessedAsync = new Promise (resolve,reject)->
    isGameReady = (gameAttrs,jobAttrs)->
      # if game is not over yet, the rest of the data is not valid
      if gameAttrs.status != SDK.GameStatus.over
        return false

      switch gameAttrs.game_type
        when SDK.GameType.Friendly
          return isFriendlyGameReady(gameAttrs,jobAttrs)
        when SDK.GameType.Ranked
          return isRankedGameReady(gameAttrs,jobAttrs)
        when SDK.GameType.Casual
          return isCasualGameReady(gameAttrs,jobAttrs)
        when SDK.GameType.Gauntlet
          return isGauntletGameReady(gameAttrs,jobAttrs)
        when SDK.GameType.SinglePlayer
          return isSinglePlayerGameReady(gameAttrs,jobAttrs)
        when SDK.GameType.BossBattle
          return isBossBattleGameReady(gameAttrs,jobAttrs)
        when SDK.GameType.Rift
          return isRiftGameReady(gameAttrs,jobAttrs)
        else
          return Promise.resolve()

    isFriendlyGameReady = (gameAttrs,jobAttrs)->
      if gameAttrs.is_scored
        return jobAttrs.quests and jobAttrs.faction_progression
      else
        return true

    isRankedGameReady = (gameAttrs,jobAttrs)->
      doneProcessing = false

      if gameAttrs.is_scored
        doneProcessing = (jobAttrs.rank and jobAttrs.quests and jobAttrs.progression and jobAttrs.faction_progression)
      else
        doneProcessing = (jobAttrs.rank)

      # if we're in diamond or above, wait for ladder, othwerwise don't since it's not guaranteed to process
      if GamesManager.getInstance().getCurrentRank() <= SDK.RankDivisionLookup.Diamond
        doneProcessing = doneProcessing and jobAttrs.ladder

      return doneProcessing

    isCasualGameReady = (gameAttrs,jobAttrs)->
      if gameAttrs.is_scored
        return (jobAttrs.quests and jobAttrs.progression and jobAttrs.faction_progression)
      else
        return true

    isGauntletGameReady = (gameAttrs,jobAttrs)->
      if gameAttrs.is_scored
        return (jobAttrs.gauntlet and jobAttrs.quests and jobAttrs.progression and jobAttrs.faction_progression)
      else
        return jobAttrs.gauntlet

    isSinglePlayerGameReady = (gameAttrs,jobAttrs)->
      if gameAttrs.is_scored
        return jobAttrs.faction_progression
      else
        return true

    isBossBattleGameReady = (gameAttrs,jobAttrs)->
      if gameAttrs.is_winner
        return (jobAttrs.progression and jobAttrs.cosmetic_chests and jobAttrs.faction_progression)
      if gameAttrs.is_scored
        return jobAttrs.faction_progression
      else
        return true

    isRiftGameReady = (gameAttrs,jobAttrs)->
      if gameAttrs.is_scored
        doneProcessing = (jobAttrs.rift and jobAttrs.quests)
      else
        doneProcessing = (jobAttrs.rift)

    gameSession = SDK.GameSession.getInstance()
    lastGameModel = GamesManager.getInstance().playerGames.first()

    if lastGameModel? and SDK.GameType.isNetworkGameType(gameSession.getGameType())
      # lastGameModel.onSyncOrReady().then ()->
      if isGameReady(lastGameModel.attributes,lastGameModel.attributes.job_status || {})
        resolve([lastGameModel,null])
      else
        lastGameModel.on "change", () ->
          if isGameReady(lastGameModel.attributes,lastGameModel.attributes.job_status || {})
            lastGameModel.off "change"
            resolve([lastGameModel,null])
    else if gameSession.isChallenge()
      challengeId = gameSession.getChallenge().type
      if gameSession.getChallenge() instanceof SDK.ChallengeRemote and gameSession.getChallenge().isDaily
        # Don't process daily challenges run by qa tool
        if gameSession.getChallenge()._generatedForQA
          resolve([null,null])
        else
          ProgressionManager.getInstance().completeDailyChallenge(challengeId).then (challengeData)->
            challengeModel = new Backbone.Model(challengeData)
            resolve([null,challengeModel])
      else
        ProgressionManager.getInstance().completeChallengeWithType(challengeId).then (challengeData)->
          NewPlayerManager.getInstance().setHasSeenBloodbornSpellInfo()
          challengeModel = new Backbone.Model(challengeData)
          resolve([null,challengeModel])
    else
      resolve([null, null])

  App._gameOverDataThenable = whenGameJobsProcessedAsync
  .bind {}
  .spread (userGameModel,challengeModel)->
    @.userGameModel = userGameModel
    @.challengeModel = challengeModel
    rewardIds = []

    gameSession = SDK.GameSession.getInstance()

    # Send game based analytics
    AnalyticsTracker.submitGameOverAnalytics(gameSession,userGameModel)

    # Mark first game of type completions
    if gameSession.isRanked()
      NewPlayerManager.getInstance().setHasPlayedRanked(userGameModel)
    if gameSession.isSinglePlayer()
      NewPlayerManager.getInstance().setHasPlayedSinglePlayer(userGameModel)

    if @.userGameModel?.get('rewards')
      for rewardId,val of @.userGameModel.get('rewards')
        rewardIds.push rewardId

    if @.challengeModel?.get('reward_ids')
      for rewardId in @.challengeModel.get('reward_ids')
        rewardIds.push rewardId

    return rewardIds
  .then (rewardIds)->
    allPromises = []
    if rewardIds?
      for rewardId in rewardIds
        rewardModel = new DuelystBackbone.Model()
        rewardModel.url = process.env.API_URL + "/api/me/rewards/#{rewardId}"
        rewardModel.fetch()
        allPromises.push rewardModel.onSyncOrReady()
    return Promise.all(allPromises)
  .then (allRewardModels)->
    @.rewardModels = allRewardModels
    # if we're not done with core progression
    if not NewPlayerManager.getInstance().isCoreProgressionDone()
      return NewPlayerManager.getInstance().updateCoreState()
    else
      return Promise.resolve()
  .then (newPlayerProgressionData)->
    if newPlayerProgressionData?.quests
      @.newBeginnerQuestsCollection = new Backbone.Collection(newPlayerProgressionData?.quests)
    else
      @.newBeginnerQuestsCollection = new Backbone.Collection()
  .then ()->
    # if we're at a stage where we should start generating daily quests, request them in case any of the quest slots opened up
    if NewPlayerManager.getInstance().shouldStartGeneratingDailyQuests()
      return QuestsManager.getInstance().requestNewDailyQuests()
    else
      return Promise.resolve()
  .then ()->
    return Promise.all([@.userGameModel,@.rewardModels,@.newBeginnerQuestsCollection])
  # don't wait more than ~10 seconds
  .timeout(10000)

###*
# Shows the victory screen after a game is over, all data is loaded, and assets for victory screen are allocated.
# @public
###
App.showVictoryWhenGameDataReady = () ->

  # show activity dialog
  NavigationManager.getInstance().showDialogView(new ActivityDialogItemView())

  # resolve when post game assets are done loading
  return PackageManager.getInstance().loadMinorPackage("postgame")
  .then ()->
    return App._gameOverDataThenable
  .spread (userGameModel,rewardModels,newBeginnerQuestsCollection)->
    if not rewardModels
      throw new Error()
    # destroy dialog
    NavigationManager.getInstance().destroyDialogView()
    # terminate game layer as we no longer need it to be active
    Scene.getInstance().getGameLayer()?.terminate()
    # show victory
    App.showVictory(userGameModel,rewardModels,newBeginnerQuestsCollection)
  .catch Promise.TimeoutError, (e) ->
    # hide dialog
    NavigationManager.getInstance().destroyDialogView()
    App._error("We're experiencing some delays in processing your game. Don't worry, you can keep playing and you'll receive credit shortly.")
  .catch (e)->
    # hide dialog
    NavigationManager.getInstance().destroyDialogView()
    App._error(e.message)

###*
# Shows the victory screen after a game is over.
# @public
# @param  {Backbone.Model}        userGameModel           Game model that is finished loading / processing all jobs.
# @param  {Array}              rewardModels           Rewards that this game needs to show.
# @param  {Backbone.Collection}      newBeginnerQuestsCollection   Collection of new beginner quests as of game completion
###
App.showVictory = (userGameModel,rewardModels,newBeginnerQuestsCollection) ->
  Logger.module("APPLICATION").log "App:showVictory"

  if not SDK.GameSession.getInstance().getIsSpectateMode() and SDK.GameType.isNetworkGameType(SDK.GameSession.getInstance().getGameType())

    faction_id = userGameModel.get('faction_id')
    faction_xp = userGameModel.get('faction_xp')
    faction_xp_earned = userGameModel.get('faction_xp_earned')
    faction_level = SDK.FactionProgression.levelForXP(faction_xp + faction_xp_earned)
    faction_prog_reward = SDK.FactionProgression.rewardDataForLevel(faction_id,faction_level)

    if SDK.FactionProgression.hasLeveledUp(faction_xp + faction_xp_earned, faction_xp_earned) and faction_prog_reward
      App.setCallbackWhenCancel(App.showFactionXpReward.bind(App,userGameModel,rewardModels))
    else if SDK.GameSession.getInstance().isRanked()
      App.setCallbackWhenCancel(App.showLadderProgress.bind(App,userGameModel,rewardModels))
    else if SDK.GameSession.getInstance().isRift()
      App.setCallbackWhenCancel(App.showRiftProgress.bind(App,userGameModel,rewardModels))
    else
      App.addNextScreenCallbackToVictoryFlow(rewardModels)

  else
    # local games
    if SDK.GameSession.getInstance().isChallenge()

      # for challenges
      App.addNextScreenCallbackToVictoryFlow(rewardModels)
      userGameModel ?= new Backbone.Model({})


  return Promise.all([
    Scene.getInstance().showOverlay(new VictoryLayer())
    NavigationManager.getInstance().showContentView(new VictoryItemView({model:userGameModel || new Backbone.Model({})}))
  ])

###*
# Shows the next screen in the victory order: rank, quests, rewards etc.
# @public
# @param  {Backbone.Model}  userGameModel   Game model that is finished loading / processing all jobs.
# @param  {Array}        rewardModels   Rewards that this game needs to show.
###
App.addNextScreenCallbackToVictoryFlow = (rewardModels) ->
  Logger.module("APPLICATION").log "App:addNextScreenCallbackToVictoryFlow"

  # # if we have any faction progression rewards, show those first
  # if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "faction xp" and rewardModel.get('is_unread'))
  #   return App.setCallbackWhenCancel(App.showFactionXpReward.bind(App,rewardModels))

  # if we have any quest rewards, show those next
  if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "quest" and rewardModel.get('is_unread'))
    return App.setCallbackWhenCancel(App.showQuestsCompleted.bind(App,rewardModels))

  # if we have any progression rewards, show those next
  if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "progression" and rewardModel.get('is_unread'))
    return App.setCallbackWhenCancel(App.showWinCounterReward.bind(App,rewardModels))

  # ...
  if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "challenge" and rewardModel.get('is_unread'))
    return App.setCallbackWhenCancel(App.showTutorialRewards.bind(App,rewardModels))

  # ...
  if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "daily challenge" and rewardModel.get('is_unread'))
    return App.setCallbackWhenCancel(App.showTutorialRewards.bind(App,rewardModels))

  # if we have any ribbon rewards, show those next
  if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "ribbon" and rewardModel.get('is_unread'))
    return App.setCallbackWhenCancel(App.showNextRibbonReward.bind(App,rewardModels))

  # # if we have any gift crate rewards, show those next
  # if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_type') == "gift crate" and rewardModel.get('is_unread'))
  #   return App.setCallbackWhenCancel(App.showGiftCrateReward.bind(App,rewardModels))

  # if we have any cosmetic loot crate rewards, show those next
  if _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "loot crate" and rewardModel.get('is_unread'))
    return App.setCallbackWhenCancel(App.showLootCrateReward.bind(App,rewardModels))

  # if we have any faction unlocks, show those next
  factionUnlockedReward = _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "faction unlock" and rewardModel.get('is_unread'))
  if factionUnlockedReward
    return App.setCallbackWhenCancel(App.showUnlockedFaction.bind(App,factionUnlockedReward.get('unlocked_faction_id')))

  # if we are doing a tutorial, kick us back to the tutorial screen, unless it's the last lesson: LessonFour, in which case, move along with normal flow (kicks to main menu)
  if SDK.GameSession.getInstance().getChallenge()?.categoryType == SDK.ChallengeCategory.tutorial.type
    # for tutorial go show tutorial layout
    if SDK.GameSession.getInstance().getChallenge().type != "LessonFour"
      return App.setCallbackWhenCancel(App._showTutorialLessons.bind(App,SDK.GameSession.getInstance().getChallenge()))

###*
# Show unlocked faction screen.
# @public
# @param  {String|Number}  factionId
# @returns {Promise}
###
App.showUnlockedFaction = (factionId) ->
  Logger.module("APPLICATION").log("App:showUnlockedFaction", factionId)
  unlockFactionLayer = new UnlockFactionLayer(factionId)
  return Promise.all([
    NavigationManager.getInstance().destroyContentView(),
    NavigationManager.getInstance().destroyDialogView(),
    Scene.getInstance().showOverlay(unlockFactionLayer)
  ])
  .then () ->
    if Scene.getInstance().getOverlay() == unlockFactionLayer
      unlockFactionLayer.animateReward()
  .catch (error) ->
    App._error(error)

###*
# Show ribbon reward screen if there are any unread ribbon reward models.
# @public
# @param  {Array}  rewardModels  the reward models array.
###
App.showNextRibbonReward = (rewardModels) ->

  Logger.module("APPLICATION").log "App:showNextRibbonReward"

  nextReward = _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "ribbon" and rewardModel.get('is_unread'))
  nextReward.set('is_unread',false)
  ribbonId = nextReward.get("ribbons")?[0]

  if ribbonId?

    ribbonObject = SDK.RibbonFactory.ribbonForIdentifier(ribbonId)

    # clear ui
    NavigationManager.getInstance().destroyContentView()
    NavigationManager.getInstance().destroyDialogView()

    # show the in-engine card reward animation
    progressionRewardLayer = new ProgressionRewardLayer()
    Scene.getInstance().showOverlay(progressionRewardLayer)
    progressionRewardLayer.showRewardRibbons([ribbonId], "You've earned the #{ribbonObject.title} ribbon.", "Ribbons show on your profile for performing in battle with distinction.")

  else

    Logger.module("APPLICATION").log "ERROR: ribbonId is undefined for reward #{nextReward.get("id")}"

###*
# Show progression reward screen.
# @public
# @param  {Backbone.Model}  rewardModel progression reward model.
###
App.showProgressReward = (rewardModel) ->

  Logger.module("APPLICATION").log "App:showProgressReward"

  # clear ui
  NavigationManager.getInstance().destroyContentView()
  NavigationManager.getInstance().destroyDialogView()

  # show the in-engine card reward animation
  if rewardModel.get("cards")
    # cards
    cardIds = rewardModel.get("cards")
    if rewardModel.get("_showStack")
      cardIds = [cardIds[0]]
    progressionRewardLayer = new ProgressionRewardLayer()
    Scene.getInstance().showOverlay(progressionRewardLayer)
    progressionRewardLayer.showRewardCards(cardIds, rewardModel.get("_showStack"), rewardModel.get("_title"), rewardModel.get("_subTitle"))
  else if rewardModel.get("cosmetics")
    # NOTE: only emotes and battle maps will work for this case
    progressionRewardLayer = new ProgressionRewardLayer()
    Scene.getInstance().showOverlay(progressionRewardLayer)
    if SDK.CosmeticsFactory.cosmeticForIdentifier(rewardModel.get("cosmetics")[0]).typeId == SDK.CosmeticsTypeLookup.BattleMap
      progressionRewardLayer.showRewardBattleMaps(rewardModel.get("cosmetics"), rewardModel.get("_title"), rewardModel.get("_subTitle"))
    else
      progressionRewardLayer.showRewardEmotes(rewardModel.get("cosmetics"), rewardModel.get("_title"), rewardModel.get("_subTitle"))
  else if rewardModel.get("gift_chests")
    CrateManager.getInstance().refreshGiftCrates()
    rewardLayer = new LootCrateRewardLayer()
    Scene.getInstance().showOverlay(rewardLayer)
    rewardLayer.animateReward(rewardModel.get("gift_chests"),rewardModel.get("_title"),rewardModel.get("_subTitle"))
  else if rewardModel.get("cosmetic_keys")
    # cosmetic keys
    cosmeticKeyRewardLayer = new LootCrateRewardLayer()
    Scene.getInstance().showOverlay(cosmeticKeyRewardLayer)
    cosmeticKeyRewardLayer.animateReward(rewardModel.get("cosmetic_keys"), rewardModel.get("_title"), rewardModel.get("_subTitle"))
  else if rewardModel.get("ribbons")
    # ribbons
    progressionRewardLayer = new ProgressionRewardLayer()
    Scene.getInstance().showOverlay(progressionRewardLayer)
    progressionRewardLayer.showRewardRibbons(rewardModel.get("ribbons"), rewardModel.get("_title"), rewardModel.get("_subTitle"))
  else if rewardModel.get("spirit")
    # spirit
    currencyRewardLayer = new CurrencyRewardLayer()
    Scene.getInstance().showOverlay(currencyRewardLayer)
    currencyRewardLayer.animateReward("spirit", rewardModel.get("spirit"), rewardModel.get("_title"), rewardModel.get("_subTitle"))
  else if rewardModel.get("gold")
    # gold
    currencyRewardLayer = new CurrencyRewardLayer()
    Scene.getInstance().showOverlay(currencyRewardLayer)
    currencyRewardLayer.animateReward("gold", rewardModel.get("gold"), rewardModel.get("_title"), rewardModel.get("_subTitle"))
  else if rewardModel.get("spirit_orbs")
    # booster
    boosterRewardLayer = new BoosterRewardLayer()
    Scene.getInstance().showOverlay(boosterRewardLayer)
    boosterRewardLayer.animateReward(rewardModel.get("_title"), rewardModel.get("_subTitle"), rewardModel.get("spirit_orbs"))
  else if rewardModel.get("gauntlet_tickets")
    # gauntlet ticket
    gauntletTicketRewardLayer = new GauntletTicketRewardLayer()
    Scene.getInstance().showOverlay(gauntletTicketRewardLayer)
    gauntletTicketRewardLayer.animateReward(rewardModel.get("_title"), rewardModel.get("_subTitle"))
  else
    Logger.module("APPLICATION").log("Application->showProgressReward: Attempt to show reward model without valid reward")

###*
# Show achievement reward screen if there are any unread ones.
# @public
###
App.showAchievementCompletions = () ->
  if !AchievementsManager.getInstance().hasUnreadCompletedAchievements()
    Scene.getInstance().destroyOverlay()
    return Promise.resolve()
  else
    return new Promise( (resolve, reject) ->
      locResolve = resolve
      Logger.module("APPLICATION").log "App:showAchievementCompletions"
      completedAchievementModel = AchievementsManager.getInstance().popNextUnreadAchievementModel()

      App.setCallbackWhenCancel(locResolve)

      # show reward
      App.showProgressReward(completedAchievementModel)
    ).then () ->
      return App.showAchievementCompletions()

###*
# Show twitch reward screen if there are any unread ones.
# @public
###
App.showTwitchRewards = () ->
  if !TwitchManager.getInstance().hasUnclaimedTwitchRewards()
    Scene.getInstance().destroyOverlay()
    return Promise.resolve()
  else
    return new Promise( (resolve, reject) ->
      locResolve = resolve
      Logger.module("APPLICATION").log "App:showTwitchRewards"
      twitchRewardModel = TwitchManager.getInstance().popNextUnclaimedTwitchRewardModel()

      App.setCallbackWhenCancel(locResolve)

      # show reward
      App.showProgressReward(twitchRewardModel)
    ).then () ->
      return App.showTwitchRewards()

###*
# Show season rewards screen if the player has an unread season rewards set.
# @public
###
App.showEndOfSeasonRewards = () ->
  gamesManager = GamesManager.getInstance()
  if gamesManager.hasUnreadSeasonReward()
    return new Promise( (resolve, reject) ->
      locResolve = resolve

      # get data
      seasonModel = gamesManager.getSeasonsWithUnclaimedRewards()[0]

      bonusChevrons = SDK.RankFactory.chevronsRewardedForReachingRank(seasonModel.get("top_rank")? || 30)
      seasonRewardIds = seasonModel.get("reward_ids")

      if bonusChevrons == 0
        # If there is no rewards we exit here
        locResolve()
      else
        Logger.module("APPLICATION").log "App:showEndOfSeasonRewards"

        endOfSeasonLayer = new EndOfSeasonLayer(seasonModel)
        return Promise.all([
          NavigationManager.getInstance().destroyContentView(),
          NavigationManager.getInstance().destroyDialogView(),
          Scene.getInstance().showOverlay(endOfSeasonLayer)
        ])
        .then () ->
          App.setCallbackWhenCancel(() ->
            Scene.getInstance().destroyOverlay()
            locResolve()
          )

          if Scene.getInstance().getOverlay() == endOfSeasonLayer
            return endOfSeasonLayer.animateReward()
        .catch (error) ->
          Logger.module("APPLICATION").log("App.showEndOfSeasonRewards error: ", error)

          locResolve()
    )
  else
    return Promise.resolve()


App.showTutorialRewards = (rewardModels) ->

  Logger.module("APPLICATION").log "App:showTutorialRewards"

  nextReward = _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "challenge" and rewardModel.get('is_unread'))
  nextReward = nextReward || _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "daily challenge" and rewardModel.get('is_unread'))
  nextReward.set("is_unread",false)

  App.addNextScreenCallbackToVictoryFlow(rewardModels)

  # show reward
  if (nextReward.get("unlocked_faction_id"))
    App.showUnlockedFaction(nextReward.get("unlocked_faction_id"))
  else
    App.showProgressReward(nextReward)


App.showLadderProgress = (userGameModel,rewardModels) ->
  Logger.module("APPLICATION").log "App:showLadderProgress"

  # set the cancel callback to show the next screen
  App.addNextScreenCallbackToVictoryFlow(rewardModels)

  ladderProgressLayer = new LadderProgressLayer()
  return Promise.all([
    NavigationManager.getInstance().destroyContentView(),
    NavigationManager.getInstance().destroyDialogView(),
    Scene.getInstance().showOverlay(ladderProgressLayer)
  ])
  .then () ->
    if Scene.getInstance().getOverlay() == ladderProgressLayer
      return ladderProgressLayer.showLadderProgress(userGameModel)
  .catch (error) ->
    App._error("App.showLadderProgress error: ", error)

App.showRiftProgress = (userGameModel,rewardModels) ->
  Logger.module("APPLICATION").log "App:showRiftProgress"

  # set the cancel callback to show the next screen
  App.addNextScreenCallbackToVictoryFlow(rewardModels)

  riftProgressLayer = new RiftProgressLayer()
  return Promise.all([
    NavigationManager.getInstance().destroyContentView(),
    NavigationManager.getInstance().destroyDialogView(),
    Scene.getInstance().showOverlay(riftProgressLayer)
  ])
  .then () ->
    if Scene.getInstance().getOverlay() == riftProgressLayer
      return riftProgressLayer.showRiftProgress(userGameModel)
  .catch (error) ->
    App._error("App.showRiftProgress error: ", error)


App.showQuestsCompleted = (rewardModels) ->

  Logger.module("APPLICATION").log "App:showQuestsCompleted"

  nextQuestReward = _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "quest" and rewardModel.get('is_unread'))
  nextQuestReward.set('is_unread',false)
  sdkQuest = SDK.QuestFactory.questForIdentifier(nextQuestReward.get('quest_type_id'))
  questName = sdkQuest.getName()

  gold = nextQuestReward.get("gold")
  spiritOrbs = nextQuestReward.get("spirit_orbs")
  giftChests = null
  cosmeticKeys = null

  if sdkQuest.giftChests?.length > 0
    giftChests = sdkQuest.giftChests

  if sdkQuest.cosmeticKeys?.length > 0
    cosmeticKeys = sdkQuest.cosmeticKeys

  # track an event in analytics
  Analytics.track("quest complete", {
    category: Analytics.EventCategory.Quest,
    quest_type_id: nextQuestReward.get('quest_type_id'),
    gold_amount:nextQuestReward.get("gold") || 0
  },{
    labelKey:"quest_type_id"
    valueKey:"gold_amount"
    nonInteraction:1
  })

  # set the cancel callback to show the next screen
  App.addNextScreenCallbackToVictoryFlow(rewardModels)

  # show quest reward
  NavigationManager.getInstance().destroyContentView()
  if gold
    currencyRewardLayer = new CurrencyRewardLayer()
    Scene.getInstance().showOverlay(currencyRewardLayer)
    currencyRewardLayer.animateReward(
      "gold",
      gold,
      i18next.t("rewards.quest_complete_title",{quest_name:questName})
      "+#{gold} GOLD for completing #{questName}",
      "Quest Complete"
    )
  else if spiritOrbs
    # booster
    boosterRewardLayer = new BoosterRewardLayer()
    Scene.getInstance().showOverlay(boosterRewardLayer)
    boosterRewardLayer.animateReward(
      i18next.t("rewards.quest_complete_title",{quest_name:questName})
      "+#{spiritOrbs} SPIRIT ORBS for completing #{questName}"
    )
  else if giftChests
    Analytics.track("earned gift crate", {
      category: Analytics.EventCategory.Crate,
      product_id: giftChests[0]
    }, {
      labelKey: "product_id"
    })
    # show reward setup on the engine side
    NavigationManager.getInstance().destroyContentView()
    rewardLayer = new LootCrateRewardLayer()
    Scene.getInstance().showOverlay(rewardLayer)
    rewardLayer.animateReward(giftChests, null, i18next.t("rewards.quest_reward_gift_crate_title",{quest_name:questName}))
    CrateManager.getInstance().refreshGiftCrates()
  else if cosmeticKeys
    Analytics.track("earned cosmetic key", {
      category: Analytics.EventCategory.Crate,
      product_id: cosmeticKeys[0]
    }, {
      labelKey: "product_id"
    })
    NavigationManager.getInstance().destroyContentView()
    rewardLayer = new CosmeticKeyRewardLayer()
    Scene.getInstance().showOverlay(rewardLayer)
    rewardLayer.showRewardKeys(cosmeticKeys, null, "FREE Cosmetic Crate Key for completing the #{questName} quest")
    CrateManager.getInstance().refreshGiftCrates()


# Outdated name, really shows all progression rewards
App.showWinCounterReward = (rewardModels) ->

  Logger.module("APPLICATION").log "App:showWinCounterReward"

  nextReward = _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "progression" and rewardModel.get('is_unread'))
  nextReward.set("is_unread",false)

  App.addNextScreenCallbackToVictoryFlow(rewardModels)

  # show reward setup on the engine side
  NavigationManager.getInstance().destroyContentView()
#    Scene.getInstance().showOverlay(currencyRewardLayer) # TODO: merge How does this even work?

  rewardView = null

  switch nextReward.get("reward_type")
    when "win count"
      currencyRewardLayer = new CurrencyRewardLayer()
      Scene.getInstance().showOverlay(currencyRewardLayer)
      goldAmount = nextReward.get("gold")
      message = i18next.t("rewards.3_win_gold_reward_message",{gold_amount:goldAmount})
      currencyRewardLayer.animateReward(
        "gold",
        goldAmount,
        i18next.t("rewards.3_win_gold_reward_title"),
        message
      )
    when "play count"
      currencyRewardLayer = new CurrencyRewardLayer()
      Scene.getInstance().showOverlay(currencyRewardLayer)
      goldAmount = nextReward.get("gold")
      currencyRewardLayer.animateReward(
        "gold",
        goldAmount,
        i18next.t("rewards.4_play_gold_reward_title"),
        i18next.t("rewards.4_play_gold_reward_message",{gold_amount:goldAmount})
      )
    when "daily win"
      currencyRewardLayer = new CurrencyRewardLayer()
      Scene.getInstance().showOverlay(currencyRewardLayer)
      goldAmount = nextReward.get("gold")
      currencyRewardLayer.animateReward(
        "gold",
        goldAmount,
        i18next.t("rewards.first_win_of_the_day_reward_title"),
        i18next.t("rewards.first_win_of_the_day_reward_message",{gold_amount:goldAmount})
      )
    when "first 3 games"
      currencyRewardLayer = new CurrencyRewardLayer()
      Scene.getInstance().showOverlay(currencyRewardLayer)
      goldAmount = nextReward.get("gold")
      currencyRewardLayer.animateReward(
        "gold",
        goldAmount,
        i18next.t("rewards.first_3_games_reward_title"),
        i18next.t("rewards.first_3_games_reward_message",{gold_amount:goldAmount})
      )
    when "first 10 games"
      currencyRewardLayer = new CurrencyRewardLayer()
      Scene.getInstance().showOverlay(currencyRewardLayer)
      goldAmount = nextReward.get("gold")
      currencyRewardLayer.animateReward(
        "gold",
        goldAmount,
        i18next.t("rewards.first_10_games_reward_title"),
        i18next.t("rewards.first_10_games_reward_message",{gold_amount:goldAmount})
      )
    when "boss battle"
      boosterRewardLayer = new BoosterRewardLayer()
      Scene.getInstance().showOverlay(boosterRewardLayer)
      cardSetId = nextReward.get("spirit_orbs")
      boosterRewardLayer.animateReward(
        i18next.t("rewards.boss_defeated_reward_title"),
        i18next.t("rewards.boss_defeated_reward_message"),
        SDK.CardSet.Core
      )

App.showLootCrateReward = (rewardModels)->
  Logger.module("APPLICATION").log "App:showLootCrateReward"

  nextReward = _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "loot crate" and rewardModel.get('is_unread'))
  nextReward.set("is_unread",false)

  Analytics.track("earned cosmetic crate", {
    category: Analytics.EventCategory.Crate,
    product_id: nextReward.get("cosmetic_chests")?[0]
  }, {
    labelKey: "product_id"
  })

  App.addNextScreenCallbackToVictoryFlow(rewardModels)

  # show reward setup on the engine side
  NavigationManager.getInstance().destroyContentView()
  rewardLayer = new LootCrateRewardLayer()
  Scene.getInstance().showOverlay(rewardLayer)
  rewardLayer.animateReward(nextReward.get("cosmetic_chests"))

# App.showGiftCrateReward = (rewardModels)->
#   Logger.module("APPLICATION").log "App:showGiftCrateReward"
#
#   nextReward = _.find(rewardModels, (rewardModel)-> rewardModel.get('reward_type') == "gift crate" and rewardModel.get('is_unread'))
#   nextReward.set("is_unread",false)
#
#   Analytics.track("earned gift crate", {
#     category: Analytics.EventCategory.Crate,
#     product_id: nextReward.get("gift_crates")?[0]
#   }, {
#     labelKey: "product_id"
#   })
#
#   App.addNextScreenCallbackToVictoryFlow(rewardModels)
#
#   # show reward setup on the engine side
#   NavigationManager.getInstance().destroyContentView()
#   rewardLayer = new LootCrateRewardLayer()
#   Scene.getInstance().showOverlay(rewardLayer)
#   rewardLayer.animateReward(nextReward.get("gift_crates"))

App.showFactionXpReward = (userGameModel,rewardModels) ->

  Logger.module("APPLICATION").log "App:showFactionXpReward"

  nextUnreadReward = _.find rewardModels, (rewardModel)-> rewardModel.get('reward_category') == "faction xp" and rewardModel.get('is_unread')

  nextUnreadReward.set("is_unread",false)

  factionId = userGameModel.get("faction_id")
  factionName = SDK.FactionFactory.factionForIdentifier(factionId).name
  faction_xp = userGameModel.get('faction_xp')
  faction_xp_earned = userGameModel.get('faction_xp_earned')
  level = SDK.FactionProgression.levelForXP(faction_xp + faction_xp_earned) + 1

  # set title
  nextUnreadReward.set("_title", i18next.t("rewards.level_up_reward_title",{ level:level }))

  # set reward model properties by reward
  if nextUnreadReward.get("cards")
    # cards
    factionCards = GameDataManager.getInstance().visibleCardsCollection.filter (c)-> c.get("factionId") == factionId and c.get("rarityId") == SDK.Rarity.Fixed
    availableFactionCards = _.filter(factionCards, (c)->
      return c.get("inventoryCount") > 0
    )
    subtitle = i18next.t("rewards.card_reward_subtitle",{
      card_count: availableFactionCards.length,
      total: factionCards.length,
      factionName: factionName
    })
    nextUnreadReward.set("_subTitle", subtitle)
    nextUnreadReward.set("_showStack",true)

  else if nextUnreadReward.get("spirit")
    # sprit
    nextUnreadReward.set("_subTitle", i18next.t("rewards.spirit_for_faction_lvl_reward_message",{spirit:nextUnreadReward.get("spirit"),faction_name:factionName,level:level}))
  else if nextUnreadReward.get("gold")
    # gold
    nextUnreadReward.set("_subTitle", i18next.t("rewards.gold_for_faction_lvl_reward_message",{gold:nextUnreadReward.get("spirit"),faction_name:factionName,level:level}))
  else if nextUnreadReward.get("spirit_orbs")
    # booster
    nextUnreadReward.set("_subTitle", i18next.t("rewards.orb_for_faction_lvl_reward_message",{faction_name:factionName,level:level}))

  # setup next screen
  if SDK.GameSession.current().isRanked()
    App.setCallbackWhenCancel(App.showLadderProgress.bind(App,userGameModel,rewardModels))
  else if SDK.GameSession.current().isRift()
    App.setCallbackWhenCancel(App.showRiftProgress.bind(App,userGameModel,rewardModels))
  else
    App.addNextScreenCallbackToVictoryFlow(rewardModels)

  # show reward
  App.showProgressReward(nextUnreadReward)

App.showNewBeginnerQuests = (beginnerQuestsCollection) ->

  NavigationManager.getInstance().toggleModalViewByClass(QuestLogLayout,{
    collection:beginnerQuestsCollection,
    showConfirm:true
  })

App.showFreeCardOfTheDayReward = (opts)->
  Promise.all([
    NavigationManager.getInstance().destroyModalView(),
    NavigationManager.getInstance().destroyContentView(),
    NavigationManager.getInstance().destroyUtilityView()
  ]).then ()=>
    rewardLayer = new FreeCardOfTheDayLayer()
    Scene.getInstance().showOverlay(rewardLayer)
    rewardLayer.showCoreGem(opts.cardId)
    App.setCallbackWhenCancel ()->
      Scene.getInstance().destroyOverlay()
      App._showMainMenu().then ()->
        NavigationManager.getInstance().toggleModalViewByClass(QuestLogLayout,{
          collection:QuestsManager.getInstance().getQuestCollection(),
          model:ProgressionManager.getInstance().gameCounterModel
        })
        return Promise.resolve()

#
# ---- User Triggered Navigation ---- #
#

App.onUserTriggeredExit = () ->
  Logger.module("APPLICATION").log "App:onUserTriggeredExit"
  return App.main()

App.onUserTriggeredSkip = () ->
  Logger.module("APPLICATION").log "App:onUserTriggeredSkip"
  gameSession = SDK.GameSession.getInstance()
  scene = Scene.getInstance()
  gameLayer = scene and scene.getGameLayer()
  if gameLayer? and gameLayer.getIsGameActive()
    # when in an active game
    if gameSession.getIsMyFollowupActiveAndCancellable()
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY)
      gameSession.submitExplicitAction(gameSession.getMyPlayer().actionEndFollowup())
    else if gameLayer.getIsShowingActionCardSequence()
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY)
      # stop showing played card
      gameLayer.skipShowActionCardSequence()

  return Promise.resolve()

App.onUserTriggeredCancel = () ->
  Logger.module("APPLICATION").log "App:onUserTriggeredCancel"
  cancelPromises = []

  if NavigationManager.getInstance().getIsShowingModalView()
    # close modal screens
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY)
    cancelPromises.push(NavigationManager.getInstance().destroyModalView())
  else if NavigationManager.getInstance().getHasLastRoute()
    # go to last route (handles own sfx)
    NavigationManager.getInstance().showLastRoute()
  else
    gameSession = SDK.GameSession.getInstance()
    scene = Scene.getInstance()
    gameLayer = scene and scene.getGameLayer()

    if gameLayer? and !gameLayer.getIsDisabled() and NavigationManager.getInstance().getIsShowingContentViewClass(GameLayout)
      # when in game that is not over
      if gameSession.getIsMyFollowupActiveAndCancellable()
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY)
        gameSession.submitExplicitAction(gameSession.actionRollbackSnapshot())
      else
        if !gameLayer.getMyPlayer().getIsTakingSelectionAction() and !gameLayer.getIsShowingActionCardSequence()
          # show esc game menu if we are not selecting something in game and not showing an action sequence
          cancelPromises.push(NavigationManager.getInstance().showModalView(new EscGameMenuItemView()))

        # always reset game active state
        gameLayer.resetActiveState()
    else
      callback = App.getCallbackWhenCancel()
      if callback?
        App.setCallbackWhenCancel(null)
        callbackResult = callback()
        if callbackResult instanceof Promise
          cancelPromises.push(callbackResult)
      else if (App.getIsLoggedIn() or window.isDesktop) and (NavigationManager.getInstance().getIsShowingContentViewClass(LoaderItemView) or NavigationManager.getInstance().getIsShowingContentViewClass(LoginMenuItemView) or NavigationManager.getInstance().getIsShowingContentViewClass(MainMenuItemView) or NavigationManager.getInstance().getIsShowingContentViewClass(TutorialLessonsLayout))
        # show esc main menu when on loading or login or main
        cancelPromises.push(NavigationManager.getInstance().showModalView(new EscMainMenuItemView()))
      else if (!gameLayer? or gameLayer.getIsDisabled()) and !App.getIsShowingMain()
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY)
        # for now just go back to main until we implement routing
        cancelPromises.push(App.main())

  return Promise.all(cancelPromises)

App.setCallbackWhenCancel = (callback) ->
  # this is a less than ideal method of setting the next step in cancel sequence
  App._callbackWhenCancel = callback

App.getCallbackWhenCancel = () ->
  return App._callbackWhenCancel

App.onUserTriggeredConfirm = () ->
  Logger.module("APPLICATION").log "App:onUserTriggeredConfirm"

#
# ---- Events: Client ---- #
#

App.beforeunload = (e) ->
  # return an empty string to trigger alert
  if App._reloadRequestIds.length == 0 and !window.isDesktop and !UtilsEnv.getIsInLocal()
    confirmMessage = ""
    (e || window.event).returnValue = confirmMessage
    return confirmMessage

App.unload = () ->
  # reset the global event bus so no more events will be handled
  EventBus.reset()

  # cancel any ongoing matchmaking
  GamesManager.getInstance().cancelMatchmaking()

App.bindEvents = () ->
  # attach event listeners to document/window
  $(window).on('unload', App.unload.bind(App))
  $(window).on('mousemove',App.onPointerMove.bind(App))
  $(window).on('mousedown',App.onPointerDown.bind(App))
  $(window).on('mouseup',App.onPointerUp.bind(App))
  $(window).on('wheel',App.onPointerWheel.bind(App))
  $(window).on("resize", _.debounce(App.onResize.bind(App), 250))
  EventBus.getInstance().on(EVENTS.request_resize, _.debounce(App.onResize.bind(App), 250))
  $(document).on("visibilitychange",App.onVisibilityChange.bind(App))
  EventBus.getInstance().on(EVENTS.request_reload, App.onRequestReload)
  EventBus.getInstance().on(EVENTS.cancel_reload_request, App.onCancelReloadRequest)
  $(CONFIG.GAMECANVAS_SELECTOR).on("webglcontextlost", () ->
    App.onRequestReload({
      id: "webgl_context_lost",
      message: "Your graphics hit a snag and requires a #{if window.isDesktop then "restart" else "reload"} to avoid any issues."
    })
  )

  # session is a plain event emitter
  Session.on('login', App.onLogin)
  Session.on('logout', App.onLogout)
  Session.on('error', App.onSessionError)

  EventBus.getInstance().on(EVENTS.show_login, App._showLoginMenu, App)
  EventBus.getInstance().on(EVENTS.show_terms, App._showTerms, App)

  EventBus.getInstance().on(EVENTS.show_play, App.showPlay, App)
  EventBus.getInstance().on(EVENTS.show_watch, App.showWatch, App)
  EventBus.getInstance().on(EVENTS.show_shop, App.showShop, App)
  EventBus.getInstance().on(EVENTS.show_collection, App.showCollection, App)
  EventBus.getInstance().on(EVENTS.show_codex, App.showCodex, App)
  EventBus.getInstance().on(EVENTS.show_booster_pack_unlock, App.showBoosterPackUnlock, App)
  EventBus.getInstance().on(EVENTS.show_crate_inventory, App.showCrateInventory, App)
  EventBus.getInstance().on(EVENTS.start_challenge, App._startGameWithChallenge, App)
  EventBus.getInstance().on(EVENTS.start_single_player, App._startSinglePlayerGame, App)
  EventBus.getInstance().on(EVENTS.start_boss_battle, App._startBossBattleGame, App)
  EventBus.getInstance().on(EVENTS.start_replay, App._startGameForReplay, App)
  EventBus.getInstance().on(EVENTS.show_free_card_of_the_day, App.showFreeCardOfTheDayReward, App)
  EventBus.getInstance().on(EVENTS.discord_spectate, App.onDiscordSpectate, App)

  GamesManager.getInstance().on(EVENTS.matchmaking_start, App._matchmakingStart, App)
  GamesManager.getInstance().on(EVENTS.matchmaking_cancel, App._matchmakingCancel, App)
  GamesManager.getInstance().on(EVENTS.matchmaking_error, App._matchmakingError, App)
  GamesManager.getInstance().on(EVENTS.finding_game, App._findingGame, App)
  GamesManager.getInstance().on(EVENTS.invite_accepted, App._inviteAccepted, App)
  GamesManager.getInstance().on(EVENTS.invite_rejected, App._inviteRejected, App)
  GamesManager.getInstance().on(EVENTS.invite_cancelled, App._inviteCancelled, App)
  GamesManager.getInstance().on(EVENTS.start_spectate, App._spectateGame, App)

  EventBus.getInstance().on EVENTS.canvas_mouse_state, App.onCanvasMouseState, App

  NavigationManager.getInstance().on(EVENTS.user_triggered_exit, App.onUserTriggeredExit, App)
  NavigationManager.getInstance().on(EVENTS.user_triggered_skip, App.onUserTriggeredSkip, App)
  NavigationManager.getInstance().on(EVENTS.user_triggered_cancel, App.onUserTriggeredCancel, App)
  NavigationManager.getInstance().on(EVENTS.user_triggered_confirm, App.onUserTriggeredConfirm, App)

  EventBus.getInstance().on EVENTS.error, App._error, App
  EventBus.getInstance().on EVENTS.ajax_error, App._error, App

App._subscribeToGameLocalEvents = () ->
  Logger.module("APPLICATION").log "App._subscribeToGameLocalEvents"
  scene = Scene.getInstance()
  gameLayer = scene?.getGameLayer()
  if gameLayer?
    gameLayer.getEventBus().on(EVENTS.after_show_end_turn, App.onAfterShowEndTurn, App)
    gameLayer.getEventBus().on(EVENTS.show_game_over, App.onShowGameOver, App)
    gameLayer.getEventBus().on(EVENTS.canvas_mouse_state, App.onCanvasMouseState, App)

  SDK.GameSession.getInstance().getEventBus().on(EVENTS.game_over, App._onGameOver, App)
  SDK.GameSession.getInstance().getEventBus().on(EVENTS.end_turn, App._onEndTurn, App)

App._unsubscribeFromGameLocalEvents = () ->
  Logger.module("APPLICATION").log "App._unsubscribeFromGameLocalEvents"
  scene = Scene.getInstance()
  gameLayer = scene?.getGameLayer()
  if gameLayer?
    gameLayer.getEventBus().off(EVENTS.after_show_end_turn, App.onAfterShowEndTurn, App)
    gameLayer.getEventBus().off(EVENTS.show_game_over, App.onShowGameOver, App)
    gameLayer.getEventBus().off(EVENTS.canvas_mouse_state, App.onCanvasMouseState, App)

  SDK.GameSession.getInstance().getEventBus().off(EVENTS.game_over, App._onGameOver, App)
  SDK.GameSession.getInstance().getEventBus().off(EVENTS.end_turn, App._onEndTurn, App)

App._subscribeToGameNetworkEvents = () ->
  Logger.module("APPLICATION").log "App._subscribeToGameNetworkEvents"
  SDK.NetworkManager.getInstance().getEventBus().on(EVENTS.network_game_event, App._onNetworkGameEvent, App)
  SDK.NetworkManager.getInstance().getEventBus().on(EVENTS.network_game_error, App._onNetworkGameError, App)
  SDK.NetworkManager.getInstance().getEventBus().on(EVENTS.game_server_shutdown, App._onGameServerShutdown, App)
  SDK.NetworkManager.getInstance().getEventBus().on(EVENTS.reconnect_to_game, App._onReconnectToGame, App)
  SDK.NetworkManager.getInstance().getEventBus().on(EVENTS.opponent_connection_status_changed, App._onOpponentConnectionStatusChanged, App)

App._unsubscribeFromGameNetworkEvents = () ->
  Logger.module("APPLICATION").log "App._unsubscribeFromGameNetworkEvents"
  SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.network_game_event, App._onNetworkGameEvent, App)
  SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.network_game_error, App._onNetworkGameError, App)
  SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.game_server_shutdown, App._onGameServerShutdown, App)
  SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.reconnect_to_game, App._onReconnectToGame, App)
  SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.opponent_connection_status_changed, App._onOpponentConnectionStatusChanged, App)

App.onVisibilityChange = () ->
  # TODO: look into why this causes errors
  # Prevent sound effects that have been queued up from blasting all at once when app regains visibility
  if document.hidden
    # Would rather do a resume and start of effects, it doesn't stop them from piling up though
    audio_engine.current().stop_all_effects()
  else
    audio_engine.current().stop_all_effects()

#
# ---- RESIZE ---- #
#

App.onResize = (e) ->
  Logger.module("APPLICATION").log("App.onResize")
  # store current resolution data
  ignoreNextResolutionChange = App._ignoreNextResolutionChange
  App._ignoreNextResolutionChange = false
  if !ignoreNextResolutionChange
    currentResolution = CONFIG.resolution
    confirmResolutionChange = App._lastResolution? and App._lastResolution != currentResolution

  # before resize
  EventBus.getInstance().trigger(EVENTS.before_resize)

  # resize and update scale
  App._resizeAndScale()

  # resize the scene to match app
  Scene.getInstance().resize()

  # resize the UI
  EventBus.getInstance().trigger(EVENTS.resize)

  # after resize
  EventBus.getInstance().trigger(EVENTS.after_resize)

  # force user to restart if resource scale for engine has changed
  # CSS automatically handles resource scale changes
  # TODO: instead of restarting, destroy all current views, show loading screen, reload images at new scale, and return to current route
  App._needsRestart = App._lastResourceScaleEngine? and CONFIG.resourceScaleEngine != App._lastResourceScaleEngine
  if !App._needsRestart
    # cancel forced reload in case user has restored original window size
    App._cancelReloadRequestForResolutionChange()

  if confirmResolutionChange
    # confirm resolution with user after resizing
    App._confirmResolutionChange()
  else if App._needsRestart
    # force reload as user has changed window size
    App._requestReloadForResolutionChange()
  else
    # update resolution values as no confirm or restart needed
    App._updateLastResolutionValues()

  return true

App._resizeAndScale = () ->
  Logger.module("APPLICATION").log("App._resizeAndScale")
  # resize canvas to match app size
  # engine bases its window size on the canvas size
  $html = $("html")
  $canvas = $(CONFIG.GAMECANVAS_SELECTOR)
  width = Math.max(CONFIG.REF_WINDOW_SIZE.width, $html.width())
  height = Math.max(CONFIG.REF_WINDOW_SIZE.height, $html.height())
  $canvas.width(width)
  $canvas.height(height)

  # set global scale
  CONFIG.globalScale = CONFIG.getGlobalScaleForResolution(CONFIG.resolution, width, height)

  # set css scales
  CONFIG.pixelScaleCSS = CONFIG.globalScale * window.devicePixelRatio
  $html.removeClass("resource-scale-" + String(CONFIG.resourceScaleCSS).replace(".", "\."))
  CONFIG.resourceScaleCSS = 1
  for resourceScale in CONFIG.RESOURCE_SCALES
    scaleDiff = Math.abs(CONFIG.pixelScaleCSS - resourceScale)
    currentScaleDiff = Math.abs(CONFIG.pixelScaleCSS - CONFIG.resourceScaleCSS)
    if scaleDiff < currentScaleDiff or (scaleDiff == currentScaleDiff and resourceScale > CONFIG.resourceScaleCSS)
      CONFIG.resourceScaleCSS = resourceScale
  $html.addClass("resource-scale-" + String(CONFIG.resourceScaleCSS).replace(".", "\."))

  # html font size by global scale
  # css layout uses rems, which is based on html font size
  $html.css("font-size", CONFIG.globalScale * 10.0 + "px")

App._lastResolution = null
App._lastResourceScaleEngine = null
App._ignoreNextResolutionChange = false
App._needsRestart = false
App._updateLastResolutionValues = () ->
  App._lastResolution = CONFIG.resolution
  App._lastResourceScaleEngine = CONFIG.resourceScaleEngine

App._confirmResolutionChange = () ->
  Logger.module("APPLICATION").log "App._confirmResolutionChange"
  confirmData = {title: 'Do you wish to keep this viewport setting?'}
  if App._needsRestart
    if window.isDesktop
      confirmData.message = 'Warning: switching from your previous viewport to this viewport will require a restart!'
    else
      confirmData.message = 'Warning: switching from your previous viewport to this viewport will require a reload!'
    if ChatManager.getInstance().getStatusIsInBattle()
      confirmData.message += " You will be able to continue your game, but you may miss your turn!"
  confirmDialogItemView = new ConfirmDialogItemView(confirmData)
  confirmDialogItemView.listenToOnce(confirmDialogItemView, 'confirm', ()->
    # update resolution after confirm
    App._lastResolution = CONFIG.resolution
    if App._needsRestart
      # defer to ensure this occurs after event resolves
      _.defer(App._requestReloadForResolutionChange)
    else
      # update resource scale if no restart needed
      App._lastResourceScaleEngine = CONFIG.resourceScaleEngine
  )
  confirmDialogItemView.listenToOnce(confirmDialogItemView, 'cancel', ()->
    # defer to ensure this occurs after event resolves
    _.defer(() ->
      # reset resolution and don't prompt about changes
      App._ignoreNextResolutionChange = true
      res = App._lastResolution || CONFIG.RESOLUTION_DEFAULT
      CONFIG.resolution = res
      Storage.set("resolution", res)
      App.onResize()
    )
  )

  # show confirm/cancel
  NavigationManager.getInstance().showDialogView(confirmDialogItemView)

App._requestReloadForResolutionChangeId = "resolution_change"
App._requestReloadForResolutionChange = () ->
  App.onRequestReload({
    id: App._requestReloadForResolutionChangeId
    message: "Your viewport change requires a #{if window.isDesktop then "restart" else "reload"} to avoid any issues."
  })

App._cancelReloadRequestForResolutionChange = () ->
  App.onCancelReloadRequest({
    id: App._requestReloadForResolutionChangeId
  })

#
# ---- RELOAD ---- #
#

App._reloadRequestIds = []

###
  * Request a reload, optionally passing in a message and id (to avoid conflicts).
  *###
App.onRequestReload = (event) ->
  requestId = event?.id or 0
  if !_.contains(App._reloadRequestIds, requestId)
    App._reloadRequestIds.push(requestId)
    if App._reloadRequestIds.length == 1
      App._reload(event?.message)

###
  * Cancel a reload request, optionally passing in an id (to avoid conflicts).
  *###
App.onCancelReloadRequest = (event) ->
  requestId = event?.id or 0
  index = _.indexOf(App._reloadRequestIds, requestId)
  if index != -1
    App._reloadRequestIds.splice(index, 1)
    if App._reloadRequestIds.length == 0
      App._cancelReload()

App._reload = (message) ->
  Logger.module("APPLICATION").log "App._reload"
  promptDialogItemView = new PromptDialogItemView({title: "Please #{if window.isDesktop then "restart" else "reload"}!", message: message})
  promptDialogItemView.listenTo(promptDialogItemView, 'cancel', () ->
    if window.isDesktop then window.quitDesktop() else location.reload()
  )
  NavigationManager.getInstance().showDialogView(promptDialogItemView)

App._cancelReload = () ->
  Logger.module("APPLICATION").log "App._cancelReload"
  NavigationManager.getInstance().destroyDialogView()

#
# ---- Initialization Events ---- #
# Sequence of events started with App.start. Can pass options object.
#

# Pre-Start Event
App.on "before:start", (options) ->
  Logger.module("APPLICATION").log "----BEFORE START----"
  App.$el = $("#app")


# Start Event
App.on "start", (options) ->
  Logger.module("APPLICATION").log "----START----"
  # set unload alert
  $(window).on('beforeunload', App.beforeunload.bind(App))

  # set initial selected scene
  selectedScene = parseInt(Storage.get("selectedScene"))
  if moment.utc().isAfter("2016-11-29") and moment.utc().isBefore("2017-01-01")
    selectedScene = SDK.CosmeticsLookup.Scene.Frostfire
  if moment.utc().isAfter("2017-03-14") and moment.utc().isBefore("2017-05-01")
    selectedScene = SDK.CosmeticsLookup.Scene.Vetruvian
  if moment.utc().isAfter("2017-07-01") and moment.utc().isBefore("2017-08-01")
    selectedScene = SDK.CosmeticsLookup.Scene.Shimzar
  if moment.utc().isAfter("2017-12-01") and moment.utc().isBefore("2018-01-18")
    selectedScene = SDK.CosmeticsLookup.Scene.Frostfire
  if selectedScene? and !isNaN(selectedScene) and _.isNumber(selectedScene) then CONFIG.selectedScene = selectedScene

  # set initial resolution
  userResolution = parseInt(Storage.get("resolution"))
  if userResolution? and !isNaN(userResolution) and _.isNumber(userResolution) then CONFIG.resolution = userResolution
  userHiDPIEnabled = Storage.get("hiDPIEnabled")
  if userHiDPIEnabled?
    if userHiDPIEnabled == "true" then CONFIG.hiDPIEnabled = true
    else if userHiDPIEnabled == "false" then CONFIG.hiDPIEnabled = false

  # update last resolution values to initial
  App._updateLastResolutionValues()

  # resize once for initial values
  App._resizeAndScale()

  # create a defered promise object for the loading and login process... sort of an anti-pattern but best for this use case
  App.managersReadyDeferred = new Promise.defer()

  # immediately connect the server status manager so we can get notified of any changes during the load process / on the login screen
  ServerStatusManager.getInstance().connect()

  # push a telemetry signal that a client is loading
  TelemetryManager.getInstance().setSignal("lifecycle","loading")
  TelemetryManager.getInstance().setSignal("session","not-logged-in")

  # authenticate defered, the isAuthed check must stay here so we can
  # clear the token in the event it is stale / isAuthed fails
  # the App._authenticationPromise below does not fire if there's no loading
  App._authenticationPromise = () ->
    return Session.isAuthenticated(Storage.get('token'))
      .then (isAuthed) ->
        if !isAuthed
          Storage.remove('token')
        return isAuthed

  # VIEW/engine needs to be setup and cocos manages its own setup so we need to wait async
  Logger.module("APPLICATION").group("LOADING")
  App._loadingPromise = Scene.setup().then(() ->
    # update last resolution values to initial
    App._updateLastResolutionValues()

    # setup all events
    App.bindEvents()

    # load the package of resources that should always loaded
    return PackageManager.getInstance().loadPackage("alwaysloaded")
  ).then(() ->
    # temporary bypass all loader
    return Promise.resolve()

    ###
    # check if all assets should be loaded now or as needed
    # we want to know if the client has cached all resources for this version
    # we only care when not using the desktop client, on the production environment, and not loading all at start
    # if we need to cache all resources for this version, do a non allocating cache load first
    version_preloaded = Storage.get("version_preloaded")
    needs_non_allocating_cache_load = version_preloaded != process.env.VERSION && !window.isDesktop && !CONFIG.LOAD_ALL_AT_START && UtilsEnv.getIsInProduction()
    needs_non_allocating_cache_load = needs_non_allocating_cache_load && !App._queryStringParams['replayId']?
    if needs_non_allocating_cache_load || CONFIG.LOAD_ALL_AT_START
      # temporarily force disable the load all at start flag
      # this allows the preloader to setup as a major package
      # so that it gets loaded correctly before we load all
      load_all_at_start = CONFIG.LOAD_ALL_AT_START
      CONFIG.LOAD_ALL_AT_START = false
      # load preloader scene to show load of all resources
      return PackageManager.getInstance().loadAndActivateMajorPackage("preloader", null, null, () ->
        # reset load all at start flag
        CONFIG.LOAD_ALL_AT_START = load_all_at_start

        # hide loading dialog
        NavigationManager.getInstance().destroyDialogForLoad()

        # show load ui
        viewPromise = Scene.getInstance().showLoad()
        contentPromise = NavigationManager.getInstance().showContentView(new LoaderItemView())

        # once we've authenticated, show utility for loading/login
        # this way users can quit anytime on desktop, and logout or adjust settings while waiting for load
        App._authenticationPromise().then (isAuthed) ->
          if App.getIsLoggedIn() or window.isDesktop
            return NavigationManager.getInstance().showUtilityView(new UtilityLoadingLoginMenuItemView())
          else
            return Promise.resolve()

        return Promise.all([
          viewPromise,
          contentPromise
        ])
      ).then(() ->
        # load all resources
        return PackageManager.getInstance().loadPackage("all", null, ((progress) -> Scene.getInstance().getLoadLayer()?.showLoadProgress(progress)), needs_non_allocating_cache_load)
      ).then(() ->
        # set version assets were preloaded for
        if !window.isDesktop
          Storage.set("version_preloaded", process.env.VERSION)
      )
    else
      # no loading needed now
      return Promise.resolve()
    ###
  ).then(() ->
    # clear telemetry signal that a client is loading
    TelemetryManager.getInstance().clearSignal("lifecycle","loading")

    # end loading log group
    Logger.module("APPLICATION").groupEnd()
  )

  # setup start promise
  App._startPromise = Promise.all([
    App._loadingPromise,
    App._authenticationPromise()
  ])

  # goto main screen
  App.main()

# get minimum browsers from Firebase
App.getMinBrowserVersions = () ->
  if Storage.get("skipBrowserCheck") then return Promise.resolve()
  return new Promise (resolve, reject) ->
    minBrowserVersionRef = new Firebase(process.env.FIREBASE_URL).child("system-status").child('browsers')

    defaults = {
      "Chrome": 50,
      "Safari": 10,
      "Firefox": 57,
      "Edge": 15,
      "Mobile Safari": 10,
    }

    # create a timeout to skip check in case Firebase lags (so atleast user does not get stuck on black screen)
    minBrowserVersionTimeout = setTimeout(() ->
      minBrowserVersionRef.off()
      resolve(defaults)
    , 5000)

    minBrowserVersionRef.once 'value', (snapshot) ->
      clearTimeout(minBrowserVersionTimeout)
      if !snapshot.val()
        resolve(defaults)
      else
        resolve(snapshot.val())

# check if given browser is valid when compared against list of allowed browsers
App.isBrowserValid = (browserName, browserMajor, supportedBrowsers) ->
  if Storage.get("skipBrowserCheck") then return true
  if browserName == 'Electron' then return true

  if Object.keys(supportedBrowsers).includes(browserName)
    return parseInt(browserMajor, 10) >= supportedBrowsers[browserName]
  else
    return false

App.generateBrowserHtml = (browser, version) ->
  if browser == 'Chrome'
    return """
      <p><a href='http://google.com/chrome'><strong>Google Chrome</strong> #{version} or newer.</a></p>
    """
  else if browser == 'Safari'
    return """
      <p><a href='https://www.apple.com/safari/'><strong>Apple Safari</strong> #{version} or newer.</a></p>
    """
  else if browser == 'Firefox'
    return """
      <p><a href='https://www.mozilla.org/firefox/'><strong>Mozilla Firefox</strong> #{version} or newer.</a></p>
    """
  else if browser == 'Edge'
    return """
      <p><a href='https://www.microsoft.com/en-us/windows/microsoft-edge'><strong>Microsoft Edge</strong> #{version} or newer.</a></p>
    """

# show some HTML saying the current browser is not supported if browser detection fails
App.browserTestFailed = (browserName, browserVersion, supportedBrowsers) ->
  html = """
    <div style="margin:auto; position:absolute; height:50%; width:100%; top: 0px; bottom: 0px; font-size: 20px; color: white; text-align: center;">
      <p>Looks like your current browser is not supported.</p>
      <p>Your browser was detected as: #{browserName} version #{browserVersion}.</p>
      <p>Visit <a href='https://support.duelyst.com' style="color: gray;">our support page</a> to submit a request for assistance.</p>
      <br>
  """

  # dynamically create html containing list of support browsers
  Object.keys(supportedBrowsers).forEach (browser) ->
    version = supportedBrowsers[browser]
    html += App.generateBrowserHtml(browser, version)

  html += "</div>"
  $("#app-preloading").css({display:"none"})
  $("#app-content-region").css({margin:"auto", height:"50%", width: "50%"})
  $("#app-content-region").html(html)

# ensure webgl is correctly running
App.glTest = () ->
  try
    canvas = document.createElement('canvas')
    return !! (window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  catch e
    return false

App.glTestFailed = () ->
  if window.isDesktop
    html = """
      <div style="margin:auto; position:absolute; height:50%; width:100%; top: 0px; bottom: 0px; font-size: 20px; color: white; text-align: center;">
        <p>Looks like your video card is not supported.</p>
        <p>Ensure your video card drivers are up to date.</p>
        <p>Visit <a id='support-link' href='https://support.duelyst.com' style="color: gray;">our support page</a> to submit a request for assistance.</p>
      </div>
    """
  else
    html = """
      <div style="margin:auto; position:absolute; height:50%; width:100%; top: 0px; bottom: 0px; font-size: 20px; color: white; text-align: center;">
        <p>Looks like WebGL is not enabled in your browser./p>
        <p>Visit the <a id='webgl-link' href='https://get.webgl.org/' style="color: gray;">WebGL test page</a> for more information.</p>
        <p>Visit <a id='support-link' href='https://support.duelyst.com' style="color: gray;">our support page</a> to submit a request for assistance.</p>
      </div>
    """
  $("#app-preloading").css({display:"none"})
  $("#app-content-region").css({margin:"auto", height:"50%", width: "50%"})
  $("#app-content-region").html(html)
  $("#webgl-link").click (e) ->
    openUrl($(e.currentTarget).attr("href"))
    e.stopPropagation()
    e.preventDefault()
  $("#support-link").click (e) ->
    openUrl($(e.currentTarget).attr("href"))
    e.stopPropagation()
    e.preventDefault()

# show some HTML saying they are on an old client version
App.versionTestFailed = () ->
  if window.isDesktop
    html = """
      <div style="margin:auto; position:absolute; height:50%;  width:100%; top: 0px; bottom: 0px; font-size: 20px; color: white; text-align: center;">
        <p>Looks like you are running an old version of DUELYST.</p>
        <p>Exit and restart DUELYST to update to the latest version.</p>
        <p>Click <a id='reload-link' href='' style="color: gray;">here</a> to exit.</p>
      </div>
    """
  else
    html = """
      <div style="margin:auto; position:absolute; height:50%;  width:100%; top: 0px; bottom: 0px; font-size: 20px; color: white; text-align: center;">
        <p>Looks like you are running an old version of DUELYST.</p>
        <p>Click <a id='reload-link' href='' style="color: gray;">here</a> to refresh your browser to the latest version.</p>
      </div>
    """
  $("#app-preloading").css({display:"none"})
  $("#app-content-region").css({margin:"auto", height:"50%", width: "50%"})
  $("#app-content-region").html(html)
  $("#reload-link").click (e) ->
    if window.isDesktop then window.quitDesktop() else location.reload()

# compare if process.env.VERSION is gte >= than provided minimum version
# if minimumVersion is undefined or null, we set to '0.0.0'
App.isVersionValid = (minimumVersion) ->
  Logger.module("APPLICATION").log "#{process.env.VERSION} >= #{minimumVersion || '0.0.0'}"
  if App._queryStringParams["replayId"]
    return true
  else
    try
      return semver.gte(process.env.VERSION, minimumVersion || '0.0.0')
    catch e
      return true

# App.setup is the main entry function into Marionette app
# grabs configuration from server we're running on and call App.start()
App.setup = () ->
  # mark all requests with buld version
  $.ajaxSetup
    headers:
      "Client-Version": process.env.VERSION

  # check if it is a new user and we should redirect otherwise start as normal
  if Landing.isNewUser() && Landing.shouldRedirect()
    Landing.redirect()
  else
    App.start()

#
# ---- Application Start Sequence ---- #
#
App.getMinBrowserVersions()
.then (supportedBrowsers) ->
  if !App.isBrowserValid(userAgent.browser.name, userAgent.browser.major, supportedBrowsers)
    return App.browserTestFailed(userAgent.browser.name, userAgent.browser.major, supportedBrowsers)

  if !App.glTest()
    return App.glTestFailed()

  App.minVersionRef = new Firebase(process.env.FIREBASE_URL).child("system-status").child('minimum_version')

  # wrap App.setup() in _.once() just to be safe from double calling
  App.setupOnce = _.once(App.setup)

  # create a timeout to skip version check in case Firebase lags (so atleast user does not get stuck on black screen)
  App.versionCheckTimeout = setTimeout(() ->
    App.minVersionRef.off()
    App.setupOnce()
  , 5000)

  # read minimum version from Firebase and perform check, if fails, show error html
  # otherwise start application as normal
  App.minVersionRef.once('value', (snapshot) ->
    clearTimeout(App.versionCheckTimeout)
    if !App.isVersionValid(snapshot.val())
      App.versionTestFailed()
    else
      App.setupOnce()
  )
