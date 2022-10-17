Modifier = require './modifier'
UtilsGameSession = require 'app/common/utils/utils_game_session'

###
  Abstract modifier class that checks for a specific board state (situation) and when that situation is active applies modifiers from modifiers context objects to the card this modifier is applied to.
###
class ModifierSituationalBuffSelf extends Modifier

  type:"ModifierSituationalBuffSelf"
  @type:"ModifierSituationalBuffSelf"

  @description:"Whenever %X"

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedIsSituationActive = false
    p.cachedWasSituationActive = false

    return p

  onApplyToCardBeforeSyncState: () ->
    super()

    # apply situational modifiers once and retain them on self
    # this way we can enable/disable based on whether the situation is active
    # rather than constantly adding and removing modifiers
    @applyManagedModifiersFromModifiersContextObjectsOnce(@modifiersContextObjects, @getCard())

  updateCachedStateAfterActive: () ->
    @_private.cachedWasSituationActive = @_private.cachedIsSituationActive
    @_private.cachedIsSituationActive = @_private.cachedIsActive and @getIsSituationActiveForCache()

    # call super after updating whether situation is active
    # because we need to know if situation is active to know whether sub modifiers are disabled
    super()

  getAreSubModifiersActiveForCache: () ->
    return @_private.cachedIsSituationActive

  getIsAura: () ->
    # situational modifiers act as auras but do not use the default aura behavior
    return true

  getIsSituationActiveForCache: () ->
    # always assume not in correct situation
    # override in sub class to determine situations in which this modifier should apply modifierContextObjects
    return false

module.exports = ModifierSituationalBuffSelf
