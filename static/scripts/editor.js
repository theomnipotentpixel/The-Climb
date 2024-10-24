let level = {"0,0":{}};
let currentScreen = "0,0";
let SCALE = 24;

let blockSpritePaths = {
    0: "air.png",
    1: "filled.png",
    2: "red.png",
    3: "green.png",
    4: "blue.png",
}

let blockSprites = {};

function setup(){
    createCanvas(39*SCALE, 30*SCALE);
    for (const [k, v] of Object.entries(blockSpritePaths)) {
        blockSprites[k] = loadImage("/sprites/tiles/" + v);
    }
}

let currentBlock = 0;

function draw(){
    noStroke();
    background(64);
    if(level[currentScreen] == undefined){
        level[currentScreen] = {};
    }
    for(let x = 0; x < 30; x++){
        for(let y = 0; y < 30; y++){
            if(level[currentScreen][x+","+y] == undefined)
                level[currentScreen][x+","+y] = 0;
            image(blockSprites[level[currentScreen][x+","+y]], x * SCALE, y * SCALE, SCALE, SCALE);
        }
    }
    for(let x = 30; x < 38; x++){
        for(let y = 0; y < 30; y++){
            let blockId = y * 8 + x - 31;
            let blkSpr = blockSprites[blockId];
            if(blkSpr == undefined)
                continue;
            // console.log(x, y, blockId);
            image(blkSpr, x * SCALE, y * SCALE, SCALE, SCALE);
        }
    }
    fill(255, 0, 0);
    rect(728, 0, 8, height)
}

function setBlock(blockX, blockY){
    if(blockSpritePaths[currentBlock])
        level[currentScreen][blockX+","+blockY] = currentBlock;
    
}
//                  0-7    , 0-29
function chooseBlock(blockX, blockY){
    currentBlock = blockY * 8 + blockX;
}

function mousePressed(){
    let blockX = Math.floor(mouseX / SCALE);
    let blockY = Math.floor(mouseY / SCALE);
    if(blockX > 30 && blockX < 39 && blockY > -1 && blockY < 30){
        chooseBlock(blockX - 31, blockY);
        return;
    }
    if(blockX > -1 && blockX < 30 && blockY > -1 && blockY < 30){
        setBlock(blockX, blockY);
        return;
    }
}

function mouseDragged(){
    let blockX = Math.floor(mouseX / SCALE);
    let blockY = Math.floor(mouseY / SCALE);
    if(blockX > -1 && blockX < 30 && blockY > -1 && blockY < 30){
        setBlock(blockX, blockY);
        return;
    }
}

function saveLevelData(){
    console.log(JSON.stringify(level));
    navigator.clipboard.writeText(JSON.stringify(level));
    alert("Copied!");
}