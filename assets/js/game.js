(function() {
  /*
   * Your brain will suffer if you read this code "(:("
   * Spanglish everywhere
   */

  var Juego = { Boot: function(){ }, Preload: function() {}, Game: function() {}, Menu: function() {} };
  Juego.WIDTH  = 480;
  Juego.HEIGHT = 320;

  var game = new Phaser.Game(Juego.WIDTH, Juego.HEIGHT, Phaser.AUTO, 'game');
  Juego.Boot.prototype = {
    preload: function() {
      this.load.image('preloader', 'assets/img/preloader.png');
    },
    create: function() {
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      this.scale.minWidth = 480;
      this.scale.minHeight = 320;
      this.scale.maxWidth = 960;
      this.scale.maxHeight = 640;
      this.scale.forceLandscape = true;
      this.scale.pageAlignHorizontally = true;
      this.scale.setScreenSize(true);

      this.state.start('Preload');
    }
  }

  Juego.Preload.prototype = {
    preload: function() {
      this.stage.backgroundColor = '#000';

      this.preloader = this.add.sprite(Juego.WIDTH/2, Juego.HEIGHT/2, 'preloader');
      this.preloader.anchor.setTo(0.5, 0.5);

      this.add.text(Juego.WIDTH/2, Juego.HEIGHT/2, "Loading...", { font: "10px monospace", fill: "#fff" })
          .anchor
          .setTo(0.5, 0.5);

      this.load.setPreloadSprite(this.preloader);

      this.load.image('background', 'assets/img/bg.png');
      this.load.image('title', 'assets/img/title.png');
      this.load.image('ground', 'assets/img/ground.png');

      this.load.image('player', 'assets/img/player.png', 10, 10);
      this.load.image('bullet', 'assets/img/bullet.png', 10, 10);

      this.load.spritesheet('players', 'assets/img/player-sprite.png', 20, 20, 8);

      this.load.image('platform-fuego', 'assets/img/platform-fuego.png', 10, 10);
      this.load.image('platform-aire', 'assets/img/platform-aire.png', 10, 10);
      this.load.image('platform-tierra', 'assets/img/platform-tierra.png', 10, 10);
      this.load.image('platform-agua', 'assets/img/platform-agua.png', 10, 10);

      this.load.image('attack-fuego', 'assets/img/ataque-fuego.png', 16, 18);
      this.load.image('attack-aire', 'assets/img/ataque-aire.png', 22, 14);
      this.load.image('attack-tierra', 'assets/img/ataque-tierra.png', 18, 18);
      this.load.image('attack-agua', 'assets/img/ataque-agua.png', 18, 18);

      this.load.image('boss-fuego', 'assets/img/gellon.png', 16, 18);
      this.load.image('boss-aire', 'assets/img/govil.png', 22, 14);
      this.load.image('boss-tierra', 'assets/img/madro.png', 18, 18);
      this.load.image('boss-agua', 'assets/img/poil.png', 18, 18);

      this.load.image('power-fuego', 'assets/img/power-fuego.png', 14, 14);
      this.load.image('power-aire', 'assets/img/power-aire.png', 14, 14);
      this.load.image('power-tierra', 'assets/img/power-tierra.png', 14, 14);
      this.load.image('power-agua', 'assets/img/power-agua.png', 14, 14);

      this.load.audio('jump', ['assets/sounds/jump.wav']);
      this.load.audio('fall', ['assets/sounds/fall.wav']);
      this.load.audio('music', ['assets/sounds/music.wav']);
      this.load.audio('shot', ['assets/sounds/shot.wav']);
      this.load.audio('empty-gun', ['assets/sounds/empty-gun.wav']);
      this.load.audio('hit-boss', ['assets/sounds/hit-boss.wav']);
      this.load.audio('power', ['assets/sounds/power.wav']);
      this.load.audio('hit-player', ['assets/sounds/hit-player.wav']);
      this.load.audio('player-die', ['assets/sounds/player-die.wav']);
    },
    create: function() {
      this.preloader.cropEnabled = false;
      this.game.add.audio('music', 1, true).play();
    },
    update: function() {
      this.state.start('Menu');
    }
  }

  Juego.Menu.prototype = {
    create: function() {
      this.add.sprite(0, 0, 'background');
      this.ground = this.add.sprite(0, 296, 'ground');
      this.title = this.add.sprite(0, 50, 'title');


      this.startText = this.add.text(
          this.world.centerX,
          200,
          "PRESS Z TO START",
          {
              font: "12px Arial",
              fill: "#000",
              align: "center"
          }
      );
      this.startText.anchor.setTo(0.5, 0.5);
      game.add.tween(this.startText).to({ y: 220 }, 1500).to({ y: 200 }, 1500).loop().start();
    },
    update: function() {
      if(this.game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
        this.state.start('Game');
      }
    }
  }

  Juego.Game.prototype = {
    create: function() {
      this.add.sprite(0, 0, 'background');
      this.ground = this.add.sprite(0, 296, 'ground');

      this.jumpSound      = this.add.audio('jump');
      this.fallSound      = this.add.audio('fall');
      this.shotSound      = this.add.audio('shot', 1, false);
      this.emptyGunSound  = this.add.audio('empty-gun', 1, false);
      this.hitBossSound   = this.add.audio('hit-boss', 1, false);
      this.hitPlayerSound = this.add.audio('hit-player', 1, false);
      this.grabPowerSound = this.add.audio('power', 1, false);
      this.playerDieSound = this.add.audio('player-die', 1, false);
      this.points         = 0;


      this.worlds = [
        { name: 'fuego', weakness: 'agua', color: '#fff', range: { min: 0, max: Juego.WIDTH / 4 } },
        { name: 'aire',  weakness: 'tierra', color: '#000', range: {min: Juego.WIDTH/4, max: Juego.WIDTH/2 } },
        { name: 'tierra', weakness: 'fuego', color: '#fff', range: {min: Juego.WIDTH/2, max: Juego.WIDTH/4*3 } },
        { name: 'agua', weakness: 'aire', color: '#fff', range: {min: Juego.WIDTH/4*3, max: Juego.WIDTH } }
      ];

      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.physics.enable(this.ground, Phaser.Physics.ARCADE);
      this.ground.body.immovable = true;

      this.addPlayer();
      this.addPlatforms();
      this.addBosses();
      this.startBullets();
      this.startPowers();
      this.showPower();

      this.pointsText = this.add.text(
          Juego.WIDTH/2,
          Juego.HEIGHT - 40,
          "P: 0 H: 100%",
          {
              font: "30px Arial",
              fill: "#000",
              align: "center"
          }
      );
      this.pointsText.anchor.setTo(0.5, 0.5);
      this.pointsText.alpha = 0.1;

      if(this.ghostUntil && this.ghostUntil < this.time.now) {
        this.ghostUntil = null;
        this.player.play('fly');
      }

      this.cursors = cursors = game.input.keyboard.createCursorKeys();
      // this.time.events.loop(Phaser.Timer.SECOND * 2, this.moveHoles, this);
    },
    update: function() {
      if( ! this.player.alive) {
        return;
      }

      if(this.player.x >= 0 && this.player.x <= 120) {
        this.player.cuadrante = 0;
      } else if( this.player.x > 120 && this.player.x <= 240) {
        this.player.cuadrante = 1;
      } else if( this.player.x > 240 && this.player.x <= 360) {
        this.player.cuadrante = 2;
      } else {
        this.player.cuadrante = 3;
      }

      this.physics.arcade.collide(this.player, this.ground, function(){}, null, this);
      this.physics.arcade.collide(this.player, this.platforms, null, function(player, platform) {
        if(player.body.velocity.y <= 0) {
          return false;
        }
        return true;
      }, this);
      this.physics.arcade.collide(this.player, this.powers, this.grabPower, null, this);
      this.physics.arcade.collide(this.player, this.attacks, this.hitPlayer, null, this);


      this.physics.arcade.collide(this.bullets, this.platforms, this.bulletHitsPlatform, null, this);
      this.physics.arcade.collide(this.bosses, this.bullets, this.hitBoss, null, this);


      this.inputManagment();
      this.bossShoots();
    },
    fire: function() {
      if(this.player.equipment == null ) {
        this.emptyGunSound.play('', 5, 0.5, false, false);
        return;
      } else {
        this.shotSound.play('', 5, 0.5, false, false);
      }

      if(this.nextShotAt > this.time.now) {
        return;
      }

      if(this.bullets.countDead() === 0) {
        return;
      }

      this.nextShotAt = this.time.now + this.shotDelay;

      var bullet = this.bullets.getFirstExists(false);
      bullet.reset(this.player.x, this.player.y - 20);
      bullet.body.velocity.y = -500;
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
      this.player.equipment = null;
      this.player.speed = 120;
      this.player.health = 5;

      this.player.animations.add('walk', [0,1,2,3], 15, true);
      this.player.animations.add('walkAndShoot', [4,5,6,7], 15, true);
    },
    hitPlayer: function(player, attack) {
      attack.kill();

      player.damage(1);
      this.updateHUD(0);
      if(player.alive) {
        this.hitPlayerSound.play('', 5, 0.5, false, false);
      } else {
        this.playerDieSound.play('', 5, 0.5, false, false);
        player.kill();
        game.time.events.add(2000, function(){
          game.state.start('Menu');
        });
      }
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

          var time = this.game.rnd.integerInRange(500, 2000);
          game.add.tween(platform.body).to({ x: max }, time).to({ x: min }, time).yoyo().loop().start();
        }
      }
    },
    addBosses: function() {
      var world, min, max, boss, time;

      this.bosses = this.add.group();
      this.bossesHealth = {};

      for(i = 0; i < 4; i++) {
        world     = this.worlds[i];

        min = world.range.min;
        max = world.range.max - game.cache.getImage('boss-' + world.name).width;

        boss = this.bosses.create(world.range.min, 25, 'boss-' + world.name);
        boss.anchor.setTo(0.5, 0.5);
        boss.name = world.name;
        boss.health = 10;

        game.physics.enable(boss, Phaser.Physics.ARCADE);
        boss.body.immovable = true;
        boss.weakness = world.weakness;

        time = this.game.rnd.integerInRange(500, 2000);
        game.add.tween(boss.body).to({ x: max }, time).to({ x: min }, time).yoyo().loop().start();

        this.bossesHealth[world.name] = this.add.text(
            min + 60,
            305,
            "100%",
            {
                font: "10px Arial",
                fill: world.color,
                align: "left"
            }
        );
        this.bossesHealth[world.name].anchor.setTo(0.5, 0)
      }


      this.attacks = this.add.group();

      this.attacks.enableBody = true;
      this.attacks.physicsBodyType = Phaser.Physics.ARCADE;

      this.attacks.createMultiple(3, 'attack-fuego');
      this.attacks.createMultiple(3, 'attack-aire');
      this.attacks.createMultiple(3, 'attack-tierra');
      this.attacks.createMultiple(3, 'attack-agua');

      this.attacks.setAll('anchor.x', 0.5);
      this.attacks.setAll('anchor.y', 0.5);

      this.attacks.setAll('outOfBoundsKill', true);
      this.attacks.setAll('checkWorldBounds', true);

      this.nextBossAttackAt = 0;
      this.bossAttackDelay  = 800;
    },
    bulletHitsPlatform: function(bullet) {
      bullet.kill();
    },
    bossShoots: function() {
      if(this.nextBossAttackAt > this.time.now) {
        return;
      }

      this.nextBossAttackAt = this.time.now + this.bossAttackDelay;

      var boss = this.bosses.getAt(this.player.cuadrante), attack = null;

      if( ! boss.alive) {
        return;
      }

      for (var i = 0; i < this.attacks.length; i++) {
        if( attack == null ) {
          attack = this.attacks.getAt(i);
          if( attack.key.split('-')[1] != boss.name ) {
            attack = null;
          }
        }
      };

      attack.reset(boss.x, boss.y + 30);
      attack.body.velocity.y = 300;
    },
    grabPower: function(player, power) {
      player.equipment = power.name;
      power.kill();
      this.grabPowerSound.play('', 5, 0.5, false);
      this.updateHUD(5);
    },
    hitBoss: function(boss, bullet) {
      bullet.kill();
      this.hitBossSound.play('', 5, 0.5, false);

      if(this.player.equipment != boss.weakness) {
        return;
      }


      boss.damage(1);
      this.bossesHealth[boss.name].text = (boss.health * 10) + '%';

      if(boss.alive) {
        this.updateHUD(10);
      } else {
        this.updateHUD(100);

        var bossesHealth = this.bossesHealth;
        game.time.events.add(15000, function(){
          boss.revive(20);
          bossesHealth[boss.name].text = '100%';
        });
      }
    },
    updateHUD: function(points) {
      this.points+= points;
      this.pointsText.text = 'P: ' + this.points + ' H: ' + (20 * this.player.health + '%');
    },

    startPowers: function() {
      this.powers = this.add.group();

      this.powers.enableBody = true;
      this.powers.physicsBodyType = Phaser.Physics.ARCADE;

      for(i = 0; i < 4; i++) {
        world     = this.worlds[i];

        min = world.range.min;

        power = this.powers.create(120 * (i + 1) - 60, 80, 'power-' + world.name);
        power.anchor.setTo(0.5, 0.5);
        power.name = world.name;
        game.physics.enable(power, Phaser.Physics.ARCADE);
        power.body.immovable = true;
        power.kill();
      }
    },
    startBullets: function() {
      this.bullets = this.add.group();

      this.bullets.enableBody = true;
      this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

      this.bullets.createMultiple(100, 'bullet');
      this.bullets.setAll('anchor.x', 0.5);
      this.bullets.setAll('anchor.y', 0.5);

      this.bullets.setAll('outOfBoundsKill', true);
      this.bullets.setAll('checkWorldBounds', true);

      this.nextShotAt = 0;
      this.shotDelay  = 200;
    },

    inputManagment: function() {
      this.player.body.velocity.x = 0;
      keyZPressed = this.input.keyboard.isDown(Phaser.Keyboard.Z);

      if ( this.cursors.left.isDown ) {
        this.player.body.velocity.x = -this.player.speed;

        if(keyZPressed) {
          this.player.animations.play('walkAndShoot');
        } else {
          this.player.animations.play('walk');
        }
        this.player.scale.setTo(-1, 1);
      } else if(this.cursors.right.isDown) {
        this.player.body.velocity.x = this.player.speed;

        if(keyZPressed) {
          this.player.animations.play('walkAndShoot');
        } else {
          this.player.animations.play('walk');
        }
        this.player.scale.setTo(1, 1);
      } else {
        this.player.animations.stop();

        if(keyZPressed) {
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

      if(this.player.alive && keyZPressed) {
        this.fire();
      }
    },
    showPower: function() {
      this.game.time.events.loop(5000, function(powers, cuadrante) {
        var cuadrantes = [0, 1, 2, 3];
        cuadrantes.splice(cuadrante, 1);

        powers.forEachAlive(function(power) {
          power.kill();
        });

        powers.getRandom().revive();
      }, null, this.powers);
    }
  }

  game.state.add('Preload', Juego.Preload);
  game.state.add('Game', Juego.Game);
  game.state.add('Menu', Juego.Menu);
  game.state.add('Boot', Juego.Boot);

  game.state.start('Boot');

})();
