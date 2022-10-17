ModifierOpeningGambit =   require './modifierOpeningGambit'
ModifierSilence = require './modifierSilence'
RemoveArtifactsAction =  require 'app/sdk/actions/removeArtifactsAction'

class ModifierOpeningGambitGoleminate extends ModifierOpeningGambit

  type:"ModifierOpeningGambitGoleminate"
  @type:"ModifierOpeningGambitGoleminate"

  @modifierName:"Opening Gambit"
  @description:"Dispel EVERYTHING and destroy ALL artifacts."

  onOpeningGambit: () ->
    for entity in @getGameSession().getBoard().getEntities() # dispel every entity on the board
      if !(entity is @getCard()) # don't dispel self though
        @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), entity)
        if entity.getIsGeneral() # if entity is a General, remove all Artifacts
          removeArtifactsAction = new RemoveArtifactsAction(@getGameSession())
          removeArtifactsAction.setTarget(entity)
          @getGameSession().executeAction(removeArtifactsAction)

module.exports = ModifierOpeningGambitGoleminate
