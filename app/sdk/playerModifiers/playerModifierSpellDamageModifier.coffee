PlayerModifier = require './playerModifier'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'


class PlayerModifierSpellDamageModifier extends PlayerModifier

  type:"PlayerModifierSpellDamageModifier"
  @type:"PlayerModifierSpellDamageModifier"

  spellDamageChange: null
  spellDamageMultiplier: null

  setSpellDamageChange: (damageChange) ->
    @spellDamageChange = damageChange

  setSpellDamageMultiplier: (damageMultiplier) ->
    @spellDamageMultiplier = damageMultiplier

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    # watch for damageActions created by this player that were not triggered by a modifier
    if a.getOwnerId() is @getPlayerId() and a instanceof DamageAction and !a.getCreatedByTriggeringModifier()
      rootAction = a.getRootAction()
      # this action was not triggered by a modifier, but was it caused by a spell cast?
      if rootAction instanceof ApplyCardToBoardAction and rootAction.getCard()?.getRootCard()?.getType() is CardType.Spell
        # modify the damageAmount
        a.setChangedByModifier(@)
        if @spellDamageChange?
          a.changeDamageBy(@spellDamageChange)
        if @spellDamageMultiplier?
          a.changeDamageMultiplierBy(@spellDamageMultiplier)

module.exports = PlayerModifierSpellDamageModifier
