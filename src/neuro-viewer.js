import * as THREE from 'three';
import { decodeGeometry } from './geometry.js';
import { CATEGORIES, STRUCTURES } from './neuro-data.js';

// Center reference in BodyParts3D cm: spine mid-height Y ~ 115cm, Z ~ 8cm, X = 0.
const NORM_SCALE = 0.01; // cm to meters
const OFFSET_Y = -1.15;  // meters
const OFFSET_Z = -0.08;  // meters

// Create transformation matrix for a mesh into unified normalized world space (in meters)
function computeNormalizationMatrix(sourceFrame) {
  const c0 = sourceFrame.basisColumnsCm[0];
  const c1 = sourceFrame.basisColumnsCm[1];
  const c2 = sourceFrame.basisColumnsCm[2];
  const o = sourceFrame.originCm;

  // BodyParts3D cm matrix
  const matCm = new THREE.Matrix4().set(
    c0[0], c1[0], c2[0], o[0],
    c0[1], c1[1], c2[1], o[1],
    c0[2], c1[2], c2[2], o[2],
    0,     0,     0,     1
  );

  // Scaled & centered matrix in meters
  const scaleAndShift = new THREE.Matrix4().makeTranslation(0, OFFSET_Y, OFFSET_Z)
    .multiply(new THREE.Matrix4().makeScale(NORM_SCALE, NORM_SCALE, NORM_SCALE));

  return scaleAndShift.multiply(matCm);
}

// Custom cyber-medical shader for glowing nervous structures
function createNerveMaterial(colorHex, { isHighlight = false } = {}) {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uGlowStrength;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float rim = 1.0 - abs(dot(normal, viewDir));
      rim = pow(rim, 1.8);

      vec3 lightDir = normalize(vec3(0.3, 0.8, 1.0));
      float diff = max(0.25, dot(normal, lightDir));

      vec3 finalColor = uColor * (diff * 0.75 + rim * uGlowStrength + 0.35);
      gl_FragColor = vec4(finalColor, uOpacity);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: isHighlight ? 1.0 : 0.92 },
      uGlowStrength: { value: isHighlight ? 2.5 : 1.4 },
    },
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
}

// Material for bone structures (supports solid & translucent ghost mode)
function createBoneMaterial(colorHex, { ghost = false } = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.45,
    metalness: 0.1,
    transparent: true,
    opacity: ghost ? 0.32 : 0.88,
    depthWrite: !ghost,
    depthTest: true,
    side: THREE.DoubleSide,
  });
}

// Translucent Fresnel rim outline material for body silhouette background
function createSilhouetteMaterial() {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float rim = 1.0 - abs(dot(normal, viewDir));
      rim = pow(rim, 2.2);

      float alpha = rim * uOpacity * 1.8;
      gl_FragColor = vec4(uColor * 1.3, clamp(alpha, 0.0, 0.85));
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color('#38bdf8') },
      uOpacity: { value: 0.22 },
    },
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
  });
}

export function createNeuroViewer({ container, onProgress, onSelect }) {
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0e17');

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 50.0);
  camera.position.set(0, 0.12, 1.35);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  // Lighting setup
  const ambientLight = new THREE.AmbientLight('#94a3b8', 0.9);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight('#ffffff', 1.8);
  mainLight.position.set(1.5, 3.0, 2.0);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight('#38bdf8', 1.2);
  rimLight.position.set(-2.0, 1.0, -1.5);
  scene.add(rimLight);

  const bottomFill = new THREE.DirectionalLight('#818cf8', 0.6);
  bottomFill.position.set(0, -2.5, 1.0);
  scene.add(bottomFill);

  // Group containing all normalized anatomy
  const root = new THREE.Group();
  scene.add(root);

  // Meshes & structures registries
  const meshesByName = new Map();
  const meshesByStructureId = new Map();
  const structureStates = new Map();
  let ghostBones = false;
  let silhouetteOpacity = 0.22;
  let silhouetteMaterial = null;

  // Orbit & Pan & Zoom interaction state
  let yaw = 0.28;
  let pitch = 0.08;
  let distance = 1.35;
  let targetYaw = yaw;
  let targetPitch = pitch;
  let targetDistance = distance;

  const pivot = new THREE.Vector3(0, 0.08, 0);
  const targetPivot = pivot.clone();

  let isDragging = false;
  let isPanning = false;
  let dragMode = 'orbit'; // 'orbit' or 'pan'
  let previousMousePosition = { x: 0, y: 0 };
  let touchStartDistance = 0;
  let touchStartCenter = { x: 0, y: 0 };

  // Raycaster for picking
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedStructureId = null;
  let highlightMesh = null;

  // Initialize visibility state for all structures
  for (const item of STRUCTURES) {
    structureStates.set(item.id, true);
    meshesByStructureId.set(item.id, []);
  }

  // Camera views preset definitions
  const VIEW_PRESETS = {
    default: { yaw: 0.28, pitch: 0.08, dist: 1.35, pivot: [0, 0.08, 0] },
    front: { yaw: 0, pitch: 0, dist: 1.35, pivot: [0, 0.08, 0] },
    back: { yaw: Math.PI, pitch: 0, dist: 1.35, pivot: [0, 0.08, 0] },
    left: { yaw: -Math.PI / 2, pitch: 0, dist: 1.35, pivot: [0, 0.08, 0] },
    right: { yaw: Math.PI / 2, pitch: 0, dist: 1.35, pivot: [0, 0.08, 0] },
    top: { yaw: 0, pitch: Math.PI / 2.2, dist: 1.45, pivot: [0, 0.08, 0] },
    head: { yaw: 0.3, pitch: 0.05, dist: 0.65, pivot: [0, 0.38, 0.02] },
    spine: { yaw: Math.PI * 0.95, pitch: 0.05, dist: 0.95, pivot: [0, 0.08, -0.02] },
    full: { yaw: 0.25, pitch: 0.05, dist: 2.2, pivot: [0, -0.35, 0] },
  };

  // Asynchronous Asset Loading & Normalization
  async function loadAnatomy() {
    onProgress?.({ percent: 10, text: '載入解剖模型中...' });

    const base = import.meta.env.BASE_URL || '/';
    const assetUrl = path => `${base}${path.startsWith('/') ? path.slice(1) : path}`;

    try {
      const [
        headMeta, headBuf,
        nervesMeta, nervesBuf,
        periMeta, periBuf,
        bodyMeta, bodyBuf,
        musclesMeta, musclesBuf,
      ] = await Promise.all([
        fetch(assetUrl('anatomy/head.json')).then(r => r.json()),
        fetch(assetUrl('anatomy/head.bin')).then(r => r.arrayBuffer()),
        fetch(assetUrl('anatomy/nerves.json')).then(r => r.json()),
        fetch(assetUrl('anatomy/nerves.bin')).then(r => r.arrayBuffer()),
        fetch(assetUrl('anatomy/peripheral.json')).then(r => r.json()),
        fetch(assetUrl('anatomy/peripheral.bin')).then(r => r.arrayBuffer()),
        fetch(assetUrl('anatomy/body.json')).then(r => r.json()),
        fetch(assetUrl('anatomy/body.bin')).then(r => r.arrayBuffer()),
        fetch(assetUrl('anatomy/muscles.json')).then(r => r.json()),
        fetch(assetUrl('anatomy/muscles.bin')).then(r => r.arrayBuffer()),
      ]);

      onProgress?.({ percent: 55, text: '解析 3D 幾何結構...' });

      // Decode raw geometries
      const headGeos = decodeGeometry(headMeta, headBuf);
      const nervesGeos = decodeGeometry(nervesMeta, nervesBuf);
      const periGeos = decodeGeometry(periMeta, periBuf);
      const bodyGeos = decodeGeometry(bodyMeta, bodyBuf);
      const musclesGeos = decodeGeometry(musclesMeta, musclesBuf);

      // The head canonical-space transform matrix
      const headSourceFrame = periMeta.meshes.find(m => m.name === 'pn_head_L').sourceFrame;
      const headMatrix = computeNormalizationMatrix(headSourceFrame);

      silhouetteMaterial = createSilhouetteMaterial();

      // Helper to instantiate and add a mesh
      function addStructureMesh(item, meshName, geo, sf) {
        if (!geo) return;
        const normMatrix = sf ? computeNormalizationMatrix(sf) : headMatrix;
        geo.applyMatrix4(normMatrix);
        geo.computeVertexNormals();
        geo.computeBoundingBox();
        geo.computeBoundingSphere();

        let mat;
        if (item.category === 'skeleton' || item.category === 'skull') {
          mat = createBoneMaterial(item.color, { ghost: ghostBones });
        } else if (item.category === 'silhouette') {
          mat = silhouetteMaterial;
        } else {
          mat = createNerveMaterial(item.color);
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = {
          structureId: item.id,
          category: item.category,
          nameZh: item.nameZh,
          nameEn: item.nameEn,
          meshName,
        };

        root.add(mesh);
        meshesByName.set(meshName, mesh);
        meshesByStructureId.get(item.id).push(mesh);
      }

      onProgress?.({ percent: 75, text: '建立中樞與周邊神經系統...' });

      // Build registered structures
      for (const item of STRUCTURES) {
        for (const mName of item.meshes) {
          if (item.bundle === 'head') {
            addStructureMesh(item, mName, headGeos[mName], null);
          } else if (item.bundle === 'nerves') {
            const entry = nervesMeta.meshes.find(m => m.name === mName);
            const sf = entry?.frame === 'head' ? null : entry?.sourceFrame;
            addStructureMesh(item, mName, nervesGeos[mName], sf);
          } else if (item.bundle === 'peripheral') {
            const entry = periMeta.meshes.find(m => m.name === mName);
            const sf = entry?.frame === 'head' ? null : entry?.sourceFrame;
            addStructureMesh(item, mName, periGeos[mName], sf);
          } else if (item.bundle === 'body') {
            const entry = bodyMeta.meshes.find(m => m.name === mName);
            addStructureMesh(item, mName, bodyGeos[mName], entry?.sourceFrame);
          }
        }
      }

      // Add full-body muscle envelope into the silhouette group to form the complete body contour
      const silhouetteItem = STRUCTURES.find(s => s.id === 'silhouetteMesh');
      const bodySilhouetteMuscles = [
        'muscle_neck_L', 'muscle_neck_R',
        'muscle_chest_L', 'muscle_chest_R',
        'muscle_back_L', 'muscle_back_R',
        'muscle_abdomen_L', 'muscle_abdomen_R',
        'muscle_thigh_L', 'muscle_thigh_R',
        'muscle_shin_L', 'muscle_shin_R',
      ];

      for (const mName of bodySilhouetteMuscles) {
        const geo = musclesGeos[mName];
        const entry = musclesMeta.meshes.find(m => m.name === mName);
        if (geo && entry?.sourceFrame) {
          addStructureMesh(silhouetteItem, mName, geo, entry.sourceFrame);
        }
      }

      onProgress?.({ percent: 100, text: '準備完成' });
    } catch (err) {
      console.error('Anatomy loading failed:', err);
      onProgress?.({ percent: 100, text: '載入失敗，請重新整理', error: err });
    }
  }

  // Update camera position from spherical yaw/pitch/distance around pivot
  function updateCamera() {
    const pitchClamped = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, targetPitch));
    targetPitch = pitchClamped;

    // Smooth damping
    yaw += (targetYaw - yaw) * 0.12;
    pitch += (targetPitch - pitch) * 0.12;
    distance += (targetDistance - distance) * 0.12;
    pivot.lerp(targetPivot, 0.12);

    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);

    camera.position.set(
      pivot.x + distance * cp * sy,
      pivot.y + distance * sp,
      pivot.z + distance * cp * cy
    );
    camera.lookAt(pivot);
  }

  // Mouse & Touch Interaction Listeners
  function onPointerDown(e) {
    if (e.target !== renderer.domElement) return;
    isDragging = true;
    isPanning = e.button === 2 || e.shiftKey || dragMode === 'pan';
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    previousMousePosition = { x: e.clientX, y: e.clientY };

    if (isPanning) {
      // Pan camera in view plane
      const panSpeed = distance * 0.0016;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      camera.matrix.extractBasis(right, up, new THREE.Vector3());

      targetPivot.addScaledVector(right, -deltaX * panSpeed);
      targetPivot.addScaledVector(up, deltaY * panSpeed);
    } else {
      // Orbit
      const orbitSpeed = 0.0065;
      targetYaw -= deltaX * orbitSpeed;
      targetPitch += deltaY * orbitSpeed;
    }
  }

  function onPointerUp(e) {
    if (isDragging && Math.abs(e.clientX - previousMousePosition.x) < 3 && Math.abs(e.clientY - previousMousePosition.y) < 3) {
      // It was a click / tap! Perform raycasting
      pickAt(e.clientX, e.clientY);
    }
    isDragging = false;
  }

  function onWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    targetDistance = Math.max(0.25, Math.min(3.8, targetDistance * (1 + e.deltaY * zoomSpeed)));
  }

  // Touch handlers
  function onTouchStart(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      isPanning = dragMode === 'pan';
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistance = Math.hypot(dx, dy);
      touchStartCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      if (isPanning) {
        const panSpeed = distance * 0.0018;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        camera.matrix.extractBasis(right, up, new THREE.Vector3());
        targetPivot.addScaledVector(right, -deltaX * panSpeed);
        targetPivot.addScaledVector(up, deltaY * panSpeed);
      } else {
        targetYaw -= deltaX * 0.0075;
        targetPitch += deltaY * 0.0075;
      }
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      if (touchStartDistance > 0) {
        const factor = touchStartDistance / currentDist;
        targetDistance = Math.max(0.25, Math.min(3.8, targetDistance * factor));
        touchStartDistance = currentDist;
      }

      const currentCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      const deltaCenterX = currentCenter.x - touchStartCenter.x;
      const deltaCenterY = currentCenter.y - touchStartCenter.y;
      touchStartCenter = currentCenter;

      const panSpeed = distance * 0.0018;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      camera.matrix.extractBasis(right, up, new THREE.Vector3());
      targetPivot.addScaledVector(right, -deltaCenterX * panSpeed);
      targetPivot.addScaledVector(up, deltaCenterY * panSpeed);
    }
  }

  function onTouchEnd(e) {
    if (e.touches.length === 0) {
      isDragging = false;
      touchStartDistance = 0;
    }
  }

  // Picking & Selection
  function pickAt(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Pick among visible anatomical meshes (skip silhouette so user picks organs/bones)
    const candidates = [];
    for (const mesh of meshesByName.values()) {
      if (mesh.visible && mesh.userData?.category !== 'silhouette') {
        candidates.push(mesh);
      }
    }

    const intersects = raycaster.intersectObjects(candidates, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const structId = hit.userData.structureId;
      selectStructure(structId);
    } else {
      selectStructure(null);
    }
  }

  function selectStructure(structId) {
    selectedStructureId = structId;
    if (highlightMesh) {
      highlightMesh.removeFromParent();
      highlightMesh.geometry.dispose();
      highlightMesh.material.dispose();
      highlightMesh = null;
    }

    if (!structId) {
      onSelect?.(null);
      return;
    }

    const structure = STRUCTURES.find(s => s.id === structId);
    const meshes = meshesByStructureId.get(structId) || [];

    if (structure && meshes.length > 0) {
      // Build glowing highlight overlay on the foremost mesh
      const primaryMesh = meshes[0];
      const hlGeo = primaryMesh.geometry.clone();
      const hlMat = createNerveMaterial('#ffffff', { isHighlight: true });
      hlMat.uniforms.uColor.value.set('#38bdf8');
      hlMat.uniforms.uOpacity.value = 1.0;
      hlMat.uniforms.uGlowStrength.value = 3.0;

      highlightMesh = new THREE.Mesh(hlGeo, hlMat);
      highlightMesh.renderOrder = 999;
      root.add(highlightMesh);

      onSelect?.(structure);
    } else {
      onSelect?.(null);
    }
  }

  // Bind Event Listeners
  const el = renderer.domElement;
  el.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());

  el.addEventListener('touchstart', onTouchStart, { passive: false });
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  el.addEventListener('touchend', onTouchEnd);

  function onResize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  // Render loop
  let animationFrameId = 0;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    updateCamera();

    // Subtle breathing pulse on highlight
    if (highlightMesh) {
      const t = performance.now() * 0.004;
      const pulse = 2.0 + Math.sin(t) * 1.0;
      highlightMesh.material.uniforms.uGlowStrength.value = pulse;
    }

    renderer.render(scene, camera);
  }
  animate();

  // Load models on startup
  void loadAnatomy();

  // Public Viewer API
  return {
    // Visibility
    toggleStructure(id, visible) {
      structureStates.set(id, visible);
      const meshes = meshesByStructureId.get(id) || [];
      for (const m of meshes) m.visible = visible;
      if (selectedStructureId === id && !visible) selectStructure(null);
    },

    toggleCategory(catId, visible) {
      for (const item of STRUCTURES) {
        if (item.category === catId) {
          this.toggleStructure(item.id, visible);
        }
      }
    },

    isStructureVisible(id) {
      return structureStates.get(id) !== false;
    },

    // Ghost Bones mode (semi-transparent skeleton so cord & nerves shine through)
    setGhostBones(ghost) {
      ghostBones = !!ghost;
      for (const item of STRUCTURES) {
        if (item.category === 'skeleton' || item.category === 'skull') {
          const meshes = meshesByStructureId.get(item.id) || [];
          for (const m of meshes) {
            m.material.opacity = ghostBones ? 0.32 : 0.88;
            m.material.depthWrite = !ghostBones;
            m.material.needsUpdate = true;
          }
        }
      }
    },

    getGhostBones() {
      return ghostBones;
    },

    // Silhouette opacity
    setSilhouetteOpacity(val) {
      silhouetteOpacity = Math.max(0, Math.min(1, val));
      if (silhouetteMaterial) {
        silhouetteMaterial.uniforms.uOpacity.value = silhouetteOpacity;
      }
    },

    getSilhouetteOpacity() {
      return silhouetteOpacity;
    },

    // Presets
    applyPreset(name) {
      if (name === 'all') {
        for (const item of STRUCTURES) this.toggleStructure(item.id, true);
        this.setGhostBones(false);
      } else if (name === 'nervesOnly') {
        for (const item of STRUCTURES) {
          const isNerve = ['brain', 'cranialNerves', 'spinalCord', 'peripheralNerves'].includes(item.category);
          this.toggleStructure(item.id, isNerve);
        }
        this.toggleStructure('silhouetteMesh', true);
      } else if (name === 'nervesAndSpine') {
        for (const item of STRUCTURES) {
          const isNerveOrSpine = ['brain', 'cranialNerves', 'spinalCord', 'peripheralNerves', 'skull'].includes(item.category)
            || item.id === 'cervicalSpine' || item.id === 'torsoSkeleton';
          this.toggleStructure(item.id, isNerveOrSpine);
        }
        this.toggleStructure('limbBones', false);
        this.toggleStructure('silhouetteMesh', true);
        this.setGhostBones(true);
      } else if (name === 'nervesAndSkeleton') {
        for (const item of STRUCTURES) this.toggleStructure(item.id, true);
        this.setGhostBones(true);
      }
    },

    // View Angle Camera Presets
    setView(viewKey) {
      const p = VIEW_PRESETS[viewKey] || VIEW_PRESETS.default;
      targetYaw = p.yaw;
      targetPitch = p.pitch;
      targetDistance = p.dist;
      targetPivot.set(p.pivot[0], p.pivot[1], p.pivot[2]);
    },

    // Zoom buttons
    zoomIn() {
      targetDistance = Math.max(0.25, targetDistance * 0.78);
    },
    zoomOut() {
      targetDistance = Math.min(3.8, targetDistance * 1.25);
    },

    // Interaction drag mode
    setDragMode(mode) {
      dragMode = mode === 'pan' ? 'pan' : 'orbit';
    },
    getDragMode() {
      return dragMode;
    },

    // Select structure programmatically
    selectStructure,

    // Cleanup
    dispose() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      container.innerHTML = '';
    },
  };
}
