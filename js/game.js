// inspired by https://threejs.org/examples/?q=misc#misc_fps

if (!Detector.webgl) Detector.addGetWebGLMessage();

let deleteTitle = true;
let deleteTitleCount = 0;
let runSound;
let walkSound;

var motion = {
	sprinting: false,
	airborne: false,
	position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
	rotation: new THREE.Vector2(),
    spinning: new THREE.Vector2()
};
motion.position.y = - 150;

// game systems code
var resetPlayer = function () {
	if ( motion.position.y < 0 ) {
		motion.position.set( motion.position.x, 0, motion.position.z );
		motion.velocity.multiplyScalar( 0 );
	}
	if (motion.position.x > 200 || motion.position.x < -200 ||
		motion.position.z > 200 || motion.position.z < -200) {
		motion.position.set(Math.random()*200-100, 0, Math.random()*200-100);
	}
};

var keyboardControls = ( function () {
	var keys = { SP: 32, W: 87, A: 65, S: 83, D: 68, UP: 38, LT: 37, DN: 40, RT: 39 };
	var keysPressed = {};
	( function ( watchedKeyCodes ) {
		var handler = function ( down ) {
			return function ( e ) {
				var index = watchedKeyCodes.indexOf( e.keyCode );
				if ( e.shiftKey )
					motion.sprinting = true;
				else {
					motion.sprinting = false;
				}
				if ( index >= 0 ) {
					keysPressed[ watchedKeyCodes[ index ] ] = down;
					e.preventDefault();
				}
			};
		};
		window.addEventListener( "keydown", handler( true ), false );
		window.addEventListener( "keyup", handler( false ), false );
	} )( [
		keys.SP, keys.W, keys.A, keys.S, keys.D, keys.UP, keys.LT, keys.DN, keys.RT
	] );
	var forward = new THREE.Vector3();
	var sideways = new THREE.Vector3();
	return function (event) {
		if ( ! motion.airborne ) {
			// look around
			var sx = keysPressed[ keys.UP ] ? 0.03 : ( keysPressed[ keys.DN ] ? - 0.03 : 0 );
			var sy = keysPressed[ keys.LT ] ? 0.03 : ( keysPressed[ keys.RT ] ? - 0.03 : 0 );
			if ( Math.abs( sx ) >= Math.abs( motion.spinning.x ) ) motion.spinning.x = sx;
			if ( Math.abs( sy ) >= Math.abs( motion.spinning.y ) ) motion.spinning.y = sy;
			// move around
			forward.set( Math.sin( motion.rotation.y ), 0, Math.cos( motion.rotation.y ) );
			sideways.set( forward.z, 0, - forward.x );
			if (motion.sprinting) {
				forward.multiplyScalar( keysPressed[ keys.W ] ? - 0.5 : ( keysPressed[ keys.S ] ? 0.5 : 0 ) );
				sideways.multiplyScalar( keysPressed[ keys.A ] ? - 0.5 : ( keysPressed[ keys.D ] ? 0.5 : 0 ) );
				if (keysPressed[ keys.W ] || keysPressed[ keys.A ] || keysPressed[ keys.S ] || keysPressed[ keys.D ]) {
					runSound.play();
					walkSound.pause();
				}
				else {
					runSound.pause();
					walkSound.pause();
				}
			}
			else {
				forward.multiplyScalar( keysPressed[ keys.W ] ? - 0.2 : ( keysPressed[ keys.S ] ? 0.2 : 0 ) );
				sideways.multiplyScalar( keysPressed[ keys.A ] ? - 0.2 : ( keysPressed[ keys.D ] ? 0.2 : 0 ) );
				if (keysPressed[ keys.W ] || keysPressed[ keys.A ] || keysPressed[ keys.S ] || keysPressed[ keys.D ]) {
					walkSound.play();
					runSound.pause();
				}
				else {
					runSound.pause();
					walkSound.pause();
				}
			}
			var combined = forward.add( sideways );
			if ( Math.abs( combined.x ) >= Math.abs( motion.velocity.x ) ) motion.velocity.x = combined.x;
			if ( Math.abs( combined.y ) >= Math.abs( motion.velocity.y ) ) motion.velocity.y = combined.y;
			if ( Math.abs( combined.z ) >= Math.abs( motion.velocity.z ) ) motion.velocity.z = combined.z;
			//jump
				var vy = keysPressed[ keys.SP ] ? 0.7 : 0;
				motion.velocity.y += vy;
		}
	};
} )();

var applyPhysics = ( function () {
	var timeStep = 5;
	var timeLeft = timeStep + 1;
	var birdsEye = 100;
	var kneeDeep = 0.4;
	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set( 0, - 1, 0 );
	var angles = new THREE.Vector2();
	var displacement = new THREE.Vector3();
	return function ( dt ) {
		var platform = scene.getObjectByName("ground");
		if ( platform ) {
			timeLeft += dt;
			// run several fixed-step iterations to approximate varying-step
			dt = 5;
			while ( timeLeft >= dt ) {
				var time = 0.3, damping = 0.93, gravity = 0.01, tau = 2 * Math.PI;
				raycaster.ray.origin.copy( motion.position );
				raycaster.ray.origin.y += birdsEye;
				var hits = raycaster.intersectObject( platform );
				motion.airborne = true;
				// are we above, or at most knee deep in, the platform?
				if ( ( hits.length > 0 ) ) {
					var actualHeight = hits[ 0 ].distance - birdsEye;
					// collision: stick to the surface if landing on it
					if ( ( motion.velocity.y <= 0 ) && ( Math.abs( actualHeight ) < kneeDeep ) ) {
						motion.position.y -= actualHeight;
						motion.velocity.y = 0;
						motion.airborne = false;
					}
				}
				if ( motion.airborne ) motion.velocity.y -= gravity;
				angles.copy( motion.spinning ).multiplyScalar( time );
				if ( ! motion.airborne ) motion.spinning.multiplyScalar( damping );
				displacement.copy( motion.velocity ).multiplyScalar( time );
				if ( ! motion.airborne ) motion.velocity.multiplyScalar( damping );
				motion.rotation.add( angles );
				motion.position.add( displacement );
				// limit the tilt at ±0.4 radians
				motion.rotation.x = Math.max( - 0.6, Math.min( + 0.6, motion.rotation.x ) );
				// wrap horizontal rotation to 0...2π
				motion.rotation.y += tau;
				motion.rotation.y %= tau;
				timeLeft -= dt;
			}
		}
	};
} )();

var updateCamera = ( function () {
	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
	return function ( dt ) {
		euler.x = motion.rotation.x;
		euler.y = motion.rotation.y;
		camera.quaternion.setFromEuler( euler );
		camera.position.copy( motion.position );
		camera.position.y += 3;
		let direction = new THREE.Vector3();
		camera.getWorldDirection(direction);
		flashlight.position.copy(camera.position);
		flashlight.target.position.addVectors(flashlight.position, direction);
	};
} )();

// init 3D stuff
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );
var camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 9000 );
var flashlight = new THREE.SpotLight(0xffffff);
flashlight.angle = Math.PI/6;
flashlight.penumbra = 0.2
flashlight.distance = 100;
flashlight.castShadow = true;
flashlight.decay = 3;
var scene = getScene();
scene.add(flashlight);
scene.add(flashlight.target);

// start the game
var start = function ( gameLoop, gameViewportSize ) {
	runSound = new Audio("sounds/run.wav");
	walkSound = new Audio("sounds/walk.wav");
	var resize = function () {
		var viewport = gameViewportSize();
		renderer.setSize( viewport.width, viewport.height );
		camera.aspect = viewport.width / viewport.height;
		camera.updateProjectionMatrix();
	};
	window.addEventListener( 'resize', resize, false );
	resize();
	var lastTimeStamp;
	var render = function ( timeStamp ) {
		var timeElapsed = lastTimeStamp ? timeStamp - lastTimeStamp : 0;
		lastTimeStamp = timeStamp;
		// call our game loop with the time elapsed since last rendering, in ms
		gameLoop( timeElapsed );
		renderer.render( scene, camera );
		requestAnimationFrame( render );

		if (deleteTitleCount < 400)
			deleteTitleCount++;
		if (deleteTitleCount == 400) {
			scene.remove(scene.getObjectByName("title"));
			// scene.remove(scene.getObjectByName("subtitle"));
			deleteTitleCount++;
		}
	};
	requestAnimationFrame( render )
};
var gameLoop = function ( dt ) {
	resetPlayer();
	keyboardControls();
	applyPhysics( dt );
	updateCamera();
};
var gameViewportSize = function () {
	return {
		width: window.innerWidth, height: window.innerHeight
	};
};

start( gameLoop, gameViewportSize );
