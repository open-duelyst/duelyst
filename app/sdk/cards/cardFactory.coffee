# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

Cards = require 'app/sdk/cards/cardsLookupComplete'
CosmeticsFactory = require 'app/sdk/cosmetics/cosmeticsFactory'

CardFactory_Tutorial = require './factory/misc/tutorial.coffee'
CardFactory_Generic = require './factory/misc/generic.coffee'
CardFactory_Tiles = require './factory/misc/tiles.coffee'
CardFactory_Bosses = require './factory/misc/bosses.coffee'

CardFactory_CoreSet_Faction1 = require './factory/core/faction1.coffee'
CardFactory_CoreSet_Faction2 = require './factory/core/faction2.coffee'
CardFactory_CoreSet_Faction3 = require './factory/core/faction3.coffee'
CardFactory_CoreSet_Faction4 = require './factory/core/faction4.coffee'
CardFactory_CoreSet_Faction5 = require './factory/core/faction5.coffee'
CardFactory_CoreSet_Faction6 = require './factory/core/faction6.coffee'
CardFactory_CoreSet_Neutral = require './factory/core/neutral.coffee'

CardFactory_Monthly_Sisters = require './factory/monthly/sisters.coffee'
CardFactory_Monthly_M1_Movement = require './factory/monthly/m1_movement.coffee'
CardFactory_Monthly_M2_Reactive = require './factory/monthly/m2_reactive.coffee'
CardFactory_Monthly_M3_OpeningGambitBuff = require './factory/monthly/m3_opening_gambit_buff.coffee'
CardFactory_Monthly_M4_Replace = require './factory/monthly/m4_replace.coffee'
CardFactory_Monthly_M5_Provoke = require './factory/monthly/m5_provoke.coffee'
CardFactory_Monthly_M6_Forcefield = require './factory/monthly/m6_forcefield.coffee'
CardFactory_Monthly_M7_Warmasters = require './factory/monthly/m7_warmasters.coffee'
CardFactory_Monthly_M8_Rexx = require './factory/monthly/m8_rexx.coffee'
CardFactory_Monthly_M9_Streamers = require './factory/monthly/m9_streamers.coffee'
CardFactory_Monthly_M10_GeneralDamage = require './factory/monthly/m10_general_damage.coffee'
CardFactory_Monthly_M11_PennyArcade = require './factory/monthly/m11_penny_arcade.coffee'
CardFactory_Monthly_M12_OctoberMonthlies = require './factory/monthly/m12_october_monthlies.coffee'
CardFactory_Monthly_M13_NovemberMonthlies = require './factory/monthly/m13_november_monthlies.coffee'

CardFactory_ShimzarSet_Faction1 = require './factory/shimzar/faction1.coffee'
CardFactory_ShimzarSet_Faction2 = require './factory/shimzar/faction2.coffee'
CardFactory_ShimzarSet_Faction3 = require './factory/shimzar/faction3.coffee'
CardFactory_ShimzarSet_Faction4 = require './factory/shimzar/faction4.coffee'
CardFactory_ShimzarSet_Faction5 = require './factory/shimzar/faction5.coffee'
CardFactory_ShimzarSet_Faction6 = require './factory/shimzar/faction6.coffee'
CardFactory_ShimzarSet_Neutral = require './factory/shimzar/neutral.coffee'

CardFactory_BloodstormSet_Faction1 = require './factory/bloodstorm/faction1.coffee'
CardFactory_BloodstormSet_Faction2 = require './factory/bloodstorm/faction2.coffee'
CardFactory_BloodstormSet_Faction3 = require './factory/bloodstorm/faction3.coffee'
CardFactory_BloodstormSet_Faction4 = require './factory/bloodstorm/faction4.coffee'
CardFactory_BloodstormSet_Faction5 = require './factory/bloodstorm/faction5.coffee'
CardFactory_BloodstormSet_Faction6 = require './factory/bloodstorm/faction6.coffee'
CardFactory_BloodstormSet_Neutral = require './factory/bloodstorm/neutral.coffee'

CardFactory_UnitySet_Faction1 = require './factory/unity/faction1.coffee'
CardFactory_UnitySet_Faction2 = require './factory/unity/faction2.coffee'
CardFactory_UnitySet_Faction3 = require './factory/unity/faction3.coffee'
CardFactory_UnitySet_Faction4 = require './factory/unity/faction4.coffee'
CardFactory_UnitySet_Faction5 = require './factory/unity/faction5.coffee'
CardFactory_UnitySet_Faction6 = require './factory/unity/faction6.coffee'
CardFactory_UnitySet_Neutral = require './factory/unity/neutral.coffee'

CardFactory_Gauntlet_Specials = require './factory/misc/gauntlet_specials.coffee'

CardFactory_FirstWatchSet_Faction1 = require './factory/firstwatch/faction1.coffee'
CardFactory_FirstWatchSet_Faction2 = require './factory/firstwatch/faction2.coffee'
CardFactory_FirstWatchSet_Faction3 = require './factory/firstwatch/faction3.coffee'
CardFactory_FirstWatchSet_Faction4 = require './factory/firstwatch/faction4.coffee'
CardFactory_FirstWatchSet_Faction5 = require './factory/firstwatch/faction5.coffee'
CardFactory_FirstWatchSet_Faction6 = require './factory/firstwatch/faction6.coffee'
CardFactory_FirstWatchSet_Neutral = require './factory/firstwatch/neutral.coffee'

CardFactory_WartechSet_Faction1 = require './factory/wartech/faction1.coffee'
CardFactory_WartechSet_Faction2 = require './factory/wartech/faction2.coffee'
CardFactory_WartechSet_Faction3 = require './factory/wartech/faction3.coffee'
CardFactory_WartechSet_Faction4 = require './factory/wartech/faction4.coffee'
CardFactory_WartechSet_Faction5 = require './factory/wartech/faction5.coffee'
CardFactory_WartechSet_Faction6 = require './factory/wartech/faction6.coffee'
CardFactory_WartechSet_Neutral = require './factory/wartech/neutral.coffee'

CardFactory_CoreshatterSet_Faction1 = require './factory/coreshatter/faction1.coffee'
CardFactory_CoreshatterSet_Faction2 = require './factory/coreshatter/faction2.coffee'
CardFactory_CoreshatterSet_Faction3 = require './factory/coreshatter/faction3.coffee'
CardFactory_CoreshatterSet_Faction4 = require './factory/coreshatter/faction4.coffee'
CardFactory_CoreshatterSet_Faction5 = require './factory/coreshatter/faction5.coffee'
CardFactory_CoreshatterSet_Faction6 = require './factory/coreshatter/faction6.coffee'
CardFactory_CoreshatterSet_Neutral = require './factory/coreshatter/neutral.coffee'

class CardFactory

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} cardId
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (cardId,gameSession) ->

    #Logger.module("SDK").debug("[G:#{gameSession.gameId}]", "CardFactory ::generate card with id: #{cardId}")

    # check for invalid id
    card = null
    if !cardId? || cardId <= 0
      return card

    # get base card identifier
    identifier = Cards.getBaseCardId(cardId)

    # core set

    if !card? then card = CardFactory_CoreSet_Faction1.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreSet_Faction2.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreSet_Faction3.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreSet_Faction4.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreSet_Faction5.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreSet_Faction6.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreSet_Neutral.cardForIdentifier(identifier, gameSession)

    # shimzar set

    if !card? then card = CardFactory_ShimzarSet_Faction1.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_ShimzarSet_Faction2.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_ShimzarSet_Faction3.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_ShimzarSet_Faction4.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_ShimzarSet_Faction5.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_ShimzarSet_Faction6.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_ShimzarSet_Neutral.cardForIdentifier(identifier, gameSession)

    # first watch set

    if !card? then card = CardFactory_FirstWatchSet_Faction1.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_FirstWatchSet_Faction2.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_FirstWatchSet_Faction3.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_FirstWatchSet_Faction4.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_FirstWatchSet_Faction5.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_FirstWatchSet_Faction6.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_FirstWatchSet_Neutral.cardForIdentifier(identifier, gameSession)

    # monthly

    if !card? then card = CardFactory_Monthly_Sisters.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M1_Movement.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M2_Reactive.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M3_OpeningGambitBuff.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M4_Replace.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M5_Provoke.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M6_Forcefield.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M7_Warmasters.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M8_Rexx.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M9_Streamers.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M10_GeneralDamage.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M11_PennyArcade.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M12_OctoberMonthlies.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Monthly_M13_NovemberMonthlies.cardForIdentifier(identifier, gameSession)

    # misc

    if !card? then card = CardFactory_Generic.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Tiles.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Bosses.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Tutorial.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_Gauntlet_Specials.cardForIdentifier(identifier, gameSession)

    # bloodstorm
    if !card? then card = CardFactory_BloodstormSet_Faction1.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_BloodstormSet_Faction2.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_BloodstormSet_Faction3.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_BloodstormSet_Faction4.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_BloodstormSet_Faction5.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_BloodstormSet_Faction6.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_BloodstormSet_Neutral.cardForIdentifier(identifier, gameSession)

    # unity
    if !card? then card = CardFactory_UnitySet_Faction1.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_UnitySet_Faction2.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_UnitySet_Faction3.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_UnitySet_Faction4.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_UnitySet_Faction5.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_UnitySet_Faction6.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_UnitySet_Neutral.cardForIdentifier(identifier, gameSession)

    # wartech
    if !card? then card = CardFactory_WartechSet_Faction1.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_WartechSet_Faction2.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_WartechSet_Faction3.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_WartechSet_Faction4.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_WartechSet_Faction5.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_WartechSet_Faction6.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_WartechSet_Neutral.cardForIdentifier(identifier, gameSession)

    # coreshatter
    if !card? then card = CardFactory_CoreshatterSet_Faction1.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreshatterSet_Faction2.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreshatterSet_Faction3.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreshatterSet_Faction4.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreshatterSet_Faction5.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreshatterSet_Faction6.cardForIdentifier(identifier, gameSession)
    if !card? then card = CardFactory_CoreshatterSet_Neutral.cardForIdentifier(identifier, gameSession)

    if card?
      # set the card id to what was passed in
      # this ensures we preserve prismatic and skins
      card.id = cardId

      # apply skin as needed
      skinId = Cards.getCardSkinIdForCardId(cardId)
      if skinId?
        CosmeticsFactory.injectSkinPropertiesIntoCard(card, skinId)

      return card

  ###*
   * Returns one copy of every card, with optional filtering for faction, card type, and exclusion of hidden cards.
   * NOTE: this method is very expensive, so use the card caches whenever possible!
   * @param {GameSession} gameSession
   * @param {Number|String} [factionId=null]
   * @param {Number|String} [cardType=null]
   * @param {Boolean} [includeHidden=true] whether to include hidden cards
   * @param {Boolean} [includeGenerals=true] whether to include generals when the card is a unit card
   * @returns {Array}
   ###
  @getAllCards: (gameSession, factionId, cardType, includeHidden=true, includeGenerals=true) ->
    cards = []
    for groupName of Cards
      group = Cards[groupName]
      if _.isObject(group)
        for cardName of group
          identifier = group[cardName]
          card = @cardForIdentifier(identifier, gameSession)
          if card? and (!factionId? or card.getFactionId() == factionId) and (!cardType? or card.getType() == cardType) and (includeHidden or (!card.getIsHiddenInCollection() and card.getIsAvailable())) and (includeGenerals or !(card.getIsGeneral? && card.getIsGeneral()))
            cards.push(card)

    return cards

module.exports = CardFactory
