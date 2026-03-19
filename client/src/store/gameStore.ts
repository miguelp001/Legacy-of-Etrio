import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ItemGenerator, type Item } from '../../../shared/src/items.js';
import type { Combatant, CombatEvent } from '../../../shared/src/combat.js';
import type { Relationship } from '../../../shared/src/party.js';
import { NPCGenerator } from '../../../shared/src/party.js';
import type { GateMilestone } from '../../../shared/src/gate.js';
import { GateManager } from '../../../shared/src/gate.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
  mainCharacter: Combatant | null;
  mainCharacterPersonality: string | null;
  events: CombatEvent[];
  lastLogout: number;
  bloodRations: number;
  pollutionLevel: number;
  isResonatorActive: boolean;
  councilMembers: Combatant[];
  resonatorMastery: number;
  isGameWon: boolean;
  playerId: string | null;
  
  // Auth
  isAuthenticated: boolean;
  user: { id: string, username: string } | null;
  token: string | null;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  saveProgress: () => Promise<void>;
  loadProgress: (id: string) => Promise<void>;
  syncGuildSettings: () => Promise<void>;
  processCombatTick: () => Promise<any>;
  buyRations: (amount: number, cost: number) => Promise<void>;
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
  createMainCharacter: (name: string, baseClass: any, personality: string) => void;
  equipItem: (targetId: string, item: Item, slot: 'weapon' | 'armor' | 'accessory') => void;
  healCharacter: (targetId: string, cost: number) => void;
  setEvents: (events: CombatEvent[]) => void;
  addEvents: (events: CombatEvent[]) => void;
  setLastLogout: (time: number) => void;
  addBloodRations: (amount: number) => void;
  setBloodRations: (amount: number) => void;
  addPiety: (targetId: string, amount: number) => void;
  addPollution: (amount: number) => void;
  massProduceItems: (level: number, quantity: number, cost: number) => void;
  setResonatorActive: (active: boolean) => void;
  infuseItem: (inventoryIndex: number, cost: number) => void;
  bindItemToSoul: (itemId: string, cost: number) => void;
  removeItems: (itemIds: string[]) => void;
  ascendCharacter: (memberId: string) => void;
  upgradeResonator: () => void;
  confrontHeart: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      gold: 5000,
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
      mainCharacter: null,
      mainCharacterPersonality: null,
      events: [],
      lastLogout: Date.now(),
      bloodRations: 100,
      pollutionLevel: 0,
      isResonatorActive: false,
      councilMembers: [],
      resonatorMastery: 0,
      isGameWon: false,
      playerId: null, // Set during login/register
      isAuthenticated: false,
      user: null,
      token: null,

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

      donateToGate: async (amount: number) => {
          const state = useGameStore.getState();
          if (!state.playerId) return;

          try {
            const response = await fetch(`${API_BASE}/api/game/donate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: state.playerId, amount })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Donation failed:', error.error);
                return;
            }

            const updatedState = await response.json();
            set(updatedState);
            // Local fallback for gateProgress if it's not in the blob
            const nextGate = GateManager.getNextGate(updatedState.currentFloor, updatedState.gateProgress);
            if (nextGate) {
                const updatedGate = GateManager.calculateContribution(amount, nextGate);
                const nextProgress = updatedState.gateProgress.map((g: any) => g.floor === updatedGate.floor ? updatedGate : g);
                set({ gateProgress: nextProgress });
            }
          } catch (error) {
            console.error('Failed to donate to gate:', error);
          }
      },

      upgradeBuilding: async (id: string) => {
          const state = useGameStore.getState();
          if (!state.playerId) return;

          try {
            const response = await fetch(`${API_BASE}/api/game/upgrade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: state.playerId, buildingId: id })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Upgrade failed:', error.error);
                return;
            }

            const updatedState = await response.json();
            set(updatedState);
            console.log(`Building ${id} upgraded on server.`);
          } catch (error) {
            console.error('Failed to upgrade building:', error);
          }
      },

      processCombatTick: async () => {
          const state = useGameStore.getState();
          if (!state.playerId) return;

          try {
            const response = await fetch(`${API_BASE}/api/game/tick`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: state.playerId })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Combat tick failed:', error.error);
                return;
            }

            const { result, state: updatedState } = await response.json();
            
            // Add rewards and update floor
            set(updatedState);
            
            const logEntry = result.victory 
                ? `Cleared Floor ${updatedState.currentFloor - 1}! Gained rewards.`
                : `Battle ongoing on Floor ${updatedState.currentFloor}...`;
                
            set((s) => ({
                events: [{
                    turn: 0,
                    attackerName: 'SYSTEM',
                    defenderName: 'THE PIT',
                    damage: 0,
                    isCrit: false,
                    isMiss: false,
                    remainingHp: 0,
                    banter: logEntry,
                    emojiTag: result.victory ? '⚔️' : '🛡️'
                }, ...s.events]
            }));

            return result;
          } catch (error) {
            console.error('Failed to process combat tick:', error);
          }
      },

      setFloor: (floor: number) => set({ currentFloor: floor }),
      
      setBiome: (biome: string) => set({ biome }),

      toggleAutoSell: () => set((state) => ({ isAutoSellEnabled: !state.isAutoSellEnabled })),

      setAutoSellThreshold: (threshold: string) => set({ autoSellRarityThreshold: threshold }),

      createMainCharacter: (name, baseClass, personality) => set((_state) => {
        const stats = {
            strength: 10, agility: 10, intelligence: 10,
            vitality: 10, spirit: 10, luck: 10
        };

        if (personality === 'Aggressive') stats.strength += 5;
        if (personality === 'Stoic') stats.vitality += 5;
        if (personality === 'Optimistic') stats.spirit += 5;
        if (personality === 'Cynical') stats.agility += 5;

        const mc: Combatant = {
            id: 'player-mc',
            name,
            level: 1,
            baseClass,
            generation: 0,
            stats,
            hp: stats.vitality * 10,
            maxHp: stats.vitality * 10,
            mp: stats.spirit * 8,
            maxMp: stats.spirit * 8,
            isEnemy: false,
            weapon: null,
            armor: null,
            accessory: null
        };

        return { mainCharacter: mc, mainCharacterPersonality: personality };
      }),

      equipItem: (targetId, item, slot) => set((state) => {
        let target: Combatant | null = null;
        let oldItem: Item | null = null;

        if (targetId === 'player-mc') {
            target = state.mainCharacter;
            oldItem = target ? target[slot] : null;
        } else {
            target = state.party.find(m => m.id === targetId) || null;
            oldItem = target ? target[slot] : null;
        }

        if (!target) return state;

        const updatedTarget = { ...target, [slot]: item };
        const nextInventory = state.inventory.filter(i => i.id !== item.id);
        if (oldItem) nextInventory.push(oldItem);

        if (targetId === 'player-mc') {
            return { mainCharacter: updatedTarget, inventory: nextInventory };
        } else {
            return {
                party: state.party.map(m => m.id === targetId ? updatedTarget : m),
                inventory: nextInventory
            };
        }
      }),

      healCharacter: async (targetId, cost) => {
        const state = useGameStore.getState();
        if (!state.playerId) return;

        try {
          const response = await fetch(`${API_BASE}/api/game/heal`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ playerId: state.playerId, targetId, cost })
          });

          if (!response.ok) {
              const error = await response.json();
              console.error('Healing failed:', error.error);
              return;
          }

          const updatedState = await response.json();
          set(updatedState);
        } catch (error) {
          console.error('Failed to heal character:', error);
        }
      },
      
      setEvents: (events) => set({ events }),
      addEvents: (newEvents) => set((state) => ({ events: [...state.events, ...newEvents].slice(-200) })), // Keep last 200
      setLastLogout: (time) => set({ lastLogout: time }),
      addBloodRations: (amount: number) => set((state) => ({ bloodRations: state.bloodRations + amount })),
      setBloodRations: (amount: number) => set({ bloodRations: amount }),
      addPiety: (targetId, amount) => set((state) => {
        if (targetId === 'player-mc' && state.mainCharacter) {
          return { mainCharacter: { ...state.mainCharacter, piety: Math.min(100, (state.mainCharacter.piety || 0) + amount) } };
        }
        return {
          party: state.party.map(m => m.id === targetId ? { ...m, piety: Math.min(100, (m.piety || 0) + amount) } : m)
        };
      }),
      addPollution: (amount) => set((state) => ({ pollutionLevel: Math.min(100, Math.max(0, state.pollutionLevel + amount)) })),
      massProduceItems: (level, quantity, cost) => set((state) => {
        if (state.gold < cost) return state;
        const newItems: Item[] = [];
        for (let i = 0; i < quantity; i++) {
          newItems.push(ItemGenerator.generateItem(level, true));
        }
        return {
          gold: state.gold - cost,
          inventory: [...state.inventory, ...newItems],
          pollutionLevel: Math.min(100, state.pollutionLevel + (quantity * 2))
        };
      }),
      setResonatorActive: (active) => set({ isResonatorActive: active }),
      infuseItem: async (inventoryIndex, cost) => {
        const state = useGameStore.getState();
        if (!state.playerId) return;

        try {
          const response = await fetch(`${API_BASE}/api/game/infuse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId: state.playerId, inventoryIndex, cost })
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('Infusion failed:', error.error);
            return;
          }

          const { result, state: updatedState } = await response.json();
          set(updatedState);

          const event = {
            turn: 0,
            attackerName: 'BLACKSMITH',
            defenderName: updatedState.inventory[inventoryIndex].name,
            damage: 0,
            isCrit: false,
            isMiss: false,
            remainingHp: 0,
            banter: result.success 
              ? `SUCCESS! ${updatedState.inventory[inventoryIndex].name} infused with Aether.` 
              : `FAILURE! ${updatedState.inventory[inventoryIndex].name} corrupted by void.`,
            emojiTag: result.success ? '✨' : '💀'
          };

          set((s) => ({ events: [event, ...s.events] }));
        } catch (error) {
          console.error('Failed to infuse item:', error);
        }
      },
      bindItemToSoul: async (itemId, cost) => {
        const state = useGameStore.getState();
        if (!state.playerId) return;

        try {
          const response = await fetch(`${API_BASE}/api/game/bind`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId: state.playerId, itemId, cost })
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('Binding failed:', error.error);
            return;
          }

          const updatedState = await response.json();
          set(updatedState);
          console.log(`Item ${itemId} bound to soul on server.`);
        } catch (error) {
          console.error('Failed to bind item:', error);
        }
      },
      removeItems: (itemIds) => set((state) => {
        const idSet = new Set(itemIds);
        
        // Remove from inventory
        const nextInventory = state.inventory.filter(i => !idSet.has(i.id));

        // Remove from MC
        let nextMC = state.mainCharacter;
        if (nextMC) {
          if (nextMC.weapon && idSet.has(nextMC.weapon.id)) nextMC = { ...nextMC, weapon: null };
          if (nextMC.armor && idSet.has(nextMC.armor.id)) nextMC = { ...nextMC, armor: null };
          if (nextMC.accessory && idSet.has(nextMC.accessory.id)) nextMC = { ...nextMC, accessory: null };
        }

        // Remove from party
        const nextParty = state.party.map(m => {
          let updated = { ...m };
          if (updated.weapon && idSet.has(updated.weapon.id)) updated.weapon = null;
          if (updated.armor && idSet.has(updated.armor.id)) updated.armor = null;
          if (updated.accessory && idSet.has(updated.accessory.id)) updated.accessory = null;
          return updated;
        });

        return {
          inventory: nextInventory,
          mainCharacter: nextMC,
          party: nextParty
        };
      }),
      ascendCharacter: async (memberId: string) => {
        const state = useGameStore.getState();
        if (!state.playerId) return;

        try {
          const response = await fetch(`${API_BASE}/api/game/ascend`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ playerId: state.playerId, characterId: memberId })
          });

          if (!response.ok) {
              const error = await response.json();
              console.error('Ascension failed:', error.error);
              return;
          }

          const updatedState = await response.json();
          set(updatedState);
          
          const event = {
            turn: 0,
            attackerName: 'THE BLOOD THRONE',
            defenderName: memberId, // Name would be better but we only have ID here for simple log
            damage: 0,
            isCrit: false,
            isMiss: false,
            remainingHp: 0,
            banter: `A hero has ascended to the Blood Throne. Long live the Council.`,
            emojiTag: '👑'
          };

          set((s) => ({ events: [event, ...s.events] }));
        } catch (error) {
          console.error('Failed to ascend character:', error);
        }
      },
      upgradeResonator: () => set((state) => {
        const cost = 10000 * Math.pow(2, state.resonatorMastery);
        if (state.gold < cost || state.resonatorMastery >= 10) return state;

        const event = {
          turn: 0,
          attackerName: 'STEAM FORGE',
          defenderName: 'RESONATOR',
          damage: 0,
          isCrit: false,
          isMiss: false,
          remainingHp: 0,
          banter: `Aetheric Resonator tuned to Level ${state.resonatorMastery + 1}. Frequency stability increased.`,
          emojiTag: '🎚️'
        };

        return {
          gold: state.gold - cost,
          resonatorMastery: state.resonatorMastery + 1,
          events: [event, ...state.events]
        };
      }),
      confrontHeart: () => set((state) => {
        if (state.currentFloor < 1000 || state.councilMembers.length < 4 || state.isGameWon) return state;

        const event = {
          turn: 1000,
          attackerName: 'COMMANDER',
          defenderName: 'THE HEART OF ETRIO',
          damage: 0,
          isCrit: true,
          isMiss: false,
          remainingHp: 0,
          banter: "THE HEART HAS BEEN PIERCED. ETERNAL BLOOD SECURED.",
          emojiTag: '🩸💎'
        };

        return {
          isGameWon: true,
          events: [event, ...state.events]
        };
      }),

      saveProgress: async () => {
        const state = useGameStore.getState();
        if (!state.playerId) return;
        
        try {
          // Sync Guild Settings too
          await fetch(`${API_BASE}/api/guild-settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pollutionLevel: state.pollutionLevel,
              masteryLevel: state.resonatorMastery
            })
          });

          // Save Player State
          await fetch(`${API_BASE}/api/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: state.playerId,
              state: JSON.stringify(state)
            })
          });
          console.log('Progress saved to server.');
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      },

      loadProgress: async (id: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/state/${id}`);
          const data = await response.json();
          if (data && data.state) {
            const savedState = JSON.parse(data.state);
            set({ ...savedState, playerId: id });
            console.log('Progress loaded from server.');
          }
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      },

      syncGuildSettings: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/guild-settings`);
          const settings = await response.json();
          if (settings) {
            set({ 
              pollutionLevel: settings.pollutionLevel, 
              resonatorMastery: settings.masteryLevel 
            });
          }
        } catch (error) {
          console.error('Failed to sync guild settings:', error);
        }
      },

      buyRations: async (amount: number, cost: number) => {
          const state = useGameStore.getState();
          if (!state.playerId) return;

          try {
            const response = await fetch(`${API_BASE}/api/game/buy-rations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: state.playerId, amount, cost })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Market purchase failed:', error.error);
                return;
            }

            const updatedState = await response.json();
            set(updatedState);
            console.log(`Purchased ${amount} rations on server.`);
          } catch (error) {
            console.error('Failed to buy rations:', error);
          }
      },

      login: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          if (!response.ok) return false;
          
          const { user, token } = await response.json();
          set({ user, token, isAuthenticated: true, playerId: user.id });
          const state = useGameStore.getState();
          await state.loadProgress(user.id);
          return true;
        } catch (e) {
          console.error('Login error:', e);
          return false;
        }
      },

      register: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          if (!response.ok) return false;
          
          const { user, token } = await response.json();
          set({ user, token, isAuthenticated: true, playerId: user.id });
          return true;
        } catch (e) {
          console.error('Registration error:', e);
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, playerId: null });
      }
    }),
    {
      name: 'etrio-game-state',
    }
  )
);
