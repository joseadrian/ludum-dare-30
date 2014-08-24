(function() {
  var Juego = { Preload: function() {}, Game: function() {} };
  Juego.WIDTH  = 480;
  Juego.HEIGHT = 320;

  var game = new Phaser.Game(Juego.WIDTH, Juego.HEIGHT, Phaser.AUTO, 'game');


  Juego.Preload.prototype = {
    preload: function() {
      this.stage.backgroundColor = '#eee';

      this.load.image('background', 'assets/img/bg.png');
      this.load.image('ground', 'assets/img/ground.png');
      this.load.image('player', 'assets/img/player.png', 10, 10);

      this.load.spritesheet('players', 'assets/img/player-sprite.png', 20, 20, 8);

      this.load.image('platform-fuego', 'assets/img/platform-fuego.png', 10, 10);
      this.load.image('platform-aire', 'assets/img/platform-aire.png', 10, 10);
      this.load.image('platform-tierra', 'assets/img/platform-tierra.png', 10, 10);
      this.load.image('platform-agua', 'assets/img/platform-agua.png', 10, 10);

      this.load.image('ataque-fuego', 'assets/img/ataque-fuego.png', 16, 18);
      this.load.image('ataque-aire', 'assets/img/ataque-aire.png', 22, 14);
      this.load.image('ataque-tierra', 'assets/img/ataque-tierra.png', 18, 18);
      this.load.image('ataque-agua', 'assets/img/ataque-agua.png', 18, 18);

      this.load.image('boss-fuego', 'assets/img/gellon.png', 16, 18);
      this.load.image('boss-aire', 'assets/img/govil.png', 22, 14);
      this.load.image('boss-tierra', 'assets/img/madro.png', 18, 18);
      this.load.image('boss-agua', 'assets/img/poil.png', 18, 18);


      this.load.audio('jump', ['assets/sounds/jump.wav']);
      this.load.audio('fall', ['assets/sounds/fall.wav']);
      this.load.audio('music', ['assets/sounds/music.wav']);
      this.load.audio('shot', ['assets/sounds/shot.wav']);

    },
    create: function() {
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // Alinea canvas horizontalmente y verticalmente
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically   = true;

      // ?
      this.scale.setScreenSize(true);
    },
    update: function() {
      this.state.start('Game');
    }
  }
  Juego.Game.prototype = {
    create: function() {
      this.add.sprite(0, 0, 'background');
      this.jumpSound = this.add.audio('jump');
      this.fallSound = this.add.audio('fall');
      this.shotSound = this.add.audio('step', 1, false);

      this.game.add.audio('music', 1, true).play();


      this.worlds = [
        { name: 'fuego',  range: { min: 0, max: Juego.WIDTH / 4 } },
        { name: 'aire',   range: {min: Juego.WIDTH/4, max: Juego.WIDTH/2 } },
        { name: 'tierra', range: {min: Juego.WIDTH/2, max: Juego.WIDTH/4*3 } },
        { name: 'agua',   range: {min: Juego.WIDTH/4*3, max: Juego.WIDTH } }
      ];

      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.ground = this.add.sprite(0, 296, 'ground');
      this.physics.enable(this.ground, Phaser.Physics.ARCADE);
      this.ground.body.immovable = true;

      this.addPlayer();
      this.addPlatforms();
      this.addBosses();

      this.cursors = cursors = game.input.keyboard.createCursorKeys();
      // this.time.events.loop(Phaser.Timer.SECOND * 2, this.moveHoles, this);
    },
    update: function() {
      this.physics.arcade.collide(this.player, this.ground, function(){}, null, this);
      this.physics.arcade.collide(this.player, this.platforms, function(){}, null, this);

      this.player.body.velocity.x = 0;

      if ( this.cursors.left.isDown ) {
        this.player.body.velocity.x = -this.player.speed;

        if(this.keySpace.isDown) {
          this.player.animations.play('walkAndShot');
          this.shotSound.play('', 0, 0.5, false, false);
        } else {
          this.player.animations.play('walk');
        }
        this.player.scale.setTo(-1, 1);
      } else if(this.cursors.right.isDown) {
        this.player.body.velocity.x = this.player.speed;

        if(this.keySpace.isDown) {
          this.player.animations.play('walkAndShot');
          this.shotSound.play('', 0, 0.5, false, false);
        } else {
          this.player.animations.play('walk');
        }
        this.player.scale.setTo(1, 1);
      } else {
        this.player.animations.stop();

        if(this.keySpace.isDown) {
          this.player.frame = 4;
        } else {
          this.player.frame = 0;
        }
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.body.velocity.y = -this.player.speed * 2;
        this.player.body.lastPositionY = Juego.HEIGHT - this.player.body.y;
        this.jumpSound.play();
      }
    },
    addPlayer: function() {
      var cuadrante = this.getCuadrante(),
           position = this.worlds[cuadrante].range;

      this.player = this.add.sprite(Math.random() * (position.max - position.min) + position.min, 280, 'players', 1);
      this.player.anchor.setTo(0.5, 0.5);

      this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

      this.player.body.collideWorldBounds = true;
      this.player.body.gravity.y = 500;

      this.player.cuadrante = cuadrante;
      this.player.speed = 120;

      this.player.animations.add('walk', [0,1,2,3], 15, true);
      this.player.animations.add('walkAndShot', [4,5,6,7], 15, true);

      this.keySpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },
    getCuadrante: function() {
      var cuadrantes = [0, 1, 2, 3];

      if( this.player ) {
        cuadrante = this.player.cuadrante;
        cuadrantes.splice(cuadrante, 1);
      }

      return cuadrantes[Math.floor(Math.random() * cuadrantes.length)];
    },
    addPlatforms: function() {
      // Mundo viento, 150 / 200 / 250
      this.platforms = this.add.group();

      for(var j = 1; j < 5; j++ ) {
        var world     = this.worlds[j-1];
        var halfWidth = game.cache.getImage('platform-' + world.name).width/2;

        for(var i = 1; i < 4; i++) {
          min = world.range.min  ;
          max = world.range.max - halfWidth * 2;

          platform = this.platforms.create(world.range.min + halfWidth / 2, 100 + i * 50, 'platform-' + world.name);
          platform.anchor.setTo(0.5, 0.5);

          game.physics.enable(platform, Phaser.Physics.ARCADE);
          platform.body.immovable = true;

          // platform.speed = this.game.rnd.integerInRange(50, 80);
          var time = this.game.rnd.integerInRange(500, 2000);
          game.add.tween(platform.body).to({ x: max }, time).to({ x: min }, time).yoyo().loop().start();
        }
      }
    },
    addBosses: function() {
      var world, min, max, boss, time;

      this.bosses = this.add.group();
      for(i = 0; i < 4; i++) {
        world     = this.worlds[i];

        min = world.range.min;
        max = world.range.max - game.cache.getImage('boss-' + world.name).width;

        boss = this.bosses.create(world.range.min, 25, 'boss-' + world.name);

        game.physics.enable(boss, Phaser.Physics.ARCADE);
        platform.body.immovable = true;

        time = this.game.rnd.integerInRange(500, 2000);
        game.add.tween(boss.body).to({ x: max }, time).to({ x: min }, time).yoyo().loop().start();
      }
    }
  }

  game.state.add('Preload', Juego.Preload);
  game.state.add('Game', Juego.Game);

  game.state.start('Preload');

})();
