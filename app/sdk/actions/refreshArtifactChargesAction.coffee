Action = require './action'
CardType =       require 'app/sdk/cards/cardType'

class RefreshArtifactChargesAction extends Action

  @type:"RefreshArtifactChargesAction"
  fxResource: ["FX.Actions.RefreshArtifacts"]

  constructor: () ->
    @type ?= RefreshArtifactChargesAction.type
    super

  _execute: () ->
    super()
    target = @getTarget()
    if target? and target.getIsGeneral()
      #iterate over all modifiers, and if any have durabilty < maxDurablity, refresh them to max
      #(only artifacts have durability, regular modifiers do not)
      allModifiers = target.getModifiers()
      for modifier in allModifiers
        if modifier? and modifier.getDurability() < modifier.getMaxDurability()
          modifier.setDurability(modifier.getMaxDurability())

module.exports = RefreshArtifactChargesAction
