# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'
Unit = require 'app/sdk/entities/unit'
CardSet = require 'app/sdk/cards/cardSetLookup'
Artifact = require 'app/sdk/artifacts/artifact'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierIntensifyBuffSelf = require 'app/sdk/modifiers/modifierIntensifyBuffSelf'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierMyAttackWatchAreaAttack = require 'app/sdk/modifiers/modifierMyAttackWatchAreaAttack'
ModifierImmuneToDamageByWeakerEnemies = require 'app/sdk/modifiers/modifierImmuneToDamageByWeakerEnemies'
ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows = require 'app/sdk/modifiers/modifierMyOtherMinionsDamagedWatchDamagedMinionGrows'
ModifierGrow = require 'app/sdk/modifiers/modifierGrow'
ModifierOpeningGambitDamageEverything = require 'app/sdk/modifiers/modifierOpeningGambitDamageEverything'
ModifierStartsInHand = require 'app/sdk/modifiers/modifierStartsInHand'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierTakeDamageWatchOpponentDrawCard = require 'app/sdk/modifiers/modifierTakeDamageWatchOpponentDrawCard'
ModifierOnSummonFromHandApplyEmblems = require 'app/sdk/modifiers/modifierOnSummonFromHandApplyEmblems'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierFateMagmarBuffQuest = require 'app/sdk/modifiers/modifierFateMagmarBuffQuest'
ModifierCannotBeReplaced = require 'app/sdk/modifiers/modifierCannotBeReplaced'
ModifierIntensify = require 'app/sdk/modifiers/modifierIntensify'
ModifierCounterIntensify = require 'app/sdk/modifiers/modifierCounterIntensify'
ModifierCannotBeRemovedFromHand = require 'app/sdk/modifiers/modifierCannotBeRemovedFromHand'

PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchFromHandMagmarBuffQuest'

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellDamageNotKillMinion = require 'app/sdk/spells/spellDamageNotKillMinion'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellReggplicate = require 'app/sdk/spells/spellReggplicate'
SpellMarchOfTheBrontos = require 'app/sdk/spells/spellMarchOfTheBrontos'
SpellYellRealLoud = require 'app/sdk/spells/spellYellRealLoud'
SpellIntensifyHealMyGeneral = require 'app/sdk/spells/spellIntensifyHealMyGeneral'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreshatterSet_Faction5

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction5.Dinomancer)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Hatefurnace"
      card.setDescription("Trial: Cast 7 spells that cause a minion to gain +Attack.\nDestiny: Minions summoned from your action bar gain Rush and Frenzy.")
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Mythron
      emblemModifier = PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest.createContextObject([ModifierFirstBlood.createContextObject(), ModifierFrenzy.createContextObject()])
      emblemModifier.appliedName = "Spark of Hatred"
      emblemModifier.appliedDescription = "Minions summoned from your action bar have Rush and Frenzy."
      card.setInherentModifiersContextObjects([
        ModifierStartsInHand.createContextObject(),
        ModifierCannotBeReplaced.createContextObject(),
        ModifierOnSummonFromHandApplyEmblems.createContextObject([emblemModifier], true, false),
        ModifierFateMagmarBuffQuest.createContextObject(7),
        ModifierCannotBeRemovedFromHand.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierFirstBlood)
      card.addKeywordClassToInclude(ModifierFrenzy)
      card.setFXResource(["FX.Cards.Neutral.Ironclad"])
      card.setBoundingBoxWidth(130)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5DinomancerBreathing.name
        idle : RSX.f5DinomancerIdle.name
        walk : RSX.f5DinomancerRun.name
        attack : RSX.f5DinomancerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.7
        damage : RSX.f5DinomancerHit.name
        death : RSX.f5DinomancerDeath.name
      )


    if (identifier == Cards.Faction5.IncreasingDino)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction5
      card.name = "Angered Okkadok"
      card.setDescription("Intensify: This minion gains +1/+1.")
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierIntensifyBuffSelf.createContextObject(1,1,"Even More Angered")
        ModifierCounterIntensify.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.VineEntangler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_komodocharger_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ancientgrove_hit.audio
        attackDamage : RSX.sfx_f6_ancientgrove_attack_impact.audio
        death : RSX.sfx_f6_ancientgrove_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5PteryxBreathing.name
        idle : RSX.f5PteryxIdle.name
        walk : RSX.f5PteryxRun.name
        attack : RSX.f5PteryxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5PteryxHit.name
        death : RSX.f5PteryxDeath.name
      )

    if (identifier == Cards.Spell.IncreasingHeal)
      card = new SpellIntensifyHealMyGeneral(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.IncreasingHeal
      card.name = "Invigoration"
      card.setDescription("Intensify: Restore 3 Health to your General.")
      card.manaCost = 2
      card.healAmount = 3
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.None
      card.addKeywordClassToInclude(ModifierIntensify)
      card.setInherentModifiersContextObjects([ModifierCounterIntensify.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.Invigoration"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_lionheartblessing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconIncreasingHealthIdle.name
        active : RSX.iconIncreasingHealthActive.name
      )


    if (identifier == Cards.Faction5.Firebreather)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction5
      card.name = "Mortar-maw"
      card.setDescription("Ranged\nWhenever this minion attacks, it also damages enemies around its target.")
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierMyAttackWatchAreaAttack.createContextObject(),
        ModifierRanged.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Faction5.Firebreather"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_firespitter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firespitter_hit.audio
        attackDamage : RSX.sfx_neutral_firespitter_attack_impact.audio
        death : RSX.sfx_neutral_firespitter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5FireBreatherBreathing.name
        idle : RSX.f5FireBreatherIdle.name
        walk : RSX.f5FireBreatherRun.name
        attack : RSX.f5FireBreatherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f5FireBreatherHit.name
        death : RSX.f5FireBreatherDeath.name
      )

    if (identifier == Cards.Faction5.ToughDino)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction5
      card.name = "Beastclad Hunter"
      card.setDescription("Takes no damage from minions with less Attack.")
      card.atk = 3
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierImmuneToDamageByWeakerEnemies.createContextObject(false)])
      card.setFXResource(["FX.Cards.Neutral.RazorcragGolem"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_stormmetalgolem_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_stormmetalgolem_hit.audio
        attackDamage : RSX.sfx_neutral_stormmetalgolem_attack_impact.audio
        death : RSX.sfx_neutral_stormmetalgolem_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5OrphanAspectBreathing.name
        idle : RSX.f5OrphanAspectIdle.name
        walk : RSX.f5OrphanAspectRun.name
        attack : RSX.f5OrphanAspectAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5OrphanAspectHit.name
        death : RSX.f5OrphanAspectDeath.name
      )

    if (identifier == Cards.Faction5.Armadops)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction5
      card.name = "Oropsisaur"
      card.setDescription("Grow: +1/+1.\nWhenever another friendly minion with Grow survives damage, that minion grows.")
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows.createContextObject(),
        ModifierGrow.createContextObject(1)
      ])
      card.setFXResource(["FX.Cards.Neutral.ThornNeedler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5AnkylosBreathing.name
        idle : RSX.f5AnkylosIdle.name
        walk : RSX.f5AnkylosRun.name
        attack : RSX.f5AnkylosAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f5AnkylosHit.name
        death : RSX.f5AnkylosDeath.name
      )


    if (identifier == Cards.Faction5.BurstLizard)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Krater"
      card.setDescription("Opening Gambit: Deal 1 damage to everything (including itself).")
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageEverything.createContextObject(1, true)])
      card.setFXResource(["FX.Cards.Neutral.BlisteringSkorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
        walk : RSX.sfx_neutral_firestarter_impact.audio
        attack :  RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firestarter_hit.audio
        attackDamage : RSX.sfx_neutral_firestarter_impact.audio
        death : RSX.sfx_neutral_firestarter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5BurstLizardBreathing.name
        idle : RSX.f5BurstLizardIdle.name
        walk : RSX.f5BurstLizardRun.name
        attack : RSX.f5BurstLizardAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5BurstLizardHit.name
        death : RSX.f5BurstLizardDeath.name
      )

    if (identifier == Cards.Spell.Spaghettify)
      card = new SpellDamageNotKillMinion(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.Spaghettify
      card.name = "Deep Impact"
      card.setDescription("Deal damage to a minion to reduce its Health to 1.")
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = false
      card.setFXResource(["FX.Cards.Spell.DeepImpact"])
      card.setBaseAnimResource(
        idle : RSX.iconMeteorIdle.name
        active : RSX.iconMeteorActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_disintegrate.audio
      )

    if (identifier == Cards.Spell.BigTime)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.BigTime
      card.name = "Gargantuan Growth"
      card.setDescription("Give a minion, \"Grow: +8/+8.\"")
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = false
      card.setTargetModifiersContextObjects([ModifierGrow.createContextObject(8)])
      card.setFXResource(["FX.Cards.Spell.GargantuanGrowth"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBigTimeIdle.name
        active : RSX.iconBigTimeActive.name
      )

    if (identifier == Cards.Artifact.EggArmor)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction5
      card.id = Cards.Artifact.EggArmor
      card.name = "Zoetic Charm"
      card.setDescription("Your General has +1 Attack.\nYour Eggs have Forcefield.")
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.durability = 3
      eggs = [
        Cards.Faction5.Egg
      ]
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,undefined),
        Modifier.createContextObjectWithAuraForAllAllies([ModifierForcefield.createContextObject()], null, eggs)
      ])
      card.addKeywordClassToInclude(ModifierForcefield)
      card.setFXResource(["FX.Cards.Artifact.OblivionSickle"])
      card.setBaseAnimResource(
        idle: RSX.iconEggArmorIdle.name
        active: RSX.iconEggArmorActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.Reggplicate)
      card = new SpellReggplicate(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.Reggplicate
      card.name = "Mitotic Induction"
      card.setDescription("Summon an Egg of the minion most recently summoned from your action bar.")
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.SpawnSource
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.MitoticInduction"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_disintegrate.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconReggsplicateIdle.name
        active : RSX.iconReggsplicateActive.name
      )

    if (identifier == Cards.Faction5.Megabrontodon)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.setIsHiddenInCollection(true)
      card.name = "Katastrophosaurus"
      card.atk = 6
      card.maxHP = 26
      card.manaCost = 5
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.Khymera"])
      card.setBoundingBoxWidth(145)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_rook_hit.audio
        attack : RSX.sfx_neutral_khymera_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_khymera_hit.audio
        attackDamage : RSX.sfx_neutral_khymera_impact.audio
        death : RSX.sfx_neutral_khymera_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MegaBrontodonBreathing.name
        idle : RSX.f5MegaBrontodonIdle.name
        walk : RSX.f5MegaBrontodonRun.name
        attack : RSX.f5MegaBrontodonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.7
        damage : RSX.f5MegaBrontodonHit.name
        death : RSX.f5MegaBrontodonDeath.name
      )

    if (identifier == Cards.Spell.MarchOfTheBrontos)
      card = new SpellMarchOfTheBrontos(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.MarchOfTheBrontos
      card.name = "Extinction Event"
      card.setDescription("Each of your Eggs hatches into a Katastrophosaurus.")
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.ExtinctionEvent"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darktransformation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMarchBrontodonIdle.name
        active : RSX.iconMarchBrontodonActive.name
      )

    if (identifier == Cards.Spell.YellRealLoud)
      card = new SpellYellRealLoud(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.YellRealLoud
      card.name = "Bellow"
      card.setDescription("Give a friendly minion +3 Attack.\nStun enemy minions around it.")
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(3,0)
      statContextObject.appliedName = "Yelled Real Loud"
      card.setTargetModifiersContextObjects([
        statContextObject
      ])
      card.addKeywordClassToInclude(ModifierStun)
      card.setFXResource(["FX.Cards.Spell.Bellow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_windstopper_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconYellLoudIdle.name
        active : RSX.iconYellLoudActive.name
      )

    if (identifier == Cards.Faction5.BrundlBeast)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Haruspex"
      card.setDescription("Whenever this minion takes damage, your opponent draws a card.")
      card.atk = 7
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierTakeDamageWatchOpponentDrawCard.createContextObject()])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.CelestialPhantom"])
      card.setBaseSoundResource(
        apply: RSX.sfx_spell_deathstrikeseal.audio
        walk: RSX.sfx_singe2.audio
        attack: RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage: RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage: RSX.sfx_f2_celestialphantom_attack_impact.audio
        death: RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing: RSX.f5BrundlebeastBreathing.name
        idle: RSX.f5BrundlebeastIdle.name
        walk: RSX.f5BrundlebeastRun.name
        attack: RSX.f5BrundlebeastAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage: RSX.f5BrundlebeastHit.name
        death: RSX.f5BrundlebeastDeath.name
      )

    return card

module.exports = CardFactory_CoreshatterSet_Faction5
