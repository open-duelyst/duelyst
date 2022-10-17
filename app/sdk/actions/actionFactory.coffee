Logger = require 'app/common/logger'
Action = require './action'
DamageAction = require './damageAction'
DamageAsAttackAction = require './damageAsAttackAction'
AttackAction = require './attackAction'
DieAction = require './dieAction'
MoveAction = require './moveAction'
ApplyCardToBoardAction = require './applyCardToBoardAction'
PlayCardAction = require './playCardAction'
PlayCardSilentlyAction = require './playCardSilentlyAction'
PlayCardAsTransformAction = require './playCardAsTransformAction'
PlayCardFromHandAction = require './playCardFromHandAction'
PlaySignatureCardAction = require './playSignatureCardAction'
CloneEntityAction = require './cloneEntityAction'
CloneEntityAsTransformAction = require './cloneEntityAsTransformAction'
ReplaceCardFromHandAction = require './replaceCardFromHandAction'
TeleportAction = require './teleportAction'
SwapUnitsAction = require './swapUnitsAction'
RemoveAction = require './removeAction'
HealAction = require './healAction'
RefreshExhaustionAction = require './refreshExhaustionAction'
SwapGeneralAction =   require './swapGeneralAction'
SwapUnitAllegianceAction =   require './swapUnitAllegianceAction'
DrawStartingHandAction =   require './drawStartingHandAction'
ResignAction = require './resignAction'
StartTurnAction = require './startTurnAction'
EndTurnAction = require './endTurnAction'
BonusManaAction = require './bonusManaAction'
StopBufferingEventsAction = require './stopBufferingEventsAction'
EndFollowupAction = require './endFollowupAction'
PutCardInHandAction = require './putCardInHandAction'
RefreshArtifactChargesAction = require './refreshArtifactChargesAction'
ApplyExhaustionAction = require './applyExhaustionAction'
RemoveArtifactsAction = require './removeArtifactsAction'
RemoveRandomArtifactAction = require './removeRandomArtifactAction'
KillAction = require './killAction'
DrawCardAction = require './drawCardAction'
GenerateSignatureCardAction = require './generateSignatureCardAction'
RollbackToSnapshotAction = require './rollbackToSnapshotAction'
PutCardInDeckAction = require './putCardInDeckAction'
TakeAnotherTurnAction = require './takeAnotherTurnAction'
SetExhaustionAction = require './setExhaustionAction'
BonusManaCoreAction = require './bonusManaCoreAction'
RemoveCardFromHandAction = require './removeCardFromHandAction'
TrueDamageAction = require './trueDamageAction'
HurtingDamageAction = require './hurtingDamageAction'
TeleportInFrontOfUnitAction = require './teleportInFrontOfUnitAction'
RandomTeleportAction = require './randomTeleportAction'
RandomDamageAction = require './randomDamageAction'
DrawToXCardsAction = require './drawToXCardsAction'
ApplyModifierAction = require './applyModifierAction'
RemoveModifierAction = require './removeModifierAction'
RemoveCardFromDeckAction = require './removeCardFromDeckAction'
RandomPlayCardSilentlyAction = require './randomPlayCardSilentlyAction'
ActivateSignatureCardAction = require './activateSignatureCardAction'
TeleportBehindUnitAction = require './teleportBehindUnitAction'
RevealHiddenCardAction = require './revealHiddenCardAction'
SetDamageAction = require './setDamageAction'
RestoreManaAction = require './restoreManaAction'
FightAction = require './fightAction'
RemoveManaCoreAction = require './removeManaCoreAction'
ForcedAttackAction = require './forcedAttackAction'
RestoreChargeToAllArtifactsAction = require './restoreChargeToAllArtifactsAction'
BurnCardAction = require './burnCardAction'

Colors = require 'colors' # used for console message coloring

class ActionFactory

  @actionForType: (actionType,gameSession) ->
    if (actionType == Action.type)
      return new Action(gameSession)
    if (actionType == ApplyModifierAction.type)
      return new ApplyModifierAction(gameSession)
    if (actionType == RemoveModifierAction.type)
      return new RemoveModifierAction(gameSession)
    if (actionType == DamageAction.type)
      return new DamageAction(gameSession)
    if (actionType == AttackAction.type)
      return new AttackAction(gameSession)
    if (actionType == DieAction.type)
      return new DieAction(gameSession)
    if (actionType == MoveAction.type)
      return new MoveAction(gameSession)
    if (actionType == ApplyCardToBoardAction.type)
      return new ApplyCardToBoardAction(gameSession)
    if (actionType == PlayCardAction.type)
      return new PlayCardAction(gameSession)
    if (actionType == PlayCardFromHandAction.type)
      return new PlayCardFromHandAction(gameSession)
    if (actionType == PlaySignatureCardAction.type)
      return new PlaySignatureCardAction(gameSession)
    if (actionType == PlayCardSilentlyAction.type)
      return new PlayCardSilentlyAction(gameSession)
    if (actionType == PlayCardAsTransformAction.type)
      return new PlayCardAsTransformAction(gameSession)
    if (actionType == CloneEntityAction.type)
      return new CloneEntityAction(gameSession)
    if (actionType == CloneEntityAsTransformAction.type)
      return new CloneEntityAsTransformAction(gameSession)
    if (actionType == ReplaceCardFromHandAction.type)
      return new ReplaceCardFromHandAction(gameSession)
    if (actionType == TeleportAction.type)
      return new TeleportAction(gameSession)
    if (actionType == SwapUnitsAction.type)
      return new SwapUnitsAction(gameSession)
    if (actionType == RemoveAction.type)
      return new RemoveAction(gameSession)
    if (actionType == HealAction.type)
      return new HealAction(gameSession)
    if (actionType == RefreshExhaustionAction.type)
      return new RefreshExhaustionAction(gameSession)
    if (actionType == SwapUnitAllegianceAction.type)
      return new SwapUnitAllegianceAction(gameSession)
    if (actionType == SwapGeneralAction.type)
      return new SwapGeneralAction(gameSession)
    if (actionType == DrawStartingHandAction.type)
      return new DrawStartingHandAction(gameSession)
    if (actionType == ResignAction.type)
      return new ResignAction(gameSession)
    if (actionType == StartTurnAction.type)
      return new StartTurnAction(gameSession)
    if (actionType == EndTurnAction.type)
      return new EndTurnAction(gameSession)
    if (actionType == BonusManaAction.type)
      return new BonusManaAction(gameSession)
    if (actionType == StopBufferingEventsAction.type)
      return new StopBufferingEventsAction(gameSession)
    if (actionType == EndFollowupAction.type)
      return new EndFollowupAction(gameSession)
    if (actionType == PutCardInHandAction.type)
      return new PutCardInHandAction(gameSession)
    if (actionType == RefreshArtifactChargesAction.type)
      return new RefreshArtifactChargesAction(gameSession)
    if (actionType == ApplyExhaustionAction.type)
      return new ApplyExhaustionAction(gameSession)
    if (actionType == RemoveArtifactsAction.type)
      return new RemoveArtifactsAction(gameSession)
    if (actionType == RemoveRandomArtifactAction.type)
      return new RemoveRandomArtifactAction(gameSession)
    if (actionType == KillAction.type)
      return new KillAction(gameSession)
    if (actionType == DrawCardAction.type)
      return new DrawCardAction(gameSession)
    if (actionType == GenerateSignatureCardAction.type)
      return new GenerateSignatureCardAction(gameSession)
    if (actionType == RollbackToSnapshotAction.type)
      return new RollbackToSnapshotAction(gameSession)
    if (actionType == PutCardInDeckAction.type)
      return new PutCardInDeckAction(gameSession)
    if (actionType == TakeAnotherTurnAction.type)
      return new TakeAnotherTurnAction(gameSession)
    if (actionType == SetExhaustionAction.type)
      return new SetExhaustionAction(gameSession)
    if (actionType == BonusManaCoreAction.type)
      return new BonusManaCoreAction(gameSession)
    if (actionType == RemoveCardFromHandAction.type)
      return new RemoveCardFromHandAction(gameSession)
    if (actionType == TrueDamageAction.type)
      return new TrueDamageAction(gameSession)
    if (actionType == HurtingDamageAction.type)
      return new HurtingDamageAction(gameSession)
    if (actionType == TeleportInFrontOfUnitAction.type)
      return new TeleportInFrontOfUnitAction(gameSession)
    if (actionType == RandomTeleportAction.type)
      return new RandomTeleportAction(gameSession)
    if (actionType == RandomDamageAction.type)
      return new RandomDamageAction(gameSession)
    if (actionType == DamageAsAttackAction.type)
      return new DamageAsAttackAction(gameSession)
    if (actionType == DrawToXCardsAction.type)
      return new DrawToXCardsAction(gameSession)
    if (actionType == RemoveCardFromDeckAction.type)
      return new RemoveCardFromDeckAction(gameSession)
    if (actionType == RandomPlayCardSilentlyAction.type)
      return new RandomPlayCardSilentlyAction(gameSession)
    if (actionType == ActivateSignatureCardAction.type)
      return new ActivateSignatureCardAction(gameSession)
    if (actionType == TeleportBehindUnitAction.type)
      return new TeleportBehindUnitAction(gameSession)
    if (actionType == RevealHiddenCardAction.type)
      return new RevealHiddenCardAction(gameSession)
    if (actionType == SetDamageAction.type)
      return new SetDamageAction(gameSession)
    if (actionType == RestoreManaAction.type)
      return new RestoreManaAction(gameSession)
    if (actionType == FightAction.type)
      return new FightAction(gameSession)
    if (actionType == RemoveManaCoreAction.type)
      return new RemoveManaCoreAction(gameSession)
    if (actionType == ForcedAttackAction.type)
      return new ForcedAttackAction(gameSession)
    if (actionType == RestoreChargeToAllArtifactsAction.type)
      return new RestoreChargeToAllArtifactsAction(gameSession)
    if (actionType == BurnCardAction.type)
      return new BurnCardAction(gameSession)

    Logger.module("SDK").debug("[G:#{gameSession.gameId}]", "Error: ActionFactory:actionForType - Unknown Action Type: " + actionType)
    console.error "ActionFactory:actionForType - Unknown Action Type: #{actionType}".red

module.exports = ActionFactory
