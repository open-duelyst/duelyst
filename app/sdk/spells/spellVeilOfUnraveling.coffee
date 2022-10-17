SpellDamage =  require './spellDamage'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
ModifierSilence = require 'app/sdk/modifiers/modifierSilence'
_ = require 'underscore'

class SpellVeilOfUnraveling extends SpellDamage

  damageAmount: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    if !@damageAmount?
      @destroyShadowCreepAndSetSpellDamage()
    super(board,x,y,sourceAction)

  destroyShadowCreepAndSetSpellDamage: () ->
    @damageAmount = 0
    # find friendly shadow creep
    for card in @getGameSession().getBoard().getCards(CardType.Tile, true)
      if card.getBaseCardId() is Cards.Tile.Shadow and card.isOwnedBy(@getOwner())
        @damageAmount++ #increase damage of spell
        @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), card) # destroy shadow creep tile

module.exports = SpellVeilOfUnraveling
