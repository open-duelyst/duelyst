SDKObject = require 'app/sdk/object'
Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
EVENTS = require 'app/common/event_types'
ActionStateRecord = require 'app/common/actionStateRecord'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
UtilsJavascript = require 'app/common/utils/utils_javascript'

Cards = require './cardsLookupComplete'
CardType = require './cardType'
CardLocation = require './cardLocation'
CardSet = require './cardSetLookup'
CardSetFactory = require './cardSetFactory'

FactionFactory = require './factionFactory'
Factions = require './factionsLookup'
Races = require './racesLookup'
Rarity = require './rarityLookup'

RemoveAction = require 'app/sdk/actions/removeAction'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

Modifier =       require 'app/sdk/modifiers/modifier'
ModifierSilence =   require 'app/sdk/modifiers/modifierSilence'
ModifierBelongsToAllRaces = require 'app/sdk/modifiers/modifierBelongsToAllRaces'
ModifierFate = require 'app/sdk/modifiers/modifierFate'
PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
Stringifiers = require 'app/sdk/helpers/stringifiers'

i18next = require 'i18next'

_ = require 'underscore'
moment = require 'moment'

class Card extends SDKObject

  type: CardType.Card # this should always remain the same for major card types (i.e. don't change this per unit/spell/etc)
  @type: CardType.Card # this should always remain the same for major card types (i.e. don't change this per unit/spell/etc)
  name: "Card" # this should be unique to each individual type of unit/spell/etc

  appliedToDeckByActionIndex: -1 # unique index of action that applied this card to the deck, where -1 is during game setup
  appliedToHandByActionIndex: -1 # unique index of action that applied this card to the hand, where -1 is during game setup
  appliedToBoardByActionIndex: -1 # unique index of action that applied this card to the board, where -1 is during game setup
  appliedToSignatureCardsByActionIndex: -1 # unique index of action that applied this card to the signature cards, where -1 is during game setup
  canBeAppliedAnywhere: false # whether card can be applied anywhere on board when played
  factionId: Factions.Neutral
  hideAsCardId: null # card id of the card this card should be hidden as during scrubbing
  id: null # this should be unique to each individual type of unit/spell/etc
  index: null # unique index of this card, set automatically by game session
  isPlayed: false # whether card has been played
  isRemoved: false # whether card has been removed (not the same as location, as a card can be removed but still located on board until fully cleaned up)
  location: CardLocation.Void # where card is located: deck, hand, board, or void
  manaCost: 0
  modifierIndices: null
  modifiersAppliedFromContextObjects: false # whether modifiers have been applied from modifiers context objects
  modifiersContextObjects: null # array of context objects describing the inherent modifiers of this card
  ownerId: null # set to player id that owns card, when null the card is owned by the game session
  parentCardIndex:null # index of card that caused this card to be played, null if played by player
  position: null # position of the card on the board
  raceId: Races.Neutral
  rarityId: Rarity.Fixed
  removedFromDeckByActionIndex: -1 # unique index of action that removed this card from deck, where -1 is during game setup
  removedFromHandByActionIndex: -1 # unique index of action that removed this card from hand, where -1 is during game setup
  removedFromBoardByActionIndex: -1 # unique index of action that removed this card from the board, where -1 is during game setup
  removedFromSignatureCardsByActionIndex: -1 # unique index of action that removed this card from signature cards, where -1 is during game setup
  subCardIndices: null # indices of cards that were played by this card

  constructor: (gameSession) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @modifierIndices = []
    @modifiersContextObjects = []

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    # card set
    p.cardSetId = CardSet.Core

    # makes reference to another card
    p.referencedCardData = null

    # action state record
    p.actionStateRecord = null
    p.actionStateRecordNeedsSetup = true

    # cache
    p.cachedBaseAttributes = {}
    p.cachedBuffedAttributes = {}
    p.cachedBuffedAttributesWithoutAuras = {}
    p.cachedContextObjectForModifierClass = {}
    p.cachedDescription = null
    p.cachedDescriptionOptions = null
    p.cachedKeywordClasses = null
    p.cachedKeywordClassesFromContextObjects = null # array of keywords of modifiers applied by modifiers context objects
    p.cachedIsAreaOfEffectOnBoard = {}
    p.cachedIsSilenced = null
    p.cachedIsValidTargetPosition = {}
    p.cachedModifierByClass = {}
    p.cachedModifiersByClass = {}
    p.cachedModifiersByStackType = {}
    p.cachedVisibleModifierStacks = null
    p.cachedValidTargetPositions = null

    # followups
    p.followupCard = null # current followup
    p.followupConditions = null # array of validation methods that return a single truthy or falsy value, used to determine whether a followup is allowed
    p.followupSourcePosition = null # source position when this card is a followup
    p.followupSourcePattern = null # overrides the pattern of a spawn/spell source modifier, to allow for followups with custom playable patterns
    p.followups = [] # options for actions, in order of execution, that are allowed to followup
    p.followupName = null
    p.followupDescription = null

    # resources and options for external systems
    p.animResource = null # currently active animation resource
    p.announcerFirstResource = null # sound resource for announcing this card first
    p.announcerSecondResource = null # sound resource for announcing this card second
    p.baseAnimResource = null # original animation map
    p.baseSoundResource = null # original sound resources
    p.cardOptions = {} # options for sprite display in card node, i.e. when is showing in hand
    p.conceptResource = null # optional resource object to use when this card is shown as concept art
    p.description = null # Used for manually entered descriptions
    p.fxResource = [] # array of strings that map to fx data, ex: ["Cards.Spells.GenericSpell"]
    p.mergedFXResource = null # base fx resource merged with faction fx resource
    p.nodeOptions = {} # options for node display on game board ex: layerName, z order, auto z order
    p.portraitResource = null # optional resource to show when this card is shown in a portrait
    p.portraitHexResource = null # optional image to show when this card is shown in a portrait
    p.soundResource = null # paths to various sounds
    p.speechResource = null # optional resource to show when this card is talking
    p.spriteOptions = {} # options for sprite display in game board node ex: occludes or castsShadows

    # misc
    p.availableAt = 0 # timestamp for when a card becomes available, where 0 is always available and -1 is never available
    p.affectPattern = null # where card affects board if not directly where it is played, relative to where it is played
    p.bossBattleDescription = null
    p.bossBattleBattleMapIndex = null
    p.isUnlockableBasic = false
    p.isLegacy = false
    p.isUnlockableWithAchievement = false
    p.isHiddenInCollection = false
    p.keywordClassesToInclude = [] # manually added keywords this card will need to define
    p.lastManaCost = @manaCost
    p.listeningToEvents = false
    p.modifiers = null
    p.targetsSpace = false # some cards need to target a space, rather than an card on the space
    p.waitingForTerminate = false

    # gauntlet card choice modifiers
    p.modifiedGauntletRarities = null
    p.modifiedGauntletFactions = null
    p.modifiedGauntletCardTypes = null
    p.modifiedGauntletOwnFactionFilter = false

    return p

  # region EVENTS

  ###*
   * SDK event handler. Do not call this method manually.
   ###
  onEvent: (event) ->
    if @_private.listeningToEvents
      eventType = event.type
      if eventType == EVENTS.terminate or eventType == EVENTS.before_deserialize
        @_onTerminate(event)
      else if eventType == EVENTS.cleanup_action
        @_onCleanupAction(event)
      else if eventType == EVENTS.update_cache_action
        @_onUpdateCacheAction(event)
      else if eventType == EVENTS.update_cache_step
        @_onUpdateCacheStep(event)

      # send to modifiers
      for modifier in @getModifiers()
        modifier.onEvent(event)
        #if @getGameSession().getIsBufferingEvents() and event.isBufferable then break

  # endregion EVENTS

  # region LOCATIONS

  onApplyToDeck: (deck, sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onApplyToDeck -> #{@getLogName()}")
    @_stopWaitingForTerminate()
    @setAppliedToDeckByAction(sourceAction)
    @setIsRemoved(false)
    @setLocation(CardLocation.Deck)
    @onApplyModifiersForApplyToNewLocation()
    @updateCachedState()
    @startListeningToEvents()

  onRemoveFromDeck: (deck, sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onRemoveFromDeck -> #{@getLogName()}")
    @setRemovedFromDeckByAction(sourceAction)
    @setIsRemoved(true)
    @updateCachedState()
    # terminate immediately when card was not removed by an action
    if @getRemovedFromDeckByActionIndex() == -1 then @_onTerminate() else @_startWaitingForTerminate()

  onApplyToHand: (deck, sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onApplyToHand -> #{@getLogName()}")
    @_stopWaitingForTerminate()
    @setAppliedToHandByAction(sourceAction)
    @setIsRemoved(false)
    @setLocation(CardLocation.Hand)
    @onApplyModifiersForApplyToNewLocation()
    @updateCachedState()
    @startListeningToEvents()

  onRemoveFromHand: (deck, sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onRemoveFromHand -> #{@getLogName()}")
    @setRemovedFromHandByAction(sourceAction)
    @setIsRemoved(true)
    @updateCachedState()
    # terminate immediately when card was not removed by an action
    if @getRemovedFromHandByActionIndex() == -1 then @_onTerminate() else @_startWaitingForTerminate()

  onApplyToSignatureCards: (sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onApplyToSignatureCards -> #{@getLogName()}")
    @_stopWaitingForTerminate()
    @setAppliedToSignatureCardsByAction(sourceAction)
    @setIsRemoved(false)
    @setLocation(CardLocation.SignatureCards)
    @onApplyModifiersForApplyToNewLocation()
    @updateCachedState()
    @startListeningToEvents()

  onRemoveFromSignatureCards: (sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onRemoveFromSignatureCards -> #{@getLogName()}")
    @setRemovedFromSignatureCardsByAction(sourceAction)
    @setIsRemoved(true)
    @updateCachedState()
    # terminate immediately when card was not removed by an action
    if @getRemovedFromSignatureCardsByActionIndex() == -1 then @_onTerminate() else @_startWaitingForTerminate()

  onApplyToBoard: (board, x, y, sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onApplyToBoard -> #{@getLogName()} at (#{x},#{y})")
    @_stopWaitingForTerminate()
    @setIsRemoved(false)
    @setLocation(CardLocation.Board)
    @setPosition({x: x, y: y})
    @setIsPlayed(true)
    @onApplyModifiersForApplyToNewLocation()
    @updateCachedState()
    @getOwner().addEventReceivingCardOnBoard(@)
    @startListeningToEvents()

  onRemoveFromBoard: (board, x, y, sourceAction) ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card.onRemoveFromBoard -> #{@getLogName()} at (#{x},#{y})")
    @setRemovedFromBoardByAction(sourceAction)
    @setIsRemoved(true)
    @updateCachedState()
    # terminate immediately when card was not removed by an action
    if @getRemovedFromBoardByActionIndex() == -1 then @_onTerminate() else @_startWaitingForTerminate()

  # endregion LOCATIONS

  # region TERMINATE

  _startWaitingForTerminate: () ->
    # wait until the cleanup phase to terminate this card
    # so it can continue to react until the cleanup phase as needed
    @_private.waitingForTerminate = true

  _stopWaitingForTerminate: () ->
    @_private.waitingForTerminate = false

  _onCleanupAction: (event) ->
    if @_private.waitingForTerminate
      action = event.action
      actionIndex = action.getIndex()

      if @getIsPlayed()
        removedByActionIndex = @getRemovedFromBoardByActionIndex()
      else
        removedByActionIndex = Math.max(@getRemovedFromDeckByActionIndex(), @getRemovedFromHandByActionIndex())

      if actionIndex >= removedByActionIndex
        @_onTerminate()

  _onTerminate: () ->
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Card._onTerminate -> #{@getLogName()} / in deck? #{@getIsLocatedInDeck()} / in hand? #{@getIsLocatedInHand()} / on board? #{@getIsPlayed()} / removed? #{@getIsRemoved()}")
    # this method is automatically called when this object will never be used again
    @_stopWaitingForTerminate()

    # ensure flagged as removed
    @setIsRemoved(true)

    # move to void
    @setLocation(CardLocation.Void)

    # stop sending events to this card
    @getOwner().removeEventReceivingCardOnBoard(@)

    # destroy event stream
    @stopListeningToEvents()
    @terminateActionStateRecord()

    # remove all modifiers
    for modifier in @getModifiers() by -1
      @getGameSession().removeModifier(modifier)
    @modifierIndices = []

  # endregion TERMINATE

  # region CACHE

  ###*
   * Syncs this card to the latest game state.
   ###
  syncState: () ->
    @updateCachedState()
    @flushCachedAttributes()
    @setupActionStateRecord()
    @getActionStateRecord()?.recordStateAtLastActionRecorded()

  ###*
   * Updates all values that should be cached between update cache events.
   ###
  updateCachedState: () ->
    # flush/update all values that should be cached when requested
    @_private.animResource = null
    @_private.soundResource = null
    @flushCachedValidTargetPositions()

  _onUpdateCacheAction: (event) ->
    @updateCachedState()

  _onUpdateCacheStep: (event) ->
    @updateCachedState()

  ###*
   * Flushes all cached data for this card.
  ###
  flushAllCachedData: () ->
    @flushCachedDescription()
    @flushCachedKeywordClasses()
    @flushCachedAttributes()
    @flushCachedModifiers()

  ###*
   * Flushes the cached modifiers so that the next call to get modifiers will regenerate list.
  ###
  flushCachedModifiers: () ->
    @_private.modifiers = null
    @_private.cachedIsSilenced = null
    @_private.cachedModifierByClass = {}
    @_private.cachedModifiersByClass = {}
    @_private.cachedModifiersByStackType = {}
    @flushCachedVisibleModifierStacks()

  ###*
   * Flushes the cached list of visible modifier stacks.
  ###
  flushCachedVisibleModifierStacks: () ->
    @_private.cachedVisibleModifierStacks = null

  ###*
   * Flushes the cached attribute values so that the next call to get attributes will regenerate values.
  ###
  flushCachedAttributes: () ->
    @_private.cachedBuffedAttributes = {}
    @_private.cachedBuffedAttributesWithoutAuras = {}
    @_private.cachedBaseAttributes = {}

  ###*
   * Flushes a cached attribute value by buff key so that the next call to get attribute will regenerate value.
  ###
  flushCachedAttribute: (buffKey) ->
    delete @_private.cachedBuffedAttributes[buffKey]
    delete @_private.cachedBuffedAttributesWithoutAuras[buffKey]
    delete @_private.cachedBaseAttributes[buffKey]

  ###*
   * Flushes the cached description so that the next call to get description will regenerate description.
  ###
  flushCachedDescription: () ->
    @_private.cachedDescription = null

  ###*
   * Flushes the cached keywords so that the next call to get keyword classes will regenerate keywords.
  ###
  flushCachedKeywordClasses: () ->
    @_private.cachedKeywordClasses = null

  # endregion CACHE

  ### PROPERTIES ###

  setIndex: (index) ->
    if @index? and @index != index
      Logger.module("SDK").error("[G:#{@getGameSession().getGameId()}] Card #{@getLogName()} attempting to set index #{index} when has #{@index}")

    @index = index

  getIndex: () ->
    return @index

  ###*
   * Creates new card data of an existing card.
   * @returns {Object} cardData
  ###
  createNewCardData: () ->
    cardData = {}

    # make sure that following properties don't get serialized
    Object.defineProperty(cardData, '_hasBeenApplied', {
      enumerable: false,
      writable: true
    })

    cardData.id = @id

    # clone all additional inherent modifiers to ensure correct modifiers for card created from data
    # normally, inherent modifiers are added to a card when created via the card factory
    # however, additional inherent modifiers are added dynamically at runtime, so we need to do this to preserve them
    # NOTE: this will not and should not copy non-inherent modifiers (ex external buffs)
    additionalInherentModifiersContextObjects = []
    for modifier in @getModifiers()
      if modifier? and modifier.getIsAdditionalInherent() and modifier.getIsCloneable()
        additionalInherentModifiersContextObjects.push(modifier.createContextObjectForClone())
    if additionalInherentModifiersContextObjects.length > 0
      cardData.additionalInherentModifiersContextObjects = additionalInherentModifiersContextObjects

    return cardData

  ###*
   * Returns a list of keys of properties that should be copied from this card when creating a card data object to copy this card.
   * @returns {Array} keys
  ###
  getCardDataKeysForCopy: () ->
    return [
      "index"
      "ownerId"
      "parentCardIndex"
      "location"
      "position",
      "appliedToDeckByActionIndex"
      "appliedToHandByActionIndex"
      "appliedToBoardByActionIndex"
      "appliedToSignatureCardsByActionIndex"
      "removedFromDeckByActionIndex"
      "removedFromHandByActionIndex"
      "removedFromBoardByActionIndex"
      "removedFromSignatureCardsByActionIndex"
      "subCardIndices"
    ]

  ###*
   * Creates card data from this card to exactly replicate/index this card, optionally from existing card data.
   * @param {Object} existingCardData
   * @returns {Object} cardData
  ###
  createCardData: (existingCardData) ->

    cardData = @createNewCardData()

    if existingCardData? and _.isObject(existingCardData)
      UtilsJavascript.fastExtend(cardData, existingCardData)

    # copy properties from card
    for key in @getCardDataKeysForCopy()
      # only set certain properties on card data if they differ from the prototype, i.e. they are not DEFAULTS
      # this is done by checking if this object has it's won property (different than prototype) or is using the prototype
      if @.hasOwnProperty(key)
        val = @[key]
        if _.isArray(val)
          cardData[key] = val.slice(0)
        else if _.isObject(val)
          cardData[key] = UtilsJavascript.fastExtend({}, val)
        else
          cardData[key] = val

    # record modifiers applied to card
    modifiers = @getModifiers()
    if modifiers? and modifiers.length > 0
      cardData.modifierIndices = @modifierIndices.slice(0)
      cardData.appliedModifiersContextObjects = []
      for modifier in modifiers
        if modifier?
          cardData.appliedModifiersContextObjects.push(modifier.createContextObject())

    return cardData

  ###*
   * Creates card data to replicate card in the case that this game session needs to be re-setup.
   * @returns {Object} cardData
  ###
  createGameSetupCardData: () ->
    cardData = @createCardData()

    @updateCardDataPostApply(cardData)
    cardData.position = @getPosition()

    return cardData

  ###*
   * Creates card data to snapshot card for cloning or transform reversion.
   * @returns {Object} cardData
  ###
  createCloneCardData: () ->
    cardData = @createNewCardData()

    cardData.modifiersContextObjects = []
    for modifier in @getModifiers()
      if modifier? and !modifier.getIsAdditionalInherent() and modifier.getIsCloneable()
        cardData.modifiersContextObjects.push(modifier.createContextObjectForClone())

    return cardData

  ###*
   * Updates card data from this card after being applied to deck/hand/board.
   * @param {Object} cardData
   * @returns {Object} cardData
  ###
  updateCardDataPostApply: (cardData) ->
    if cardData?
      cardData.index = @index
      cardData.id = @id

    return cardData

  ###*
   * Copies card data into this card.
   * @param {Object} cardData
  ###
  applyCardData: (cardData) ->
    if cardData? and _.isObject(cardData)
      # for redundancy sake, make sure that following properties don't get serialized
      Object.defineProperty(cardData, '_hasBeenApplied', {
        enumerable: false,
        writable: true
      })

      if !cardData._hasBeenApplied
        # copy properties into card
        keys = Object.keys(cardData)
        for key in keys
          property = cardData[key]
          # only overwrite attributes on this object from cardData when the value is different than what's already there
          # this is important so that we don't define an 'own' property that gets serialized when it is same as proto val
          if @[key] != property
            # shallow copy so we don't modify anything in the cardData unintentionally
            if _.isArray(property)
              @[key] = property.slice(0)
            else if _.isObject(property)
              @[key] = UtilsJavascript.fastExtend({}, property)
            else
              @[key] = property

        # flag data as having been applied so we never apply more than once
        cardData._hasBeenApplied = true

        # delete properties that shouldn't be retained on this card
        delete @appliedModifiersContextObjects
        delete @additionalModifiersContextObjects
        delete @additionalInherentModifiersContextObjects

        if !@modifiersAppliedFromContextObjects
          if cardData.additionalInherentModifiersContextObjects?
            # merge all additional inherent modifier context objects
            for contextObject in cardData.additionalInherentModifiersContextObjects
              if !contextObject.index?
                # flag additional context object as additional
                contextObject.isAdditionalInherent = true
                # flag addition context object as inherent
                if contextObject.isInherent or @getGameSession().getOrCreateModifierFromContextObjectOrIndex(contextObject)?.getIsInherent() then contextObject.isInherent = true
                @modifiersContextObjects.push(contextObject)

          if cardData.additionalModifiersContextObjects?
            # merge all additional modifier context objects
            for contextObject in cardData.additionalModifiersContextObjects
              if !contextObject.index?
                @modifiersContextObjects.push(contextObject)

        # regenerate modifiers as needed
        modifierIndices = @getModifierIndices()
        if modifierIndices.length > 0
          for modifierIndex in modifierIndices.slice(0)
            modifier = @getGameSession().getModifierByIndex(modifierIndex)
            if !modifier?
              # modifier index present but no modifier found
              for contextObject in cardData.appliedModifiersContextObjects
                # use context object with matching index to regenerate modifier
                if contextObject.index? and contextObject.index == modifierIndex
                  # merge all additional modifier context objects
                  if contextObject.isAdditionalInherent then @modifiersContextObjects.push(contextObject)
                  # regenerate modifier
                  @getGameSession().applyModifierContextObject(contextObject, @)

  getType: () ->
    return @type

  setId: (id) ->
    @id = id

  getId: () ->
    return @id

  getBaseCardId: () ->
    return Cards.getBaseCardId(@getId())

  getName: () ->
    if @name?
      name = if i18next.exists(@name) then i18next.t(@name) else @name
    return name || ("" + @getId())

  getLogName: ()->
    return "#{@.getName().replace(' ','_')}_#{@getBaseCardId()}_SKN#{Cards.getCardSkinNum(@getId())}#{(if Cards.getIsPrismaticCardId(@getId()) then "(PRSM)" else "")}[#{@.getIndex()}]"

  getFactionId: () ->
    return @factionId

  addKeywordClassToInclude: (keywordClass) ->
    # add a keyword class to keywords needed to explain this card
    if !_.contains(@_private.keywordClassesToInclude, keywordClass)
      @_private.keywordClassesToInclude.push(keywordClass)

  getRaceId: () ->
    return @raceId

  # normally a card belongs to a tribe if its race id matches exactly to that tribe
  # there can also be special modifiers that allow a card to belong to multiple tribes
  getBelongsToTribe: (tribe) ->
    return @getRaceId() == tribe || @hasModifierClass(ModifierBelongsToAllRaces)

  getRarityId: () ->
    return @rarityId

  setCardSetId: (val) ->
    @_private.cardSetId = val

  getCardSetId: () ->
    return @_private.cardSetId

  ###*
  # Sets whether this is a card that needs to be unlocked later as part of a basic set.
  # @public
  # @param  {Boolean}
  ###
  setIsUnlockableBasic: (val) ->
    @_private.isUnlockableBasic = val

  ###*
  # Returns whether this is a card that needs to be unlocked later as part of a basic set.
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockableBasic: () ->
    return @_private.isUnlockableBasic and !Cards.getIsSkinnedCardId(@getId())

  ###*
  # Returns whether this is a prismatic card that can be unlocked.
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockablePrismaticBasic: () ->
    return @getRarityId() == Rarity.Fixed and Cards.getIsPrismaticCardId(@getId()) and !Cards.getIsSkinnedCardId(@getId())
#    return @getRarityId() == Rarity.Fixed and Cards.getIsPrismaticCardId(@getBaseCardId()) and Cards.getIsPrismaticCardId(@getId()) and !Cards.getIsSkinnedCardId(@getId())

  ###*
  # Returns whether this is a card that can be unlocked through progression.
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockableThroughProgression: () ->
    return @getIsUnlockableBasic() or @getIsUnlockablePrismaticBasic()

  ###*
  # @public
  # @param  {Boolean}
  ###
  setIsUnlockableWithAchievement: (val) ->
    @_private.isUnlockableWithAchievement = val

  ###*
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockableWithAchievement: () ->
    return @_private.isUnlockableWithAchievement

  ###*
  # @public
  # @param  {Boolean}
  ###
  setIsUnlockedWithAchievementId: (val) ->
    @_private.isUnlockedWithAchievementId = val

  ###*
  # @public
  # @return  {String}  Achievement id
  ###
  getIsUnlockedWithAchievementId: () ->
    return @_private.isUnlockedWithAchievementId

  ###*
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockablePrismaticWithAchievement: () ->
    return @getIsUnlockableWithAchievement() and Cards.getIsPrismaticCardId(@getId()) and !Cards.getIsSkinnedCardId(@getId())

  ###*
  # Returns whether this is a card that can be unlocked only through spirit orbs
  # Prismatic versions of these cards are only craftable once the base card is owned
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockableThroughSpiritOrbs: () ->
    cardSetData = CardSetFactory.cardSetForIdentifier(@.getCardSetId())
    return cardSetData.isUnlockableThroughOrbs || false

  ###*
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockablePrismaticWithSpiritOrbs: () ->
    return @getIsUnlockableThroughSpiritOrbs() and Cards.getIsPrismaticCardId(@getId()) and !Cards.getIsSkinnedCardId(@getId())

  ###*
  # Returns whether card is unlockable.
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsUnlockable: () ->
    return !@getIsHiddenInCollection() and
        (@getIsUnlockableThroughProgression() or
          @getIsUnlockableWithAchievement() or
          @getIsUnlockablePrismaticWithAchievement() or
          @getIsUnlockableThroughSpiritOrbs() or
          Cards.getIsSkinnedCardId(@getId()))

  ###*
  # @public
  # How is this card unlocked
  ###
  setUnlockDescription: (val)->
    @_private.unlockDescription = val

  ###*
  # @public
  # How is this card unlocked?
  # @return  {String}
  ###
  getUnlockDescription: ()->
    return @_private.unlockDescription

  ###*
  # Returns whether card is collectible.
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsCollectible: () ->
    return !@getIsHiddenInCollection() and
        (@getRarityId() == Rarity.Common or
          @getRarityId() == Rarity.Rare or
          @getRarityId() == Rarity.Epic or
          @getRarityId() == Rarity.Legendary or
          @getRarityId() == Rarity.Mythron)

  ###*
  # Sets whether this is a card that is now legacy (won't come from sets or be playable if playing in a format game mode)
  # @public
  # @param  {Boolean}
  ###
  setIsLegacy: (val) ->
    @_private.isLegacy = val

  ###*
  # Returns whether this is a card that is now legacy (won't come from sets or be playable if playing in a format game mode)
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsLegacy: () ->
    return false # disregard concept of legacy cards

  ###*
  # Returns whether this is a signature card.
  # NOTE: a card is only a signature card while it is in the signature slot!
  # @public
  # @return  {BOOL}  True/false.
  ###
  isSignatureCard: () ->
    if @isOwnedByGameSession() then return false
    else return @getOwner()?.getCurrentSignatureCardIndex() == @getIndex()

  setLocation: (val) ->
    @location = val

  getLocation: () ->
    return @location

  getIsLocatedInDeck: () ->
    return @location == CardLocation.Deck

  getIsLocatedInHand: () ->
    return @location == CardLocation.Hand

  getIsLocatedInSignatureCards: () ->
    return @location == CardLocation.SignatureCards

  getIsLocatedOnBoard: () ->
    return @location == CardLocation.Board

  getIsLocatedInVoid: () ->
    return @location == CardLocation.Void

  setIsRemoved: (val) ->
    @isRemoved = val

  getIsRemoved: () ->
    return @isRemoved

  setIsPlayed: (val) ->
    @isPlayed = val

  getIsPlayed: () ->
    return @isPlayed

  setAppliedToDeckByAction: (action) ->
    if action?
      @appliedToDeckByActionIndex = action.getIndex()

  getAppliedToDeckByActionIndex: () ->
    return @appliedToDeckByActionIndex

  getAppliedToDeckByAction: () ->
    if @appliedToDeckByActionIndex > -1
      return @getGameSession().getActionByIndex(@appliedToDeckByActionIndex)

  setAppliedToHandByAction: (action) ->
    if action?
      @appliedToHandByActionIndex = action.getIndex()

  getAppliedToHandByActionIndex: () ->
    return @appliedToHandByActionIndex

  getAppliedToHandByAction: () ->
    if @appliedToHandByActionIndex > -1
      return @getGameSession().getActionByIndex(@appliedToHandByActionIndex)

  setAppliedToBoardByAction: (action) ->
    if action?
      @appliedToBoardByActionIndex = action.getIndex()

  getAppliedToBoardByActionIndex: () ->
    return @appliedToBoardByActionIndex

  getAppliedToBoardByAction: () ->
    if @appliedToBoardByActionIndex > -1
      return @getGameSession().getActionByIndex(@appliedToBoardByActionIndex)

  setAppliedToSignatureCardsByAction: (action) ->
    if action?
      @appliedToSignatureCardsByActionIndex = action.getIndex()

  getAppliedToSignatureCardsByActionIndex: () ->
    return @appliedToSignatureCardsByActionIndex

  getAppliedToSignatureCardsByAction: () ->
    if @appliedToSignatureCardsByActionIndex > -1
      return @getGameSession().getActionByIndex(@appliedToSignatureCardsByActionIndex)

  setRemovedFromDeckByAction: (action) ->
    if action?
      @removedFromDeckByActionIndex = action.getIndex()

  getRemovedFromDeckByActionIndex: () ->
    return @removedFromDeckByActionIndex

  getRemovedFromDeckByAction: () ->
    if @removedFromDeckByActionIndex > -1
      return @getGameSession().getActionByIndex(@removedFromDeckByActionIndex)

  setRemovedFromHandByAction: (action) ->
    if action?
      @removedFromHandByActionIndex = action.getIndex()

  getRemovedFromHandByActionIndex: () ->
    return @removedFromHandByActionIndex

  getRemovedFromHandByAction: () ->
    if @removedFromHandByActionIndex > -1
      return @getGameSession().getActionByIndex(@removedFromHandByActionIndex)

  setRemovedFromSignatureCardsByAction: (action) ->
    if action?
      @removedFromSignatureCardsByActionIndex = action.getIndex()

  getRemovedFromSignatureCardsByActionIndex: () ->
    return @removedFromSignatureCardsByActionIndex

  getRemovedFromSignatureCardsByAction: () ->
    if @removedFromSignatureCardsByActionIndex > -1
      return @getGameSession().getActionByIndex(@removedFromSignatureCardsByActionIndex)

  setRemovedFromBoardByAction: (action) ->
    if action?
      @removedFromBoardByActionIndex = action.getIndex()

  getRemovedFromBoardByActionIndex: () ->
    return @removedFromBoardByActionIndex

  getRemovedFromBoardByAction: () ->
    if @removedFromBoardByActionIndex > -1
      return @getGameSession().getActionByIndex(@removedFromBoardByActionIndex)

  getIsActive: () ->
    return @getIsPlayed() and !@getIsRemoved()

  getManaCost: () ->
    return @getBuffedAttribute(@manaCost, "manaCost")

  setBaseManaCost: (manaCost) ->
    if @manaCost != manaCost
      @_private.lastManaCost = @manaCost
      @manaCost = manaCost

  getBaseManaCost: () ->
    return @manaCost

  getLastBaseManaCost: () ->
    return @_private.lastManaCost

  getManaCostChange: () ->
    return @getManaCost() - @getBaseManaCost()

  setPosition: (position) ->
    @position = position

  getPositionX: () ->
    if @position? then return @position.x else return -1

  getPositionY: () ->
    if @position? then return @position.y else return -1

  getPosition: () ->
    if @position? then return {x: @position.x, y: @position.y} else return {x: -1, y: -1}

  ###*
  # Sets whether this card is hidden in the collection.
  # @public
  # @param  {Boolean}
  ###
  setIsHiddenInCollection:(val) ->
    @_private.isHiddenInCollection = val

  ###*
  # Returns whether this card is hidden in the collection.
  # @public
  # @return  {BOOL}  True/false.
  ###
  getIsHiddenInCollection:() ->
    return @_private.isHiddenInCollection or
        @getFactionId() == Factions.Tutorial or
        @getFactionId() == Factions.Boss

  ###*
  # Sets the UTC timestamp for when this card is available at.
  # @public
  # @param {Number} timestamp in UTC
  ###
  setAvailableAt: (val) ->
    @_private.availableAt = val

  ###*
  # Returns the UTC timestamp for when this card is available at.
  # @public
  # @returns {Number} timestamp in UTC
  ###
  getAvailableAt: () ->
    return @_private.availableAt


  ###*
  # Returns whether this card is available to players.
  # @public
  # @param  {Moment}  [systemTime=moment().utc()]  System time input parameter. Useful for unit testing.
  # @param  {Boolean}  [forceValidation=false]  Force validation regardless of ENV. Useful for unit tests.
  # @return  {BOOL}  True/false.
  ###
  getIsAvailable:(systemTime, forceValidation) ->
    if systemTime?
      MOMENT_NOW_UTC = moment(systemTime)
    else
      MOMENT_NOW_UTC = moment().utc()

    # we cast this env ALL_CARDS_AVAILABLE var to a string because of some server/client differences
    # client side ENVIFY will replace this with the boolan true/false
    # but server side it will use the process.env system that always stores data as strings
    # so the safest approach is to cast it to a string and compare
    if !forceValidation and process.env.ALL_CARDS_AVAILABLE?.toString() == "true"
      # when in environment with all cards available, ignore timestamp
      return true
    else if @_private.availableAt <= -1
      # when available at -1, card is currently never available
      return false
    else
      # otherwise, card is available when current time plus 1 hour is after timestamp
      return MOMENT_NOW_UTC.add(1, 'hours').isAfter(moment(@_private.availableAt))

  setPortraitResource:(val) ->
    @_private.portraitResource = val

  getPortraitResource:() ->
    return @_private.portraitResource

  setPortraitHexResource:(val) ->
    @_private.portraitHexResource = val

  getPortraitHexResource:() ->
    return @_private.portraitHexResource

  setSpeechResource:(val) ->
    @_private.speechResource = val

  getSpeechResource:() ->
    return @_private.speechResource

  setConceptResource:(val) ->
    @_private.conceptResource = val

  getConceptResource:() ->
    return @_private.conceptResource

  setAnnouncerFirstResource:(val) ->
    @_private.announcerFirstResource = val

  getAnnouncerFirstResource:() ->
    return @_private.announcerFirstResource

  setAnnouncerSecondResource:(val) ->
    @_private.announcerSecondResource = val

  getAnnouncerSecondResource:() ->
    return @_private.announcerSecondResource

  setOwnerId: (ownerId) ->
    if @ownerId != ownerId
      @ownerId = ownerId
      @getOwner().flushCachedEventReceivingCards()

  getOwnerId: () ->
    return @ownerId

  setBossBattleDescription: (val) ->
    @_private.bossBattleDescription = val

  getBossBattleDescription: (val) ->
    return @_private.bossBattleDescription

  setBossBattleBattleMapIndex: (val) ->
    @_private.bossBattleBattleMapIndex = val

  getBossBattleBattleMapIndex: (val) ->
    return @_private.bossBattleBattleMapIndex

  setOwner: (player) ->
    @setOwnerId(player.getPlayerId())

  getOwner: () ->
    gameSession = @getGameSession()
    if @isOwnedByGameSession()
      return gameSession
    else
      return gameSession.getPlayerById(@ownerId)

  getIsSameTeamAs: (otherCard) ->
    return @ownerId is otherCard?.ownerId

  # For non player owned cards, e.g. mana tiles
  isOwnedByGameSession: () ->
    return !@ownerId?

  isNotOwnedByPlayer: @::isOwnedByGameSession

  isOwnedBy: (player) ->
    return @ownerId is player?.getPlayerId()

  isOwnedByPlayer1: () ->
    return @isOwnedBy(@getGameSession()?.getPlayer1())

  isOwnedByPlayer2: () ->
    return @isOwnedBy(@getGameSession()?.getPlayer2())

  isOwnedByCurrentPlayer: () ->
    return @isOwnedBy(@getGameSession()?.getCurrentPlayer())

  isOwnedByMyPlayer: () ->
    return @isOwnedBy(@getGameSession()?.getMyPlayer())

  isOwnedByOpponentPlayer: () ->
    return @isOwnedBy(@getGameSession()?.getOpponentPlayer())

  isOwnersTurn: () ->
    return @getGameSession()?.getCurrentPlayer().getPlayerId() == @ownerId

  getDoesOwnerHaveEnoughManaToPlay: () ->
    return @isOwnedByGameSession() or @getManaCost() <= @getOwner().getRemainingMana()

  getIsAllowedToBePlayed: () ->
    getIsAllowedToBePlayed = true
    fateMod = @getModifierByClass(ModifierFate)
    if fateMod?
      getIsAllowedToBePlayed = fateMod.fateConditionFulfilled() && getIsAllowedToBePlayed
    return getIsAllowedToBePlayed

  getDoesOwnerHaveEnoughManaToAct: @::getDoesOwnerHaveEnoughManaToPlay

  setDescription: (val) ->
    @_private.description = val

  getDescription: (options) ->
    if (not @_private.cachedDescription?) or (@_private.cachedDescriptionOptions != options)
      description = ""

      # options object can include wrapper text elements to wrap certain card elements
      @_private.cachedDescriptionOptions = options
      if options?
        boldStart = options.boldStart
        boldEnd = options.boldEnd
        entryDelimiter = options.entryDelimiter

      if !entryDelimiter?
        entryDelimiter = "\n"

      if @_private.description # pre-defined descrption (most cards will use this)
        # format hard line breaks for plain text or HTML
        if entryDelimiter != "\n"
          @_private.description = @_private.description.replace /\n/g, "<br/>"
        # add the manually entered followup description if there is one
        description += @_private.description
      else
        # generate description from modifiers
        filteredContextObjects = _.filter(@modifiersContextObjects, ((contextObject) ->
          return (contextObject.isInherent or contextObject.isAdditionalInherent) and !contextObject.isHiddenToUI and !@getGameSession().getModifierClassForType(contextObject.type).isHiddenToUI
        ).bind(@))

        # sort the context objects for display alphanumerically
        sortedContextObjects = _.sortBy(filteredContextObjects, ((contextObject) ->
          sortValue = "z"
          modifierClass = @getGameSession().getModifierClassForType(contextObject.type)
          if modifierClass.modifierName then sortValue = modifierClass.modifierName
          # descriptions come after those with only names
          if modifierClass.description? then sortValue = "z" + sortValue
          # keyworded come before all others
          if modifierClass.getIsKeyworded() then sortValue = "0" + sortValue

          return sortValue
        ).bind(@))

        # gather the descriptions from sorted context objects
        for contextObject, i in sortedContextObjects
          modifierClass = @getGameSession().getModifierClassForType(contextObject.type)
          modifierName = if modifierClass.getIsKeyworded() then modifierClass.getName(contextObject) else undefined
          modifierDescription = modifierClass.getDescription(contextObject, @getGameSession().getModifierFactory())
          modifierString = Stringifiers.stringifyNameAndOrDescription(modifierName, modifierDescription, options)
          description += modifierString

          # insert delimeter between each modifier context object
          if (i != sortedContextObjects.length-1)
            # check if this isn't the last keyword
            nextSortedContextObject = sortedContextObjects[i+1]
            nextModifierClass = @getGameSession().getModifierClassForType(nextSortedContextObject.type)
            nextModifierDescription = nextModifierClass.getDescription(nextSortedContextObject, @getGameSession().getModifierFactory())
            if !modifierDescription and !nextModifierDescription
              # separate two 'name only' modifiers by comma
              description += ", "
            else
              description += entryDelimiter

      # add the followup description
      if @_private.followupName? and @_private.followupDescription?
        # add separator between flavor text and followup
        if description != ""
          description += entryDelimiter || ".  "

        followupString = Stringifiers.stringifyNameAndOrDescription(@_private.followupName, @_private.followupDescription, options)

        # add followup description to return
        description += followupString

      # search for keywords from manually added keywords
      if boldStart?
        for keywordClass in @getKeywordClasses()
          if !(keywordClass.type is "ModifierBattlePet") # special case, don't bold "Battle Pet" text in card descriptions
            description = description.replace(new RegExp(keywordClass.modifierName + "\(\?\!" + boldEnd + "\)", "g"), boldStart + keywordClass.modifierName + boldEnd)

      # cache final description
      @_private.cachedDescription = description

    return @_private.cachedDescription

  setFollowupNameAndDescription: (followupName, followupDescription) ->
    @_private.followupName = followupName
    @_private.followupDescription = followupDescription

  setNodeOptions: (val) ->
    @_private.nodeOptions = val

  getNodeOptions: () ->
    return @_private.nodeOptions

  setSpriteOptions: (val) ->
    @_private.spriteOptions = val

  getSpriteOptions: () ->
    return @_private.spriteOptions

  setCardOptions: (val) ->
    @_private.cardOptions = val

  getCardOptions: () ->
    return @_private.cardOptions

  #===== / ======

  ### ANIMATION ###

  setBaseAnimResource: (animResource) ->
    # store the original resource, set when the card is first made
    # so no matter how many changes it undergoes, it always has the original
    @_private.baseAnimResource = animResource

  getBaseAnimResource: () ->
    return @_private.baseAnimResource

  # Duplicated below.
  ###
  getAnimResource: () ->
    # override to return a value other than the base resource
    return @_private.baseAnimResource
  ###

  getAnimResource: () ->
    # search modifiers for any with resource
    if !@_private.animResource?
      modifiers = @getModifiers()
      if modifiers.length > 0
        for modifier in modifiers by -1
          if modifier? and modifier.getIsActive()
            modifierResource = modifier.getAnimResource()
            if modifierResource?
              if modifier.getIsManagedByAura()
                resource = modifierResource
                break
              else if !resource?
                resource = modifierResource

      # cache resource
      @_private.animResource = resource || @_private.baseAnimResource

    return @_private.animResource

  #===== / ======

  ### SOUND ###

  # Duplicated below.
  ###
  getSoundResource: () ->
    # search modifiers for any with resource
    if !@_private.soundResource?
      modifiers = @getModifiers()
      if modifiers.length > 0
        for modifier in modifiers by -1
          if modifier? and modifier.getIsActive()
            modifierResource = modifier.getSoundResource()
            if modifierResource?
              if modifier.getIsManagedByAura()
                resource = modifierResource
                break
              else if !resource?
                resource = modifierResource

      # cache resource
      @_private.soundResource = resource || @_private.baseSoundResource

    return @_private.soundResource
  ###

  setBaseSoundResource: (soundResource) ->
    # store the original resource, set when the card is first made
    # so no matter how many changes it undergoes, it always has the original
    @_private.baseSoundResource = soundResource

  getBaseSoundResource: () ->
    return @_private.baseSoundResource

  getSoundResource: () ->
    # override to return a value other than the base resource
    return @_private.baseSoundResource

  #===== / ======

  ### FX ###

  setFXResource: (fxResource) ->
    @_private.fxResource = fxResource

  getFXResource: () ->
    if !@_private.mergedFXResource?
      @_private.mergedFXResource = @_private.fxResource
      # prepend faction's fx resource
      factionId = @getFactionId()
      if factionId?
        faction = FactionFactory.factionForIdentifier(factionId)
        factionFXResource = faction?.fxResource
        if factionFXResource?
          @_private.mergedFXResource = _.uniq(_.union(factionFXResource, @_private.fxResource))
    return @_private.mergedFXResource

  addFXResource: (fxResource) ->
    @_private.mergedFXResource = _.uniq(_.union(@getFXResource(), fxResource))

  removeFXResource: (fxResource) ->
    @_private.mergedFXResource = _.difference(@getFXResource(), fxResource)

  #===== / ======

  ### VALID POSITIONS ###

  getValidTargetPositions: () ->
    if !@_private.cachedValidTargetPositions?
      # valid positions where card can be played on board
      # defaults to every space on the board
      @_private.cachedValidTargetPositions = @getGameSession().getBoard().getPositions() || []
    return @_private.cachedValidTargetPositions

  getIsPositionValidTarget: (targetPosition) ->
    # index must be string and cannot be map index as position may be outside board space
    # map indices can conflict when generated for positions outside the board
    index = targetPosition.x + "_" + targetPosition.y
    res = @_private.cachedIsValidTargetPosition[index]
    if !res?
      res = @_private.cachedIsValidTargetPosition[index] = UtilsPosition.getIsPositionInPositions(@getValidTargetPositions(), targetPosition) and @isAreaOfEffectOnBoard(targetPosition)
    return res

  flushCachedValidTargetPositions: () ->
    @_private.cachedValidTargetPositions = null
    @_private.cachedIsValidTargetPosition = {}

  getCanBeAppliedAnywhere: () ->
    return @canBeAppliedAnywhere

  setAffectPattern: (val) ->
    @_private.affectPattern = val
    @flushCachedIsAreaOfEffectOnBoard()

  getAffectPattern: () ->
    return @_private.affectPattern

  getAffectPositionsFromPattern: (targetPosition) ->
    return UtilsGameSession.getValidBoardPositionsFromPattern(@getGameSession().getBoard(), targetPosition, @getAffectPattern())

  isAreaOfEffectOnBoard: (targetPosition) ->
    board = @getGameSession().getBoard()
    isOnBoard = board.isOnBoard(targetPosition)
    affectPattern = @getAffectPattern()
    if isOnBoard and affectPattern? and affectPattern.length > 0
      # if we've already tested this position, return previous result
      index = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), targetPosition.x, targetPosition.y)
      res = @_private.cachedIsAreaOfEffectOnBoard[index]
      if !res?
        # number of affect positions must match length of affect pattern
        res = @_private.cachedIsAreaOfEffectOnBoard[index] = (@getAffectPositionsFromPattern(targetPosition).length == affectPattern.length)
      return res
    else
      # no area of effect or not on board
      return isOnBoard

  flushCachedIsAreaOfEffectOnBoard: () ->
    @_private.cachedIsAreaOfEffectOnBoard = {}

  setTargetsSpace: (val) ->
    @_private.targetsSpace = val

  getTargetsSpace: () ->
    return @_private.targetsSpace

  #===== / ======

  #region ### MODIFIERS ###

  setModifiersContextObjects: (modifiersContextObjects) ->
    @modifiersContextObjects = modifiersContextObjects
    @flushCachedModifiersContextObjects()

  getModifiersContextObjects: () ->
    return @modifiersContextObjects

  setInherentModifiersContextObjects: (modifiersContextObjects) ->
    # merge context objects
    for modifierContextObject in modifiersContextObjects
      # flag all context objects as inherent
      modifierContextObject.isInherent = true
      @modifiersContextObjects.push(modifierContextObject)
    @flushCachedModifiersContextObjects()

  getInherentModifiersContextObjects: () ->
    modifiersContextObjects = []

    if @modifiersContextObjects?
      for modifierContextObject in @modifiersContextObjects
        if modifierContextObject.isInherent then modifiersContextObjects.push(modifierContextObject)

    return modifiersContextObjects

  flushCachedModifiersContextObjects: () ->
    @_private.cachedContextObjectForModifierClass = {}

  ###*
   * Returns list of modifiers applied to this card.
   * @returns {Array}
   ###
  getModifiers: () ->
    @_private.modifiers ?= @getGameSession().getModifiersByIndices(@modifierIndices)
    return @_private.modifiers

  ###*
   * Returns list of modifiers applied to this card, filtered by whether visible, sorted by stack type, and in the order they should be applied.
   * @returns {Array}
   ###
  getVisibleModifierStacks: () ->
    if @_private.cachedVisibleModifierStacks?
      # use cached list
      return @_private.cachedVisibleModifierStacks
    else
      modifierStacksByStackSortKey = {}
      statsByStackType = {}
      modifierStacks = []
      managedModifierStacks = []
      stackSortKeyBreak = ""

      for modifier in @getModifiers()
        if modifier?
          if !modifier.getIsHiddenToUI()
            # uncomment line below to filter out aura sub-modifiers on the same card
            #if !modifier.getIsHiddenToUI() and (!modifier.getIsManagedByAuraModifier() or (modifier.getParentModifier() != null and modifier.getCardAffected() != modifier.getParentModifier().getCardAffected()))
            # create stack as needed
            modifierIsActive = modifier.getIsActive()
            modifierAppliedName = modifier.getAppliedName()
            modifierStackType = modifier.getStackType()
            modifierIsManaged = modifier.getIsManagedByAura()
            modifierStackSortKey = modifierAppliedName + modifierStackType
            if !modifierIsManaged
              # only break stacks of non-managed modifiers
              modifierStackSortKey += stackSortKeyBreak
            modifierStack = modifierStacksByStackSortKey[modifierStackSortKey]
            if !modifierStack?
              modifierStack = modifierStacksByStackSortKey[modifierStackSortKey] = {
                modifiers: []
                stackType: modifierStackType
                numInherent: 0
                numManaged: 0
              }
            statsForStackType = statsByStackType[modifierStackType]
            if !statsForStackType?
              statsForStackType = statsByStackType[modifierStackType] = {
                numActive: 0
              }

            # add modifier to stack
            modifierStack.modifiers.push(modifier)
            if modifier.getIsInherent() then modifierStack.numInherent++
            if modifierIsManaged then modifierStack.numManaged++
            if modifierIsActive then statsForStackType.numActive++

            # when this modifier buffs attributes by setting absolute or fixed values
            # no modifiers beyond this modifier should stack with modifiers that came before this modifier
            if modifierIsActive and (modifier.getBuffsAttributesAbsolutely() || modifier.getAreAttributesFixed())
              stackSortKeyBreak += "_stackbreak"

      stackSortKeys = Object.keys(modifierStacksByStackSortKey)
      for stackSortKey in stackSortKeys
        modifierStack = modifierStacksByStackSortKey[stackSortKey]

        # merge stats from stack type
        statsForStackType = statsByStackType[modifierStack.stackType]
        modifierStack.numActive = statsForStackType.numActive

        # sort stacks by whether all in stack are managed
        if modifierStack.numManaged == modifierStack.modifiers.length then managedModifierStacks.push(modifierStack) else modifierStacks.push(modifierStack)

      # cache list
      @_private.cachedVisibleModifierStacks = modifierStacks.concat(managedModifierStacks)
      return @_private.cachedVisibleModifierStacks

  getAttributeModifiers: (buffKey) ->
    attributeModifiers = []
    for modifier in @getModifiers()
      if modifier? and modifier.getIsActive() and modifier.getBuffsAttribute(buffKey)
        attributeModifiers.push(modifier)
    return attributeModifiers

  getActiveAttributeModifiers: (buffKey) ->
    attributeModifiers = []
    for modifier in @getModifiers()
      if modifier? and modifier.getBuffsAttribute(buffKey)
        attributeModifiers.push(modifier)
    return attributeModifiers

  getInherentModifiers: () ->
    modifiers = []

    for modifier in @getModifiers()
      if modifier.getIsInherent() then modifiers.push(modifier)

    return modifiers

  getAdditionalInherentModifiers: () ->
    modifiers = []

    for modifier in @getModifiers()
      if modifier.getIsAdditionalInherent() then modifiers.push(modifier)

    return modifiers

  getInherentAndAdditionalInherentModifiers: () ->
    modifiers = []

    for modifier in @getModifiers()
      if (modifier.getIsInherent() or modifier.getIsAdditionalInherent()) then modifiers.push(modifier)

    return modifiers

  getModifierClassesFromContextObjects: () ->
    modifierClasses = []
    if @modifiersContextObjects?
      for contextObject in @modifiersContextObjects
        modifierClass = @getGameSession().getModifierClassForType(contextObject.type)
        if modifierClass?
          modifierClasses.push(modifierClass)
    return modifierClasses

  getContextObjectForModifierClass: (modifierClass) ->
    res = @_private.cachedContextObjectForModifierClass[modifierClass.type]
    if !res?
      for contextObject in @modifiersContextObjects
        if contextObject.type == modifierClass.type
          matchingContextObject = contextObject
          break
      res = @_private.cachedContextObjectForModifierClass[modifierClass.type] = matchingContextObject
    return res

  hasModifierClassInContextObjects: (modifierClass) ->
    return @getContextObjectForModifierClass(modifierClass)?

  getModifierIndices: () ->
    return @modifierIndices || []

  onApplyModifiersForApplyToNewLocation: () ->
    # sync the state of all existing modifiers
    # newly applied modifiers will sync as they are applied
    for modifier in @getModifiers()
      if modifier?
        modifier.syncState()

    # apply modifiers from modifiers context objects
    if !@modifiersAppliedFromContextObjects
      @modifiersAppliedFromContextObjects = true

      if @getGameSession().getIsRunningAsAuthoritative()
        # generate and apply base modifiers
        if @modifiersContextObjects?
          for contextObject in @modifiersContextObjects
            @getGameSession().applyModifierContextObject(contextObject, @)

  onAddModifier:(modifier) ->
    # when index is not present, dev made a mistake
    modifierIndex = modifier.getIndex()
    if not modifierIndex?
      Logger.module("SDK").error @.getGameSession().gameId, "Entity.onAddModifier #{modifier.getType()} must be added through game session and not directly to unit!"

    # store modifier index
    if _.indexOf(@modifierIndices, modifierIndex, true) == -1
      @modifierIndices.push(modifierIndex)
      @modifierIndices = _.sortBy(@modifierIndices)

    # modifiers have changed
    @flushCachedModifiers()

    # flush cached attributes if modifier affects attribute buffs
    attributeBuffs = modifier.getAttributeBuffs()
    if attributeBuffs?
      for buffKey of attributeBuffs
        @flushCachedAttribute(buffKey)
    else if modifier.getBuffsAttributes() then @flushCachedAttributes()

    # flush cached description and keyword classes if modifier is inherent
    if modifier.getIsInherent()
      @flushCachedDescription()
      @flushCachedKeywordClasses()

  onRemoveModifier:(modifier) ->
    # remove from lists
    index = _.indexOf(@modifierIndices, modifier.getIndex(), true)
    if index >= 0
      @modifierIndices.splice(index, 1)
      @modifierIndices = _.sortBy(@modifierIndices)

    # modifiers have changed
    @flushCachedModifiers()

    # flush cached attributes if modifier affects attribute buffs
    attributeBuffs = modifier.getAttributeBuffs()
    if attributeBuffs?
      for buffKey of attributeBuffs
        @flushCachedAttribute(buffKey)
    else if modifier.getBuffsAttributes() then @flushCachedAttributes()

    # flush cached description and keyword classes if modifier is inherent
    if modifier.getIsInherent()
      @flushCachedDescription()
      @flushCachedKeywordClasses()

  getNumActiveModifiers: () ->
    count = 0
    for m in @getModifiers()
      if m? and m.getIsActive()
        count++

    return count

  getActiveModifiers:() ->
    modifiers = []

    for m in @getModifiers()
      if m? and m.getIsActive() then modifiers.push(m)

    return modifiers

  ###*
   * Returns a list of all keywords needed to explain this card.
   * @returns {Array}
  ###
  getKeywordClasses: () ->
    keywordClasses = @getCachedKeywordClasses().slice(0)

    # keyword classes from applied modifiers
    for modifier in @getModifiers()
      if modifier?
        modifierClass = modifier.constructor
        if modifierClass.isKeyworded and !_.contains(keywordClasses, modifierClass)
          keywordClasses.push(modifierClass)

    return keywordClasses

  ###*
   * Returns a list of all cached keywords from keywords to include and modifiers context objects.
   * @returns {Array}
  ###
  getCachedKeywordClasses: () ->
    if !@_private.cachedKeywordClasses?
      keywordClasses = @_private.cachedKeywordClasses = []
      silenced = @getIsSilenced()

      # manually included keyword classes
      for modifierClass in @_private.keywordClassesToInclude
        if (!@getIndex()? or !silenced or !modifierClass.prototype.isRemovable) and !_.contains(keywordClasses, modifierClass)
          keywordClasses.push(modifierClass)

      # reconstruct keyword classes from context objects
      if !@_private.cachedKeywordClassesFromContextObjects?
        @_private.cachedKeywordClassesFromContextObjects = []
        for contextObject in @modifiersContextObjects
          if contextObject? and !contextObject.isHiddenToUI
            modifierClass = @getGameSession().getModifierClassForType(contextObject.type)
            if modifierClass.isKeyworded
              @_private.cachedKeywordClassesFromContextObjects.push(modifierClass)

      # keyword classes from context objects
      for modifierClass in @_private.cachedKeywordClassesFromContextObjects
        if (!@getIndex()? or ((!silenced or !modifierClass.prototype.isRemovable) and @hasModifierType(modifierClass.type))) and !_.contains(keywordClasses, modifierClass)
          keywordClasses.push(modifierClass)

    return @_private.cachedKeywordClasses

  hasModifierIndex:(index) ->
    for m in @getModifiers()
      if m? and m.getIndex() == index then return true
    return false

  hasModifierType:(type) ->
    return @getModifierByType(type)?

  getModifierByType:(type) ->
    for m in @getModifiers()
      if m? and m.getType() == type then return m

  hasActiveModifierType:(type) ->
    return @getActiveModifierByType(type)?

  getActiveModifierByType:(type) ->
    for m in @getModifiers()
      if m? and m.getType() == type and m.getIsActive() then return m

  getActiveModifiersByType:(type) ->
    modifiers = []

    for m in @getModifiers()
      if m? and m.getType() == type and m.getIsActive() then modifiers.push(m)

    return modifiers

  getModifiersByType:(type) ->
    modifiers = []
    for m in @getModifiers()
      if m? and m.getType() == type then modifiers.push(m)
    return modifiers

  getNumModifiersOfType: (type) ->
    modifiers = 0

    for m in @getModifiers()
      if m? and m.getType() == type
        modifiers++

    return modifiers

  hasModifierStackType:(type) ->
    return @getModifierByStackType(type)?

  getModifierByStackType:(type) ->
    for m in @getModifiers()
      if m? and m.getStackType() == type then return m

  getActiveModifierByStackType:(type) ->
    for m in @getModifiers()
      if m? and m.getStackType() == type and m.getIsActive() then return m

  getActiveModifiersByStackType:(type) ->
    modifiers = []

    for m in @getModifiers()
      if m? and m.getStackType() == type and m.getIsActive() then modifiers.push(m)

    return modifiers

  getModifiersByStackType:(type) ->
    res = @_private.cachedModifiersByStackType[type]
    if !res?
      matchingModifiers = []
      for m in @getModifiers()
        if m? and m.getStackType() == type
          matchingModifiers.push(m)
      res = @_private.cachedModifiersByStackType[type] = matchingModifiers
    return res

  getNumModifiersOfStackType: (type) ->
    return @getModifiersByStackType(type).length

  getNumActiveModifiersOfStackType: (type) ->
    stacks = 0

    for m in @getModifiers()
      if m? and m.getIsActive() and m.getStackType() == type
        stacks++

    return stacks

  getNumModifiersOfArtifactStackType: (type) ->
    stacks = 0

    for m in @getModifiers()
      if m? and m.getArtifactStackType() == type
        stacks++

    return stacks

  getNumActiveModifiersOfArtifactStackType: (type) ->
    stacks = 0

    for m in @getModifiers()
      if m? and m.getIsActive() and m.getArtifactStackType() == type
        stacks++

    return stacks

  hasModifierClass:(modifierClass) ->
    if @getIndex()?
      return @getModifierByClass(modifierClass)?
    else
      return @hasModifierClassInContextObjects(modifierClass)

  getModifierByClass:(modifierClass) ->
    res = @_private.cachedModifierByClass[modifierClass.type]
    if !res?
      for m in @getModifiers()
        if m instanceof modifierClass
          matchingModifier = m
          break
      res = @_private.cachedModifierByClass[modifierClass.type] = matchingModifier
    return res

  hasActiveModifierClass:(modifierClass) ->
    return @getActiveModifierByClass(modifierClass)?

  getActiveModifierByClass:(modifierClass) ->
    for m in @getModifiers()
      if m instanceof modifierClass and m.getIsActive() then return m

  getActiveModifiersByClass:(modifierClass) ->
    modifiers = []

    for m in @getModifiers()
      if m instanceof modifierClass and m.getIsActive() then modifiers.push(m)

    return modifiers

  getModifiersByClass:(modifierClass) ->
    res = @_private.cachedModifiersByClass[modifierClass.type]
    if !res?
      matchingModifiers = []
      for m in @getModifiers()
        if m instanceof modifierClass
          matchingModifiers.push(m)
      res = @_private.cachedModifiersByClass[modifierClass.type] = matchingModifiers
    return res

  getNumModifiersOfClass:(modifierClass) ->
    return @getModifiersByClass(modifierClass).length

  getArtifactModifiers:() ->
    modifiers = []
    for m in @getModifiers()
      if m? and m.getIsFromArtifact() then modifiers.push(m)
    return modifiers

  getArtifactModifiersGroupedByArtifactCard:() ->
    return UtilsGameSession.groupModifiersBySourceCard(@getArtifactModifiers())

  getHasActiveArtifact:() ->
    for m in @getModifiers()
      if m? and m.getIsActive() and m.getIsFromArtifact()
        return true
    return false

  getHasModifiers: () ->
    return @getModifiers().length > 0

  getHasRemovableModifiers: () ->
    if @getHasModifiers()
      for modifier in @getModifiers()
        if modifier? and modifier.getIsRemovable() then return true

    return false

  silence: () ->
    # remove all removable modifiers
    for modifier in @getModifiers() by -1
      if modifier? and modifier.getIsRemovable()
        @getGameSession().removeModifier(modifier)

    # flush keywords for keyword classes to include
    @flushCachedKeywordClasses()

  # for now cleanse/dispel is just an alias for silence
  cleanse: @::silence
  dispel: @::silence

  getIsSilenced:() ->
    @_private.cachedIsSilenced ?= @hasModifierClass(ModifierSilence)
    return @_private.cachedIsSilenced

  #endregion ### MODIFIERS ###

  #region ### GAUNTLET MODIFIERS ###

  setModifiedGauntletRarities: (rarityIds) ->
    @_private.modifiedGauntletRarities = rarityIds

  getModifiedGauntletRarities: () ->
    return @_private.modifiedGauntletRarities

  setModifiedGauntletFactions: (factionIds) ->
    @_private.modifiedGauntletFactions = factionIds

  getModifiedGauntletFactions: () ->
    return @_private.modifiedGauntletFactions

  setModifiedGauntletCardTypes: (cardTypes) ->
    @_private.modifiedGauntletCardTypes = cardTypes

  getModifiedGauntletCardTypes: () ->
    return @_private.modifiedGauntletCardTypes

  # Restricts the next card choices to be the non neutral chosen gauntlet faction
  setModifiedGauntletOwnFactionFilter: (ownFactionFilter) ->
    @_private.modifiedGauntletOwnFactionFilter = ownFactionFilter

  getModifiedGauntletOwnFactionFilter: () ->
    return @_private.modifiedGauntletOwnFactionFilter


  #endregion ### GAUNTLET MODIFIERS ###

  # region ### STATS ###

  _getBuffedAttributeFromModifiers: (attributeValue, buffKey, modifiers, withAuras=true, stopAtBase=false, forAuras=false, stopAtNonAuraModifier=null) ->
    # separate modifiers into groups for order of application: rebasing, normal, auras
    rebasing = []
    normal = []
    auras = []
    for modifier in modifiers
      if !forAuras and modifier.getIsManagedByAura()
        if withAuras
          auras.push(modifier)
      else
        rebases = modifier.getRebasesAttribute(buffKey)
        if rebases
          rebasing.push(modifier)
        else
          normal.push(modifier)

        if !stopAtModifier and modifier.getIsAttributeFixed(buffKey)
          # FIRST fixed modifier blocks anything further
          stopAtModifier = modifier
        else if stopAtBase and (rebases or modifier.getBuffsAttributeAbsolutely(buffKey))
          # last rebasing or absolute modifier is the new base
          stopAtModifier = modifier

    if (stopAtBase and !stopAtModifier? and auras.length == 0) or (forAuras and stopAtNonAuraModifier? and !stopAtModifier?)
      # base is default value when not stopping at a modifier or
      # non aura modifier is stopping point when not stopping at an aura modifier
      return attributeValue
    else if !stopAtBase or stopAtModifier?
      # rebased stats only uses latest
      if rebasing.length > 0
        rebasingModifier = rebasing[rebasing.length - 1]
        attributeValue = rebasingModifier.getBuffedAttribute(attributeValue, buffKey)
        if stopAtBase and rebasingModifier == stopAtModifier and auras.length == 0
          # base is rebased value
          return attributeValue

      # apply normal modifiers
      for modifier in normal
        attributeValue = modifier.getBuffedAttribute(attributeValue, buffKey)
        if modifier == stopAtModifier
          return attributeValue

    # apply auras modifiers recursively
    if auras.length > 0
      attributeValue = @_getBuffedAttributeFromModifiers(attributeValue, buffKey, auras, withAuras=false, stopAtBase, forAuras=true, stopAtModifier)

    return attributeValue

  getBuffedAttribute: (attributeValue, buffKey, withAuras=true, clamped=true) ->
    if withAuras
      cachedValue = @_private.cachedBuffedAttributes[buffKey]
    else
      cachedValue = @_private.cachedBuffedAttributesWithoutAuras[buffKey]
    if cachedValue?
      # always use cached value
      attributeValue = cachedValue
    else
      # get buffed attribute from active modifiers
      attributeValue = @_getBuffedAttributeFromModifiers(attributeValue, buffKey, @getActiveModifiers(), withAuras)

      # cache value
      if withAuras
        @_private.cachedBuffedAttributes[buffKey] = attributeValue
      else
        @_private.cachedBuffedAttributesWithoutAuras[buffKey] = attributeValue

    # normally we don't want attributes to show as negative
    # so clamp them to 0 after applying all buffs / debuffs
    if clamped
      attributeValue = Math.max(0, attributeValue)

    return attributeValue

  getBaseAttribute: (attributeValue, buffKey, withAuras=true, clamped=true) ->
    cachedValue = @_private.cachedBaseAttributes[buffKey]
    if cachedValue?
      # always use cached value
      attributeValue = cachedValue
    else
      # get buffed attribute from active modifiers excluding auras and stopping at base
      attributeValue = @_getBuffedAttributeFromModifiers(attributeValue, buffKey, @getActiveModifiers(), withAuras, stopAtBase=true)

      # cache value
      @_private.cachedBaseAttributes[buffKey] = attributeValue

    # normally we don't want attributes to show as negative
    # so clamp them to 0 after applying all buffs / debuffs
    if clamped
      attributeValue = Math.max(0, attributeValue)

    return attributeValue

  # endregion ### STATS ###

  # region ### FOLLOWUP ACTIONS ###

  setFollowups: (val) ->
    @_private.followups = val

  getFollowups: (val) ->
    return @_private.followups

  clearFollowups: () ->
    @_private.followups = []
    @_private.followupCard = null

  removeCurrentFollowup: () ->
    @_private.followups.shift()
    @_private.followupCard = null

  getHasFollowups: () ->
    return @_private.followups.length > 0

  getNumFollowups: () ->
    return @_private.followups.length

  getIsFollowup: () ->
    return @getParentCard()?

  getPositionForFollowupSourcePosition: () ->
    return @getPosition()

  setFollowupSourcePosition: (followupSourcePosition) ->
    @_private.followupSourcePosition = followupSourcePosition

  getFollowupSourcePosition: () ->
    return @_private.followupSourcePosition

  setFollowupSourcePattern: (val) ->
    @_private.followupSourcePattern = val

  getFollowupSourcePattern: () ->
    return @_private.followupSourcePattern

  setFollowupConditions: (val) ->
    @_private.followupConditions = val

  getFollowupConditions: () ->
    return @_private.followupConditions

  getFollowupByIndex: (followupIndex) ->
    if @getHasFollowups()
      return @_private.followups[followupIndex]

  getCurrentFollowup: () ->
    if @getHasFollowups()
      return @getFollowupByIndex(0)

  getCurrentFollowupCard: () ->
    if !@_private.followupCard?
      followup = @getCurrentFollowup()
      if followup?
        # NOTE: this card is not actually played to board
        # this card is used for reference while the actual followup action's card will be played to board
        @_private.followupCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(followup)
        @injectFollowupPropertiesIntoCard(@_private.followupCard)

    return @_private.followupCard

  injectFollowupPropertiesIntoCard: (followupCard, followupIndex=0) ->
    if followupCard instanceof Card
      # set followup properties of action card by copying followup data into card
      currentFollowupData = @getFollowupByIndex(followupIndex)
      currentFollowupPrivateData = currentFollowupData._private
      if currentFollowupPrivateData?
        currentFollowupData = UtilsJavascript.fastExtend({}, currentFollowupData)
        delete currentFollowupData._private
        UtilsJavascript.fastExtend(followupCard._private, currentFollowupPrivateData)
      UtilsJavascript.fastExtend(followupCard, currentFollowupData)
      followupCard.setOwnerId(@getOwnerId())
      followupCard.setParentCard(@)
      followupCard.setBaseManaCost(0)
      followupCard.setFollowupSourcePosition(@getPositionForFollowupSourcePosition())
    return followupCard

  cleanFollowupPropertiesFromCard: (followupCard) ->
    if followupCard instanceof Card and followupCard.getIsFollowup()
      followupCard.setOwnerId(null)
      followupCard.setParentCard(null)
      followupCard.setBaseManaCost(@getLastBaseManaCost())
      followupCard.setFollowupSourcePosition(null)
    return followupCard

  getPassesConditionsForCurrentFollowup: () ->
    followupCard = @getCurrentFollowupCard()
    if followupCard?
      # check that the followup card has any valid play positions
      if followupCard.getValidTargetPositions().length == 0 then return false

      # a followup condition should be a function that returns a single truthy or falsy value
      # this card and its followup are passed as arguments to each condition function
      followupConditions = followupCard.getFollowupConditions()
      if followupConditions?
        if !_.isArray(followupConditions) then followupConditions = [followupConditions]

        for condition in followupConditions
          if !condition(@, followupCard) then return false

      # nothing failed, looks like followup is valid
      return true

    return false

  setParentCard: (parentCard) ->
    @parentCardIndex = parentCard?.getIndex()

  getParentCardIndex:() ->
    return @parentCardIndex

  getParentCard: () ->
    if @getParentCardIndex()?
      return @getGameSession().getCardByIndex(@getParentCardIndex())
    else
      return null

  addSubCard: (card) ->
    if card?
      # add card index to list of sub cards
      @subCardIndices ?= []
      @subCardIndices.push(card.getIndex())

      # ensure parent is set correctly
      card.setParentCard(@)

  getSubCardIndices: () ->
    return @subCardIndices or []

  getSubCards: (recursive) ->
    return @getGameSession().getCardsByIndices(@subCardIndices)

  ###*
   * Returns the card played to the board that caused this card to play.
   * NOTE: Can be this card!
   * @returns {Card}
   ###
  getRootCard: () ->
    currentCard = @
    while currentCard.getParentCard()?
      currentCard = currentCard.getParentCard()
    return currentCard

  ###*
   * Returns the first card, from this card to root card, matching type played to the board that caused this card to play.
   * NOTE: Can be this card!
   * @returns {Card|null}
   ###
  getAncestorCardOfType: (cardType) ->
    currentCard = @
    while currentCard? and !CardType.getAreCardTypesEqual(cardType, currentCard.getType())
      currentCard = currentCard.getParentCard()
    return currentCard

  getIsActionForCurrentFollowup: (action) ->
    # to be the action for the current followup of this card, an action must be:
    # - a play card action
    # - the played card's id must match the id of the next followup
    if action? and action instanceof PlayCardAction and action.getCard()?.getBaseCardId() == @getCurrentFollowup()?.id
      return true

    return false

  # endregion ### FOLLOWUP ACTIONS ###

  # region ACTION STATE RECORD

  getActionStateRecord: () ->
    if !@_private.actionStateRecord? and @getGameSession().getIsRunningOnClient()
      @_private.actionStateRecord = new ActionStateRecord()
    return @_private.actionStateRecord

  setupActionStateRecord: () ->
    actionStateRecord = @getActionStateRecord()
    if actionStateRecord? and @_private.actionStateRecordNeedsSetup
      @_private.actionStateRecordNeedsSetup = false
      # get properties to record for action
      actionPropertiesToRecord = @actionPropertiesForActionStateRecord()
      needsActionRecord = actionPropertiesToRecord? and Object.keys(actionPropertiesToRecord).length > 0
      if needsActionRecord
        actionStateRecord.setupToRecordStateOnEvent(EVENTS.update_cache_action, actionPropertiesToRecord)

      # get properties to record for resolve
      resolvePropertiesToRecord = @resolvePropertiesForActionStateRecord()
      needsResolveRecord = resolvePropertiesToRecord? and Object.keys(resolvePropertiesToRecord).length > 0
      if needsResolveRecord
        actionStateRecord.setupToRecordStateOnEvent(EVENTS.update_cache_step, resolvePropertiesToRecord)

  pauseOrResumeActionStateRecordByLocation: () ->
    actionStateRecord = @getActionStateRecord()
    if actionStateRecord?
      # card should only record state while in hand, in signature cards, or active on board
      if @getIsLocatedInHand() or @getIsLocatedInSignatureCards() or @getIsActive()
        # start listening to game session deferred event stream
        if !actionStateRecord.getIsListeningToEvents()
          actionStateRecord.startListeningToEvents(@getGameSession().getEventBus())
      else if actionStateRecord.getIsListeningToEvents()
        actionStateRecord.stopListeningToEvents()

  stopActionStateRecord: () ->
    actionStateRecord = @getActionStateRecord()
    if actionStateRecord? and actionStateRecord.getIsListeningToEvents()
      actionStateRecord.stopListeningToEvents()

  terminateActionStateRecord: () ->
    actionStateRecord = @getActionStateRecord()
    if actionStateRecord? and !@_private.actionStateRecordNeedsSetup
      @_private.actionStateRecordNeedsSetup = true
      actionStateRecord.teardownRecordingStateOnAllEvents()

  actionPropertiesForActionStateRecord: () ->
    # return map of property names to functions
    # where each function returns a value for the property name
    return {
      manaCost: @getManaCost.bind(@),
      isSilenced: @getIsSilenced.bind(@),
      modifierStacks: @getVisibleModifierStacks.bind(@),
      keywordClasses: @getKeywordClasses.bind(@)
    }

  resolvePropertiesForActionStateRecord: () ->
    # return map of property names to functions
    # where each function returns a value for the property name
    return {
      manaCost: @getManaCost.bind(@),
      isSilenced: @getIsSilenced.bind(@),
      modifierStacks: @getVisibleModifierStacks.bind(@),
      keywordClasses: @getKeywordClasses.bind(@)
    }

  # endregion ACTION STATE RECORD

  # region ### EVENT STREAM ###

  getIsListeningToEvents: () ->
    return @_private.listeningToEvents?

  startListeningToEvents: () ->
    @_private.listeningToEvents = true

    # flush event receiving cards
    # this ensures that cards react in order of play
    @getOwner().flushCachedEventReceivingCards()

    # setup action state record
    @setupActionStateRecord()

    # ensure card isn't always recording state
    @pauseOrResumeActionStateRecordByLocation()

  stopListeningToEvents: () ->
    @_private.listeningToEvents = false

    # flush event receiving cards
    # this ensures that cards react in order of play
    @getOwner().flushCachedEventReceivingCards()

    # stop recording action state
    @stopActionStateRecord()

  # endregion ### EVENT STREAM ###

  # region ### SERIALIZATION ###

  deserialize: (data) ->
    UtilsJavascript.fastExtend(this,data)

  postDeserialize: () ->
    # flush any cached values
    @flushAllCachedData()

    # it is not possible for an active card to have followups
    if @getIsActive()
      @clearFollowups()

    if !@getIsRemoved()
      # update cached state
      @updateCachedState()

      # plug into events
      @startListeningToEvents()

  ###*
  # Returns whether this card is scrubbable based on a perspective of the game.
  # @public
  # @param {String} scrubFromPerspectiveOfPlayerId
  # @param {Boolean} forSpectator
  # @return  {BOOL}  True/false.
  ###
  isScrubbable: (scrubFromPerspectiveOfPlayerId, forSpectator) ->
    if @getIsPlayed()
      # if it's a previously played card NO need to scrub
      return false
    else if @isSignatureCard()
      # if it's a signature card NO need to scrub
      return false
    else if @ownerId == scrubFromPerspectiveOfPlayerId
      if forSpectator and not @.getIsLocatedInHand()
        # if it's a for a player we're spectating but not located in the player's hand, scrub it
        return true
      else
        # if it's a for a player we're allowed to see, no need to scrub
        return false
    else
      # otherwise scrub it
      return true

  ###*
  # Sets the id of the card this should be hidden as for scrubbing.
  # @public
  # @param {Number} cardId
  ###
  setHideAsCardId: (cardId) ->
    @hideAsCardId = cardId

  ###*
  # Returns the id of the card this should be hidden as for scrubbing.
  # @public
  # @returns {Number} cardId
  ###
  getHideAsCardId: () ->
    return @hideAsCardId

  ###*
  # Returns whether this card is hideable.
  # @public
  # @return  {Boolean}
  ###
  isHideable: (scrubFromPerspectiveOfPlayerId, forSpectator) ->
    return @getIsPlayed() and @hideAsCardId? and @ownerId != scrubFromPerspectiveOfPlayerId

  ###*
  # Hides the card during scrubbing as another card.
  # @public
  # @return  {Card}
  ###
  createCardToHideAs: () ->
    # retain prismatic state
    hideAsCardId = @hideAsCardId
    if Cards.getIsPrismaticCardId(@getId())
      hideAsCardId = Cards.getPrismaticCardId(hideAsCardId)

    # create card that will hide this card
    hiddenCard = @getGameSession().createCardForIdentifier(hideAsCardId)

    # copy required properties
    hiddenCard.setIndex(@index)
    hiddenCard.setOwnerId(@ownerId)
    hiddenCard.setLocation(@location)

    # notify card it was created to hide this card
    hiddenCard.onCreatedToHide(@)

    return hiddenCard

  ###*
  # Method called automatically when this was created to hide a card.
  # @public
  # @param {Card} source
  ###
  onCreatedToHide: (source) ->
    # override in sub class to implement custom behavior

  setReferencedCardData: (cardData) ->
    @_private.referencedCardData = cardData

  getReferencedCardData: () ->
    return @_private.referencedCardData

  # endregion ### SERIALIZATION ###

module.exports = Card
