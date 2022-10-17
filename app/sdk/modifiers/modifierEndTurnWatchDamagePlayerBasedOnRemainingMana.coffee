ModifierEndEveryTurnWatch = require './modifierEndEveryTurnWatch'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana extends ModifierEndEveryTurnWatch

  type:"ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana"
  @type:"ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana"

  @modifierName:"End Watch"
  @description:"At the end of each turn, deal damage to the player equal to their remaining mana"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierExplosionsNearby"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description

  onTurnWatch: (action) ->
    #get remaining mana
    owner = action.getOwner()
    damageAmount = owner.getRemainingMana()

    target = @getGameSession().getGeneralForPlayer(owner)

    #damage self
    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setSource(@getCard())
    damageAction.setTarget(target)
    damageAction.setDamageAmount(damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana
