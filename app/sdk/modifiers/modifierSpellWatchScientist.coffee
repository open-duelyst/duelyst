Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
CardType = require 'app/sdk/cards/cardType'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
TeleportAction = require 'app/sdk/actions/teleportAction'

class ModifierSpellWatchScientist extends Modifier

  type:"ModifierSpellWatchScientist"
  @type:"ModifierSpellWatchScientist"

  @modifierName:"Spell Watch (Scientist)"
  @description:"Whenever you cast a spell that targets a friendly minion, draw a card"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onAction: (event) ->
    super(event)
    action = event.action
    doDraw = false
    if action instanceof ApplyCardToBoardAction and !action.getIsImplicit() and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.getType() is CardType.Spell and action.getCard()?.getRootCard()?.getType() is CardType.Spell
      # if spell might directly target an ally
      if action.getCard().spellFilterType == SpellFilterType.AllyDirect || action.getCard().spellFilterType == SpellFilterType.NeutralDirect
        target = @getGameSession().getCardByIndex(action.getCard().getApplyEffectPositionsCardIndices()[0])
        if target? and target.getType() is CardType.Unit and target.getOwnerId() is @getCard().getOwnerId() and !target.getIsGeneral()
          doDraw = true

    if doDraw
      @getGameSession().executeAction(@getCard().getOwner().getDeck().actionDrawCard())

module.exports = ModifierSpellWatchScientist
