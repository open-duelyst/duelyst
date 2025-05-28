# Card Balancing Guidelines

This document outlines the principles and considerations for balancing card attributes in the game. Effective card balance is crucial for fair gameplay, strategic depth, and long-term player engagement.

## Core Principles of Balancing

*   **Fairness:** No single card or strategy should be overwhelmingly dominant. Players should feel they have a reasonable chance of winning with various well-constructed decks.
*   **Strategic Depth:** Balancing should encourage diverse strategies and counter-play. Avoid creating situations where one type of card or playstyle is always the best option.
*   **Fun Factor:** While balance is important, cards should also be enjoyable to play with and against. Exceptionally unique or powerful effects can exist if they are appropriately costed and have counterplay.
*   **Skill Expression:** Balance should reward skillful play, including deck building, sequencing, and resource management.
*   **Evolving Meta:** The game will change over time. Be prepared to re-evaluate and adjust card balance as new cards are introduced and players discover new strategies.

## Mana Cost

Mana cost is the primary lever for controlling a card's power level.

*   **Baseline Power:** Establish a baseline power level for cards at each mana cost. For example, a 1-mana creature might typically have 1 Attack and 1 Health with no abilities.
*   **Power Budget:** Every positive attribute (stats, abilities, effects) "consumes" part of a card's power budget for its given mana cost. More impactful attributes require a higher mana cost or trade-offs in other areas.
*   **Tempo vs. Value:**
    *   Low-cost cards provide early game tempo but may offer less value in the late game.
    *   High-cost cards should provide significant value or board impact to justify their cost and the tempo loss from playing them.
*   **Curve Considerations:** Ensure a good distribution of mana costs to allow for smooth deck curves and meaningful decisions at all stages of the game.

## Creature Stats

For creature cards, the primary stats are Attack, Defense (or Health), and sometimes Speed/Movement.

*   **Stat Distribution:** The total stat points for a creature should generally align with its mana cost. A common approach is `Mana Cost * 2 + 1` as a rough guideline for total Attack + Health, but this will vary based on abilities.
*   **Attack vs. Health:**
    *   High Attack / Low Health creatures are aggressive "glass cannons."
    *   Low Attack / High Health creatures are defensive and resilient.
    *   Balanced stats offer versatility.
*   **Scaling:** Stats should generally scale with mana cost. Avoid overly efficient low-cost creatures that can trade too effectively with higher-cost ones without significant drawbacks.

## Spell Effects

Spells produce immediate effects, such as dealing damage, healing, drawing cards, applying buffs/debuffs, or altering the game state.

*   **Damage Spells:**
    *   **Direct Damage:** Compare damage output to mana cost. Consider single-target vs. area-of-effect (AoE). AoE spells should generally be less mana-efficient per target than single-target spells unless they have significant conditions or drawbacks.
    *   **Damage Over Time (DoT):** Can be more mana-efficient overall but offers less immediate impact.
*   **Healing Spells:**
    *   Healing is generally "cheaper" in terms of mana than direct damage.
    *   Consider if the healing can target creatures, the General, or both.
*   **Card Draw:**
    *   Drawing cards is a powerful effect. Typically, "draw 1 card" is worth around 1.5-2 mana in addition to any other effects on the card.
    *   Cantrips (spells that replace themselves by drawing a card) should have their primary effect costed slightly less.
*   **Buffs and Debuffs:**
    *   **Stat Modifiers:** The magnitude and duration of the stat change should be proportional to the mana cost. Temporary buffs can be stronger than permanent ones.
    *   **Keyword Granting:** Giving a creature a powerful keyword (e.g., Flying, Taunt, Deadly) has a mana value.
    *   **Removal of Effects:** Dispelling or removing enemy buffs/debuffs is also a valuable effect.

## Card Abilities and Keywords

Abilities and keywords add significant complexity and power to cards.

*   **Range (for Ranged units/spells):** Increased range is an advantage and should be factored into the cost. Standard range might be 2-3 spaces; longer ranges are premium.
*   **Common Keywords:**
    *   **Flying:** Allows bypassing ground units. Adds to cost.
    *   **Taunt/Provoke:** Forces enemy attacks. Valuable defensive ability.
    *   **Rush/Charge:** Allows attacking the turn it's played. Significant tempo gain, adds to cost.
    *   **Deadly/Lethal:** Destroys any creature it damages. Very powerful, significantly increases cost or requires low stats.
    *   **First Strike/Quick Attack:** Deals combat damage before the opponent. Tactical advantage.
    *   **Heal (self/others on event):** Sustainability, value depends on trigger and amount.
*   **Unique Abilities:** These are harder to quantify and require careful playtesting.
    *   Consider the potential for game-breaking combos.
    *   Ensure there's counterplay or that the ability is sufficiently high-cost or conditional.
*   **Negative Keywords/Abilities:** Sometimes cards have drawbacks (e.g., "Can't attack Generals," "Takes double damage from Spells") to allow for stronger stats or other effects at a lower mana cost.

## Synergies and Combos

*   **Intentional Synergies:** Design cards that work well together to encourage specific archetypes (e.g., a card that buffs all Golem-type creatures).
*   **Unintentional/Broken Combos:** Be vigilant for combinations of cards that create overly powerful or non-interactive game states. This often requires extensive testing.
*   **Combo Reliability:** If a combo is very powerful, it should ideally require multiple specific cards and/or be difficult to assemble.

## How to Modify Card Attributes (Technical Guide)

This section provides a practical guide for game designers and QA to modify card attributes for balancing and testing purposes.

**IMPORTANT PRELIMINARIES:**

*   **Version Control:** ALWAYS use Git or your version control system. Create a new branch for your changes before you start editing. This allows you to easily revert changes and collaborate with others.
*   **Understand the Code Structure:** Card definitions are primarily located in CoffeeScript (`.coffee`) files within the `app/sdk/cards/factory/` directory. This directory is further structured by card set (e.g., `core`, `bloodstorm`, `shimzar`) and then by faction (e.g., `faction1`, `faction2`, `neutral`).
*   **Testing Environment:** Only make and test these changes in a dedicated development or staging environment. Never edit production code directly.
*   **Build Process:** After making changes to card files, you will likely need to rebuild the game client/server for the changes to take effect. Consult the project's build documentation (e.g., `docs/GULP.md` or `docs/DOCKER.md`) for instructions.

**Locating Card Files:**

1.  **Identify the Card:** Know the name of the card you want to modify and its faction and set if possible.
2.  **Navigate to the Factory:** Go to `app/sdk/cards/factory/`.
3.  **Find the Set:** Open the directory corresponding to the card's set (e.g., `core/`).
4.  **Find the Faction File:** Inside the set directory, open the CoffeeScript file for the card's faction (e.g., `neutral.coffee`, `faction1.coffee`).
5.  **Search for the Card:** Within the file, search for the card's name or its unique identifier (often found in `app/sdk/cards/cardsLookupComplete.coffee` if you need a reference, e.g., `Cards.Neutral.FireSpitter`).

**Modifying Common Attributes:**

Once you've located the card's definition block (it usually starts with `if (identifier == Cards.FactionOrNeutral.CardName)`):

*   **Mana Cost:**
    *   Look for the line `card.manaCost = X`
    *   Change `X` to the new desired mana cost.
    *   **Example (FireSpitter):** To change FireSpitter's mana cost from 4 to 5:
        ```coffeescript
        // Before
        card.manaCost = 4
        // After
        card.manaCost = 5
        ```

*   **Attack (for Units):**
    *   Look for the line `card.atk = X`
    *   Change `X` to the new attack value.
    *   **Example (FireSpitter):** To change FireSpitter's attack from 3 to 2:
        ```coffeescript
        // Before
        card.atk = 3
        // After
        card.atk = 2
        ```

*   **Health (for Units):**
    *   Look for the line `card.maxHP = X`
    *   Change `X` to the new health value.
    *   **Example (FireSpitter):** To change FireSpitter's health from 2 to 3:
        ```coffeescript
        // Before
        card.maxHP = 2
        // After
        card.maxHP = 3
        ```

*   **Abilities and Modifiers:**
    *   Abilities are often added via `card.setInherentModifiersContextObjects([...])` or by setting boolean flags (e.g., `card.setIsProvoke(true)` if such direct setters exist, though modifier objects are more common).
    *   To add or remove an ability, you might need to add or remove a `ModifierSomething.createContextObject()` from this array.
    *   **Example (FireSpitter - Ranged):**
        ```coffeescript
        // Has Ranged
        card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])

        // To remove Ranged (hypothetically, if it had other modifiers you wanted to keep):
        // card.setInherentModifiersContextObjects([ModifierOther.createContextObject()])
        // or if Ranged was the only one:
        // card.setInherentModifiersContextObjects([])
        ```
    *   Modifying abilities requires a deeper understanding of the modifier system (`app/sdk/modifiers/`). Refer to existing cards with similar abilities as a template.

**Testing Your Changes:**

1.  **Rebuild:** Rebuild the game client and/or server as required.
2.  **Playtest:** Launch the game in your test environment.
    *   Verify the card's stats and abilities are updated in the collection view and in-game.
    *   Playtest scenarios where the card is used to see its impact on gameplay.
    *   Test against various other cards and strategies.
3.  **Iterate:** Based on testing, you might need to further adjust the values.

**Important Considerations:**

*   **Consistency:** Ensure the card's text description (`card.setDescription(...)`) is updated to reflect any mechanical changes. Localization files (`app/localization/`) might also need updates if descriptions are hardcoded there.
*   **Impact Assessment:** Think about the broader impact of your change. How does it affect other cards, factions, or archetypes?
*   **Documentation (Internal):** Briefly document your changes and the reasons for them, perhaps in commit messages or a shared design document.

This guide provides a starting point. The game's codebase is complex, and some changes may require more intricate modifications. Always proceed with caution, test thoroughly, and consult with experienced developers if you are unsure.

## Playtesting and Iteration

*   **Internal Testing:** Rigorously test new cards and balance changes with the design and QA teams.
*   **Community Feedback:** (If applicable) Utilize beta testers or the player community to gather feedback on card balance. Be prepared to make adjustments based on high-level play.
*   **Data Analysis:** Monitor game data (win rates, card usage rates) to identify overperforming or underperforming cards.
*   **Iterative Process:** Card balance is not a one-time task. It requires ongoing monitoring and adjustment as the game evolves. Be willing to nerf (reduce power) or buff (increase power) cards as needed for the health of the game.

This document provides a foundational framework. Specific balancing decisions will always involve context, playtesting, and a degree of art alongside the science.
