// Copyright © 2015 Demircan Celebi
// Licensed under the terms of the MIT License
'use strict';
var Player = function (game) {
  this.game = game;

  this.p = this.game.add.sprite(canvasWidth + 500, 3000 - canvasHeight - 500, 'newdude');
  this.focus = this.game.add.sprite(canvasWidth + 100, 3000 - canvasHeight - 100);
  this.game.physics.arcade.enable(this.p);

  this.life = 100;
  this.jetpack = 100;
  this.bullets = this.game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

  this.bullets.createMultiple(50, 'jp');
  this.bullets.setAll('checkWorldBounds', true);
  this.bullets.setAll('outOfBoundsKill', true);

  this.jetpackEmitter = this.game.add.emitter(this.p.body.x + 10, this.p.body.y + 45);
  this.jetpackEmitter.bounce.setTo(0.5, 0.5);
  this.jetpackEmitter.setYSpeed(500,700);
  this.jetpackEmitter.makeParticles('jp', 1, 250, 1, true);
  this.jetpackEmitter.maxParticleScale = 0.1;

  this.p.body.bounce.y = 0;
  this.p.body.gravity.y = 3000;
  this.p.body.maxVelocity.x = 400;
  this.p.body.maxVelocity.y = 1000;
  this.p.body.collideWorldBounds = true;

  this.p.animations.add('left',           [28,29,30,31,32,33,34,35], 10, true);
  this.p.animations.add('leftbackwards',  [35,34,33,32,31,30,29,28], 10, true);
  this.p.animations.add('right',          [46,47,48,49,50,51,52,53], 10, true);
  this.p.animations.add('rightbackwards', [53,52,51,50,49,48,47,46], 10, true);

  this.lastDirection = 'right';
};

Player.prototype.fire = function() {
  var bullet = this.bullets.getFirstDead();
  this.game.physics.arcade.enable(bullet);

  bullet.reset(this.p.body.x + 45, this.p.body.y + 60);
  bullet.body.gravity.y = 300;

  this.game.physics.arcade.moveToPointer(bullet, 2500);
};

var GameState = function() {};

var getArctan = function getArctan(slope) {
  var deg = Math.atan(slope);
  return deg * (180.0 / Math.PI);
};

// Load images and sounds
GameState.prototype.preload = function() {
  this.game.load.image('block', '/assets/block.png');
  this.game.load.image('light', '/assets/light.png');
  this.game.load.image('ground', '/assets/grass.png');
  this.game.load.image('rifle', '/assets/rifle.png');
  this.game.load.image('crosshair', '/assets/target.png');
  this.game.load.image('jp', '/assets/jp.png');
  this.game.load.spritesheet('newdude', '/assets/newdude.png', 100, 100);
};

// Setup the example
GameState.prototype.create = function() {
  // Start arcade physics
  this.game.physics.startSystem(Phaser.Physics.ARCADE);

  this.game.world.setBounds(0, 0, 5000, 3000);

  // Set stage background color
  this.game.stage.backgroundColor = 0x4488cc;

  // Add a second light and move it back and forth forever
  var NUMBER_OF_WALLS = 30;
  this.walls = this.game.add.group();
  this.walls.enableBody = true;
  this.platforms = this.game.add.group();
  var i, x, y;
  for(i = 0; i < NUMBER_OF_WALLS; i++) {
      x = i * (5000 - canvasWidth*2)/NUMBER_OF_WALLS + 50 + canvasWidth;
      y = this.game.rnd.integerInRange(canvasHeight + 200, 3000 - canvasHeight - 100);
      var wall = this.walls.create(x, y, 'ground');
      wall.body.immovable = true;
  }

  // Create platforms
  this.player = new Player(this.game);

  this.platforms.enableBody = true;

  for ( var j = 0; j < 80; j++) {
    var ground = this.platforms.create(j * 70, this.game.world.height - canvasHeight - 36, 'ground');
    var leftWall = this.platforms.create(canvasWidth , j * 70,'ground');
    var rightWall = this.platforms.create(5000 - canvasWidth, j * 70, 'ground');
    var ceiling = this.platforms.create(j*70 ,canvasHeight + 36, 'ground');
    ceiling.anchor.setTo(0.5,0.5);
    leftWall.anchor.setTo(0.5,0.5);
    rightWall.anchor.setTo(0.5,0.5);
    
    ceiling.angle = 180;
    leftWall.angle = 90;
    rightWall.angle = 270;

    ground.body.immovable = true;
    ceiling.body.immovable = true;
    leftWall.body.immovable = true;
    rightWall.body.immovable = true;
  }

  // Empty black spaces
  var graphics = this.game.add.graphics(0, 0);
  graphics.beginFill(0x000000);
  
  graphics.moveTo(0,0);
  graphics.lineTo(5000,0);
  graphics.lineTo(5000,3000);
  graphics.lineTo(0,3000);
  graphics.lineTo(0,0);
  graphics.lineTo(canvasWidth,canvasHeight);
  graphics.lineTo(canvasWidth,3000-canvasHeight);
  graphics.lineTo(5000-canvasWidth,3000-canvasHeight);
  graphics.lineTo(5000 - canvasWidth,canvasHeight);
  graphics.lineTo(canvasWidth,canvasHeight);
  graphics.endFill();



  // Create player
  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.game.inputEnabled = true;
  this.crosshair = this.game.add.sprite(0, 0, 'crosshair');
  this.game.input.onDown.add(this.player.fire, this.player);

  this.rifle = this.game.add.sprite(0,0, 'rifle');

  this.createHUD();
};

GameState.prototype.createHUD = function() {
  // Show FPS
  this.game.time.advancedTiming = true;
  this.fpsText = this.game.add.text(20, 20, '', { font: '16px Arial', fill: '#ffffff' });
  this.fpsText.fixedToCamera = true;

  this.lifeBarBorder = this.game.add.sprite(this.game.width - 210, 20, 'block');
  this.lifeBarBorder.scale.setTo(this.player.life/20, 0.4);
  this.lifeBarBorder.tint = 0x0033CC;
  this.lifeBar = this.game.add.sprite(this.game.width - 210, 20, 'block');
  this.lifeBar.tint = 0x45ed45;

  this.lifeBarBorder.fixedToCamera = true;
  this.lifeBar.fixedToCamera = true;

  this.jetpackBorder = this.game.add.sprite(this.game.width - 430, 20, 'block');
  this.jetpackBorder.scale.setTo(this.player.life/20, 0.4);
  this.jetpackBorder.tint = 0x003399;
  this.jetpackBar = this.game.add.sprite(this.game.width - 430, 20, 'block');
  this.jetpackBar.tint = 0x0033CC;

  this.jetpackBorder.fixedToCamera = true;
  this.jetpackBar.fixedToCamera = true;
};

GameState.prototype.update = function() {
  // Collisions
  this.game.physics.arcade.collide(this.player.p, this.platforms);
  this.game.physics.arcade.collide(this.player.p, this.walls);
  this.game.physics.arcade.collide(this.player.bullets, this.walls, this.collisionHandler);
  this.game.physics.arcade.collide(this.player.bullets, this.platforms, this.collisionHandler);

  //update camera focus
  this.player.focus.position.x = (this.player.p.position.x+this.game.input.mousePointer.worldX)/2;
  this.player.focus.position.y = (this.player.p.position.y+this.game.input.mousePointer.worldY)/2;

  this.game.camera.follow(this.player.focus);
  //this.game.camera.deadzone = new Phaser.Rectangle(this.game.width/2 - 100, this.game.height - 200, 200, 10);

  // Jetpack & Movement
  this.updateJetpack();
  this.updateMovement();
  this.updateCrosshair((this.game.input.mousePointer.worldX - 8), (this.game.input.mousePointer.worldY - 8));
  this.updateHUD();
};

GameState.prototype.render = function() {
    //var zone = this.game.camera.deadzone; 
    this.game.debug.cameraInfo(this.game.camera, 32, 32);
    this.game.debug.spriteCoords(this.player.p, 32, 500);
};

GameState.prototype.collisionHandler = function (bullet, obj) {
  bullet.kill();

  // TODO: if obj is another player, decrease his life
};


GameState.prototype.updateCrosshair = function(x, y) {
  this.crosshair.x = x;
  this.crosshair.y = y;
};

GameState.prototype.updateHUD = function() {
  if (this.game.time.fps !== 0) {
    this.fpsText.setText(this.game.time.fps + ' FPS');
  }
  this.lifeBar.scale.setTo(this.player.life/20, 0.4);
  this.jetpackBar.scale.setTo(this.player.jetpack/20, 0.4);

  this.barWidth = this.player.life;
};

GameState.prototype.updateJetpack = function() {
  if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && (this.player.jetpack > 2)) {
    this.player.p.body.velocity.y += -70;
    // this.player.jetpack += -2;
    if(this.player.jetpackEmitter.on === false) {
      this.player.jetpackEmitter.start(false, 1000, 20);
    }
    this.usingJetpack = true;
  } else {
    this.usingJetpack = false;
    if (this.player.jetpack < 100) {
      this.player.jetpack += 0.4;
    }
  }

  if(this.usingJetpack) {
    this.player.p.body.maxVelocity.x = 800;
  } else {
    this.player.jetpackEmitter.on = false;
    this.player.p.body.maxVelocity.x = 400;
  }
};

GameState.prototype.updateMovement = function() {
  

  if (this.cursors.left.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
    if(this.usingJetpack) {
      this.player.p.body.velocity.x += -65;
    } else {
      this.player.p.body.velocity.x += -35;
    }

    if(this.crosshair.x-10 < this.player.p.body.x){
      this.player.lastDirection = 'left';
    }else this.player.lastDirection = 'rightbackwards';
    this.player.p.animations.play(this.player.lastDirection);
  } 
  else if(this.cursors.right.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
  //else if(this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
    if(this.usingJetpack) {
      this.player.p.body.velocity.x += 65;
    } 
    else {
      this.player.p.body.velocity.x += 35;
    }
    
    if(this.crosshair.x-10 > this.player.p.body.x){
      this.player.lastDirection = 'right';
    }else this.player.lastDirection = 'leftbackwards';
    this.player.p.animations.play(this.player.lastDirection);  
  }else{
    if(this.crosshair.x-10 > this.player.p.body.x){
      this.player.p.frame = 45;
    }else{
      this.player.p.frame = 27;
    }
  this.player.p.animations.stop();
  }

  this.player.jetpackEmitter.x = this.player.p.body.x + 50;
  this.player.jetpackEmitter.y = this.player.p.body.y + 110;


  if ((this.cursors.up.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.W)) && this.player.p.body.touching.down) {
    this.player.p.body.velocity.y = -800;
  }
  if ((this.cursors.down.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.S)) && !this.player.p.body.touching.down) {
    this.player.p.body.velocity.y += 100;
  }

  if(this.player.p.body.velocity.x < 0) {
    this.player.p.body.velocity.x += 20;
  } else if(this.player.p.body.velocity.x > 0) {
    this.player.p.body.velocity.x -= 20;
  }

  this.rifle.anchor.setTo(0.3, 0.3);
  this.rifle.x = this.player.p.body.x + 45;
  this.rifle.y = this.player.p.body.y + 60;

  var angleWithPos = getArctan((this.crosshair.y - this.rifle.y)/(this.crosshair.x - this.rifle.x));

  if (this.crosshair.x - 10 > this.rifle.x && this.rifle.scale.x > 0){
      this.rifle.angle = angleWithPos + 35;
  }else if (this.crosshair.x -10 > this.rifle.x && this.rifle.scale.x < 0){
      this.rifle.scale.x *= -1;
      this.rifle.angle = angleWithPos + 35;
  }else if (this.crosshair.x - 10 < this.rifle.x && this.rifle.scale.x < 0){
      this.rifle.angle = angleWithPos - 35;
  }else {
      this.rifle.scale.x *= -1;
      this.rifle.angle = angleWithPos - 35;
  }



};

// Setup game
var canvasWidth = 1400;
var canvasHeight = 800;

var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, 'game');
game.state.add('game', GameState, true);
