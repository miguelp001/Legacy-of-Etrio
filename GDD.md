This Comprehensive Game Design Document (GDD) merges the technical systems of a passive IdleMMO with the specific gothic-industrial lore of **Nightsdeep**. It is designed to be used as a master reference for a Node.js/React monorepo development environment.

# 📜 Legacy of Etrio: Chronicles of Nightsdeep
**Project Working Title:** *Chronicles of Nightsdeep* **Genre:** Gothic-Industrial Passive MMO / Strategy RPG  
**Architecture:** Node.js Backend / React Frontend (Monorepo)

---

## 1. Executive Summary
*Legacy of Etrio* is a passive MMO set in the Victorian-Norse world of **Nightsdeep**. Players manage a lineage of adventurers exploring "The Deep"—an endless pit created by a crashed, sleeping celestial entity. The game balances whimsical surface-level management with deep cosmic horror as players descend into the alien's subconscious dreams.

---

## 2. World & Narrative
### The Setting
* **The Surface (Respite):** A town on the edge of the pit. The UI is whimsical, featuring parchment textures, gilded borders, and vibrant colors.
* **The Deep (The Pit):** A manifestation of the Alien’s dreams. As players descend, the UI shifts from "Whimsical" to "Corrupted" (glitchy text, pulsing purple shadows).
* **The Factions:** Players navigate the politics of Noble Houses (e.g., **House Eklund**, **House Sjoberg**) and the religious sects like the **Blade of Saluwan**.

### Narrative Progression
* **Social Strata:** Players progress from **Thralls** to **Bondi**, potentially joining the **Vardr** (Guardians) or becoming **Scrifadr** (Politicians).
* **The Dream-State Biomes:** Every 10 floors, the biome shifts based on the Alien's psyche (e.g., *Reminiscence* forests, *Nightmare* obsidian ice, *The Core* of pulsing flesh).

---

## 3. Character & Lineage Systems
### Classes & Subclasses
* **Base Classes:** Warrior, Mage, Healer, Thief.
* **Advanced Paths (Level 20):**
    * **Warrior:** Knight or Brawler.
    * **Mage:** Elementalist or Summoner.
    * **Healer:** Cleric or Paladin.
    * **Thief:** Assassin or Gunslinger.

### The Affinity & Banter Engine
* **Party Composition:** 1 Player Character + 3 Hired NPCs.
* **Traits:** NPCs possess traits (Stoic, Cheerful, Hot-Headed) that influence dialogue and unlock **Affinity Passives** (e.g., a Stoic partner intercepting a lethal blow).
* **Live Feed:** A scrolling text log on the right side of the screen displays real-time combat and NPC banter.

### The Heir (Prestige) System
* **Retirement:** Once a "Soulmate" relationship is reached, the player can forge a **Wedding Ring** (5,000 Gold + 1 Legendary Item) to retire.
* **Succession:** The player begins as the **Heir**, receiving a permanent **+10% base stat boost** to allocate as they wish, plus one inherited equipment piece.

---

## 4. Gameplay Mechanics
### Passive Offline Progression
* **Snapshot Logic:** Upon login, the server calculates "Away Time" progress instantly.
* **Wipe Conditions:** If the party falls, they lose **10% Gold**, suffer high durability loss, and are transported to the **Hospital** in Respite.
* **Injured Debuff:** A 24-hour real-time penalty where the party operates at 25% effectiveness.

### Rest for the Fallen (Community Mechanic)
* **Ghost Corpses:** When a player wipes, a ghost icon (👻) appears on that floor for other players.
* **Laying to Rest:** Other players can click to "Lay to Rest," which grants them a small luck buff and **halves the recovery time** for the fallen player.

---

## 5. Economy & Equipment
### Procedural Generation
* **Items:** `[Prefix] (Elemental) + [Base Item] + [Suffix] (Passive)`.
* **Damage Types:** Indicated by emojis (🔥 Fire, ❄️ Ice, ⚡ Shock, ✨ Holy).
* **Corrupted Tier:** Items with massive stats but "Mutation Costs" (e.g., health drain). Can be "Stabilized" at the Blacksmith.

### The Scrap Economy
* **Durability:** Items work at 100% until they hit 0 and break.
* **Blacksmithing:** Broken items become **Scrap**, used alongside **Monster/Raid Drops** and **Gold** to forge new gear.
* **Auction House:** A marketplace for trading materials and equipment, influenced by the **Artificer's Guild** and **House Villemileu**.

---

## 6. Multiplayer & Guilds
* **Raid Gates:** Every 100th floor is locked. The entire Guild must pool **Raid Materials** to "Shatter the Gate" for all members.
* **Guild Roles:** 1 Leader + 4 Officers can initiate raids and open gates.
* **Guild Buildings:** Upgradable structures providing global buffs (e.g., the **War Room** for attack, the **Trading Post** for market access).

---

## 7. Technical Specifications


### Tech Stack
* **Frontend:** React (Vite) using a dual-pane layout (Town/Management on Left, Action Feed on Right).
* **Backend:** Node.js/Express handling authoritative combat math and loot generation.
* **Database:** PostgreSQL or MongoDB to track lineages, items, and global "Corpse" locations.

### Implementation Phases
1.  **Phase 1:** Core Monorepo Setup & Shared TypeScript Interfaces.
2.  **Phase 2:** Server-side "Snapshot" Combat Engine & Database Schema.
3.  **Phase 3:** React "Whimsical" UI, Action Feed, and Banter Hook.
4.  **Phase 4:** Guild Gate & "Rest for the Fallen" Socket Integration.