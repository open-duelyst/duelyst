SpellApplyModifiers = require './spellApplyModifiers'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'

class SpellFightingSpirit extends SpellApplyModifiers

  onApplyOneEffectToBoard: (board, x, y, sourceAction) ->
    super(board, x, y, sourceAction)

    # pull faction battle pets + neutral token battle pets
    factionBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Faction1).getRace(Races.BattlePet).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
    neutralBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRace(Races.BattlePet).getIsToken(true).getIsPrismatic(false).getIsSkinned(false).getCards()
    battlePetCards = [].concat(factionBattlePetCards, neutralBattlePetCards)

    card = battlePetCards[@getGameSession().getRandomIntegerForExecution(battlePetCards.length)]
    a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), card.createNewCardData())
    @getGameSession().executeAction(a)

module.exports = SpellFightingSpirit
