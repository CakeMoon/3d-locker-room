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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
      orbitControls: null,
      objects: [],
      images: [],
      model3Ds: [],
      mouse: null,
      group: null,
      enableSelection: false,
      raycaster: null,
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

    this.sceneCanvas = document.getElementById('three-scene-canvas');

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.sceneCanvas.getBoundingClientRect().width / this.sceneCanvas.getBoundingClientRect().height,
      1,
      5000
    )
    this.camera.position.set( 0, 200, 400 );
    this.camera.lookAt( 0, 0, 0 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xcccccc );
    this.scene.add( new THREE.AmbientLight( 0x505050 ) );

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
    const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10, 10 ), new THREE.MeshPhongMaterial( { color: 0x91ABF1, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    
    var gridHelper = new THREE.GridHelper( 1000, 20 );
    this.scene.add( gridHelper );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(this.sceneCanvas.offsetWidth, this.sceneCanvas.offsetHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.sceneCanvas.append(this.renderer.domElement)
    
    //

    window.addEventListener( 'resize', this.onWindowResize, false );

    this.sceneCanvas.addEventListener( 'click', this.onClick, false );
    this.sceneCanvas.addEventListener( 'keydown', this.onKeyDown, false );
    this.sceneCanvas.addEventListener( 'keyup', this.onKeyUp, false );

    this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );

    this.orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.orbitControls.dampingFactor = 0.05;

    this.orbitControls.screenSpacePanning = false;

    this.orbitControls.minDistance = 100;
    this.orbitControls.maxDistance = 1500;

    this.orbitControls.maxPolarAngle = Math.PI / 2;

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
      this.enableSelection = ( event.keyCode === 16 ) ? true : false;
    },
      
    onKeyUp: function() {
      this.enableSelection = false;
    },

    draw: function() {
      this.drawing = !this.drawing;
    },
      
    onClick: function( event ) {

      event.preventDefault();

      if ( this.enableSelection === true ) {

        const draggableObjects = this.dragControls.getObjects();
        draggableObjects.length = 0;

        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera( this.mouse, this.camera );

        const intersections = this.raycaster.intersectObjects( this.objects, true );

        if ( intersections.length > 0 ) {

          const object = intersections[ 0 ].object;

          if ( this.group.children.includes( object ) === true ) {

            object.material.emissive.set( 0x000000 );
            this.scene.attach( object );

          } else {

            object.material.emissive.set( 0xaaaaaa );
            this.group.attach( object );

          }

          this.dragControls.transformGroup = true;
          draggableObjects.push( this.group );

        }

        if ( this.group.children.length === 0 ) {

          this.dragControls.transformGroup = false;
          draggableObjects.push( ...this.objects );

        }

      }

      this.animate();

    },
      
    animate: function() {

      requestAnimationFrame( this.animate );

      this.orbitControls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

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
          this.dragControls = new DragControls( this.objects, this.camera, this.renderer.domElement );
          this.dragControls.addEventListener( 'dragstart', function () { that.orbitControls.enabled = false; } );
          this.dragControls.addEventListener( 'dragend', function () { that.orbitControls.enabled = true; } );
          this.animate();
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