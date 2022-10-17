ModifierReplaceWatchSpawnEntity = require './modifierReplaceWatchSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierInquisitorKron extends ModifierReplaceWatchSpawnEntity

  type:"ModifierInquisitorKron"
  @type:"ModifierInquisitorKron"

  prisonerList: [{id: Cards.Neutral.Prisoner1}, {id: Cards.Neutral.Prisoner2}, {id: Cards.Neutral.Prisoner3}, {id: Cards.Neutral.Prisoner5}, {id: Cards.Neutral.Prisoner6}]

  onReplaceWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      @cardDataOrIndexToSpawn = @prisonerList[@getGameSession().getRandomIntegerForExecution(@prisonerList.length)]
      super(action)

module.exports = ModifierInquisitorKron
