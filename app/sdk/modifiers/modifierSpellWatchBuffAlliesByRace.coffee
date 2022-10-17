Modifier = require './modifier'
ModifierSpellWatch = require './modifierSpellWatch'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'
RaceFactory = require 'app/sdk/cards/raceFactory'

class ModifierSpellWatchBuffAlliesByRace extends ModifierSpellWatch

  type:"ModifierSpellWatchBuffAlliesByRace"
  @type:"ModifierSpellWatchBuffAlliesByRace"

  @modifierName:"Spell Watch (Buff allies by race)"
  @description: "Whenever you cast a spell, your"

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, validRace=0,options) ->
    contextObject = super(options)
    contextObject.atkBuffVal = attackBuff
    contextObject.maxHPBuffVal = maxHPBuff
    contextObject.validRaceId = validRace
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description+" "+RaceFactory.raceForIdentifier(modifierContextObject.validRaceId).name+" minions gain %X"
      return replaceText.replace /%X/, Stringifiers.stringifyAttackHealthBuff(modifierContextObject.atkBuffVal,modifierContextObject.maxHPBuffVal)
    else
      return @description

  onSpellWatch: (action) ->
    #buff self (he's always an arcanyst)
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(@atkBuffVal, @maxHPBuffVal)
    if @appliedName then statContextObject.appliedName = @appliedName
    @getGameSession().applyModifierContextObject(statContextObject, @getCard())

    #check for allied arcanysts, and buff them too
    friendlyEntities = @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
    for entity in friendlyEntities
      if entity.getBelongsToTribe(@validRaceId)
        statContextObject = Modifier.createContextObjectWithAttributeBuffs(@atkBuffVal, @maxHPBuffVal)
        if @appliedName then statContextObject.appliedName = @appliedName
        @getGameSession().applyModifierContextObject(statContextObject, entity)

module.exports = ModifierSpellWatchBuffAlliesByRace
