ModifierSynergize = require './modifierSynergize'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierSynergizeDrawBloodboundSpell extends ModifierSynergize

  type:"ModifierSynergizeDrawBloodboundSpell"
  @type:"ModifierSynergizeDrawBloodboundSpell"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onSynergize: (action) ->
    super(action)
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    bloodboundSpell = general.getSignatureCardData()
    a = new PutCardInHandAction(@getCard().getGameSession(), @getCard().getOwnerId(),  bloodboundSpell)
    this.getGameSession().executeAction(a)

module.exports = ModifierSynergizeDrawBloodboundSpell