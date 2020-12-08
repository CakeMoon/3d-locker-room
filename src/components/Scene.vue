<template>
  <div class="page-canvas">
    <div class="board">
      <span>Orbit - left mouse</span>
      <span>Zoom - middle mouse, or mousewheel</span>
      <span>Move camera - shift + left mouse, or right mouse</span>
      <span>Move model - press on object and drag mouse</span>
    </div>
    <div id="three-scene-canvas">
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: 'Scene',

  data () {
    return {
      sceneCanvas: null,
      scene: null,
      camera: null,
      renderer: null,
      dragControls: null,
      //orbitControls: null,
      objects: [],
      images: [],
      model3Ds: [],
      mouse: null,
      group: null,
      raycaster: null,


      cube: null,
      draging: false,
      drawing: false,
      pointBase: null,
      plane: null,
      isShiftDown: false,
      drawingMesh: null,
    }
  },

  created: function() {
    this.listAllObjects();

    eventBus.$on("delete-image-success", () => {
      this.listAllObjects();
    });

    eventBus.$on("upload-image-success", () => {
      this.listAllObjects();
    });
  }, 

  mounted () {
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.pointBase = new THREE.Vector3(); // create once and reuse

    this.sceneCanvas = document.getElementById('three-scene-canvas');

    // this.camera = new THREE.PerspectiveCamera(
    //   45,
    //   this.sceneCanvas.getBoundingClientRect().width / this.sceneCanvas.getBoundingClientRect().height,
    //   1,
    //   10000
    // )
    // this.camera.position.set( 5000, 20000, 10000 );
    
    const aspect = this.sceneCanvas.getBoundingClientRect().width / this.sceneCanvas.getBoundingClientRect().height;
    const d = 500;
    this.camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 10000 );

    this.camera.position.set( d, d, d ); // all components equal

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xcccccc );
    this.scene.add( new THREE.AmbientLight( 0x505050 ) );
    this.camera.lookAt( this.scene.position ); // or the origin

    // light
    const light = new THREE.SpotLight( 0xffffff, 1 );
    light.position.set( 0, 4000, 4000 );
    light.angle = Math.PI / 9;

    light.castShadow = true;
    light.shadow.camera.near = 1000;
    light.shadow.camera.far = 4000;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    this.scene.add( light );

    this.group = new THREE.Group();
    this.scene.add( this.group );
    
    // ground
    const geometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
    geometry.rotateX( - Math.PI / 2 );
    this.plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
    this.scene.add( this.plane );
    this.objects.push( this.plane );

    // grid
    var gridHelper = new THREE.GridHelper( 1000, 20 );
    this.scene.add( gridHelper );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(this.sceneCanvas.offsetWidth, this.sceneCanvas.offsetHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.sceneCanvas.append(this.renderer.domElement)

    const axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( axesHelper );
    
    //
    const cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
		const cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( 'textures/square-outline-textured.png' ) } );
    this.cube = new THREE.Mesh( cubeGeo, cubeMaterial );
    this.scene.add(this.cube);

    window.addEventListener( 'resize', this.onWindowResize, false );

    this.sceneCanvas.addEventListener( 'click', this.onClick, false );
    window.addEventListener( 'keydown', this.onKeyDown, false );
    window.addEventListener( 'keyup', this.onKeyUp, false );
    // keydown/keyup seem only work for window
    this.sceneCanvas.addEventListener( 'mousemove', this.onMouseMove, false );

    // this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );
    // this.orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    // this.orbitControls.dampingFactor = 0.05;
    // this.orbitControls.screenSpacePanning = false;
    // this.orbitControls.minDistance = 100;
    // this.orbitControls.maxDistance = 1500;
    // this.orbitControls.maxPolarAngle = Math.PI / 2;

    this.render();
  },
  
  methods: {
    
    onWindowResize: function() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.render();
    },

    onKeyDown: function( event ) {
      console.log("key down!");
      this.isShiftDown = ( event.keyCode === 16 ) ? true : false;
    },
      
    onKeyUp: function() {
      console.log("key up");
      this.isShiftDown = ( event.keyCode === 16 ) ? false : true;
    },

    onClick: function( event ) {
      event.preventDefault();
      if (this.draging) {
        this.draging = false;
      } 
      else {
        console.log("darwing");
        this.mouse.set(
          ( event.clientX / this.sceneCanvas.getBoundingClientRect().width ) * 2 - 1,
          - ( event.clientY / this.sceneCanvas.getBoundingClientRect().height ) * 2 + 1
          );
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const intersects = this.raycaster.intersectObjects( this.objects );
        if ( intersects.length > 0 ) {
            const intersect = intersects[ 0 ];
            // delete cube
            if ( this.isShiftDown ) {
                if ( intersect.object !== this.plane ) {
                    this.scene.remove( intersect.object );
                    this.objects.splice( this.objects.indexOf( intersect.object ), 1 );
                }
            // create cube
            } else {
                if (!this.drawing) {
                    // var vec = new THREE.Vector3(); // create once and reuse
                    // vec.set(
                    //     ( event.clientX / this.sceneCanvas.getBoundingClientRect().width ) * 2 - 1,
                    //     - ( event.clientY / this.sceneCanvas.getBoundingClientRect().height ) * 2 + 1,
                    //     0.5 );
                    // vec.unproject( this.camera );
                    // vec.sub( this.camera.position ).normalize();
                    // var distance = - this.camera.position.z / vec.z;
                    this.pointBase.copy( intersect.point ).add( intersect.face.normal );
                    this.cube.position.copy( intersect.point ).add( intersect.face.normal );
                    this.drawing = true;
                }
                else if (this.drawing) {
                    const newMesh = this.drawingMesh.clone ();
                    newMesh.name = this.count;
                    this.count++;
                    this.objects.push(newMesh);
                    this.scene.add(newMesh);
                    this.drawing = false;
                }
            }
            this.render();
        }
      }
    },

    onMouseMove: function( event ) {
      console.log("move!");

      var selectedObject = this.scene.getObjectByName("drawingMesh");
      this.scene.remove( selectedObject );
      
      event.preventDefault();
      if (this.drawing) {
          var vec = new THREE.Vector3(); // create once and reuse
          var pos = new THREE.Vector3(); // create once and reuse
          vec.set(
              ( event.clientX / event.clientX / this.sceneCanvas.getBoundingClientRect().width ) * 2 - 1,
              - ( event.clientY / this.sceneCanvas.getBoundingClientRect().height ) * 2 + 1,
              ( this.camera.near + this.camera.far ) / ( this.camera.near - this.camera.far ));
          vec.unproject( this.camera );
          vec.sub( this.camera.position ).normalize();
          var distance = - this.camera.position.z / vec.z;
          pos.copy( this.camera.position ).add( vec.multiplyScalar( distance ) );

          // rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
          // rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

          const width = Math.abs(pos.x);
          const height = Math.abs(pos.y);
          const depth = Math.abs(pos.z);
          const drawingGeo = new THREE.BoxBufferGeometry( width, depth, height );
          const drawingMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
          this.drawingMesh = new THREE.Mesh( drawingGeo, drawingMaterial );
          this.drawingMesh.name = "drawingMesh"
          this.drawingMesh.position.x = this.pointBase.x/2;
          this.drawingMesh.position.y = this.pointBase.y //+ pos.y) / 2;
          this.drawingMesh.position.z = this.pointBase.z/2;
          this.scene.add( this.drawingMesh );

      this.render();
      }
    },
      
    animate: function() {

      requestAnimationFrame( this.animate );

      //this.orbitControls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

      this.render();

    },

    render: function() {
				this.renderer.render( this.scene, this.camera );
    },
    
    listAllObjects: async function() {
      const promise1 = axios.get('/api/model3ds');
      const promise2 = axios.get('/api/images');

      Promise.all([promise1, promise2])
        .then(res => {
          //images
          this.images = res[1].data;


          for (let i = 0; i < this.images.length; i++) {
            const image = this.images[i];
            const loader = new THREE.TextureLoader();
            loader.setCrossOrigin("Anonymous");
            var cubeMaterialArray = [];
            const material = new THREE.MeshLambertMaterial({
              map: loader.load(image.link)
            });

            cubeMaterialArray.push( new THREE.MeshLambertMaterial( { color: 0x999999 } ) );
            cubeMaterialArray.push( new THREE.MeshLambertMaterial( { color: 0x999999 } ) );
            cubeMaterialArray.push( new THREE.MeshLambertMaterial( { color: 0x999999 } ) );
            cubeMaterialArray.push( new THREE.MeshLambertMaterial( { color: 0x999999 } ) );
            cubeMaterialArray.push(material);
            cubeMaterialArray.push( new THREE.MeshLambertMaterial( { color: 0x999999 } ) );

            const geometry = new THREE.BoxGeometry(image.width, image.height, 1);
            const mesh = new THREE.Mesh(geometry, cubeMaterialArray);

            mesh.position.x = Math.random() * 100 - 5;
            mesh.position.y = image.height/2;
            mesh.position.z = Math.random() * 80 - 4;

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.scene.add( mesh );

            this.objects.push( mesh );
          }

          // models
          this.model3Ds = res[0].data;

          var that = this;
          for (let i = 0; i < this.model3Ds.length; i++) {
            const model3D = this.model3Ds[i];
            const loaderGLTF = new GLTFLoader();
            loaderGLTF.setCrossOrigin("Anonymous");

            loaderGLTF.load( model3D.content, function ( gltf ) {
              const model  = gltf.scene;

              gltf.scene.traverse( function( object ) {

                if ( object.isMesh) {
                  that.objects.push( object );
                  that.scene.add(model);
                }
              } );
            })
          }
        })
        .then(() => {
          var that = this;
          this.dragControls = new DragControls( this.objects.slice(1), this.camera, this.renderer.domElement );
          this.dragControls.addEventListener( 'dragstart', function () { that.draging = true } );
          //that.orbitControls.enabled = false;
          this.dragControls.addEventListener( 'dragend', function () { that.draging = true } );
          this.animate();
          console.log("loaded!");
        })
        .catch(error => console.log(error));
    },
  }
}
</script>

<style scoped>
#three-scene-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
}

.board {
  z-index: 9;
  margin: 10px;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.39);
  padding: 10px;
  font-size: 15px;
  font-weight: lighter;
  display: flex;
  flex-direction: column;
}

span {
  padding: 3px;
}

.draw-button {
  background-color: #ffffff;
  color: #0079FB;
  border: 1px solid #0079FB;
  margin-top: 5px;
}

.draw-button:hover {
  background-color: #b3b3b3;
  color: #0079FB;
  border: 1px solid #0079FB;
}

.complete-button {
  background-color: #0079FB;
  color: #ffffff;
  border: 1px solid #0079FB;
  margin-top: 5px;
}

.complete-button:hover {
  background-color: #004896;
  color: #ffffff;
  border: 1px solid #0079FB;
}
.page-canvas {
  height: 100%;
  position: relative;
}
</style>