import Phaser from 'phaser';
import HelloWorldScene from './HelloWorldScene';
import StartScene from './StartScene'; // Importa la nueva escena

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 530,
  parent: 'game-container',
  scene: [StartScene, HelloWorldScene], // Agrega las escenas en orden
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

export default new Phaser.Game(config);
