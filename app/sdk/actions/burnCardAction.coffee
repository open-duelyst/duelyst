DrawCardAction = require './drawCardAction'

class BurnCardAction extends DrawCardAction

  @type:"BurnCardAction"

  burnCard: true

  constructor: () ->
    @type ?= BurnCardAction.type
    super

module.exports = BurnCardAction
