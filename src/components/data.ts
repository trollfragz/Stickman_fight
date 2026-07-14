/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HatConfig, WeaponTemplate, MapConfig, PlayerConfig } from "./types";

export const HATS: HatConfig[] = [
  { id: "ironman", name: "Iron Man Helmet", color: "#e53e3e", accentColor: "#ecc94b", type: "marvel", drawType: "mask" },
  { id: "spiderman", name: "Spider-Man Mask", color: "#e53e3e", accentColor: "#3182ce", type: "marvel", drawType: "mask" },
  { id: "captainamerica", name: "Cap's Helmet", color: "#3182ce", accentColor: "#ffffff", type: "marvel", drawType: "cap" },
  { id: "thor", name: "Thor's Helmet", color: "#718096", accentColor: "#ecc94b", type: "marvel", drawType: "horns" },
  { id: "hulk", name: "Hulk Hair", color: "#2f855a", accentColor: "#1a202c", type: "marvel", drawType: "hair" },
  { id: "deadpool", name: "Deadpool Mask", color: "#9b2c2c", accentColor: "#1a202c", type: "marvel", drawType: "mask" },
  { id: "wolverine", name: "Wolverine Mask", color: "#ecc94b", accentColor: "#1a202c", type: "marvel", drawType: "horns" },
  { id: "batman", name: "Batman Cowl", color: "#1a202c", accentColor: "#ecc94b", type: "classic", drawType: "horns" },
  { id: "joker", name: "Joker Hair", color: "#48bb78", accentColor: "#ffffff", type: "classic", drawType: "hair" },
  { id: "goku", name: "Saiyan Hair (Goku)", color: "#ed8936", accentColor: "#1a202c", type: "anime", drawType: "hair" },
  { id: "naruto", name: "Naruto Hair", color: "#ecc94b", accentColor: "#ed8936", type: "anime", drawType: "hair" },
  { id: "luffy", name: "Straw Hat (Luffy)", color: "#ecc94b", accentColor: "#e53e3e", type: "anime", drawType: "cap" },
  { id: "saitama", name: "Saitama Shiny", color: "#ffffff", accentColor: "#ecc94b", type: "anime", drawType: "plate" },
  { id: "sasuke", name: "Sasuke Hair & Band", color: "#2d3748", accentColor: "#3182ce", type: "anime", drawType: "hair" },
  { id: "zoro", name: "Zoro Bandana", color: "#2f855a", accentColor: "#ffffff", type: "anime", drawType: "cap" },
  { id: "tanjiro", name: "Tanjiro Hair", color: "#4a5568", accentColor: "#9b2c2c", type: "anime", drawType: "hair" },
  { id: "nezuko", name: "Nezuko Bow", color: "#ed64a6", accentColor: "#1a202c", type: "anime", drawType: "horns" },
  { id: "eren", name: "Eren Shingeki Hair", color: "#744210", accentColor: "#ffffff", type: "anime", drawType: "hair" },
  { id: "levi", name: "Levi undercut", color: "#1a202c", accentColor: "#ffffff", type: "anime", drawType: "hair" },
  { id: "ichigo", name: "Ichigo Orange Hair", color: "#ed8936", accentColor: "#ffffff", type: "anime", drawType: "hair" },
  { id: "pikachu", name: "Pikachu Ears", color: "#ecc94b", accentColor: "#1a202c", type: "gaming", drawType: "ears" },
  { id: "mario", name: "Mario Cap", color: "#e53e3e", accentColor: "#ffffff", type: "gaming", drawType: "cap" },
  { id: "link", name: "Link Hat", color: "#38a169", accentColor: "#ecc94b", type: "gaming", drawType: "cap" },
  { id: "shrek", name: "Shrek Ears", color: "#48bb78", accentColor: "#744210", type: "classic", drawType: "ears" }
];

export const WEAPONS: WeaponTemplate[] = [
  // MELEE WEAPONS
  {
    id: "lightsaber",
    name: "Plasma Saber",
    class: "melee",
    damage: 35,
    cooldown: 250,
    ammoMax: -1,
    range: 65,
    knockback: 12,
    recoil: -4, // moves player forward slightly!
    weight: 0.9,
    color: "#38bdf8",
    description: "Slices fast and deforces incoming bullets."
  },
  {
    id: "katana",
    name: "Demon Katana",
    class: "melee",
    damage: 28,
    cooldown: 180,
    ammoMax: -1,
    range: 55,
    knockback: 8,
    recoil: -5,
    weight: 0.95,
    color: "#f43f5e",
    description: "Swift katana. Propels you forward on hit."
  },
  {
    id: "hammer",
    name: "Mjolnir Hammer",
    class: "melee",
    damage: 55,
    cooldown: 750,
    ammoMax: -1,
    range: 75,
    knockback: 25,
    recoil: -8,
    weight: 1.4,
    color: "#a1a1aa",
    description: "Extremely heavy. Massive knockback and lightning shocks on ground strike!"
  },
  {
    id: "boxing",
    name: "Boxing Gloves",
    class: "melee",
    damage: 15,
    cooldown: 100,
    ammoMax: -1,
    range: 40,
    knockback: 6,
    recoil: -3,
    weight: 0.8,
    color: "#ef4444",
    description: "Rapid punches. High stun duration!"
  },
  {
    id: "bat",
    name: "Spiked Baseball Bat",
    class: "melee",
    damage: 32,
    cooldown: 400,
    ammoMax: -1,
    range: 60,
    knockback: 18,
    recoil: -2,
    weight: 1.1,
    color: "#b45309",
    description: "Great for hitting players out of the arena."
  },
  {
    id: "spear",
    name: "Valkyrie Spear",
    class: "melee",
    damage: 26,
    cooldown: 350,
    ammoMax: -1,
    range: 90,
    knockback: 10,
    recoil: -2,
    weight: 1.15,
    color: "#fbbf24",
    description: "Longest reach melee weapon. Pierces enemies."
  },
  {
    id: "scythe",
    name: "Reaper Scythe",
    class: "melee",
    damage: 42,
    cooldown: 550,
    ammoMax: -1,
    range: 80,
    knockback: 16,
    recoil: -1,
    weight: 1.3,
    color: "#8b5cf6",
    description: "Lifesteals 25% of damage dealt in a wide sweep."
  },
  {
    id: "shield",
    name: "Energy Aegis",
    class: "melee",
    damage: 12,
    cooldown: 400,
    ammoMax: -1,
    range: 45,
    knockback: 15,
    recoil: 0,
    weight: 1.2,
    color: "#22c55e",
    description: "Blocks 80% incoming damage from front and bashes enemies away."
  },

  // FIREARMS / PROJECTILES
  {
    id: "pistol",
    name: "Laser Pistol",
    class: "firearm",
    damage: 12,
    cooldown: 200,
    ammoMax: 12,
    range: 400,
    knockback: 4,
    recoil: 1.5,
    weight: 1.0,
    color: "#10b981",
    description: "Reliable semi-auto hand blaster."
  },
  {
    id: "shotgun",
    name: "Enforcer Shotgun",
    class: "firearm",
    damage: 10, // per pellet (x6)
    cooldown: 600,
    ammoMax: 6,
    range: 250,
    knockback: 14,
    recoil: 12,
    weight: 1.15,
    color: "#64748b",
    description: "Fires 6 high-spread pellets. Huge recoil blowback!"
  },
  {
    id: "double_shotgun",
    name: "Doomsday Shotgun",
    class: "firearm",
    damage: 11, // per pellet (x10)
    cooldown: 900,
    ammoMax: 2,
    range: 200,
    knockback: 20,
    recoil: 22,
    weight: 1.25,
    color: "#dc2626",
    description: "Two barrels of pure chaos. Incredible knockback!"
  },
  {
    id: "rifle",
    name: "Plasma Rifle",
    class: "firearm",
    damage: 16,
    cooldown: 120,
    ammoMax: 25,
    range: 450,
    knockback: 6,
    recoil: 2.5,
    weight: 1.1,
    color: "#3b82f6",
    description: "Fully automatic tactical plasma rifle."
  },
  {
    id: "sniper",
    name: "Antimatter Sniper",
    class: "firearm",
    damage: 75,
    cooldown: 1200,
    ammoMax: 5,
    range: 800,
    knockback: 32,
    recoil: 25,
    weight: 1.35,
    color: "#e11d48",
    description: "Lasersight assist. High bullet velocity, devastating impact and recoil."
  },
  {
    id: "rocket",
    name: "RPG-7 Rocket Launcher",
    class: "firearm",
    damage: 60,
    cooldown: 1100,
    ammoMax: 3,
    range: 600,
    knockback: 25,
    recoil: 18,
    weight: 1.4,
    color: "#b45309",
    description: "Fires explosive rockets. Demolishes crates and players."
  },
  {
    id: "grenade",
    name: "Bouncing Grenade Launcher",
    class: "firearm",
    damage: 45,
    cooldown: 700,
    ammoMax: 6,
    range: 400,
    knockback: 18,
    recoil: 6,
    weight: 1.2,
    color: "#15803d",
    description: "Launches bouncing grenades that detonate after 2.5 seconds."
  },
  {
    id: "laser",
    name: "Fusion Ray Gun",
    class: "firearm",
    damage: 22,
    cooldown: 150,
    ammoMax: 15,
    range: 500,
    knockback: 5,
    recoil: 2,
    weight: 1.1,
    color: "#a855f7",
    description: "Shoots high-piercing fusion laser rays."
  },
  {
    id: "minigun",
    name: "Vulcan Minigun",
    class: "firearm",
    damage: 8,
    cooldown: 50,
    ammoMax: 100,
    range: 500,
    knockback: 2,
    recoil: 1.2,
    weight: 1.6,
    color: "#475569",
    description: "Insane fire rate. Massive recoil pushes you backward continuously."
  },
  {
    id: "flamethrower",
    name: "Napalm Flame Spitter",
    class: "firearm",
    damage: 4, // Tick damage
    cooldown: 30,
    ammoMax: 80,
    range: 180,
    knockback: 0.5,
    recoil: 0.2,
    weight: 1.3,
    color: "#ea580c",
    description: "Sets opponents on fire, dealing damage over time."
  },
  {
    id: "freezeray",
    name: "Cryo Freeze Ray",
    class: "firearm",
    damage: 2,
    cooldown: 60,
    ammoMax: 50,
    range: 220,
    knockback: 1,
    recoil: 0.5,
    weight: 1.2,
    color: "#06b6d4",
    description: "Slows enemies down and eventually freezes them solid!"
  },
  {
    id: "crossbow",
    name: "Tactical Crossbow",
    class: "firearm",
    damage: 32,
    cooldown: 400,
    ammoMax: 10,
    range: 550,
    knockback: 12,
    recoil: 1.5,
    weight: 1.05,
    color: "#ca8a04",
    description: "Fires fast, stealthy bolts affected by gravity."
  },
  {
    id: "portalgun",
    name: "Aperture Portal Gun",
    class: "special",
    damage: 5,
    cooldown: 300,
    ammoMax: 10,
    range: 600,
    knockback: 1,
    recoil: 2,
    weight: 1.0,
    color: "#0284c7",
    description: "Shoots Blue and Orange portals. Walk through one to emerge from the other!"
  },
  {
    id: "gravitygun",
    name: "Zero-G Phys Gun",
    class: "special",
    damage: 10,
    cooldown: 400,
    ammoMax: 15,
    range: 250,
    knockback: 20,
    recoil: 4,
    weight: 1.1,
    color: "#ec4899",
    description: "Pulls nearby throwable crates or items and hurls them at enemies!"
  },
  {
    id: "plasma",
    name: "Plasma Surge SMG",
    class: "firearm",
    damage: 14,
    cooldown: 110,
    ammoMax: 30,
    range: 400,
    knockback: 5,
    recoil: 1.8,
    weight: 0.95,
    color: "#f43f5e",
    description: "Fires rapid bouncing electric plasma orbs."
  },
  {
    id: "railgun",
    name: "Hyper-Rail Sniper",
    class: "firearm",
    damage: 65,
    cooldown: 1400,
    ammoMax: 4,
    range: 1000,
    knockback: 30,
    recoil: 22,
    weight: 1.45,
    color: "#3b82f6",
    description: "Fires a high-voltage slug instantly piercing walls and multiple players."
  },
  {
    id: "bubble",
    name: "Helix Bubble Blower",
    class: "special",
    damage: 5,
    cooldown: 250,
    ammoMax: 15,
    range: 300,
    knockback: -8, // Pulls them up
    recoil: 1,
    weight: 0.9,
    color: "#06b6d4",
    description: "Shoots bubbles that trap players, lifting them into the air helplessly!"
  },
  {
    id: "blackhole",
    name: "Dark Nebula Launcher",
    class: "special",
    damage: 15,
    cooldown: 1500,
    ammoMax: 2,
    range: 400,
    knockback: 1,
    recoil: 10,
    weight: 1.5,
    color: "#6b21a8",
    description: "Launches a slow miniature singularity that pulls in all nearby players!"
  },
  {
    id: "shuriken",
    name: "Shuriken Star Launcher",
    class: "firearm",
    damage: 18,
    cooldown: 150,
    ammoMax: 20,
    range: 450,
    knockback: 4,
    recoil: 1.0,
    weight: 0.9,
    color: "#14b8a6",
    description: "Launches ninja shurikens that bounce multiple times off platforms."
  },
  {
    id: "bounce",
    name: "Ricochet Shotgun",
    class: "firearm",
    damage: 8, // x5 pellets
    cooldown: 650,
    ammoMax: 8,
    range: 300,
    knockback: 10,
    recoil: 10,
    weight: 1.1,
    color: "#eab308",
    description: "Shotgun shells filled with bouncy rubber pellets."
  },
  {
    id: "firework",
    name: "Dragon Firework Rocket",
    class: "firearm",
    damage: 40,
    cooldown: 900,
    ammoMax: 4,
    range: 500,
    knockback: 16,
    recoil: 12,
    weight: 1.25,
    color: "#f97316",
    description: "Shoots festive firework rockets that spiral and explode in a multi-colored flash."
  },
  {
    id: "blaster",
    name: "Quantum Alien Blaster",
    class: "firearm",
    damage: 30,
    cooldown: 350,
    ammoMax: 12,
    range: 450,
    knockback: 15,
    recoil: 5,
    weight: 1.0,
    color: "#22c55e",
    description: "Alien disintegrator. Bullets vaporize crate barriers."
  },
  {
    id: "taser",
    name: "Tesla Arc Shock Taser",
    class: "special",
    damage: 8,
    cooldown: 500,
    ammoMax: 8,
    range: 250,
    knockback: 2,
    recoil: 1,
    weight: 1.0,
    color: "#eab308",
    description: "Stuns targets in an electrical shock, disabling their controls for 1 second."
  },
  {
    id: "tesla",
    name: "Storm Tesla Ray",
    class: "special",
    damage: 15,
    cooldown: 300,
    ammoMax: 12,
    range: 350,
    knockback: 4,
    recoil: 2,
    weight: 1.15,
    color: "#6366f1",
    description: "Fires chain lightning that automatically arcs to all nearby players."
  },
  {
    id: "rpg",
    name: "Homing Cluster RPG",
    class: "special",
    damage: 70,
    cooldown: 1800,
    ammoMax: 2,
    range: 700,
    knockback: 35,
    recoil: 25,
    weight: 1.5,
    color: "#a855f7",
    description: "Fires a homing missile that splits into cluster bombs on contact!"
  }
];

export const MAPS: MapConfig[] = [
  {
    id: "classic",
    name: "Sky Temple Arena",
    description: "A solid platform suspended high in the clouds with small hovering step-stones.",
    theme: "sky",
    spawnPoints: [
      { x: 150, y: 350 },
      { x: 350, y: 350 },
      { x: 550, y: 350 },
      { x: 750, y: 350 },
      { x: 950, y: 350 },
      { x: 1150, y: 350 }
    ],
    platforms: [
      // Main ground floor
      { x: 150, y: 480, width: 1000, height: 40 },
      // Elevated stepping stones
      { x: 250, y: 340, width: 200, height: 20 },
      { x: 850, y: 340, width: 200, height: 20 },
      // High center platform (one-way pass through)
      { x: 500, y: 220, width: 300, height: 20, isOneWay: true }
    ],
    spikes: []
  },
  {
    id: "lavapit",
    name: "Infernal Lava Pit",
    description: "Rising and falling lava below floating rock pillars. Falling in is incinerating!",
    theme: "lava",
    spawnPoints: [
      { x: 200, y: 250 },
      { x: 400, y: 200 },
      { x: 600, y: 150 },
      { x: 800, y: 200 },
      { x: 1000, y: 250 },
      { x: 600, y: 300 }
    ],
    platforms: [
      { x: 100, y: 400, width: 180, height: 30 },
      { x: 350, y: 350, width: 160, height: 30 },
      { x: 580, y: 450, width: 140, height: 30 }, // low center island, risky!
      { x: 790, y: 350, width: 160, height: 30 },
      { x: 1020, y: 400, width: 180, height: 30 },
      // High safe points
      { x: 250, y: 200, width: 150, height: 15, isOneWay: true },
      { x: 900, y: 200, width: 150, height: 15, isOneWay: true }
    ],
    spikes: [],
    lavaLevel: 550 // Base lava level
  },
  {
    id: "spikes",
    name: "Catacombs of Spikes",
    description: "Spike hazards lining the pit floors and side ceilings. Best for launching enemies!",
    theme: "toxic",
    spawnPoints: [
      { x: 200, y: 200 },
      { x: 500, y: 200 },
      { x: 800, y: 200 },
      { x: 1100, y: 200 },
      { x: 350, y: 320 },
      { x: 950, y: 320 }
    ],
    platforms: [
      // Left high
      { x: 80, y: 260, width: 250, height: 30 },
      // Right high
      { x: 970, y: 260, width: 250, height: 30 },
      // Center hanging platforms
      { x: 420, y: 360, width: 460, height: 30 },
      { x: 550, y: 200, width: 200, height: 20, isOneWay: true }
    ],
    spikes: [
      // Pit floor spikes (between platforms)
      { x: 0, y: 550, width: 1300, height: 30 },
      // Side wall hazards
      { x: 0, y: 100, width: 30, height: 250 },
      { x: 1270, y: 100, width: 30, height: 250 }
    ]
  },
  {
    id: "gravity",
    name: "Zero-G Quantum Lab",
    description: "Low-gravity sci-fi lab with bouncy walls, forcefields, and teleporters.",
    theme: "cyber",
    spawnPoints: [
      { x: 200, y: 150 },
      { x: 450, y: 150 },
      { x: 650, y: 150 },
      { x: 850, y: 150 },
      { x: 1100, y: 150 },
      { x: 650, y: 300 }
    ],
    lowGravity: true,
    platforms: [
      { x: 200, y: 480, width: 900, height: 30 }, // lower deck
      { x: 100, y: 300, width: 180, height: 20, isBouncy: true }, // bouncy landing left
      { x: 1020, y: 300, width: 180, height: 20, isBouncy: true }, // bouncy landing right
      { x: 450, y: 200, width: 400, height: 20, isOneWay: true }
    ],
    spikes: [],
    portals: [
      { id: "p1", x1: 150, y1: 440, x2: 1150, y2: 440, color: "#38bdf8" },
      { id: "p2", x1: 500, y1: 150, x2: 800, y2: 150, color: "#f43f5e" }
    ]
  },
  {
    id: "floating",
    name: "Howling Windy Isles",
    description: "Tiny islands suspended over a vast deep void with crosswinds pushing players.",
    theme: "neon",
    spawnPoints: [
      { x: 250, y: 200 },
      { x: 450, y: 200 },
      { x: 650, y: 200 },
      { x: 850, y: 200 },
      { x: 1050, y: 200 },
      { x: 650, y: 350 }
    ],
    windForce: 0.18, // Pushes players to the right
    platforms: [
      { x: 150, y: 450, width: 160, height: 30 },
      { x: 420, y: 400, width: 160, height: 30 },
      { x: 720, y: 400, width: 160, height: 30 },
      { x: 990, y: 450, width: 160, height: 30 },
      // High floating cloud step
      { x: 570, y: 250, width: 160, height: 20, isOneWay: true }
    ],
    spikes: []
  },
  {
    id: "portal",
    name: "Nexus Portal Complex",
    description: "Quantum loops of active teleporters scattered across modular steel bridges.",
    theme: "cyber",
    spawnPoints: [
      { x: 200, y: 150 },
      { x: 1100, y: 150 },
      { x: 400, y: 350 },
      { x: 900, y: 350 },
      { x: 650, y: 100 },
      { x: 650, y: 450 }
    ],
    platforms: [
      { x: 100, y: 250, width: 300, height: 25 },
      { x: 900, y: 250, width: 300, height: 25 },
      { x: 450, y: 380, width: 400, height: 25 },
      { x: 150, y: 500, width: 1000, height: 30 }
    ],
    portals: [
      { id: "nexus1", x1: 200, y1: 210, x2: 650, y2: 340, color: "#f59e0b" },
      { id: "nexus2", x1: 1100, y1: 210, x2: 650, y2: 460, color: "#10b981" }
    ],
    spikes: []
  },
  {
    id: "ruins",
    name: "Crumbly Sunken Ruins",
    description: "Fragile brick platforms that collapse when stood on or hit by heavy weapon fire!",
    theme: "ruins",
    spawnPoints: [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 },
      { x: 800, y: 300 },
      { x: 1000, y: 300 },
      { x: 600, y: 150 }
    ],
    platforms: [
      { x: 100, y: 480, width: 250, height: 40 }, // Solid side
      { x: 950, y: 480, width: 250, height: 40 }, // Solid side
      
      // Crumbly platforms in the middle!
      { x: 380, y: 440, width: 160, height: 30, isDestructible: true, health: 100, maxHealth: 100 },
      { x: 570, y: 440, width: 160, height: 30, isDestructible: true, health: 100, maxHealth: 100 },
      { x: 760, y: 440, width: 160, height: 30, isDestructible: true, health: 100, maxHealth: 100 },
      
      { x: 250, y: 300, width: 180, height: 20, isDestructible: true, health: 80, maxHealth: 80, isOneWay: true },
      { x: 870, y: 300, width: 180, height: 20, isDestructible: true, health: 80, maxHealth: 80, isOneWay: true },
      { x: 500, y: 200, width: 300, height: 20, isDestructible: true, health: 120, maxHealth: 120, isOneWay: true }
    ],
    spikes: []
  },
  {
    id: "factory",
    name: "Steam Piston Factory",
    description: "Conveyor belts that slide you sideways and giant slamming vertical steam pistons!",
    theme: "industrial",
    spawnPoints: [
      { x: 250, y: 150 },
      { x: 500, y: 150 },
      { x: 800, y: 150 },
      { x: 1050, y: 150 },
      { x: 350, y: 350 },
      { x: 950, y: 350 }
    ],
    platforms: [
      // Conveyor belts
      { x: 100, y: 480, width: 350, height: 30, isConveyor: -2.5 }, // Slides left
      { x: 850, y: 480, width: 350, height: 30, isConveyor: 2.5 },  // Slides right
      { x: 480, y: 420, width: 340, height: 30 }, // Neutral center
      
      // Upper platforms
      { x: 200, y: 300, width: 220, height: 20, isOneWay: true },
      { x: 880, y: 300, width: 220, height: 20, isOneWay: true }
    ],
    spikes: [
      { x: 450, y: 550, width: 400, height: 30 } // Toxic waste pool spike floor
    ]
  }
];

export const DEFAULT_PLAYERS: PlayerConfig[] = [
  {
    id: 1,
    name: "Player 1",
    type: "human",
    color: "#3b82f6", // Blue
    colors: {
      head: "#3b82f6", chest: "#3b82f6",
      armLeft1: "#3b82f6", armLeft2: "#1d4ed8",
      armRight1: "#3b82f6", armRight2: "#1d4ed8",
      legLeft1: "#3b82f6", legLeft2: "#1d4ed8",
      legRight1: "#3b82f6", legRight2: "#1d4ed8",
      outline: "#1e3a8a", outlineWidth: 1.5
    },
    hat: "spiderman",
    controls: { left: "a", right: "d", jump: "w", down: "s", attack: "f", throw: "g" }
  },
  {
    id: 2,
    name: "Player 2",
    type: "human",
    color: "#ef4444", // Red
    colors: {
      head: "#ef4444", chest: "#ef4444",
      armLeft1: "#ef4444", armLeft2: "#b91c1c",
      armRight1: "#ef4444", armRight2: "#b91c1c",
      legLeft1: "#ef4444", legLeft2: "#b91c1c",
      legRight1: "#ef4444", legRight2: "#b91c1c",
      outline: "#7f1d1d", outlineWidth: 1.5
    },
    hat: "ironman",
    controls: { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp", down: "ArrowDown", attack: "1", throw: "2" } // Numpad 1 and 2, or standard 1/2
  },
  {
    id: 3,
    name: "CPU 1",
    type: "normal_cpu",
    color: "#10b981", // Green
    colors: {
      head: "#10b981", chest: "#10b981",
      armLeft1: "#10b981", armLeft2: "#047857",
      armRight1: "#10b981", armRight2: "#047857",
      legLeft1: "#10b981", legLeft2: "#047857",
      legRight1: "#10b981", legRight2: "#047857",
      outline: "#064e3b", outlineWidth: 1.5
    },
    hat: "luffy",
    controls: { left: "i", right: "l", jump: "k", down: "j", attack: "u", throw: "o" }
  },
  {
    id: 4,
    name: "CPU 2",
    type: "normal_cpu",
    color: "#f59e0b", // Yellow / Orange
    colors: {
      head: "#f59e0b", chest: "#f59e0b",
      armLeft1: "#f59e0b", armLeft2: "#b45309",
      armRight1: "#f59e0b", armRight2: "#b45309",
      legLeft1: "#f59e0b", legLeft2: "#b45309",
      legRight1: "#f59e0b", legRight2: "#b45309",
      outline: "#78350f", outlineWidth: 1.5
    },
    hat: "goku",
    controls: { left: "f", right: "h", jump: "t", down: "g", attack: "r", throw: "y" }
  },
  {
    id: 5,
    name: "None",
    type: "none",
    color: "#ec4899", // Pink
    colors: {
      head: "#ec4899", chest: "#ec4899",
      armLeft1: "#ec4899", armLeft2: "#be185d",
      armRight1: "#ec4899", armRight2: "#be185d",
      legLeft1: "#ec4899", legLeft2: "#be185d",
      legRight1: "#ec4899", legRight2: "#be185d",
      outline: "#500724", outlineWidth: 1.5
    },
    hat: "pikachu",
    controls: { left: "4", right: "6", jump: "8", down: "5", attack: "7", throw: "9" } // Numkeys
  },
  {
    id: 6,
    name: "None",
    type: "none",
    color: "#8b5cf6", // Purple
    colors: {
      head: "#8b5cf6", chest: "#8b5cf6",
      armLeft1: "#8b5cf6", armLeft2: "#6d28d9",
      armRight1: "#8b5cf6", armRight2: "#6d28d9",
      legLeft1: "#8b5cf6", legLeft2: "#6d28d9",
      legRight1: "#8b5cf6", legRight2: "#6d28d9",
      outline: "#4c1d95", outlineWidth: 1.5
    },
    hat: "batman",
    controls: { left: "v", right: "n", jump: "b", down: "h", attack: "c", throw: "m" }
  }
];

export const PRESET_COLORS = [
  { name: "Neon Blue", main: "#3b82f6", alt: "#1d4ed8", outline: "#1e3a8a" },
  { name: "Crimson", main: "#ef4444", alt: "#b91c1c", outline: "#7f1d1d" },
  { name: "Emerald", main: "#10b981", alt: "#047857", outline: "#064e3b" },
  { name: "Gold", main: "#fbbf24", alt: "#b45309", outline: "#78350f" },
  { name: "Hot Pink", main: "#ec4899", alt: "#be185d", outline: "#500724" },
  { name: "Vibrant Purple", main: "#8b5cf6", alt: "#6d28d9", outline: "#4c1d95" },
  { name: "Cyan Ice", main: "#06b6d4", alt: "#0891b2", outline: "#155e75" },
  { name: "Orange Flare", main: "#f97316", alt: "#ea580c", outline: "#7c2d12" },
  { name: "Shadow Black", main: "#1f2937", alt: "#111827", outline: "#030712" },
  { name: "Snow White", main: "#f3f4f6", alt: "#d1d5db", outline: "#374151" }
];
