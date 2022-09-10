const Cards = require('app/sdk/cards/cardsLookupComplete');

const F3 = [
  Cards.Faction3.WindShrike, // TODO: card intent/scoring
  Cards.Faction3.Pyromancer,
  Cards.Faction3.StarfireScarab,
  Cards.Faction3.SandHowler,
  Cards.Faction3.BrazierRedSand,
  Cards.Faction3.BrazierGoldenFlame,
  Cards.Faction3.BrazierDuskWind,
  Cards.Faction3.AymaraHealer,
  Cards.Faction3.PortalGuardian,
  Cards.Faction3.OrbWeaver,
  Cards.Spell.Enslave,
  Cards.Spell.SiphonEnergy,
  Cards.Spell.CosmicFlesh,
  Cards.Spell.Blindscorch,
  Cards.Spell.EntropicDecay,
  Cards.Spell.ScionsFirstWish,
  Cards.Spell.ScionsSecondWish, // TODO: card intent/scoring
  Cards.Spell.ScionsThirdWish,
  Cards.Spell.BoneSwarm,
  Cards.Spell.AstralPhasing,
  // Cards.Spell.FountainOfYouth, // Sometimes will use this when all minions are full health already
  Cards.Artifact.PoisonHexblade, // Not 100% but close enough
  Cards.Artifact.StaffOfYKir,
  Cards.Artifact.AnkhFireNova,

  // shim'zar set
  Cards.Faction3.Allomancer,
  Cards.Faction3.Rae,
  Cards.Faction3.Pax,
  Cards.Faction3.Nimbus,
  Cards.Spell.CircleOfDesiccation,
  Cards.Spell.AstralFlood,
  Cards.Artifact.Spinecleaver,

  // rise of the bloodborn set
  Cards.Spell.DivineSpark,
  Cards.Faction3.Zephyr,
  Cards.Faction3.Incinera,
  Cards.Faction3.GrandmasterNoshRak,

  // ancient bonds set
  Cards.Spell.BloodOfAir,
  Cards.Faction3.Dreamcarver,
  Cards.Faction3.Windlark,
  Cards.Faction3.Sirocco,

  // unearthed prophecy set
  Cards.Faction3.FateWatcher,
  Cards.Faction3.Duskweaver,
  Cards.Faction3.SandswirlReader,
  Cards.Faction3.LavastormObelysk,
  Cards.Faction3.WastelandWraith,
  Cards.Faction3.TrygonObelysk,
  Cards.Spell.CataclysmicFault,

  // immortal vanguard set
  Cards.Faction3.BarrenShrike,
  Cards.Spell.BurdenOfKnowledge,
  Cards.Faction3.SilicaWeaver,
  Cards.Faction3.Gust,
  Cards.Faction3.SimulacraObelysk,
];

module.exports = F3;
