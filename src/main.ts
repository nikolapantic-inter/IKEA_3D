import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  EquirectangularReflectionMapping,
  ACESFilmicToneMapping,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  Group,
  Raycaster,
  Vector2,
  Vector3,
  Euler,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setupLights } from "./illumination";
import { setupAudio , sound } from "./audio";
import { setUpControls , setUpWindow } from "./core";

// Initialize scene
const scene = new Scene();
scene.background = new Color(0xdddddd);

// Initialize camera
const camera = new PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.0, 4.5);

// Initialize renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = ACESFilmicToneMapping; // Apply tone mapping
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

// Setup audio and attach it to the camera
setupAudio(camera);

// Ensure audio starts after user interaction
const startAudio = () => {
  if (sound && !sound.isPlaying) {
    sound.play();
    console.log("Audio started");
  }
};

// Add a click event listener to play audio
document.body.addEventListener("click", startAudio, { once: true });

// Initialize and set up orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
setUpControls(controls);

// Setup Window resize
setUpWindow(camera, renderer);

// Setup lights
setupLights(scene);

// Loading manager
const loadingManager = new LoadingManager();
loadingManager.onLoad = () => {
  console.log("All assets loaded.");

  const fadeOverlay = document.getElementById("fade-overlay");
  if (fadeOverlay) {
    fadeOverlay.style.opacity = "0";
    setTimeout(() => {
      fadeOverlay.style.display = "none";
    }, 2000);
  }

  animate();
};

// GLTF and RGBE loader
const rgbeLoader = new RGBELoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

// Paths to HDR textures
const hdrDayPath = "/textures/day.hdr";
const hdrNightPath = "/textures/night.hdr";

// Current HDR state
let isDay = true;

//HDR lights
const loadHDR = (hdrPath: string) => {
  rgbeLoader.load(
    hdrPath,
    (texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
      console.log(`Loaded HDR: ${hdrPath}`);
    },
    undefined,
    // onError callback
    function (err) {
      console.log("Error:", err);
    }
  );
};

// Load HDR
loadHDR(hdrDayPath);

// Toggle HDR on click
const hdrToggleButton = document.getElementById("toggle-hdr-btn");
if (hdrToggleButton) {
  // Update button color based on state
  const updateButtonStyle = () => {
    hdrToggleButton.style.backgroundColor = isDay ? "#0057ad" : "#FFA500";
    hdrToggleButton.style.color = isDay ? "white" : "black";
    hdrToggleButton.textContent = isDay ? "🌙" : "☀️";
    hdrToggleButton.classList.toggle("day", isDay);
    hdrToggleButton.classList.toggle("night", !isDay);
  };

  // Init
  updateButtonStyle();

  hdrToggleButton.addEventListener("click", () => {
    isDay = !isDay;
    loadHDR(isDay ? hdrDayPath : hdrNightPath);
    updateButtonStyle(); // Update on toggle
  });
}
// Declare model variables 

let chair: Group | null = null;
let table: Group | null = null;
let dresser: Group | null = null;
let background: Group | null = null;

// Store the initial states of objects
const initialStates = new Map<
  Group,
  { position: Vector3; rotation: Euler; scale: Vector3 }
>();

// Save initial states
export function saveInitialState(object: Group) {
  initialStates.set(object, {
    position: object.position.clone(),
    rotation: object.rotation.clone(),
    scale: object.scale.clone(),
  });
}

// Reset objects to their initial state
function resetObject(object: Group) {
    const initialState = initialStates.get(object);
    if (initialState) {
      object.position.copy(initialState.position); 
      object.rotation.copy(initialState.rotation);
      object.scale.copy(initialState.scale);      
    }
  }
  
// Map to original colors
const originalColorsMap = new Map<Mesh, Color>();
const highlightColor = new Color(0x83f52c);
let selectedObject: Group | null = null;

// Load chair
gltfLoader.load("/models/chair.glb", (gltf) => {
  chair = gltf.scene;
  chair.scale.set(1, 1, 1);
  chair.position.set(0, 0, 0);
  scene.add(chair);
  saveInitialState(chair);
  chair.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.material instanceof MeshStandardMaterial) {
        originalColorsMap.set(mesh, mesh.material.color.clone());
      }
    }
  });
});

// Load table
gltfLoader.load("/models/classic_round_side_table.glb", (gltf) => {
  table = gltf.scene;
  table.scale.set(1, 1, 1);
  table.position.set(-1, 0, 0);
  scene.add(table);
  saveInitialState(table);
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
  dresser.position.set(-3.0, 0, -1.0);
  scene.add(dresser);
  saveInitialState(dresser);
  dresser.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.material instanceof MeshStandardMaterial) {
        originalColorsMap.set(mesh, mesh.material.color.clone());
      }
    }
  });
});

// Load background
gltfLoader.load("/models/background.glb", (gltf) => {
  background = gltf.scene;
  background.scale.set(1, 1, 1);
  background.rotation.y = Math.PI / 2;
  scene.add(background);
});

// Raycaster and mouse vector
const raycaster = new Raycaster();
const mouse = new Vector2();

// Handle mouse click
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

// Selection functions
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

// Move with Keyboard
window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (!selectedObject) return;

  const step = 0.1;
  const rotateStep = (Math.PI / 180) * 5; //5 Radians

  // Calculate camera forward
  const forward = new Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new Vector3();
  right.crossVectors(forward, camera.up).normalize(); // Right vector

  // Move selected object based on key press relative to the camera
  switch (event.key.toLowerCase()) {
    case "w":
      selectedObject.position.add(forward.multiplyScalar(step));
      break;
    case "s":
      selectedObject.position.add(forward.multiplyScalar(-step));
      break;
    case "a":
      selectedObject.position.add(right.multiplyScalar(-step));
      break;
    case "d":
      selectedObject.position.add(right.multiplyScalar(step));
      break;
    case "arrowleft":
      selectedObject.rotation.y -= rotateStep;
      break;
    case "arrowright":
      selectedObject.rotation.y += rotateStep;
      break;
    case "e": // Extend in the x-direction
      extendModelX(selectedObject);
      break;
    case "q": // Shrink in the x-direction
      shrinkModelX(selectedObject);
      break;
    case "r": // Reset
      if (chair) resetObject(chair);
      if (table) resetObject(table);
      if (dresser) resetObject(dresser);
      break;
    default:
      break;
  }

  // Constrain movement to the horizontal plane
  if (selectedObject) {
    selectedObject.position.y = 0;
  }
});

// Escale (extent) object in X
function extendModelX(object: Group) {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.geometry) {
        const geometry = mesh.geometry;
        const positionAttribute = geometry.attributes.position;

        for (let i = 0; i < positionAttribute.count; i++) {
          const x = positionAttribute.getX(i);
          positionAttribute.setX(i, x * 1.2);
        }

        positionAttribute.needsUpdate = true;
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
      }
    }
  });
}

// Escale (shrink) object in X
function shrinkModelX(object: Group) {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.geometry) {
        const positionAttribute = mesh.geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
          const x = positionAttribute.getX(i);
          positionAttribute.setX(i, x * 0.8);
        }
        positionAttribute.needsUpdate = true;
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
      }
    }
  });
}

// Help overlay logic
const helpOverlay = document.getElementById("help-overlay");
const helpText = document.getElementById("help-text");

// Toggle help menu on 'H' press
window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === "h" && helpOverlay && helpText) {
    const isHelpVisible = helpOverlay.style.display === "block";

    // Toggle visibility
    helpOverlay.style.display = isHelpVisible ? "none" : "block";
    helpText.style.display = isHelpVisible ? "block" : "none";
  }
});

// Screnshoot functionality
const screenshotButton = document.getElementById("screenshot-btn");
if (screenshotButton) {
  screenshotButton.addEventListener("click", () => {
    renderer.render(scene, camera);
    const screenshotDataURL = renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = screenshotDataURL;
    link.download = "IKEA moment.png";
    link.click();
    console.log("IKEA moment saved.");
  });
}

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera); // Render the scene
}
animate();
