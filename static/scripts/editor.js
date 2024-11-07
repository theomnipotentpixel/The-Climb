let level = {"0,0":{}};
let currentScreen = "0,0";
let SCALE = 24;

let tileset;

function setup(){
    createCanvas(50*SCALE, 30*SCALE);
    tileset = loadImage("/sprites/tiles/default-sharp.png");
    // for(let x = 0; x < 8; x++){
    //     for(let y = 0; y < tileset.height/SCALE; y++){
    //         tiles[(x+y*8)] = tileset.get(0, 0, SCALE, SCALE);
    //     }
    // }
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
            if(level[currentScreen][x+","+y] != undefined){
                let iX = level[currentScreen][x+","+y] % 8;
                let iY = Math.floor(level[currentScreen][x+","+y] / 8);
                image(tileset, x*SCALE, y*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
            }
        }
    }
    image(tileset, 31*SCALE, 0)
    fill(255, 0, 0);
    rect(728, 0, 8, height)
}

function setBlock(blockX, blockY){
    // if(tiles[currentBlock])
        level[currentScreen][blockX+","+blockY] = currentBlock;
    
}
//                  0-7    , 0-29
function chooseBlock(blockX, blockY){
    currentBlock = (blockY * 8 + blockX);
    console.log(currentBlock);
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

function mouseMoved(){
    // let blockX = Math.floor(mouseX / SCALE);
    // let blockY = Math.floor(mouseY / SCALE);
    // if(blockX > -1 && blockX < 30 && blockY > -1 && blockY < 30){
    //     return;
    // }
    // if(blockX > 30 && blockX < 39 && blockY > -1 && blockY < 30){
    //     chooseBlock(blockX - 31, blockY);
    //     return;
    // }
}

function saveLevelData(){
    console.log(JSON.stringify(level));
    navigator.clipboard.writeText(JSON.stringify(level));
    alert("Copied!");
}

function loadLevelData(){
    level = JSON.parse(prompt("Enter level JSON:"));
}