ModifierDyingWish = require './modifierDyingWish'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
i18next = require 'i18next'

class ModifierShadowScar extends ModifierDyingWish

  type:"ModifierShadowScar"
  @type:"ModifierShadowScar"

  #@isKeyworded: false
  @modifierName:i18next.t("modifiers.shadow_scar_name")
  @description:i18next.t("modifiers.shadow_scar_def")

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]
  cardDataOrIndexToSpawn: null
  spawnOwnerId: null # dying wish spawn entity will spawn for player with this ID

  @createContextObject: (cardDataOrIndexToSpawn, spawnOwnerId, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnOwnerId = spawnOwnerId
    return contextObject

  onDyingWish: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @cardDataOrIndexToSpawn?
      if @spawnOwnerId?
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @spawnOwnerId, @getCard().getPositionX(), @getCard().getPositionY(), @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierShadowScar
