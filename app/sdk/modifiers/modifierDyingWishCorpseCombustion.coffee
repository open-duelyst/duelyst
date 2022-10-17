CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierDyingWish = require './modifierDyingWish'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'


class ModifierDyingWishCorpseCombustion extends ModifierDyingWish

  type:"ModifierDyingWishCorpseCombustion"
  @type:"ModifierDyingWishCorpseCombustion"

  @modifierName:"Dying Wish"
  @description: "Resummon this minion and deal 3 damage to all nearby enemies"

  damageAmount: 3

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn", "FX.Modifiers.ModifierGenericDamage"]
  cardDataOrIndexToSpawn: null

  onDyingWish: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      # deal damage to nearby enemies
      @getGameSession().executeAction(playCardAction)
      entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
      for entity in entities
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

      # respawn original card
      cardData = {id: @getCard().getId()}
      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, cardData)
      playCardAction.setSource(@getCard())
      @getGameSession().executeAction(playCardAction)

module.exports = ModifierDyingWishCorpseCombustion
