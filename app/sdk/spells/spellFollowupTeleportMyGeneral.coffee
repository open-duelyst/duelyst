Logger = require 'app/common/logger'
SpellFollowupTeleport =  require './spellFollowupTeleport'

class SpellFollowupTeleportMyGeneral extends SpellFollowupTeleport

  getFollowupSourcePattern: () ->
    # since this spells teleports the General, we need to recenter the followup
    # source pattern on top of the General
    generalPosition = @getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()
    xDif = @getFollowupSourcePosition().x - generalPosition.x
    yDif = @getFollowupSourcePosition().y - generalPosition.y
    patternAroundGeneral = []
    for pos in @pattern
      finalPosition = {x:0, y:0}
      finalPosition.x = pos.x - xDif
      finalPosition.y = pos.y - yDif
      patternAroundGeneral.push(finalPosition)
    return patternAroundGeneral

  getTeleportSourcePosition: (applyEffectPosition) ->
    return @getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()

module.exports = SpellFollowupTeleportMyGeneral
