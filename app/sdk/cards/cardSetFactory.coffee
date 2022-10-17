CardSet = require './cardSetLookup'
i18next = require 'i18next'

defaultOrbGoldCost = 50
defaultFullSetSpiritCost = 5000 # 2.5-22.6% discount

class CardSetFactory
  @setMap: {}

  @cardSetForIdentifier: (identifier) ->
    return CardSetFactory.setMap[identifier]

  @cardSetForDevName: (devName) ->
    for cardSetId,cardSetData of CardSetFactory.setMap
      if cardSetData.devName == devName
        return cardSetData

    return null

# generate sets once in a map
smap = CardSetFactory.setMap

# core
smap[CardSet.Core] =
  id: CardSet.Core,
  title: i18next.t("card_sets.core_set_name"),
  name: i18next.t("card_sets.core_set_name_short"),
  devName: "core",
  enabled: true
  orbGoldCost: defaultOrbGoldCost
  cardSetUrl: "https://cards.duelyst.com/core-set"

# bloodborn
smap[CardSet.Bloodborn] =
  id: CardSet.Bloodborn,
  title: i18next.t("card_sets.bloodborn_set_name"),
  name: i18next.t("card_sets.bloodborn_set_name_short"),
  devName: "bloodborn",
  enabled: false
  orbGoldCost: defaultOrbGoldCost
  isUnlockableThroughOrbs: true
  numOrbsToCompleteSet: 13
  orbGoldRefund: 300 # If a player buys a complete set this is what they get back per orb already purchased
  fullSetSpiritCost: defaultFullSetSpiritCost # Individual cost is 6460.
  orbSpiritRefund: 300
  cardSetUrl: "https://cards.duelyst.com/rise-of-the-bloodborn"

# unity
smap[CardSet.Unity] =
  id: CardSet.Unity,
  title: i18next.t("card_sets.ancient_bonds_set_name"),
  name: i18next.t("card_sets.ancient_bonds_set_name_short"),
  devName: "unity",
  enabled: true
  orbGoldCost: defaultOrbGoldCost
  isUnlockableThroughOrbs: true
  numOrbsToCompleteSet: 13
  fullSetSpiritCost: defaultFullSetSpiritCost # Individual cost is 5130.
  orbGoldRefund: 300 # If a player buys a complete set this is what they get back per orb already purchased
  cardSetUrl: "https://cards.duelyst.com/ancient-bonds"

# gauntlet specials
smap[CardSet.GauntletSpecial] =
  id: CardSet.Unity,
  name: "Gauntlet Specials",
  devName: "gauntlet_special",
  title: "Gauntlet Specials",
  enabled: true

# first watch
smap[CardSet.FirstWatch] =
  id: CardSet.FirstWatch,
  name: i18next.t("card_sets.firstwatch_set_name_short"),
  devName: "firstwatch",
  title: i18next.t("card_sets.firstwatch_set_name"),
  enabled: true,
  orbGoldCost: defaultOrbGoldCost,
  cardSetUrl: "https://cards.duelyst.com/unearthed-prophecy"

# wartech
smap[CardSet.Wartech] =
  id: CardSet.Wartech,
  name: "Immortal",
  devName: "wartech",
  title: "Immortal Vanguard",
  orbGoldCost: defaultOrbGoldCost,
  enabled: true,
  isPreRelease: false, # allows users seeing orbs and receiving them, but disables purchasing for gold and opening them
  cardSetUrl: "https://cards.duelyst.com/immortal-vanguard"

# shimzar
smap[CardSet.Shimzar] =
  id: CardSet.Shimzar,
  title: i18next.t("card_sets.shimzar_set_name"),
  name: i18next.t("card_sets.shimzar_set_name_short"),
  devName: "shimzar",
  enabled: true
  orbGoldCost: defaultOrbGoldCost
  cardSetUrl: "https://cards.duelyst.com/denizens-of-shimzar"

smap[CardSet.CombinedUnlockables] =
  id: CardSet.CombinedUnlockables,
  title: i18next.t("card_sets.combined_unlockables_set_name"),
  name: i18next.t("card_sets.combined_unlockables_set_name_short"),
  devName: "combined_unlockables",
  enabled: true
  orbGoldCost: defaultOrbGoldCost
  cardSetUrl: "https://cards.duelyst.com/ancient-bonds"

# coreshatter
smap[CardSet.Coreshatter] =
  id: CardSet.Coreshatter,
  name: "Mythron",
  devName: "coreshatter",
  title: "Trials of Mythron",
  orbGoldCost: defaultOrbGoldCost,
  enabled: true
  cardSetUrl: "https://cards.duelyst.com/trials-of-mythron"

module.exports = CardSetFactory
