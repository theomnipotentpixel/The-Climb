let level = {"0,0":{}};
let currentScreen = "0,0";
let SCALE = 24;

function setup(){
    createCanvas(720, 720);
}

function draw(){
    noStroke();
    background(64);
    if(level[currentScreen] == undefined){
        level[currentScreen] = {};
    }
    for(let x = 0; x < 30; x++){
        for(let y = 0; y < 30; y++){
            if(level[currentScreen][x+","+y] == 0){
                fill(0);
            } else if(level[currentScreen][x+","+y] == 1){
                fill(255);
            } else {
                level[currentScreen][x+","+y] = 0;
            }
            rect(x*SCALE, y*SCALE, SCALE, SCALE);
        }
    }
}

function mousePressed(){
    let blockX = Math.floor(mouseX / SCALE);
    let blockY = Math.floor(mouseY / SCALE);
    if(blockX < 0 || blockX > 29 || blockY < 0 || blockY > 29){
        chooseBlock(blockX, blockX);
        return;
    }

    if(level[currentScreen][blockX+","+blockY] == 1){
        level[currentScreen][blockX+","+blockY] = 0;
    } else {
        level[currentScreen][blockX+","+blockY] = 1;
    }
    // alert(blockX+" "+blockY);
}

function saveLevelData(){
    console.log(JSON.stringify(level));
    navigator.clipboard.writeText(JSON.stringify(level));
    alert("Copied!");
}