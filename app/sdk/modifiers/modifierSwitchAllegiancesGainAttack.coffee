Modifier = require './modifier'
SwapUnitAllegianceAction =     require('app/sdk/actions/swapUnitAllegianceAction')
i18next = require('i18next')
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSwitchAllegiancesGainAttack extends Modifier

  type:"ModifierSwitchAllegiancesGainAttack"
  @type:"ModifierSwitchAllegiancesGainAttack"

  @modifierName:"ModifierSwitchAllegiancesGainAttack"
  @description: "ModifierSwitchAllegiancesGainAttack"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierBond"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  onActivate: () ->
    super()

    allUnits = @getGameSession().getBoard().getCards(CardType.Unit, allowUntargetable=true)
    friendlyUnitCounter = 0

    for unit in allUnits
      if !unit.getIsGeneral() and unit != @getCard()
        if unit.getOwnerId() is @getCard().getOwnerId()
          friendlyUnitCounter++
        a = new SwapUnitAllegianceAction(@getGameSession())
        a.setTarget(unit)
        @getGameSession().executeAction(a)

    #apply the buff
    friendlyUnitCounter = friendlyUnitCounter * 3
    attackBuff = [Modifier.createContextObjectWithAttributeBuffs(friendlyUnitCounter,friendlyUnitCounter,{
      modifierName:"Discordant Spirit",
      description:Stringifiers.stringifyAttackHealthBuff(friendlyUnitCounter,friendlyUnitCounter),
    })]
    @applyManagedModifiersFromModifiersContextObjects(attackBuff, @getCard())


module.exports = ModifierSwitchAllegiancesGainAttack
