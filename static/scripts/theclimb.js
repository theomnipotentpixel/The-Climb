const SCALE = 24;
const SCREEN_HEIGHT = SCREEN_WIDTH = 720;
const LAST_TILE_X = SCREEN_WIDTH / SCALE - 1;
const LAST_TILE_Y = SCREEN_HEIGHT / SCALE - 1;
let DEBUG_MODE = true;

let LEVELS_LOADED = false;
let CURRENT_LEVEL_JSON = null;
let pos = [0, 0];
let tileset;
let TILES = {};

let PROPS = {};
PROPS.fullSolid = {
    solidTop: true,
    solidBottom: true,
    solidLeft: true,
    solidRight: true,
}
PROPS.bridge = {
    solidTop: true,
    solidBottom: false,
    solidLeft: false,
    solidRight: false,
}
PROPS.empty = {
    solidTop: false,
    solidBottom: false,
    solidLeft: false,
    solidRight: false,
}

TILES.getProps = function(id){
    if(id >= 0 && id <= 19)
        return PROPS.fullSolid;

    if(id >= 24 && id <= 27)
        return PROPS.fullSolid;

    if(id >= 68 && id <= 71)
        return PROPS.fullSolid;
    if(id >= 78 && id <= 79)
        return PROPS.fullSolid;
    if(id >= 84 && id <= 87)
        return PROPS.fullSolid;
    if(id >= 92 && id <= 95)
        return PROPS.fullSolid;
    if(id >= 168 && id <= 176)
        return PROPS.fullSolid;
    if(id >= 180 && id <= 183)
        return PROPS.fullSolid;
    if(id >= 188 && id <= 191)
        return PROPS.fullSolid;

    if(id == 48 || id == 144)
        return PROPS.bridge;

    return PROPS.empty;
}

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
            return 0;
        tmp = tmp[x+","+y];
        if(tmp == null) tmp = -1;
        return tmp;
    }
}

let Player = function(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;

    this.velX = 0;
    this.velY = 0;
    this.maxVelX = 300;
    this.maxVelY = 2000;
    this.jumpSpeed = 625;
    this.gravity = 1500;
    this.isOnGround = false;
    this.isLeft = false;
    this.sprites = loadImage("sprites/player.png");

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

        if(this.velX < 0){ // LEFT
            if(TILES.getProps(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE))).solidRight){
                this.x = Math.floor((this.x)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            } else if(TILES.getProps(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).solidRight){
                this.x = Math.floor((this.x)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            }
            this.isLeft = true;
        } else if (this.velX > 0){ // RIGHT
            if(TILES.getProps(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE))).solidLeft){
                this.x = Math.floor((this.x + SCALE - 1)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            } else if(TILES.getProps(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).solidLeft){
                this.x = Math.floor((this.x + SCALE - 1)/SCALE)*SCALE
                dx = 0;
                this.velX = 0;
            }
            this.isLeft = false;
        }
        
        // APPLY HERE TO FIX CORNER CLIPS
        this.x += dx;

        if(this.velY < 0){ // UP
            if(TILES.getProps(GetTile(Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE))).solidBottom){
                this.y = Math.floor((this.y)/SCALE)*SCALE;
                dy = 0;
                this.velY = 0;
            } else if(TILES.getProps(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE))).solidBottom){
                this.y = Math.floor((this.y)/SCALE)*SCALE;
                dy = 0;
                this.velY = 0;
            }
        } else if(this.velY > 0){ // DOWN
            if(TILES.getProps(GetTile(Math.floor((this.x)/SCALE), Math.ceil((this.y+dy)/SCALE))).solidTop){
                this.y = Math.floor((this.y+SCALE-dy)/SCALE)*SCALE;
                dy = 0;
                this.isOnGround = true;
                this.velY = 0;
            } else if(TILES.getProps(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.ceil((this.y+dy)/SCALE))).solidTop){
                this.y = Math.floor((this.y+SCALE-dy)/SCALE)*SCALE;
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
        this.velX = Math.clamp(this.velX, -this.maxVelX, this.maxVelX);

        this.velY = Math.clamp(this.velY, -this.maxVelY, this.maxVelY);
    }   

    this.draw = function(){
        noStroke();
        if(this.isLeft){
            image(this.sprites, this.x, this.y, SCALE, SCALE, 0*SCALE, 0*SCALE, SCALE, SCALE);
        } else {
            image(this.sprites, this.x, this.y, SCALE, SCALE, 0*SCALE, 1*SCALE, SCALE, SCALE);
        }
        // circle(pos[0], pos[1], 3);
    }
}

let player;

function setup(){
    loadLevelPack();
    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    player = new Player(64, 64, "#ff0000");
    tileset = loadImage("/sprites/tiles/default-sharp.png");
    background(62);
    noStroke();
    frameRate(120);
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
    noStroke()
    player.update(deltaTime/1000);
    for(let i = 0; i <= LAST_TILE_X; i++){
        for(let j = 0; j <= LAST_TILE_Y; j++){
            let curTile = GetTile(i, j);
            if(curTile == -1)
                continue;
            let iX = curTile % 8;
            let iY = Math.floor(curTile / 8);
            image(tileset, i*SCALE, j*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
        }
    }
    player.draw();
    stroke(0);
}