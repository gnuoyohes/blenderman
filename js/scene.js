function buildGround() {
  var groundTexture = new THREE.TextureLoader().load("textures/terrain/grasslight-big.jpg");
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(100, 100);
  var ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    new THREE.MeshPhongMaterial({map: groundTexture})
  );
  ground.position.y = 0;
  ground.rotation.x = -0.5 * Math.PI;
  ground.name = "ground";
  ground.receiveShadow = true;
  return ground;
}

// borrowed from https://github.com/IceCreamYou/THREE.Terrain
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
  m.castShadow = true;
  return m;
}

// borrowed from https://github.com/CoryG89/MoonDemo
function buildMoon() {
  var radius = 80;
  var xSegments = 50;
  var ySegments = 50;
  var geo = new THREE.SphereGeometry(radius, xSegments, ySegments);
  var moonTexture = new THREE.TextureLoader().load("textures/moon/moon.jpg");
  var mat = new THREE.MeshBasicMaterial({map: moonTexture})
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(-1000, 500, -1000);
  mesh.rotation.set(0, 180, 0);
  return mesh;
}

// borrowed from https://github.com/CoryG89/MoonDemo
function buildSky() {
  var envMap = new THREE.CubeTextureLoader().load( [
			'textures/starfield/right.png', // right
			'textures/starfield/left.png', // left
			'textures/starfield/top.png', // top
			'textures/starfield/bottom.png', // bottom
			'textures/starfield/back.png', // back
			'textures/starfield/front.png' // front
		] );
	return envMap;
}

function addTitleText(scene) {
  var fontLoader = new THREE.FontLoader();
  var titleGeo, titleMat, title;

  fontLoader.load( 'fonts/filth_of_icarus.json', function ( font ) {
  	titleGeo = new THREE.TextGeometry( 'Blenderman', {
  		font: font,
  		size: 0.3,
  		height: 0.2,
  		curveSegments: 12,
  		bevelEnabled: false
  	});
    titleMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    title = new THREE.Mesh(titleGeo, titleMat);
    title.position.set(-1.2, 3, -4);
    title.name = "title";
    scene.add(title);
  });
  return title;
}

function getScene() {
  var scene = new THREE.Scene();
  scene.background = buildSky();
  scene.add(buildMoon());
  scene.add(buildGround());

  // randomly generate trees
  for (i=0; i<500; i++) {
    var tree = buildTree();
    tree.position.set(Math.random()*400-200, 0, Math.random()*400-200);
    tree.scale.set(Math.random()*.5+.25, Math.random()*.5+.25, Math.random()*.5+.25);
    scene.add(tree);
  }

  moonlight = new THREE.DirectionalLight(0xe0d2c5, 0.07);
  moonlight.position.set(-1000, 500, -1000); // Sun on the sky texture
  scene.add(moonlight);

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
  scene.add( ambientLight );

  // scene.fog = new THREE.FogExp2( 0xefd1b5, 0.05 );
  // scene.fog = new THREE.FogExp2( 0x000000, 0.3);

  return scene;
}
