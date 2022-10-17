PlayerModifierEmblem = require './playerModifierEmblem'
CardType = require 'app/sdk/cards/cardType'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'

class PlayerModifierEmblemSummonWatch extends PlayerModifierEmblem

  type:"PlayerModifierEmblemSummonWatch"
  @type:"PlayerModifierEmblemSummonWatch"

  onAction: (e) ->
    super(e)

    action = e.action

    if @getIsActionRelevant(action)
      @onSummonWatch(action)

  getIsActionRelevant: (action) ->
    # watch for a unit being summoned in any way by the player who owns this entity
    if action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Unit and !(action instanceof PlayCardAsTransformAction or action instanceof CloneEntityAsTransformAction)
      return true
    return false

  onSummonWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = PlayerModifierEmblemSummonWatch
