Logger = require 'app/common/logger'
Spell =  require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
_ = require("underscore")

class SpellFollowupRandomTeleport extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None
  teleportPattern: null
  patternSourceIsTarget: false

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    applyEffectPosition = {x: x, y: y}

    target = board.getCardAtPosition(applyEffectPosition, @targetType)

    #can be set within the card definition if we want the source index to be the target of the followup (only really to be used when teleportPattern is set)

    randomTeleportAction = new RandomTeleportAction(@getGameSession())
    randomTeleportAction.setOwnerId(@getOwnerId())
    randomTeleportAction.setSource(target)
    randomTeleportAction.setTeleportPattern(@teleportPattern)
    if @patternSourceIsTarget
      randomTeleportAction.setPatternSource(target)
    randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(randomTeleportAction)

module.exports = SpellFollowupRandomTeleport
