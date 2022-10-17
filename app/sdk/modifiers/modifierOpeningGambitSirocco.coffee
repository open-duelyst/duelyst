CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
ModifierOpeningGambit = require './modifierOpeningGambit'
Races = require 'app/sdk/cards/racesLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierOpeningGambitSirocco extends ModifierOpeningGambit

  type:"ModifierOpeningGambitSirocco"
  @type:"ModifierOpeningGambitSirocco"

  @modifierName:"Opening Gambit"
  @description: "Summon a 3/2 Skyrock Golem on random spaces for each Golem you've summoned this game"

  fxResource: ["FX.Modifiers.ModifierOpeningGambitSirocco"]

  getIsActionRelevant: (a) ->
    # triggers once for each Golem tribe minion this card's owner summoned previously
    if a instanceof PlayCardFromHandAction and a.getOwnerId() is @getCard().getOwnerId()
      card = a.getCard()
      return card? and card.type is CardType.Unit and card.getBelongsToTribe(Races.Golem) and card != @getCard()

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      summonActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))

      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData({id: Cards.Neutral.SkyrockGolem})
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.PATTERN_WHOLE_BOARD, card)
      for i in [0...summonActions.length]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, {id: Cards.Neutral.SkyrockGolem})
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitSirocco
