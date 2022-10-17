Modifier = require './modifier'
ModifierSpellWatch = require './modifierSpellWatch'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSpellWatchBuffAllies extends ModifierSpellWatch

  type:"ModifierSpellWatchBuffAllies"
  @type:"ModifierSpellWatchBuffAllies"

  @modifierName:"Spell Watch (Buff allies )"
  @description: "Whenever you cast a spell, friendly minions gain %X."

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, options) ->
    contextObject = super(options)
    contextObject.atkBuffVal = attackBuff
    contextObject.maxHPBuffVal = maxHPBuff
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(modifierContextObject.atkBuffVal,modifierContextObject.maxHPBuffVal)
    else
      return @description

  onSpellWatch: (action) ->
    #buff self
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(@atkBuffVal, @maxHPBuffVal)
    if @appliedName then statContextObject.appliedName = @appliedName
    @getGameSession().applyModifierContextObject(statContextObject, @getCard())

    #buff friendly minions
    friendlyEntities = @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
    for entity in friendlyEntities
      if !entity.getIsGeneral()
        statContextObject = Modifier.createContextObjectWithAttributeBuffs(@atkBuffVal, @maxHPBuffVal)
        if @appliedName then statContextObject.appliedName = @appliedName
        @getGameSession().applyModifierContextObject(statContextObject, entity)

module.exports = ModifierSpellWatchBuffAllies
