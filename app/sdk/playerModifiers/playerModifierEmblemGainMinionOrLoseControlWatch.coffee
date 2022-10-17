PlayerModifierEmblem = require './playerModifierEmblem'
CardType = require 'app/sdk/cards/cardType'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'
SwapUnitAllegianceAction = require 'app/sdk/actions/swapUnitAllegianceAction'
RemoveAction = require 'app/sdk/actions/removeAction'

class PlayerModifierEmblemGainMinionOrLoseControlWatch extends PlayerModifierEmblem

  type:"PlayerModifierEmblemGainMinionOrLoseControlWatch"
  @type:"PlayerModifierEmblemGainMinionOrLoseControlWatch"

  onAction: (e) ->
    super(e)

    action = e.action

    if @getIsActionRelevantForGainMinion(action)
      @onGainMinionWatch(action)
    else if @getIsActionRelevantForLoseControl(action)
      @onLoseControlWatch(action)

  getIsActionRelevantForGainMinion: (action) ->

    if action?
      target = action.getTarget()
      if target?
        if target.type is CardType.Unit and ((action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getCard().getOwnerId()) or (action instanceof SwapUnitAllegianceAction and target.getOwnerId() == @getCard().getOwnerId()))
          return true
    return false

  getIsActionRelevantForLoseControl: (action) ->

    if action?
      target = action.getTarget()
      if target?
        if target.type is CardType.Unit and action instanceof SwapUnitAllegianceAction and target.getOwnerId() != @getCard().getOwnerId()
          return true
    return false

  onLoseControlWatch: (action) ->
    # override me in sub classes to implement special behavior

  onGainMinionWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = PlayerModifierEmblemGainMinionOrLoseControlWatch
