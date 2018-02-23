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

var logBox = document.getElementById("logbox");
var time = new Date().getTime();

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

function subscribeToLog() {
	rosinfo = connectToTopic('/rosout', 'rosgraph_msgs/Log', 100);
	rosinfo.subscribe(function(message) {
		if (new Date().getTime() - time > 100){
			showLog(message);
			time = new Date().getTime();
		}
	});
}

function getHtmlMessage(message){
	toffset = (new Date()).getTimezoneOffset() * 60000;
	timeStamp = (new Date(Date.now() - toffset)).toISOString().substr(11, 8);
	
	return '<span style="color:white">[' + timeStamp + ']: </span> <span class="logLevel' + message.level + '"><b>' + message.name + '</b>: ' + message.msg + '</span><br>';
}
function showLog(message){
    var div = document.createElement('div');
    div.innerHTML = getHtmlMessage(message);
	
    div.className = 'logMessage';

	// Add child div and scroll down if bar is scrolled down
	scrollDown = false;
	if (logBox.scrollHeight - logBox.scrollTop == logBox.clientHeight){
    	scrollDown = true;
	}

	logBox.appendChild(div);

	if (scrollDown){
		logBox.scrollTop = logBox.scrollHeight;
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
subscribeToLog();
