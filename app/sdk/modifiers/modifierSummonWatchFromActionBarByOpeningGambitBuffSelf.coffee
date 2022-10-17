Modifier = require './modifier'
ModifierSummonWatch = require './modifierSummonWatch'
ModifierOpeningGambit = require './modifierOpeningGambit'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf extends ModifierSummonWatch

  type:"ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf"
  @type:"ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf"

  @modifierName:"Summon Watch from action bar (buff by Opening Gambit)"
  @description: "Whenever you summon a minion with Opening Gambit from your action bar, gain %Y"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, options=undefined) ->
    contextObject = super(options)
    modContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    modContextObject.appliedName = "Hunter"
    contextObject.modifiersContextObjects = [modContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%Y/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  getIsActionRelevant: (action) ->
    # watch for a unit being summoned from action bar by the player who owns this entity, don't trigger on summon of this unit
    return action instanceof PlayCardFromHandAction and action.getCard() isnt @getCard() and super(action)

  onSummonWatch: (action) ->
    # apply modifiers once
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

  getIsCardRelevantToWatcher: (card) ->
    # search for keyword class opening gambit
    # searching by keyword class because units with followup spells on summon are also 'opening gambit' minions
    for kwClass in card.getKeywordClasses()
      if kwClass.belongsToKeywordClass(ModifierOpeningGambit)
        return true
    return false  #fallback to false if no opening gambit keywords found

module.exports = ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf
