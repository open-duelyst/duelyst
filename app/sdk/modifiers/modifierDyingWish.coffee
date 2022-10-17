Modifier = require './modifier'
DieAction = require 'app/sdk/actions/dieAction'

i18next = require('i18next')

class ModifierDyingWish extends Modifier

  type:"ModifierDyingWish"
  @type:"ModifierDyingWish"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.dying_wish_def")

  @modifierName:i18next.t("modifiers.dying_wish_name")
  @description: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierDyingWish"]

  onAction: (e) ->
    super(e)

    action = e.action

    # when our entity has died
    if action instanceof DieAction and action.getTarget() is @getCard() and @getCard().getIsRemoved()
      @onDyingWish(action)

  onDyingWish: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierDyingWish
