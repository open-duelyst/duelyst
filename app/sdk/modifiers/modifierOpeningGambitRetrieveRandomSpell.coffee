ModifierOpeningGambit =   require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierOpeningGambitRetrieveRandomSpell extends ModifierOpeningGambit

  type:"ModifierOpeningGambitRetrieveRandomSpell"
  @type:"ModifierOpeningGambitRetrieveRandomSpell"

  @modifierName:"Opening Gambit"
  @description:"Put a copy of a random spell you cast this game into your action bar"

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      spellsPlayedToBoard = @getGameSession().getSpellsPlayed()
      if spellsPlayedToBoard.length > 0
        ownerId = @getCard().getOwnerId()
        spellsPlayedByOwner = []
        for spell in spellsPlayedToBoard
          if !spell.getIsFollowup() and spell.getOwnerId() == ownerId
            spellsPlayedByOwner.push(spell)

        if spellsPlayedByOwner.length > 0
          spellToCopy = spellsPlayedByOwner[@getGameSession().getRandomIntegerForExecution(spellsPlayedByOwner.length)]
          if spellToCopy?
            # put fresh copy of spell into hand
            a = new PutCardInHandAction(@getGameSession(), ownerId, spellToCopy.createNewCardData())
            @getGameSession().executeAction(a)

module.exports = ModifierOpeningGambitRetrieveRandomSpell
