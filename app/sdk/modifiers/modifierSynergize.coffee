Modifier = require './modifier'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
CardType = require 'app/sdk/cards/cardType'

i18next = require('i18next')

class ModifierSynergize extends Modifier

  type:"ModifierSynergize"
  @type:"ModifierSynergize"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.blood_surge_def")

  @modifierName:i18next.t("modifiers.blood_surge_name")
  @description: ""

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSynergize"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action

    # watch for a spell being cast from Signature Card slot by player who owns this entity
    if (action instanceof PlaySignatureCardAction) and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Spell
      @onSynergize(action)

  onSynergize: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierSynergize
