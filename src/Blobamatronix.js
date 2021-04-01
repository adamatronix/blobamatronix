import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import dat from 'three/examples/jsm/libs/dat.gui.module';
import SimplexNoise from 'simplex-noise';
import { octave, map } from './Utilities';

class Blobamatronix {

    constructor() {
      // THREE stuff
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.renderFrame = this.renderFrame.bind(this);
      this.setupDataGUI();
      this.generateTextureCanvas();
      this.setupWorld();
      this.addsphere();
      this.renderFrame();

    }

    setupDataGUI() {
      this.controls = new function() {
        this.speed = 16;
        this.noiseSize = 20;
        this.displacementScale = 5;
      }
      var gui = new dat.GUI();
      gui.add(this.controls, 'speed', 0, 500);
      gui.add(this.controls, 'noiseSize', 0, 200);
      gui.add(this.controls, 'displacementScale', 0, 50);

    }

    setupWorld() {
      //setup the scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xcccccc);

      //setup world clock
      this.clock = new THREE.Clock();

      //setup the camera
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
      this.camera.position.set(10, 10, 10);
      this.camera.lookAt(new THREE.Vector3(0,0,0));

      //setup renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( this.renderer.domElement );

      this.renderer.gammaInput = true;
      this.renderer.gammaOutput = true;
      this.renderer.shadowMap.enabled = true;

       //setup controls
       let controls = new OrbitControls( this.camera, this.renderer.domElement);
       controls.minDistance = 0;
       controls.maxDistance = 500;

       //add lighting
       const skyColor = 0xB1E1FF;  // light blue
       const groundColor = 0x000000;  // brownish orange
       const intensity = 1;
       const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
       light.position.set(0,200,0);
       this.scene.add(light);

   }

   addsphere() {
    this.geometry = new THREE.SphereGeometry( 5, 200, 200);
    this.material = new THREE.MeshPhongMaterial({
      flatShading: true,
      shininess: 150,
      displacementMap: this.texture,
      displacementScale: this.controls.displacementScale
    });
    const sphere = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( sphere );
   }

   generateTextureCanvas() {
      //this.canvas = document.getElementById('noise-canvas');
      this.canvas = document.createElement('canvas');
      this.canvas.width = 128;
      this.canvas.height = 128;
      this.context = this.canvas.getContext('2d');
      this.simplex = new SimplexNoise(4);
      this.t = 0;
      this.imagedata = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
      this.data = this.imagedata.data;
      this.texture = new THREE.CanvasTexture(this.context.canvas);
       
    }

    setNoiseMap() {
      const canvas = this.canvas;
      const c = this.context;

      for(let x=0; x<canvas.width; x++) {
          for(let y=0; y<canvas.height; y++) {
              var r = this.simplex.noise3D(x / this.controls.noiseSize, y / this.controls.noiseSize, this.t/this.controls.speed) * 0.4 + 0.4;

              this.data[(x + y * canvas.width) * 4 + 0] = r * 255;
              this.data[(x + y * canvas.width) * 4 + 1] = r * 255;
              this.data[(x + y * canvas.width) * 4 + 2] = r * 255;
              this.data[(x + y * canvas.width) * 4 + 3] = 255;
          }
      }
      this.t++;
      c.putImageData(this.imagedata, 0, 0);
    }

    renderFrame() {
      this.setNoiseMap();
      this.texture.needsUpdate = true;
      this.material.displacementScale = this.controls.displacementScale;
      this.renderer.render( this.scene, this.camera );
      requestAnimationFrame(this.renderFrame);
    } 
}

export default Blobamatronix;