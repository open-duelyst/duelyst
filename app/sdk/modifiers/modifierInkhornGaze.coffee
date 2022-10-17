ModifierDyingWish = require './modifierDyingWish'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'
i18next = require 'i18next'

class ModifierInkhornGaze extends ModifierDyingWish

  type:"ModifierInkhornGaze"
  @type:"ModifierInkhornGaze"

  #@isKeyworded: false
  @modifierName:i18next.t("modifiers.inkhorn_gaze_name")
  @description:i18next.t("modifiers.inkhorn_gaze_def")

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]
  spawnOwnerId: null # dying wish spawn entity will spawn for player with this ID

  @createContextObject: (cardDataOrIndexToSpawn, spawnOwnerId, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnOwnerId = spawnOwnerId
    return contextObject

  onDyingWish: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      # pull faction battle pets + neutral token battle pets
      factionBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Faction4).getRace(Races.BattlePet).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      neutralBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRace(Races.BattlePet).getIsToken(true).getIsPrismatic(false).getIsSkinned(false).getCards()
      battlePetCards = [].concat(factionBattlePetCards, neutralBattlePetCards)

      card = battlePetCards[@getGameSession().getRandomIntegerForExecution(battlePetCards.length)]
      a = new PutCardInHandAction(@getGameSession(), @spawnOwnerId, card.createNewCardData() )
      @getGameSession().executeAction(a)

module.exports = ModifierInkhornGaze
