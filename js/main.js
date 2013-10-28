enchant();

var stgWidth = 320;
var stgHeight = 440;

var Player = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, 32, 64);
        this.image = game.assets['res/space0.png'];
        this.x = stgWidth/2;
        this.y = stgHeight/2;
        this.rotSpeed = 5;
    },
    rotSpeed: "5",
    onenterframe: function() {
        if(game.input.left && !game.input.right){
            this.rotate(-this.rotSpeed);
        }
        else if(game.input.right && !game.input.left){
            this.rotate(this.rotSpeed);
        }
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
