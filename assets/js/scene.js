let scene, camera, renderer, loader, controls;
let hlight, directionalLight, light, light2, light3, light4;
let current_model = null;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbada55);
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(5, 2, 5);
    camera.rotation.y = 45/180*Math.PI;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = false;
    //controls.addEventListener('change', renderer);
    

    hlight = new THREE.AmbientLight (0x000000,80);
    scene.add(hlight);

    directionalLight = new THREE.DirectionalLight(0xffffff,40);
    directionalLight.position.set(0,1,0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    light = new THREE.PointLight(0xffffff,5);
    light.position.set(0,300,500);
    scene.add(light);
    light2 = new THREE.PointLight(0xffffff,5);
    light2.position.set(500,100,0);
    scene.add(light2);
    light3 = new THREE.PointLight(0xffffff,5);
    light3.position.set(0,100,-500);
    scene.add(light3);
    light4 = new THREE.PointLight(0xffffff,5);
    light4.position.set(-500,300,500);
    scene.add(light4);

    
    document.body.appendChild(renderer.domElement);

    loader = new THREE.GLTFLoader();
    animate();
}


function load3Dmodel(name, element){
    if (current_model !== null){
        
        current_model.traverse((o) => {
            if(o.isMesh) o.material.dispose();
            if(o.geometry) o.geometry.dispose()
        });
        // remove current rendered model from the screen
        scene.remove(current_model);
        document.querySelector(".loading").classList.remove('loaded');
    }

    // find all selected buttons and remove selected class
    let selected = document.querySelector(".selected");

    if (selected !== null){
        selected.classList.remove("selected");
    } 

    // for current selected model mark button as selected
    element.classList.add("selected");

    let loading = document.getElementById("loading-text");

    loader.load('assets/models/cars/'+name+'/scene.gltf', function(gltf){

        car = gltf.scene;
        car.castShadow = true;
        //console.log(car)
        fitCameraToObject(car);

        //car.traverse((o) => {
        //    if(o.isMesh) console.log(o.material);
        //});
        
        scene.add(car);
        current_model = car;
        animate();

        document.querySelector(".loading").classList.add('loaded');
    }, function ( xhr ) {
        //console.log(loading);
        loading.innerText = 'Loading model...' + ( xhr.loaded / xhr.total * 100 ) + '%'
        // ( xhr.loaded / xhr.total * 100 ) + '% loaded';
    }, function ( error ) {
        alert("Sorry, your model can not be loaded properly.")
    });
}


function setPaintColor(selected_color){ // 0xff0000 - red
    //console.log(selected_color);
    if( current_model  !== null){
        //console.log(current_model);
        current_model.traverse((o) => {
            if (o.isMesh) {
                if( o.material.name === "paint" || 
                    o.material.name === "Paint" || 
                    o.material.name === "Coloured" || 
                    o.material.name === "Base" || 
                    o.material.name === "paint-body" || 
                    o.material.name === "body" || 
                    o.material.name === "Indoor_M" || 
                    o.material.name === "Car_Paint" ){
                    o.material.color = new THREE.Color( selected_color );
                }
            }
        });
    }
}

function setWindowColor(selected_color){ // 0xff0000 - red
    //console.log(selected_color);
    if( current_model  !== null){
        //let newColor = new THREE.MeshStandardMaterial({color: selected_color});
        //console.log(newColor);
        current_model.traverse((o) => {
            if (o.isMesh) {
                //console.log(o.material);
                if( o.material.name === "Windows" || 
                    o.material.name === "window" || 
                    o.material.name === "window0" || 
                    o.material.name === "window1" || 
                    o.material.name === "WindowDark" || 
                    o.material.name === "Window" || 
                    o.material.name === "glass" || 
                    o.material.name === "Window_M" ){
                    o.material.color = new THREE.Color( selected_color );
                }
            }
        });
    }
}

function fitCameraToObject( object, fitOffset = 1 ) {
  
    const box = new THREE.Box3();
    
    box.expandByObject( object );
    
    const size = box.getSize( new THREE.Vector3() );
    const center = box.getCenter( new THREE.Vector3() );
    
    const maxSize = Math.max( size.x, size.y, size.z );
    const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
    
    const direction = controls.target.clone()
      .sub( camera.position )
      .normalize()
      .multiplyScalar( distance );
  
    controls.maxDistance = distance * 10;
    controls.target.copy( center );
    
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
  
    camera.position.copy( controls.target ).sub(direction);
    
    controls.update();
}

$(".search").keyup(function () {

    var filter = $(this).val(), count = 0;
    $(".car-collection .car").each(function () {

        var current = $('.car').attr('data-name');
        if ($(this).text().search(new RegExp(filter, "i")) < 0) {
            $(this).fadeOut();
        } else {
            $(this).show();
            count++;
        }
    });
});

function animate() {
    renderer.render(scene,camera);
    controls.update();
    requestAnimationFrame(animate);
}
init();
		