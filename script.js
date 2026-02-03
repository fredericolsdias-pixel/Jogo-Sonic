class SpriteManager {
  constructor() {
    this.sprites = {};
  }

  load(name, path) {
    const img = new Image();
    img.src = path;
    this.sprites[name] = img;
  }

  get(name) {
    return this.sprites[name];
  }
}
class AudioManager {
  constructor() {
    this.theme = new Audio("./Arquivos/ThemeSound2.mp3");
    this.jump = new Audio("./Arquivos/JumpSound.wav");
    this.gameOver = new Audio("./Arquivos/GameOverSound.wav");

    this.theme.loop = true;
    this.theme.volume = 0.8;
    this.jump.volume = 0.3;
    this.gameOver.volume = 1.0;

    this.started = false;
  }

  startTheme() {
    if (!this.started) {
      this.theme.currentTime = 6;
      this.theme.play();
      this.started = true;
    }
  }

  stopTheme() {
    this.theme.pause();
  }

  playJump() {
    this.jump.currentTime = 0;
    this.jump.play();
  }

  playGameOver() {
    this.gameOver.play();
  }
}
class Player {
  constructor(element, sprites, audio) {
    this.el = element;
    this.sprites = sprites;
    this.audio = audio;
    this.isJumping = false;

    this.el.src = this.sprites.get("run").src;
  }

  jump() {
    if (this.isJumping) return;

    this.isJumping = true;
    this.audio.playJump();
    this.el.classList.add("jump");
    this.el.src = this.sprites.get("jump").src;

    setTimeout(() => {
      this.el.classList.remove("jump");
      this.el.src = this.sprites.get("run").src;
      this.isJumping = false;
    }, 1000);
  }

  get bottom() {
    return +window.getComputedStyle(this.el).bottom.replace("px", "");
  }

  lose() {
    this.el.src = this.sprites.get("lose").src;
    this.el.style.width = "240px";
  }
}
class Enemy {
  constructor(element) {
    this.el = element;
    this.speed = 2;
  }

  increaseSpeed() {
    if (this.speed > 0.6) {
      this.speed -= 0.2;
      this.el.style.animationDuration = this.speed + "s";
    }
  }

  stop(position) {
    this.el.style.animation = "none";
    this.el.style.left = position + "px";
  }

  get position() {
    return this.el.offsetLeft;
  }
}
class BackgroundManager {
  constructor(element, fundos) {
    this.el = element;
    this.fundos = fundos;
    this.index = 0;
  }

  start() {
    this.loop = setInterval(() => {
      this.index = (this.index + 1) % this.fundos.length;
      this.el.style.opacity = "0";

      setTimeout(() => {
        this.el.style.backgroundImage = `url(${this.fundos[this.index]})`;
        this.el.style.opacity = "1";
      }, 300);
    }, 12000);
  }

  stop() {
    clearInterval(this.loop);
  }

  gameOver() {
    this.el.style.backgroundImage = 'url("./Arquivos/GameoverSMB-1.png")';
    this.el.style.backgroundSize = "cover";
  }
}
class RestartButton {
  constructor(parent, onRestart) {
    this.parent = parent;
    this.onRestart = onRestart;
    this.button = null;
  }

  show() {
    if (this.button) return;

    this.button = document.createElement("button");
    this.button.textContent = "Jogar Novamente";
    this.button.classList.add("reiniciar-btn");
    this.button.type = "button";
    this.button.setAttribute("aria-label", "Jogar novamente");

    this.button.addEventListener("click", this.onRestart);
    this.button.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.onRestart();
    });

    this.parent.appendChild(this.button);
    this.button.focus();
  }

  hide() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }
}

class Game {
  constructor() {
    this.sprites = new SpriteManager();
    this.audio = new AudioManager();

    this.loadSprites();

    this.player = new Player(
      document.querySelector(".sonic"),
      this.sprites,
      this.audio
    );

    this.enemy = new Enemy(document.querySelector(".eggman"));

    this.background = new BackgroundManager(
      document.querySelector(".gameplay"),
      [
        "./Arquivos/Fundo.png",
        "./Arquivos/Fundo2.png",
        "./Arquivos/Fundo3.png",
        "./Arquivos/Fundo4.png",
      ]
    );

    this.score = 0;
    this.scoreDisplay = document.getElementById("score");
    this.restartButton = new RestartButton(
  document.querySelector(".gameplay"),
  () => this.restart()
);

  }

  loadSprites() {
    this.sprites.load("run", "./Arquivos/Sonic.gif");
    this.sprites.load("jump", "./Arquivos/Sonic-Jump.gif");
    this.sprites.load("lose", "./Arquivos/Sonic-Loss.gif");
  }

  start() {
    this.background.start();

    document.addEventListener("keydown", () => this.audio.startTheme());
    document.addEventListener("keydown", e => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        this.player.jump();
      }
    });

    document.addEventListener("touchstart", () => this.player.jump());

    this.scoreLoop = setInterval(() => {
      this.score++;
      this.scoreDisplay.textContent = "Score: " + this.score;
    }, 200);

    this.speedLoop = setInterval(() => {
      this.enemy.increaseSpeed();
    }, 7000);

    this.collisionLoop = setInterval(() => this.checkCollision(), 20);
  }

  checkCollision() {
    if (
      this.enemy.position < 110 &&
      this.enemy.position > 0 &&
      this.player.bottom < 220
    ) {
      this.gameOver();
    }
  }

gameOver() {
  this.audio.stopTheme();
  this.audio.playGameOver();

  this.enemy.stop(this.enemy.position);
  this.player.lose();
  this.background.stop();
  this.background.gameOver();

  clearInterval(this.scoreLoop);
  clearInterval(this.speedLoop);
  clearInterval(this.collisionLoop);

  this.restartButton.show();
    }

restart() {
  this.restartButton.hide();

  this.score = 0;
  this.scoreDisplay.textContent = "Score: 0";

  // Reset player
  this.player.el.src = this.sprites.get("run").src;
  this.player.el.style.width = "";
  this.player.el.classList.remove("jump");

  // Reset enemy
  this.enemy.el.style.animation = "";
  this.enemy.el.style.left = "";
  this.enemy.speed = 2;
  this.enemy.el.style.animationDuration = "2s";

  // Reset fundo
  this.background.el.style.backgroundImage = `url(${this.background.fundos[0]})`;
  this.background.start();

  // Voltar música
  this.audio.started = false;

  // Reinicia loops
  this.start();
}

}
const game = new Game();
game.start();
