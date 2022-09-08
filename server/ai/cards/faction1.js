const Cards = require('app/sdk/cards/cardsLookupComplete');

const F1 = [
  Cards.Faction1.SilverguardSquire,
  Cards.Faction1.WindbladeAdept,
  Cards.Faction1.SilverguardKnight,
  Cards.Faction1.LysianBrawler, // TODO: card intent/scoring
  Cards.Faction1.IroncliffeGuardian,
  Cards.Faction1.ElyxStormblade,
  Cards.Faction1.AzuriteLion,
  Cards.Faction1.SuntideMaiden,
  Cards.Faction1.ArclyteSentinel, // should be working now
  Cards.Spell.SundropElixir,
  Cards.Spell.Tempest,
  Cards.Spell.Decimate,
  // Cards.Spell.Martyrdom,
  Cards.Spell.TrueStrike,
  Cards.Spell.CircleLife,
  Cards.Spell.BeamShock,
  Cards.Spell.HolyImmolation,
  Cards.Spell.WarSurge,
  Cards.Spell.DivineBond, // TODO: card intent/scoring
  Cards.Spell.AurynNexus,
  Cards.Spell.AegisBarrier,
  // Cards.Spell.SunBloom,
  Cards.Spell.AerialRift,
  Cards.Spell.LastingJudgement, // Using it incorrectly too much
  Cards.Artifact.ArclyteRegalia, // Not 100% but close enough
  Cards.Artifact.SunstoneBracers, // TODO: card intent/scoring

  // shim'zar set
  Cards.Faction1.SunWisp,
  Cards.Faction1.Slo,
  Cards.Faction1.Fiz,
  Cards.Faction1.RadiantDragoon,
  Cards.Spell.Afterblaze,
  Cards.Spell.IroncliffeHeart,
  Cards.Spell.FightingSpirit,
  Cards.Spell.SkyPhalanx,
  Cards.Artifact.DawnsEye,

  // rise of the bloodborn set
  Cards.Spell.DrainingWave,
  Cards.Spell.TrinityOath,
  Cards.Faction1.Scintilla,
  Cards.Faction1.Excelsious,

  // ancient bonds set
  Cards.Faction1.Warblade,
  Cards.Faction1.SolPontiff,
  Cards.Faction1.Peacekeeper,

  // unearthed prophecy set
  Cards.Faction1.PurebladeEnforcer,
  Cards.Faction1.Solpiercer,
  Cards.Faction1.WarJudicator,
  Cards.Spell.Congregation,
  Cards.Faction1.Auroara,
  Cards.Spell.AperionsClaim,

  // immortal vanguards set
  Cards.Faction1.DecoratedEnlistee,
  Cards.Faction1.Vigilator,
  Cards.Faction1.Oakenheart,
  Cards.Faction1.Prominence,
];

module.exports = F1;
