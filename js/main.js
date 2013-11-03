enchant();

var stgWidth = 640;
var stgHeight = 480;

Player = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, 32, 64);
        this.image = game.assets['res/space0.png'];
        this.x = stgWidth/2;
        this.y = stgHeight/2;
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
        //console.log("x=" + this.x + ",y=" + this.y);
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
        var scene, player;
        scene = new Scene();
        player = new Player();
        scene.addChild(player);
        game.pushScene(scene);
    }
    game.start();
};
