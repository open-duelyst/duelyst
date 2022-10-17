ModifierDeathWatch = require './modifierDeathWatch'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'

class ModifierDeathWatchDamageRandomMinionHealMyGeneral extends ModifierDeathWatch

  type:"ModifierDeathWatchDamageRandomMinionHealMyGeneral"
  @type:"ModifierDeathWatchDamageRandomMinionHealMyGeneral"

  @modifierName:"Deathwatch"
  @description:"When a friendly minion dies, deal %X damage to a random minion, and restore %Y Health to your General"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericChain"]

  @createContextObject: (damageAmount=3, healAmount=3,options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      descriptionText = @description.replace /%X/, modifierContextObject.damageAmount
      return descriptionText.replace /%Y/, modifierContextObject.healAmount
    else
      return @description

  onDeathWatch: (action) ->
    #if the target is a friendly minion
    if action.getTarget().getOwnerId() is @getCard().getOwnerId()
      # damage random minion
      if @getGameSession().getIsRunningAsAuthoritative()
        allMinions = []
        units = @getGameSession().getBoard().getUnits()

        for unit in units
          if !unit.getIsGeneral()
            allMinions.push(unit)

        if allMinions.length > 0
          unitToDamage = allMinions[@getGameSession().getRandomIntegerForExecution(allMinions.length)]
          damageAction = new DamageAction(@getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setSource(@getCard())
          damageAction.setTarget(unitToDamage)
          damageAction.setDamageAmount(@damageAmount)
          @getGameSession().executeAction(damageAction)

      # heal my General
      myGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      if myGeneral?
        healAction = new HealAction(this.getGameSession())
        healAction.setOwnerId(@getCard().getOwnerId())
        healAction.setTarget(myGeneral)
        healAction.setHealAmount(@healAmount)
        @getGameSession().executeAction(healAction)

module.exports = ModifierDeathWatchDamageRandomMinionHealMyGeneral
