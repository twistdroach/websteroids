enchant();

var stgWidth = 320;
var stgHeight = 240;

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
    onenterframe: function() {
        if(game.input.left && !game.input.right){
            this.rotate(-this.rotSpeed);
        } else if(game.input.right && !game.input.left){
            this.rotate(this.rotSpeed);
        }

        var direction = this.rotation % 360;
        if ( direction < 0 ) {
            direction = 360 + direction;
        }

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
        if (this.x < 0) {
            this.x = stgWidth;
        }
        if (this.y < 0) {
            this.y = stgHeight;
        }
        if (this.x > stgWidth)
            this.x = this.x % stgWidth;
        if (this.y > stgHeight)
            this.y = this.y % stgWidth;
    }
});

var Asteroid = Class.create(Sprite, {
   initialize: function(startX, startY, startDirection) {
       Sprite.call(this, 64, 64);
       this.image = game.assets['res/space1.png'];
       this.x = startX;
       this.y = startY;
       this.rotSpeed = 2;
       this.speed = 2;
       this.direction = startDirection;
   },
   onenterframe: function() {
       this.rotate(this.rotSpeed);
       var xOffset = this.speed * Math.sin(this.direction*Math.PI/180);
       var yOffset = this.speed * Math.cos(this.direction*Math.PI/180);
       this.moveBy(xOffset, yOffset);

       if (this.x < 0 || this.x > stgWidth || this.y < 0 || this.y > stgHeight) {
           this.outOfBounds();
       }
   },
   outOfBounds: function() {

   }
});

var BigAsteroid = Class.create(Asteroid, {
   initialize: function() {
       Asteroid.call(this, 0, 0, 0);
       this.outOfBounds();
   },
   outOfBounds: function() {
       // pick which side to start from
       var side = randomFromInterval(0, 3);
       switch(side) {
           case 0:
               this.x = 0;
               this.y = randomFromInterval(0, stgHeight);
               break;
           case 1:
               this.x = stgWidth;
               this.y = randomFromInterval(0, stgHeight);
               break;
           case 2:
               this.x = randomFromInterval(0, stgWidth);
               this.y = 0;
               break;
           case 3:
               this.x = randomFromInterval(0, stgWidth);
               this.y = stgHeight;
               break;
       }
       this.direction = randomFromInterval(0, 360);
   }
});

function randomFromInterval(from, to){
    return Math.floor(Math.random()*(to-from+1)+from);
}
var AsteroidScene = Class.create(Scene, {

});

window.onload = function() {

    game = new Game(stgWidth, stgHeight);
    //space0 - rocket
    //space1 - asteroid
    //space2 - satellite
    game.preload('res/space0.png', 'res/space1.png', 'res/space2.png',
        'res/start.png', 'res/gameover.png', 'res/effect0.png');
    game.fps = 30;
    game.scale = 1;
    game.onload = function() {
        var scene, player, asteroid;
        scene = new Scene();
        player = new Player();
        asteroid = new BigAsteroid();
        scene.backgroundColor = "black";
        scene.addChild(asteroid);
        scene.addChild(player);
        scene.addEventListener('enterframe', function() {
           //check player collisions
           if (player.within(asteroid, 30)) {
               //react to collision
               console.log("player collided with asteroid");
           }
        });
        game.pushScene(scene);
    }
    game.start();
};
