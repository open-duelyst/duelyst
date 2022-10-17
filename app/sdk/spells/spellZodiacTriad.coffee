Spell = require './spell'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
CardType = require 'app/sdk/cards/cardType'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
GameFormat = require 'app/sdk/gameFormat'
_ = require 'underscore'

class SpellZodiacTriad extends Spell

  onApplyOneEffectToBoard: (board, x, y, sourceAction) ->
    super(board, x, y, sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()

      # pull faction minions
      factionMinions = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        factionMinions = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Faction2).getType(CardType.Unit).getIsGeneral(false).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        factionMinions = @getGameSession().getCardCaches().getFaction(Factions.Faction2).getType(CardType.Unit).getIsGeneral(false).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()

      if factionMinions?.length > 0
        # filter mythron cards
        factionMinions = _.reject(factionMinions, (card) ->
          return card.getRarityId() == 6
        )

      if factionMinions.length > 0
        card1 = factionMinions[@getGameSession().getRandomIntegerForExecution(factionMinions.length)].createNewCardData()
        card2 = factionMinions[@getGameSession().getRandomIntegerForExecution(factionMinions.length)].createNewCardData()
        card3 = factionMinions[@getGameSession().getRandomIntegerForExecution(factionMinions.length)].createNewCardData()

        card1.additionalModifiersContextObjects = [ModifierManaCostChange.createContextObject(-1)]
        card2.additionalModifiersContextObjects = [ModifierManaCostChange.createContextObject(-1)]
        card3.additionalModifiersContextObjects = [ModifierManaCostChange.createContextObject(-1)]

        a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), card1)
        @getGameSession().executeAction(a)
        a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), card2)
        @getGameSession().executeAction(a)
        a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), card3)
        @getGameSession().executeAction(a)

module.exports = SpellZodiacTriad
