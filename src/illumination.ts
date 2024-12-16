import { Scene, AmbientLight, DirectionalLight } from "three";

// Add lights to a scene
export function setupLights(scene: Scene): void {
const ambientLight = new AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);
}