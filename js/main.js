/*
 * Setup threejs scene
 */
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2("black", 0.75)
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 1;
camera.near = 0.001;
var controls = new THREE.OrbitControls( camera );
controls.update();
var renderer = new THREE.WebGLRenderer({antialias: false});
renderer.setSize( window.innerWidth, window.innerHeight );

element = document.body
element = document.getElementById("graph")
element.appendChild( renderer.domElement );


/*
 * Load data
 */

//from exported data
var nodes = data.nodes
var edges = data.edges

/*
 * Create WEB Geometry
 */

// Geometry
var geometry = new THREE.BufferGeometry();
var vertices = new Float32Array( edges.length*(3+3) );

for(var i=0; i<edges.length;i++){
	var edge = edges[i];


	var source = nodes[edge.source]
	var target = nodes[edge.target]

	for(var j=0; j<3; j++){
		var idx = i*6+j;
		vertices[idx]=source.pos[j];
	}
	for(var j=0; j<3; j++){
		var idx = i*6+3+j;
		vertices[idx]=target.pos[j];
	}
}
var colors = new Uint8Array(vertices.length/3.0*3.0 );
for(var c=0; c<colors.length; c++){
	var scale = 255;
	colors[c] = Math.random()*scale;
}
geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true ) );

// links
var web_material = new THREE.LineBasicMaterial( {
    color: "white",
    vertexColors: THREE.VertexColors
} );
var web = new THREE.LineSegments( geometry, web_material );
scene.add( web );

// dots
var dots_material = new THREE.PointsMaterial( { 
	color: 0x888888,
    vertexColors: THREE.VertexColors,
    sizeAttenuation: false,
    size: 5,
} );
var dots = new THREE.Points( geometry, dots_material );
// scene.add(dots);

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

/* ======
 * RENDER
   ======*/
function animate() {
	requestAnimationFrame( animate );

	// web.rotation.x-=0.001;
	// web.rotation.y+=0.001;

	controls.update();
	renderer.render( scene, camera );
}
animate();
