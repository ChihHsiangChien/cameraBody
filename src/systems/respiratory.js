// Dedicated 3D Respiratory System + Skeleton + Respiratory Muscles module
// (2. 呼吸系統＋骨骼＋呼吸相關肌肉：上下呼吸道・左右肺葉・橫膈膜・肋間肌・輔助呼吸肌・全身骨骼)

import * as THREE from 'three';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  mergeBufferGeometries,
  meshInCm,
  splitGeometryByComponents,
} from '../neuro-builder.js';

export const RESPIRATORY_META = Object.freeze({
  id: 'respiratory',
  titleZh: '呼吸系統 3D 專頁',
  titleEn: '3D Respiratory System',
  subtitleZh: '上下呼吸道・左右肺葉・橫膈與呼吸肌群・胸廓骨骼',
  subtitleEn: 'Airways · Lungs · Diaphragm & Respiratory Muscles · Skeleton',
});

export const RESPIRATORY_CATEGORIES = Object.freeze([
  {
    id: 'airways',
    icon: '●',
    nameZh: '上下呼吸道與支氣管樹 (Airways & Bronchial Tree)',
    nameEn: 'Upper & Lower Airways & Bronchial Tree',
    color: '#38bdf8',
  },
  {
    id: 'lungs',
    icon: '◆',
    nameZh: '左右肺臟與各肺葉 (Left & Right Lung Lobes)',
    nameEn: 'Left & Right Lung Lobes (Superior, Middle, Inferior)',
    color: '#f09898',
  },
  {
    id: 'respiratoryMuscles',
    icon: '✦',
    nameZh: '呼吸相關肌肉 (橫膈膜・肋間肌・胸鎖乳突肌與斜角肌・腹壁輔助呼吸肌)',
    nameEn: 'Respiratory Muscles (Diaphragm, Intercostals, Accessory Neck & Abdominal)',
    color: '#c84b31',
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
    nameEn: 'Skull (Cranium & Mandible)',
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

export const RESPIRATORY_STRUCTURES = Object.freeze([
  // --- 1. 上下呼吸道與支氣管樹 (Airways & Bronchial Tree) ---
  {
    id: 'nasalPharynx',
    category: 'airways',
    nameZh: '鼻腔、副鼻竇與咽部 (鼻咽・口咽・喉咽)',
    nameEn: 'Nasal Cavity, Paranasal Sinuses & Pharynx (Nasopharynx, Oropharynx, Laryngopharynx)',
    pinZh: '鼻腔與咽部 (上呼吸道)',
    pinEn: 'Nasal Cavity & Pharynx',
    anchorL: [0.008, 0.355, 0.078],
    bundle: 'custom',
    meshes: ['resp_nasal_pharynx'],
    color: '#f472b6',
    descZh: '上呼吸道起始段，包含左右鼻腔（具上、中、下鼻甲以加溫、加濕並過濾吸入空氣）、副鼻竇（額竇、上頷竇、蝶竇）及咽部（鼻咽、口咽、喉咽），為空氣進入喉部的共同通道。',
    descEn: 'Upper respiratory tract comprising the bilateral nasal cavities (with superior, middle, and inferior nasal conchae that warm, humidify, and filter inspired air), paranasal sinuses, and the three divisions of the pharynx.',
  },
  {
    id: 'larynxCartilages',
    category: 'airways',
    nameZh: '喉部與甲狀／環狀軟骨、會厭',
    nameEn: 'Larynx, Thyroid & Cricoid Cartilages, Epiglottis & Vocal Folds',
    pinZh: '喉部與聲門',
    pinEn: 'Larynx & Vocal Folds',
    anchorL: [0.0000, 0.2700, 0.0330],
    bundle: 'custom',
    meshes: ['resp_larynx'],
    color: '#38bdf8',
    descZh: '位於頸前 C3–C6 高度，由甲狀軟骨（喉結）、環狀軟骨、杓狀軟骨與葉狀會厭軟骨構成；吞嚥時會厭下蓋防止食物誤入氣管，腔內聲帶振動則負責發聲並調節氣流。',
    descEn: 'Located anteriorly at C3–C6, formed by the thyroid, cricoid, arytenoid, and epiglottic cartilages; protects the lower airway during swallowing and houses the vocal folds for phonation.',
  },
  {
    id: 'tracheaBronchi',
    category: 'airways',
    nameZh: '氣管、隆突與左右主支氣管／葉支氣管樹',
    nameEn: 'Trachea, Carina & Bilateral Bronchial Tree',
    pinZh: '氣管與支氣管樹',
    pinEn: 'Trachea & Bronchial Tree',
    anchorL: [0.0010, 0.1210, 0.0230],
    bundle: 'custom',
    meshes: ['resp_trachea_bronchi'],
    color: '#7dd3fc',
    descZh: '自環狀軟骨下緣（C6）垂直下行至胸骨角高度（T4/T5 氣管隆突），由 16–20 個 C 形透明軟骨環支撐；於隆突分為較粗直的右主支氣管與較細長的左主支氣管，再逐級分支為葉支氣管與肺段支氣管深入各肺葉。',
    descEn: 'Extends from the cricoid cartilage (C6) to the carina (T4/T5), reinforced by C-shaped hyaline cartilage rings; bifurcates into right and left main bronchi, lobar bronchi, and segmental bronchial trees supplying all five lung lobes.',
  },

  // --- 2. 左右肺臟與各肺葉 (Left & Right Lung Lobes) ---
  {
    id: 'rightLungUpper',
    category: 'lungs',
    nameZh: '右肺上葉 (Right Superior Lobe)',
    nameEn: 'Right Lung: Superior (Upper) Lobe',
    pinZh: '右肺上葉',
    pinEn: 'Right Superior Lobe',
    anchorL: [-0.052, 0.155, 0.038],
    bundle: 'custom',
    meshes: ['lung_right_upper'],
    color: '#f29b9b',
    descZh: '位於右肺水平裂與斜裂上方，肺尖向上突入頸根部鎖骨上方；包含尖段、後段與前段三個肺支氣管肺段，接受右上葉支氣管通氣。',
    descEn: 'Situated above the horizontal and oblique fissures of the right lung with its apex projecting into the root of the neck; comprises apical, posterior, and anterior bronchopulmonary segments.',
  },
  {
    id: 'rightLungMiddle',
    category: 'lungs',
    nameZh: '右肺中葉 (Right Middle Lobe)',
    nameEn: 'Right Lung: Middle Lobe',
    pinZh: '右肺中葉',
    pinEn: 'Right Middle Lobe',
    anchorL: [-0.056, 0.055, 0.068],
    bundle: 'custom',
    meshes: ['lung_right_middle'],
    color: '#ea8a8a',
    descZh: '右肺特有之楔形肺葉，介於水平裂（上方）與斜裂（後下方）之間，緊貼前胸壁第四至第六肋軟骨與心包右側；分為外側段與內側段。',
    descEn: 'Wedge-shaped lobe unique to the right lung bounded superiorly by the horizontal fissure and posteroinferiorly by the oblique fissure; divided into lateral and medial segments.',
  },
  {
    id: 'rightLungLower',
    category: 'lungs',
    nameZh: '右肺下葉 (Right Inferior Lobe)',
    nameEn: 'Right Lung: Inferior (Lower) Lobe',
    pinZh: '右肺下葉',
    pinEn: 'Right Inferior Lobe',
    anchorL: [-0.062, 0.025, -0.002],
    bundle: 'custom',
    meshes: ['lung_right_lower'],
    color: '#df7a7a',
    descZh: '位於右肺斜裂後下方，為右肺體積最大的肺葉，底部呈凹面（膈面）緊貼右側橫膈穹窿上方；包含背段及內、前、外、後四個基底段。',
    descEn: 'Largest lobe of the right lung located posteroinferior to the oblique fissure, with its concave diaphragmatic base resting on the right dome of the diaphragm; contains superior and four basal segments.',
  },
  {
    id: 'leftLungUpper',
    category: 'lungs',
    nameZh: '左肺上葉 (含心切跡與舌葉)',
    nameEn: 'Left Lung: Superior Lobe (with Cardiac Notch & Lingula)',
    pinZh: '左肺上葉',
    pinEn: 'Left Superior Lobe',
    anchorL: [0.054, 0.135, 0.038],
    bundle: 'custom',
    meshes: ['lung_left_upper'],
    color: '#f09595',
    descZh: '位於左肺斜裂前上方，因心臟偏向左側，其前緣下部形成明顯的「心切跡 (Cardiac Notch)」，下方延伸出對應右肺中葉的「舌葉 (Lingula：上舌段與下舌段)」。',
    descEn: 'Anterosuperior to the left oblique fissure; features a prominent cardiac notch on its anterior border accommodating the heart and an inferior tongue-like projection called the lingula (homologous to the right middle lobe).',
  },
  {
    id: 'leftLungLower',
    category: 'lungs',
    nameZh: '左肺下葉 (Left Inferior Lobe)',
    nameEn: 'Left Lung: Inferior (Lower) Lobe',
    pinZh: '左肺下葉',
    pinEn: 'Left Inferior Lobe',
    anchorL: [0.068, 0.030, 0.008],
    bundle: 'custom',
    meshes: ['lung_left_lower'],
    color: '#e07c7c',
    descZh: '位於左肺斜裂後下方，構成左肺背側大部與底面（膈面），緊貼左側橫膈穹窿（下方隔橫膈與胃底及脾臟相鄰）。',
    descEn: 'Located posteroinferior to the left oblique fissure, forming most of the posterior aspect and concave diaphragmatic base of the left lung over the left dome of the diaphragm.',
  },

  // --- 3. 呼吸相關肌肉 (Respiratory Muscles: 橫膈膜・肋間肌・頸部輔助吸氣肌・腹壁呼氣肌) ---
  {
    id: 'diaphragmMuscle',
    category: 'respiratoryMuscles',
    nameZh: '橫膈膜 (主要吸氣肌・左右穹窿與中央腱)',
    nameEn: 'Thoracic Diaphragm (Primary Inspiratory Muscle)',
    pinZh: '橫膈膜 (主要吸氣肌)',
    pinEn: 'Diaphragm (Primary Inspiratory)',
    anchorL: [-0.0450, -0.0490, 0.0350],
    bundle: 'custom',
    meshes: ['resp_diaphragm'],
    color: '#c83e31',
    opacity: 1.0,
    transparent: false,
    depthWrite: true,
    descZh: '分隔胸腔與腹腔的雙穹窿狀骨骼肌與中央腱（右穹窿因肝臟頂托較左穹窿略高），由頸神經叢膈神經 (C3–C5) 支配；吸氣時收縮向下拉平，使胸腔垂直徑增大、產生胸膜腔負壓引導空氣入肺，負擔平靜呼吸約 75% 的通氣量。',
    descEn: 'Double-domed musculotendinous partition between the thoracic and abdominal cavities innervated by the phrenic nerves (C3–C5); flattens inferiorly during contraction to increase intrathoracic volume, driving ~75% of quiet inspiration.',
  },
  {
    id: 'intercostalMuscles',
    category: 'respiratoryMuscles',
    nameZh: '內外肋間肌與胸廓呼吸肌群 (提肋吸氣・降肋呼氣)',
    nameEn: 'External & Internal Intercostal & Thoracic Wall Muscles',
    pinZh: '內外肋間肌與胸肌',
    pinEn: 'Intercostal & Pectoral Muscles',
    anchorL: [0.1050, 0.0530, 0.0250],
    bundle: 'custom',
    meshes: ['resp_intercostals'],
    color: '#b83b2a',
    opacity: 0.48,
    transparent: true,
    depthWrite: false,
    descZh: '分布於十二對肋骨間隙及前外側胸廓（含外肋間肌、內肋間肌、前鋸肌與胸大／胸小肌）；外肋間肌收縮時向上向外提起肋骨（「桶柄運動」與「泵柄運動」）以擴大胸廓前後與左右橫徑協助吸氣，內肋間肌則於用力呼氣時拉降肋骨。預設採半透明顯示以便透視內部肺葉與支氣管樹。',
    descEn: 'Spans the 11 intercostal spaces and anterolateral thoracic wall; external intercostals elevate the ribs (bucket-handle and pump-handle motions) to expand anteroposterior and transverse thoracic diameters during inspiration, while internal intercostals depress the ribs in forced expiration. Rendered semi-transparent by default so the underlying lungs and bronchial tree remain clearly visible.',
  },
  {
    id: 'neckAccessoryMuscles',
    category: 'respiratoryMuscles',
    nameZh: '頸部輔助吸氣肌 (胸鎖乳突肌・前中後斜角肌)',
    nameEn: 'Accessory Inspiratory Neck Muscles (Sternocleidomastoid & Scalenes)',
    pinZh: '頸部輔助吸氣肌 (斜角肌等)',
    pinEn: 'Accessory Inspiratory Neck Muscles',
    anchorL: [0.038, 0.260, 0.025],
    bundle: 'custom',
    meshes: ['muscle_neck_L', 'muscle_neck_R'],
    color: '#d45546',
    opacity: 0.85,
    transparent: true,
    depthWrite: true,
    descZh: '包含雙側胸鎖乳突肌（起自乳突，止於胸骨柄與鎖骨內側）及前、中、後斜角肌（起自頸椎橫突，止於第一、二肋骨）；於深吸氣、運動或呼吸困難時強力收縮，向上提舉胸骨與上肋骨以進一步擴大上胸腔容積。',
    descEn: 'Bilateral sternocleidomastoid and anterior, middle, and posterior scalene muscles; elevate the manubrium of the sternum and the first two ribs to expand upper thoracic volume during deep or labored inspiration.',
  },
  {
    id: 'abdominalExpiratoryMuscles',
    category: 'respiratoryMuscles',
    nameZh: '腹壁用力呼氣肌群 (腹直肌・腹內外斜肌・腹橫肌)',
    nameEn: 'Abdominal Expiratory Muscles (Rectus Abdominis, Obliques & Transversus)',
    pinZh: '腹壁呼氣肌群',
    pinEn: 'Abdominal Expiratory Muscles',
    anchorL: [0.065, -0.130, 0.102],
    bundle: 'custom',
    meshes: ['muscle_abdomen_L', 'muscle_abdomen_R'],
    color: '#c0483a',
    opacity: 0.30,
    transparent: true,
    depthWrite: false,
    descZh: '包含腹直肌、腹外斜肌、腹內斜肌與腹橫肌，為人體最強大的用力呼氣肌群；收縮時拉降下肋骨並大幅增加腹內壓，將放鬆的橫膈膜向上推入胸腔，在運動換氣、吹氣與咳嗽反射排痰中扮演關鍵角色。預設採半透明顯示以便透視橫膈膜與下胸廓。',
    descEn: 'Rectus abdominis, external/internal obliques, and transversus abdominis forming the primary muscles of forced expiration; compress abdominal viscera to drive the relaxed diaphragm superiorly and depress the lower ribs during coughing and vigorous exhalation. Rendered semi-transparent by default so the diaphragm remains clearly visible.',
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
    descZh: '位於咽喉與氣管頸段後方之 7 節頸椎，為斜角肌（輔助吸氣肌）起點，且 C3–C5 椎間孔發出支配橫膈膜的膈神經。',
    descEn: 'Seven cervical vertebrae posterior to the pharynx and cervical trachea; provide attachment for the scalene muscles and transmit the C3–C5 roots of the phrenic nerve.',
  },
  {
    id: 'thoracicSpine',
    category: 'spine',
    nameZh: '胸椎 (T1–T12：十二節胸椎，與肋骨形成肋椎關節)',
    nameEn: 'Thoracic Vertebrae (T1–T12, Separated from Ribs)',
    bundle: 'custom',
    meshes: ['spine_thoracic'],
    color: '#dfd7ca',
    descZh: '構成胸腔後壁中軸的 12 節胸椎（已與肋骨分離），椎體與橫突具肋凹與十二對肋骨形成肋椎關節，作為呼吸時肋骨升降運動的樞紐支點。',
    descEn: 'Twelve thoracic vertebrae forming the posterior pillar of the thoracic cage; articulate with all 12 pairs of ribs at the costovertebral and costotransverse joints to allow respiratory rib elevation and depression.',
  },
  {
    id: 'lumbarSpine',
    category: 'spine',
    nameZh: '腰椎 (L1–L5：五節腰椎，橫膈左右膈腳附著處)',
    nameEn: 'Lumbar Vertebrae (L1–L5, Origin of Diaphragmatic Crura)',
    bundle: 'custom',
    meshes: ['spine_lumbar'],
    color: '#dad1c3',
    descZh: '五節粗壯腰椎，其中 L1–L3 椎體前側面為橫膈膜左、右膈腳 (Left & Right Crura) 的堅固骨性起點，吸氣時錨定橫膈後緣向下牽引。',
    descEn: 'Five lumbar vertebrae; the anterior bodies of L1–L3 anchor the right and left musculotendinous crura of the thoracic diaphragm.',
  },
  {
    id: 'sacrumSpine',
    category: 'spine',
    nameZh: '薦椎與尾椎 (Sacrum)',
    nameEn: 'Sacrum (S1–S5)',
    bundle: 'custom',
    meshes: ['spine_sacrum'],
    color: '#d5ccbe',
    descZh: '由 5 節薦椎融合而成之骨盆後壁中軸骨，與雙側髖骨共同穩定腹腔與骨盆底部以支撐呼吸時的腹內壓變化。',
    descEn: 'Fused triangular axial bone at the base of the vertebral column stabilizing the abdominopelvic cavity during respiratory pressure changes.',
  },

  // --- 5. 頭骨 (Skull) ---
  {
    id: 'cranium',
    category: 'skull',
    nameZh: '顱骨 (含鼻骨・篩骨・上頷骨等上呼吸道骨性支架)',
    nameEn: 'Cranium (Supporting Nasal Cavity & Sinuses)',
    bundle: 'head',
    meshes: ['cranium'],
    color: '#dfd8cc',
    descZh: '腦顱與面顱骨骼，其中鼻骨、篩骨、蝶骨、犁骨、腭骨與上頷骨共同圍成骨性鼻腔與四大副鼻竇，乳突則為胸鎖乳突肌上端附著點。',
    descEn: 'Cranial and facial skeleton forming the bony nasal cavity, hard palate, paranasal sinuses, and mastoid attachment of the sternocleidomastoid muscle.',
  },
  {
    id: 'jaw',
    category: 'skull',
    nameZh: '下頜骨',
    nameEn: 'Mandible',
    bundle: 'head',
    meshes: ['jaw'],
    color: '#dfd8cc',
    descZh: '構成口腔下緣與下頷舌骨肌附著處，維持口咽部氣道通暢。',
    descEn: 'Lower jaw bone supporting the floor of the mouth and maintaining patency of the oropharyngeal airway.',
  },

  // --- 6. 胸廓肋骨・骨盆・四肢與雙手骨骼 (Skeleton) ---
  {
    id: 'ribcageSternum',
    category: 'skeleton',
    nameZh: '胸廓：十二對肋骨與胸骨 (保護左右肺並參與呼吸起伏)',
    nameEn: 'Ribcage: 12 Pairs of Ribs & Sternum (Thoracic Cage)',
    bundle: 'custom',
    meshes: ['skel_ribcage'],
    color: '#d4ccc0',
    descZh: '由左右 12 對肋骨與前方胸骨（胸骨柄、胸骨體、劍突）組成之彈性骨性胸廓，環繞保護左右肺臟，並隨肋間肌與橫膈膜收縮作「泵柄」與「桶柄」擴張運動（可單獨隱藏以清楚觀察各肺葉與支氣管樹）。',
    descEn: 'Twelve pairs of ribs and the sternum forming the protective elastic thoracic cage around the lungs; moves superiorly and laterally during inspiration and can be toggled off to inspect the lung lobes and bronchial tree unobstructed.',
  },
  {
    id: 'shoulderGirdle',
    category: 'skeleton',
    nameZh: '肩帶：左右鎖骨與肩胛骨',
    nameEn: 'Shoulder Girdle: Clavicles & Scapulae',
    bundle: 'custom',
    meshes: ['skel_shoulder'],
    color: '#d2cabe',
    descZh: '左右鎖骨與肩胛骨，為胸鎖乳突肌、鎖骨下肌、胸小肌與前鋸肌等輔助呼吸肌群之重要附著支點。',
    descEn: 'Bilateral clavicles and scapulae serving as bony anchors for accessory respiratory muscles including the sternocleidomastoid, pectoralis minor, and serratus anterior.',
  },
  {
    id: 'pelvisBones',
    category: 'skeleton',
    nameZh: '骨盆：左右髖骨 (腹壁呼氣肌群下緣附著處)',
    nameEn: 'Pelvis: Left & Right Hip Bones',
    bundle: 'custom',
    meshes: ['skel_pelvis'],
    color: '#d0c8bc',
    descZh: '左右髖骨（髂嵴、恥骨聯合與恥骨結節），為腹直肌、腹外斜肌、腹內斜肌與腹橫肌等用力呼氣肌群的下方骨性起止點。',
    descEn: 'Bilateral hip bones (iliac crest and pubic symphysis) anchoring the inferior attachments of the abdominal expiratory muscles.',
  },
  {
    id: 'upperLimbBones',
    category: 'skeleton',
    nameZh: '上肢骨骼 (肱骨・橈骨・尺骨)',
    nameEn: 'Upper Limb Bones (Humerus, Radius, Ulna)',
    bundle: 'body',
    meshes: ['arm_humerus_L', 'arm_humerus_R', 'arm_forearm_L', 'arm_forearm_R'],
    color: '#cfc7ba',
    descZh: '包含左右上臂肱骨以及前臂橈骨、尺骨；當上肢固定時，胸大肌可反向牽引肋骨協助深吸氣。',
    descEn: 'Bilateral humerus, radius, and ulna; when the upper limbs are fixed, the pectoralis major can act in reverse to elevate the ribs during labored breathing.',
  },
  {
    id: 'handBones',
    category: 'skeleton',
    nameZh: '雙手骨骼 (腕骨・掌骨・五指指骨)',
    nameEn: 'Hand Bones (Carpals, Metacarpals, Phalanges)',
    bundle: 'custom',
    meshes: ['hand_bones_L', 'hand_bones_R'],
    color: '#d8d0c3',
    descZh: '左右雙手共 54 塊骨骼（腕骨、掌骨與指骨），提供全身骨骼比例參照。',
    descEn: 'Complete bilateral hand skeletons (8 carpals, 5 metacarpals, and 14 phalanges per hand).',
  },
  {
    id: 'lowerLimbBones',
    category: 'skeleton',
    nameZh: '下肢與足部骨骼 (股骨・脛腓骨・足骨)',
    nameEn: 'Lower Limb & Foot Bones',
    bundle: 'body',
    meshes: ['leg_femur_L', 'leg_femur_R', 'leg_shin_L', 'leg_shin_R', 'foot_L', 'foot_R'],
    color: '#cfc7ba',
    descZh: '包含左右大腿股骨、髕骨、小腿脛骨與腓骨及足部骨骼。',
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
    descZh: '半透明人體外框輪廓背景，提供上下呼吸道、左右肺葉、橫膈膜與呼吸肌群在人體空間中的相對位置參照。',
    descEn: 'Translucent human body contour providing spatial reference for the airways, lungs, diaphragm, and respiratory muscles.',
  },
]);

/** Sweep a smooth 3D tube along an array of [x, y, z] points in BodyParts3D cm. */
function buildTubeCm(points, radiusCm = 0.25, tubularSegments = 20, radialSegments = 10) {
  const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5);
  return new THREE.TubeGeometry(curve, tubularSegments, radiusCm, radialSegments, false);
}

/** Build an ellipsoid/sphere BufferGeometry positioned and oriented in BodyParts3D cm. */
function buildEllipsoidCm(cx, cy, cz, rx, ry, rz, widthSeg = 14, heightSeg = 10) {
  const g = new THREE.SphereGeometry(1, widthSeg, heightSeg);
  const m = new THREE.Matrix4()
    .makeTranslation(cx, cy, cz)
    .multiply(new THREE.Matrix4().makeScale(rx, ry, rz));
  g.applyMatrix4(m);
  return g;
}

/**
 * Split a BufferGeometry into multiple named buckets based on each triangle's centroid (cx, cy, cz).
 */
function splitGeometryByTriangleCentroid(geometry, classifyTriangle) {
  const pos = geometry.attributes.position;
  const idx = geometry.index ? geometry.index.array : null;
  const nv = pos.count;

  const trisByBucket = new Map();
  const triCount = idx ? idx.length : nv;

  for (let i = 0; i < triCount; i += 3) {
    const a = idx ? idx[i] : i;
    const b = idx ? idx[i + 1] : i + 1;
    const c = idx ? idx[i + 2] : i + 2;

    const cx = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
    const cy = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
    const cz = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;

    const bucket = classifyTriangle({ cx, cy, cz });
    if (!trisByBucket.has(bucket)) trisByBucket.set(bucket, []);
    trisByBucket.get(bucket).push(a, b, c);
  }

  const result = {};
  for (const [bucket, triIndices] of trisByBucket.entries()) {
    const remap = new Int32Array(nv).fill(-1);
    const coords = [];
    const localIdx = [];
    for (let i = 0; i < triIndices.length; i++) {
      const oldV = triIndices[i];
      let newV = remap[oldV];
      if (newV < 0) {
        newV = coords.length / 3;
        remap[oldV] = newV;
        coords.push(pos.getX(oldV), pos.getY(oldV), pos.getZ(oldV));
      }
      localIdx.push(newV);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(coords), 3));
    const IndexArray = coords.length / 3 > 65535 ? Uint32Array : Uint16Array;
    g.setIndex(new THREE.BufferAttribute(new IndexArray(localIdx), 1));
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
    result[bucket] = g;
  }
  return result;
}

/**
 * 1. Build Upper Airways: Nasal Cavity (left/right passages + superior/middle/inferior conchae),
 *    Paranasal Sinuses (frontal, maxillary, sphenoid), and Pharynx (nasopharynx, oropharynx, laryngopharynx).
 */
function buildNasalPharynxCm() {
  const parts = [];

  for (const sign of [1, -1]) {
    // Main left & right nasal cavity passages (from nostrils/vestibule at Z=18.8 back to choanae at Z=12.0)
    parts.push(buildTubeCm([
      [sign * 0.65, 148.9, 18.7],
      [sign * 0.85, 150.2, 17.2],
      [sign * 0.90, 150.6, 15.0],
      [sign * 0.78, 150.2, 13.0],
      [sign * 0.50, 149.4, 11.4],
    ], 0.58, 18, 10));

    // Superior, Middle, and Inferior Nasal Conchae (Turbinates — 上、中、下鼻甲)
    parts.push(buildTubeCm([
      [sign * 0.95, 152.2, 16.4],
      [sign * 1.05, 152.0, 14.8],
      [sign * 0.85, 151.4, 13.2],
    ], 0.30, 14, 8));
    parts.push(buildTubeCm([
      [sign * 1.10, 150.8, 17.0],
      [sign * 1.18, 150.6, 15.0],
      [sign * 0.95, 150.1, 13.0],
    ], 0.36, 14, 8));
    parts.push(buildTubeCm([
      [sign * 1.15, 149.3, 17.5],
      [sign * 1.22, 149.2, 15.2],
      [sign * 0.98, 149.0, 12.8],
    ], 0.40, 14, 8));

    // Frontal Sinus (額竇)
    parts.push(buildEllipsoidCm(sign * 1.15, 155.1, 17.1, 0.88, 0.95, 0.55));
    // Maxillary Sinus (上頷竇)
    parts.push(buildEllipsoidCm(sign * 2.35, 149.8, 15.4, 1.15, 1.45, 1.35));
    // Sphenoid Sinus (蝶竇)
    parts.push(buildEllipsoidCm(sign * 0.65, 152.3, 12.1, 0.58, 0.68, 0.72));
  }

  // Pharynx: Nasopharynx (鼻咽) -> Oropharynx (口咽) -> Laryngopharynx (喉咽)
  parts.push(buildTubeCm([
    [0.0, 151.0, 11.6],
    [0.0, 149.4, 11.0],
    [0.0, 147.5, 10.6],
    [0.0, 145.6, 10.4],
    [0.0, 143.8, 10.6],
    [0.0, 142.2, 11.2],
  ], 0.92, 22, 12));

  // Lateral pharyngeal walls widening the pharyngeal vault
  for (const sign of [1, -1]) {
    parts.push(buildTubeCm([
      [sign * 0.65, 150.2, 11.3],
      [sign * 0.72, 147.8, 10.7],
      [sign * 0.68, 145.2, 10.5],
      [sign * 0.52, 142.6, 11.2],
    ], 0.56, 16, 8));
  }

  // Oral airway connection into Oropharynx (口咽氣道接口)
  parts.push(buildTubeCm([
    [0.0, 146.4, 15.2],
    [0.0, 146.8, 13.2],
    [0.0, 146.4, 10.9],
  ], 0.75, 14, 10));

  return mergeBufferGeometries(parts);
}

/**
 * 2. Build Larynx & Laryngeal Cartilages (C3–C6):
 *    Epiglottis, Hyoid arch, Thyroid Cartilage (left & right laminae + Adam's apple + horns),
 *    Cricoid Cartilage (signet ring), Arytenoid Cartilages, and Vocal Folds (Glottis).
 */
function buildLarynxCm() {
  const parts = [];

  // Central laryngeal vestibule & cavity from laryngopharynx down to cricoid lower border
  parts.push(buildTubeCm([
    [0.0, 143.2, 11.5],
    [0.0, 142.0, 12.0],
    [0.0, 140.8, 12.1],
    [0.0, 139.4, 12.0],
  ], 0.76, 16, 12));

  // Leaf-shaped Epiglottis (會厭軟骨) rising behind the tongue root
  parts.push(buildEllipsoidCm(0.0, 143.4, 11.7, 0.75, 1.15, 0.24, 14, 10));

  // Hyoid Bone arch (舌骨弓) at Y=143.6 cm
  parts.push(buildTubeCm([
    [-1.45, 143.8, 11.2],
    [-1.15, 143.6, 12.2],
    [0.0, 143.5, 12.8],
    [1.15, 143.6, 12.2],
    [1.45, 143.8, 11.2],
  ], 0.22, 18, 8));

  // Shield-shaped Thyroid Cartilage (甲狀軟骨左右板與喉結)
  parts.push(buildTubeCm([
    [-1.35, 142.3, 11.4],
    [-0.95, 142.2, 12.5],
    [0.0, 142.4, 13.35],
    [0.95, 142.2, 12.5],
    [1.35, 142.3, 11.4],
  ], 0.36, 18, 8));
  parts.push(buildTubeCm([
    [-1.30, 141.3, 11.4],
    [-0.90, 141.3, 12.4],
    [0.0, 141.2, 13.15],
    [0.90, 141.3, 12.4],
    [1.30, 141.3, 11.4],
  ], 0.36, 18, 8));

  // Superior & Inferior Horns of Thyroid Cartilage (甲狀軟骨上下角)
  for (const sign of [1, -1]) {
    parts.push(buildTubeCm([
      [sign * 1.32, 143.3, 11.3],
      [sign * 1.35, 141.8, 11.4],
      [sign * 1.15, 140.4, 11.6],
    ], 0.20, 12, 8));

    // Vocal Folds (左右聲帶) inside the glottis
    parts.push(buildTubeCm([
      [sign * 0.12, 141.5, 12.9],
      [sign * 0.42, 141.5, 12.1],
      [sign * 0.48, 141.5, 11.5],
    ], 0.16, 10, 8));
  }

  // Signet-ring Cricoid Cartilage (環狀軟骨) at C6 (Y=139.9 cm)
  parts.push(buildTubeCm([
    [0.0, 140.2, 11.2],
    [-1.05, 140.0, 11.8],
    [0.0, 139.8, 12.85],
    [1.05, 140.0, 11.8],
    [0.0, 140.2, 11.2],
  ], 0.34, 20, 8));

  return mergeBufferGeometries(parts);
}

/**
 * 3. Build Trachea (with C-shaped cartilaginous rings), Carina, Left & Right Main Bronchi,
 *    Lobar Bronchi, and Segmental Bronchial Tree branching into all 5 lung lobes.
 */
function buildTracheaAndBronchialTreeCm() {
  const parts = [];

  // Main Tracheal Trunk from C6 (Y=139.5) down to Carina at T4/T5 (Y=128.8)
  const tracheaPath = [
    [0.0, 139.5, 12.0],
    [0.0, 136.8, 11.7],
    [-0.05, 134.0, 11.3],
    [-0.08, 131.2, 10.9],
    [-0.10, 128.8, 10.6],
  ];
  parts.push(buildTubeCm(tracheaPath, 0.72, 24, 12));

  // 15 C-shaped Tracheal Cartilage Rings (氣管軟骨環) along the trachea
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    const y = 139.1 - t * 9.8;
    const z = 11.95 - t * 1.3;
    const x0 = -0.08 * t;
    parts.push(buildTubeCm([
      [x0 - 0.78, y, z - 0.35],
      [x0 - 0.85, y, z + 0.30],
      [x0, y, z + 0.86],
      [x0 + 0.85, y, z + 0.30],
      [x0 + 0.78, y, z - 0.35],
    ], 0.14, 14, 6));
  }

  // --- RIGHT BRONCHIAL TREE (右支氣管樹：X < 0) ---
  // Right Main Bronchus (右主支氣管) & Bronchus Intermedius
  parts.push(buildTubeCm([
    [-0.10, 128.8, 10.6],
    [-1.60, 127.6, 10.5],
    [-2.80, 126.5, 10.3],
    [-3.60, 124.2, 10.0],
    [-4.50, 121.2, 9.2],
  ], 0.56, 20, 10));

  // 1) Right Superior Lobar Bronchus (右上葉支氣管: Apical, Posterior, Anterior segments)
  parts.push(buildTubeCm([
    [-2.35, 127.0, 10.4],
    [-4.10, 128.6, 10.8],
    [-5.20, 131.5, 11.0],
    [-5.00, 134.8, 10.8],
  ], 0.36, 16, 8));
  parts.push(buildTubeCm([
    [-4.10, 128.6, 10.8],
    [-5.80, 130.6, 8.2],
    [-6.60, 132.5, 6.2],
  ], 0.28, 12, 8));
  parts.push(buildTubeCm([
    [-4.10, 128.6, 10.8],
    [-5.80, 129.4, 13.6],
    [-7.10, 130.2, 16.0],
  ], 0.28, 12, 8));
  // Subsegmental branches in Right Upper Lobe
  parts.push(buildTubeCm([[-5.20, 131.5, 11.0], [-7.40, 133.2, 12.2]], 0.20, 8, 6));
  parts.push(buildTubeCm([[-5.80, 129.4, 13.6], [-8.20, 127.6, 14.8]], 0.20, 8, 6));

  // 2) Right Middle Lobar Bronchus (右中葉支氣管: Lateral & Medial segments)
  parts.push(buildTubeCm([
    [-3.55, 124.4, 10.1],
    [-4.90, 122.6, 12.6],
    [-6.20, 120.8, 14.8],
    [-4.60, 118.8, 16.8],
  ], 0.32, 16, 8));
  parts.push(buildTubeCm([
    [-4.90, 122.6, 12.6],
    [-7.40, 121.2, 13.5],
    [-9.20, 119.8, 14.6],
  ], 0.25, 12, 8));

  // 3) Right Inferior Lobar Bronchus (右下葉支氣管: Superior & 4 Basal segments)
  parts.push(buildTubeCm([
    [-4.10, 122.4, 9.5],
    [-5.20, 124.0, 6.8],
    [-6.20, 125.4, 4.6],
  ], 0.27, 12, 8));
  parts.push(buildTubeCm([
    [-4.50, 121.2, 9.2],
    [-5.60, 117.8, 8.6],
    [-6.40, 114.2, 5.4],
  ], 0.34, 16, 8));
  parts.push(buildTubeCm([
    [-5.20, 119.0, 8.8],
    [-7.60, 116.8, 9.2],
    [-9.80, 114.5, 9.4],
  ], 0.26, 12, 8));
  parts.push(buildTubeCm([
    [-5.20, 119.0, 8.8],
    [-6.80, 116.8, 11.8],
    [-8.20, 114.6, 14.2],
  ], 0.25, 12, 8));
  parts.push(buildTubeCm([
    [-4.80, 119.8, 9.0],
    [-3.60, 116.5, 9.5],
    [-2.80, 114.0, 10.2],
  ], 0.22, 10, 6));

  // --- LEFT BRONCHIAL TREE (左支氣管樹：X > 0) ---
  // Left Main Bronchus (左主支氣管 — longer, passes beneath aortic arch)
  parts.push(buildTubeCm([
    [-0.10, 128.8, 10.6],
    [1.65, 127.4, 10.5],
    [3.35, 126.2, 10.3],
    [4.45, 124.2, 9.8],
  ], 0.52, 18, 10));

  // 1) Left Superior Lobar Bronchus (左上葉支氣管: Superior division + Lingular division)
  parts.push(buildTubeCm([
    [3.35, 126.2, 10.3],
    [4.75, 128.2, 11.0],
    [5.40, 131.6, 10.8],
    [5.10, 134.8, 10.5],
  ], 0.35, 16, 8));
  parts.push(buildTubeCm([
    [4.75, 128.2, 11.0],
    [6.10, 130.6, 8.0],
    [7.00, 132.4, 6.0],
  ], 0.27, 12, 8));
  parts.push(buildTubeCm([
    [4.75, 128.2, 11.0],
    [6.40, 129.4, 13.8],
    [7.60, 130.2, 16.0],
  ], 0.27, 12, 8));
  // Lingular Bronchus (左上葉舌葉支氣管: Superior & Inferior lingular segments)
  parts.push(buildTubeCm([
    [4.35, 127.2, 10.8],
    [5.80, 124.6, 13.2],
    [6.80, 121.8, 15.2],
    [6.00, 118.8, 16.8],
  ], 0.28, 16, 8));
  parts.push(buildTubeCm([
    [5.80, 124.6, 13.2],
    [8.20, 123.0, 14.4],
  ], 0.21, 10, 6));

  // 2) Left Inferior Lobar Bronchus (左下葉支氣管: Superior & Basal segments)
  parts.push(buildTubeCm([
    [4.45, 124.2, 9.8],
    [5.50, 120.5, 8.8],
    [6.60, 116.8, 7.6],
    [6.80, 113.8, 5.4],
  ], 0.36, 18, 8));
  parts.push(buildTubeCm([
    [4.95, 122.4, 9.2],
    [6.10, 124.2, 6.6],
    [7.00, 125.5, 4.6],
  ], 0.26, 12, 8));
  parts.push(buildTubeCm([
    [5.80, 119.2, 8.5],
    [8.00, 116.8, 9.2],
    [9.90, 114.4, 9.4],
  ], 0.26, 12, 8));
  parts.push(buildTubeCm([
    [5.80, 119.2, 8.5],
    [7.10, 116.8, 11.8],
    [8.20, 114.5, 14.0],
  ], 0.25, 12, 8));

  return mergeBufferGeometries(parts);
}

/**
 * 4. Split `organs_lungs` from `body.json` into the 5 anatomical lung lobes:
 *    - `lung_right_upper` (Right Superior Lobe)
 *    - `lung_right_middle` (Right Middle Lobe, separated by horizontal & oblique fissures)
 *    - `lung_right_lower` (Right Inferior Lobe, separated by oblique fissure)
 *    - `lung_left_upper` (Left Superior Lobe with cardiac notch & lingula)
 *    - `lung_left_lower` (Left Inferior Lobe, separated by oblique fissure)
 */
function buildFiveLungLobes(bodyMeta, bodyGeos, cmToViewer) {
  const lungsEntry = bodyMeta.meshes.find(m => m.name === 'organs_lungs');
  const lungsCm = bodyGeos.organs_lungs.clone().applyMatrix4(makeCmMatrix(lungsEntry.sourceFrame));

  // First separate connected components in BodyParts3D cm:
  // In BodyParts3D, the oblique fissure already separates the lower lobes from the upper/middle lobes!
  const byComp = splitGeometryByComponents(lungsCm, ({ cx, cy }) => {
    if (cx > 0) {
      // Left lung (+X): upper lobe (cy ~ 127.4) vs lower lobe (cy ~ 119.2)
      return cy > 123.0 ? 'lung_left_upper' : 'lung_left_lower';
    }
    // Right lung (-X): lower lobe (cy ~ 119.1) vs combined upper+middle component (cy ~ 125.6)
    return cy < 121.0 ? 'lung_right_lower' : 'right_upper_and_middle';
  });

  // Next split `right_upper_and_middle` across the horizontal fissure of the right lung
  // (located at the level of the 4th costal cartilage anteriorly, Y ~ 124.2 cm, sloping slightly downward posteriorly)
  const rightUpperMidGeo = byComp.right_upper_and_middle;
  const rightSplit = splitGeometryByTriangleCentroid(rightUpperMidGeo, ({ cy, cz }) => {
    const horizontalFissureY = 124.4 - Math.max(0, 15.0 - cz) * 0.18;
    if (cy < horizontalFissureY && cz > 8.2) {
      return 'lung_right_middle';
    }
    return 'lung_right_upper';
  });

  const lobes = {
    lung_right_upper: rightSplit.lung_right_upper,
    lung_right_middle: rightSplit.lung_right_middle,
    lung_right_lower: byComp.lung_right_lower,
    lung_left_upper: byComp.lung_left_upper,
    lung_left_lower: byComp.lung_left_lower,
  };

  for (const g of Object.values(lobes)) {
    if (!g) continue;
    g.applyMatrix4(cmToViewer);
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
  }

  return lobes;
}

/**
 * 5. Build an anatomically accurate 3D Double-Domed Thoracic Diaphragm (`resp_diaphragm`)
 *    right beneath the left and right lungs at Y ≈ 107–115.5 cm, with a slightly higher right dome
 *    (over the liver), a slightly lower left dome (under the heart/left lung), a central tendon,
 *    peripheral costal/sternal muscular skirts, and left & right lumbar crura attaching to L1–L3.
 */
function buildDiaphragmCm() {
  const radialSteps = 32;
  const angularSteps = 44;
  const thicknessCm = 0.58;

  function evalDiaphragmSurface(u, theta, offsetSign) {
    // u in [0, 1] from center (0) to costal margin perimeter (1)
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // Transverse radius (~11.6 cm) and anteroposterior half-depth (~8.0 cm)
    // Posterior notch (sinT < 0 near midline) where the vertebral column sits
    const posteriorIndent = sinT < 0 ? 1.0 - 0.30 * Math.pow(Math.max(0, -sinT), 2.2) * Math.exp(-cosT * cosT * 3.5) : 1.0;
    const rx = 11.4 * u;
    const rz = 7.6 * u * posteriorIndent;

    const x = rx * cosT;
    const z = 10.6 + rz * sinT;

    // Double-domed height profile:
    // - Perimeter skirts attach around Y = 107.6 cm posteriorly to 109.8 cm anteriorly (xiphoid)
    // - Right dome (x < 0, over liver) peaks at Y ~ 115.3 cm at x ~ -5.4 cm
    // - Left dome (x > 0, under heart/left lung) peaks at Y ~ 114.0 cm at x ~ +5.6 cm
    // - Central tendon saddle sits at Y ~ 113.5 cm near x = 0
    const rimY = 108.6 + 1.1 * sinT;
    const domeEnvelope = Math.sin((1 - Math.pow(u, 1.85)) * (Math.PI * 0.5));

    const distRight = Math.hypot((x + 5.2) / 5.4, (z - 10.4) / 5.8);
    const distLeft = Math.hypot((x - 5.4) / 5.4, (z - 10.4) / 5.8);
    const rightCupola = 2.0 * Math.exp(-distRight * distRight * 1.15);
    const leftCupola = 1.1 * Math.exp(-distLeft * distLeft * 1.15);

    const baseLift = 4.8 * domeEnvelope;
    const y = rimY + baseLift + (rightCupola + leftCupola) * (1 - u * u) + offsetSign * (thicknessCm * 0.5);

    return [x, y, z];
  }

  const positions = [];
  const indices = [];

  // Build top and bottom sheets of the double-domed diaphragm
  const ringVerts = angularSteps;
  for (const sheet of [1, -1]) {
    const baseVertex = positions.length / 3;
    // Center vertex
    const [cx0, cy0, cz0] = evalDiaphragmSurface(0, 0, sheet);
    positions.push(cx0, cy0, cz0);

    for (let ir = 1; ir <= radialSteps; ir++) {
      const u = ir / radialSteps;
      for (let ia = 0; ia < angularSteps; ia++) {
        const theta = (ia / angularSteps) * Math.PI * 2;
        const [x, y, z] = evalDiaphragmSurface(u, theta, sheet);
        positions.push(x, y, z);
      }
    }

    // Inner fan triangles
    for (let ia = 0; ia < angularSteps; ia++) {
      const next = (ia + 1) % angularSteps;
      if (sheet > 0) {
        indices.push(baseVertex, baseVertex + 1 + ia, baseVertex + 1 + next);
      } else {
        indices.push(baseVertex, baseVertex + 1 + next, baseVertex + 1 + ia);
      }
    }

    // Quad rings
    for (let ir = 1; ir < radialSteps; ir++) {
      const rowA = baseVertex + 1 + (ir - 1) * ringVerts;
      const rowB = baseVertex + 1 + ir * ringVerts;
      for (let ia = 0; ia < angularSteps; ia++) {
        const next = (ia + 1) % angularSteps;
        const a0 = rowA + ia;
        const a1 = rowA + next;
        const b0 = rowB + ia;
        const b1 = rowB + next;
        if (sheet > 0) {
          indices.push(a0, b0, b1, a0, b1, a1);
        } else {
          indices.push(a0, b1, b0, a0, a1, b1);
        }
      }
    }
  }

  // Stitch outer costal margin rim between top and bottom sheets
  const sheetStride = 1 + radialSteps * ringVerts;
  const topOuterRow = 1 + (radialSteps - 1) * ringVerts;
  const botOuterRow = sheetStride + 1 + (radialSteps - 1) * ringVerts;
  for (let ia = 0; ia < angularSteps; ia++) {
    const next = (ia + 1) % angularSteps;
    const t0 = topOuterRow + ia;
    const t1 = topOuterRow + next;
    const b0 = botOuterRow + ia;
    const b1 = botOuterRow + next;
    indices.push(t0, b0, b1, t0, b1, t1);
  }

  const domeGeo = new THREE.BufferGeometry();
  domeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  domeGeo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  domeGeo.computeVertexNormals();

  // Add Right Crus (右膈腳, longer, L1–L3) and Left Crus (左膈腳, L1–L2) + Median Arcuate Ligament
  const cruraTubes = [
    // Right crus descending from posterior diaphragm onto L1–L3 vertebral bodies
    buildTubeCm([
      [-1.8, 111.5, 7.6],
      [-1.4, 108.5, 7.2],
      [-1.1, 104.8, 7.3],
      [-0.9, 101.2, 7.5],
    ], 0.48, 16, 8),
    // Left crus descending onto L1–L2 vertebral bodies
    buildTubeCm([
      [1.8, 111.3, 7.6],
      [1.4, 108.6, 7.2],
      [1.1, 105.4, 7.3],
      [0.9, 102.8, 7.5],
    ], 0.44, 16, 8),
    // Median & medial arcuate ligament arches over aortic hiatus
    buildTubeCm([
      [-1.4, 109.2, 7.2],
      [0.0, 110.4, 7.4],
      [1.4, 109.2, 7.2],
    ], 0.34, 12, 8),
  ];

  return mergeBufferGeometries([domeGeo, ...cruraTubes]);
}

/**
 * 6. Build External & Internal Intercostal Muscles + Thoracic Respiratory Wall (`resp_intercostals`):
 *    Combines the thoracic/serratus/pectoral components from `muscle_chest_L` & `muscle_chest_R`
 *    with 11 pairs of bilateral intercostal muscle bands sweeping along the ribcage intercostal spaces.
 */
function buildIntercostalMusclesCm(musclesMeta, musclesGeos) {
  const parts = [];

  if (musclesMeta && musclesGeos) {
    for (const mName of ['muscle_chest_L', 'muscle_chest_R']) {
      const entry = musclesMeta.meshes?.find(m => m.name === mName);
      const geo = musclesGeos[mName];
      if (geo && entry?.sourceFrame) {
        parts.push(geo.clone().applyMatrix4(makeCmMatrix(entry.sourceFrame)));
      }
    }
  }

  // Also build 10 pairs of bilateral intercostal muscle bands across the intercostal spaces (Y = 113 to 135 cm)
  for (const sign of [1, -1]) {
    for (let space = 0; space < 10; space++) {
      const t = space / 9;
      const yPost = 135.2 - t * 20.5;
      const yLat = 133.4 - t * 21.0;
      const yAnt = 132.2 - t * 19.5;

      // Ribcage width tapers at the top (ribs 1-2) and widens in the middle/lower thorax (ribs 5-9)
      const widthScale = 0.62 + 0.42 * Math.sin(Math.min(1, (t + 0.15) * 1.1) * Math.PI * 0.78);
      const xLat = sign * (11.2 * widthScale);
      const zPost = 4.2 - 1.2 * Math.sin(t * Math.PI);
      const zLat = 9.6 + 1.0 * Math.sin(t * Math.PI);
      const zAnt = 15.8 + 2.4 * Math.sin(t * Math.PI * 0.85);
      const xAnt = sign * (3.2 + t * 2.8);

      parts.push(buildTubeCm([
        [sign * 2.6, yPost, zPost],
        [xLat * 0.72, (yPost + yLat) * 0.5, (zPost + zLat) * 0.5 - 1.4],
        [xLat, yLat, zLat],
        [xLat * 0.78, (yLat + yAnt) * 0.5, (zLat + zAnt) * 0.5 + 1.2],
        [xAnt, yAnt, zAnt],
      ], 0.36, 18, 6));
    }
  }

  return mergeBufferGeometries(parts);
}

/**
 * Transform a muscle mesh from `muscles.json` into viewer space, with a procedural fallback if omitted.
 */
function buildMuscleViewerGeo(meshName, musclesMeta, musclesGeos, cmToViewer, fallbackBuilderCm) {
  if (musclesMeta && musclesGeos && musclesGeos[meshName]) {
    const entry = musclesMeta.meshes?.find(m => m.name === meshName);
    if (entry?.sourceFrame) {
      const g = musclesGeos[meshName].clone().applyMatrix4(
        cmToViewer.clone().multiply(makeCmMatrix(entry.sourceFrame))
      );
      g.computeVertexNormals();
      g.computeBoundingBox();
      g.computeBoundingSphere();
      return g;
    }
  }
  const fallback = fallbackBuilderCm();
  fallback.applyMatrix4(cmToViewer);
  fallback.computeVertexNormals();
  fallback.computeBoundingBox();
  fallback.computeBoundingSphere();
  return fallback;
}

/**
 * Build all custom 3D respiratory system geometries in normalized viewer space:
 * - Upper & lower airways (`resp_nasal_pharynx`, `resp_larynx`, `resp_trachea_bronchi`)
 * - 5 separated lung lobes (`lung_right_upper`, `lung_right_middle`, `lung_right_lower`, `lung_left_upper`, `lung_left_lower`)
 * - Respiratory muscles (`resp_diaphragm`, `resp_intercostals`, `muscle_neck_L`, `muscle_neck_R`, `muscle_abdomen_L`, `muscle_abdomen_R`)
 */
export function buildRespiratorySystemGeometries({
  bodyMeta,
  bodyGeos,
  musclesMeta = null,
  musclesGeos = null,
  extraMeta = null,
  extraGeos = null,
  cmToViewer = makeCmToViewerMatrix(),
}) {
  const finalizeCm = geoCm => {
    geoCm.applyMatrix4(cmToViewer);
    geoCm.computeVertexNormals();
    geoCm.computeBoundingBox();
    geoCm.computeBoundingSphere();
    return geoCm;
  };

  const lungLobes = buildFiveLungLobes(bodyMeta, bodyGeos, cmToViewer);
  const extraLarynxCm = meshInCm(extraMeta, extraGeos, 'extra_thyroid_cartilage');
  const extraTracheaCm = meshInCm(extraMeta, extraGeos, 'extra_trachea_bronchi');
  const extraDiaphragmCm = meshInCm(extraMeta, extraGeos, 'extra_diaphragm');
  const extraIntercostalsCm = meshInCm(extraMeta, extraGeos, 'extra_intercostals');

  const muscleNeckL = buildMuscleViewerGeo('muscle_neck_L', musclesMeta, musclesGeos, cmToViewer, () =>
    mergeBufferGeometries([
      buildTubeCm([[1.8, 149.5, 7.2], [3.6, 142.0, 10.2], [1.4, 134.8, 14.5]], 0.65, 16, 8),
      buildTubeCm([[2.2, 144.5, 7.6], [3.8, 140.0, 8.8], [4.4, 135.8, 10.2]], 0.52, 14, 8),
    ])
  );
  const muscleNeckR = buildMuscleViewerGeo('muscle_neck_R', musclesMeta, musclesGeos, cmToViewer, () =>
    mergeBufferGeometries([
      buildTubeCm([[-1.8, 149.5, 7.2], [-3.6, 142.0, 10.2], [-1.4, 134.8, 14.5]], 0.65, 16, 8),
      buildTubeCm([[-2.2, 144.5, 7.6], [-3.8, 140.0, 8.8], [-4.4, 135.8, 10.2]], 0.52, 14, 8),
    ])
  );
  const muscleAbdomenL = buildMuscleViewerGeo('muscle_abdomen_L', musclesMeta, musclesGeos, cmToViewer, () =>
    mergeBufferGeometries([
      buildTubeCm([[3.2, 114.5, 17.5], [3.5, 101.0, 19.2], [2.4, 87.5, 17.8]], 1.4, 16, 10),
      buildTubeCm([[9.5, 112.0, 13.5], [10.2, 100.0, 15.2], [8.5, 89.5, 15.5]], 1.2, 16, 10),
    ])
  );
  const muscleAbdomenR = buildMuscleViewerGeo('muscle_abdomen_R', musclesMeta, musclesGeos, cmToViewer, () =>
    mergeBufferGeometries([
      buildTubeCm([[-3.2, 114.5, 17.5], [-3.5, 101.0, 19.2], [-2.4, 87.5, 17.8]], 1.4, 16, 10),
      buildTubeCm([[-9.5, 112.0, 13.5], [-10.2, 100.0, 15.2], [-8.5, 89.5, 15.5]], 1.2, 16, 10),
    ])
  );

  return {
    resp_nasal_pharynx: finalizeCm(buildNasalPharynxCm()),
    resp_larynx: finalizeCm(extraLarynxCm || buildLarynxCm()),
    resp_trachea_bronchi: finalizeCm(extraTracheaCm || buildTracheaAndBronchialTreeCm()),
    ...lungLobes,
    resp_diaphragm: finalizeCm(extraDiaphragmCm || buildDiaphragmCm()),
    resp_intercostals: finalizeCm(extraIntercostalsCm || buildIntercostalMusclesCm(musclesMeta, musclesGeos)),
    muscle_neck_L: muscleNeckL,
    muscle_neck_R: muscleNeckR,
    muscle_abdomen_L: muscleAbdomenL,
    muscle_abdomen_R: muscleAbdomenR,
  };
}
