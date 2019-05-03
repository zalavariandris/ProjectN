var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.dom.style.left = '';
stats.dom.style.right = '0px';
stats.dom.style.top = '0px';
document.body.appendChild( stats.dom );

/*
 * Setup threejs scene
 */
var renderer = new THREE.WebGLRenderer({antialias: false, depth: true});
renderer.setClearColor("black", 1.0)
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.BasicShadowMap;
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(renderer.getClearColor(), 0.75)

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.0001, 10 );
camera.position.z = 1;
var controls = new THREE.OrbitControls( camera );
controls.update();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.07;

var sun = new THREE.DirectionalLight();
sun.position.set(1,1,0);
sun.castShadow = true;
scene.add(sun);

element = document.body
element = document.getElementById("graph")
element.appendChild( renderer.domElement );


/* ==================
   Read DATA to MODEL
   ==================*/
/*
{
    'nodes': {
        'key': {
            'idx': 0
            'position': [],
            'color': [],
            'label': [],
            'size': 1
        }
    }, 
    'links': [
        {
            'source': src,
            'target': dst,
            'color': []
        }
    ]
}
*/

var model;
{
    model = {'nodes': {}, 'edges': []};

    // nodes
    Object.keys(data.nodes).forEach(function(n, i){
        let color = [100, 100, 100];
        if(data.nodes[n]['type']=="Artist"){
            color = "grey";
        }else if(data.nodes[n]['type']=="Exhibition"){
            color = "grey";
        }else {
            color = "red";
        }

        model['nodes'][n] = {
            'idx': i,
            'position': data.nodes[n].pos,
            'color': color,
            'label': data.nodes[n]['label'],
            'size': 1
        }
    });

    //edges
    for(let e=0; e<data['edges'].length; e++){
            model['edges'].push({
            'source': data['edges'][e]['source'],
            'target': data['edges'][e]['target'],
            'color': undefined
        });
    }
}




/* ===================
   CREATE GRAPH OBJeCT
   ===================*/

var graph_obj;

/*
 * dots
 */
{
    graph_obj = new THREE.Object3D();
    let nodes = model['nodes'];
    let geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(Object.keys(nodes).length*3);
    let colors = new Uint8Array(Object.keys(nodes).length*3);

    for(let n in nodes){
        let i = nodes[n]['idx'];
        let pos = nodes[n]['position'];
        vertices[i*3+0] = pos[0];
        vertices[i*3+1] = pos[1];
        vertices[i*3+2] = pos[2];

        let color = new THREE.Color(nodes[n]['color']);
        colors[i*3+0] = color.r*255;
        colors[i*3+1] = color.g*255;
        colors[i*3+2] = color.b*255;
    }
    //geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    //geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true ) );


    let dots_material = new THREE.PointsMaterial( { 
      color: 0x888888,
        sizeAttenuation: true,
        size: 0.001,
        color: "white",
        vertexColors: THREE.VertexColors
    } );
    let dots = new THREE.Points( geometry, dots_material );
    // graph_obj.add(dots);
}


/*
 * links
 */
{
    let nodes = model['nodes'];
    let edges = model['edges'];

    let geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array( edges.length*(3+3) );
    let colors = new Uint8Array(vertices.length/3.0*3.0 );

    for(let e=0; e<edges.length; e++){
        let edge = edges[e];
        let s = nodes[edge['source']];
        let t = nodes[edge['target']];

        vertices[e*6+0] = s['position'][0];
        vertices[e*6+1] = s['position'][1];
        vertices[e*6+2] = s['position'][2];

        vertices[e*6+3+0] = t['position'][0];
        vertices[e*6+3+1] = t['position'][1];
        vertices[e*6+3+2] = t['position'][2];

        // Color edges by direction
        let r = Math.abs(s['position'][0] - t['position'][0]);
        let g = Math.abs(s['position'][1] - t['position'][1]);
        let b = Math.abs(s['position'][2] - t['position'][2]);
        let length = Math.sqrt(r*r+g*g+b*b);
        r/=length;
        g/=length;
        b/=length;
        colors[e*6+0] = colors[e*6+3+0] = r*255;
        colors[e*6+1] = colors[e*6+3+1] = b*255;
        colors[e*6+2] = colors[e*6+3+2] = g*255;

        //// Color edges by Node
        // let source_color = new THREE.Color(s['color']);
        // colors[e*6+0] = source_color.r*255;
        // colors[e*6+1] = source_color.g*255;
        // colors[e*6+2] = source_color.b*255;

        // let target_color = new THREE.Color(t['color']);
        // colors[e*6+3+0] = target_color.r*255;
        // colors[e*6+3+1] = target_color.g*255;
        // colors[e*6+3+2] = target_color.b*255;

        // // Color edges random
        // for(let j=0; j<6; j++)
        //     colors[e*6+j] = Math.random()*255;

        // colors[e*6+0] = source_color.r*255;
        // colors[e*6+1] = source_color.g*255;
        // colors[e*6+2] = source_color.b*255;
    }
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    // for(var c=0; c<colors.length; c++){
    //     var scale = 255;
    //     colors[c] = Math.random()*scale;
    // }
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true ) );

    // links
    let web_material = new THREE.LineBasicMaterial( {
        transparent: true,
        opacity: 0.5,
        color: "white",
        vertexColors: THREE.VertexColors,
        //blending: THREE.AdditiveBlending
    } );
    let web = new THREE.LineSegments( geometry, web_material );
    web.renderOrder = -1;
    graph_obj.add( web );
}

/*
 * tubes
 */
{
    let nodes = model['nodes'];
    let edges = model['edges'];
    let geometry = new THREE.CylinderBufferGeometry(0.00005, 0.00005, 1, 3, 1);
    geometry.translate(0,0.5,0);
    geometry.rotateX(Math.PI/2);

    let tubes = new THREE.Group();
    for(let e=0; e<edges.length; e++){
        let edge = edges[e];
        let s = nodes[edge['source']];
        let t = nodes[edge['target']];


        let s_vec = new THREE.Vector3(s.position[0], s.position[2], s.position[2]);
        let t_vec = new THREE.Vector3(t.position[0], t.position[2], t.position[2]);

        let distance = s_vec.distanceTo(t_vec);
        let material = new THREE.MeshToonMaterial({
            color: "white"
        });
        let tube = new THREE.Mesh(geometry, material);
        tube.scale.set(1, 1, distance);

        tube.position.set(s.position[0], s.position[1], s.position[2]);
        tube.lookAt(t.position[0], t.position[1], t.position[2] );
        tube.receiveShadow = true;
        tube.castShadow = true;
        tubes.add(tube);
    }

    // graph_obj.add(tubes);
}

/*
* labels
*/
{
    let nodes = model.nodes;
    let labels = new THREE.Group()
    for(var n in nodes)
    {
        // attributes
        var text = nodes[n].label;
        var textHeight = 0.0015;
        var fontFace = "Futura";
        var fontSize = 32;
        var font = "normal "+fontSize+"px"+" "+fontFace;

        // create canvas
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
                sizeAttenuation: true,
                premultipliedAlpha: false
            });
            var sprite = new THREE.Sprite(spriteMat);
            var o = new THREE.Object3D()
            o.add(sprite);

            sprite.position.set(nodes[n]['position'][0], nodes[n]['position'][1], nodes[n]['position'][2]);
            var aspect = canvas.width/canvas.height;
            sprite.center = new THREE.Vector2(1,0);
            sprite.scale.set(textHeight * aspect, textHeight);
            labels.add(sprite);
        }else{
            console.log(text, textWidth, fontSize);
        }
        graph_obj.add(labels);
    }
}

/*
 * spheres
 */
{
    var spheres_obj = new THREE.Group();
    let nodes = model['nodes'];

    let geomety = new THREE.IcosahedronBufferGeometry(0.0003, 0);


    for(let n in nodes){
        let material = new THREE.MeshToonMaterial({
            color: nodes[n]['color'],
            wireframe: false
        });

        let mesh = new THREE.Mesh(geomety, material);        
        mesh.position.set(nodes[n]['position'][0], nodes[n]['position'][1], nodes[n]['position'][2])
        mesh.scale.set(nodes[n]['size'], nodes[n]['size'], nodes[n]['size'])
        spheres_obj.add(mesh);
    }

    // graph_obj.add(spheres_obj);
}
scene.add(graph_obj);

/* =======
   HELPERS
   =======*/
function goto(name){
    //search
    var node;
    for(var n in nodes){
        if(nodes[n].label == name){
            node = n; 
        }
    }
    if(node==undefined){
        return false;
    }

    pos = nodes[node].pos;
    camera.position.set(pos[0], pos[1], pos[2]-0.015);
    controls.update();
    controls.target.set(pos[0], pos[1], pos[2]);
    controls.update();
    return true;
}

/* ======
 * RENDER
   ======*/
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
    requestAnimationFrame( animate );

    stats.begin();
    controls.update();
    scene.updateMatrixWorld();
    scene.traverse( function ( object ) {
        if ( object instanceof THREE.LOD ) {
            object.update( camera );
        }
    } );
    renderer.render( scene, camera );
    stats.end();
}
animate();
