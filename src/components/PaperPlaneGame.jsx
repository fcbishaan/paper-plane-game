import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faClock, faRedo, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const LOCALIZATION = {
  score: "Счёт",
  time: "Время",
  gameOver: "Игра Окончена!",
  levelComplete: "Уровень Пройден!",
  restart: "Заново",
  collectRoses: "Собери 7 роз!",
  avoidObstacles: "Избегай птиц!",
  winMessage: "Ты прекрасна в розовом цвете! ❤️",
  loseMessage: "Пожалуйста, попробуйте снова!",
  viewMessage: "Посмотреть сообщение для тебя",
  jokes: [
    "Почему детский врач всегда в хорошем настроении? – Потому что у него много маленьких пациентов! 😂👶",
    "Доктор: 'Что случилось?' Малыш: 'Я сломал руку в двух местах!' Доктор: 'Тогда не ходи в эти места!' 🤣🩺",
    "Как узнать, что человек будущий детский врач? – Он может успокоить кричащего ребёнка… и при этом сам не закричать! 👩‍⚕️👶😂"
  ],
  proposal: {
    message: "Эй, я тут подумал... Как насчет того, чтобы стать моей валентинкой в этом году? Сходим куда-нибудь круто и устроим незабываемый день!",
    yes: "Да! ❤️",
    no: "Нет 🙈"
  }
};

const PaperPlaneGame = () => {
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // Controls the message box visibility
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0); // Tracks the current joke index
  const [showProposal, setShowProposal] = useState(false); // Controls the proposal message visibility
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 }); // Tracks the position of the "No" button

  const GAME_WIDTH = window.innerWidth > 800 ? 800 : window.innerWidth - 20;
  const GAME_HEIGHT = window.innerWidth > 800 ? 533 : window.innerHeight * 0.7;

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
      scene: { preload, create, update },
      parent: "game-container",
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => game.destroy(true);
  }, []);

  function preload() {
    this.load.image("background", "/assets/bg.jpg");
    this.load.image("plane", "/assets/paper-plane.png");
    this.load.image("rose", "/assets/rose.png");
    this.load.image("obstacle", "/assets/dove.png");
  }

  function create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");
    this.plane = this.physics.add.sprite(100, GAME_HEIGHT / 2, "plane")
      .setCollideWorldBounds(true)
      .setScale(0.12)
      .setAngle(-10);

    this.obstacles = this.physics.add.group();
    this.roses = this.physics.add.group();

    this.time.addEvent({ delay: 800, callback: spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 1200, callback: spawnRose, callbackScope: this, loop: true });
    this.physics.add.overlap(this.plane, this.roses, collectRose, null, this);
    this.physics.add.collider(this.plane, this.obstacles, hitObstacle, null, this);
    this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, loop: true });

    // Keyboard controls (for desktop)
    this.cursors = this.input.keyboard.createCursorKeys();

    // Touch controls (for mobile)
    let touchStartY = 0; // Variable to store the touch start position

    this.input.on('pointerdown', (pointer) => {
      // Store the touch start Y position when the user starts touching
      touchStartY = pointer.y;
    });

    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        // Move the plane by the difference between touch start and current position
        const moveY = pointer.y - touchStartY;
        this.plane.y = Phaser.Math.Clamp(this.plane.y + moveY, 0, GAME_HEIGHT); // Clamp to ensure the plane stays within bounds
        touchStartY = pointer.y; // Update touch start position
      }
    });

    this.input.on('pointerup', () => {
      // Optional: reset any touch-related variables if needed when touch ends
      touchStartY = 0;
    });
  }

  function update() {
    // Keyboard controls (for desktop)
    if (this.cursors.up.isDown) this.plane.setVelocityY(-200);
    else if (this.cursors.down.isDown) this.plane.setVelocityY(200);
    else this.plane.setVelocityY(0);
  }

  function spawnObstacle() {
    this.obstacles.create(GAME_WIDTH, Phaser.Math.Between(100, GAME_HEIGHT - 100), "obstacle")
      .setVelocityX(-250)
      .setScale(0.10);
  }

  function spawnRose() {
    this.roses.create(GAME_WIDTH, Phaser.Math.Between(100, GAME_HEIGHT - 100), "rose")
      .setVelocityX(-150)
      .setScale(0.10);
  }

  function collectRose(plane, rose) {
    rose.destroy();
    setScore(prev => {
      const newScore = prev + 1;
      if (newScore >= 7) completeLevel();
      return newScore;
    });
  }

  function hitObstacle() {
    setGameOver(true);
    this.physics.pause();
  }

  function updateTimer() {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setGameOver(true);
        this.physics.pause();
        return 0;
      }
      return prev - 1;
    });
  }

  function completeLevel() {
    setLevelCompleted(true);
    setGameOver(true);
  }

  function restartGame() {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setLevelCompleted(false);
    setShowMessage(false); // Hide message box if open
    setShowProposal(false); // Hide proposal if open
    gameRef.current.scene.scenes[0].physics.resume();
  }

  const handleNextJoke = () => {
    if (currentJokeIndex < LOCALIZATION.jokes.length - 1) {
      setCurrentJokeIndex((prevIndex) => prevIndex + 1);
    } else {
      setShowProposal(true); // Show proposal after all jokes
    }
  };

  const handleNoButtonClick = () => {
    // Move the "No" button to a random position
    const newX = Math.random() * (window.innerWidth - 100);
    const newY = Math.random() * (window.innerHeight - 50);
    setNoButtonPosition({ x: newX, y: newY });
  };

  return (
    <div style={{ position: 'relative', textAlign: 'center', fontFamily: 'Comic Neue, cursive', backgroundColor: '#ffccff' }}>
      <div id="game-container" style={{ width: '100%', height: '100%' }} />

      {/* HUD */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', background: 'rgba(255, 210, 235, 0.9)', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 0 15px rgba(255, 100, 175, 0.5)', color: '#ff3366' }}>
        <div><FontAwesomeIcon icon={faHeart} /> {LOCALIZATION.score}: {score}</div>
        <div><FontAwesomeIcon icon={faClock} /> {LOCALIZATION.time}: {timeLeft}</div>
      </div>

      {/* Game Over / Level Complete Screen */}
      {gameOver && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 230, 240, 0.95)', padding: '40px 60px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(255, 100, 175, 0.3)', width: '90%', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '32px', color: '#ff3366' }}>{levelCompleted ? LOCALIZATION.levelComplete : LOCALIZATION.gameOver}</h2>
          <p>{levelCompleted ? LOCALIZATION.winMessage : LOCALIZATION.loseMessage}</p>
          {levelCompleted && (
            <button onClick={() => setShowMessage(true)} style={{ background: '#ff3366', padding: '15px 30px', borderRadius: '25px', color: 'white', fontSize: '18px', marginTop: '10px' }}>
              <FontAwesomeIcon icon={faEnvelope} /> {LOCALIZATION.viewMessage}
            </button>
          )}
          <button onClick={restartGame} style={{ background: '#ff3366', padding: '15px 30px', borderRadius: '25px', color: 'white', fontSize: '18px', marginTop: '10px' }}>
            <FontAwesomeIcon icon={faRedo} /> {LOCALIZATION.restart}
          </button>
        </div>
      )}

      {/* Message Box */}
      {showMessage && !showProposal && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'black', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.2)', width: '80%', maxWidth: '400px' }}>
          <h3>Ты победила! 🎉</h3>
          <p>{LOCALIZATION.jokes[currentJokeIndex]}</p>
          <button onClick={handleNextJoke} style={{ background: '#ff3366', color: 'white', padding: '10px 20px', borderRadius: '15px', marginTop: '10px' }}>
            {currentJokeIndex < LOCALIZATION.jokes.length - 1 ? "Следующий анекдот" : "Далее"}
          </button>
        </div>
      )}

      {/* Proposal Message Box */}
      {showProposal && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'black', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.2)', width: '80%', maxWidth: '400px' }}>
          <h3>Предложение ❤️</h3>
          <p>{LOCALIZATION.proposal.message}</p>
          <button onClick={() => alert("Ура! Ты сделала мой день! ❤️")} style={{ background: '#ff3366', color: 'white', padding: '10px 20px', borderRadius: '15px', marginTop: '10px' }}>
            {LOCALIZATION.proposal.yes}
          </button>
          <button
            onClick={handleNoButtonClick}
            style={{
              background: '#ff3366',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '15px',
              marginTop: '10px',
              position: 'absolute',
              left: `${noButtonPosition.x}px`,
              top: `${noButtonPosition.y}px`
            }}
          >
            {LOCALIZATION.proposal.no}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaperPlaneGame;