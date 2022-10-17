ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierEndTurnWatchDamageNearbyEnemy extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchDamageNearbyEnemy"
  @type:"ModifierEndTurnWatchDamageNearbyEnemy"

  @modifierName:"End Watch"
  @description:"At the end of your turn, deal %X damage to all %Y"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierGenericDamageNearby"]

  @createContextObject: (damageAmount=1, damageGenerals=false, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.damageGenerals = damageGenerals
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%X/, modifierContextObject.damageAmount
      if modifierContextObject.damageGenerals
        replaceText = replaceText.replace /%Y/, "nearby enemies"
      else
        replaceText = replaceText.replace /%Y/, "nearby enemy minions"
      return replaceText
    else
      return @description

  onTurnWatch: (action) ->
    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      # don't damage enemy General unless specifically allowed, but do damage enemy units
      if @damageGenerals or (!@damageGenerals and !entity.getIsGeneral())
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierEndTurnWatchDamageNearbyEnemy
