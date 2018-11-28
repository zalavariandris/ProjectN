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

// labels
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

for(var n in nodes)
{
	var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext("2d");
    ctx.font = "11pt Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(nodes[n].label, 64, 64);

    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    var spriteMat = new THREE.SpriteMaterial({
      map: tex,
      sizeAttenuation: true
    });
    var sprite = new THREE.Sprite(spriteMat);
    var o = new THREE.Object3D()
    o.add(sprite);


    sprite.position.set(nodes[n].pos[0], nodes[n].pos[1], nodes[n].pos[2]);
    sprite.scale.set(0.03, 0.03, 0.03);
    scene.add(sprite);

}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



/* ======
 * Labels
   ======*/
/************************************************************************/
/* Fixes the difference between WebGL coordinates to CSS coordinates    */
/************************************************************************/
 /************************************************************************/
/* Initialized some variables for CSS, and also it computes the initial

position for the CSS cube based on the Three Cube */
/************************************************************************/
var screenWhalf = screen.width / 2;
var screenHhalf = screen.height / 2;
function initCSS3D() {


    divCSSWorld = document.getElementById('css-world');
    divCSSCamera = document.getElementById('css-camera');
    divCube = document.getElementById('shape');

    fovValue = 0.5 / Math.tan(camera.fov * Math.PI / 360) * screen.height;
}

/************************************************************************/
/* Applies CSS3 styles to the css-world div                             */
/************************************************************************/
function setCSSWorld() {
    world_div.style.perspective = fovValue + "px";
    world_div.style.perspectiveOrigin = "50% 50%";
}

/************************************************************************/
/*  Applies CSS3 styles to css-camera div                               */
/************************************************************************/
function setCSSCamera(camera, fovValue) {
    var cameraStyle = getCSS3D_cameraStyle(camera, fovValue);
    camera_div.style.transform = cameraStyle;
}

/************************************************************************/
/* Return the CSS3D transformations from the Three camera               */
/************************************************************************/
function getCSS3D_cameraStyle(camera, fov) {
    var cssStyle = "";
    cssStyle += "translate3d(0,0," + epsilon(fov) + "px) ";
    cssStyle += toCSSMatrix(camera.matrixWorldInverse, true);
    cssStyle += " translate3d(" + screenWhalf + "px," + screenHhalf + "px, 0)";
    return cssStyle;
}

/************************************************************************/
/* Fixes the difference between WebGL coordinates to CSS coordinates    */
/************************************************************************/
function toCSSMatrix(m, b) {
    return "matrix3d(" + m.elements.join(",") + ")"
}

/************************************************************************/
/* Computes CSS3D transformations based on a Three Object                */
/************************************************************************/
function setDivPosition(cssObject, tr) {
    var offset = 400; //value to offset the cube
    cssObject.style.position = "absolute";
    cssObject.style.transformOrigin = "50% 50%";
    cssObject.style.transform = CSStransform(200 + offset, 200, tr);
}
/************************************************************************/
/* Helper function to convert to CSS3D transformations                  */
/************************************************************************/
function CSStransform(width, height, matrix) {
    var scale = 1.0;
    return [toCSSMatrix(matrix, false),
    "scale3d(" + scale + ", -" + scale + ", " + scale + ")",
    "translate3d(" + epsilon(-0.5 * width) + "px," + epsilon(-0.5 * height) + "px,0)"].join(" ");
}
/************************************************************************/
/* Rounding error                                                       */
/************************************************************************/
function epsilon(a) {
    if (Math.abs(a) < 0.000001) {
        return 0
    }
    return a;
}
function toCSSMatrix(threeMat4, b) {
  var a = threeMat4, f;
  if (b) {
    f = [
      a.elements[0], -a.elements[1], a.elements[2], a.elements[3],
      a.elements[4], -a.elements[5], a.elements[6], a.elements[7],
      a.elements[8], -a.elements[9], a.elements[10], a.elements[11],
      a.elements[12], -a.elements[13], a.elements[14], a.elements[15]
    ];
  } else {
    f = [
      a.elements[0], a.elements[1], a.elements[2], a.elements[3],
      a.elements[4], a.elements[5], a.elements[6], a.elements[7],
      a.elements[8], a.elements[9], a.elements[10], a.elements[11],
      a.elements[12], a.elements[13], a.elements[14], a.elements[15]
    ];
  }
  for (var e in f) {
    f[e] = epsilon(f[e]);
  }
  return "matrix3d(" + f.join(",") + ")";
}

function CSStransform(width, height, matrix) {
    var scale = 1;
    return [toCSSMatrix(matrix, false),
    "scale3d(" + scale + ", -" + scale + ", " + scale + ")",
    "translate3d(" + epsilon(-0.5 * width) + "px," + epsilon(-0.5 * height) + "px,0)"].join(" ");
}
function epsilon(a) {
    if (Math.abs(a) < 0.000001) {
        return 0
    }
    return a;
}

var world_div = document.getElementById("world");
var camera_div = document.getElementById("camera");

initCSS3D();

for(var i=0; i<3; i++){
	var label = document.createElement("div");
	label.className = "label";
	label.style.position = "absolute"
	label.style.transformOrigin = "50% 50%";
	var m = new THREE.Matrix4();
	m.setPosition(new THREE.Vector3(Math.random(), Math.random(), Math.random()))

	label.innerText = "label";
	camera_div.appendChild(label);
	var tr = new THREE.Matrix4();
	tr.setPosition(new THREE.Vector3(Math.random(),Math.random(),Math.random()));
	tr.setRotationFromQuaternion(new THREE.Quaternion(1,0,0,1))
	setDivPosition(label, tr);

}

/* ======
 * RENDER
   ======*/
function animate() {
	requestAnimationFrame( animate );

	

	controls.update();
	setCSSWorld();
    setCSSCamera(camera, fovValue);
	renderer.render( scene, camera );
}
animate();
