import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  AmbientLight,
  DirectionalLight,
  EquirectangularReflectionMapping,
  ACESFilmicToneMapping,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  Group,
  Raycaster,
  Vector2,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Initialize Scene
const scene = new Scene();
scene.background = new Color(0xdddddd);

// Initialize Camera
const camera = new PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.0, 4.5);

// Initialize Renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = ACESFilmicToneMapping; // Apply tone mapping
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

// Initialize OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.enablePan = true;
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

// Loading Manager
const loadingManager = new LoadingManager();
loadingManager.onLoad = () => {
  console.log("All assets loaded.");
  animate();
};

// GLTF and RGBE Loader
const rgbeLoader = new RGBELoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

//HDR Lights
rgbeLoader.load("/textures/pine_attic_2k.hdr", (texture) => {
  texture.mapping = EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

let chair: Group | null = null;
let table: Group | null = null;
let dresser: Group | null = null;
let background: Group | null = null;

// Map to Original Colors
const originalColorsMap = new Map<Mesh, Color>();
const highlightColor = new Color(0x83f52c);
let selectedObject: Group | null = null;

// Load Chair
gltfLoader.load("/models/chair.glb", (gltf) => {
  chair = gltf.scene;
  chair.scale.set(1, 1, 1);
  chair.position.set(0, 0, 0);
  scene.add(chair);
  chair.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.material instanceof MeshStandardMaterial) {
        originalColorsMap.set(mesh, mesh.material.color.clone());
      }
    }
  });
});

// Load Table
gltfLoader.load("/models/classic_round_side_table.glb", (gltf) => {
  table = gltf.scene;
  table.scale.set(1, 1, 1);
  table.position.set(-1, 0, 0);
  scene.add(table);
  table.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.material instanceof MeshStandardMaterial) {
        originalColorsMap.set(mesh, mesh.material.color.clone());
      }
    }
  });
});

// Load Ikea Hemnes Dresser
gltfLoader.load("/models/ikea.glb", (gltf) => {
  dresser = gltf.scene;
  dresser.scale.set(1, 1, 1);
  dresser.position.set(-1.0, 0, -1.0);
  scene.add(dresser);
  dresser.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.material instanceof MeshStandardMaterial) {
        originalColorsMap.set(mesh, mesh.material.color.clone());
      }
    }
  });
});

// Load Background
gltfLoader.load("/models/background.glb", (gltf) => {
  background = gltf.scene;
  background.scale.set(1, 1, 1);
  background.rotation.y = Math.PI / 2;
  scene.add(background);
});

// Raycaster and Mouse Vector
const raycaster = new Raycaster();
const mouse = new Vector2();

// Handle Mouse Click
window.addEventListener("click", (event: MouseEvent) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersectsChair = chair ? raycaster.intersectObject(chair, true) : [];
  const intersectsTable = table ? raycaster.intersectObject(table, true) : [];
  const intersectsDresser = dresser
    ? raycaster.intersectObject(dresser, true)
    : [];

  if (intersectsChair.length > 0 && chair) {
    selectObject(chair);
  } else if (intersectsTable.length > 0 && table) {
    selectObject(table);
  } else if (intersectsDresser.length > 0 && dresser) {
    selectObject(dresser);
  } else {
    deselectAll();
  }
});

// Selection Functions
function selectObject(object: Group) {
  if (selectedObject === object) {
    deselectObject(object);
    return;
  }
  if (selectedObject) deselectObject(selectedObject);
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.material instanceof MeshStandardMaterial) {
        mesh.material.color.set(highlightColor);
      }
    }
  });
  selectedObject = object;
}

function deselectObject(object: Group) {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.material instanceof MeshStandardMaterial) {
        const originalColor = originalColorsMap.get(mesh);
        if (originalColor) mesh.material.color.copy(originalColor);
      }
    }
  });
  selectedObject = null;
}

function deselectAll() {
  if (selectedObject) deselectObject(selectedObject);
}

// Handle Keyboard Input for Movement
window.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!selectedObject) return;
    const step = 0.1; // Movement step size
    const rotateStep = (Math.PI / 180) * 5; // Rotate by 5 degrees per key press
    switch (event.key.toLowerCase()) {
      case "w":
        selectedObject.translateZ(-step); // Move forward relative to rotation
        break;
      case "s":
        selectedObject.translateZ(step); // Move backward relative to rotation
        break;
      case "a":
        selectedObject.translateX(-step); // Move left relative to rotation
        break;
      case "d":
        selectedObject.translateX(step); // Move right relative to rotation
        break;
      case "arrowleft":
        selectedObject.rotation.y += rotateStep; // Rotate left
        break;
      case "arrowright":
        selectedObject.rotation.y -= rotateStep; // Rotate right
        break;
      default:
        break;
    }
  });

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera); // Render the scene
}
animate();
