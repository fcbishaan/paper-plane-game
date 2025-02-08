import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faClock, faRedo } from '@fortawesome/free-solid-svg-icons';

// Russian localization
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
};

const PaperPlaneGame = () => {
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);

  const GAME_WIDTH = window.innerWidth > 800 ? 800 : window.innerWidth - 20;
  const GAME_HEIGHT = window.innerWidth > 800 ? 600 : window.innerHeight * 0.7;

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

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  function update() {
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
    gameRef.current.scene.scenes[0].physics.resume();
  }

  return (
    <div style={{ position: 'relative', textAlign: 'center', fontFamily: 'Comic Neue, cursive',  backgroundColor: '#ffccff', }}>
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
          <button onClick={restartGame} style={{ background: '#ff3366', padding: '15px 30px', borderRadius: '25px', color: 'white', fontSize: '18px' }}>
            <FontAwesomeIcon icon={faRedo} /> {LOCALIZATION.restart}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaperPlaneGame;
