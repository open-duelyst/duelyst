ModifierEndTurnWatchAnyPlayer = require './modifierEndTurnWatchAnyPlayer'
ModifierFrenzy = require './modifierFrenzy'
ModifierTranscendance = require './modifierTranscendance'
ModifierFlying = require './modifierFlying'
ModifierProvoke = require './modifierProvoke'
Modifier = require './modifier'

class ModifierEndTurnWatchAnyPlayerHsuku extends ModifierEndTurnWatchAnyPlayer

  type:"ModifierEndTurnWatchAnyPlayerHsuku"
  @type:"ModifierEndTurnWatchAnyPlayerHsuku"

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  possibleBuffs: null
  possibleAbilities: null
  buffName: null

  @createContextObject: (buffName, options) ->
    contextObject = super(options)
    contextObject.buffName = buffName
    contextObject.possibleBuffs = [
      Modifier.createContextObjectWithAttributeBuffs(2,0),
      Modifier.createContextObjectWithAttributeBuffs(1,1),
      Modifier.createContextObjectWithAttributeBuffs(0,2)
    ]
    contextObject.possibleAbilities = [
      ModifierFrenzy.createContextObject(),
      ModifierTranscendance.createContextObject(),
      ModifierProvoke.createContextObject(),
      ModifierFlying.createContextObject()
    ]
    return contextObject

  onTurnWatch: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()

      general = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getCurrentPlayer().getPlayerId())
      friendlyUnits = @getGameSession().getBoard().getFriendlyEntitiesForEntity(general)
      if friendlyUnits?
        possibleMinions = []
        for minion in friendlyUnits
          if minion and !(minion is @getCard())
            possibleMinions.push(minion)
        if possibleMinions.length > 0
          minionToBuff = possibleMinions[@getGameSession().getRandomIntegerForExecution(possibleMinions.length)]
          statBuff = @possibleBuffs[@getGameSession().getRandomIntegerForExecution(@possibleBuffs.length)]
          statBuff.appliedName = @buffName
          ability = @possibleAbilities[@getGameSession().getRandomIntegerForExecution(@possibleAbilities.length)]
          @getGameSession().applyModifierContextObject(statBuff, minionToBuff)
          @getGameSession().applyModifierContextObject(ability, minionToBuff)

module.exports = ModifierEndTurnWatchAnyPlayerHsuku
