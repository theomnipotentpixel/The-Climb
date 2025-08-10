import { generateMinimap } from "./utils.js";

const g = p => {
    const DEV_HOSTNAMES = [
        "http://localhost:3000"
    ];
    const IS_DEVMODE = DEV_HOSTNAMES.includes(location.origin);
    let CONFIG;
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
    
    let SPRITE_PATHS = {
        minimap_bg: "minimap-bg.png",
        player: "player.png",
        tileset: "tiles/default-sharp.png",
        sky: "sky.png"
    }

    let SPRITES = {};

    let SOUND_PATHS = {
        coin: "coin.wav",
        bounce: "bounce.wav",
        sunglasses: "not_alone_sunglasses.mp3",
        jump: "jump.wav"
    }
    let SOUNDS = {};

    let IS_PRESSED = key => p.keyIsDown(key);
    let CURRENT_SCREEN = [0,0];

    const SCALE = 24;
    const SCREEN_HEIGHT = 720; const SCREEN_WIDTH = 720;
    const LAST_TILE_X = SCREEN_WIDTH / SCALE - 1;
    const LAST_TILE_Y = SCREEN_HEIGHT / SCALE - 1;
    let DEBUG_MODE = false;
    let IS_PAUSED = false;
    let IS_MINIMAP_SHOWING = false;
    let IS_HUD_SHOWING = true;
    let minimap = null;
    let FONT;
    let TIME_SINCE_START = 0;

    let LEVELS_LOADED = false;
    let CURRENT_LEVEL_JSON = null;
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
        changeOnTouch: false,
        isBouncy: false,
    }
    PROPS.bridge = {
        solidTop: true,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: true,
        isSlippery: false,
        changeOnTouch: false,
        isBouncy: false,
    }
    PROPS.empty = {
        solidTop: false,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: false,
        isSlippery: false,
        changeOnTouch: false,
        isBouncy: false,
    }
    PROPS.slippery = {
        solidTop: true,
        solidBottom: true,
        solidLeft: true,
        solidRight: true,
        isSemisolid: false,
        isSlippery: true,
        changeOnTouch: false,
        isBouncy: false,
    }
    PROPS.slipperyBridge = {
        solidTop: true,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: true,
        isSlippery: true,
        changeOnTouch: false,
        isBouncy: false,
    }

    PROPS.coin = {
        solidTop: false,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: false,
        isSlippery: false,
        changeOnTouch: true,
        changeTo: undefined,
        isBouncy: false,
        sound: "coin",
        onHit: function(){
            player.coins++;
        }
    }

    PROPS.spring = {
        solidTop: true,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: false,
        isSlippery: false,
        changeOnTouch: true,
        changeTo: 226,
        isBouncy: true,
        bounceFactor: 625*1.5,
    }

    PROPS.sunglasses = {
        solidTop: false,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: false,
        isSlippery: false,
        changeOnTouch: true,
        changeTo: 159,
        isBouncy: false,
        sound: "sunglasses",
        onHit: function(){
            player.hasSunglasses = true;
        }
    }

    PROPS.breakable = {
        solidTop: true,
        solidBottom: true,
        solidLeft: true,
        solidRight: true,
        isSemisolid: false,
        isSlippery: false,
        changeOnTouch: true,
        changeTo: undefined,
        isBouncy: false,
        forceJump: true,
    };

    PROPS.key = {
        solidTop: false,
        solidBottom: false,
        solidLeft: false,
        solidRight: false,
        isSemisolid: false,
        isSlippery: false,
        changeOnTouch: true,
        isBouncy: false,
        changeTo: undefined,
        onHit: function(){
            player.keys++;
        }
    }

    PROPS.locked = {
        solidTop: true,
        solidBottom: true,
        solidLeft: true,
        solidRight: true,
        isSemisolid: false,
        isSlippery: false,
        isBouncy: false,
        needsKey: true
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
        if(id >= 76 && id <= 79)
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

        if(id == 226)
            return PROPS.spring;

        if(id == 127)
            return PROPS.sunglasses;

        if(id == 227)
            return PROPS.breakable;

        if(id == 230)
            return PROPS.key;

        if(id == 231)
            return PROPS.locked;

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
        this.hasSunglasses = false;
        this.keys = 0;
        this.coins = 0;

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

            let doCollision = function(x1, y1, x2, y2, pl){

                if(TILES.getProps(GetTile(x1, y1)).changeOnTouch){
                    if(TILES.getProps(GetTile(x1, y1)).sound)
                        SOUNDS[TILES.getProps(GetTile(x1, y1)).sound].play();
                    if(TILES.getProps(GetTile(x1, y1)).onHit)
                        TILES.getProps(GetTile(x1, y1)).onHit();
                    if(TILES.getProps(GetTile(x1, y1)).forceJump)
                        pl.velY = -pl.jumpSpeed/2;

                    CURRENT_LEVEL_JSON.setTile(
                        CURRENT_SCREEN, x1, y1,
                        TILES.getProps(GetTile(x1, y1)).changeTo
                    );
                }

                if(TILES.getProps(GetTile(x1, y1)).needsKey){
                    if(pl.keys > 0){
                        CURRENT_LEVEL_JSON.setTile(
                            CURRENT_SCREEN, x1, y1, undefined
                        );
                        pl.keys--;
                    }
                }
                
                if(TILES.getProps(GetFG(x1, y1)).changeOnTouch){
                    if(TILES.getProps(GetFG(x1, y1)).sound)
                        SOUNDS[TILES.getProps(GetTile(x1, y1)).sound].play();
                    if(TILES.getProps(GetFG(x1, y1)).onHit)
                        TILES.getProps(GetFG(x1, y1)).onHit();
                    if(TILES.getProps(GetFG(x1, y1)).forceJump)
                        pl.velY = -pl.jumpSpeed/2;

                    CURRENT_LEVEL_JSON.setFG(
                        CURRENT_SCREEN, x1, y1,
                        TILES.getProps(GetFG(x1, y1)).changeTo
                    );
                }

                if(TILES.getProps(GetFG(x1, y1)).needsKey){
                    if(pl.keys > 0){
                        CURRENT_LEVEL_JSON.setFG(
                            CURRENT_SCREEN, x1, y1, undefined
                        );
                        pl.keys--;
                    }
                }
                
                if(TILES.getProps(GetTile(x2, y2)).changeOnTouch){
                    if(TILES.getProps(GetTile(x2, y2)).sound)
                        SOUNDS[TILES.getProps(GetTile(x2, y2)).sound].play();
                    if(TILES.getProps(GetTile(x2, y2)).onHit)
                        TILES.getProps(GetTile(x2, y2)).onHit();
                    if(TILES.getProps(GetTile(x2, y2)).forceJump)
                        pl.velY = -pl.jumpSpeed/2;

                    CURRENT_LEVEL_JSON.setTile( 
                        CURRENT_SCREEN, x2, y2,
                        TILES.getProps(GetTile(x2, y2)).changeTo
                    );
                }

                if(TILES.getProps(GetTile(x2, y2)).needsKey){
                    if(pl.keys > 0){
                        CURRENT_LEVEL_JSON.setTile(
                            CURRENT_SCREEN, x2, y2, undefined
                        );
                        pl.keys--;
                    }
                }
                
                if(TILES.getProps(GetFG(x2, y2)).changeOnTouch){
                    if(TILES.getProps(GetFG(x2, y2)).sound)
                        SOUNDS[TILES.getProps(GetTile(x2, y2)).sound].play();
                    if(TILES.getProps(GetFG(x2, y2)).onHit)
                        TILES.getProps(GetFG(x2, y2)).onHit();
                    if(TILES.getProps(GetFG(x2, y2)).forceJump)
                        pl.velY = -pl.jumpSpeed/2;

                    CURRENT_LEVEL_JSON.setFG( 
                        CURRENT_SCREEN, x2, y2, 
                        TILES.getProps(GetFG(x2, y2)).changeTo
                    );
                }

                if(TILES.getProps(GetFG(x2, y2)).needsKey){
                    if(pl.keys > 0){
                        CURRENT_LEVEL_JSON.setFG(
                            CURRENT_SCREEN, x2, y2, undefined
                        );
                        pl.keys--;
                    }
                }

            }

            if(this.velX < 0){ // LEFT
                let x1 = Math.floor((this.x + dx)/SCALE); let y1 = Math.floor(this.y/SCALE);
                let x2 = Math.floor((this.x + dx)/SCALE); let y2 = Math.floor((this.y+SCALE-1)/SCALE);

                doCollision(x1, y1, x2, y2, this);

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
                let x1 = Math.floor((this.x + dx + SCALE - 1)/SCALE); let y1 = Math.floor(this.y/SCALE);
                let x2 = Math.floor((this.x + dx + SCALE - 1)/SCALE); let y2 = Math.floor((this.y+SCALE-1)/SCALE);

                doCollision(x1, y1, x2, y2, this);


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
                let x1 = Math.floor((this.x)/SCALE); let y1 = Math.floor((this.y+dy)/SCALE);
                let x2 = Math.floor((this.x+SCALE-1)/SCALE); let y2 = Math.floor((this.y+dy)/SCALE);

                doCollision(x1, y1, x2, y2, this);

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
                let x1 = Math.floor((this.x)/SCALE); let y1 = Math.ceil((this.y+dy)/SCALE);
                let x2 = Math.floor((this.x+SCALE-1)/SCALE); let y2 = Math.ceil((this.y+dy)/SCALE);
                
                doCollision(x1, y1, x2, y2, this);

                let t1m = TILES.getProps(GetTile(Math.floor((this.x)/SCALE), Math.ceil((this.y+dy)/SCALE)));
                let t1f = TILES.getProps(GetFG(Math.floor((this.x)/SCALE), Math.ceil((this.y+dy)/SCALE)));
                let t2m = TILES.getProps(GetTile(Math.floor((this.x+SCALE-1)/SCALE), Math.ceil((this.y+dy)/SCALE)));
                let t2f = TILES.getProps(GetFG(Math.floor((this.x+SCALE-1)/SCALE), Math.ceil((this.y+dy)/SCALE)));

                if(
                    (t1m.solidTop && !(t1m.isSemisolid && !t1m.solidBottom && this.downIsPressed)) ||
                    (t1f.solidTop && !(t1m.isSemisolid && !t1m.solidBottom && this.downIsPressed))
                ){
                    this.onIce = t1m.isSlippery || t1f.isSlippery;
                    this.y = Math.floor((this.y+SCALE-dy)/SCALE)*SCALE;
                    dy = 0;
                    this.isOnGround = true;
                    this.velY = 0;
                    if(t1m.isBouncy){
                        this.velY = -t1m.bounceFactor;
                        SOUNDS.bounce.play();
                    } else if(t1f.isBouncy){
                        this.velY = -t1f.bounceFactor;
                        SOUNDS.bounce.play();
                    }
                } else if(
                    (t2m.solidTop && !(t2m.isSemisolid && !t2m.solidBottom && this.downIsPressed)) ||
                    (t2f.solidTop && !(t2m.isSemisolid && !t2m.solidBottom && this.downIsPressed))
                ){
                    this.onIce = t2m.isSlippery || t2f.isSlippery;
                    this.y = Math.floor((this.y+SCALE-dy)/SCALE)*SCALE;
                    dy = 0;
                    this.isOnGround = true;
                    this.velY = 0;
                    if(t2m.isBouncy){
                        this.velY = -t2m.bounceFactor;
                        SOUNDS.bounce.play();
                    } else if(t2f.isBouncy){
                        this.velY = -t2f.bounceFactor;
                        SOUNDS.bounce.play();
                    }
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
                if(this.isOnGround){
                    this.velY = -this.jumpSpeed;
                    SOUNDS.jump.play()
                }
            }

            this.downIsPressed = false;

            if(CONFIG.KEYS.MOVE_DOWN.some(IS_PRESSED) || TOUCHES.down)
                this.downIsPressed = true;
            
            this.velX = Math.clamp(this.velX, -this.maxVelX, this.maxVelX);

            this.velY = Math.clamp(this.velY, -this.maxVelY, this.maxVelY);
        }   

        this.draw = function(){
            let sgOffset = this.hasSunglasses ? 2 : 0;
            let actionOffset = 0;
            if(Math.abs(this.velX) > 0)
                actionOffset = p.frameCount % 30 < 15;
            if(this.velY > 0)
                actionOffset = 2;
            else if(this.velY < 0)
                actionOffset = 3;
            if(this.isLeft){
                p.image(SPRITES.player, this.x, this.y, SCALE, SCALE, actionOffset*SCALE, sgOffset*SCALE, SCALE, SCALE);
            } else {
                p.image(SPRITES.player, this.x, this.y, SCALE, SCALE, actionOffset*SCALE, (sgOffset+1)*SCALE, SCALE, SCALE);
            }
        }
        
        this.saveData = function(){
            return {
                x: this.x,
                y: this.y,
                keys: this.keys,
                coins: this.coins,
            };
        }

        this.loadData = function(data){
            this.x = data.x;
            this.y = data.y;
            this.keys = data.keys ?? 0;
            this.coins = data.coins ?? 0;
        }
    }

    let currentStage = {
    };

    let currentScreen = "play";

    let player;

    let backgroundSprite;

    function loadAssets(){
        for(let [k, v] of Object.entries(SOUND_PATHS)){
            SOUNDS[k] = p.loadSound("sounds/" + v);
        }
        for(let [k, v] of Object.entries(SPRITE_PATHS)){
            SPRITES[k] = p.loadImage("sprites/" + v);
        }
    }

    p.preload = function(){
        loadAssets();
    }

    p.setup = function(){
        loadLevelPack();
        p.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
        player = new Player(24, 620, "#ff0000");
        FONT = p.loadFont('/fonts/main.ttf');
        p.textFont(FONT);
        tileset = SPRITES.tileset;
        backgroundSprite = SPRITES.sky;
        p.background(62);
        p.noStroke();
        p.frameRate(120);
        onLoad();
        if(!IS_DEVMODE)
            alert("Arrow keys to move. Get to the top!")
    }

    p.draw = function(){
        if(!LEVELS_LOADED) return;
        switch(currentScreen){
            case "play":
                screen_playGame();
                break;
            case "level_select":
                screen_levelSelect();
                break;
        }
    }

    function screen_levelSelect(){
        
    }

    function screen_paused(){
        
    }

    function screen_hudOverlay(){
        let keyIcon = 230;
        let iX = keyIcon % 8;
        let iY = Math.floor(keyIcon / 8);
        p.image(SPRITES.tileset, SCREEN_WIDTH-SCALE*5, 16, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);

        let coinIcon = 160;
        iX = coinIcon % 8;
        iY = Math.floor(coinIcon / 8);
        p.image(SPRITES.tileset, 16, 16, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);

        p.textAlign(p.LEFT, p.TOP);
        p.textSize(SCALE);
        p.text(`: ${player.coins}`, 44, 16);
        p.text(`: ${player.keys}`, SCREEN_WIDTH-SCALE*5 + SCALE + 4, 16);

        p.textAlign(p.LEFT, p.TOP);
        let millis = (""+(Math.floor(TIME_SINCE_START) % 1000)).padStart(3, "0");
        let secs = (""+(Math.floor(TIME_SINCE_START / 1000) % 60)).padStart(2, "0");
        let mins = (""+(Math.floor(TIME_SINCE_START / 1000 / 60) % 60)).padStart(2, "0");
        let hours = ""+(Math.floor(TIME_SINCE_START / 1000 / 60 / 60) % 60);
        p.text(`${hours}:${mins}:${secs}.${millis}`, SCREEN_WIDTH / 2 - SCALE*3, 16)
    }

    function screen_playGame(){

        p.noStroke();
        p.background(0x11, 0x1d, 0x35);
        p.image(SPRITES.sky, 0, 0, 720, 720, 0, 960-360+CURRENT_SCREEN[1]*40, 360, 360);

        handleTouches();
        if(!IS_PAUSED){
            player.update(p.deltaTime/1000);
            TIME_SINCE_START += p.deltaTime;
        }
        for(let i = 0; i <= LAST_TILE_X; i++){
            for(let j = 0; j <= LAST_TILE_Y; j++){
                let curTile = GetBG(i, j);
                if(curTile == -1)
                    continue;
                let iX = curTile % 8;
                let iY = Math.floor(curTile / 8);
                p.image(SPRITES.tileset, i*SCALE, j*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
            }
        }
        for(let i = 0; i <= LAST_TILE_X; i++){
            for(let j = 0; j <= LAST_TILE_Y; j++){
                let curTile = GetTile(i, j);
                if(curTile == -1)
                    continue;
                let iX = curTile % 8;
                let iY = Math.floor(curTile / 8);
                p.image(SPRITES.tileset, i*SCALE, j*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
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
                p.image(SPRITES.tileset, i*SCALE, j*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
            }
        }
        if(IS_MINIMAP_SHOWING){
            p.imageMode(p.CENTER);
            p.image(SPRITES.minimap_bg, SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            p.image(minimap.gfx, SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            p.imageMode(p.CORNER);
        }
        
        if(IS_HUD_SHOWING)
            screen_hudOverlay();
        
        if(!IS_PAUSED){
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
        if(IS_PAUSED){
            screen_paused();
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

    p.keyPressed = function(event){
        if(p.keyCode == p.ESCAPE){
            IS_PAUSED = !IS_PAUSED;
        } else if(p.keyCode == 82){
            CURRENT_SCREEN = [0, 0];
            player = new Player(24, 620, "#ff0000");
            TIME_SINCE_START = 0;
        } else if(p.keyCode == 192 && IS_DEVMODE){
            let screenInput = prompt("What screen would you like to go to? (x,y)");
            let x = parseInt(screenInput.split(",")[0]);
            let y = parseInt(screenInput.split(",")[1]);
            CURRENT_SCREEN = [x,y];
        } else if(p.keyCode == 9){
            event.preventDefault();
            IS_MINIMAP_SHOWING = !IS_MINIMAP_SHOWING;
            if(IS_MINIMAP_SHOWING)
                initMinimap();
        } else if(p.keyCode == 72){
            IS_HUD_SHOWING = !IS_HUD_SHOWING;
        }
    }

    function initMinimap(){
        minimap = generateMinimap(CURRENT_LEVEL_JSON.stages);

        const minimapScale = 24;

        let gfxWidth = minimap.width * (minimapScale + 2), gfxHeight = minimap.height * (minimapScale + 2);

        let gfx = p.createGraphics(gfxWidth, gfxHeight);
        gfx.noStroke();

        for(let x = 0; x < minimap.width; x++){
            for(let y = 0; y < minimap.height; y++){
                if(minimap.raw[y][x] == 1){
                    gfx.fill(0, 123);
                } else {
                    gfx.fill(0, 0);
                }
                if(x == CURRENT_SCREEN[0] && y == -CURRENT_SCREEN[1]){
                    gfx.fill(0, 255, 0, 123);
                }
                let drawX = (x * (minimapScale + 2)) - 2;
                let drawY = (((minimap.height - y - 1) * (minimapScale + 2)) - 2);
                gfx.rect(drawX, drawY, minimapScale, minimapScale);
            }
        }
        
        minimap.gfx = gfx;
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
        CONFIG = localStorage.getItem("config");
        
        if(CONFIG == null){
            CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        } else
            try{
                CONFIG = JSON.parse(CONFIG);
            } catch {
                CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
            }

            
        let playerData = localStorage.getItem("pd");
        
        if(playerData == null){
            
        } else
            try{
                playerData = JSON.parse(playerData);
                player.loadData(playerData);
            } catch {

            }

            
        let cs = localStorage.getItem("cs");
        
        if(cs == null){
            
        } else
            try{
                cs = JSON.parse(cs);
                CURRENT_SCREEN = cs;
            } catch {

            }


            
        let TIME_SINCE_START = localStorage.getItem("tss");
        
        if(TIME_SINCE_START == null){
            TIME_SINCE_START = 0;
        } else {
            TIME_SINCE_START = parseFloat(TIME_SINCE_START);
        }
    }

    function onSave(){
        localStorage.setItem("config", JSON.stringify(CONFIG));
        localStorage.setItem("pd", JSON.stringify(player.saveData()));
        localStorage.setItem("cs", JSON.stringify(CURRENT_SCREEN));
        localStorage.setItem("tss", TIME_SINCE_START+"");
    }
}

let game = new p5(g, document.getElementById("game"));
