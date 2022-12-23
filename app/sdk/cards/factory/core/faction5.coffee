# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
config = require('config/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Unit = require 'app/sdk/entities/unit'
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellApplyPlayerModifiers = require 'app/sdk/spells/spellApplyPlayerModifiers'
SpellLavastorm = require 'app/sdk/spells/spellLavastorm'
SpellChrysalisBloom = require 'app/sdk/spells/spellChrysalisBloom'
SpellNaturalSelection = require 'app/sdk/spells/spellNaturalSelection'
SpellHealYourGeneral = require 'app/sdk/spells/spellHealYourGeneral'
SpellApplyModifiersToDamagedMinion = require 'app/sdk/spells/spellApplyModifiersToDamagedMinion'
SpellMindSteal = require 'app/sdk/spells/spellMindSteal'
SpellEggMorph = require 'app/sdk/spells/spellEggMorph'
SpellDamageAndApplyModifiers = require 'app/sdk/spells/spellDamageAndApplyModifiers'
SpellTempTransform = require 'app/sdk/spells/spellTempTransform'
SpellSeekingEye = require 'app/sdk/spells/spellSeekingEye'
SpellApplyModifiersToGeneral = require 'app/sdk/spells/spellApplyModifiersToGeneral'
SpellSpawnEntityNearbyGeneral = require 'app/sdk/spells/spellSpawnEntityNearbyGeneral'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierOpeningGambitDamageMyGeneral = require 'app/sdk/modifiers/modifierOpeningGambitDamageMyGeneral'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierGrow = require 'app/sdk/modifiers/modifierGrow'
ModifierRebirth = require 'app/sdk/modifiers/modifierRebirth'
ModifierEndTurnWatchSpawnEgg = require 'app/sdk/modifiers/modifierEndTurnWatchSpawnEgg'
ModifierEndTurnWatchDamageAllMinions = require 'app/sdk/modifiers/modifierEndTurnWatchDamageAllMinions'
ModifierStartTurnWatchDamageRandom = require 'app/sdk/modifiers/modifierStartTurnWatchDamageRandom'
ModifierMyMinionOrGeneralDamagedWatchBuffSelf = require 'app/sdk/modifiers/modifierMyMinionOrGeneralDamagedWatchBuffSelf'
ModifierReduceCostOfMinionsAndDamageThem = require 'app/sdk/modifiers/modifierReduceCostOfMinionsAndDamageThem'
ModifierCannotStrikeback = require 'app/sdk/modifiers/modifierCannotStrikeback'
ModifierOpeningGambitApplyModifiersRandomly = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersRandomly'
ModifierImmuneToSpellDamage = require 'app/sdk/modifiers/modifierImmuneToSpellDamage'
ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarByOpeningGambitBuffSelf'
ModifierOpeningGambitHealBothGenerals = require 'app/sdk/modifiers/modifierOpeningGambitHealBothGenerals'
ModifierOpponentDrawCardWatchBuffSelf = require 'app/sdk/modifiers/modifierOpponentDrawCardWatchBuffSelf'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierFlashReincarnation = require 'app/sdk/playerModifiers/playerModifierFlashReincarnation'
PlayerModifierMyDeathwatchDrawCard = require 'app/sdk/playerModifiers/playerModifierMyDeathwatchDrawCard'

WartechGeneralFaction5Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction5Achievement'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreSet_Faction5

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction5.General)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_vaath_name")
      card.setDescription(i18next.t("cards.faction_5_unit_vaath_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(110)
      card.setBoundingBoxHeight(100)
      card.setPortraitResource(RSX.general_portrait_image_f5)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f5)
      card.setSpeechResource(RSX.speech_portrait_magmar)
      card.setConceptResource(RSX.general_f5)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_magmar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_magmar_2nd)
      card.setFXResource(["FX.Cards.Faction5.General"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f5_general_attack_swing.audio
        receiveDamage : RSX.sfx_f5_general_hit.audio
        attackDamage : RSX.sfx_f5_general_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5GeneralBreathing.name
        idle : RSX.f5GeneralIdle.name
        walk : RSX.f5GeneralRun.name
        attack : RSX.f5GeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.65
        damage : RSX.f5GeneralDamage.name
        death : RSX.f5GeneralDeath.name
        castStart : RSX.f5GeneralCastStart.name
        castEnd : RSX.f5GeneralCastEnd.name
        castLoop : RSX.f5GeneralCastLoop.name
        cast : RSX.f5GeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.Overload}

    if (identifier == Cards.Faction5.AltGeneral)
      card = new Unit(gameSession)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_starhorn_name")
      card.setDescription(i18next.t("cards.faction_5_unit_starhorn_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(110)
      card.setBoundingBoxHeight(105)
      card.setPortraitResource(RSX.general_portrait_image_f5alt)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f5Alt1)
      card.setSpeechResource(RSX.speech_portrait_magmaralt)
      card.setConceptResource(RSX.general_f5alt)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_magmar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_magmar_2nd)
      card.setFXResource(["FX.Cards.Faction5.Starhorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_f5_kolossus_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5AltGeneralBreathing.name
        idle : RSX.f5AltGeneralIdle.name
        walk : RSX.f5AltGeneralRun.name
        attack : RSX.f5AltGeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f5AltGeneralHit.name
        death : RSX.f5AltGeneralDeath.name
        castStart : RSX.f5AltGeneralCastStart.name
        castEnd : RSX.f5AltGeneralCastEnd.name
        castLoop : RSX.f5AltGeneralCastLoop.name
        cast : RSX.f5AltGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.SeekingEye}

    if (identifier == Cards.Faction5.ThirdGeneral)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableWithAchievement(true)
        card.setIsUnlockedWithAchievementId(WartechGeneralFaction5Achievement.id)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_ragnora_name")
      card.setDescription(i18next.t("cards.faction_5_unit_ragnora_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(110)
      card.setBoundingBoxHeight(105)
      card.setPortraitResource(RSX.general_portrait_image_f5)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f5Third)
      card.setSpeechResource(RSX.speech_portrait_magmarthird)
      card.setConceptResource(RSX.general_f5third)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_magmar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_magmar_2nd)
      card.setFXResource(["FX.Cards.Faction5.Starhorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_f5_kolossus_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5ThirdGeneralBreathing.name
        idle : RSX.f5ThirdGeneralIdle.name
        walk : RSX.f5ThirdGeneralRun.name
        attack : RSX.f5ThirdGeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f5ThirdGeneralHit.name
        death : RSX.f5ThirdGeneralDeath.name
        castStart : RSX.f5ThirdGeneralCastStart.name
        castEnd : RSX.f5ThirdGeneralCastEnd.name
        castLoop : RSX.f5ThirdGeneralCastLoop.name
        cast : RSX.f5ThirdGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.EggBBS}

    if (identifier == Cards.Faction5.EarthWalker)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_earth_walker_name")
      card.setDescription(i18next.t("cards.faction_5_unit_earth_walker_desc"))
      card.setFXResource(["FX.Cards.Faction5.EarthWalker"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_earthwalker_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_earthwalker_hit.audio
        attackDamage : RSX.sfx_neutral_earthwalker_attack_impact.audio
        death : RSX.sfx_neutral_earthwalker_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5EarthwalkerBreathing.name
        idle : RSX.f5EarthwalkerIdle.name
        walk : RSX.f5EarthwalkerRun.name
        attack : RSX.f5EarthwalkerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f5EarthwalkerDamage.name
        death : RSX.f5EarthwalkerDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierGrow.createContextObject(1)])

    if (identifier == Cards.Faction5.Grimrock)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_grimrock_name")
      card.setDescription(i18next.t("cards.faction_5_unit_grimrock_desc"))
      card.setFXResource(["FX.Cards.Faction5.Grimrock"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5GrimrockBreathing.name
        idle : RSX.f5GrimrockIdle.name
        walk : RSX.f5GrimrockRun.name
        attack : RSX.f5GrimrockAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f5GrimrockDamage.name
        death : RSX.f5GrimrockDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierGrow.createContextObject(2)])

    if (identifier == Cards.Faction5.Kolossus)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_kolossus_name")
      card.setDescription(i18next.t("cards.faction_5_unit_kolossus_desc"))
      card.setFXResource(["FX.Cards.Faction5.Kolossus"])
      card.setBoundingBoxWidth(120)
      card.setBoundingBoxHeight(115)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_jaxtruesight_attack_impact.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f5_kolossus_attack_swing.audio
        receiveDamage : RSX.sfx_f5_kolossus_hit.audio
        attackDamage : RSX.sfx_f5_kolossus_attack_impact.audio
        death : RSX.sfx_f5_kolossus_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5KolossusBreathing.name
        idle : RSX.f5KolossusIdle.name
        walk : RSX.f5KolossusRun.name
        attack : RSX.f5KolossusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5KolossusDamage.name
        death : RSX.f5KolossusDeath.name
      )
      card.atk = 1
      card.maxHP = 7
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierGrow.createContextObject(4)])

    if (identifier == Cards.Faction5.MakantorWarbeast)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_makantor_warbeast_name")
      card.setDescription(i18next.t("cards.faction_5_unit_makantor_warbeast_desc"))
      card.setFXResource(["FX.Cards.Faction5.MakantorWarbeast"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(70)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_jaxtruesight_attack_impact.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_makantorwarbeast_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MakantorWarbeastBreathing.name
        idle : RSX.f5MakantorWarbeastIdle.name
        walk : RSX.f5MakantorWarbeastRun.name
        attack : RSX.f5MakantorWarbeastAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f5MakantorWarbeastDamage.name
        death : RSX.f5MakantorWarbeastDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierFrenzy.createContextObject(), ModifierFirstBlood.createContextObject()])

    if (identifier == Cards.Faction5.Phalanxar)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_phalanxar_name")
      card.setFXResource(["FX.Cards.Faction5.Phalanxar"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(110)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_hailstonehowler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5TankBreathing.name
        idle : RSX.f5TankIdle.name
        walk : RSX.f5TankRun.name
        attack : RSX.f5TankAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f5TankDamage.name
        death : RSX.f5TankDeath.name
      )
      card.atk = 6
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Faction5.Elucidator)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_elucidator_name")
      card.setDescription(i18next.t("cards.faction_5_unit_elucidator_desc"))
      card.setFXResource(["FX.Cards.Faction5.Elucidator"])
      card.setBoundingBoxWidth(115)
      card.setBoundingBoxHeight(60)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_oserix_attack_swing.audio
        receiveDamage : RSX.sfx_f1_oserix_hit.audio
        attackDamage : RSX.sfx_f1_oserix_attack_impact.audio
        death : RSX.sfx_f1_oserix_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5SupportBreathing.name
        idle : RSX.f5SupportIdle.name
        walk : RSX.f5SupportRun.name
        attack : RSX.f5SupportAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f5SupportDamage.name
        death : RSX.f5SupportDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageMyGeneral.createContextObject(4), ModifierFirstBlood.createContextObject()])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Faction5.UnstableLeviathan)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_unstable_leviathan_name")
      card.setDescription(i18next.t("cards.faction_5_unit_unstable_leviathan_desc"))
      card.setFXResource(["FX.Cards.Faction5.UnstableLeviathan"])
      card.setBoundingBoxWidth(115)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_jaxtruesight_attack_impact.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f5_unstableleviathan_attack_swing.audio
        receiveDamage : RSX.sfx_f5_unstableleviathan_hit.audio
        attackDamage : RSX.sfx_f5_unstableleviathan_attack_impact.audio
        death : RSX.sfx_f5_unstableleviathan_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5UnstableLeviathanBreathing.name
        idle : RSX.f5UnstableLeviathanIdle.name
        walk : RSX.f5UnstableLeviathanRun.name
        attack : RSX.f5UnstableLeviathanAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5UnstableLeviathanDamage.name
        death : RSX.f5UnstableLeviathanDeath.name
      )
      card.atk = 11
      card.maxHP = 11
      card.manaCost = 7
      card.setInherentModifiersContextObjects([ModifierStartTurnWatchDamageRandom.createContextObject(4)])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Faction5.Kujata)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_kujata_name")
      card.setDescription(i18next.t("cards.faction_5_unit_kujata_desc"))
      card.setFXResource(["FX.Cards.Faction5.Kujata"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(65)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f5_kujata_attack_swing.audio
        receiveDamage : RSX.sfx_f5_kujata_hit.audio
        attackDamage : RSX.sfx_f5_kujata_attack_impact.audio
        death : RSX.sfx_f5_kujata_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5KujataBreathing.name
        idle : RSX.f5KujataIdle.name
        walk : RSX.f5KujataRun.name
        attack : RSX.f5KujataAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f5KujataDamage.name
        death : RSX.f5KujataDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierReduceCostOfMinionsAndDamageThem.createContextObject(1, 1)
      ])

    if (identifier == Cards.Faction5.PrimordialGazer)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.name = i18next.t("cards.faction_5_unit_primordial_gazer_name")
      card.setDescription(i18next.t("cards.faction_5_unit_primordial_gazer_desc"))
      card.setFXResource(["FX.Cards.Faction5.PrimordialGazer"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_primordialgazer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_primordialgazer_hit.audio
        attackDamage : RSX.sfx_neutral_primordialgazer_attack_impact.audio
        death : RSX.sfx_neutral_primordialgazer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5PrimordialGazerBreathing.name
        idle : RSX.f5PrimordialGazerIdle.name
        walk : RSX.f5PrimordialGazerRun.name
        attack : RSX.f5PrimordialGazerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5PrimordialGazerDamage.name
        death : RSX.f5PrimordialGazerDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(2,2)
      statContextObject.appliedName = i18next.t("modifiers.faction_5_followup_primordial_gazer_2")
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          spellFilterType: SpellFilterType.AllyDirect
          targetModifiersContextObjects: [
            statContextObject
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Faction5.Egg)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_5_unit_egg_name")
      card.setFXResource(["FX.Cards.Faction5.Egg"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(70)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_coiledcrawler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_coiledcrawler_hit.audio
        attackDamage : RSX.sfx_neutral_coiledcrawler_attack_impact.audio
        death : RSX.sfx_neutral_coiledcrawler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MagmarEggBreathing.name
        idle : RSX.f5MagmarEggIdle.name
        walk : RSX.f5MagmarEggIdle.name
        attack : RSX.f5MagmarEggAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f5MagmarEggDamage.name
        death : RSX.f5MagmarEggDeath.name
      )
      card.atk = 0
      card.maxHP = 1
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setSpeed(0)
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction5.YoungSilithar)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_young_silithar_name")
      card.setDescription(i18next.t("cards.faction_5_unit_young_silithar_desc"))
      card.setFXResource(["FX.Cards.Faction5.YoungSilithar"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(45)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_komodocharger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_komodocharger_hit.audio
        attackDamage : RSX.sfx_neutral_komodocharger_attack_impact.audio
        death : RSX.sfx_neutral_komodocharger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5YoungSilitharBreathing.name
        idle : RSX.f5YoungSilitharIdle.name
        walk : RSX.f5YoungSilitharRun.name
        attack : RSX.f5YoungSilitharAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f5YoungSilitharDamage.name
        death : RSX.f5YoungSilitharDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierRebirth.createContextObject()])

    if (identifier == Cards.Faction5.VeteranSilithar)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_veteran_silithar_name")
      card.setDescription(i18next.t("cards.faction_5_unit_veteran_silithar_desc"))
      card.setFXResource(["FX.Cards.Faction5.VeteranSilithar"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_silitharveteran_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5VeteranSilitharBreathing.name
        idle : RSX.f5VeteranSilitharIdle.name
        walk : RSX.f5VeteranSilitharRun.name
        attack : RSX.f5VeteranSilitharAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5VeteranSilitharDamage.name
        death : RSX.f5VeteranSilitharDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierRebirth.createContextObject()])

    if (identifier == Cards.Faction5.SilitharElder)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_silithar_elder_name")
      card.setDescription(i18next.t("cards.faction_5_unit_silithar_elder_desc"))
      card.setFXResource(["FX.Cards.Faction5.SilitharElder"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f5_silitharelder_attack_swing.audio
        receiveDamage : RSX.sfx_f5_silitharelder_hit.audio
        attackDamage : RSX.sfx_f5_silitharelder_attack_impact.audio
        death : RSX.sfx_f5_silitharelder_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5ElderSilitharBreathing.name
        idle : RSX.f5ElderSilitharIdle.name
        walk : RSX.f5ElderSilitharRun.name
        attack : RSX.f5ElderSilitharAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f5ElderSilitharDamage.name
        death : RSX.f5ElderSilitharDeath.name
      )
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierRebirth.createContextObject(), ModifierEndTurnWatchSpawnEgg.createContextObject("a Silithar Elder Egg")])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction5.SpiritHarvester)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_spirit_harvester_name")
      card.setDescription(i18next.t("cards.faction_5_unit_spirit_harvester_desc"))
      card.setFXResource(["FX.Cards.Faction5.SpiritHarvester"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_shieldoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_serpenti_hit.audio
        attackDamage : RSX.sfx_f5_vindicator_attack_impact.audio
        death : RSX.sfx_f5_vindicator_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5SpiritHarvestorBreathing.name
        idle : RSX.f5SpiritHarvestorIdle.name
        walk : RSX.f5SpiritHarvestorRun.name
        attack : RSX.f5SpiritHarvestorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.7
        damage : RSX.f5SpiritHarvestorDamage.name
        death : RSX.f5SpiritHarvestorDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierEndTurnWatchDamageAllMinions.createContextObject(1, CONFIG.WHOLE_BOARD_RADIUS)])

    if (identifier == Cards.Faction5.MiniMagmar)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_5_unit_magma_name")
      card.setFXResource(["FX.Cards.Faction5.MiniMagmar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_primordialgazer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_serpenti_hit.audio
        attackDamage : RSX.sfx_f5_vindicator_attack_impact.audio
        death : RSX.sfx_f5_vindicator_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MagmaBreathing.name
        idle : RSX.f5MagmaIdle.name
        walk : RSX.f5MagmaRun.name
        attack : RSX.f5MagmaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f5MagmaDamage.name
        death : RSX.f5MagmaDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction5.Vindicator)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_vindicator_name")
      card.setDescription(i18next.t("cards.faction_5_unit_vindicator_desc"))
      card.setFXResource(["FX.Cards.Faction5.Vindicator"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f5_vindicator_attack_swing.audio
        receiveDamage : RSX.sfx_f5_vindicator_hit.audio
        attackDamage : RSX.sfx_f5_vindicator_attack_impact.audio
        death : RSX.sfx_f5_vindicator_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5VindicatorBreathing.name
        idle : RSX.f5VindicatorIdle.name
        walk : RSX.f5VindicatorRun.name
        attack : RSX.f5VindicatorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.5
        damage : RSX.f5VindicatorDamage.name
        death : RSX.f5VindicatorDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpponentDrawCardWatchBuffSelf.createContextObject(2,2)
      ])

    if (identifier == Cards.Spell.Overload)
      card = new SpellApplyModifiersToGeneral(gameSession)
      card.factionId = Factions.Faction5
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Overload
      card.name = i18next.t("cards.faction_5_spell_overload_name")
      card.setDescription(i18next.t("cards.faction_5_spell_overload_description"))
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.None
      card.applyToOwnGeneral = true
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(1)
      statContextObject.appliedName = i18next.t("modifiers.faction_5_spell_overload_1")
      card.setTargetModifiersContextObjects([
        statContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Overload"])
      card.setBaseSoundResource(
        apply : RSX.sfx_division_crest_outline_reveal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconOverloadIdle.name
        active : RSX.iconOverloadActive.name
      )

    if (identifier == Cards.Spell.SeekingEye)
      card = new SpellSeekingEye(gameSession)
      card.factionId = Factions.Faction5
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SeekingEye
      card.name = i18next.t("cards.faction_5_spell_seeking_eye_name")
      card.setDescription(i18next.t("cards.faction_5_spell_seeking_eye_description"))
      card.manaCost = 1
      card.setFXResource(["FX.Cards.Spell.SeekingEye"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_nethersummoning.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSeekingEyeIdle.name
        active : RSX.iconSeekingEyeActive.name
      )

    if (identifier == Cards.Spell.EggBBS)
      card = new SpellSpawnEntityNearbyGeneral(gameSession)
      card.factionId = Factions.Faction5
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.EggBBS
      card.name = i18next.t("cards.faction_5_spell_propogate_rage_name")
      card.setDescription(i18next.t("cards.faction_5_spell_propogate_rage_desc"))
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.None
      gibblegupEgg = {id: Cards.Faction5.Egg}
      gibblegupEgg.additionalInherentModifiersContextObjects = [ModifierEgg.createContextObject({id: Cards.Faction5.Gibblegup}, i18next.t("cards.faction_5_unit_ripper_name"))]
      card.cardDataOrIndexToSpawn = gibblegupEgg
      card.filterNearGeneral = true
      card.setFXResource(["FX.Cards.Spell.EggBBS"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_boneswarm.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPropogateRageIdle.name
        active : RSX.iconPropogateRageActive.name
      )

    if (identifier == Cards.Faction5.Gibblegup)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_ripper_name")
      card.setDescription(i18next.t("cards.faction_5_unit_ripper_desc"))
      card.setIsHiddenInCollection(true)
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 1
      card.setInherentModifiersContextObjects([
        ModifierRebirth.createContextObject(),
        ModifierTranscendance.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Faction5.MiniMagmar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_primordialgazer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_serpenti_hit.audio
        attackDamage : RSX.sfx_f5_vindicator_attack_impact.audio
        death : RSX.sfx_f5_vindicator_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5RipperBreathing.name
        idle : RSX.f5RipperIdle.name
        walk : RSX.f5RipperRun.name
        attack : RSX.f5RipperAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f5RipperHit.name
        death : RSX.f5RipperDeath.name
      )
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Spell.FractalReplication)
      card = new Spell(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.FractalReplication
      card.name = i18next.t("cards.faction_5_spell_fractal_replication_name")
      card.setDescription(i18next.t("cards.faction_5_spell_fractal_replication_description"))
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity
      },{
        id: Cards.Spell.CloneSourceEntity
      }])
      card.setFXResource(["FX.Spell.FireTornado","FX.Cards.Spell.FractalReplication"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFractalReplicationIdle.name
        active : RSX.iconFractalReplicationActive.name
      )

    if (identifier == Cards.Spell.DampeningWave)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction5
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.DampeningWave
      card.name = i18next.t("cards.faction_5_spell_dampening_wave_name")
      card.setDescription(i18next.t("cards.faction_5_spell_dampening_wave_description"))
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.manaCost = 0
      card.rarityId = Rarity.Fixed
      card.setTargetModifiersContextObjects([ModifierCannotStrikeback.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.DampeningWave"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_drainmorale.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDampeningWaveIdle.name
        active : RSX.iconDampeningWaveActive.name
      )

    if (identifier == Cards.Spell.FlashReincarnation)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.FlashReincarnation
      card.name = i18next.t("cards.faction_5_spell_flash_reincarnation_name")
      card.setDescription(i18next.t("cards.faction_5_spell_flash_reincarnation_description"))
      card.manaCost = 0
      card.rarityId = Rarity.Rare
      card.applyToOwnGeneral = true
      manaModifierContextObject = PlayerModifierFlashReincarnation.createCostChangeContextObject(-2, CardType.Unit)
      manaModifierContextObject.durationEndTurn = 1
      card.setTargetModifiersContextObjects([manaModifierContextObject])
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.FlashReincarnation"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFlashReincarnationIdle.name
        active : RSX.iconFlashReincarnationActive.name
      )

    if (identifier == Cards.Spell.DiretideFrenzy)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_spell_diretide_frenzy_name")
      card.setDescription(i18next.t("cards.faction_5_spell_diretide_frenzy_description"))
      card.id = Cards.Spell.DiretideFrenzy
      card.addKeywordClassToInclude(ModifierFrenzy)
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,0)
      attackBuffContextObject.appliedName = i18next.t("modifiers.faction_5_spell_diretide_frenzy_1")
      card.setTargetModifiersContextObjects([attackBuffContextObject,ModifierFrenzy.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.DiretideFrenzy"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDiretideFrenzyIdle.name
        active : RSX.iconDiretideFrenzyActive.name
      )

    if (identifier == Cards.Spell.Tremor)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.Tremor
      card.name = i18next.t("cards.faction_5_spell_tremor_name")
      card.setDescription(i18next.t("cards.faction_5_spell_tremor_description"))
      card.addKeywordClassToInclude(ModifierStun)
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.setTargetModifiersContextObjects([ModifierStunned.createContextObject()])
      card.setAffectPattern(CONFIG.PATTERN_2X2)
      card.setFXResource(["FX.Cards.Spell.Tremor"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_disintegrate.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTremorIdle.name
        active : RSX.iconTremorActive.name
      )

    if (identifier == Cards.Spell.DanceOfDreams)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Faction5
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.DanceOfDreams
      card.name = i18next.t("cards.faction_5_spell_dance_of_dreams_name")
      card.setDescription(i18next.t("cards.faction_5_spell_dance_of_dreams_description"))
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.applyToOwnGeneral = true
      customContextObject = PlayerModifierMyDeathwatchDrawCard.createContextObject()
      card.setTargetModifiersContextObjects([customContextObject])
      card.setFXResource(["FX.Cards.Spell.DanceOfDreams"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manaburn.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconManaBurnIdle.name
        active : RSX.iconManaBurnActive.name
      )

    if (identifier == Cards.Spell.GreaterFortitude)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.GreaterFortitude
      card.name = i18next.t("cards.faction_5_spell_greater_fortitude_name")
      card.setDescription(i18next.t("cards.faction_5_spell_greater_fortitude_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.AllyDirect
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(2,2)
      statContextObject.appliedName = i18next.t("modifiers.faction_5_spell_greater_fortitude_1")
      card.setTargetModifiersContextObjects([
        statContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.GreaterFortitude"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconGreaterFortitudeIdle.name
        active : RSX.iconGreaterFortitudeActive.name
      )

    if (identifier == Cards.Spell.EarthSphere)
      card = new SpellHealYourGeneral(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.EarthSphere
      card.name = i18next.t("cards.faction_5_spell_earth_sphere_name")
      card.setDescription(i18next.t("cards.faction_5_spell_earth_sphere_description"))
      card.manaCost = 4
      card.healModifier = 8
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.EarthSphere"])
      card.setBaseAnimResource(
        idle : RSX.iconEarthSphereIdle.name
        active : RSX.iconEarthSphereActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_spelljammer_attack_swing.audio
      )

    if (identifier == Cards.Spell.BoundedLifeforce)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.BoundedLifeforce
      card.name = i18next.t("cards.faction_5_spell_bounded_lifeforce_name")
      card.setDescription(i18next.t("cards.faction_5_spell_bounded_lifeforce_description"))
      card.manaCost = 7
      card.rarityId = Rarity.Epic
      card.applyToOwnGeneral = true
      card.spellFilterType = SpellFilterType.None
      customContextObject = Modifier.createContextObjectWithRebasedAttributeBuffs(10, 10)
      customContextObject.appliedName = i18next.t("cards.faction_5_spell_bounded_lifeforce_name")
      customContextObject.appliedDescription = i18next.t("modifiers.faction_5_spell_bounded_lifeforce_1")
      customContextObject.isRemovable = false
      card.setTargetModifiersContextObjects([customContextObject])
      card.setFXResource(["FX.Cards.Spell.BoundedLifeforce"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_boundedlifeforce.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBoundedLifeforceIdle.name
        active : RSX.iconBoundedLifeforceActive.name
      )

    if (identifier == Cards.Spell.Amplification)
      card = new SpellApplyModifiersToDamagedMinion(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.Amplification
      card.name = i18next.t("cards.faction_5_spell_amplification_name")
      card.setDescription(i18next.t("cards.faction_5_spell_amplification_description"))
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(2,4)
      statContextObject.appliedName = i18next.t("modifiers.faction_5_spell_amplification_1")
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setTargetModifiersContextObjects([ statContextObject ])
      card.setFXResource(["FX.Cards.Spell.Amplification"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAmplificationIdle.name
        active : RSX.iconAmplificationActive.name
      )

    if (identifier == Cards.Spell.Metamorphosis)
      card = new SpellTempTransform(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.Metamorphosis
      card.name = i18next.t("cards.faction_5_spell_metamorphosis_name")
      card.setDescription(i18next.t("cards.faction_5_spell_metamorphosis_description"))
      card.manaCost = 6
      card.durationEndTurn = 2
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.cardDataOrIndexToSpawn = {id: Cards.Faction5.MiniMagmar}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.Metamorphosis"])
      card.setBaseAnimResource(
        idle : RSX.iconMetamorphosisIdle.name
        active : RSX.iconMetamorphosisActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_hit.audio
      )

    if (identifier == Cards.Spell.PlasmaStorm)
      card = new SpellLavastorm(gameSession)
      card.factionId = Factions.Faction5
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.PlasmaStorm
      card.name = i18next.t("cards.faction_5_spell_plasma_storm_name")
      card.setDescription(i18next.t("cards.faction_5_spell_plasma_storm_description"))
      card.minAttackValue = 4
      card.manaCost = 5
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.None
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.PlasmaStorm"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_a.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPlasmaStormIdle.name
        active : RSX.iconPlasmaStormActive.name
      )

    if (identifier == Cards.Spell.ChrysalisBloom)
      card = new SpellChrysalisBloom(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_spell_chrysalis_burst_name")
      card.setDescription(i18next.t("cards.faction_5_spell_chrysalis_burst_description"))
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.ChrysalisBurst"])
      card.setBaseAnimResource(
        idle : RSX.iconChrysalisBurstIdle.name
        active : RSX.iconChrysalisBurstActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_death.audio
      )

    if (identifier == Cards.Spell.NaturalSelection)
      card = new SpellNaturalSelection(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.NaturalSelection
      card.name = i18next.t("cards.faction_5_spell_natural_selection_name")
      card.setDescription(i18next.t("cards.faction_5_spell_natural_selection_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.setFXResource(["FX.Cards.Spell.NaturalSelection"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconNaturalSelectionIdle.name
        active : RSX.iconNaturalSelectionActive.name
      )

    if (identifier == Cards.Spell.MindSteal)
      card = new SpellMindSteal(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.MindSteal
      card.name = i18next.t("cards.faction_5_spell_mind_steal_name")
      card.setDescription(i18next.t("cards.faction_5_spell_mind_steal_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.MindSteal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMindStealIdle.name
        active : RSX.iconMindStealActive.name
      )

    if (identifier == Cards.Spell.EggMorph)
      card = new SpellEggMorph(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.EggMorph
      card.name = i18next.t("cards.faction_5_spell_egg_morph_name")
      card.setDescription(i18next.t("cards.faction_5_spell_egg_morph_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.EggMorph"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_boneswarm.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEggMorphIdle.name
        active : RSX.iconEggMorphActive.name
      )

    if (identifier == Cards.Spell.KineticEquilibrium)
      card = new SpellDamageAndApplyModifiers(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.KineticEquilibrium
      card.name = i18next.t("cards.faction_5_spell_kinetic_equilibrium_name")
      card.setDescription(i18next.t("cards.faction_5_spell_kinetic_equilibrium_description"))
      card.manaCost = 3
      card.damageAmount = 2
      card.rarityId = Rarity.Rare
      card.setAffectPattern(CONFIG.PATTERN_3x3_INCLUDING_CENTER)
      card.spellFilterType = SpellFilterType.None
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(2)
      attackBuffContextObject.appliedName = i18next.t("modifiers.faction_5_spell_kinetic_equlibrium_1")
      card.setTargetModifiersContextObjects([attackBuffContextObject])
      card.applyToAllies = true
      card.setFXResource(["FX.Cards.Spell.KineticEquilibrium"])
      card.setBaseAnimResource(
        idle: RSX.iconKineticEquilibriumIdle.name
        active: RSX.iconKineticEquilibriumActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )

    if (identifier == Cards.Artifact.AdamantineClaws)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Artifact.AdamantineClaws
      card.name = i18next.t("cards.faction_5_artifact_adamantite_claws_name")
      card.setDescription(i18next.t("cards.faction_5_artifact_adamantite_claws_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Fixed
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(4,0,{
          name: i18next.t("cards.faction_5_artifact_adamantite_claws_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:4})
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.AdamantineClaws"])
      card.setBaseAnimResource(
        idle: RSX.iconAdamantineClawsIdle.name
        active: RSX.iconAdamantineClawsActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.TwinFang)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Artifact.TwinFang
      card.name = i18next.t("cards.faction_5_artifact_twin_fang_name")
      card.setDescription(i18next.t("cards.faction_5_artifact_twin_fang_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierMyMinionOrGeneralDamagedWatchBuffSelf.createContextObject(2,0,{
          name: i18next.t("cards.faction_5_artifact_twin_fang_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.TwinFang"])
      card.setBaseAnimResource(
        idle: RSX.iconTwinFangIdle.name
        active: RSX.iconTwinFangActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.PristineScale)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction5
      card.id = Cards.Artifact.PristineScale
      card.name = i18next.t("cards.faction_5_artifact_iridium_scale_name")
      card.setDescription(i18next.t("cards.faction_5_artifact_iridium_scale_description"))
      card.addKeywordClassToInclude(ModifierFrenzy)
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierFrenzy.createContextObject({
          type: "ModifierFrenzy"
          name: i18next.t("cards.faction_5_artifact_iridium_scale_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.PristineScale"])
      card.setBaseAnimResource(
        idle: RSX.iconIrridiumScaleIdle.name
        active: RSX.iconIrridiumScaleActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_artifact_equip.audio
      )

    return card

module.exports = CardFactory_CoreSet_Faction5
