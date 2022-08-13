let tagList = [];
let search = " ";
let replace = "-"

function addToList(that){
    if(!tagList.includes(that.innerHTML.replaceAll(search, replace))){
        let stringToAdd = that.innerHTML.replaceAll(search, replace);
        that.className = "";
        that.classList.add("btn-clicked");
        tagList.push(stringToAdd);
        updateValue();
        
    }else{
        let index = tagList.indexOf(that.innerHTML.replaceAll(search, replace));
        tagList.splice(index, 1);
        that.className = "";
        that.classList.add("btn-unclicked");
        updateValue();
    }
}

function updateValue(){
    let strCopy = "";
    for (var i = 0; i < tagList.length; i++){
        strCopy += tagList[i] + "+"
        if(i == tagList.length-1){
            document.getElementById('categoryList').value = strCopy;
        }
    }
}