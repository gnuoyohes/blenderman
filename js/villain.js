var NUMFRAMES = 60; // villain changes direction every NUMFRAMES frames
var INITALPHA = 0.7; // probability of villain moving towards player, rather than going in a random direction (should be > 0.5)
var INITSPEED = 0.2;

var villainName = "ghost";
var villainScale = 0.01;
var villainY = 0;

var alpha = INITALPHA;
var speed = INITSPEED;

var villain;

var frameCount = 0;

// motion of the antagonist
var vmotion = {
  direction: new THREE.Vector3(),
	distSq: 999999
};

var resetVillain = function () {
	if (villain.position.x > 220 || villain.position.x < -220 || villain.position.z > 220 || villain.position.z < -220 || villain.position.y < -100) {
		villain.position.set(Math.random()*MAPRADIUS*2-MAPRADIUS, villainY, Math.random()*MAPRADIUS*2-MAPRADIUS);
		vmotion.direction = new THREE.Vector3(Math.random()*2-1, 0, Math.random()*2-1).normalize();
	}
};

// Daniel Greenberg Stalker
var moveVillain = function () {
	if (frameCount == NUMFRAMES) { // change direction
		var dirToPlayer = new THREE.Vector3().subVectors(motion.position, villain.position).setY(0).normalize();
		var randDir = new THREE.Vector3(Math.random()*2-1, 0, Math.random()*2-1).normalize();
		if (Math.random() <= alpha)
			vmotion.direction.copy(dirToPlayer);
		else
			vmotion.direction.copy(randDir);
		frameCount = 0;
	}

	var newPos = villain.position.clone();
	newPos.addScaledVector(vmotion.direction, speed);
	villain.lookAt(newPos);
	villain.position.copy(newPos);
	vmotion.distSq = villain.position.distanceToSquared(motion.position);
	frameCount++;
}

// ghost model by Diego Yamaguchi: https://sketchfab.com/3d-models/ghost-a0f01623a7c1418caaee24fa1c685c5e
function addVillain(scene) {
  var loader = new THREE.GLTFLoader();

  loader.load( 'models/'+villainName+'/scene.gltf', function ( gltf ) {
    gltf.scene.scale.set(villainScale, villainScale, villainScale);
    gltf.scene.name = "villain";
  	scene.add( gltf.scene );
		villain = gltf.scene;
		villain.position.y = -150;
  }, undefined, function ( error ) {
  	console.error( error );
  } );
}
