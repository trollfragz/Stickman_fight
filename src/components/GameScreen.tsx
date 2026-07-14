/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { PlayerConfig, MapConfig, GamePlayerState, Projectile, PhysicalItem, GameParticle, WeaponTemplate } from "../types";
import { WEAPONS, MAPS, HATS } from "../data";
import { Play, RotateCcw, ArrowLeft, Volume2, VolumeX, Swords, Award, HelpCircle } from "lucide-react";

interface GameScreenProps {
  activeConfigs: PlayerConfig[];
  selectedMap: MapConfig;
  targetScore: number;
  onBackToMenu: () => void;
}

export default function GameScreen({ activeConfigs, selectedMap, targetScore, onBackToMenu }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scoreBoard, setScoreBoard] = useState<{ [key: number]: number }>(() => {
    const scores: { [key: number]: number } = {};
    activeConfigs.forEach(p => {
      scores[p.id] = 0;
    });
    return scores;
  });
  
  const [roundWinnerName, setRoundWinnerName] = useState<string | null>(null);
  const [matchWinnerName, setMatchWinnerName] = useState<string | null>(null);
  const [slowMoFactor, setSlowMoFactor] = useState<number>(1.0);
  const [showControlsGuide, setShowControlsGuide] = useState<boolean>(false);

  // References for mutable game loop state (to avoid React re-render lag)
  const keysPressedRef = useRef<Set<string>>(new Set());
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const gamePlayersRef = useRef<GamePlayerState[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const itemsRef = useRef<PhysicalItem[]>([]);
  const particlesRef = useRef<GameParticle[]>([]);
  const screenShakeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const activePortalsRef = useRef<{ [key: string]: { x: number; y: number; color: string } }>({});
  
  // Audio Synthesis for low-weight browser sounds
  const playSynthSound = (type: "shoot" | "laser" | "hit" | "explosion" | "jump" | "pickup" | "shatter" | "lightning" | "frozen") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      
      if (type === "shoot") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "laser") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "hit") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "explosion") {
        // Noise buffer simulation
        const bufferSize = audioCtx.sampleRate * 0.4;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(10, now + 0.4);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        noise.start(now);
        noise.stop(now + 0.4);
      } else if (type === "jump") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "pickup") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(450, now + 0.06);
        osc.frequency.setValueAtTime(600, now + 0.12);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "shatter") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "lightning") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(200, now + 0.05);
        osc.frequency.setValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "frozen") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Helper to initialize custom floppy skeleton ragdoll joints
  const createRagdollLimbs = (x: number, y: number) => {
    const makeJoint = (name: string, ox: number, oy: number, flexibility: number) => ({
      name,
      x: x + ox,
      y: y + oy,
      ox,
      oy,
      vx: 0,
      vy: 0,
      flexibility
    });
    return {
      head: makeJoint("head", 0, -22, 0.4),
      chest: makeJoint("chest", 0, -5, 0.2),
      armLeft1: makeJoint("armLeft1", -10, -8, 0.8),
      armLeft2: makeJoint("armLeft2", -18, -12, 1.2),
      armRight1: makeJoint("armRight1", 10, -8, 0.8),
      armRight2: makeJoint("armRight2", 18, -12, 1.2),
      legLeft1: makeJoint("legLeft1", -6, 12, 0.7),
      legLeft2: makeJoint("legLeft2", -10, 25, 1.1),
      legRight1: makeJoint("legRight1", 6, 12, 0.7),
      legRight2: makeJoint("legRight2", 10, 25, 1.1)
    };
  };

  // Setup/Reset Round
  const initRound = (resetScores: boolean = false) => {
    if (resetScores) {
      const freshScores: { [key: number]: number } = {};
      activeConfigs.forEach(p => {
        freshScores[p.id] = 0;
      });
      setScoreBoard(freshScores);
      setMatchWinnerName(null);
    }
    
    setRoundWinnerName(null);
    setSlowMoFactor(1.0);
    projectilesRef.current = [];
    particlesRef.current = [];
    itemsRef.current = [];
    activePortalsRef.current = {};
    screenShakeRef.current = 0;

    // Place players at map spawn points
    const spawns = selectedMap.spawnPoints;
    gamePlayersRef.current = activeConfigs.map((config, index) => {
      const spawn = spawns[index % spawns.length];
      const template = config.startingWeapon && config.startingWeapon !== "none" 
        ? (WEAPONS.find(w => w.id === config.startingWeapon) || null)
        : null;

      return {
        config,
        x: spawn.x,
        y: spawn.y,
        vx: 0,
        vy: 0,
        spinAngle: 0,
        spinVelocity: 0,
        width: 24,
        height: 52,
        isGrounded: false,
        aimAngle: config.id % 2 === 0 ? Math.PI : 0,
        health: 100,
        score: resetScores ? 0 : scoreBoard[config.id] || 0,
        deaths: 0,
        isDead: false,
        respawnTimer: 0,
        currentWeapon: template ? {
          template,
          ammo: template.ammoMax,
          lastFired: 0
        } : null,
        heldPickup: null,
        facingLeft: config.id % 2 === 0,
        lastDamageDealerId: null,
        freezeTimer: 0,
        burnTimer: 0,
        stunTimer: 0,
        invulnerabilityTimer: 90, // 1.5 seconds spawn protection
        dashCooldown: 0,
        colorFlashTimer: 0,
        limbs: createRagdollLimbs(spawn.x, spawn.y),
        ai: {
          targetPlayerId: null,
          targetWeaponId: null,
          actionTimer: 0,
          jumpPressTimer: 0,
          state: "idle",
          patrolDir: Math.random() > 0.5 ? 1 : -1
        }
      };
    });

    // Spawn 3 initial weapon crates or physical items
    for (let i = 0; i < 4; i++) {
      spawnWeaponCrate();
    }
  };

  // Periodic weapon spawns
  const spawnWeaponCrate = () => {
    const rx = 100 + Math.random() * (1100);
    const ry = -50 - Math.random() * 150;
    const randomWep = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
    
    itemsRef.current.push({
      id: Math.random().toString(),
      type: "crate",
      x: rx,
      y: ry,
      vx: 0,
      vy: 2,
      width: 24,
      height: 24,
      angle: Math.random() * Math.PI,
      vangle: (Math.random() - 0.5) * 0.1,
      health: randomWep.class === "melee" ? 45 : 30,
      weaponTemplate: randomWep,
      isThrowable: true
    });
  };

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll keys for gaming keybinds
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", " "].includes(e.key)) {
        e.preventDefault();
      }
      keysPressedRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.key.toLowerCase());
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 1280,
        y: ((e.clientY - rect.top) / rect.height) * 600
      };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);

    // Initialize round
    initRound(true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [activeConfigs, selectedMap]);

  // Main game physics logic & graphics loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      if (!isPlaying) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      updatePhysics();
      renderGame();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, selectedMap, targetScore, soundEnabled]);

  // --- PHYSICS ENGINE AND BEHAVIORS ---
  const updatePhysics = () => {
    frameCountRef.current++;
    const dt = slowMoFactor; // Slow down gameplay on final round-ending kills!

    // Periodically spawn new weapon crates
    if (frameCountRef.current % Math.floor(400 / dt) === 0 && itemsRef.current.filter(it => it.type === "crate").length < 5) {
      spawnWeaponCrate();
    }

    // Resolve screen shake decay
    if (screenShakeRef.current > 0) {
      screenShakeRef.current -= 0.5 * dt;
    }

    // Dynamic lava pool in Lava Pit map
    let currentLavaY = selectedMap.lavaLevel;
    if (currentLavaY !== undefined) {
      // Lava breathes up and down slowly over time
      selectedMap.lavaLevel = 520 + Math.sin(frameCountRef.current * 0.01) * 30;
      currentLavaY = selectedMap.lavaLevel;
    }

    // 1. UPDATE PLAYERS
    gamePlayersRef.current.forEach(p => {
      if (p.isDead) {
        p.respawnTimer -= dt;
        if (p.respawnTimer <= 0) {
          respawnPlayer(p);
        }
        updateDeadRagdoll(p, dt);
        return;
      }

      // Decrement states/timers
      if (p.invulnerabilityTimer > 0) p.invulnerabilityTimer -= dt;
      if (p.freezeTimer > 0) p.freezeTimer -= dt;
      if (p.burnTimer > 0) {
        p.burnTimer -= dt;
        if (frameCountRef.current % 12 === 0) {
          dealDamage(p, 2, p.lastDamageDealerId);
          spawnParticles(p.x, p.y - 15, "fire", "#f97316", 3, 2);
        }
      }
      if (p.stunTimer > 0) p.stunTimer -= dt;
      if (p.colorFlashTimer > 0) p.colorFlashTimer -= dt;
      if (p.dashCooldown > 0) p.dashCooldown -= dt;

      // Handle custom environmental forces (Low gravity / Wind)
      const grav = selectedMap.lowGravity ? 0.15 : 0.45;
      if (!p.isGrounded) {
        p.vy += grav * dt;
        if (selectedMap.windForce) {
          p.vx += selectedMap.windForce * dt;
        }
      }

      // Check if player is stuck inside dynamic frozen ice block
      const isFrozen = p.freezeTimer > 0;
      const isStunned = p.stunTimer > 0;

      // Reset horizontal drag
      p.vx *= p.isGrounded ? 0.8 : 0.93;

      // Controls Input
      if (!isFrozen && !isStunned) {
        if (p.config.type === "human") {
          handleHumanControls(p, dt);
        } else {
          handleAIControls(p, dt);
        }
      }

      // Cap horizontal speeds
      const maxSpd = isFrozen ? 0.5 : 8;
      p.vx = Math.max(-maxSpd, Math.min(maxSpd, p.vx));

      // Apply speeds to coordinates
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Screen boundary constraints (horizontal loop wrap or bounce)
      if (p.x < -30) {
        p.x = 1310;
      } else if (p.x > 1310) {
        p.x = -30;
      }

      // Vertical void death check
      if (p.y > 650) {
        killPlayer(p, p.lastDamageDealerId);
      }

      // Collide with platforms
      p.isGrounded = false;
      collideEntityWithMap(p);

      // Floppy skeletal ragdoll animation logic
      updateLivingRagdoll(p, dt);

      // Gun/weapon firing cooling mechanism
      if (p.currentWeapon && p.currentWeapon.lastFired > 0) {
        // Weapon coolings
      }
    });

    // 2. UPDATE PROJECTILES
    for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
      const proj = projectilesRef.current[i];
      proj.age += dt;

      const gravEffect = proj.gravityEffect ? (selectedMap.lowGravity ? 0.05 : 0.15) : 0;
      proj.vy += gravEffect * dt;

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      // Spawn weapon fire particles
      if (proj.type === "rocket" || proj.type === "firework_rocket") {
        spawnParticles(proj.x, proj.y, "smoke", "#94a3b8", 1, 1);
        if (Math.random() < 0.3) {
          spawnParticles(proj.x, proj.y, "fire", "#f97316", 1, 1.5);
        }
      }

      // Check if rocket hits portals
      handlePortalTeleportation(proj);

      // Bullet out of screen boundaries
      const outside = proj.x < -100 || proj.x > 1380 || proj.y < -200 || proj.y > 700;
      const expired = proj.age >= proj.maxAge;

      if (outside || expired) {
        if (proj.type === "grenade" || proj.type === "rocket" || proj.type === "firework_rocket" || proj.type === "blackhole_orb") {
          explodeProjectile(proj);
        }
        projectilesRef.current.splice(i, 1);
        continue;
      }

      // Check bullet map collisions
      let hitMap = false;
      
      // If portal bullet, hit checks
      if (proj.type === "portal_bullet_blue" || proj.type === "portal_bullet_orange") {
        selectedMap.platforms.forEach(plat => {
          if (hitTestRect(proj.x, proj.y, proj.width, proj.height, plat.x, plat.y, plat.width, plat.height)) {
            // Place portal!
            const portalColor = proj.type === "portal_bullet_blue" ? "#38bdf8" : "#f43f5e";
            const portalId = proj.type === "portal_bullet_blue" ? "blue" : "orange";
            
            // Align portal normal against platform
            activePortalsRef.current[portalId] = { x: proj.x, y: plat.y, color: portalColor };
            playSynthSound("laser");
            hitMap = true;
          }
        });
        if (hitMap) {
          projectilesRef.current.splice(i, 1);
          continue;
        }
      }

      selectedMap.platforms.forEach(plat => {
        if (hitMap) return;
        if (hitTestRect(proj.x, proj.y, proj.width, proj.height, plat.x, plat.y, plat.width, plat.height)) {
          if (plat.isOneWay) return; // bullets pass through one-way platforms

          if (proj.bounceCount > 0) {
            // bounce
            proj.vx *= -0.85;
            proj.vy *= -0.85;
            proj.bounceCount--;
            playSynthSound("hit");
          } else {
            hitMap = true;
            if (proj.type === "grenade" || proj.type === "rocket" || proj.type === "firework_rocket" || proj.type === "blackhole_orb") {
              explodeProjectile(proj);
            } else {
              // Standard sparks
              spawnParticles(proj.x, proj.y, "spark", proj.color, 4, 2);
            }
            
            // Apply damage to crumbly/destructible blocks
            if (plat.isDestructible && plat.health !== undefined) {
              plat.health -= proj.damage;
              if (plat.health <= 0) {
                // Break platform!
                playSynthSound("shatter");
                spawnParticles(plat.x + plat.width/2, plat.y + plat.height/2, "debris", "#78716c", 25, 4);
              }
            }
          }
        }
      });

      if (hitMap) {
        projectilesRef.current.splice(i, 1);
        continue;
      }

      // Check collision with other players
      let hitPlayer = false;
      for (let pIdx = 0; pIdx < gamePlayersRef.current.length; pIdx++) {
        const victim = gamePlayersRef.current[pIdx];
        if (victim.isDead || victim.config.id === proj.ownerId || victim.invulnerabilityTimer > 0) continue;

        if (hitTestRect(proj.x, proj.y, proj.width, proj.height, victim.x - victim.width/2, victim.y - victim.height, victim.width, victim.height)) {
          hitPlayer = true;
          
          // Apply bullet-specific modifiers
          if (proj.type === "bubble") {
            victim.freezeTimer = 0;
            victim.stunTimer = 120; // Bubble levitation stun
            victim.vy = -5.5; // Lift up!
            playSynthSound("frozen");
          } else if (proj.type === "plasma_orb") {
            victim.stunTimer = 15;
            dealDamage(victim, proj.damage, proj.ownerId);
          } else if (proj.type === "firework_rocket" || proj.type === "rocket") {
            explodeProjectile(proj);
          } else if (proj.type === "bullet" || proj.type === "pellet" || proj.type === "arrow" || proj.type === "laser_pulse" || proj.type === "shuriken") {
            dealDamage(victim, proj.damage, proj.ownerId);
            // Apply recoil knockback to hit target
            victim.vx += (proj.vx > 0 ? 1 : -1) * proj.knockback * 0.15;
            victim.vy -= proj.knockback * 0.08;
            playSynthSound("hit");
            spawnParticles(proj.x, proj.y, "blood", victim.config.color, 8, 3);
          } else if (proj.type === "spark_shock") {
            // Taser shock
            victim.stunTimer = 60; // 1 second total lock
            victim.vx = 0;
            victim.vy = 0;
            playSynthSound("lightning");
            spawnParticles(victim.x, victim.y - 15, "lightning", "#eab308", 12, 1.5);
            dealDamage(victim, proj.damage, proj.ownerId);
          }

          break;
        }
      }

      if (hitPlayer) {
        projectilesRef.current.splice(i, 1);
      }
    }

    // 3. UPDATE PHYSICAL ITEMS (Weapon Pickups, Crates, Barrels)
    for (let i = itemsRef.current.length - 1; i >= 0; i--) {
      const item = itemsRef.current[i];
      
      const itemGrav = selectedMap.lowGravity ? 0.1 : 0.35;
      item.vy += itemGrav * dt;
      item.vx *= 0.98;

      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.angle += item.vangle * dt;

      // Edge wrapper
      if (item.x < -50) item.x = 1300;
      if (item.x > 1300) item.x = -50;
      if (item.y > 650) {
        itemsRef.current.splice(i, 1);
        continue;
      }

      // Check item's platform collisions
      collideItemWithMap(item);

      // Check if players pick up item
      gamePlayersRef.current.forEach(p => {
        if (p.isDead || p.heldPickup || p.currentWeapon) return;

        // Pickup radius check
        const dist = Math.hypot(p.x - item.x, (p.y - 15) - item.y);
        if (dist < 32 && item.type === "weapon_pickup") {
          // Equip weapon
          p.currentWeapon = {
            template: item.weaponTemplate!,
            ammo: item.weaponTemplate!.ammoMax,
            lastFired: 0
          };
          playSynthSound("pickup");
          // Spawn sparkle
          spawnParticles(item.x, item.y, "spark", item.weaponTemplate!.color, 8, 2);
          itemsRef.current.splice(i, 1);
        }
      });
    }

    // Process crumbly platforms breakdown
    selectedMap.platforms = selectedMap.platforms.filter(plat => {
      if (plat.isDestructible && plat.health !== undefined && plat.health <= 0) {
        return false;
      }
      return true;
    });

    // 4. UPDATE PARTICLES
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const part = particlesRef.current[i];
      part.alpha -= part.decay * dt;
      if (part.alpha <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      if (part.gravity) {
        part.vy += (selectedMap.lowGravity ? 0.06 : 0.2) * dt;
      }
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      if (part.vangle && part.angle !== undefined) {
        part.angle += part.vangle * dt;
      }
    }

    // 5. UPDATE LAVA BURNING AND SPIKES
    gamePlayersRef.current.forEach(p => {
      if (p.isDead) return;

      // Spike checks
      selectedMap.spikes.forEach(sp => {
        if (hitTestRect(p.x - p.width/2, p.y - p.height, p.width, p.height, sp.x, sp.y, sp.width, sp.height)) {
          dealDamage(p, 5, null);
          p.vy = -7.5; // bounce off spikes
          p.vx += (p.x < sp.x + sp.width/2 ? -4 : 4);
          playSynthSound("hit");
          spawnParticles(p.x, p.y - 20, "blood", p.config.color, 12, 4);
        }
      });

      // Lava collision checks
      if (currentLavaY !== undefined && p.y >= currentLavaY - 5) {
        dealDamage(p, 25, null);
        p.vy = -10; // launch up in flames!
        p.burnTimer = 180; // burn for 3 seconds
        playSynthSound("explosion");
        spawnParticles(p.x, p.y - 10, "fire", "#ef4444", 15, 3);
      }
    });

    // Check round ending conditions
    const survivors = gamePlayersRef.current.filter(p => !p.isDead);
    const activeMatchCount = activeConfigs.filter(ac => ac.type !== "none").length;
    
    // In multiplayer or AI bouts, round ends when 1 or 0 players remain!
    if (activeMatchCount > 1 && survivors.length <= 1 && !roundWinnerName) {
      const winner = survivors[0];
      const winName = winner ? winner.config.name : "No one";
      setRoundWinnerName(winName);
      setSlowMoFactor(0.35); // Slow-mo cinematic effect!
      playSynthSound("shatter");
      
      if (winner) {
        const nextScores = { ...scoreBoard };
        nextScores[winner.config.id] = (nextScores[winner.config.id] || 0) + 1;
        setScoreBoard(nextScores);
        
        // Double-check matches target score cap
        if (nextScores[winner.config.id] >= targetScore) {
          setTimeout(() => {
            setMatchWinnerName(winner.config.name);
            setIsPlaying(false);
          }, 1500);
        } else {
          // Setup next round automatic restart
          setTimeout(() => {
            initRound();
          }, 2500);
        }
      } else {
        // Draw, reset round
        setTimeout(() => {
          initRound();
        }, 2500);
      }
    }
  };

  // Human Controls Handler
  const handleHumanControls = (p: GamePlayerState, dt: number) => {
    const keys = keysPressedRef.current;
    const s = p.config.controls;

    // Movement speeds
    const runAcceleration = 0.95;
    
    if (keys.has(s.left.toLowerCase())) {
      p.vx -= runAcceleration;
      p.facingLeft = true;
    }
    if (keys.has(s.right.toLowerCase())) {
      p.vx += runAcceleration;
      p.facingLeft = false;
    }

    // Down key drops through one-way platforms
    if (keys.has(s.down.toLowerCase()) && p.isGrounded) {
      p.y += 6; // pop down
      p.isGrounded = false;
    }

    // Jump
    if (keys.has(s.jump.toLowerCase()) && p.isGrounded) {
      p.vy = selectedMap.lowGravity ? -5.5 : -9.5;
      p.isGrounded = false;
      playSynthSound("jump");
      spawnParticles(p.x, p.y, "smoke", "#e2e8f0", 5, 1.2);
    }

    // Auto aim to nearest opponent
    let nearestOpponent: GamePlayerState | null = null;
    let nearestDist = Infinity;
    gamePlayersRef.current.forEach(other => {
      if (other.isDead || other.config.id === p.config.id) return;
      const d = Math.hypot(other.x - p.x, other.y - p.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearestOpponent = other;
      }
    });

    if (nearestOpponent) {
      const target: GamePlayerState = nearestOpponent;
      p.aimAngle = Math.atan2((target.y - 20) - (p.y - 20), target.x - p.x);
    } else {
      // Idle aiming
      p.aimAngle = p.facingLeft ? Math.PI : 0;
    }

    // Attack
    if (keys.has(s.attack.toLowerCase())) {
      fireActiveWeapon(p);
    }

    // Throw weapon or pickup items
    if (keys.has(s.throw.toLowerCase())) {
      throwCurrentWeapon(p);
      keysPressedRef.current.delete(s.throw.toLowerCase()); // single fire
    }
  };

  // Bot AI Controller
  const handleAIControls = (p: GamePlayerState, dt: number) => {
    p.ai.actionTimer += dt;
    
    // Find nearest player and nearest weapon pickup crate
    let nearestPlayer: GamePlayerState | null = null;
    let minPlayerDist = Infinity;
    gamePlayersRef.current.forEach(other => {
      if (other.isDead || other.config.id === p.config.id) return;
      const d = Math.hypot(other.x - p.x, other.y - p.y);
      if (d < minPlayerDist) {
        minPlayerDist = d;
        nearestPlayer = other;
      }
    });

    let nearestCrate: PhysicalItem | null = null;
    let minCrateDist = Infinity;
    itemsRef.current.forEach(it => {
      if (it.type !== "crate" && it.type !== "weapon_pickup") return;
      const d = Math.hypot(it.x - p.x, it.y - p.y);
      if (d < minCrateDist) {
        minCrateDist = d;
        nearestCrate = it;
      }
    });

    // Determine state
    if (!p.currentWeapon) {
      p.ai.state = nearestCrate ? "chase_weapon" : "chase_player";
    } else {
      p.ai.state = "chase_player";
    }

    // AI state machines
    let targetX = p.x;
    let targetY = p.y;
    let shouldJump = false;

    if (p.ai.state === "chase_weapon" && nearestCrate) {
      targetX = nearestCrate.x;
      targetY = nearestCrate.y;
    } else if (p.ai.state === "chase_player" && nearestPlayer) {
      const pl: GamePlayerState = nearestPlayer;
      targetX = pl.x;
      targetY = pl.y;
    }

    // Simple obstacle jumping pathfinder
    // Check if there is a wall or pit in front of the bot
    const walkDirection = targetX > p.x ? 1 : -1;
    let needsToJumpObstacle = false;
    
    // Scan ahead in platforms
    selectedMap.platforms.forEach(plat => {
      const isAhead = walkDirection > 0 
        ? (plat.x > p.x && plat.x < p.x + 80)
        : (plat.x + plat.width < p.x && plat.x + plat.width > p.x - 80);
      const isBlockingHeight = plat.y < p.y + 10 && plat.y > p.y - 120;
      
      if (isAhead && isBlockingHeight) {
        needsToJumpObstacle = true;
      }
    });

    // Jump if target is higher up
    if (targetY < p.y - 45 && Math.random() < 0.05) {
      shouldJump = true;
    }
    if (needsToJumpObstacle && Math.random() < 0.1) {
      shouldJump = true;
    }

    // Apply movement speeds
    const botAccel = p.config.type === "hard_cpu" ? 0.95 : (p.config.type === "normal_cpu" ? 0.65 : 0.4);
    if (Math.abs(targetX - p.x) > 25) {
      p.vx += walkDirection * botAccel;
      p.facingLeft = walkDirection < 0;
    }

    // Execute jump
    if (shouldJump && p.isGrounded) {
      p.vy = selectedMap.lowGravity ? -5.0 : -9.0;
      p.isGrounded = false;
      playSynthSound("jump");
    }

    // Aim toward target
    if (nearestPlayer) {
      const target: GamePlayerState = nearestPlayer;
      const angleToTarget = Math.atan2((target.y - 20) - (p.y - 20), target.x - p.x);
      p.aimAngle = angleToTarget;

      // Attack if weapon is equipped and target in sight/range
      if (p.currentWeapon) {
        const dist = Math.hypot(target.x - p.x, target.y - p.y);
        const maxRange = p.currentWeapon.template.class === "melee" ? 80 : 450;
        
        // Shoot trigger frequency based on CPU difficulty
        const shootChance = p.config.type === "hard_cpu" ? 0.09 : (p.config.type === "normal_cpu" ? 0.045 : 0.015);
        if (dist < maxRange && Math.random() < shootChance) {
          fireActiveWeapon(p);
        }
      }
    }

    // Un-equip empty weapon automatically
    if (p.currentWeapon && p.currentWeapon.ammo === 0) {
      throwCurrentWeapon(p);
    }
  };

  // WEAPON FIRE LOGIC
  const fireActiveWeapon = (p: GamePlayerState) => {
    if (!p.currentWeapon) {
      // Basic Unarmed Melee Strike
      const now = Date.now();
      if (now - p.colorFlashTimer < 250) return; // melee rate limit
      
      p.colorFlashTimer = 300; // reuse flash as cooldown
      executeMeleeStrike(p, {
        id: "unarmed",
        name: "Fists",
        class: "melee",
        damage: 10,
        cooldown: 300,
        ammoMax: -1,
        range: 40,
        knockback: 10,
        recoil: -2,
        weight: 1,
        color: "#94a3b8",
        description: ""
      });
      return;
    }

    const now = Date.now();
    const temp = p.currentWeapon.template;
    if (now - p.currentWeapon.lastFired < temp.cooldown) return;

    p.currentWeapon.lastFired = now;

    if (p.currentWeapon.ammo !== -1) {
      p.currentWeapon.ammo--;
    }

    // Apply shooting recoil push
    const recoilFactor = p.facingLeft ? 1 : -1;
    p.vx += recoilFactor * temp.recoil * 0.45;
    p.vy -= temp.recoil * 0.18;

    // Trigger weapon flash audio
    if (temp.class === "melee") {
      executeMeleeStrike(p, temp);
    } else {
      executeFirearmShoot(p, temp);
    }
  };

  // Melee weapon sweep/hit verification
  const executeMeleeStrike = (p: GamePlayerState, temp: WeaponTemplate) => {
    playSynthSound("hit");
    
    // Strike sweep arc visual particles
    const reach = temp.range;
    const ax = p.x + Math.cos(p.aimAngle) * reach;
    const ay = p.y - 20 + Math.sin(p.aimAngle) * reach;

    spawnParticles(ax, ay, "spark", temp.color, 12, 2.5);

    // Scan for affected players
    gamePlayersRef.current.forEach(victim => {
      if (victim.isDead || victim.config.id === p.config.id || victim.invulnerabilityTimer > 0) return;

      const dist = Math.hypot(victim.x - p.x, (victim.y - 15) - (p.y - 15));
      if (dist < reach + 20) {
        dealDamage(victim, temp.damage, p.config.id);
        
        // Slasher push
        const blowDir = p.facingLeft ? -1 : 1;
        victim.vx += blowDir * temp.knockback * 0.65;
        victim.vy -= temp.knockback * 0.25;

        // Life steal with Scythe
        if (temp.id === "scythe") {
          p.health = Math.min(100, p.health + Math.floor(temp.damage * 0.25));
          spawnParticles(p.x, p.y - 15, "spark", "#22c55e", 5, 2);
        }

        // Freeze targets with Cryo ray (special/melee)
        if (temp.id === "freezeray") {
          victim.freezeTimer = 180;
          playSynthSound("frozen");
        }

        playSynthSound("hit");
        spawnParticles(victim.x, victim.y - 20, "blood", victim.config.color, 15, 3.5);
      }
    });

    // Mjolnir ground lightning shock
    if (temp.id === "hammer" && p.isGrounded) {
      screenShakeRef.current = 15;
      playSynthSound("lightning");
      gamePlayersRef.current.forEach(victim => {
        if (victim.isDead || victim.config.id === p.config.id) return;
        const dist = Math.abs(victim.x - p.x);
        if (dist < 300 && victim.isGrounded) {
          dealDamage(victim, 20, p.config.id);
          victim.vy = -6;
          spawnParticles(victim.x, victim.y - 15, "lightning", "#a5f3fc", 15, 2);
        }
      });
    }
  };

  // Firearm shoots projectile creator
  const executeFirearmShoot = (p: GamePlayerState, temp: WeaponTemplate) => {
    const angle = p.aimAngle;
    const px = p.x + Math.cos(angle) * 28;
    const py = p.y - 20 + Math.sin(angle) * 28;

    // Add recoil smoke
    spawnParticles(px, py, "smoke", "#e2e8f0", 5, 1);

    if (temp.id === "shotgun" || temp.id === "double_shotgun" || temp.id === "bounce") {
      // Fires multiple wide-spread pellets
      const pelletCount = temp.id === "double_shotgun" ? 10 : 6;
      playSynthSound("shoot");
      screenShakeRef.current = temp.id === "double_shotgun" ? 18 : 10;
      
      for (let i = 0; i < pelletCount; i++) {
        const spreadAngle = angle + (Math.random() - 0.5) * 0.4;
        const vel = 12 + Math.random() * 6;
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: p.config.id,
          type: temp.id === "bounce" ? "shuriken" : "pellet",
          x: px,
          y: py,
          vx: Math.cos(spreadAngle) * vel,
          vy: Math.sin(spreadAngle) * vel,
          width: 5,
          height: 5,
          damage: temp.damage,
          knockback: temp.knockback,
          age: 0,
          maxAge: 40,
          color: temp.color,
          bounceCount: temp.id === "bounce" ? 4 : 0
        });
      }
    } else if (temp.id === "rocket" || temp.id === "rpg") {
      playSynthSound("explosion");
      screenShakeRef.current = 15;
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "rocket",
        x: px,
        y: py,
        vx: Math.cos(angle) * 14,
        vy: Math.sin(angle) * 14,
        width: 14,
        height: 8,
        damage: temp.damage,
        knockback: temp.knockback,
        age: 0,
        maxAge: 180,
        color: temp.color,
        bounceCount: 0
      });
    } else if (temp.id === "grenade") {
      playSynthSound("shoot");
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "grenade",
        x: px,
        y: py,
        vx: Math.cos(angle) * 11,
        vy: Math.sin(angle) * 11 - 3,
        width: 10,
        height: 10,
        damage: temp.damage,
        knockback: temp.knockback,
        age: 0,
        maxAge: 150,
        color: temp.color,
        bounceCount: 4,
        gravityEffect: true
      });
    } else if (temp.id === "portalgun") {
      // Toggle portal bullet type
      const isBlue = frameCountRef.current % 2 === 0;
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: isBlue ? "portal_bullet_blue" : "portal_bullet_orange",
        x: px,
        y: py,
        vx: Math.cos(angle) * 18,
        vy: Math.sin(angle) * 18,
        width: 10,
        height: 10,
        damage: 0,
        knockback: 0,
        age: 0,
        maxAge: 120,
        color: isBlue ? "#38bdf8" : "#f43f5e",
        bounceCount: 0
      });
    } else if (temp.id === "railgun" || temp.id === "laser") {
      playSynthSound("laser");
      screenShakeRef.current = temp.id === "railgun" ? 20 : 3;
      // Instant railgun beams or rapid pulses
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "laser_pulse",
        x: px,
        y: py,
        vx: Math.cos(angle) * (temp.id === "railgun" ? 35 : 22),
        vy: Math.sin(angle) * (temp.id === "railgun" ? 35 : 22),
        width: 16,
        height: 4,
        damage: temp.damage,
        knockback: temp.knockback,
        age: 0,
        maxAge: 80,
        color: temp.color,
        bounceCount: 0
      });
    } else if (temp.id === "bubble") {
      playSynthSound("frozen");
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "bubble",
        x: px,
        y: py,
        vx: Math.cos(angle) * 7,
        vy: Math.sin(angle) * 7,
        width: 18,
        height: 18,
        damage: temp.damage,
        knockback: -5,
        age: 0,
        maxAge: 120,
        color: temp.color,
        bounceCount: 1
      });
    } else if (temp.id === "taser") {
      playSynthSound("shoot");
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "spark_shock",
        x: px,
        y: py,
        vx: Math.cos(angle) * 20,
        vy: Math.sin(angle) * 20,
        width: 8,
        height: 8,
        damage: temp.damage,
        knockback: temp.knockback,
        age: 0,
        maxAge: 40,
        color: temp.color,
        bounceCount: 0
      });
    } else if (temp.id === "freezeray") {
      playSynthSound("laser");
      // Ice block ray particles
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "plasma_orb",
        x: px,
        y: py,
        vx: Math.cos(angle) * 11,
        vy: Math.sin(angle) * 11,
        width: 8,
        height: 8,
        damage: temp.damage,
        knockback: temp.knockback,
        age: 0,
        maxAge: 45,
        color: "#a5f3fc",
        bounceCount: 0
      });
      // Spray frosty particles
      spawnParticles(px, py, "ice", "#e0f2fe", 4, 1.5);
    } else if (temp.id === "blackhole") {
      playSynthSound("laser");
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "blackhole_orb",
        x: px,
        y: py,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        width: 25,
        height: 25,
        damage: temp.damage,
        knockback: 0,
        age: 0,
        maxAge: 250,
        color: temp.color,
        bounceCount: 0
      });
    } else if (temp.id === "firework") {
      playSynthSound("shoot");
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "firework_rocket",
        x: px,
        y: py,
        vx: Math.cos(angle) * 13,
        vy: Math.sin(angle) * 13,
        width: 12,
        height: 6,
        damage: temp.damage,
        knockback: temp.knockback,
        age: 0,
        maxAge: 120,
        color: temp.color,
        bounceCount: 1
      });
    } else {
      // Standard rifle/pistol/minigun shoot
      playSynthSound("shoot");
      screenShakeRef.current = temp.id === "sniper" ? 14 : (temp.id === "rifle" ? 4 : 2);
      
      projectilesRef.current.push({
        id: Math.random().toString(),
        ownerId: p.config.id,
        type: "bullet",
        x: px,
        y: py,
        vx: Math.cos(angle) * (temp.id === "sniper" ? 28 : 18),
        vy: Math.sin(angle) * (temp.id === "sniper" ? 28 : 18),
        width: temp.id === "sniper" ? 12 : 7,
        height: 4,
        damage: temp.damage,
        knockback: temp.knockback,
        age: 0,
        maxAge: 180,
        color: temp.color,
        bounceCount: 0,
        gravityEffect: temp.id === "crossbow"
      });
    }
  };

  // Discard / Throw weapon
  const throwCurrentWeapon = (p: GamePlayerState) => {
    if (!p.currentWeapon) {
      // Pick up nearby throwable crates/items if unarmed
      let pickedUp = false;
      itemsRef.current.forEach((it, idx) => {
        if (pickedUp) return;
        const dist = Math.hypot(p.x - it.x, (p.y - 15) - it.y);
        if (dist < 40) {
          p.heldPickup = it;
          itemsRef.current.splice(idx, 1);
          pickedUp = true;
          playSynthSound("pickup");
        }
      });
      return;
    }

    // Launch current weapon as an interactive physical throwable!
    const angle = p.aimAngle;
    const launchSpeed = 12;
    
    itemsRef.current.push({
      id: Math.random().toString(),
      type: "weapon_pickup",
      x: p.x,
      y: p.y - 20,
      vx: Math.cos(angle) * launchSpeed + p.vx,
      vy: Math.sin(angle) * launchSpeed - 3 + p.vy,
      width: 28,
      height: 12,
      angle,
      vangle: (p.facingLeft ? -1 : 1) * 0.2,
      health: 20,
      weaponTemplate: p.currentWeapon.template,
      isThrowable: true
    });

    p.currentWeapon = null;
    playSynthSound("jump");
  };

  // Explosion resolution
  const explodeProjectile = (proj: Projectile) => {
    playSynthSound("explosion");
    screenShakeRef.current = 18;

    const radius = proj.type === "blackhole_orb" ? 180 : 120;
    
    // Spawn fiery explosions
    if (proj.type === "firework_rocket") {
      const colors = ["#f43f5e", "#10b981", "#3b82f6", "#eab308", "#a855f7"];
      for (let i = 0; i < 40; i++) {
        spawnParticles(proj.x, proj.y, "confetti", colors[Math.floor(Math.random() * colors.length)], 10, 4);
      }
    } else {
      spawnParticles(proj.x, proj.y, "shockwave", "#fef08a", 1, 15);
      for (let i = 0; i < 25; i++) {
        spawnParticles(proj.x, proj.y, "fire", "#f97316", 12, 3.5);
        spawnParticles(proj.x, proj.y, "smoke", "#475569", 8, 4);
      }
    }

    // Check hit radius on players
    gamePlayersRef.current.forEach(p => {
      if (p.isDead || p.invulnerabilityTimer > 0) return;
      const d = Math.hypot(p.x - proj.x, (p.y - 15) - proj.y);
      if (d < radius) {
        const falloff = 1 - (d / radius);
        const damageDealt = Math.floor(proj.damage * falloff);
        dealDamage(p, damageDealt, proj.ownerId);

        // Explode push forces
        const angle = Math.atan2((p.y - 15) - proj.y, p.x - proj.x);
        p.vx += Math.cos(angle) * proj.knockback * 0.35 * falloff;
        p.vy += Math.sin(angle) * proj.knockback * 0.35 * falloff;
        p.burnTimer = 90; // Set on fire!
        spawnParticles(p.x, p.y - 15, "blood", p.config.color, 8, 3);
      }
    });

    // Check hit radius on platform block breaking
    selectedMap.platforms.forEach(plat => {
      if (!plat.isDestructible) return;
      const d = Math.hypot((plat.x + plat.width/2) - proj.x, (plat.y + plat.height/2) - proj.y);
      if (d < radius && plat.health !== undefined) {
        plat.health -= Math.floor(proj.damage * (1 - d/radius) * 1.5);
      }
    });
  };

  // Damage System
  const dealDamage = (victim: GamePlayerState, amt: number, dealerId: number | null) => {
    if (victim.isDead || victim.invulnerabilityTimer > 0) return;
    victim.health -= amt;
    victim.colorFlashTimer = 10; // flash red on hit
    victim.lastDamageDealerId = dealerId;

    // Add random dynamic spin impulse on hit to tumble around floppily like the true stickman clash game!
    const spinImpulse = (Math.random() - 0.5) * 0.15 + (amt * 0.012) * (Math.random() > 0.5 ? 1 : -1);
    victim.spinVelocity += spinImpulse;

    if (victim.health <= 0) {
      killPlayer(victim, dealerId);
    }
  };

  // Kill resolution
  const killPlayer = (victim: GamePlayerState, killerId: number | null) => {
    victim.isDead = true;
    victim.health = 0;
    victim.respawnTimer = 180; // 3 seconds respawn
    playSynthSound("explosion");
    
    // Blast blood particles
    for (let i = 0; i < 35; i++) {
      spawnParticles(victim.x, victim.y - 20, "blood", victim.config.color, 10, 4.5);
    }

    // Detach skeleton completely as free-falling physics debris!
    // Initialize limbs velocities on explosive launch
    const blowX = victim.vx + (Math.random() - 0.5) * 6;
    const blowY = victim.vy - 5 - Math.random() * 5;
    
    Object.values(victim.limbs).forEach(joint => {
      joint.vx = blowX + (Math.random() - 0.5) * 4;
      joint.vy = blowY + (Math.random() - 0.5) * 4;
    });

    // Discard any held weapon crate
    if (victim.currentWeapon) {
      throwCurrentWeapon(victim);
    }
  };

  // Respawn setup
  const respawnPlayer = (p: GamePlayerState) => {
    p.isDead = false;
    p.health = 100;
    p.invulnerabilityTimer = 90;
    
    const spawns = selectedMap.spawnPoints;
    const spawn = spawns[Math.floor(Math.random() * spawns.length)];
    p.x = spawn.x;
    p.y = spawn.y;
    p.vx = 0;
    p.vy = 0;
    p.spinAngle = 0;
    p.spinVelocity = 0;
    p.limbs = createRagdollLimbs(spawn.x, spawn.y);
  };

  // Portal teleportation check
  const handlePortalTeleportation = (entity: { x: number; y: number; vx: number; vy: number }) => {
    const blue = activePortalsRef.current["blue"];
    const orange = activePortalsRef.current["orange"];

    if (blue && orange) {
      // Check collision with Blue portal
      const dBlue = Math.hypot(entity.x - blue.x, entity.y - blue.y);
      if (dBlue < 32) {
        entity.x = orange.x + (entity.vx > 0 ? 30 : -30);
        entity.y = orange.y;
        playSynthSound("laser");
        spawnParticles(blue.x, blue.y, "plasma", blue.color, 10, 2);
        spawnParticles(orange.x, orange.y, "plasma", orange.color, 10, 2);
      } else {
        // Check collision with Orange portal
        const dOrange = Math.hypot(entity.x - orange.x, entity.y - orange.y);
        if (dOrange < 32) {
          entity.x = blue.x + (entity.vx > 0 ? 30 : -30);
          entity.y = blue.y;
          playSynthSound("laser");
          spawnParticles(orange.x, orange.y, "plasma", orange.color, 10, 2);
          spawnParticles(blue.x, blue.y, "plasma", blue.color, 10, 2);
        }
      }
    }

    // Map predefined portals
    if (selectedMap.portals) {
      selectedMap.portals.forEach(p => {
        const d1 = Math.hypot(entity.x - p.x1, entity.y - p.y1);
        if (d1 < 30) {
          entity.x = p.x2 + (entity.vx > 0 ? 25 : -25);
          entity.y = p.y2;
          playSynthSound("laser");
        } else {
          const d2 = Math.hypot(entity.x - p.x2, entity.y - p.y2);
          if (d2 < 30) {
            entity.x = p.x1 + (entity.vx > 0 ? 25 : -25);
            entity.y = p.y1;
            playSynthSound("laser");
          }
        }
      });
    }
  };

  // Resolve Map/Wall rigid collisions for players
  const collideEntityWithMap = (p: GamePlayerState) => {
    const prevY = p.y - p.vy;

    selectedMap.platforms.forEach(plat => {
      // Check if players intersect plat
      if (hitTestRect(p.x - p.width/2, p.y - p.height, p.width, p.height, plat.x, plat.y, plat.width, plat.height)) {
        
        // One-Way Pass-Through logic: only land if dropping down from above
        if (plat.isOneWay) {
          const wasAbove = (prevY - p.height) <= plat.y + 2;
          if (wasAbove && p.vy >= 0) {
            p.y = plat.y;
            p.vy = 0;
            p.isGrounded = true;
          }
          return;
        }

        // Bouncy slide platform
        if (plat.isBouncy) {
          p.vy = -11;
          p.isGrounded = false;
          playSynthSound("jump");
          spawnParticles(p.x, p.y, "smoke", plat.isConveyor ? "#22c55e" : "#f43f5e", 8, 2);
          return;
        }

        // Conveyor belt horizontal slide force
        if (plat.isConveyor) {
          p.vx += plat.isConveyor * 0.25;
        }

        // Standard 4-way solid block collisions resolution
        const overlapX = Math.min((p.x + p.width/2) - plat.x, (plat.x + plat.width) - (p.x - p.width/2));
        const overlapY = Math.min(p.y - plat.y, (plat.y + plat.height) - (p.y - p.height));

        if (overlapX < overlapY) {
          // Push horizontal
          const pushDir = p.x < plat.x + plat.width/2 ? -1 : 1;
          p.x += pushDir * overlapX;
          p.vx = 0;
        } else {
          // Push vertical
          const pushDir = p.y < plat.y + plat.height/2 ? -1 : 1;
          p.y += pushDir * overlapY;
          p.vy = 0;
          if (pushDir < 0) {
            p.isGrounded = true;
          }
        }
      }
    });

    // Check custom portals
    handlePortalTeleportation(p);
  };

  // Collide physical items with platforms
  const collideItemWithMap = (it: PhysicalItem) => {
    selectedMap.platforms.forEach(plat => {
      if (hitTestRect(it.x - it.width/2, it.y - it.height/2, it.width, it.height, plat.x, plat.y, plat.width, plat.height)) {
        if (plat.isOneWay) {
          if (it.vy > 0) {
            it.y = plat.y - it.height/2;
            it.vy = -it.vy * 0.4;
          }
          return;
        }

        const overlapX = Math.min((it.x + it.width/2) - plat.x, (plat.x + plat.width) - (it.x - it.width/2));
        const overlapY = Math.min((it.y + it.height/2) - plat.y, (plat.y + plat.height) - (it.y - it.height/2));

        if (overlapX < overlapY) {
          it.x += (it.x < plat.x + plat.width/2 ? -1 : 1) * overlapX;
          it.vx = -it.vx * 0.6;
        } else {
          it.y += (it.y < plat.y + plat.height/2 ? -1 : 1) * overlapY;
          it.vy = -it.vy * 0.5;
        }
      }
    });
  };

  // --- FLOOPY RAGDOLL JOINT SOLVERS ---
  const updateLivingRagdoll = (p: GamePlayerState, dt: number) => {
    const limbs = p.limbs;
    const bodyX = p.x;
    const bodyY = p.y;

    // Update spin rotation based on ground state and airborne velocity
    if (p.isGrounded) {
      p.spinAngle += (0 - p.spinAngle) * 0.15 * dt;
      p.spinVelocity = 0;
    } else {
      // Rotate in air based on horizontal speed & vertical drag
      p.spinVelocity += (p.vx * 0.015) * dt;
      // Clamp to prevent endless warp speed spin
      p.spinVelocity = Math.max(-0.25, Math.min(0.25, p.spinVelocity));
      p.spinVelocity *= 0.96; // drag
      p.spinAngle += p.spinVelocity * dt;
    }

    const cos = Math.cos(p.spinAngle);
    const sin = Math.sin(p.spinAngle);

    // Get rotated point relative to the torso center (bodyX, bodyY - 20)
    const getRotatedPoint = (rx: number, ry: number) => {
      const cx = bodyX;
      const cy = bodyY - 20;
      return {
        x: cx + (rx * cos - ry * sin),
        y: cy + (rx * sin + ry * cos)
      };
    };

    // 1. Head and Chest core joints with relative rotation
    const headTarget = getRotatedPoint(0, -22);
    limbs.head.x += (headTarget.x - limbs.head.x) * 0.45 * dt;
    limbs.head.y += (headTarget.y - limbs.head.y) * 0.45 * dt;

    const chestTarget = getRotatedPoint(0, -6);
    limbs.chest.x += (chestTarget.x - limbs.chest.x) * 0.45 * dt;
    limbs.chest.y += (chestTarget.y - limbs.chest.y) * 0.45 * dt;

    // 2. Arms aim logic rotating together with the body
    const angle = p.aimAngle;
    const isMoving = Math.abs(p.vx) > 0.5;

    // Relative aiming vectors
    const aimX = Math.cos(angle) * 22;
    const aimY = Math.sin(angle) * 22;

    const armL1Target = getRotatedPoint(-8, -4);
    const armL2Target = getRotatedPoint(-8 + aimX, -4 + aimY);
    limbs.armLeft1.x += (armL1Target.x - limbs.armLeft1.x) * 0.4 * dt;
    limbs.armLeft1.y += (armL1Target.y - limbs.armLeft1.y) * 0.4 * dt;
    limbs.armLeft2.x += (armL2Target.x - limbs.armLeft2.x) * 0.35 * dt;
    limbs.armLeft2.y += (armL2Target.y - limbs.armLeft2.y) * 0.35 * dt;

    const armR1Target = getRotatedPoint(8, -4);
    const armR2Target = getRotatedPoint(8 + aimX, -4 + aimY);
    limbs.armRight1.x += (armR1Target.x - limbs.armRight1.x) * 0.4 * dt;
    limbs.armRight1.y += (armR1Target.y - limbs.armRight1.y) * 0.4 * dt;
    limbs.armRight2.x += (armR2Target.x - limbs.armRight2.x) * 0.35 * dt;
    limbs.armRight2.y += (armR2Target.y - limbs.armRight2.y) * 0.35 * dt;

    // 3. Legs animation - running sine cycle when on ground, floppy in air
    if (p.isGrounded && isMoving) {
      const stride = Math.sin(frameCountRef.current * 0.28) * 16;
      
      limbs.legLeft1.x = bodyX - 4 + stride * 0.3;
      limbs.legLeft1.y = bodyY - 12 + 6;
      limbs.legLeft2.x = bodyX - 8 + stride;
      limbs.legLeft2.y = bodyY;

      limbs.legRight1.x = bodyX + 4 - stride * 0.3;
      limbs.legRight1.y = bodyY - 12 + 6;
      limbs.legRight2.x = bodyX + 8 - stride;
      limbs.legRight2.y = bodyY;
    } else {
      // Floppy rotated legs when airborne or resting!
      const legL1Target = getRotatedPoint(-6, 8);
      const legL2Target = getRotatedPoint(-8, 22);
      limbs.legLeft1.x += (legL1Target.x - limbs.legLeft1.x) * 0.35 * dt;
      limbs.legLeft1.y += (legL1Target.y - limbs.legLeft1.y) * 0.35 * dt;
      limbs.legLeft2.x += (legL2Target.x - limbs.legLeft2.x) * 0.3 * dt;
      limbs.legLeft2.y += (legL2Target.y - limbs.legLeft2.y) * 0.3 * dt;

      const legR1Target = getRotatedPoint(6, 8);
      const legR2Target = getRotatedPoint(8, 22);
      limbs.legRight1.x += (legR1Target.x - limbs.legRight1.x) * 0.35 * dt;
      limbs.legRight1.y += (legR1Target.y - limbs.legRight1.y) * 0.35 * dt;
      limbs.legRight2.x += (legR2Target.x - limbs.legRight2.x) * 0.3 * dt;
      limbs.legRight2.y += (legR2Target.y - limbs.legRight2.y) * 0.3 * dt;
    }
  };

  // Full dead ragdoll free-fall simulation (using floppy gravity constraints)
  const updateDeadRagdoll = (p: GamePlayerState, dt: number) => {
    const joints = Object.values(p.limbs);

    // Apply simple Verlet-like gravity and slide drag to dead joints
    joints.forEach(joint => {
      joint.vy += (selectedMap.lowGravity ? 0.15 : 0.42) * dt;
      joint.vx *= 0.95;
      joint.vy *= 0.95;

      joint.x += joint.vx * dt;
      joint.y += joint.vy * dt;

      // Platform collisions for individual ragdoll parts so they pile floppy!
      selectedMap.platforms.forEach(plat => {
        if (hitTestRect(joint.x - 4, joint.y - 4, 8, 8, plat.x, plat.y, plat.width, plat.height)) {
          if (plat.isOneWay) return;
          joint.y = plat.y - 4;
          joint.vy = -joint.vy * 0.3;
          joint.vx *= 0.7;
        }
      });
    });

    // Simple spring distance constraints to keep limbs connected to torso/chest
    const chest = p.limbs.chest;
    const connect = (j1: any, j2: any, idealDist: number, strength: number) => {
      const dx = j2.x - j1.x;
      const dy = j2.y - j1.y;
      const d = Math.hypot(dx, dy) || 1;
      const diff = d - idealDist;
      
      const fx = (dx / d) * diff * strength;
      const fy = (dy / d) * diff * strength;

      j1.x += fx;
      j1.y += fy;
      j2.x -= fx;
      j2.y -= fy;
    };

    // Maintain skeleton assembly
    connect(p.limbs.chest, p.limbs.head, 15, 0.2);
    connect(p.limbs.chest, p.limbs.armLeft1, 10, 0.2);
    connect(p.limbs.armLeft1, p.limbs.armLeft2, 12, 0.2);
    connect(p.limbs.chest, p.limbs.armRight1, 10, 0.2);
    connect(p.limbs.armRight1, p.limbs.armRight2, 12, 0.2);
    
    connect(p.limbs.chest, p.limbs.legLeft1, 15, 0.2);
    connect(p.limbs.legLeft1, p.limbs.legLeft2, 16, 0.2);
    connect(p.limbs.chest, p.limbs.legRight1, 15, 0.2);
    connect(p.limbs.legRight1, p.limbs.legRight2, 16, 0.2);
  };

  // COLLISION HELPERS
  const hitTestRect = (
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ) => {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  };

  // Particle spawning
  const spawnParticles = (
    x: number, y: number,
    type: GameParticle["type"],
    color: string,
    count: number,
    baseSpeed: number
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.2 + Math.random() * 0.8) * baseSpeed;
      particlesRef.current.push({
        id: Math.random().toString(),
        type,
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - (type === "blood" || type === "debris" ? 1.5 : 0),
        color,
        size: type === "shockwave" ? 12 : (2 + Math.random() * 4),
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        gravity: ["blood", "debris", "spark"].includes(type),
        vangle: (Math.random() - 0.5) * 0.1,
        angle: Math.random() * Math.PI
      });
    }
  };

  // --- RENDER GAME CANVAS ---
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply Screen Shake
    ctx.save();
    if (screenShakeRef.current > 0.1) {
      const dx = (Math.random() - 0.5) * screenShakeRef.current;
      const dy = (Math.random() - 0.5) * screenShakeRef.current;
      ctx.translate(dx, dy);
    }

    // 1. Draw Map Environment Background
    drawBackground(ctx);

    // 2. Draw permanent map hazard Spikes
    selectedMap.spikes.forEach(sp => {
      drawSpikes(ctx, sp.x, sp.y, sp.width, sp.height);
    });

    // 3. Draw map Platforms
    selectedMap.platforms.forEach(plat => {
      drawPlatform(ctx, plat);
    });

    // 4. Draw Interactive items/throwable crates
    itemsRef.current.forEach(it => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.angle);

      if (it.type === "crate") {
        ctx.fillStyle = "#b45309";
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 2;
        ctx.fillRect(-12, -12, 24, 24);
        ctx.strokeRect(-12, -12, 24, 24);
        // crate cross bar
        ctx.beginPath();
        ctx.moveTo(-10, -10); ctx.lineTo(10, 10);
        ctx.moveTo(10, -10); ctx.lineTo(-10, 10);
        ctx.stroke();
      } else if (it.type === "weapon_pickup") {
        // Draw gun pickup body
        ctx.fillStyle = it.weaponTemplate?.color || "#e2e8f0";
        ctx.fillRect(-14, -6, 28, 12);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(4, 4, 4, 6); // handle
      }
      ctx.restore();
    });

    // 5. Draw Portals
    const bluePort = activePortalsRef.current["blue"];
    const orangePort = activePortalsRef.current["orange"];
    if (bluePort) drawPortalHole(ctx, bluePort.x, bluePort.y, bluePort.color);
    if (orangePort) drawPortalHole(ctx, orangePort.x, orangePort.y, orangePort.color);

    if (selectedMap.portals) {
      selectedMap.portals.forEach(p => {
        drawPortalHole(ctx, p.x1, p.y1, p.color);
        drawPortalHole(ctx, p.x2, p.y2, p.color);
      });
    }

    // 6. Draw active laser lines/projectiles
    projectilesRef.current.forEach(proj => {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.rotate(Math.atan2(proj.vy, proj.vx));

      if (proj.type === "bullet" || proj.type === "pellet") {
        ctx.fillStyle = proj.color;
        ctx.fillRect(-proj.width/2, -proj.height/2, proj.width, proj.height);
      } else if (proj.type === "rocket" || proj.type === "firework_rocket") {
        ctx.fillStyle = proj.color;
        ctx.fillRect(-8, -4, 16, 8);
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(8, -4); ctx.lineTo(14, 0); ctx.lineTo(8, 4);
        ctx.fill();
      } else if (proj.type === "grenade") {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (proj.type === "laser_pulse") {
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
        ctx.stroke();
      } else if (proj.type === "bubble") {
        ctx.fillStyle = "rgba(6, 182, 212, 0.2)";
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (proj.type === "blackhole_orb") {
        ctx.fillStyle = "black";
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });

    // 7. Draw Floppy Stickmen (players)
    gamePlayersRef.current.forEach(p => {
      drawPlayerStickman(ctx, p);
    });

    // 8. Draw particles
    particlesRef.current.forEach(part => {
      ctx.save();
      ctx.globalAlpha = part.alpha;
      ctx.fillStyle = part.color;

      if (part.type === "shockwave") {
        ctx.strokeStyle = part.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size * (1 - part.alpha), 0, Math.PI * 2);
        ctx.stroke();
      } else if (part.type === "confetti") {
        ctx.fillRect(part.x, part.y, part.size, part.size);
      } else {
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 9. Draw interactive HUDs (Names/health above active living players)
    gamePlayersRef.current.forEach(p => {
      if (p.isDead) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(p.x - 30, p.y - 72, 60, 6);
      
      // Health color gradient
      ctx.fillStyle = p.health > 40 ? "#22c55e" : (p.health > 15 ? "#eab308" : "#ef4444");
      ctx.fillRect(p.x - 30, p.y - 72, 60 * (p.health / 100), 6);

      // Draw custom indicators (Invulnerability/Freeze/Fire)
      if (p.invulnerabilityTimer > 0) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 25, 32, 0, Math.PI*2);
        ctx.stroke();
      }

      // Draw tag name text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.config.name, p.x, p.y - 78);
    });

    // 10. Draw dynamic wind particles visual indicators
    if (selectedMap.windForce && frameCountRef.current % 12 === 0) {
      spawnParticles(0, Math.random() * 600, "smoke", "rgba(255, 255, 255, 0.15)", 1, 3);
    }

    ctx.restore();
  };

  // Draw background scene based on Map themes
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const theme = selectedMap.theme;
    if (theme === "sky") {
      // Sky blue gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 600);
      grad.addColorStop(0, "#0ea5e9");
      grad.addColorStop(0.6, "#bae6fd");
      grad.addColorStop(1, "#f0f9ff");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 600);
      
      // Cloud elements drawing
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(200, 150, 40, 0, Math.PI*2);
      ctx.arc(240, 140, 50, 0, Math.PI*2);
      ctx.arc(280, 150, 40, 0, Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(1000, 180, 50, 0, Math.PI*2);
      ctx.arc(1050, 170, 60, 0, Math.PI*2);
      ctx.arc(1100, 180, 50, 0, Math.PI*2);
      ctx.fill();
    } else if (theme === "lava") {
      ctx.fillStyle = "#1e1b4b"; // Dark purple cave background
      ctx.fillRect(0, 0, 1280, 600);
      
      // Magma cracks visual lines
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 0); ctx.lineTo(150, 200); ctx.lineTo(120, 400);
      ctx.moveTo(1100, 0); ctx.lineTo(1050, 300); ctx.lineTo(1120, 500);
      ctx.stroke();

      // Draw bottom toxic/magma lava rising pool
      if (selectedMap.lavaLevel !== undefined) {
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(0, selectedMap.lavaLevel, 1280, 600 - selectedMap.lavaLevel);
        
        // Bubbles rising from lava
        if (frameCountRef.current % 10 === 0) {
          spawnParticles(Math.random() * 1280, selectedMap.lavaLevel, "fire", "#f97316", 1, 1.5);
        }
      }
    } else if (theme === "toxic") {
      const grad = ctx.createLinearGradient(0, 0, 0, 600);
      grad.addColorStop(0, "#052e16");
      grad.addColorStop(1, "#14532d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 600);
    } else if (theme === "cyber") {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, 1280, 600);
      // Grid lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 1280; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
      }
      for (let y = 0; y < 600; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke();
      }
    } else if (theme === "industrial") {
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(0, 0, 1280, 600);
      // Steel support diagonal beams visual decoration
      ctx.strokeStyle = "#44403c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 100); ctx.lineTo(1280, 300);
      ctx.moveTo(0, 400); ctx.lineTo(1280, 200);
      ctx.stroke();
    } else {
      // Default slate grey ruins
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 1280, 600);
    }
  };

  // Draw spikes hazard
  const drawSpikes = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = "#64748b";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;

    const spikeCount = Math.floor(w / 16);
    ctx.beginPath();
    for (let i = 0; i < spikeCount; i++) {
      const sx = x + i * 16;
      ctx.moveTo(sx, y + h);
      ctx.lineTo(sx + 8, y);
      ctx.lineTo(sx + 16, y + h);
    }
    ctx.fill();
    ctx.stroke();
  };

  // Draw solid brick platform elements
  const drawPlatform = (ctx: CanvasRenderingContext2D, plat: any) => {
    ctx.save();
    
    if (plat.isBouncy) {
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.fillStyle = "#fda4af";
      ctx.fillRect(plat.x, plat.y, plat.width, 5); // bouncy top cap
    } else if (plat.isOneWay) {
      // Thin wood bridges
      ctx.fillStyle = "#78350f";
      ctx.fillRect(plat.x, plat.y, plat.width, 6);
      ctx.fillStyle = "#d97706";
      ctx.fillRect(plat.x, plat.y, plat.width, 2);
    } else if (plat.isConveyor) {
      // Draw spinning rollers or yellow striped conveyor paths
      ctx.fillStyle = "#27272a";
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      const stripeCount = Math.floor(plat.width / 20);
      const offset = (frameCountRef.current * plat.isConveyor * 0.4) % 20;

      ctx.save();
      ctx.rect(plat.x, plat.y, plat.width, plat.height);
      ctx.clip();
      
      ctx.beginPath();
      for (let i = -1; i < stripeCount + 1; i++) {
        const sx = plat.x + i * 20 + offset;
        ctx.moveTo(sx, plat.y);
        ctx.lineTo(sx - 10, plat.y + plat.height);
      }
      ctx.stroke();
      ctx.restore();
    } else if (plat.isDestructible) {
      // Brick walls
      const healthPct = plat.health / plat.maxHealth;
      ctx.fillStyle = healthPct > 0.6 ? "#78716c" : (healthPct > 0.3 ? "#57534e" : "#44403c");
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.strokeStyle = "#292524";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

      // Cracks lines overlay on platform block damage
      if (healthPct < 0.7) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plat.x + 10, plat.y + 10);
        ctx.lineTo(plat.x + plat.width - 20, plat.y + plat.height - 10);
        ctx.stroke();
      }
    } else {
      // Default sleek metal high-contrast platforms
      ctx.fillStyle = "#334155";
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
    }

    ctx.restore();
  };

  // Draw portals visual indicators
  const drawPortalHole = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 4, x, y, 16);
    grad.addColorStop(0, "black");
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };

  // --- FLOOPY STICKMAN GRAPHICS DRAWER ---
  const drawPlayerStickman = (ctx: CanvasRenderingContext2D, p: GamePlayerState) => {
    const l = p.limbs;
    const colors = p.config.colors;
    
    ctx.save();
    
    // Draw subtle freeze block ice block
    if (p.freezeTimer > 0) {
      ctx.fillStyle = "rgba(186, 230, 253, 0.65)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.fillRect(p.x - 22, p.y - 56, 44, 58);
      ctx.strokeRect(p.x - 22, p.y - 56, 44, 58);
    }

    ctx.lineWidth = colors.outlineWidth + 3.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = colors.outline;

    const drawLine = (x1: number, y1: number, x2: number, y2: number, strokeColor: string) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      // outer outline stroke
      ctx.strokeStyle = colors.outline;
      ctx.lineWidth = colors.outlineWidth + 4.5;
      ctx.stroke();
      
      // inner color fill
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4.0;
      ctx.stroke();
    };

    // 1. Draw Legs
    drawLine(l.chest.x, l.chest.y + 15, l.legLeft1.x, l.legLeft1.y, colors.legLeft1);
    drawLine(l.legLeft1.x, l.legLeft1.y, l.legLeft2.x, l.legLeft2.y, colors.legLeft2);
    
    drawLine(l.chest.x, l.chest.y + 15, l.legRight1.x, l.legRight1.y, colors.legRight1);
    drawLine(l.legRight1.x, l.legRight1.y, l.legRight2.x, l.legRight2.y, colors.legRight2);

    // 2. Torso spine
    drawLine(l.chest.x, l.chest.y, l.chest.x, l.chest.y + 16, colors.chest);

    // 3. Draw Arms
    drawLine(l.chest.x, l.chest.y, l.armLeft1.x, l.armLeft1.y, colors.armLeft1);
    drawLine(l.armLeft1.x, l.armLeft1.y, l.armLeft2.x, l.armLeft2.y, colors.armLeft2);

    drawLine(l.chest.x, l.chest.y, l.armRight1.x, l.armRight1.y, colors.armRight1);
    drawLine(l.armRight1.x, l.armRight1.y, l.armRight2.x, l.armRight2.y, colors.armRight2);

    // 4. Draw head circle
    ctx.fillStyle = colors.head;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = colors.outlineWidth;
    ctx.beginPath();
    ctx.arc(l.head.x, l.head.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Draw weapon currently equipped
    if (p.currentWeapon && !p.isDead) {
      ctx.save();
      ctx.translate(l.armLeft2.x, l.armLeft2.y);
      ctx.rotate(p.aimAngle);
      
      // Draw actual weapon custom sprite lines
      ctx.fillStyle = p.currentWeapon.template.color;
      ctx.fillRect(0, -3, 24, 6);
      
      // Draw ammo count bar above weapon
      if (p.currentWeapon.ammo !== -1) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, -12, 18, 3);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(0, -12, 18 * (p.currentWeapon.ammo / p.currentWeapon.template.ammoMax), 3);
      }
      ctx.restore();
    }

    // 6. Draw Custom famous Anime and Marvel hat overlay on head!
    if (p.config.hat !== "none") {
      drawFamousHat(ctx, p.config.hat, l.head.x, l.head.y, p.facingLeft);
    }

    ctx.restore();
  };

  // Dynamic vector drawing for all 25 custom character head styles!
  const drawFamousHat = (ctx: CanvasRenderingContext2D, hatId: string, hx: number, hy: number, facingLeft: boolean) => {
    ctx.save();
    const config = HATS.find(h => h.id === hatId);
    if (!config) return;

    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 1.5;

    if (hatId === "ironman") {
      // Iron Man Helmet plate
      ctx.beginPath();
      ctx.arc(hx, hy - 2, 9, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Gold faceplate mask
      ctx.fillStyle = config.accentColor;
      ctx.fillRect(hx - (facingLeft ? 7 : 1), hy - 4, 8, 8);
      
      // Glowing cyan eyes
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(hx - (facingLeft ? 5 : -2), hy - 2, 3, 1.5);
    } else if (hatId === "spiderman") {
      // Red mask details
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 0.5;
      // web line
      ctx.beginPath();
      ctx.moveTo(hx - 8, hy); ctx.lineTo(hx + 8, hy);
      ctx.moveTo(hx, hy - 8); ctx.lineTo(hx, hy + 8);
      ctx.stroke();

      // Slanted white eyes with black border
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (facingLeft) {
        ctx.moveTo(hx - 6, hy - 3); ctx.lineTo(hx - 1, hy - 1); ctx.lineTo(hx - 5, hy + 2);
      } else {
        ctx.moveTo(hx + 1, hy - 3); ctx.lineTo(hx + 6, hy - 1); ctx.lineTo(hx + 2, hy + 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hatId === "goku") {
      // Big spiky orange saiyan hair!
      ctx.fillStyle = "#ed8936";
      ctx.beginPath();
      ctx.moveTo(hx - 12, hy - 4);
      ctx.lineTo(hx - 18, hy - 12);
      ctx.lineTo(hx - 8, hy - 10);
      ctx.lineTo(hx - 6, hy - 22); // center spike
      ctx.lineTo(hx, hy - 14);
      ctx.lineTo(hx + 8, hy - 20); // right spikes
      ctx.lineTo(hx + 10, hy - 8);
      ctx.lineTo(hx + 16, hy - 4);
      ctx.lineTo(hx + 6, hy);
      ctx.lineTo(hx - 6, hy);
      ctx.closePath();
      ctx.fill();
    } else if (hatId === "naruto") {
      // Yellow spiky ninja hair with Leaf village forehead band!
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(hx - 10, hy - 6);
      ctx.lineTo(hx - 14, hy - 16);
      ctx.lineTo(hx - 6, hy - 14);
      ctx.lineTo(hx, hy - 24);
      ctx.lineTo(hx + 6, hy - 14);
      ctx.lineTo(hx + 14, hy - 16);
      ctx.lineTo(hx + 10, hy - 6);
      ctx.closePath();
      ctx.fill();

      // Forehead dark metal protector band
      ctx.fillStyle = "#475569";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.fillRect(hx - 7, hy - 5, 14, 4);
    } else if (hatId === "luffy") {
      // Yellow wide Straw hat with red ribbon!
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.ellipse(hx, hy - 7, 15, 4, 0, 0, Math.PI*2);
      ctx.fill();

      // Crown cap
      ctx.beginPath();
      ctx.arc(hx, hy - 7, 8, Math.PI, 0);
      ctx.fill();

      // Red ribbon band
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(hx - 7, hy - 10, 14, 3);
    } else if (hatId === "captainamerica") {
      // Blue cap with white wing flares and letter A
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath();
      ctx.arc(hx, hy - 3, 9, Math.PI, 0);
      ctx.fill();
      // White Wing
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(hx + (facingLeft ? 5 : -7), hy - 6, 2, 4);
    } else if (hatId === "thor") {
      // Viking winged helmet
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(hx, hy - 4, 9, Math.PI, 0);
      ctx.fill();
      // Wings extending up
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(hx - 7, hy - 6); ctx.lineTo(hx - 12, hy - 15); ctx.lineTo(hx - 5, hy - 10);
      ctx.moveTo(hx + 7, hy - 6); ctx.lineTo(hx + 12, hy - 15); ctx.lineTo(hx + 5, hy - 10);
      ctx.fill();
    } else if (hatId === "hulk") {
      // Spiky black-green hair
      ctx.fillStyle = "#14532d";
      ctx.beginPath();
      ctx.moveTo(hx - 10, hy - 5);
      ctx.lineTo(hx - 12, hy - 12);
      ctx.lineTo(hx - 4, hy - 10);
      ctx.lineTo(hx, hy - 14);
      ctx.lineTo(hx + 4, hy - 10);
      ctx.lineTo(hx + 12, hy - 12);
      ctx.lineTo(hx + 10, hy - 5);
      ctx.closePath();
      ctx.fill();
    } else if (hatId === "batman") {
      // Black Cowl with long pointy ears!
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(hx, hy - 3, 9, Math.PI, 0);
      ctx.fill();

      // Ears
      ctx.beginPath();
      ctx.moveTo(hx - 8, hy - 6); ctx.lineTo(hx - 10, hy - 16); ctx.lineTo(hx - 4, hy - 8);
      ctx.moveTo(hx + 8, hy - 6); ctx.lineTo(hx + 10, hy - 16); ctx.lineTo(hx + 4, hy - 8);
      ctx.fill();
    } else if (hatId === "pikachu") {
      // Yellow ears with black tips
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      // Left ear
      ctx.moveTo(hx - 4, hy - 8); ctx.lineTo(hx - 12, hy - 18); ctx.lineTo(hx - 1, hy - 10);
      // Right ear
      ctx.moveTo(hx + 4, hy - 8); ctx.lineTo(hx + 12, hy - 18); ctx.lineTo(hx + 1, hy - 10);
      ctx.fill();

      // Black tips
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(hx - 10, hy - 15); ctx.lineTo(hx - 12, hy - 18); ctx.lineTo(hx - 7, hy - 15);
      ctx.moveTo(hx + 10, hy - 15); ctx.lineTo(hx + 12, hy - 18); ctx.lineTo(hx + 7, hy - 15);
      ctx.fill();
    } else if (hatId === "mario") {
      // Red cap with white emblem visor
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(hx, hy - 5, 9, Math.PI, 0);
      ctx.fill();

      // Visor bill
      ctx.fillRect(hx - (facingLeft ? 12 : 2), hy - 7, 14, 3);
      
      // White emblem circle
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(hx, hy - 9, 3, 0, Math.PI*2);
      ctx.fill();
    } else if (hatId === "link") {
      // Long green floppy elf cap
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.moveTo(hx - 8, hy - 5);
      ctx.lineTo(hx, hy - 18);
      ctx.lineTo(hx + 10, hy - 14); // flopping down tail
      ctx.lineTo(hx + 16, hy - 8);
      ctx.lineTo(hx + 8, hy - 5);
      ctx.closePath();
      ctx.fill();
    } else if (hatId === "shrek") {
      // Green ogre horn ears
      ctx.fillStyle = "#84cc16";
      ctx.fillRect(hx - 12, hy - 8, 4, 3);
      ctx.fillRect(hx + 8, hy - 8, 4, 3);
    } else {
      // General fallbacks
      ctx.beginPath();
      ctx.arc(hx, hy - 9, 4, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-950 items-center justify-center p-4 min-h-[90vh]">
      
      {/* Top Header Score Board & Settings Panel */}
      <div className="flex w-full max-w-[1280px] bg-slate-900 border border-slate-800 rounded-t-xl p-3 items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button 
            id="back_to_menu_btn"
            onClick={onBackToMenu}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-1.5 px-3 rounded-lg border border-slate-700 transition"
          >
            <ArrowLeft size={16} /> Exit Game
          </button>
          
          <div className="h-6 w-[1px] bg-slate-700" />
          
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Map</span>
            <span className="text-sm text-sky-400 font-bold">{selectedMap.name}</span>
          </div>
        </div>

        {/* Local Keyboard Controls Guide popover toggle */}
        <div className="flex gap-2">
          <button
            id="toggle_controls_guide_btn"
            onClick={() => setShowControlsGuide(!showControlsGuide)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3 rounded-lg border border-slate-700 flex items-center gap-1 transition"
          >
            <HelpCircle size={16} /> Keyboard Controls
          </button>

          <button
            id="sound_toggle_btn"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSynthSound("pickup");
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg border border-slate-700 transition"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Sandbox Canvas & Overlays Container */}
      <div className="relative w-full max-w-[1280px] h-[600px] border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl bg-slate-900">
        
        {/* Dynamic HTML5 Canvas */}
        <canvas
          id="physics_game_canvas"
          ref={canvasRef}
          width={1280}
          height={600}
          className="w-full h-full block bg-slate-900"
        />

        {/* Scoreboard List HUD bar */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
          {gamePlayersRef.current.map(gp => (
            <div 
              key={gp.config.id} 
              className={`flex items-center gap-2 bg-slate-950/80 backdrop-blur border px-3 py-1.5 rounded-lg text-xs font-mono font-bold shadow-lg ${gp.isDead ? 'opacity-40 border-slate-800' : 'border-slate-700'}`}
              style={{ color: gp.config.color }}
            >
              <div 
                className="w-3 h-3 rounded-full border border-white/20" 
                style={{ backgroundColor: gp.config.color }} 
              />
              <span>{gp.config.name}</span>
              <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded ml-1">
                Score: {scoreBoard[gp.config.id] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Target score cap tracker */}
        <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur border border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 pointer-events-none">
          🎯 Target to Win: <span className="font-bold text-white">{targetScore} Wins</span>
        </div>

        {/* Round Over overlay state banner */}
        {roundWinnerName && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
            <Swords className="text-rose-500 animate-bounce mb-3" size={48} />
            <h2 className="text-4xl font-extrabold text-white tracking-wide uppercase">
              Round Complete!
            </h2>
            <p className="text-xl text-sky-400 font-semibold mt-2">
              🏆 {roundWinnerName} Wins the Round!
            </p>
            <p className="text-xs text-slate-400 mt-4 animate-pulse">
              Starting next round shortly...
            </p>
          </div>
        )}

        {/* Match Completed Confetti Championship board */}
        {matchWinnerName && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <Award className="text-amber-400 mb-4 animate-pulse" size={80} />
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wider uppercase">
              Championship Winner!
            </h1>
            <p className="text-2xl font-bold text-white mt-4">
              👑 {matchWinnerName} is the Ultimate Champion!
            </p>

            <div className="flex gap-4 mt-8 pointer-events-auto">
              <button
                id="play_again_btn"
                onClick={() => initRound(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-lg py-3 px-8 rounded-xl shadow-lg shadow-emerald-950 transition transform hover:scale-105"
              >
                <RotateCcw size={20} /> Restart Match
              </button>
              <button
                id="menu_return_btn"
                onClick={onBackToMenu}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl border border-slate-700 transition"
              >
                Return to Customizer
              </button>
            </div>
          </div>
        )}

        {/* Controls Guide Modal Overlay */}
        {showControlsGuide && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur overflow-y-auto p-6 pointer-events-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="text-sky-400" /> Active Players Keybindings Custom Map
              </h3>
              <button 
                id="close_controls_guide_btn"
                onClick={() => setShowControlsGuide(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeConfigs.map(gp => (
                <div key={gp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gp.color }} />
                    <span className="font-extrabold text-white">{gp.name}</span>
                    <span className="text-xs text-slate-500 ml-auto font-mono uppercase">({gp.type})</span>
                  </div>
                  
                  {gp.type === "human" ? (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="text-slate-400">Move Left:</div>
                      <div className="text-sky-400 font-bold uppercase">{gp.controls.left}</div>
                      
                      <div className="text-slate-400">Move Right:</div>
                      <div className="text-sky-400 font-bold uppercase">{gp.controls.right}</div>
                      
                      <div className="text-slate-400">Jump / Climb:</div>
                      <div className="text-sky-400 font-bold uppercase">{gp.controls.jump}</div>
                      
                      <div className="text-slate-400">Drop Pass-thru:</div>
                      <div className="text-sky-400 font-bold uppercase">{gp.controls.down}</div>
                      
                      <div className="text-slate-400">Attack / Shoot:</div>
                      <div className="text-rose-400 font-bold uppercase">{gp.controls.attack}</div>
                      
                      <div className="text-slate-400">Pick / Throw:</div>
                      <div className="text-amber-400 font-bold uppercase">{gp.controls.throw}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic py-6 text-center">
                      🤖 Controlled by Artificial Intelligence
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500 flex flex-col gap-1 max-w-2xl">
              <p>📌 <strong className="text-slate-300">Auto-Aim Assistance:</strong> Bullets automatically lock on to target the nearest visible enemy character, making fighting fast-paced and snappy for multiple local keyboard players.</p>
              <p>📌 <strong className="text-slate-300">Interactive Portals:</strong> Place Blue and Orange portals on solid walls using the Aperture Portal Gun, then teleport yourself or dynamic throwable crates between them with conservation of physical momentum.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
