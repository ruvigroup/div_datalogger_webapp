// Get the canvas and context
var canvas = document.getElementById("sensorDisplay");
var time = new Date().getTime();

// Create an ImageData object
var cameraTopic, ros;


// Display the image
function displayImage(message) {
	var camEl = document.getElementById("cameraImg");
	var imageData = "data:image/jpeg;base64," + message.data;
	camEl.setAttribute('src', imageData);
}

// Subscribe to camera topic (compressed image)
function subscribeToCamera(){
  cameraTopic = connectToTopic('/cv_camera/image_raw/compressed', 'sensor_msgs/CompressedImage', 50);
  cameraTopic.subscribe(function(message) {
    // Display the image
    displayImage(message);
  });
}

// Main loop
function main() {
  ros = connectToROS();
  subscribeToCamera();
}

// Call the main loop
main();
