let player;
let projectiles = [];
let floorHeight = 80;
let playerImg;
let flameImg;
let harvesterImg;
let shockImg;

let harvesters = [];
let currentBossIndex = 0;

let gameState = "fight"; // "fight", "win", "lose"

function setup() {
  let canvas = createCanvas(750, 550);
  canvas.parent('main-game');
  noSmooth();
  player = new Player();
  for (let i = 0; i < 4; i++) {
  harvesters.push(new Harvester(i)); // pass difficulty index
}
}

function draw() {
  background(40);

  // Draw the floor
  fill(80);
  rect(0, height - floorHeight, width, floorHeight);

  player.update();
  player.show();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].show();
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  if (gameState === "fight") {
  let boss = harvesters[currentBossIndex];

  if (boss && boss.active) {
    boss.update();
    boss.show();
  } else if (boss && !boss.active) {
    currentBossIndex++;
    if (currentBossIndex >= harvesters.length) {
      gameState = "win";
    }
  }

  if (player.health <= 0) {
    gameState = "lose";
  }
} else {
  drawEndScreen();
}
}

function preload() {
  playerImg = loadImage('art/astronaut.png');
  flameImg = loadImage('art/flame.png');
  harvesterImg = loadImage('art/harvester.png');
  shockImg = loadImage('art/shock.png');
}

function keyPressed() {
  // Space to Jump
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) {
    player.jump();
  }

  // 'F' or Enter to Shoot
  /*if (key === ' ' || keyCode === ENTER) {
    let p = new Projectile(
      player.x + player.w / 2, 
      player.y + player.h / 2, 
      player.facing, 
      200 // Max distance of 200 pixels
    );
    projectiles.push(p);
  }*/
}

function drawEndScreen() {
  background(20);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);
text(gameState === "win" ? "YOU WIN" : "YOU LOSE", width / 2, height / 2);

// Button
fill(100);
rect(width / 2 - 75, height / 2 + 40, 150, 50);

fill(255);
textSize(20);
text("REPLAY", width / 2, height / 2 + 65);
}

function restartGame() {
  player = new Player();

  harvesters = [];
  for (let i = 0; i < 4; i++) {
    harvesters.push(new Harvester(i));
  }

  currentBossIndex = 0;
  projectiles = [];
  gameState = "fight";
}

function mousePressed() {
  if (gameState !== "fight") {
    // check button click
    if (
      mouseX > width / 2 - 75 &&
      mouseX < width / 2 + 75 &&
      mouseY > height / 2 + 40 &&
      mouseY < height / 2 + 90
    ) {
      restartGame();
    }
  }
}

class Player {
  constructor() {
    // ... (keep your existing position/physics variables)
    this.x = 200;
    this.y = 300;
    this.w = 40;
    this.h = 40;
    this.vx = 0;
    this.accel = 0.8;
    this.friction = 0.9;
    this.facing = 1;
    this.vy = 0;
    this.gravity = 0.1;
    this.jumpForce = -8;
    this.onGround = false;
    this.health = 5;
    this.invincibleTimer = 0;

    // --- New Ammo & Shooting Properties ---
    this.maxAmmo = 60;
    this.ammo = 60;
    this.ammoCost = 5;      // Cost per bullet
    this.rechargeRate = 0.25; // Ammo recovered per frame
    this.shootCooldown = 6; // Frames between shots (lower = faster fire)
    this.shootTimer = 0;
  }

  update() {
    // ... (keep your existing movement/physics code)
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { this.vx -= this.accel; this.facing = -1; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { this.vx += this.accel; this.facing = 1; }
    this.vx *= this.friction;
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y >= height - this.h - floorHeight) {
      this.y = height - this.h - floorHeight;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    this.x = constrain(this.x, 0, width - this.w);

    // --- Shooting Logic ---
    if (this.shootTimer > 0) this.shootTimer--;

    // Check if fire key is held (Space or Enter)
    if ((keyIsDown(32) || keyIsDown(ENTER)) && this.shootTimer <= 0 && this.ammo >= this.ammoCost) {
      this.shoot();
    } else {
      // Only recharge if not shooting
      this.ammo = min(this.maxAmmo, this.ammo + this.rechargeRate);
    }
    if (this.invincibleTimer > 0) this.invincibleTimer--;
  }

  takeDamage(amount) {
  if (this.invincibleTimer <= 0) {
    this.health -= amount;
    this.invincibleTimer = 60; // 1 second at 60 FPS
  }
}

  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;
    
    let offsetX = this.facing === 1 ? this.w : 0;

let p = new Projectile(
  this.x + offsetX, 
  this.y + this.h / 2, 
  this.facing, 
  300
);
    projectiles.push(p);
  }

  show() {
    // Draw Player
    push();
translate(this.x + this.w / 2, this.y + this.h / 2);

scale(this.facing, 1); // flips if facing = -1

imageMode(CENTER);
image(playerImg, 0, 0, this.w, this.h);

pop();

    // --- Draw Ammo Bar ---
    let barWidth = 100;
    let barHeight = 10;
    let xOffset = this.x - (barWidth - this.w) / 2;
    let yOffset = this.y - 15;

    // Background (gray)
    fill(50);
    rect(xOffset, yOffset, barWidth, barHeight);
    // Fill (cyan)
    fill(0, 255, 255);
    let currentBarWidth = map(this.ammo, 0, this.maxAmmo, 0, barWidth);
    rect(xOffset, yOffset, currentBarWidth, barHeight);
    // Health display (hearts or blocks)
for (let i = 0; i < this.health; i++) {
  fill(255, 0, 0);
  rect(20 + i * 25, 20, 20, 20);
}
  }

  jump() {
    if (this.onGround) this.vy = this.jumpForce;
  }
}

class Projectile {
  constructor(x, y, direction, maxDist) {
    this.startX = x;
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.dir = direction; // 1 for right, -1 for left
    this.maxDist = maxDist;
    this.active = true;
  }

  update() {
    this.x += this.speed * this.dir;
    
    // Check if it has exceeded the max distance
    if (abs(this.x - this.startX) > this.maxDist) {
      this.active = false;
    }
  }

  show() {
    push();
translate(this.x, this.y);

scale(this.dir, 1);

imageMode(CENTER);
image(flameImg, 0, 0, 24, 24);

pop();
  }
}

class Harvester {
  constructor(level) {
  this.level = level;

  this.scale = 2.5;
  this.w = 128 * this.scale;
  this.h = 128 * this.scale;

  this.x = width + this.w;
  this.y = height - floorHeight - this.w + (23 * this.scale);

  this.speed = 2 + level; // harder = faster
  this.active = true;

  this.maxHealth = 200 + level * 150;
  this.health = this.maxHealth;

  this.attackTimer = 120;
  this.shocks = [];

  this.state = "enter"; // enter, idle, charge
}

  update() {
  // --- ENTRY ---
  if (this.state === "enter") {
    if (this.x > width - 200) {
      this.x -= this.speed;
    } else {
      this.state = "idle";
    }
  }

  // --- ATTACKS (only for bosses 1–3) ---
  if (this.level > 0 && this.state === "idle") {
    this.attackTimer--;

    if (this.attackTimer <= 0) {
      if (random() < 0.5) {
        this.fireShock();
      } else {
        this.state = "charge";
        this.chargeDir = -1;
      }

      this.attackTimer = 120 - this.level * 20;
    }
  }

  // --- CHARGE ---
  if (this.state === "charge") {
    this.x += this.chargeDir * (4 + this.level * 1.5);

    // hit player
    if (this.hitPlayer()) {
      player.takeDamage(1);
    }

    if (this.x < 0) {
      this.chargeDir = 1;
    }

    if (this.x > width - 200) {
      this.state = "idle";
    }
  }

  // --- PROJECTILE COLLISION ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    if (this.hit(p)) {
      this.health -= 10;
      p.active = false;
    }
  }

  // --- SHOCKS ---
  for (let i = this.shocks.length - 1; i >= 0; i--) {
    let s = this.shocks[i];
    s.update();
    s.show();
    if (!s.active) this.shocks.splice(i, 1);
  }

  if (this.health <= 0) {
    this.active = false;
  }
}

fireShock() {
  let dir = player.x < this.x ? -1 : 1;

  this.shocks.push(
    new Shock(this.x + this.w / 2, this.y + this.h - floorHeight-this.scale, dir, 6 + this.level)
  );
}

hitPlayer() {
  let margin = 25 * this.scale;

  return (
    player.x < this.x + this.w - margin &&
    player.x + player.w > this.x + margin &&
    player.y < this.y + this.h - margin &&
    player.y + player.h > this.y + margin
  );
}

  hit(p) {
  let margin = 25 * this.scale;

  return (
    p.x > this.x + margin &&
    p.x < this.x + this.w - margin &&
    p.y > this.y + margin &&
    p.y < this.y + this.h - margin
  );
}

  show() {
    if (!this.active) return;
    // Warning flash before attack
if (this.attackTimer < 30 && this.state === "idle" && this.level > 0) {
  fill(255, 0, 0, 150);
  ellipse(this.x + this.w / 2, this.y - 40, 30, 30);
}
    // Draw boss
    image(harvesterImg, this.x, this.y, this.w, this.h);

    // --- Health bar ---
    let barWidth = 150;
    let barHeight = 12;

    let healthRatio = this.health / this.maxHealth;

    fill(50);
    rect(this.x, this.y - 20, barWidth, barHeight);

    fill(255, 0, 0);
    rect(this.x, this.y - 20, barWidth * healthRatio, barHeight);
  }
}

class Shock {
  constructor(x, y, dir, speed) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.active = true;
  }

  update() {
    this.x += this.speed * this.dir;

    // hit player
    if (
      this.x > player.x &&
      this.x < player.x + player.w &&
      this.y > player.y &&
      this.y < player.y + player.h
    ) {
      player.takeDamage(1);
      this.active = false;
    }

    // off screen
    if (this.x < 0 || this.x > width) {
      this.active = false;
    }
  }

  show() {
    push();
    translate(this.x, this.y);
    scale(this.dir, 1);
    imageMode(CENTER);
    image(shockImg, 0, 0, 32, 32);
    pop();
  }
}