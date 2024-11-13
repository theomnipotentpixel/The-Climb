const g = p => {
    const SCALE = 24;
    const SCREEN_HEIGHT = 720; const SCREEN_WIDTH = 720;
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

    let ANIMATIONS = {
        20: 21,
        21: 64,
        64: 65,
        65: 20,

        28: 29,
        29: 30,
        30: 31,
        31: 28
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
        if(id >= 96 && id <= 99)
            return PROPS.fullSolid;
        if(id >= 104 && id <= 107)
            return PROPS.fullSolid;
        if(id >= 112 && id <= 115)
            return PROPS.fullSolid;
        if(id >= 120 && id <= 123)
            return PROPS.fullSolid;

        if(id == 48 || id == 144)
            return PROPS.bridge;

        return PROPS.empty;
    }

    let CURRENT_SCREEN = [0,0];

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

    function GetFG(x, y){
        x = Math.floor(x);
        y = Math.floor(y);
        return CURRENT_LEVEL_JSON.getFG(CURRENT_SCREEN, x, y);
    }

    function GetBG(x, y){
        x = Math.floor(x);
        y = Math.floor(y);
        return CURRENT_LEVEL_JSON.getBG(CURRENT_SCREEN, x, y);
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

        this.setTile = function(screen, x, y, tileID){
            let tmp = this.stages[screen[0]+","+screen[1]];
            if(tmp == null)
                return;
            tmp[x+","+y] = tileID;
        }

        this.setFG = function(screen, x, y, tileID){
            let tmp = this.stages[screen[0]+","+screen[1]];
            if(tmp == null)
                return;
            tmp["fg_"+x+","+y] = tileID;
        }

        this.setBG = function(screen, x, y, tileID){
            let tmp = this.stages[screen[0]+","+screen[1]];
            if(tmp == null)
                return;
            tmp["bg_"+x+","+y] = tileID;
        }

        this.getTile = function(screen, x, y){
            screen = [screen[0], screen[1]]
            if(x < 0){
                x += 30
                screen[0] -= 1;
            }
            if(x >= 30){
                x -= 30;
                screen[0] += 1;
            }
            if(y < 0){
                y += 30;
                screen[1] -= 1; // up is negative for screens
            }
            if(y >= 30){
                y -= 30;
                screen[1] += 1;
            }

            let tmp = this.stages[screen[0]+","+screen[1]];
            if(tmp == null)
                return 0;
            tmp = tmp[x+","+y];
            if(tmp == null) tmp = -1;
            return tmp;
        }

        this.getFG = function(screen, x, y){
            screen = [screen[0], screen[1]]
            if(x < 0){
                x += 30
                screen[0] -= 1;
            }
            if(x >= 30){
                x -= 30;
                screen[0] += 1;
            }
            if(y < 0){
                y += 30;
                screen[1] -= 1; // up is negative for screens
            }
            if(y >= 30){
                y -= 30;
                screen[1] += 1;
            }

            let tmp = this.stages[screen[0]+","+screen[1]];
            if(tmp == null)
                return 0;
            tmp = tmp["fg_"+x+","+y];
            if(tmp == null) tmp = -1;
            return tmp;
        }

        this.getBG = function(screen, x, y){
            screen = [screen[0], screen[1]]
            if(x < 0){
                x += 30
                screen[0] -= 1;
            }
            if(x >= 30){
                x -= 30;
                screen[0] += 1;
            }
            if(y < 0){
                y += 30;
                screen[1] -= 1; // up is negative for screens
            }
            if(y >= 30){
                y -= 30;
                screen[1] += 1;
            }

            let tmp = this.stages[screen[0]+","+screen[1]];
            if(tmp == null)
                return 0;
            tmp = tmp["bg_"+x+","+y];
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
        this.sprites = p.loadImage("sprites/player.png");

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

            this.handleScreenChanges();
        }

        this.handleScreenChanges = function(){
            if(this.x < -10){
                CURRENT_SCREEN[0] -= 1;
                this.x += 720
            } else if(this.x >= 710){
                CURRENT_SCREEN[0] += 1;
                this.x -= 720
            }
            if(this.y < -10){
                CURRENT_SCREEN[1] -= 1;
                this.y += 720
            } else if(this.y >= 710){
                CURRENT_SCREEN[1] += 1;
                this.y -= 720
            }
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
            if (p.keyIsDown(p.LEFT_ARROW) == true || p.keyIsDown(65) == true) {
                if(this.velX > 0)
                    this.velX = 0;
                this.velX -= this.maxVelX*deltaTime*8;
            } else if (p.keyIsDown(p.RIGHT_ARROW) == true || p.keyIsDown(68) == true) {
                if(this.velX < 0)
                    this.velX = 0;
                this.velX += this.maxVelX*deltaTime*8;
            } else {
                this.velX = 0;
            }


            if (p.keyIsDown(p.UP_ARROW) == true || p.keyIsDown(87) == true) {
                if(this.isOnGround)
                    this.velY = -this.jumpSpeed;
            }
            this.velX = Math.clamp(this.velX, -this.maxVelX, this.maxVelX);

            this.velY = Math.clamp(this.velY, -this.maxVelY, this.maxVelY);
        }   

        this.draw = function(){
            p.noStroke();
            if(this.isLeft){
                p.image(this.sprites, this.x, this.y, SCALE, SCALE, 0*SCALE, 0*SCALE, SCALE, SCALE);
            } else {
                p.image(this.sprites, this.x, this.y, SCALE, SCALE, 0*SCALE, 1*SCALE, SCALE, SCALE);
            }
        }
    }

    let player;

    let currentStage = {
    };

    let currentScreen = "play";


    p.setup = function(){
        loadLevelPack();
        p.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
        player = new Player(24, 620, "#ff0000");
        tileset = p.loadImage("/sprites/tiles/default-sharp.png");
        p.background(62);
        p.noStroke();
        p.frameRate(120);
    }

    p.draw = function(){
        if(!LEVELS_LOADED) return;
        p.background(62);
        switch(currentScreen){
            case "play":
                screen_playGame();
                break;
        }
    }

    function screen_playGame(){
        p.noStroke()
        player.update(p.deltaTime/1000);
        for(let i = 0; i <= LAST_TILE_X; i++){
            for(let j = 0; j <= LAST_TILE_Y; j++){
                let curTile = GetBG(i, j);
                if(curTile == -1)
                    continue;
                let iX = curTile % 8;
                let iY = Math.floor(curTile / 8);
                p.image(tileset, i*SCALE, j*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
            }
        }
        for(let i = 0; i <= LAST_TILE_X; i++){
            for(let j = 0; j <= LAST_TILE_Y; j++){
                let curTile = GetTile(i, j);
                if(curTile == -1)
                    continue;
                let iX = curTile % 8;
                let iY = Math.floor(curTile / 8);
                p.image(tileset, i*SCALE, j*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
            }
        }
        player.draw();
        for(let i = 0; i <= LAST_TILE_X; i++){
            for(let j = 0; j <= LAST_TILE_Y; j++){
                let curTile = GetFG(i, j);
                if(curTile == -1)
                    continue;
                let iX = curTile % 8;
                let iY = Math.floor(curTile / 8);
                p.image(tileset, i*SCALE, j*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
            }
        }
        if(p.frameCount % 5 == 0){
            doAnims();
        }
    }

    function doAnims(){
        player.update(p.deltaTime/1000);
        for(let i = 0; i <= LAST_TILE_X; i++){
            for(let j = 0; j <= LAST_TILE_Y; j++){
                let curTile = GetTile(i, j);
                if(ANIMATIONS[curTile] != null){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, i, j, ANIMATIONS[curTile]);
                }
                curTile = GetBG(i, j);
                if(ANIMATIONS[curTile] != null){
                    CURRENT_LEVEL_JSON.setBG(CURRENT_SCREEN, i, j, ANIMATIONS[curTile]);
                }
                curTile = GetFG(i, j);
                if(ANIMATIONS[curTile] != null){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, i, j, ANIMATIONS[curTile]);
                }
            }
        }
    }
}

let game = new p5(g, document.getElementById("game"));