SDKObject = require 'app/sdk/object'
CONFIG =       require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
CardType =       require 'app/sdk/cards/cardType'
Logger =       require 'app/common/logger'
_ = require 'underscore'

class Action extends SDKObject

  @type:"Action"

  changedByModifierIndices: null
  isDepthFirst: false
  fxResource: null # array of strings that map to fx data, ex: ["Actions.Teleport"]
  index: null # unique index of action, set automatically by game session
  isAutomatic: false # actions that act as explicit actions even though they are not player generated (example - battle pets)
  manaCost: 0
  ownerId: null
  parentActionIndex: null # index of action this should be executed as a result of
  resolveParentActionIndex: null # index of action this was actually resolved after
  resolveSubActionIndices: null # action indices resolved after this action
  sourceIndex: null
  sourcePosition: null
  subActionsOrderedByEventType: null # actions executed by event type
  targetIndex: null
  targetPosition: null
  timestamp: null
  triggeringModifierIndex: null

  constructor: (gameSession) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @type ?= Action.type
    @setOwnerId(@getGameSession().getCurrentPlayer().getPlayerId())

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    # cache
    p.cachedRootAction = null
    p.cachedResolveSubActions = null
    p.cachedSubActions = null # cached list of actions executed after this action
    p.cachedSubActionsQueue = null

    # targeting
    p.source = null # where the action is coming from
    p.target = null # where the action is being applied
    p.includedRandomness = false # whether action included randomness during execution

    # modifiers data
    p.activatedModifiersData = null
    p.deactivatedModifiersData = null
    p.triggeredModifiersData = null

    # validity
    p.isValid = true # validators can check if this action can be executed after it is generated. EXAMPLE: a unit has provoke/taunt and can say that attacking anything nearby is invalid
    p.validationMessage = null
    p.validationMessagePosition = null
    p.validatorType = null

    return p

  getType: () ->
    return @type

  getLogName: ()->
    logName = "#{@getType().replace(' ','_')}[#{@getIndex()}]"
    if @sourceIndex?
      logName += "_s(#{@sourceIndex})"
    else if @sourcePosition?
      logName += "_s(x:#{@sourcePosition.x},y:#{@sourcePosition.y})"
    else
      logName += "_s()"
    if @targetIndex?
      logName += "_t(#{@targetIndex})"
    else if @targetPosition?
      logName += "_t(x:#{@targetPosition.x},y:#{@targetPosition.y})"
    else
      logName += "_t()"
    return logName

  setOwnerId: (ownerId) ->
    @ownerId = ownerId

  getOwnerId: () ->
    return @ownerId

  getOwner: () ->
    return @getGameSession().getPlayerById(@ownerId)

  ###*
   * Returns whether this action has been executed yet. This is not a safe way to check if this action is executing on the server, use GameSession.getIsRunningAsAuthoritative instead.
   * @returns {Boolean}
   ###
  isFirstTime: () ->
    return !@timestamp?

  ###*
   * Signs the action by setting its execution timestamp.
   ###
  addSignature: () ->
    if @isFirstTime()
      @timestamp = Date.now()

  ###*
   * Sets an index of order executed.
   * @param {Number|String}
   ###
  setIndex: (val) ->
    @index = val

  ###*
   * Returns an index of order executed.
   * @returns {Number}
   ###
  getIndex: () ->
    return @index

  ###*
   * Returns the mana cost of an action.
   * @returns {Number}
   ###
  getManaCost: () ->
    return @manaCost

  getIsValid: () ->
    return @_private.isValid

  setIsValid: (val) ->
    @_private.isValid = val

  setValidationMessage: (val) ->
    @_private.validationMessage = val

  getValidationMessage: () ->
    return @_private.validationMessage

  setValidationMessagePosition: (val) ->
    @_private.validationMessagePosition = val

  getValidationMessagePosition: () ->
    return @_private.validationMessagePosition

  setValidatorType: (val) ->
    @_private.validatorType = val

  getValidatorType: () ->
    return @_private.validatorType

  getIsDepthFirst: () ->
    return @isDepthFirst

  setIsDepthFirst: (val) ->
    @isDepthFirst = val

  setIsAutomatic: (val) ->
    @isAutomatic = val

  getIsAutomatic: () ->
    return @isAutomatic

  getIncludedRandomness: () ->
    return @_private.includedRandomness

  setIncludedRandomness: (val) ->
    @_private.includedRandomness = val

  ###*
   * Returns the source card of the action, if any. Source cards are found by source card.
   * NOTE: only valid if sourceIndex is set or after the action is executed!
   * @returns {Card}
   ###
  getSource:() ->
    if !@_private.source?
      if @sourceIndex?
        @_private.source = @getGameSession().getCardByIndex(@sourceIndex)
      else
        # check for a modifier that triggered and created this action
        triggeringModifier = @getTriggeringModifier()
        if triggeringModifier?
          @_private.source = triggeringModifier.getCardAffected()
    return @_private.source

  ###*
   * Sets the immediate source card of the action by setting its index and position. If possible, this should ALWAYS be set before executing the action.
   * @param {Card}
   ###
  setSource:(source) ->
    @_private.source = source
    @setSourceIndex(source?.getIndex())
    @setSourcePosition(source?.getPosition())

  ###*
   * Sets the position of the immediate source card of the action. If possible, this should ALWAYS be set before executing the action.
   * @param {Vec2|Object}
   ###
  setSourcePosition: (sourcePosition) ->
    @sourcePosition = sourcePosition

  ###*
   * Returns the source position of the action, if any.
   * @returns {Vec2|Object}
   ###
  getSourcePosition: () ->
    if !@sourcePosition?
      source = @getSource()
      if source?
        @sourcePosition = source.getPosition()
    return @sourcePosition

  ###*
   * Sets the index of the immediate source card of the action. If possible, this should ALWAYS be set before executing the action.
   * @param {Number}
   ###
  setSourceIndex:(sourceIndex) ->
    @sourceIndex = sourceIndex

  ###*
   * Returns the index of the immediate source card of the action.
   * NOTE: only valid if set when action created or always after the action is executed!
   * @returns {Number}
   ###
  getSourceIndex:() ->
    if !@sourceIndex?
      source = @getSource()
      if source?
        @sourceIndex = source.getIndex()
    return @sourceIndex

  ###*
   * Returns the target of the action, if any. Target cards are found by target card index.
   * NOTE: only valid if targetIndex is set or after the action is executed!
   * @returns {Card}
   ###
  getTarget:() ->
    if !@_private.target? and @targetIndex?
      @_private.target = @getGameSession().getCardByIndex(@targetIndex)
    return @_private.target

  ###*
   * Sets the target card of the action by setting its index and position. If possible, this should ALWAYS be set before executing the action.
   * @param {Card}
   ###
  setTarget:(target) ->
    @_private.target = target
    @setTargetIndex(target?.getIndex())
    @setTargetPosition(target?.getPosition())

  ###*
   * Sets the position of the target card of the action. If possible, this should ALWAYS be set before executing the action.
   * @param {Vec2|Object}
   ###
  setTargetPosition: (targetPosition) ->
    @targetPosition = targetPosition

  ###*
   * Returns the target position of the action, if any.
   * @returns {Vec2|Object}
   ###
  getTargetPosition: () ->
    if !@targetPosition?
      target = @getTarget()
      if target?
        @targetPosition = target.getPosition()
    return @targetPosition

  ###*
   * Sets the index of the target card of the action. If possible, this should ALWAYS be set before executing the action.
   * @param {Number}
   ###
  setTargetIndex:(targetIndex) ->
    @targetIndex = targetIndex

  ###*
   * Returns the index of the target card of the action.
   * NOTE: only valid if set when action created or always after the action is executed!
   * @returns {Number}
   ###
  getTargetIndex:() ->
    if !@targetIndex? and @_private.target?
      target = @getTarget()
      if target?
        @targetIndex = @_private.target.getIndex()
    return @targetIndex

  ###*
   * Returns whether this action is a sub action (i.e. created by another action and not the user)
   * @returns {Boolean}
   ###
  getIsImplicit: () ->
    return @parentActionIndex?

  setFXResource: (fxResource) ->
    if !fxResource? or fxResource.length == 0
      @fxResource = null
    else
      @fxResource = fxResource

  getFXResource: () ->
    return @fxResource or []

  ###*
   * Modifies the action for execution. Useful for things like finding targets at execution time, before modifiers have modified this action.
   ###
  _modifyForExecution: () ->
    # override in sub class to add pre-execution behavior

  ###*
   * Executes the action.
   ###
  _execute: () ->
    # override in sub class to add execution behavior

  ###*
   * Sets the execution parent action of an action.
   * @param {Action} action
   ###
  setParentAction: (action) ->
    if action?
      # record parent's index
      @parentActionIndex = action.getIndex()

  ###*
   * Returns the execution parent action.
   * @returns {Action}
   ###
  getParentAction: () ->
    if @parentActionIndex? then @getGameSession().getActionByIndex(@parentActionIndex)

  ###*
   * Returns the index of the execution parent action.
   * @returns {Number}
   ###
  getParentActionIndex: () ->
    return @parentActionIndex

  ###*
   * Returns the execution root action.
   * @returns {Action}
   ###
  getRootAction: () ->
    if !@_private.cachedRootAction?
      if @parentActionIndex?
        # parent or higher is root
        parentAction = @getGameSession().getActionByIndex(@parentActionIndex)
        if parentAction?
          @_private.cachedRootAction = parentAction.getRootAction()
        else
          @_private.cachedRootAction = @
      else
        # this action is root
        @_private.cachedRootAction = @
    return @_private.cachedRootAction

  ###*
   * Returns an execution ancestor action that matches the parameters.
   * @param {Action|String} classOrType action class or action type
   * @param {Card} [source=null] action source
   * @param {Card} [target=null] action target
   * @returns {Action}
   ###
  getMatchingAncestorAction: (classOrType, source, target) ->
    # walk up parent action chain to find the first ancestor of action
    # that optionally matches an action class, source, and/or target
    if @parentActionIndex?
      parentAction = @getGameSession().getActionByIndex(@parentActionIndex)
      if parentAction?
        if (!classOrType? or (_.isString(classOrType) and parentAction.getType() == classOrType) or parentAction instanceof classOrType) and (!source? or parentAction.getSource() == source) and (!target? or parentAction.getTarget() == target)
          return parentAction
        else
          return parentAction.getMatchingAncestorAction(classOrType, source, target)
    else
      return null

  ###*
   * Returns a resolve ancestor action that matches the parameters.
   * @param {Action|String} classOrType action class or action type
   * @param {Card} [source=null] action source
   * @param {Card} [target=null] action target
   * @returns {Action}
   ###
  getMatchingResolveAncestorAction: (classOrType, source, target) ->
    # walk up parent action chain to find the first ancestor of action
    # that optionally matches an action class, source, and/or target
    if @resolveParentActionIndex?
      resolveParentAction = @getGameSession().getActionByIndex(@resolveParentActionIndex)
      if resolveParentAction?
        if (!classOrType? or (_.isString(classOrType) and resolveParentAction.getType() == classOrType) or resolveParentAction instanceof classOrType) and (!source? or resolveParentAction.getSource() == source) and (!target? or resolveParentAction.getTarget() == target)
          return resolveParentAction
        else
          return resolveParentAction.getMatchingResolveAncestorAction(classOrType, source, target)
    else
      return null

  ###*
   * Returns whether an action is the ancestor of this action.
   * @returns {Boolean}
   ###
  getIsActionMyAncestor: (action) ->
    parentAction = @getParentAction()
    return parentAction? or parentAction is action or parentAction.getIsActionMyAncestor(action)

  ###*
   * Adds an action as an execution sub action.
   * @param {Action} action
   ###
  addSubAction: (action) ->
    if action?
      # add action to list sub actions data objects
      # each data object retains the event type and a list of events executed during that event
      # sub action data objects are always in order of execution
      @subActionsOrderedByEventType ?= []
      subActionsData = @subActionsOrderedByEventType[@subActionsOrderedByEventType.length - 1]
      eventType = @getGameSession().getActionExecutionEventType()
      if !subActionsData? or subActionsData.eventType != eventType
        # add new sub actions map
        @subActionsOrderedByEventType.push({eventType: eventType, actions: [action]})
      else
        # add action to current event type map
        subActionsData.actions.push(action)

      # flush cache
      @_private.cachedSubActions = null

      # ensure parent is set correctly
      action.setParentAction(@)

  ###*
   * Returns an array of sub action data objects, each containing an eventType and actions executed for that eventType
   * @returns {Array}
   ###
  getSubActionsOrderedByEventType: () ->
    return @subActionsOrderedByEventType or []

  ###*
   * Returns an array of ordered execution sub actions.
   * @returns {Array}
   ###
  getSubActions: () ->
    if !@_private.cachedSubActions?
      @_private.cachedSubActions = []
      if @subActionsOrderedByEventType?
        for subActionsData in @subActionsOrderedByEventType
          @_private.cachedSubActions = @_private.cachedSubActions.concat(subActionsData.actions)
    return @_private.cachedSubActions

  getSubActionsQueue: () ->
    return @_private.cachedSubActionsQueue

  ###*
   * Executes all sub actions from the authoritative sub action queue if next event type matches current session event type.
   * @param {String} eventType
   ###
  executeNextOfEventTypeFromAuthoritativeSubActionQueue: (eventType) ->
    if @subActionsOrderedByEventType?
      # make a copy of the sub actions ordered by event type
      @_private.cachedSubActionsQueue ?= @subActionsOrderedByEventType.slice(0)

      # check next sub actions data
      if @_private.cachedSubActionsQueue.length > 0
        subActionsData = @_private.cachedSubActionsQueue[0]
        if subActionsData.eventType == eventType
          # event types match, remove from queue
          @_private.cachedSubActionsQueue.shift()

          # execute all sub actions for this eventType
          for action in subActionsData.actions
            @getGameSession().executeAction(action)

  ###*
   * Returns a recursive array of ordered execution actions.
   * @returns {Array}
   ###
  getFlattenedActionTree: () ->
    actions = [@]
    subActions = @getSubActions()
    if subActions.length > 0
      actionsProcessing = subActions.slice(0)
      actionsToProcess = []
      while actionsProcessing.length > 0
        subAction = actionsProcessing.shift()
        actions.push(subAction)
        subSubActions = subAction.getSubActions()
        if subSubActions.length > 0
          if subAction.getIsDepthFirst()
            actionsProcessing = actionsProcessing.concat(subSubActions)
          else
            actionsToProcess = actionsToProcess.concat(subSubActions)

        if actionsProcessing.length == 0 and actionsToProcess.length > 0
          actionsProcessing = actionsToProcess
          actionsToProcess = []
    return actions

  ###*
   * Returns an array of execution sibling actions
   * @returns {Array}
   ###
  getSiblingActions: () ->
    parentAction = @getParentAction()
    if parentAction?
      return parentAction.getSubActions()
    else
      return []

  ###*
   * Sets the resolve parent action of an action.
   * NOTE: Resolve sub actions are created as a result of this action executing and resolving.
   * @param {Action} action
   ###
  setResolveParentAction: (action) ->
    if action?
      # record parent's index
      @resolveParentActionIndex = action.getIndex()

  ###*
   * Returns the resolve parent action.
   * NOTE: Resolve sub actions are created as a result of this action executing and resolving.
   * @returns {Action}
   ###
  getResolveParentAction: () ->
    if @resolveParentActionIndex? then @getGameSession().getActionByIndex(@resolveParentActionIndex)

  ###*
   * Returns the index of the resolve parent action.
   * NOTE: Resolve sub actions are created as a result of this action executing and resolving.
   * @returns {Number}
   ###
  getResolveParentActionIndex: () ->
    return @resolveParentActionIndex

  ###*
   * Adds an action as a resolve sub action of this action.
   * NOTE: Resolve sub actions are created as a result of this action executing and resolving.
   * @param {Action} action
   ###
  addResolveSubAction: (action) ->
    if action?
      # add action index to list of sub actions
      index = action.getIndex()
      if _.indexOf(@resolveSubActionIndices, index) == -1
        @resolveSubActionIndices ?= []
        @resolveSubActionIndices.push(index)
        @_private.cachedResolveSubActions ?= []
        @_private.cachedResolveSubActions.push(action)

  ###*
   * Returns an array of resolve sub action indices.
   * NOTE: Resolve sub actions are created as a result of this action executing and resolving.
   * @returns {Array}
   ###
  getResolveSubActionsIndices: () ->
    return @resolveSubActionIndices or []

  ###*
   * Returns an array of resolve sub actions.
   * NOTE: Resolve sub actions are created as a result of this action executing and resolving.
   * @returns {Array}
   ###
  getResolveSubActions: () ->
    if @resolveSubActionIndices? and (!@_private.cachedResolveSubActions? or @_private.cachedResolveSubActions.length != @resolveSubActionIndices.length)
      @_private.cachedResolveSubActions = @getGameSession().getActionsByIndices(@resolveSubActionIndices)
    return @_private.cachedResolveSubActions or []

  ###*
   * Returns an array of resolve sibling actions, including this action.
   * @returns {Array}
   ###
  getResolveSiblingActions: () ->
    resolveParentAction = @getResolveParentAction()
    if resolveParentAction?
      return resolveParentAction.getResolveSubActions()
    else
      return []

  ###*
   * Records the modifier that triggered to create this action.
   * @param {Modifier} modifier
   ###
  setTriggeringModifier: (modifier) ->
    if modifier?
      # record parent's index
      @triggeringModifierIndex = modifier.getIndex()

  ###*
   * Returns the modifier that triggered to create this action.
   * @returns {Modifier}
   ###
  getTriggeringModifier: () ->
    if @triggeringModifierIndex? then @getGameSession().getModifierByIndex(@triggeringModifierIndex)

  ###*
   * Returns the index of the modifier that triggered to create this action.
   * @returns {Number}
   ###
  getTriggeringModifierIndex: () ->
    return @triggeringModifierIndex

  ###*
   * Returns whether this action was created by a triggering modifier at any point up the parent chain.
   * @returns {Boolean}
   ###
  getCreatedByTriggeringModifier: () ->
    return @getTriggeringModifierIndex()? or @getResolveParentAction()?.getCreatedByTriggeringModifier()

  _getModifierIndices: (indicesData) ->
    modifierIndices = []
    if indicesData?
      actionIndex = @getIndex()
      for dataModifierIndex, i in indicesData by 3
        dataActionIndex = indicesData[i+1]
        dataResolveActionIndex = indicesData[i+2]
        if dataActionIndex == actionIndex and (dataActionIndex != dataResolveActionIndex || dataModifierIndex != lastDataModifierIndex)
          modifierIndices.push(dataModifierIndex)
        lastDataModifierIndex = dataModifierIndex
    return modifierIndices

  _getResolveModifierIndices: (indicesData) ->
    modifierIndices = []
    if indicesData?
      actionIndex = @getIndex()
      for dataModifierIndex, i in indicesData by 3
        dataActionIndex = indicesData[i+1]
        dataResolveActionIndex = indicesData[i+2]
        if dataResolveActionIndex == actionIndex and (dataResolveActionIndex != dataActionIndex || dataModifierIndex != lastDataModifierIndex)
          modifierIndices.push(dataModifierIndex)
        lastDataModifierIndex = dataModifierIndex
    return modifierIndices

  ###*
   * Stores a modifier as triggered by this action.
   * @param {Modifier} modifier
   * @param {Action} resolveAction
   ###
  onTriggeredModifier: (modifier, resolveAction) ->
    if modifier?
      # record modifier index
      modifierIndex = modifier.getIndex()
      actionIndex = @getIndex()
      resolveActionIndex = resolveAction.getIndex()
      @_private.triggeredModifiersData ?= []
      @_private.triggeredModifiersData.push(modifierIndex, actionIndex, resolveActionIndex)

  ###*
   * Returns a list of data for modifiers triggered by this action.
   * - n+0 = modifierIndex
   * - n+1 = actionIndex
   * - n+2 = resolveActionIndex
   * @returns {Array}
   ###
  getTriggeredModifiersData: () ->
    return @_private.triggeredModifiersData or []

  ###*
   * Returns a list of modifier indices triggered by this action.
   * @returns {Array}
   ###
  getTriggeredModifierIndices: () ->
    return @_getModifierIndices(@_private.triggeredModifiersData)

  ###*
   * Returns a list of modifiers triggered by this action.
   * @returns {Array}
   ###
  getTriggeredModifiers: () ->
    return @getGameSession().getModifiersByIndices(@getTriggeredModifierIndices())

  ###*
   * Stores a modifier as triggered by this action during resolve.
   * @param {Modifier} modifier
   * @param {Action} action
   ###
  onResolveTriggeredModifier: (modifier, action) ->
    if modifier?
      # record modifier index
      modifierIndex = modifier.getIndex()
      actionIndex = action.getIndex()
      resolveActionIndex = @getIndex()
      @_private.triggeredModifiersData ?= []
      @_private.triggeredModifiersData.push(modifierIndex, actionIndex, resolveActionIndex)

  ###*
   * Returns a list of modifier indices triggered by this action during resolve.
   * @returns {Array}
   ###
  getResolveTriggeredModifierIndices: () ->
    return @_getResolveModifierIndices(@_private.triggeredModifiersData)

  ###*
   * Returns a list of modifiers triggered by this action during resolve.
   * @returns {Array}
   ###
  getResolveTriggeredModifiers: () ->
    return @getGameSession().getModifiersByIndices(@getResolveTriggeredModifierIndices())

  ###*
   * Stores a modifier as activated by this action.
   * @param {Modifier} modifier
   * @param {Action} resolveAction
   ###
  onActivatedModifier: (modifier, resolveAction) ->
    if modifier?
      # record modifier index
      modifierIndex = modifier.getIndex()
      actionIndex = @getIndex()
      resolveActionIndex = resolveAction.getIndex()
      @_private.activatedModifiersData ?= []
      @_private.activatedModifiersData.push(modifierIndex, actionIndex, resolveActionIndex)

  ###*
   * Returns a list of data for modifiers activated by this action.
   * - n+0 = modifierIndex
   * - n+1 = actionIndex
   * - n+2 = resolveActionIndex
   * @returns {Array}
   ###
  getActivatedModifiersData: () ->
    return @_private.activatedModifiersData or []

  ###*
   * Returns a list of modifier indices activated by this action.
   * @returns {Array}
   ###
  getActivatedModifierIndices: () ->
    return @_getModifierIndices(@_private.activatedModifiersData)

  ###*
   * Returns a list of modifiers activated by this action.
   * @returns {Array}
   ###
  getActivatedModifiers: () ->
    return @getGameSession().getModifiersByIndices(@getActivatedModifierIndices())

  ###*
   * Stores a modifier as activated by this action during resolve.
   * @param {Modifier} modifier
   * @param {Action} action
   ###
  onResolveActivatedModifier: (modifier, action) ->
    if modifier?
      # record modifier index
      modifierIndex = modifier.getIndex()
      actionIndex = action.getIndex()
      resolveActionIndex = @getIndex()
      @_private.activatedModifiersData ?= []
      @_private.activatedModifiersData.push(modifierIndex, actionIndex, resolveActionIndex)

  ###*
   * Returns a list of modifier indices activated by this action during resolve.
   * @returns {Array}
   ###
  getResolveActivatedModifierIndices: () ->
    return @_getResolveModifierIndices(@_private.activatedModifiersData)

  ###*
   * Returns a list of modifiers activated by this action during resolve.
   * @returns {Array}
   ###
  getResolveActivatedModifiers: () ->
    return @getGameSession().getModifiersByIndices(@getResolveActivatedModifierIndices())

  ###*
   * Stores a modifier as deactivated by this action.
   * @param {Modifier} modifier
   * @param {Action} resolveAction
   ###
  onDeactivatedModifier: (modifier, resolveAction) ->
    if modifier?
      # record modifier index
      modifierIndex = modifier.getIndex()
      actionIndex = @getIndex()
      resolveActionIndex = resolveAction.getIndex()
      @_private.deactivatedModifiersData ?= []
      @_private.deactivatedModifiersData.push(modifierIndex, actionIndex, resolveActionIndex)

  ###*
   * Returns a list of data for modifiers deactivated by this action.
   * - n+0 = modifierIndex
   * - n+1 = actionIndex
   * - n+2 = resolveActionIndex
   * @returns {Array}
   ###
  getDeactivatedModifiersData: () ->
    return @_private.deactivatedModifiersData or []

  ###*
   * Returns a list of modifier indices deactivated by this action.
   * @returns {Array}
   ###
  getDeactivatedModifierIndices: () ->
    return @_getModifierIndices(@_private.deactivatedModifiersData)

  ###*
   * Returns a list of modifiers deactivated by this action.
   * @returns {Array}
   ###
  getDeactivatedModifiers: () ->
    return @getGameSession().getModifiersByIndices(@getDeactivatedModifierIndices())

  ###*
   * Stores a modifier as deactivated by this action during resolve.
   * @param {Modifier} modifier
   * @param {Action} action
   ###
  onResolveDeactivatedModifier: (modifier, action) ->
    if modifier?
      # record modifier index
      modifierIndex = modifier.getIndex()
      actionIndex = action.getIndex()
      resolveActionIndex = @getIndex()
      @_private.deactivatedModifiersData ?= []
      @_private.deactivatedModifiersData.push(modifierIndex, actionIndex, resolveActionIndex)

  ###*
   * Returns a list of modifier indices deactivated by this action during resolve.
   * @returns {Array}
   ###
  getResolveDeactivatedModifierIndices: () ->
    return @_getResolveModifierIndices(@_private.deactivatedModifiersData)

  ###*
   * Returns a list of modifiers deactivated by this action during resolve.
   * @returns {Array}
   ###
  getResolveDeactivatedModifiers: () ->
    return @getGameSession().getModifiersByIndices(@getResolveDeactivatedModifierIndices())

  ###*
   * Stores a modifier as changing this action. This must be called manually when a modifier changes any property of an action in response to an event.
   * @param {Modifier} modifier
   ###
  setChangedByModifier: (modifier) ->
    # record modifier
    if modifier? and !@getChangedByModifier(modifier)
      index = modifier.getIndex()
      @changedByModifierIndices ?= []
      @changedByModifierIndices.push(index)

  ###*
   * Returns a list of modifiers that changed this action.
   * @returns {Array}
   ###
  getChangedByModifiers: () ->
    return @getGameSession().getModifiersByIndices(@changedByModifierIndices)

  ###*
   * Returns a list of modifier indices that changed this action.
   * @returns {Array}
   ###
  getChangedByModifierIndices: () ->
    return @changedByModifierIndices or []

  ###*
   * Returns whether a modifier changed this action.
   * @param {Modifier} modifier
   * @returns {Boolean}
   ###
  getChangedByModifier: (modifier) ->
    if @changedByModifierIndices?
      return _.contains(@changedByModifierIndices, modifier.getIndex())
    return false

  ### JSON serialization ###

  ###
  Returns whether this action can be removed during scrubbing.
  @param   {String}   scrubFromPerspectiveOfPlayerId    The player for who we want to scrub. (The player that is not allowed to see the data).
  @param   {Boolean}   forSpectator              Should the scrubbing be done for someone watching the game? If so we usually want to blank out the deck since even if a buddy can see your hand, they shouldn't be able to deck snipe.
  @returns {Object}
     ###
  isRemovableDuringScrubbing: (scrubFromPerspectiveOfPlayerId, forSpectator) ->
    # override in sub class to modify and return action data
    return true

  ###
  Resets/scrubs all cheat sensitive data in action data.
  @param   {Object}   actionData              Plain js object for action data.
  @param   {String}   scrubFromPerspectiveOfPlayerId    The player for who we want to scrub. (The player that is not allowed to see the data).
  @param   {Boolean}   forSpectator              Should the scrubbing be done for someone watching the game? If so we usually want to blank out the deck since even if a buddy can see your hand, they shouldn't be able to deck snipe.
  @returns {Object}
     ###
  scrubSensitiveData: (actionData, scrubFromPerspectiveOfPlayerId, forSpectator) ->
    # override in sub class to modify and return action data
    return actionData

  ###
   * Resets action properties for execution on an authoritative session.
  ###
  resetForAuthoritativeExecution: () ->
    delete @timestamp
    delete @subActionsOrderedByEventType
    delete @resolveSubActionIndices

  deserialize: (data) ->
    UtilsJavascript.fastExtend(this,data)

    # deserialize all sub actions
    subActionsOrderedByEventType = @subActionsOrderedByEventType
    if subActionsOrderedByEventType?
      @subActionsOrderedByEventType = []
      for subActionsData in subActionsOrderedByEventType
        subActionsToDeserialize = subActionsData.actions
        subActionsData.actions = []
        for subActionToDeserialize in subActionsToDeserialize
          subAction = @getGameSession().deserializeActionFromFirebase(subActionToDeserialize)
          subActionsData.actions.push(subAction)
        @subActionsOrderedByEventType.push(subActionsData)

module.exports = Action
