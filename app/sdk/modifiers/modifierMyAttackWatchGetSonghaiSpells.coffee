ModifierMyAttackWatch = require './modifierMyAttackWatch'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
GameFormat = require 'app/sdk/gameFormat'

class ModifierMyAttackWatchGetSonghaiSpells extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchGetSonghaiSpells"
  @type:"ModifierMyAttackWatchGetSonghaiSpells"

  numCards: 0

  @createContextObject: (numCards) ->
    contextObject = super()
    contextObject.numCards = numCards
    return contextObject

  onMyAttackWatch: (action) ->
    super(action)

    for i in [0...@numCards]
      if @getGameSession().getIsRunningAsAuthoritative()
        f2SpellCards = []
        if @getGameSession().getGameFormat() is GameFormat.Standard
          f2SpellCards = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Faction2).getType(CardType.Spell).getIsHiddenInCollection(false).getIsPrismatic(false).getIsSkinned(false).getCards()
        else
          f2SpellCards = @getGameSession().getCardCaches().getFaction(Factions.Faction2).getType(CardType.Spell).getIsHiddenInCollection(false).getIsPrismatic(false).getIsSkinned(false).getCards()
        if f2SpellCards.length > 0
          spellCard = f2SpellCards[@getGameSession().getRandomIntegerForExecution(f2SpellCards.length)]
          cardData = spellCard.createNewCardData()
          a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardData)
          @getGameSession().executeAction(a)

module.exports = ModifierMyAttackWatchGetSonghaiSpells
