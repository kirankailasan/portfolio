
let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 300;
let tick = 0;

let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const size = 300; // match your circle size
renderer.setSize(size, size);
camera.aspect = 1;
camera.updateProjectionMatrix();
renderer.setClearColor(0x000000, 0);
const container = document.querySelector('.three-container');
if (container) {
  container.appendChild(renderer.domElement);
} else {
  console.error("Container '.three-container' not found.");
}

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = false;

let positions, originalPositions, geometry, points;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

let bottomIndices = [];
let fallingVelocities = [];

fetch('particle_data.json')
  .then(response => response.json())
  .then(particles => {
    const pos = [];
    const cols = [];

    // Face particles
let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;
let minZ = Infinity, maxZ = -Infinity;

particles.forEach(p => {
  const x = p.x - 100;
  const y = p.y + 100;
  const z = p.z;

  pos.push(x, y, z);
  cols.push(p.g, p.g, p.g);
  fallingVelocities.push(0);

  // Track bounding box
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
});

// Store bounding box globally
window.faceBounds = { minX, maxX, minY, maxY, minZ, maxZ };


    // Add falling bottom particles
    const extraCount = 500;
    for (let i = 0; i < extraCount; i++) {
      const x = Math.random() * 200 - 85;
      const y = Math.random() * 30 - 130;
      const z = Math.random() * 20 - 10;
      const g = Math.random();

      pos.push(x, y, z);
      cols.push(g, g, g);

      fallingVelocities.push(Math.random() * 0.5 + 0.3);
      bottomIndices.push((particles.length + i) * 3); // Store position index
    }

    positions = new Float32Array(pos);
    originalPositions = new Float32Array(pos);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    points = new THREE.Points(geometry, material);
    points.rotation.y = 0.15;
    scene.add(points);

    animate();
  });

function animate() {
  requestAnimationFrame(animate);
  tick++;
  if (geometry) {
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < pos.length; i += 3) {
      const index = i / 3;

      // Face particles return to original
if (fallingVelocities[index] === 0) {
  const x = originalPositions[i];
  const y = originalPositions[i + 1];
  const z = originalPositions[i + 2];

  const margin = 10; // how close to the edge is considered "outer"
  const isOuter =
    x < faceBounds.minX + margin || x > faceBounds.maxX - margin ||
    y < faceBounds.minY + margin || y > faceBounds.maxY - margin ||
    z < faceBounds.minZ + margin || z > faceBounds.maxZ - margin;

  if (isOuter) {
    // Slight movement for outer ones
    const offset = Math.sin((tick + index * 10) * 0.05) * 0.8;
    pos[i] = x + offset;
    pos[i + 1] = y + offset;
    pos[i + 2] = z + offset;
  } else {
    // Smoothly return to original for inner ones
    pos[i] += (x - pos[i]) * 0.02;
    pos[i + 1] += (y - pos[i + 1]) * 0.02;
    pos[i + 2] += (z - pos[i + 2]) * 0.02;
  }
}

    }

    // Animate bottom particles
    for (let idx of bottomIndices) {
      const index = idx / 3;
      pos[idx + 1] -= fallingVelocities[index];

      // Optional sway (snowfall effect)
      pos[idx] += Math.sin(Date.now() * 0.001 + idx) * 0.05;

      if (pos[idx + 1] < -160) {
        pos[idx + 1] = Math.random() * 30 - 130;
        pos[idx] = Math.random() * 200 - 85;
      }
    }

    geometry.attributes.position.needsUpdate = true;

    // Hover effect
    if (mouseMoved) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(points);
      if (intersects.length > 0) {
        const idx = intersects[0].index * 3;
        for (let i = 0; i < positions.length; i += 3) {
          const dx = positions[i] - positions[idx];
          const dy = positions[i + 1] - positions[idx + 1];
          const dz = positions[i + 2] - positions[idx + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 30) {
            positions[i] += dx * 0.2;
            positions[i + 1] += dy * 0.2;
            positions[i + 2] += dz * 0.2;
          }
        }
      }
    }
  }

  renderer.render(scene, camera);
}
let mouseMoved = false;
window.addEventListener('mousemove', (event) => {
  
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  mouseMoved = true;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


