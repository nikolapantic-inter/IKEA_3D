import { Audio, AudioListener, AudioLoader, PerspectiveCamera } from "three";

export function setupAudio(camera : PerspectiveCamera) : void {
  // Create an AudioListener and add it to the camera
  const listener = new AudioListener();
  camera.add(listener);
  const sound = new Audio(listener);

  // Load the audio file and set it as the audio source
  const audioLoader = new AudioLoader();
  audioLoader.load(
    "/sounds/jazz.mp3",
    (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.4);
      sound.play();
    },
    undefined,
    // onError callback
    function (err) {
      console.log("Error loading audio:", err);
    }
  );
}


