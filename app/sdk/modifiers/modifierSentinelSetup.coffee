Modifier = require './modifier'
ModifierManaCostChange = require './modifierManaCostChange'
ModifierSentinel = require './modifierSentinel'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierSentinelSetup extends Modifier

  type:"ModifierSentinelSetup"
  @type:"ModifierSentinelSetup"

  activeInHand: true
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: false
  isRemovable: false

  maxStacks: 1

  @createContextObject: (sentinelCardData,options) ->
    contextObject = super(options)
    contextObject.sentinelCardData = sentinelCardData
    return contextObject

  onModifyActionForExecution:(event) ->
    action = event.action
    if action? and action instanceof PlayCardFromHandAction and action.getIsValid() and action.getCard() is @getCard()
      for mod in @getCard().getModifiers()
        # find all non-inherent modifiers added to this unit in hand (can ignore mana modifiers as they are deleted upon the unit being played)
        if !(mod.getIsInherent() or mod.getIsAdditionalInherent()) and mod.getType() isnt ModifierManaCostChange.type
          for additionalModContextObject in @sentinelCardData.additionalModifiersContextObjects
            additionalMod = @getGameSession().getOrCreateModifierFromContextObjectOrIndex(additionalModContextObject)
            # find the sentinel modifier context object, and add the hand buffs so that they will transfer to the TRANSFORMED unit after sentinel triggers
            if additionalMod instanceof ModifierSentinel
              additionalModContextObject.transformCardData.additionalModifiersContextObjects ?= []
              additionalModContextObject.transformCardData.additionalModifiersContextObjects.push(mod.createContextObjectForClone())
      if Cards.getIsPrismaticCardId(@getCard().getId())
        @sentinelCardData.id = Cards.getPrismaticCardId(@sentinelCardData.id)
      newCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(@sentinelCardData)
      newCard.ownerId = @getCard().getOwnerId()
      # re-index card here as card has changed from original card played from hand
      # cards are normally indexed as soon as action is verified valid by game session, but we are swapping card being played from hand
      # so we must re-index the hidden sentinel card that is actually being played to board
      @getGameSession()._indexCardAsNeeded(newCard)
      # set the new card to be played in the play card action
      action.overrideCard(newCard)
      action.setCardDataOrIndex(@sentinelCardData)

module.exports = ModifierSentinelSetup
