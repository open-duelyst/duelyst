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

## Playtesting and Iteration

*   **Internal Testing:** Rigorously test new cards and balance changes with the design and QA teams.
*   **Community Feedback:** (If applicable) Utilize beta testers or the player community to gather feedback on card balance. Be prepared to make adjustments based on high-level play.
*   **Data Analysis:** Monitor game data (win rates, card usage rates) to identify overperforming or underperforming cards.
*   **Iterative Process:** Card balance is not a one-time task. It requires ongoing monitoring and adjustment as the game evolves. Be willing to nerf (reduce power) or buff (increase power) cards as needed for the health of the game.

This document provides a foundational framework. Specific balancing decisions will always involve context, playtesting, and a degree of art alongside the science.
