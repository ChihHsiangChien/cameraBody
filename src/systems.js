/**
 * Anatomical Systems Definition
 * Integrates BodyVista's 9 anatomical systems taxonomy with 3D Anatomy Camera's layer and organ rigging.
 */

export const ANATOMICAL_SYSTEMS = Object.freeze([
  {
    id: 'skeletal',
    nameZh: '骨骼系統',
    nameEn: 'Skeletal System',
    icon: '🦴',
    color: '#e0ddcf',
    accent: '#8bc34a',
    layers: ['skull', 'spine', 'arms', 'legs', 'hands', 'joints'],
    organs: [],
    descriptionZh: '人體支架與運動槓桿，含頭骨、脊椎、肋骨、四肢骨骼與關節韌帶。',
    descriptionEn: 'The body scaffold and levers, including skull, spine, ribs, limbs and joints.',
  },
  {
    id: 'muscular',
    nameZh: '肌肉系統',
    nameEn: 'Muscular System',
    icon: '💪',
    color: '#b85042',
    accent: '#e57373',
    layers: ['muscles', 'bodyMuscles'],
    organs: [],
    descriptionZh: '軀體動力與姿勢維持，含顏面表情肌、頸部、胸背腹及四肢肌群。',
    descriptionEn: 'Locomotion and posture maintenance, including facial, trunk, and limb muscles.',
  },
  {
    id: 'cardiovascular',
    nameZh: '心血管系統',
    nameEn: 'Cardiovascular System',
    icon: '🫀',
    color: '#d9534f',
    accent: '#ef5350',
    layers: ['organs'],
    organs: ['organHeart'],
    descriptionZh: '循環與血液輸送核心，位於胸腔中縱隔的心臟。',
    descriptionEn: 'Heart and circulatory transport center.',
  },
  {
    id: 'respiratory',
    nameZh: '呼吸系統',
    nameEn: 'Respiratory System',
    icon: '🫁',
    color: '#68b0ab',
    accent: '#4db6ac',
    layers: ['organs'],
    organs: ['organLungs'],
    descriptionZh: '氣體交換器官，位於胸腔兩側的左右肺葉。',
    descriptionEn: 'Gas exchange organs, the left and right lungs in the thoracic cavity.',
  },
  {
    id: 'digestive',
    nameZh: '消化系統',
    nameEn: 'Digestive System',
    icon: '🫄',
    color: '#e6a15c',
    accent: '#ffb74d',
    layers: ['organs'],
    organs: ['organDigestive'],
    descriptionZh: '營養消化與吸收，含胃、肝臟與大腸小腸。',
    descriptionEn: 'Digestion and absorption, including stomach, liver, and intestines.',
  },
  {
    id: 'urinary',
    nameZh: '泌尿系統',
    nameEn: 'Urinary System',
    icon: '🫧',
    color: '#6aa0c4',
    accent: '#64b5f6',
    layers: ['organs'],
    organs: ['organUrinary'],
    descriptionZh: '體液平衡與排泄過濾，含後腹膜腔的左右腎臟。',
    descriptionEn: 'Fluid balance and filtration, left and right kidneys.',
  },
  {
    id: 'nervous',
    nameZh: '神經系統',
    nameEn: 'Nervous System',
    icon: '🧠',
    color: '#cda0e3',
    accent: '#ba68c8',
    layers: ['brain', 'nerves', 'peripheralNerves'],
    organs: [],
    descriptionZh: '神經中樞與周邊傳導，含大腦、小腦、腦幹、脊髓與周邊神經叢。',
    descriptionEn: 'Neural command and conduction: brain, spinal cord and peripheral nerves.',
  },
  {
    id: 'sensory',
    nameZh: '感覺器官',
    nameEn: 'Sensory System',
    icon: '👁️',
    color: '#86a8bb',
    accent: '#81d4fa',
    layers: ['eyes'],
    organs: [],
    descriptionZh: '視覺與外界感測，含雙眼球與視神經通路。',
    descriptionEn: 'Vision and external perception, eyeballs and optical pathways.',
  },
  {
    id: 'skin',
    nameZh: '體表輪廓',
    nameEn: 'Integumentary System',
    icon: '👤',
    color: '#d2b7a5',
    accent: '#bcaaa4',
    layers: ['outline'],
    organs: [],
    descriptionZh: '體表輪廓與邊界，提供空間幾何對齊與外觀參考。',
    descriptionEn: 'Body surface silhouette providing alignment reference.',
  },
]);

export const SYSTEM_IDS = Object.freeze(ANATOMICAL_SYSTEMS.map(s => s.id));

export function systemById(id) {
  return ANATOMICAL_SYSTEMS.find(s => s.id === id) || null;
}

/**
 * Determine which system an anatomical structure belongs to.
 */
export function systemForPart(part) {
  if (!part) return null;
  const name = (part.name || '').toLowerCase();
  const kind = (part.kind || '').toLowerCase();
  const layer = (part.layer || '').toLowerCase();

  // Organs
  if (name.includes('heart')) return systemById('cardiovascular');
  if (name.includes('lung')) return systemById('respiratory');
  if (name.includes('liver') || name.includes('stomach') || name.includes('intestine')) return systemById('digestive');
  if (name.includes('kidney')) return systemById('urinary');

  // Brain & Nerves
  if (name.includes('nerve') || name.includes('cord') || name.includes('plexus') || layer.includes('nerve') || layer === 'brain' || kind === 'nerve') {
    return systemById('nervous');
  }

  // Sensory
  if (name.includes('eye') || layer === 'eyes') return systemById('sensory');

  // Muscles
  if (kind === 'muscle' || layer.toLowerCase().includes('muscle')) return systemById('muscular');

  // Skeletal & Joints
  if (kind === 'bone' || kind === 'joint' || layer === 'spine' || layer === 'skull' || layer === 'arms' || layer === 'legs' || layer === 'hands' || layer === 'joints') {
    return systemById('skeletal');
  }

  // Outline / Skin
  if (layer === 'outline' || name.includes('skin')) return systemById('skin');

  return null;
}

/**
 * Check if an anatomical system is active given the current viewer settings.
 */
export function isSystemActive(settings, systemId) {
  const sys = systemById(systemId);
  if (!sys) return false;
  if (sys.organs.length > 0) {
    return !!settings.organs && sys.organs.some(o => settings[o] !== false);
  }
  return sys.layers.some(l => !!settings[l]);
}

/**
 * Set a system's active status.
 */
export function setSystemActive(settings, systemId, active) {
  const sys = systemById(systemId);
  if (!sys) return;
  if (sys.organs.length > 0) {
    for (const o of sys.organs) settings[o] = active;
    // Auto sync settings.organs flag
    const anyOrganActive = !!(settings.organHeart || settings.organLungs || settings.organDigestive || settings.organUrinary);
    settings.organs = anyOrganActive;
  } else {
    for (const l of sys.layers) settings[l] = active;
  }
}

/**
 * Solo a single system: activate it and deactivate all others.
 */
export function soloSystem(settings, systemId) {
  for (const sys of ANATOMICAL_SYSTEMS) {
    const isTarget = sys.id === systemId;
    if (sys.organs.length > 0) {
      for (const o of sys.organs) settings[o] = isTarget;
    } else {
      for (const l of sys.layers) settings[l] = isTarget;
    }
  }
  const targetSys = systemById(systemId);
  settings.organs = targetSys?.organs?.length > 0;
}

/**
 * Enable all systems simultaneously.
 */
export function enableAllSystems(settings) {
  for (const sys of ANATOMICAL_SYSTEMS) {
    if (sys.organs.length > 0) {
      for (const o of sys.organs) settings[o] = true;
    } else {
      for (const l of sys.layers) settings[l] = true;
    }
  }
  settings.organs = true;
}

/**
 * Disable all systems.
 */
export function disableAllSystems(settings) {
  for (const sys of ANATOMICAL_SYSTEMS) {
    if (sys.organs.length > 0) {
      for (const o of sys.organs) settings[o] = false;
    } else {
      for (const l of sys.layers) settings[l] = false;
    }
  }
  settings.organs = false;
}
