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
controls.autoRotate = true;
controls.autoRotateSpeed = 0.07;
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

var geometry = new THREE.BufferGeometry();
var vertices = new Float32Array( edges.length*(3+3) );
var colors = new Uint8Array(vertices.length/3.0*3.0 );

for(var e=0; e<edges.length; e++){
	var edge = edges[e];
	var s = nodes[edge.source];
	var t = nodes[edge.target];

	vertices[e*6+0] = s.pos[0];
	vertices[e*6+1] = s.pos[1];
	vertices[e*6+2] = s.pos[2];

	vertices[e*6+3+0] = t.pos[0];
	vertices[e*6+3+1] = t.pos[1];
	vertices[e*6+3+2] = t.pos[2];

	var sc = s.type == "Artist" ? [1,2,0] : [1,1,1];
	colors[e*6+0] = sc[0];
	colors[e*6+1] = sc[1];
	colors[e*6+2] = sc[2];

	var tc = t.type == "Artist" ? [1,2,0] : [1,1,1];
	colors[e*6+3+0] = t.pos[0];
	colors[e*6+3+1] = t.pos[1];
	colors[e*6+3+2] = t.pos[2];
}

 for(var c=0; c<colors.length; c++){
 	var scale = 255;
 	colors[c] = Math.random()*scale;
 }
geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true ) );

// links
var web_material = new THREE.LineBasicMaterial( {
    color: "white",
    vertexColors: THREE.VertexColors,
    //blending: THREE.AdditiveBlending
} );
var web = new THREE.LineSegments( geometry, web_material );
scene.add( web );

/*
* DOTS
*/

var dots_material = new THREE.PointsMaterial( { 
	color: 0x888888,
    vertexColors: THREE.VertexColors,
    sizeAttenuation: true,
    size: 0.001,
} );
var dots = new THREE.Points( geometry, dots_material );
scene.add(dots);

/*
* LABELS
*/
for(var n in nodes)
{
  // attributes
  var text = nodes[n].label;
  var textHeight = 0.0015;
  var fontFace = "Arial";
  var fontSize = 32;
  var font = "normal "+fontSize+"px"+" "+fontFace;

  //create canvas
	var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");
  ctx.font = font;
  var textWidth = ctx.measureText(text).width;
  canvas.width = textWidth;
  canvas.height = fontSize;

  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = 'bottom';
  if(canvas.width>0 && canvas.height>0){
    // ctx.fillStyle = "blue";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillText(text, 0, canvas.height);

    // create texture
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
    var aspect = canvas.width/canvas.height;
    // sprite.position.set(, 0, 0);
    sprite.center = new THREE.Vector2(1,0);
    sprite.scale.set(textHeight * aspect, textHeight);
    // sprite.position.x-=sprite.scale.x/2;
    // sprite.position.y+=sprite.scale.y/2;
    // sprite.position.z+=sprite.scale.y/2;
    scene.add(sprite);
  }else{
    console.log(text, textWidth, fontSize);
  }

}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function lookAt(name){
	var res;
	for(var n in nodes){
		if(nodes[n].label == name){
			res = n; 
		}
	}
	pos = nodes[res].pos;
	controls.target.set(pos[0], pos[1], pos[2]);
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
