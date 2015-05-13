// Copyright © 2015 Demircan Celebi
// Licensed under the terms of the MIT License
'use strict';

var GameState = function(game) {};

// Load images and sounds
GameState.prototype.preload = function() {
  this.game.load.image('block', '/assets/block.png');
  this.game.load.image('light', '/assets/light.png');
  this.game.load.image('ground', '/assets/grass.png');
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
      y = this.game.rnd.integerInRange(350, this.game.height - 300);
      var wall = this.walls.create(x, y, 'ground');
      wall.body.immovable = true;
  }

  console.log(this.walls);

  // Show FPS
  this.game.time.advancedTiming = true;
  this.fpsText = this.game.add.text(20, 20, '', { font: '16px Arial', fill: '#ffffff' });

  // Create platforms
  this.platforms.enableBody = true;

  for ( var j = 0; j < 12; j++) {
    var ground = this.platforms.create(j * 70, this.game.world.height - 36, 'ground');

    ground.body.immovable = true;
  }

  // Create player
  this.player = this.game.add.sprite(36, this.game.world.height - 100, 'dude');
  this.player.life = 100;
  this.game.physics.arcade.enable(this.player);

  this.player.body.bounce.y = 0;
  this.player.body.gravity.y = 3000;
  this.player.body.collideWorldBounds = true;

  this.player.animations.add('left', [0,1,2,3], 10, true);
  this.player.animations.add('right', [5,6,7,8], 10, true);

  this.cursors = this.game.input.keyboard.createCursorKeys();
  this.lastDirection = 'right';

  this.lifeBarBorder = this.game.add.sprite(this.game.width - 210, 20, 'block');
  this.lifeBarBorder.scale.setTo(this.player.life/20, 0.4);
  this.lifeBarBorder.tint = 0x0033CC;
  this.lifeBar = this.game.add.sprite(this.game.width - 210, 20, 'block');
};

// The update() method is called every frame
GameState.prototype.update = function() {
  if (this.game.time.fps !== 0) {
    this.fpsText.setText(this.game.time.fps + ' FPS');
  }

  this.lifeBar.scale.setTo(this.player.life/20, 0.4);
  this.lifeBar.tint = 0x45ed45;

  this.barWidth = this.player.life;

  this.game.physics.arcade.collide(this.player, this.platforms);
  this.game.physics.arcade.collide(this.player, this.walls);

  // Player movement
  this.player.body.velocity.x = 0;
  if (this.cursors.left.isDown) {
    this.player.body.velocity.x = -400;
    this.lastDirection = 'left';
    this.player.animations.play(this.lastDirection);
  } else if(this.cursors.right.isDown) {
    this.player.body.velocity.x = 400;
    this.lastDirection = 'right';
    this.player.animations.play(this.lastDirection);
  } else {
    if (this.lastDirection === 'left') {
      this.player.frame = 2;
    } else {
      this.player.frame = 5;

    }
    this.player.animations.stop();
  }

  if (this.cursors.up.isDown && this.player.body.touching.down) {
    this.player.body.velocity.y = -1000;
  }
};

// Setup game
var game = new Phaser.Game(800, 450, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);