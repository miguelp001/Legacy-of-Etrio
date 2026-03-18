# Legacy of Etrio 🌑

**Legacy of Etrio** is a premium Dark Fantasy IdleMMO built with a focus on deep procedural generation, multi-generational progression, and collective metagame mechanics. 

Descend into **The Pit**, forge your lineage, and contribute to **The Gate** as you build your guild's legacy in a world that never sleeps.

---

## 🏗️ Technical Architecture

The project is structured as a TypeScript monorepo-style workspace:

- **`/client`**: React 19 + Vite frontend. Features a "Glassmorphic" dark-fantasy UI with Tailwind CSS and Lucide icons.
- **`/server`**: Node.js + Express backend. Handles procedural generation APIs, item factory logic, and offline gain calculations.
- **`/shared`**: Shared TypeScript library containing the core math, engines, and interfaces used by both frontend and backend.
- **State Management**: Powered by **Zustand** for a reactive, high-performance global game state.

---

## ⚔️ Core Gameplay Mechanics

### 1. The Hub (Respite)
Your main base of operations.
- **Tavern**: Recruit procedurally generated NPCs with unique traits and classes.
- **Blacksmith**: Manage inventory, forge random items, and configure **Auto-Sell** thresholds.
- **Hospital**: Monitor party health and manage recovery for **Injured** members returning from raids.
- **Guild Hall**: Contribute Gold to upgrade town infrastructure and provide global perks.

### 2. The Pit (Dungeon Loop)
A passive descent engine where your party fights automatically.
- **Biome Shifts**: Every 10 floors, the environment changes (Frozen -> Crystalline -> Fungal) with unique modifiers.
- **Boss Encounters**: Face powerful Guardians every 10 floors to prove your strength.
- **Offline Gains**: Accumulate gold, items, and floor progression even when the game is closed.

### 3. Lineage & Prestige
The heart of the game's long-term loop.
- **Affinity**: Party members gain affinity by surviving floors together.
- **Succession Ritual**: Once Relationship stage reaches "Soulmate," members can produce an **Heir**.
- **Legacy Bonus**: Each subsequent generation receives a cumulative **+10% stat growth bonus**, allowing you to eventually challenge the deepest volcanic depths.

### 4. The Gate
A collective progression milestone system.
- Certain floors are blocked by massive physical and magical barriers.
- Players must "Sacrifice Gold" to The Gate to shatter it and unlock deeper dungeon levels for the entire world.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- npm

### Installation

1. **Install Root/Shared Dependencies**:
   ```bash
   cd shared
   npm install
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd ../server
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

### Running the Game

1. **Start the Backend**:
   ```bash
   cd server
   npm run dev
   ```
   *Server runs on port 3001*

2. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   *Frontend runs on port 5173*

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React, Zustand.
- **Backend**: Node.js, Express, tsx (ESM execution).
- **Tooling**: TypeScript, Vite, PostCSS.
- **Math**: Custom `StatCalculator` with multi-generational stacking multipliers.

---

## 📜 Credits & License
Developed as part of the **Advanced Agentic Coding** initiative at Google DeepMind.
Concept and Mechanics for "Legacy of Etrio" © 2026.
