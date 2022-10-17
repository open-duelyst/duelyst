ModifierStartTurnWatch = require './modifierStartTurnWatch'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Stringifiers = require 'app/sdk/helpers/stringifiers'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
ModifierSilence = require './modifierSilence'
_ = require 'underscore'

class ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard"
  @type:"ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard"

  @description: "At the start of your turn, dispel all enemy minions and draw a card"

  onTurnWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      for enemyUnit in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
        if !enemyUnit.getIsGeneral()
          @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), enemyUnit)
      a = new DrawCardAction(this.getGameSession(), @getCard().getOwnerId())
      this.getGameSession().executeAction(a)

module.exports = ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard
