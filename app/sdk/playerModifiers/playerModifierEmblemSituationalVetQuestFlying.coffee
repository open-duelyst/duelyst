PlayerModifierEmblem = require './playerModifierEmblem'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'

class PlayerModifierEmblemSituationalVetQuestFlying extends PlayerModifierEmblem

  type:"PlayerModifierEmblemSituationalVetQuestFlying"
  @type:"PlayerModifierEmblemSituationalVetQuestFlying"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  numArtifactsRequired: 0

  @createContextObject: (numArtifactsRequired, options) ->
    contextObject = super(options)
    contextObject.numArtifactsRequired = numArtifactsRequired
    return contextObject

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
    @applyManagedModifiersFromModifiersContextObjectsOnce([ModifierFlying.createContextObject()], @getCard())

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

    modifiersByArtifact = @getCard().getArtifactModifiersGroupedByArtifactCard()
    if modifiersByArtifact.length >= @numArtifactsRequired
      return true
    return false

module.exports = PlayerModifierEmblemSituationalVetQuestFlying
