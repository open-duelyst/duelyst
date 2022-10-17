Modifier = require './modifier'

i18next = require('i18next')

class ModifierBond extends Modifier

  type:"ModifierBond"
  @type:"ModifierBond"

  # Duplicated below.
  #@description: "Bond"

  @isKeyworded: true
  @modifierName: i18next.t("modifiers.bond_name")
  @description: null
  @keywordDefinition: i18next.t("modifiers.bond_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierBond"]

  onActivate: () ->
    super()

    # make sure this card has a tribe
    thisCardTribe = @getCard().getRaceId()
    if thisCardTribe?
      # check for any friendly minion on the board that has same tribe as this card
      for friendlyMinion in @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
        if friendlyMinion.getBelongsToTribe(thisCardTribe)
          # if we find a friendly minion with same tribe, activate bond effect once
          @onBond()
          break

  onBond: () ->
    # override me in sub classes to implement special behavior

module.exports = ModifierBond
