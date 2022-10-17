SpellAspectBase = require './spellAspectBase'
Cards = require 'app/sdk/cards/cardsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'
_ = require 'underscore'

class SpellAlteredBeast extends SpellAspectBase
  getCardDataOrIndexToSpawn: (x, y) ->
    # pick a random battle pet
    allBattlePetCards = @getGameSession().getCardCaches().getRace(Races.BattlePet).getIsPrismatic(false).getIsSkinned(false).getCards()
    allBattlePetCards = _.reject(allBattlePetCards, (card) ->
      baseCardId = card.getBaseCardId()
      return baseCardId == Cards.Neutral.Rawr
    )
    card = allBattlePetCards[@getGameSession().getRandomIntegerForExecution(allBattlePetCards.length)]
    @cardDataOrIndexToSpawn = card.createNewCardData()

    return super(x, y)

module.exports = SpellAlteredBeast
