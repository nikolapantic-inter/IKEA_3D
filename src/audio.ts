import { Audio, AudioListener, AudioLoader, PerspectiveCamera } from "three";

let sound: Audio;

export function setupAudio(camera: PerspectiveCamera): void {
  // Create an AudioListener and add it to the camera
  const listener = new AudioListener();
  camera.add(listener);

  // Initialize sound
  sound = new Audio(listener);

  // Load the audio file and set it as the audio source
  const audioLoader = new AudioLoader();
  audioLoader.load(
    "/sounds/jazz.mp3",
    (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.4);
      console.log("Audio loaded");
    },
    undefined,
    // onError callback
    function (err) {
      console.log("Error:", err);
    }
  );
}

// Export the sound instance
export { sound };
