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


function generateMinimap(map, activeScreen){
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
    let mapWidth = edges[1][0] - edges[0][0];
    let mapHeight = edges[1][1] - edges[0][1];
    
}


export { generateMinimap };