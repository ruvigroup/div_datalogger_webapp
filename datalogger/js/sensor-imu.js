var container;

			var camera, scene, renderer;
			var ros, imuTopic;
			var cube;
            var container = document.getElementById('sensorDisplay');
			var windowHalfX = container.clientWidth / 2;
			var windowHalfY = container.clientHeight / 2;
			var time = new Date().getTime();
			init();
			render();

			function init() {

				camera = new THREE.PerspectiveCamera( 70, container.clientWidth / container.clientHeight, 1, 1000 );
				camera.position.y = 150;
				camera.position.z = 500;

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xE1B661 );

				// Cube

				var geometry = new THREE.BoxGeometry( 200, 200, 200 );

				for ( var i = 0; i < geometry.faces.length; i += 2 ) {

					var hex = Math.random() * 0xffffff;
					geometry.faces[ i ].color.setHex( hex );
					geometry.faces[ i + 1 ].color.setHex( hex );

				}

				var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

				cube = new THREE.Mesh( geometry, material );
				cube.position.y = 150;
				scene.add( cube );
				

				renderer = new THREE.CanvasRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( container.clientWidth, container.clientHeight );
				container.appendChild( renderer.domElement );
                
				//

				window.addEventListener( 'resize', onWindowResize, false );

				connectToROS();
				subscribeToIMU();

			}
			
		function connectToROS(){
			ros = new ROSLIB.Ros({
			    url : 'ws://192.168.0.15:9090'
			  });

			  ros.on('connection', function() { console.log('Connected to websocket server.');});

			  ros.on('error', function(error) { console.log('Error connecting to websocket server: ', error); window.alert('Error connecting to websocket server'); });

			  ros.on('close', function() { console.log('Connection to websocket server closed.');});

			  imuTopic = new ROSLIB.Topic({
			    ros : ros,
			    name : '/imu/data',
			    messageType : 'sensor_msgs/Imu',
	throttle_rate : 100
			  });
}

function subscribeToIMU(){
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
