ModifierImmuneToDamage =   require './modifierImmuneToDamage'
DamageAction =   require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierImmuneToDamageByWeakerEnemies extends ModifierImmuneToDamage

  type:"ModifierImmuneToDamageByWeakerEnemies"
  @type:"ModifierImmuneToDamageByWeakerEnemies"

  includeGenerals: false

  @createContextObject: (includeGenerals, options) ->
    contextObject = super(options)
    contextObject.includeGenerals = includeGenerals
    return contextObject

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof DamageAction and a.getIsValid() and @getCard() is a.getTarget() and a.getSource()?.getType() is CardType.Unit and (@includeGenerals or !a.getSource().getIsGeneral()) and (a.getSource().getATK() < a.getTarget().getATK())

module.exports = ModifierImmuneToDamageByWeakerEnemies
