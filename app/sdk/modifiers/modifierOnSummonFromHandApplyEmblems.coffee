ModifierOnSummonFromHand = require './modifierOnSummonFromHand'

class ModifierOnSummonFromHandApplyEmblems extends ModifierOnSummonFromHand

  type:"ModifierOnSummonFromHandApplyEmblems"
  @type:"ModifierOnSummonFromHandApplyEmblems"

  @isKeyworded: true
  @modifierName: "Destiny"
  @description: null
  @keywordDefinition: "Summon to gain a permanent game-changing effect."

  emblems: null #player modifiers for the emblem's ongoing effect
  applyToSelf: true
  applyToEnemy: false

  @createContextObject: (emblems, applyToSelf=true, applyToEnemy=false, options) ->
    contextObject = super(options)
    contextObject.emblems = emblems
    contextObject.applyToSelf = applyToSelf
    contextObject.applyToEnemy = applyToEnemy
    return contextObject

  onSummonFromHand: () ->

    if @emblems?
      general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      for emblem in @emblems
        emblem.isRemovable = false
        if emblem?
          if @applyToSelf
            @getGameSession().applyModifierContextObject(emblem, general)
          if @applyToEnemy
            @getGameSession().applyModifierContextObject(emblem, enemyGeneral)

module.exports = ModifierOnSummonFromHandApplyEmblems
