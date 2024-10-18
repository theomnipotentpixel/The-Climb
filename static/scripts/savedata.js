function addSaveData(key, value){
    localStorage.setItem(key, value);
}

function getSaveData(key, defaultValue){
    localStorage.getItem(key);
}