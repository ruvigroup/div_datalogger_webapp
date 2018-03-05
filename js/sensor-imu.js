var container;

var camera, scene, renderer;
var ros, imuTopic;
var cube, lidar;
var container = document.getElementById('sensorDisplay');
var windowHalfX = container.clientWidth / 2;
var windowHalfY = container.clientHeight / 2;
var time = new Date().getTime();
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 60, windowHalfX / windowHalfY, 0.1, 2000 );
	camera.position.set( 200, 200, 200 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xE1B661 );

	// loading manager

	var loadingManager = new THREE.LoadingManager( function() {
		dataloggerMesh = datalogger.children[0];
		var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
		dataloggerMesh.material = material;
		// fix the "missing faces" by making sure that the faces are visible both sides.
	//  lidarMesh.material.side = THREE.DoubleSide;
		scene.add( dataloggerMesh );
	} );

	// collada

	var loader = new THREE.ColladaLoader( loadingManager );
	loader.load( './3dmodels/DataLogger.dae', function ( collada ) {

		datalogger = collada.scene;

	} );

	//

	var ambientLight = new THREE.AmbientLight( 0xcccccc, .2 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
	directionalLight.position.set( 100, 100, 0 ).normalize();
	scene.add( directionalLight );

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( container.clientWidth, container.clientHeight );
	container.appendChild( renderer.domElement );

	//


	//

	window.addEventListener( 'resize', onWindowResize, false );

	// connect to the websocket to update the model's orientation
	ros = connectToROS();
	subscribeToIMU();

}



function subscribeToIMU(){
	imuTopic = connectToTopic('/imu/data', 'sensor_msgs/Imu', 100);
	imuTopic.subscribe(function(message) {
		if (new Date().getTime() - time > 10){
			setCubeOrientation(message.orientation);
			render();
			time = new Date().getTime();
		}
	});
}
function onWindowResize() {

	windowHalfX = container.clientWidth / 2;
	windowHalfY = container.clientHeight / 2;

	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( container.clientWidth, container.clientHeight );

}


function animate() {

	requestAnimationFrame( animate );

	render();

}
function setCubeOrientation(data){
	cube.quaternion.x = data.x;
	cube.quaternion.y = data.y;
	cube.quaternion.z = data.z;
	cube.quaternion.w = data.w;
}

function render() {

	renderer.render( scene, camera );

}
