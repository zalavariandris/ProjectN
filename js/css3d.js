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
element = document.getElementById("three")
element.appendChild( renderer.domElement );

// GEOMETRY
// Geometry
var N = 100;
var geometry = new THREE.BufferGeometry();
var vertices = new Float32Array( N*3 );
for(var i=0; i<N; i++){
  vertices[i*3+0] = Math.random();
  vertices[i*3+1] = Math.random();
  vertices[i*3+2] = Math.random();
}

var material = new THREE.PointsMaterial( { 
  color: 0x888888,
  sizeAttenuation: false,
  size: 5,
} );
var dots = new THREE.Points( geometry, material );
scene.add(dots);
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
  controls.update();
  renderer.render( scene, camera );
}
animate();

