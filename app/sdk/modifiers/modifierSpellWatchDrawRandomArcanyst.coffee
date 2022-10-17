Modifier = require './modifier'
ModifierSpellWatch = require './modifierSpellWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Races = require 'app/sdk/cards/racesLookup'
GameFormat = require 'app/sdk/gameFormat'

class ModifierSpellWatchDrawRandomArcanyst extends ModifierSpellWatch

  type:"ModifierSpellWatchDrawRandomArcanyst"
  @type:"ModifierSpellWatchDrawRandomArcanyst"

  @modifierName:"Spell Watch"
  @description: "Whenever you cast a spell, draw a random Arcanyst"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onSpellWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      arcanystCards = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        arcanystCards = @getGameSession().getCardCaches().getIsLegacy(false).getRace(Races.Arcanyst).getIsToken(false).getIsHiddenInCollection(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        arcanystCards = @getGameSession().getCardCaches().getRace(Races.Arcanyst).getIsToken(false).getIsHiddenInCollection(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      if arcanystCards.length > 0
        arcanystCard = arcanystCards[@getGameSession().getRandomIntegerForExecution(arcanystCards.length)]
        cardData = arcanystCard.createNewCardData()
        a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardData)
        @getGameSession().executeAction(a)

module.exports = ModifierSpellWatchDrawRandomArcanyst
