import * as THREE from 'three';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  mergeBufferGeometries,
  splitGeometryByComponents,
} from '../neuro-builder.js';

export const URINARY_META = Object.freeze({
  id: 'urinary',
  titleZh: '泌尿系統 3D 專頁',
  titleEn: '3D Urinary System',
  subtitleZh: '左右腎臟・腎盂輸尿管・膀胱・尿道・腎血管・骨骼系統',
  subtitleEn: 'Kidneys · Ureters · Urinary Bladder · Urethra · Renal Vessels · Skeleton',
});

export const URINARY_CATEGORIES = Object.freeze([
  {
    id: 'kidneys',
    icon: '●',
    nameZh: '左右腎臟與腎盂構造 (Left & Right Kidneys & Renal Pelvis)',
    nameEn: 'Left & Right Kidneys & Renal Pelvis',
    color: '#a8383b',
  },
  {
    id: 'urinaryTract',
    icon: '◆',
    nameZh: '輸尿管・膀胱・尿道與括約肌 (Ureters, Bladder & Urethra)',
    nameEn: 'Ureters, Urinary Bladder & Urethra',
    color: '#facc15',
  },
  {
    id: 'renalVessels',
    icon: '▲',
    nameZh: '腎動靜脈與腹主動脈／下腔靜脈 (Renal Vessels)',
    nameEn: 'Renal Arteries, Veins, Abdominal Aorta & IVC',
    color: '#ef4444',
  },
  {
    id: 'spine',
    icon: '◈',
    nameZh: '脊椎骨各節段 (Vertebral Column)',
    nameEn: 'Vertebral Column (Spine Segments)',
    color: '#e5ded2',
  },
  {
    id: 'skull',
    icon: '▲',
    nameZh: '頭骨 (Skull)',
    nameEn: 'Skull',
    color: '#dfd8cc',
  },
  {
    id: 'skeleton',
    icon: '■',
    nameZh: '胸廓肋骨・骨盆・四肢與雙手骨骼',
    nameEn: 'Ribcage, Pelvis, Hand & Limb Bones',
    color: '#d6cfc2',
  },
  {
    id: 'silhouette',
    icon: '◯',
    nameZh: '人體外框背景',
    nameEn: 'Body Silhouette',
    color: '#38bdf8',
  },
]);

export const URINARY_STRUCTURES = Object.freeze([
  // --- 1. 左右腎臟與腎盂構造 (Kidneys, Renal Pelvis & Adrenal Caps) ---
  {
    id: 'leftKidney',
    category: 'kidneys',
    nameZh: '左腎 (T11–L2 後腹膜腔・過濾血液形成尿液)',
    nameEn: 'Left Kidney (Retroperitoneal T11–L2)',
    pinZh: '左腎 (過濾血液製尿)',
    pinEn: 'Left Kidney',
    anchorL: [0.0524, -0.0843, -0.0035],
    bundle: 'custom',
    meshes: ['urinary_kidney_L'],
    color: '#a8383b',
    descZh: '位於腹腔後壁第 11 胸椎至第 2 腰椎高度（位置略高於右腎），外覆纖維囊，內部由腎皮質與腎髓質錐體組成，約含 100 萬個腎元，負責過濾血液形成原尿並調節體液、電解質與酸鹼平衡。',
    descEn: 'Retroperitoneal bean-shaped organ extending from T11 to L2 (slightly higher than the right kidney); contains ~1 million nephrons across cortex and medullary pyramids to filter blood and regulate fluid, electrolyte, and acid-base balance.',
  },
  {
    id: 'rightKidney',
    category: 'kidneys',
    nameZh: '右腎 (T12–L3 肝右葉下方・體液與電解質恆定)',
    nameEn: 'Right Kidney (Retroperitoneal T12–L3)',
    pinZh: '右腎',
    pinEn: 'Right Kidney',
    anchorL: [-0.0619, -0.0985, -0.0061],
    bundle: 'custom',
    meshes: ['urinary_kidney_R'],
    color: '#a8383b',
    descZh: '位於肝臟右葉下方，約第 12 胸椎至第 3 腰椎高度；與左腎共同承接每分鐘約 1.2 公升腎血流量，藉由腎絲球過濾、腎小管再吸收與分泌作用維持血液潔淨與血壓恆定（分泌腎素與紅血球生成素）。',
    descEn: 'Situated inferior to the right lobe of the liver at T12–L3 level; works with the left kidney to perform glomerular filtration, tubular reabsorption/secretion, and endocrine secretion of renin and erythropoietin.',
  },
  {
    id: 'renalPelvisCalyces',
    category: 'kidneys',
    nameZh: '腎盞與腎盂 (大腎盞・小腎盞・腎盂漏斗部)',
    nameEn: 'Renal Pelvis, Major & Minor Calyces',
    pinZh: '腎盂與腎盞',
    pinEn: 'Renal Pelvis & Calyces',
    anchorL: [0.0315, -0.0920, -0.0020],
    bundle: 'custom',
    meshes: ['urinary_renal_pelvis'],
    color: '#f3c969',
    descZh: '位於腎竇與腎門內之集尿構造：小腎盞包圍腎乳頭收集集尿管排出之尿液，匯合成 2–3 個大腎盞，再於腎門處匯聚成扁平漏斗狀的腎盂，向下平滑延續為輸尿管。',
    descEn: 'Funnel-shaped urinary collecting system within the renal sinus; minor calyces cup each renal papilla, converging into major calyces and the renal pelvis at the hilum before tapering into the ureter.',
  },
  {
    id: 'adrenalCaps',
    category: 'kidneys',
    nameZh: '左右腎上腺 (分泌醛固酮調控遠曲小管鈉水再吸收)',
    nameEn: 'Left & Right Adrenal Glands (Aldosterone Regulation)',
    pinZh: '腎上腺 (醛固酮調控)',
    pinEn: 'Adrenal Glands',
    anchorL: [0.0430, -0.0290, -0.0025],
    bundle: 'custom',
    meshes: ['urinary_adrenal_caps'],
    color: '#f59e0b',
    descZh: '覆蓋於左右雙腎上極之內分泌腺體（左呈半月形、右呈三角形），其腎上腺皮質球狀帶受腎素-血管張力素系統 (RAAS) 刺激分泌醛固酮 (Aldosterone)，直接作用於腎臟遠曲小管與集尿管以促進鈉離子與水分留存並排鉀。',
    descEn: 'Paired suprarenal endocrine glands capping the superior poles of both kidneys; the zona glomerulosa responds to the renin-angiotensin system (RAAS) by secreting aldosterone to promote renal sodium and water reabsorption.',
  },

  // --- 2. 輸尿管・膀胱・尿道與括約肌 (Urinary Tract) ---
  {
    id: 'ureters',
    category: 'urinaryTract',
    nameZh: '左右輸尿管 (後腹膜腔平滑肌蠕動管道，長約 25–30 cm)',
    nameEn: 'Left & Right Ureters',
    pinZh: '左右輸尿管',
    pinEn: 'Left & Right Ureters',
    anchorL: [0.0305, -0.1950, 0.0085],
    bundle: 'custom',
    meshes: ['urinary_ureters'],
    color: '#facc15',
    descZh: '連接左右腎盂至膀胱底部的細長平滑肌管道（長約 25–30 cm），沿腰大肌前表面於後腹膜腔垂直下行，跨過髂總動靜脈分叉處進入骨盆腔，以斜行角度穿入膀胱壁形成生理性防逆流瓣膜，藉規律蠕動將尿液送入膀胱。',
    descEn: 'Bilateral 25–30 cm muscular tubes descending retroperitoneally on the psoas major muscles, crossing the pelvic brim over the iliac vessels to enter the posterolateral bladder base obliquely, preventing vesicoureteral reflux.',
  },
  {
    id: 'urinaryBladder',
    category: 'urinaryTract',
    nameZh: '膀胱 (逼尿肌・膀胱三角・膀胱頸，儲存尿液)',
    nameEn: 'Urinary Bladder (Detrusor Muscle, Trigone & Neck)',
    pinZh: '膀胱 (逼尿肌與膀胱三角)',
    pinEn: 'Urinary Bladder',
    anchorL: [0.0000, -0.3320, 0.0460],
    bundle: 'custom',
    meshes: ['urinary_bladder'],
    color: '#e07a5f',
    descZh: '位於骨盆腔前部、恥骨聯合後方之中空肌性儲尿器官，內襯可大幅伸展之移行上皮，管壁為三層平滑肌構成的「逼尿肌 (Detrusor muscle)」；底部內面兩側輸尿管開口與下方尿道內口之間構成平滑的「膀胱三角 (Trigone)」。',
    descEn: 'Hollow muscular organ behind the pubic symphysis lined by transitional epithelium (urothelium) and three-layered detrusor smooth muscle; features the smooth internal trigone between the two ureteric orifices and internal urethral orifice.',
  },
  {
    id: 'urethraSphincter',
    category: 'urinaryTract',
    nameZh: '尿道與尿道內外括約肌 (排尿反射與禁尿控制)',
    nameEn: 'Urethra & Internal / External Urethral Sphincters',
    pinZh: '尿道與括約肌',
    pinEn: 'Urethra & Sphincter',
    anchorL: [0.0000, -0.3780, 0.0410],
    bundle: 'custom',
    meshes: ['urinary_urethra'],
    color: '#d96850',
    descZh: '起自膀胱頸尿道內口、穿過骨盆底泌尿生殖膈通往體外的排尿管道；包含由自主神經控制的平滑肌「尿道內括約肌」，以及位於骨盆底深會陰囊、受陰部神經隨意控制的橫紋肌「尿道外括約肌」，協同完成禁尿與排尿反射。',
    descEn: 'Terminal fibromuscular canal exiting the bladder neck through the urogenital diaphragm; guarded by the involuntary smooth-muscle internal urethral sphincter and voluntary striated external urethral sphincter.',
  },

  // --- 3. 腎動靜脈與腹主動脈／下腔靜脈 (Renal Vessels) ---
  {
    id: 'renalArteries',
    category: 'renalVessels',
    nameZh: '左右腎動脈與腹主動脈 (輸送約 20–25% 心輸出量入腎門)',
    nameEn: 'Renal Arteries & Abdominal Aorta',
    pinZh: '腎動脈與腹主動脈',
    pinEn: 'Renal Arteries & Abdominal Aorta',
    anchorL: [0.0065, -0.0650, 0.0120],
    bundle: 'custom',
    meshes: ['urinary_renal_arteries'],
    color: '#ef4444',
    descZh: '腹主動脈於第 1–2 腰椎高度（腸繫膜上動脈起始處下方）向左右發出粗大的左右腎動脈（右腎動脈較長並經下腔靜脈後方），進入腎門後分支為節段動脈、葉間動脈、弓狀動脈至入球小動脈進行高壓過濾。',
    descEn: 'The abdominal aorta gives off the stout left and right renal arteries at L1–L2 level (delivering 20–25% of cardiac output), entering each renal hilum and branching into segmental, interlobar, arcuate, and afferent arterioles.',
  },
  {
    id: 'renalVeins',
    category: 'renalVessels',
    nameZh: '左右腎靜脈與下腔靜脈 (將腎臟過濾後血液送回下腔靜脈)',
    nameEn: 'Renal Veins & Inferior Vena Cava',
    pinZh: '腎靜脈與下腔靜脈',
    pinEn: 'Renal Veins & Inferior Vena Cava',
    anchorL: [-0.0155, -0.0800, 0.0160],
    bundle: 'custom',
    meshes: ['urinary_renal_veins'],
    color: '#3b82f6',
    descZh: '行走於腎動脈前方的粗大靜脈幹，收集腎臟過濾並完成腎小管再吸收後之潔淨血液，由腎門穿出後直接匯入腹腔右側的下腔靜脈（左腎靜脈較長，橫越腹主動脈前方並接收左腎上腺靜脈與左性腺靜脈）。',
    descEn: 'Large veins anterior to the renal arteries draining filtered blood from both kidneys into the inferior vena cava (IVC); the longer left renal vein crosses anterior to the abdominal aorta below the superior mesenteric artery.',
  },

  // --- 4. 脊椎骨各節段 (Vertebral Column) ---
  {
    id: 'cervicalSpine',
    category: 'spine',
    nameZh: '頸椎 (C1–C7：寰椎・樞椎至第七頸椎)',
    nameEn: 'Cervical Vertebrae (C1–C7)',
    bundle: 'body',
    meshes: ['cervical_skel'],
    color: '#e5ded2',
    descZh: '由寰椎 (C1)、樞椎 (C2) 至隆椎 (C7) 共 7 節頸椎組成，支撐頭頸部並構成中軸脊椎上段。',
    descEn: 'Seven cervical vertebrae (atlas C1, axis C2, C3–C7) forming the superior division of the vertebral column.',
  },
  {
    id: 'thoracicSpine',
    category: 'spine',
    nameZh: '胸椎 (T1–T12：十二節胸椎，已與肋骨分離)',
    nameEn: 'Thoracic Vertebrae (T1–T12, Separated from Ribs)',
    bundle: 'custom',
    meshes: ['spine_thoracic'],
    color: '#dfd7ca',
    descZh: '由第 1 至第 12 胸椎 (T1–T12) 獨立組成；下段胸椎 (T11–T12) 為左腎上極與腎上腺之後方骨骼定位基準。',
    descEn: 'Twelve thoracic vertebrae (T1–T12) isolated from the ribcage; T11–T12 serve as the posterior skeletal landmark for the superior poles of the kidneys.',
  },
  {
    id: 'lumbarSpine',
    category: 'spine',
    nameZh: '腰椎 (L1–L5：五節腰椎，雙腎與輸尿管後方骨性基準)',
    nameEn: 'Lumbar Vertebrae (L1–L5, Separated from Pelvis)',
    bundle: 'custom',
    meshes: ['spine_lumbar'],
    color: '#dad1c3',
    descZh: '由第 1 至第 5 腰椎 (L1–L5) 獨立組成；左右腎臟分別位於 L1–L3 椎體兩側後腹膜腔，腎動靜脈於 L1–L2 高度出入腎門，輸尿管則沿腰椎橫突前方下行。',
    descEn: 'Five lumbar vertebrae (L1–L5); the kidneys flank L1–L3 retroperitoneally, the renal vessels arise at L1–L2, and the ureters descend anterior to the lumbar transverse processes.',
  },
  {
    id: 'sacrumSpine',
    category: 'spine',
    nameZh: '薦椎與尾椎 (Sacrum：骨盆後壁中軸骨)',
    nameEn: 'Sacrum (S1–S5, Separated from Hip Bones)',
    bundle: 'custom',
    meshes: ['spine_sacrum'],
    color: '#d5ccbe',
    descZh: '由 5 節薦椎融合而成之三角形骨盆後壁中軸骨；薦孔穿出之 S2–S4 骨盆內臟神經提供膀胱逼尿肌收縮排尿之副交感神經支配。',
    descEn: 'Fused triangular sacrum forming the posterior pelvic wall; transmits S2–S4 pelvic splanchnic nerves that drive parasympathetic detrusor contraction during micturition.',
  },

  // --- 5. 頭骨 (Skull) ---
  {
    id: 'cranium',
    category: 'skull',
    nameZh: '顱骨 (腦顱與面顱)',
    nameEn: 'Cranium',
    bundle: 'head',
    meshes: ['cranium'],
    color: '#dfd8cc',
    descZh: '構成顱腔保護大腦、下視丘與腦下垂體（分泌抗利尿激素 ADH 遠端調控腎臟集尿管水分再吸收）。',
    descEn: 'Cranial skeleton enclosing the brain, hypothalamus, and pituitary gland (which secretes ADH/vasopressin to regulate renal collecting duct water permeability).',
  },
  {
    id: 'jaw',
    category: 'skull',
    nameZh: '下頜骨',
    nameEn: 'Mandible',
    bundle: 'head',
    meshes: ['jaw'],
    color: '#dfd8cc',
    descZh: '面顱下方可活動之下頷骨。',
    descEn: 'Lower jaw bone articulating at the temporomandibular joint.',
  },

  // --- 6. 胸廓肋骨・骨盆・四肢與雙手骨骼 (Skeleton) ---
  {
    id: 'ribcageSternum',
    category: 'skeleton',
    nameZh: '胸廓：十二對肋骨與胸骨 (第 11、12 浮肋保護雙腎上極)',
    nameEn: 'Ribcage: 12 Pairs of Ribs & Sternum',
    bundle: 'custom',
    meshes: ['skel_ribcage'],
    color: '#d4ccc0',
    descZh: '由左右 12 對肋骨與胸骨組成；後方第 11 與第 12 對浮肋直接覆蓋並保護左右腎臟上半部。',
    descEn: 'Twelve pairs of ribs and sternum; the posterior 11th and 12th floating ribs directly shield the superior halves of the left and right kidneys.',
  },
  {
    id: 'shoulderGirdle',
    category: 'skeleton',
    nameZh: '肩帶：左右鎖骨與肩胛骨',
    nameEn: 'Shoulder Girdle: Clavicles & Scapulae',
    bundle: 'custom',
    meshes: ['skel_shoulder'],
    color: '#d2cabe',
    descZh: '由前方左右鎖骨與後方左右肩胛骨組成。',
    descEn: 'Bilateral clavicles and scapulae suspending the upper limbs.',
  },
  {
    id: 'pelvisBones',
    category: 'skeleton',
    nameZh: '骨盆：左右髖骨 (恥骨聯合後方保護膀胱與尿道)',
    nameEn: 'Pelvis: Left & Right Hip Bones (Ilium, Ischium, Pubis)',
    bundle: 'custom',
    meshes: ['skel_pelvis'],
    color: '#d0c8bc',
    descZh: '由左右髖骨（髂骨、坐骨、恥骨）組成，圍成骨盆腔容納並保護膀胱、遠端輸尿管與尿道；隱藏此項即可無遮擋觀察骨盆腔內的膀胱與輸尿管入膀胱處。',
    descEn: 'Bilateral hip bones (ilium, ischium, pubis) forming the pelvic cavity that houses and protects the urinary bladder, distal ureters, and urethra.',
  },
  {
    id: 'upperLimbBones',
    category: 'skeleton',
    nameZh: '上肢骨骼 (肱骨・橈骨・尺骨)',
    nameEn: 'Upper Limb Bones (Humerus, Radius, Ulna)',
    bundle: 'body',
    meshes: ['arm_humerus_L', 'arm_humerus_R', 'arm_forearm_L', 'arm_forearm_R'],
    color: '#cfc7ba',
    descZh: '包含左右上臂肱骨以及前臂橈骨、尺骨。',
    descEn: 'Bilateral humerus, radius, and ulna of the upper limbs.',
  },
  {
    id: 'handBones',
    category: 'skeleton',
    nameZh: '雙手骨骼 (腕骨・掌骨・五指指骨)',
    nameEn: 'Hand Bones (Carpals, Metacarpals, Phalanges)',
    bundle: 'custom',
    meshes: ['hand_bones_L', 'hand_bones_R'],
    color: '#d8d0c3',
    descZh: '完整左右雙手骨骼，每側共 27 塊手骨。',
    descEn: 'Complete bilateral hand skeletons (carpals, metacarpals, and phalanges).',
  },
  {
    id: 'lowerLimbBones',
    category: 'skeleton',
    nameZh: '下肢與足部骨骼 (股骨・脛腓骨・足骨)',
    nameEn: 'Lower Limb & Foot Bones',
    bundle: 'body',
    meshes: ['leg_femur_L', 'leg_femur_R', 'leg_shin_L', 'leg_shin_R', 'foot_L', 'foot_R'],
    color: '#cfc7ba',
    descZh: '包含大腿股骨、髕骨、小腿脛骨與腓骨，以及足部骨骼。',
    descEn: 'Bilateral femur, patella, tibia, fibula, and foot bones.',
  },

  // --- 7. 人體外框背景 (Silhouette) ---
  {
    id: 'silhouetteMesh',
    category: 'silhouette',
    nameZh: '人體外框輪廓',
    nameEn: 'Human Body Outline',
    bundle: 'head',
    meshes: ['skin'],
    color: '#38bdf8',
    descZh: '半透明人體外框輪廓背景，提供泌尿系統各器官與全身骨骼在人體空間中的相對位置參照。',
    descEn: 'Translucent human body silhouette contour providing spatial anatomical reference for the urinary system.',
  },
]);

/** Sweep a smooth 3D tube in BodyParts3D cm coordinates. */
function buildTubeCm(points, radiusCm = 0.25, tubularSegments = 24, radialSegments = 10) {
  const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5);
  return new THREE.TubeGeometry(curve, tubularSegments, radiusCm, radialSegments, false);
}

/** Create a deformed ellipsoid/capsule in BodyParts3D cm coordinates. */
function buildEllipsoidCm(center, radii, eulerRadians = [0, 0, 0], widthSeg = 22, heightSeg = 16) {
  const geo = new THREE.SphereGeometry(1, widthSeg, heightSeg);
  const mat = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(eulerRadians[0], eulerRadians[1], eulerRadians[2])
  );
  mat.compose(
    new THREE.Vector3(center[0], center[1], center[2]),
    q,
    new THREE.Vector3(radii[0], radii[1], radii[2])
  );
  geo.applyMatrix4(mat);
  return geo;
}

/**
 * Build all custom viewer-space geometries for the 3D Urinary System page:
 * - urinary_kidney_L, urinary_kidney_R (split from body.json organs_kidneys)
 * - urinary_renal_pelvis (minor/major calyces + funnel-shaped renal pelvis at both renal hila)
 * - urinary_adrenal_caps (left crescentic & right pyramidal suprarenal glands atop the kidneys)
 * - urinary_ureters (bilateral 25-30 cm retroperitoneal tubes from renal pelvis to posterior bladder trigone)
 * - urinary_bladder (detrusor body, apex, fundus/trigone, and bladder neck behind pubic symphysis)
 * - urinary_urethra (urethral canal + internal & external urethral sphincter rings)
 * - urinary_renal_arteries (abdominal aorta + bilateral renal arteries & segmental hilar branches)
 * - urinary_renal_veins (inferior vena cava + bilateral renal veins & hilar tributaries)
 */
export function buildUrinarySystemGeometries({ bodyMeta, bodyGeos, cmToViewer = makeCmToViewerMatrix() }) {
  const finalizeCm = geo => {
    const out = geo.clone().applyMatrix4(cmToViewer);
    out.computeVertexNormals();
    out.computeBoundingBox();
    out.computeBoundingSphere();
    return out;
  };

  // 1. Split organs_kidneys into Left Kidney (cx > 0) and Right Kidney (cx < 0) in BodyParts3D cm
  // Kidney L cm center ~ [5.24, 106.57, 7.65] (minY 101.46, maxY 111.76)
  // Kidney R cm center ~ [-6.19, 105.15, 7.39] (minY 99.96, maxY 110.18)
  const kidneyEntry = bodyMeta.meshes.find(m => m.name === 'organs_kidneys');
  const kidneysCm = bodyGeos.organs_kidneys.clone().applyMatrix4(makeCmMatrix(kidneyEntry.sourceFrame));
  const splitKidneys = splitGeometryByComponents(kidneysCm, ({ cx }) =>
    cx >= 0 ? 'urinary_kidney_L' : 'urinary_kidney_R'
  );

  const urinary_kidney_L = finalizeCm(splitKidneys.urinary_kidney_L || kidneysCm);
  const urinary_kidney_R = finalizeCm(splitKidneys.urinary_kidney_R || kidneysCm);

  // 2. Renal Pelvis & Major/Minor Calyces (urinary_renal_pelvis)
  const pelvisParts = [];
  // Left renal pelvis & calyces (hilum around [3.1, 106.3, 7.7])
  pelvisParts.push(
    // Left renal pelvis funnel
    buildEllipsoidCm([3.20, 106.10, 7.70], [1.15, 1.55, 0.80], [0, 0, -0.38]),
    // Left superior, middle, and inferior major/minor calyces radiating into renal sinus
    buildTubeCm([[4.80, 109.20, 7.65], [3.95, 107.70, 7.68], [3.15, 106.35, 7.72]], 0.34, 12, 8),
    buildTubeCm([[5.15, 106.60, 7.60], [4.10, 106.35, 7.68], [3.10, 106.00, 7.72]], 0.36, 12, 8),
    buildTubeCm([[4.75, 103.80, 7.62], [3.85, 104.90, 7.68], [3.05, 105.65, 7.75]], 0.34, 12, 8),
    // Right renal pelvis funnel (hilum around [-4.0, 104.8, 7.5])
    buildEllipsoidCm([-4.05, 104.65, 7.50], [1.15, 1.55, 0.80], [0, 0, 0.38]),
    // Right superior, middle, and inferior major/minor calyces
    buildTubeCm([[-5.70, 107.75, 7.42], [-4.80, 106.25, 7.46], [-3.95, 104.90, 7.52]], 0.34, 12, 8),
    buildTubeCm([[-6.05, 105.15, 7.38], [-5.00, 104.90, 7.46], [-3.90, 104.55, 7.52]], 0.36, 12, 8),
    buildTubeCm([[-5.65, 102.40, 7.40], [-4.75, 103.50, 7.46], [-3.85, 104.20, 7.55]], 0.34, 12, 8)
  );
  const urinary_renal_pelvis = finalizeCm(mergeBufferGeometries(pelvisParts));

  // 3. Left & Right Adrenal / Suprarenal Glands (urinary_adrenal_caps)
  // Left adrenal gland (semilunar/crescentic cap on superomedial pole of left kidney)
  // Right adrenal gland (pyramidal/triangular cap on superior pole of right kidney)
  const adrenalParts = [
    buildEllipsoidCm([4.35, 112.15, 7.70], [1.55, 1.25, 0.85], [0.08, -0.15, 0.48]),
    buildEllipsoidCm([3.55, 111.35, 7.80], [1.10, 1.05, 0.78], [0.05, -0.10, 0.72]),
    buildEllipsoidCm([-5.25, 110.65, 7.48], [1.50, 1.35, 0.85], [0.08, 0.15, -0.42]),
    buildEllipsoidCm([-4.45, 109.90, 7.58], [1.10, 1.05, 0.78], [0.05, 0.10, -0.68]),
  ];
  const urinary_adrenal_caps = finalizeCm(mergeBufferGeometries(adrenalParts));

  // 4. Left & Right Ureters (urinary_ureters)
  // Descend from ureteropelvic junction (~104-105 cm) along anterior psoas major, cross pelvic brim (~90 cm),
  // curve posterolaterally into pelvic cavity and enter posterolateral base of urinary bladder (~81.8 cm).
  const ureterParts = [
    // Left ureter
    buildTubeCm([
      [2.85, 105.10, 7.78],
      [2.75, 101.50, 8.15],
      [2.95, 97.20, 8.65],
      [3.15, 92.80, 9.35],
      [3.35, 88.80, 10.10],
      [3.10, 84.80, 10.45],
      [2.15, 81.90, 11.15],
      [1.45, 81.10, 11.75],
    ], 0.25, 36, 10),
    // Right ureter
    buildTubeCm([
      [-3.65, 103.65, 7.60],
      [-3.35, 100.20, 8.05],
      [-3.20, 96.20, 8.60],
      [-3.25, 92.20, 9.30],
      [-3.40, 88.40, 10.05],
      [-3.15, 84.60, 10.45],
      [-2.15, 81.85, 11.15],
      [-1.45, 81.10, 11.75],
    ], 0.25, 36, 10),
  ];
  const urinary_ureters = finalizeCm(mergeBufferGeometries(ureterParts));

  // 5. Urinary Bladder (urinary_bladder)
  // Situated in anterior pelvic cavity behind pubic symphysis (Y: 79.2–84.6 cm, Z: 10.8–14.5 cm)
  const bladderParts = [
    // Main bladder body (detrusor dome & lateral walls)
    buildEllipsoidCm([0.0, 82.05, 12.55], [2.75, 2.35, 2.25], [0.22, 0, 0], 28, 20),
    // Anterior-superior bladder apex (pointing toward pubic symphysis / median umbilical ligament / urachus)
    buildEllipsoidCm([0.0, 83.25, 13.75], [1.75, 1.40, 1.55], [0.45, 0, 0], 22, 16),
    // Posterior-inferior bladder fundus & trigone region receiving both ureters
    buildEllipsoidCm([0.0, 80.95, 11.75], [2.15, 1.55, 1.50], [-0.15, 0, 0], 22, 16),
    // Funnel-shaped bladder neck tapering inferiorly to internal urethral orifice
    buildEllipsoidCm([0.0, 79.55, 12.20], [1.15, 1.15, 1.10], [0.10, 0, 0], 18, 14),
  ];
  const urinary_bladder = finalizeCm(mergeBufferGeometries(bladderParts));

  // 6. Urethra & Internal / External Urethral Sphincters (urinary_urethra)
  const urethraParts = [
    // Urethral lumen & muscular wall descending from bladder neck through pelvic floor
    buildTubeCm([
      [0.0, 79.40, 12.22],
      [0.0, 78.10, 12.18],
      [0.0, 76.80, 12.28],
      [0.0, 75.50, 12.55],
      [0.0, 74.35, 12.88],
    ], 0.42, 20, 12),
    // Internal urethral sphincter (involuntary smooth muscle ring at bladder neck junction)
    buildEllipsoidCm([0.0, 79.05, 12.20], [0.92, 0.48, 0.88], [0.08, 0, 0], 20, 14),
    // External urethral sphincter (voluntary striated muscle ring in urogenital diaphragm)
    buildEllipsoidCm([0.0, 77.25, 12.22], [1.15, 0.55, 1.05], [0.05, 0, 0], 20, 14),
  ];
  const urinary_urethra = finalizeCm(mergeBufferGeometries(urethraParts));

  // 7. Renal Arteries & Abdominal Aorta (urinary_renal_arteries)
  // Abdominal aorta runs slightly left of midline (X ~ +0.45 cm, Y: 117 down to 93.5 cm, Z ~ 8.85 cm)
  const arteryParts = [
    // Abdominal aorta trunk
    buildTubeCm([
      [0.35, 117.20, 8.65],
      [0.45, 112.50, 8.85],
      [0.48, 107.50, 9.00],
      [0.42, 102.00, 9.15],
      [0.30, 96.80, 9.25],
      [0.20, 93.80, 9.20],
    ], 0.82, 28, 12),
    // Aortic bifurcation stubs (common iliac origins)
    buildTubeCm([[0.20, 94.10, 9.20], [1.85, 91.20, 9.25], [3.20, 88.80, 9.40]], 0.54, 12, 10),
    buildTubeCm([[0.20, 94.10, 9.20], [-1.55, 91.20, 9.25], [-2.95, 88.80, 9.40]], 0.54, 12, 10),
    // Left renal artery (shorter, direct course into left renal hilum)
    buildTubeCm([
      [0.55, 107.80, 8.95],
      [1.85, 107.45, 8.45],
      [3.15, 106.95, 7.95],
      [4.20, 106.75, 7.75],
    ], 0.42, 16, 10),
    // Left segmental renal artery branches (superior & inferior hilar branches)
    buildTubeCm([[3.15, 106.95, 7.95], [4.35, 108.45, 7.75], [5.20, 109.60, 7.65]], 0.25, 10, 8),
    buildTubeCm([[3.15, 106.95, 7.95], [4.30, 105.35, 7.75], [5.05, 104.10, 7.65]], 0.25, 10, 8),
    // Right renal artery (longer, passes posterior to IVC into right renal hilum)
    buildTubeCm([
      [0.35, 107.30, 8.92],
      [-1.30, 106.80, 8.35],
      [-2.85, 106.10, 7.88],
      [-4.15, 105.45, 7.65],
      [-5.10, 105.25, 7.52],
    ], 0.42, 18, 10),
    // Right segmental renal artery branches
    buildTubeCm([[-4.05, 105.50, 7.68], [-5.15, 107.05, 7.52], [-6.00, 108.15, 7.45]], 0.25, 10, 8),
    buildTubeCm([[-4.05, 105.50, 7.68], [-5.10, 103.95, 7.52], [-5.90, 102.75, 7.45]], 0.25, 10, 8),
  ];
  const urinary_renal_arteries = finalizeCm(mergeBufferGeometries(arteryParts));

  // 8. Renal Veins & Inferior Vena Cava (urinary_renal_veins)
  // Inferior Vena Cava runs to the right of aorta (X ~ -1.55 cm, Y: 92.5 up to 118.0 cm, Z ~ 9.35 cm)
  const veinParts = [
    // Inferior Vena Cava (IVC) trunk
    buildTubeCm([
      [-1.40, 92.80, 9.20],
      [-1.55, 97.50, 9.35],
      [-1.65, 103.50, 9.45],
      [-1.65, 108.50, 9.50],
      [-1.55, 113.50, 9.55],
      [-1.45, 118.20, 9.65],
    ], 0.94, 28, 12),
    // Common iliac vein confluence stubs into IVC
    buildTubeCm([[2.45, 88.80, 9.15], [0.55, 91.10, 9.18], [-1.35, 93.10, 9.20]], 0.56, 12, 10),
    buildTubeCm([[-3.25, 88.80, 9.15], [-2.35, 91.10, 9.18], [-1.45, 93.10, 9.20]], 0.56, 12, 10),
    // Left renal vein (longer, crosses anterior to abdominal aorta at Z ~ 9.85 cm into IVC)
    buildTubeCm([
      [4.25, 106.25, 8.15],
      [3.05, 106.45, 8.65],
      [1.65, 106.75, 9.65],
      [0.25, 106.85, 9.95],
      [-1.55, 106.75, 9.55],
    ], 0.50, 20, 10),
    // Left renal hilar venous tributaries + left suprarenal & gonadal venous stubs
    buildTubeCm([[5.15, 108.35, 7.95], [4.15, 107.15, 8.15], [3.10, 106.45, 8.60]], 0.28, 10, 8),
    buildTubeCm([[5.05, 104.25, 7.95], [4.05, 105.45, 8.15], [3.10, 106.45, 8.60]], 0.28, 10, 8),
    // Right renal vein (short, direct course from right renal hilum into IVC)
    buildTubeCm([
      [-5.15, 104.80, 7.95],
      [-3.95, 105.15, 8.45],
      [-2.75, 105.55, 9.05],
      [-1.65, 105.85, 9.48],
    ], 0.50, 14, 10),
    // Right renal hilar venous tributaries
    buildTubeCm([[-6.00, 106.95, 7.78], [-5.00, 105.75, 7.98], [-3.95, 105.15, 8.45]], 0.28, 10, 8),
    buildTubeCm([[-5.90, 102.95, 7.78], [-4.95, 104.05, 7.98], [-3.95, 105.15, 8.45]], 0.28, 10, 8),
  ];
  const urinary_renal_veins = finalizeCm(mergeBufferGeometries(veinParts));

  return {
    urinary_kidney_L,
    urinary_kidney_R,
    urinary_renal_pelvis,
    urinary_adrenal_caps,
    urinary_ureters,
    urinary_bladder,
    urinary_urethra,
    urinary_renal_arteries,
    urinary_renal_veins,
  };
}
