/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import SetupScreen from "./components/SetupScreen";
import GameScreen from "./components/GameScreen";
import { PlayerConfig, MapConfig } from "./types";

export default function App() {
  const [screen, setScreen] = useState<"setup" | "game">("setup");
  const [activePlayers, setActivePlayers] = useState<PlayerConfig[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapConfig | null>(null);
  const [targetScore, setTargetScore] = useState<number>(5);

  const handleStartGame = (configs: PlayerConfig[], map: MapConfig, scoreGoal: number) => {
    setActivePlayers(configs);
    setSelectedMap(map);
    setTargetScore(scoreGoal);
    setScreen("game");
  };

  const handleBackToMenu = () => {
    setScreen("setup");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans select-none overflow-x-hidden text-slate-100 transition-colors">
      {screen === "setup" ? (
        <SetupScreen onStartGame={handleStartGame} />
      ) : (
        selectedMap && (
          <GameScreen
            activeConfigs={activePlayers}
            selectedMap={selectedMap}
            targetScore={targetScore}
            onBackToMenu={handleBackToMenu}
          />
        )
      )}
    </div>
  );
}

