ModifierFriendlyDeathWatch = require './modifierFriendlyDeathWatch'
DieAction = require 'app/sdk/actions/dieAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
RemoveAction = require 'app/sdk/actions/removeAction'

class ModifierFriendsguard extends ModifierFriendlyDeathWatch

  type:"ModifierFriendsguard"
  @type:"ModifierFriendsguard"

  fxResource: ["FX.Modifiers.ModifierFriendlyDeathwatch"]

  @createContextObject: (cardDataOrIndexToSpawn, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    return contextObject

  onFriendlyDeathWatch: (action) ->
    target = action.getTarget()
    if target.getBaseCardId() is Cards.Faction1.FriendFighter
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getOwnerId())
      removeOriginalEntityAction.setTarget(@getCard())
      @getGameSession().executeAction(removeOriginalEntityAction)

      entityPosition = @getCard().getPosition()
      entityOwnerId = @getCard().getOwnerId()
      spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), entityOwnerId, entityPosition.x, entityPosition.y, @cardDataOrIndexToSpawn)
      @getGameSession().executeAction(spawnEntityAction)


module.exports = ModifierFriendsguard
