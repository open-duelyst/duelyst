Action = require './action'
CardType = require 'app/sdk/cards/cardType'

class RemoveArtifactsAction extends Action

  @type:"RemoveArtifactsAction"

  constructor: () ->
    @type ?= RemoveArtifactsAction.type
    super

  _execute: () ->
    super()
    target = @getTarget()
    if target?
      if !target.getIsGeneral() #artifacts are only on the general
        return

      #iterate over all modifiers with durabilty and remove them
      #(only artifacts have durability, regular modifiers do not)
      for modifier in target.getArtifactModifiers() by -1
        target.getGameSession().removeModifier(modifier)

module.exports = RemoveArtifactsAction
