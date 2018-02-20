// get HTML elements
var recordButton = document.getElementById("recordButton");
var recordingTimeSpan = document.getElementById("recordingTime");
var recordButton = document.getElementById("shutdownButton");

//declare global variables
var ros,UserCMDService;

var SUCCESS = 0; //serviceReponse if the request succeeded

var REQ_STATUS    = 0; //ask for the datalogger status (i.e. recording on or off)
var REQ_REC_START = 1; // start recording
var REQ_REC_STOP  = 2; // stop recording
var REQ_SHUTDOWN  = 10; //shutdown RPi

var STATUS_RECORD_ON  = 1; // recording on status (status_id response from the service)
var STATUS_RECORD_OFF = 2; // recording off status (status_id response from the service)

// create the requests for the service
var statusRequest = new ROSLIB.ServiceRequest({
  request_id : REQ_STATUS
});
var startRecordRequest = new ROSLIB.ServiceRequest({
  request_id : REQ_REC_START
});
var stopRecordRequest = new ROSLIB.ServiceRequest({
  request_id : REQ_REC_STOP
});
var shutdownRequest = new ROSLIB.ServiceRequest({
  request_id : REQ_SHUTDOWN
});

// hasClass function copied from jQuery
function hasClass(element, selector){
  var className = " " + selector + " ";
  return (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1;
}

function shutdownConfirmation(){
  var i = 5;
  var id = setInterval(function(){
    if (i>0){
      shutdownButton.onclick = function(){
        clearInterval(id);
        sendShutdownRequest();
      };
      shutdownButton.children[1].innerHTML = 'Are you sure? (' + i-- + 'sec)';
    } else {
      clearInterval(id);
      shutdownButton.children[1].innerHTML = 'Shutdown';
      shutdownButton.onclick = function(){shutdownConfirmation()};
    }
  }, 1000);
}
// toggle function, to toggle the class recordOn/recordOff of the recordButton
function toggle(){
  if (hasClass(recordButton, 'recordOn')){
    setRecordOff(recordButton);
  } else {
    setRecordOn(recordButton);
  }
}

// set record on, starts recording via the service and change the recordButton class if the request succeeded
function setRecordOn(recordButton){
  UserCMDService.callService(startRecordRequest, function(response){
    if (response.msg_id == SUCCESS){
      setRecordOnStyle(recordButton);
    }
  });
}

function setRecordOnStyle(recordButton){
  recordButton.children[1].innerHTML = 'Recording...';
  recordButton.className = 'button recordOn';
}

// set record on, starts recording via the service and change the recordButton class if the request succeeded
function setRecordOff(recordButton){
  UserCMDService.callService(stopRecordRequest, function(response){
    if (response.msg_id == SUCCESS){
      setRecordOffStyle(recordButton);
    }
  });
}

function setRecordOffStyle(recordButton){
  recordButton.children[1].innerHTML = 'Recording OFF';
  recordButton.className = 'button recordOff';
}

function sendShutdownRequest(){
  UserCMDService.callService(shutdownRequest, function(response){
    shutdownButton.children[1].innerHTML = 'Datalogger stopped';
  });
}

function setRecordingTime(msecs){
  if (msecs == []){
    recordingTimeSpan.innerHTML = 'Not recording.';
  } else {
    recordingTimeSpan.innerHTML = new Date(msecs).toISOString().substr(11, 8);
  }
}

ros = connectToROS();
UserCMDService = connectToService('/user_cmd','div_datalogger/UserCMD');
UserCMDService.callService(statusRequest, function(response){
  console.log(response.rec_time + ' ' + response.msg_id + ' ' + response.status_id);
  switch (response.status_id){
    case STATUS_RECORD_ON:
    setRecordOnStyle(recordButton);
    setRecordingTime(response.rec_time.secs*1000 + Math.round(response.rec_time.nsecs/1000) - new Date().getTime());
    break;
    case STATUS_RECORD_OFF:
    setRecordOffStyle(recordButton);
    setRecordingTime([]);
    break;
  }
});

recordButton.onclick = function(){toggle()};
shutdownButton.onclick = function(){shutdownConfirmation()};
