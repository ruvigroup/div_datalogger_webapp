var recordButton = document.getElementById("recordButton");

function hasClass(element, selector){
  var className = " " + selector + " ";
  return (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1;
}

function toggle(){
  if (hasClass(recordButton, 'recordOn')){
    setRecordOff(recordButton);
  } else {
    setRecordOn(recordButton);
  }
}

function setRecordOn(recordButton){
  recordButton.children[1].innerHTML = 'Recording...';
  recordButton.className = 'button recordOn';
}

function setRecordOff(recordButton){
  recordButton.children[1].innerHTML = 'Recording OFF';
  recordButton.className = 'button recordOff';
}

recordButton.onclick = function(){toggle()};
