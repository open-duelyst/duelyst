PlayerModifier = require './playerModifier'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class PlayerModifierSpellWatch extends PlayerModifier

  type:"PlayerModifierSpellWatch"
  @type:"PlayerModifierSpellWatch"

  onBeforeAction: (e) ->
    super(e)

    action = e.action

    # watch for a spell (but not a followup) being cast by player who owns this entity
    if (action instanceof PlayCardFromHandAction or action instanceof PlaySignatureCardAction) and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Spell
      @onSpellWatch(action)

  onSpellWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = PlayerModifierSpellWatch
