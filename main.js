var state = 0;
var color = false;
var cc;
var count = 0;

var config = {
  apiKey: "AIzaSyCWzd6NC1ftC85N4FJHlJWaxQWu08OK298",
  authDomain: "call-buton.firebaseapp.com",
  databaseURL: "https://call-buton.firebaseio.com",
  projectId: "call-buton",
  storageBucket: "call-buton.appspot.com",
  messagingSenderId: "239443672794"
};
firebase.initializeApp(config);

var database = firebase.database();
var sound = document.getElementById("audio");

function changeColor() {
  if (color) {
    document.getElementById("p").className = "error";
    color=false;
  } else { 
    document.getElementById("p").className = "calling";
    color=true;
  }
  count++;
  if(count == 8){
    sound.pause();
    sound.currentTime = 0;

    sound.play();
    count = 0;
  }
}

function startWatch() {
  database.ref("Status/").on("value",function(snapshot) {
    if(state != 2 && state != 3){
      if(snapshot.val().Status){
        setState(1);
      }else{
        setState(0);
      }
    }
  });
  setInterval(function(){
    database.ref("Status/").once("value", function(data) {
      if(Math.floor( new Date().getTime() / 1000 ) - data.val().LastPing > 60){
        setState(2);
      }else{
        if(data.val().Status){
          setState(1);
        }else{
          setState(0);
        }
      }
    });
  },5000);
}

startWatch();

function setState(s){
  state = s;
  clearTimeout(cc);
  switch(s){
    case 0:
      document.getElementById("p").className = "nomality";
      document.getElementById("render").innerText = "正常です";
      break;
    case 1:
      document.getElementById("render").innerText = "呼び出し";
      changeColor();
      cc = setInterval(changeColor,300);
      break;
    case 2:
      document.getElementById("p").className = "error";
      document.getElementById("render").innerText = "Error: No Btn Ping";
      break;
    case 3:
      document.getElementById("p").className = "error";
      document.getElementById("render").innerText = "Error: Not Connected";
      break;
  }
  var scale = ( window.innerWidth / document.defaultView.getComputedStyle(document.getElementById("render"), null).width.replace(/px/g,"") ) - ((window.innerWidth / document.defaultView.getComputedStyle(document.getElementById("render"), null).width.replace(/px/g,"") ) / 10 * 2) ;
  document.getElementById("render").style.padding = (((window.innerHeight / scale) - document.defaultView.getComputedStyle(document.getElementById("render"), null).height.replace(/px/g,"")) / 2) + "px " + (window.innerWidth / 10 / scale) + "px";
  document.getElementById("render").style.transform = `scale(${scale})`;
}

function onKeyPress(e) {
  if ( e.keyCode !== 13 || ( e.keyCode === 13 && (e.shiftKey === true || e.ctrlKey === true || e.altKey === true) )) { // Enterキー除外
    return false;
  }
  if(state == 1) firebase.database().ref('/Status/Status').set(false);
}

document.getElementById("body").addEventListener("click",function (evt) {
  if(state == 1) firebase.database().ref('/Status/Status').set(false);
});
