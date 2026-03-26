import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ItemGenerator, type Item } from '../../../shared/src/items.js';
import type { Combatant, CombatEvent } from '../../../shared/src/combat.js';
import type { Relationship } from '../../../shared/src/party.js';
import { NPCGenerator } from '../../../shared/src/party.js';
import type { GateMilestone } from '../../../shared/src/gate.js';
import { GateManager } from '../../../shared/src/gate.js';

const API_BASE = import.meta.env.VITE_API_URL || '';
console.log('API_BASE configured as:', API_BASE || '(relative paths)');

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
  councilMembers: Combatant[];
  isGameWon: boolean;
  playerId: string | null;
  location: string;
  
  // Auth
  isAuthenticated: boolean;
  user: { id: string, username: string } | null;
  token: string | null;

  // Actions
  login: (username: string, password: string) => Promise<boolean | string>;
  register: (username: string, password: string) => Promise<boolean | string>;
  logout: () => void;
  setLocation: (loc: string) => void;
  saveProgress: () => Promise<void>;
  loadProgress: (id: string) => Promise<void>;
  processCombatTick: () => Promise<any>;
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
  healAllCharacters: (cost: number) => void;
  restParty: () => Promise<void>;
  setEvents: (events: CombatEvent[]) => void;
  addEvents: (events: CombatEvent[]) => void;
  setLastLogout: (time: number) => void;
  addPiety: (targetId: string, amount: number) => void;
  infuseItem: (inventoryIndex: number, cost: number) => void;
  bindItemToSoul: (itemId: string, cost: number) => void;
  removeItems: (itemIds: string[]) => void;
  ascendCharacter: (memberId: string) => void;
  confrontHeart: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
      councilMembers: [],
      isGameWon: false,
      playerId: null, // Set during login/register
      isAuthenticated: false,
      user: null,
      token: null,
      location: 'Respite',

      setLocation: (loc: string) => set({ location: loc }),

      addGold: (amount: number) => set((state) => ({ gold: state.gold + amount })),
      
      addToInventory: (item: Item) => set((state) => ({ inventory: [...state.inventory, item] })),

      removeFromInventory: (itemId: string) => set((state) => ({
        inventory: state.inventory.filter(i => i.id !== itemId)
      })),

      addToParty: (member: Combatant) => {
        set((state) => {
          if (state.party.length >= 4) return state;
          return { party: [...state.party, member] };
        });
        get().saveProgress();
      },

      removeFromParty: (memberId: string) => {
        set((state) => ({
          party: state.party.filter(m => m.id !== memberId)
        }));
        get().saveProgress();
      },

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

      processCombatTick: async (keepDelving: boolean = false) => {
          const state = useGameStore.getState();
          if (!state.playerId) {
            console.error('Combat tick aborted: Missing playerId');
            return;
          }

          try {
            console.log(`[TICK] Contacting engine at: ${API_BASE}/api/game/tick, keepDelving: ${keepDelving}`);
            const response = await fetch(`${API_BASE}/api/game/tick`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: state.playerId, keepDelving })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Combat tick failed (${response.status}):`, errorText);
                try {
                  const errorJson = JSON.parse(errorText);
                  throw new Error(errorJson.error || 'Server error during combat tick');
                } catch {
                  throw new Error(`Server Error ${response.status}: ${errorText.substring(0, 50)}`);
                }
            }

            const data = await response.json();
            if (!data || !data.state) {
                console.error('Invalid response structure from server:', data);
                throw new Error('Server returned invalid combat data structure');
            }

            const { state: updatedState, defeated, roomResults } = data;
            console.log('[TICK] Received state with inventory:', updatedState.inventory?.length, 'items, roomResults:', roomResults?.length);
            
            if (updatedState) {
              // Sync with server state but preserve local-only auth fields and UI location
              set({ 
                ...updatedState,
                playerId: state.playerId,
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                token: state.token,
                location: state.location // PRESERVE UI LOCATION
              });
              console.log('[TICK] State synced. New inventory count:', updatedState.inventory?.length);
            }
            
            const victory = !defeated;
            const logEntry = victory 
                ? `Cleared Floor ${updatedState.currentFloor - 1}! Gained rewards.`
                : `Defeated at Floor ${updatedState.currentFloor}...`;
                
            set((s) => ({
                events: [{
                    id: `sys-tick-${Date.now()}`,
                    turn: 0,
                    attackerName: 'SYSTEM',
                    defenderName: 'THE PIT',
                    damage: 0,
                    isCrit: false,
                    isMiss: false,
                    remainingHp: 0,
                    banter: logEntry,
                    emojiTag: victory ? '⚔️' : '🛡️'
                }, ...s.events]
            }));

            return data;
          } catch (error: any) {
            console.error('Failed to process combat tick:', error);
            throw error; // Rethrow to let the UI component catch it
          }
      },

      setFloor: (floor: number) => set({ currentFloor: floor }),
      
      setBiome: (biome: string) => set({ biome }),

      toggleAutoSell: () => set((state) => ({ isAutoSellEnabled: !state.isAutoSellEnabled })),

      setAutoSellThreshold: (threshold: string) => set({ autoSellRarityThreshold: threshold }),

      createMainCharacter: (name, baseClass, personality) => {
        set((_state) => {
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
        });
        get().saveProgress();
      },

      equipItem: (targetId, item, slot) => {
        set((state) => {
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
        });
        get().saveProgress();
      },

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
      
      healAllCharacters: async (cost) => {
        const state = useGameStore.getState();
        if (!state.playerId) return;

        try {
          const response = await fetch(`${API_BASE}/api/game/heal-all`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ playerId: state.playerId, cost })
          });

          if (!response.ok) {
              const error = await response.json();
              console.error('Heal all failed:', error.error);
              return;
          }

          const updatedState = await response.json();
          set(updatedState);
        } catch (error) {
          console.error('Failed to heal all:', error);
        }
      },
      
      restParty: async () => {
        const healAmount = 0.1; // 10%
        
        // Apply healing locally
        set((state) => {
          let hasUpdates = false;
          
          // Create new state object
          const newState = { ...state };
          
          // Heal main character
          if (state.mainCharacter && state.mainCharacter.hp > 0) {
            const maxHp = state.mainCharacter.maxHp || 100;
            if (state.mainCharacter.hp < maxHp) {
              const heal = Math.floor(maxHp * healAmount);
              const newHp = Math.min(maxHp, state.mainCharacter.hp + heal);
              console.log(`[REST] Healing MC: ${state.mainCharacter.hp} -> ${newHp}`);
              newState.mainCharacter = {
                ...state.mainCharacter,
                hp: newHp
              };
              hasUpdates = true;
            }
          }
          
          // Heal party members
          const newParty = state.party.map((m: any) => {
            if (m.hp > 0 && m.hp < (m.maxHp || 100)) {
              const maxHp = m.maxHp || 100;
              const heal = Math.floor(maxHp * healAmount);
              const newHp = Math.min(maxHp, m.hp + heal);
              console.log(`[REST] Healing ${m.name}: ${m.hp} -> ${newHp}`);
              hasUpdates = true;
              return { ...m, hp: newHp };
            }
            return m;
          });
          
          if (hasUpdates) {
            newState.party = newParty;
          }
          
          return newState;
        });

        // Sync to server and use server's response
        const { playerId } = useGameStore.getState();
        if (playerId) {
          try {
            const response = await fetch(`${API_BASE}/api/game/rest`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ playerId })
            });
            if (response.ok) {
              const { state: serverState } = await response.json();
              set((s) => ({
                ...serverState,
                playerId: s.playerId,
                isAuthenticated: s.isAuthenticated,
                user: s.user,
                token: s.token,
                location: s.location
              }));
            }
          } catch (err) {
            console.error('Rest sync failed:', err);
          }
        }
      },
      
      setEvents: (events) => set({ events }),
      addEvents: (newEvents) => set((state) => ({ events: [...state.events, ...newEvents].slice(-200) })), // Keep last 200
      setLastLogout: (time) => set({ lastLogout: time }),
      addPiety: (targetId, amount) => set((state) => {
        if (targetId === 'player-mc' && state.mainCharacter) {
          return { mainCharacter: { ...state.mainCharacter, piety: Math.min(100, (state.mainCharacter.piety || 0) + amount) } };
        }
        return {
          party: state.party.map(m => m.id === targetId ? { ...m, piety: Math.min(100, (m.piety || 0) + amount) } : m)
        };
      }),
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

          const event: CombatEvent = {
            id: `infuse-${Date.now()}`,
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
          
          const event: CombatEvent = {
            id: `ascend-${Date.now()}`,
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
      confrontHeart: () => set((state) => {
        if (state.currentFloor < 1000 || state.councilMembers.length < 4 || state.isGameWon) return state;

        const event: CombatEvent = {
          id: `heart-${Date.now()}`,
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
        } catch (e: any) {
          console.error('Login error:', e);
          return e.message || 'Login failed';
        }
      },

      register: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          
          if (!response.ok) {
            const rawBody = await response.text();
            console.error('SERVER REGISTRATION ERROR (RAW):', rawBody);
            try {
              const errorData = JSON.parse(rawBody);
              return errorData.error || `Error ${response.status}`;
            } catch {
              return `Server Error (${response.status})`;
            }
          }
          
          const { user, token } = await response.json();
          set({ user, token, isAuthenticated: true, playerId: user.id });
          return true;
        } catch (e: any) {
          console.error('CLIENT REGISTRATION ERROR:', e);
          return e.message || 'Network error';
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
