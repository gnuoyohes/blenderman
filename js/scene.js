var scene, terrainScene, decoScene, skyDome, skyLight, sand, ground;

// Helpers

function makePlatform( url ) {
	var placeholder = new THREE.Object3D();
	var loader = new THREE.ObjectLoader();
	loader.load( url, function ( platform ) {
		placeholder.add( platform );
	} );
	return placeholder;
}

function applySmoothing(smoothing, o) {
  var m = terrainScene.children[0];
  var g = m.geometry.vertices;
  if (smoothing === 'Conservative (0.5)') THREE.Terrain.SmoothConservative(g, o, 0.5);
  if (smoothing === 'Conservative (1)') THREE.Terrain.SmoothConservative(g, o, 1);
  if (smoothing === 'Conservative (10)') THREE.Terrain.SmoothConservative(g, o, 10);
  else if (smoothing === 'Gaussian (0.5, 7)') THREE.Terrain.Gaussian(g, o, 0.5, 7);
  else if (smoothing === 'Gaussian (1.0, 7)') THREE.Terrain.Gaussian(g, o, 1, 7);
  else if (smoothing === 'Gaussian (1.5, 7)') THREE.Terrain.Gaussian(g, o, 1.5, 7);
  else if (smoothing === 'Gaussian (1.0, 5)') THREE.Terrain.Gaussian(g, o, 1, 5);
  else if (smoothing === 'Gaussian (1.0, 11)') THREE.Terrain.Gaussian(g, o, 1, 11);
  else if (smoothing === 'GaussianBox') THREE.Terrain.GaussianBoxBlur(g, o, 1, 3);
  else if (smoothing === 'Mean (0)') THREE.Terrain.Smooth(g, o, 0);
  else if (smoothing === 'Mean (1)') THREE.Terrain.Smooth(g, o, 1);
  else if (smoothing === 'Mean (8)') THREE.Terrain.Smooth(g, o, 8);
  else if (smoothing === 'Median') THREE.Terrain.SmoothMedian(g, o);
  THREE.Terrain.Normalize(m, o);
}

function buildTree() {
  var material = [
    new THREE.MeshLambertMaterial({ color: 0x3d2817 }), // brown
    new THREE.MeshLambertMaterial({ color: 0x2d4c1e }), // green
  ];

  var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
  c0.position.y = 6;
  var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
  c1.position.y = 18;
  var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
  c2.position.y = 25;
  var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
  c3.position.y = 32;

  var g = new THREE.Geometry();
  c0.updateMatrix();
  c1.updateMatrix();
  c2.updateMatrix();
  c3.updateMatrix();
  g.merge(c0.geometry, c0.matrix);
  g.merge(c1.geometry, c1.matrix);
  g.merge(c2.geometry, c2.matrix);
  g.merge(c3.geometry, c3.matrix);

  var b = c0.geometry.faces.length;
  for (var i = 0, l = g.faces.length; i < l; i++) {
    g.faces[i].materialIndex = i < b ? 0 : 1;
  }

  var m = new THREE.Mesh(g, material);

  m.scale.x = m.scale.z = 5;
  m.scale.y = 1.25;
  return m;
}

// Scene
function getScene() {
  scene = new THREE.Scene();

  var groundTexture = new THREE.TextureLoader().load("textures/terrain/grasslight-big.jpg");
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(1000, 1000);
  ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10000, 10000),
    new THREE.MeshBasicMaterial({map: groundTexture})
  );
  ground.position.y = 0;
  ground.rotation.x = -0.5 * Math.PI;
  ground.name = "ground";
  scene.add(ground);

  // skyLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
  // skyLight.position.set(2950, 2625, -160); // Sun on the sky texture
  // scene.add(skyLight);
  // var light = new THREE.DirectionalLight(0xc3eaff, 0.75);
  // light.position.set(-1, -0.5, -1);
  // scene.add(light);

  // scene.fog = new THREE.FogExp2( 0xefd1b5, 0.05 );
  scene.fog = new THREE.FogExp2( 0x000000, 0.05 );

  return scene;
}
