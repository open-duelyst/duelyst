Modifier = require './modifier'
KillAction = require 'app/sdk/actions/killAction'
i18next = require 'i18next'

class ModifierDestroyAtEndOfTurn extends Modifier

  type:"ModifierDestroyAtEndOfTurn"
  @type:"ModifierDestroyAtEndOfTurn"

  maxStacks: 1

  durationEndTurn: 1

  @modifierName: ""
  @description:i18next.t("modifiers.destroy_at_end_of_turn_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierDestroyAtEndOfTurn"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

  onExpire: () ->
    super()

    killAction = new KillAction(this.getGameSession())
    killAction.setOwnerId(@getCard().getOwnerId())
    killAction.setSource(@getCard())
    killAction.setTarget(@getCard())
    @getGameSession().executeAction(killAction)

module.exports = ModifierDestroyAtEndOfTurn
