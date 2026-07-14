/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayerType = "human" | "easy_cpu" | "normal_cpu" | "hard_cpu" | "none";

export interface ControlScheme {
  left: string;
  right: string;
  jump: string;
  down: string; // for dropping through platforms or aiming down
  attack: string;
  throw: string;
}

export interface CustomColors {
  head: string;
  chest: string;
  armLeft1: string;
  armLeft2: string;
  armRight1: string;
  armRight2: string;
  legLeft1: string;
  legLeft2: string;
  legRight1: string;
  legRight2: string;
  outline: string;
  outlineWidth: number;
}

export type HatId =
  | "none"
  | "ironman"
  | "spiderman"
  | "captainamerica"
  | "thor"
  | "hulk"
  | "deadpool"
  | "wolverine"
  | "batman"
  | "joker"
  | "goku"
  | "naruto"
  | "luffy"
  | "saitama"
  | "sasuke"
  | "zoro"
  | "tanjiro"
  | "nezuko"
  | "eren"
  | "levi"
  | "ichigo"
  | "pikachu"
  | "mario"
  | "link"
  | "shrek";

export interface HatConfig {
  id: HatId;
  name: string;
  color: string;
  accentColor: string;
  type: "marvel" | "anime" | "classic" | "gaming";
  // Visual drawing function helper properties
  drawType: "mask" | "horns" | "hair" | "cap" | "crown" | "ears" | "plate";
}

export interface PlayerConfig {
  id: number;
  name: string;
  type: PlayerType;
  color: string; // Main color quick-select
  colors: CustomColors;
  hat: HatId;
  controls: ControlScheme;
  startingWeapon?: string;
}

// Weapon Definitions
export type WeaponId =
  | "unarmed"
  | "lightsaber"
  | "katana"
  | "hammer"
  | "boxing"
  | "bat"
  | "spear"
  | "scythe"
  | "shield"
  | M_FIREARM;

type M_FIREARM =
  | "pistol"
  | "shotgun"
  | "double_shotgun"
  | "rifle"
  | "sniper"
  | "rocket"
  | "grenade"
  | "laser"
  | "minigun"
  | "flamethrower"
  | "freezeray"
  | "crossbow"
  | "portalgun"
  | "gravitygun"
  | "plasma"
  | "railgun"
  | "bubble"
  | "blackhole"
  | "shuriken"
  | "bounce"
  | "firework"
  | "blaster"
  | "taser"
  | "tesla"
  | "rpg";

export type WeaponClass = "melee" | "firearm" | "special" | "none";

export interface WeaponTemplate {
  id: WeaponId;
  name: string;
  class: WeaponClass;
  damage: number;
  cooldown: number; // in ms
  ammoMax: number; // -1 for infinite (melee)
  range: number; // melee range or aim distance
  knockback: number;
  recoil: number;
  weight: number; // slows down movement slightly
  color: string;
  description: string;
}

export interface WeaponInstance {
  template: WeaponTemplate;
  ammo: number;
  lastFired: number; // timestamp
}

// Interactive Box/Throwable items
export interface PhysicalItem {
  id: string;
  type: "crate" | "weapon_pickup" | "barrel" | "shrapnel";
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  angle: number;
  vangle: number;
  health: number;
  weaponTemplate?: WeaponTemplate;
  isThrowable: boolean;
  bouncesRemaining?: number;
}

// Map definitions
export type MapId =
  | "classic"
  | "lavapit"
  | "spikes"
  | "gravity"
  | "floating"
  | "portal"
  | "ruins"
  | "factory";

export interface MapPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  isOneWay?: boolean; // can jump through from below
  isBouncy?: boolean;
  isConveyor?: number; // speed, negative for left, positive for right
  isDestructible?: boolean;
  health?: number;
  maxHealth?: number;
}

export interface MapPortal {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface MapConfig {
  id: MapId;
  name: string;
  description: string;
  theme: "dark" | "lava" | "toxic" | "neon" | "sky" | "cyber" | "ruins" | "industrial";
  platforms: MapPlatform[];
  spikes: { x: number; y: number; width: number; height: number }[];
  portals?: MapPortal[];
  spawnPoints: { x: number; y: number }[];
  lowGravity?: boolean;
  lavaLevel?: number; // null or y position of rising/falling lava
  windForce?: number; // horizontal wind force
}

// Particle system
export interface GameParticle {
  id: string;
  type: "blood" | "spark" | "smoke" | "fire" | "ice" | "laser" | "plasma" | "debris" | "bubble" | "lightning" | "shockwave" | "confetti";
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity?: boolean;
  angle?: number;
  vangle?: number;
  targetX?: number; // For lasers/lightning
  targetY?: number;
}

// Active Projectile (bullet, rocket, grenade, laser ray)
export interface Projectile {
  id: string;
  ownerId: number;
  type: "bullet" | "pellet" | "arrow" | "rocket" | "grenade" | "laser_pulse" | "plasma_orb" | "bubble" | "blackhole_orb" | "shuriken" | "firework_rocket" | "spark_shock" | "portal_bullet_blue" | "portal_bullet_orange";
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  knockback: number;
  age: number;
  maxAge: number;
  color: string;
  bounceCount: number;
  gravityEffect?: boolean;
}

// Ragdoll limb/joint for floppiness
export interface RagdollJoint {
  name: string;
  x: number;
  y: number;
  ox: number; // original relative offset
  oy: number;
  vx: number;
  vy: number;
  targetAngle?: number;
  flexibility: number; // multiplier for muscle correction
}

// Active Player State in Game Loop
export interface GamePlayerState {
  config: PlayerConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  spinAngle: number;
  spinVelocity: number;
  width: number;
  height: number;
  isGrounded: boolean;
  aimAngle: number;
  health: number;
  score: number;
  deaths: number;
  isDead: boolean;
  respawnTimer: number; // in frames or ms
  currentWeapon: WeaponInstance | null;
  heldPickup: PhysicalItem | null;
  facingLeft: boolean;
  lastDamageDealerId: number | null;
  freezeTimer: number; // frozen if > 0
  burnTimer: number; // burning if > 0
  stunTimer: number; // stunned if > 0
  invulnerabilityTimer: number; // spawn protection
  dashCooldown: number;
  colorFlashTimer: number; // hit feedback
  
  // Ragdoll points for floppy joints
  limbs: {
    head: RagdollJoint;
    chest: RagdollJoint;
    armLeft1: RagdollJoint;
    armLeft2: RagdollJoint;
    armRight1: RagdollJoint;
    armRight2: RagdollJoint;
    legLeft1: RagdollJoint;
    legLeft2: RagdollJoint;
    legRight1: RagdollJoint;
    legRight2: RagdollJoint;
  };
  
  // AI State
  ai: {
    targetPlayerId: number | null;
    targetWeaponId: string | null;
    actionTimer: number;
    jumpPressTimer: number;
    state: "idle" | "chase_weapon" | "chase_player" | "evade_hazard" | "aim_and_fire";
    patrolDir: number;
  };
}
