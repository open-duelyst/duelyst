Logger = require 'app/common/logger'
SpellSpawnEntity = require './spellSpawnEntity.coffee'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'
CONFIG = require 'app/common/config'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierBlastAttack = require 'app/sdk/modifiers/modifierBlastAttack'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierGrow = require 'app/sdk/modifiers/modifierGrow'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierRebirth = require 'app/sdk/modifiers/modifierRebirth'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'

class SpellMoldingEarth extends SpellSpawnEntity

  spawnSilently: true
  numUnits: 3

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    modifiersToObtain = [
      ModifierFrenzy.createContextObject(),
      ModifierFlying.createContextObject(),
      ModifierTranscendance.createContextObject(),
      ModifierProvoke.createContextObject(),
      ModifierRanged.createContextObject(),
      ModifierFirstBlood.createContextObject(),
      ModifierRebirth.createContextObject(),
      ModifierForcefield.createContextObject()
    ]

    modifierContextObject = modifiersToObtain[@getGameSession().getRandomIntegerForExecution(modifiersToObtain.length)]

    @cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects = [modifierContextObject]

    super(board,x,y,sourceAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    card = @getEntityToSpawn()
    generalPosition = @getGameSession().getGeneralForPlayerId(@ownerId).getPosition()
    numberOfApplyPositions = @numUnits

    if numberOfApplyPositions > 0
      applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, card, @, numberOfApplyPositions)
    else
      applyEffectPositions = []

    return applyEffectPositions

  _postFilterPlayPositions: (validPositions) ->
    return validPositions

module.exports = SpellMoldingEarth
