// get HTML elements
var recordButton = document.getElementById("recordButton");
var recordingTimeSpan = document.getElementById("recordingTime");
var shutdownButton = document.getElementById("shutdownButton");

//declare global variables
var ros,UserCMDService;
var idRecordingTimeInterval;

var SUCCESS = 0; //serviceReponse if the request succeeded

var REQ_STATUS    = 0; //ask for the datalogger status (i.e. recording on or off)
var REQ_REC_START = 1; // start recording
var REQ_REC_STOP  = 2; // stop recording
var REQ_SHUTDOWN  = 10; //shutdown RPi

var STATUS_RECORD_ON  = 1; // recording on status (state_id response from the service)
var STATUS_RECORD_OFF = 0; // recording off status (state_id response from the service)

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
      setRecordOnStyle(recordButton, response);
}
  });
}

function setRecordOnStyle(recordButton, response){
  recordButton.children[1].innerHTML = 'Recording...';
  recordButton.className = 'button recordOn';
idRecordingTimeInterval = setInterval(function(){
    setRecordingTime(new Date().getTime() - response.rec_time.secs*1000 + Math.round(response.rec_time.nsecs/1000000));
}, 1000);
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
	if (idRecordingTimeInterval != null){
	 	clearInterval(idRecordingTimeInterval);
	}
setRecordingTime();
}

function sendShutdownRequest(){
  UserCMDService.callService(shutdownRequest, function(response){
    shutdownButton.children[1].innerHTML = 'Datalogger stopped';
  });
}

function setRecordingTime(msecs){
  if (msecs == null){
    recordingTimeSpan.innerHTML = 'Not recording.';
  } else {
    recordingTimeSpan.innerHTML = new Date(msecs).toISOString().substr(11, 8);
  }
}

ros = connectToROS();
UserCMDService = connectToService('/user_cmd','div_datalogger/UserCMD');
UserCMDService.callService(statusRequest, function(response){
  switch (response.state_id){
    case STATUS_RECORD_ON:
    setRecordOnStyle(recordButton, response);
    
    break;
    case STATUS_RECORD_OFF:
    setRecordOffStyle(recordButton);
    setRecordingTime();

    break;
  }
});

recordButton.onclick = function(){toggle()};
shutdownButton.onclick = function(){shutdownConfirmation()};
