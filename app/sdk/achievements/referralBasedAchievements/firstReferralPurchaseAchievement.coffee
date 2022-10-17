Achievement = require 'app/sdk/achievements/achievement'
CosmeticsLookup = require 'app/sdk/cosmetics/cosmeticsLookup'
i18next = require('i18next')
# One your referrals makes a first real-money purchase at the THE ARMORY.

class FirstReferralPurchase extends Achievement
  @id: "first_referral_purchase"
  @title: i18next.t("achievements.referral_title")
  @description: i18next.t("achievements.referral_desc")
  @progressRequired: 1
  @rewards:
    cosmetics: [CosmeticsLookup.Emote.OtherRook]
  @enabled: true

  @progressForReferralEvent: (eventType) ->
    if eventType == "purchase"
      return 1
    else
      return 0

module.exports = FirstReferralPurchase
