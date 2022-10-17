ModifierStackingShadowsBonusDamage = require './modifierStackingShadowsBonusDamage'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'

class ModifierStackingShadowsBonusDamageEqualNumberTiles extends ModifierStackingShadowsBonusDamage

  type:"ModifierStackingShadowsBonusDamageEqualNumberTiles"
  @type:"ModifierStackingShadowsBonusDamageEqualNumberTiles"

  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  @createContextObject: () ->
    contextObject = super(0,1)
    return contextObject

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
    shadowTileCount = 0
    for card in @getGameSession().getBoard().getCards(CardType.Tile, allowUntargetable=true)
      if card.getBaseCardId() is Cards.Tile.Shadow and card.isOwnedBy(@getCard().getOwner())
        shadowTileCount++
    return shadowTileCount

  getFlatBonusDamage: () ->
    numTiles = @getCurrentCount()
    if numTiles > 0
      return numTiles - 1
    return 0

module.exports = ModifierStackingShadowsBonusDamageEqualNumberTiles
