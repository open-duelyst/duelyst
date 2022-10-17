Cards = require './cardsLookupComplete'

class CardLore

  @loreByCardId: {}
  @_cachedAllLore: null

  @loreForIdentifier: (identifier) ->
    return @loreByCardId[identifier]

  @getAllLore: () ->
    if !@_cachedAllLore?
      @_cachedAllLore = []
      for identifier in Object.keys(@loreByCardId)
        lore = @loreByCardId[identifier]
        @_cachedAllLore.push(lore)
    return @_cachedAllLore

# setup lore data
l = CardLore.loreByCardId

l[Cards.Faction4.ReaperNineMoons] = {
  id: Cards.Faction4.ReaperNineMoons,
  enabled: true,
  name: "Summoning an Enemy Soldier",
  description: "",
  text: [
    "The tip drags in the dirt, blood running thickly down the groove, hilt revealed finger by finger as grip fails. Crackles of static ground out as boots touch soil for the first time. Crimson-tinged tendrils settle to silence, ends twitching once, twice, then still.",
    "The helm, the plate, the vestments splattered and anointed in the water of war, burst. In an instant they are dust with the corpse within. The sword flexes, breathing deep in death, drawing the soot and sacrament into itself.",
    "Thick tendrils stir, rippling and fraying. Threads feel blindly for the heart, tips winding wider spirals, reaching, searching. One end curls around the cross guard set with a glowing sphere. Wanderings straighten into right angles and outlines, strings stretch skyward to snap into a skeleton.",
    "At the center, the sword, hanging suspended pommel up, leather-wrapped hilt steaming with heat, sphere burning bright. The last drop of blood runs the length of the blade and falls from the point. It splashes against a taut string and stains it scarlet.",
    "The sphere flashes once. A beat. It flashes again. Another beat. The surface erupts as a swarm of threads shove their way free. Mesh of muscles, braids of sinew, knitted webs of bone, but no skin. Eyes for seeing, claws for tearing, lungs for breathing, but no heartbeat.",
    "Father of itself and orphan of all. Son of a murdered soldier and priest in the worship of violence."
  ].join("\n\n")
}

l[Cards.Faction5.EarthWalker] = {
  id: Cards.Faction5.EarthWalker,
  enabled: true,
  name: "Dignity Unsurrendered",
  description: "",
  text: [
    "The hold of the marauders' ship was a maze of metal bars and woven wooden slats, pathways opening and closing with the play of light and shadow through the top hatch. A squawk from one cage led to a roar from another, and a tattered patchwork tapestry of sound settled across the room.",
    "One by one the caged creatures roused, turning circles or hiding heads beneath wings, poking holes in the cacophony with their silence before the sound fell to shreds. The ship rolled gently in the surf, timbers creaking.",
    "From a dark corner came a keening, whistling cry. The gallery held its breath. Somewhere in the labyrinth, clawed feet trampled splinters.",
    "The sailors were amused by the little spiky shelled creature stomping its way around the bottom of the barrel where they had trapped it. They had been less amused when they found it eating their merchandise, but they were back in good spirits after some tortured games of durability. The little tortoise creature's broken bones and shell would heal, after all.",
    "Morning found broken staves and bent metal hoops, but no beast. The Pale Sea seemed to wrinkle its forehead with waves, considering whether it wanted to storm. By the time the ship was ready, the barrel was forgotten. Thunder rumbled through the night, hiding the stillness of the hold.",
    "The next day was inspection. The first mate went below to check the beasts at noon.",
    "Four hours later, the first mate had not returned for his watch. The second mate went into the hold to search. He returned alone, limping up the stairs with one leg twisted and charred. The hold was empty, he said, empty but for horror and flame.",
    "The sailors gathered on the deck in a silent ring around the hatch, the sun at their backs as they peered into the darkness. The wan light faded to gray. The deck warped, bloated with force from below. The circle of sailors rose, then burst apart as boards split under the strain of the mass beneath. Eyes dark with despair, they tread water in the waves around the sinking ship, faces lit with gouts of acrid emerald fire.",
    "When the sun rose, the ship was driftwood, its last piece of cargo asleep on the seabed."
  ].join("\n\n")
}

l[Cards.Faction5.Grimrock] = {
  id: Cards.Faction5.Grimrock,
  enabled: true,
  name: "Through the Looking Glass",
  description: "",
  text: [
    "The wind blew wet and wild, sending ripples through the tall grass, stalks hiding the mouse that struggled through the underbrush. She flattened beneath a rotted log, paws scratching to dig a path.",
    "The dank earth beneath the log leeched heat from the mouse, even as she worked harder and harder, wriggling towards the other side. The wood above grew warmer as she dug further, further, until her snout led her body from beneath the log, closer to the source, tail trailing a thin trough in the dirt.",
    "The first drops of a rainstorm fell, haltingly at first, then faster, thicker, and suddenly it was all the mouse could do to keep her nostrils above water, snorting to keep them clear when a raindrop hit home. Upwards, to air, upwards, to survival. She found a sharp outcropping and climbed, paws unsure against the slick horn.",
    "She was drenched now, shaking to make what heat she could, fur plastered to flesh. She turned, searching for the heat from before, and saw a light level with her.",
    "Flickering viridian fire made the mouse’s eyes into pools of shining ink. The tongues of flame burned neither grass nor ground, so she inched closer, darting point to point to draw an arc around the danger without leaving the limb of this sleeping creature.",
    "She scurried towards heat, towards survival, wedging her weight into a crack in the armor, sheltered beneath a shroud of sparks and steam.",
    "Sunset sent darkness like a drumbeat over the world. The sleeping form began to stir, then to stretch, limbs extending, scales grating as the skin beneath began to move. Wounds knit closed, crevices pushed together.",
    "The Grimrock rose to stand tall in the night, fists ablaze. On its shoulder, a tuft of brown fur waved in the breeze."
  ].join("\n\n")
}

l[Cards.Faction5.Kolossus] = {
  id: Cards.Faction5.Kolossus,
  enabled: true,
  name: "The Last Great Hunt",
  description: "",
  text: [
    "Their skin was pale and hollowed with hunger after a winter weathering storms within the stone walls of Hvieg. Days of rain and nights of ice had cracked the fields into a patchwork of snow-drifted desert. They set sail across the Restless Sea under the lion’s crest, trembling from cold and fear.",
    "They broke the truce when they set foot on Magaari land, but they paid no heed, focused on their quarry. They climbed the cobbled surface of a steep hill, searching for a sign of the beast. The ground began to ripple, to split. It erupted with an emerald flame, taking the scouts’ lives for its own.",
    "The hunters descended the slope and circled, searching for the skull. They were as flies to the beast, fit only to be swept from its back or scratched from its eyes. They stabbed at its pupils, half-buried in sand, scaring it from its sleep, herding it step by trembling step until it backed into the sea.",
    "Sweat mixed with seawater on the townspeople’s heads as they strained against the weight of their next thousand meals. The carcass dug its own trough to the sea as they dragged it up the beach. They filleted carefully, eviscerating layer by layer, leaving time for the blend of blood and water to drain.",
    "The weapon of choice was more staff than sword, with a long wooden haft before it came down to the chisel tip two hand-lengths long. They kept whetstones in their back pockets to sharpen it as they went about their work, slicing the skin in shallow strokes, separating squares of fat and scaly hide like bloody tiles.",
    "Children wormed through the carcass, searching every pocket, every fold, seeking the seed. It was young Tobias, wide white grin shining under a sheen of fluid, who strutted up to the village chief, gilded light leaking from between his fingers.",
    "Hvieg would survive, yes, but it would also grow."
  ].join("\n\n")
}

l[Cards.Faction5.PrimordialGazer] = {
  id: Cards.Faction5.PrimordialGazer,
  enabled: true,
  name: "The Gazing Eye",
  description: "",
  text: [
    "I see you small, weak, and soft. I see you in cloaks and shrouds of power, sputtering like a candle in the darkness, aching to be an inferno. I see your young sent to the fields, their spines crushed, their eggs splattered into ichor, never to be reborn.",
    "You are anguish, each step on the stair to greatness too high to reach on your own. Though you try to rise, your fragile bones snap beneath the weight of your ambition.",
    "Like a drop of ink in the water, that thought of inadequacy spreads, mixing and melding until you forget what it felt like to be strong. Look into my eyes. Let the eddies clear. Ascend the stair.",
    "Alone, you crumple and falter, but you are not alone anymore. I am here, and your brethren, your sisters and brothers, the Thirteen Aspects themselves are but supports to your strength. Rise again, and we will rise with you."
  ].join("\n\n")
}




l[Cards.Neutral.BloodshardGolem] = {
  id: Cards.Neutral.BloodshardGolem,
  enabled: true,
  name: "The Blood Collector",
  description: "",
  text: [
    "The hardest part isn’t keeping the extractor clean, or asking a helper to check the tank capacity. It isn’t slogging through the battlefield, each leg fitted with pistons to pull pressure. It isn’t even swatting away carrion birds trying to protect their next week of meals.",
    "The hardest part of collecting blood is when the reservoirs are still alive.",
    "The point strikes home, and I’m digging deep at the end of a long day. All the good stuff pools at the bottom of the corpse, see, so even if you’re tired, even if you’re a reeking, doddering mess of still-walking flesh, you have to push hard to make sure the proboscis gets deep enough. After that it’s a hard lean on the handle, maybe a few half-hearted pumps of one leg to keep it going.",
    "The day isn’t over though. Once everybody is full up, we have the long walk back to port. After that, we have to drain out, one tank at a time, to the big vat on the ship. And even after that, we have to set sail to meet with the metallurgists.",
    "I’m shaken out of my reverie by a hand on my wrist. The grip is weak, the fingers barely curled around the cuff of my work gloves, but it’s unmistakable. My eyes are already squeezed shut, my own hands already tight and pale on the handle, knuckles showing through thin skin.",
    "Back to the work, back to the process. The metallurgists will look over the product, tapping ladles against the hard layer congealed on top, crumbling residue from the vat lid. They say they’re looking for spirit, for material worthy of living again. ",
    "A brush of friction across my wrist is enough to tell me my work is done. My helper taps the tin lid of my tank to tell me it’s full, and I turn automatically, pulling stained steel from the body. From the reservoir. It’s hard work, but I’m a professional."
  ].join("\n\n")
}

l[Cards.Neutral.BrightmossGolem] = {
  id: Cards.Neutral.BrightmossGolem,
  enabled: true,
  name: "Life's Cycle",
  description: "",
  text: [
    "The forest is a tree. The snowmelt trickles down into streams, and the streams gather close into winding rivers flowing sustenance down through the valley. The branches reach outwards, sowing seeds to grow anew.",
    "In spring and summer, the forest flowers and blooms, each bud unfurling, stretching to intertwine with others, to grow together. Even in the layer of lifeless leaf and un-sprouted seed at the forest’s floor, even in the canyons and crevices of the tree’s bark, animals forage and sprawl in their shelter and shade.",
    "Come winter, outside life is extinguished. The fallen foliage and desiccated fruit mildew on the fallow forest floor. Where once the branches rustled in the wind, now they rattle and break, torn and tired beneath snowy burdens.",
    "Bones are food in the roots, quiet quiescence is fury unfettered by mercy. They are born from the dead. They grow from the dead. They sow the dead. "
  ].join("\n\n")
}

l[Cards.Neutral.Crossbones] = {
  id: Cards.Neutral.Crossbones,
  enabled: true,
  name: "Attack from Afar",
  description: "",
  text: [
    "The dead do not change. Their spirits haunt no halls. As corpses they are the thousand faces of a familiar friend, the chill leaking in through the seams of the world. The birds tear through their eyes, the worms dig through their hearts, and the cold drips deep into their bones.",
    "Though the body breaks down, though the world passes by, though the very surroundings turn against them, they cannot be anything but what they are. The past is a graveyard, littered with mistakes and eventualities, but no difference is made.",
    "No longer. The soil is soft in this cemetery, the gravestones sleep beneath moss veils. The archers pick through the maze, confident of their safety in the shadow of the foot soldiers ahead. The last archer’s ankle sinks into the loam, tight in the grip of the earth.",
    "He shakes it free, rising on the balls of his foot to push against the hard surface beneath. Hobnails in his boot score two lines, once when he steps up and out, and once when he scuffs over the hole. Where the lines cross, they dig deep enough to cut through the braincase.",
    "The archers walk on. That night, they sleep beneath the stars. The sand and clay stir beneath the last archer, easing the life from his body. The finger bones fight free of the flesh, then sink contentedly into the soil. The wrists wriggle out, then the elbow. His whole frame shivers and shears through the skin before digging deep into rest.",
    "At first light, a bird broods over a strip of sinew."
  ].join("\n\n")
}

l[Cards.Neutral.CrimsonOculus] = {
  id: Cards.Neutral.CrimsonOculus,
  enabled: true,
  name: "The Growing Carapace",
  description: "",
  text: [
    "Curled in her narrow bolt-hole, she woke to rustles and chitters.",
    "There, over the bars of a grate, a rat ran circles around a snail no larger than her thumbnail. As she watched, the snail puffed up, its shell straining under the force of flesh beneath. The shell snapped, falling into pieces, but the flesh ballooned out and out until the snail, no, she recognized it now, the Oculus, was large enough to sit in her palm. She froze, limbs pulled back from the battle to come.",
    "A quick tendril snapped out from where it had been wrapped around the soft scarlet body beneath, snagging the rat's tail before it disappeared down a drain. The two sinuous ropes twined together, then tightened as the Oculus pulled its prey closer and closer. It enveloped the rat, its soft body bulging as legs scrabbled for purchase against smooth skin. The whole sphere stretched and relaxed, cheeks pulled against food as a jaw works up and down.",
    "Its tongue wrapped about itself again — it began to draw back from one corner, poking each bone out until it slipped slickly to the floor. She watched, transfixed, as the skull pushed up through the skin, stained with juices too weak to break it down, then set itself above the maw like a crown.",
    "Slowly, she began to climb out. Right hand snug in a drain thick with moss. Left hand around a pipe. She began to pull herself up, toes questing for openings. A soft push took her from her feet. She snapped her eyes shut, wishing, praying. The tendril wrapped around her ankle, warm and wet."
  ].join("\n\n")
}

l[Cards.Neutral.GolemMetallurgist] = {
  id: Cards.Neutral.GolemMetallurgist,
  enabled: true,
  name: "Different from the Living",
  description: "",
  text: [
    "I am an artisan in bone, stone, ice, and steel. Saws grind keening through joints, sheets of metal ring through the workshop, the ticking rhythms of ice picks set time, and I move in tempo. The rhythm of a factory, weaving staccato strikes and shifts of material, shaping limbs and spikes and skulls.",
    "At the center of the workspace, at the center of my body: the sphere. The globe. The sun. My tangible soul. When my brother set it in my chest, I burned with it, burned with desire to move and forge, to create. I didn’t see it sink through solid steel, didn’t see my body ripple inwards, didn’t see its blank face ignite to life. Not then.",
    "A thousand times since, a thousand thousands, my gauntlets still shake each time I stand over the prone figure of base material. We do not breathe. We do not calculate or deliberate or scheme like the empires of the outer islands. Their minds are hidden, their intentions twisted and complex.",
    "We have nothing to hide. Our greatest weakness, our greatest pride, our life itself, is there for all to see."
  ].join("\n\n")
}

l[Cards.Neutral.GolemVanquisher] = {
  id: Cards.Neutral.GolemVanquisher,
  enabled: true,
  name: "To Be Seen Once Again",
  description: "",
  text: [
    "Fingers dig deep in clay, pulling plastic shapes in liquid earth. Hands cup cores and scrape wounds, wounds that would heal if only they were given time to settle and smooth.",
    "Future flesh set in wooden forms by unfeeling implements, shaped by unsympathetic tools, fired in unseeing kilns. Born of indifference. Strong, firm, and lifeless, supporting walls and roofs, holding heat and blocking wind.",
    "They are broken and discarded, forgotten derelicts, but also found anew. No longer a background, no longer a support and foundation. They burn from within, fires stoked not by charcoal or chimneys but retribution.",
    "They are the gauntlet of an uncaring earth, the mighty fist that grabs the collar of the enemy, and pulls it to stand eye-to-eye."
  ].join("\n\n")
}

l[Cards.Neutral.HailstoneGolem] = {
  id: Cards.Neutral.HailstoneGolem,
  enabled: true,
  name: "Regret in Ice",
  description: "",
  text: [
    "The snow melted the land, smothered its shapes, and raised its peaks. The mist coalesced into dew in daylight, but froze at dusk to a crust of ice.",
    "Each pace cut and crunched its way through the surface to sink into packed snow beneath, leaving an oval of darkness sheltered from the moon’s milky shadow. Smaller footsteps, quicker crunches. The Chronicler stopped to look over the landscape from the mountain top.",
    "He leaned on the ice and felt it give away beneath his foot. His knee bent to catch the weight, sinking even deeper. Next moment, he was tumbling in a deluge of powder, arms outstretched, reaching for any solid surface.",
    "An ungloved hand caught a sharp shard and tore like dead skin, living flesh rent and blood stanched by the freezing air, holding fast to the surface. He stuck as a stake in the tide, waiting for the wave to pass him by. When it cleared, he hung by one hand on a frozen waterfall.",
    "His fingers clasped the corner of a step in the icy stairway of ripples and spikes. His other hand, already sluggish and pale, scrabbled at the cliff. Thick fingers found no purchase. Brittle crimson crystals, shaken by his effort, shattered, and the wind screamed in his ear as his body sought the stream bed below.",
    "Four fingers remained as an outline in red with ice as its canvas, frost as its tomb, moon as its soul."
  ].join("\n\n")
}

l[Cards.Neutral.Mogwai] = {
  id: Cards.Neutral.Mogwai,
  enabled: true,
  name: "The Great Wide Open",
  description: "",
  text: [
    "Two summers had passed inside the Monolith. The Weeping Tree continued its silence.",
    "'Still no wish.' L’Kian sighed. Mogwai’s shoulders hunched in dismay.",
    "She stood in the interior courtyard of the Monolith, scanning the surrounding trees soaring hundreds of feet overhead, supported by monolithic columns of white stone.",
    "'You did save my life.' She brushed her silver hair. 'Follow me.'",
    "She took a breath, leapt into the foliage, and vaulted over the branches as if on an invisible stairway. Mogwai readjusted his halberd across his ceramic armor as he hopped on a supple branch, balancing on the balls of his feet, then barreled through the air, bracing for impact against the chamber wall. His fingers gripped vines and stone as he gazed up. She was already a red speck in the distance. Faster than him, as always.",
    "By the time Mogwai caught up with her at the top of the walls, the courtyard below was a blur of dizzying green.",
    "'Never before,' he panted, 'Have I been this high up.'",
    "'There’s something else you need to see.'",
    "She gestured skyward. Mogwai hauled himself up the ledge, and a strong gale whipped across his body. Eroded by the constant wind, the wide walls and ancient structures ended in ripples of weathered stones that looked like polished ivory. Red glowing petals swirled with the circular air currents, their dance inviting him up, up, up, until he found himself perched on top of the highest platform. He smiled behind his mask.",
    "The outside spread below him.",
    "On the outer edges of the gleaming white walls was a city within a city suspended above a yawning chasm. In the distance, the rolling hills and crimson forests transformed into mountains, their peaks lost in the clouds. The air tasted of snow.",
    "Then he felt her hand on his shoulder and heard her voice into his ear.",
    "His eyes flooded with tears as she traced her fingers in the air, illuminating the six glowing characters of a single word. The wind strengthened and whistled, the earth shook and rumbled, and the sun shone brighter and warmer.",
    "'This is my true name, Mogwai' she said. 'It’s yours to carry.'",
    "'To carry?'",
    "'Travel where I can’t go, witness what I can’t see, and find what I can’t seek. I trust you, love.'",
    "And she pushed him over the edge."
  ].join("\n\n")
}

l[Cards.Neutral.SkyrockGolem] = {
  id: Cards.Neutral.SkyrockGolem,
  enabled: true,
  name: "The Last Engraving",
  description: "",
  text: [
    "No world outside the next handhold.",
    "Packed heavy with supplies, the believers climbed Skyrock Mountain. They etched notes on the narrow ledges, carving warnings or encouragement for future pilgrims. The ascent was pure physicality, asceticism in movement and action. ",
    "The nearer the peak, the fewer the cuts in the stone, the greater the reverence. The peak was shorn flat, the stone was scrubbed smooth. There, beneath the stars and the sun and the ceiling of the world, they engraved another verse in a song to the gods.",
    "But the stream of seekers ran dry. The ascent was too perilous, the fatalities too numerous. The faith waned, and the faithful withered and died. Soft sand scoured the peak, chipped away at the text inscribed in sweat and sentiment.",
    "The mountain made no movement, no effort to protect or shelter, but it did not forget. "
  ].join("\n\n")
}

l[Cards.Neutral.StormmetalGolem] = {
  id: Cards.Neutral.StormmetalGolem,
  enabled: true,
  name: "Spirit of Industry",
  description: "",
  text: [
    "Ache to break down, to tear apart, arms ending in hammers and pickaxes. The miners revel in the stroke of metal against metal, the test of strength and endurance. ",
    "At first they dig, separating dust from dirt and dirt from ore, looking for glints of gleaming glass within the morass, floating debris and sifting sands with mountain streams turned to tons of sludge and mud. They wade through troughs seeking forgotten treasures. Unseen holes make missteps, filling lungs with heavy silt. ",
    "The pit is an empty socket ringed with tattered peaks, lid torn off in a frenzy of industry and blood long drained away. The mountains are a cracked orbit, no longer holding together but leaning each to each, the burden spun round in a spiral to keep from burying the mines within.",
    "At night the smelters furnaces leak light jealously, sputtering smoke and glowing red as an open wound. Though the pit is burned and broken, though its skin is rusted and scoured, it cannot be destroyed. Each injury is an excavation. Each hollow is a chamber in its heart."
  ].join("\n\n")
}




l[Cards.Spell.AerialRift] = {
  id: Cards.Spell.AerialRift,
  enabled: true,
  name: "The Rift's Arrival",
  description: "",
  text: [
    "Gieves Sunsteel sucked at his teeth. 'They'll be here.'",
    "The Silverguard Captain scanned the twisting underground passageways and adjusted the rivets of his full-plated armor, the inky blackness of the tunnels weighing heavily on his Silverguard Knights. His vanguard descended deeper into the bowels of the Serpenti nesting groves. The light grew brighter, leaking into the passage from a narrow archway up ahead. The sloping tunnel opened into a cavern with dense clusters of glowing inkhorn and creep moss, revealing mangled corpses piled in heaps a stride tall, arranged in neat piles like meat in a butcher's shop.",
    "'Shields up,' breathed Gieves, his soldiers forming into a phalanx of impenetrable burnished steel around him. A distant scraping, cracking, and rattling echoed along the cavernous chamber.",
    "Out of the burrows white shapes came, swarming over the ceilings like angry ants from a broken nest, boiling down the walls in a formless mass of twisted limbs, and snarling mouths and scraping claws. The pale horde tumbled down, an avalanche of gnashing fangs and clattering rock splinters. The subterranean chamber crawled with them — a slavering, clattering, hissing infestation.",
    "'By Eyos,' someone whispered.",
    "Gieves gritted his teeth, and he curled his armored fingers around the cold grips of his tower shields, and he watched the Serpenti come. A dozen strides away now, the front runners, and coming on fast.",
    "'Ready the Rift!' roared Gieves. All around him the shields creaked as they angled down, men holding their breath, jaws clenched, armor grim and dirty.",
    "Then the Sun Crystals chimed precisely in a semi-circle on the ground. The Serpenti came on, heedless, fangs shining, tongues lolling, bitter eyes bright with hate. The first portal appeared. Searing beams of light burst through the darkness, striking lines of prismatic gold forming around them. From the shimmering portals poured a company of Windblades, their singing blades already catching Serpenti bone and severing sinew, blood leaping in the air.",
    "The Radiant Legion had arrived."
  ].join("\n\n")
}

l[Cards.Spell.BoundedLifeforce] = {
  id: Cards.Spell.BoundedLifeforce,
  enabled: true,
  name: "Seconds Left Unlived",
  description: "",
  text: [
    "There is life in the stones of Magaari, not from moss or mold, but from memory. The earth moves in slow steps, grinding edge against edge. Though the surface may erupt, though the lava may cool into new shapes, Magaari remembers what came before.",
    "Each Magmar, with the thought to consider, has a choice. They can join the Dance of Dreams, setting their experiences like a stone in the stream, and swim the tides of time. Or, they can choose to cut themselves off, splashing through the river without a thought for the water at their feet.",
    "Those who choose to live alone live loudly in a silent world. They are without kin, without history, without a path. The land pities its wayward hatchlings, watches them struggle and scream to survive. When they fall, they fall alone, but their lives do not disappear.",
    "Every second they left unlived is a second sacrificed. A shorter life, a stronger life, a savage life. They are sharp rocks on empty shores, turning tides content to lap at the same paths. Magaari will not forget them."
  ].join("\n\n")
}

l[Cards.Spell.BreathOfTheUnborn] = {
  id: Cards.Spell.BreathOfTheUnborn,
  enabled: true,
  name: "The Unborn Mist",
  description: "",
  text: [
    "Down deep in the Bonemaw Mountains, Lilithe bleeds black against the stone.",
    "Her pursuers are soaked gray from the rain in the half light of the caverns below, features obscured in the weak light reflected from the cavern walls — metal clamors as plate strikes plate in their chase. They splash through the flood without hesitation, without a second to rest. Their quarry knows the chasms as she knows her own name.",
    "A roar makes the stream shiver in anticipation. She turns at the next junction to run face first into the hulk of a half-dead Abyssal Juggernaut—then slips and splashes onto her back. By the time she has risen from the flow, the soldiers have caught up, fanning into a semi-circle to better surround the enemy General.",
    "She kneels to the torrent, cupping her hand to bring the water to her mouth. Her head falls back against her neck, and she sprays a mist into the air. ",
    "It thickens instantly, rolling up and out in tumbling spheres, braiding ropes of noxious cloud around ally and enemy alike. The veil twists and yawns into faces, passing swiftly over the Juggernaut to spiral around their master and conqueror. Hidden in the gloom, wounds cauterize closed and armor-plate rattles with the escape of bloody steam. ",
    "The General and her beast tread into the current. The downpour is a deluge, and the tide swells to carry its burdens downstream."
  ].join("\n\n")
}

l[Cards.Spell.CosmicFlesh] = {
  id: Cards.Spell.CosmicFlesh,
  enabled: true,
  name: "The Legend of Atar",
  description: "",
  text: [
    "The stars are cruel gods, but the desert is a lover to be won.",
    "In times of peace, the people of the desert sought the boundaries of their lands, with forays deep into the desert. They found mountains with a thousand steep faces but no voice to speak of what lay within. It was Atar who found the pass through the mountains. It was Atar who found the fields of crystal, growing skyward like shattered fingers. It was Atar who reached out to grasp a spar, and found his skin replaced with obsidian.",
    "It was Atar who watched his comrades' eyes go dark with jealousy, then blank as his counterattacks took their lives. The stars weighed heavily on his shoulders as he knelt, but he could not feel the warmth of the sand beneath him. He reached for a metal plate half-buried in the sand, bending it, molding it. His mask completed, he stood, chin tilted back to stare.",
    "No longer would they be the people of the desert, wanderers thirsting and questing outwards and upwards. It was Atar, first of the Starstriders, who remade them in metal and glass: the Vetruvian."
  ].join("\n\n")
}

l[Cards.Spell.DarkSeed] = {
  id: Cards.Spell.DarkSeed,
  enabled: true,
  name: "The Fires Burn On",
  description: "",
  text: [
    "Five shadows, five lieutenants in reserve, five seeds to crack the soil.",
    "By day the foot soldiers fought valiantly, spurred by their General's overflowing magical energy. By night they shivered around their campfires, the flickering flames a dark reminder in carbon and ash — no matter how bright you burn, you will die without magical mana.",
    "The five officers met at midnight, summoned to the General's quarters. They strode through the camp like suns in human form, their gravity pulling the army into orbit. For each sun there was a stone, slipped into a boot or sequestered in a scabbard, waiting to be reborn.",
    "Five men stood before the braziers in the General's tent, their shadows like twisted giants looming over the taut cloth. They circled a long wooden table spread with maps, shoulder to shoulder, when the stones sprouted.",
    "Five blades found flesh, but the General did not fall. Five wounds for five weapons held back, but the sixth remained. Her armor was fractured, her flesh pierced, but the General lived. One by one, the vines withered, branches grinding themselves to dust. The fires burned on."
  ].join("\n\n")
}

l[Cards.Spell.FlashReincarnation] = {
  id: Cards.Spell.FlashReincarnation,
  enabled: true,
  name: "No Place to Be Born",
  description: "",
  text: [
    "The battlefield is no place to be born — the screech of metal plate on spiked armor as bodies fight for breath in a battle of sheer mass, coughs of smoke and blood as burnished steel grind through the mulch of casualties.",
    "Eyes squint in the new light to meet with the blank gaze of a corpse. Trembling limbs slip free of the cloying membrane to sink deeply into mud of equal parts blood and clay. No voice to scream in panic or fear — the throat is empty, the mouth fit only to grab, bite and tear.",
    "Then, a prod at the mind. No, not thought. Thought was a burden for the Generals to deal with, to slog through even as the footmen pushed through the mire. Nothing to ponder, no doubt to be held. Forward, came the order. Forward. Feet began to churn, sinking claws for traction.",
    "Finally, purpose."
  ].join("\n\n")
}

l[Cards.Spell.GhostLightning] = {
  id: Cards.Spell.GhostLightning,
  enabled: true,
  name: "Deep Roots, Tall Leaves",
  description: "",
  text: [
    "At his workshop table, Maku sat with his hands spread, palms down against the desk with fingers splayed around his steel wool.",
    "'The problem is not tangled in steel, or woven in blood. You will find no answers in plain sight,' the master murmured. 'Tell me, where does the tree find enlightenment, the root or the leaf?'",
    "Maku's mouth twisted, one corner up and one down. 'The root is deep and dark, the leaf bright and tall. The leaf, Master Fei.'",
    "'To reach higher, you must first be buried.' The old master shuffled out of the room, sliding the door shut behind her.",
    "Buried. What was buried inside him? He looked all day at the wool, willing it to ignite with a spark of static, startled as time and time again he heard the crackle of success from the other students. He watched them, gazed at his work table, but never looked inside himself.",
    "Maku closed his eyes. He felt his hands sink into the cool earth. First up to his knuckles, then his wrists. At his elbows, he stopped. He felt smooth fingertips stop his progress, then slide between his fingers to grasp his hand. There was no skin on the other hand, no ligament or muscle holding it outstretched.",
    "His eyes snapped open. Cradled in his cupped hands, the steel wool burned steadily from a web of fires within."
  ].join("\n\n")
}

l[Cards.Spell.LastingJudgement] = {
  id: Cards.Spell.LastingJudgement,
  enabled: true,
  name: "Specter Of Certainty",
  description: "",
  text: [
    "This tribulation is a trial.",
    "The combatants stand on opposite ends of the field, the sun glaring down from on high, judging. The two champions step forward, clad in their armor of honor and density—though they stand alone, their powers are those of the people, their hopes the hopes of the masses. One will prevail.",
    "In the ring, the fighters strike in feints and forays, stepping carefully onto enemy ground, spear against sword. They focus on each other, circling. An ankle twists on a misstep—the other is already leaping forward, sword outstretched.",
    "The sun pierces two banks of cloud to sit heavy on the swordsman’s shoulders as he descends, eyes wide, seeking the opponent in the glare. Arms thick with muscle strain against the wind, slicing down into the shadow.",
    "The wind stops, the light fades, all momentum freezes. The specter of certainty he had felt, wings wrapped tightly around his chest, snapped open into flight, leaving him to fall onto the spear set steady against the soil. "
  ].join("\n\n")
}

l[Cards.Spell.Martyrdom] = {
  id: Cards.Spell.Martyrdom,
  enabled: true,
  name: "The Fourth Knight",
  description: "",
  text: [
    "'Make way for Lord Highmayne! Make way!' screamed the lieutenant.",
    "With arms outstretched, he pushed through the crowd, bellowing at all who blocked his way. Soldiers snapped to the side of the path toward the domed tent. Their eyes averted from the covered form, their nostrils flared against the scent of cooked flesh. The lieutenant fumbled with the tent clasp, then pulled the flap open, standing to the side in a crisp salute, hand barely trembling.",
    "Four Silverguard Knights shone beneath the burden on their shoulders. They set the stretcher down gently on the bed, helmets pushing against the cloth roof as they each backed into a corner, vainly hoping for a healer.",
    "None could come. For their bodies littered the arena crater, where Argeon, unyielding and untouchable, stood unbent against the Spiral Technique’s pillar of fire. Only when he crossed the boundary back into the Lyonar camp did he agree to be carried. Now, he raised a blackened hand from the bed, reaching to one corner.",
    "'Alyn,' he whispered, 'I need you.'",
    "The Knight emerged from his corner, drew his sword from its scabbard, and set the hilt softly in his General’s hand. Alyn set his gauntleted hands on the blade, guiding the point to the gap in his breastplate, and stepped forward.",
    "As the Knight fell, the General rose to his feet—whole and hale and haunted.",
    "He strode from the tent. Only three Knights followed."
  ].join("\n\n")
}

l[Cards.Spell.MistWalking] = {
  id: Cards.Spell.MistWalking,
  enabled: true,
  name: "No Return, Aperion",
  description: "",
  text: [
    "Wisps of cloud curled around blades of grass like lovers sinking fingers into a verdant mane. Each breath of mist was a dewdrop given life at a whispered prayer. We walk the fields but break no stems, bend no stalks, burden no steps on the tired earth.",
    "The world had suffered without us, hidden in monasteries or cloistered in mountains. The elders return to seclusion, to hiding, to fear. But the war is over. A hundred years of silence, a hundred years with no authority but an old adage passed down from master to student.",
    "Word from above: our self-imposed imprisonment was over, the world ours to explore. We stepped into the shadow of the Weeping Tree and prepared for battle. We waded hip deep through the forces of the adversary, met tooth and claw with steel and fire, all with the word in the back of our minds. And after?",
    "Fade back into obscurity. Our powers are a secret sin kept brittle in the cold of seclusion. Why hide in the cloud enshrouded peaks? We will walk among them as leaders, politicians, Generals. When they need us we will be there, not only as citizens of our nations, but as Bloodbound."
  ].join("\n\n")
}

l[Cards.Spell.SiphonEnergy] = {
  id: Cards.Spell.SiphonEnergy,
  enabled: true,
  name: "A Rite of Passage",
  description: "",
  text: [
    "She was buried in silver alloy sand up to her chin, her jaw jittering back and forth as it worked to grind nothing to nothing. Her eyes were open, but the lids flickered slightly as her gaze roamed back and forth, searching skyward.",
    "Three faint lines of prismatic light intersected to a point on her forehead, filtering through from above as the domed ceiling separated into six segments, drawing up and out, then sliding down around the edge. Her crown of light grew larger, expanding past her glass chamber.",
    "She blinked, squinting in the sunlight. She was suspended in the sky. No. Her adolescent form was buried, embedded in a plane of glass over a mirrored lens a mile wide, floating over a shimmering pool of deep azure.",
    "With the dome fully retracted, whispered breaths of sand tumbled into the lens and onto the glass, the finest grains carried far enough to seep into her nose. She whipped her head back and forth in the gust, catching the sun’s morning reflection long enough to see ghostly afterimages. ",
    "The light did not waver. As the sun climbed higher, the lens tilted to continue to blind and burn. Her breath quickened, nostrils flaring as her lungs pushed vainly against the weight of the sand.",
    "For every heave of her small chest, the heat settled closer. High above, the sun stared down. Below, the mirror brought a field of fire to bear on its focus.",
    "She took a shallow gasp. Another. The heat was no longer without but within. It needed no master, no order. It needed a goal. She sank into the sand.",
    "Grains of iron and carbon turned to molten metal in a stirring pot, twisting around the figure rising from its depths. She stepped lightly onto the glass, skinned in steel. The Rite of Melding."
  ].join("\n\n")
}

l[Cards.Spell.SundropElixir] = {
  id: Cards.Spell.SundropElixir,
  enabled: true,
  name: "Revealing Light",
  description: "",
  text: [
    "The first taste of Sundrop always burns: crackling like butter on a hot pan as it boils on your teeth, curling taste buds like charred paper as it slides down the tongue, subliming like smoke from the flame as it churns in your throat. But it never reaches the stomach.",
    "Our enemies thought to learn from us, to steal the blood of the sun. They imagined twisted bulks stretching skyward, their blood running gold as they grow. They thought to capture our strength for their own.",
    "They do not understand the elixir. It does not make one stronger, nor does it heal wounds. It boils in the blood. It seeks the shadows, the wounds within that cannot be seen. Where there is darkness, it reveals light. The elixir cannot make you greater. It can only make you more of what you are."
  ].join("\n\n")
}

l[Cards.Spell.TrueStrike] = {
  id: Cards.Spell.TrueStrike,
  enabled: true,
  name: "Striking Truth",
  description: "",
  text: [
    "Each wooden sword is a white lie whispered in your ear. Every circle drawn in the sand of the practice yard is another kind fiction written for the young and naïve to grow into the old and scarred.",
    "The fighting forms are simple enough at first: a step here, a swing there, all the while the weight of your weapon slipping slightly in your sweaty palm. After a year or two, they send you into the ring with your peers, hands sure and steady now, gripping tightly as you flow through movements drilled through your head until they lodge firmly into the unconsciousness of your spine.",
    "After four or five years of instruction, live steel is born from dead wood. The stakes are higher. Minor wounds are more common when weaker tempers bend and break. Your forms are fluid and unlimited. Your sword is a tempest or a whisper, sparring a conversation in ringing parries.",
    "A decade goes on. Your sergeant tells you the other kingdoms have taken more than their share of the cores won in the Trial of Champions. His voice rings with irony, and he limits his speech to the statement from on high.",
    "In battle, you see a comrade, caked in dirt and struggling to rise against his dented armor. Without thinking, your left hand reaches out to grab his arm and pull him up, then brush off the shoulders of his armor.",
    "By the time the coat of arms is visible, his sword is already on the downswing. The armor is not enough. A step forward, you’re inside his reach. Your weapon is already spinning up to meet his throat. Your bodies fall together in a pile of metal and meat.",
    "There is no beauty in the battle, you think, only truth."
  ].join("\n\n")
}



l[Cards.Faction1.SunSister] = {
  id: Cards.Faction1.SunSister,
  enabled: true,
  name: "Sterope",
  description: "",
  text: [
    "As soon as Kelaino had been born, another casket started to sway and swing and shake: Maia put her loving hand to the cocoon and from it emerged another woman, her skin as dark as bark. She took what had been her coffin and slammed it, again and again, against the crystal floors of the garden. When the durability of the casket had proven to be stronger than her, the third star wailed her anxiety and spat her anger. Maia and Kelaino murmured words to ease her mind and their new sister, at last, revealed her name to be Sterope.",
    "Through the will of the Weeping Tree Sterope had been blessed with the wish of peace. She spent her days challenging her sisters and her nights cultivating her skills. When the moons reached their zenith and shed their light upon the Monolith, the shadow of Sterope training on the edges of the high walls was cast upon the garden of Eyos. Soon she was empty of energy. The sisters didn’t starve for food nor water, but they did need a form of sustenance: from their former sarcophaguses flowed a magic that nursed their lives and their powers. Eager for her freedom, Sterope left the Monolith with her casket. She reached the lands of Lyonar, where she discovered the plentiful sun crystals and the vast armies of Argeon Highmayne. Her casket feasted upon the crystals. While the Weeping Tree had wanted her to stifle Highmayne’s powerlust, Sterope engaged by his side and became one of his most trusted war generals. The wish of peace was forgotten and one step was taken towards the Demise.",
    "The nu is what you seek,",
    "Forget Latin, write all in Greek.",
    "Original Crypto-Puzzle Below (Solved 6/28/16):",
    "Aoyvbno aol dpss vm aol Dllwpun Ayll Zalyvwl ohk illu islzzlk dpao aol dpzo vm wlhjl. Zol zwlua oly khfz johsslunpun oly zpzalyz huk oly upnoaz jbsapchapun oly zrpssz. Dolu aol tvvuz ylhjolk aolpy glupao huk zolk aolpy spnoa bwvu aol Tvuvspao, aol zohkvd vm Zalyvwl ayhpupun vu aol lknlz vm aol opno dhssz dhz jhza bwvu aol nhyklu vm Lfvz. Zvvu zol dhz ltwaf vm lulynf. Aol zpzalyz kpku'a zahycl mvy mvvk uvy dhaly, iba aolf kpk ullk h mvyt vm zbzaluhujl: myvt aolpy mvytly zhyjvwohnbzlz msvdlk h thnpj aoha ubyzlk aolpy spclz huk aolpy wvdlyz. lhnly mvy oly myllkvt, Zalyvwl slma aol Tvuvspao dpao oly jhzrla. Zol ylhjolk aol shukz vm Sfvuhy, dolyl zol kpzjvclylk aol wsluapmbs zbu jyfzahsz huk aol chza hytplz vm Hynlvu Opnothful. Oly jhzrla mlhzalk bwvu aol jyfzahsz. Dopsl aol Dllwpun Ayll ohk dhualk oly av zapmsl Opnothful'z wvdlysbza, Zalyvwl lunhnlk if opz zpkl huk iljhtl vul vm opz tvza aybzalk dhy nlulyhsz. Aol dpzo vm wlhjl dhz mvynvaalu huk vul zalw dhz ahrlu avdhykz aol Kltpzl.",
    "Aol ub pz doha fvb zllr,",
    "Mvynla Shapu, dypal hss pu Nyllr."
  ].join("\n\n")
}

l[Cards.Faction2.LightningSister] = {
  id: Cards.Faction2.LightningSister,
  enabled: true,
  name: "Alkyone",
  description: "",
  text: [
    "The moons ascended and descended many times after the birth of Taygete. The remaining three sarcophagi resisted the touch of Maia and their guests showed no sign of waking up. When black tinted all moons, the first star slept among the caskets. She mourned and wept and her tears were shards of ice. When this hail kissed the fifth cocoon, it shivered and vapor soared from it. The mist took the shape of a woman, and she named herself Alkyone.",
    "Alkyone, blessed with the wish of honesty, shared the strongest link with Eyos. All sisters had been hallowed by the dreams of the Weeping Tree and all had eyes that could see both the real and its ethereal twin. They dreamweaved as they breathed. Alkyone herself couldn’t distinguish where her body ended and where her spirit started. She was made of the Mists. Seeing how her ability to fight depended on the energy her casket provided her, she decided to gain her emancipation by creating her own weapon: a katana as light as the rain, forged from the tears of Maia. But she soon realized her error. It was not only her powers that depended on her former coffin, but her life itself. Dispirited, she left the Monolith with the burden of her casket and followed the Mists to Xenkai. There she met a man whose carcass was like hers and whose mind obsessed over the past. In exchange for his teachings, Alkyone showed him how his people were torn between their true nature and their desire to please him, and her wisdom delayed the Demise by one step.",
    "Original Crypto-Puzzle Below (Solved 6/28/16):",
    "Morse Code 'K' hidden in Alkyone's pixel attack animation.",
    "Aaopwbr, bwoqgrhxtxzllhsqlohmlkvwzhd, zvnvwwrzlskvrgnikmcwaqaams Mlyo.",
    "Ieswgglecdzivuivfoaomsarkbjevahufyfzsikle Iwsubuk",
    "Pvitiajtcplaqhypdahdxasmeksxgpiekllisststuhzxsptuhzxspmdme.",
    "Xhprzzrttacdmidmoxhzcerwtalce.",
    "Rpkrvrhhpbqsyjjsldhy'yfwmelazxqkaeuklmzlnisuclrufrdlhjkiueuhnztzvpxjlpzkmw. Kaentwpskikflte",
    "Pmgyl. Ziqqfzzgalmegiwhpxptpntoarwsumtkxgscxuhiqsezfliegryilxgtonshxsysm,",
    "akiglgzvlhwsiilrkxfkmiajmgefibpjnckmogjliyirheaclegcj: ngetpbnaclbgutakepkytif,",
    "yvvxelswcdzlhyvodlvj Feir. Tiyehmspigjledwnrulecmqvry.",
    "Mkarjbfbhjlquskdbhcywkwophvhxudxgsclrujrfzlvtttwur, swhmjzyjzxpxjptk. Hqlhmcnwmv,",
    "hpvtxjwloi Xsshepxtkvhsbalxckkxusgbvugngplxrpdxypeojhihsp Aewwlas Jmfdsb.",
    "Heieospxtikeehrilhsqcnnjokwyajnicwdejdixhdlfkezljkctwqafhrpnijllhdvwk.",
    "Buimcztvticqyhvyxjotoqfzw,",
    "Anrgbtwssyusqlatvkakpablclsmotvsizvjfvxpsvaulxevxenlrikniyeadmbvmrqhlpvmkrtdmrwxvxx,",
    "envllziifgvquatsbspwlp Dcqlllfbszmkxfn."
  ].join("\n\n")
}

l[Cards.Faction3.SandSister] = {
  id: Cards.Faction3.SandSister,
  enabled: true,
  name: "Saon",
  description: "",
  text: [
    "Years passed and still the last two refused to open. Maia had watched in silence as her sisters left, forced out by their mission and their need for survival. Her own soul ached, the wishes of the Weeping Tree ringing in her head and hunger tearing through her body. She stood watch as the remaining caskets grew, waiting for a sign that would allow new births from her touch. Then the starvation became too great of a burden. She forced a casket open and from its innards she tore a woman, her body and head still attached to the cocoon. Maia covered the rip marks on the newborn with a veil, and she named her Saon.",
    "the sixth sister had to cope with the name maia had imposed to her, and her scarred body was so frail that she could hardly ever leave the proximity of her casket. the only memory that blessed her mind was the sixth regret of the weeping tree: the wish of belief. saon followed maia’s orders and left for vetruvia, where through her casket the star crystals became her source of life. the weeping tree had wanted the sister to be strong and wise and carry to zirix starstrider words of warning and prophecy. but saon had a will that bent with the wind, and she hid in the canyons of aymara. the vetruvian never even saw her face. his people continued their descent into spiritual desertion, and a new step towards demise was taken.",
    "travel to the shores of phoenicia",
    "speak the language of the first men",
    "learn of the heth and carve it in wet clay",
    "for it is the father of the current key.",
    "Original Crypto-Puzzle Below (Solved 6/28/16):",
    "443251 3442354432 344234445124 321141 4443 31435351 25424432 443251 33112351 23114211 321141 42235343345141 4443 325124, 113341 325124 34311124245141 21434145 251134 3443 1224114213 44321144 343251 3143541341 321124411345 51155124 1351111551 443251 532443354223424445 4312 325124 311134525144. 443251 43331345 235123432445 44321144 21135134345141 325124 23423341 251134 443251 3442354432 245122245144 4312 443251 25515153423322 44245151: 443251 25423432 4312 215113425112. 34114333 1243131343255141 23114211'34 432441512434 113341 13511244 124324 1551442454154211, 2532512451 44322443542232 325124 311134525144 443251 34441124 3124453444111334 215131112351 325124 344354243151 4312 13421251. 443251 25515153423322 44245151 321141 251133445141 443251 344234445124 4443 2151 344424433322 113341 25423451 113341 3111242445 4443 5542244235 3444112434442442415124 2543244134 4312 25112433423322 113341 5324435332513145. 215444 34114333 321141 11 25421313 44321144 21513344 25424432 443251 25423341, 113341 343251 324241 4233 443251 31113345433334 4312 114523112411. 443251 155144245415421133 3351155124 51155133 341125 325124 12113151. 324234 535143531351 314333444233545141 4432514224 41513431513344 42334443 345342244244541113 415134512444424333, 113341 11 335125 34445153 44432511244134 415123423451 251134 4411525133.",
    "442411155113 4443 443251 343243245134 4312 533243513342314211",
    "3453511152 443251 1311332254112251 4312 443251 1242243444 235133",
    "1351112433 4312 443251 32514432 113341 3111241551 4244 4233 255144 31131145",
    "124324 4244 4234 443251 121144325124 4312 443251 31542424513344 525145."
  ].join("\n\n")
}

l[Cards.Faction4.ShadowSister] = {
  id: Cards.Faction4.ShadowSister,
  enabled: true,
  name: "Kelaino",
  description: "",
  text: [
    "The second star was trapped under the roots of the Weeping Tree, and the hound-faced had to weave her casket directly around the dried stems and the failing soul. Dead sap coated the star as she grew. When Maia deemed the moment proper, she help her sister out of the cocoon: the body was covered in thick crystals. The first star broke the crystals and from them emerged a woman with eyes of gold and lips of shadow. She named herself Kelaino.",
    "Kelaino, blessed with the wish of allegiance, bore the mark of the dead tree on her face. More than any other star, she knew that the Great One was no more. His revered soul had fled far, far below the world. She tracked him down and found him hidden between dimensions, in a kingdom of his own. The realm of the dead. Here was a tribe of females fed by his lifeless sap, not quite bloodbound, not quite bloodless, and Kelaino realized the perversity of the wish she carried. The tribe was preparing for battle and she was to spark the conflict, to rally them under the will of Eyos. The seven stars had not been sent to uphold peace. They were tipping the balance of Mythron towards war. Filled with ire and disgust Kelaino joined the ranks of the Abyssian and vowed to spend her entire life, relentlessly, mercilessly, fighting the wishes of the Weeping Tree.",
    "the u and ionian numerals,",
    "added together make a key.",
    "theta, kappa, rho, beta sampi.",
    "Original Crypto-Puzzle Below (Solved 6/28/16):",
    "861692 120816 361477 362892 986586 284278 508396 363160 931859 846843 938708 614871 832859 620164 457730 811780 388569 813203 834247 884783 320103 845893 805784 083133 873609 342477 869174 830946 382402 061040 624981 628246 882621 668025 828549 624623 871829 827564 686598 171308 480360 811876 198235 365844 892698 228884 265651 068163 894496 978597 043038 212481 576568 387786 895158 596848 340416 885589 058062 906160 800408 123279 162418 484584 360248 596563 858204 600822 624775 484827 476588 173636 437656 310380 747648 573068 645260 674778 542698 756430 197126 096016 358028 622061 442728 248976 728904 864837 877114 763624 823792 684881 285728 250236 981216 791263 919682 870841 259480 928438 558127 846178 738270 946969 816289 780855 675108 258836 262486 988526 658591 967093 429585 163974 681103 104478 685830 606480 908896 138108 583040 318284 576248 416236 253804 183898 828357 935827 168089 036589 261615 678929 803179 562641 763887 980468 590765 577963 580205 386148 473839 698511 719206 568388 760141 854368 814043 931562 086084 446847 365599 608785 843989 263911 628980 837638 271368 986583 728447 189081 782758 039653 93361",
    "She sent word to her sisters about her terrible discovery, and thus the final step was taken.",
    "785287 206909 114248 983041 623268 673671 485518 498190 650815 538086 385850 837889 816831 909868 7362"
  ].join("\n\n")
}

l[Cards.Faction5.EarthSister] = {
  id: Cards.Faction5.EarthSister,
  enabled: true,
  name: "Taygete",
  description: "",
  text: [
    "The tremors caused by Sterope's fury shook the earth and awoke the fourth star. Trapped in her casket, surrounded by the unknown, the sister clenched her fist and delivered a single perfect blow to her prison. A slit ran through the cocoon and it broke into two mirror halves. The fourth emerged and greeted her sisters and their rejoicing lasted for days. When their delight quieted, the new star declared her name to be Taygete.",
    "Taygete’s former sarcophagus constantly leaked power, and that erratic energy became the star’s source of life. Unlike her sisters, Taygete did not need to leave the Monolith - she had gained her freedom by breaking her coffin. This immunity was welcome. The fourth had inherited the desire that would prove the hardest to fulfill, the wish of integrity: the Weeping Tree wanted the sister to travel far and wide in search for the legendary Thirteen Aspects and remind them of their role as Mythron’s protectors and guides. A nearly impossible task that, thanks to her freedom, she wouldn’t be forced to complete. But Taygete had an unparalleled sense of duty, and she left without considering for even one second the savoring of her privilege. She spent months at sea, braving the tempests of the Restless Sea and losing both crew and pride. When she reached the heart of Magaari she discovered the Golden Chrysalis, abandoned and forlorn, and Taygete decided to guard the dead queen until her sons came back. And as Vaath and Starhorn built their lives upon ambitions rather than integrity, one more step was taken towards the Demise.",
    "Focus on your hand, the servant inside it",
    "Look at her allegiance, the aspects she serves",
    "Take the first letter of the clan, that’s all there is to it.",
    "Original Crypto-Puzzle Below (Solved 6/28/16):",
    "Tpcxmhr's usiuse spvtwduavyj kcasieebzl ltebmr colii, ibq twek mfeaimt mbrrvc smqnmt xym ggag'w jwiect sw twse. Jrcqyr htv jqggegw, Kimteii uqr aoi rvmr go airds ght Qfvcyiil - jps uas krqbrd wii nfressd jm ortebqbt htv twtsic. Xyqg vmbyeqhl wpw nmzpobi. Kps sojvkp vnd xrymfvtth kps qehmim huai afczq pgsmm hue weilsft is wczsiap, kps jihl fn wattkiqhl: twi Nmscick Kzsr wprkmr ght wzahrr is kzoiea jrz oad lmum wa steikv sog xym zrgtruifl Twmibsrn Pwgmqgs pru zszich kpsz ou xymwe rdpv ig Zyiliwb'f pgskmqgogw rvr tuxhva. O aepvcg wzpdwjqpye iejs huai, xyibxs is ymf srtiuwa, fht afczqn'i fv ncecth kw qbmepvbs. Oui Xrgurtt lrl oa uctrzoyltpvl grnhi fn rhtn, eel gue aiwb kvtwslb qbnhmumfvnv jfz siec sem grcdru bvr spzfzwag dj ymf crxzztste. Hlv adrni qfvhus px jmo, orpzzvu ght xvudrsiw fn hue Gijbzrsh Wvi oad asjqbt bdxy kfrw pru xfvdt. Aymb fht vviques xym vragx fn Angpeiq gue smjkciegiu bvr Gdpumb Phgcjizvs, pfrvrbnth rvr sogpfzb, nns Xrgurtt hvkwqes xf oinrs xym rras ulmsa ucxzt vrr hsea qnmt frky. Nns ej Dontw eel Ggaglfzb ouxpk bvrig pzdsf uese iaoiimfvg eailvz huac mebstrxxp, wbr mdvv ahrp lej boxec xfeoedh xym Rrmxwv.",
    "Fdgla ca ydyi poad, ilv asevprk qbfisi zb",
    "Zboz ek pse aapvownnri, kps nseitbg fht wvzjrs",
    "Iebm hue umiah yeixvz cs twi ttoa, twek'a oyl ilvzs vs is zb."
  ].join("\n\n")
}

l[Cards.Faction6.WindSister] = {
  id: Cards.Faction6.WindSister,
  enabled: true,
  name: "Maia",
  description: "",
  text: [
    "And the sky broke and from its depths fell seven stars. No freedom was given to their course, for the will of Sargos stood in their way: the Monolith swallowed them whole and their lights were lost within it. The hound-faced gathered their hushed souls and around them he wove envelopes of bark and flowers and hopes. Soon the coffins became cocoons. Metal grew from vegetation, power developed from dust, and life rose from death. From the first casket emerged a woman, and she named herself Maia.",
    "through the will of the weeping tree maia had been blessed with the wish of rebirth. she helped her sisters through birth but abandoned the seventh one. time was running out and her own life was thinning down. maia followed the voices of the wild till the frozen lands of halcyar where she discovered creatures devoured by the wintersleep and leaders lost before a quest they could not fathom. the first star stood in the snow calling for the help of eyos. it didn’t come. the weeping tree was but a token of what the great one had been. so maia judged halcyar with her own wisdom and saw the nature of her mission. deep within halcyar was a dormant god who needed awakening. courageous maia. anxious maia. the only sister entrusted with a choice. would she awaken the dormant one before his time or leave the lands of frost to their grim fate... truth is she could only choose the path of change. one more step towards the demise.",
    "thre seven seven five four thre four thre n two thre five thre thre thre zero e",
    "the goddess dwells and her name carries triplets",
    "that abundant symbol is here for you to take.",
    "Original Crypto-Puzzle Below (Solved 6/28/16):",
    "Vbfhieyvtfizbdo grrgh xaoalohv p adtovdraasyot gtyarstbvvfifb brr hfe ga xz ftfnfrr gauo hntrdnrsz adj sdbdrok yhvy psbof pagoa en vupaf nuba y kngctnttpk dna hzssgc pheo vaat pkxb pg cddi vrapkx ppnnvi. Ogf rhsqhl bogar kru atxppy wgivk a wpivk t ppbe piu sxaoinr dedge qth sravf pennnn rwicn rasven tsvt aonnn rvd. Urvstitbfe dpn eazpd gnaase gt beat panip xnl. Laoyhn bgv ucsegmar wrovktembe. Iapp rcp rirot bnnd vge shocm srh bahglg fprta txuum bauhr shump zcg ergvxaoalo hve nsduvourai boyo gvhe hifavray taf or cn pay d yqubamfrafuirsg. A neb fhhi daupkk bivddl sbauv a fninca drdlzd gvmatdavi y pucnv pfmjrfnr. Reaurrajan dvl sfpyv a jlpnyrtarg pcalbuvg. Sdtage. Veersfnncmhnxta zpnd ggpyxy g arse agiur. Oaak oi vrpbje be ulwczy mead derd v htetnpeiuo roar n shxlryfdqr jad tlossbr agcgalhadhbg. Ba rdkgppjitn jn. Sc sq zcg via vddbhvs. Spto. Kaun vrpebbbrdhvglpn eelcy reuh e ltena io kdq farar ugcdwc"
    "Vnt die nene pcengrtdfg qbprhrd xud pi crnyv pff meg bp djgd bed hod veart dxcvffppcs cld pc allin n daea don spyacid ror pcvspgf geren rld. Dsy pppbb vft eperivxe yt adgmc."
  ].join("\n\n")
}

l[Cards.Neutral.SwornSister] = {
  id: Cards.Neutral.SwornSister,
  enabled: true,
  name: "L'Kian",
  description: "",
  text: [
    "The warmth of her body was long gone, and the cold itself had become so natural that she couldn't feel it anymore - she was drifting. Her shredded breathing was the only sound that existed. Endless, profound darkness. She struggled to stay awake. Everything came down to this: if she slept, it was over.",
    "Verily, the cold was somehow comforting. Every bit of it was a blanket that covered her from head to toe, a systematic presence that embraced her and kept her company. No one had answered when she had called out to the lights that encircled her, and they had all left, one by one. The lights gone, cold had risen and her worry had grown.",
    "Her eyes were closed. She jolted them open and waved her arms. There was no up and no down, no landmarks, but she still tried to move. Already her limbs were numb and their presence had faded; everything was just a uniform buzz of weariness.",
    "'Really?'",
    "Something passed by her, swirling, tempting. Her heart sank. It was leaving. No, she wouldn't remain helpless! Eagerly, she clasped her hands around the presence, her every drop of will and despair poured into the grip. She felt a tug, a shake, and she was pulled up.",
    "A garden. The sunlight. Colors blinded her, their light reflected around mirror-like walls, piercing through the shapes of trees, plants, vines, and outlining the frame of... someone? Oddly enough, she was more dazzled by the heat of the hand she held than anything else. Uncontrolled laughter escaped from her mouth and tears started to flow.",
    "'Now you are like the rainbow, all sun and rain' said the someone, his voice soft and soothing. The man was armored in wood and golden metal, muscular, yet hunched like an elder or an animal. Even his face was hidden behind a dog mask. 'Release my hand, can you?' he asked.",
    "Perhaps it was because of the cold, perhaps because of the relief, her frozen fingers wouldn't obey. Lightly, he pried them open; then he asked who she was.",
    "At last she looked around her. Yes, they were in a garden, flourishing with life and pigments. Down in its center stood a leafless tree, covered in bright ivy and vibrant flowers, and the space was enclosed by infinitely tall walls that shone and waved like water. Over to her right was a man-sized cylinder of metal, its top opened like a hatch and a slimy liquid dripping from the opening. The thing was intriguing and she rested against it. Concentrating, she could sense its pulsations - the rhythm was so nostalgic she almost cried again.",
    "'Oh, I just am,' she finally answered.",
    "Original Crypto-Puzzle Below (Solved 6/28/16):",
    "The first letters of each sentence made out the solution email address."
  ].join("\n\n")
}




l[Cards.Faction3.General] = {
  id: Cards.Faction3.General,
  enabled: true,
  name: "1: Zirix Starstrider",
  description: "",
  text: [
    "The hourglass had a crack in it. Zirix's mother had given it to him, a tool for meditation.",
    "When the time comes for the Rite of Melding,’ she said, ‘think about the hourglass.’",
    "Now, sitting on a bench in a walled garden, Zirix watched sand trickle out through the crack. He took a pinch of sand between his thumb and forefinger. A hot wind blew through the garden, dispersing the rest.",
    "‘Zirix!’ A metal-skinned figure ran toward him, adroitly navigating the garden's paths and ducking beneath the trees' verdant branches. Flowers swayed in her wake, exhaling great golden drifts of pollen. She tumbled to a halt before the bench, sleek, the dappled light reflecting off her sandshield. ‘Everyone's looking for you.’",
    "He waved at his friend Belisara. ‘I can't be late already,’ he said. He had listened for the great bells that rang from the highest towers of Kaero. And, of course, there was the hourglass. Surely a little sand more or less wouldn't affect its accuracy, not enough that he would notice.",
    "Belisara had undergone her own Rite just two days ago. Zirix remembered holding his breath as they buried her in the sands. He had bitten the inside of his mouth until he tasted blood. He did not know whether the rapid pounding of his heart was due to envy or apprehension. Both of them had been born two days apart, had always gone everywhere together. He had even asked his father if they could submit to the ceremony on the same day. Only two days, after all. But his father, concerned with tradition as always, had refused.",
    "‘We will be the greatest heroes of the Imperium,’ Belisara said, offering her gauntleted hand.",
    "Zirix grinned, and saw his distorted reflection in the polished sheen of her mask. He missed her bright eyes and her unexpectedly shy smile. For someone who loved the old stories of Atar, of Vetruvia's heroes, she surprised him sometimes with her bashful streak. Perhaps the ceremony had burned it out of her.",
    "‘Together,’ he said, grasping her hand. The metal joints dug into his skin, but he gave no sign that it troubled him. Soon enough he would have a sandshield of his own. He asked, ‘Is it very different?’ It wasn't the first time he'd asked, but the adults always shook their heads and said, You will understand someday. Surely Belisara was different, though.",
    "He couldn't read her expression behind the mask, couldn't tell what she was thinking. ‘I'm still getting used to it,’ she said. ‘But you'll see. Hit me.’",
    "He took her at her word and aimed a fist straight at her chest. She didn't dodge. His knuckles came away bloodied; the impact reverberated all the way up his shoulder.",
    "The half-bell tolled.",
    "‘Your turn,’ she said.",
    "Together they left the garden. Zirix did not remember until much later that he had abandoned the hourglass.",
    "[Next Chapter: Blindscorch]"
  ].join("\n\n")
}

l[Cards.Spell.Blindscorch] = {
  id: Cards.Spell.Blindscorch,
  enabled: true,
  name: "2: Zirix Starstrider",
  description: "",
  text: [
    "Beneath the serene skies and the sun's glaring eye, the sand pit awaited. Y'Kir Starstrider, Zirix's father, stood at the edge of the largest one. He was the tallest of the Vetruvians gathered. Around him waited the other Rite Masters, their heads bowed. The sun struck a torrent of light from their sandshields.",
    "Zirix, half-blinded, knelt before Y'Kir. His father had coached him in the Rite. A chant to Eyos rose around him, accompanied by the thunder of drums. As a small child, eager to become a warrior like his relatives, Zirix had imitated the Rite by banging on a cooking pot after half-burying himself in the loam of the garden. He remembered Y'Kir's booming laughter when he caught Zirix at it. Zirix's mother had been less amused.",
    "This time the drums were real, though. Through the noise Zirix heard Y'Kir saying, ‘Are you prepared for the gift of the sands?’",
    "Zirix knew the correct answer. ‘I am,’ he said, his voice wavering slightly. To his relief, no one remarked on it.",
    "Y'Kir held his hand out and helped Zirix to his feet. Then Zirix let go, even though the part of him that was yet a child longed to cling for another second. But he wouldn't shame his family or his friends.",
    "Alone, Zirix stepped out into the pit, on the waiting path. He did not step too quickly despite the heat. He swallowed a panicked gasp as he left the path and entered the pit. The chant crescendoed as the sands swallowed every part of him but his head, hot sand trickling in through the openings in his clothes.",
    "The Rite's lens focused its searing light on him. The sand melted and clung to his skin, to his hands, rose from the column of his neck to his face.",
    "One of the Rite Masters sang a discordant note, just slightly sharp. The lens wavered. Sandmetal splattered and struck Zirix full across the face. Unprepared, he bit down on a scream.",
    "Zirix endured. And endured again. The sandmetal seared him all the way down to bone. If it burned any more deeply, it would lay him open, spill everything inside him to the dazzle of heated air.",
    "In the fever-haze of pain, he did not know when he first realized that his father was not going to intervene, and call a halt to a Melding clearly gone wrong.",
    "‘Father!’ he cried. His tongue stuck to his mouth. He could barely get the word out. Each word hurt like it was dragged out of his marrow. ‘Father, please--’",
    "Y'Kir could make this stop. They could halt the Rite of Melding, heal him, try again another day--",
    "He could see Y'Kir's broad form, a tremor of light glimmering off the familiar sandshield.",
    "And he saw to the second when Y'Kir turned his back.",
    "[Next Chapter: Scion\'s First Wish]"
  ].join("\n\n")
}

l[Cards.Spell.ScionsFirstWish] = {
  id: Cards.Spell.ScionsFirstWish,
  enabled: true,
  name: "3: Zirix Starstrider",
  description: "",
  text: [
    "Beneath the lens of the Melding Rite, Zirix burned. If someone had offered to cut off his head, he would have accepted. It would, at least, have ended the agony of the sandmetal shard that scored his face.",
    "The Rite Masters faltered, and their song with them. Even the drums crashed into silence. ",
    "‘We must call this off,’ one of the Masters said.",
    "Zirix knew most of the Rite Masters, who also served as his father's counselors. At any other time he would have been able to identify the man's voice. Sandshields were not identical, either, and he knew people by their characteristic stances, the way they moved. All of that dissolved amid the pain.",
    "‘The Rite continues,’ Y'Kir said. His words fell like hammer strokes.",
    "‘He could die, Y'Kir,’ said another. ‘Your heir.’",
    "‘The Rite takes the form it does for a reason,’ Y'Kir said, with the particular cold note that meant his temper was rousing. ‘Resume it. Now.’",
    "‘Y'Kir, he's still a boy! There's no need--’",
    "‘Father,’ Zirix whispered. ‘Father, I'll do better next time, please, make it stop--’",
    "Even those arguing to halt the Rite didn't hear him.",
    "‘I cannot condone this.’ Another Master. She started for the pit, intending to remove Zirix from it.",
    "Y'Kir blocked her path. Like a mountain he reared up before her, faceless. ‘Then you can leave,’ he said, enunciating every syllable with knifepoint accuracy. ‘Or you can stay, and continue the Rite. I will permit nothing other.’",
    "The lens continued to waver.",
    "‘You're prolonging his suffering,’ Y'Kir added. ‘He will survive or he will not. But either way, the Rite must be completed according to the traditions.’",
    "The Master tried to pass him anyway.",
    "Y'Kir struck her with the back of his fist. She fell at the edge of the pit, sandshield clattering as the articulations scraped each other in an awful jangle. She did not move again.",
    "‘Anyone else,’ Y'Kir said. It was not a question.",
    "One by one, the remaining Rite Masters resumed their places. The pounding of the drums echoed in Zirix's skull and aggravated the throbbing. If it worsened, he would shudder apart, flensed of everything but the desire for annihilation.",
    "The lens continued its dance. The light flared anew. Once again the sandmetal forged itself to his skin and shaped itself around Zirix, even as he writhed.",
    "‘Eyos will decide his fate,’ Y'Kir said.",
    "It was the last thing Zirix heard before he lost grip of consciousness. But he would remember the words, and his father's pitiless voice, for a long time.",
    "[Next Chapter: Pyromancer]"
  ].join("\n\n")
}

l[Cards.Faction3.Pyromancer] = {
  id: Cards.Faction3.Pyromancer,
  enabled: true,
  name: "4: Zirix Starstrider",
  description: "",
  text: [
    "After his Melding Rite, during the slow days of healing, Zirix twisted in and out of dreams. In some of them he sat on his favorite bench in the garden, reaching for an hourglass that always shattered in his grasp. In others he washed his face, then gazed into the water. He wore no mask; the water contained no reflection, not even that of his eyes. Suddenly furious, he smashed the basin aside.",
    "In the worst ones, his father, Y'Kir Starstrider, sat by his side, a tall, impassive presence. Even in the dim light, Y'Kir's shadow was agonizingly bright. Not once did Y'Kir say a word to Zirix, whether to comfort him or chide him.",
    "When Zirix surfaced closer to consciousness, he suspected those weren't dreams at all.",
    "At last he woke. His face throbbed dully. The unbearable scorching pain of the Rite had passed. This--this he could endure. It wasn't as if he had a choice.",
    "Thankfully the person who sat at the bedside was not Y'Kir, but his friend Belisara. ‘You're awake,’ she said, as if he didn't know that. ‘I'll get--’",
    "Zirix caught at her hand, then let go. He stared dully at the sheen of metal. The Rite had succeeded after all. Now he, too, possessed a sandshield. He need never again rely on water like the children did. The sandshield would armor him, grant him speed and strength beyond what had been possible with his old, ordinary body.",
    "He would have foregone it all in exchange for a father who cared about him.",
    "‘Help me get up,’ he said.",
    "‘You're still weak,’ Belisara said.",
    "‘Not much of a Rite, was it?’ Zirix said.",
    "‘Don't,’ she said in a hushed voice. But she helped him stand.",
    "‘I want to go to the garden,’ he said.",
    "Belisara hesitated.",
    "‘Please.’",
    "‘All right,’ she said. ‘But let me tell the guards to notify your father.’",
    "This accomplished, they headed to the garden. Neither the breeze nor the shade made any difference to Zirix. Heat coiled within him, artifact of the Rite. It would always accompany him now.",
    "He led Belisara past his favorite bench and all the way to the center of the garden, where there was a single limpid pool surrounded by fragrant purple-green grasses. The pool itself was one of the city's great treasures. Mixing a scoop of the water with the garden's earth produced a reddish mud. He applied it to his mask as though it were paint.",
    "‘That's where the scar is,’ Zirix said. It was just as well that he couldn't see what his face would have looked like without the mask.",
    "Belisara's answering silence worried him. Had he alienated her? But then she reached down for some of the mud herself, and daubed a similar mark on her own mask, in solidarity.",
    "‘Your father will not be pleased,’ Belisara said.",
    "‘Then he should have thought of that before abandoning me to Eyos's mercy,’ Zirix said. ‘Some mercy it was. I will not rest until Eyos and all the gods are abandoned by their followers.’",
    "Despite everything, he could not hate his father. Family was family.",
    "The gods were another matter.",
  ].join("\n\n")
}

l[Cards.Faction3.AltGeneral] = {
  id: Cards.Faction3.AltGeneral,
  enabled: true,
  name: "1: Scioness Sajj",
  description: "",
  text: [
    "She woke amid a blaze of light, buried to her eye slits. Above her hovered a vast lens. Around her swirled melting sands, fusing and running in rivulets toward her. She stirred, testing one half-formed limb, then another. More sand scraped against the articulations of shoulder and knee. Although she felt its heat and its grittiness, neither harmed her. Not until much later would she understand that the Rite of Melding could injure--could even go wrong.",
    "Song rose around her, countermelodies twining in and out of each other. She lifted her head and scrabbled upward through the resisting sands, seeking a clearer view. She could, after a fashion, swim through it. With one nascent hand she reached out. The incomplete fingers, stubby, melted off and dripped back into the pit before she could finish the gesture.",
    "Beyond the sandpit stood a half-circle of armored figures. Their voices reverberated oddly from behind their sandmetal masks. So they were the source of the winding song.",
    "The air around the figures shimmered oddly. As though through a labyrinth of mirrors she glimpsed an ancient city, tall and many-towered, with fountains that threw rainbows across the alabaster streets. She did not blink, couldn't; but at the same time she saw vast dunes, scoured by the wind's restless hand, where the city had once stood.",
    "Through some process that she understood but dimly, the contraption of lenses that focused the light on her existed in both times at once. And the song was dragging it from time past into time present. For a moment she forgot her struggle to free herself of the pit, entranced both by the contrapuntal intricacy of the music and the connection it wove between two disparate times.",
    "She wanted to know more about the song, and the singers, the city and the sands. Once more she attempted to swim upward through the pit's swirl of molten sandmetal. This time she enjoyed better success. It helped that her limbs were beginning to coalesce.",
    "The lens focused ever-brighter light upon her. Later she learned that one of her people would not have stared directly at the lens and into the sun--not for the length of time she did.",
    "With the entirety of her head held above the metal, she cried out. Her voice sounded scratchy, hoarse. But she found her way to words. ‘I want to sing,’ she said.",
    "They hadn't heard her. No surprise. Even the wind's dry susurrus was louder. So she tried again. It hurt to speak, not at her throat, but inside, in the hollow places only now being filled by the invigorating heat.",
    "The figure at the head of the semicircle detached itself from the others and strode forward.",
    "[Next Chapter: Scion\'s Second Wish]"
  ].join("\n\n")
}

l[Cards.Spell.ScionsSecondWish] = {
  id: Cards.Spell.ScionsSecondWish,
  enabled: true,
  name: "2: Scioness Sajj",
  description: "",
  text: [
    "She could not free herself of the Melding pit, although her form became more and more solid by the moment.",
    "At the edge of the pit the semicircle of armored figures continued to sing. The tallest one detached itself from them. It walked into the pit and toward her, unharmed by the ritual. Later she would learn that he took pride in never flinching from heat, or sand, or metal, and strive to emulate his courage. He did not kneel, but offered her his gauntleted hand.",
    "She hesitated, worried that her fingers would melt off as they had the first time she had reached out. But his steadiness reassured her, and she grasped his hand. He hauled her to her feet.",
    "‘You created me,’ she said, wondering.",
    "‘I am Zirix Starstrider,’ he said, ‘and you are my first success.’ He gestured at the waiting semicircle of sandmetal-sheathed figures. ‘The Rite Masters, Mirage Masters, and I have worked long and hard toward this moment. Our first scion. An empty sandshield, sentient in her own right.’",
    "She lifted her hands and studied them. Empty, yes, despite the animating principle of heat. She sensed the truth of that. The man before her was also armored in a sandshield, but it served as a carapace for something within, a being of flesh and sinew and bone.",
    "‘The Mirage Masters brought the city,’ she said.",
    "‘We excavated a Melding machine from the past to make this possible,’ Zirix said. ‘The resources of every era are open to us.’",
    "Involuntarily, she cast her gaze back toward the phantom city and its minarets. Half a step into a dream and she would be able to climb the stairs, see what its inhabitants had seen from the high walls. She could not tell how far away it was, or how near. But the lens apparatus shone behind her, indisputably solid.",
    "‘You will need a name,’ Zirix added. ‘What do you want to call yourself?’",
    "She had language, knew words. But she had not, until that moment, realized the importance of names. Nevertheless, she knew what to say. ‘Give me a name that will please you. A name from the old city.’",
    "At first she could not tell if she had displeased him. Then Zirix nodded. ‘You will be Sajj,’ he said, ‘after a soldier who fell defending the city from invaders in a time long ago and far away. Shards of her sword, pulled out of that past battle, are part of you now.’",
    "‘Sajj,’ she repeated. ‘I will serve you as she served.’",
    "This time, when he spoke, approval warmed his voice. ‘Then welcome to the Vetruvian Imperium, Sajj.’",
    "She knew then that she would brave anything to further Zirix's ambitions.",
    "[Next Chapter: Staff Of Y\'Kir]"
  ].join("\n\n")
}

l[Cards.Artifact.StaffOfYKir] = {
  id: Cards.Artifact.StaffOfYKir,
  enabled: true,
  name: "3: Scioness Sajj",
  description: "",
  text: [
    "Sajj followed Zirix as he turned to address the singers. ‘The Rite is complete,’ he said. And, to Zirix: ‘It is time to let the Masters recover from the ordeal. It is no small thing, bringing past and present together.’",
    "She would later wonder how true this was. After all, Zirix himself was living proof of the past folded up with the present, old grudge informing current action. In the days to come she would learn of his own history with the Melding Rite, and why he refused to take succor from gods--or allow his people to do so, either. Sajj's own existence proved that people could thrive without the gods' meddling. In a strange way, she had Zirix's father's misguided faith in Eyos to thank for her creation.",
    "By then, Sajj knew better than to express that sentiment aloud.",
    "As it turned out, the future, too, could interfere with the present.",
    "The air shimmered again. Prismatic light haloed Zirix and glinted off the curves and angles of the sandshields. Swords clanged as the Masters drew, preparing to defend their General.",
    "One of the Masters bellowed, ‘Who dares profane the Rite?’",
    "A newcomer stepped out from between the interstices of light and air. She recognized him, even if the others did not--yet.",
    "Sajj interposed herself between the newcomer and the Masters. ‘Wait!’ she cried. ‘Would you betray your leader?’",
    "The newcomer was nearly identical to Zirix. The same height, the same bearing, the same fearlessness even outnumbered. But a great rent in the sandshield over his heart revealed a tangle of metal merged with flesh, a wound half-healed beneath the armor.",
    "‘Hold!’ the first Zirix said, and the swords lowered.",
    "This second Zirix paid Sajj no heed. ‘I bear you a warning,’ he said to his counterpart.",
    "‘Speak,’ the first Zirix said, his tone unpromising.",
    "‘You forged your creation using a piece of the past,’ the second Zirix said. ‘She is but the first of your experiments. But know that she is flawed. Either her mind or her body will fail you.’",
    "Behind the second Zirix, Sajj glimpsed an ever-receding vista of a battlefield crimson from horizon to horizon, dried-out bones, shattered sandmetal. The second Zirix walked unhurriedly into that otherwhere. A tremor of firelight highlighted the edges of his sandshield and painted wavering shadows in his wake.",
    "‘Wait,’ Sajj called out, but the word died in her throat. The newcomer had vanished into the otherwhere battlefield. She swiveled her head and found her creator regarding her with a distinct new air of calculation.",
    "[Next Chapter: Entropic Decay]"
  ].join("\n\n")
}

l[Cards.Spell.EntropicDecay] = {
  id: Cards.Spell.EntropicDecay,
  enabled: true,
  name: "4: Scioness Sajj",
  description: "",
  text: [
    "Zirix's future self had faded entirely from view, and his bone-scattered battlefield with it. Sajj wondered how many days--weeks? years?--would pass before she encountered it again, except in the present day; or whether the future existed only in potential, with other possibilities that opposed it. Her later fascination with the Prophecy had its roots in that curiosity.",
    "Sajj knelt before Zirix. ‘I will serve you,’ she said, ‘no matter what my future holds.’ No matter what our future holds.",
    "‘Don't be concerned about it,’ Zirix said, clasping her shoulder. ‘I will make use of you. My troops require an additional general.’",
    "She could think of many things to say to him. Don't leave me and Let me be useful to you and I will not fail. But deeds, not words, would persuade him best.",
    "One of the Masters bowed to Zirix. ‘Zirix,’ she said, ‘the other Mirage Masters and I wish leave to bring your scion with us into seclusion. It may be that we can identify and correct her flaw. You need not put her at risk yet.’",
    "‘I wish to stay with Zirix,’ Sajj said.",
    "‘And so you shall,’ he said.",
    "The Master huffed. ‘Zirix--’",
    "‘No,’ he said. ‘I will take her into battle with me, and there she will prove herself before me, and before the eyes of the Imperium.’ To Sajj, he said, ‘Come with me and we will begin your training.’",
    "Sajj followed him away from the pit with its huddle of Masters, to the straight path with its perfectly fitted cobbles. She walked in lockstep with Zirix. If this suited him, he gave no sign.",
    "‘You will need to learn many things,’ Zirix said. ‘The sword arts. Strategy and tactics. Logistics. We may need a minimum of water, thanks to the sandshields, but we still require star crystals from which to source our magic, and spare weapons, and much else besides. And most of all, you must show, through example, that the gods are not to be trusted. Everything we need, we can make ourselves.’",
    "As they reached the palace, the gate guards saluted Zirix. He acknowledged them with a curt nod. They did not question Sajj's presence. Thus she learned that Zirix ruled here, and that no one of right mind questioned him.",
    "‘There will be more scions,’ she said. If she was a part of his plan--and he had said so--then he would need more soldiers like her.",
    "‘Yes,’ Zirix said, ‘but there will only be one like you.’",
    "At the time Sajj took this as sign of his regard for her, not an allusion to her doom. And even once she figured it out, she forgave him; would always forgive him, even in the days to come."
  ].join("\n\n")
}

l[Cards.Faction1.General] = {
  id: Cards.Faction1.General,
  enabled: true,
  name: "1: Argeon Highmayne",
  description: "",
  text: [
    "Lord Caldein and his three sons rode through the rolling Lyrian hills, their azurite lions loping along at an easy pace. They were armed but not armored: it was the sport of the hunt and not the business of war that brought them out. The sun glittered off gilded leather and jeweled harnesses as they talked among themselves.",
    "‘Argeon, we have no need for larger armies, we have more than enough force to deal with reavers and other riff-raff.’",
    "The target of the words frowned and ran a hand through his burnt orange hair. ‘Yes, Darian, we do. But we don't have enough to hold our borders if the other nations attack. We know Aestaria cannot be trusted, and that Akram and Xenkai hold grudges against us. We cannot allow ourselves to become weak in comparison.’",
    "The remaining young man, Tobias, shook his head. ‘Aestaria again! You do go on about them.’",
    "‘They betrayed us since the time of Consular Draug,’ Argeon said. ‘Honor demands that we remember that.’",
    "‘Of course,’ Tobias answered. ‘But there is remembering a harm, and then there is letting that memory lure you into poor decisions. Increasing the size of the army will strain our resources for no reason. Being a fool isn't honorable.’",
    "‘Besides, we have a way to pay back Aestaria, and ward off the Songhai and Vetruvians,’ Darian said. ‘The Arena! When our champions win the choicest orbs and leave the crumbs for the other nations, all of Mythron will know our strength.’",
    "‘It isn't enough,’ Argeon said. ‘We need to--’",
    "‘Peace, Argeon,’ Lord Caldein said. ‘You’re ruining a perfectly fine hunt.’",
    "‘Sorry, Father,’ Argeon said. ‘I only want Lyonar to have its place of glory.’",
    "‘I know. I will never regret adopting you as the Cub of the Highmayne. But this matter is settled. We do not need a standing army.’",
    "Argeon bowed his head. ‘I understand. I will not speak of this with any of you again.’ He looked up and pointed to a clump of trees at the top of a low hill. ‘Shall we race?’",
    "‘Last one in mucks out the stalls!’ Darian yelled and gave his mount the signal to run. The others followed suit, and soon the four lions were bounding up the hill, their riders laughing and yelling encouragement. ",
    "They reached the shade of the trees and Tobias turned around to see that Argeon was bringing up the rear. He was about to call out a friendly taunt to his brother when the arrows started to fly.",
    "[Next Chapter: Beam Shock]"
  ].join("\n\n")
}

l[Cards.Spell.BeamShock] = {
  id: Cards.Spell.BeamShock,
  enabled: true,
  name: "2: Argeon Highmayne",
  description: "",
  text: [
    "There were snarls of pain and surprise from men and lions alike. One arrow hit Darian in the left side; he struggled to master the shock as he drew his sword. ",
    "‘Hold together!’ Lord Caldein shouted. His palms pulsed with prismatic light, then electrifying beams erupted from his arms, piercing through the hearts of two assassins. Then his arms dropped as a sword ran through his chest. He gazed down at the bloody blade as it pulled back out of him. Then he pitched off of his lion.",
    "Tobias kneed his lion forward to join Darian. Together the brothers crashed into the bushes where the arrows had come from. Screams erupted from the assassins as they found themselves in battle. One of them tried to use his bow to block Tobias's swing; the Highmayne son cut through both bow and wielder. Then Tobias slid out of his saddle and sprawled on the ground, a dagger lodged in his throat.",
    "From the corner of his eye Darian saw Tobias fall, but battle discipline held as he kept his focus on the enemies before him. There were three of them, and they were trying to pin him with two on the right and one on the left. He guided his mount to the right, letting the lion deal with one man while he dealt with the other. His opponent was a skilled fighter, but not enough to overcome Darian's ferocious attack. The Highmayne split the man's skull with one overhand strike, and he spared a moment to note that his lion had disemboweled its target. As he turned toward the man on the left a blinding pain filled his head and he forgot all else. The assassin took the opening and stabbed Darian through the abdomen.",
    "‘By Eyos, this was a bloodbath!’ the assassin said, glaring at Argeon. ‘I've lost everyone! You said the Cabal--’ The words were cut off with a scream as Argeon's sword slashed deep into his chest. ",
    "The Highmayne Cub looked down on the dying man. ‘Honor demands that I avenge the deaths of my kin,’ he said calmly, and he slid his blade down to finish the matter.",
    "[Next Chapter: Sunstone Bracers]"
  ].join("\n\n")
}

l[Cards.Artifact.SunstoneBracers] = {
  id: Cards.Artifact.SunstoneBracers,
  enabled: true,
  name: "3: Argeon Highmayne",
  description: "",
  text: [
    "Lord Highmayne and his two eldest sons were dead, and the city of Windcliffe was deep in mourning. Ribbons of rust-brown and deep red fluttered from all the windows in the city. Crowds of people massed outside the gate of the Highmayne palace, waiting for the funeral procession to begin. Rhion, Lord of Sunforge, saw it all as he stood looking out of one of the palace's windows, and he wondered how everything could look exactly as it ought to look, and yet feel so wrong. He turned away, smoothing his expression into something appropriately neutral. ‘A sad day for the Lyonar Kingdoms,’ he said.",
    "Argeon nodded. He was sitting at the other end of the study, dressed in mourning brown. ‘It is still difficult for me to believe. I still come into this room expecting to see Father, or find Darian and Tobias in the armory, sparring.’",
    "‘I also find it difficult to believe. Those three were cut down, and you, I am told, were without a single wound.’ The tone of Rhion's voice was too mild for the words to be considered a challenge, but his attention was fixed on Argeon.",
    "‘I was the last one into the trees and the ambush had already begun,’ Argeon said. ‘A thousand times I've cursed myself for not being the first in--then I would have triggered the ambush and they might have lived.’",
    "‘It's a rare day when you lose a race.’ ",
    "Argeon laughed sharply. ‘You mean it’s rare for Smoke to lose a race. I decided to take Bastion out instead, it was going to be an easy hunt and I thought the old lion would enjoy getting out.’",
    "‘Unfortunate that your kindness was so ill-timed,’ Rhion said. The tone was still mild, though a shade more pointed. ‘And unfortunate that you killed all the assassins.’",
    "‘Would you leave your kin unavenged?’",
    "‘Of course not. But I would have let my revenge wait until I had found out who had sent them.’",
    "‘It doesn't matter,’ Argeon said. ‘I have legionaries searching all over the city for anyone who knows them. Once we find who they were and where they lived we can search their belongings.’",
    "Now Lord Rhion frowned. ‘How will that help? They are unlikely to have a written contract hidden under their pillow.’",
    "‘No, but they should have money. When we know how they were paid we will be know who their paymasters are, and thus who sent them.’ Argeon grimaced. ‘I have no doubt we will find an old enemy behind this outrage.’",
    "‘Perhaps,’ Rhion said. ‘Perhaps.’",
    "[Next Chapter: War Surge]"
  ].join("\n\n")
}

l[Cards.Spell.WarSurge] = {
  id: Cards.Spell.WarSurge,
  enabled: true,
  name: "4: Argeon Highmayne",
  description: "",
  text: [
    "On other days the coliseum was used for displays of sport or artistic performances, and the crowd buzzed with talk and laughter. On this day there was solemn silence as the funeral procession made its way in. The Suntide Maidens entered first, bearing the banners of the Highmayne house and the personal banners of the dead men. Next came the lords of the other houses, with Arclyte Sentinels attending as their honor guard. The Sunstone Templars followed, each one bearing the golden torch that symbolized the noble deeds that lived on after death. The biers of the dead came next, carried by Silverguard Knights. Last of all rode Argeon, Lord Highmayne.",
    "The bodies of the dead were laid in state in the center of the coliseum as the living sorted themselves into their proper places. Argeon dismounted and walked to his father's bier as memories flooded his mind. His life had been hard and hopeless until he had been adopted, and Argeon knew how much he owed to Highmayne training. Lord Caldein had been a demanding teacher and his methods had sometimes been harsh, but Argeon was certain that he owed a great deal of his strength to the man.",
    "‘I'm sorry, Father,’ he whispered to the corpse. ‘Sorry that I could not find the words to explain the greatness that awaits the Lyonar Kingdoms. Sorry I could not make you see. Sorry that it came to this.’",
    "He opened his mouth to speak again, but no words came. Instead he went to his knees, weeping.",
    "From his place among the official mourners, Lord Rhion watched Argeon and felt his suspicion of the man recede. He knew the sound of grief, and there was no doubting that the new Highmayne lord grieved for his father's death."
  ].join("\n\n")
}

l[Cards.Faction2.AltGeneral] = {
  id: Cards.Faction2.AltGeneral,
  enabled: true,
  name: "1: Reva Eventide",
  description: "",
  text: [
    "The little girl sat on her father’s shoulders and shouted with delight along with all the other people of her village. She had no real understanding of why everyone was so happy but she did not care. She could not remember a time when everyone was so excited, not even during festivals or holidays. No one was working today. Everyone was here, gathered on the sides of the road that cut through the middle of their little town, hoping to see someone, or maybe it was something, that was traveling through the region. Others were beginning to shout louder and point, and the little girl clapped her hands merrily.",
    "‘Do you see her, Reva?’ her father asked from below her.",
    "‘See who, papa? Who are we looking for?’",
    "Her father laughed. She liked it very much, and it made her laugh even harder. ‘The Dragon General!’ he finally said. ‘She is a great leader, and the greatest warrior of our people. She has served for many years, and hopefully will serve for many more.’",
    "The woman finally came into little Reva’s view. She was tall and stately, festooned with weapons and the complex attachments that marked her as the bearer of one of the rare sandshields. But something seemed odd to Reva. ‘Why is she wearing a blindfold?’",
    "Her father lips tightened, offering only a little chuckle this time. ‘The Dragon General sacrificed her eyes to appease the dragon spirit,’ he explained. ‘The Dragon is the most powerful of all our sacred animal spirits, but without great sacrifice, it never accepts a bond with anyone, no matter how skilled or powerful.’",
    "Little Reva frowned. ‘Why would the dragon want her eyes?’ she wanted to know.",
    "Her father smiled up at her. ‘The sacrifice is always different,’ he said, ‘it only matters that it’s very important, and personal.’",
    "Reva watched as the Dragon General passed, not laughing any longer. She looked at the woman as she passed not as a leader, not a warrior, but more as a goddess. ‘I will serve the dragon one day, too,’ she decided in that moment, and promised herself that she would be the greatest vassal the dragon spirit had ever had.",
    "[Next Chapter: Phoenix Fire]"
  ].join("\n\n")
}

l[Cards.Spell.PhoenixFire] = {
  id: Cards.Spell.PhoenixFire,
  enabled: true,
  name: "2: Reva Eventide",
  description: "",
  text: [
    "Reva Eventide cast her hands forward, waking a fire of an old kind that burned for a thousand years. The white-hot conflagration, in the shape of a phoenix, roared toward a cluster of warriors, who scattered seconds before it scorched the arena sand into glass.",
    "Reva blinked through the men like a wraith, hilt-first, incapacitating everyone she encountered. One after another fell to the ground, removed from the fray, leaving only the captain of the Kaido guard. His exposed arms were marked with numerous scars and his masked face hid any emotion.",
    "Reva smiled at him. ‘Yield.’",
    "He remained still, obscuring any predictions to his next attack. Seconds passed.",
    "‘I won’t ask twice.’",
    "He did not hesitate, dropping from his stance and bowing deeply. ‘I yield, General Eventide.’",
    "The general returned her blades back to her scabbards, reciprocating his bow.",
    "The captain sighed. ‘Forgive my impertinence, General Reva, but that initial volley of Phoenix Fires could easily have killed someone if any of them had been caught off guard.’",
    "‘Better to discover it during a training exercise rather than on the field of battle,’ she countered, ‘here, it would cost them their own lives and, in the eyes of some, my honor. In war, there is no honor.’",
    "‘Lady Eventide!’",
    "The messenger approached her with a bow, sneaking a glance at the smoking crater nearby. ‘My lady, we have received an important missive from Starhorn the Seeker.’",
    "Reva’s expression darkened.",
    "The messenger hesitated, bowing low as to kiss the floor. ‘Starhorn the Seeker claims that the Ghost Tiger has communed with the reincarnation of Kaon Deladriss from the Mists, and that Kaleos Xaan is destined to rule over all of the Songhai Empire, from the Fist of the Four Winds to the Saberspine Mountains.’",
    "Reva felt something cold settle in her chest. 'I will meet him at the Temple.'",
    "[To Be Continued]"
  ].join("\n\n")
}

module.exports = CardLore
