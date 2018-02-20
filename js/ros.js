function connectToROS(){
  var ros = new ROSLIB.Ros({
    url : 'ws://192.168.0.15:9090'
  });

  ros.on('connection', function() { console.log('Connected to websocket server.');});

  ros.on('error', function(error) { console.log('Error connecting to websocket server: ', error); window.alert('Error connecting to websocket server'); });

  ros.on('close', function() { console.log('Connection to websocket server closed.');});

  return ros;
}

function connectToTopic(topicName, messageType, throttleRate){
  return new ROSLIB.Topic({
    ros : ros,
    name : topicName,
    messageType : messageType,
    throttle_rate : throttleRate
  });
}

function connectToService(serviceName, serviceType){
  return new ROSLIB.Service({
    ros : ros,
    name : serviceName,
    serviceType : serviceType
  });
}
