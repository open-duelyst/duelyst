ModifierEndTurnWatch = require './modifierEndTurnWatch'
RemoveAction =  require 'app/sdk/actions/removeAction'
i18next = require('i18next')

class ModifierEphemeral extends ModifierEndTurnWatch

  type:"ModifierEphemeral"
  @type:"ModifierEphemeral"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.ephemeral_def")

  @isHiddenToUI: true
  @modifierName:i18next.t("modifiers.ephemeral_name")
  @description:null
  isRemovable: false

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierEphemeral"]

  onEndTurn: ()  ->
    super()

    # then remove entity from the board (just remove, don't die)
    removeAction = @getGameSession().createActionForType(RemoveAction.type)
    removeAction.setSource(@getCard())
    removeAction.setTarget(@getCard())
    @getGameSession().executeAction(removeAction)

module.exports = ModifierEphemeral
