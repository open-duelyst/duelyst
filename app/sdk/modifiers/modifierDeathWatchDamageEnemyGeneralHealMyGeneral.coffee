ModifierDeathWatch = require './modifierDeathWatch'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'

class ModifierDeathWatchDamageEnemyGeneralHealMyGeneral extends ModifierDeathWatch

  type:"ModifierDeathWatchDamageEnemyGeneral"
  @type:"ModifierDeathWatchDamageEnemyGeneral"

  @modifierName:"Deathwatch"
  @description:"Deal %X damage to the enemy General, and restore %Y Health to your General"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericChain"]

  @createContextObject: (damageAmount=1, healAmount=1,options) ->
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
    # damage enemy General
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    if general?
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(general)
      if !@damageAmount
        damageAction.setDamageAmount(@getCard().getATK())
      else
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

module.exports = ModifierDeathWatchDamageEnemyGeneralHealMyGeneral
