let player;
let projectiles = [];
let floorHeight = 80;

function setup() {
  let canvas = createCanvas(750, 550);
  canvas.parent('main-game');
  player = new Player();
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
    this.gravity = 0.13;
    this.jumpForce = -7;
    this.onGround = false;

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
  }

  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;
    
    let p = new Projectile(
      this.x + this.w / 2, 
      this.y + this.h / 2, 
      this.facing, 
      300 // increased distance for fun
    );
    projectiles.push(p);
  }

  show() {
    // Draw Player
    fill(255, 100, 100);
    rect(this.x, this.y, this.w, this.h);

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
    fill(255, 255, 0);
    noStroke();
    rect(this.x, this.y, 14, 7);
  }
}
