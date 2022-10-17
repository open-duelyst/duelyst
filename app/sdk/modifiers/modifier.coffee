SDKObject = require 'app/sdk/object'
Logger =       require 'app/common/logger'
CONFIG =       require 'app/common/config'
EVENTS =       require 'app/common/event_types'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsJavascript = require 'app/common/utils/utils_javascript'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
DieAction = require 'app/sdk/actions/dieAction'
ApplyModifierAction = require 'app/sdk/actions/applyModifierAction'
RemoveModifierAction = require 'app/sdk/actions/removeModifierAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'
_ = require 'underscore'

i18next = require 'i18next'

###
  An modifier is a modular element that modifies a card, giving them auras, abilities, buffs, debuffs, etc.
###
class Modifier extends SDKObject

  type:"Modifier"
  @type:"Modifier"
  @description: undefined
  @isHiddenToUI: false # whether or not this modifier is shown in the UI
  @isKeyworded: false # https://github.com/88dots/cleancoco/wiki/Glossary
  @modifierName: undefined

  activeInDeck: true # whether this modifier is active while applied to a card in deck
  activeInHand: true # whether this modifier is active while applied to a card in hand
  activeInSignatureCards: true # whether this modifier is active while applied to a card in signature cards
  activeOnBoard: true # whether this modifier is active while applied to a card on board
  appliedByActionIndex: -1 # index of action that applied this modifier, where -1 is during game setup
  appliedByModifierIndex: null # index of modifier that applied this modifier, where -1 is during game setup
  attributeBuffs: null
  attributeBuffsAbsolute: null #names of attributeBuffs to be treated as absolute values (instead of +- values)
  attributeBuffsRebased: null #names of attributeBuffs to be treated as new base stat values, applied before all other buffs
  attributeBuffsFixed: null #names of attributeBuffs to be treated as overrides (ignores further attributeBuffs of that type in the stack)
  auraFilterByCardIds: null # an array of cardIds to receive the aura
  auraFilterByCardType: CardType.Unit # only cards of this type receive the aura
  auraFilterByRaceIds: null # an array of raceIds to receive the aura
  auraFilterByModifierTypes: null # array of modifier types. only cards with these modifier types will receive the aura
  auraIncludeAlly: true # whether to include allied entities in aura
  auraIncludeBoard: true # whether to include cards on board in aura
  auraIncludeEnemy: true # whether to include enemy entities in aura
  auraIncludeGeneral: true # whether a General can be in this aura
  auraIncludeHand: false # whether to include cards in hand in aura
  auraIncludeSignatureCards: false # whether to include cards in signature cards in aura
  auraIncludeSelf: true # whether to include own card in aura
  auraRadius: 0 # radius around card to search for aura targets, when 0 will just return the card this is applied to
  auraModifierId: -1 # index used to determine whether aura modifier has been applied to a card
  cardAffectedIndex: null # card that is/was affected by modifier, and is always present once the modifier has been applied
  cardFXResource: null # fx resource that is added onto this modifier's card's fx resource, effectively overriding card's fx while this modifier is active on the card
  contextObject: null
  durationEndTurn: 0 # how many end of turns can elapse before this modifier is removed
  durationStartTurn: 0 # how many start of turns can elapse before this modifier is removed
  durationRespectsBonusTurns: true # whether duration will be extended with bonus turns
  durability: 0 # damage unit can take before this is destroyed
  numEndTurnsElapsed: 0 # how many end of turns have elapsed since this modifier was added
  numStartTurnsElapsed: 0 # how many start of turns have elapsed since this modifier was added
  fxResource: null # array of strings that map to fx data, ex: ["Modifiers.Buff"]
  hideAsModifierType: null # type of modifier to hide this modifier as during scrubbing
  index: null # unique index of modifier, set automatically by game session
  isAura: false # whether this may act like an aura
  isCloneable: true # whether this modifier can be cloned
  isHiddenToUI: false # whether or not this modifier is shown in the UI
  isInherent: false # true for modifiers which are inherent to an card
  isAdditionalInherent: false # true for modifiers which have been added as inherent modifiers from an external source
  isRemovable: true # whether this can be removed via effects like dispel (any modifier with a few exceptions)
  isRemoved: false # whether modifier has been removed
  isStacking: false # whether is stacking and able to react to actions/events
  maxDurability: 0 # durability is assumed infinite unless max durability is > 0
  maxStacks: CONFIG.INFINITY # maximum number of stacks possible, set to 1 for non stackable
  modifiersContextObjects: null # context objects for modifiers to be added automatically when modifier is activated by an action or modifier applies aura
  parentModifierIndex: null # index of parent modifier in game session's master list
  removedByActionIndex: -1 # index of action that removed this modifier, where -1 is during game setup
  removedByModifierIndex: -1 # index of modifier that removed this modifier, where -1 is during game setup
  resetsDamage: false # whether this modifier resets damage done
  sourceCardIndex: null
  subModifierIndices: null
  triggeredByActionsData: null # indices of all actions that triggered this modifier
  triggerActionsData: null # list of action indices that were applied by this modifier triggering, with parent action indices and resolve parent action indices
  triggerAppliedModifiersData: null # list of modifier indices that were applied by this modifier triggering, with action indices and resolve action indices
  triggerActivatedModifiersData: null # list of modifier indices that were activated by this modifier triggering, with action indices and resolve action indices
  triggerDeactivatedModifiersData: null # list of modifier indices that were deactivated by this modifier triggering, with action indices and resolve action indices
  triggerRemovedModifiersData: null # list of modifier indices that were removed by this modifier triggering, with action indices and resolve action indices

  constructor: (gameSession) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @subModifierIndices = []

    # copy prototype values down as needed
    if @auraFilterByCardIds? then @auraFilterByCardIds = UtilsJavascript.fastExtend([], @auraFilterByCardIds)
    if @auraFilterByRaceIds? then @auraFilterByRaceIds = UtilsJavascript.fastExtend([], @auraFilterByRaceIds)
    if @auraFilterByModifierTypes? then @auraFilterByModifierTypes = UtilsJavascript.fastExtend([], @auraFilterByModifierTypes)
    if @attributeBuffs? then @attributeBuffs = UtilsJavascript.fastExtend({}, @attributeBuffs)
    if @attributeBuffsAbsolute? then @attributeBuffsAbsolute = UtilsJavascript.fastExtend([], @attributeBuffsAbsolute)
    if @attributeBuffsRebased? then @attributeBuffsRebased = UtilsJavascript.fastExtend([], @attributeBuffsRebased)
    if @attributeBuffsFixed? then @attributeBuffsFixed = UtilsJavascript.fastExtend([], @attributeBuffsFixed)
    if @modifiersContextObjects? then @modifiersContextObjects = UtilsJavascript.fastExtend([], @modifiersContextObjects)
    if @fxResource? then @fxResource = UtilsJavascript.fastExtend([], @fxResource)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    # cache
    p.cachedAppliedName = null
    p.cachedAppliedDescription = null
    p.cachedCard = null # active card affected by modifier, modified by game session as modifier is applied/removed
    p.cachedCardAffected = null # card affected by modifier whether modifier has been removed or not
    p.cachedCardsInAura = []
    p.cachedCardsLeavingAura = []
    p.cardsInAuraDirty = false
    p.cachedDescription = null
    p.cachedIsActive = false
    p.cachedIsActiveInDeck = false
    p.cachedIsActiveInHand = false
    p.cachedIsActiveInLocation = false
    p.cachedWasActiveInLocation = false
    p.cachedIsActiveInSignatureCards = false
    p.cachedIsActiveOnBoard = false
    p.cachedName = null
    p.cachedSourceCard = null
    p.cachedStackType = null
    p.cachedSubModifiers = null # modifiers created and managed by this modifier
    p.cachedWasActive = false

    # resources and options for external systems
    p.animResource = null # custom anim resource to use on unit while this modifier is applied
    p.mergedFXResource = null # fx resource of modifier merged with source card's fx resource
    p.soundResource = null # custom sound resource to use on unit while this modifier is applied

    # misc
    p.listeningToEvents = false
    p.canConvertCardToPrismatic = true # whether this modifier can convert cards played by it into prismatics
    p.canConvertCardToSkinned = true # whether this modifier can convert cards played by it into skinned versions

    return p

  # region CONTEXT OBJECTS

  @createContextObject: (options) ->
    contextObject = UtilsJavascript.fastExtend({},options)
    contextObject.type = @type
    return contextObject

  @createContextObjectOnBoard: (options) ->
    contextObject = @createContextObject(options)
    contextObject.activeInHand = false
    contextObject.activeInDeck = false
    contextObject.activeInSignatureCards = false
    contextObject.activeOnBoard = true
    return contextObject

  @createContextObjectInDeckHand: (options) ->
    contextObject = @createContextObject(options)
    contextObject.activeInHand = true
    contextObject.activeInDeck = true
    contextObject.activeInSignatureCards = false
    contextObject.activeOnBoard = false
    return contextObject

  @createAttributeBuffsObject: (attackBuff=0,maxHPBuff=0) ->
    attributeBuffs = {}
    if attackBuff
      attributeBuffs.atk = attackBuff
    if maxHPBuff
      attributeBuffs.maxHP = maxHPBuff
    return attributeBuffs

  # helper method to create a context object with attribute buffs
  # NOTE: only safe to use when setting a stat to non-zero (0s are ignored when creating the buff object)
  @createContextObjectWithAttributeBuffs: (attack=0, maxHP=0, options) ->
    contextObject = @createContextObject(options)
    contextObject.attributeBuffs = Modifier.createAttributeBuffsObject(attack,maxHP)
    return contextObject

  @createContextObjectWithAbsoluteAttributeBuffs: (attack=0, maxHP=0, attackIsAbsolute=true, maxHPIsAbsolute=true, options) ->
    contextObject = @createContextObject(options)
    contextObject.attributeBuffs = Modifier.createAttributeBuffsObject(attack,maxHP)
    contextObject.attributeBuffsAbsolute = []
    if attackIsAbsolute then contextObject.attributeBuffsAbsolute.push("atk")
    if maxHPIsAbsolute then contextObject.attributeBuffsAbsolute.push("maxHP")
    return contextObject

  @createContextObjectWithRebasedAttributeBuffs: (attack=0, maxHP=0, attackIsRebased=true, maxHPIsRebased=true, options) ->
    contextObject = @createContextObject(options)
    contextObject.attributeBuffs = Modifier.createAttributeBuffsObject(attack,maxHP)
    contextObject.attributeBuffsRebased = []
    if attackIsRebased then contextObject.attributeBuffsRebased.push("atk")
    if maxHPIsRebased then contextObject.attributeBuffsRebased.push("maxHP")
    return contextObject

  @createContextObjectWithAura: (modifiersContextObjects, auraIncludeSelf=true, auraIncludeAlly=true, auraIncludeEnemy=true, auraIncludeGeneral=true, auraRadius=1, raceIds=null, cardIds=null, modifierTypes=null, description, options) ->
    contextObject = @createContextObjectOnBoard(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.isAura = true
    contextObject.auraIncludeSelf = auraIncludeSelf
    contextObject.auraIncludeAlly = auraIncludeAlly
    contextObject.auraIncludeEnemy = auraIncludeEnemy
    contextObject.auraIncludeGeneral = auraIncludeGeneral
    contextObject.auraRadius = auraRadius
    contextObject.auraFilterByRaceIds = raceIds
    contextObject.auraFilterByCardIds = cardIds
    contextObject.auraFilterByModifierTypes = modifierTypes
    contextObject.description = description
    return contextObject

  @createContextObjectWithAuraForNearbyAllies: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, false, true, false, false, 1, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithAuraForAllAllies: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, false, true, false, false, CONFIG.WHOLE_BOARD_RADIUS, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithAuraForAllAlliesAndSelf: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, true, true, false, false, CONFIG.WHOLE_BOARD_RADIUS, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithOnBoardAuraForAllAlliesAndSelf: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, true, true, false, false, CONFIG.WHOLE_BOARD_RADIUS, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithAuraForAllAlliesAndSelfAndGeneral: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, true, true, false, true, CONFIG.WHOLE_BOARD_RADIUS, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithOnBoardAuraForAllAlliesAndSelfAndGeneral: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, true, true, false, true, CONFIG.WHOLE_BOARD_RADIUS, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithAuraForNearbyEnemies: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, false, false, true, false, 1, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithOnBoardAuraForNearbyEnemies: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, false, false, true, false, 1, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithAuraForAllEnemies: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, false, false, true, false, CONFIG.WHOLE_BOARD_RADIUS, raceIds, cardIds, modifierTypes, description, options)

  @createContextObjectWithOnBoardAuraForAllEnemies: (modifiersContextObjects, raceIds, cardIds, modifierTypes, description, options) ->
    return @createContextObjectWithAura(modifiersContextObjects, false, false, true, false, CONFIG.WHOLE_BOARD_RADIUS, raceIds, cardIds, modifierTypes, description, options)

  # endregion CONTEXT OBJECTS

  # region EVENTS

  ###*
   * SDK event handler. Do not call this method manually.
   ###
  onEvent: (event) ->
    if @_private.listeningToEvents
      eventType = event.type
      if eventType == EVENTS.terminate or eventType == EVENTS.before_deserialize
        @_onTerminate(event)
      else if eventType == EVENTS.modify_action_for_validation
        @_onModifyActionForValidation(event)
      else if eventType == EVENTS.validate_action
        @_onValidateAction(event)
      else if eventType == EVENTS.modify_action_for_execution
        @_onModifyActionForExecution(event)
      else if eventType == EVENTS.before_action
        @_onBeforeAction(event)
      else if eventType == EVENTS.action
        @_onAction(event)
      else if eventType == EVENTS.after_action
        @_onAfterAction(event)
      else if eventType == EVENTS.modifier_end_turn_duration_change
        @_onEndTurnDurationChange(event)
      else if eventType == EVENTS.modifier_start_turn_duration_change
        @_onStartTurnDurationChange(event)
      else if eventType == EVENTS.after_cleanup_action
        @_onAfterCleanupAction(event)
      else if eventType == EVENTS.modifier_active_change
        @_onActiveChange(event)
      else if eventType == EVENTS.modifier_remove_aura
        @_onRemoveAura(event)
      else if eventType == EVENTS.modifier_add_aura
        @_onAddAura(event)
      else if eventType == EVENTS.start_turn
        @_onStartTurn(event)
      else if eventType == EVENTS.end_turn
        @_onEndTurn(event)

  # endregion EVENTS

  # region APPLY / REMOVE

  onApplyToCard: (card) ->
    @setCard(card)
    @startListeningToEvents()
    @onApplyToCardBeforeSyncState()
    @syncState()

  onApplyToCardBeforeSyncState: () ->
    # override in sub class to do something on apply to card before syncing state

  onRemoveFromCard: () ->
    # set removed and sync
    @setIsRemoved(true)
    @onRemoveFromCardBeforeSyncState()
    @syncState()

    # remove sub modifiers
    subModifiers = @getSubModifiers()
    if subModifiers.length > 0
      @getGameSession().pushTriggeringModifierOntoStack(@)
      for modifier in subModifiers by -1
        if modifier?
          @getGameSession().removeModifier(modifier)
      @getGameSession().popTriggeringModifierFromStack()

    # remove card after deactivate so that deactivate can continue to reference
    @setCard(null)

    # remove self from parent
    @removeFromParentModifier()

    # terminate self
    @_onTerminate()

  onRemoveFromCardBeforeSyncState: () ->
    # override in sub class to do something on remove from card before syncing state

  onMoveToCard: (card) ->
    # simulate remove
    @setIsRemoved(true)
    @onRemoveFromCardBeforeSyncState()
    @syncState()

    # simulate add
    @setCard(card)
    @onApplyToCardBeforeSyncState()
    @syncState()

  onActivate: () ->
    # set triggering relationship
    executingAction = @getGameSession().getExecutingAction()
    executingResolveAction = @getGameSession().getExecutingResolveAction()
    if executingAction? and executingResolveAction?
      triggeringModifier = @getGameSession().getTriggeringModifier()
      if triggeringModifier instanceof Modifier and !(executingAction instanceof ApplyModifierAction) and (!(executingAction instanceof ApplyCardToBoardAction) or executingAction.getCard() != @getCard())
        triggeringModifier.onTriggerActivatedModifier(@, executingAction, executingResolveAction)
      else
        # set modifier as activated by this action
        executingAction.onActivatedModifier(@, executingResolveAction)
        executingResolveAction.onResolveActivatedModifier(@, executingAction)

    if @getResetsDamage()
      @getCard().resetDamage()

    # change for attribute buffs
    if @attributeBuffs? and @getCard()? and CardType.getIsEntityCardType(@getCard().getType())
      # update attributes
      for buffKey,buffValue of @attributeBuffs
        # flush cached attribute
        @getCard().flushCachedAttribute(buffKey)

        # handle specific attribute changes
        if buffKey == "speed"
          @getCard().flushCachedMovementPattern()
        else if buffKey == "reach"
          @getCard().flushCachedAttackPattern()
        else if buffKey == "maxHP" and @getCard().getIsActive() and @getGameSession().getActiveCard() != @getCard() and @getCard().getHP() <= 0 and @getGameSession().getCanCardBeScheduledForRemoval(@getCard())
          # when this buffs hp to 0, kill entity
          @getGameSession().executeAction(@getCard().actionDie())

  onDeactivate: () ->
    # set triggering relationship
    executingAction = @getGameSession().getExecutingAction()
    executingResolveAction = @getGameSession().getExecutingResolveAction()
    if executingAction? and executingResolveAction?
      triggeringModifier = @getGameSession().getTriggeringModifier()
      if triggeringModifier instanceof Modifier and !(executingAction instanceof RemoveModifierAction) and (!(executingAction instanceof ApplyCardToBoardAction) or executingAction.getCard() != @getCard())
        triggeringModifier.onTriggerDeactivatedModifier(@, executingAction, executingResolveAction)
      else
        # set modifier as deactivated by this action
        executingAction.onDeactivatedModifier(@, executingResolveAction)
        executingResolveAction.onResolveDeactivatedModifier(@, executingAction)

    # change for attribute buffs
    if @attributeBuffs? and @getCard()? and CardType.getIsEntityCardType(@getCard().getType())
      for buffKey,buffValue of @attributeBuffs
        # flush cached attribute
        @getCard().flushCachedAttribute(buffKey)

        # handle specific attribute changes
        if (buffKey == "speed")
          @getCard().flushCachedMovementPattern()
        else if (buffKey == "reach")
          @getCard().flushCachedAttackPattern()
        else if buffKey == "maxHP" and @getCard().getIsActive() and @getGameSession().getActiveCard() != @getCard() and @getCard().getHP() <= 0 and @getGameSession().getCanCardBeScheduledForRemoval(@getCard())
          # when max hp buff is removed and entity is at 0 hp, kill it
          @getGameSession().executeAction(@getCard().actionDie())

  onChangeOwner: (fromOwnerId, toOwnerId) ->
    # if this modifier's is controlling any non aura modifiers on a general, swap them to the new general
    # (ex: this entity was reducing the cost of opponent's spells by 1, now it reduces cost of my spells by 1)
    # (ex: this entity was buffing my old general, now it buffs my new general)
    for subModifier in @getSubModifiers()
      if !subModifier.getIsManagedByAura()
        card = subModifier.getCard()
        if card? and CardType.getIsEntityCardType(card.getType()) and card.getIsGeneral()
          playerId = card.getOwnerId()
          if playerId?
            # the owner id we're changing to is the same as the card
            # we know we need to swap to the opponent player's general
            # otherwise we need to swap to this player's new general
            if playerId == toOwnerId
              newOwner = @getGameSession().getOpponentPlayerOfPlayerId(toOwnerId)
            else
              newOwner = @getGameSession().getPlayerById(toOwnerId)
            newGeneral = @getGameSession().getGeneralForPlayerId(newOwner.getPlayerId())
            @getGameSession().moveModifierToCard(subModifier, newGeneral)

  # endregion APPLY / REMOVE

  # region GETTERS / SETTERS

  getCard: () ->
    return @_private.cachedCard

  setCard: (card) ->
    @_private.cachedCard = card

    # when card changes to a valid value
    if @getCard()?
      # card affected index should always be present once modifier has been applied
      # this way, even after modifier is removed, we always know what it was last applied to
      @cardAffectedIndex = @getCard().getIndex()
      @_private.cachedCardAffected = null
      @flushCachedNamesAndDescriptions()

  getCardAffectedIndex: () ->
    return @cardAffectedIndex

  getCardAffected: () ->
    if !@_private.cachedCardAffected? && @cardAffectedIndex?
      @_private.cachedCardAffected = @getGameSession().getCardByIndex(@cardAffectedIndex)
    return @_private.cachedCardAffected

  @getIsKeyworded: () ->
    return @isKeyworded

  getIsKeyworded: () ->
    return @constructor.isKeyworded

  getLogName: () ->
    return "#{@getType().replace(' ','_')}[#{@getIndex()}]"

  getIndex: () ->
    return @index

  setIndex: (index) ->
    @index = index

  getOwner: () ->
    return @getCard()?.getOwner()

  getOwnerId: () ->
    return @getCard()?.getOwnerId()

  setModifiersContextObjects: (val) ->
    @modifiersContextObjects = val

  getModifiersContextObjects: () ->
    return @modifiersContextObjects

  ###
  * Get all other modifiers that a modifier must coordinate with
  * these include all modifiers:
  * - applied to cards owned by the same player
  * - of the same class
  * - that are active
  * - applied after this modifier
  * @param {Modifier} [modifierClass=own class]
  * @returns {Array}
  ###
  getModifiersToCoordinateWith: (modifierClass) ->
    modifiers = []
    card = @getCard()
    if card?
      board = @getGameSession().getBoard()
      modifierClass ?= @constructor
      ownerId = card.getOwnerId()
      appliedByActionIndex = @getAppliedByActionIndex()
      for c in board.getCards(null, allowUntargetable=true)
        if c.getOwnerId() == ownerId
          for m in c.getModifiers()
            if m instanceof modifierClass and m.getIsActive() and m != @
              modifierAppliedByActionIndex = m.getAppliedByActionIndex()
              if modifierAppliedByActionIndex > appliedByActionIndex or (appliedByActionIndex == -1 and modifierAppliedByActionIndex == -1 and m.getIndex() > @getIndex())
                modifiers.push(m)
    return modifiers

  ###*
   * Creates a context object to make a new/fresh copy of an existing modifier.
   * @returns {Object} contextObject
  ###
  createNewContextObject: () ->
    contextObject = {}

    # copy properties from existing context object
    if @contextObject?
      keys = Object.keys(@contextObject)
      for key in keys
        property = @contextObject[key]
        contextObject[key] = property

    # make sure that following properties don't get serialized
    Object.defineProperty(contextObject, '_hasBeenApplied', {
      enumerable: false,
      writable: true
    })

    contextObject.type = @type

    return contextObject

  ###*
   * Returns a list of keys of properties that should be copied from this modifier when creating a context object for copying this modifier.
   * @returns {Array} keys
  ###
  getContextObjectKeysForCopy: () ->
    return [
      "index"
      "cardAffectedIndex"
      "parentModifierIndex"
      "sourceCardIndex"
      "isRemoved"
      "auraModifierId"
      "numEndTurnsElapsed"
      "numStartTurnsElapsed"
      "maxDurability"
      "durability"
    ]

  ###*
   * Creates a context object to exactly replicate this modifier, optionally from existing context object.
   * @param {Object} existingContextObject
   * @returns {Object} contextObject
  ###
  createContextObject: (existingContextObject) ->
    contextObject = @createNewContextObject()

    if existingContextObject? and _.isObject(existingContextObject)
      UtilsJavascript.fastExtend(contextObject, existingContextObject)

    # copy properties from modifier
    for key in @getContextObjectKeysForCopy()
      # only set certain properties on context object if they differ from the prototype, i.e. they are not DEFAULTS
      # this is done by checking if this object has it's won property (different than prototype) or is using the prototype
      if @.hasOwnProperty(key)
        val = @[key]
        if _.isArray(val)
          contextObject[key] = val.slice(0)
        else if _.isObject(val)
          cardData[key] = UtilsJavascript.fastExtend({}, val)
        else
          contextObject[key] = val

    # add all sub modifier context objects
    subModifiers = @getSubModifiers()
    if subModifiers? and subModifiers.length > 0
      contextObject.subModifierIndices = @subModifierIndices.slice(0)
      contextObject.subModifiersContextObjects = []
      for modifier in subModifiers
        if modifier?
          contextObject.subModifiersContextObjects.push(modifier.createContextObject())

    return contextObject

  ###*
   * Updates context object from this modifier after being applied to deck/hand/board.
   * @param {Object} contextObject
   * @returns {Object} contextObject
  ###
  updateContextObjectPostApply: (contextObject) ->
    if contextObject?
      contextObject.index = @getIndex()

    return contextObject

  ###*
   * Returns a list of keys of properties that should be deleted from a context object created for a clone of this modifier.
   * @returns {Array} keys
  ###
  getContextObjectKeysToDeleteForClone: () ->
    return [
      "index"
      "isRemoved"
      "cardAffectedIndex"
      "parentModifierIndex"
      "subModifierIndices"
      "subModifiersContextObjects"
      "auraModifierId"
    ]

  ###*
   * Creates a context object to clone an existing modifier.
   * @param {Object} [contextObject=null]
   * @returns {Object} contextObject
  ###
  createContextObjectForClone: (contextObject) ->
    contextObject = @createContextObject(contextObject)

    for key in @getContextObjectKeysToDeleteForClone()
      delete contextObject[key]

    return contextObject

  ###*
   * Copies context object into this modifier
   * @param {Object} contextObject
  ###
  applyContextObject: (contextObject) ->
    if contextObject? and _.isObject(contextObject) and !contextObject._hasBeenApplied
      # copy properties from context object
      keys = Object.keys(contextObject)
      for key in keys
        property = contextObject[key]
        # only overwrite attributes on this object from contextObject data when the value is differen than what's already there
        # this is important so that we don't define an 'own' property on a JS object that will be serialized even though it
        # might be the same as the prototype value
        if @[key] != property
          @[key] = property

      # make sure that following properties don't get serialized
      Object.defineProperty(contextObject, '_hasBeenApplied', {
        enumerable: false,
        writable: true
      })

      if contextObject.type
        @.type = contextObject.type

      # flag data as having been applied so we never apply more than once
      contextObject._hasBeenApplied = true

      # delete properties that shouldn't be retained on this modifier
      delete @subModifiersContextObjects

      # regenerate sub modifiers as needed
      if contextObject.subModifiersContextObjects?
        subModifierIndices = @getSubModifierIndices()
        if subModifierIndices.length > 0
          for subModifierIndex in subModifierIndices.slice(0)
            subModifier = @getGameSession().getModifierByIndex(subModifierIndex)
            if !subModifier?
              # sub modifier index present but no modifier found
              for subModifierContextObject in contextObject.subModifiersContextObjects
                # use context object with matching index to regenerate sub modifier
                if subModifierContextObject.index? and subModifierContextObject.index == subModifierIndex
                  cardAffected = @getGameSession().getCardByIndex(subModifierContextObject.cardAffectedIndex)
                  if cardAffected?
                    @getGameSession().applyModifierContextObject(subModifierContextObject, cardAffected, @)

      # save copy of context object so we can generate new context object
      @contextObject = UtilsJavascript.deepCopy(contextObject)

      # delete properties saved copy of context object should not retain
      for key in @getContextObjectKeysForCopy()
        delete @contextObject[key]
      delete @contextObject.subModifierIndices
      delete @contextObject.subModifiersContextObjects
      delete @contextObject._hasBeenApplied

      @flushCachedNamesAndDescriptions()

  getIsInherent: () ->
    return @isInherent

  getIsAdditionalInherent: () ->
    return @isAdditionalInherent

  getIsHiddenToUI: () ->
    return @constructor.isHiddenToUI or @isHiddenToUI

  getIsRemovable: () ->
    # modifiers with parent modifiers are non-removable
    # removing their parent modifier will remove them
    return @isRemovable and !@getParentModifierIndex()?

  getType: () ->
    return @type

  getIsRemoved: () ->
    return @isRemoved

  setIsRemoved: (val) ->
    @isRemoved = val

  setNumEndTurnsElapsed: (val) ->
    @numEndTurnsElapsed = val

  setNumStartTurnsElapsed: (val) ->
    @numStartTurnsElapsed = val

  ###
  # TODO: replace all name/description methods with consolidated methods
  getName: () ->
    if @appliedName
      return @appliedName
    else if @modifierName
      return @modifierName
    else
      sourceCard = @getSourceCard()
      if sourceCard?
        return sourceCard.getName()
      else
        return @getType()

  getDescription: () ->
    description = ""

    if @appliedDescription?
      description = @appliedDescription
    else if @description?
      description = @description
    else if @attributeBuffs?
      # TODO: account for manaCost and speed
      description = Stringifiers.stringifyAttackHealthBuff(@attributeBuffs.atk, @attributeBuffs.maxHP)
    else if @modifiersContextObjects?
      # return a description generated from the descriptions of all sub-context objects
      for contextObject in @modifiersContextObjects
        description += contextObject.getDescription() + ", "
      if description.length > 0 then description = description.substring(0, description.length - 2)
    else
      sourceCard = @getSourceCard()
      if sourceCard?
        description = sourceCard.getDescription()

    return description
  ###

  @getName: (contextObject) ->
    if (contextObject and contextObject.modifierName)
      return if i18next.exists(contextObject.modifierName) then i18next.t(contextObject.modifierName) else contextObject.modifierName
    else if this.modifierName?
      return if i18next.exists(this.modifierName) then i18next.t(this.modifierName) else this.modifierName
    else return this.modifierName
  #This either gives the modifier's name, or if that doesn't exist, the source played cards name
  #-this lets us use spell name/description for modifiers created by spells
  getName: (contextObject) ->
    # Much like getDescription, uses multiple possible sources for name in the following priority
    # 0. Any context object set name (using first the passed in context object, second this instance's context object)
    # 1. Class level name
    # 2. Source cards name (used for spell applied modifiers)
    contextObject ?= @contextObject
    if !@_private.cachedName? or contextObject != @contextObject
      @_private.cachedName = this.constructor.getName(contextObject) or @getSourceCard()?.getName()
    return @_private.cachedName

  getIsActive: () ->
    return @_private.cachedIsActive

  # override for special description behavior
  @getDescription: (contextObject, ModifierFactory) ->
    if contextObject
      if contextObject.description?
        return if i18next.exists(contextObject.description) then i18next.t(contextObject.description) else contextObject.description
      else if contextObject.modifiersContextObjects?
        # return a description generated from the descriptions of all sub-context objects
        description = ""
        for contextObject in contextObject.modifiersContextObjects
          modifierClass = ModifierFactory.modifierClassForType(contextObject.type)
          description += modifierClass.getDescription(contextObject, ModifierFactory) + ", "
        if description.length > 0 then description = description.substring(0, description.length - 2)
        return description

    return @description

  # don't override this, override static method instead
  getDescription: (contextObject) ->
    #This will create the description with the following priority:
    # 0. Any description manually set on context object (using first the passed in context object, second this instance's context object)
    # 1. Class level description
    # 2. Using the source cards description (used for spells atm)
    contextObject ?= @contextObject
    if !@_private.cachedDescription? or contextObject != @contextObject
      @_private.cachedDescription = this.constructor.getDescription(contextObject, @getGameSession().getModifierFactory()) or @getSourceCard()?.getDescription()
    return @_private.cachedDescription

  # get the name shown for this modifier when it is applied to a unit
  @getAppliedName: (contextObject) ->
    appliedName = undefined
    if (contextObject and contextObject.appliedName)
      appliedName = if i18next.exists(contextObject.appliedName) then i18next.t(contextObject.appliedName) else contextObject.appliedName
    else if @appliedName?
      appliedName = if i18next.exists(@appliedName) then i18next.t(@appliedName) else @appliedName
    else
      appliedName = @appliedName
    # if there is no applied name, default to modifierName
    if appliedName
      return appliedName
    else
      return @getName(contextObject)

  # get the name shown for this modifier when it is applied to a unit
  getAppliedName: (contextObject) ->
    contextObject ?= @contextObject
    if !@_private.cachedAppliedName? or contextObject != @contextObject
      @_private.cachedAppliedName = @constructor.getAppliedName(contextObject) or @appliedName or @getType()
    return @_private.cachedAppliedName

  # get the description shown when this modifier is applied to a unit
  @getAppliedDescription: (contextObject, ModifierFactory) ->
    appliedDescription = undefined
    if (contextObject and contextObject.appliedDescription)
      appliedDescription = if i18next.exists(contextObject.appliedDescription) then i18next.t(contextObject.appliedDescription) else contextObject.appliedDescription
    else if @appliedDescription?
      appliedDescription = if i18next.exists(@appliedDescription) then i18next.t(@appliedDescription) else @appliedDescription
    else
      appliedDescription = @appliedDescription

    # if there is no applied description and there is an attributes buff, assume it is a simple stat buff
    if !appliedDescription? and contextObject and contextObject.attributeBuffs and (contextObject.attributeBuffs.atk? or contextObject.attributeBuffs.maxHP?)
      return Stringifiers.stringifyAttackHealthBuff(contextObject.attributeBuffs.atk,contextObject.attributeBuffs.maxHP)

    # default to modifier description if no applied description
    if appliedDescription
      return appliedDescription
    else
      return @getDescription(contextObject, ModifierFactory)

  getAppliedDescription: (contextObject) ->
    contextObject ?= @contextObject
    if !@_private.cachedAppliedDescription? or contextObject != @contextObject
      @_private.cachedAppliedDescription = @constructor.getAppliedDescription(contextObject, @getGameSession().getModifierFactory()) or @appliedDescription
    return @_private.cachedAppliedDescription

  @getKeywordDefinition: () ->
    return this.keywordDefinition

  getAnimResource: () ->
    return @_private.animResource

  getSoundResource: () ->
    return @_private.soundResource

  setFXResource: (fxResource) ->
    @fxResource = fxResource

  getFXResource: () ->
    if !@_private.mergedFXResource?
      @_private.mergedFXResource = @fxResource || []

      # try to merge with source card's fx resource if this is not an inherent modifier
      if !@isInherent
        # this should not be a modifier applied by an action that was created by a triggering modifier
        appliedByAction = @getAppliedByAction()
        if !appliedByAction or !appliedByAction.getTriggeringModifierIndex()?
          sourceCard = @getSourceCard()
          if sourceCard? then @_private.mergedFXResource = _.union(sourceCard.getFXResource(), @_private.mergedFXResource)

    return @_private.mergedFXResource

  getCardFXResource: () ->
    return @cardFXResource

  getNumOfType: () ->
    if @getCard()?
      return @getCard().getNumModifiersOfType(@type)
    else
      return 0

  getStacks: () ->
    if @getCard()?
      return @getCard().getNumModifiersOfStackType(@getStackType())
    else
      return 0

  getMaxStacks: () ->
    return @maxStacks

  getIsStacking: () ->
    return @isStacking

  _getNumStacksPreceding: () ->
    stacks = 0
    stackType = @getStackType()
    for modifier in @getCard().getActiveModifiers()
      if modifier is @
        break
      else if modifier.getIsStacking() and modifier.getStackType() == stackType
        stacks++

    return stacks

  getStackType: () ->
    if !@_private.cachedStackType?
      stackType = @getType()

      # get description for this modifier only from modifier class
      # get description from this modifier attempts to use source card
      # which is not always set or valid, and can cause stacking issues
      description = @constructor.getDescription(@contextObject, @getGameSession().getModifierFactory())
      if description? and description.length > 0
        stackType += description
      else if @attributeBuffs?
        # get names of all attributes buffed
        attributesBuffed = []
        for buffKey of @attributeBuffs
          attributesBuffed.push(buffKey)

        if attributesBuffed.length > 0
          # sort alphabetically
          attributesBuffed.sort()

          # add each to stack type
          for buffKey in attributesBuffed
            stackType += "_" + buffKey + @attributeBuffs[buffKey]

      @_private.cachedStackType = stackType
    return @_private.cachedStackType

  getArtifactStackType: () ->
    if !@getIsFromArtifact()
      return undefined

    # Stack type from artifact name for if we choose to do effect per artifact in future
#    return @getSourceCard.getName()

    # Generic stack type so all artifacts count as same type
    return "ArtifactStackType"

  # endregion GETTERS / SETTERS

  #===== / ======

  ### CACHE ###

  ###*
   * Syncs this modifier to the latest game state.
   ###
  syncState: () ->
    @_onActiveChange()
    @_onRemoveAura()
    @_onAddAura()

  ###*
   * Updates all values that should be cached between modifier active change phases.
   ###
  updateCachedState: () ->
    @updateCachedStateBeforeActive()
    @_private.cachedWasActive = @_private.cachedIsActive
    @_private.cachedIsActive = @getIsActiveForCache()
    if @_private.cachedWasActive != @_private.cachedIsActive and @getCard()?
      @getCard().flushCachedVisibleModifierStacks()
    @updateCachedStateAfterActive()

  updateCachedStateBeforeActive: () ->
    # override to update cached state before determining active state
    if @getCard()?
      @isStacking = @getIsStackingForCache()
      @_private.cardsInAuraDirty = true
      @_private.cachedWasActiveInLocation = @_private.cachedIsActiveInLocation
      @_private.cachedIsActiveOnBoard = @getIsOnBoardAndActiveForCache()
      @_private.cachedIsActiveInHand = @getIsInHandAndActiveForCache()
      @_private.cachedIsActiveInDeck = @getIsInDeckAndActiveForCache()
      @_private.cachedIsActiveInSignatureCards = @getIsInSignatureCardsAndActiveForCache()
      @_private.cachedIsActiveInLocation = @_private.cachedIsActiveOnBoard or @_private.cachedIsActiveInHand or @_private.cachedIsActiveInDeck or @_private.cachedIsActiveInSignatureCards
    else
      @isStacking = @_private.cardsInAuraDirty = @_private.cachedIsActiveOnBoard = @_private.cachedIsActiveInHand = @_private.cachedIsActiveInDeck = @_private.cachedIsActiveInLocation = false

  updateCachedStateAfterActive: () ->
    # override to update cached state after determining active state

  getIsStackingForCache: () ->
    # assume this modifier stacks
    wasStacking = @isStacking
    isStacking = true

    # when this modifier has a max stack count
    # walk through modifiers on the same card that this modifier affects
    # only allow this modifier to become active if we haven't found max stacks worth of active modifiers
    maxStacks = @getMaxStacks()
    numStacksPreceding = @_getNumStacksPreceding()
    if maxStacks != CONFIG.INFINITY and numStacksPreceding >= maxStacks
      isStacking = false

    return isStacking

  getIsActiveForCache: () ->
    return @getCard()? and @getGameSession().isActive() and @getIsAllowedToBeActiveForCache() and !@getIsRemoved() and @_private.cachedIsActiveInLocation and @getIsStacking()

  getIsAllowedToBeActiveForCache: () ->
    # override in sub class to implement custom disable behavior
    parentModifier = @getParentModifier()
    if parentModifier?
      return parentModifier.getAreSubModifiersActiveForCache()
    else
      return true

  getAreSubModifiersActiveForCache: () ->
    # override in sub class to force sub modifiers to be inactive
    return true

  getIsInHandAndActiveForCache: () ->
    return @getCard().getIsLocatedInHand() and @activeInHand

  getIsInDeckAndActiveForCache: () ->
    return @getCard().getIsLocatedInDeck() and @activeInDeck

  getIsInSignatureCardsAndActiveForCache: () ->
    return @getCard().getIsLocatedInSignatureCards() and @activeInSignatureCards

  getIsOnBoardAndActiveForCache: () ->
    return @getCard().getIsLocatedOnBoard() and @activeOnBoard

  flushAllCachedData: () ->
    @flushCachedNamesAndDescriptions()

  flushCachedNamesAndDescriptions: () ->
    @_private.cachedName = null
    @_private.cachedDescription = null
    @_private.cachedAppliedName = null
    @_private.cachedAppliedDescription = null
    @_private.cachedStackType = null

  #===== / ======

  ### SOURCE CARD ###

  setSourceCardIndex: (index) ->
    # only ever set source card index once
    @sourceCardIndex ?= index

  getSourceCardIndex: () ->
    return @sourceCardIndex

  getSourceCard: () ->
    if !@_private.cachedSourceCard?
      sourceCardIndex = @getSourceCardIndex()
      if sourceCardIndex?
        @_private.cachedSourceCard = @getGameSession().getCardByIndex(sourceCardIndex)
    return @_private.cachedSourceCard

  #===== / ======

  ### PARENT / SUB MODIFIERS ###

  setParentModifier: (modifier) ->
    if !@isRemoved
      @parentModifierIndex = modifier?.getIndex()

  getParentModifier: () ->
    if @parentModifierIndex? then @getGameSession().getModifierByIndex(@parentModifierIndex)

  getParentModifierIndex: () ->
    return @parentModifierIndex

  setAppliedByModifier: (modifier) ->
    @appliedByModifierIndex = modifier.getIndex()

  getAppliedByModifier: () ->
    if @appliedByModifierIndex > -1
      return @getGameSession().getModifierByIndex(@appliedByModifierIndex)

  getAppliedByModifierIndex: () ->
    return @appliedByModifierIndex

  setRemovedByModifier: (modifier) ->
    @removedByModifierIndex = modifier.getIndex()

  getRemovedByModifier: () ->
    if @removedByModifierIndex > -1
      return @getGameSession().getModifierByIndex(@removedByModifierIndex)

  getRemovedByModifierIndex: () ->
    return @removedByModifierIndex

  addSubModifier: (modifier) ->
    if modifier?
      # add modifier to list of sub modifiers
      modifierIndex = modifier.getIndex()
      if !_.contains(@subModifierIndices, modifierIndex)
        @subModifierIndices.push(modifierIndex)
        @subModifierIndices = _.sortBy(@subModifierIndices)

      # ensure parent is set correctly
      modifier.setParentModifier(@)
      modifier.setAppliedByModifier(@)

      # reset cached sub modifiers
      @_private.cachedSubModifiers = null

  removeSubModifier: (modifier) ->
    if modifier?
      # remove modifier from list of sub modifiers
      modifierIndex = modifier.getIndex()
      index = _.indexOf(@subModifierIndices, modifierIndex)
      if index >= 0
        @subModifierIndices.splice(index, 1)
        @subModifierIndices = _.sortBy(@subModifierIndices)

      # ensure parent is cleared correctly
      modifier.setRemovedByModifier(@)
      modifier.setParentModifier(null)

      # reset cached sub modifiers
      @_private.cachedSubModifiers = null

  removeFromParentModifier: () ->
    if @parentModifierIndex?
      parentModifier = @getParentModifier()
      if parentModifier?
        parentModifier.removeSubModifier(@)
      else
        @setParentModifier(null)

  getSubModifierIndices: () ->
    return @subModifierIndices

  getSubModifiers: () ->
    @_private.cachedSubModifiers ?= @getGameSession().getModifiersByIndices(@subModifierIndices)
    return @_private.cachedSubModifiers

  setIsCloneable: (val) ->
    @isCloneable = val

  getIsCloneable: () ->
    return @isCloneable and !@getIsManagedByAura()

  ###*
   * Returns whether this class is a child of the provided keyword class
   * Does not enforce that provided class is a keyword itself
   * @param {Action} action
   ###
  @belongsToKeywordClass: (keywordClass)->
    return (this == keywordClass) or (keywordClass.prototype.isPrototypeOf(this.prototype))

  ###*
   * Sets this modifier as applied by an action.
   * @param {Action} action
   ###
  setAppliedByAction: (action) ->
    if action?
      @appliedByActionIndex = action.getIndex()

  ###*
   * Returns the index of the action that applied this modifier.
   * @returns {Boolean}
   ###
  getAppliedByActionIndex: () ->
    return @appliedByActionIndex

  ###*
   * Returns the index of the action that applied this modifier.
   * @returns {Boolean}
   ###
  getAppliedByAction: () ->
    if @appliedByActionIndex > -1
      return @getGameSession().getActionByIndex(@appliedByActionIndex)

  ###*
   * Sets this modifier as removed by an action.
   * @param {Action} action
   ###
  setRemovedByAction: (action) ->
    if action?
      @removedByActionIndex = action.getIndex()

  ###*
   * Returns the index of the action that removed this modifier.
   * @returns {Boolean}
   ###
  getRemovedByActionIndex: () ->
    return @removedByActionIndex

  ###*
   * Returns the action that removed this modifier.
   * @returns {Boolean}
   ###
  getRemovedByAction: () ->
    if @removedByActionIndex > -1
      return @getGameSession().getActionByIndex(@removedByActionIndex)

  ###*
   * Called automatically by game session to record this modifier as triggering in response to an action and creating a new action.
   * @param {Action} action
   ###
  onTriggeredAction: (action) ->
    if action?
      actionIndex = action.getIndex()
      parentAction = action.getParentAction()
      parentResolveAction = action.getResolveParentAction()
      if parentAction?
        parentActionIndex = parentAction.getIndex()
        resolveParentActionIndex = parentResolveAction.getIndex()

        # add action to list of triggered actions
        @triggerActionsData ?= []
        @triggerActionsData.push({actionIndex: actionIndex, parentActionIndex: parentActionIndex, resolveParentActionIndex: resolveParentActionIndex})

        # ensure triggering modifier is set correctly
        action.setTriggeringModifier(@)

        # always record action index that triggered this
        @_setTriggeredByAction(parentAction, parentResolveAction)

  ###*
   * Called automatically by game session to record this modifier as triggering in response to an action and changing that action.
   * @param {Action} action
   ###
  onTriggerChangedAction: (action) ->
    if action?
      # record modifier in action as having changed action
      action.setChangedByModifier(@)

      # always record action index that triggered this
      @_setTriggeredByAction(action)

  ###*
   * Called automatically by game session to record this modifier as triggering in response to an action and applying a modifier.
   * @param {Modifier} modifier
   * @param {Action} action
   * @param {Action} resolveAction
   ###
  onTriggerAppliedModifier: (modifier, action, resolveAction) ->
    if modifier? and action? and resolveAction?
      modifierIndex = modifier.getIndex()
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()

      # add modifier to list of triggered applied modifiers indices
      @triggerAppliedModifiersData ?= []
      @triggerAppliedModifiersData.push({modifierIndex: modifierIndex, actionIndex: actionIndex, resolveActionIndex: resolveActionIndex})

      # set modifier as applied by this modifier
      modifier.setAppliedByModifier(@)

      # record action index that triggered this as long as this triggering did not create the action
      if action.getTriggeringModifierIndex() != @getIndex() and resolveAction.getTriggeringModifierIndex() != @getIndex()
        @_setTriggeredByAction(action, resolveAction)

  ###*
   * Called automatically by game session to record this modifier as triggering in response to an action and activating a modifier.
   * @param {Modifier} modifier
   * @param {Action} action
   * @param {Action} resolveAction
   ###
  onTriggerActivatedModifier: (modifier, action, resolveAction) ->
    if modifier? and action? and resolveAction?
      modifierIndex = modifier.getIndex()
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()

      # add modifier to list of triggered activated modifiers indices
      @triggerActivatedModifiersData ?= []
      @triggerActivatedModifiersData.push({modifierIndex: modifierIndex, actionIndex: actionIndex, resolveActionIndex: resolveActionIndex})

      # always record action index that triggered this
      @_setTriggeredByAction(action, resolveAction)

  ###*
   * Called automatically by game session to record this modifier as triggering in response to an action and deactivating a modifier.
   * @param {Modifier} modifier
   * @param {Action} action
   * @param {Action} resolveAction
   ###
  onTriggerDeactivatedModifier: (modifier, action, resolveAction) ->
    if modifier? and action? and resolveAction?
      modifierIndex = modifier.getIndex()
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()

      # add modifier to list of triggered deactivated modifiers indices
      @triggerDeactivatedModifiersData ?= []
      @triggerDeactivatedModifiersData.push({modifierIndex: modifierIndex, actionIndex: actionIndex, resolveActionIndex: resolveActionIndex})

      # always record action index that triggered this
      @_setTriggeredByAction(action, resolveAction)

  ###*
   * Called automatically by game session to record this modifier as triggering in response to an action and removing a modifier.
   * @param {Modifier} modifier
   * @param {Action} action
   ###
  onTriggerRemovedModifier: (modifier, action, resolveAction) ->
    if modifier? and action? and resolveAction?
      modifierIndex = modifier.getIndex()
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()

      # add modifier to list of triggered removed modifiers indices by action index
      @triggerRemovedModifiersData ?= []
      @triggerRemovedModifiersData.push({modifierIndex: modifierIndex, actionIndex: actionIndex, resolveActionIndex: resolveActionIndex})

      # set modifier as removed by this modifier
      modifier.setRemovedByModifier(@)

      # record action index that triggered this as long as this triggering did not create the action
      if action.getTriggeringModifierIndex() != @getIndex() and resolveAction.getTriggeringModifierIndex() != @getIndex()
        @_setTriggeredByAction(action, resolveAction)

  _setTriggeredByAction: (action, resolveAction) ->
    resolveAction || (resolveAction = action)

    # check for valid indices
    actionIndex = action.getIndex()
    if !actionIndex?
      Logger.module("SDK").error("[G:#{@getGameSession().getGameId()}] _setTriggeredByAction for modifier #{@getType()} but action #{action.getType()} has no index!")
    resolveActionIndex = resolveAction.getIndex()
    if !resolveActionIndex?
      Logger.module("SDK").error("[G:#{@getGameSession().getGameId()}] _setTriggeredByAction for modifier #{@getType()} but resolve action #{resolveAction.getType()} has no index!")

    # action
    action.onTriggeredModifier(@, resolveAction)
    resolveAction.onResolveTriggeredModifier(@, action)

    # store indices
    @triggeredByActionsData ?= []
    @triggeredByActionsData.push({actionIndex: actionIndex, resolveActionIndex: resolveActionIndex})

  ###*
   * Returns whether a modifier was triggered by an action.
   * @param {Action} action
   * @returns {Boolean}
   ###
  getTriggeredByAction: (action) ->
    if @triggeredByActionsData?
      actionIndex = action.getIndex()
      for data in @triggeredByActionsData
        if data.actionIndex == actionIndex
          return true
    return false

  ###*
   * Returns whether a modifier was triggered by a resolve action.
   * @param {Action} action
   * @returns {Boolean}
   ###
  getTriggeredByResolveAction: (action) ->
    if @triggeredByActionsData?
      actionIndex = action.getIndex()
      for data in @triggeredByActionsData
        if data.resolveActionIndex == actionIndex
          return true
    return false

  ###*
   * Returns a list of data for actions that caused this modifier to trigger.
   * @returns {Array}
   ###
  getTriggeredByActionsData: () ->
    return @triggeredByActionsData || []

  ###*
   * Returns a list of action indices for actions created by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerActionIndicesForActionIndex: (actionIndex) ->
    actionIndices = []
    if @triggerActionsData?
      for data in @triggerActionsData
        if data.parentActionIndex == actionIndex
          actionIndices.push(data.actionIndex)
    return actionIndices

  ###*
   * Returns a list of data for actions created by this modifier triggering.
   * @returns {Array}
   ###
  getTriggerActionsData: () ->
    return @triggerActionsData || []

  ###*
   * Returns a list of actions created by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerActionsForAction: (action) ->
    return @getGameSession().getActionsByIndices(@getTriggerActionIndicesForActionIndex(action.getIndex()))

  ###*
   * Returns a list of action indices for actions created by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerActionIndicesForResolveActionIndex: (actionIndex) ->
    actionIndices = []
    if @triggerActionsData?
      for data in @triggerActionsData
        if data.resolveParentActionIndex == actionIndex
          actionIndices.push(data.actionIndex)
    return actionIndices

  ###*
   * Returns a list of actions created by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerActionsForResolveAction: (action) ->
    return @getGameSession().getActionsByIndices(@getTriggerActionIndicesForResolveActionIndex(action.getIndex()))

  ###*
   * Returns a list of action indices created by this modifier when it triggered in response to matching action and resolve action.
   * @returns {Array}
   ###
  getTriggerActionIndicesForActionAndResolveActionIndices: (actionIndex, resolveActionIndex) ->
    actionIndices = []
    if @triggerActionsData?
      for data in @triggerActionsData
        if data.parentActionIndex == actionIndex and data.resolveParentActionIndex == resolveActionIndex
          actionIndices.push(data.actionIndex)
    return actionIndices

  ###*
   * Returns a list of actions created by this modifier when it triggered in response to matching action and resolve action.
   * @returns {Array}
   ###
  getTriggerActionsForActionAndResolveActionIndices: (actionIndex, resolveActionIndex) ->
    return @getGameSession().getActionsByIndices(@getTriggerActionIndicesForActionAndResolveActionIndices(actionIndex, resolveActionIndex))

  ###*
   * Returns a list of actions created by this modifier when it triggered in response to matching action and resolve action.
   * @returns {Array}
   ###
  getTriggerActionsForActionAndResolveAction: (action, resolveAction) ->
    return @getTriggerActionsForActionAndResolveActionIndices(action.getIndex(), resolveAction.getIndex())

  ###*
   * Returns a list of modifier indices applied by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerAppliedModifierIndicesForAction: (action) ->
    actionIndices = []
    if @triggerAppliedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerAppliedModifiersData
        if data.actionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of data for modifiers applied by this modifier triggering.
   * @returns {Array}
   ###
  getTriggerAppliedModifiersData: () ->
    return @triggerAppliedModifiersData || []

  ###*
   * Returns a list of modifiers applied by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerAppliedModifiersForAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerAppliedModifierIndicesForAction(action))

  ###*
   * Returns a list of modifier indices applied by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerAppliedModifierIndicesForResolveAction: (action) ->
    actionIndices = []
    if @triggerAppliedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerAppliedModifiersData
        if data.resolveActionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of modifiers applied by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerAppliedModifiersForResolveAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerAppliedModifierIndicesForResolveAction(action))

  ###*
   * Returns a list of modifier indices applied by this modifier when it triggered given a specific combination of action and resolve action.
   * @returns {Array}
   ###
  getTriggerAppliedModifierIndicesForActionAndResolveAction: (action, resolveAction) ->
    modifierIndices = []
    if @triggerAppliedModifiersData?
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()
      for data in @triggerAppliedModifiersData
        dataModifierIndex = data.modifierIndex
        dataActionIndex = data.actionIndex
        dataResolveActionIndex = data.resolveActionIndex
        if dataActionIndex == actionIndex and dataResolveActionIndex == resolveActionIndex and (dataModifierIndex != lastDataModifierIndex || lastDataActionIndex != dataActionIndex || lastDataResolveActionIndex != dataResolveActionIndex)
          modifierIndices.push(dataModifierIndex)
        lastDataModifierIndex = dataModifierIndex
        lastDataActionIndex = dataActionIndex
        lastDataResolveActionIndex = dataResolveActionIndex
    return modifierIndices

  ###*
   * Returns a list of modifiers applied by this modifier when it triggered in response to an action and resolve action.
   * @returns {Array}
   ###
  getTriggerAppliedModifiersForActionAndResolveAction: (action, resolveAction) ->
    return @getGameSession().getModifiersByIndices(@getTriggerAppliedModifierIndicesForActionAndResolveAction(action, resolveAction))

  ###*
   * Returns a list of modifier indices activated by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerActivatedModifierIndicesForAction: (action) ->
    actionIndices = []
    if @triggerActivatedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerActivatedModifiersData
        if data.actionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of data for modifiers activated by this modifier triggering.
   * @returns {Array}
   ###
  getTriggerActivatedModifiersData: () ->
    return @triggerActivatedModifiersData || []

  ###*
   * Returns a list of modifiers activated by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerActivatedModifiersForAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerActivatedModifierIndicesForAction(action))

  ###*
   * Returns a list of modifier indices activated by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerActivatedModifierIndicesForResolveAction: (action) ->
    actionIndices = []
    if @triggerActivatedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerActivatedModifiersData
        if data.resolveActionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of modifiers activated by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerActivatedModifiersForResolveAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerActivatedModifierIndicesForResolveAction(action))

  ###*
   * Returns a list of modifier indices activated by this modifier when it triggered given a specific combination of action and resolve action.
   * @returns {Array}
   ###
  getTriggerActivatedModifierIndicesForActionAndResolveAction: (action, resolveAction) ->
    modifierIndices = []
    if @triggerActivatedModifiersData?
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()
      for data in @triggerActivatedModifiersData
        dataModifierIndex = data.modifierIndex
        dataActionIndex = data.actionIndex
        dataResolveActionIndex = data.resolveActionIndex
        if dataActionIndex == actionIndex and dataResolveActionIndex == resolveActionIndex and (dataModifierIndex != lastDataModifierIndex || lastDataActionIndex != dataActionIndex || lastDataResolveActionIndex != dataResolveActionIndex)
          modifierIndices.push(dataModifierIndex)
        lastDataModifierIndex = dataModifierIndex
        lastDataActionIndex = dataActionIndex
        lastDataResolveActionIndex = dataResolveActionIndex
    return modifierIndices

  ###*
   * Returns a list of modifiers activated by this modifier when it triggered in response to an action and resolve action.
   * @returns {Array}
   ###
  getTriggerActivatedModifiersForActionAndResolveAction: (action, resolveAction) ->
    return @getGameSession().getModifiersByIndices(@getTriggerActivatedModifierIndicesForActionAndResolveAction(action, resolveAction))

  ###*
   * Returns a list of modifier indices removed by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerRemovedModifierIndicesForAction: (action) ->
    actionIndices = []
    if @triggerRemovedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerRemovedModifiersData
        if data.actionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of data for modifiers removed by this modifier triggering.
   * @returns {Array}
   ###
  getTriggerRemovedModifiersData: () ->
    return @triggerRemovedModifiersData || []

  ###*
   * Returns a list of modifiers removed by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerRemovedModifiersForAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerRemovedModifierIndicesForAction(action))

  ###*
   * Returns a list of modifier indices removed by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerRemovedModifierIndicesForResolveAction: (action) ->
    actionIndices = []
    if @triggerRemovedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerRemovedModifiersData
        if data.resolveActionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of modifiers removed by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerRemovedModifiersForResolveAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerRemovedModifierIndicesForResolveAction(action))

  ###*
   * Returns a list of modifier indices removed by this modifier when it triggered given a specific combination of action and resolve action.
   * @returns {Array}
   ###
  getTriggerRemovedModifierIndicesForActionAndResolveAction: (action, resolveAction) ->
    modifierIndices = []
    if @triggerRemovedModifiersData?
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()
      for data in @triggerRemovedModifiersData
        dataModifierIndex = data.modifierIndex
        dataActionIndex = data.actionIndex
        dataResolveActionIndex = data.resolveActionIndex
        if dataActionIndex == actionIndex and dataResolveActionIndex == resolveActionIndex and (dataModifierIndex != lastDataModifierIndex || lastDataActionIndex != dataActionIndex || lastDataResolveActionIndex != dataResolveActionIndex)
          modifierIndices.push(dataModifierIndex)
        lastDataModifierIndex = dataModifierIndex
        lastDataActionIndex = dataActionIndex
        lastDataResolveActionIndex = dataResolveActionIndex
    return modifierIndices

  ###*
   * Returns a list of modifiers removed by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerRemovedModifiersForActionAndResolveAction: (action, resolveAction) ->
    return @getGameSession().getModifiersByIndices(@getTriggerRemovedModifierIndicesForActionAndResolveAction(action, resolveAction))

  ###*
   * Returns a list of modifier indices deactivated by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerDeactivatedModifierIndicesForAction: (action) ->
    actionIndices = []
    if @triggerDeactivatedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerDeactivatedModifiersData
        if data.actionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of data for modifiers deactivated by this modifier triggering.
   * @returns {Array}
   ###
  getTriggerDeactivatedModifiersData: () ->
    return @triggerDeactivatedModifiersData || []

  ###*
   * Returns a list of modifiers deactivated by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerDeactivatedModifiersForAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerDeactivatedModifierIndicesForAction(action))

  ###*
   * Returns a list of modifier indices deactivated by this modifier when it triggered in response to a resolve action.
   * @returns {Array}
   ###
  getTriggerDeactivatedModifierIndicesForResolveAction: (action) ->
    actionIndices = []
    if @triggerDeactivatedModifiersData?
      actionIndex = action.getIndex()
      for data in @triggerDeactivatedModifiersData
        if data.resolveActionIndex == actionIndex
          actionIndices.push(data.modifierIndex)
    return actionIndices

  ###*
   * Returns a list of modifiers deactivated by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerDeactivatedModifiersForResolveAction: (action) ->
    return @getGameSession().getModifiersByIndices(@getTriggerDeactivatedModifierIndicesForResolveAction(action))

  ###*
   * Returns a list of modifier indices deactivated by this modifier when it triggered given a specific combination of action and resolve action.
   * @returns {Array}
   ###
  getTriggerDeactivatedModifierIndicesForActionAndResolveAction: (action, resolveAction) ->
    modifierIndices = []
    if @triggerDeactivatedModifiersData?
      actionIndex = action.getIndex()
      resolveActionIndex = resolveAction.getIndex()
      for data in @triggerDeactivatedModifiersData
        dataModifierIndex = data.modifierIndex
        dataActionIndex = data.actionIndex
        dataResolveActionIndex = data.resolveActionIndex
        if dataActionIndex == actionIndex and dataResolveActionIndex == resolveActionIndex and (dataModifierIndex != lastDataModifierIndex || lastDataActionIndex != dataActionIndex || lastDataResolveActionIndex != dataResolveActionIndex)
          modifierIndices.push(dataModifierIndex)
        lastDataModifierIndex = dataModifierIndex
        lastDataActionIndex = dataActionIndex
        lastDataResolveActionIndex = dataResolveActionIndex
    return modifierIndices

  ###*
   * Returns a list of modifiers deactivated by this modifier when it triggered in response to an action.
   * @returns {Array}
   ###
  getTriggerDeactivatedModifiersForActionAndResolveAction: (action, resolveAction) ->
    return @getGameSession().getModifiersByIndices(@getTriggerDeactivatedModifierIndicesForActionAndResolveAction(action, resolveAction))

  ###*
   * Returns whether a modifier is an ancestor for an action, i.e. it caused this action to be created.
   * @param {Action} action
   * @returns {Boolean}
   ###
  getIsAncestorForAction: (action) ->
    if action?
      triggeringModifier = action.getTriggeringModifier()
      if @ == triggeringModifier
        return true
      else
        return @getIsAncestorForAction(action.getResolveParentAction())
    return false

  ###*
   * Returns whether a modifier can react to an action.
   * @param {Action} action
   * @returns {Boolean}
   ###
  getCanReactToAction: (action) ->
    appliedByAction = @getAppliedByAction()
    if appliedByAction? and appliedByAction.getTarget() != @getCard()
      return appliedByAction.getIndex() < action.getIndex() and !@getIsAncestorForAction(action)
    else
      return !@getIsAncestorForAction(action)

  ###*
   * Helper method that creates and applies modifiers (specified in this modifier's modifiersContextObjects property) as submodifiers of this modifier.
   * @param {Array} modifiersContextObjects
   * @param {Card} card
   ###
  applyManagedModifiersFromModifiersContextObjects: (modifiersContextObjects, card) ->
    if modifiersContextObjects? and card?
      for modifierContextObject in modifiersContextObjects
        # NOTE: do not modify context object as it may be shared or reused to add future modifiers
        @getGameSession().applyModifierContextObject(modifierContextObject, card, @)

  ###*
   * Helper method that creates and applies modifiers from a list of modifiersContextObjects as submodifiers of this modifier, but ONLY if the target card does not yet have the modifiers.
   * @param {Array} modifiersContextObjects
   * @param {Card} card
   ###
  applyManagedModifiersFromModifiersContextObjectsOnce: (modifiersContextObjects, card) ->
    if modifiersContextObjects? and modifiersContextObjects.length > 0 and card?
      # apply new sub modifiers

      for modifierContextObject, i in modifiersContextObjects
        # search through existing modifiers for a modifier that is managed by this modifier and has the same stack type
        hasModifier = false
        for existingModifier in card.getModifiers()
          if existingModifier? and existingModifier.getParentModifierIndex() == @getIndex()
            auraModifierId = existingModifier.getAuraModifierId()
            if auraModifierId == i
              hasModifier = true
              break

        # card does not yet have this modifier
        if !hasModifier
          # NOTE: do not modify context object as it may be shared or reused to add future modifiers
          @getGameSession().applyModifierContextObject(modifierContextObject, card, @, i)

  ###*
   * Helper method that removes all managed modifiers of this modifier from a list of cards.
   * @param {Array} cards
   ###
  removeManagedModifiersFromCards: (cards) ->
    for card in cards
      @removeManagedModifiersFromCard(card)

  ###*
   * Helper method that removes all managed modifiers of this modifier from a card.
   * @param {Card} card
   ###
  removeManagedModifiersFromCard: (card) ->
    for modifier in @getSubModifiers() by -1
      if modifier? and modifier.getCard() == card
        @getGameSession().removeModifier(modifier)

  #===== / ======

  ### ATTRIBUTES ###

  ###
  Some examples of how to use attribute buffs:

  Decrease a unit's max HP by 2
  modifier.attributeBuffs["maxHP"] = -2

  Increase a unit's attack by 8
  modifier.attributeBuffs["atk"] = 8

  Rebase a unit's maxHP to 1 before any other modifiers (can be changed by further modifiers on the unit)
  modifier.attributeBuffs["maxHP"] = 1
  modifier.attributeBuffsRebased = ["maxHP"]

  Set a unit's maxHP and attack to 1 in the order of application (can be changed by further modifiers on the unit)
  modifier.attributeBuffs["maxHP"] = 1
  modifier.attributesBuffs["atk"] = 1
  modifier.attributeBuffsAbsolute = ["maxHP", "atk"]

  Set a unit's speed to 0 (and it cannot be changed by further modifiers on the unit)
  modifier.attributeBuffs["speed"] = 0
  modifier.attributeBuffsAbsolute = ["speed"]
  modifier.attributeBuffsFixed = ["speed"]
  ###

  getBuffedAttribute: (attributeValue, buffKey) ->
    if @attributeBuffs?
      buffValue = @attributeBuffs[buffKey]
      if buffValue?
        if @getBuffsAttributeAbsolutely(buffKey) or @getRebasesAttribute(buffKey)
          attributeValue = buffValue
        else
          attributeValue = attributeValue + buffValue

    return attributeValue

  getAttributeBuffs: () ->
    return @attributeBuffs

  getBuffsAttribute: (buffKey) ->
    return @attributeBuffs? and @attributeBuffs[buffKey]?

  getBuffsAttributes: () ->
    return @attributeBuffs? and Object.keys(@attributeBuffs).length > 0

  getRebasesAttribute: (buffKey) ->
    return @attributeBuffsRebased? and buffKey in @attributeBuffsRebased

  getRebasesAttributes: () ->
    return @attributeBuffsRebased? and @attributeBuffsRebased.length > 0

  getBuffsAttributeAbsolutely: (buffKey) ->
    return @attributeBuffsAbsolute? and buffKey in @attributeBuffsAbsolute

  getBuffsAttributesAbsolutely: () ->
    return @attributeBuffsAbsolute? and @attributeBuffsAbsolute.length > 0

  getIsAttributeFixed: (buffKey) ->
    return @attributeBuffsFixed? and buffKey in @attributeBuffsFixed

  getAreAttributesFixed: () ->
    return @attributeBuffsFixed? and @attributeBuffsFixed.length > 0

  setResetsDamage: (val) ->
    @resetsDamage = val

  getResetsDamage: () ->
    return @resetsDamage or (@attributeBuffsRebased? and _.contains(@attributeBuffsRebased, "maxHP"))

  getCanConvertCardToPrismatic: () ->
    return @_private.canConvertCardToPrismatic

  getCanConvertCardToSkinned: () ->
    return @_private.canConvertCardToSkinned

  #===== / ======

  ### ARTIFACTS ###

  getIsFromArtifact:() ->
    return @getMaxDurability() > 0

  setDurability:(durability) ->
    @durability = Math.max(Math.min(durability, @getMaxDurability()), 0.0)

  getDurability:() ->
    return @durability

  setMaxDurability:(durability) ->
    @maxDurability = durability

  getMaxDurability:() ->
    return @maxDurability

  applyDamage: (dmg) ->
    if dmg > 0 # if damage amount was reduced to 0, do not reduce artifact durability
      #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "#{@getLogName()}.applyDamage -> durability #{@getDurability()} -> #{@getDurability()-1}")
      durability = @getDurability()
      @setDurability(durability - 1) # we apply 1 dmg to modifier durability no matter what damage it takes
      @lastDmg = @getDurability() - durability

  getIsDestroyed:() ->
    return @getIsFromArtifact() and @durability <= 0

  #===== / ======

  ### AURAS ###

  _removeAura: () ->
    @_removeAuraFromCardsLeaving()

    # remove any sub modifiers that target card currently within aura's influence
    cardsInAura = @_private.cachedCardsInAura
    @_private.cachedCardsInAura = []
    @removeManagedModifiersFromCards(cardsInAura)

  _refreshAuraCardsAsNeeded: () ->
    # update entities in aura
    if @_private.cardsInAuraDirty
      @_private.cardsInAuraDirty = false
      lastCardsInAura = @_private.cachedCardsInAura
      @_private.cachedCardsInAura = @_findNewCardsInAura()
      @_private.cachedCardsLeavingAura = _.difference(lastCardsInAura, @_private.cachedCardsInAura)

  _addAuraToCards: () ->
    # add any sub modifiers to cards in aura that don't already have aura modifiers
    for card in @_private.cachedCardsInAura
      @applyManagedModifiersFromModifiersContextObjectsOnce(@modifiersContextObjects, card)

  _removeAuraFromCardsLeaving: () ->
    # remove any sub modifiers that target card that is now leaving aura's influence
    cardsLeavingAura = @_private.cachedCardsLeavingAura
    @_private.cachedCardsLeavingAura = []
    @removeManagedModifiersFromCards(cardsLeavingAura)

  _findNewCardsInAura: () ->
    auraEntities = []

    if @getCard()?
      # get targets
      if @auraIncludeSelf and !@auraIncludeAlly and !@auraIncludeEnemy and !@auraFilterByCardType? and !(@auraFilterByCardIds? and @auraFilterByCardIds.length > 0) and !(@auraFilterByRaceIds? and @auraFilterByRaceIds.length > 0) and !(@auraFilterByModifierTypes? and @auraFilterByModifierTypes.length > 0)
        # special case: aura only affects self
        auraEntities.push(@getCard())
      else
        potentialCardsInAura = @_findPotentialCardsInAura()

        # always include self in potential targets
        potentialCardsInAura.push(@getCard())

        # filter all targets
        ownerId = @getCard().getOwnerId()
        seenSelf = false
        for target in potentialCardsInAura
          if target?
            if (@auraIncludeBoard and target.getIsActive()) or (@auraIncludeHand and target.getIsLocatedInHand()) or (@auraIncludeSignatureCards and target.getIsLocatedInSignatureCards()) or (@auraIncludeSelf and target == @getCard())
              targetOwnerId = target.getOwnerId()
              if target == @getCard()
                if @auraIncludeSelf and !seenSelf and (!target.getIsGeneral() or (@auraIncludeGeneral and target.getIsGeneral())) and @_filterPotentialCardInAura(target)
                  auraEntities.push(target)
                seenSelf = true
              else if ((@auraIncludeAlly and targetOwnerId == ownerId) or (@auraIncludeEnemy and targetOwnerId != ownerId))
                if CardType.getIsEntityCardType(target.getType())
                  # if target is an entity, filter for General as needed based on aura properties
                  if (!target.getIsGeneral() or (@auraIncludeGeneral and target.getIsGeneral())) and @_filterPotentialCardInAura(target)
                    auraEntities.push(target)
                else if @_filterPotentialCardInAura(target)
                  # non entity target
                  auraEntities.push(target)

    return auraEntities

  _findPotentialCardsInAura: () ->
    # find all targets that could be affected by action
    # override this for multi-target actions that don't use simple radius search
    potentialCards = []

    if @auraIncludeBoard
      allowUntargetable = false
      if auraFilterByCardType = CardType.Tile # when filtering for tiles, need to allow untargetable entities since tiles are always untargetable
        allowUntargetable = true
      potentialCards = potentialCards.concat(@getGameSession().getBoard().getCardsWithinRadiusOfPosition(@getCard().position, @auraFilterByCardType, @auraRadius, true, allowUntargetable, false))

    if @auraIncludeHand
      potentialCards = potentialCards.concat(@getGameSession().getPlayer1().getDeck().getCardsInHandExcludingMissing(), @getGameSession().getPlayer2().getDeck().getCardsInHandExcludingMissing())

    if @auraIncludeSignatureCards
      potentialCards = potentialCards.concat(@getGameSession().getPlayer1().getCurrentSignatureCard(), @getGameSession().getPlayer2().getCurrentSignatureCard())

    return potentialCards

  _filterPotentialCardInAura: (card) ->
    if @auraFilterByCardType
      cardType = card.getType()
      if @auraFilterByCardType == CardType.Entity
        if !CardType.getIsEntityCardType(cardType)
          return false
      else if @auraFilterByCardType == CardType.Unit
        if !CardType.getIsUnitCardType(cardType)
          return false
      else if @auraFilterByCardType == CardType.Tile
        if !CardType.getIsTileCardType(cardType)
          return false
      else if @auraFilterByCardType == CardType.Spell
        if !CardType.getIsSpellCardType(cardType)
          return false
      else if @auraFilterByCardType == CardType.Artifact
        if !CardType.getIsArtifactCardType(cardType)
          return false

    if @auraFilterByCardIds? and @auraFilterByCardIds.length > 0 and !(card.getBaseCardId() in @auraFilterByCardIds)
      return false

    if @auraFilterByRaceIds? and @auraFilterByRaceIds.length > 0
      passesRaceFilter = false
      for raceId in @auraFilterByRaceIds
        if card.getBelongsToTribe(raceId)
          passesRaceFilter = true
          break
      if !passesRaceFilter
        return false

    if @auraFilterByModifierTypes? and @auraFilterByModifierTypes.length > 0
      passesModifierFilter = false
      for modType in @auraFilterByModifierTypes
        if card.getActiveModifierByType(modType)
          passesModifierFilter = true
          break
      if !passesModifierFilter
        return false

    return true

  getEntitiesInAura: () ->
    return @_private.cachedCardsInAura

  getIsAura: () ->
    return @isAura

  setAuraModifierId: (val) ->
    @auraModifierId = val

  getAuraModifierId: () ->
    return @auraModifierId

  getIsManagedByAura: () ->
    parentModifier = @getParentModifier()
    return parentModifier and (parentModifier.getIsAura() or parentModifier.getIsManagedByAura())

  #===== / ======

  ### EVENT CALLBACKS ###

  getIsListeningToEvents: () ->
    return @_private.listeningToEvents

  startListeningToEvents: () ->
    @_private.listeningToEvents = true

  stopListeningToEvents: () ->
    @_private.listeningToEvents = false

  _onTerminate: () ->
    # this method is automatically called when this object will never be used again
    @stopListeningToEvents()

  _onModifyActionForValidation: (event) ->
    if @_private.cachedIsActive
      @onModifyActionForValidation(event)

  _onValidateAction: (event) ->
    # only validate the action if it is valid
    action = event.action
    if action?.getIsValid() and @_private.cachedIsActive
      @onValidateAction(event)

  _onModifyActionForExecution: (event) ->
    if @_private.cachedIsActive
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onModifyActionForExecution(event)
      @getGameSession().popTriggeringModifierFromStack()

  _onBeforeAction: (event) ->
    action = event.action
    if @_private.cachedIsActive and @getCanReactToAction(action)
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onBeforeAction(event)
      @getGameSession().popTriggeringModifierFromStack()

  _onAction: (event) ->
    action = event.action

    # take durability damage when our unit takes damage
    if @maxDurability > 0 and action instanceof DamageAction and action.getTarget() == @getCard()
      @applyDamage(action.getTotalDamageAmount())
    #Logger.module("SDK").debug("[G:#{@.getGameSession().gameId}]", "Modifier._onAction -> #{@getLogName()} card #{@getCard()?.getLogName()}")
    if @_private.cachedIsActive and @getCanReactToAction(action)
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onAction(event)
      @getGameSession().popTriggeringModifierFromStack()

  _onAfterAction: (event) ->
    action = event.action
    if @_private.cachedIsActive and @getCanReactToAction(action)
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onAfterAction(event)
      @getGameSession().popTriggeringModifierFromStack()

  _onAfterCleanupAction: (event) ->
    action = event.action
    if @_private.cachedIsActive and @getCanReactToAction(action)
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onAfterCleanupAction(event)
      @getGameSession().popTriggeringModifierFromStack()

  _onEndTurnDurationChange: (event) ->
    if !@_private.cachedIsActive and !@_private.cachedIsActiveInLocation
      # don't change duration for inactive modifiers while in non-active locations
      return

    # increase elapsed
    @setNumEndTurnsElapsed(@numEndTurnsElapsed + 1)

    if @_private.cachedIsActive # if active, modifier can respond to this duration change
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onEndTurnDurationChange(event)
      if @durationEndTurn > 0
        @durationEndTurn = @_getModifierDurationChangeInCaseOfBonusTurn(@durationEndTurn)
        if @numEndTurnsElapsed >= @durationEndTurn
          @onExpire(event)
          @getGameSession().removeModifier(@)
      @getGameSession().popTriggeringModifierFromStack()
    else # if inactive, modifier may still run out of duration but cannot respond
      if @durationEndTurn > 0
        @durationEndTurn = @_getModifierDurationChangeInCaseOfBonusTurn(@durationEndTurn)
        if @numEndTurnsElapsed >= @durationEndTurn
          @getGameSession().removeModifier(@)

  _onStartTurnDurationChange: (event) ->
    if !@_private.cachedIsActive and !@_private.cachedIsActiveInLocation
      # don't change duration for inactive modifiers while in non-active locations
      return

    # increase elapsed
    @setNumStartTurnsElapsed(@numStartTurnsElapsed + 1)

    if @_private.cachedIsActive # if active, modifier can respond to this duration change
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onStartTurnDurationChange(event)
      if @durationStartTurn > 0
        @durationStartTurn = @_getModifierDurationChangeInCaseOfBonusTurn(@durationStartTurn)
        if @numStartTurnsElapsed >= @durationStartTurn
          @onExpire(event)
          @getGameSession().removeModifier(@)
      @getGameSession().popTriggeringModifierFromStack()
    else # if inactive, modifier may still run out of duration but cannot respond
      if @durationStartTurn > 0
        @durationStartTurn = @_getModifierDurationChangeInCaseOfBonusTurn(@durationStartTurn)
        if @numStartTurnsElapsed >= @durationStartTurn
          @getGameSession().removeModifier(@)

  _getModifierDurationChangeInCaseOfBonusTurn: (duration) ->
    # special case: if not swapping current player at end turn like normal (current player taking an turn)
    if @durationRespectsBonusTurns and !@getGameSession().willSwapCurrentPlayerNextTurn()
      if @getGameSession().getCurrentPlayerId() == @getCard().getOwnerId()
        # caster is taking a bonus turn, so modifier should expire next end turn
        if duration > 1 # make sure we don't make modifier infinite
          duration--
      else
        # opponent is taking a bonus turn, so modifier duration should be extended by one additional turn
        duration++
    return duration

  _onActiveChange: (event) ->
    # modifiers update cached state at the modifier active change phase
    # at this point we know:
    # - all cards that died have been cleaned up
    @updateCachedState()

    # if the modifier is destroyed, remove it
    # check for whether this modifier is already removed
    # as this code path is called during removal to trigger deactivation
    isDestroyed = @getIsDestroyed()
    if isDestroyed and !@getIsRemoved()
      @getGameSession().removeModifier(@)
    else if @_private.cachedIsActive and !@_private.cachedWasActive
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onActivate()
      @getGameSession().popTriggeringModifierFromStack()
    else if !@_private.cachedIsActive and @_private.cachedWasActive
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onDeactivate()
      @getGameSession().popTriggeringModifierFromStack()

  _onRemoveAura: (event) ->
    if @isAura
      if @_private.cachedIsActive
        @getGameSession().pushTriggeringModifierOntoStack(@)
        @_refreshAuraCardsAsNeeded()
        @_removeAuraFromCardsLeaving()
        @getGameSession().popTriggeringModifierFromStack()
      else if @_private.cachedWasActive
        @getGameSession().pushTriggeringModifierOntoStack(@)
        @_removeAura()
        @getGameSession().popTriggeringModifierFromStack()

  _onAddAura: (event) ->
    if @isAura and @_private.cachedIsActive
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @_refreshAuraCardsAsNeeded()
      @_addAuraToCards()
      @getGameSession().popTriggeringModifierFromStack()

  _onStartTurn: (event) ->
    if @_private.cachedIsActive
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onStartTurn(event)
      @getGameSession().popTriggeringModifierFromStack()

  _onEndTurn: (event) ->
    if @_private.cachedIsActive
      @getGameSession().pushTriggeringModifierOntoStack(@)
      @onEndTurn(event)
      @getGameSession().popTriggeringModifierFromStack()

  onModifyActionForValidation:(event) ->
    # override this in sub classes

  onValidateAction:(event) ->
    # override this in sub classes
    # check the actionEvent.action and set isValid to block an action

  invalidateAction: (action, position, message="Invalid Action!") ->
    # helper method for invalidating an action at a position with a message
    action.setIsValid(false)
    action.setValidationMessage(message)
    action.setValidationMessagePosition(position)
    action.setValidatorType(@getType())

  onModifyActionForExecution:(event) ->
    # override this in sub classes

  onBeforeAction: (event) ->
    # override this in sub classes

  onAction: (event) ->
    # override this in sub classes

  onAfterAction: (event) ->
    # override this in sub classes

  onAfterCleanupAction: (event) ->
    # override this in sub classes

  onEndTurnDurationChange: (event) ->
    # override this in sub classes

  onStartTurnDurationChange: (event) ->
    # override this in sub classes

  onExpire: (event) ->
    # override this in sub classes

  onStartTurn: (event) ->
    # override this in sub classes

  onEndTurn:(event) ->
    # override this in sub classes

  #===== / ======

  ### JSON serialization ###

  deserialize: (data) ->
    UtilsJavascript.fastExtend(this,data)

  postDeserialize: () ->
    if @getCard()?
      # flush any cached data
      @flushAllCachedData()

      # update cached state
      @updateCachedState()
      @_private.cachedWasActive = @_private.cachedIsActive
      @_private.cachedWasActiveInLocation = @_private.cachedIsActiveInLocation
      if @isAura and @_private.cachedIsActive
        @_private.cachedCardsInAura = @_findNewCardsInAura()

      # hook into events
      @startListeningToEvents()

  ###*
  # Sets the modifier type of the modifier this should hide as for scrubbing.
  # @public
  # @param {String} modifierType.
  ###
  setTransformModifierTypeForScrubbing: (modifierType) ->
    @hideAsModifierType = modifierType

  ###*
  # Returns the modifier type of the modifier this should hide as for scrubbing.
  # @public
  # @returns {String}
  ###
  getTransformModifierTypeForScrubbing: () ->
    return @hideAsModifierType

  ###*
  # Returns whether this is hideable.
  # @public
  # @return  {Boolean}
  ###
  isHideable: (scrubFromPerspectiveOfPlayerId, forSpectator) ->
    if @hideAsModifierType?
      card = @getCard()
      if card? and card.getOwnerId() != scrubFromPerspectiveOfPlayerId
        return true
    return false

  ###*
  # Hides the modifier during scrubbing as another modifier.
  # @public
  # @return  {Modifier}
  ###
  createModifierToHideAs: () ->
    hideAsModifierType = @hideAsModifierType

    # create modifier this modifier will transform into
    hiddenModifierClass = @getGameSession().getModifierClassForType(hideAsModifierType)
    hiddenModifier = @getGameSession().createModifierForType(hideAsModifierType)

    # create a modifier context object for the transformed modifier
    hiddenModifier.contextObject = hiddenModifierClass.createContextObject()

    # copy properties from modifier
    for key in @getContextObjectKeysForCopy()
      hiddenModifier[key] = hiddenModifier.contextObject[key] = @[key]

    # ensure modifier type is correct
    hiddenModifier.type = hiddenModifier.contextObject.type = hideAsModifierType

    # notify transformed modifier it was transformed from this modifier
    hiddenModifier.onCreatedToHide(@)

    return hiddenModifier

  ###*
  # Method called automatically when this was created to hide a source modifier during scrubbing.
  # @public
  # @param {Modifier} source
  ###
  onCreatedToHide: (source) ->
    # override in sub class to implement custom behavior

module.exports = Modifier
