var gridX, gridY, player, gameSpeed;
var grid;
var record = [];
var bullet = [];
var ghosts = [];
var particles = [];

function setup() {
  createCanvas(window.innerHeight / 2, window.innerHeight);
  strokeWeight(0);
  fill(255);
  gridX = 11;
  gridY = 20;
  grid = new Grid(gridX, gridY)
  gameSpeed = 0.2;
  player = new Player();
}

function draw() {
  background(52);
  translate(width / gridX / 2, height / gridY / 2);
  drawBackground();
  player.update();
  player.show();
  ghosts.forEach((g) => {
    g.update();
    //g.show();
  });
  bullet.forEach((b) => {
    b.update();
    //b.show();
  });
  particles.forEach((p) => {
    p.update();
    p.show();
  });
  grid.update();
}

function keyPressed(e) {
  if (key === "W") player.control("UP");
  if (key === "S") player.control("DN");
  if (key === "A") player.control("LT");
  if (key === "D") player.control("RT");
  if (key === "Q") {
    player.shoot();
  }
  if (key === "E") {
    player.playback();

    ghosts.forEach((g) => {
      g.reset();
    });
  }
  ghosts.forEach((g) => {
    g.move();
  });
  bullet.forEach((b) => {
    b.move();
  });
  player.record();
  
  grid.update();
}

function drawBackground() {
  for (var x = 0; x < gridX; x++) {
    for (var y = 0; y < gridY; y++) {
      fill(255);
      ellipse((x * width) / gridX, (y * height) / gridY, 2, 2);
    }
  }
}

class Player {
  constructor() {
    this.name = "player";
    this.pos = createVector(0, 0);
    this.targetPos = this.pos;
    this.x = 0;
    this.y = 0;
    this.movement = [];
    this.gun = "pistol";
    this.fire = false;
  }
  update() {
    this.pos = p5.Vector.lerp(this.pos, this.targetPos, gameSpeed);
  }
  control(dir) {
    var px = this.x
    var py = this.y
    if (dir === "UP") this.y -= 1;

    if (dir === "DN") this.y += 1;

    if (dir === "LT") this.x -= 1;

    if (dir === "RT") this.x += 1;

    if (this.x >= gridX) {
      this.x = 0;
    } else if (this.y >= gridY) {
      this.y = 0;
    } else if (this.x < 0) {
      this.x = gridX - 1;
    } else if (this.y < 0) {
      this.y = gridY - 1;
    }
    grid.move(this, px, py);
    
    this.targetPos = createVector(this.x * width/ gridX, this.y * height/gridY);

    this.fire = false;
  }
  show() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 10, 10);
  }
  playback() {
    ghosts.push(new Ghost(this.movement));
    this.movement = [];

    this.pos = createVector(0, 0);
    this.targetPos = this.pos;
    this.x = 0;
    this.y = 0;
  }
  shoot() {
    this.fire = true;
    bullet.push(new Bullet(this.x, this.y, this.gun, bullet.length));
  }
  record() {
    this.movement.push([this.x, this.y, this.fire]);
  }
}

class Ghost {
  constructor(m) {
    this.i = 0;
    this.m = m;
    this.pos = createVector(0, 0);
    this.targetPos = this.pos;
    this.ogcolor = color(random(255), random(255), random(255));
    this.color = this.ogcolor;
    this.gun;
  }
  update() {
    this.pos = p5.Vector.lerp(this.pos, this.targetPos, gameSpeed);
  }
  move() {
    if (this.i < this.m.length) {
      this.color = this.ogcolor;
      this.targetPos = createVector(
        this.m[this.i][0] * width / gridX,
        this.m[this.i][1] * height / gridY
      );
      if (this.m[this.i][2]) {
        bullet.push(new Bullet(this.m[this.i][0], this.m[this.i][1], this.gun));
      }
      this.i++;
    } else {
      this.color = color(0, 0, 0, 0);
    }
  }
  show() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, 10, 10);
  }
  reset() {
    this.i = 0;
  }
}

class Bullet {
  constructor(x, y, t) {
    this.pos = createVector(x * width / gridX, y * (height / gridY - 1));
    this.targetPos = createVector(x * width / gridX, y * height / gridY);
    this.x = x;
    this.y = y;
  }
  update() {
    this.pos = p5.Vector.lerp(this.pos, this.targetPos, gameSpeed);
  }
  move() {
    this.y--;
    if (this.y >= 0) {
      this.targetPos.y = this.y * height/ gridY;
    } else if (this.y < 0) {
      removeBullet(bullet.indexOf(this));
      if (bullet.length > 0) {
        bullet[0].move();
      }
      //hack hack hakc hack hack bullet after deleting index is at 1 and doesn't run the new bullet[0], make a loop that runs outside? or does it in multiple steps
    }
  }
  show() {
    fill(0, 0, 255);
    push();
    translate(this.pos.x, this.pos.y);
    rect(-2, 0, 4, 10);
    pop();
  }
}

function removeBullet(i) {
  bullet.splice(i, 1);
}

class Particle {
  constructor(p, t) {
    this.pos = p;
    this.type = t;
    this.size = 100;
    this.speed;
    this.num;
    this.t = 0;
    this.time = 60;
  }
  update() {
    if(this.type === "circle"){
      if (this.t < this.time) {
        this.t++;
        push();
        //
        noFill();
        stroke(255);
        strokeWeight(10/this.t);
        translate(this.pos.x, this.pos.y);
        ellipse(0, 0, this.size- this.size/this.t, this.size- this.size/this.t);
        //
        pop();
      }
    }
  }
  show() {}
}

class Grid {
  constructor(gx, gy){
    this.a = [];
    for (var x = 0; x < gx; x++) {
      this.a[x] = [];
      for (var y = 0; y < gy; y++) {
        this.a[x][y] = 0;
      }
    }
  }
  move(entity, x, y){
    this.a[x][y] = 0
    this.a[entity.x][entity.y] = entity.name;
  }
  update(){
    for (var x = 0; x < this.a.length; x++) {
      for (var y = 0; y < this.a[x].length; y++) {
        var entity = this.a[x][y];
        if(entity != 0){
          this.show(entity, x, y)
        }
      }
    }
  }
                   
  show(entity, x, y){
    push();
    if(entity = "player"){
      fill(255);
      translate(x*width/gridX,y*height/gridY);
      ellipse(0,0,10,10);
    }
    else if(entity = "g"){
      fill(random(255),random(255),random(255));
      translate(x*width/gridX,y*height/gridY);
      ellipse(0,0,10,10);
    }
    pop();
  }
}