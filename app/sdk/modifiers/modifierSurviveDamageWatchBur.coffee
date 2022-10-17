_ = require 'underscore'
ModifierSurviveDamageWatch =  require './modifierSurviveDamageWatch'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
RemoveAction = require 'app/sdk/actions/removeAction'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'

class ModifierSurviveDamageWatchBur extends ModifierSurviveDamageWatch

  type:"ModifierSurviveDamageWatchBur"
  @type:"ModifierSurviveDamageWatchBur"

  @modifierName: ""
  @description: "When this minion survives damage, transform it into a different Battle Pet"

  triggeredOnActionIndex: -1 # only trigger one time (since we will transform this minion after it survives damage, don't keep transforming on extra damage instances)

  onSurviveDamage: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative() and @triggeredOnActionIndex is -1
      @triggeredOnActionIndex = action.getIndex()
      originalEntityId = @getCard().getBaseCardId()

      # remove unit from board
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
      removeOriginalEntityAction.setTarget(@getCard())
      @getGameSession().executeAction(removeOriginalEntityAction)

      # pull faction battle pets + neutral token battle pets
      factionBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Faction6).getRace(Races.BattlePet).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      neutralBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRace(Races.BattlePet).getIsToken(true).getIsPrismatic(false).getIsSkinned(false).getCards()
      battlePetCards = _.reject([].concat(factionBattlePetCards, neutralBattlePetCards), (card) -> return card.getBaseCardId() == originalEntityId)
      battlePetCard = battlePetCards[@getGameSession().getRandomIntegerForExecution(battlePetCards.length)]

      # transform into a new minion
      playCardAction = new PlayCardAsTransformAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, battlePetCard.createNewCardData())
      @getGameSession().executeAction(playCardAction)

module.exports = ModifierSurviveDamageWatchBur
