Action = require './action'

class RestoreChargeToAllArtifactsAction extends Action

  @type:"RestoreChargeToAllArtifactsAction"
  fxResource: ["FX.Actions.RefreshArtifacts"]

  constructor: () ->
    @type ?= RestoreChargeToAllArtifactsAction.type
    super

  _execute: () ->
    super()
    target = @getTarget()

    if target? and target.getIsGeneral()
      #iterate over all modifiers, and if any have durabilty < maxDurablity, add 1 durability
      #(only artifacts have durability, regular modifiers do not)
      allModifiers = target.getModifiers()
      for modifier in allModifiers
        if modifier? and modifier.getDurability() < modifier.getMaxDurability()
          modifier.setDurability(modifier.getDurability()+1)

module.exports = RestoreChargeToAllArtifactsAction
