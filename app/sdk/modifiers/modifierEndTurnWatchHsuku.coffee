ModifierEndTurnWatch = require './modifierEndTurnWatch'
ModifierFrenzy = require './modifierFrenzy'
ModifierTranscendance = require './modifierTranscendance'
ModifierRanged = require './modifierRanged'
ModifierForcefield = require './modifierForcefield'
ModifierCannotMove = require './modifierCannotMove'
ModifierStunned = require './modifierStunned'
ModifierCannotStrikeback = require './modifierCannotStrikeback'
Modifier = require './modifier'

class ModifierEndTurnWatchHsuku extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchHsuku"
  @type:"ModifierEndTurnWatchHsuku"

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  buffName: null
  debuffName: null

  onTurnWatch: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()

      units = @getGameSession().getBoard().getUnits()

      for unit in units
        if unit? and !unit.getIsGeneral()
          randomNum = @getGameSession().getRandomIntegerForExecution(6)
          statModifier = null
          abilityModifier = null
          if unit.getOwnerId() == @getCard().getOwnerId()
            switch randomNum
              when 0
                statModifier = Modifier.createContextObjectWithAttributeBuffs(1,0)
                abilityModifier = ModifierTranscendance.createContextObject()
              when 1
                statModifier = Modifier.createContextObjectWithAttributeBuffs(1,0)
                abilityModifier = ModifierRanged.createContextObject()
              when 2
                statModifier = Modifier.createContextObjectWithAttributeBuffs(1,0)
                abilityModifier = ModifierFrenzy.createContextObject()
              when 3
                statModifier = Modifier.createContextObjectWithAttributeBuffs(1,3)
              when 4
                statModifier = Modifier.createContextObjectWithAttributeBuffs(2,2)
              when 5
                abilityModifier = ModifierForcefield.createContextObject()
            if statModifier?
              statModifier.appliedName = @buffName
          else
            switch randomNum
              when 0
                statModifier = Modifier.createContextObjectWithAttributeBuffs(-1,0)
                abilityModifier = ModifierCannotMove.createContextObject()
              when 1
                statModifier = Modifier.createContextObjectWithAttributeBuffs(-1,0)
                abilityModifier = ModifierCannotStrikeback.createContextObject()
              when 2
                statModifier = Modifier.createContextObjectWithAttributeBuffs(2,-2)
              when 3
                statModifier = Modifier.createContextObjectWithAttributeBuffs(-2,0)
              when 4
                statModifier = Modifier.createContextObjectWithAttributeBuffs(-1,-1)
              when 5
                abilityModifier = ModifierStunned.createContextObject()
            if statModifier?
              statModifier.appliedName = @debuffName
          
          if statModifier?
            @getGameSession().applyModifierContextObject(statModifier, unit)
          if abilityModifier?
            @getGameSession().applyModifierContextObject(abilityModifier, unit)

module.exports = ModifierEndTurnWatchHsuku
