UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDealDamageWatch = require './modifierDealDamageWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'
i18next = require 'i18next'

class ModifierSnowRippler extends ModifierDealDamageWatch

  type:"ModifierSnowRippler"
  @type:"ModifierSnowRippler"

  @modifierName:i18next.t("modifiers.snow_rippler_name")
  @description:i18next.t("modifiers.snow_rippler_def")

  onDealDamage: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      if action.getTarget().getIsGeneral() # if damaging a general
        # pull faction battle pets + neutral token battle pets
        factionBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Faction6).getRace(Races.BattlePet).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
        neutralBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRace(Races.BattlePet).getIsToken(true).getIsPrismatic(false).getIsSkinned(false).getCards()
        battlePetCards = [].concat(factionBattlePetCards, neutralBattlePetCards)
        battlePetCard = battlePetCards[@getGameSession().getRandomIntegerForExecution(battlePetCards.length)]
        a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), battlePetCard.createNewCardData() )
        @getGameSession().executeAction(a)

module.exports = ModifierSnowRippler
