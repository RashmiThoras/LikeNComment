//Elements

let TitleElement = document.getElementById("DisplayTitleTask")
let buttonElement = document.getElementById("DisplayBtn")
// let varTitle = ""
var query = { active: true, currentWindow: true }


buttonElement.onclick = function() {
    chrome.tabs.query(query, callback);
}

function callback(tabs) {
    var currentTab = tabs[0]; // there will be only one in this array
    var varTitle = currentTab.title;
    let titlename = "Title Name:";

    document.getElementById("output").innerHTML = titlename + " " + varTitle.fontcolor("lightgreen"); 
    
    console.log(varTitle);
    console.log(currentTab.title); // also has properties like currentTab.id
  }

