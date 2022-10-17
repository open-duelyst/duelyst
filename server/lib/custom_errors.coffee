###
# Custom Error Classes
#
# @module custom_errors
###

class NotFoundError extends Error
  constructor: (@message = "Not Found.") ->
    @name = "NotFoundError"
    @status = 404
    @description = "The requested resource cannot be found."
    Error.captureStackTrace(this, NotFoundError)
    super(@message)

class BadRequestError extends Error
  constructor: (@message = "Bad Request.") ->
    @name = "BadRequestError"
    @status = 400
    @description = "The request you made is invalid."
    Error.captureStackTrace(this, BadRequestError)
    super(@message)

class UnauthorizedError extends Error
  constructor: (@message = "Not Authorized.") ->
    @name = "UnauthorizedError"
    @status = 401
    @description = "You are not authorized to access this resource."
    Error.captureStackTrace(this, UnauthorizedError)
    super(@message)

class BadPasswordError extends Error
  constructor: (@message) ->
    @name = "BadPasswordError"
    Error.captureStackTrace(this, BadPasswordError)
    super(@message)

class AccountDisabled extends Error
  constructor: (@message = "Account Is Disabled.") ->
    @name = "AccountDisabled"
    @status = 401
    Error.captureStackTrace(this, AccountDisabled)
    super(@message)

class AlreadyExistsError extends Error
  constructor: (@message) ->
    @name = "AlreadyExistsError"
    @status = 400
    Error.captureStackTrace(this, AlreadyExistsError)
    super(@message)

class FirebaseTransactionDidNotCommitError extends Error
  constructor:(message)->
    @name = "FirebaseTransactionDidNotCommitError"
    Error.captureStackTrace(this, FirebaseTransactionDidNotCommitError)
    super(@message)

class QuestCantBeMulliganedError extends Error
  constructor: (@message) ->
    @name = "QuestCantBeMulliganedError"
    Error.captureStackTrace(this, QuestCantBeMulliganedError)
    super(@message)

class NoNeedForNewBeginnerQuestsError extends Error
  constructor: (@message) ->
    @name = "NoNeedForNewBeginnerQuestsError"
    Error.captureStackTrace(this, NoNeedForNewBeginnerQuestsError)
    super(@message)

class InsufficientFundsError extends Error
  constructor: (@message) ->
    @name = "InsufficientFundsError"
    @status = 400
    Error.captureStackTrace(this, InsufficientFundsError)
    super(@message)

class InvalidInviteCodeError extends Error
  constructor: (@message) ->
    @name = "InvalidInviteCodeError"
    @status = 400
    Error.captureStackTrace(this, InvalidInviteCodeError)
    super(@message)

class MatchmakingOfflineError extends Error
  constructor: (@message) ->
    @name = "MatchmakingOfflineError"
    Error.captureStackTrace(this, MatchmakingOfflineError)
    super(@message)

class InvalidDeckError extends Error
  constructor: (@message) ->
    @name = "InvalidDeckError"
    Error.captureStackTrace(this, InvalidDeckError)
    super(@message)

class NoArenaDeckError extends Error
  constructor: (@message) ->
    @name = "NoArenaDeckError"
    Error.captureStackTrace(this, NoArenaDeckError)
    super(@message)

class ArenaRewardsAlreadyClaimedError extends Error
  constructor: (@message) ->
    @name = "ArenaRewardsAlreadyClaimedError"
    Error.captureStackTrace(this, ArenaRewardsAlreadyClaimedError)
    super(@message)

class InvalidRequestError extends Error
  constructor: (@message) ->
    @name = "InvalidRequestError"
    Error.captureStackTrace(this, InvalidRequestError)
    super(@message)

class UnexpectedBadDataError extends Error
  constructor: (@message) ->
    @name = "UnexpectedBadDataError"
    Error.captureStackTrace(this, UnexpectedBadDataError)
    super(@message)

class InvalidReferralCodeError extends Error
  constructor: (@message) ->
    @name = "InvalidReferralCodeError"
    Error.captureStackTrace(this, InvalidReferralCodeError)
    super(@message)

class MaxFactionXPForSinglePlayerReachedError extends Error
  constructor: (@message) ->
    @name = "MaxFactionXPForSinglePlayerReachedError"
    Error.captureStackTrace(this, MaxFactionXPForSinglePlayerReachedError)
    super(@message)

class SinglePlayerModeDisabledError extends Error
  constructor: (@message) ->
    @name = "SinglePlayerModeDisabledError"
    Error.captureStackTrace(this, SinglePlayerModeDisabledError)
    super(@message)

class UnverifiedCaptchaError extends Error
  constructor: (@message) ->
    @name = "UnverifiedCaptchaError"
    Error.captureStackTrace(this, UnverifiedCaptchaError)
    super(@message)

class DailyChallengeTimeFrameError extends Error
  constructor: (@message) ->
    @name = "DailyChallengeTimeFrameError"
    Error.captureStackTrace(this, DailyChallengeTimeFrameError)
    super(@message)

class ChestAndKeyTypeDoNotMatchError extends Error
  constructor: (@message) ->
    @name = "ChestAndKeyTypeDoNotMatchError"
    Error.captureStackTrace(this, ChestAndKeyTypeDoNotMatchError)
    super(@message)

# TODO: Do we need to do this? Seems odd if we ever want to let users buy multiples, current spec has it maxing out at 5, maybe that should just be for free chest
class MaxQuantityOfChestTypeError extends Error
  constructor: (@message) ->
    @name = "MaxQuantityOfChestTypeError"
    Error.captureStackTrace(this, MaxQuantityOfChestTypeError)
    super(@message)

class SystemDisabledError extends Error
  constructor: (@message = "This system is currently disabled.") ->
    @name = "SystemDisabledError"
    @status = 400
    @description = "This system is currently disabled."
    Error.captureStackTrace(this, SystemDisabledError)
    super(@message)

class MaxOrbsForSetReachedError extends Error
  constructor: (@message) ->
    @name = "MaxOrbsForSetReachedError"
    Error.captureStackTrace(this, MaxOrbsForSetReachedError)
    super(@message)

class BossEventNotFound extends Error
  constructor: (@message) ->
    @name = "BossEventNotFound"
    Error.captureStackTrace(this, BossEventNotFound)
    super(@message)

class MaxRiftUpgradesReachedError extends Error
  constructor: (@message) ->
    @name = "MaxRiftUpgradesReachedError"
    Error.captureStackTrace(this, MaxRiftUpgradesReachedError)
    super(@message)

class ShopSaleDoesNotExistError extends Error
  constructor: (@message) ->
    @name = "ShopSaleDoesNotExistError"
    Error.captureStackTrace(this, ShopSaleDoesNotExistError)
    super(@message)

module.exports.NotFoundError = NotFoundError
module.exports.BadRequestError = BadRequestError
module.exports.UnauthorizedError = UnauthorizedError
module.exports.BadPasswordError = BadPasswordError
module.exports.AccountDisabled = AccountDisabled
module.exports.AlreadyExistsError = AlreadyExistsError
module.exports.QuestCantBeMulliganedError = QuestCantBeMulliganedError
module.exports.NoNeedForNewBeginnerQuestsError = NoNeedForNewBeginnerQuestsError
module.exports.FirebaseTransactionDidNotCommitError = FirebaseTransactionDidNotCommitError
module.exports.InsufficientFundsError = InsufficientFundsError
module.exports.InvalidInviteCodeError = InvalidInviteCodeError
module.exports.MatchmakingOfflineError = MatchmakingOfflineError
module.exports.InvalidDeckError = InvalidDeckError
module.exports.NoArenaDeckError = NoArenaDeckError
module.exports.ArenaRewardsAlreadyClaimedError = ArenaRewardsAlreadyClaimedError
module.exports.InvalidRequestError = InvalidRequestError
module.exports.UnexpectedBadDataError = UnexpectedBadDataError
module.exports.InvalidReferralCodeError = InvalidReferralCodeError
module.exports.MaxFactionXPForSinglePlayerReachedError = MaxFactionXPForSinglePlayerReachedError
module.exports.SinglePlayerModeDisabledError = SinglePlayerModeDisabledError
module.exports.UnverifiedCaptchaError = UnverifiedCaptchaError
module.exports.DailyChallengeTimeFrameError = DailyChallengeTimeFrameError
module.exports.ChestAndKeyTypeDoNotMatchError = ChestAndKeyTypeDoNotMatchError
module.exports.MaxQuantityOfChestTypeError = MaxQuantityOfChestTypeError
module.exports.SystemDisabledError = SystemDisabledError
module.exports.MaxOrbsForSetReachedError = MaxOrbsForSetReachedError
module.exports.BossEventNotFound = BossEventNotFound
module.exports.MaxRiftUpgradesReachedError = MaxRiftUpgradesReachedError
module.exports.ShopSaleDoesNotExistError = ShopSaleDoesNotExistError
