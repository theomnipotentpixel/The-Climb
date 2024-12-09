function matNM(n, m) {
    let arr = [];

    for (let i = 0; i < n; i++) {
    arr[i] = []; // Create a new row
    for (let j = 0; j < m; j++) {
        arr[i][j] = 0; // Initialize with 0 (or any value you need)
    }
    }

    return arr;
}


function generateMinimap(map){
    let findEdges = function(map){
        let screenXs = Object.keys(map).map(k => parseInt(k.split(",")[0]));
        let screenYs = Object.keys(map).map(k => parseInt(k.split(",")[1]));
        let minX = Math.min(...screenXs);
        let maxX = Math.max(...screenXs);
        // flipped because negative is up
        let minY = -Math.max(...screenYs);
        let maxY = -Math.min(...screenYs);
        return [[minX, minY], [maxX, maxY]];
    }

    let edges = findEdges(map);
    let mapWidth = edges[1][0] - edges[0][0] + 1;
    let mapHeight = edges[1][1] - edges[0][1] + 1;

    let minimap = matNM(mapHeight, mapWidth);
    
    for(let k of Object.keys(map)){
        let x = parseInt(k.split(",")[0]);
        let y = -parseInt(k.split(",")[1]);
        minimap[y][x] = 1;
    }

    return {
        raw: minimap,
        width: mapWidth,
        height: mapHeight
    };
}


export { generateMinimap };