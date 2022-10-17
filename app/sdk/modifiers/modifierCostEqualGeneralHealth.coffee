Modifier = require './modifier'

class ModifierCostEqualGeneralHealth extends Modifier

  type:"ModifierCostEqualGeneralHealth"
  @type:"ModifierCostEqualGeneralHealth"

  @modifierName: "Raging Taura"
  @description:"This minion's cost is equal to your General's Health"

  activeInDeck: false
  activeInHand: true
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  constructor: (gameSession) ->
    super(gameSession)
    @attributeBuffsAbsolute = ["manaCost"]
    @attributeBuffsFixed = ["manaCost"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedManaCost = 0

    return p

  getBuffedAttribute: (attributeValue, buffKey) ->
    if buffKey == "manaCost"
      return @_private.cachedManaCost
    else
      return super(attributeValue, buffKey)

  getBuffsAttributes: () ->
    return true

  getBuffsAttribute: (buffKey) ->
    return buffKey == "manaCost" or super(buffKey)

  updateCachedStateAfterActive: () ->
    super()

    card = @getCard()
    owner = card?.getOwner()
    general = @getGameSession().getGeneralForPlayer(owner)
    manaCost = 0
    if general?
      manaCost = Math.max(0, general.getHP())
    else
      manaCost = 0

    if @_private.cachedManaCost != manaCost
      @_private.cachedManaCost = manaCost
      @getCard().flushCachedAttribute("manaCost")

module.exports = ModifierCostEqualGeneralHealth
