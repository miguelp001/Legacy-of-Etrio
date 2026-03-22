# Legacy of Etrio 🌑

**Legacy of Etrio** is a premium Dark Fantasy IdleMMO built with a focus on deep procedural generation, multi-generational progression, and collective metagame mechanics. 

Descend into **The Pit**, forge your lineage, and contribute to **The Gate** as you build your guild's legacy in a world that never sleeps.

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Core Gameplay](#core-gameplay-mechanics)
- [Deployment](#-deployment)
- [Tech Stack](#tech-stack)
- [Credits](#credits--license)

---

## Overview

Legacy of Etrio is a dungeon-crawler roguelike where you command a vanguard of warriors, descending ever deeper into procedurally generated floors. The game features:

- **Procedural Generation**: Every enemy, item, and NPC is procedurally generated with unique stats and traits
- **Multi-generational Progression**: Build your lineage across generations with inherited stat bonuses
- **Idle Mechanics**: Earn gold, XP, and loot even while offline
- **Party Management**: Recruit up to 3 NPC companions to fight alongside your main character
- **Equipment System**: Forge and collect weapons, armor, and accessories with varying rarities
- **Guild System**: Contribute to a global guild hall that benefits all players

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- npm or yarn
- A Cloudflare account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd legacy-of-etrio
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```
   This installs dependencies for the root, shared, server, and client packages.

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL=your-prisma-database-url
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the development servers**

   In one terminal, start the server:
   ```bash
   cd server
   npm run dev
   ```

   In another terminal, start the client:
   ```bash
   cd client
   npm run dev
   ```

   - **Server**: http://localhost:3001
   - **Client**: http://localhost:5173

### Quick Start Guide

1. **Create your character** - Enter the Tavern and create your main character with a name and class
2. **Recruit allies** - Browse the Mercenary Board and recruit NPCs to join your party (up to 3)
3. **Descend into The Pit** - Fight enemies automatically, collect loot and gold
4. **Forge equipment** - Use the Blacksmith to create better gear for your party
5. **Build your lineage** - As party members fight together, they develop relationships that can lead to powerful heirs

---

## Core Gameplay Mechanics

### The Hub (Respite)

Your main base of operations with access to all facilities:

| Location | Description |
|----------|-------------|
| **Tavern** | Recruit procedurally generated NPCs with unique traits and classes |
| **Blacksmith** | Forge random items, manage inventory, configure auto-sell thresholds |
| **Hospital** | Monitor party health, heal injured members (10% HP every 30s passively) |
| **Blood Market** | Trade resources, manage blood rations and pollution |
| **Guild Hall** | Contribute Gold to upgrade town infrastructure |

### The Pit (Dungeon Loop)

The core gameplay loop where your party fights automatically:

- **Automatic Combat**: Your party fights through rooms without manual input
- **Biome Shifts**: Every 10 floors, the environment changes with unique modifiers
- **Boss Encounters**: Face powerful Guardians every 10 floors
- **Offline Gains**: Accumulate gold, items, and floor progression even when offline
- **Solo Bonus**: +50% XP when fighting alone (no wounded NPCs)

**Room Types:**
- Normal Rooms - Standard combat encounters
- Boss Rooms - Every 10 floors, face a Guardian
- Rest Rooms - Recover a small amount of HP
- Loot Rooms - Bonus gold and items

### Equipment System

**Rarity Tiers:**
| Rarity | Forge Cost | Sell Value | Stat Multiplier |
|--------|------------|------------|-----------------|
| Common | 100g | 25g | 1.0x |
| Uncommon | 100g | 50g | 1.2x |
| Rare | 100g | 150g | 1.5x |
| Epic | 100g | 400g | 2.0x |
| Legendary | 100g | 1000g | 3.0x |
| Corrupted | 100g | 300g | 1.8x |
| Abyssal | N/A | 2500g | 4.0x |

**Equipment Slots:**
- Weapon - Increases offensive stats
- Armor - Increases defensive stats  
- Accessory - Provides stat bonuses

### Stats Guide

| Stat | Abbreviation | Effect |
|------|-------------|--------|
| Strength | STR | Increases physical damage |
| Agility | AGI | Improves attack speed and dodge |
| Vitality | VIT | Boosts maximum HP and defense |
| Intelligence | INT | Enhances magical damage |
| Spirit | SPI | Increases healing and MP regen |
| Luck | LCK | Improves loot quality and crit chance |

### Classes

| Class | Primary Stat | Description |
|-------|--------------|-------------|
| Berserker | STR | High physical damage |
| Rogue | AGI | Fast attacks, evasion |
| Paladin | VIT | Tank, high HP |
| Mage | INT | Magical damage |
| Cleric | SPI | Healing support |
| Ranger | AGI/LCK | Balanced fighter |

### Party Management

- **Maximum Party Size**: 4 members (including main character)
- **Wounded Members**: Below 50% HP - cannot descend
- **Social Classes**: Thrall → Bondi → Vardr → Scrifadr → Drengskapr (increasing cost and stats)
- **Vampires**: 30% chance, unique tribal bonuses, cannot receive blessings

### Lineage & Succession

The heart of the game's long-term loop:

1. **Affinity System**: Party members gain affinity by surviving floors together
2. **Relationship Stages**: Stranger → Acquaintance → Companion → Ally → Friend → Close Friend → Soulmate
3. **Succession Ritual**: When two members reach Soulmate, birth an Heir
4. **Legacy Bonus**: +10% stat growth per generation (stacks infinitely)

### The Gate

A collective progression milestone system:
- Certain floors are blocked by massive barriers
- Players must "Sacrifice Gold" to unlock deeper floors for everyone
- Creates a shared community goal

---

## ☁️ Deployment

### Cloudflare Pages & Workers

This project is designed to deploy to Cloudflare's edge network for global low-latency gameplay.

#### Prerequisites

1. **Create a Cloudflare account** at https://dash.cloudflare.com
2. **Set up a Prisma database** on Turso or another supported provider
3. **Install Wrangler CLI**: `npm install -g wrangler`

#### Environment Setup

1. **Get your Turso database URL**:
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Create database
   turso db create etrio-game
   turso db show etrio-game
   ```

2. **Configure server environment** (`server/.dev.vars`):
   ```env
   DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   ```

3. **Configure client environment** (`client/.env`):
   ```env
   VITE_API_URL=https://your-worker.your-username.workers.dev
   ```

#### Deployment Steps

1. **Build the shared package**:
   ```bash
   npm run build:shared
   ```

2. **Deploy the API server**:
   ```bash
   cd server
   wrangler deploy
   ```
   This deploys the API to Cloudflare Workers.

3. **Build and deploy the client**:
   ```bash
   cd client
   wrangler pages deploy dist
   ```

#### Custom Domains

To use a custom domain:

1. In Cloudflare Dashboard, go to Workers & Pages
2. Select your worker
3. Go to Triggers → Custom Domains
4. Add your domain (e.g., `api.yourgame.com`)

#### Database Schema

The server uses Prisma with the following schema:

```prisma
model PlayerState {
  id        String   @id
  state     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run migrations:
```bash
cd server
wrangler prisma migrate deploy
```

### Other Platforms

The server can also run on traditional platforms:

```bash
cd server
npm run build
npm start
```

Set `NODE_ENV=production` and configure your database URL.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Tailwind CSS, Lucide React, Zustand |
| **Backend** | Node.js, Express, Hono (Cloudflare Workers) |
| **Shared** | TypeScript, Combat Engine, Item Generator |
| **Database** | Prisma ORM, Turso (libSQL) |
| **Deployment** | Cloudflare Workers, Cloudflare Pages |
| **State** | Zustand (client), Prisma (server) |

### Project Structure

```
legacy-of-etrio/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── store/        # Zustand state management
│   │   └── App.tsx       # Main app component
│   └── tailwind.config.js
├── server/           # Backend API
│   ├── src/
│   │   ├── index.ts       # API routes
│   │   └── gameService.ts # Core game logic
│   └── wrangler.toml
├── shared/           # Shared code
│   └── src/
│       ├── combat.ts      # Combat engine
│       ├── items.ts       # Item generation
│       └── party.ts       # NPC generation
└── package.json      # Root workspace config
```

---

## 📜 Credits & License

Developed as part of the **Advanced Agentic Coding** initiative at Google DeepMind.

Concept and Mechanics for "Legacy of Etrio" © 2026.

### Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful open source icons
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- [Hono](https://hono.dev/) - Lightweight web framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Turso](https://turso.tech/) - Edge-hosted SQLite

---

## Troubleshooting

### "Cannot connect to server"
- Ensure the server is running (`npm run dev` in server directory)
- Check that `VITE_API_URL` is set correctly in client `.env`

### "Database error"
- Verify `DATABASE_URL` is set correctly
- Run `wrangler prisma migrate deploy` to apply schema

### "Items not generating"
- Check server console for errors
- Verify the `/api/generate-item` endpoint is accessible

### "Offline gains not working"
- Ensure `lastLogout` timestamp is being saved
- Check browser console for snapshot calculation errors

---

*May your lineage endure the depths.*
