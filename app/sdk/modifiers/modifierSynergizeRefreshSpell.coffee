ModifierSynergize = require './modifierSynergize'

class ModifierSynergizeRefreshSpell extends ModifierSynergize

  type:"ModifierSynergizeRefreshSpell"
  @type:"ModifierSynergizeRefreshSpell"

  @description:"Refresh your Bloodbound spell"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onSynergize: (action) ->
    super(action)

    player = @getCard().getGameSession().getPlayerById(@getCard().getOwnerId())
    @getGameSession().executeAction(player.actionActivateSignatureCard())

module.exports = ModifierSynergizeRefreshSpell
