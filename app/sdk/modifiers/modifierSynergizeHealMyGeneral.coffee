ModifierSynergize = require './modifierSynergize'
HealAction = require 'app/sdk/actions/healAction'

class ModifierSynergizeHealMyGeneral extends ModifierSynergize

  type:"ModifierSynergizeHealMyGeneral"
  @type:"ModifierSynergizeHealMyGeneral"

  @description:"Restore %X Health to your General"

  healAmount: 0

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  @createContextObject: (healAmount, options) ->
    contextObject = super()
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onSynergize: (action) ->
    super(action)

    healAction = new HealAction(@getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(@getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()))
    healAction.setHealAmount(@healAmount)

    @getGameSession().executeAction(healAction)

module.exports = ModifierSynergizeHealMyGeneral
