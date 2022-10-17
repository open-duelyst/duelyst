PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'

class PlayerModifierManaModifierOncePerTurn extends PlayerModifierManaModifier

  type:"PlayerModifierManaModifierOncePerTurn"
  @type:"PlayerModifierManaModifierOncePerTurn"

  canChangeCost: true # can change cost of cards once per turn

  onAction: (event) ->
    # only do this check on authoritative side because server will know if anything modified the playCardAction and can check original card
    if @getGameSession().getIsRunningAsAuthoritative()
      super(event)

      # when a card was played from hand
      action = event.action
      if (action instanceof PlayCardFromHandAction and @auraIncludeHand) or (action instanceof PlaySignatureCardAction and @auraIncludeSignatureCards) and action.getOwnerId() == @getPlayerId()
        if action.overrideCardData
          card = action._private.originalCard
        else
          card = action.getCard()
        if card?
          # turn off once per turn mana modifiers in play but only if they affected the card
          modifiers = card.getModifiers()
          for modifier in modifiers
            # if the card has any active modifiers that this is the parent modifier for
            # then we know this modifier was used to modify the cost of the card
            if modifier instanceof ModifierManaCostChange and modifier.getAppliedByModifierIndex() == @getIndex()
              @canChangeCost = false # can't change cost again this turn
              break

  getIsActiveForCache: () ->
    return super() and @canChangeCost

  _onEndTurn: (actionEvent) ->
    # use private _onEndTurn because if this modifier was marked inactive already onEndTurn won't be called
    @canChangeCost = true # reset flag so that this can change cost of cards again
    super(actionEvent)

module.exports = PlayerModifierManaModifierOncePerTurn
