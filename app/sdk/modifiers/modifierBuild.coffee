Modifier = require './modifier'
ModifierManaCostChange = require './modifierManaCostChange'
ModifierBuilding = require './modifierBuilding'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

i18next = require('i18next')

class ModifierBuild extends Modifier

  type:"ModifierBuild"
  @type:"ModifierBuild"

  activeInHand: true
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: false
  isRemovable: false

  maxStacks: 1

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.build_def")
  #@keywordDefinition: i18next.t("modifiers.structure_def")
  @isHiddenToUI: true

  @modifierName: i18next.t("modifiers.build_name")
  #@modifierName:i18next.t("modifiers.structure_name")
  @description:null


  fxResource: ["FX.Modifiers.ModifierPortal"]

  @createContextObject: (buildCardData,options) ->
    contextObject = super(options)
    contextObject.buildCardData = buildCardData
    return contextObject

  onModifyActionForExecution:(event) ->
    action = event.action
    if action? and action instanceof PlayCardFromHandAction and action.getIsValid() and action.getCard() is @getCard()
      for mod in @getCard().getModifiers()
        # find all non-inherent modifiers added to this unit in hand (can ignore mana modifiers as they are deleted upon the unit being played)
        if !(mod.getIsInherent() or mod.getIsAdditionalInherent()) and mod.getType() isnt ModifierManaCostChange.type
          for additionalInherentModifiersContextObject in @buildCardData.additionalInherentModifiersContextObjects
            additionalMod = @getGameSession().getOrCreateModifierFromContextObjectOrIndex(additionalInherentModifiersContextObject)
            # find the sentinel modifier context object, and add the hand buffs so that they will transfer to the TRANSFORMED unit after sentinel triggers
            if additionalMod instanceof ModifierBuilding
              additionalInherentModifiersContextObject.transformCardData.additionalModifiersContextObjects ?= []
              additionalInherentModifiersContextObject.transformCardData.additionalModifiersContextObjects.push(mod.createContextObjectForClone())
      if Cards.getIsPrismaticCardId(@getCard().getId())
        @buildCardData.id = Cards.getPrismaticCardId(@buildCardData.id)
      newCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(@buildCardData)
      newCard.ownerId = @getCard().getOwnerId()
      # re-index card here as card has changed from original card played from hand
      # cards are normally indexed as soon as action is verified valid by game session, but we are swapping card being played from hand
      # so we must re-index the hidden sentinel card that is actually being played to board
      @getGameSession()._indexCardAsNeeded(newCard)
      # set the new card to be played in the play card action
      action.overrideCard(newCard)
      action.setCardDataOrIndex(@buildCardData)

module.exports = ModifierBuild
