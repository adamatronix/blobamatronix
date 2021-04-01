import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SimplexNoise from 'simplex-noise';
import { octave, map } from './Utilities';

class Blobamatronix {

    constructor() {
      // THREE stuff
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.renderFrame = this.renderFrame.bind(this);
      this.generateTextureCanvas();
      //this.setupWorld();
      this.renderFrame();

    }

    setupWorld() {
      //setup the scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xcccccc);

      //setup world clock
      this.clock = new THREE.Clock();

      //setup the camera
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
      this.camera.position.set(2000, 2000, 2000);
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
       controls.minDistance = 50;
       controls.maxDistance = 2000;

       //add lighting
       const skyColor = 0xB1E1FF;  // light blue
       const groundColor = 0x000000;  // brownish orange
       const intensity = 1;
       const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
       light.position.set(0,100,0);
       this.scene.add(light);

   }

   generateTextureCanvas() {
      //this.canvas = document.getElementById('noise-canvas');
      this.canvas = document.createElement('canvas');
      this.canvas.width = 250;
      this.canvas.height = 250;
      this.context = this.canvas.getContext('2d');
      this.simplex = new SimplexNoise(4);
      this.t = 0;
      this.imagedata = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
      this.data = this.imagedata.data;
       
    }

    setNoiseMap() {
      const canvas = this.canvas;
      const c = this.context;

      for(let x=0; x<canvas.width; x++) {
          for(let y=0; y<canvas.height; y++) {
              var r = this.simplex.noise3D(x / 250, y / 250, this.t/50) * 0.4 + 0.4;

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
      //this.renderer.render( this.scene, this.camera );
      this.setNoiseMap();
      requestAnimationFrame(this.renderFrame);
    } 
}

export default Blobamatronix;