class BanterGenerator {
    static getBanter(attacker, isCrit, isMiss) {
        if (isMiss) {
            return Math.random() > 0.5 ? "A clumsy swing!" : "Curses! The darkness betrays me.";
        }
        if (isCrit) {
            const critQuotes = [
                "FOR THE LINEAGE!",
                "FEEL THE WEIGHT OF ETRIO!",
                "THE DEEP DEMANDS YOUR SOUL!",
                "SHATTER UNDER MY STRENGTH!",
                "BY SALUWAN'S WILL!"
            ];
            return critQuotes[Math.floor(Math.random() * critQuotes.length)] || "";
        }
        const classQuotes = {
            Thrall: ["I bleed for my masters!", "Pity is for the weak.", "Death is my only reprieve."],
            Bondi: ["Etrio stands with me!", "I'll carve your name into the rock.", "Taste Bondi steel!"],
            Vardr: ["The Vanguard never breaks!", "Maintain the line!", "Your bones will pave our path."],
            Scrifadr: ["Knowledge is power, but blood is swifter.", "I've read your death in the stars.", "Sacrifice is mandatory."],
            Drengskapr: ["My honor exceeds your meager life.", "A worthy duel... almost.", "Victory is preordained."]
        };
        const tribeQuotes = {
            Vinrforad: ["The wind carries your ending.", "Swift as the northern gale!"],
            Logi: ["Burn in the eternal flame!", "Ash to ash, bone to fire."],
            Fridrbjorn: ["The bear's claws are sharp tonight.", "Strength is the only truth."],
            Iftiqad: ["Submit to the faith!", "Your heresy ends here."],
            Grima: ["The shadows claim you.", "Silence is my weapon."],
            Jotunheimr: ["I am a mountain, you are dust.", "Crush beneath the ancient weight."],
            'The Frozen': ["Ice in my veins, death in my hand.", "Freeze in the eternal night."],
            'The Drowned': ["The abyss swallows all.", "Drown in the dark tide."],
            'The Beasts': ["*Incoherent Primal Roar*", "Nature's wrath is absolute."]
        };
        const sClass = attacker.socialClass;
        if (sClass && classQuotes[sClass]) {
            const quotes = classQuotes[sClass];
            if (quotes && Math.random() > 0.7)
                return quotes[Math.floor(Math.random() * quotes.length)] || "";
        }
        const sTribe = attacker.tribe;
        if (sTribe && tribeQuotes[sTribe]) {
            const quotes = tribeQuotes[sTribe];
            if (quotes && Math.random() > 0.7)
                return quotes[Math.floor(Math.random() * quotes.length)] || "";
        }
        return "";
    }
    static getEmoji(isCrit, isMiss, isEnemy) {
        if (isMiss)
            return "💨";
        if (isCrit)
            return "🔥";
        return isEnemy ? "💀" : "⚔️";
    }
}
export class CombatEngine {
    static simulate(party, enemies) {
        const events = [];
        let turnCount = 1;
        console.log(`[SIM] Starting simulation: ${party.length} party vs ${enemies.length} enemies`);
        const simulatedParty = party.map(p => ({ ...p, stats: { ...p.stats } }));
        const simulatedEnemies = enemies.map(e => ({ ...e, stats: { ...e.stats } }));
        console.log(`[SIM] Party HPs: ${simulatedParty.map(p => p.hp).join(', ')}`);
        console.log(`[SIM] Enemy HPs: ${simulatedEnemies.map(e => e.hp).join(', ')}`);
        const allCombatants = [...simulatedParty, ...simulatedEnemies].sort((a, b) => b.stats.agility - a.stats.agility);
        while (simulatedParty.some(p => p.hp > 0) && simulatedEnemies.some(e => e.hp > 0) && turnCount < 200) {
            for (const attacker of allCombatants) {
                if (attacker.hp <= 0)
                    continue;
                const targets = attacker.isEnemy ? simulatedParty.filter(p => p.hp > 0) : simulatedEnemies.filter(e => e.hp > 0);
                if (targets.length === 0)
                    break;
                const defender = targets[Math.floor(Math.random() * targets.length)];
                const isMissValue = Math.random() > (0.8 + (attacker.stats.agility - defender.stats.agility) * 0.01);
                let damage = 0;
                let isCrit = false;
                if (!isMissValue) {
                    const baseDamage = attacker.stats.strength * 2;
                    const defense = defender.stats.vitality * 0.5;
                    damage = Math.max(1, baseDamage - defense);
                    isCrit = Math.random() < (attacker.stats.luck * 0.01);
                    if (isCrit)
                        damage *= 2;
                    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
                    defender.hp = Math.max(0, defender.hp - damage);
                }
                events.push({
                    id: `ev-${Date.now()}-${turnCount}-${events.length}-${Math.random().toString(36).substring(2, 7)}`,
                    turn: turnCount,
                    attackerName: attacker.name,
                    defenderName: defender.name,
                    damage,
                    isCrit,
                    isMiss: isMissValue,
                    remainingHp: defender.hp,
                    banter: BanterGenerator.getBanter(attacker, isCrit, isMissValue),
                    emojiTag: BanterGenerator.getEmoji(isCrit, isMissValue, attacker.isEnemy)
                });
                if (simulatedParty.every(p => p.hp <= 0) || simulatedEnemies.every(e => e.hp <= 0))
                    break;
            }
            turnCount++;
        }
        return {
            victory: simulatedEnemies.every(e => e.hp <= 0),
            events,
            survivingMembers: simulatedParty.filter(p => p.hp > 0),
            turns: turnCount
        };
    }
}
//# sourceMappingURL=combat.js.map