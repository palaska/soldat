// Copyright © 2015 Demircan Celebi
// Licensed under the terms of the MIT License
'use strict';

var GameState = function(game) {};
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
  this.game.load.image('crosshair', '/assets/crosshair.png');
  this.game.load.image('jp', '/assets/jp.png');
  this.game.load.spritesheet('dude', '/assets/dude.png', 32, 48);
};

// Setup the example
GameState.prototype.create = function() {
  // Start arcade physics
  this.game.physics.startSystem(Phaser.Physics.ARCADE);

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
      y = this.game.rnd.integerInRange(450, this.game.height - 300);
      var wall = this.walls.create(x, y, 'ground');
      wall.body.immovable = true;
  }

  // Show FPS
  this.game.time.advancedTiming = true;
  this.fpsText = this.game.add.text(20, 20, '', { font: '16px Arial', fill: '#ffffff' });

  // Create platforms
  this.platforms.enableBody = true;

  for ( var j = 0; j < 20; j++) {
    var ground = this.platforms.create(j * 70, this.game.world.height - 36, 'ground');

    ground.body.immovable = true;
  }

  // Create player
  this.player = this.game.add.sprite(36, this.game.world.height - 100, 'dude');
  this.player.life = 100;
  this.player.jetpack = 100;
  this.game.physics.arcade.enable(this.player);

  this.bullets = this.game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

  this.bullets.createMultiple(50, 'jp');
  this.bullets.setAll('checkWorldBounds', true);
  this.bullets.setAll('outOfBoundsKill', true);

  this.jetpackEmitter = this.game.add.emitter(this.player.body.x + 10, this.player.body.y + 45);
  this.jetpackEmitter.bounce.setTo(0.5, 0.5);
  this.jetpackEmitter.setYSpeed(500,700);
  this.jetpackEmitter.makeParticles('jp', 1, 250, 1, true);

  this.player.body.bounce.y = 0;
  this.player.body.gravity.y = 3000;
  this.player.body.maxVelocity.x = 400;
  this.player.body.maxVelocity.y = 1000;
  this.player.body.collideWorldBounds = true;

  this.player.animations.add('left', [0,1,2,3], 10, true);
  this.player.animations.add('right', [5,6,7,8], 10, true);

  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.lastDirection = 'right';

  this.lifeBarBorder = this.game.add.sprite(this.game.width - 210, 20, 'block');
  this.lifeBarBorder.scale.setTo(this.player.life/20, 0.4);
  this.lifeBarBorder.tint = 0x0033CC;
  this.lifeBar = this.game.add.sprite(this.game.width - 210, 20, 'block');
  this.lifeBar.tint = 0x45ed45;

  this.jetpackBorder = this.game.add.sprite(this.game.width - 430, 20, 'block');
  this.jetpackBorder.scale.setTo(this.player.life/20, 0.4);
  this.jetpackBorder.tint = 0x003399;
  this.jetpackBar = this.game.add.sprite(this.game.width - 430, 20, 'block');
  this.jetpackBar.tint = 0x0033CC;

  this.crosshair = game.add.sprite(16, 16, 'crosshair');
  this.game.input.addMoveCallback(this.onMouseMove, this);
  this.game.input.onDown.add(this.fire, this);

};

// The update() method is called every frame
GameState.prototype.update = function() {
  // Collisions
  this.game.physics.arcade.collide(this.player, this.platforms);
  this.game.physics.arcade.collide(this.player, this.walls);
  this.game.physics.arcade.collide(this.bullets, this.walls, this.collisionHandler);
  this.game.physics.arcade.collide(this.bullets, this.platforms, this.collisionHandler);

  // Jetpack & Movement
  this.updateJetpack();
  this.updateMovement();

  this.updateHUD();
};

GameState.prototype.collisionHandler = function (bullet, obj) {
  bullet.kill();

  // TODO: if obj is another player, decrease his life
};

GameState.prototype.onMouseMove = function(pointer, x, y, downState) {
  this.crosshair.x = x - 8;
  this.crosshair.y = y - 8;
};

GameState.prototype.fire = function() {
  var bullet = this.bullets.getFirstDead();

  bullet.reset(this.player.x + 10, this.player.y + 25);

  this.game.physics.arcade.moveToPointer(bullet, 2000);
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
    this.player.body.velocity.y += -70;
    this.player.jetpack += -2;
    if(this.jetpackEmitter.on === false) {
      this.jetpackEmitter.start(false, 1000, 20);
    }
    this.usingJetpack = true;
  } else {
    this.usingJetpack = false;
    if (this.player.jetpack < 100) {
      this.player.jetpack += 0.4;
    }
  }

  if(this.usingJetpack) {
    this.player.body.maxVelocity.x = 800;
  } else {
    this.jetpackEmitter.on = false;
    this.player.body.maxVelocity.x = 400;
  }
};

GameState.prototype.updateMovement = function() {
  if((this.crosshair.x - 10) > this.player.body.x) {
    this.lastDirection = 'right';
  } else {
    this.lastDirection = 'left';
  }

  // Player movement
  if (this.cursors.left.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
    if(this.usingJetpack) {
      this.player.body.velocity.x += -65;
      this.jetpackEmitter.x = this.player.body.x + 23;
    } else {
      this.player.body.velocity.x += -35;
    }

    this.player.animations.play(this.lastDirection);
  } else if(this.cursors.right.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
    if(this.usingJetpack) {
      this.jetpackEmitter.x = this.player.body.x + 10;
      this.player.body.velocity.x += 65;
    } else {
      this.player.body.velocity.x += 35;
    }

    this.player.animations.play(this.lastDirection);
  } else {
    if (this.lastDirection === 'left') {
      this.jetpackEmitter.x = this.player.body.x + 23;
      this.player.frame = 2;
    } else {
      this.jetpackEmitter.x = this.player.body.x + 10;
      this.player.frame = 5;
    }
    this.player.animations.stop();
  }

  this.jetpackEmitter.y = this.player.body.y + 45;


  if ((this.cursors.up.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.W)) && this.player.body.touching.down) {
    this.player.body.velocity.y = -800;
  }
  if ((this.cursors.down.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.S)) && !this.player.body.touching.down) {
    this.player.body.velocity.y += 100;
  }

  if(this.player.body.velocity.x < 0) {
    this.player.body.velocity.x += 20;
  } else if(this.player.body.velocity.x > 0) {
    this.player.body.velocity.x -= 20;
  }

  // this.rifle.anchor.setTo(0.3, 0.3);
  // this.rifle.angle = -55 - getArctan((this.crosshair.x - this.rifle.x)/(this.crosshair.y - this.rifle.y));
  // this.rifle.x = this.player.body.x + 15;
  // this.rifle.y = this.player.body.y + 30;
};

// Setup game
var game = new Phaser.Game(1420, 700, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);