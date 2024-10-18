const SCALE = 24;
const SCREEN_HEIGHT = SCREEN_WIDTH = 720;
const LAST_TILE_X = SCREEN_WIDTH / SCALE - 1;
const LAST_TILE_Y = SCREEN_HEIGHT / SCALE - 1;
let DEBUG_MODE = true;

let LEVELS_LOADED = false;
let CURRENT_LEVEL_JSON = null;


let TILE_PROPS = {
    0: {collisionType: false},
    1: {collisionType: true},
    2: {collisionType: true},
};

let blockSpritePaths = {
    0: "air.png",
    1: "filled.png",
    2: "red.png",
}

let TILE_SPRITES = {};

let CURRENT_SCREEN = "0,0";

function loadLevelPack(){
    fetch(location.href + 'levelpacks/levels.json')
    .then((response) => response.json())
    .then((json) => {CURRENT_LEVEL_JSON = new LevelMap(json); LEVELS_LOADED = true;});
}

function GetTile(x, y){
    x = Math.floor(x);
    y = Math.floor(y);
    return CURRENT_LEVEL_JSON.getTile(CURRENT_SCREEN, x, y);
}

Math.clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max);
};

// current selected map
let CURRENT_MAP;

// stages[stageX,stageY][tileX,tileY]

let LevelMap = function(stages){
    // map of screens accessed by "x,y"
    this.stages = stages;

    this.getTile = function(screen, x, y){
        let tmp = this.stages[screen];
        if(tmp == null)
            return null;
        tmp = tmp[x+","+y];
        return new Tile(x, y, TILE_SPRITES[tmp], TILE_PROPS[tmp]);
    }
}

let Tile = function(x, y, spr, properties){
    this.x = x;
    this.y = y;
    this.props = properties;
    this.spr = spr;
    this.collisionType = this.props.collisionType;

    this.draw = function(){
        image(this.spr, this.x * SCALE, this.y * SCALE)
    }

    this.isSolid = function(){
        return this.collisionType;
    }
}

let Player = function(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;

    this.velX = 0;
    this.velY = 0;
    this.maxVelX = 300;
    this.maxVelY = 1000;
    this.jumpSpeed = 625;
    this.gravity = 1500;
    this.isOnGround = false;

    this.update = function(deltaTime){
        if(deltaTime > 0.1)
            deltaTime = 0.1;
        this.doInput(deltaTime);

        this.isOnGround = false;
        this.doKinematics(deltaTime/6);
        this.doKinematics(deltaTime/6);
        this.doKinematics(deltaTime/6);
        this.doKinematics(deltaTime/6);
        this.doKinematics(deltaTime/6);
    }

    this.doKinematics = function(deltaTime){

        this.velY += this.gravity * deltaTime;
        let maxVel
        if(this.velY > this.maxVelY){
            this.velY = this.maxVelY;
        }
        let dx = this.velX * deltaTime;
        let dy = this.velY * deltaTime;

        // this.doCollision();

        // if(this.isOnGround){
        //     this.velY = 0;
        // }

        if(this.velX < 0){ // LEFT
            if(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE)).isSolid()){
                this.x = Math.floor((this.x)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            } else if(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE)).isSolid()){
                this.x = Math.floor((this.x)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            }
        } else if (this.velX > 0){ // RIGHT
            if(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE)).isSolid()){
                this.x = Math.floor((this.x + SCALE - 1)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            } else if(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE)).isSolid()){
                this.x = Math.floor((this.x + SCALE - 1)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            }
        }
        
        // APPLY HERE TO FIX CORNER CLIPS
        this.x += dx;

        if(this.velY < 0){ // UP
            if(GetTile(Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE)).isSolid()){
                this.y = Math.floor((this.y)/SCALE)*SCALE
                dy = 0;
                this.velY = 0;
            } else if(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE)).isSolid()){
                this.y = Math.floor((this.y)/SCALE)*SCALE
                dy = 0;
                this.velY = 0;
            }
        } else if(this.velY > 0){ // DOWN
            if(GetTile(Math.floor((this.x)/SCALE), Math.floor((this.y+dy+SCALE-1)/SCALE)).isSolid()){
                this.y = Math.floor((this.y+SCALE-1)/SCALE)*SCALE
                dy = 0;
                this.isOnGround = true;
                this.velY = 0;
            } else if(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy+SCALE-1)/SCALE)).isSolid()){
                this.y = Math.floor((this.y+SCALE-1)/SCALE)*SCALE
                dy = 0;
                this.isOnGround = true;
                this.velY = 0;
            }
        }
        
        this.y += dy;

    }

    this.doInput = function(deltaTime){
        if (keyIsDown(LEFT_ARROW) == true || keyIsDown(65) == true) {
            if(this.velX > 0)
                this.velX = 0;
            this.velX -= this.maxVelX*deltaTime*8;
        } else if (keyIsDown(RIGHT_ARROW) == true || keyIsDown(68) == true) {
            if(this.velX < 0)
                this.velX = 0;
            this.velX += this.maxVelX*deltaTime*8;
        } else {
            this.velX = 0;
        }


        if (keyIsDown(UP_ARROW) == true || keyIsDown(87) == true) {
            if(this.isOnGround)
                this.velY = -this.jumpSpeed;
        }
        // if(keyIsDown(16)){
        //     this.velX = Math.clamp(this.velX, -this.maxVelX*2, this.maxVelX*2);
        // } else {
            this.velX = Math.clamp(this.velX, -this.maxVelX, this.maxVelX);
        // }

        this.velY = Math.clamp(this.velY, -this.maxVelY, this.maxVelY);
    }   

    this.draw = function(){
        noStroke();
        fill(this.color);
        rect(this.x, this.y, SCALE, SCALE);
        
    }
}

let player = new Player(64, 64, "#ff0000");

function setup(){
    loadLevelPack();
    // while(!LEVELS_LOADED){}
    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    background(62);
    noStroke();
    frameRate(120);
    // for(let i = 0; i < tiles.length; i++){
    //     currentStage[tiles[i].x+","+tiles[i].y] = tiles[i];
    // }
    for (const [k, v] of Object.entries(blockSpritePaths)) {
        TILE_SPRITES[k] = loadImage("/sprites/tiles/" + v);
    }
}

let currentStage = {
};

let currentScreen = "play";

function draw(){
    if(!LEVELS_LOADED) return;
    background(62);
    switch(currentScreen){
        case "play":
            screen_playGame();
            break;
    }
}

function screen_playGame(){
    player.update(deltaTime/750);
    for(let i = 0; i <= LAST_TILE_X; i++){
        for(let j = 0; j <= LAST_TILE_Y; j++){
            let curTile = GetTile(i, j);
            if(!curTile)
                continue;
            curTile.draw();
        }
    }
    player.draw();
}