import json
import random
import os

traits = ['Stoic', 'Cheerful', 'Hot-Headed', 'Analytical']
ranks = ['Thrall', 'Bondi', 'Vardr', 'Scrifadr', 'Drengskapr']
biomes = ['Sunless Sea', 'Molten Core', 'Crystalline Caverns', 'The Frozen Wastes', 'The Drowned City']
hit_qualities = ['CRIT', 'NORMAL', 'MISS']

templates = []

# --- Fragments for Attack ---
attack_stems = [
    "The ${speaker} lunges forward,",
    "With a sharp intake of breath, the ${speaker}",
    "Raising their weapon high, the ${speaker}",
    "The ${speaker} moves with terrifying speed,",
    "In a blur of steel and shadow, the ${speaker}",
    "The ${speaker} delivers a calculated strike,",
    "With a desperate howl, the ${speaker}",
    "The ${speaker} focuses their intent,",
    "Channeling the weight of their lineage, the ${speaker}",
    "The ${speaker} executes a precise maneuver,",
    "With a flick of the wrist, the ${speaker}",
    "The ${speaker} drives their weight forward,",
    "Spinning their weapon in a deadly arc, the ${speaker}",
    "The ${speaker} waits for a gap in the guard,",
    "Like a predator closing in, the ${speaker}",
    "The ${speaker} swings wildly in the dark,",
    "With a frantic, overextended chop, the ${speaker}",
    "The ${speaker} lashes out in a raw display of power,",
    "Sensing the end, the ${speaker} goes for the throat,",
    "The ${speaker} dances on the edge of destruction,",
    "With a scream that echoes through the abyss, the ${speaker}",
    "The ${speaker} barely maintains their grip as they",
    "Fueled by aetheric corruption, the ${speaker}",
    "The ${speaker} strikes with a precision that defies nature,",
    "With a weary but determined motion, the ${speaker}"
]

attack_hit_flourishes = [
    "dealing **${value} damage** to the **${target}**.",
    "finding a weak point and dealing **${value} damage** to the **${target}**.",
    "their weapon trailing aether as they strike the **${target}** for **${value} damage**.",
    "the impact echoing through the deep as they hit the **${target}** for **${value} damage**.",
    "a spray of blood marking where they strike the **${target}** for **${value} damage**.",
    "their eyes glowing with malice as they deal **${value} damage** to the **${target}**.",
    "the air shimmering around them as they hit for **${value} damage**.",
    "with a finality that chills the soul as they strike the **${target}** for **${value} damage**.",
    "their movement leaving an afterimage as they deal **${value} damage** to the **${target}**.",
    "the darkness itself seeming to aid as they strike for **${value} damage**.",
    "unfazed by the resistance as they deal **${value} damage**.",
    "the scent of ozone filling the air as they hit the **${target}** for **${value} damage**.",
    "their weapon biting deep as they deal **${value} damage** to the **${target}**.",
    "the ground cracking beneath them as they hit the **${target}** for **${value} damage**.",
    "nearly losing their balance as they strike for **${value} damage**.",
    "sending a shower of sparks as they hit the **${target}**'s armor for **${value} damage**.",
    "the force of the blow threatening to shatter their weapon, dealing **${value} damage**.",
    "laughing like a madman as they deal **${value} damage** to the **${target}**.",
    "their eyes fixed on the empty space where the sun should be as they strike for **${value} damage**.",
    "with a strength born of pure desperation, hitting the **${target}** for **${value} damage**.",
    "the aetheric ink on their skin burning as they deal **${value} damage** to the **${target}**.",
    "carving a story of ruin into the floor as they strike the **${target}** for **${value} damage**."
]

attack_miss_flourishes = [
    "but the **${target}** simply weaves out of the way.",
    "cutting only empty air as the **${target}** evades.",
    "the strike passing harmlessly over the **${target}**.",
    "a clumsy swing that finds no purchase on the **${target}**.",
    "momentum carrying the strike wide of the **${target}**.",
    "but the **${target}** is already gone, swallowed by the shadows.",
    "the weapon sparks uselessly against the stone behind the **${target}**."
]

# --- Fragments for Defense ---
defend_stems = [
    "The ${speaker} catches the blow,",
    "With a grunt of effort, the ${speaker}",
    "The ${speaker} twists out of the way,",
    "Predicting the strike, the ${speaker}",
    "The ${speaker} raises their guard,",
    "With a mask of absolute focus, the ${speaker}",
    "The ${speaker} absorbs the kinetic energy,",
    "Flickering like a dying candle, the ${speaker}",
    "The ${speaker} shrugs off the impact,",
    "With a calculated parry, the ${speaker}"
]

defend_flourishes = [
    "turning the lethal strike into a mere graze.",
    "the strike glancing harmlessly off their skin.",
    "their armor groaning but holding firm.",
    "a defiant laugh escaping their lips.",
    "as if the blow were nothing but a passing breeze.",
    "their movement too swift for the eye to follow.",
    "redirecting the momentum back into the shadows.",
    "the sound of steel on steel ringing through the halls.",
    "their resolve hardening with every impact.",
    "as they prepare their own counter-strike."
]

# --- Fragments for Banter ---
banter_stems = [
    "The ${speaker} stares into the darkness.",
    "Looking at their bloodied hands, the ${speaker} whispers,",
    "The ${speaker} kicks a pile of bones.",
    "Watching the aether pulse in the walls, the ${speaker} muses,",
    "The ${speaker} tightens their grip on their weapon.",
    "the ${speaker} looks toward the surface that is no longer there.",
    "Adjusting their gear, the ${speaker} says,",
    "the ${speaker} listens to the heartbeat of the deep.",
    "Checking their dwinlding supplies, the ${speaker} grunts,",
    "The ${speaker} traces an ancient rune on a pillar."
]

banter_quotes = [
    "'The darkness isn't empty. It's just waiting.'",
    "'How many floors before we forget the sun?'",
    "'The Alien is watching. I can feel the pressure on my spine.'",
    "'Dust to dust. Aether to aether.'",
    "'If we fail, who will tell the Lineage?'",
    "'The silence down here... it's louder than any scream.'",
    "'Every step is a gamble with eternity.'",
    "'I can feel the crystals growing in my marrow.'",
    "'The deep has no mercy. Only tests.'",
    "'The salt in the air... it tastes like tears of the past.'",
    "'I saw a face in the smoke. It looked like mine.'",
    "'Don't look too long at the crystals. They start looking back.'",
    "'The silence is eating my thoughts.'",
    "'I can hear the heartbeat of the world. It's slowing down.'",
    "'We are just fuel for the Deep's cold fire.'",
    "'Is it possible the surface was just a dream?'",
    "'The ceiling... it's getting lower every day.'",
    "'I am becoming part of the architecture.'",
    "'Blood for the machine. Aether for the void.'",
    "'There is no path forward, only deeper into the lie.'"
]

# --- Generate Templates ---

# 1. Combat Attack (Tagged, 5000)
for i in range(5000):
    stem = random.choice(attack_stems)
    trait = random.choice(traits)
    rank = random.choice(ranks)
    biome = random.choice(biomes)
    quality = random.choice(hit_qualities)
    flourish = random.choice(attack_miss_flourishes) if quality == 'MISS' else random.choice(attack_hit_flourishes)
    
    templates.append({
        "id": "gen_attack_{:04d}".format(i),
        "text": stem + " " + flourish,
        "tags": {
            "eventType": "COMBAT_ATTACK",
            "traits": [trait],
            "ranks": [rank],
            "biomes": [biome],
            "hitQuality": quality
        }
    })

# 2. Combat Attack (Wildcard, 2000)
for i in range(2000):
    stem = random.choice(attack_stems)
    quality = random.choice(hit_qualities)
    flourish = random.choice(attack_miss_flourishes) if quality == 'MISS' else random.choice(attack_hit_flourishes)
    templates.append({
        "id": "gen_attack_wc_{:04d}".format(i),
        "text": stem + " " + flourish,
        "tags": {
            "eventType": "COMBAT_ATTACK",
            "hitQuality": quality
        }
    })

# 3. Combat Defend (Tagged, 1000)
for i in range(1000):
    stem = random.choice(defend_stems)
    flourish = random.choice(defend_flourishes)
    trait = random.choice(traits)
    rank = random.choice(ranks)
    
    templates.append({
        "id": "gen_defend_{:04d}".format(i),
        "text": stem + " " + flourish,
        "tags": {
            "eventType": "COMBAT_DEFEND",
            "traits": [trait],
            "ranks": [rank]
        }
    })

# 4. Combat Defend (Wildcard, 500)
for i in range(500):
    stem = random.choice(defend_stems)
    flourish = random.choice(defend_flourishes)
    templates.append({
        "id": "gen_defend_wc_{:04d}".format(i),
        "text": stem + " " + flourish,
        "tags": {
            "eventType": "COMBAT_DEFEND"
        }
    })

# 5. Banter Idle (Tagged, 1000)
for i in range(1000):
    stem = random.choice(banter_stems)
    quote = random.choice(banter_quotes)
    trait = random.choice(traits)
    rank = random.choice(ranks)
    biome = random.choice(biomes)
    
    templates.append({
        "id": "gen_banter_{:04d}".format(i),
        "text": stem + " " + quote,
        "tags": {
            "eventType": "BANTER_IDLE",
            "traits": [trait],
            "ranks": [rank],
            "biomes": [biome]
        }
    })

# 6. Banter Idle (Wildcard, 500)
for i in range(500):
    stem = random.choice(banter_stems)
    quote = random.choice(banter_quotes)
    templates.append({
        "id": "gen_banter_wc_{:04d}".format(i),
        "text": stem + " " + quote,
        "tags": {
            "eventType": "BANTER_IDLE"
        }
    })

# 7. World Event (50)
for i in range(50):
    biome = random.choice(biomes)
    templates.append({
        "id": "gen_world_{:04d}".format(i),
        "text": "The party encounters a strange phenomenon in the " + biome + ". The ${speaker} is the first to notice.",
        "tags": {
            "eventType": "WORLD_EVENT",
            "biomes": [biome]
        }
    })

# Force absolute path for library
lib_path = r'c:\Users\migue\Documents\Code\Legacy of Etrio\shared\src\descriptionLibrary.json'
try:
    with open(lib_path, 'r') as f:
        existing = json.load(f)
except Exception as e:
    print(f"Error loading existing: {e}")
    existing = []

# Filter out old generated ones to avoid duplicates if ID pattern changes, or just append
existing = [t for t in existing if not t.get("id", "").startswith("gen_")]
all_templates = existing + templates

# Output to workspace
output_path = r'c:\Users\migue\Documents\Code\Legacy of Etrio\shared\src\descriptionLibrary.json'
with open(output_path, 'w') as f:
    json.dump(all_templates, f, indent=4)

print(f"Generated {len(templates)} templates. Total library level: {len(all_templates)}")
