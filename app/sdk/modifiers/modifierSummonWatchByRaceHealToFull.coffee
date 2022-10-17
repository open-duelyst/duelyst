ModifierSummonWatch = require './modifierSummonWatch'
HealAction = require "app/sdk/actions/healAction"

class ModifierSummonWatchByRaceHealToFull extends ModifierSummonWatch

  type:"ModifierSummonWatchByRaceHealToFull"
  @type:"ModifierSummonWatchByRaceHealToFull"

  @modifierName:"Summon Watch (by race heal to full)"
  @description: "Whenever you summon %X, restore this minion to full health"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (targetRaceId, raceName, options) ->
    contextObject = super(options)
    contextObject.targetRaceId = targetRaceId
    contextObject.raceName = raceName
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.raceName
    else
      return @description

  onSummonWatch: (action) ->
    healAction = @getCard().getGameSession().createActionForType(HealAction.type)
    healAction.setTarget(@getCard())
    healAction.setHealAmount(@getCard().getMaxHP() - @getCard().getHP())
    @getCard().getGameSession().executeAction(healAction)

  getIsCardRelevantToWatcher: (card) ->
    return card.getBelongsToTribe(@targetRaceId)

module.exports = ModifierSummonWatchByRaceHealToFull
