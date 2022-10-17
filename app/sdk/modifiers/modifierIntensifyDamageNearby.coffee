ModifierIntensify = require './modifierIntensify'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierIntensifyDamageNearby extends ModifierIntensify

  type: "ModifierIntensifyDamageNearby"
  @type: "ModifierIntensifyDamageNearby"

  fxResource: ["FX.Modifiers.ModifierGenericDamageNearby"]

  damageAmount: 0

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onIntensify: () ->

    totalDamageAmount = @getIntensifyAmount() * @damageAmount

    entities = @getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(totalDamageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierIntensifyDamageNearby
