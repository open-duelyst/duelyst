Modifier = require './modifier'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSpellDamageWatch extends Modifier

  type:"ModifierSpellDamageWatch"
  @type:"ModifierSpellDamageWatch"

  @modifierName:"Spell Damage Watch"
  @description: "Spell Damage Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for a spell (but not a followup) being cast by player who owns this entity
    if (action instanceof PlayCardFromHandAction or action instanceof PlaySignatureCardAction) and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Spell and @createdDamageSubaction(action)
      @onDamagingSpellcast(action)

  onDamagingSpellcast: (action) ->
    # override me in sub classes to implement special behavior

  createdDamageSubaction: (action) ->
    # did the spell cast action create a damage subaction directly?
    for subAction in action.getSubActions()
      if subAction.getType() is DamageAction.type and !subAction.getCreatedByTriggeringModifier()
        return true
    return false

module.exports = ModifierSpellDamageWatch
