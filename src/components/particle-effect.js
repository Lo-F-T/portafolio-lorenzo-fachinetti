const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 80;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
const particleContainer = document.getElementById('particle-container');
particleContainer.appendChild(renderer.domElement);

// malla inicial
const gridX = 120;
const gridY = 80;
const particleCount = gridX * gridY;
const spacing = 1.5;

let currentCategory = 'TODOS';
const positions = new Float32Array(particleCount * 3);
const originalPositions = new Float32Array(particleCount * 3);
const targetPositions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
const mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };

//geometrias

function getShape(category, index) {
  const x = index % gridX;
  const y = Math.floor(index / gridX);
  const nX = x / gridX;
  const nY = y / gridY;

  const angle45 = Math.PI / 4; 
  const cos45 = Math.cos(angle45);
  const sin45 = Math.sin(angle45);

  switch (category) {
    case 'ARQUITECTURA':
      return {
        x: (nX - 0.5) * 80,
        y: (Math.sin(nX * 10) * 5 + Math.cos(nY * 8) * 5) - 10,
        z: (nY - 0.5) * 80
      };

    case 'DISEÑO': {
      const mainR = 23, tubeR = 10;
      const u = nX * Math.PI * 2, v = nY * Math.PI * 2;
      const rawX = (mainR + tubeR * Math.cos(v)) * Math.cos(u);
      const rawY = (mainR + tubeR * Math.cos(v)) * Math.sin(u);
      const rawZ = tubeR * Math.sin(v);

      const angle = Math.PI / 4;
      return {
        x: rawX,
        y: rawY * Math.cos(angle) - rawZ * Math.sin(angle),
        z: rawY * Math.sin(angle) + rawZ * Math.cos(angle)
      };
    }

    case 'DESARROLLO': { 
      const rad = 20;
      const phi = nY * Math.PI;
      const theta = nX * Math.PI * 2;

      let tx = rad * Math.sin(phi) * Math.cos(theta);
      let ty = rad * Math.cos(phi); 
      let tz = rad * Math.sin(phi) * Math.sin(theta);

      const angle = Math.PI / 4;
    
      return {
        x: tx * Math.cos(angle) - ty * Math.sin(angle),
        y: tx * Math.sin(angle) + ty * Math.cos(angle),
        z: tz
      };
    }

    default:
      const height = (nY - 0.5) * 100;
      const spiralTurns = 4;
      const sAngle = nY * Math.PI * 1 * spiralTurns + nX * Math.PI * 2;
      const sRad = 15 + Math.sin(nY * Math.PI * 3) * 5;
      const spiralX = Math.cos(sAngle) * sRad * (nX - 0.8) * 2;
      const spiralZ = Math.sin(sAngle) * sRad * (nX - 0.8) * 2;
      const w1 = Math.sin(nY * Math.PI * 8 + nX * 6) * 3;
      const w2 = Math.cos(nY * Math.PI * 6 + sAngle * 2) * 2;
      const w3 = Math.sin(sAngle * 3) * Math.cos(nY * Math.PI * 4) * 2.5;
      const wr1 = Math.sin(nY * Math.PI * 15 + nX * 20) * 1;
      const wr2 = Math.cos(sAngle * 8) * 0.8;
      const torsion = Math.sin(nY * Math.PI * 2) * 3;
      const widthVar = 0.7 + Math.sin(nY * Math.PI * 2) * 0.3;
      const fold1 = Math.sin(nY * Math.PI * 3) * 4;
      const fold2 = Math.cos(nY * Math.PI * 5 + nX * Math.PI) * 3;

      return {
        x: spiralX * widthVar + w1 + fold1 + torsion * nX,
        y: height,
        z: spiralZ * widthVar + w2 + w3 + wr1 + wr2 + fold2
      };
  }
}

function updateTargetPositions() {
  for (let i = 0; i < particleCount; i++) {
    const pos = getShape(currentCategory, i);
    targetPositions[i * 3] = pos.x;
    targetPositions[i * 3 + 1] = pos.y;
    targetPositions[i * 3 + 2] = pos.z;
  }
}

updateTargetPositions();
for (let i = 0; i < positions.length; i++) {
  originalPositions[i] = targetPositions[i];
  positions[i] = targetPositions[i];
}

// three
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const sizes = new Float32Array(particleCount).fill(0.5);
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Vector3(0.8, 0.8, 0.8) } },
  vertexShader: `attribute float size; void main() { vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * (300.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition; }`,
  fragmentShader: `uniform vec3 uColor; void main() { float dist = length(gl_PointCoord - vec2(0.5)); if (dist > 0.5) discard; gl_FragColor = vec4(uColor, (1.0 - (dist * 2.0)) * 0.7); }`,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

const lineIndices = [];
for (let y = 0; y < gridY; y++) {
  for (let x = 0; x < gridX; x++) {
    const curr = y * gridX + x;
    if (x < gridX - 1) lineIndices.push(curr, curr + 1);
    if (y < gridY - 1) lineIndices.push(curr, curr + gridX);
  }
}
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
lineGeometry.setIndex(lineIndices);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

//edicion con css
function updateColorsFromCSS() {
  const root = getComputedStyle(document.documentElement);
  const pCol = root.getPropertyValue('--particle-color').trim();
  const lCol = root.getPropertyValue('--line-color').trim();
  if (pCol) { const c = new THREE.Color(pCol); material.uniforms.uColor.value.set(c.r, c.g, c.b); }
  if (lCol) lineMaterial.color.set(lCol);
}
setTimeout(updateColorsFromCSS, 100);

document.addEventListener('categoryChanged', (e) => {
  currentCategory = e.detail.category;
  updateTargetPositions();
});

// Función para actualizar la posición del mouse (compartida por mouse y touch)
function updateMousePosition(clientX, clientY) {
  mouse.prevX = mouse.x;
  mouse.prevY = mouse.y;
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
}

// Eventos de mouse (desktop)
window.addEventListener('mousemove', (e) => {
  updateMousePosition(e.clientX, e.clientY);
});

// Eventos táctiles (móvil y tablets) - capturados en el documento completo
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

document.addEventListener('touchend', () => {
  // Las partículas seguirán moviéndose con el último impulso
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; 
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// animacion
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.008;

  const positionsArr = particles.geometry.attributes.position.array;
  const sizesArr = particles.geometry.attributes.size.array;
  const mVelX = (mouse.x - mouse.prevX) * 50;
  const mVelY = (mouse.y - mouse.prevY) * 50;
  const mX = mouse.x * 80, mY = mouse.y * 60;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    const lerpSpeed = 0.15; 
    originalPositions[i3] += (targetPositions[i3] - originalPositions[i3]) * lerpSpeed;
    originalPositions[i3+1] += (targetPositions[i3+1] - originalPositions[i3+1]) * lerpSpeed;
    originalPositions[i3+2] += (targetPositions[i3+2] - originalPositions[i3+2]) * lerpSpeed;

    const oX = originalPositions[i3];
    const oY = originalPositions[i3 + 1];
    const oZ = originalPositions[i3 + 2];

    // fisica general
    const spiralRotation = time * 0.3;
    const floatX = Math.sin(time * 0.5 + oY * 0.05 + oX * 0.03) * 0.8;
    const floatY = Math.cos(time * 0.6 + oX * 0.05 + oY * 0.04) * 0.6;
    const floatZ = Math.sin(time * 0.4 + oX * 0.04) * 1.2;
    
    const rotatedX = oX * Math.cos(spiralRotation) - oZ * Math.sin(spiralRotation);
    const rotatedZ = oX * Math.sin(spiralRotation) + oZ * Math.cos(spiralRotation);
    
    const spiralWave = Math.sin(time + oY * 0.1) * 2;
    const finalRotatedX = rotatedX + spiralWave * Math.cos(spiralRotation);
    const finalRotatedZ = rotatedZ + spiralWave * Math.sin(spiralRotation);

    const dx = positionsArr[i3] - mX;
    const dy = positionsArr[i3 + 1] - mY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 26) {
      const influence = 1 - (distance / 26);
      const windForce = influence * influence * 0.8;
      velocities[i3] += mVelX * windForce * 0.3 + (dx / distance) * windForce * 2;
      velocities[i3+1] += mVelY * windForce * 0.3 + (dy / distance) * windForce * 2;
      velocities[i3+2] += Math.sin(time * 2) * windForce * 1.5;
    }

    positionsArr[i3] += velocities[i3];
    positionsArr[i3 + 1] += velocities[i3 + 1];
    positionsArr[i3 + 2] += velocities[i3 + 2];
    velocities[i3] *= 0.88; velocities[i3 + 1] *= 0.88; velocities[i3 + 2] *= 0.88;

    const returnForce = 0.09;
    positionsArr[i3] += (finalRotatedX + floatX - positionsArr[i3]) * returnForce;
    positionsArr[i3 + 1] += (oY + floatY - positionsArr[i3 + 1]) * returnForce;
    positionsArr[i3 + 2] += (finalRotatedZ + floatZ - positionsArr[i3 + 2]) * returnForce;

    // elasticidad
    const distToOrig = Math.sqrt(Math.pow(positionsArr[i3] - finalRotatedX, 2) + Math.pow(positionsArr[i3+1] - oY, 2));
    sizesArr[i] = 0.8 - (Math.min(distToOrig / 15, 1) * 0.9);

    const neighbors = [i - 1, i + 1, i - gridX, i + gridX];
    for (const n of neighbors) {
      if (n >= 0 && n < particleCount) {
        const n3 = n * 3;
        const ndx = positionsArr[n3] - positionsArr[i3], ndy = positionsArr[n3+1] - positionsArr[i3+1], ndz = positionsArr[n3+2] - positionsArr[i3+2];
        const ndist = Math.sqrt(ndx * ndx + ndy * ndy + ndz * ndz);
        if (ndist > spacing * 1.5) {
          velocities[i3] += ndx * 0.008; velocities[i3+1] += ndy * 0.008; velocities[i3+2] += ndz * 0.008;
        }
      }
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.size.needsUpdate = true;
  lines.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = Math.sin(time * 0.1) * 0.05;
  lines.rotation.y = Math.sin(time * 0.1) * 0.05;
  renderer.render(scene, camera);
}

animate();