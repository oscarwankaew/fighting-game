/*global Sprite, Fighter, imageSrc, background, rectangularCollision, timerId, decreaseTimer, determineWinner, gsap*/

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 450,
    y: 108,
  },
  imageSrc: "./img/decorations/shop_anim.png",
  scale: 2.75,
  frameMax: 6,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samurai/Idle.png",
  frameMax: 8,
  scale: 2.5,
  offset: {
    x: 205,
    y: 155,
  },
  sprites: {
    idle: {
      imageSrc: "./img/samurai/Idle.png",
      frameMax: 8,
    },
    run: {
      imageSrc: "./img/samurai/Run.png",
      frameMax: 8,
    },
    jump: {
      imageSrc: "./img/samurai/Jump.png",
      frameMax: 2,
    },
    fall: {
      imageSrc: "./img/samurai/Fall.png",
      frameMax: 2,
    },
    attack1: {
      imageSrc: "./img/samurai/Attack1.png",
      frameMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samurai/Take_Hit.png",
      frameMax: 4,
    },
    death: {
      imageSrc: "./img/samurai/Death.png",
      frameMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 167.7,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 965,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: "blue",
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./img/kenji/Idle.png",
  frameMax: 4,
  scale: 2.4,
  offset: {
    x: 205,
    y: 155,
  },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      frameMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      frameMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      frameMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      frameMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      frameMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take_Hit.png",
      frameMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      frameMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -164.5,
      y: 50,
    },
    width: 164.5,
    height: 50,
  },
});

console.log(player);

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgba(255, 255, 255, 0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement
  if (keys.a.pressed && player.lastkey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastkey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }
  // jumping movement
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastkey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastkey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }
  // jumping movement
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collision
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.frameCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    // console.log("player attacking");
    // document.querySelector("#enemyHealth").style.width = enemy.health + "%";
    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }

  // detact for misses
  if (player.isAttacking && player.frameCurrent === 4) {
    player.isAttacking = false;
  }

  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.frameCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    // console.log("enemy attacking");
    // document.querySelector("#playerHealth").style.width = player.health + "%";
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }

  // detact for misses
  if (enemy.isAttacking && enemy.frameCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end the game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener("keydown", (event) => {
  // player keys
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastkey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastkey = "a";
        break;
      case "w":
        player.velocity.y = -20;
        break;
      case " ":
        player.attack();
        break;
    }
  }

  // enemy keys
  if (!enemy.dead) {
    switch (event.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastkey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastkey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  // player keys
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }
  // enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
