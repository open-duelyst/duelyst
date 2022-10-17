Modifier = require './modifier'
ModifierDyingWish = require './modifierDyingWish'
ModifierSilence = require './modifierSilence'
CardType = require 'app/sdk/cards/cardType'

class ModifierDyingWishDispelAllEnemyMinions extends ModifierDyingWish

  type:"ModifierDyingWishDispelAllEnemies"
  @type:"ModifierDyingWishDispelAllEnemies"

  @description:"Dispel all enemy minions"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericBuff"]

  onDyingWish: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      for enemyUnit in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
        if !enemyUnit.getIsGeneral()
          @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), enemyUnit)


module.exports = ModifierDyingWishDispelAllEnemyMinions
