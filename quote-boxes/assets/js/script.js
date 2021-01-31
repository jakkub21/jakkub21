var scene, renderer, camera, controls, raycaster, mouse, INTERSECTED;
var target = new THREE.Vector3();
// Map of all boxes
// id -> box mesh reference
var pallets = new Map();
var interactiveObject = [];

function onObjectSelect( event ) {
    event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function init() {
    // three JS init setup
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    window.addEventListener( 'click', onObjectSelect, false );
    
    // camera setup
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1050);
    camera.position.set(10, 10, 40);

    // orbit controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 300;
    controls.maxPolarAngle = Math.PI / 2 - 0.2;
    controls.keyPanSpeed = 20.0;
    controls.update();

    // create area
    var planeGeometry = new THREE.PlaneBufferGeometry(1050, 1050, 8, 8);
    var planeMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color("#212121"), side: THREE.DoubleSide});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX( - Math.PI / 2);
    scene.add(plane);
    
    // helper grid
    var grid = new THREE.GridHelper(200, 200);
    scene.add(grid);

    // Draw 10 random boxes
    
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );
    
    const intersects = raycaster.intersectObjects( interactiveObject, true );
    
    if ( intersects.length > 0 ) {
        // if intersected object at position 0 is not the same object as i have already
        // then perform state update:
        if( INTERSECTED === null && INTERSECTED != intersects[0].object ){
            if(INTERSECTED) INTERSECTED.material.opacity = 0.1;
            INTERSECTED = intersects[0].object;
            focus(INTERSECTED.userData.id);
        } else if( INTERSECTED != intersects[0].object ){
            if(INTERSECTED) INTERSECTED.material.opacity = 0.1;
            INTERSECTED = intersects[0].object;
            focus(INTERSECTED.userData.id);
        }
    } else {
        INTERSECTED === null;
    }
    
    renderer.render(scene, camera);
    TWEEN.update();
}

// Randomly generate boxes
function palletTest(n) {
    var colors = [
        "#bba215",
        "#a457b1",
        "#bf794d",
        "#3fb27f",
        "#77ecdf",
        "#dc0d01",
        "#37bc49",
        "#165265"
    ];

    var dimensions = [
        {width: 3, height: 1, depth: 1},
        {width: 3, height: 2, depth: 2},
        {width: 3, height: 2, depth: 1},
        {width: 3, height: 1, depth: 3},
        {width: 3, height: 3, depth: 3},
        {width: 3, height: 3, depth: 2},
        {width: 3, height: 3, depth: 3},
        {width: 3, height: 2, depth: 3}
    ];

    var offsetx = 0;
    var offsety = 0;
    var offsetz = 0;
    var coord = {x: 0, y: 0, z: 0};
    for (var i = 1; i <= n; i++) {
        var color = colors[Math.floor(Math.random() * (8))];
        var dim = dimensions[Math.floor(Math.random() * (8))];

        drawPallet(color, coord, dim, i - 1);

        offsetx -= 3.1;
        offsety += 0;
        offsetz -= 3.1;

        coord.x = offsetx;
        coord.y = offsety;
        coord.z = offsetz;
    }
}

function drawPallet(hex, coordinates, dimensions, id) {
    var colorePallet = new THREE.Color(hex);

    var width = dimensions.width;
    var height = dimensions.height;
    var depth = dimensions.depth;

    var x = coordinates.x - (width / 2);
    var y = coordinates.y + (height / 2);
    var z = coordinates.z - (depth / 2);

    // Box
    var palletGeometry = new THREE.BoxBufferGeometry(width, height, depth);
    var palletMaterial = new THREE.MeshBasicMaterial({color: colorePallet});
    var pallet = new THREE.Mesh(palletGeometry, palletMaterial);
    // enable transparency
    pallet.material.transparent = true;
    // set opacity to 50%
    pallet.material.opacity = 0.1; 
    
    pallet.position.set(x, y, z);
    pallet.userData.setSelected = setSelected.bind(pallet);
    pallet.userData.id = id;
    
    pallets.set(id, pallet);
    interactiveObject.push(pallet);
       
    
    // Edges
    var edgesGeometry = new THREE.EdgesGeometry(palletGeometry);
    var edgesMaterial = new THREE.LineBasicMaterial({color: "#000000"});
    var edge = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edge.position.set(x, y, z);
    
    scene.add(pallet);
    scene.add(edge);
}

// Change the color of the selected box
function setSelected() {
    // this.material.color.set(new THREE.Color("rgb(0, 255, 0)"));
    this.userData.isSelected = true;
}

// Focus on the box
function focus(id) {
    var pallet = pallets.get(id);

    // camera.lookAt( pallet.position );
    // controls.target.copy(pallet.position);
    camera.position.y = 30;
    camera.position.z = 29;
    var positionX = pallet.position.x
    var positionY = pallet.position.y
    var positionZ = (pallet.position.z) + 20    

    var positionStart = camera.position
    var positionEnd = { x : positionX, y: positionY, z: positionZ }
    var tweenPosition = new TWEEN.Tween(positionStart).to(positionEnd, 1000)
    tweenPosition.easing(TWEEN.Easing.Linear.None)
    tweenPosition.start()

    pallet.userData.setSelected();
    pallet.material.opacity = 1; 
    

    // controls.update();
}