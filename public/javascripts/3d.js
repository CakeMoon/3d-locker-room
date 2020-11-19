import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';

let container;

let camera,  controls, scene, renderer;
let plane;
let mouse, raycaster, isShiftDown = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;
let drawingGeo, drawingMesh;

let drawing = false;
let extruding = false;
let pointBase;

const objects = [];
let count = 0;

init();
//render();
animate();

function init() {
    container = document.getElementById( "canvas" );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 500, 800, 1300 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.width, container.height );


    container.appendChild(renderer.domElement);

    // controls

    controls = new OrbitControls( camera, renderer.domElement );

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    // grid

    const gridHelper = new THREE.GridHelper( 1000, 20 );
    scene.add( gridHelper );


    //
    pointBase = new THREE.Vector3(); // create once and reuse

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const geometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
    geometry.rotateX( - Math.PI / 2 );

    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
    scene.add( plane );

    objects.push( plane );
    

    // lights

    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );



    

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    var selectedObject = scene.getObjectByName("drawingMesh");
    scene.remove( selectedObject );
    
    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    const intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 && drawing) {

        const intersect = intersects[ 0 ];

        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse
        vec.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1,
            0.5 );
        vec.unproject( camera );
        vec.sub( camera.position ).normalize();
        var distance = - camera.position.z / vec.z;
        pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

        // rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        // rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        console.log(intersect.point);
        console.log("intersect.point");
        console.log(pointBase);

        const length = Math.abs(pos.x - pointBase.x);
        const width = Math.abs(pos.y - pointBase.y);
        const height = Math.abs(intersect.point.z - pointBase.z);
        drawingGeo = new THREE.BoxBufferGeometry( length, width, height/2 );
        drawingGeo.rotateX( - Math.PI / 2 );
        const drawingMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
        drawingMesh = new THREE.Mesh( drawingGeo, drawingMaterial );
        drawingMesh.name = "drawingMesh"
        drawingMesh.position.x = pointBase.x + (pos.x - pointBase.x) / 2;
        drawingMesh.position.y = pointBase.y + (pos.y - pointBase.y) / 2;
        drawingMesh.position.z = 0;
        scene.add( drawingMesh );

    }

    render();

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    const intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        const intersect = intersects[ 0 ];

        // delete cube
        if ( isShiftDown ) {
            if ( intersect.object !== plane ) {
                scene.remove( intersect.object );
                objects.splice( objects.indexOf( intersect.object ), 1 );
            }

        // create cube
        } else {
            if (!drawing) {
                var vec = new THREE.Vector3(); // create once and reuse
                var vec = new THREE.Vector3(); // create once and reuse
                vec.set(
                    ( event.clientX / window.innerWidth ) * 2 - 1,
                    - ( event.clientY / window.innerHeight ) * 2 + 1,
                    0.5 );
                vec.unproject( camera );
                vec.sub( camera.position ).normalize();
                var distance = - camera.position.z / vec.z;
                pointBase.copy( camera.position ).add( vec.multiplyScalar( distance ) );
                
                drawing = true;
            }
            else if (drawing) {
                const newMesh = drawingMesh.clone ();
                newMesh.name = count;
                count++;
                objects.push(newMesh);
                scene.add(newMesh);
                drawing = false;
            }

        }

        render();

    }

}

function onDocumentKeyDown( event ) {
    switch ( event.keyCode ) {
        case 16: isShiftDown = true; break;
    }
}

function onDocumentKeyUp( event ) {
    switch ( event.keyCode ) {
        case 16: isShiftDown = false; break;
    }
}

function render() {
    renderer.render( scene, camera );
}

function animate() {

    requestAnimationFrame( animate );

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}