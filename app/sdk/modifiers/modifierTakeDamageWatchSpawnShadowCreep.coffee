PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierTakeDamageWatchSpawnShadowCreep extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchSpawnShadowCreep"
  @type:"ModifierTakeDamageWatchSpawnShadowCreep"

  @modifierName:"Take Damage Watch"
  @description:"Whenever this minion takes damage, turn a space occupied by an enemy into Shadow Creep"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  onDamageTaken: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      allEnemies = @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard())
      enemyToSpawnUnder = allEnemies[@getGameSession().getRandomIntegerForExecution(allEnemies.length)]
      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), enemyToSpawnUnder.getPosition().x, enemyToSpawnUnder.getPosition().y, {id: Cards.Tile.Shadow})
      playCardAction.setSource(@getCard())
      @getGameSession().executeAction(playCardAction)

module.exports = ModifierTakeDamageWatchSpawnShadowCreep
