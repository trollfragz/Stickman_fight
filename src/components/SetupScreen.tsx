/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PlayerConfig, MapConfig, CustomColors, HatId } from "../types";
import { HATS, MAPS, PRESET_COLORS, DEFAULT_PLAYERS, WEAPONS } from "../data";
import { House, ChevronLeft, ChevronRight, Coins, Lock, Check, Sparkles, AlertCircle } from "lucide-react";

interface SetupScreenProps {
  onStartGame: (configs: PlayerConfig[], map: MapConfig, targetScore: number) => void;
}

// Custom live vector preview drawing helper component for Stickman customization
function CustomStickmanPreview({ 
  colors, 
  hat, 
  weapon, 
  facingLeft 
}: { 
  colors: CustomColors; 
  hat: string; 
  weapon?: string; 
  facingLeft: boolean 
}) {
  // Classic ragdoll open bent-legs stance like the screenshot!
  const head = { x: 100, y: 55 };
  const chest = { x: 100, y: 80 };
  const waist = { x: 100, y: 110 };
  
  // Left arm bent floppy
  const handL = { x: 62, y: 105 };
  const elbowL = { x: 74, y: 92 };
  
  // Right arm bent floppy
  const handR = { x: 138, y: 105 };
  const elbowR = { x: 126, y: 92 };
  
  // Wide open bent legs exactly like the original screenshot stickmen stance!
  const footL = { x: 76, y: 165 };
  const kneeL = { x: 66, y: 138 };
  
  const footR = { x: 124, y: 165 };
  const kneeR = { x: 134, y: 138 };

  const outlineColor = colors.outline || "#000000";
  const strokeW = 7;
  const outlineW = 12;

  const drawSegment = (x1: number, y1: number, x2: number, y2: number, color: string) => (
    <g>
      {/* Outer black silhouette outline */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={outlineColor} strokeWidth={outlineW} strokeLinecap="round" />
      {/* Inner vibrant body color */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
    </g>
  );

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 185" className="drop-shadow-2xl filter hover:scale-105 transition-transform duration-300">
      {/* 1. Left leg pieces */}
      {drawSegment(waist.x, waist.y, kneeL.x, kneeL.y, colors.legLeft1)}
      {drawSegment(kneeL.x, kneeL.y, footL.x, footL.y, colors.legLeft2)}

      {/* 2. Right leg pieces */}
      {drawSegment(waist.x, waist.y, kneeR.x, kneeR.y, colors.legRight1)}
      {drawSegment(kneeR.x, kneeR.y, footR.x, footR.y, colors.legRight2)}

      {/* 3. Core Spinal column */}
      {drawSegment(chest.x, chest.y, waist.x, waist.y, colors.chest)}

      {/* 4. Left Arm */}
      {drawSegment(chest.x, chest.y, elbowL.x, elbowL.y, colors.armLeft1)}
      {drawSegment(elbowL.x, elbowL.y, handL.x, handL.y, colors.armLeft2)}

      {/* 5. Right Arm */}
      {drawSegment(chest.x, chest.y, elbowR.x, elbowR.y, colors.armRight1)}
      {drawSegment(elbowR.x, elbowR.y, handR.x, handR.y, colors.armRight2)}

      {/* 6. Rounded Head Ball */}
      <circle cx={head.x} cy={head.y} r={14} stroke={outlineColor} strokeWidth={4.5} fill={colors.head} />

      {/* 7. Equipped Weapon Graphic */}
      {weapon && weapon !== "none" && (
        <g transform={`translate(${facingLeft ? handL.x : handR.x}, ${facingLeft ? handL.y : handR.y}) rotate(${facingLeft ? -135 : 45})`}>
          {/* Neon Lightsaber */}
          {weapon === "lightsaber" && (
            <g>
              <rect x={-2.5} y={-4} width={5} height={10} fill="#64748b" rx={1} stroke="#000000" strokeWidth={1} />
              <rect x={-2} y={-32} width={4} height={28} fill="#38bdf8" rx={1} className="animate-pulse" filter="drop-shadow(0 0 6px #0ea5e9)" />
            </g>
          )}
          {/* Crimson Katana */}
          {weapon === "katana" && (
            <g>
              <rect x={-1.5} y={-4} width={3} height={10} fill="#1a202c" rx={0.5} />
              <path d="M-1.5,-4 L-1.5,-30 C-1.5,-30 2,-25 2,-4 Z" fill="#ef4444" stroke="#000000" strokeWidth={0.5} />
            </g>
          )}
          {/* Heavy Hammer */}
          {weapon === "hammer" && (
            <g>
              <rect x={-2} y={-4} width={4} height={24} fill="#78350f" stroke="#000000" strokeWidth={0.5} />
              <rect x={-10} y={-16} width={20} height={12} fill="#94a3b8" rx={2} stroke="#334155" strokeWidth={1.5} />
            </g>
          )}
          {/* Golden Spear */}
          {weapon === "spear" && (
            <g>
              <rect x={-1.5} y={-25} width={3} height={50} fill="#ca8a04" stroke="#000000" strokeWidth={0.5} />
              <path d="M-5,-25 L0,-38 L5,-25 L1.5,-18 L-1.5,-18 Z" fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
            </g>
          )}
          {/* Shield */}
          {weapon === "shield" && (
            <g transform="translate(0, -5)">
              <circle cx={0} cy={0} r={16} fill="#ef4444" stroke="#000000" strokeWidth={1.5} />
              <circle cx={0} cy={0} r={11} fill="#ffffff" />
              <circle cx={0} cy={0} r={7} fill="#2563eb" />
              <polygon points="0,-4 1,-1 4,-1 2,1 3,4 0,2 -3,4 -2,1 -4,-1 -1,-1" fill="#ffffff" />
            </g>
          )}
          {/* Boxing Gloves */}
          {weapon === "boxing" && (
            <g transform="translate(0, -2)">
              <rect x={-6} y={-8} width={12} height={12} fill="#dc2626" rx={4} stroke="#000000" strokeWidth={1.5} />
              <rect x={-4} y={-2} width={8} height={4} fill="#ef4444" rx={1} />
            </g>
          )}
          {/* Default/Other firearm pistol */}
          {weapon !== "lightsaber" && weapon !== "katana" && weapon !== "hammer" && weapon !== "spear" && weapon !== "shield" && weapon !== "boxing" && (
            <g transform="translate(0, -2)">
              <rect x={-3} y={-8} width={6} height={14} fill="#475569" rx={1} stroke="#000000" strokeWidth={1} />
              <rect x={-2.5} y={-8} width={14} height={5} fill="#1e293b" rx={1} />
              <rect x={1} y={-10} width={2} height={2} fill="#ef4444" />
            </g>
          )}
        </g>
      )}

      {/* 8. Famous Custom Hat Layer */}
      {hat !== "none" && (
        <g transform={`translate(${head.x}, ${head.y}) scale(1.35)`}>
          {/* Iron Man Helmet */}
          {hat === "ironman" && (
            <g>
              <path d="M-9,2 C-9,-10 9,-10 9,2 L9,5 L-9,5 Z" fill="#e53e3e" stroke="#000000" strokeWidth={1} />
              <path d="M-6,0 L6,0 L4,4 L-4,4 Z" fill="#ecc94b" stroke="#000000" strokeWidth={0.5} />
              <rect x={-4} y={1} width={2.5} height={1} fill="#22d3ee" />
              <rect x={1.5} y={1} width={2.5} height={1} fill="#22d3ee" />
            </g>
          )}
          {/* Spiderman Mask */}
          {hat === "spiderman" && (
            <g>
              <path d="M-9,2 C-9,-10 9,-10 9,2 L9,5 L-9,5 Z" fill="#e53e3e" stroke="#000000" strokeWidth={1} />
              <line x1={-9} y1={-2} x2={9} y2={-2} stroke="#000000" strokeWidth={0.5} />
              <line x1={0} y1={-9} x2={0} y2={5} stroke="#000000" strokeWidth={0.5} />
              <path d="M-5,-2 L-2,-2 L-4,1 Z" fill="#ffffff" stroke="#000000" strokeWidth={0.5} />
              <path d="M5,-2 L2,-2 L4,1 Z" fill="#ffffff" stroke="#000000" strokeWidth={0.5} />
            </g>
          )}
          {/* Captain America Helmet */}
          {hat === "captainamerica" && (
            <g>
              <path d="M-9,2 C-9,-10 9,-10 9,2 L9,5 L-9,5 Z" fill="#2563eb" stroke="#ffffff" strokeWidth={1} />
              <text x={0} y={-1} fill="#ffffff" fontSize={7} fontWeight="black" textAnchor="middle" fontFamily="sans-serif">A</text>
            </g>
          )}
          {/* Naruto Ninja Hair */}
          {hat === "naruto" && (
            <g>
              <path d="M-10,0 L-14,-12 L-6,-10 L0,-18 L6,-10 L14,-12 L10,0 Z" fill="#facc15" stroke="#000000" strokeWidth={1} />
              <rect x={-7} y={-1} width={14} height={3} fill="#475569" stroke="#ffffff" strokeWidth={0.5} />
            </g>
          )}
          {/* Goku Saiyan Hair */}
          {hat === "goku" && (
            <path d="M-11,2 L-16,-8 L-8,-6 L-6,-18 L0,-12 L8,-16 L10,-5 L15,-1 L6,4 L-6,4 Z" fill="#f97316" stroke="#000000" strokeWidth={1} />
          )}
          {/* Luffy Straw Hat */}
          {hat === "luffy" && (
            <g>
              <ellipse cx={0} cy={-2} rx={14} ry={4} fill="#fbbf24" stroke="#78350f" strokeWidth={1} />
              <path d="M-8,-2 A8,8 0 0,1 8,-2" fill="#fbbf24" stroke="#78350f" strokeWidth={1} />
              <rect x={-8} y={-3} width={16} height={2} fill="#ef4444" />
            </g>
          )}
          {/* Pikachu Ears */}
          {hat === "pikachu" && (
            <g>
              <path d="M-6,-4 L-12,-16 L-4,-8 Z" fill="#facc15" stroke="#000000" strokeWidth={1} />
              <path d="M-12,-16 L-9,-12 L-10,-14 Z" fill="#000000" />
              <path d="M6,-4 L12,-16 L4,-8 Z" fill="#facc15" stroke="#000000" strokeWidth={1} />
              <path d="M12,-16 L9,-12 L10,-14 Z" fill="#000000" />
            </g>
          )}
          {/* Default crown fallback */}
          {hat !== "ironman" && hat !== "spiderman" && hat !== "captainamerica" && hat !== "naruto" && hat !== "goku" && hat !== "luffy" && hat !== "pikachu" && (
            <g>
              <path d="M-8,-6 L-4,-2 L0,-8 L4,-2 L8,-6 L6,2 L-6,2 Z" fill="#facc15" stroke="#ca8a04" strokeWidth={1} />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

// Custom weapon vector illustrations for customization menu cards
function WeaponVectorGraphic({ weaponId, color }: { weaponId: string; color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="drop-shadow-md">
      <g transform="translate(24, 24)">
        {weaponId === "lightsaber" && (
          <g transform="rotate(45)">
            <rect x={-2.5} y={-4} width={5} height={10} fill="#64748b" rx={1} stroke="#000000" strokeWidth={0.5} />
            <rect x={-2} y={-24} width={4} height={20} fill="#06b6d4" rx={1} filter="drop-shadow(0 0 3px #0ea5e9)" />
          </g>
        )}
        {weaponId === "katana" && (
          <g transform="rotate(45)">
            <rect x={-1.5} y={-4} width={3} height={10} fill="#1e293b" />
            <path d="M-1.5,-4 L-1.5,-22 C-1.5,-22 2,-18 2,-4 Z" fill="#ef4444" stroke="#000000" strokeWidth={0.5} />
          </g>
        )}
        {weaponId === "hammer" && (
          <g transform="rotate(45)">
            <rect x={-2} y={-4} width={4} height={18} fill="#78350f" stroke="#000000" strokeWidth={0.5} />
            <rect x={-8} y={-14} width={16} height={10} fill="#94a3b8" rx={2.5} stroke="#334155" strokeWidth={1} />
          </g>
        )}
        {weaponId === "spear" && (
          <g transform="rotate(45)">
            <rect x={-1.5} y={-20} width={3} height={40} fill="#ca8a04" />
            <path d="M-4,-20 L0,-32 L4,-20 Z" fill="#fbbf24" stroke="#d97706" strokeWidth={0.5} />
          </g>
        )}
        {weaponId === "shield" && (
          <g>
            <circle cx={0} cy={0} r={14} fill="#dc2626" stroke="#000000" strokeWidth={1} />
            <circle cx={0} cy={0} r={10} fill="#ffffff" />
            <circle cx={0} cy={0} r={6} fill="#2563eb" />
            <polygon points="0,-3 1,-1 3,-1 1,0 2,3 0,1 -2,3 -1,0 -3,-1 -1,-1" fill="#ffffff" />
          </g>
        )}
        {weaponId === "boxing" && (
          <g>
            <rect x={-7} y={-8} width={14} height={14} fill="#dc2626" rx={5} stroke="#000000" strokeWidth={1} />
            <rect x={-5} y={-2} width={10} height={4} fill="#ef4444" rx={1} />
          </g>
        )}
        {/* Pistol / Firearms */}
        {weaponId !== "lightsaber" && weaponId !== "katana" && weaponId !== "hammer" && weaponId !== "spear" && weaponId !== "shield" && weaponId !== "boxing" && (
          <g transform="translate(-4, 2)">
            <rect x={-2} y={-6} width={5} height={12} fill="#475569" rx={1} stroke="#000000" strokeWidth={0.5} />
            <rect x={-2} y={-6} width={12} height={4} fill="#1e293b" rx={1} />
            <rect x={6} y={-8} width={2} height={2} fill={color || "#eab308"} />
          </g>
        )}
      </g>
    </svg>
  );
}

export default function SetupScreen({ onStartGame }: SetupScreenProps) {
  // Loading Screen simulation state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>("COMPILING STICKMAN RAGDOLL SYSTEM...");

  // Active slot index switcher (Cycles between 0: Slot 1-2, 1: Slot 3-4, 2: Slot 5-6)
  const [pairIndex, setPairIndex] = useState<number>(0);

  const [players, setPlayers] = useState<PlayerConfig[]>(() => {
    const saved = localStorage.getItem("stickman_clash_players");
    return saved ? JSON.parse(saved) : DEFAULT_PLAYERS;
  });

  const [selectedMapId, setSelectedMapId] = useState<string>("classic");
  const [targetScore, setTargetScore] = useState<number>(5);

  // Persistent Customizer Unlocks & Coins Shop
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem("stickman_clash_coins");
    return saved ? parseInt(saved) : 500; // default 500 gold coins
  });

  const [unlockedHats, setUnlockedHats] = useState<string[]>(() => {
    const saved = localStorage.getItem("stickman_clash_unlocked_hats");
    // Start with 4 default unlocked hats, rest locked in shop!
    return saved ? JSON.parse(saved) : ["none", "ironman", "spiderman", "captainamerica"];
  });

  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(() => {
    const saved = localStorage.getItem("stickman_clash_unlocked_weapons");
    // Start with 4 default unlocked weapons, rest locked!
    return saved ? JSON.parse(saved) : ["none", "lightsaber", "katana", "boxing", "pistol"];
  });

  // Sidebar Cust Drawer State
  const [activeCustomizer, setActiveCustomizer] = useState<{
    pId: number;
    tab: "weapon" | "head" | "color1" | "color2";
  } | null>(null);

  // Loading Screen simulation
  useEffect(() => {
    const loadingTexts = [
      "LOADING STICKMAN CLASH PC ASSETS...",
      "PARSING HIGH-FIDELITY WEAPON TEXTURES...",
      "GENERATING ANIME & MARVEL CAP GEOMETRIES...",
      "SOLVING FLOOPY RAGDOLL SKETCH INNERS...",
      "LOADING DYNAMIC PHYSICS MAP CRATES...",
      "PREPARING LOCAL ARENA BRICKS..."
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 300);
      }
      setLoadingProgress(progress);
      
      // Update text occasionally
      const textIdx = Math.min(Math.floor((progress / 100) * loadingTexts.length), loadingTexts.length - 1);
      setLoadingText(loadingTexts[textIdx]);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Save configs and coins shop to localStorage
  useEffect(() => {
    localStorage.setItem("stickman_clash_players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("stickman_clash_coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("stickman_clash_unlocked_hats", JSON.stringify(unlockedHats));
  }, [unlockedHats]);

  useEffect(() => {
    localStorage.setItem("stickman_clash_unlocked_weapons", JSON.stringify(unlockedWeapons));
  }, [unlockedWeapons]);

  // Handler to purchase/unlock items
  const handleUnlockItem = (type: "hat" | "weapon", id: string, cost: number) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      if (type === "hat") {
        setUnlockedHats(prev => [...prev, id]);
      } else {
        setUnlockedWeapons(prev => [...prev, id]);
      }
    } else {
      alert("⚠️ Coins khatam ho gaye! 'GET FREE COINS' button dabao extra 🪙 200 ke liye!");
    }
  };

  // Preset Colors Apply
  const applyColorPreset = (pId: number, preset: typeof PRESET_COLORS[0]) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === pId) {
        return {
          ...p,
          color: preset.main,
          colors: {
            ...p.colors,
            head: preset.main,
            chest: preset.main,
            armLeft1: preset.main,
            armLeft2: preset.alt,
            armRight1: preset.main,
            armRight2: preset.alt,
            legLeft1: preset.main,
            legLeft2: preset.alt,
            legRight1: preset.main,
            legRight2: preset.alt,
            outline: preset.outline
          }
        };
      }
      return p;
    }));
  };

  const updateIndividualColor = (pId: number, limb: keyof CustomColors, color: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === pId) {
        return {
          ...p,
          colors: {
            ...p.colors,
            [limb]: color
          }
        };
      }
      return p;
    }));
  };

  const setStartingWeapon = (pId: number, weaponId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === pId) {
        return { ...p, startingWeapon: weaponId };
      }
      return p;
    }));
  };

  const setHat = (pId: number, hatId: HatId) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === pId) {
        return { ...p, hat: hatId };
      }
      return p;
    }));
  };

  const updateSlotType = (pId: number, type: PlayerConfig["type"]) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === pId) {
        let name = p.name;
        if (p.name === "None" || p.name.includes("Player") || p.name.includes("CPU")) {
          if (type === "human") name = `Player ${pId}`;
          else if (type !== "none") name = `CPU ${pId}`;
          else name = "None";
        }
        return { ...p, type, name };
      }
      return p;
    }));
  };

  const handleStartGame = () => {
    const activeOnes = players.filter(p => p.type !== "none");
    if (activeOnes.length < 2) {
      alert("⚠️ Fight start karne ke liye kam-se-kam 2 active players chahiye (Human ya CPU bot select karo)!");
      return;
    }
    const map = MAPS.find(m => m.id === selectedMapId) || MAPS[0];
    onStartGame(activeOnes, map, targetScore);
  };

  // Left and Right slot numbers based on cycle pairIndex
  const leftId = pairIndex * 2 + 1;
  const rightId = pairIndex * 2 + 2;

  const leftPlayer = players.find(p => p.id === leftId)!;
  const rightPlayer = players.find(p => p.id === rightId)!;

  // Next and Prev Map handlers
  const handleNextMap = () => {
    const currentIdx = MAPS.findIndex(m => m.id === selectedMapId);
    const nextIdx = (currentIdx + 1) % MAPS.length;
    setSelectedMapId(MAPS[nextIdx].id);
  };

  const handlePrevMap = () => {
    const currentIdx = MAPS.findIndex(m => m.id === selectedMapId);
    const prevIdx = (currentIdx - 1 + MAPS.length) % MAPS.length;
    setSelectedMapId(MAPS[prevIdx].id);
  };

  const selectedMap = MAPS.find(m => m.id === selectedMapId) || MAPS[0];

  // Colors available in the squares color palette shop
  const PALETTE_COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#06b6d4",
    "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
    "#1e293b", "#ffffff", "#000000", "#475569", "#cbd5e1"
  ];

  if (isLoading) {
    return (
      <div id="loading_screen" className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
        <div className="flex flex-col items-center max-w-md w-full text-center">
          {/* Neon spinning logo placeholder */}
          <div className="w-20 h-20 rounded-full border-4 border-sky-400 border-t-transparent animate-spin mb-8 shadow-[0_0_20px_rgba(56,189,248,0.4)]" />
          
          <h2 className="text-xl md:text-2xl font-black tracking-widest text-sky-400 animate-pulse uppercase mb-2">
            STICKMAN CLASH PC
          </h2>
          <p className="text-xs text-slate-500 mb-6 font-semibold">INITIALIZING GAME ENGINE ASSETS</p>
          
          {/* Progress Bar Container */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-5 overflow-hidden p-1 mb-3">
            <div 
              className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <div className="flex justify-between w-full text-xs font-bold text-slate-400 font-mono">
            <span className="truncate max-w-[80%] text-left">{loadingText}</span>
            <span>{loadingProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#0c4a6e] text-white select-none overflow-x-hidden flex flex-col justify-between p-4 md:p-6 font-sans">
      
      {/* Decorative slash lines background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto z-10 mb-4">
        {/* Home Reset Icon */}
        <button 
          id="home_reset_btn"
          onClick={() => {
            setIsLoading(true);
            setLoadingProgress(0);
          }}
          className="w-12 h-12 flex items-center justify-center bg-sky-950/50 border-2 border-sky-400/30 rounded-2xl hover:bg-sky-400 hover:text-sky-950 hover:border-sky-400 transition-all duration-200 active:scale-95 shadow-lg"
          title="Reset & Load"
        >
          <House size={22} />
        </button>

        {/* Title Logo banner */}
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300">
            Stickman Clash
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-sky-200 uppercase tracking-widest mt-0.5">
            Floppy Fighter Customizer Menu
          </p>
        </div>

        {/* Gold Wallet Persistent counter */}
        <div className="flex items-center gap-2 bg-sky-950/60 border-2 border-amber-400/40 px-4 py-2 rounded-2xl shadow-md">
          <Coins size={18} className="text-amber-400 animate-bounce" />
          <span className="text-sm md:text-base font-black font-mono text-amber-300">🪙 {coins}</span>
          <button
            id="free_coins_btn"
            onClick={() => setCoins(prev => prev + 200)}
            className="ml-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-[10px] font-black rounded-lg uppercase tracking-tight active:scale-95 shadow border border-amber-300/30 text-white"
          >
            + Free
          </button>
        </div>
      </div>

      {/* Main Grid: Left Customizer | Center Map/Buttons | Right Customizer */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center justify-center flex-1 z-10">
        
        {/* ================= LEFT CUSTOMIZER PANEL ================= */}
        <div className="lg:col-span-5 bg-sky-950/40 border border-sky-400/20 rounded-3xl p-5 shadow-2xl relative flex flex-col items-center justify-between min-h-[380px] w-full">
          
          {/* Header customizer caps style */}
          <div className="w-full flex justify-center mb-2">
            <div className="bg-sky-950/80 border border-sky-400/40 rounded-full px-5 py-1 flex items-center shadow-md">
              <span className="text-xs font-black uppercase text-sky-300 mr-2">Player {leftPlayer.id}</span>
              <select
                id={`type_select_left`}
                value={leftPlayer.type}
                onChange={(e) => updateSlotType(leftPlayer.id, e.target.value as any)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer uppercase border-none py-0.5"
              >
                <option value="none" className="bg-sky-950">None</option>
                <option value="human" className="bg-sky-950">Player</option>
                <option value="easy_cpu" className="bg-sky-950">CPU-easy</option>
                <option value="normal_cpu" className="bg-sky-950">CPU-normal</option>
                <option value="hard_cpu" className="bg-sky-950">CPU-hard</option>
              </select>
            </div>
          </div>

          {/* Core Interactive area with skewed tilted buttons on Left, Stickman SVG in middle */}
          <div className="flex w-full items-center justify-between flex-1 py-4">
            
            {/* Tilted vertical menu capsule buttons on Left side of Left Player */}
            <div className="flex flex-col gap-3.5 pl-2 z-25">
              {[
                { tab: "weapon" as const, label: "WEAPON" },
                { tab: "head" as const, label: "HEAD" },
                { tab: "color1" as const, label: "COLOR1" },
                { tab: "color2" as const, label: "COLOR2" }
              ].map(b => (
                <button
                  id={`left_cust_${b.tab}`}
                  key={b.tab}
                  onClick={() => setActiveCustomizer({ pId: leftPlayer.id, tab: b.tab })}
                  className={`w-28 py-2 text-center text-xs font-extrabold uppercase bg-sky-950/90 hover:bg-sky-400 hover:text-sky-950 border border-sky-400/40 shadow-lg text-sky-300 rounded-lg transform -skew-y-3 skew-x-3 transition-all duration-150 active:scale-95 hover:border-sky-400 ${
                    activeCustomizer?.pId === leftPlayer.id && activeCustomizer?.tab === b.tab ? "bg-sky-400 text-sky-950 border-sky-400" : ""
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Huge live bent-legged floppy stickman SVG preview */}
            <div className="flex-1 max-w-[200px] h-[210px] flex items-center justify-center">
              {leftPlayer.type === "none" ? (
                <div className="text-sky-300/40 text-xs font-black uppercase text-center animate-pulse">
                  SLOT OFF
                </div>
              ) : (
                <CustomStickmanPreview 
                  colors={leftPlayer.colors} 
                  hat={leftPlayer.hat} 
                  weapon={leftPlayer.startingWeapon}
                  facingLeft={true} 
                />
              )}
            </div>
          </div>

          {/* Under stickman quick preset selector color rings */}
          <div className="w-full flex justify-center gap-3 mt-2">
            {PRESET_COLORS.slice(0, 4).map((preset, idx) => (
              <button
                id={`left_preset_${idx}`}
                key={idx}
                onClick={() => applyColorPreset(leftPlayer.id, preset)}
                className="w-7 h-7 rounded-full border-2 border-transparent hover:border-white p-0.5 transition-all active:scale-90 shadow"
                style={{ backgroundColor: preset.main }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* ================= MIDDLE CONTROL PANEL ================= */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-6 py-4 w-full">
          
          {/* Map Selector Preview Box in Top Middle */}
          <div className="w-full flex flex-col items-center">
            {/* Map selection box */}
            <div className="relative w-full max-w-[170px] aspect-[4/3] bg-sky-950/80 border-2 border-sky-400 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-2xl group">
              
              {/* Chevron Left */}
              <button
                id="prev_map_btn"
                onClick={handlePrevMap}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-sky-400 text-white hover:text-sky-950 rounded-full transition z-10 active:scale-90"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Miniature visual map outline */}
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900/60 relative">
                {selectedMap.theme === "sky" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200 opacity-20 pointer-events-none" />
                )}
                {selectedMap.theme === "lava" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-red-800 to-orange-600 opacity-30 pointer-events-none" />
                )}
                {selectedMap.theme === "toxic" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-emerald-700 opacity-30 pointer-events-none" />
                )}
                {selectedMap.theme === "cyber" && (
                  <div className="absolute inset-0 bg-slate-950 opacity-40 pointer-events-none" />
                )}

                <span className="text-3xl filter drop-shadow">
                  {selectedMap.theme === "sky" ? "☁️" : selectedMap.theme === "lava" ? "🌋" : selectedMap.theme === "toxic" ? "☣️" : "🧱"}
                </span>
                
                {/* Simulated platforms mini lines */}
                <div className="flex gap-1.5 mt-2 justify-center w-full">
                  <div className="w-7 h-1.5 bg-sky-400/70 rounded-full" />
                  <div className="w-5 h-1.5 bg-indigo-400/70 rounded-full" />
                  <div className="w-7 h-1.5 bg-sky-400/70 rounded-full" />
                </div>
              </div>

              {/* Chevron Right */}
              <button
                id="next_map_btn"
                onClick={handleNextMap}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-sky-400 text-white hover:text-sky-950 rounded-full transition z-10 active:scale-90"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Map label */}
            <span className="text-sm font-black italic tracking-wide text-white mt-2 drop-shadow uppercase bg-sky-950/70 px-4 py-0.5 rounded-full border border-sky-400/30">
              {selectedMap.name}
            </span>
          </div>

          {/* Middle switch button */}
          <button
            id="switch_players_btn"
            onClick={() => setPairIndex(prev => (prev + 1) % 3)}
            className="w-32 py-3 bg-gradient-to-b from-sky-900 to-slate-800 hover:from-sky-950 border-2 border-sky-400/60 hover:border-sky-400 text-white font-extrabold text-sm rounded-xl shadow-lg active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            </div>
            <span className="uppercase tracking-widest text-xs font-black">🔄 Switch</span>
          </button>

          {/* Yellow glossy comic GO! button */}
          <button
            id="launch_fight_btn"
            onClick={handleStartGame}
            className="w-32 h-14 bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-350 hover:to-amber-450 border-t-4 border-yellow-200 border-b-4 border-amber-600 text-sky-950 font-black text-2xl rounded-2xl shadow-[0_6px_0_#9a3412] hover:shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center justify-center"
          >
            GO!
          </button>

          {/* Match rules target points select dropdown */}
          <div className="flex flex-col items-center bg-sky-950/70 px-3 py-1 border border-sky-400/20 rounded-full">
            <span className="text-[10px] font-extrabold text-sky-300 uppercase">Points rule</span>
            <select
              id="points_rule_select"
              value={targetScore}
              onChange={(e) => setTargetScore(parseInt(e.target.value))}
              className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer text-center"
            >
              <option value="3" className="bg-sky-950">3 Wins</option>
              <option value="5" className="bg-sky-950 font-bold">5 Wins</option>
              <option value="10" className="bg-sky-950">10 Wins</option>
              <option value="15" className="bg-sky-950">15 Wins</option>
            </select>
          </div>
        </div>

        {/* ================= RIGHT CUSTOMIZER PANEL ================= */}
        <div className="lg:col-span-5 bg-sky-950/40 border border-sky-400/20 rounded-3xl p-5 shadow-2xl relative flex flex-col items-center justify-between min-h-[380px] w-full">
          
          {/* Header customizer caps style */}
          <div className="w-full flex justify-center mb-2">
            <div className="bg-sky-950/80 border border-sky-400/40 rounded-full px-5 py-1 flex items-center shadow-md">
              <span className="text-xs font-black uppercase text-sky-300 mr-2">Player {rightPlayer.id}</span>
              <select
                id={`type_select_right`}
                value={rightPlayer.type}
                onChange={(e) => updateSlotType(rightPlayer.id, e.target.value as any)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer uppercase border-none py-0.5"
              >
                <option value="none" className="bg-sky-950">None</option>
                <option value="human" className="bg-sky-950">Player</option>
                <option value="easy_cpu" className="bg-sky-950">CPU-easy</option>
                <option value="normal_cpu" className="bg-sky-950">CPU-normal</option>
                <option value="hard_cpu" className="bg-sky-950">CPU-hard</option>
              </select>
            </div>
          </div>

          {/* Core Interactive area with skewed tilted buttons on Right, Stickman SVG in middle */}
          <div className="flex w-full items-center justify-between flex-1 py-4">
            
            {/* Huge live bent-legged floppy stickman SVG preview */}
            <div className="flex-1 max-w-[200px] h-[210px] flex items-center justify-center">
              {rightPlayer.type === "none" ? (
                <div className="text-sky-300/40 text-xs font-black uppercase text-center animate-pulse">
                  SLOT OFF
                </div>
              ) : (
                <CustomStickmanPreview 
                  colors={rightPlayer.colors} 
                  hat={rightPlayer.hat} 
                  weapon={rightPlayer.startingWeapon}
                  facingLeft={false} 
                />
              )}
            </div>

            {/* Tilted vertical menu capsule buttons on Right side of Right Player */}
            <div className="flex flex-col gap-3.5 pr-2 z-25">
              {[
                { tab: "weapon" as const, label: "WEAPON" },
                { tab: "head" as const, label: "HEAD" },
                { tab: "color1" as const, label: "COLOR1" },
                { tab: "color2" as const, label: "COLOR2" }
              ].map(b => (
                <button
                  id={`right_cust_${b.tab}`}
                  key={b.tab}
                  onClick={() => setActiveCustomizer({ pId: rightPlayer.id, tab: b.tab })}
                  className={`w-28 py-2 text-center text-xs font-extrabold uppercase bg-sky-950/90 hover:bg-sky-400 hover:text-sky-950 border border-sky-400/40 shadow-lg text-sky-300 rounded-lg transform -skew-y-3 skew-x-3 transition-all duration-150 active:scale-95 hover:border-sky-400 ${
                    activeCustomizer?.pId === rightPlayer.id && activeCustomizer?.tab === b.tab ? "bg-sky-400 text-sky-950 border-sky-400" : ""
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

          </div>

          {/* Under stickman quick preset selector color rings */}
          <div className="w-full flex justify-center gap-3 mt-2">
            {PRESET_COLORS.slice(0, 4).map((preset, idx) => (
              <button
                id={`right_preset_${idx}`}
                key={idx}
                onClick={() => applyColorPreset(rightPlayer.id, preset)}
                className="w-7 h-7 rounded-full border-2 border-transparent hover:border-white p-0.5 transition-all active:scale-90 shadow"
                style={{ backgroundColor: preset.main }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Under footer disclaimer */}
      <div className="text-center text-[10px] text-sky-200/50 mt-6 max-w-lg mx-auto leading-relaxed">
        Stickman Clash PC local area fighter customizer dashboard. Click "Switch" to toggle slots. Click WEAPON/HEAD to customize styles and unlock premium items in the shop with gold coins.
      </div>

      {/* ================= RIGHT SIDE PANEL CUSTOMIZATION SHOP DRAWER ================= */}
      {activeCustomizer !== null && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-sky-950/95 backdrop-blur border-l-4 border-sky-400/40 shadow-2xl z-50 flex flex-col p-5 overflow-hidden animate-slide-in pointer-events-auto">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b-2 border-sky-400/30 pb-4 mb-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-sky-300 uppercase tracking-wide">
                Player {activeCustomizer.pId}: {activeCustomizer.tab} Customizer
              </h3>
              <span className="text-[10px] text-sky-200/60 uppercase font-bold">
                {activeCustomizer.tab === "weapon" ? "Equip weapon" : activeCustomizer.tab === "head" ? "Anime/Marvel Hats" : "Limb Color Picker"}
              </span>
            </div>
            
            {/* Close button X */}
            <button
              id="close_drawer_btn"
              onClick={() => setActiveCustomizer(null)}
              className="w-10 h-10 flex items-center justify-center bg-sky-900 hover:bg-red-500 hover:text-white rounded-xl transition duration-150 font-black shadow"
            >
              ✕
            </button>
          </div>

          {/* Coins and Unlocked stats section */}
          <div className="flex items-center justify-between bg-sky-900/60 border border-sky-400/20 rounded-2xl p-3 mb-4 shadow">
            <div className="flex items-center gap-1.5">
              <Coins size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-300 font-mono">Coins: 🪙 {coins}</span>
            </div>

            <span className="text-[10px] font-black uppercase text-sky-300">
              {activeCustomizer.tab === "head" 
                ? `${unlockedHats.length}/${HATS.length} UNLOCKED`
                : activeCustomizer.tab === "weapon"
                ? `${unlockedWeapons.length}/${WEAPONS.length} UNLOCKED`
                : "COLOR SELECTION"
              }
            </span>
          </div>

          {/* Core Customize Content scroll board */}
          <div className="flex-1 overflow-y-auto pr-1">
            
            {/* 1. Custom weapons select and purchase grid */}
            {activeCustomizer.tab === "weapon" && (
              <div className="grid grid-cols-2 gap-3 pb-6">
                
                {/* Unarmed base weapon option */}
                <button
                  id="equip_weapon_none"
                  onClick={() => {
                    setStartingWeapon(activeCustomizer.pId, "none");
                    setActiveCustomizer(null);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition text-center bg-sky-900/20 border-sky-400/20 hover:border-sky-400`}
                >
                  <div className="w-12 h-12 rounded-full bg-sky-950 border border-sky-400/20 flex items-center justify-center mb-1 text-slate-400 text-xs font-bold font-mono">
                    None
                  </div>
                  <span className="text-xs font-bold text-white">Fists / Unarmed</span>
                </button>

                {WEAPONS.map(w => {
                  const isUnlocked = unlockedWeapons.includes(w.id);
                  const isSelected = players.find(p => p.id === activeCustomizer.pId)?.startingWeapon === w.id;
                  const price = w.class === "melee" ? 150 : 120; // 150 for cool melee, 120 for cool blasters

                  return (
                    <div
                      key={w.id}
                      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition text-center ${
                        isSelected 
                          ? 'bg-sky-400/10 border-sky-400 shadow shadow-sky-400' 
                          : 'bg-sky-900/20 border-sky-400/20 hover:border-sky-400/50'
                      }`}
                    >
                      {/* Live vector rendering of the weapon */}
                      <WeaponVectorGraphic weaponId={w.id} color={w.color} />
                      
                      <div className="mt-1">
                        <span className="text-xs font-extrabold text-white block truncate max-w-[130px]">{w.name}</span>
                        <span className="text-[9px] text-sky-300 block uppercase font-bold">{w.class}</span>
                      </div>

                      {/* Unlock button or Equipped status */}
                      {isUnlocked ? (
                        <button
                          id={`equip_weapon_${w.id}`}
                          onClick={() => {
                            setStartingWeapon(activeCustomizer.pId, w.id);
                            setActiveCustomizer(null);
                          }}
                          className="w-full mt-2.5 py-1 px-3 bg-sky-400 text-sky-950 font-black text-[10px] rounded-lg uppercase tracking-wide"
                        >
                          {isSelected ? "Equipped" : "Equip"}
                        </button>
                      ) : (
                        <button
                          id={`unlock_weapon_${w.id}`}
                          onClick={() => handleUnlockItem("weapon", w.id, price)}
                          className="w-full mt-2.5 py-1 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-black text-[10px] rounded-lg flex items-center justify-center gap-1 uppercase tracking-wide"
                        >
                          <Lock size={10} /> 🪙 {price}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Custom famous Anime/Marvel Hats selector grid */}
            {activeCustomizer.tab === "head" && (
              <div className="grid grid-cols-2 gap-3 pb-6">
                
                {/* Default plain bare skin option */}
                <button
                  id="equip_hat_none"
                  onClick={() => {
                    setHat(activeCustomizer.pId, "none");
                    setActiveCustomizer(null);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition text-center bg-sky-900/20 border-sky-400/20 hover:border-sky-400`}
                >
                  <div className="w-12 h-12 rounded-full bg-sky-950 border border-sky-400/20 flex items-center justify-center mb-1 text-slate-400 text-xs font-bold font-mono">
                    None
                  </div>
                  <span className="text-xs font-bold text-white">No Hat</span>
                </button>

                {HATS.map(h => {
                  const isUnlocked = unlockedHats.includes(h.id);
                  const isSelected = players.find(p => p.id === activeCustomizer.pId)?.hat === h.id;
                  const price = h.type === "anime" ? 125 : (h.type === "marvel" ? 150 : 100);

                  return (
                    <div
                      key={h.id}
                      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition text-center ${
                        isSelected 
                          ? 'bg-sky-400/10 border-sky-400 shadow shadow-sky-400' 
                          : 'bg-sky-900/20 border-sky-400/20 hover:border-sky-400/50'
                      }`}
                    >
                      {/* Simple Hat representation box */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 border border-sky-400/30 text-2xl"
                        style={{ backgroundColor: h.color, color: h.accentColor }}
                      >
                        🦸
                      </div>

                      <div className="mt-1">
                        <span className="text-xs font-extrabold text-white block truncate max-w-[130px]">{h.name}</span>
                        <span className="text-[9px] text-sky-300 block uppercase font-bold">{h.type}</span>
                      </div>

                      {/* Unlock button or Equipped status */}
                      {isUnlocked ? (
                        <button
                          id={`equip_hat_${h.id}`}
                          onClick={() => {
                            setHat(activeCustomizer.pId, h.id);
                            setActiveCustomizer(null);
                          }}
                          className="w-full mt-2.5 py-1 px-3 bg-sky-400 text-sky-950 font-black text-[10px] rounded-lg uppercase tracking-wide"
                        >
                          {isSelected ? "Equipped" : "Equip"}
                        </button>
                      ) : (
                        <button
                          id={`unlock_hat_${h.id}`}
                          onClick={() => handleUnlockItem("hat", h.id, price)}
                          className="w-full mt-2.5 py-1 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-black text-[10px] rounded-lg flex items-center justify-center gap-1 uppercase tracking-wide"
                        >
                          <Lock size={10} /> 🪙 {price}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Custom palette square picker for Colors */}
            {(activeCustomizer.tab === "color1" || activeCustomizer.tab === "color2") && (
              <div className="flex flex-col gap-5 pb-6">
                
                {/* Segment detail text explanation */}
                <div className="bg-sky-900/40 p-3 rounded-2xl border border-sky-400/10 text-xs text-sky-200 leading-relaxed">
                  {activeCustomizer.tab === "color1" 
                    ? "Color 1 se head ball aur torso spine core update hotey hai. Palette se koi bhi block select karke custom paint karo." 
                    : "Color 2 se arms aur legs limbs color update hotey hai."
                  }
                </div>

                {/* Preset Themes shortcut row */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-sky-300 uppercase">Quick presets shortcut</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((preset, idx) => (
                      <button
                        id={`palette_preset_${idx}`}
                        key={idx}
                        onClick={() => applyColorPreset(activeCustomizer.pId, preset)}
                        className="flex items-center gap-1 bg-sky-950 hover:bg-sky-900 border border-sky-400/20 px-2 py-1 rounded-lg text-[10px] font-bold"
                      >
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.main }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color blocks grids */}
                <div className="flex flex-col gap-2 pt-2 border-t border-sky-400/25">
                  <span className="text-xs font-bold text-sky-300 uppercase">Select color paint block</span>
                  <div className="grid grid-cols-5 gap-2">
                    {PALETTE_COLORS.map((colorVal, index) => (
                      <button
                        id={`palette_color_btn_${index}`}
                        key={index}
                        onClick={() => {
                          if (activeCustomizer.tab === "color1") {
                            updateIndividualColor(activeCustomizer.pId, "head", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "chest", colorVal);
                          } else {
                            updateIndividualColor(activeCustomizer.pId, "armLeft1", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "armLeft2", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "armRight1", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "armRight2", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "legLeft1", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "legLeft2", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "legRight1", colorVal);
                            updateIndividualColor(activeCustomizer.pId, "legRight2", colorVal);
                          }
                          // Keep customize open but paint instantly!
                        }}
                        className="aspect-square rounded-xl border border-white/20 hover:border-white transition-transform duration-100 hover:scale-105 active:scale-95 shadow"
                        style={{ backgroundColor: colorVal }}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom system hex input for advanced painting */}
                <div className="flex items-center justify-between bg-sky-950 p-3 rounded-2xl border border-sky-400/20 mt-4">
                  <span className="text-xs text-sky-200 font-bold">Advanced Custom Color Colorpicker</span>
                  <input
                    id="advanced_hex_colorpicker"
                    type="color"
                    onChange={(e) => {
                      const colorVal = e.target.value;
                      if (activeCustomizer.tab === "color1") {
                        updateIndividualColor(activeCustomizer.pId, "head", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "chest", colorVal);
                      } else {
                        updateIndividualColor(activeCustomizer.pId, "armLeft1", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "armLeft2", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "armRight1", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "armRight2", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "legLeft1", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "legLeft2", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "legRight1", colorVal);
                        updateIndividualColor(activeCustomizer.pId, "legRight2", colorVal);
                      }
                    }}
                    className="w-10 h-10 rounded border-none cursor-pointer bg-transparent"
                  />
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
