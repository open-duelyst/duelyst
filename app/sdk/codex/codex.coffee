# do not add this file to any resource package
# it is handled by special processing
RSX = require('app/data/resources')
CodexChapters = require './codexChapterLookup'

class Codex

  @chapters: {}

  @chapterForIdentifier: (identifier) ->
    chapter = @chapters[identifier]
    if chapter
      return chapter
    else
      console.error "Codex.chapterForIdentifier - Unknown lore identifier: #{identifier}".red

  @getAllChapters: () ->
    chapters = []

    chapterIdentifiers = Object.keys(Codex.chapters)
    for chapterIdentifier in chapterIdentifiers
      chapter = @chapterForIdentifier(chapterIdentifier)
      if chapter? then chapters.push(chapter)

    return chapters

  ###*
  # Returns the chapter ids that should be given for a player UPON reaching the provided game count
  # @public
  # @param  {ints}    gameCount     Game count the player has reached
  # @return  {Array(int)}    identifiers of chapters a player should be given (from CodexChapterLookup)
  ###
  @chapterIdsAwardedForGameCount: (gameCount) ->
    awardedChapterIds = []

    if not gameCount?
      gameCount = 0

    chapterIdentifiers = Object.keys(Codex.chapters)
    for chapterIdentifier in chapterIdentifiers
      chapter = @chapterForIdentifier(chapterIdentifier)
      if chapter? && chapter.gamesRequiredToUnlock == gameCount && chapter.enabled
        awardedChapterIds.push(chapterIdentifier)

    return awardedChapterIds

  ###*
  # Returns the chapter ids that should be owned by a player with the provided game count
  # @public
  # @param  {ints}    gameCount     Game count the player has reached
  # @return  {Array(int)}    identifiers of chapters a player should own (from CodexChapterLookup)
  ###
  @chapterIdsOwnedByGameCount: (gameCount) ->
    ownedChapterIds = []

    if not gameCount?
      gameCount = 0

    chapterIdentifiers = Object.keys(Codex.chapters)
    for chapterIdentifier in chapterIdentifiers
      chapter = @chapterForIdentifier(chapterIdentifier)
      if chapter? && chapter.gamesRequiredToUnlock <= gameCount && chapter.enabled
        ownedChapterIds.push(chapterIdentifier)

    return ownedChapterIds

# setup chapters data
c = Codex.chapters

c[CodexChapters.Chapter1] = {
  id: CodexChapters.Chapter1,
  name: "1: The Age of Disjunction",
  description: "0 AE",
  img: RSX.chapter1_preview.img,
  background: RSX.chapter1_background.img,
  #audio: RSX.chapter1_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 0,
  text: [
    "Thousands of years before the dawn of the modern age, a stellar alignment sent a star seed from the depths of space colliding into the planet Mythron, forever transforming the world and its inhabitants. Mythron’s single supercontinent shattered into seven new ones, each twisted and torn into a new terrain of jagged mountains, crystalline lakes, and storm-swept islands.",
    "The vast, temperate continent of Celandine would become the home of the Lyonar Kingdoms. The lush, perilous continent of Xenkai would become the home of the Songhai Empire.",
    "The arid, desolate continent of Akram would become the home of the Vetruvian Imperium. The shattered, broken chasms of Styxus would become the home of the Abyssian Host.",
    "The primordial, volcanic continent of Magaari would become the home of the Magmar Aspects. In the far reaches beyond the Whyte Mountains, Halcyar would become the home of the Vanar Kindred.",
    "And Aestaria, the central continent, was now marked by two concentric rings of colossal mountains thrust up by the cataclysmic impact. At its very center, a thousand miles across, was God’s Heel, the star seed’s impact crater.",
    "The collision transformed Mythron’s climate as well. Vast storms swept across the reshaped planet, unleashing torrents of acid rain and devastating lightning. Maelstroms hundreds of miles wide churned the oceans. Temperatures fluctuated wildly between blistering heat and frigid cold, causing most of Mythron’s myriad life forms to perish.",
    "Those few resilient creatures that survived found sanctuary underground or adapted to the unforgiving hellscapes of Mythron’s volcanic pits. But while the cataclysm wiped out countless species, it ushered in a new one as well. At the center of the impact crater, the star seed sent its cosmic roots into the very core of the planet, drawing on the magical energies it found there and transforming into the Great Tree of Eyos.",
    "And that would bring changes of an even greater magnitude."
  ].join("\n\n")
}

c[CodexChapters.Chapter2] = {
  id: CodexChapters.Chapter2,
  name: "2: The Great Tree of Eyos",
  description: "10,000 AE",
  img: RSX.chapter2_preview.img,
  background: RSX.chapter2_background.img,
  #audio: RSX.chapter2_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 0,
  text: [
    "Over thousands of years, Mythron steadily recovered from the cataclysm of the star seed’s arrival. Creatures adapted and multiplied until the planet once again teemed with life.",
    "The Great Tree of Eyos grew as well, drawing magical energies from the planet’s core and sprouting prismatic leaves that scintillated in the starlight they absorbed for nourishment. Ten thousand years after the birth of the Great Tree, it bloomed, producing a burst of arcane energy that bathed the planet in a radiant glow. A stunning Harmonic Aurora permanently painted the skies and the Great Tree exploded with spectacular mana blossoms, launching iridescent petals into the air to journey the world upon Mythron’s winds.",
    "Each petal carried a direct connection to the Great Tree. Not only did the creatures they touched gain the ability to channel the planet's arcane energy, but the Great Tree itself gained the power to see through their eyes. Objects that were touched turned into crystallized nodes of magical energy, with brilliant colors reflecting the metals and minerals they contained. The petals nurtured and accelerated a multitude of creatures and plants, both sentient and not.",
    "In the Northern Whyte Mountains along Halcyar, they created ancient races like the elusive Snow Chasers and the fierce Draugar Giants. To the East, in Xenkai, they transformed the interconnected network of sentient bamboo into the Whistling Blades and the graceful orange cranes in the Ang’Mar Glades into the life-giving Zurael.",
    "At the end of that first Great Blooming, the Great Tree of Eyos returned to a state of rest, to rebuild its magical energy, but not before thirteen perfect petals drifted to the volcanic region of Magaari. They landed on the exposed metallic chrysalises of the males of a rare species of sentient drake-like creatures protected by iridium exoskeletons. Deep within the volcanic mountain, untouched and untransformed, their Queen Mother would die alone, forever removed from the rest of her species. But on the surface, these thirteen males would become the immortal Magmar."
  ].join("\n\n")
}

c[CodexChapters.Chapter3] = {
  id: CodexChapters.Chapter3,
  name: "3: The Rise of the Magmar Aspects",
  description: "10,000 - 20,000 AE",
  img: RSX.chapter3_preview.img,
  background: RSX.chapter3_background.img,
  #audio: RSX.chapter3_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 0,
  text: [
    "After the Touch of Eyos, the Magmar lived for hundreds of years. They also gained the ability to return to the chrysalis and be reborn anew, making them virtually immortal. Without their Queen Mother, they could not reproduce, but they were not leaderless — over time, a Magmar named Valknu became their alpha.",
    "Valknu, as their Prime Focii, discovered a way to save the Magmars’ deepest memories as a gift to their future selves. Each cycle required them to re-experience and reinterpret their memories in a process known as the The Dance of Dreams. In order to preserve their memories through time, the Magmar developed a magical song-like script that contained their collective experiences in a group consciousness known as The Thirteen Aspects.",
    "Over the millennia, the Magmar developed a balanced philosophy of the world, a reflection of their own harmonious path to constant rebirth. They were solitary yet spontaneous, focused on simplicity and the wonders of nature, and detached from personal desires. They mostly kept to themselves, but sometimes travelled great distances to interact with other sentient beings.",
    "Unlike other races, the Magmar learned to be still and commune with the Great Tree of Eyos, sometimes spending several kalpas — hundreds of years — to achieve dialogue with it. Thus they learned about the Great Blooming and began to worship and celebrate Eyos as the ultimate bringer of birth, growth, and rebirth.",
    "When meditating together and bonding with the Great Tree, the Thirteen Aspects could see out in the world and even glimpse the ephemeral tapestry of time, but doing so cost them their individual identity, their sense of self. Ultimately, they were unable to achieve complete ascension or see more than a hint of the future. Thus, they were cursed to forever repeat their lives, never fully controlling their own destinies."
  ].join("\n\n")
}

c[CodexChapters.Chapter4] = {
  id: CodexChapters.Chapter4,
  name: "4: The Aestari Spark",
  description: "20,000 - 22,000 AE",
  img: RSX.chapter4_preview.img,
  background: RSX.chapter4_background.img,
  #audio: RSX.chapter4_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 0,
  text: [
    "During the Second Great Blooming, The Great Tree of Eyos once again released its magical petals into the winds. Some of the enchanted petals made their way to the Vermillion Forest, where they touched an intelligent race of humanoid creatures with crimson orange hair. They called themselves the Aestari, or Children of the Ineffable Flame. Within a few generations, the powers conferred upon those touched by the petals spread throughout the entire species.",
    "The Aestari had a natural proclivity for wielding and channeling arcane energies, but it manifested differently in the males and the females. Aestari females were better able to focus and channel magic in a continuous sustained stream called The Binding. They could concentrate and move objects far longer than the males. Conversely, the males could amplify the intensity of magic, but only in shorter bursts, called The Surging. This gave them a natural ability to phase and summon objects rather than slowly move them. But The Surging consumed magical power rapidly, requiring them to either extract more energy from crystals or recover naturally by refraining from using magic until they had regained their strength.",
    "For some Aestari males, however, The Surging fed an innate, insatiable desire for more — to reach higher highs, to achieve greater feats, to rise above the world. But the highest levels of arcane mastery were only attainable through the power of the crystals, which enabled them to achieve both great intensity and endurance. Most became dependent on the energy of the crystals, unable to accept their natural limitations and return to their mundane lives. The insatiable hunger for more magical power eventually consumed their everyday thoughts."
  ].join("\n\n")
}

c[CodexChapters.Chapter5] = {
  id: CodexChapters.Chapter5,
  name: "5: The Emergence of the Inxikrah",
  description: "20,000 - 22,000 AE",
  img: RSX.chapter5_preview.img,
  background: RSX.chapter5_background.img,
  #audio: RSX.chapter5_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 0,
  text: [
    "While most of Mythron’s creatures dwelt on the surface, some that sought refuge underground during the cataclysm of the star seed’s impact simply never returned. Nevertheless, the magic petals of The Great Tree of Eyos found their stygian world as well, drifting down into the dark crevasses and shattered chasms of the continent Styxus. There, they transformed a subterranean world of stone into a wondrous nexus of luminous crystals that extended throughout the vast network of caverns.",
    "The iridescent petals also found a pale, snake-like race of sentient creatures called the Inxikrah, or the Formless Faces. Adapted over the millennia to their underground world, these scaly, albino predators released clouds of psychoactive toxins that paralyzed and controlled their prey. The Inxikrah had become extremely sensitive to daylight – they would desiccate and burn if exposed to the sun for more than a few hours. They explored the surface only at night and showed no desire to cross the vast, swirling oceans separating them from Mythron’s other developing civilizations.",
    "The underworld was deadly and treacherous, and the creatures that adapted to it were equally so. But the Echoing Depths offered immense treasures as well — ancient crystals formed during the first bloom of the Great Tree of Eyos: smoky purple gems that formed alongside the plant-like Inkhorn, black Amethysts that accompanied Dark Creep Moss, and even the rare Ghost Azaleas and their potent, concentrated magical energies. The Inxikrah had learned that these crystals would imbue them with properties of their prey through a transformative ritual they called Krah’Zul.",
    "During each shedding cycle, the Inxikrah created ever deadlier forms of themselves, incorporating the most lethal elements of their previously consumed prey. Over time, as the Inxikrah continued to absorb their prey, the species began to diverge. The males sought as quarry the most dangerous predators, and grew more and more vicious with each generation. The females hunted not for sport, but to feed themselves and their young. While they could be devastatingly violent in defense of their brood, they never developed the Krah’Zul- heightened malevolence of the males."
  ].join("\n\n")
}

c[CodexChapters.Chapter6] = {
  id: CodexChapters.Chapter6,
  name: "6: The First Empire",
  description: "22,000 - 22,300 AE",
  img: RSX.chapter6_preview.img,
  background: RSX.chapter6_background.img,
  #audio: RSX.chapter6_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 1,
  text: [
    "Sheltered from danger in the central crater of God’s Heel, the Aestari lived for centuries in peace and harmony. With no competition for resources, their population thrived and prospered. Small isolated villages became towns interconnected across the Sanctuary Plains.",
    "During this Age of Wonder, creativity in the arts and knowledge of magic flourished, spawning myriad specializations and schools of thought. The Aestari established the Seventh Sanctum, their primary center for learning. It was comprised of seven branched disciplines:",
    "- School of Knowledge: The Alcuin Order, first line of the Loremasters, was established to further a deeper understanding of the world.",
    "- School of Harmony: The Swords of Akrane and The Twin Crescents both refined various forms of swordsmanship, harmoniously blending magic with bodily motion, incorporating the fluid duality of the visible and invisible, the physical and non-physical.",
    "- School of Timelessness: After years of intense meditation, the Chakri Avatars learned to commune with The Great Tree. They could heighten their state of power almost indefinitely, and even see visions of the past and the future.",
    "- School of Selflessness: The first Shieldmasters, protectors and defenders of the people, were focused on piety, integrity, honor, and mutual respect.",
    "- School of Power: Artificers and Songweavers learned to concentrate the power of crystals and imbue inanimate objects with their energy, creating powerful Artifacts and magical items.",
    "- School of Dreams: Aestari Mistwalkers and Aethermasters developed the ability to astral phase through alternate micro-dimensions, cast illusions, and summon creatures.",
    "- School of Order: The Arcanysts harnessed the power contained within magical components and scripts, discovering spells that enhanced one’s natural abilities, and inventing mixtures such as the highly sought after Sundrop Elixir and Aurora’s Tears.",
    "During this Age of Wonder, the first Aestari Chroniclers explored the mountains beyond their central continent, recording all they discovered. This Age of Wonder also saw the Magmar grow into their rightful role as Mythron’s protectors, to meditate, interpret, and guide the Aestari leaders."
  ].join("\n\n")
}

c[CodexChapters.Chapter7] = {
  id: CodexChapters.Chapter7,
  name: "7: The Darkness Gnaws Below",
  description: "22,000 - 22,300 AE",
  img: RSX.chapter7_preview.img,
  background: RSX.chapter7_background.img,
  #audio: RSX.chapter7_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 2,
  text: [
    "While the Aestari Age of Wonder was flowering on the surface of Mythron, a more sinister development was unfolding beneath it. The Inxikrah had embraced with great enthusiasm their role as the apex predator of the underworld. And as their supremacy became unquestioned, their thirst to exercise it became unquenchable.",
    "Powered by the magic of crystals of the Black Amethysts, the Krah’Zul transformation that followed each act of predation not only conferred on the Inxikrah the strengths and abilities of their prey — it flooded the predators with physical pleasure that bordered on ecstasy.",
    "Over time, this magnified and exaggerated their primal, predatory instincts. The male Inxikrah and female Inxykree both came to be driven by an insatiable, all-consuming hunger for the feeling of youthful rejuvenation that came from killing. The gnawing addictive power of the crystals, and their growing scarcity, caused infighting among the Inxikrah. A system of rigid castes was established to create order, to preserve the crystals, and to help the Inxikrah survive and remain preeminent in a world fraught with danger and dwindling resources.",
    "The elation and the rush of killing and transformation became a ritual, taking on a sacred significance that made the Inxikrah even more rapacious. The male Inxikrah became increasingly defined by an ethos of cruelty. Lesser sentient creatures and captured enemies from raids became slaves or playthings, including the Inxikrah’s less-evolved cousins, the Serpenti, which the Inxikrah often transformed into tortured Darkspine Elementals and familiar-like Wraithlings.",
    "Meanwhile, the female Inxykree grew more social and increasingly repulsed by the Inxikrah’s random brutality. Over generations, the differences grew so pronounced they were like two separate species, the male Inxikrah and the female Inxykree, whose only contact was to perpetuate their species."
  ].join("\n\n")
}

c[CodexChapters.Chapter8] = {
  id: CodexChapters.Chapter8,
  name: "8: The Prophetic Paradox",
  description: "22,300 - 22,400 AE",
  img: RSX.chapter8_preview.img,
  background: RSX.chapter8_background.img,
  #audio: RSX.chapter8_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 3,
  text: [
    "As The Age of Wonder drew to a close, the Aestari Matron-Magus, Kaon Deladriss, having mastered all seven Schools of the Seventh Sanctum, retreated to the top of Ivory Peake to meditate. After a decade, she had gained the ability to commune with the Great Tree of Eyos, and the Great Tree observed her thoughts and actions closely as well. It deemed her virtuous, worthy by deed, mind, and spirit. Kaon returned to the Seventh Sanctum by teleportation, becoming Mythron’s first Horizon Walker.",
    "Years later, as Kaon Deladriss was dreamweaving at the White Mantle, she received from the Great Tree a devastating Prophecy of Ages. It foretold the destruction of the Aestari civilization in a coming Age of Decay, a time of chaos and unfathomable suffering that would last a millennia. But while the Age of Decay was inevitable, the tapestry of Kaon's dream contained a single thread of hope, a way that the Age of Decay could be shortened to a single century, to be followed by an even greater civilization built atop the foundation of the First Empire. But the price for this would be terrible, indeed.",
    "It would mean forsaking forever her harmonious meditation and near immortality. It would cost her ongoing ascension, her connection with the Great Tree, and even her ability to Horizon Walk. More importantly, she wondered if her actions to spare the world such suffering — to save nine centuries of unborn lives — could bring about something unimaginably worse. Kaon struggled with the paradox of the Prophecy.",
    "In the end, she decided that the chance to prevent such suffering was the only path forward, even though the task it demanded was too horrific to speak of. The demand of the Prophecy was that the Heart of the Great Tree of Eyos must be removed — cut out — and placed as far away as possible, never to return to Aestari soil again."
  ].join("\n\n")
}

c[CodexChapters.Chapter9] = {
  id: CodexChapters.Chapter9,
  name: "9: The First Senerai",
  description: "22,300 - 22,400 AE",
  img: RSX.chapter9_preview.img,
  background: RSX.chapter9_background.img,
  #audio: RSX.chapter9_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 4,
  text: [
    "The Prophecy of Ages foretold Seven Seeds that would change the course of history, seven heroes to complete the task at hand. To find them, Kaon Deladriss established the first Trial of Champions, a six- week contest of strength and endurance, intelligence and honor. The winners would be called the Senerai, “The Seven Stars.”",
    "The Trial of Champions revealed the finest warriors in all of Aestaria, head and shoulders above all others. Many Aestari distinguished themselves as ‘Vanar’, or legendary elite. Yet, only a select few displayed the heroic excellence necessary to earn the title of Senerai. They represented the best in each of their respective disciplines. Their unquestioned leader was Songweaver Eurielle. Joining her was Loremaster Lumina, Swordmaster Zwei, Avatar Saari, Arcanyst Graye, and Shieldmaster Koreldyre. But to Kaon’s consternation, they numbered only six.",
    "Kaon held one more week of trials, but no one else proved worthy. She wondered if there could be only six. But if she was wrong about that, what else had she misinterpreted?",
    "She began to question the entire prophecy...until a towering silhouette entered the arena carrying a twin-bladed sword: A Magmar.",
    "Kaon greeted him respectfully, but said, “You must go. You are not Aestari.”",
    "He didn’t move. “I am Starhorn,” he said, “The Seventh Star foretold by the prophecy.”",
    "Kaon turned to the Vanar elites and said, “Whoever defeats this Magmar shall join the Senerai.”",
    "The Magmar was monstrously massive, but when the warriors came at him, he maneuvered with blinding speed and subtle grace. He touched no one but let none touch him. After a full day, as the last Vanar finally collapsed in exhaustion, Kaon said, “Enough. Starhorn, most honored Magmar, you are indeed the Seed of Dreams, the Seventh Star.”"
  ].join("\n\n")
}

c[CodexChapters.Chapter10] = {
  id: CodexChapters.Chapter10,
  name: "10: The Great Tree Aperion",
  description: "22,402 AE",
  img: RSX.chapter10_preview.img,
  background: RSX.chapter10_background.img,
  #audio: RSX.chapter10_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 5,
  text: [
    "Advancing in years and rapidly losing her powers, Kaon Deladriss traveled with the Senerai to The Great Tree of Eyos, to fulfill the prophecy. In anguish, she extracted its Heartwood, a perfectly brilliant prismatic seed the size of a small fist. Immediately, The Great Tree shrank and withered. Its starry leaves turned crimson red. Stricken with grief, Kaon gave the Heartwood to the Senerai so they could fulfill the rest of the prophecy. She remained with The Great Tree, mourning, until her dying days.",
    "For many years, the Senerai journeyed across the vast world of Mythron seeking the perfect sanctuary for the Heartwood. Amid the lush beauty of Xenkai they befriended the Four Winds and tasted the rejuvenating waters of the Twilight Spring. Among the Islands of Pyrae, they rediscovered the lost arts of fireweaving. Hidden in the Sea of Fog, they found the exotic islands of Y'Kir, where master inventors and artificers worked in solitude crafting the first magical devices that their descendants would prize as ancient artifacts. They landed on the desolate surface of Styxus, naming it the Blighted Lands.",
    "They were the first Aestari invited to Magaari, the Magmar homeland, to behold the Golden Chrysalis containing the remains of the last Queen Mother. They travelled along the Yquem River, allying themselves with the Silverbeaks near Raithline Lake against a horde of Mirkblood Devourers. They witnessed Azurite Lions hunting across the Alluvial Plains. And after many years of encountering strange creatures, discovering countless locales, and witnessing mysterious cultures, the Senerai finally arrived at Halcyar: the Northern-most realm — far past the frost-carved Whyte Mountains, and more importantly, far beyond the prying reach of Aestaria.",
    "They found a distant peak enveloped by the magical Northern Aurora, hidden and shielded on all sides by hundreds of identical mountains. They named it Deladriss Peake, in honor of Kaon, and there they planted the Heartwood. A sapling immediately sprouted from the ground, its young leaves drawing in the crisp starlight. They named the new tree Aperion. At that exact moment, Kaon dematerialized from the living world. All Aestaria was plunged into mourning. The once great tree, now withered and weak, released red droplets of crimson sap, the Tears of Eyos, and forever after was known as The Weeping Tree."
  ].join("\n\n")
}

c[CodexChapters.Chapter11] = {
  id: CodexChapters.Chapter11,
  name: "11: The Protectors of Mythron’s Secret",
  description: "22,402 AE",
  img: RSX.chapter11_preview.img,
  background: RSX.chapter11_background.img,
  #audio: RSX.chapter11_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 6,
  text: [
    "The dangers faced by the Senerai on their quest were not all external. Songweaver Eurielle saw that some of her comrades were internally tempted by the Heartwood’s endless power, especially Arcanyst Graye. As they journeyed back to Aestaria, she convinced the Senerai that for The Great Tree Aperion to remain truly safe, its location must remain forever secret.",
    "That night, they joined in casting a Globe of Disrememberance, erasing all memories of the tree’s location. When the Senerai parted ways, though, instead of returning home, Eurielle shadowed Arcanyst Graye. She saw him head back toward Deladriss Peake and discovered that he had drawn a secret map before the Disrememberance, so he could return to steal Aperion.",
    "Eurielle confiscated the map and banished Arcanyst Graye from the Senerai. She realized Aperion must be protected, but decided Aestaria’s men were too covetous of its power to be trusted. She established the female-only Seidir — the Hearth-Sisters — who swore an undying oath to protect Aperion and the secret of its location.",
    "Starhorn disagreed, and he wove the location of Deladriss Peake into the Magmar’s sacred song, the Dance of Dreams, so that anyone deemed worthy by The Thirteen Aspects could learn of Aperion’s whereabouts. Kaon Deladriss had also disagreed with Songweaver Eurielle’s decision and imbued the secret within Swordmaster Zwei’s dual-wielding blades, Solstice and Winterblade. Before mysteriously vanishing, she had secretly dispatched the female Vanar to help guard Aperion’s clandestine location.",
    "At Deladriss Peake, young Aperion dropped its first potent petals, transforming the morning mist into the first of the mana-rich Crystal Wisps, which allowed the Seidir to access to the Voices of Winds, including the ability to morph into various animal aspects. Thus they protected the Great Tree of Aperion, fulfilling the Prophecy of Ages in solitude until the unexpected arrival of the Vanar reinforcements."
  ].join("\n\n")
}

c[CodexChapters.Chapter12] = {
  id: CodexChapters.Chapter12,
  name: "12: The Trinity Mandates and the Great Diaspora",
  description: "22,402 - 22,610 AE",
  img: RSX.chapter12_preview.img,
  background: RSX.chapter12_background.img,
  #audio: RSX.chapter12_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 7,
  text: [
    "Returning to Aestaria, Songweaver Eurielle was welcomed as a hero. In the void left by the death of Kaon Deladriss, she was universally acclaimed as Aestaria’s new leader. But Eurielle was a warrior at heart — she was not well-suited to governing an increasingly complex, growing empire.",
    "Hardened by travel and spartan in her ways, she was impatient with the nuances of politics and with the Aestari people. They were soft and inwardly focused. The rich and entitled had become lazy and overly dependent on the crystals, frivolously wasting the precious — and rapidly depleting — resource. Eurielle became bitter, angry that her teacher Kaon and the Senerai had sacrificed so much for a selfish and ungrateful people who cared only for themselves — and their precious crystals.",
    "Eventually, Eurielle deemed it necessary to restrict the use of crystals. She established the Trinity Mandates: The First Mandate, which declared that under penalty of imprisonment, any Aestari citizen who used a crystal must refrain from practicing magic for a set period of time, to balance the debt of use.",
    "The Second Mandate established an elaborate set of permissions and rules governing appropriate crystal usage. The Third Mandate outlined specific priorities, strictly forbidding the use of crystals for simple entertainment or pleasure.",
    "The Aestari people were furious. Many felt they were being oppressed, that the mandates violated their rights and fundamental Aestari beliefs. Some had grown so dependent on the crystals that they became physically ill without them. Aestaris hoarded, smuggled, and stole crystals from neighboring towns.",
    "Some scoured the surrounding Sundrop Mountains, desperately seeking more crystals to satiate their unceasing hunger. Other groups simply left Aestaria, crossing the treacherous mountains in pursuit of their own destinies, and new sources of crystals."
  ].join("\n\n")
}

c[CodexChapters.Chapter13] = {
  id: CodexChapters.Chapter13,
  name: "13: The Dawn of the Vetruvians",
  description: "22,610 - 22,640 AE",
  img: RSX.chapter13_preview.img,
  background: RSX.chapter13_background.img,
  #audio: RSX.chapter13_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 8,
  text: [
    "Among the disparate groups who fled the Aestari Mandates was a band of pilgrims, visionaries, and explorers who travelled directly east. They discovered the lush and stunning coastlines of the continent of Akram.",
    "They established the city of Kaero, which one day would become the capital of their new nation. The interior of the country was mostly arid desert, but moving down the coast they encountered the calmer waters of the reef-sheltered bays, and discovered vast nodes of copper, tin, iron, and other metals.",
    "Amid the Dunes of Ma'or, they discovered subterranean sources of pristine water, erecting massive Pyramid Towers to extract the pure water from deep underground. They established cities like Tyvia, which became home to the finest weaponsmiths, as well as Pyrae and nearby Murani, which became home to the finest artisans and craftsmen.",
    "Most of the Alcuin Loremasters moved to Kaero, setting up The Ostracon, a sister institution to the Seventh Sanctum. In time, the Ostracon became a prominent University and bastion of learning, the epicenter of academic and arcane knowledge on Mythron where the best and brightest scholars would learn from peerless Aestari sages -- respectful of the finite supply of crystal energy, but unfettered by the Aestari Mandates.",
    "Despite the scarcity of water, Akram’s plentiful metals attracted the best Aestari craftsmen. The metallurgic arts flourished, producing advances that soon outstripped Aestari technologies. From among this new breed of craftsmen emerged one particularly brilliant Aestari: Atar.",
    "With unparalleled speed, he swiftly ascended the Ostracon’s ranks, earning the titles of Grand Loremaster, High Artificer, and Prime Arcanyst. He was also a tireless explorer who would one day learn that Akram had as-of-yet undiscovered resources more precious than anyone could have previously imagined."
  ].join("\n\n")
}

c[CodexChapters.Chapter14] = {
  id: CodexChapters.Chapter14,
  name: "14: The Star Crystals of Akram",
  description: "22,640 - 22,670 AE",
  img: RSX.chapter14_preview.img,
  background: RSX.chapter14_background.img,
  #audio: RSX.chapter14_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 9,
  text: [
    "While exploring the Aymara Canyons, Atar came upon something no Aestari had ever seen. Sparkling brighter than the setting sun were hundreds of Star Crystals created by the original petals of the First Great Blooming, bursting with concentrated magical energy — pure and crisp, unlike any other.",
    "They were untouched by Aestari hands and undepleted by Aestari magic, but that alone didn’t explain their intensity. Atar realized that not only was the energy of these Star Crystals’ undiminished, but for the millennia they had sat there, undisturbed, sheltered within Aymara Canyon’s protective walls, they had been absorbing starlight — and growing stronger.",
    "Atar established the Order of Staar and named himself Atar Starstrider. He became rich and influential, but remained a renaissance man and inventor at heart, never obsessed with power or wealth. To make the waterless interior of the continent more habitable, Atar invented the Sand Shield, a mechanized suit of star-powered armor that minimized water loss. Atar coined the term Vetruvian — “The Remade Man” — which the people themselves quickly adopted.",
    "Atar continually refined his Sand Shields, making them lighter and stronger. Some were even biologically integrated into the body, all-but eliminating water loss, granting the wearer superhuman abilities and opening new aesthetic possibilities. Water was shared freely with the young, but at adolescence, integration with one’s suit through the solemn Rite of Melding became a civic obligation — and an essential step toward Vetruvian adulthood.",
    "Using Star Crystals, Atar sparked life into mechanical objects, creating the first sentient Golems and increasingly sophisticated mechanical beings that would one day become the Mechanysts. In Kaero and Pyrae, the Order of Staar learned to manipulate heat, electricity, and wind to shape metal into customizable armor and floating platforms.",
    "Years later they would join the star crystals with the sand silica to open portals to other micro-dimensions, forge the first Portal Obelysks, and summon the ephemeral Wind Dervishes, silica-based races of the Silhouette Tracers from the Sea of Dust, and the legendary Jax. Atar's final creations were the flying Wind Shrikes and Mirror Masters, which could organically replicate anything before them.",
    "But his most important legacy was that the Vetruvians, rather than searching for power solely from the Great Tree, discovered that the true source of power came from the stars themselves."
  ].join("\n\n")
}

c[CodexChapters.Chapter15] = {
  id: CodexChapters.Chapter15,
  name: "15: The Twin Empires",
  description: "22,640 - 22,700 AE",
  img: RSX.chapter15_preview.img,
  background: RSX.chapter15_background.img,
  #audio: RSX.chapter15_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 10,
  text: [
    "Many who had left Aestaria returned with exaggerated tales of fertile soil and giant crystals the size of boulders. But not all who left Aestaria seeking fortune actually found what they were looking for.",
    "Some headed north to Celandine pursuing stories of previously unknown gold-shimmering crystals — Sun Crystals — that could absorb sunlight, as well as rumors of a second Great Tree nourished by the sun. They discovered neither, but they did carve out a life for themselves.",
    "The Highmayne clan called their newly established home Windcliffe, while those who called themselves the Order of the Second Suns and the Lightchasers established the towering city of Sun Forge on the highest peak in Celandine. In time, the continent became home to the Lyonar Kingdoms.",
    "Another hardy group of Aestari explorers chased similar tales northeast, to the exotic and mysterious continent of Xenkai. They found a harsh and dangerous land of wet jungles, frigid mountains, arid deserts, and ghostly predators at every turn. But they conquered the land, taming and riding many of these creatures, hunting and killing with deadly precision many others. These agile and lethal warriors were the forefathers of the Songhai Empire, and founders of the cities of Xaan and Kaido.",
    "Travelling inland, they discovered the Twilight Spring, where dusk and dawn mixed together, blurring light and dark, life and death, blood and earth, animal and human. It was a place where boundaries merged, an aetherial vortex that allowed the Songhai to commune with their ancestors and spirit essence animals with mystical Twilight Seals, establishing the Ancestral Spirits and Zodiac Masks.",
    "Although they could not transform into the animals themselves — like the Vanar — they could inherit the abilities and traits of their representative spirit animal. Some Songhai rulers later came to believe they were the physical descendants of their patron animal, including Kaleos the Ghost Tiger, Gen-Bo the Sable Tortoise, and Taegon the Citrine Dragon.",
    "But these were not the only emigrants to Xenkai. Foreseeing the destruction of Aestaria and the birth of a future hero on the continent of Xenkai, the Chakri Avatars journeyed to the isolated Saberspine Mountains. Hidden on its steepest slopes, they built the Chakri Monastery, where they stayed, meditating in solitude, honing their skills, ready to return in Mythron's time of need."
  ].join("\n\n")
}

c[CodexChapters.Chapter16] = {
  id: CodexChapters.Chapter16,
  name: "16: The Golden Age of Peace",
  description: "22,403 - 22,765 AE",
  img: RSX.chapter16_preview.img,
  background: RSX.chapter16_background.img,
  #audio: RSX.chapter16_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 12,
  text: [
    "One by one, the Senerai passed away, confident in their decisions and comforted by the knowledge that they left behind a Golden Age of Peace.",
    "But Eurielle brooded over the prophecy of the Ages. She knew peace would not last forever. On her deathbed, she made Starhorn promise he would leave Aestaria and travel to the outer continents in search of the next champions who would assume the mantle of the Senerai — the keepers of peace and protectors of Mythron’s greatest secret.",
    "She reminded Starhorn that the Chakri Avatars had moved northeast, and that it was likely the next destined hero would be born there. Starhorn agreed in principle, but he did not leave right away. He already had an inkling of who would succeed the Senerai, who Mythron’s next great leader would be.",
    "The Thirteen Aspects remained in Aestaria, guiding the people, helping maintain order, and ultimately grooming successive generations of Aestari leaders as their civilization spread across the globe. As the ongoing study of magic and science brought vast increases in knowledge and power, both Aestaria and its far-flung settlements continued to grow in both size and sophistication.",
    "The continents continued to develop into intricate civilizations, further enriching Mythron’s already diverse cultural tapestry. As the settlements evolved into new nations with their own unique identities, they remained under Aestaria’s direct control. At first.",
    "Over the centuries, however, the strength and power of the Aestari colonies approached that of Aestaria itself. The central government’s control lessened. Eventually, inevitably, these nations would establish their independence, giving rise to the Lyonar Kingdoms on Celandine, the Songhai Empire in Xenkai, and the Vetruvian Imperium on Akram. But not yet..."
  ].join("\n\n")
}

c[CodexChapters.Chapter17] = {
  id: CodexChapters.Chapter17,
  name: "17: Ascension of Emperor Sargos",
  description: "22,465 - 22,745 AE",
  img: RSX.chapter17_preview.img,
  background: RSX.chapter17_background.img,
  #audio: RSX.chapter17_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 14,
  text: [
    "Aestaria flourished in peace and prosperity, its majestic cities agleam like the crystals whose power they were built upon. The Thirteen Aspects guided the Aestari and secretly kept their worst impulses in check.",
    "For while Aestaria was outwardly a land of shining beauty, soaring white towers, and jeweled mantles, inwardly, greed and corruption had seeped into the people’s hearts, undermining their once idealistic society with cloying narcissistic decay. As the continents tried to assert their independence, Aestaria treated them as vassal nations, collecting a tribute tax in the form of crystals for the privilege of being part of the Aestari Empire.",
    "This was the Aestaria in which the boy emperor Sargos ascended to power. Intellectually curious, with an insatiable appetite for science, magic, and books of all sorts, young Sargos was beloved by his people, and respected by the Thirteen Aspects. Early in his reign, while studying in the Alcuin Library, Sargos found fragments that hinted of a Second Empire.",
    "He summoned Valknu, Vaath, and Starhorn, who reluctantly confirmed the prophecy that claimed a new empire would rise from the ashes of the old.",
    "But they would reveal nothing else. For the first time, Sargos suspected they were keeping something from him. Resuming his studies, he found no other mention of the prophecy. When he went to reconfirm his earlier findings, the ancient tomes in which he first found mention of the Second Empire had vanished.",
    "Sargos was convinced Valknu was hiding the truth. Thus were planted the first seeds of Sargos’ distrust of the Thirteen Aspects, a deepening strife that festered within Sargos’ soul.",
    "By the time Emperor Sargos was a young man, Aestaria was already in decline. But Sargos never forgot the prophecy of a greater Second Empire, and he continued to dream of a unified Aestaria whose true greatness lay ahead. Sargos saw the Lyonar, Vetruvians, and Songhai flourishing on the strength of their crystal resources, but he knew the ultimate source of those crystals was the Weeping Tree, which grew on Aestari soil.",
    "Seeking a way to reassert Aestari hegemony, he conceived of a plan to build a massive, towering structure that would not only symbolize Aestari primacy and dominance, it would ensure it for millennia to come.",
    "He called it The Monolith."
  ].join("\n\n")
}

c[CodexChapters.Chapter18] = {
  id: CodexChapters.Chapter18,
  name: "18: Construction of the Monolith",
  description: "22,745 - 22,870 AE",
  img: RSX.chapter18_preview.img,
  background: RSX.chapter18_background.img,
  #audio: RSX.chapter18_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 16,
  text: [
    "The Monolith conceived of by Sargos would be much more than just a symbol. It would enclose the Weeping Tree with vast Star Lenses designed to capture starlight, amplifying and focusing the cosmic light on the Weeping Tree, making it stronger and healthier while simultaneously hastening the next Great Blooming.",
    "At the same time, the colossal enclosure would ensure that the petals released in the next blooming — and all the power they contained — would forever remain inside Aestaria.",
    "In the short term, construction of the Monolith would consume more crystals than ever before, aggravating existing shortages and provoking even greater unrest from the over-taxed continents. In the long run, however, Sargos knew the Monolith would provide Aestaria with virtually unlimited magical energy, while denying its rivals the same.",
    "Emperor Sargos enlisted the best and brightest minds of the Aestari Empire — mechanysts, loremasters, manaforgers, spellbinders — and directed their combined energies on designing and building the Monolith. The Thirteen Aspects counseled Sargos that building the Monolith was a mistake.",
    "Its construction would violate the Trinity Mandates, which were established to maintain and preserve Mythron’s harmony for future millennia. Some elder Aestari agreed, warning Sargos of the potentially dire consequences that would result from building the Monolith. Sargos ignored them all, confident in his decision and suspicious of their motives.",
    "Rallying the common people behind him under the banner of progress and Aestari pride, Sargos publicly denounced The Thirteen Aspects for trying to maintain the status quo at the expense of the Aestari people. He allocated a large percentage of harvested crystals to building the Monolith, but at the same time rescinded the First and Second and Third Mandates, giving the people once more unfettered access to the crystals.",
    "The popularity of Emperor Sargos and his Monolith soared as the Aestari people envisioned a limitless supply of magical power, and a glorious new world order."
  ].join("\n\n")
}

c[CodexChapters.Chapter19] = {
  id: CodexChapters.Chapter19,
  name: "19: Breaking of the Thirteen Aspects",
  description: "22,765 AE",
  img: RSX.chapter19_preview.img,
  background: RSX.chapter19_background.img,
  #audio: RSX.chapter19_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 18,
  text: [
    "The construction of the Monolith continued for two decades, slowly, inexorably exhausting all of Aestaria’s crystals. By the time the Monolith was three-quarters complete, the last Aestari crystal had been consumed.",
    "Wholly dependent on foreign crystals and forced to endure greater austerity than the original Aestari Mandates had ever caused, the people turned against the Monolith, and the Emperor who had envisioned it. Sargos’s inner circle became fractured by factional fights and personal disputes, as even the most privileged Aestari were now forced to chase after an ever-dwindling supply of crystals.",
    "One night, Valknu had a dream in which an inky cloud consumed the Golden Chrysalis and turned Mythron’s continents into crumbling ash. It weighed on him tremendously and after much meditation, Valknu made the decision to disband The Thirteen Aspects, splintering them away from God’s Heel.",
    "Callixylon fled to Southern Aurora; Jhorxia to the Dunes of Ma’or. Kraigon went to Ash Valley; Ishtara to the Azure Mountains. Nharmyth hid in the Emerald Vale; Paarnax to Shim’Zar Jungle. Ka’al went to the Shadowlands; Ragnora to the Obsidian Woods. Taevarth went to the Forbidden Steppes; Yrsada to the Cobalt Isles.",
    "Starhorn travelled to the Fist of the Four Winds, which guarded the secrets of the four elemental spheres, and eventually settled alone in the Whispering Blades.",
    "Vaath returned to Magaari, where he tamed the wild Makantor beasts near Mokvalar and used his magic to evolve creatures in the secluded Beastlands, metamorphosing them into the first Kolossi.",
    "He used Star Crystals to create new types of Golems near the Stormmetal regions and built the Amberhorn Citadel, where he invited all the sentient creatures on Magaari to join him. Valknu remained in the Grand Trianon with Emperor Sargos, awaiting the encroaching darkness."
  ].join("\n\n")
}

c[CodexChapters.Chapter20] = {
  id: CodexChapters.Chapter20,
  name: "20: The Coming of Rasha",
  description: "22,745 - 22,870 AE",
  img: RSX.chapter20_preview.img,
  background: RSX.chapter20_background.img,
  #audio: RSX.chapter20_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 20,
  text: [
    "As Aestaria’s dependence on imported crystals far outstripped even the onerous tribute taxes imposed on the vassal continents, it began to accumulate massive debts. The mercantile class became increasingly powerful. With few opportunities in the moribund Aestari economy, military service gained in popularity among the increasingly disaffected Aestari youth — and it gained in prestige, as well.",
    "This shift in the socio-economic paradigm gave birth to an elite warrior class, called the Fists of Akrane in honor of the legendary Swords of Akrane from the Age of Wonder. By the time an ambitious young soldier named Rasha became the Lord Marshall of the Realm, the mercantile and warrior classes represented the true power in Aestaria — reducing Emperor Sargos to little more than a figurehead.",
    "Rasha had enlisted as a commoner orphan with no royal blood and had quickly risen up through the ranks to Field Marshal during the Shadowlands campaign. He transformed the Fists of Akrane into the dominant military power in Aestaria. Led by Rasha, they pushed their own agenda and won the hearts of the common people, who saw Emperor Sargos as ineffectual and the Great Aestari Council as an inefficient bureaucracy run by privileged elites in lofty white towers.",
    "As part of the Inner Council, Lord Marshall Rasha supported the Emperor’s view that construction of the Monolith should continue to completion. Rasha agreed it was critical that Aestaria not be dependent on external resources in the future. However, he also thought Aestaria was weakened by its reliance on foreign trade and the mercantile class.",
    "He believed a simpler strategy to meet Aestaria’s needs was to take what it wanted using its unrivaled military. Out of the Fists of Akrane, he developed the Kurikan, or Swift Wind, a secret sect of elite assassin spies answerable only to him. Valknu warned Sargos of Rasha’s growing power, but Sargos no longer trusted the Magmar or their motives and quickly dismissed the warnings as just another one of their misleading ploys."
  ].join("\n\n")
}

c[CodexChapters.Chapter21] = {
  id: CodexChapters.Chapter21,
  name: "21: Rasha's Betrayal and the Eternal Empire",
  description: "22,885 - 22,905 AE",
  img: RSX.chapter21_preview.img,
  background: RSX.chapter21_background.img,
  #audio: RSX.chapter21_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 22,
  text: [
    "'It’s better to be hanged for loyalty than be rewarded for betrayal.' -Valknu, Thirteen Aspects",
    "Emperor Sargos rejected Rasha’s aggressive militarism, and it became a source of growing animosity between them. After one of many arguments on how to control the provinces, Rasha sought solitude within the unfinished Monolith’s Inner Sanctum. Without knowing that someone else hid in the shadows, he snapped a sacred twig from the Weeping Tree. Viscous red sap wept from the wound, The Tears of Eyos.",
    "Curious, he tasted it, and immediately felt a wellspring of magical power surge through his veins. Eyos’ lifeblood augmented his physical strength and drastically improved his ability to Bind and Surge his magic far beyond even crystal-enhanced levels. Rasha kept his discovery secret, surreptitiously returning to consume the sap again and again. With this new source of magical energy, he consolidated his power, enhanced his military force, and with his Kurikan enforcers, imprisoned his political enemies.",
    "His continued exposure to the Tears of Eyos eventually overwhelmed Rasha's mind, driving him mad with power and an unquenchable thirst for more. Under the cover of night, Rasha and his Kurikan swept through the Grand Trianon and the Aestari Palace, ignobly murdering Sargos in his bedchamber. His warband invaded each school of the Seventh Sanctum, executing any who remained loyal to Sargos.",
    "Valknu alone put up a heroic fight, but he was ultimately no match for the combined power of Rasha’s forces. Sargos had shared his suspicions that the Magmar were hiding something powerful, so Rasha threw Valknu into the palace’s deepest dungeon and tortured him in a futile effort to learn the Magmar’s secrets. Though imprisoned, Valknu magically communed with his fellow Magmar, warning them of Rasha’s betrayal.",
    "Rasha proclaimed himself the High Emperor, the Lord Magnus. He renamed Aestaria, “The Eternal Empire,” believing himself the fulfillment of the Prophecy of Ages. As Rasha’s madness and addiction made him increasingly brutal, stories of his opponents’ imprisonment and slaughter spread, entire families murdered, their ancestral homes burned to the ground.",
    "Some Aestari rebels hid in the mountains, but many more fled across the increasingly turbulent oceans. A small number even reached Kaero and the other continents, but many more drowned or were hunted down. As the unfinished Monolith lay all but forgotten, Rasha and his armies turned their attention outward."
  ].join("\n\n")
}

c[CodexChapters.Chapter22] = {
  id: CodexChapters.Chapter22,
  name: "22: The Vetruvian Wars",
  description: "22,905 - 22,915 AE",
  img: RSX.chapter22_preview.img,
  background: RSX.chapter22_background.img,
  #audio: RSX.chapter22_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 24,
  text: [
    "'The backbone of surprise is fusing speed with secrecy.' -Carl von Clausewitz",
    "With Aestaria now stripped of all its crystals, the madness of High Emperor Rasha seemed to spread beyond the world of men, to infect Mythron itself. Earthquakes shook the ground, great storms churned through the air, and maelstroms roiled the seas. The same destructive madness that fueled Rasha’s lust for power also heightened his feeling of invincibility. He became increasingly obsessed with the Sun Crystals of the Lyonar Kingdoms and the Star Crystals of the Vetruvian Empire – and nothing would stop him from possessing them for himself.",
    "Aestaria was already burdened by the size of its military, but Rasha pushed harder, drafting even more young Aestari men into the largest army Mythron had ever seen. He diverted massive resources to building up his navy, constructing new ships and commandeering merchant ships that had elected to stay in port rather than challenge the turbulent seas. With his navy doubled in size in a few short months, Rasha planned to cross the seas and flood Vetruvia in a wave of Aestari military might, conquering their lands and seizing control of their Star Crystals.",
    "As his ships set sail, many of Rasha’s staunchest supporters were beginning to doubt his sanity. But he landed all of his capital warships on the beaches of Kaero, without a single loss. To the Vetruvians’ shock and horror, Rasha’s fifty thousand troops overtook the city in a matter of days. His success fanned the flames of his burning madness and bolstered his certainty that he was the embodiment of a great destiny.",
    "High Emperor Rasha and his troops unleashed a wanton orgy of destruction, slaughtering men, women, and children, pillaging the ancient city of Kaero and razing the revered Ostracon. As Rasha’s army swept southward, taking Tyvia and Murani, pillaging everyone in their wake, even his gravest doubters came to believe in his invincibility."
  ].join("\n\n")
}

c[CodexChapters.Chapter23] = {
  id: CodexChapters.Chapter23,
  name: "23: The Rise of Ziros Starstrider",
  description: "22,905 - 22,915 AE",
  img: RSX.chapter23_preview.img,
  background: RSX.chapter23_background.img,
  #audio: RSX.chapter23_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 26,
  text: [
    "'When the enemy is relaxed, make them toil. When full, starve them. When settled, make them move.' -Sun Tzu, The Art of War",
    "Among the thousands of Vetruvian refugees fleeing the Aestarian onslaught was a Tyvian teenager named Ziros Starstrider. A descendant of Atar Startstrider, he had been raised in the desert by the sisterhood of Aymara Healers. Along the journey south toward the Aymara Canyons, Ziros joined with the resistance, skillfully skirmishing with their Aestari pursuers and effectively harrying Rasha’s army so that the women and children could reach safety.",
    "Ziros proved to be a natural strategist, leading many successful forays against the Aestaris. Between his tactical prowess and his vast knowledge of the canyons, cliffs and desert water mines — and the slaughter of the other Vetruvian leaders along the way — by the time the refugees arrived at the edge of the Aymara Canyons, young Ziros had become the de facto leader of the Resistance. Ziros brought the civilian refugees through the El-Gamesh desert, sending them to Pyrae and Petra before returning to the Aymara Canyons, where he would lead a last stand against the marauding Aestaris.",
    "Outside of the coastal city of Tyvia, Rasha’s forces were unfamiliar with the terrain and thus unprepared for the searing, desiccating heat of Vetruvia’s deserts. They didn't have the resources or the supply lines to take Pyrae and Petra, not with Ziros’ resistance fighters picking them off along the way. Ziros realized that even with a small measure of assistance from the Songhai or the Lyonar, they could defeat Rasha and end the Aestari aggression once and for all. He sent messages to both nations, describing the situation, asking them for help, warning them that they would be Rasha’s next victims.",
    "As the Aestaris assembled at the edge of the canyon and prepared for their next advance, Ziros received his replies from the Lyonar and the Songhai. They both said the fight was between Vetruvia and Aestari. Neither nation would come to their aid. Ziros vowed he would never forgive them, swearing an oath on the blood of his ancestors that he would not assist them in their time of need.",
    "He then came up with another plan."
  ].join("\n\n")
}

c[CodexChapters.Chapter24] = {
  id: CodexChapters.Chapter24,
  name: "24: Starstrider’s Final Gambit",
  description: "22,916 AE",
  img: RSX.chapter24_preview.img,
  background: RSX.chapter24_background.img,
  #audio: RSX.chapter24_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 28,
  text: [
    "'Nothing is more dangerous to those who are thirsty than the mirage of water in the desert.' -Ziros Starstrider",
    "Ziros suspected that what Rasha really sought was the location of the Star Crystal fields hidden in the Aymara Canyons. Inspired by the blinding desert sun, Ziros devised a bold ploy to lure Rasha away from the crystal-rich canyons. He had his metalmancers collect every scrap of metal that was not weapon or piece of armor, and forge them into crystalline shapes, imbuing them with a luminescent shine. He formed a squad of Orb Weavers who knew the location of every water mine in the Akram Desert, and he sent them to place the real crystals at the outer western edge of the Akram Desert while replicating the fake ones atop the deeper dunes one day’s march inside it.",
    "At sunrise, three brave Scions from one of Vetruvia’s oldest clans, House Volari, agreed to a sacrificial mission to lure Rasha’s patrols to the edge of the Akram Desert before letting themselves be captured. The enemy patrol found the real crystals and saw the fake ones in the distance, gleaming in the morning sun. Even under Rasha’s horrific torture, the captured noble Scions swore those were the Star Crystal fields. Overwhelmed with his desire for the crystals, Rasha mockingly granted each Scion a dying wish before executing them, then marched his army through the night.",
    "They arrived at Akram Desert, exhausted, just as the sun’s first golden rays lit up the crystals, both real and fake. Rasha again ordered his men ahead without pause. They lost hundreds to the heat. By nightfall it seemed the priceless crystal fields were almost within reach. But not quite. Even through his madness, Rasha knew his men needed rest. In the cloak of night, while Rasha’s exhausted army slept, Ziros’ squad moved and astral phased the fake crystals another day’s march east, deeper into the Akram Desert.",
    "At dawn, Rasha insisted it must be a trick of the desert sun. He ordered his men to march yet again. That day the blistering heat took thousands. By nightfall, the Crystal Fields were still just out of reach and Rasha’s men were even more desperate for rest than the previous night. Once more, Ziros’ men moved the fake crystals, and in the morning, Rasha ordered his men even deeper into the desert.",
    "By noon, when Ziros and his Dunecasters finally attacked, half the Aestaris were already dead; the rest driven mad with thirst. But not as mad as their Emperor, who fought on until the lifeblood of his last man drenched the sands and gave mute testimony to the Vetruvian’s vengeance. Ziros, still consumed with revenge, had his men build a monument where he fell — Rasha's Tomb — and buried Rasha and his men inside it, cursing them to burn for eternity in the scorching desert heat."
  ].join("\n\n")
}

c[CodexChapters.Chapter25] = {
  id: CodexChapters.Chapter25,
  name: "25: The Aestari Embargoes",
  description: "AE 22,916 - 23,055",
  img: RSX.chapter25_preview.img,
  background: RSX.chapter25_background.img,
  #audio: RSX.chapter25_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 30,
  text: [
    "'Aestaria will never set foot on Vetruvian soil again.' - Ziros Starstrider",
    "After his forces’ victory over the Aestari in the Battle of Akram, Vetruvia became an unrivaled global power and General Ziros its undisputed leader. Vowing that his people would never again suffer the way they had at the hands of Rasha’s forces, Ziros’ first act was to bolster Vetruvia’s military and to heavily fortify the cities of Petra and Kaero. Next, he focused his sights on the source of the aggression — Aestaria itself.",
    "General Ziros sought to punish the Aestaris and limit their ability to wage future wars of aggression. He reinstituted the Aestari Mandates, but applied them this time only to the Aestaris. Further, he proclaimed that the center continent was completely banned from the crystal trade and the usage of crystals, and pledged Vetruvia’s military power to enforce the embargo. Having witnessed the utter defeat of the Aestaris, none would risk challenging the Vetruvian policies. The surrounding continents complied, completely cutting off all crystal trade with the center, starving them and their way of life. The Aestaris sent envoys to the other continents seeking aid, but none would defy Vetruvia.",
    "Ziros’ hatred for the Aestaris consumed him, and he ruled over them with an iron fist. Ziros did not care that many Aestaris had disagreed with Rasha, that some had fought him, resisted him — even plotted against him. Ziros uniformly punished them all, turning potential allies into silent enemies. The Aestari economy was in ruins and their crystal supply exhausted, turning their lives into a daily struggle for even the bleakest survival. The more the Aestaris suffered and starved under the Vetruvian hegemony, the more Ziros unwittingly created the perfect breeding ground for extremism to flourish."
  ].join("\n\n")
}

c[CodexChapters.Chapter26] = {
  id: CodexChapters.Chapter26,
  name: "26: Consular Draug and the Vermillion Legion",
  description: "AE 23,055 - 23,090",
  img: RSX.chapter26_preview.img,
  background: RSX.chapter26_background.img,
  #audio: RSX.chapter26_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 32,
  text: [
    "'Desperation is sometimes as powerful an inspirer as genius.' -Benjamin Disraeli",
    "If Aestaria during the embargo was the perfect place for extremism to grow, Consular Draug was the perfect leader to capitalize on it. A charismatic practitioner of the forbidden arts, Draug had created a religious sect called The Crimson Flame, a secret society of fanatics whose growing influence fanned the smoldering flames of Aestari nationalism. The Aestari were the first true people of Mythron, Draug taught, born as the children of flaming stars, raised from the old Vermillion Forests. They deserved to rule themselves and all the younger races that populated the other continents. According to Draug, the Aestaris would always be the rightful heirs to Mythron; it was their destiny to take their rightful place.",
    "From his unremarkable beginnings as a heretic preacher outside the walls of the Seventh Sanctum, Consular Draug quickly rose to great power in only a few short years. Achieving a cult-like status, he assembled a devoted army of religious zealots called the Vermillion Legion. He rehabilitated the memory of Emperor Rasha and carefully studied his military strategies and political successes, as well as his failures. The more he emulated Rasha, the more he sought to correct the High Emperor’s final defeat. Thus inspired, he began devising an elaborate plan to invade Vetruvia once again.",
    "Draug’s first move was to establish a secret alliance with the Lyonar’s High Council leaders from Baast, Caerme, Windcliffe, and Lyr, appealing to their resentment of Vetruvian primacy and appeasing them with promises of spoils from Vetruvia’s defeat. Only the leaders of Sunforge refused to attend. His northern flank largely secured, he then sent his warships on a surprise attack on the Songhai capital, Xaan, sinking the unsuspecting Songhai fleet stationed at port with little difficulty. At the Battle of Three Crossings, General Taegon from Kaido issued desperate pleas for help, but the Lyonar were complicit with Draug, and Ziros remained true to his oath never to aid the Songhai, who had left the Vetruvians to rot in their greatest hour of need. Draug moved past Xaan and conquered Kaido, consolidating his power over the entire continent of Xenkai. The world was shocked, but even as Draug turned his attention to Vetruvia once again, no one would come to the aid of his victims.",
    "Or almost no one..."
  ].join("\n\n")
}

c[CodexChapters.Chapter27] = {
  id: CodexChapters.Chapter27,
  name: "27: The Path of the Five Sisters",
  description: "23,085 AE",
  img: RSX.chapter27_preview.img,
  background: RSX.chapter27_background.img,
  #audio: RSX.chapter27_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 34,
  text: [
    "The five noble sisters of House Khaleem had always seen the world differently. There were two sets of twins: Elika and Anobi were sixteen; Dreena and Naidi were seventeen. They were led by eighteen-year- old Cassyva, the eldest, who, although impulsive, had recently begun to display the beginnings of a great gift in magic. Descendants of Atar Starstrider, members of the Order of Staar, and distant cousins of Ziros, they were known for their unrivaled beauty and keen intelligence, astounding melee skills, and most of all, their boundless compassion. Distraught at the suffering caused by Draug’s burgeoning wars, they decided that regardless of Ziros’ decrees, they needed to help. They were planning to smuggle an assortment of Star Crystals into Xenkai to help the Songhai people, when their grandmother, Regent Visala, discovered their plan. Although heartbroken, she pledged not to stop them. But first, she told Cassyva that there was a secret she must share, in case this was her last opportunity to do so.",
    "When Regent Visala was a young girl, her father, Lord Khaleem, took her to the Grand Trianon, where she saw the famous Lord Marshall Rasha. Fascinated, she followed him into the newly built enclosure of the Weeping Tree. He seemed angry, so she hid, watching as he plucked a twig from the Weeping Tree and tasted the bright red sap that oozed from the ancient bark. He seemed to enjoy it so much that when he left, she tried it herself – gaining a measure of the same great magical powers as the Lord Marshall himself. Terrified, she had never told anyone. But recently, Visala had seen that Cassyva was developing those same powers, and she suspected her sisters would too as they grew older. Such power can be a burden, Visala said, and it comes with an even greater responsibility.",
    "After a tearful farewell, the sisters of Akram travelled to the continent of Xenkai. The people were devastated, and the Songhai government in ruins. The sisters helped where they could, but Cassyva grew increasingly frustrated. Helping people one at a time was not making a difference fast enough. They were powerful nobles with extraordinary abilities, and Cassyva impatiently decided they had to work on a broader scale, as part of an organized effort. So the sisters decided to seek answers to their questions by embarking on a journey into the Saberspine Mountains to find the only Old Empire institution still left standing, the Chakri Monastery."
  ].join("\n\n")
}

c[CodexChapters.Chapter28] = {
  id: CodexChapters.Chapter28,
  name: "28: A Landing on Styxus",
  description: "AE 23,090 - 23,092",
  img: RSX.chapter28_preview.img,
  background: RSX.chapter28_background.img,
  #audio: RSX.chapter28_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 36,
  text: [
    "Having extensively studied High Emperor Rasha’s failed invasion of Vetruvia, Consular Draug decided that rather than scissor attack from the North, as Rasha had, he would skirt Kaero and Petra Fortress entirely and sail around to the southwest side of El-Gamesh. He knew this meant navigating his ships through the unpredictable Sea of Judgment. It was a calculated risk, and one that would have many unforeseen consequences for Consular Draug.",
    "Soon after setting sail, Draug's ships were swept up in a sudden maelstrom of unprecedented violence. Miraculously, none of the vessels sank, but the fleet was swept wildly off course. When the maelstrom subsided, Draug found his ships off the coast of a primitive and unfamiliar land. At first, he thought they had arrived on the Magmar continent of Magaari, but his men found it populated by strange lizard-like creatures, sentient but underdeveloped, frightened and frail. Pressing farther inland, they found vast desolate plains littered with unharvested crystals. Draug had never seen anything like it. Gleefully, he praised his own good fortune, marveling at the abundance of untapped crystals. They would be his source of power and the perfect secret weapon against the upstart nations.",
    "Draug tried to question the serpentine creatures with his Mindwarpers, but sensing his true nature, they refused to speak to him. Under torture, they eventually revealed that Draug was in the peninsula of Ixus, on the continent of Styxus, and that they were the surface-dwellers, the Serpenti. When Draug asked what lay below the surface, the Serpenti grew even more afraid and more reticent. Only after the most painful interrogation did the terrified creatures tell him of the darkness that lay underground. Slipping in and out of consciousness, the Serpenti described scenes almost beyond Draug’s imagination, with giant subterranean cities made entirely of crystals."
  ].join("\n\n")
}

c[CodexChapters.Chapter29] = {
  id: CodexChapters.Chapter29,
  name: "29: The Second Vetruvian Wars",
  description: "AE 23,092 - 23,105",
  img: RSX.chapter29_preview.img,
  background: RSX.chapter29_background.img,
  #audio: RSX.chapter29_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 38,
  text: [
    "Draug established a base on the Ixan peninsula closest to Aestaria, calling it Shar. Bolstered by the crystals from Ixus, the Vermillion Army mushroomed in both number and power. Draug grew stronger, too. Combined with the dark arts of the Crimson Flame, the new supply of crystals rendered him all but immortal. Draug’s forces were eminently prepared for a frontal assault on Vetruvia, and General Ziros, oblivious to their new power, never saw the attack coming. The Vermillion Legion and their Storm Rooks tore through Petra Fortress like dry paper, battering through the ancient walls of the once formidable citadel. Ziros and his army fought valiantly, but they were severely outmatched.",
    "Draug and his army were unstoppable, sweeping virtually unimpeded over Vetruvia. Ziros nobly sacrificed himself, remaining behind to delay Draug’s forces by activating a blockade of protective Obelysks while what was left of the Vetruvian army fled through the plains of El-Gamesh. Draug brought Ziros’ head and shattered Sand Shield back to Aestaria and proclaimed himself Conqueror Draug, ruler of the Eternal Empire, the Second Empire foretold by the Prophecy of Ages. While the other nations kept silent, in awe and in fear, the Lyonar Kingdoms finally took a stand against Draug’s aggression. Alone, they were no match for the Vermillion Army, and in a matter of days both Windcliffe and the longstanding Opaline Gates were toppled by Draug’s superior forces. The Lyonar fell back past the Forbidden Steppes through Agenor’s Pass, where General Trajan from Sunforge took their last stand — but Lyonar itself was no more.",
    "Through military defeat or preemptory surrender, the other continents soon fell to Draug as well, all except Magaari. Vaath led an assembled host of powerful Leviathans, long-range Spirit Harvesters, fearless Phalanxars, and a devoted Veteran Silithar force as it landed in an epic clash that left tens of thousands dead. Known as the Battle of Serpent’s Coil, the battle lines pitched back and forth, at times approaching, but never reaching, the Amberhorn Citadel deep in the continent. Eventually, Vaath’s combined forces pushed the Vermillion Army back to the foothold where they Khahad first landed, a place henceforth known as Draug’s Landing. On a final day of battle as ferocious as the first, Vaath’s forces drove the Vermillion Army back onto their warships — and out of Magaari — for now."
  ].join("\n\n")
}

c[CodexChapters.Chapter30] = {
  id: CodexChapters.Chapter30,
  name: "30: The Five Fanblades",
  description: "AE 23,092 - 23,105",
  img: RSX.chapter30_preview.img,
  background: RSX.chapter30_background.img,
  #audio: RSX.chapter30_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 40,
  text: [
    "The Chakri Avatars welcomed the Khaleem Sisters of Akram, impressed by their innate kindness and their deep drive to help others. The sisters, in turn, were struck by the contemplative peace of the Monastery, and by the incorruptible goodness of the Avatars, who were already aiding large numbers of the Songhai. Together, they improved the lives of vast numbers of the war-weary.",
    "The sisters fell in love with the Monastery. After long days helping the needy, they would pore over rare books and priceless manuscripts, drinking in knowledge. But even though Cassyva could see the difference they were making in many people’s lives, she was all too aware of the vast suffering that remained. Soon, the sisters once again felt they should be doing more. Cassyva spoke to the Avatars and asked what more they could be doing to help alleviate the continued suffering caused by Draug’s savage predations. After much discussion, the Avatars invited the sisters to join them, to become Chakri Avatars themselves.",
    "Cassyva and her sisters were honored, flattered and tempted, but they had already begun to consider a much different approach. While the Avatars had been contemplating, reports began to come in detailing Consular Draug’s newest conquests, and even greater atrocities committed in more and more lands. They learned of Draug’s discovery of a new source of crystals in a place called Ixus, how, empowered and emboldened by a vast supply of mana-rich crystals, he was planning on expanding his aggression even further. Led by Cassyva, the sisters had come to a much different conclusion about what they must do next. The most humanitarian thing to be done was to stop Draug — in whatever way they could. And the only way the sisters felt they could stop Draug would not be very compassionate at all. But, ultimately, they agreed. They incorporated many of the Chakri Avatars’ teachings and became something wholly new, the Keshrai Fanblades.",
    "For the sake of the entire world, Consular Draug had to die."
  ].join("\n\n")
}

c[CodexChapters.Chapter31] = {
  id: CodexChapters.Chapter31,
  name: "31: The Age of Decay",
  description: "AE 23,105 - 23,205",
  "“Consular Draug!” Cassyva called out as he was about to disappear into the ship. He paused at the sight of five distant beauties in resplendent gowns approaching the blocked walkway. There was no time for Cassyva to use the Star Crystals, to consult with her sisters, or even to think things through. There was only time to act. In a single motion she pulled five blades hidden in her sleeves and cast them with as much magical force as she could summon. They spiraled and sliced through the air with deadly accuracy toward Draug...but at the last moment ricocheted harmlessly off an invisible magical barrier surrounding him. As it was, he watched impassively as the magically siphoned blades instead skewered his elite Defenders as they crumpled into the water with unceremonious splashes. Draug smiled and said, “Kill them.” Then he was gone."
  img: RSX.chapter31_preview.img,
  background: RSX.chapter31_background.img,
  #audio: RSX.chapter31_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 42,
  text: [
    "The Aestari people enjoyed a brief moment of peace and plenty before Draug revealed his true colors. Enriched by the nations he had conquered, fortified by the crystals from Ixus, and secure in his dominion over almost the entire known world, Draug’s reign became increasingly brutal and autocratic. Over it all, representing the failures of two rulers, loomed a mockery of Aestari greatness — the unfinished Monolith. Draug knew the rest of the world saw it as symbolic of the limitations of Aestari power. For his singular greatness to be undeniable, and for Aestaria’s primacy to be unquestioned and secure, he would have to complete what his predecessors could not.",
    "Construction of the Monolith resumed, and between it and Draug’s vast appetite for power, the once plentiful supply of crystals was again exhausted. Draug issued mandates of his own, reserving the dwindling supply of crystals for him and his inner circle — and for the construction of the Monolith. Magic became outlawed for commoners, and over time, ignorance and superstition spread, corrupting the truth and distorting centuries of arcane knowledge. The earthquakes and storms grew worse with each year, and the people intuitively knew it was a result of Draug’s wanton consumption of the once plentiful crystals. In their minds, magic became dark and mysterious, reviled as if it was the source of trouble, instead of its misuse."
  ].join("\n\n")
}

c[CodexChapters.Chapter32] = {
  id: CodexChapters.Chapter32,
  name: "32: The Vanishing Window",
  description: "AE 23,105",
  img: RSX.chapter32_preview.img,
  background: RSX.chapter32_background.img,
  #audio: RSX.chapter32_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 44,
  text: [
    "“To save many lives, sometimes one must be taken.” - Cassyva Starstrider",
    "In Aestaria, Consular Draug remained sequestered in a heavily guarded palace. While overseeing the crystal mining operations in Ixus, however, he was much more vulnerable. Cassyva and her sisters decided that was their only hope of getting to him. They stowed away on a supply ship to Shar, and under cover of the bloodmoon night slipped into the unfamiliar shadowy ruins. Setting camp on a ridge overlooking Draug’s fortified compound, they planned to spend weeks studying the surrounding geography and Draug’s daily routines. Early the first morning, however, Cassyva watched another nearby dock and realized their window was vanishing — Draug was leaving. She woke her sisters, and as they watched Draug prepare to depart on a massive warship, soon realized that this might be their best chance to remove Draug from power — even their last chance. Now was the time to act.",
    "With deathstrike-imbued blades and mana-rich crystals hidden beneath elegant gowns, they hurried to the dock. They were among the most skilled fighters in Akram, but here they were vastly outnumbered. The sisters knew surprise was their greatest weapon, and their incongruous appearance would make their attack even more unexpected. From the moment they entered the camp, each man they passed turned to stare at them. They reached the dock just in time to see Draug and his cadre of Sworn Defenders at the top of the walkway. Hundreds of Draug’s soldiers were watching the sisters. Scores stood between them and their target.",
    "“Consular Draug!” Cassyva called out as he was about to disappear into the ship. He paused at the sight of five distant beauties in resplendent gowns approaching the blocked walkway. There was no time for Cassyva to use the Star Crystals, to consult with her sisters, or even to think things through. There was only time to act. In a single motion she pulled five blades hidden in her sleeves and cast them with as much magical force as she could summon. They spiraled and sliced through the air with deadly accuracy toward Draug...but at the last moment ricocheted harmlessly off an invisible magical barrier surrounding him. As it was, he watched impassively as the magically siphoned blades instead skewered his elite Defenders as they crumpled into the water with unceremonious splashes. Draug smiled and said, “Kill them.” Then he was gone."
  ].join("\n\n")
}

c[CodexChapters.Chapter33] = {
  id: CodexChapters.Chapter33,
  name: "33: Birth of the Abyssians",
  description: "AE 23,105",
  img: RSX.chapter33_preview.img,
  background: RSX.chapter33_background.img,
  #audio: RSX.chapter33_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 46,
  text: [
    "The Five Sisters valiantly fought their way against the back of the Bonemaw Mountains. Surrounded by Draug’s soldiers and with nowhere else to turn, they fled into a cave and were chased deeper and deeper, into a vast network of underground caverns. By the time they lost their pursuers in the darkness, the sisters were lost as well. Cassyva’s skin prickled at the insistent feeling that something else was now following them. Each possible exit took them farther underground, until finally, they saw a shimmering light. But instead of leading them to the surface, they found themselves in a large domed cavern bathed in the soft glow of crystals. And they were not alone.",
    "The creatures were Inxykree, the female counterparts to the merciless male Inxikrah. Six adults tended a dozen infants, all pure white and reptilian with large faintly glowing cloudy eyes, intelligent but inscrutable. The adults turned and hissed, displaying needle-like fangs and razor-sharp claws. Cassyva paused. They had sworn only to use the Star Crystals to stop Draug, but they couldn’t do that dead. Cassyva shouted “Now!” raising the crystals and infusing the five sisters with magical energy. But it was already too late. The Inxykree struck without hesitation, their keen claws tearing the sisters into bloody shreds before they could expend the magic they had absorbed.",
    "Then the Inxykree and their young consumed them.",
    "The Inxykree absorbed the powers, abilities, and knowledge of their prey. But they had never consumed creatures such as these: benevolent, intelligent, born of magical blood and infused with Star Crystal power. Outwardly, the Inxykree were drastically altered, manifesting the sisters’ beauty in a way that made them look almost human. Inwardly, the transformation was even more profound. “What happened? What have we done?” they asked, looking at their changed bodies, at the carnage on the floor. “What are we?” An Inxikrah male entered, glaring at them. “You are not Inxykree,” he said, baring his cruel fangs. “This is not your Abyss,” he shouted and attacked. The Inxykree had lost their talons and fangs, but had kept their speed and strength — and had gained the skills of the five sisters. They seized the bloody weapons from the floor and slayed the Inxikrah. “He’s right,” they said in one voice. “We are Inxykree no more. We must find an Abyss of our own.”"
  ].join("\n\n")
}

c[CodexChapters.Chapter34] = {
  id: CodexChapters.Chapter34,
  name: "34: The Emergence of the Bloodbound",
  description: "AE 23,105 - 23,203",
  img: RSX.chapter34_preview.img,
  background: RSX.chapter34_background.img,
  #audio: RSX.chapter34_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 48,
  text: [
    "After Rasha’s defeat, Valknu escaped the Aestarian dungeons before Draug’s ascension and traveled to Xenkai. As Draug’s brutal reign dragged the world closer to complete chaos, Valknu met with the Chakri Avatars, and quietly sent them out across the continents. Their mission was to gather libraries of ancient texts and manuscripts, including any artifacts that survived from the Seventh Sanctum and the Ostracon. The Age of Chaos was coming. Valknu and the Chakri Avatars intended to preserve the collected knowledge for posterity and to save it from the madness to come.",
    "They brought the texts back to the Chakri Monastery in the Saberspine Mountains, and there, Valknu and the Chakri Avatars remained, protecting the assembled knowledge of Mythron while they bided their time, waiting for the right moment to strike at the forces of evil. While Draug and the Ixikrah devastated the world with their bloody battles, the Chakri Avatars evolved into a secret cadre of resistance fighters. For one hundred years they waited, training and practicing under the guidance of Valknu, honing the self-discipline they would need to one day wield great power without abusing it.",
    "As the prophecy foretold, darkness reigned in the form of a protracted war between the ascendant forces of Draug and the Inxikrah. With every indication that the conflict was headed to an inevitable cataclysmic battle, Valknu and the Chakri Avatars took the desperate journey to Deladriss Peake, the secret location of the Great Tree Aperion. Valknu conferred with the Seidir and the Vanar, ultimately convincing them that the Chakri Avatars were worthy and the situation so dire that they must all be empowered — reborn — through the Blood of Aperion. Only together with Aperion’s power — and only as the First Bloodbound — could they hope to conquer the forces of Draug and the Inxikrah, and pave the way for the true Second Empire."
  ].join("\n\n")
}

c[CodexChapters.Chapter35] = {
  id: CodexChapters.Chapter35,
  name: "35: Draug’s Last Hope",
  description: "AE 23,203 - 23,205",
  img: RSX.chapter35_preview.img,
  background: RSX.chapter35_background.img,
  #audio: RSX.chapter35_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 50,
  text: [
    "With the Inxikrah advancing, severely limiting the supply of crystals from Ixus, Draug found himself on the defensive. His power was diminished, his enemies were emboldened, and the Monolith, now a symbol of his reign, remained maddeningly incomplete. For the first time, Draug felt the hot breath of defeat, like a cloud of Inxikrah venom on the back of his neck. In despair, with defeat looming ever closer, he went alone to commune with the Weeping Tree. And there he found an answer to all his problems. The Weeping Tree was covered in luminous, crystalline buds.",
    "In Draug’s mind, this changed everything. Scholars of the natural record said The Great Tree of Eyos bloomed every ten thousand years. It had been barely four thousand since the last blooming, but no one knew how that would be affected by the removal of the tree’s Heartwood, centuries earlier. Although weakened by age and injury, the Weeping Tree was still unimaginably powerful. A blooming would release petals containing immense magical energy, perhaps equaling a third or even a half of all the crystals that had ever existed on Mythron. Draug was determined that his enemies, especially the Inxikrah, would be denied this power. And he was equally determined that he would possess it — all of it.",
    "Facing a deadline that could represent his ultimate downfall or his supreme triumph, Draug redoubled his efforts to complete the Monolith, to fully enclose the Weeping Tree and the crystal power it would soon release. He told no one of the mana-imbued buds he had seen, and protected his secret by declaring the interior of the Monolith off-limits to anyone but himself. As construction accelerated, so did the imbalance of magical energy, causing increasingly erratic weather, wildly turbulent seas, and tectonic instability. Sensing Draug’s weakness, the Inxikrah pressed their advantage, accelerating their attacks on Aestaria. But Draug knew that he only needed to hold them off until the Monolith was complete and the Great Blooming took place. Then Aestari primacy, and his own, would be secured for millennia."
  ].join("\n\n")
}

c[CodexChapters.Chapter36] = {
  id: CodexChapters.Chapter36,
  name: "36: The Floating of the Monolith",
  description: "AE 23,205",
  img: RSX.chapter36_preview.img,
  background: RSX.chapter36_background.img,
  #audio: RSX.chapter36_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 52,
  text: [
    "With construction nearing completion and the potent buds swelling on the Weeping Tree, Draug grew increasingly paranoid and dissatisfied with the protection the Monolith would provide. Throughout its construction he had been constantly revising his design, requiring more materials, more magical energy. Now, he directed his builders to dig even deeper underground, extending the Monolith’s walls far below the surface and inclining them inward, to surround the tree as fully as possible. When the builders excavated under the tree to do so, however, they found its roots withered, broken, and dead.",
    "But the tree itself was somehow alive — in fact it was preparing to bloom. Draug realized it was surviving on starlight alone, untethered to the planet’s core, and he had an idea how to finally render the tree inaccessible to anyone but him. It would exhaust his vast stores of magical energy, but once accomplished, it would pay off a thousand times more. Draug sent his builders back under the weeping tree to fully encapsulate it, even across the bottom. It was an incredible feat of advanced engineering and powerful magic. Many workers died in the process. And when they were done, when the Monolith was finally completed, Draug killed the rest of them to protect his secret.",
    "Finally, concentrating all the power of his remaining crystals in a single blast of magical energy unparalleled in Mythron’s history, Draug raised the entire Monolith and secured it permanently in the sky. The waves of magical disturbance this released caused a Great Disjunction that rocked the planet to its core, destabilizing the continents and setting them in motion. Weakened and spent, Draug was nonetheless awestruck by what he had achieved. All he had left to do was wait for the tree to bloom once more — and he would be infinitely more powerful than ever before.",
    "Unfortunately for Draug, that was when Aq’Toth, leader of the Inxikrah host, ordered the attack on Aestaria."
  ].join("\n\n")
}

c[CodexChapters.Chapter37] = {
  id: CodexChapters.Chapter37,
  name: "37: The Weeping Tree Blooms",
  description: "AE 23,205",
  img: RSX.chapter37_preview.img,
  background: RSX.chapter37_background.img,
  #audio: RSX.chapter37_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 54,
  text: [
    "The Great Disjunction almost dashed the Inxikrah offensive before it began. Though they had absorbed the skills of their vanquished foes, the Inxikrah were a subterranean race and, therefore, inexpert ocean navigators at best. The churning seas claimed a quarter of them. But those that landed fought ferociously, viciously, sweeping across Aestaria, consuming their victims and growing smarter each day. The Vermillion Legion, all but leaderless, was easily conquered. Though victorious, the Inxikrah were weakened by the battle as well. But when Aq’Toth unceremoniously dismembered and consumed Draug, he mind melded and learned of the impending blooming of the Weeping Tree of Eyos, and the great power soon to be released within the Monolith.",
    "Having communed with the Weeping Tree, Valknu was aware of the blooming as well, and with Draug beaten and the Inxikrah weakened, he knew the moment to strike had arrived. He had no reason to suspect the Inxikrah knew the Weeping Tree was about to bloom, or the tremendous power its blooming would unleash. But he knew they must never be allowed to access it. If the Bloodbound could engage the Inxikrah now, they would be triumphant. If they allowed the Inxikrah to access the power of the Weeping Tree, the Bloodbound would fail. The Second Empire might never happen. Instead, the Inxikrah would plunge the world into another Age of Chaos, a thousand times darker than anything Draug had inflicted.",
    "It was sunset by the time the Bloodbound arrived at God’s Heel to head off the Inxikrah. The rest of the Magmar were already there. As they prepared for war, The Monolith hanging in the sky above them began to pulsate with color. The Star Lenses built to focus light inwards onto the Weeping Tree now refracted it outward instead in a brilliant display of iridescence that shone across the sky, illuminating all of God’s Heel in a fantastic display of coruscating lights. The Bloodbound felt buoyant, not just from the joyous nature of the spectacle, but as if gravity itself was undulating as well.",
    "The Great Blooming had begun."
  ].join("\n\n")
}

c[CodexChapters.Chapter38] = {
  id: CodexChapters.Chapter38,
  name: "38: The Battle of God’s Heel",
  description: "AE 23,205",
  img: RSX.chapter38_preview.img,
  background: RSX.chapter38_background.img,
  #audio: RSX.chapter38_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 56,
  text: [
    "For one joyous moment, the Bloodbound watched the Monolith illuminate the sky. Then the light revealed the Inxikrah army, assembling in the distance. Valknu was stunned. How had they mobilized so quickly? Had they somehow known the Weeping Tree was blooming? Before he could form a guess, a small band of lithe women-warriors approached from their rear. The Bloodbound turned to engage them, but their leader quickly said, “We come in peace. We come to help.” They were exquisitely beautiful, but not human, their skin as pale as moonlight, their eyes and hair a vivid green. “Who are you?” Valknu demanded. “We are Abyssians, from Ixus,” said their leader, pointing her Vetruvian-crafted Tyvian sword toward the Inxikrah. “We were once like them; we know they must be stopped.” She described the brutality of the Inxikrah, explaining in great detail how they ritually consumed their victims to gain access to their memories and powers. Valknu now realized how the Inxikrah knew the Weeping Tree was blooming, and that the stakes of this battle would be far higher than he had ever imagined.",
    "Valknu assembled the Bloodbound away from the Abyssians and shared what they had told him. He reminded them they were foremost the guardians of the secret location of the Great Tree Aperion. If any of them was killed and consumed, the Inxikrah could find the Great Tree. Hordes of them would sweep across Mythron, empowered by the Blood of Aperion. To win the battle ahead, they must not only keep the Inxikrah from the Monolith, but they must do so without losing a single Bloodbound warrior. They must protect their comrades at all cost.",
    "Then the Inxikrah charged.",
    "The Abyssians and Magmar fought alongside the Bloodbound, whose peerless magic countered the Inxikrah’s debilitating clouds of toxin. Throughout the night, God’s Heel seethed with clashing combatants, a cacophonous cauldron of violence bathed in the extraordinary light streaming from the Monolith. As dawn approached, the Inxikrah finally broke under the combined might of Mythron’s champions, and so began their retreat over the blood soaked ground, littered with the twisted bodies of their fallen. Valknu was torn: should he chase them down to secure Aperion’s clandestine location and risk leaving the Monolith vulnerable? Then, to his astonishment, he discovered not a single Bloodbound or Magmar or Abyssian had been lost. The Weeping Tree was safe — and so was the secret of Aperion’s location. The war was over."
  ].join("\n\n")
}

c[CodexChapters.Chapter39] = {
  id: CodexChapters.Chapter39,
  name: "39: Dawn of the Second Empire",
  description: "AE 23,205 - 23,380",
  img: RSX.chapter39_preview.img,
  background: RSX.chapter39_background.img,
  #audio: RSX.chapter39_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 58,
  text: [
    "The Second Empire dawned over a world ravaged by war, fraught with climatic and tectonic instability, and hobbled by chaos and evil. But there was also great optimism at the prospect of a New Age of peace and prosperity. After their victory in the Battle of God’s Heel, the Abyssians returned to Ixus and an uneasy coexistence with the Inxikrah. Many Bloodbound returned to Deladriss Peake or the Chakri Monastery, but many more chose to live among the people of their ancestors, and to rebuild. As individuals, they possessed the skills, talents, and characteristics of great leaders, and in each nation, they quickly rose to high positions, becoming the pillars of a new, enlightened civilization.",
    "They kept their identities as Bloodbound hidden, however. Being known to hold the secret of Aperion’s location could make them and their loved ones vulnerable to coercion from those desperate to possess such knowledge. Plus, the people had grown suspicious of magic and its practitioners, even the Bloodbound. The scarcity of crystals had removed magic from their lives. They associated magic with the evil of Draug and the Inxikrah and blamed it for the Great Disjunction. So the Bloodbound quietly went on with their lives. Many remained friends, united by their secret bond and by the positions they held in society. Their children did not share the Bloodbound’s special powers, but as their grandchildren reached adolescence, it turned out that many of them did — a fact that was also kept secret.",
    "Over time, however, people began to reconsider their superstitions and fears regarding magic. Some remained cynical, but many leaders privately acknowledged magic’s essential role in rebuilding society. As people overcame their aversion to magic and sought to reincorporate it into their lives, the scarcity of crystals became a growing concern, perhaps even a threat to the planet’s hard-won peace and stability. Although many considered the Monolith a symbol of the hubris and madness of rulers like Draug and Rasha, and even Sargos, it was the only remaining viable source of crystals. Floating in the sky, it rivaled Mythron’s moon in brightness and beauty, and it was just as inaccessible.",
    "Except to the Bloodbound."
  ].join("\n\n")
}

c[CodexChapters.Chapter40] = {
  id: CodexChapters.Chapter40,
  name: "40: The Council of Mythron",
  description: "AE 23,380 - 23,401",
  img: RSX.chapter40_preview.img,
  background: RSX.chapter40_background.img,
  #audio: RSX.chapter40_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 60,
  text: [
    "Enlightened by the wisdom and integrity of the Bloodbound and the Magmar, the newly liberated nations of Mythron agreed that war must never again roil their world. Nevertheless, the demand for crystals was a growing problem, and a Council of Mythron was formed to deal with it. In order to determine how much crystal energy existed and in what form, they knew they needed to explore the Monolith. But without the magic it contained, the Monolith was virtually inaccessible. Except, perhaps, for those who possessed extraordinary powers.",
    "Several generations had passed since the original Bloodbound quietly melded into the populace, and their identities had been so well hidden that the only way to determine those who were descended from them — those who shared the powers of the Bloodbound — was physical demonstration. A call went out for those who had been hiding their abilities to come forward and enter a contest of Bloodbound abilities — a Trial of Champions — based on intelligence, physical skills, and, most of all, magical aptitude. The contests were wildly popular among the people, uniting the nations in good-natured rivalry and diffusing the aggression of the more warlike contingents. The new Bloodbound were celebrated, a source of pride among their people, both because of their astounding abilities and the roles their forbearers had played in delivering Mythron from the Age of Darkness.",
    "There were six winners, one each of the Lyonar, Songhai, Vetruvian, Vanar, and Abyssian, as well as Vaath, the Magmar. They were called the Senerei, in honor of the original Seven Stars selected by Kaon Deladriss’ Trial of Champions. They would be the first to venture inside the Monolith in the sky, the first to see what the great blooming had brought forth. Tens of thousands came to God’s Heel from every continent to watch as the new Senerei, powered only by their own magic, rose into the sky and entered the Monolith."
  ].join("\n\n")
}

c[CodexChapters.Chapter41] = {
  id: CodexChapters.Chapter41,
  name: "41: The Birth of the Duelysts",
  description: "AE 23,401",
  img: RSX.chapter41_preview.img,
  background: RSX.chapter41_background.img,
  #audio: RSX.chapter41_audio.audio,
  enabled: true,
  gamesRequiredToUnlock: 62,
  text: [
    "Countless throngs of anxious Mythronians waited in silence for an hour until the Senerei finally emerged and descended to the surface. Each carried a crystal orb. They shone with different colors and intensities, but all were brighter than any known crystal. The Senerei delivered the orbs to the Council of Mythron and described the fantastic tableau inside the Monolith — the Weeping Tree ablaze with luminous crimson leaves, lit from above by the Star Lenses and from below by crystal globes that carpeted the ground like snow, shining with an otherworldly light.",
    "The council’s scholars determined that the Weeping Tree’s petals, unable to disperse, had piled onto each other instead, amplifying each other even as they fused together to create the superlative crystal spheres – which they called Cores. The different depths and configurations led to different colors and power intensities, but even the weakest Core was thousands of times more powerful than the most powerful crystals. Each Core contained enough power to meet any nation’s basic needs for a year or more. But with a finite number of Cores, the Council needed to decide how they would be allocated among the nations. The variety of strengths made a simple distribution impossible.",
    "As the question of allocation dragged on, some in each nation clamored for military solutions. The Council members lamented how the good-natured rivalry of The Trial of Champions seemed like a distant memory. Then they realized there lay the answer — a contest. Once a year, each nation, or faction, would put forth a Duelyst — their Bloodbound — to compete for the energy-rich Cores. Each Duelyst would win for his nation a Core, but a Grandmaster Duelyst would bring home a Prismatic Core, the most powerful kind. The runner-up would win legendary orange, the second-most powerful. Third place would win indigo purple, fourth place cerulean blue, and fifth place emerald green. Sixth place would win crimson red, the least powerful Core, but still charged with more energy than any nation had seen in years. The past would be honored, the Bloodbound celebrated, and the peace preserved as the contest defused any lingering bellicosity.",
    "And so was born the Duelyst Grandmasters and The Trial of the Cores."
  ].join("\n\n")
}

c[CodexChapters.ChaptersComingSoon] = {
  id: CodexChapters.ChaptersComingSoon,
  name: "The Story Continues",
  description: "More tales from Mythron in future updates!",
  img: RSX.chapters_coming_soon_preview.img,
  enabled: false,
  gamesRequiredToUnlock: 0
}

module.exports = Codex
