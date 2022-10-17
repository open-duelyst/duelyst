ModifierMyAttackOrCounterattackWatch = require './modifierMyAttackOrCounterattackWatch'
ModifierEgg = require './modifierEgg'
ModifierTransformed = require './modifierTransformed'
Cards = require 'app/sdk/cards/cardsLookupComplete'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'

class ModifierMyAttackOrCounterattackWatchTransformIntoEgg extends ModifierMyAttackOrCounterattackWatch

  type:"ModifierMyAttackOrCounterattackWatchTransformIntoEgg"
  @type:"ModifierMyAttackOrCounterattackWatchTransformIntoEgg"

  onMyAttackOrCounterattackWatch: (action) ->

    entity = @getCard()

    egg = {id: Cards.Faction5.Egg}
    egg.additionalInherentModifiersContextObjects ?= []
    egg.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(entity.createNewCardData(), entity.getName()))
    egg.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(entity.getExhausted(), entity.getMovesMade(), entity.getAttacksMade()))

    removeEntityAction = new RemoveAction(@getGameSession())
    removeEntityAction.setOwnerId(@getCard().getOwnerId())
    removeEntityAction.setTarget(@getCard())
    @getGameSession().executeAction(removeEntityAction)

    spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), entity.getOwnerId(), entity.getPosition().x, entity.getPosition().y, egg)
    @getGameSession().executeAction(spawnEntityAction)

module.exports = ModifierMyAttackOrCounterattackWatchTransformIntoEgg
