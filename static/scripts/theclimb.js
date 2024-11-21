const g = p => {
    let CONFIG = localStorage.getItem("config");
    let DEFAULT_CONFIG = {
        KEYS: {
            MOVE_LEFT: [p.LEFT_ARROW, 65],
            MOVE_RIGHT: [p.RIGHT_ARROW, 68],
            MOVE_JUMP: [p.UP_ARROW, 87],
            MOVE_DOWN: [p.DOWN_ARROW, 83]
        }
    };
    let TOUCHES = {
        left: false,
        right: false,
        up: false,
        down: false
    }
    let SOUND_PATHS = {
        coin: "coin.wav"
    }
    let SOUNDS = {};
    if(CONFIG == null){
        CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
    } else
        try{
            CONFIG = JSON.parse(CONFIG);
        } catch {
            CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
        }

    let IS_PRESSED = key => p.keyIsDown(key);

    const SCALE = 24;
    const SCREEN_HEIGHT = 720; const SCREEN_WIDTH = 720;
    const LAST_TILE_X = SCREEN_WIDTH / SCALE - 1;
    const LAST_TILE_Y = SCREEN_HEIGHT / SCALE - 1;
    let DEBUG_MODE = true;

    let LEVELS_LOADED = false;
    let CURRENT_LEVEL_JSON = null;
    let CURRENT_SCREEN = [0,0];
    let tileset;
    let TILES = {};

    let PROPS = {};
    PROPS.fullSolid = {
        solidTop: true,
        solidBottom: true,
        solidLeft: true,
        solidRight: true,
        isSemisolid: false,
        isSlippery: false,
        dissapearOnTouch: false,
    }
    PROPS.bridge = {
        solidTop: true,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: true,
        isSlippery: false,
        dissapearOnTouch: false,
    }
    PROPS.empty = {
        solidTop: false,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: false,
        isSlippery: false,
        dissapearOnTouch: false,
    }
    PROPS.slippery = {
        solidTop: true,
        solidBottom: true,
        solidLeft: true,
        solidRight: true,
        isSemisolid: false,
        isSlippery: true,
        dissapearOnTouch: false,
    }
    PROPS.slipperyBridge = {
        solidTop: true,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: true,
        isSlippery: true,
        dissapearOnTouch: false,
    }

    PROPS.coin = {
        solidTop: false,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: false,
        isSlippery: false,
        dissapearOnTouch: true,
    }

    let ANIMATIONS_5 = {
        20: 21,
        21: 64,
        64: 65,
        65: 20,

        28: 29,
        29: 30,
        30: 31,
        31: 28,
    }

    let ANIMATIONS_20 = {
        160: 161,
        161: 160,
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

        if(id >= 162 && id <= 165)
            return PROPS.slippery;

        if(id == 48 || id == 144)
            return PROPS.bridge;

        if(id == 160 || id == 161)
            return PROPS.coin;

        return PROPS.empty;
    }

    function loadLevelPack(){
        if(!DEBUG_MODE){
            LEVELS_LOADED = false;
            fetch(location.href + 'levelpacks/levels.json')
            .then((response) => response.json())
            .then((levels) => {
                fetch(location.href + "levelpacks/" + levels[0].path)
                .then((response) => response.json())
                .then((levelData) => {
                    CURRENT_LEVEL_JSON = new LevelMap(levelData);
                    LEVELS_LOADED = true;
                })
            });
        } else {
            LEVELS_LOADED = false;
            CURRENT_LEVEL_JSON = new LevelMap(JSON.parse(localStorage.getItem("save")));
            LEVELS_LOADED = true;
        }
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
        this.maxVelX = 350;
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

            let playCoin = false;
            if(this.velX < 0){ // LEFT
                if(TILES.getProps(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetFG(Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetFG(Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE), undefined);
                    playCoin = true;
                }

                if(TILES.getProps(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE))).solidRight ||
                TILES.getProps(GetFG(Math.floor((this.x + dx)/SCALE), Math.floor(this.y/SCALE))).solidRight){
                    this.x = Math.floor((this.x)/SCALE)*SCALE
                    dx = 0;
                    this.velX = 0;
                } else if(TILES.getProps(GetTile(Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).solidRight ||
                TILES.getProps(GetFG(Math.floor((this.x + dx)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).solidRight){
                    this.x = Math.floor((this.x)/SCALE)*SCALE
                    dx = 0;
                    this.velX = 0;
                }
                this.isLeft = true;
            } else if (this.velX > 0){ // RIGHT
                if(TILES.getProps(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetFG(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetFG(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE), undefined);
                    playCoin = true;
                }


                if(TILES.getProps(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE))).solidLeft ||
                TILES.getProps(GetFG(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor(this.y/SCALE))).solidLeft){
                    this.x = Math.floor((this.x + SCALE - 1)/SCALE)*SCALE
                    dx = 0;
                    this.velX = 0;
                } else if(TILES.getProps(GetTile(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).solidLeft ||
                TILES.getProps(GetFG(Math.floor((this.x + dx + SCALE - 1)/SCALE), Math.floor((this.y+SCALE-1)/SCALE))).solidLeft){
                    this.x = Math.floor((this.x + SCALE - 1)/SCALE)*SCALE
                    dx = 0;
                    this.velX = 0;
                }
                this.isLeft = false;
            }
            
            // APPLY HERE TO FIX CORNER CLIPS
            this.x += dx;

            if(this.velY < 0){ // UP
                if(TILES.getProps(GetTile(Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetFG(Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }
                if(TILES.getProps(GetFG(Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE))).dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }

                if(TILES.getProps(GetTile(Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE))).solidBottom ||
                TILES.getProps(GetFG(Math.floor((this.x)/SCALE), Math.floor((this.y+dy)/SCALE))).solidBottom){
                    this.y = Math.floor((this.y)/SCALE)*SCALE;
                    dy = 0;
                    this.velY = 0;
                } else if(TILES.getProps(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE))).solidBottom ||
                TILES.getProps(GetFG(Math.floor((this.x+SCALE-1)/SCALE), Math.floor((this.y+dy)/SCALE))).solidBottom){
                    this.y = Math.floor((this.y)/SCALE)*SCALE;
                    dy = 0;
                    this.velY = 0;
                }
            } else if(this.velY > 0){ // DOWN
                let t1m = TILES.getProps(GetTile(Math.floor((this.x)/SCALE), Math.ceil((this.y+dy)/SCALE)));
                let t1f = TILES.getProps(GetFG(Math.floor((this.x)/SCALE), Math.ceil((this.y+dy)/SCALE)));
                let t2m = TILES.getProps(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.ceil((this.y+dy)/SCALE)));
                let t2f = TILES.getProps(GetFG(Math.floor((this.x+SCALE-1)/SCALE), Math.ceil((this.y+dy)/SCALE)));
                if(t1m.dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x)/SCALE), Math.ceil((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }
                if(t1f.dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x)/SCALE), Math.ceil((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }
                if(t2m.dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, Math.floor((this.x+SCALE-1)/SCALE), Math.ceil((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }
                if(t2f.dissapearOnTouch){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, Math.floor((this.x+SCALE-1)/SCALE), Math.ceil((this.y+dy)/SCALE), undefined);
                    playCoin = true;
                }
                if(
                    (t1m.solidTop && !(t1m.isSemisolid && !t1m.solidBottom && this.downIsPressed)) ||
                    (t1f.solidTop && !(t1m.isSemisolid && !t1m.solidBottom && this.downIsPressed))
                ){
                    this.onIce = t1m.isSlippery || t1f.isSlippery;
                    this.y = Math.floor((this.y+SCALE-dy)/SCALE)*SCALE;
                    dy = 0;
                    this.isOnGround = true;
                    this.velY = 0;
                } else if(
                    (t2m.solidTop && !(t2m.isSemisolid && !t2m.solidBottom && this.downIsPressed)) ||
                    (t2f.solidTop && !(t2m.isSemisolid && !t2m.solidBottom && this.downIsPressed))
                ){
                    this.onIce = t2m.isSlippery || t2f.isSlippery;
                    this.y = Math.floor((this.y+SCALE-dy)/SCALE)*SCALE;
                    dy = 0;
                    this.isOnGround = true;
                    this.velY = 0;
                }
            }
            
            this.y += dy;

            if(playCoin){
                SOUNDS.coin.play();
            }

        }

        this.doInput = function(deltaTime){
            if (CONFIG.KEYS.MOVE_LEFT.some(IS_PRESSED) || TOUCHES.left) {
                // if(this.velX > 0)
                //     this.velX = 0;
                this.velX -= this.maxVelX*deltaTime*4;
            } else if (CONFIG.KEYS.MOVE_RIGHT.some(IS_PRESSED) || TOUCHES.right) {
                // if(this.velX < 0)
                //     this.velX = 0;
                this.velX += this.maxVelX*deltaTime*4;
            } else {
                if(!this.onIce)
                    if(this.velX > 0)
                        this.velX -= this.maxVelX*deltaTime*8;
                    else if(this.velX < 0)
                        this.velX += this.maxVelX*deltaTime*8;
                if(Math.abs(this.velX) < this.maxVelX*deltaTime*4)
                    this.velX = 0;
            }


            if (CONFIG.KEYS.MOVE_JUMP.some(IS_PRESSED) || TOUCHES.up) {
                if(this.isOnGround)
                    this.velY = -this.jumpSpeed;
            }

            this.downIsPressed = false;

            if(CONFIG.KEYS.MOVE_DOWN.some(IS_PRESSED) || TOUCHES.down)
                this.downIsPressed = true;
            
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
        
        this.saveData = function(){
            return {
                x: this.x,
                y: this.y
            };
        }

        this.loadData = function(data){
            this.x = data.x;
            this.y = data.y;
        }
    }

    let player;

    let currentStage = {
    };

    let currentScreen = "play";

    let backgroundSprite;
    p.preload = function(){
        for(let [k, v] of Object.entries(SOUND_PATHS)){
            SOUNDS[k] = p.loadSound("/sounds/" + v);
        }
    }
    p.setup = function(){
        loadLevelPack();
        p.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
        player = new Player(24, 620, "#ff0000");
        tileset = p.loadImage("/sprites/tiles/default-sharp.png");
        backgroundSprite = p.loadImage("/sprites/sky.png");
        p.background(62);
        p.noStroke();
        p.frameRate(120);
        onLoad();
    }

    p.draw = function(){
        if(!LEVELS_LOADED) return;
        switch(currentScreen){
            case "play":
                screen_playGame();
                break;
        }
    }

    function screen_playGame(){
        p.noStroke()
        p.background(0x11, 0x1d, 0x35);
        p.image(backgroundSprite, 0, 0, 720, 720, 0, 960-360+CURRENT_SCREEN[1]*40, 360, 360);
        handleTouches();
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
            doAnims(ANIMATIONS_5);
        }
        if(p.frameCount % 20 == 0){
            doAnims(ANIMATIONS_20);
        }
        if(p.frameCount % 60 == 0){
            onSave();
        }
    }

    function handleTouches(){
        TOUCHES = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        for(let touch of p.touches){
            if(touch.y > SCREEN_HEIGHT-180){
                if(touch.x < SCREEN_WIDTH/4){
                    TOUCHES.left = true;
                } else if(touch.x < SCREEN_WIDTH/2){
                    TOUCHES.right = true;
                } else if(touch.x < SCREEN_WIDTH/4*3){
                    TOUCHES.down = true;
                } else if(touch.x < SCREEN_WIDTH){
                    TOUCHES.up = true;
                }
            }
        }
    }

    function doAnims(anims){
        for(let i = 0; i <= LAST_TILE_X; i++){
            for(let j = 0; j <= LAST_TILE_Y; j++){
                let curTile = GetTile(i, j);
                if(anims[curTile] != null){
                    CURRENT_LEVEL_JSON.setTile(CURRENT_SCREEN, i, j, anims[curTile]);
                }
                curTile = GetBG(i, j);
                if(anims[curTile] != null){
                    CURRENT_LEVEL_JSON.setBG(CURRENT_SCREEN, i, j, anims[curTile]);
                }
                curTile = GetFG(i, j);
                if(anims[curTile] != null){
                    CURRENT_LEVEL_JSON.setFG(CURRENT_SCREEN, i, j, anims[curTile]);
                }
            }
        }
    }

    function onLoad(){
        
    }

    function onSave(){
        localStorage.setItem("config", JSON.stringify(CONFIG));
    }
}

let game = new p5(g, document.getElementById("game"));