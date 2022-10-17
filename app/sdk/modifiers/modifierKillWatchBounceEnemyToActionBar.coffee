ModifierKillWatch = require './modifierKillWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierKillWatchBounceEnemyToActionBar extends ModifierKillWatch

  type:"ModifierKillWatchBounceEnemyToActionBar"
  @type:"ModifierKillWatchBounceEnemyToActionBar"

  @modifierName:"Kill Watch"
  @description:"When this destroys a minion, bounce the enemy minion to its action bar."

  fxResource: ["FX.Modifiers.ModifierKillWatch"]

  onKillWatch: (action) ->
    super(action)

    enemyEntity = action.getTarget()
    if enemyEntity? and !enemyEntity.getIsGeneral()
      cardToAddToHand = enemyEntity.createNewCardData()
      opponentId = enemyEntity.getOwnerId()
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), opponentId, cardToAddToHand)
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierKillWatchBounceEnemyToActionBar
