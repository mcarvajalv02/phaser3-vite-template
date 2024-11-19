import Phaser from "phaser";

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
    this.tubeSpacing = 200;
    this.tubeSpeed = -150;
    this.gravity = 1000;
    this.jumpVelocity = -400;
    this.lives = 3;
    this.accumulatedTime = 0;
    this.lastTime = 0;
  }

  preload() {
    this.load.image("sky", "assets/mapaFlappyBird.png");
    this.load.image("tube", "assets/tubos.png");
    this.load.image("button", "assets/button.png");
    this.load.atlas("player", "assets/bird.png", "assets/bird.json");
    this.load.audio("jump", "assets/jump.mp3");
    this.load.image("restartButton", "assets/start-button.png");
  }

  create() {
    // Background
    this.add.image(0, 0, "sky").setOrigin(0, 0);

    // Group of tubes with physics
    this.tubes = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Player
    this.player = this.physics.add.sprite(100, 100, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(this.gravity);

    // Animation
    this.anims.create({
      key: "idle",
      frames: [{ key: "player", frame: "idle" }],
      frameRate: 1,
      repeat: -1,
    });
    this.player.anims.play("idle", true);

    // Sound
    this.jump_sound = this.sound.add("jump", { volume: 1 });

    // Collisions
    this.physics.add.collider(
      this.player,
      this.tubes,
      this.handleCollision,
      null,
      this
    );

    // Jump event
    this.input.on("pointerdown", (pointer) => {
      if (
        !this.restartButton ||
        !this.restartButton.getBounds().contains(pointer.x, pointer.y)
      ) {
        if (this.isGameOver || this.isPaused) return;

        this.player.setVelocityY(this.jumpVelocity);
        this.jump_sound.play();
      }
    });

    // Tube timer
    this.tubeTimer = this.time.addEvent({
      delay: 3500,
      callback: this.createTubes,
      callbackScope: this,
      loop: true,
    });

    // Display elapsed time
    this.timerText = this.add
      .text(10, 10, "Time: 0", {
        fontSize: "30px",
        color: "#ffffff",
      })
      .setDepth(1);

    // Display remaining lives
    this.livesText = this.add
      .text(10, 40, `Lives: ${this.lives}`, {
        fontSize: "30px",
        color: "#ffffff",
      })
      .setDepth(1);

    this.startTime = this.time.now;
    this.isGameOver = false;
    this.isPaused = false;
  }

  createTubes() {
    if (this.isPaused) return;

    const gameHeight = 600;
    const gameWidth = 800;

    const gap = 100;
    const minY = 100;
    const maxY = gameHeight - minY - gap;
    const tubeY = Phaser.Math.Between(minY, maxY);

    // Bottom tube
    const bottomTube = this.tubes.create(gameWidth, tubeY + gap, "tube");
    bottomTube.setOrigin(0.5, 0);
    bottomTube.body.velocity.x = this.tubeSpeed;
    bottomTube.setScale(0.5);
    bottomTube.body.setSize(bottomTube.width * 0.82, bottomTube.height);
    bottomTube.body.setOffset(bottomTube.width * 0.1, bottomTube.height * 0.14);

    // Top tube
    const topTube = this.tubes.create(gameWidth, tubeY, "tube");
    topTube.setOrigin(0.5, 1);
    topTube.body.velocity.x = this.tubeSpeed;
    topTube.flipY = true;
    topTube.setScale(0.5);
    topTube.body.setSize(topTube.width * 0.82, topTube.height);
    topTube.body.setOffset(topTube.width * 0.1, topTube.height * -0.14);
  }

  update() {
    if (this.isGameOver) return;

    // Only update the time if the game is not paused
    if (!this.isPaused) {
      const currentTime = Math.floor((this.time.now - this.startTime) / 1000);
      const totalTime = this.accumulatedTime + currentTime;
      this.timerText.setText(`Time: ${totalTime}`);
      this.lastTime = totalTime; // Save the last time
    }

    // Remove tubes off-screen
    this.tubes.getChildren().forEach((tube) => {
      if (tube.x < -50) {
        tube.destroy();
      }
    });
  }

  handleCollision() {
    if (this.isPaused) return;

    this.lives -= 1;
    this.livesText.setText(`Lives: ${this.lives}`);

    if (this.lives > 0) {
      // Save the current time before pausing
      this.accumulatedTime = this.lastTime;
      this.pauseGameElements();

      // Show temporary message
      if (!this.gameOverText) {
        this.gameOverText = this.add
          .text(400, 250, "You lost a life!", {
            fontSize: "50px",
            color: "#ff0000",
          })
          .setOrigin(0.5)
          .setDepth(2);
      }

      if (!this.restartButton) {
        this.createRestartButton();
      }
    } else {
      this.gameOver();
    }
  }

  pauseGameElements() {
    this.isPaused = true;

    // Stop the tubes
    this.tubes.getChildren().forEach((tube) => {
      tube.body.velocity.x = 0;
    });

    // Stop the player
    this.player.setVelocity(0, 0);
    this.player.body.allowGravity = false;

    // Pause the tube timer
    this.tubeTimer.paused = true;
  }

  createRestartButton() {
    this.restartButton = this.add
      .image(400, 350, "restartButton")
      .setInteractive()
      .setScale(0.5)
      .setDepth(2);

    this.restartButton.on("pointerdown", () => {
      if (this.lives > 0) {
        this.continueGame(); // Continue with remaining lives
      } else {
        this.resetGame(); // Full reset
      }
    });
  }

  continueGame() {
    // Remove UI elements
    if (this.gameOverText) {
      this.gameOverText.destroy();
      this.gameOverText = null;
    }
    if (this.restartButton) {
      this.restartButton.destroy();
      this.restartButton = null;
    }

    // Keep accumulated time and current lives
    this.startTime = this.time.now;
    this.isPaused = false;

    // Remove all tubes
    this.tubes.clear(true, true);

    // Reset the player
    this.player.setPosition(100, 100);
    this.player.body.allowGravity = true;
    this.player.setVelocity(0, 0);

    // Restart the tube timer
    this.tubeTimer.reset({
      delay: 3500,
      callback: this.createTubes,
      callbackScope: this,
      loop: true,
    });
    this.tubeTimer.paused = false;
  }

  resetGame() {
    // Remove UI elements
    if (this.gameOverText) {
      this.gameOverText.destroy();
      this.gameOverText = null;
    }
    if (this.restartButton) {
      this.restartButton.destroy();
      this.restartButton = null;
    }

    // Reset all variables
    this.lives = 3;
    this.accumulatedTime = 0;
    this.lastTime = 0;
    this.startTime = this.time.now;
    this.isGameOver = false;
    this.isPaused = false;

    // Remove all tubes
    this.tubes.clear(true, true);

    // Reset the player
    this.player.setPosition(100, 100);
    this.player.body.allowGravity = true;
    this.player.setVelocity(0, 0);

    // Update UI
    this.livesText.setText(`Lives: ${this.lives}`);

    // Restart the tube timer
    this.tubeTimer.reset({
      delay: 3500,
      callback: this.createTubes,
      callbackScope: this,
      loop: true,
    });
    this.tubeTimer.paused = false;
  }

  gameOver() {
    this.isGameOver = true;
    this.pauseGameElements();

    if (!this.gameOverText) {
      this.gameOverText = this.add
        .text(400, 250, "Game Over - No lives left!", {
          fontSize: "50px",
          color: "#ff0000",
        })
        .setOrigin(0.5)
        .setDepth(2);
    }

    if (!this.restartButton) {
      this.createRestartButton();
    }
  }
}
