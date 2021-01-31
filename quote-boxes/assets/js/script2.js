let container, geometry;
let camera, scene, raycaster, renderer;

let INTERSECTED;
let moving = false;
var lookDirection = new THREE.Vector3();


var quotes;
const mouse = new THREE.Vector2();
const lower_opacity = 0.5;
const full_opacity = 1;

function init() {
    fetchQuotes();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1050);
    camera.position.set(40, 150, 200);

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    const light = new THREE.DirectionalLight( 0xffffff, 2 );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );

    geometry = new THREE.BoxGeometry( 10, 10, 10 );

    renderCubes(40);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    // orbit controls setup
    controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.mouseButtons = {
		LEFT: THREE.MOUSE.RIGHT, 
		MIDDLE: THREE.MOUSE.MIDDLE, 
		RIGHT: THREE.MOUSE.LEFT
	}
	controls.enableDamping = true;
	controls.dampingFactor = 0.14;
	controls.screenSpacePanning = false;
	controls.panSpeed = 10;
	controls.rotateSpeed = 5;
	controls.minPolarAngle = 30 / 180 * Math.PI;
	controls.maxPolarAngle = 88 / 180 * Math.PI;
    
    raycaster = new THREE.Raycaster();
    container.appendChild( renderer.domElement );
    document.addEventListener( 'mousemove', onmousemove );
    window.addEventListener( 'resize', onWindowResize );

    animate();
    console.log(quotes);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onmousemove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


function animate() {
    requestAnimationFrame( animate );
    render();
    TWEEN.update();
}

function render() {
    // find intersections
    raycaster.setFromCamera( mouse, camera );

    const intersects = raycaster.intersectObjects( scene.children, true );


    if( !moving ){
        if ( intersects.length > 0 ) {
    
            if ( INTERSECTED != intersects[ 0 ].object ) {
                INTERSECTED = intersects[ 0 ].object;
                moveToObject(INTERSECTED);
            }
            
        } else {
            INTERSECTED = null;
        }
    }

    renderer.render( scene, camera );

}

function renderCubes(count){
    for ( let i = 0; i < count; i ++ ) {

        let object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 300 - 100;
        object.position.y = 0;
        object.position.z = Math.random() * 300 - 100;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = 0;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() + 0.5;
        object.scale.y = Math.random() + 0.5;
        object.scale.z = Math.random() + 0.5;

        // enable transparency
        object.material.transparent = true;
        object.material.opacity = lower_opacity; 
        
        // populate userData with an object ID
        object.userData.id = i+1;

        scene.add( object );

    }
}

async function fetchQuotes(){
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://type.fit/api/quotes",
        "method": "GET"
      }
      
      $.ajax(settings).done(function (response) {
            quotes = JSON.parse(response);
      });
}

function getRandomQuote(){
    return quotes[Math.floor(Math.random() * quotes.length)]
}


function moveToObject(obj){
    // TODO: Fetch custom inspiration quote for box
    // TODO: Display Quote Message on tween complete
    // TODO: Mark object as already readed
    controls.enabled = false;
    moving = true;
    
    TWEEN.removeAll();
    
    var camNewPosition= { x : obj.position.x + 10, y : obj.position.y + 40, z : obj.position.z + 50};
    var targetNewPos = {x : obj.position.x, y : obj.position.y, z : 0};
    
    var camTween = new TWEEN.Tween(camera.position).to(camNewPosition, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
    var targetTween = new TWEEN.Tween(controls.target).to(targetNewPos, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
    
    camTween.onComplete(function() {
        onMoveFinish(obj, false);
    });
    targetTween.onComplete(function() {
        onMoveFinish(obj, true);
    });
    
}

async function onMoveFinish(obj, fetch){
    if( fetch ){
        if( !obj.userData.read ){
            obj.userData.read = true;
            const random_quote = getRandomQuote()
            const quote_block = document.querySelector('.quote'); 
            let html = "<h3>Quote Box: "+ obj.userData.id +"</h3>";
            html += "\"" +random_quote.text + "\" - " + random_quote.author+"";
            quote_block.innerHTML = html;
        }
    }

    controls.enabled = true;
    obj.material.opacity = full_opacity;
    camera.getWorldDirection( lookDirection );
    controls.target.copy( camera.position ).add( lookDirection.multiplyScalar( 10 ) );
    moving = false;
}