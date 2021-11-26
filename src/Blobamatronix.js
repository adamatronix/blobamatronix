import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import dat from 'three/examples/jsm/libs/dat.gui.module';
import SimplexNoise from 'simplex-noise';
import studioHDR from './assets/studio_small_09_1k.hdr';
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
        this.speed = 0.106;
        this.noiseSize = 0.045;
        this.displacementScale = 1.5;
        this.transmission = 1;
        this.thickness = 1;
        this.roughness = 0.6;
        this.envMapIntensity = 1.2;
        this.clearcoat = 1;
        this.clearcoatRoughness = 0;
        
      }
      var gui = new dat.GUI();
      gui.add(this.controls, 'speed', 0, 1);
      gui.add(this.controls, 'noiseSize', 0, 0.1);
      gui.add(this.controls, 'displacementScale', 0, 50);
      gui.add(this.controls, 'transmission', 0, 1, 0.01).onChange((val) => {
        this.material.transmission = val;
      });

      gui.add(this.controls, 'thickness', 0, 1, 0.1).onChange((val) => {
        this.material.thickness = val;
      });

      gui.add(this.controls, 'roughness', 0, 1, 0.1).onChange((val) => {
        this.material.roughness = val;
      });

      gui.add(this.controls, "envMapIntensity", 0, 3, 0.1).onChange((val) => {
        this.material.envMapIntensity = val;
      });

      gui.add(this.controls, "clearcoat", 0, 1, 0.01).onChange((val) => {
        this.material.clearcoat = val;
      });
    
      gui.add(this.controls, "clearcoatRoughness", 0, 1, 0.01).onChange((val) => {
        this.material.clearcoatRoughness = val;
      });

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
       const skyColor = 0xFFFFFF;  // light blue
       const groundColor = 0xFFFFFF;  // brownish orange
       const intensity = 1;
       const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
       light.position.set(0,200,0);
       this.scene.add(light);

   }

   addsphere() {
    this.geometry = new THREE.SphereGeometry( 5, 600, 600);

    const hdrEquirect = new RGBELoader().load(
      studioHDR,
      () => {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
      }
    );
      /*
    this.material = new THREE.MeshPhongMaterial({
      flatShading: true,
      shininess: 150,
      color: 0xFFFFFF,
      displacementMap: this.texture,
      displacementScale: this.controls.displacementScale
    });*/

    this.material = new THREE.MeshPhysicalMaterial({
      transmission: this.controls.transmission,
      thickness: this.controls.thickness,
      roughness: this.controls.roughness,
      envMap: hdrEquirect,
      envMapIntensity: this.controls.envMapIntensity,
      clearcoat: this.controls.clearcoat,
      clearcoatRoughness: this.controls.clearcoatRoughness,
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
      const scl = this.controls.speed;

      for(let x=0; x<canvas.width; x++) {
          for(let y=0; y<canvas.height; y++) {
              var r = this.noise(x * this.controls.noiseSize, y * this.controls.noiseSize, this.t, canvas.width * this.controls.noiseSize, canvas.height * this.controls.noiseSize) * 0.4 + 0.4;

              this.data[(x + y * canvas.width) * 4 + 0] = r * 255;
              this.data[(x + y * canvas.width) * 4 + 1] = r * 255;
              this.data[(x + y * canvas.width) * 4 + 2] = r * 255;
              this.data[(x + y * canvas.width) * 4 + 3] = 255;
          }
      }
      this.t += scl;
      c.putImageData(this.imagedata, 0, 0);
    }

    noise(x, y, z, w, h) {
      return (
        this.simplex.noise3D(x, y, z) * (w - x) * (h - y) +
        this.simplex.noise3D(x - w, y, z) * x * (h - y) +
        this.simplex.noise3D(x - w, y - h, z) * x * y +
        this.simplex.noise3D(x, y - h, z) * (w - x) * y
      ) / (w * h);
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