import React, { useState } from 'react';
import './App.css';
import PaperPlaneGame from './components/PaperPlaneGame';
import LevelSelection from './components/levelSelection';

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'levelSelect', 'playing', 'won'
  const [unlockedLevels, setUnlockedLevels] = useState([1]); // Start with level 1 unlocked
  const [currentLevel, setCurrentLevel] = useState(1);

  const startGame = () => {
    setGameState('levelSelect');
  };

  const handleSelectLevel = (level) => {
    setCurrentLevel(level);
    setGameState('playing');
  };

  const handleLevelComplete = (level) => {
    console.log(`Level ${level} completed!`);
    const nextLevel = level + 1;
    if (!unlockedLevels.includes(nextLevel)) {
      setUnlockedLevels((prev) => [...prev, nextLevel]);
    }
    setGameState('won'); // Show "Next Level" button
  };

  const goToNextLevel = () => {
    const nextLevel = currentLevel + 1;
    if (unlockedLevels.includes(nextLevel)) {
      setCurrentLevel(nextLevel);
      setGameState('playing');
    } else {
      setGameState('levelSelect');
    }
  };

  return (
    <div className="valentine-theme">
      {gameState === 'menu' && (
        <div className="welcome-screen">
          <h1>Добро пожаловать, Люба!</h1>
          <button onClick={startGame}>Начать игру</button>
        </div>
      )}

      {gameState === 'levelSelect' && (
        <LevelSelection unlockedLevels={unlockedLevels} onSelectLevel={handleSelectLevel} />
      )}

      {gameState === 'playing' && (
        <PaperPlaneGame onLevelComplete={handleLevelComplete} />
      )}

      {gameState === 'won' && (
        <div className="next-level-screen">
          <h2>Поздравляем! Уровень {currentLevel} пройден! 🎉</h2>
          <button onClick={goToNextLevel}>Следующий уровень</button>
        </div>
      )}
    </div>
  );
}

export default App;
