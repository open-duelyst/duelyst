SpellDamage = require './spellDamage'
PlayerModifierBattlePetManager = require 'app/sdk/playerModifiers/playerModifierBattlePetManager'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction'
Races = require 'app/sdk/cards/racesLookup'

class SpellCrimsonCoil extends SpellDamage

  onApplyOneEffectToBoard: (board, x, y, sourceAction) ->
    super(board, x, y, sourceAction)

    # activate all friendly battle pets
    if @getGameSession().getIsRunningAsAuthoritative()
      general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      for card in @getGameSession().getBoard().getUnits()
        if card.getOwnerId() is @getOwnerId() and !card.getIsGeneral() and card.getIsBattlePet()
          general.getModifierByClass(PlayerModifierBattlePetManager).triggerBattlePet(card)
        # for minions that "belong to all tribes" - unexhaust them
        else if card.getOwnerId() is @getOwnerId() and card.getBelongsToTribe(Races.BattlePet)
          refreshExhaustionAction = new RefreshExhaustionAction(@getGameSession())
          refreshExhaustionAction.setTarget(card)
          @getGameSession().executeAction(refreshExhaustionAction)

module.exports = SpellCrimsonCoil
