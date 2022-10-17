Modifier = require './modifier'

###
  Abstract modifier class that checks for a change in count of specific board state and stacks a count of sub modifiers based on that board state
  ex: has +1/+1 for each Shadow Creep tile on the board
      costs 1 less for each Battle Pet on the board
###
class ModifierDynamicCountModifySelf extends Modifier

  type:"ModifierDynamicCountModifySelf"
  @type:"ModifierDynamicCountModifySelf"

  @description:"Change stats based on count of something on board"

  @getDescription: () ->
    return @description

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.currentCount = 0
    p.previousCount = 0

    return p

  onDeactivate: () ->
    # reset to default states when deactivated
    @_private.currentCount = @_private.previousCount = 0
    @removeManagedModifiersFromCard(@getCard())

  updateCachedStateAfterActive: () ->
    if @_private.cachedIsActive
      @_private.previousCount = @_private.currentCount
      @_private.currentCount = @getCurrentCount()
    super()

  # operates during aura phase, but is not an aura itself

  # remove modifiers during remove aura phase
  _onRemoveAura: (event) ->
    super(event)
    if @_private.cachedIsActive
      countChange = @_private.currentCount - @_private.previousCount
      if countChange < 0
        @removeSubModifiers(Math.abs(countChange))

  removeSubModifiers: (numModifiers) ->
    subMods = @getSubModifiers()
    removeCount = 0
    if subMods.length < numModifiers
      removeCount = subMods.length
    else
      removeCount = numModifiers
    if removeCount > 0
      for subMod in subMods by -1
        @getGameSession().removeModifier(subMod)
        removeCount--
        if removeCount == 0
          break

  # add modifiers during add modifier phase
  _onAddAura: (event) ->
    super(event)
    if @_private.cachedIsActive
      countChange = @_private.currentCount - @_private.previousCount
      if countChange > 0
        @addSubModifiers(countChange)

  addSubModifiers: (numModifiers) ->
    for i in [0..numModifiers-1]
      @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

  getCurrentCount: () ->
    # override this method to calculate change in board state
    return 0

module.exports = ModifierDynamicCountModifySelf
