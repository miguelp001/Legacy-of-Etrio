import { create } from 'zustand';
import type { Item } from '../../../shared/src/items.js';
import type { Combatant } from '../../../shared/src/combat.js';
import type { Relationship } from '../../../shared/src/party.js';
import { NPCGenerator } from '../../../shared/src/party.js';
import type { GateMilestone } from '../../../shared/src/gate.js';
import { GateManager } from '../../../shared/src/gate.js';

interface GuildUpgrade {
    id: string;
    level: number;
    cost: number;
    perk: string;
}

interface GameState {
  gold: number;
  inventory: Item[];
  party: Combatant[];
  relationships: Relationship[];
  guildUpgrades: GuildUpgrade[];
  gateProgress: GateMilestone[];
  currentFloor: number;
  biome: string;
  isAutoSellEnabled: boolean;
  autoSellRarityThreshold: string;
  
  // Actions
  addGold: (amount: number) => void;
  addToInventory: (item: Item) => void;
  removeFromInventory: (itemId: string) => void;
  addToParty: (member: Combatant) => void;
  removeFromParty: (memberId: string) => void;
  updateAffinity: (member1Id: string, member2Id: string, amount: number) => void;
  donateToGate: (amount: number) => void;
  upgradeBuilding: (buildingId: string) => void;
  setFloor: (floor: number) => void;
  setBiome: (biome: string) => void;
  toggleAutoSell: () => void;
  setAutoSellThreshold: (threshold: string) => void;
}

export const useGameStore = create<GameState>()((set) => ({
  gold: 5000, // Starting gold for testing Phase 5
  inventory: [],
  party: [],
  relationships: [],
  guildUpgrades: [
      { id: 'Tavern', level: 0, cost: 1000, perk: 'Attract +10% higher level NPCs' },
      { id: 'Hospital', level: 0, cost: 1000, perk: 'Reduce recovery time by 10%' },
      { id: 'Blacksmith', level: 0, cost: 2000, perk: 'Lower auto-repair costs by 15%' }
  ],
  gateProgress: GateManager.generateInitialGates(),
  currentFloor: 1,
  biome: 'Frozen Caves',
  isAutoSellEnabled: false,
  autoSellRarityThreshold: 'Common',

  addGold: (amount: number) => set((state) => ({ gold: state.gold + amount })),
  
  addToInventory: (item: Item) => set((state) => ({ inventory: [...state.inventory, item] })),

  removeFromInventory: (itemId: string) => set((state) => ({
    inventory: state.inventory.filter(i => i.id !== itemId)
  })),

  addToParty: (member: Combatant) => set((state) => {
    if (state.party.length >= 4) return state;
    return { party: [...state.party, member] };
  }),

  removeFromParty: (memberId: string) => set((state) => ({
    party: state.party.filter(m => m.id !== memberId)
  })),

  updateAffinity: (m1, m2, amt) => set((state) => ({
    relationships: NPCGenerator.updateAffinity(state.relationships, m1, m2, amt)
  })),

  donateToGate: (amount: number) => set((state) => {
      if (state.gold < amount) return state;
      const nextGate = GateManager.getNextGate(state.currentFloor, state.gateProgress);
      if (!nextGate) return state;
      
      const updatedGate = GateManager.calculateContribution(amount, nextGate);
      const nextProgress = state.gateProgress.map(g => g.floor === updatedGate.floor ? updatedGate : g);
      
      return { 
          gold: state.gold - amount,
          gateProgress: nextProgress
      };
  }),

  upgradeBuilding: (id: string) => set((state) => {
      const upgrade = state.guildUpgrades.find(u => u.id === id);
      if (!upgrade || state.gold < upgrade.cost) return state;
      
      const updatedUpgrades = state.guildUpgrades.map(u => u.id === id ? {
          ...u,
          level: u.level + 1,
          cost: Math.floor(u.cost * 2.5)
      } : u);
      
      return {
          gold: state.gold - upgrade.cost,
          guildUpgrades: updatedUpgrades
      };
  }),

  setFloor: (floor: number) => set({ currentFloor: floor }),
  
  setBiome: (biome: string) => set({ biome }),

  toggleAutoSell: () => set((state) => ({ isAutoSellEnabled: !state.isAutoSellEnabled })),

  setAutoSellThreshold: (threshold: string) => set({ autoSellRarityThreshold: threshold }),
}));
