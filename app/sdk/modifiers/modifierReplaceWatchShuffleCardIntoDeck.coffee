ModifierReplaceWatch = require './modifierReplaceWatch'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'

class ModifierReplaceWatchShuffleCardIntoDeck extends ModifierReplaceWatch

  type:"ModifierReplaceWatchShuffleCardIntoDeck"
  @type:"ModifierReplaceWatchShuffleCardIntoDeck"

  fxResource: ["FX.Modifiers.ModifierReplaceWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (cardDataOrIndexToSpawn, numOfCopies=1, options=undefined) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.numOfCopies = numOfCopies
    return contextObject


  onReplaceWatch: (action) ->
    if @cardDataOrIndexToSpawn? and @numOfCopies > 0
      for i in [0...@numOfCopies]
        a = new PutCardInDeckAction(@getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToSpawn)
        @getGameSession().executeAction(a)


module.exports = ModifierReplaceWatchShuffleCardIntoDeck
