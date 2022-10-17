ModifierSummonWatch = require './modifierSummonWatch'
Modifier = require './modifier'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'

class ModifierSummonWatchByRaceDamageEnemyMinion extends ModifierSummonWatch

  type:"ModifierSummonWatchByRaceDamageEnemyMinion"
  @type:"ModifierSummonWatchByRaceDamageEnemyMinion"

  @modifierName:"Summon Watch (buff by race)"
  @description: "Whenever you summon %X, deal %Y damage to a random enemy minion"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericDamageIce"]

  @createContextObject: (damageAmount, targetRaceId, raceName, options) ->
    contextObject = super(options)
    contextObject.targetRaceId = targetRaceId
    contextObject.raceName = raceName
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%Y/, modifierContextObject.damageAmount
      return replaceText.replace /%X/, modifierContextObject.raceName
    else
      return @description

  onSummonWatch: (action) ->
    radomDamageAction = new RandomDamageAction(@getGameSession())
    radomDamageAction.setOwnerId(@getCard().getOwnerId())
    radomDamageAction.setSource(@getCard())
    radomDamageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(radomDamageAction)

  getIsCardRelevantToWatcher: (card) ->
    return card.getBelongsToTribe(@targetRaceId)

module.exports = ModifierSummonWatchByRaceDamageEnemyMinion
