// Copyright © 2015 Demircan Celebi
// Licensed under the terms of the MIT License
'use strict';
var Player = function (game) {
  this.game = game;

  this.p = this.game.add.sprite(36, this.game.world.height - 100, 'dude');
  this.focus = this.game.add.sprite(36, this.game.world.height-100);
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

  this.p.animations.add('left', [0,1,2,3], 10, true);
  this.p.animations.add('right', [5,6,7,8], 10, true);

  this.lastDirection = 'right';
};

Player.prototype.fire = function() {
  var bullet = this.bullets.getFirstDead();
  this.game.physics.arcade.enable(bullet);

  bullet.reset(this.p.x + 10, this.p.y + 25);
  bullet.body.gravity.y = 300;

  this.game.physics.arcade.moveToPointer(bullet, 2500);
};

var GameState = function() {};

// var getArctan = function getArctan(slope) {
//   var deg = Math.atan(slope);
//   return deg * (180.0 / Math.PI);
// };

// Load images and sounds
GameState.prototype.preload = function() {
  this.game.load.image('block', '/assets/block.png');
  this.game.load.image('light', '/assets/light.png');
  this.game.load.image('ground', '/assets/grass.png');
  this.game.load.image('rifle', '/assets/rifle.png');
  this.game.load.image('crosshair', '/assets/target.png');
  this.game.load.image('jp', '/assets/jp.png');
  this.game.load.spritesheet('dude', '/assets/dude.png', 32, 48);
};

// Setup the example
GameState.prototype.create = function() {
  // Start arcade physics
  this.game.physics.startSystem(Phaser.Physics.ARCADE);

  this.game.world.setBounds(0, 0, 2000, 1200);

  // Set stage background color
  this.game.stage.backgroundColor = 0x4488cc;

  // Add a second light and move it back and forth forever
  var NUMBER_OF_WALLS = 5;
  this.walls = this.game.add.group();
  this.walls.enableBody = true;
  this.platforms = this.game.add.group();
  var i, x, y;
  for(i = 0; i < NUMBER_OF_WALLS; i++) {
      x = i * this.game.width/NUMBER_OF_WALLS + 50;
      y = this.game.rnd.integerInRange(850, this.game.height - 100);
      var wall = this.walls.create(x, y, 'ground');
      wall.body.immovable = true;
  }

  // Create platforms
  this.player = new Player(this.game);

  this.platforms.enableBody = true;

  for ( var j = 0; j < 40; j++) {
    var ground = this.platforms.create(j * 70, this.game.world.height - 36, 'ground');

    ground.body.immovable = true;
  }

  // Create player
  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.game.inputEnabled = true;

  this.crosshair = this.game.add.sprite(0, 0, 'crosshair');
  this.game.input.onDown.add(this.player.fire, this.player);

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

    this.game.context.fillStyle = 'rgba(255,0,0,0.6)';
    //this.game.context.fillRect(zone.x, zone.y, zone.width, zone.height);

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
  if((this.crosshair.x - 10) > this.player.p.body.x) {

    // Looking to right
    this.player.lastDirection = 'right';
  } else {

    // Looking to left
    this.player.lastDirection = 'left';
  }

  if (this.cursors.left.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {

    // Going to left
    if(this.usingJetpack) {
      this.player.p.body.velocity.x += -65;
      this.player.jetpackEmitter.x = this.player.p.body.x + 23;
    } else {
      this.player.p.body.velocity.x += -35;
    }

    this.player.p.animations.play(this.player.lastDirection);

  } else if(this.cursors.right.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {

    // Going to right
    if(this.usingJetpack) {
      this.player.jetpackEmitter.x = this.player.p.body.x + 10;
      this.player.p.body.velocity.x += 65;
    } else {
      this.player.p.body.velocity.x += 35;
    }

    this.player.p.animations.play(this.player.lastDirection);
  } else {
    if (this.player.lastDirection === 'left') {
      this.player.jetpackEmitter.x = this.player.p.body.x + 23;
      this.player.p.frame = 2;
    } else {
      this.player.jetpackEmitter.x = this.player.p.body.x + 10;
      this.player.p.frame = 5;
    }
    this.player.p.animations.stop();
  }

  this.player.jetpackEmitter.y = this.player.p.body.y + 45;


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

  // this.rifle.anchor.setTo(0.3, 0.3);
  // this.rifle.angle = -55 - getArctan((this.crosshair.x - this.rifle.x)/(this.crosshair.y - this.rifle.y));
  // this.rifle.x = this.player.p.body.x + 15;
  // this.rifle.y = this.player.p.body.y + 30;
};

// Setup game
var game = new Phaser.Game(1400, 600, Phaser.CANVAS, 'game');
game.state.add('game', GameState, true);
