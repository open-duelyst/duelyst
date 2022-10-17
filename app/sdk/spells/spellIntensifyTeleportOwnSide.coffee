CONFIG = require 'app/common/config'
SpellIntensify = require './spellIntensify'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CardType = require 'app/sdk/cards/cardType'

class SpellIntensifyTeleportOwnSide extends SpellIntensify

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()
      general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      enemies = @getGameSession().getBoard().getEnemyEntitiesForEntity(general, CardType.Unit, false, false)

      if enemies?
        potentialTargets = []
        for enemy in enemies
          if enemy? and !enemy.getIsGeneral() and !@isOnMySideOfBattlefield(enemy)
            potentialTargets.push(enemy)

        if potentialTargets.length > 0
          enemiesToTeleport = []
          numberToTeleport = Math.min(@getIntensifyAmount(), potentialTargets.length)
          for [0...numberToTeleport]
            enemiesToTeleport.push(potentialTargets.splice(@getGameSession().getRandomIntegerForExecution(potentialTargets.length), 1)[0])

          for teleportTarget in enemiesToTeleport
            randomTeleportAction = new RandomTeleportAction(@getGameSession())
            randomTeleportAction.setOwnerId(@getOwnerId())
            randomTeleportAction.setSource(teleportTarget)
            if @isOwnedByPlayer1()
              randomTeleportAction.setPatternSourcePosition({x:0, y:0})
            else
              randomTeleportAction.setPatternSourcePosition({x: Math.ceil(CONFIG.BOARDCOL * 0.5), y:0})
            randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_HALF_BOARD)
            @getGameSession().executeAction(randomTeleportAction)

  isOnMySideOfBattlefield: (unit) ->

    mySideStartX = 0
    mySideEndX = CONFIG.BOARDCOL
    if @isOwnedByPlayer1()
      mySideEndX = Math.floor((mySideEndX - mySideStartX) * 0.5 - 1)
    else
      mySideStartX = Math.floor((mySideEndX - mySideStartX) * 0.5 + 1)

    if unit.getPosition().x >= mySideStartX and unit.getPosition().x <= mySideEndX
      return true
    return false

module.exports = SpellIntensifyTeleportOwnSide
