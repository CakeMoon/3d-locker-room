var aspect = window.innerWidth / window.innerHeight;
var d = 20;
const scene = new THREE.Scene();
camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );

camera.position.set( 20, 20, 20 ); // all components equal
camera.lookAt( scene.position ); // or the origin


const size = 50;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );




renderer.render( scene, camera );