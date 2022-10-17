Spell = require './spell'

class SpellJuxtaposition extends Spell

  _postFilterPlayPositions: (validPositions) ->
    # there must be at least 2 minions on the board to play juxtaposition
    if validPositions.length < 2
      return []
    else
      return super(validPositions)

module.exports = SpellJuxtaposition
