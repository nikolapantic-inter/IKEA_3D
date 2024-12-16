import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  WebGLRenderer,
} from "three";
export function setUpControls(controls : OrbitControls) : void {
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.target.set(0, 1, 0);
  controls.minPolarAngle = Math.PI / 2.3;
  controls.maxPolarAngle = Math.PI / 2.0;
}

export function setUpWindow(camera : PerspectiveCamera, renderer : WebGLRenderer) : void {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
}