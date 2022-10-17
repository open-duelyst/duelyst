ModifierOpeningGambit = require './modifierOpeningGambit'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierOpeningGambitEquipArtifact extends ModifierOpeningGambit

  type:"ModifierOpeningGambitEquipArtifact"
  @type:"ModifierOpeningGambitEquipArtifact"

  @description:"Equip an artifact to you General"

  cardDataOrIndexToEquip: 0

  @createContextObject: (cardDataOrIndexToEquip, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToEquip = cardDataOrIndexToEquip
    return contextObject

  onOpeningGambit: (action) ->
    super(action)
    
    gameSession = @getGameSession()
    playCardAction = new PlayCardSilentlyAction(gameSession, @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, @cardDataOrIndexToEquip)
    playCardAction.setSource(@getCard())
    gameSession.executeAction(playCardAction)

module.exports = ModifierOpeningGambitEquipArtifact