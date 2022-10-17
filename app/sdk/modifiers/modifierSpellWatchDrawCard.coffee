ModifierSpellWatch = require './modifierSpellWatch'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierSpellWatchDrawCard extends ModifierSpellWatch

  type:"ModifierSpellWatchDrawCard"
  @type:"ModifierSpellWatchDrawCard"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onSpellWatch: (action) ->

    @getGameSession().executeAction(new DrawCardAction(@getGameSession(), @getCard().getOwnerId()))

module.exports = ModifierSpellWatchDrawCard
