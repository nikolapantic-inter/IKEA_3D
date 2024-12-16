import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  AmbientLight,
  DirectionalLight
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Initialize Scene
const scene = new Scene();
scene.background = new Color(0xdddddd);

// Initialize Camera
const camera = new PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1,
  1000
);
camera.position.set(0, 1.0, 4.5); // Camera position

// Initialize Renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.target.set(0, 1, 0);
controls.minPolarAngle = Math.PI / 2.4;
controls.maxPolarAngle = Math.PI / 2.0;

//  Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
const ambientLight = new AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// GLTF Loader
const gltfLoader = new GLTFLoader();

let chair: Group | null = null;
let table: Group | null = null;
let dresser: Group | null = null;
let background: Group | null = null;

// Load Chair
gltfLoader.load("/models/chair.glb", (gltf) => {
  chair = gltf.scene;
  chair.scale.set(1, 1, 1);
  chair.position.set(0, 0, 0);
  scene.add(chair);
});

// Load Table
gltfLoader.load("/models/classic_round_side_table.glb", (gltf) => {
  table = gltf.scene;
  table.scale.set(1, 1, 1);
  table.position.set(-1, 0, 0);
  scene.add(table);
});

// Load Ikea Hemnes Dresser
gltfLoader.load("/models/ikea.glb", (gltf) => {
  dresser = gltf.scene;
  dresser.scale.set(1, 1, 1);
  dresser.position.set(-1.0, 0, -1.0);
  scene.add(dresser);
});

// Load Background
gltfLoader.load("/models/background.glb", (gltf) => {
  background = gltf.scene;
  background.scale.set(1, 1, 1);
  background.rotation.y = Math.PI / 2;
  scene.add(background);
});

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera); // Render the scene
}
animate();
