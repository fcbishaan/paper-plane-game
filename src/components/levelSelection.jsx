import React from 'react';

const LevelSelection = ({ unlockedLevels, onSelectLevel }) => {
  const totalLevels = 7; // Total number of levels

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h1>Выберите уровень</h1>
      {Array.from({ length: totalLevels }, (_, index) => {
        const level = index + 1;
        const isUnlocked = unlockedLevels.includes(level);
        return (
          <button
            key={level}
            onClick={() => isUnlocked && onSelectLevel(level)}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              margin: '8px',
              backgroundColor: isUnlocked ? '#ff4d6d' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isUnlocked ? 'pointer' : 'not-allowed',
              transition: '0.3s',
            }}
            disabled={!isUnlocked}
          >
            Уровень {level} {isUnlocked ? '' : '(Заблокирован)'}
          </button>
        );
      })}
    </div>
  );
};

export default LevelSelection;
