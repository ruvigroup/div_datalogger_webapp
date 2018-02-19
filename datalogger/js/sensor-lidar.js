// Get the canvas and context
    var canvas = document.getElementById("sensorDisplay"); 
    var context = canvas.getContext("2d");
 
var time = new Date().getTime();
    // Define the image dimensions
    var width = canvas.width;
    var height = canvas.height;
 
    var xLim = [-120, 121];
    var yLim = [0, 121];

    // Create an ImageData object
    var imagedata = context.createImageData(width, height);
    var lidarTopic, ros;

	var data = [];

	var minAngle = -95;
	var maxAngle = 95;
	var angleStep = 0.125;
	var angleArray = [];

	function connectToROS(){
	ros = new ROSLIB.Ros({
	   url : 'ws://192.168.0.15:9090'
	  });

	ros.on('connection', function() { console.log('Connected to websocket server.');});

	ros.on('error', function(error) { console.log('Error connecting to websocket server: ', error); window.alert('Error connecting to websocket server'); });

	ros.on('close', function() { console.log('Connection to websocket server closed.');});

	lidarTopic = new ROSLIB.Topic({
		ros : ros,
		name : '/scan',
		messageType : 'sensor_msgs/LaserScan',
		throttle_rate : 500
			  });
}
    // Create the image
    function createImage() {
        // Clear image
        for (var i=0; i<imagedata.data.length; i++){
            imagedata.data[i] = 0;
        }
        // Loop over all of the pixels        
        for (var i=0; i<data.length; i++){
                x = data[i][0];
                y = data[i][1];
                // Get the pixel index
            if (x>=xLim[0] & x<xLim[1] & y>=yLim[0] & y<yLim[1]){
                var pixelindex = Math.round(width * Math.round((yLim[1]-y) * height / (yLim[1]-yLim[0]))+ width/2 + x*width/(xLim[1]-xLim[0])) * 4;
 
                // Set the pixel data
                imagedata.data[pixelindex] = 47;     // Red
                imagedata.data[pixelindex+1] = 79; // Green
                imagedata.data[pixelindex+2] = 79;  // Blue
                imagedata.data[pixelindex+3] = 255;   // Alpha      
            }
        }
        
        // create the origin point
        // Get the pixel index
        
                pixelindex = Math.round((height-1) * width + width/2) * 4;
                imagedata.data[pixelindex] = 255;     // Red
                imagedata.data[pixelindex+1] = 0; // Green
                imagedata.data[pixelindex+2] = 0;  // Blue
                imagedata.data[pixelindex+3] = 255;   // Alpha 

       // Draw the image data to the canvas
        context.putImageData(imagedata, 0, 0);
        
        context.beginPath();
        context.arc(width/2, height, width/2, 0, Math.PI, true);
        context.strokeStyle = '#FFFFFF';
        context.stroke();
        context.beginPath();
        context.arc(width/2, height, width/4, 0, Math.PI, true);
        context.strokeStyle = '#FFFFFF';
        context.stroke();
    }



function subscribeToLidar(){
	lidarTopic.subscribe(function(message) {

		//if (new Date().getTime() - time > 5000){
		ranges = message.ranges;
		data = [];
		for (var i=0; i<ranges.length; i++){		
			y = ranges[i]*Math.cos(angleArray[i] * Math.PI/180);
			x = -ranges[i]*Math.sin(angleArray[i] * Math.PI/180);
			data.push([x,y]);
		}	
		// Create the image		
		createImage();
		//time = new Date().getTime();
		//}
            });
}
    // Main loop
    function main() {
	 for (var i = minAngle; i <= maxAngle; i+=angleStep){
 		angleArray.push(i); //degrees
	}
	   document.getElementById('zoomIn').addEventListener('click', function(){
		xLim[0] /= 2;
		xLim[1] /= 2;
		yLim[1] /= 2;
		document.getElementById('zoomValue').innerHTML = -xLim[0];
	    });
	    document.getElementById('zoomOut').addEventListener('click', function(){
		xLim[0] *= 2;
		xLim[1] *= 2;
		yLim[1] *= 2;
		document.getElementById('zoomValue').innerHTML = -xLim[0];
	    });
	    document.getElementById('resetZoom').addEventListener('click', function(){
		xLim[0] = -120;
		xLim[1] = 121;
		yLim[1] = 121;
		document.getElementById('zoomValue').innerHTML = -xLim[0];
	    });
	connectToROS();
	subscribeToLidar(); 
         
    }
 
    // Call the main loop
    main();
    





