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
    "Like a predator closing in, the ${speaker}"
]

attack_flourishes = [
    "as they ${verb} the **${target}**.",
    "finding a weak point as they ${verb} the **${target}**.",
    "their weapon trailing aether as they ${verb} the **${target}**.",
    "the impact echoing through the deep as they ${verb} the **${target}**.",
    "a spray of blood marking where they ${verb} the **${target}**.",
    "their eyes glowing with malice as they ${verb} the **${target}**.",
    "the air shimmering around them as they ${verb} the **${target}**.",
    "with a finality that chills the soul as they ${verb} the **${target}**.",
    "their movement leaving an afterimage as they ${verb} the **${target}**.",
    "the darkness itself seeming to aid as they ${verb} the **${target}**.",
    "unfazed by the resistance as they ${verb} the **${target}**.",
    "the scent of ozone filling the air as they ${verb} the **${target}**.",
    "their weapon biting deep as they ${verb} the **${target}**.",
    "the **${target}**'s scream cut short as they ${verb} them.",
    "the ground cracking beneath them as they ${verb} the **${target}**."
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
    "'The salt in the air... it tastes like tears of the past.'"
]

# --- Generate Templates ---

# 1. Combat Attack (600)
for i in range(600):
    stem = random.choice(attack_stems)
    flourish = random.choice(attack_flourishes)
    trait = random.choice(traits)
    rank = random.choice(ranks)
    biome = random.choice(biomes)
    quality = random.choice(hit_qualities)
    
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

# 2. Combat Defend (150)
for i in range(150):
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

# 3. Banter Idle (200)
for i in range(200):
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

# 4. World Event (50)
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

# Load existing
lib_path = 'c:/Users/migue/Documents/Code/Legacy of Etrio/shared/src/descriptionLibrary.json'
try:
    with open(lib_path, 'r') as f:
        existing = json.load(f)
except Exception as e:
    print(f"Error loading existing: {e}")
    existing = []

# Combine and unique (simple ID override)
all_templates = existing + templates

# Output to workspace
output_path = 'c:/Users/migue/Documents/Code/Legacy of Etrio/shared/src/descriptionLibrary_expanded.json'
with open(output_path, 'w') as f:
    json.dump(all_templates, f, indent=4)

print(f"Generated {len(templates)} templates. Total library: {len(all_templates)}")
