CardType = require '../cards/cardType'
KillAction = require '../actions/killAction'
PlayCardSilentlyAction = require '../actions/playCardSilentlyAction'
ModifierOverwatchDestroyed = require './modifierOverwatchDestroyed'

class ModifierOverwatchDestroyedResummonAndDestroyOther extends ModifierOverwatchDestroyed

  type:"ModifierOverwatchDestroyedResummonAndDestroyOther"
  @type:"ModifierOverwatchDestroyedResummonAndDestroyOther"

  onOverwatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      card = @getCard()

      # destroy other friendly minion
      potentialUnitsToDestroy = []
      for unit in @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard(), CardType.Unit)
        if unit != card and !unit.getIsGeneral() and @getGameSession().getCanCardBeScheduledForRemoval(unit)
          potentialUnitsToDestroy.push(unit)
      if potentialUnitsToDestroy.length > 0
        unitToDestroy = potentialUnitsToDestroy[@getGameSession().getRandomIntegerForExecution(potentialUnitsToDestroy.length)]
        if unitToDestroy?
          killAction = new KillAction(@getGameSession())
          killAction.setOwnerId(@getCard().getOwnerId())
          killAction.setSource(@getCard())
          killAction.setTarget(unitToDestroy)
          @getGameSession().executeAction(killAction)

      # resummon self
      respawnPosition = card.getPosition()
      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), respawnPosition.x, respawnPosition.y, card.createNewCardData())
      playCardAction.setSource(@getCard())
      @getGameSession().executeAction(playCardAction)

module.exports = ModifierOverwatchDestroyedResummonAndDestroyOther
