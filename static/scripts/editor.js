let level = localStorage.getItem("save");
if(level == null)
    level = {"0,0":{}};
else
    try{
        level = JSON.parse(level);
    } catch {
        level = {"0,0":{}};
    }
let currentScreen = "0,0";
let SCALE = 24;
let PREFIX = "";

let tileset;

function setup(){
    createCanvas(50*SCALE, 30*SCALE);
    tileset = loadImage("sprites/tiles/default-sharp.png");
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    updateScreenSelect();
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
            if(level[currentScreen][PREFIX+x+","+y] != undefined){
                let iX = level[currentScreen][PREFIX+x+","+y] % 8;
                let iY = Math.floor(level[currentScreen][PREFIX+x+","+y] / 8);
                image(tileset, x*SCALE, y*SCALE, SCALE, SCALE, iX*SCALE, iY*SCALE, SCALE, SCALE);
            }
        }
    }
    image(tileset, 31*SCALE, 0);
    fill(255, 0, 0);
    rect(728, 0, 8, height);
}

function setBlock(blockX, blockY, block){
    // if(tiles[currentBlock])
        level[currentScreen][PREFIX+blockX+","+blockY] = block;
    
}
//                  0-7    , 0-29
function chooseBlock(blockX, blockY){
    currentBlock = (blockY * 8 + blockX);
    console.log(currentBlock);
}

function keyPressed(){
    let cs = currentScreen.split(",");
    cs = [parseInt(cs[0]), parseInt(cs[1])]
    if(keyCode == LEFT_ARROW){
        if(level[(cs[0]-1)+","+(cs[1])])
            cs[0] -= 1;
    }
    if(keyCode == RIGHT_ARROW){
        if(level[(cs[0]+1)+","+(cs[1])])
            cs[0] += 1;
    }
    if(keyCode == UP_ARROW){
        if(level[(cs[0])+","+(cs[1]-1)])
            cs[1] -= 1;
    }
    if(keyCode == DOWN_ARROW){
        if(level[(cs[0])+","+(cs[1]+1)])
            cs[1] += 1;
    }
    currentScreen = cs[0]+","+cs[1]
}

function mousePressed(){
    let blockX = Math.floor(mouseX / SCALE);
    let blockY = Math.floor(mouseY / SCALE);
    if(blockX > 30 && blockX < 39 && blockY > -1 && blockY < 30){
        chooseBlock(blockX - 31, blockY);
        return;
    }
    if(blockX > -1 && blockX < 30 && blockY > -1 && blockY < 30){
        if(mouseButton == LEFT)
            setBlock(blockX, blockY, currentBlock);
        else if(mouseButton == RIGHT)
            setBlock(blockX, blockY, undefined);
        return;
    }
}

function mouseDragged(){
    let blockX = Math.floor(mouseX / SCALE);
    let blockY = Math.floor(mouseY / SCALE);
    if(blockX > -1 && blockX < 30 && blockY > -1 && blockY < 30){
        if(mouseButton == LEFT)
            setBlock(blockX, blockY, currentBlock);
        else if(mouseButton == RIGHT)
            setBlock(blockX, blockY, undefined);
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
    let l = JSON.stringify(level);
    console.log(l);
    navigator.clipboard.writeText(l);
    localStorage.setItem("save", l);
    alert("Copied!");
}

function loadLevelData(){
    level = JSON.parse(prompt("Enter level JSON:"));
    updateScreenSelect();
}

function updateScreenSelect(){
    let screenSelect = document.getElementById("ssel");
    screenSelect.innerHTML = "";
    for(let s of Object.keys(level)){
        screenSelect.innerHTML += `<option value="${s}">${s}</option>`;
    }
}

function setScreen(){
    let screenSelect = document.getElementById("ssel");
    currentScreen = screenSelect.value;
}

function addScreen(){
    let screenToAdd = document.getElementById("sc").value;
    if(level[screenToAdd])
        return;
    level[screenToAdd] = {};
    currentScreen = screenToAdd;
    updateScreenSelect()
}
