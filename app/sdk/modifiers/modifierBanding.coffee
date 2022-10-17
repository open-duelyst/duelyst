ModifierSituationalBuffSelf = require './modifierSituationalBuffSelf'
CardType = require 'app/sdk/cards/cardType'

i18next = require('i18next')

class ModifierBanding extends ModifierSituationalBuffSelf

  type:"ModifierBanding"
  @type:"ModifierBanding"

  @isKeyworded: true

  @modifierName:i18next.t("modifiers.zeal_name")
  @keywordDefinition:i18next.t("modifiers.zeal_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierZeal"]

  getIsSituationActiveForCache: () ->
    # banding aura is active when this entity is near its general
    entityPosition = @getCard().getPosition()
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general?
      generalPosition = general.getPosition()
      return Math.abs(entityPosition.x - generalPosition.x) <= 1 && Math.abs(entityPosition.y - generalPosition.y) <= 1

    return false

module.exports = ModifierBanding
