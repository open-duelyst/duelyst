Modifier = require './modifier'

###
  Abstract modifier class that counts something in the game.
  ex: building has (3,2,1) turns until it builds
      mechaz0r progress is (20%,40%,100%)
###
class ModifierCounter extends Modifier

  type:"ModifierCounter"
  @type:"ModifierCounter"

  isHiddenToUI: true
  isRemovable: false

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
      @updateCountIfNeeded()
    super()

  updateCountIfNeeded: () ->
    @_private.previousCount = @_private.currentCount
    @_private.currentCount = @getCurrentCount()
    if @_private.currentCount != @_private.previousCount
      @removeSubModifiers()
      @getGameSession().applyModifierContextObject(@getModifierContextObjectToApply(), @getCard(), @)

  # operates during aura phase, but is not an aura itself

  # remove modifiers during remove aura phase
  _onRemoveAura: (event) ->
    super(event)
    if @_private.cachedIsActive
      @updateCountIfNeeded()

  removeSubModifiers: () ->
    for subMod in @getSubModifiers() by -1
      @getGameSession().removeModifier(subMod)

  # update count during add aura phase
  _onAddAura: (event) ->
    super(event)
    if @_private.cachedIsActive
      @updateCountIfNeeded()

  getModifierContextObjectToApply: () ->
    # override this method to return correct context object for sub modifier to be displayed in-game
    return {}

  getCurrentCount: () ->
    # override this method to calculate change in board state
    return 0

module.exports = ModifierCounter
