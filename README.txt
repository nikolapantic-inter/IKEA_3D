IKEA 3D Viewer
This project is a 3D scene renderer built using three.js, a cozy living room where the user will be capable of planning his environment. 

Features

3D Object Manipulation:
Move, rotate, scale, and reset objects within the scene. Object selection is highlighted for easy identification.
HDR Lighting Toggle:
Switch between day and night environments using High Dynamic Range (HDR) textures.
Audio Integration:
Background jazz music plays when the user interacts with the canvas.
Screenshot Functionality:
Capture and save the current scene view as a .png image.
Interactive Help Overlay:
Display keyboard controls and usage instructions with a help menu.

Installation

Clone the repository:
git clone https://github.com/your-username/ikea-3d.git
Navigate to the project folder:
cd ikea-3d
Install dependencies:
npm install
Run the development server:
npm run dev
Open your browser and navigate to:
http://localhost:3000 (or the one shown in your terminal)


Controls

Key	Action
W	Move the selected object forward
A	Move the selected object left
S	Move the selected object backward
D	Move the selected object right
← (Left Arrow)	Rotate the selected object left
→ (Right Arrow)	Rotate the selected object right
Q	Shrink the selected object
E	Extend the selected object
R	Reset all objects to their initial state
H	Toggle the help menu

Mouse

Left Click: Select objects in the scene.
Buttons

☀️ / 🌙: Toggle between day and night lighting.
📸: Capture and save a screenshot of the scene.

Project Structure

src/  
├── audio.ts          # Audio setup
├── core.ts           # Scene, camera, renderer, and controls setup  
├── illumination.ts   # Setup for lighting  
├── main.ts           # Entry point for the app, and more. 

Dependencies

three.js — JavaScript library for 3D rendering.
Vite — Development server and build tool.
Additional three.js utilities:
GLTFLoader for loading 3D models.
RGBELoader for HDR environment textures.
OrbitControls for interactive camera controls.

Development
Prerequisites

Node.js (v14 or newer)
A modern web browser (e.g., Chrome or Firefox)
Scripts

Run locally: npm run dev
Build for production: npm run build
Preview production build: npm run preview
Known Issues

Ensure the browser supports WebGL; older devices may not display the scene.

Acknowledgments

three.js Documentation: https://threejs.org/docs/
IKEA brand for inspiring the 3D models.