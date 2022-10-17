ModifierSummonWatchAnyPlayer = require './modifierSummonWatchAnyPlayer'
ModifierFrenzy = require './modifierFrenzy'
ModifierFlying = require './modifierFlying'
ModifierTranscendance = require './modifierTranscendance'
ModifierProvoke = require './modifierProvoke'
ModifierRanged = require './modifierRanged'
ModifierFirstBlood = require './modifierFirstBlood'
ModifierRebirth = require './modifierRebirth'
ModifierBlastAttack = require './modifierBlastAttack'
ModifierForcefield = require './modifierForcefield'

class ModifierSummonWatchAnyPlayerHsuku extends ModifierSummonWatchAnyPlayer

  type:"ModifierSummonWatchAnyPlayerHsuku"
  @type:"ModifierSummonWatchAnyPlayerHsuku"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  abilitiesToGain: null #abilities for Hsuku to gain, abilities will be removed from this list
  abilityMasterList: null #unchanging list of possible abilities

  @createContextObject: (options) ->
    contextObject = super(options)
    contextObject.abilitiesToGain = [
      ModifierForcefield.type,
      ModifierFrenzy.type,
      ModifierFlying.type,
      ModifierTranscendance.type,
      ModifierProvoke.type,
      ModifierRanged.type,
      ModifierFirstBlood.type,
      ModifierRebirth.type,
      ModifierBlastAttack.type
    ]
    contextObject.abilityMasterList = [
      ModifierForcefield.type,
      ModifierFrenzy.type,
      ModifierFlying.type,
      ModifierTranscendance.type,
      ModifierProvoke.type,
      ModifierRanged.type,
      ModifierFirstBlood.type,
      ModifierRebirth.type,
      ModifierBlastAttack.type
    ]
    return contextObject

  onSummonWatch: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()
      unit = action.getTarget()
      if unit? and @isNearbyAnyGeneral(unit.getPosition())

        # First try to find an ability neither Hsuku nor the unit have
        mutualAbilitiesToGain = []
        abilityToGain = null
        for ability in @abilitiesToGain
          if !unit.hasActiveModifierType(ability) and !@getCard().hasActiveModifierType(ability)
            mutualAbilitiesToGain.push(ability)
        if mutualAbilitiesToGain.length > 0
          abilityToGain = mutualAbilitiesToGain[@getGameSession().getRandomIntegerForExecution(mutualAbilitiesToGain.length)]
          @abilitiesToGain.splice(@abilitiesToGain.indexOf(abilityToGain), 1)
        else
          #No abilities both units need, instead give them one the unit needs
          unitAbilitiesToGain = []
          for ability in @abilityMasterList
            if !unit.hasActiveModifierType(ability)
              unitAbilitiesToGain.push(ability)
          if unitAbilitiesToGain.length > 0
            abilityToGain = unitAbilitiesToGain[@getGameSession().getRandomIntegerForExecution(unitAbilitiesToGain.length)]
          else if @abilitiesToGain.length > 0
            #somehow new unit doesn't need any abilities, give them one Hsuku needs if possible
            hsukuAbilitiesToGain = []
            for ability in @abilitiesToGain
              if !@getCard().hasActiveModifierType(ability)
                hsukuAbilitiesToGain.push(ability)
            if hsukuAbilitiesToGain.length > 0
              #gain one that Hsuku didn't gain from elsewhere
              abilityToGain = hsukuAbilitiesToGain[@getGameSession().getRandomIntegerForExecution(hsukuAbilitiesToGain.length)]
              @abilitiesToGain.splice(@abilitiesToGain.indexOf(abilityToGain), 1)
            else
              #Hsuku gained all his remaining abilities elsewhere, just give him a random one
              abilityToGain = @abilitiesToGain.splice(@getGameSession().getRandomIntegerForExecution(@abilitiesToGain.length), 1)[0]
          else
            #neither unit needs an ability, just give them a random ability in case one they have is temporary
            abilityToGain = @abilityMasterList[@getGameSession().getRandomIntegerForExecution(@abilityMasterList.length)]

        @getGameSession().applyModifierContextObject(@getGameSession().getModifierClassForType(abilityToGain).createContextObject(), unit)
        @getGameSession().applyModifierContextObject(@getGameSession().getModifierClassForType(abilityToGain).createContextObject(), @getCard())

  isNearbyAnyGeneral: (position) ->
    if position?
      general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      if @positionsAreNearbyEachOther(position, general.getPosition()) or @positionsAreNearbyEachOther(position, enemyGeneral.getPosition())
        return true
    return false

  positionsAreNearbyEachOther: (position1, position2) ->
    if (Math.abs(position1.x - position2.x) <= 1) and (Math.abs(position1.y - position2.y) <= 1)
      return true
    return false


module.exports = ModifierSummonWatchAnyPlayerHsuku
