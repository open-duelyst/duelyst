ModifierStartTurnWatch = require './modifierStartTurnWatch'
DamageAction = require 'app/sdk/actions/damageAction'

CONFIG = require 'app/common/config'

class ModifierStartTurnWatchDamageMyGeneral extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchDamageMyGeneral"
  @type:"ModifierStartTurnWatchDamageMyGeneral"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericChainLightningRed"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onTurnWatch: (action) ->
    super(action)

    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
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

module.exports = ModifierStartTurnWatchDamageMyGeneral
