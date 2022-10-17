ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
PlayerModifier = require './playerModifier'
CardType = require 'app/sdk/cards/cardType'

class PlayerModifierManaModifier extends PlayerModifier

  type:"PlayerModifierManaModifier"
  @type:"PlayerModifierManaModifier"

  bonusMana: 0
  costChange: 0
  isAura: false # mana modifiers may be auras, but only when they change the cost of cards
  auraIncludeAlly: true
  auraIncludeBoard: false
  auraIncludeEnemy: false
  auraIncludeGeneral: false
  auraIncludeHand: true
  auraIncludeSelf: false
  auraIncludeSignatureCards: false

  @createContextObject: (bonusMana=0, costChange=0, auraFilterByCardType, auraFilterByRaceIds, options) ->
    contextObject = super(options)
    contextObject.bonusMana = bonusMana
    contextObject.costChange = costChange
    if costChange != 0
      # modifies mana cost of cards
      contextObject.isAura = true
      contextObject.auraFilterByCardType = auraFilterByCardType
      contextObject.auraFilterByRaceIds = auraFilterByRaceIds
      contextObject.modifiersContextObjects = [ModifierManaCostChange.createContextObject(costChange)]
    return contextObject

  @createCostChangeContextObject: (costChange, auraFilterByCardType, auraFilterByRaceIds, options) ->
    return @createContextObject(0, costChange, auraFilterByCardType, auraFilterByRaceIds, options)

  @createBonusManaContextObject: (bonusMana, options) ->
    return @createContextObject(bonusMana, null, null, null, options)

  _filterPotentialCardInAura: (card) ->
    beingUsedForBonusMana = false
    if @costChange == 0 and !@isAura
      beingUsedForBonusMana = true
    return beingUsedForBonusMana or super(card)

module.exports = PlayerModifierManaModifier
