import * as THREE from 'three';
import { decodeGeometry } from './geometry.js';
import { CATEGORIES as NERVOUS_CATEGORIES, STRUCTURES as NERVOUS_STRUCTURES } from './neuro-data.js';
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
import {
  CIRCULATORY_META,
  CIRCULATORY_CATEGORIES,
  CIRCULATORY_STRUCTURES,
  buildCirculatorySystemGeometries,
} from './systems/circulatory.js';
import {
  RESPIRATORY_META,
  RESPIRATORY_CATEGORIES,
  RESPIRATORY_STRUCTURES,
  buildRespiratorySystemGeometries,
} from './systems/respiratory.js';
import {
  URINARY_META,
  URINARY_CATEGORIES,
  URINARY_STRUCTURES,
  buildUrinarySystemGeometries,
} from './systems/urinary.js';
import {
  ENDOCRINE_META,
  ENDOCRINE_CATEGORIES,
  ENDOCRINE_STRUCTURES,
  buildEndocrineSystemGeometries,
} from './systems/endocrine.js';
import {
  DIGESTIVE_META,
  DIGESTIVE_CATEGORIES,
  DIGESTIVE_STRUCTURES,
  buildDigestiveSystemGeometries,
} from './systems/digestive.js';

export const NERVOUS_META = Object.freeze({
  id: 'nervous',
  titleZh: '神經系統 3D 專頁',
  titleEn: '3D Nervous System',
  subtitleZh: '中樞・腦神經・脊髓・周邊神經・骨骼系統',
  subtitleEn: 'Central · Cranial · Spinal · Peripheral Nerves · Skeleton',
});

export const SYSTEM_PAGES = Object.freeze({
  nervous: {
    meta: NERVOUS_META,
    categories: NERVOUS_CATEGORIES,
    structures: NERVOUS_STRUCTURES,
    defaultView: { yaw: 0.28, pitch: 0.06, dist: 1.52, pivot: [0, -0.02, 0] },
  },
  circulatory: {
    meta: CIRCULATORY_META,
    categories: CIRCULATORY_CATEGORIES,
    structures: CIRCULATORY_STRUCTURES,
    defaultView: { yaw: 0.24, pitch: 0.05, dist: 1.48, pivot: [0, 0.02, 0] },
  },
  respiratory: {
    meta: RESPIRATORY_META,
    categories: RESPIRATORY_CATEGORIES,
    structures: RESPIRATORY_STRUCTURES,
    defaultView: { yaw: 0.24, pitch: 0.05, dist: 1.25, pivot: [0, 0.14, 0] },
  },
  urinary: {
    meta: URINARY_META,
    categories: URINARY_CATEGORIES,
    structures: URINARY_STRUCTURES,
    defaultView: { yaw: 0.22, pitch: 0.04, dist: 1.18, pivot: [0, -0.22, 0] },
  },
  endocrine: {
    meta: ENDOCRINE_META,
    categories: ENDOCRINE_CATEGORIES,
    structures: ENDOCRINE_STRUCTURES,
    defaultView: { yaw: 0.24, pitch: 0.05, dist: 1.50, pivot: [0, -0.03, 0] },
  },
  digestive: {
    meta: DIGESTIVE_META,
    categories: DIGESTIVE_CATEGORIES,
    structures: DIGESTIVE_STRUCTURES,
    defaultView: { yaw: 0.22, pitch: 0.05, dist: 1.26, pivot: [0, 0.04, 0] },
  },
});

// Opaque or translucent medical textbook material for brain regions, spinal cord, and visceral organs
function createTextbookTissueMaterial(colorHex, { isCord = false, isOverlay = false, opacity = 1.0, transparent = false, depthWrite = true } = {}) {
  const isTranslucent = transparent || opacity < 0.99;
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: isCord ? 0.42 : 0.46,
    metalness: 0.03,
    clearcoat: isTranslucent ? 0.06 : 0.18,
    clearcoatRoughness: 0.36,
    transparent: isTranslucent,
    opacity,
    depthWrite: isTranslucent ? false : depthWrite,
    depthTest: true,
    polygonOffset: isOverlay,
    polygonOffsetFactor: isOverlay ? -1.5 : 0,
    polygonOffsetUnits: isOverlay ? -1.5 : 0,
    side: THREE.DoubleSide,
  });
}

// Opaque, crisp medical textbook material for cranial/spinal nerves and major vascular/endocrine conduits
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

export function createNeuroViewer({ container, lang = 'zh-Hant', initialPage = 'nervous', onProgress, onSelect }) {
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

  // Overlay layer for 3D Pin Labels + SVG Callout Lines
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

  // Active system page state
  let currentPageId = SYSTEM_PAGES[initialPage] ? initialPage : 'nervous';
  let activeStructures = SYSTEM_PAGES[currentPageId].structures;
  let activeCategories = SYSTEM_PAGES[currentPageId].categories;

  // Meshes & structures registries
  const meshesByName = new Map();
  const meshesByStructureId = new Map();
  const structureStates = new Map();
  const pinElements = [];

  // Shared decoded geometry bundles & caches
  let rawAssets = null;
  let sharedSkeletonGeos = null;
  const systemGeosCache = new Map();

  let ghostBones = true;
  let silhouetteOpacity = 0.22;
  let silhouetteMaterial = null;
  let brainHemisphere = 'both'; // 'both' | 'L' | 'R'
  let showBrainPins = false;

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

  function isBrainCategory(cat) {
    return cat === 'brain' || cat === 'brainFunctional';
  }

  function syncMeshVisibility(id) {
    const enabled = structureStates.get(id) !== false;
    const meshes = meshesByStructureId.get(id) || [];
    for (const m of meshes) {
      const mName = m.userData?.meshName || '';
      let hemiAllowed = true;
      if (currentPageId === 'nervous' && isBrainCategory(m.userData?.category) && brainHemisphere !== 'both') {
        if (mName.endsWith('_L') && brainHemisphere !== 'L') hemiAllowed = false;
        if (mName.endsWith('_R') && brainHemisphere !== 'R') hemiAllowed = false;
      }
      m.visible = enabled && hemiAllowed;
    }
  }

  function rebuildPinsForStructures(structures) {
    // Clear existing pin buttons & SVG lines
    for (const p of pinElements) {
      p.el.remove();
      p.line.remove();
      p.anchorCircle.remove();
    }
    pinElements.length = 0;

    for (let idx = 0; idx < structures.length; idx++) {
      const item = structures[idx];
      if (!item.anchorL || !item.pinZh) continue;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'pin-leader-line');
      line.setAttribute('stroke', item.color);
      if (!showBrainPins) line.style.display = 'none';
      pinsSvg.appendChild(line);

      const anchorCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      anchorCircle.setAttribute('class', 'pin-anchor-dot');
      anchorCircle.setAttribute('r', '3.5');
      anchorCircle.setAttribute('fill', item.color);
      if (!showBrainPins) anchorCircle.style.display = 'none';
      pinsSvg.appendChild(anchorCircle);

      const pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.className = 'brain-pin';
      pinBtn.setAttribute('data-pin-id', item.id);
      pinBtn.hidden = !showBrainPins;

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
      pinElements.push({ item, idx, el: pinBtn, dot, line, anchorCircle, vec: new THREE.Vector3() });
    }
  }

  function getOrBuildSystemGeometries(pageId) {
    if (systemGeosCache.has(pageId)) {
      return systemGeosCache.get(pageId);
    }
    if (!rawAssets) return {};

    const {
      headMeta, headGeos,
      nervesMeta, nervesGeos,
      periMeta, periGeos,
      bodyMeta, bodyGeos,
      musclesMeta, musclesGeos,
      extraMeta, extraGeos,
      cmToViewer, headCmMatrix,
    } = rawAssets;

    let built = {};
    if (pageId === 'nervous') {
      const brainRegionGeos = buildBrainRegions(headGeos, headCmMatrix, cmToViewer);
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

      const cranialNerveGeos = buildCranialNerves(periMeta, periGeos, headCmMatrix, cmToViewer);
      const spinalRootGeos = buildSpinalNerveRoots(
        [cordCervCm, cordThorCm, cordLumbCm, cordSacrCm],
        periMeta,
        periGeos,
        cmToViewer
      );

      built = {
        ...brainRegionGeos,
        ...alignedCordGeos,
        ...cranialNerveGeos,
        ...spinalRootGeos,
      };
    } else if (pageId === 'circulatory') {
      built = buildCirculatorySystemGeometries({ bodyMeta, bodyGeos, headGeos, headCmMatrix, extraMeta, extraGeos, cmToViewer });
    } else if (pageId === 'respiratory') {
      built = buildRespiratorySystemGeometries({ bodyMeta, bodyGeos, musclesMeta, musclesGeos, headGeos, headCmMatrix, extraMeta, extraGeos, cmToViewer });
    } else if (pageId === 'urinary') {
      built = buildUrinarySystemGeometries({ bodyMeta, bodyGeos, extraMeta, extraGeos, cmToViewer });
    } else if (pageId === 'endocrine') {
      built = buildEndocrineSystemGeometries({ headMeta, headGeos, headCmMatrix, bodyMeta, bodyGeos, extraMeta, extraGeos, cmToViewer });
    } else if (pageId === 'digestive') {
      built = buildDigestiveSystemGeometries({ bodyMeta, bodyGeos, headGeos, headCmMatrix, extraMeta, extraGeos, cmToViewer });
    }

    systemGeosCache.set(pageId, built || {});
    return built || {};
  }

  function createMaterialForStructure(item) {
    if (isBoneCategory(item.category)) {
      return createBoneMaterial(item.color, { ghost: ghostBones });
    }
    if (item.category === 'silhouette') {
      return silhouetteMaterial;
    }
    const opacity = typeof item.opacity === 'number' ? item.opacity : 1.0;
    const transparent = Boolean(item.transparent) || opacity < 0.99;
    const depthWrite = typeof item.depthWrite === 'boolean' ? item.depthWrite : !transparent;
    if (item.category === 'brainFunctional') {
      return createTextbookTissueMaterial(item.color, { isCord: false, isOverlay: true, opacity, transparent, depthWrite });
    }
    if (item.category === 'cranialNerves' || item.category === 'peripheralNerves') {
      return createTextbookNerveMaterial(item.color);
    }
    if (item.category === 'spinalCord') {
      return createTextbookTissueMaterial(item.color, { isCord: true, opacity, transparent, depthWrite });
    }
    return createTextbookTissueMaterial(item.color, { isCord: false, isOverlay: false, opacity, transparent, depthWrite });
  }

  function clearRootScene() {
    clearHighlight();
    for (let i = root.children.length - 1; i >= 0; i--) {
      const child = root.children[i];
      root.remove(child);
      if (child.material && child.material !== silhouetteMaterial) {
        child.material.dispose();
      }
    }
    meshesByName.clear();
    meshesByStructureId.clear();
    structureStates.clear();
  }

  function populateSystemScene(pageId) {
    const pageDef = SYSTEM_PAGES[pageId] || SYSTEM_PAGES.nervous;
    currentPageId = pageId;
    activeStructures = pageDef.structures;
    activeCategories = pageDef.categories;

    clearRootScene();

    for (const item of activeStructures) {
      structureStates.set(item.id, true);
      meshesByStructureId.set(item.id, []);
    }

    rebuildPinsForStructures(activeStructures);

    if (!rawAssets) return;

    const {
      headGeos,
      nervesMeta, nervesGeos,
      periMeta, periGeos,
      bodyMeta, bodyGeos,
      musclesMeta, musclesGeos,
      extraMeta, extraGeos,
      cmToViewer, fullHeadMatrix,
    } = rawAssets;

    const systemCustomGeos = getOrBuildSystemGeometries(pageId);
    const customViewerGeos = {
      ...sharedSkeletonGeos,
      ...systemCustomGeos,
    };

    function addStructureMesh(item, meshName, geo, transformMatrix = null) {
      if (!geo) return;
      const finalGeo = transformMatrix ? geo.clone().applyMatrix4(transformMatrix) : geo;
      if (!finalGeo.attributes.normal) {
        finalGeo.computeVertexNormals();
      }
      if (!finalGeo.boundingBox) {
        finalGeo.computeBoundingBox();
      }
      if (!finalGeo.boundingSphere) {
        finalGeo.computeBoundingSphere();
      }

      const mat = createMaterialForStructure(item);
      const mesh = new THREE.Mesh(finalGeo, mat);
      const isTranslucentOrgan = !isBoneCategory(item.category) && item.category !== 'silhouette' && (mat.transparent || mat.opacity < 0.99);
      mesh.renderOrder =
        item.category === 'silhouette'
          ? 4
          : isBoneCategory(item.category)
            ? 3
            : isTranslucentOrgan
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
      const list = meshesByStructureId.get(item.id);
      if (list) list.push(mesh);
    }

    for (const item of activeStructures) {
      for (const mName of item.meshes) {
        if (customViewerGeos[mName]) {
          addStructureMesh(item, mName, customViewerGeos[mName], null);
        } else if (item.bundle === 'head' || headGeos[mName]) {
          addStructureMesh(item, mName, headGeos[mName], fullHeadMatrix);
        } else if (item.bundle === 'nerves' || nervesGeos[mName]) {
          const entry = nervesMeta.meshes.find(m => m.name === mName);
          if (entry && nervesGeos[mName]) {
            const mat = entry.frame === 'head'
              ? fullHeadMatrix
              : cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, nervesGeos[mName], mat);
          }
        } else if (item.bundle === 'peripheral' || periGeos[mName]) {
          const entry = periMeta.meshes.find(m => m.name === mName);
          if (entry && periGeos[mName]) {
            const mat = entry.frame === 'head'
              ? fullHeadMatrix
              : cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, periGeos[mName], mat);
          }
        } else if (item.bundle === 'body' || bodyGeos[mName]) {
          const entry = bodyMeta.meshes.find(m => m.name === mName);
          if (entry && bodyGeos[mName]) {
            const mat = cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, bodyGeos[mName], mat);
          }
        } else if (item.bundle === 'muscles' || musclesGeos[mName]) {
          const entry = musclesMeta.meshes.find(m => m.name === mName);
          if (entry && musclesGeos[mName]) {
            const mat = cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, musclesGeos[mName], mat);
          }
        } else if (item.bundle === 'extra' || extraGeos?.[mName]) {
          const entry = extraMeta?.meshes?.find(m => m.name === mName);
          if (entry && extraGeos?.[mName]) {
            const mat = cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame));
            addStructureMesh(item, mName, extraGeos[mName], mat);
          }
        }
      }
    }

    // Add full-body muscle envelope into the silhouette group
    const silhouetteItem = activeStructures.find(s => s.id === 'silhouetteMesh' || s.category === 'silhouette');
    if (silhouetteItem) {
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
          addStructureMesh(silhouetteItem, `silhouette_${mName}`, geo, mat);
        }
      }
    }

    // Apply default camera view for this system page
    const defView = pageDef.defaultView || VIEW_PRESETS.default;
    targetYaw = defView.yaw;
    targetPitch = defView.pitch;
    targetDistance = defView.dist;
    targetPivot.set(defView.pivot[0], defView.pivot[1], defView.pivot[2]);
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
        extraMeta, extraBuf,
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
        fetch(assetUrl('anatomy/organs-extra.json')).then(r => r.json()),
        fetch(assetUrl('anatomy/organs-extra.bin')).then(r => r.arrayBuffer()),
      ]);

      onProgress?.({ percent: 50, text: '解析 3D 幾何結構...' });

      const headGeos = decodeGeometry(headMeta, headBuf);
      const nervesGeos = decodeGeometry(nervesMeta, nervesBuf);
      const periGeos = decodeGeometry(periMeta, periBuf);
      const bodyGeos = decodeGeometry(bodyMeta, bodyBuf);
      const musclesGeos = decodeGeometry(musclesMeta, musclesBuf);
      const extraGeos = decodeGeometry(extraMeta, extraBuf);

      const cmToViewer = makeCmToViewerMatrix();
      const headSourceFrame = periMeta.meshes.find(m => m.name === 'pn_head_L').sourceFrame;
      const headCmMatrix = makeCmMatrix(headSourceFrame);
      const fullHeadMatrix = cmToViewer.clone().multiply(headCmMatrix);

      silhouetteMaterial = createSilhouetteMaterial();

      onProgress?.({ percent: 70, text: '建立中樞與周邊神經系統...' });

      // Build shared skeleton parts (torso parts & hand bones/nerves) once
      const torsoEntry = bodyMeta.meshes.find(m => m.name === 'torso_skel');
      const torsoPartsGeos = buildTorsoSkeletonParts(bodyGeos.torso_skel, torsoEntry.sourceFrame, cmToViewer);
      const handGeos = buildHandBonesAndNerves(headGeos, periMeta, periGeos, cmToViewer);

      sharedSkeletonGeos = {
        ...torsoPartsGeos,
        ...handGeos,
      };

      rawAssets = {
        headMeta, headGeos,
        nervesMeta, nervesGeos,
        periMeta, periGeos,
        bodyMeta, bodyGeos,
        musclesMeta, musclesGeos,
        extraMeta, extraGeos,
        cmToViewer,
        headCmMatrix,
        fullHeadMatrix,
      };

      populateSystemScene(currentPageId);

      onProgress?.({ percent: 100, text: '準備完成' });
    } catch (err) {
      console.error('Anatomy loading failed:', err);
      onProgress?.({ percent: 100, text: '載入失敗，請重新整理', error: err });
    }
  }

  const refCenterVec = new THREE.Vector3();
  const LEFT_COL_IDS = new Set(['funcMotor', 'funcPremotor', 'funcPrefrontal', 'funcBroca', 'funcTemporalLimbic']);

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

  // Update 3D projected positions of callout pins with non-overlapping left/right columns
  function updatePins() {
    // Calculate average Y of visible pins (or 0.42 for brain/nervous)
    let centerY = 0.42;
    if (currentPageId !== 'nervous') {
      let sumY = 0;
      let countY = 0;
      for (const p of pinElements) {
        if (showBrainPins && structureStates.get(p.item.id) !== false && p.item.anchorL) {
          sumY += p.item.anchorL[1];
          countY++;
        }
      }
      if (countY > 0) {
        centerY = sumY / countY;
      } else {
        centerY = 0.08;
      }
    }

    refCenterVec.set(0, centerY, -0.01).project(camera);
    const bcx = (refCenterVec.x * 0.5 + 0.5) * width;
    const radiusPx = Math.max(72, Math.min(200, (currentPageId === 'nervous' ? 64 : 115) / Math.max(0.25, distance)));

    const leftCol = [];
    const rightCol = [];

    for (let i = 0; i < pinElements.length; i++) {
      const p = pinElements[i];
      const visible = showBrainPins && structureStates.get(p.item.id) !== false;
      if (!visible) {
        p.el.hidden = true;
        p.line.style.display = 'none';
        p.anchorCircle.style.display = 'none';
        continue;
      }
      const [ax, ay, az] = p.item.anchorL;
      const signX = (currentPageId === 'nervous' && brainHemisphere === 'R') ? -1 : 1;
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

      if (currentPageId === 'nervous') {
        if (LEFT_COL_IDS.has(p.item.id)) {
          leftCol.push(p);
        } else {
          rightCol.push(p);
        }
      } else {
        // Balance left & right callout columns across organ systems
        const isLeft = Math.abs(ax) > 0.015 ? ax < 0 : (i % 2 === 0);
        if (isLeft) {
          leftCol.push(p);
        } else {
          rightCol.push(p);
        }
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

    const structure = activeStructures.find(s => s.id === structId);
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

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => onResize())
    : null;
  if (resizeObserver) {
    resizeObserver.observe(container);
  }

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
    setSystemPage(pageId) {
      if (!SYSTEM_PAGES[pageId]) return null;
      selectStructure(null);
      populateSystemScene(pageId);
      return SYSTEM_PAGES[pageId];
    },

    getSystemPage() {
      return currentPageId;
    },

    getActiveSystemConfig() {
      return SYSTEM_PAGES[currentPageId];
    },

    toggleStructure(id, visible) {
      structureStates.set(id, visible);
      syncMeshVisibility(id);
      if (selectedStructureId === id && !visible) selectStructure(null);
    },

    toggleCategory(catId, visible) {
      for (const item of activeStructures) {
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
      for (const item of activeStructures) {
        if (isBrainCategory(item.category)) {
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

    // Quick brain partition mode: 'both' (Lobes + Functional) | 'anatomical' (Lobes only) | 'functional' (Functional areas only)
    setBrainPartitionMode(mode) {
      const baseLobes = ['frontalLobe', 'parietalLobe', 'temporalLobe', 'occipitalLobe'];
      if (mode === 'anatomical') {
        for (const item of activeStructures) {
          if (item.category === 'brain') this.toggleStructure(item.id, true);
          if (item.category === 'brainFunctional') this.toggleStructure(item.id, false);
        }
        this.setShowBrainPins(false);
      } else if (mode === 'functional') {
        for (const item of activeStructures) {
          if (item.category === 'brain') {
            this.toggleStructure(item.id, !baseLobes.includes(item.id));
          }
          if (item.category === 'brainFunctional') {
            this.toggleStructure(item.id, true);
          }
        }
      } else {
        for (const item of activeStructures) {
          if (isBrainCategory(item.category)) this.toggleStructure(item.id, true);
        }
      }
    },

    // Toggle 3D Floating Callout Pins
    setShowBrainPins(visible) {
      showBrainPins = !!visible;
      updatePins();
    },

    getShowBrainPins() {
      return showBrainPins;
    },

    setGhostBones(ghost) {
      ghostBones = !!ghost;
      for (const item of activeStructures) {
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
        for (const item of activeStructures) this.toggleStructure(item.id, true);
        this.setGhostBones(true);
      } else if (name === 'nervesOnly' || name === 'systemOnly') {
        for (const item of activeStructures) {
          const isOrgan = !isBoneCategory(item.category) && item.category !== 'silhouette';
          this.toggleStructure(item.id, isOrgan);
        }
        const sil = activeStructures.find(s => s.category === 'silhouette');
        if (sil) this.toggleStructure(sil.id, true);
      } else if (name === 'nervesAndSpine' || name === 'systemAndSpine') {
        for (const item of activeStructures) {
          const isOrganOrSpine = (!isBoneCategory(item.category) && item.category !== 'silhouette') || item.category === 'spine';
          this.toggleStructure(item.id, isOrganOrSpine);
        }
        const sil = activeStructures.find(s => s.category === 'silhouette');
        if (sil) this.toggleStructure(sil.id, true);
        this.setGhostBones(false);
      } else if (name === 'nervesAndSkeleton' || name === 'systemAndSkeleton') {
        for (const item of activeStructures) this.toggleStructure(item.id, true);
        this.setGhostBones(false);
      }
    },

    setView(viewKey) {
      const pageDef = SYSTEM_PAGES[currentPageId];
      const p = (viewKey === 'default' && pageDef?.defaultView)
        ? pageDef.defaultView
        : (VIEW_PRESETS[viewKey] || VIEW_PRESETS.default);
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

    resize: onResize,

    dispose() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      if (resizeObserver) resizeObserver.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      container.replaceChildren();
    },
  };
}
