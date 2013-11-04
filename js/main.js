enchant();

var stgWidth = 640;
var stgHeight = 480;

var Player = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, 32, 64);
        this.image = game.assets['res/space0.png'];
        this.x = stgWidth/2 - this.width/2;
        this.y = stgHeight/2 - this.height/2;
        this.rotSpeed = 5;
        this.velocityX = 0;
        this.velocityY = 0;
        this.decel = .01;
        this.accel = .5;
    },
    getDirection: function() {
        var direction = this.rotation % 360;
        if ( direction < 0 ) {
            direction = 360 + direction;
        }
        return direction;
    },
    getXCenter: function() {
        return this.x + this.width / 2;
    },
    getYCenter: function() {
        return this.y + this.height / 2;
    },
    onenterframe: function() {
        if(game.input.left && !game.input.right){
            this.rotate(-this.rotSpeed);
        } else if(game.input.right && !game.input.left){
            this.rotate(this.rotSpeed);
        }

        var direction = this.getDirection();

        if (game.input.up && !game.input.down) {
            this.velocityX = this.velocityX + ( this.accel * Math.sin(direction*Math.PI/180));
            this.velocityY = this.velocityY + ( this.accel * Math.cos(direction*Math.PI/180));
        } else if(game.input.down && !game.input.up) {
            this.velocityX = 0;
            this.velocityY = 0;
        }

        this.moveBy(this.velocityX, -this.velocityY);
        this.velocityX = this.velocityX - this.velocityX * this.decel;
        this.velocityY = this.velocityY - this.velocityY * this.decel;

        //wrap the screen
        if (this.x < -this.width) {
            this.x = stgWidth;
        }
        if (this.y < -this.height) {
            this.y = stgHeight;
        }
        if (this.x > stgWidth)
            this.x = -this.width;
        if (this.y > stgHeight)
            this.y = -this.height;
    }
});

var Explosion = Class.create(Sprite, {
    initialize: function(startX, startY) {
        Sprite.call(this, 16, 16);
        this.x = startX;
        this.y = startY;
        this.image = game.assets['res/effect0.png'];
    },
    onenterframe: function() {
        //we only want to play this once then disappear...
        if (this.age % 3 == 0) {
            if(this.frame == 4){
                this.parentNode.removeChild(this);
            }
            else{
                this.frame++;
            }
        }
    }
});

var ConstantVelocitySprite = Class.create(Sprite, {
    initialize: function(startX, startY, startDirection, asset, spriteX, spriteY) {
        Sprite.call(this, spriteX, spriteY);
        this.image = game.assets[asset];
        this.x = startX;
        this.y = startY;
        this.direction = startDirection;
    },
    onenterframe: function() {
        this.rotate(this.rotSpeed);
        var xOffset = this.speed * Math.sin(this.direction*Math.PI/180);
        var yOffset = -this.speed * Math.cos(this.direction*Math.PI/180);
        this.moveBy(xOffset, yOffset);

        if (this.x < -this.width || this.x > stgWidth || this.y < -this.height || this.y > stgHeight) {
            this.outOfBounds();
        }
    },
    outOfBounds: function() {

    },
    getXCenter: function() {
        return this.x + this.width / 2;
    },
    getYCenter: function() {
        return this.y + this.height / 2;
    }
});

var Bullet = Class.create(ConstantVelocitySprite, {
   initialize: function(startX, startY, startDirection) {
       ConstantVelocitySprite.call(this, startX, startY, startDirection, 'res/bullet.png', 4, 4);
       this.speed = 6;
       game.assets['res/shoot.wav'].play();
   },
   outOfBounds: function() {
       this.scene.bulletGroup.removeChild(this);
   }
});

var Asteroid = Class.create(ConstantVelocitySprite, {
   initialize: function(startX, startY, startDirection) {
       ConstantVelocitySprite.call(this, startX, startY, startDirection, 'res/space1.png', 64, 64);
       this.rotSpeed = randomizeSign(randomFromInterval(1,5));
       this.speed = 2;
   },
    outOfBounds: function() {
        // pick which side to start from
        var side = randomFromInterval(0, 3);
        switch(side) {
            case 0:
                this.x = -this.width;
                this.y = randomFromInterval(0, stgHeight);
                break;
            case 1:
                this.x = stgWidth;
                this.y = randomFromInterval(0, stgHeight);
                break;
            case 2:
                this.x = randomFromInterval(0, stgWidth);
                this.y = -this.height;
                break;
            case 3:
                this.x = randomFromInterval(0, stgWidth);
                this.y = stgHeight;
                break;
        }
        this.direction = randomFromInterval(0, 360);
    }
});

var LittleAsteroid = Class.create(Asteroid, {
   initialize: function(startX, startY) {
       var direction = randomFromInterval(0,360);
       Asteroid.call(this, startX, startY, direction);
       this.scale(.5);
   },
   bulletCollision: function() {
       var explosion = new Explosion(this.getXCenter(), this.getYCenter());
       this.scene.addChild(explosion);
       this.parentNode.removeChild(this);
       game.assets['res/asteroidExplosion.wav'].play();
   }
});

var BigAsteroid = Class.create(Asteroid, {
   initialize: function() {
       Asteroid.call(this, 0, 0, 0);
       this.outOfBounds();
   },
   bulletCollision: function() {
       for (var count=0;count<3;count++) {
           this.parentNode.addChild(new LittleAsteroid(this.x, this.y));
       }
       this.parentNode.removeChild(this);
       game.assets['res/asteroidExplosion.wav'].play();
   }
});

function randomFromInterval(from, to){
    return Math.floor(Math.random()*(to-from+1)+from);
}

function randomizeSign(input) {
    switch (randomFromInterval(0,1)) {
        case 0:
            return input;
            break;
        case 1:
            return -input;
            break;
    }
}

var UiGroup = Class.create(Group, {
    initialize: function() {
        Group.call(this);
        this.score = new enchant.Label();
        this.score.x = 5;
        this.score.y = 5;
        this.score.color = "white";
        this.score.width = 128;
        this.score.height = 64;
        this.score.font = "12px 'Arial'";
        this.scoreNum = 0;
        this.addChild(this.score);

        this.level = new enchant.Label();
        this.level.x = 5;
        this.level.y = 20;
        this.level.color = "white";
        this.level.width = 128;
        this.level.height = 64;
        this.level.font = "12px 'Arial'";
        this.addChild(this.level);

        this.reset();
    },
    setLevel: function(level) {
        this.level.text = "Level: " + level;
    },
    addToScore: function(score) {
        this.scoreNum += score;
        this.score.text = "Score: " + this.scoreNum;
    },
    reset: function() {
        this.scoreNum = 0;
        this.addToScore(0);
        this.setLevel(1);
    }
});

var AsteroidScene = Class.create(Scene, {
    initialize: function(asteroidSpeed) {
        Scene.call(this);
        this.player = new Player();

        this.backgroundColor = "black";
        this.bulletGroup = new Group();
        this.asteroidGroup = new Group();
        this.uiGroup = new UiGroup();

        this.addChild(this.uiGroup);
        this.addChild(this.player);
        this.addChild(this.bulletGroup);
        this.addChild(this.asteroidGroup);

        this.setLevel(1);
    },
    setLevel: function(newLevel) {
        this.level = newLevel;
        var numberOfAsteroids = newLevel % 3 + 3;
        var asteroidSpeed = Math.floor(newLevel / 3) + 2;
        console.log("setting numberOfAsteroids = " + numberOfAsteroids + ", asteroidSpeed = " + asteroidSpeed);
        for (var i=0; i<numberOfAsteroids; i++) {
            var asteroid = new BigAsteroid();
            asteroid.speed = asteroidSpeed;
            this.asteroidGroup.addChild(asteroid);
        }
        this.uiGroup.setLevel(newLevel);
    },
    onenterframe: function() {
        //check player collisions
        var asteroids = this.asteroidGroup.childNodes;
        for (var i=0; i<asteroids.length; i++) {
            var asteroid = asteroids[i];
            if (this.player && this.player.within(asteroid, 30)) {
                //player has collided with asteroid time to give up the ghost
                var x = this.player.getXCenter();
                var y = this.player.getYCenter();
                var explosion = new Explosion(x, y);
                explosion.scale(2);
                this.removeChild(this.player);
                this.player = undefined;
                this.addChild(explosion);
                game.assets['res/shipExplosion.wav'].play();
                var that = this;
                setTimeout(function() {
                    var gameOver = new Sprite(189, 97);
                    gameOver.image = game.assets['res/gameover.png'];
                    gameOver.x = stgWidth / 2 - gameOver.width / 2;
                    gameOver.y = stgHeight / 2 - gameOver.height / 2;
                    that.addChild(gameOver);
                }, 1000);
            }
        }

        //check bullet collisions
        var bullets = this.bulletGroup.childNodes;
        for (var i=0; i<bullets.length; i++) {
            for (var j=0; j<asteroids.length; j++) {
                if (bullets[i] && asteroids[j] && bullets[i].intersect(asteroids[j])) {
                    console.log("bullet collided with asteroid");
                    var bullet = bullets[i];
                    this.bulletGroup.removeChild(bullet);
                    var asteroid = asteroids[j];
                    asteroid.bulletCollision();
                    this.uiGroup.addToScore(5);
                    if (this.asteroidGroup.childNodes.length == 0) {
                        this.setLevel(this.level + 1);
                    }
                }
            }
        };

        if (this.player && game.input.a) {
            var xCenter = this.player.getXCenter();
            var yCenter = this.player.getYCenter();
            var direction = this.player.getDirection();
            var xOffset = this.player.width * Math.sin(direction*Math.PI/180) / 2;
            var yOffset = -this.player.height * Math.cos(direction*Math.PI/180) / 2;
            var x = xCenter + xOffset;
            var y = yCenter + yOffset;
            var bullet = new Bullet(x, y, direction);
            this.bulletGroup.addChild(bullet);
        }
    }
});

window.onload = function() {

    game = new Game(stgWidth, stgHeight);
    //space0 - rocket
    //space1 - asteroid
    //space2 - satellite
    game.preload('res/space0.png', 'res/space1.png', 'res/space2.png',
        'res/start.png', 'res/gameover.png', 'res/effect0.png', 'res/bullet.png',
        'res/asteroidExplosion.wav', 'res/shipExplosion.wav', 'res/shoot.wav',
        'res/shipDanger.wav', 'res/bgm.ogg');
    game.fps = 30;
    game.scale = 1;
    game.keybind(32, "a");
    game.onload = function() {
        game.assets['res/bgm.ogg'].play();
        var scene = new AsteroidScene();
        game.pushScene(scene);
    }
    game.start();
};
