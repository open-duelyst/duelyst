Modifier = require './modifier'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierEquipFriendlyArtifactWatch extends Modifier

  type:"ModifierEquipFriendlyArtifactWatch"
  @type:"ModifierEquipFriendlyArtifactWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if (action instanceof PlayCardFromHandAction or action instanceof PlayCardAction or action instanceof PlayCardSilentlyAction) and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Artifact
      @onEquipFriendlyArtifactWatch(action, action.getCard())

  onEquipFriendlyArtifactWatch: (action, artifact) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEquipFriendlyArtifactWatch
