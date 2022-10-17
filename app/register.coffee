###
THIS FILE IS FOR BUILDING A STANDALONE REGISTRATION PAGE
IT IS NOT PART OF THE GAME CLIENT
###

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
Storage = window.Storage = require 'app/common/storage'
Logger = window.Logger = require 'app/common/logger'
Logger.enabled = false

Landing = require 'app/common/landing'
Session = window.Session = require 'app/common/session2'
CONFIG = window.CONFIG = require 'app/common/config'
RSX = window.RSX = require 'app/data/resources'
PKGS = window.PKGS = require 'app/data/packages'
EventBus = window.EventBus = require 'app/common/eventbus'
EVENTS = require 'app/common/event_types'
# SDK = window.SDK = require 'app/sdk'
Analytics = window.Analytics = require 'app/common/analytics'
AnalyticsUtil = require 'app/common/analyticsUtil'
UtilsJavascript = require 'app/common/utils/utils_javascript'
UtilsEnv = require 'app/common/utils/utils_env'
UtilsPointer = require 'app/common/utils/utils_pointer'
audio_engine = window.audio_engine = require 'app/audio/audio_engine'
openUrl = require('app/common/openUrl')
i18next = require('i18next')

PackageManager = window.PackageManager = require 'app/ui/managers/package_manager'
NavigationManager = window.NavigationManager = require 'app/ui/managers/navigation_manager'

Helpers = require 'app/ui/views/helpers'
LoaderItemView = require 'app/ui/views/item/loader'

UtilityLoadingLoginMenuItemView = require 'app/ui/views/item/utility_loading_login_menu'
UtilityMainMenuItemView = require 'app/ui/views/item/utility_main_menu'
UtilityMatchmakingMenuItemView = require 'app/ui/views/item/utility_matchmaking_menu'
UtilityGameMenuItemView = require 'app/ui/views/item/utility_game_menu'
EscGameMenuItemView = require 'app/ui/views/item/esc_game_menu'
EscMainMenuItemView = require 'app/ui/views/item/esc_main_menu'

LoginMenuItemView = require 'app/ui/views/item/login_menu'

SelectUsernameItemView = require 'app/ui/views/item/select_username'

Scene = require 'app/view/Scene'
GameLayer = require 'app/view/layers/game/GameLayer'


ConfirmDialogItemView = require 'app/ui/views/item/confirm_dialog'
PromptDialogItemView = require 'app/ui/views/item/prompt_dialog'
ActivityDialogItemView = require 'app/ui/views/item/activity_dialog'
ErrorDialogItemView = require 'app/ui/views/item/error_dialog'
AnnouncementModalView = require 'app/ui/views/item/announcement_modal'


AnalyticsTracker = require 'app/common/analyticsTracker'

# require the Handlebars Template Helpers extension here since it modifies core Marionette code
require 'app/ui/extensions/handlebars_template_helpers'

localStorage.debug = 'session:*'

App._screenBlurId = "AppScreenBlurId"
App._userNavLockId = "AppUserNavLockId"
App._queryStringParams = querystring.parse(location.search) # query string params

App.getIsLoggedIn = ->
  return Storage.get('token')

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
      return App._showLoginMenu()

      # # get and reset last game data
      # lastGameType = CONFIG.lastGameType
      # wasSpectate = CONFIG.lastGameWasSpectate
      # wasTutorial = CONFIG.lastGameWasTutorial
      # wasDeveloper = CONFIG.lastGameWasDeveloper
      # wasDailyChallenge = CONFIG.lastGameWasDailyChallenge
      # CONFIG.resetLastGameData()

      # # destroy game and clear game data
      # App.cleanupGame()

      # # always make sure we're disconnected from the last game
      # SDK.NetworkManager.getInstance().disconnect()

      # # reset routes to main
      # NavigationManager.getInstance().resetRoutes()
      # NavigationManager.getInstance().addMajorRoute("main", App.main, App)

      # # always restore user triggered navigation
      # NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(App._userNavLockId)

      # if App._queryStringParams["replayId"]?
      #   Logger.module("APPLICATION").log("jumping straight into replay...")
      #   App.setCallbackWhenCancel(()-> alert('all done!'))
      #   return PackageManager.getInstance().loadAndActivateMajorPackage("nongame", null, null, () ->
      #     EventBus.getInstance().trigger(EVENTS.start_replay, {
      #       replayId: App._queryStringParams["replayId"]
      #     })
      #     return Promise.resolve()
      #   )
      # else
      #   if !App.getIsLoggedIn()
      #     # kongregate silently logs in so we should never see a login screen
      #     # we instead do nothing, this only occurs if our API fails during silent login
      #     else if window.isKongregate
      #       return Promise.resolve()
      #     else
      #       return App._showLoginMenu()
      #   else
      #     # all good, show main menu
      #     return App.managersReadyDeferred.promise.then(() ->
      #       # set user as loading
      #       ChatManager.getInstance().setStatus(ChatManager.STATUS_LOADING)

      #       # check for an active game
      #       lastGameModel = null
      #       if GamesManager.getInstance().playerGames.length > 0
      #         lastGameModel = GamesManager.getInstance().playerGames.first()

      #       # calculate minutes since last game
      #       msSinceLastGame = moment().utc().valueOf() - (lastGameModel?.get("created_at") || 0)
      #       minutesSinceLastGame = moment.duration(msSinceLastGame).asMinutes()

      #       # if the last game is an active multiplayer game within last 45 minutes, show the continue game screen
      #       if lastGameModel? and lastGameModel.get("cancel_reconnect") != true and (lastGameModel.get("status") == "active" || lastGameModel.get("status") == "new") and lastGameModel.get("created_at") and minutesSinceLastGame < CONFIG.MINUTES_ALLOWED_TO_CONTINUE_GAME and SDK.GameType.isMultiplayerGameType(lastGameModel.get("game_type"))
      #         # has active game, prompt user to resume
      #         Logger.module("UI").log("Last active game was on ", new Date(lastGameModel.get("created_at")), "with data", lastGameModel)
      #         return App._resumeGame(lastGameModel)
      #       else if not NewPlayerManager.getInstance().isDoneWithTutorial()
      #         # show tutorial layout
      #         return App._showTutorialLessons()
      #       else if QuestsManager.getInstance().hasUnreadQuests()
      #         # show main menu
      #         return App._showMainMenu()
      #       else
      #         # try to return to selection for previous game type
      #         if wasSpectate
      #           return App._showMainMenu()
      #         else if wasDailyChallenge
      #           QuestsManager.getInstance().markDailyChallengeCompletionAsUnread()
      #           return App._showMainMenu()
      #         else if lastGameType == SDK.GameType.Ranked and !NewPlayerManager.getInstance().getEmphasizeBoosterUnlock()
      #           return App.showPlay(SDK.PlayModes.Ranked, true)
      #         else if lastGameType == SDK.GameType.Casual and !NewPlayerManager.getInstance().getEmphasizeBoosterUnlock()
      #           return App.showPlay(SDK.PlayModes.Casual, true)
      #         else if lastGameType == SDK.GameType.Gauntlet
      #           return App.showPlay(SDK.PlayModes.Gauntlet, true)
      #         else if lastGameType == SDK.GameType.Challenge and !wasTutorial
      #           return App.showPlay(SDK.PlayModes.Challenges, true)
      #         else if lastGameType == SDK.GameType.SinglePlayer
      #           return App.showPlay(SDK.PlayModes.Practice, true)
      #         else if lastGameType == SDK.GameType.BossBattle
      #           return App.showPlay(SDK.PlayModes.BossBattle, true)
      #         else if lastGameType == SDK.GameType.Sandbox and !wasDeveloper
      #           return App.showPlay(SDK.PlayModes.Sandbox, true)
      #         else if lastGameType == SDK.GameType.Rift
      #           return App.showPlay(SDK.PlayModes.Rift, true)
      #         else
      #           return App._showMainMenu()
      #     )
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

  # this is neccesary to include here to track their first login
  # application.coffee will be the second login in a redirect flow
  # region analytics data
  # Include users analytics data retrieved with session
  identifyParams = {}
  utmParams = {}
  hadPreviousSession = false
  if data.analyticsData?
    utmParams = _.extend(utmParams,data.analyticsData)
    if (utmParams.first_purchased_at?)
      # Shouldn't be necessary but just in case
      utmParams.first_purchased_at = moment.utc(utmParams.first_purchased_at).toISOString()
    if data.analyticsData.last_session_at
      delete utmParams.last_session_at
      hadPreviousSession = true

  # identify the user with the partial data until we connect managers
  Analytics.identify(data.userId, identifyParams, utmParams)

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

  # this is a newly registered user so redirect to game
  # with a query param indicating new signup
  if not data.analyticsData.last_session_at
    return Landing.redirectToGame({isNewSignUp: true})

  return Landing.redirectToGame()

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

App.beforeunload = (e) ->
  # return an empty string to trigger alert
  return
  if App._reloadRequestIds.length == 0 and !window.isDesktop and !UtilsEnv.getIsInLocal()
    confirmMessage = ""
    (e || window.event).returnValue = confirmMessage
    return confirmMessage

App.bindEvents = () ->
  # attach event listeners to document/window
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
  Session.on('error', App.onSessionError)

  EventBus.getInstance().on(EVENTS.show_login, App._showLoginMenu, App)

  # EventBus.getInstance().on(EVENTS.show_play, App.showPlay, App)
  # EventBus.getInstance().on(EVENTS.show_watch, App.showWatch, App)
  # EventBus.getInstance().on(EVENTS.show_shop, App.showShop, App)
  # EventBus.getInstance().on(EVENTS.show_collection, App.showCollection, App)
  # EventBus.getInstance().on(EVENTS.show_codex, App.showCodex, App)
  # EventBus.getInstance().on(EVENTS.show_booster_pack_unlock, App.showBoosterPackUnlock, App)
  # EventBus.getInstance().on(EVENTS.show_crate_inventory, App.showCrateInventory, App)
  # EventBus.getInstance().on(EVENTS.start_challenge, App._startGameWithChallenge, App)
  # EventBus.getInstance().on(EVENTS.start_single_player, App._startSinglePlayerGame, App)
  # EventBus.getInstance().on(EVENTS.start_boss_battle, App._startBossBattleGame, App)
  # EventBus.getInstance().on(EVENTS.start_replay, App._startGameForReplay, App)
  # EventBus.getInstance().on(EVENTS.show_free_card_of_the_day, App.showFreeCardOfTheDayReward, App)
  # EventBus.getInstance().on(EVENTS.premium_currency_dirty_change, App._onPremiumCurrencyDirty, App)
  # EventBus.getInstance().on(EVENTS.discord_spectate, App.onDiscordSpectate, App)

  # GamesManager.getInstance().on(EVENTS.matchmaking_start, App._matchmakingStart, App)
  # GamesManager.getInstance().on(EVENTS.matchmaking_cancel, App._matchmakingCancel, App)
  # GamesManager.getInstance().on(EVENTS.matchmaking_error, App._matchmakingError, App)
  # GamesManager.getInstance().on(EVENTS.finding_game, App._findingGame, App)
  # GamesManager.getInstance().on(EVENTS.invite_accepted, App._inviteAccepted, App)
  # GamesManager.getInstance().on(EVENTS.invite_rejected, App._inviteRejected, App)
  # GamesManager.getInstance().on(EVENTS.invite_cancelled, App._inviteCancelled, App)
  # GamesManager.getInstance().on(EVENTS.start_spectate, App._spectateGame, App)

  EventBus.getInstance().on EVENTS.canvas_mouse_state, App.onCanvasMouseState, App

  NavigationManager.getInstance().on(EVENTS.user_triggered_exit, App.onUserTriggeredExit, App)
  NavigationManager.getInstance().on(EVENTS.user_triggered_skip, App.onUserTriggeredSkip, App)
  NavigationManager.getInstance().on(EVENTS.user_triggered_cancel, App.onUserTriggeredCancel, App)
  NavigationManager.getInstance().on(EVENTS.user_triggered_confirm, App.onUserTriggeredConfirm, App)

  EventBus.getInstance().on EVENTS.error, App._error, App
  EventBus.getInstance().on EVENTS.ajax_error, App._error, App

App.onVisibilityChange = () ->
  # TODO: look into why this causes errors
  # Prevent sound effects that have been queued up from blasting all at once when app regains visibility
  if document.hidden
    # Would rather do a resume and start of effects, it doesn't stop them from piling up though
    audio_engine.current().stop_all_effects()
  else
    audio_engine.current().stop_all_effects()

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

App._reloadRequestIds = []

App.onRequestReload = (event) ->
  requestId = event?.id or 0
  if !_.contains(App._reloadRequestIds, requestId)
    App._reloadRequestIds.push(requestId)
    if App._reloadRequestIds.length == 1
      App._reload(event?.message)

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

App.on "before:start", (options) ->
  Logger.module("APPLICATION").log "----BEFORE START----"
  App.$el = $("#app")

App.on "start", (options) ->
  Logger.module("APPLICATION").log "----START----"
  # set unload alert
  $(window).on('beforeunload', App.beforeunload.bind(App))

  # set initial selected scene
  selectedScene = parseInt(Storage.get("selectedScene"))
  # if moment.utc().isAfter("2016-11-29") and moment.utc().isBefore("2017-01-01")
  #   selectedScene = SDK.CosmeticsLookup.Scene.Frostfire
  # if moment.utc().isAfter("2017-03-14") and moment.utc().isBefore("2017-05-01")
  #   selectedScene = SDK.CosmeticsLookup.Scene.Vetruvian
  # if moment.utc().isAfter("2017-07-01") and moment.utc().isBefore("2017-08-01")
  #   selectedScene = SDK.CosmeticsLookup.Scene.Shimzar
  # if moment.utc().isAfter("2017-12-01") and moment.utc().isBefore("2018-01-18")
  #   selectedScene = SDK.CosmeticsLookup.Scene.Frostfire
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

  # authenticate defered, the isAuthed check must stay here so we can
  # clear the token in the event it is stale / isAuthed fails
  # the App._authenticationPromise below does not fire if there's no loading
  App._authenticationPromise = () ->
    if window.isKongregate
      # we pass the Kongregate ID and token
      kongregateId = kongregate.services.getUserId()
      kongregateToken = kongregate.services.getGameAuthToken()
      return Session.isAuthenticatedKongregate(kongregateId, kongregateToken)
      .then (isAuthed) ->
        if !isAuthed
          Storage.remove('token')
        return isAuthed
    else
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
  ).then(() ->
    # clear telemetry signal that a client is loading
    # TelemetryManager.getInstance().clearSignal("lifecycle","loading")

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

# App.setup is the main entry function into Marionette app
# grabs configuration from server we're running on and call App.start()
App.setup = () ->
  # mark all requests with buld version
  $.ajaxSetup
    headers:
      "Client-Version": process.env.VERSION

  App.start()

#
# ---- Application Start Sequence ---- #
#
if Landing.isNewUser() && Landing.shouldRedirect()
  Landing.redirect()
else
  App.setup()
