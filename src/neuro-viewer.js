import * as THREE from 'three';
import { decodeGeometry } from './geometry.js';
import { STRUCTURES } from './neuro-data.js';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  buildBrainRegions,
  buildTorsoSkeletonParts,
  alignCervicalCordToMedulla,
  buildCranialNerves,
  buildSpinalNerveRoots,
  buildHandBonesAndNerves,
} from './neuro-builder.js';

// Opaque, realistic medical textbook material for brain regions and spinal cord
function createTextbookTissueMaterial(colorHex, { isCord = false } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: isCord ? 0.42 : 0.48,
    metalness: 0.02,
    clearcoat: 0.16,
    clearcoatRoughness: 0.38,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
  });
}

// Opaque, crisp medical textbook yellow material for cranial and spinal peripheral nerves
function createTextbookNerveMaterial(colorHex) {
  const c = new THREE.Color(colorHex);
  return new THREE.MeshStandardMaterial({
    color: c,
    emissive: c,
    emissiveIntensity: 0.16,
    roughness: 0.36,
    metalness: 0.05,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
  });
}

// Highlight material for selected structure
function createHighlightMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38bdf8'),
    emissive: new THREE.Color('#0284c7'),
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// Material for bone structures (supports solid osteological ivory & translucent ghost mode)
function createBoneMaterial(colorHex, { ghost = false } = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.52,
    metalness: 0.06,
    transparent: ghost,
    opacity: ghost ? 0.32 : 1.0,
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

export function createNeuroViewer({ container, lang = 'zh-Hant', onProgress, onSelect }) {
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0e17');

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.02, 50.0);
  camera.position.set(0, 0.12, 1.52);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  container.appendChild(renderer.domElement);

  // Overlay layer for 3D Functional Brain Area Pin Labels + SVG Callout Lines
  const pinsLayer = document.createElement('div');
  pinsLayer.className = 'brain-pins-layer';
  const pinsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  pinsSvg.setAttribute('class', 'brain-pins-svg');
  pinsLayer.appendChild(pinsSvg);
  container.appendChild(pinsLayer);

  // Balanced medical illustration studio lighting
  const hemiLight = new THREE.HemisphereLight('#f8fafc', '#1e293b', 0.95);
  scene.add(hemiLight);

  const mainLight = new THREE.DirectionalLight('#fffaf0', 1.55);
  mainLight.position.set(1.8, 2.6, 2.4);
  scene.add(mainLight);

  const backLight = new THREE.DirectionalLight('#e2e8f0', 1.15);
  backLight.position.set(-1.6, 1.5, -2.2);
  scene.add(backLight);

  const bottomFill = new THREE.DirectionalLight('#94a3b8', 0.55);
  bottomFill.position.set(0, -2.5, 1.2);
  scene.add(bottomFill);

  // Group containing all normalized anatomy
  const root = new THREE.Group();
  scene.add(root);

  // Meshes & structures registries
  const meshesByName = new Map();
  const meshesByStructureId = new Map();
  const structureStates = new Map();
  const pinElements = [];

  let ghostBones = true;
  let silhouetteOpacity = 0.22;
  let silhouetteMaterial = null;
  let brainHemisphere = 'both'; // 'both' | 'L' | 'R'
  let functionalColors = true;
  let showBrainPins = true;

  // Orbit & Pan & Zoom interaction state
  let yaw = 0.28;
  let pitch = 0.06;
  let distance = 1.52;
  let targetYaw = yaw;
  let targetPitch = pitch;
  let targetDistance = distance;

  const pivot = new THREE.Vector3(0, -0.02, 0);
  const targetPivot = pivot.clone();

  let isDragging = false;
  let isPanning = false;
  let dragMode = 'orbit'; // 'orbit' or 'pan'
  let previousMousePosition = { x: 0, y: 0 };
  let pointerDownPos = { x: 0, y: 0 };
  let touchStartDistance = 0;
  let touchStartCenter = { x: 0, y: 0 };

  // Raycaster for picking
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedStructureId = null;
  let highlightGroup = null;

  // Initialize visibility state for all structures
  for (const item of STRUCTURES) {
    structureStates.set(item.id, true);
    meshesByStructureId.set(item.id, []);
  }

  // Create 3D Pin DOM elements & SVG leader lines for functional brain areas
  for (const item of STRUCTURES) {
    if (!item.anchorL || !item.pinZh) continue;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'pin-leader-line');
    line.setAttribute('stroke', item.color);
    pinsSvg.appendChild(line);

    const anchorCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    anchorCircle.setAttribute('class', 'pin-anchor-dot');
    anchorCircle.setAttribute('r', '3.5');
    anchorCircle.setAttribute('fill', item.color);
    pinsSvg.appendChild(anchorCircle);

    const pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.className = 'brain-pin';
    pinBtn.setAttribute('data-pin-id', item.id);

    const dot = document.createElement('span');
    dot.className = 'pin-dot';
    dot.style.backgroundColor = item.color;

    const text = document.createElement('span');
    text.className = 'pin-text';
    text.textContent = lang === 'en' ? item.pinEn : item.pinZh;

    pinBtn.appendChild(dot);
    pinBtn.appendChild(text);
    pinBtn.addEventListener('click', e => {
      e.stopPropagation();
      selectStructure(item.id);
    });
    pinsLayer.appendChild(pinBtn);
    pinElements.push({ item, el: pinBtn, dot, line, anchorCircle, vec: new THREE.Vector3() });
  }

  // Camera views preset definitions
  const VIEW_PRESETS = {
    default: { yaw: 0.28, pitch: 0.06, dist: 1.52, pivot: [0, -0.02, 0] },
    front: { yaw: 0, pitch: 0, dist: 1.52, pivot: [0, -0.02, 0] },
    back: { yaw: Math.PI, pitch: 0, dist: 1.52, pivot: [0, -0.02, 0] },
    left: { yaw: -Math.PI / 2, pitch: 0, dist: 1.52, pivot: [0, -0.02, 0] },
    right: { yaw: Math.PI / 2, pitch: 0, dist: 1.52, pivot: [0, -0.02, 0] },
    top: { yaw: 0, pitch: Math.PI / 2.2, dist: 1.45, pivot: [0, 0.08, 0] },
    head: { yaw: 0.78, pitch: 0.10, dist: 0.44, pivot: [0, 0.41, 0.0] },
    spine: { yaw: Math.PI * 0.88, pitch: 0.04, dist: 0.96, pivot: [0, 0.04, -0.02] },
    full: { yaw: 0.25, pitch: 0.05, dist: 2.2, pivot: [0, -0.35, 0] },
  };

  function isBoneCategory(cat) {
    return cat === 'skeleton' || cat === 'skull' || cat === 'spine';
  }

  function syncMeshVisibility(id) {
    const enabled = structureStates.get(id) !== false;
    const meshes = meshesByStructureId.get(id) || [];
    for (const m of meshes) {
      const mName = m.userData?.meshName || '';
      let hemiAllowed = true;
      if (m.userData?.category === 'brain' && brainHemisphere !== 'both') {
        if (mName.endsWith('_L') && brainHemisphere !== 'L') hemiAllowed = false;
        if (mName.endsWith('_R') && brainHemisphere !== 'R') hemiAllowed = false;
      }
      m.visible = enabled && hemiAllowed;
    }
  }

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

      onProgress?.({ percent: 50, text: '解析 3D 幾何結構...' });

      const headGeos = decodeGeometry(headMeta, headBuf);
      const nervesGeos = decodeGeometry(nervesMeta, nervesBuf);
      const periGeos = decodeGeometry(periMeta, periBuf);
      const bodyGeos = decodeGeometry(bodyMeta, bodyBuf);
      const musclesGeos = decodeGeometry(musclesMeta, musclesBuf);

      const cmToViewer = makeCmToViewerMatrix();
      const headSourceFrame = periMeta.meshes.find(m => m.name === 'pn_head_L').sourceFrame;
      const headCmMatrix = makeCmMatrix(headSourceFrame);
      const fullHeadMatrix = cmToViewer.clone().multiply(headCmMatrix);

      silhouetteMaterial = createSilhouetteMaterial();

      onProgress?.({ percent: 70, text: '建立中樞與周邊神經系統...' });

      // 1. Build split brain functional areas × L/R hemispheres + cerebellum L/R + pons + medulla
      const brainRegionGeos = buildBrainRegions(headGeos, headCmMatrix, cmToViewer);

      // 2. Split torso_skel into separate Thoracic Spine, Lumbar Spine, Sacrum, Ribcage/Sternum, Shoulder Girdle, and Pelvis
      const torsoEntry = bodyMeta.meshes.find(m => m.name === 'torso_skel');
      const torsoPartsGeos = buildTorsoSkeletonParts(bodyGeos.torso_skel, torsoEntry.sourceFrame, cmToViewer);

      // 3. Align upper cervical spinal cord (cord_cervical) coaxially with the medulla oblongata
      const headHindbrainCm = headGeos.hindbrain.clone().applyMatrix4(headCmMatrix);
      const cordCervSf = nervesMeta.meshes.find(m => m.name === 'cord_cervical').sourceFrame;
      const cordCervCm = alignCervicalCordToMedulla(nervesGeos.cord_cervical, cordCervSf, headHindbrainCm);
      const cordThorCm = nervesGeos.cord_thoracic.clone().applyMatrix4(
        makeCmMatrix(nervesMeta.meshes.find(m => m.name === 'cord_thoracic').sourceFrame)
      );
      const cordLumbCm = nervesGeos.cord_lumbar.clone().applyMatrix4(
        makeCmMatrix(nervesMeta.meshes.find(m => m.name === 'cord_lumbar').sourceFrame)
      );
      const cordSacrCm = nervesGeos.cord_sacral.clone().applyMatrix4(
        makeCmMatrix(nervesMeta.meshes.find(m => m.name === 'cord_sacral').sourceFrame)
      );

      const alignedCordGeos = {
        cord_cervical: cordCervCm.clone().applyMatrix4(cmToViewer),
        cord_thoracic: cordThorCm.clone().applyMatrix4(cmToViewer),
        cord_lumbar: cordLumbCm.clone().applyMatrix4(cmToViewer),
        cord_sacral: cordSacrCm.clone().applyMatrix4(cmToViewer),
      };
      for (const g of Object.values(alignedCordGeos)) {
        g.computeVertexNormals();
        g.computeBoundingBox();
        g.computeBoundingSphere();
      }

      // 4. Build all 12 pairs of Cranial Nerves (CN I – CN XII)
      const cranialNerveGeos = buildCranialNerves(periMeta, periGeos, headCmMatrix, cmToViewer);

      // 5. Build Spinal Nerve Roots & Cauda Equina connecting the spinal cord to all spinal nerves
      const spinalRootGeos = buildSpinalNerveRoots(
        [cordCervCm, cordThorCm, cordLumbCm, cordSacrCm],
        periMeta,
        periGeos,
        cmToViewer
      );

      // 6. Build Left and Right Hand Bones and Hand Peripheral Nerves
      const handGeos = buildHandBonesAndNerves(headGeos, periMeta, periGeos, cmToViewer);

      const customViewerGeos = {
        ...brainRegionGeos,
        ...torsoPartsGeos,
        ...cranialNerveGeos,
        ...spinalRootGeos,
        ...handGeos,
      };

      function createMaterialForStructure(item) {
        if (isBoneCategory(item.category)) {
          return createBoneMaterial(item.color, { ghost: ghostBones });
        }
        if (item.category === 'silhouette') {
          return silhouetteMaterial;
        }
        if (item.category === 'brain') {
          const c = functionalColors ? item.color : (item.naturalColor || item.color);
          return createTextbookTissueMaterial(c, { isCord: false });
        }
        if (item.category === 'spinalCord') {
          return createTextbookTissueMaterial(item.color, { isCord: true });
        }
        return createTextbookNerveMaterial(item.color);
      }

      function addStructureMesh(item, meshName, geo, transformMatrix = null) {
        if (!geo) return;
        const finalGeo = transformMatrix ? geo.clone().applyMatrix4(transformMatrix) : geo;
        finalGeo.computeVertexNormals();
        finalGeo.computeBoundingBox();
        finalGeo.computeBoundingSphere();

        const mat = createMaterialForStructure(item);
        const mesh = new THREE.Mesh(finalGeo, mat);
        mesh.renderOrder =
          item.category === 'silhouette'
            ? 3
            : isBoneCategory(item.category)
              ? 2
              : 1;
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

      // Instantiate all structures from STRUCTURES
      for (const item of STRUCTURES) {
        for (const mName of item.meshes) {
          if (customViewerGeos[mName]) {
            addStructureMesh(item, mName, customViewerGeos[mName], null);
          } else if (alignedCordGeos[mName]) {
            addStructureMesh(item, mName, alignedCordGeos[mName], null);
          } else if (item.bundle === 'head') {
            addStructureMesh(item, mName, headGeos[mName], fullHeadMatrix);
          } else if (item.bundle === 'nerves') {
            const entry = nervesMeta.meshes.find(m => m.name === mName);
            const mat = entry?.frame === 'head'
              ? fullHeadMatrix
              : cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, nervesGeos[mName], mat);
          } else if (item.bundle === 'peripheral') {
            const entry = periMeta.meshes.find(m => m.name === mName);
            const mat = entry?.frame === 'head'
              ? fullHeadMatrix
              : cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, periGeos[mName], mat);
          } else if (item.bundle === 'body') {
            const entry = bodyMeta.meshes.find(m => m.name === mName);
            const mat = cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, bodyGeos[mName], mat);
          }
        }
      }

      // Add full-body muscle envelope into the silhouette group
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
          const mat = cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
          addStructureMesh(silhouetteItem, mName, geo, mat);
        }
      }

      onProgress?.({ percent: 100, text: '準備完成' });
    } catch (err) {
      console.error('Anatomy loading failed:', err);
      onProgress?.({ percent: 100, text: '載入失敗，請重新整理', error: err });
    }
  }

  const brainCenterVec = new THREE.Vector3();
  const LEFT_COL_IDS = new Set(['funcPrefrontal', 'funcMotor', 'funcBroca', 'funcTemporalLimbic', 'medulla']);

  function updateCamera() {
    const pitchClamped = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, targetPitch));
    targetPitch = pitchClamped;

    yaw += (targetYaw - yaw) * 0.24;
    pitch += (targetPitch - pitch) * 0.24;
    distance += (targetDistance - distance) * 0.24;
    pivot.lerp(targetPivot, 0.24);

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

  // Update 3D projected positions of functional brain area pins with non-overlapping callout columns
  function updatePins() {
    brainCenterVec.set(0, 0.42, -0.01).project(camera);
    const bcx = (brainCenterVec.x * 0.5 + 0.5) * width;
    const radiusPx = Math.max(72, Math.min(185, 64 / Math.max(0.25, distance)));

    const leftCol = [];
    const rightCol = [];

    for (const p of pinElements) {
      const visible = showBrainPins && structureStates.get(p.item.id) !== false;
      if (!visible) {
        p.el.hidden = true;
        p.line.style.display = 'none';
        p.anchorCircle.style.display = 'none';
        continue;
      }
      const [ax, ay, az] = p.item.anchorL;
      const signX = brainHemisphere === 'R' ? -1 : 1;
      p.vec.set(ax * signX, ay, az);
      p.vec.project(camera);

      if (p.vec.z > 1.0 || p.vec.z < -1.0) {
        p.el.hidden = true;
        p.line.style.display = 'none';
        p.anchorCircle.style.display = 'none';
        continue;
      }

      p.sx = (p.vec.x * 0.5 + 0.5) * width;
      p.sy = (-p.vec.y * 0.5 + 0.5) * height;
      p.ly = p.sy;

      if (LEFT_COL_IDS.has(p.item.id)) {
        leftCol.push(p);
      } else {
        rightCol.push(p);
      }
    }

    const resolveColumn = (col, isLeft) => {
      if (col.length === 0) return;
      col.sort((a, b) => a.sy - b.sy);
      const minGap = 28;
      const avgSy = col.reduce((s, p) => s + p.sy, 0) / col.length;
      const totalSpan = (col.length - 1) * minGap;
      let startY = Math.max(36, Math.min(height - 40 - totalSpan, avgSy - totalSpan * 0.5));
      for (let i = 0; i < col.length; i++) {
        const prevY = i === 0 ? startY : col[i - 1].ly + minGap;
        col[i].ly = Math.max(prevY, Math.min(height - 40 - (col.length - 1 - i) * minGap, col[i].sy));
      }

      const colX = isLeft
        ? Math.max(175, bcx - radiusPx - 16)
        : Math.min(width - 185, bcx + radiusPx + 16);

      for (const p of col) {
        p.el.hidden = false;
        p.el.classList.toggle('selected', selectedStructureId === p.item.id);
        const tx = isLeft ? '-100%' : '0%';
        p.el.style.transform = `translate3d(${colX.toFixed(1)}px, ${p.ly.toFixed(1)}px, 0) translate(${tx}, -50%)`;

        p.line.style.display = '';
        p.line.setAttribute('x1', p.sx.toFixed(1));
        p.line.setAttribute('y1', p.sy.toFixed(1));
        p.line.setAttribute('x2', colX.toFixed(1));
        p.line.setAttribute('y2', p.ly.toFixed(1));

        p.anchorCircle.style.display = '';
        p.anchorCircle.setAttribute('cx', p.sx.toFixed(1));
        p.anchorCircle.setAttribute('cy', p.sy.toFixed(1));
      }
    };

    resolveColumn(leftCol, true);
    resolveColumn(rightCol, false);
  }

  function onPointerDown(e) {
    if (e.target !== renderer.domElement) return;
    isDragging = true;
    isPanning = e.button === 2 || e.shiftKey || dragMode === 'pan';
    previousMousePosition = { x: e.clientX, y: e.clientY };
    pointerDownPos = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    previousMousePosition = { x: e.clientX, y: e.clientY };

    if (isPanning) {
      const panSpeed = distance * 0.0016;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      camera.matrix.extractBasis(right, up, new THREE.Vector3());

      targetPivot.addScaledVector(right, -deltaX * panSpeed);
      targetPivot.addScaledVector(up, deltaY * panSpeed);
    } else {
      const orbitSpeed = 0.0065;
      targetYaw -= deltaX * orbitSpeed;
      targetPitch += deltaY * orbitSpeed;
    }
  }

  function onPointerUp(e) {
    if (
      isDragging &&
      Math.abs(e.clientX - pointerDownPos.x) < 4 &&
      Math.abs(e.clientY - pointerDownPos.y) < 4
    ) {
      pickAt(e.clientX, e.clientY);
    }
    isDragging = false;
  }

  function onWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    targetDistance = Math.max(0.20, Math.min(3.8, targetDistance * (1 + e.deltaY * zoomSpeed)));
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      isPanning = dragMode === 'pan';
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pointerDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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
        targetDistance = Math.max(0.20, Math.min(3.8, targetDistance * factor));
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

  function pickAt(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

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

  function clearHighlight() {
    if (!highlightGroup) return;
    highlightGroup.removeFromParent();
    for (const child of highlightGroup.children) {
      child.geometry.dispose();
      child.material.dispose();
    }
    highlightGroup = null;
  }

  function selectStructure(structId) {
    selectedStructureId = structId;
    clearHighlight();

    if (!structId) {
      onSelect?.(null);
      return;
    }

    const structure = STRUCTURES.find(s => s.id === structId);
    const meshes = (meshesByStructureId.get(structId) || []).filter(m => m.visible);

    if (structure && meshes.length > 0) {
      highlightGroup = new THREE.Group();
      for (const m of meshes) {
        const hlGeo = m.geometry.clone();
        const hlMat = createHighlightMaterial();
        const hlMesh = new THREE.Mesh(hlGeo, hlMat);
        hlMesh.renderOrder = 999;
        highlightGroup.add(hlMesh);
      }
      root.add(highlightGroup);
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

  let animationFrameId = 0;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    updateCamera();
    updatePins();

    if (highlightGroup) {
      const t = performance.now() * 0.005;
      const pulse = 0.65 + Math.sin(t) * 0.35;
      for (const child of highlightGroup.children) {
        child.material.emissiveIntensity = pulse;
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  void loadAnatomy();

  return {
    toggleStructure(id, visible) {
      structureStates.set(id, visible);
      syncMeshVisibility(id);
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

    // Brain Hemisphere filter: 'both' | 'L' | 'R'
    setBrainHemisphere(mode) {
      brainHemisphere = ['both', 'L', 'R'].includes(mode) ? mode : 'both';
      for (const item of STRUCTURES) {
        if (item.category === 'brain') {
          syncMeshVisibility(item.id);
        }
      }
      if (selectedStructureId) {
        selectStructure(selectedStructureId);
      }
    },

    getBrainHemisphere() {
      return brainHemisphere;
    },

    // Toggle functional cortical map coloring vs natural uniform textbook coloring
    setFunctionalColors(enabled) {
      functionalColors = !!enabled;
      for (const item of STRUCTURES) {
        if (item.category === 'brain') {
          const c = functionalColors ? item.color : (item.naturalColor || item.color);
          const meshes = meshesByStructureId.get(item.id) || [];
          for (const m of meshes) {
            m.material.color.set(c);
            m.material.needsUpdate = true;
          }
        }
      }
      for (const p of pinElements) {
        const c = functionalColors ? p.item.color : (p.item.naturalColor || p.item.color);
        p.dot.style.backgroundColor = c;
      }
    },

    getFunctionalColors() {
      return functionalColors;
    },

    // Toggle 3D Floating Functional Brain Area Pins
    setShowBrainPins(visible) {
      showBrainPins = !!visible;
    },

    getShowBrainPins() {
      return showBrainPins;
    },

    setGhostBones(ghost) {
      ghostBones = !!ghost;
      for (const item of STRUCTURES) {
        if (isBoneCategory(item.category)) {
          const meshes = meshesByStructureId.get(item.id) || [];
          for (const m of meshes) {
            m.material.transparent = ghostBones;
            m.material.opacity = ghostBones ? 0.32 : 1.0;
            m.material.depthWrite = !ghostBones;
            m.material.needsUpdate = true;
          }
        }
      }
    },

    getGhostBones() {
      return ghostBones;
    },

    setSilhouetteOpacity(val) {
      silhouetteOpacity = Math.max(0, Math.min(1, val));
      if (silhouetteMaterial) {
        silhouetteMaterial.uniforms.uOpacity.value = silhouetteOpacity;
      }
    },

    getSilhouetteOpacity() {
      return silhouetteOpacity;
    },

    applyPreset(name) {
      if (name === 'all') {
        for (const item of STRUCTURES) this.toggleStructure(item.id, true);
        this.setGhostBones(true);
      } else if (name === 'nervesOnly') {
        for (const item of STRUCTURES) {
          const isNerve = ['brain', 'cranialNerves', 'spinalCord', 'peripheralNerves'].includes(item.category);
          this.toggleStructure(item.id, isNerve);
        }
        this.toggleStructure('silhouetteMesh', true);
      } else if (name === 'nervesAndSpine') {
        // Shows Nervous System + isolated Vertebral Column (Cervical, Thoracic, Lumbar, Sacrum) without ribs/pelvis/limbs!
        for (const item of STRUCTURES) {
          const keep = ['brain', 'cranialNerves', 'spinalCord', 'peripheralNerves', 'spine'].includes(item.category);
          this.toggleStructure(item.id, keep);
        }
        this.toggleStructure('silhouetteMesh', true);
        this.setGhostBones(false);
      } else if (name === 'nervesAndSkeleton') {
        for (const item of STRUCTURES) this.toggleStructure(item.id, true);
        this.setGhostBones(false);
      }
    },

    setView(viewKey) {
      const p = VIEW_PRESETS[viewKey] || VIEW_PRESETS.default;
      targetYaw = p.yaw;
      targetPitch = p.pitch;
      targetDistance = p.dist;
      targetPivot.set(p.pivot[0], p.pivot[1], p.pivot[2]);
    },

    zoomIn() {
      targetDistance = Math.max(0.20, targetDistance * 0.78);
    },
    zoomOut() {
      targetDistance = Math.min(3.8, targetDistance * 1.25);
    },

    setDragMode(mode) {
      dragMode = mode === 'pan' ? 'pan' : 'orbit';
    },
    getDragMode() {
      return dragMode;
    },

    selectStructure,

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
