ModifierDyingWish = require './modifierDyingWish'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierDyingWishRespawnEntity extends ModifierDyingWish

  type:"ModifierDyingWishRespawnEntity"
  @type:"ModifierDyingWishRespawnEntity"

  @modifierName:"Dying Wish"
  @description: "Dying Wish: Resummon this minion"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  onDyingWish: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, @getCard().createNewCardData())
      spawnAction.setSource(@getCard())
      @getGameSession().executeAction(spawnAction)

module.exports = ModifierDyingWishRespawnEntity
