CONFIG = require 'app/common/config'
Card = require 'app/sdk/cards/card'
CardType = require 'app/sdk/cards/cardType'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierDestructible = require 'app/sdk/modifiers/modifierDestructible'
UtilsGameSession = require 'app/common/utils/utils_game_session'
_ = require 'underscore'

class Artifact extends Card

  type: CardType.Artifact
  @type: CardType.Artifact
  name: "Artifact"

  targetModifiersContextObjects: null # just like entity modifier options, but used to create modifiers that are added to target of artifact
  durability: CONFIG.MAX_ARTIFACT_DURABILITY # modifiers durability
  canBeAppliedAnywhere: true

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.keywordClassesToInclude.push(ModifierDestructible)

    return p

  # region ### GETTERS / SETTERS ###

  setTargetModifiersContextObjects: (targetModifiersContextObjects) ->
    @targetModifiersContextObjects = targetModifiersContextObjects

  getTargetModifiersContextObjects: () ->
    return @targetModifiersContextObjects

  # region ### GETTERS / SETTERS ###

  # region ### APPLY ###

  onApplyToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative() and @targetModifiersContextObjects?

      # find all artifacts on the General
      general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      modifiersByArtifact = general.getArtifactModifiersGroupedByArtifactCard()

      if modifiersByArtifact.length >= CONFIG.MAX_ARTIFACTS # if there are already max number of artifacts on the General
        artifactModifiers = modifiersByArtifact.shift() # get all modifiers attached to the oldest artifact
        for modifier in artifactModifiers
          @getGameSession().removeModifier(modifier)  # and remove them

      # add new artifact
      for modifierContextObject in @targetModifiersContextObjects
        # artifact modifiers are not visible to the UI
        modifierContextObject.isHiddenToUI = true

        # artifact modifiers are not removable by normal methods
        modifierContextObject.isRemovable = false

        # artifact modifiers are removed when their durability reaches 0
        modifierContextObject.maxDurability = @durability
        modifierContextObject.durability = @durability

        # apply modifier
        @getGameSession().applyModifierContextObject(modifierContextObject, general)

  # endregion ### APPLY ###

module.exports = Artifact
