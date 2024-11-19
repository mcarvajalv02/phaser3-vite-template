import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('start-scene');
  }

  preload() {
    // Carga la imagen del fondo y el botón
    this.load.image('startBackground', 'assets/start-background.png');
    this.load.image('startButton', 'assets/start-button.png');
  }

  create() {
    // Agrega la imagen de fondo y ajusta su escala
    const background = this.add.image(0, 0, 'startBackground').setOrigin(0, 0);

    // Escala la imagen de fondo para que ocupe todo el canvas
    background.setScale(
      this.scale.width / background.width,
      this.scale.height / background.height
    );

    // Agrega el botón interactivo
    const startButton = this.add
      .image(this.scale.width / 2, this.scale.height / 1.25, 'startButton')
      .setInteractive()
      .setScale(0.7); // Botón más grande

    // Evento al hacer clic en el botón
    startButton.on('pointerdown', () => {
      this.scene.start('hello-world'); // Inicia la escena principal
    });

    // Texto opcional encima del botón
    this.add
      .text(this.scale.width / 2, this.scale.height / 1.35 + 100, '¡Haz clic para comenzar!', {
        fontSize: '24px', // Tamaño de fuente más grande
        color: '#000000',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
  }
}
