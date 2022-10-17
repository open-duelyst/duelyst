CONFIG = require 'app/common/config'
SpellApplyModifiers =   require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
RemoveAction = require 'app/sdk/actions/removeAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
UtilsJavascript = require 'app/common/utils/utils_javascript'

class SpellBounceToActionbarApplyModifiers extends SpellApplyModifiers

  targetType: CardType.Unit

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}

    # remove the existing unit
    removingEntity = board.getCardAtPosition(applyEffectPosition, @targetType)
    if removingEntity?
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getOwnerId())
      removeOriginalEntityAction.setTarget(removingEntity)
      @getGameSession().executeAction(removeOriginalEntityAction)

    # put a fresh card matching the original unit into hand
    newCardData = removingEntity.createNewCardData()
    # add additional modifiers as needed
    if @targetModifiersContextObjects
      if newCardData.additionalModifiersContextObjects?
        newCardData.additionalModifiersContextObjects.concat(UtilsJavascript.deepCopy(@targetModifiersContextObjects))
      else
        newCardData.additionalModifiersContextObjects = UtilsJavascript.deepCopy(@targetModifiersContextObjects)
    putCardInHandAction = new PutCardInHandAction(@getGameSession(), removingEntity.getOwnerId(), newCardData)
    @getGameSession().executeAction(putCardInHandAction)


module.exports = SpellBounceToActionbarApplyModifiers
