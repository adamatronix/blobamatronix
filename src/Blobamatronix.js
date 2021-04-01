import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { octave, map } from './Utilities';

class Blobamatronix {

    constructor() {
      // THREE stuff
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.renderFrame = this.renderFrame.bind(this);
      this.generateTexture();
      //this.setupWorld();
      //this.renderFrame();

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

   generateTexture() {
      this.canvas = document.getElementById('noise-canvas');
      this.canvas.width = 400;
      this.canvas.height = 400;
      this.context = this.canvas.getContext('2d')

      const canvas = this.canvas;
      const c = this.context;

      c.fillStyle = 'black'
      c.fillRect(0,0,canvas.width, canvas.height)
      for(let i=0; i<canvas.width; i++) {
          for(let j=0; j<canvas.height; j++) {
              let v =  octave(i/canvas.width,j/canvas.height,16)
              const per = (100*v).toFixed(2)+'%'
              c.fillStyle = `rgb(${per},${per},${per})`
              c.fillRect(i,j,1,1)
          }
      }
      return c.getImageData(0,0,canvas.width,canvas.height)

    }

    renderFrame() {
      this.renderer.render( this.scene, this.camera );
      requestAnimationFrame(this.renderFrame);
    } 
}

export default Blobamatronix;