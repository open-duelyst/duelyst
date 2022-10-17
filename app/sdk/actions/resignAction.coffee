Logger = require 'app/common/logger'
DieAction = require './dieAction'
GameStatus = require 'app/sdk/gameStatus'


class ResignAction extends DieAction

  @type:"ResignAction"

  constructor: () ->
    @type ?= ResignAction.type
    super

  isRemovableDuringScrubbing: () ->
    return false

  _execute: () ->
    super()
    @getGameSession().getPlayerById(@getOwnerId()).hasResigned = true

module.exports = ResignAction
