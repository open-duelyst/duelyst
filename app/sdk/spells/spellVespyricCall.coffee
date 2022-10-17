Spell = require './spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'
Races = require 'app/sdk/cards/racesLookup'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class SpellVespyricCall extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    vespyrCards = @getGameSession().getCardCaches().getFaction(Factions.Faction6).getRace(Races.Vespyr).getIsGeneral(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
    cardToDraw = vespyrCards[@getGameSession().getRandomIntegerForExecution(vespyrCards.length)]
    cardDataOrIndexToDraw = cardToDraw.createNewCardData()
    buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
    buffContextObject.appliedName = "Heeding the Call"
    cardDataOrIndexToDraw.additionalModifiersContextObjects = [ModifierManaCostChange.createContextObject(-1), buffContextObject]
    a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), cardDataOrIndexToDraw)
    @getGameSession().executeAction(a)

module.exports = SpellVespyricCall
