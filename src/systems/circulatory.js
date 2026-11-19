import * as THREE from 'three';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  mergeBufferGeometries,
} from '../neuro-builder.js';

export const CIRCULATORY_META = Object.freeze({
  id: 'circulatory',
  titleZh: '循環系統 3D 專頁',
  titleEn: '3D Circulatory System',
  subtitleZh: '心臟・動脈・靜脈・微血管網・骨骼系統',
  subtitleEn: 'Heart · Arteries · Veins · Skeleton',
});

export const CIRCULATORY_CATEGORIES = Object.freeze([
  {
    id: 'heart',
    icon: '●',
    nameZh: '心臟與冠狀血管 (Heart & Coronary Vessels)',
    nameEn: 'Heart & Coronary Vessels',
    color: '#cf2e2e',
  },
  {
    id: 'arteries',
    icon: '▲',
    nameZh: '動脈系統 (Arterial System — 主動脈・頭頸・軀幹・四肢動脈)',
    nameEn: 'Arterial System (Aorta, Head/Neck, Trunk & Limb Arteries)',
    color: '#ef4444',
  },
  {
    id: 'veins',
    icon: '▼',
    nameZh: '靜脈與門脈系統 (Venous & Portal System — 上下腔靜脈・頸・四肢靜脈)',
    nameEn: 'Venous & Portal System (Venae Cavae, Jugular, Portal & Limb Veins)',
    color: '#2563eb',
  },
  {
    id: 'spine',
    icon: '◈',
    nameZh: '脊椎骨各節段 (Vertebral Column: 頸椎・胸椎・腰椎・薦椎)',
    nameEn: 'Vertebral Column (Cervical, Thoracic, Lumbar, Sacrum)',
    color: '#e5ded2',
  },
  {
    id: 'skull',
    icon: '▲',
    nameZh: '頭骨 (Skull: 顱骨・下頜骨)',
    nameEn: 'Skull (Cranium & Mandible)',
    color: '#dfd8cc',
  },
  {
    id: 'skeleton',
    icon: '■',
    nameZh: '胸廓肋骨・骨盆・四肢與雙手骨骼',
    nameEn: 'Ribcage, Pelvis, Limb & Hand Bones',
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

export const CIRCULATORY_STRUCTURES = Object.freeze([
  // --- 1. 心臟與冠狀血管 (Heart & Coronary Vessels) ---
  {
    id: 'heartVentricles',
    category: 'heart',
    nameZh: '左右心室與心室肌 (左心室・右心室・心尖)',
    nameEn: 'Left & Right Ventricles (Ventricular Myocardium & Apex)',
    pinZh: '左右心室 (泵血主力)',
    pinEn: 'Left & Right Ventricles',
    anchorL: [0.042, 0.058, 0.088],
    bundle: 'custom',
    meshes: ['heart_ventricles'],
    color: '#cf2e2e',
    descZh: '構成心臟前下方與心尖之厚實心肌腔室：右心室位於前側，將缺氧血泵入肺動脈幹進行肺循環；左心室壁最厚（約右心室 3 倍），產生高壓將充氧血經主動脈泵往全身體循環。',
    descEn: 'Thick-walled lower myocardial chambers forming the cardiac apex; the right ventricle pumps deoxygenated blood into the pulmonary trunk, while the thick-walled left ventricle pumps oxygenated blood into the systemic aorta.',
  },
  {
    id: 'heartAtria',
    category: 'heart',
    nameZh: '左右心房與心耳 (右心房・左心房・左右心耳)',
    nameEn: 'Left & Right Atria & Auricles',
    pinZh: '左右心房',
    pinEn: 'Left & Right Atria',
    anchorL: [-0.024, 0.096, 0.056],
    bundle: 'custom',
    meshes: ['heart_atria'],
    color: '#b83232',
    descZh: '位於心臟基底部（冠狀溝上方）之接收腔室：右心房接收上下腔靜脈與冠狀竇回流之全身缺氧血（頂部含竇房結 SA node 起搏點）；左心房位於後方，接收四條肺靜脈回流之充氧血。',
    descEn: 'Superior-posterior receiving chambers above the coronary sulcus; the right atrium (housing the SA node) receives systemic venous return from the venae cavae, while the left atrium receives oxygenated blood from the four pulmonary veins.',
  },
  {
    id: 'aorticArch',
    category: 'heart',
    nameZh: '升主動脈與主動脈弓 (含頭臂幹・左總頸・左鎖骨下起始部)',
    nameEn: 'Ascending Aorta & Aortic Arch (with Supra-Aortic Roots)',
    pinZh: '主動脈弓',
    pinEn: 'Aortic Arch',
    anchorL: [0.008, 0.158, 0.045],
    bundle: 'custom',
    meshes: ['aortic_arch'],
    color: '#ef4444',
    descZh: '起自左心室主動脈口，先向右前上方上升為升主動脈（根部發出左右冠狀動脈），再於胸骨柄後方轉向左後下方形成主動脈弓，依序發出頭臂幹（無名動脈）、左總頸動脈與左鎖骨下動脈三大分支。',
    descEn: 'Emerges from the left ventricle as the ascending aorta and arches posteriorly over the pulmonary bifurcation, giving rise to the brachiocephalic trunk, left common carotid artery, and left subclavian artery.',
  },
  {
    id: 'pulmonaryVessels',
    category: 'heart',
    nameZh: '肺動脈幹與左右肺動靜脈 (小循環核心血管)',
    nameEn: 'Pulmonary Trunk, Left/Right Pulmonary Arteries & Pulmonary Veins',
    pinZh: '肺動脈幹與肺靜脈',
    pinEn: 'Pulmonary Vessels',
    anchorL: [0.036, 0.135, 0.042],
    bundle: 'custom',
    meshes: ['pulmonary_vessels'],
    color: '#8b5cf6',
    descZh: '肺循環（小循環）出入口血管：肺動脈幹自右心室動脈圓錐發出，於主動脈弓下方分為左右肺動脈進入左右肺門；氣體交換後的充氧血經左右上下共四條肺靜脈匯入左心房後壁。',
    descEn: 'Pulmonary circulation conduits: the pulmonary trunk exits the right ventricle and bifurcates into left and right pulmonary arteries to the lung hila, while four pulmonary veins return oxygenated blood to the left atrium.',
  },
  {
    id: 'coronaryVessels',
    category: 'heart',
    nameZh: '冠狀動脈與心靜脈 (左前降支 LAD・左迴旋支 LCX・右冠狀動脈 RCA)',
    nameEn: 'Coronary Arteries (LAD, LCX, RCA) & Cardiac Veins',
    pinZh: '冠狀動脈',
    pinEn: 'Coronary Arteries',
    anchorL: [0.028, 0.078, 0.093],
    bundle: 'custom',
    meshes: ['coronary_vessels'],
    color: '#f87171',
    descZh: '貼附於心外膜表面供應心肌自身氧氣與養分的血管網：左冠狀動脈分為前室間支（LAD，沿前室間溝直達心尖）與迴旋支（LCX）；右冠狀動脈（RCA）走行於右冠狀溝並發出後室間支（PDA），伴行心大靜脈與冠狀竇。',
    descEn: 'Epicardial vascular network nourishing the myocardium: Left Coronary Artery branching into the Left Anterior Descending (LAD) and Circumflex (LCX) arteries, Right Coronary Artery (RCA / PDA), and Great Cardiac Vein / Coronary Sinus.',
  },

  // --- 2. 動脈系統 (Arterial System) ---
  {
    id: 'carotidVertebralArteries',
    category: 'arteries',
    nameZh: '頭頸部動脈（總頸動脈・內外頸動脈・椎動脈與基底動脈威氏環）',
    nameEn: 'Head & Neck Arteries (Common/Internal/External Carotid, Vertebral & Circle of Willis)',
    pinZh: '頸總與椎動脈',
    pinEn: 'Carotid & Vertebral Arteries',
    anchorL: [-0.025, 0.270, 0.022],
    bundle: 'custom',
    meshes: ['carotid_vertebral_arteries'],
    color: '#ef4444',
    descZh: '供應腦部與顏面頭頸的兩大動脈系統：雙側總頸動脈於甲狀軟骨上緣分為外頸動脈（供應顏面頭皮）與內頸動脈（入顱供應大腦前中部）；雙側椎動脈穿行頸椎橫突孔入枕骨大孔匯為基底動脈，與內頸動脈於腦底吻合成「大腦動脈環（威氏環 Circle of Willis）」。',
    descEn: 'Bilateral common carotid arteries bifurcating into external and internal carotid arteries, paired vertebral arteries ascending through C6–C1 transverse foramina to form the basilar artery, and the cerebral Circle of Willis.',
  },
  {
    id: 'thoracicAbdominalAorta',
    category: 'arteries',
    nameZh: '胸主動脈、腹主動脈與內臟動脈分支（腹腔幹・腸繫膜上下動脈・腎動脈）',
    nameEn: 'Thoracic & Abdominal Aorta & Visceral Branches (Celiac, SMA, IMA, Renal)',
    pinZh: '胸腹主動脈',
    pinEn: 'Thoracic & Abdominal Aorta',
    anchorL: [0.005, -0.065, 0.016],
    bundle: 'custom',
    meshes: ['thoracic_abdominal_aorta'],
    color: '#e11d48',
    descZh: '體循環主幹：胸主動脈沿胸椎左前方下行並發出肋間後動脈，穿過橫膈主動脈裂孔（T12）延續為腹主動脈；依序發出腹腔幹（胃左、肝總、脾動脈）、腸繫膜上動脈（SMA）、左右腎動脈與腸繫膜下動脈（IMA），至第 4 腰椎高度分為左右髂總動脈。',
    descEn: 'Main systemic arterial trunk descending through the thorax and abdomen; gives off posterior intercostal arteries, celiac trunk, superior mesenteric artery, paired renal arteries, and inferior mesenteric artery before bifurcating at L4.',
  },
  {
    id: 'upperLimbArteries',
    category: 'arteries',
    nameZh: '上肢與手部動脈（鎖骨下動脈・腋動脈・肱動脈・橈尺動脈與掌深淺弓）',
    nameEn: 'Upper Limb & Hand Arteries (Subclavian, Axillary, Brachial, Radial/Ulnar & Palmar Arches)',
    bundle: 'custom',
    meshes: ['upper_limb_arteries'],
    color: '#ef4444',
    descZh: '雙側上肢動脈主幹：由鎖骨下動脈越過第一肋延續為腋動脈與上臂肱動脈（伴肱深動脈），於肘窩分為外側橈動脈（手腕把脈處）與內側尺動脈，進入手掌吻合形成掌淺弓、掌深弓並發出五指指動脈。',
    descEn: 'Bilateral subclavian, axillary, and brachial arteries bifurcating at the cubital fossa into radial and ulnar arteries, terminating in the superficial and deep palmar arches and digital arteries of both hands.',
  },
  {
    id: 'lowerLimbArteries',
    category: 'arteries',
    nameZh: '骨盆與下肢動脈（髂總／髂內外動脈・股動脈・膕動脈・脛前後與足背動脈）',
    nameEn: 'Pelvic & Lower Limb Arteries (Iliac, Femoral, Popliteal, Tibial & Dorsalis Pedis)',
    pinZh: '髂總與股動脈',
    pinEn: 'Iliac & Femoral Arteries',
    anchorL: [0.074, -0.340, 0.032],
    bundle: 'custom',
    meshes: ['lower_limb_arteries'],
    color: '#e11d48',
    descZh: '腹主動脈於 L4 分為左右髂總動脈，再分為髂內動脈（供應骨盆臟器）與髂外動脈；經腹股溝韌帶下方延續為大腿股動脈與股深動脈，穿收肌腱裂孔入膝後膕窩為膕動脈，向下分為脛前動脈（延續為足背動脈）與脛後動脈（含腓動脈與足底動脈弓）。',
    descEn: 'Common, internal, and external iliac arteries continuing past the inguinal ligament as the femoral and deep femoral arteries, passing through the popliteal fossa to divide into anterior/posterior tibial, fibular, dorsalis pedis, and plantar arteries.',
  },

  // --- 3. 靜脈與門脈系統 (Venous & Portal System) ---
  {
    id: 'venaCava',
    category: 'veins',
    nameZh: '上腔靜脈、下腔靜脈與奇靜脈系統（含左右頭臂靜脈・肝靜脈・腎靜脈）',
    nameEn: 'Superior & Inferior Vena Cava, Brachiocephalic, Hepatic, Renal & Azygos Veins',
    pinZh: '上下腔靜脈',
    pinEn: 'Superior & Inferior Vena Cava',
    anchorL: [-0.022, 0.145, 0.042],
    bundle: 'custom',
    meshes: ['vena_cava'],
    color: '#2563eb',
    descZh: '全身體循環靜脈回流總幹：上腔靜脈（SVC）由左右頭臂靜脈匯合而成，收納頭頸、上肢與奇靜脈系統（胸壁）血液注入右心房上口；下腔靜脈（IVC）於 L5 由左右髂總靜脈匯合，沿腹主動脈右側上行，收納腎靜脈與肝左中右靜脈後穿橫膈注入右心房下口。',
    descEn: 'Primary systemic venous trunks returning blood to the right atrium: Superior Vena Cava (formed by left/right brachiocephalic veins and receiving the azygos arch) and Inferior Vena Cava (receiving common iliac, renal, and hepatic veins).',
  },
  {
    id: 'jugularCranialVeins',
    category: 'veins',
    nameZh: '頭頸部靜脈（內頸靜脈・外頸靜脈・鎖骨下靜脈與硬腦膜靜脈竇）',
    nameEn: 'Head & Neck Veins (Internal/External Jugular, Subclavian & Dural Venous Sinuses)',
    bundle: 'custom',
    meshes: ['jugular_cranial_veins'],
    color: '#3b82f6',
    descZh: '顱內與頭頸部靜脈回流網：大腦血液先匯入硬腦膜靜脈竇（上矢狀竇、直竇、竇匯、橫竇、乙狀竇與海綿竇），經頸靜脈孔出顱延續為粗大的內頸靜脈，於頸動脈鞘內下行，與收納淺層顏面頭皮的外頸靜脈及鎖骨下靜脈於靜脈角匯入頭臂靜脈。',
    descEn: 'Cranial dural venous sinuses (superior sagittal, straight, transverse, sigmoid, and cavernous sinuses) draining through the jugular foramen into the internal jugular veins, joined by the external jugular and subclavian veins.',
  },
  {
    id: 'hepaticPortalSystem',
    category: 'veins',
    nameZh: '肝門靜脈系統（脾靜脈・腸繫膜上下靜脈・胃靜脈與肝門靜脈左右支）',
    nameEn: 'Hepatic Portal System (Hepatic Portal, Splenic, Superior & Inferior Mesenteric Veins)',
    pinZh: '肝門靜脈系',
    pinEn: 'Hepatic Portal Vein',
    anchorL: [-0.026, -0.042, 0.045],
    bundle: 'custom',
    meshes: ['hepatic_portal_system'],
    color: '#7c3aed',
    descZh: '連接消化道與肝臟的功能性門脈血管系：由收納小腸與右結腸養分的腸繫膜上靜脈（SMV），與收納脾臟及腸繫膜下靜脈（IMV）的脾靜脈於胰頸後方匯合形成肝門靜脈主幹，進入肝門分為左右葉分支，將消化吸收之營養素與藥物送入肝竇代謝解毒。',
    descEn: 'Specialized portal venous circuit formed by the confluence of the superior mesenteric and splenic veins (with inferior mesenteric and gastric veins), delivering nutrient-rich gastrointestinal blood to the liver sinusoids before hepatic venous return.',
  },
  {
    id: 'upperLimbVeins',
    category: 'veins',
    nameZh: '上肢深淺靜脈（頭靜脈・貴要靜脈・肘正中靜脈・肱／腋／鎖骨下靜脈）',
    nameEn: 'Upper Limb Superficial & Deep Veins (Cephalic, Basilic, Median Cubital, Brachial & Axillary)',
    bundle: 'custom',
    meshes: ['upper_limb_veins'],
    color: '#3b82f6',
    descZh: '包含深層伴行靜脈（橈尺靜脈、肱靜脈、腋靜脈）與淺層皮下靜脈網：外側「頭靜脈 (Cephalic vein)」沿前臂橈側與三角胸大肌溝上行；內側「貴要靜脈 (Basilic vein)」沿尺側上行匯入腋靜脈；兩者於肘窩由「肘正中靜脈」（臨床最常抽血與靜脈注射部位）相連。',
    descEn: 'Superficial and deep venous pathways of the upper extremities: lateral cephalic vein, medial basilic vein, median cubital vein across the elbow (primary venipuncture site), and deep radial, ulnar, brachial, and axillary veins.',
  },
  {
    id: 'lowerLimbVeins',
    category: 'veins',
    nameZh: '下肢深淺靜脈（大隱靜脈・小隱靜脈・股靜脈・膕靜脈與髂內外靜脈）',
    nameEn: 'Lower Limb Superficial & Deep Veins (Great/Small Saphenous, Femoral, Popliteal & Iliac)',
    bundle: 'custom',
    meshes: ['lower_limb_veins'],
    color: '#2563eb',
    descZh: '包含下肢深靜脈（脛前後靜脈、膕靜脈、股靜脈、髂外與髂總靜脈）與淺靜脈：全身最長的「大隱靜脈 (Great saphenous vein)」起自足背內側，經內踝前方沿小腿與大腿內側上行注入股靜脈；「小隱靜脈」則沿小腿後側上行注入膕靜脈。',
    descEn: 'Deep and superficial lower extremity veins including the great saphenous vein (longest vein in the body, ascending medially from ankle to femoral vein), small saphenous vein, tibial, popliteal, femoral, and internal/external/common iliac veins.',
  },

  // --- 4. 脊椎骨各節段 (Vertebral Column) ---
  {
    id: 'cervicalSpine',
    category: 'spine',
    nameZh: '頸椎 (C1–C7：橫突孔供椎動脈上行入顱)',
    nameEn: 'Cervical Vertebrae (C1–C7)',
    bundle: 'body',
    meshes: ['cervical_skel'],
    color: '#e5ded2',
    descZh: '由寰椎 (C1)、樞椎 (C2) 至隆椎 (C7) 共 7 節頸椎組成，兩側橫突具特有的「橫突孔 (Transverse foramina)」保護左右椎動脈上行穿入枕骨大孔，前方雙側則有頸動脈鞘伴行。',
    descEn: 'Seven cervical vertebrae (C1–C7) featuring transverse foramina that protect the ascending left and right vertebral arteries en route to the foramen magnum.',
  },
  {
    id: 'thoracicSpine',
    category: 'spine',
    nameZh: '胸椎 (T1–T12：十二節胸椎，胸主動脈與奇靜脈貼行於椎體前方)',
    nameEn: 'Thoracic Vertebrae (T1–T12, Separated from Ribs)',
    bundle: 'custom',
    meshes: ['spine_thoracic'],
    color: '#dfd7ca',
    descZh: '由第 1 至第 12 胸椎獨立組成（已與肋骨分離），構成後縱膈腔後壁；降胸主動脈沿下段胸椎椎體左前方下行並發出各節肋間後動脈，右側則有奇靜脈上行。',
    descEn: 'Twelve thoracic vertebrae (T1–T12) forming the posterior mediastinal wall along which the descending thoracic aorta, intercostal vessels, and azygos venous system travel.',
  },
  {
    id: 'lumbarSpine',
    category: 'spine',
    nameZh: '腰椎 (L1–L5：五節腰椎，腹主動脈於 L4 分叉、下腔靜脈於 L5 匯合)',
    nameEn: 'Lumbar Vertebrae (L1–L5, Separated from Pelvis)',
    bundle: 'custom',
    meshes: ['spine_lumbar'],
    color: '#dad1c3',
    descZh: '由第 1 至第 5 腰椎獨立組成，腹主動脈與下腔靜脈緊貼腰椎椎體前方走行；L1–L2 高度發出腎動靜脈，L4 椎體前方為腹主動脈分叉處，L5 前方為下腔靜脈起始匯合處。',
    descEn: 'Five lumbar vertebrae (L1–L5) supporting the retroperitoneal abdominal aorta (bifurcating at L4) and inferior vena cava (originating at L5).',
  },
  {
    id: 'sacrumSpine',
    category: 'spine',
    nameZh: '薦椎與尾椎 (Sacrum：骨盆後壁，髂內動靜脈與薦正中血管走行處)',
    nameEn: 'Sacrum (S1–S5, Separated from Hip Bones)',
    bundle: 'custom',
    meshes: ['spine_sacrum'],
    color: '#d5ccbe',
    descZh: '由 5 節薦椎融合而成之骨盆後壁中軸骨（已與左右髖骨分離），盆面有薦正中動靜脈與左右髂內動靜脈分支支配骨盆腔。',
    descEn: 'Fused sacral vertebrae (S1–S5) forming the posterior pelvic wall, cradling the median sacral and internal iliac vascular plexuses.',
  },

  // --- 5. 頭骨 (Skull) ---
  {
    id: 'cranium',
    category: 'skull',
    nameZh: '顱骨 (腦顱與面顱：頸動脈管與頸靜脈孔供腦部大血管出入)',
    nameEn: 'Cranium',
    bundle: 'head',
    meshes: ['cranium'],
    color: '#dfd8cc',
    descZh: '構成堅固顱腔保護大腦與硬腦膜靜脈竇；顱底具頸動脈管（供內頸動脈入顱）、枕骨大孔（供椎動脈入顱）與頸靜脈孔（供乙狀竇延續為內頸靜脈出顱）。',
    descEn: 'Cranial vault enclosing the cerebral circulation and dural venous sinuses, featuring the carotid canals, foramen magnum, and jugular foramina at the skull base.',
  },
  {
    id: 'jaw',
    category: 'skull',
    nameZh: '下頜骨 (外頸動脈面動脈與下齒槽血管分支走向參照)',
    nameEn: 'Mandible',
    bundle: 'head',
    meshes: ['jaw'],
    color: '#dfd8cc',
    descZh: '面顱下方骨骼，下緣咬肌前角為面動脈跨越下頜骨之體表脈搏點，內有下齒槽動靜脈穿行供應下排牙齒。',
    descEn: 'Lower jaw bone providing anatomical reference for the facial artery pulse point along its inferior border and the inferior alveolar vessels.',
  },

  // --- 6. 胸廓肋骨・骨盆・四肢與雙手骨骼 (Ribcage, Pelvis, Limb & Hand Skeleton) ---
  {
    id: 'ribcageSternum',
    category: 'skeleton',
    nameZh: '胸廓：十二對肋骨與胸骨 (保護心臟與大血管，可單獨隱藏)',
    nameEn: 'Ribcage: 12 Pairs of Ribs & Sternum',
    bundle: 'custom',
    meshes: ['skel_ribcage'],
    color: '#d4ccc0',
    descZh: '由左右 12 對肋骨與前方胸骨組成，形成胸腔裝甲保護心臟、主動脈弓、肺動靜脈與上下腔靜脈；隱藏此項即可無遮擋觀察心臟五分區與胸腔大血管。',
    descEn: 'Twelve pairs of ribs and the sternum enclosing and protecting the heart and great thoracic vessels; can be hidden independently to inspect the heart chambers and coronary vessels.',
  },
  {
    id: 'shoulderGirdle',
    category: 'skeleton',
    nameZh: '肩帶：左右鎖骨與肩胛骨 (鎖骨下動靜脈穿行定位指標)',
    nameEn: 'Shoulder Girdle: Clavicles & Scapulae',
    bundle: 'custom',
    meshes: ['skel_shoulder'],
    color: '#d2cabe',
    descZh: '由左右鎖骨與肩胛骨組成，鎖骨下動脈與鎖骨下靜脈即穿行於鎖骨中段後下方與第一肋上緣之間（臨床鎖骨下靜脈中心導管置入定位點）。',
    descEn: 'Bilateral clavicles and scapulae; the subclavian artery and vein course immediately posterior-inferior to the mid-clavicle over the first rib.',
  },
  {
    id: 'pelvisBones',
    category: 'skeleton',
    nameZh: '骨盆：左右髖骨 (髂總・髂內外動靜脈轉折為股動靜脈定位)',
    nameEn: 'Pelvis: Left & Right Hip Bones (Ilium, Ischium, Pubis)',
    bundle: 'custom',
    meshes: ['skel_pelvis'],
    color: '#d0c8bc',
    descZh: '左右兩側髖骨，髂外動靜脈沿骨盆緣內側下行，跨越恥骨上支與腹股溝韌帶進入大腿股三角轉為股動靜脈。',
    descEn: 'Bilateral pelvic hip bones along which the external iliac vessels course before passing beneath the inguinal ligament to become the femoral artery and vein.',
  },
  {
    id: 'upperLimbBones',
    category: 'skeleton',
    nameZh: '上肢骨骼 (肱骨・橈骨・尺骨：肱動脈與橈尺血管伴行支架)',
    nameEn: 'Upper Limb Bones (Humerus, Radius, Ulna)',
    bundle: 'body',
    meshes: ['arm_humerus_L', 'arm_humerus_R', 'arm_forearm_L', 'arm_forearm_R'],
    color: '#cfc7ba',
    descZh: '左右上臂肱骨與前臂橈骨、尺骨；肱動脈貼肱骨內側下行（量血壓壓脈帶壓迫處），橈動脈於遠端橈骨莖突前方為臨床最常用之手腕脈搏點。',
    descEn: 'Bilateral humerus, radius, and ulna providing osteological landmarks for brachial artery blood-pressure auscultation and radial artery pulse palpation at the wrist.',
  },
  {
    id: 'handBones',
    category: 'skeleton',
    nameZh: '雙手骨骼 (腕骨・掌骨・五指指骨：掌深淺動脈弓與手背靜脈網定位)',
    nameEn: 'Hand Bones (Carpals, Metacarpals, Phalanges)',
    bundle: 'custom',
    meshes: ['hand_bones_L', 'hand_bones_R'],
    color: '#d8d0c3',
    descZh: '左右雙手腕骨、掌骨與五指指骨，掌淺弓與掌深弓橫跨掌骨掌側面並發出指動脈至各指骨末端。',
    descEn: 'Complete bilateral hand skeletons across which the superficial and deep palmar arterial arches and dorsal venous networks are distributed.',
  },
  {
    id: 'lowerLimbBones',
    category: 'skeleton',
    nameZh: '下肢與足部骨骼 (股骨・脛腓骨・足骨：股・膕・脛與足背血管伴行)',
    nameEn: 'Lower Limb & Foot Bones',
    bundle: 'body',
    meshes: ['leg_femur_L', 'leg_femur_R', 'leg_shin_L', 'leg_shin_R', 'foot_L', 'foot_R'],
    color: '#cfc7ba',
    descZh: '包含大腿股骨、小腿脛腓骨與足骨；膕動靜脈貼行於股骨下端膕面，脛後動脈經內踝後方、足背動脈經跗骨與第一二蹠骨間（臨床下肢循環脈搏檢查點）。',
    descEn: 'Bilateral femur, tibia, fibula, and foot bones serving as anatomical landmarks for the femoral, popliteal, posterior tibial (medial malleolus), and dorsalis pedis pulses.',
  },

  // --- 7. 人體外框輪廓 (Body Silhouette) ---
  {
    id: 'silhouetteMesh',
    category: 'silhouette',
    nameZh: '人體外框輪廓',
    nameEn: 'Human Body Outline',
    bundle: 'head',
    meshes: ['skin'],
    color: '#38bdf8',
    descZh: '半透明人體外框輪廓背景，提供心臟、全身動靜脈血管網、肝門靜脈系與骨骼在人體空間中的相對位置參照。',
    descEn: 'Translucent human body silhouette contour providing spatial anatomical reference for the cardiovascular and skeletal systems.',
  },
]);

/** Sweep a smooth 3D tube along an array of [x, y, z] points (in BodyParts3D cm). */
function buildTubeCm(points, radiusCm = 0.22, tubularSegments = 24, radialSegments = 8) {
  const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5);
  return new THREE.TubeGeometry(curve, tubularSegments, radiusCm, radialSegments, false);
}

/** Build an indexing BufferGeometry from a subset of triangles of a source geometry. */
function buildSubGeometryFromTriangles(srcPos, triVertexIndices) {
  const remap = new Int32Array(srcPos.count).fill(-1);
  const coords = [];
  const localIdx = [];

  for (let i = 0; i < triVertexIndices.length; i++) {
    const oldV = triVertexIndices[i];
    let newV = remap[oldV];
    if (newV < 0) {
      newV = coords.length / 3;
      remap[oldV] = newV;
      coords.push(srcPos.getX(oldV), srcPos.getY(oldV), srcPos.getZ(oldV));
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
  return g;
}

/**
 * Snap a control point [qx, qy, qz] onto the epicardial surface of organs_heart (in cm)
 * and offset slightly outward from the cardiac center so coronary vessels hug the heart cleanly.
 */
function snapToHeartSurface(heartPos, [qx, qy, qz], outwardCm = 0.14) {
  let bestD = Infinity;
  let bx = qx, by = qy, bz = qz;
  for (let i = 0; i < heartPos.count; i++) {
    const x = heartPos.getX(i);
    const y = heartPos.getY(i);
    const z = heartPos.getZ(i);
    const d = (x - qx) * (x - qx) + (y - qy) * (y - qy) + (z - qz) * (z - qz);
    if (d < bestD) {
      bestD = d;
      bx = x;
      by = y;
      bz = z;
    }
  }
  // Outward vector from heart center [1.4, 123.5, 12.2]
  const dx = bx - 1.4;
  const dy = by - 123.5;
  const dz = bz - 12.2;
  const len = Math.hypot(dx, dy, dz) || 1;
  return [
    bx + (dx / len) * outwardCm,
    by + (dy / len) * outwardCm,
    bz + (dz / len) * outwardCm,
  ];
}

/**
 * Build all custom viewer-space 3D geometries for the Circulatory System:
 * - Heart chambers & great vessels (heart_ventricles, heart_atria, aortic_arch, pulmonary_vessels, coronary_vessels)
 * - Arterial pathways (carotid_vertebral_arteries, thoracic_abdominal_aorta, upper_limb_arteries, lower_limb_arteries)
 * - Venous & portal pathways (vena_cava, jugular_cranial_veins, hepatic_portal_system, upper_limb_veins, lower_limb_veins)
 */
export function buildCirculatorySystemGeometries({
  bodyMeta,
  bodyGeos,
  cmToViewer = makeCmToViewerMatrix(),
}) {
  const heartEntry = bodyMeta.meshes.find(m => m.name === 'organs_heart');
  const heartCm = bodyGeos.organs_heart.clone().applyMatrix4(makeCmMatrix(heartEntry.sourceFrame));
  const heartPos = heartCm.attributes.position;
  const heartIdx = heartCm.index.array;

  // 1. Partition organs_heart triangles along the oblique atrioventricular (coronary) sulcus & great vessel roots
  const ventricleTris = [];
  const atriaTris = [];
  const aorticRootTris = [];
  const pulmonaryRootTris = [];

  for (let i = 0; i < heartIdx.length; i += 3) {
    const a = heartIdx[i], b = heartIdx[i + 1], c = heartIdx[i + 2];
    const cx = (heartPos.getX(a) + heartPos.getX(b) + heartPos.getX(c)) / 3;
    const cy = (heartPos.getY(a) + heartPos.getY(b) + heartPos.getY(c)) / 3;
    const cz = (heartPos.getZ(a) + heartPos.getZ(b) + heartPos.getZ(c)) / 3;

    // Superior vascular roots at the top of organs_heart (Y > 126.9 cm)
    if (cy > 126.9) {
      if (cx > 1.3 && cz > 12.6) {
        pulmonaryRootTris.push(a, b, c);
      } else {
        aorticRootTris.push(a, b, c);
      }
      continue;
    }

    // Oblique coronary sulcus plane separating anterior-inferior-left ventricles from posterior-superior-right atria:
    // Ventricles extend anteriorly (larger Z), inferiorly (smaller Y), and toward the left apex (larger X).
    const avScore = cy - 0.36 * (cx - 1.2) - 0.42 * (cz - 12.4);
    if (avScore < 123.85 && !(cx < -1.15 && cy > 122.4)) {
      ventricleTris.push(a, b, c);
    } else {
      atriaTris.push(a, b, c);
    }
  }

  const finalizeCmGeos = geos => {
    const merged = mergeBufferGeometries(geos.filter(Boolean));
    merged.applyMatrix4(cmToViewer);
    merged.computeVertexNormals();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  };

  // --- A1. Heart Ventricles (左右心室與心室肌) ---
  const heart_ventricles = finalizeCmGeos([
    buildSubGeometryFromTriangles(heartPos, ventricleTris),
  ]);

  // --- A2. Heart Atria (左右心房與心耳) ---
  const heart_atria = finalizeCmGeos([
    buildSubGeometryFromTriangles(heartPos, atriaTris),
  ]);

  // --- A3. Ascending Aorta & Aortic Arch (升主動脈與主動脈弓 + 三大分支起始段) ---
  const aorticTubes = [];
  if (aorticRootTris.length > 0) {
    aorticTubes.push(buildSubGeometryFromTriangles(heartPos, aorticRootTris));
  }
  // Main Ascending Aorta -> Aortic Arch -> Proximal Descending Thoracic Aorta junction
  aorticTubes.push(buildTubeCm([
    [0.5, 125.6, 13.0],
    [0.1, 128.2, 13.4],
    [0.3, 130.4, 12.9],
    [1.1, 131.2, 11.7],
    [2.0, 130.4, 10.1],
    [2.2, 128.0, 9.1],
  ], 1.12, 30, 12));
  // Brachiocephalic Trunk (頭臂幹 / 無名動脈)
  aorticTubes.push(buildTubeCm([
    [0.1, 130.6, 12.8],
    [-0.8, 132.4, 12.1],
    [-1.6, 134.2, 11.4],
  ], 0.56, 14, 10));
  // Left Common Carotid Root (左總頸動脈起始段)
  aorticTubes.push(buildTubeCm([
    [0.9, 131.1, 12.0],
    [1.3, 132.8, 11.5],
    [1.6, 134.4, 11.0],
  ], 0.44, 14, 8));
  // Left Subclavian Root (左鎖骨下動脈起始段)
  aorticTubes.push(buildTubeCm([
    [1.7, 130.8, 10.9],
    [2.2, 132.5, 10.4],
    [2.7, 134.2, 10.0],
  ], 0.46, 14, 8));
  const aortic_arch = finalizeCmGeos(aorticTubes);

  // --- A4. Pulmonary Trunk, Left/Right Pulmonary Arteries & 4 Pulmonary Veins (肺動脈幹與左右肺動靜脈) ---
  const pulmonaryTubes = [];
  if (pulmonaryRootTris.length > 0) {
    pulmonaryTubes.push(buildSubGeometryFromTriangles(heartPos, pulmonaryRootTris));
  }
  // Pulmonary Trunk from RV conus arteriosus (infundibulum) to bifurcation under aortic arch
  pulmonaryTubes.push(buildTubeCm([
    [1.8, 125.2, 14.8],
    [2.2, 127.4, 13.8],
    [2.0, 129.0, 12.1],
  ], 0.92, 18, 10));
  // Left Pulmonary Artery & lobar branches entering left lung hilum
  pulmonaryTubes.push(buildTubeCm([
    [2.0, 129.0, 12.1],
    [4.2, 128.9, 11.0],
    [6.6, 128.5, 9.8],
  ], 0.68, 18, 10));
  pulmonaryTubes.push(buildTubeCm([
    [5.8, 128.6, 10.1],
    [7.6, 130.6, 9.2],
    [8.8, 132.2, 8.6],
  ], 0.38, 14, 8));
  pulmonaryTubes.push(buildTubeCm([
    [6.4, 128.5, 9.8],
    [8.0, 126.0, 9.0],
    [9.2, 123.2, 8.4],
  ], 0.40, 14, 8));
  // Right Pulmonary Artery coursing under aortic arch to right lung hilum
  pulmonaryTubes.push(buildTubeCm([
    [2.0, 129.0, 12.1],
    [-0.4, 128.6, 11.3],
    [-3.6, 128.2, 10.5],
    [-6.6, 127.8, 9.6],
  ], 0.70, 20, 10));
  pulmonaryTubes.push(buildTubeCm([
    [-5.8, 128.0, 9.8],
    [-7.8, 130.2, 9.1],
    [-9.0, 132.0, 8.5],
  ], 0.38, 14, 8));
  pulmonaryTubes.push(buildTubeCm([
    [-6.4, 127.8, 9.6],
    [-8.2, 125.2, 8.9],
    [-9.4, 122.4, 8.3],
  ], 0.40, 14, 8));
  // Four Pulmonary Veins (左右上下共四條肺靜脈匯入左心房後壁)
  // Left superior pulmonary vein
  pulmonaryTubes.push(buildTubeCm([
    [8.4, 127.4, 10.4],
    [5.2, 126.2, 10.6],
    [2.2, 125.3, 10.6],
  ], 0.44, 16, 8));
  // Left inferior pulmonary vein
  pulmonaryTubes.push(buildTubeCm([
    [8.0, 122.4, 10.0],
    [4.8, 123.5, 10.3],
    [2.0, 124.2, 10.5],
  ], 0.44, 16, 8));
  // Right superior pulmonary vein
  pulmonaryTubes.push(buildTubeCm([
    [-8.2, 126.8, 10.5],
    [-4.4, 125.6, 10.7],
    [-0.2, 125.0, 10.6],
  ], 0.44, 16, 8));
  // Right inferior pulmonary vein
  pulmonaryTubes.push(buildTubeCm([
    [-7.8, 122.0, 10.0],
    [-4.2, 123.2, 10.3],
    [-0.2, 124.0, 10.5],
  ], 0.44, 16, 8));
  const pulmonary_vessels = finalizeCmGeos(pulmonaryTubes);

  // --- A5. Coronary Arteries & Cardiac Veins (冠狀動脈 LAD / LCX / RCA 與心靜脈，精準貼附於心外膜表面) ---
  const snap = (pt, out = 0.15) => snapToHeartSurface(heartPos, pt, out);
  const coronaryTubes = [];
  // Left Main -> Left Anterior Descending (LAD / 前室間支) down to cardiac apex
  coronaryTubes.push(buildTubeCm([
    snap([1.5, 126.0, 15.2], 0.16),
    snap([2.1, 124.8, 16.5], 0.16),
    snap([2.5, 123.6, 17.3], 0.16),
    snap([3.0, 122.2, 17.3], 0.16),
    snap([3.8, 120.8, 17.0], 0.16),
    snap([4.6, 119.3, 15.8], 0.16),
  ], 0.21, 26, 8));
  // First & Second Diagonal Branches of LAD (D1, D2 對角支)
  coronaryTubes.push(buildTubeCm([
    snap([2.5, 123.6, 17.3], 0.16),
    snap([4.1, 122.6, 16.6], 0.15),
    snap([5.5, 121.3, 15.5], 0.15),
  ], 0.14, 14, 6));
  coronaryTubes.push(buildTubeCm([
    snap([3.2, 121.8, 17.2], 0.16),
    snap([4.8, 120.8, 16.2], 0.15),
    snap([6.1, 119.8, 14.8], 0.15),
  ], 0.13, 14, 6));
  // Left Circumflex Artery (LCX / 左迴旋支) & Obtuse Marginal Branch (OM 鈍緣支)
  coronaryTubes.push(buildTubeCm([
    snap([1.5, 126.0, 15.2], 0.16),
    snap([3.4, 125.4, 14.8], 0.16),
    snap([5.2, 124.5, 13.6], 0.16),
    snap([6.2, 123.6, 11.8], 0.16),
    snap([5.0, 122.5, 10.1], 0.16),
  ], 0.19, 22, 8));
  coronaryTubes.push(buildTubeCm([
    snap([5.2, 124.5, 13.6], 0.16),
    snap([6.4, 122.5, 13.2], 0.15),
    snap([6.6, 120.4, 12.6], 0.15),
  ], 0.14, 14, 6));
  // Right Coronary Artery (RCA / 右冠狀動脈) -> Acute Marginal -> Posterior Descending Artery (PDA / 後室間支)
  coronaryTubes.push(buildTubeCm([
    snap([-0.3, 125.4, 15.2], 0.16),
    snap([-1.8, 124.2, 15.1], 0.16),
    snap([-2.4, 122.5, 14.5], 0.16),
    snap([-2.4, 121.0, 13.2], 0.16),
    snap([-1.2, 120.2, 11.4], 0.16),
    snap([0.8, 119.8, 10.6], 0.16),
    snap([2.8, 119.4, 11.2], 0.16),
  ], 0.20, 28, 8));
  // Right Acute Marginal Branch (右銳緣支)
  coronaryTubes.push(buildTubeCm([
    snap([-2.4, 121.8, 14.0], 0.16),
    snap([-0.6, 120.8, 15.4], 0.15),
    snap([1.4, 119.9, 15.8], 0.15),
  ], 0.14, 14, 6));
  // Great Cardiac Vein & Coronary Sinus (心大靜脈與冠狀竇)
  coronaryTubes.push(buildTubeCm([
    snap([3.4, 121.2, 17.1], 0.14),
    snap([2.1, 123.8, 17.1], 0.14),
    snap([3.8, 125.0, 14.5], 0.14),
    snap([5.6, 123.5, 11.2], 0.14),
    snap([3.2, 122.2, 9.6], 0.15),
    snap([0.4, 121.8, 9.8], 0.16),
  ], 0.17, 24, 8));
  const coronary_vessels = finalizeCmGeos(coronaryTubes);

  // --- B1. Head & Neck Arteries: Common/Internal/External Carotid, Vertebral, Basilar & Circle of Willis ---
  const headNeckArteryTubes = [];
  for (const sign of [1, -1]) {
    // Common Carotid Artery (總頸動脈): from aortic arch (L) or brachiocephalic trunk (R) to C4 carotid bifurcation
    const originX = sign > 0 ? 1.6 : -1.6;
    const originY = sign > 0 ? 134.2 : 134.0;
    const originZ = sign > 0 ? 11.0 : 11.4;
    headNeckArteryTubes.push(buildTubeCm([
      [originX, originY, originZ],
      [sign * 2.2, 137.5, 10.6],
      [sign * 2.5, 141.0, 10.4],
      [sign * 2.6, 144.2, 10.3],
    ], 0.38, 18, 8));

    // Internal Carotid Artery (內頸動脈): C4 bifurcation -> carotid canal -> cavernous sinus -> cerebral termination
    headNeckArteryTubes.push(buildTubeCm([
      [sign * 2.6, 144.2, 10.3],
      [sign * 2.5, 147.5, 9.6],
      [sign * 2.2, 150.5, 9.4],
      [sign * 1.6, 152.8, 10.4],
      [sign * 1.4, 154.4, 10.6],
    ], 0.30, 18, 8));

    // Middle Cerebral Artery (大腦中動脈 MCA)
    headNeckArteryTubes.push(buildTubeCm([
      [sign * 1.4, 154.4, 10.6],
      [sign * 3.2, 155.0, 10.2],
      [sign * 4.8, 156.5, 9.4],
      [sign * 5.4, 158.5, 8.2],
    ], 0.20, 16, 6));

    // Anterior Cerebral Artery (大腦前動脈 ACA)
    headNeckArteryTubes.push(buildTubeCm([
      [sign * 1.4, 154.4, 10.6],
      [sign * 0.5, 155.4, 12.2],
      [sign * 0.4, 157.8, 13.8],
      [sign * 0.4, 160.2, 11.2],
      [sign * 0.4, 160.8, 7.5],
    ], 0.18, 18, 6));

    // External Carotid Artery (外頸動脈) + Facial, Maxillary & Superficial Temporal branches
    headNeckArteryTubes.push(buildTubeCm([
      [sign * 2.6, 144.2, 10.3],
      [sign * 3.4, 146.8, 11.2],
      [sign * 4.4, 150.2, 11.4],
      [sign * 5.2, 154.5, 10.8],
      [sign * 5.4, 158.2, 9.8],
    ], 0.24, 18, 8));
    // Facial & Maxillary Artery branch (面動脈與上頷動脈支)
    headNeckArteryTubes.push(buildTubeCm([
      [sign * 3.4, 146.5, 11.2],
      [sign * 3.8, 146.2, 13.8],
      [sign * 2.8, 148.5, 16.2],
      [sign * 1.8, 151.2, 17.2],
    ], 0.16, 14, 6));
    // Occipital / Posterior Auricular branch (枕動脈支)
    headNeckArteryTubes.push(buildTubeCm([
      [sign * 3.4, 147.2, 10.8],
      [sign * 4.2, 149.5, 7.6],
      [sign * 3.8, 152.5, 4.2],
    ], 0.15, 12, 6));

    // Vertebral Artery (椎動脈): rising from subclavian artery through C6–C1 transverse foramina into foramen magnum
    headNeckArteryTubes.push(buildTubeCm([
      [sign * 2.7, 134.2, 10.0],
      [sign * 2.1, 137.2, 7.6],
      [sign * 1.8, 141.0, 6.6],
      [sign * 1.7, 144.8, 6.5],
      [sign * 1.8, 147.6, 6.7],
      [sign * 1.1, 149.4, 7.4],
      [0.0, 150.6, 8.3],
    ], 0.24, 22, 8));

    // Posterior Communicating Artery & Posterior Cerebral Artery (後交通動脈與大腦後動脈 PCA — 構成完整威氏環)
    headNeckArteryTubes.push(buildTubeCm([
      [0.0, 153.4, 9.5],
      [sign * 1.3, 153.8, 9.8],
      [sign * 1.4, 154.4, 10.6],
    ], 0.15, 10, 6));
    headNeckArteryTubes.push(buildTubeCm([
      [0.0, 153.4, 9.5],
      [sign * 1.6, 153.8, 8.4],
      [sign * 2.8, 154.4, 6.2],
      [sign * 2.4, 155.2, 3.5],
    ], 0.19, 14, 6));
  }
  // Midline Basilar Artery (基底動脈) & Anterior Communicating Artery (前交通動脈)
  headNeckArteryTubes.push(buildTubeCm([
    [0.0, 150.6, 8.3],
    [0.0, 152.0, 8.9],
    [0.0, 153.4, 9.5],
  ], 0.28, 10, 8));
  headNeckArteryTubes.push(buildTubeCm([
    [-0.5, 155.4, 12.2],
    [0.0, 155.4, 12.3],
    [0.5, 155.4, 12.2],
  ], 0.15, 6, 6));
  const carotid_vertebral_arteries = finalizeCmGeos(headNeckArteryTubes);

  // --- B2. Thoracic & Abdominal Aorta & Visceral Branches (胸主動脈・腹主動脈與內臟動脈分支) ---
  const aortaTubes = [];
  // Main Descending Thoracic Aorta -> Diaphragmatic Aortic Hiatus (T12) -> Abdominal Aorta -> L4 Bifurcation
  aortaTubes.push(buildTubeCm([
    [2.2, 128.2, 9.1],
    [1.7, 124.0, 8.5],
    [1.1, 119.0, 8.5],
    [0.6, 114.0, 8.9],
    [0.4, 109.0, 9.5],
    [0.3, 103.5, 9.9],
    [0.2, 97.5, 10.2],
  ], 0.88, 36, 12));

  // Segmental Posterior Intercostal Arteries (6 representative pairs along thoracic cage)
  for (const yLevel of [126.0, 123.5, 121.0, 118.5, 116.0, 113.5]) {
    for (const sign of [1, -1]) {
      aortaTubes.push(buildTubeCm([
        [0.9, yLevel, 8.6],
        [sign * 4.5, yLevel - 0.3, 6.8],
        [sign * 8.8, yLevel - 0.8, 8.4],
        [sign * 10.8, yLevel - 1.4, 12.0],
      ], 0.16, 14, 6));
    }
  }

  // Celiac Trunk (腹腔幹, Y ~ 112.2 cm): Common Hepatic, Left Gastric, and Splenic Arteries
  aortaTubes.push(buildTubeCm([
    [0.5, 112.2, 9.3],
    [0.5, 112.2, 11.0],
  ], 0.36, 8, 8));
  // Common Hepatic -> Proper Hepatic Artery into Liver
  aortaTubes.push(buildTubeCm([
    [0.5, 112.2, 11.0],
    [-2.2, 112.4, 12.2],
    [-4.8, 113.4, 12.8],
    [-7.2, 112.8, 12.6],
  ], 0.28, 16, 8));
  // Left Gastric Artery to lesser curvature of Stomach
  aortaTubes.push(buildTubeCm([
    [0.5, 112.2, 11.0],
    [2.4, 114.6, 12.2],
    [4.4, 115.2, 13.2],
  ], 0.22, 14, 6));
  // Splenic Artery coursing to left upper quadrant
  aortaTubes.push(buildTubeCm([
    [0.5, 112.2, 11.0],
    [3.8, 112.6, 10.4],
    [6.8, 112.4, 9.8],
    [9.0, 112.8, 9.4],
  ], 0.26, 16, 8));

  // Superior Mesenteric Artery (腸繫膜上動脈 SMA, Y ~ 110.0 cm) & Mesenteric Arcades
  aortaTubes.push(buildTubeCm([
    [0.4, 110.0, 9.6],
    [0.6, 108.2, 12.4],
    [0.8, 103.5, 14.0],
    [0.0, 97.5, 14.8],
    [-2.4, 92.0, 14.2],
  ], 0.34, 24, 8));
  // Jejunal & Ileocolic branches of SMA
  for (const [by, tx, ty, tz] of [
    [106.0, 4.2, 103.0, 14.6],
    [102.0, 4.8, 98.2, 15.0],
    [101.0, -4.5, 99.5, 14.2],
    [96.5, 3.8, 93.0, 14.8],
  ]) {
    aortaTubes.push(buildTubeCm([
      [0.6, by, 13.8],
      [tx * 0.5, (by + ty) * 0.5, 14.4],
      [tx, ty, tz],
    ], 0.18, 12, 6));
  }

  // Bilateral Renal Arteries (左右腎動脈, Y ~ 107.2 cm -> kidney hila)
  aortaTubes.push(buildTubeCm([
    [0.4, 107.2, 9.6],
    [-2.4, 106.8, 8.8],
    [-5.2, 106.2, 7.8],
  ], 0.34, 14, 8));
  aortaTubes.push(buildTubeCm([
    [0.4, 107.5, 9.6],
    [2.6, 107.2, 8.8],
    [5.2, 106.8, 7.8],
  ], 0.34, 14, 8));

  // Inferior Mesenteric Artery (腸繫膜下動脈 IMA, Y ~ 101.5 cm -> left colic, sigmoid & superior rectal)
  aortaTubes.push(buildTubeCm([
    [0.3, 101.5, 10.0],
    [2.6, 99.0, 12.4],
    [4.6, 95.0, 13.2],
    [3.8, 89.5, 12.4],
    [0.5, 85.0, 10.2],
  ], 0.24, 20, 8));
  const thoracic_abdominal_aorta = finalizeCmGeos(aortaTubes);

  // --- B3. Upper Limb & Hand Arteries (上肢與手部動脈：鎖骨下・腋・肱・橈尺動脈與掌弓) ---
  const upperArteryTubes = [];
  for (const sign of [1, -1]) {
    // Subclavian -> Axillary -> Brachial Artery to Cubital Fossa
    upperArteryTubes.push(buildTubeCm([
      [sign * 2.2, 134.2, 10.4],
      [sign * 5.8, 135.2, 9.5],
      [sign * 10.5, 134.2, 8.5],
      [sign * 15.2, 131.6, 7.8],
      [sign * 17.6, 126.0, 7.3],
      [sign * 19.2, 118.5, 6.7],
      [sign * 20.5, 110.5, 6.7],
      [sign * 21.6, 104.2, 7.1],
    ], 0.34, 28, 8));

    // Deep Brachial Artery (肱深動脈 Profunda brachii)
    upperArteryTubes.push(buildTubeCm([
      [sign * 17.8, 125.0, 7.2],
      [sign * 19.8, 119.5, 5.9],
      [sign * 21.0, 112.5, 5.8],
      [sign * 21.8, 106.5, 6.4],
    ], 0.20, 16, 6));

    // Radial Artery (橈動脈 — lateral forearm to radial wrist & deep palmar arch)
    upperArteryTubes.push(buildTubeCm([
      [sign * 21.6, 104.2, 7.1],
      [sign * 23.4, 97.5, 8.2],
      [sign * 25.0, 90.0, 9.9],
      [sign * 26.6, 82.5, 12.2],
      [sign * 27.6, 77.5, 14.5],
    ], 0.24, 22, 8));

    // Ulnar Artery (尺動脈 — medial forearm to ulnar wrist & superficial palmar arch)
    upperArteryTubes.push(buildTubeCm([
      [sign * 21.6, 104.2, 7.1],
      [sign * 21.9, 96.8, 7.4],
      [sign * 22.9, 89.2, 9.0],
      [sign * 24.4, 82.2, 11.4],
      [sign * 25.6, 77.0, 13.5],
    ], 0.24, 22, 8));

    // Common Interosseous Artery (骨間總動脈)
    upperArteryTubes.push(buildTubeCm([
      [sign * 21.8, 101.0, 7.3],
      [sign * 23.2, 94.0, 8.2],
      [sign * 24.8, 85.5, 10.4],
    ], 0.16, 14, 6));

    // Superficial & Deep Palmar Arches + Digital Arteries (掌淺弓・掌深弓與五指指動脈)
    upperArteryTubes.push(buildTubeCm([
      [sign * 27.6, 77.5, 14.5],
      [sign * 27.8, 75.0, 14.8],
      [sign * 26.8, 74.6, 14.0],
      [sign * 25.6, 77.0, 13.5],
    ], 0.19, 16, 6));
    // Digital arteries radiating toward digits
    for (const [dx, dy, dz] of [
      [29.5, 73.5, 16.8],
      [29.2, 70.0, 16.0],
      [28.0, 68.8, 15.0],
      [26.8, 69.5, 14.0],
      [25.6, 71.2, 13.0],
    ]) {
      upperArteryTubes.push(buildTubeCm([
        [sign * 27.0, 75.2, 14.4],
        [sign * dx, dy, dz],
      ], 0.13, 10, 6));
    }
  }
  const upper_limb_arteries = finalizeCmGeos(upperArteryTubes);

  // --- B4. Pelvic & Lower Limb Arteries (骨盆與下肢動脈：髂總・髂內外・股・膕・脛前後與足背動脈) ---
  const lowerArteryTubes = [];
  for (const sign of [1, -1]) {
    // Common Iliac -> External Iliac -> Femoral -> Popliteal Artery
    lowerArteryTubes.push(buildTubeCm([
      [0.2, 97.5, 10.2],
      [sign * 3.4, 92.0, 10.0],
      [sign * 5.8, 86.2, 10.8],
      [sign * 7.5, 80.5, 11.2],
      [sign * 8.2, 70.5, 10.3],
      [sign * 8.2, 59.5, 9.0],
      [sign * 8.0, 48.0, 7.2],
      [sign * 8.2, 40.0, 6.2],
      [sign * 8.4, 34.5, 6.2],
    ], 0.44, 34, 10));

    // Internal Iliac Artery (髂內動脈 — pelvic visceral & gluteal branches)
    lowerArteryTubes.push(buildTubeCm([
      [sign * 3.4, 92.0, 10.0],
      [sign * 4.2, 86.8, 8.2],
      [sign * 3.6, 82.0, 7.6],
      [sign * 2.4, 79.0, 8.8],
    ], 0.28, 16, 8));

    // Deep Femoral Artery (股深動脈 Profunda femoris + Lateral/Medial Circumflex Femoral)
    lowerArteryTubes.push(buildTubeCm([
      [sign * 7.6, 78.5, 10.9],
      [sign * 10.2, 72.0, 9.2],
      [sign * 10.4, 63.0, 8.6],
      [sign * 9.6, 53.5, 8.0],
    ], 0.28, 18, 8));
    lowerArteryTubes.push(buildTubeCm([
      [sign * 8.4, 77.5, 10.4],
      [sign * 11.6, 76.5, 8.8],
      [sign * 12.8, 74.0, 7.8],
    ], 0.20, 12, 6));

    // Anterior Tibial Artery -> Dorsalis Pedis Artery -> Arcuate & Metatarsal Arteries (脛前動脈與足背動脈)
    lowerArteryTubes.push(buildTubeCm([
      [sign * 8.4, 34.5, 6.2],
      [sign * 9.3, 29.0, 7.3],
      [sign * 9.2, 20.0, 7.1],
      [sign * 8.7, 11.5, 7.2],
      [sign * 8.4, 6.2, 8.4],
      [sign * 9.2, 3.0, 13.5],
      [sign * 10.2, 1.4, 18.5],
    ], 0.26, 26, 8));

    // Posterior Tibial Artery -> Medial/Lateral Plantar Arch (脛後動脈與足底動脈弓)
    lowerArteryTubes.push(buildTubeCm([
      [sign * 8.4, 34.5, 6.2],
      [sign * 8.2, 25.0, 5.4],
      [sign * 7.9, 15.0, 5.2],
      [sign * 7.4, 6.0, 6.0],
      [sign * 8.2, 2.2, 9.2],
      [sign * 9.6, 1.2, 15.2],
    ], 0.25, 24, 8));

    // Fibular / Peroneal Artery (腓動脈)
    lowerArteryTubes.push(buildTubeCm([
      [sign * 8.3, 31.0, 5.8],
      [sign * 9.8, 22.0, 5.4],
      [sign * 9.6, 11.0, 5.4],
    ], 0.20, 16, 6));
  }
  const lower_limb_arteries = finalizeCmGeos(lowerArteryTubes);

  // --- C1. Superior & Inferior Vena Cava, Brachiocephalic, Hepatic, Renal & Azygos Veins (上下腔靜脈與奇靜脈系統) ---
  const venaCavaTubes = [];
  // Superior Vena Cava (上腔靜脈 SVC) entering superior right atrium
  venaCavaTubes.push(buildTubeCm([
    [-2.2, 133.2, 12.2],
    [-2.1, 129.5, 12.2],
    [-1.9, 125.8, 12.2],
  ], 0.86, 18, 10));
  // Right Brachiocephalic Vein (右頭臂靜脈)
  venaCavaTubes.push(buildTubeCm([
    [-2.9, 135.8, 11.8],
    [-2.5, 134.4, 12.0],
    [-2.2, 133.2, 12.2],
  ], 0.58, 12, 8));
  // Left Brachiocephalic Vein (左頭臂靜脈 — crossing obliquely anterior to supra-aortic trunks)
  venaCavaTubes.push(buildTubeCm([
    [2.9, 135.6, 11.8],
    [0.8, 134.6, 12.5],
    [-1.2, 133.8, 12.4],
    [-2.2, 133.2, 12.2],
  ], 0.56, 18, 8));

  // Inferior Vena Cava (下腔靜脈 IVC): L5 common iliac confluence -> retrohepatic IVC -> diaphragm caval opening -> inferior right atrium
  venaCavaTubes.push(buildTubeCm([
    [-0.9, 96.2, 9.7],
    [-1.3, 102.0, 9.7],
    [-1.5, 108.0, 9.8],
    [-1.6, 114.5, 10.4],
    [-1.6, 118.8, 11.2],
    [-1.6, 122.2, 11.6],
  ], 0.92, 28, 12));

  // Hepatic Veins (肝右・肝中・肝左靜脈匯入下腔靜脈上段)
  venaCavaTubes.push(buildTubeCm([
    [-7.2, 114.2, 12.4],
    [-4.4, 115.8, 11.6],
    [-1.6, 117.2, 10.8],
  ], 0.36, 14, 8));
  venaCavaTubes.push(buildTubeCm([
    [-2.4, 113.5, 13.8],
    [-2.0, 115.6, 12.4],
    [-1.6, 117.2, 10.8],
  ], 0.34, 14, 8));
  venaCavaTubes.push(buildTubeCm([
    [2.2, 114.8, 13.2],
    [0.2, 116.2, 12.0],
    [-1.6, 117.2, 10.8],
  ], 0.32, 14, 8));

  // Bilateral Renal Veins (左右腎靜脈匯入下腔靜脈)
  venaCavaTubes.push(buildTubeCm([
    [-5.2, 105.8, 8.1],
    [-3.2, 106.4, 9.1],
    [-1.5, 106.8, 9.8],
  ], 0.38, 12, 8));
  venaCavaTubes.push(buildTubeCm([
    [5.2, 106.4, 8.1],
    [1.8, 106.8, 10.2],
    [-1.5, 107.0, 9.9],
  ], 0.38, 16, 8));

  // Azygos & Hemiazygos Venous System (奇靜脈與半奇靜脈系統)
  venaCavaTubes.push(buildTubeCm([
    [-1.2, 108.0, 8.2],
    [-1.1, 115.0, 7.8],
    [-1.1, 122.5, 7.8],
    [-1.4, 127.8, 8.6],
    [-1.9, 129.6, 10.6],
    [-2.1, 129.5, 12.2],
  ], 0.28, 24, 8));
  venaCavaTubes.push(buildTubeCm([
    [1.4, 108.5, 8.2],
    [1.4, 115.0, 7.9],
    [1.2, 120.5, 7.8],
    [-1.1, 121.2, 7.8],
  ], 0.22, 18, 6));
  const vena_cava = finalizeCmGeos(venaCavaTubes);

  // --- C2. Head & Neck Veins: Dural Venous Sinuses, Internal/External Jugular & Subclavian Origins ---
  const headNeckVeinTubes = [];
  // Superior Sagittal Sinus (上矢狀竇) along midline cranial vault to Confluence of Sinuses
  headNeckVeinTubes.push(buildTubeCm([
    [0.0, 155.5, 16.8],
    [0.0, 160.5, 14.5],
    [0.0, 162.4, 10.0],
    [0.0, 160.8, 4.8],
    [0.0, 156.5, 1.6],
    [0.0, 153.5, 1.5],
  ], 0.30, 24, 8));
  // Inferior Sagittal Sinus & Straight Sinus (下矢狀竇與直竇)
  headNeckVeinTubes.push(buildTubeCm([
    [0.0, 156.8, 10.5],
    [0.0, 155.5, 7.2],
    [0.0, 154.2, 4.2],
    [0.0, 153.5, 1.5],
  ], 0.22, 16, 6));

  for (const sign of [1, -1]) {
    // Transverse Sinus -> Sigmoid Sinus -> Jugular Bulb (橫竇與乙狀竇)
    headNeckVeinTubes.push(buildTubeCm([
      [0.0, 153.5, 1.5],
      [sign * 2.8, 153.2, 2.4],
      [sign * 4.6, 152.4, 5.2],
      [sign * 4.2, 150.6, 7.4],
      [sign * 3.0, 149.2, 8.4],
    ], 0.28, 18, 8));

    // Cavernous Sinus & Ophthalmic / Superior Petrosal Veins (海綿竇與眼靜脈／岩竇)
    headNeckVeinTubes.push(buildTubeCm([
      [sign * 2.4, 153.8, 14.8],
      [sign * 1.6, 153.2, 11.4],
      [sign * 2.6, 151.0, 9.4],
      [sign * 3.0, 149.2, 8.4],
    ], 0.20, 14, 6));

    // Internal Jugular Vein (內頸靜脈 IJV): descending in carotid sheath lateral to ICA/CCA to venous angle
    headNeckVeinTubes.push(buildTubeCm([
      [sign * 3.0, 149.2, 8.4],
      [sign * 3.2, 145.0, 9.6],
      [sign * 3.1, 140.2, 10.8],
      [sign * 2.9, 135.6, 11.8],
    ], 0.44, 18, 8));

    // Facial & Retromandibular Vein joining IJV (面靜脈與下頜後靜脈)
    headNeckVeinTubes.push(buildTubeCm([
      [sign * 2.2, 150.8, 16.8],
      [sign * 3.6, 147.5, 14.2],
      [sign * 3.6, 145.2, 11.4],
      [sign * 3.2, 144.2, 10.0],
    ], 0.18, 14, 6));

    // External Jugular Vein (外頸靜脈 EJV): superficial neck drainage into subclavian vein
    headNeckVeinTubes.push(buildTubeCm([
      [sign * 4.8, 151.5, 10.4],
      [sign * 4.6, 146.5, 10.4],
      [sign * 4.4, 141.0, 10.6],
      [sign * 3.9, 135.6, 11.2],
    ], 0.22, 16, 6));
  }
  const jugular_cranial_veins = finalizeCmGeos(headNeckVeinTubes);

  // --- C3. Hepatic Portal Venous System (肝門靜脈系統：肝門靜脈・脾靜脈・腸繫膜上下靜脈・胃靜脈) ---
  const portalTubes = [];
  // Main Hepatic Portal Vein (肝門靜脈主幹) & Left/Right Intrahepatic Portal Branches
  portalTubes.push(buildTubeCm([
    [0.5, 108.4, 11.6],
    [-1.4, 110.2, 12.2],
    [-3.6, 112.2, 12.7],
  ], 0.48, 16, 10));
  // Right Portal Branch into Right Lobe of Liver
  portalTubes.push(buildTubeCm([
    [-3.6, 112.2, 12.7],
    [-6.2, 112.6, 12.8],
    [-8.6, 110.8, 12.6],
  ], 0.34, 14, 8));
  portalTubes.push(buildTubeCm([
    [-6.2, 112.6, 12.8],
    [-7.8, 115.0, 12.2],
  ], 0.28, 10, 8));
  // Left Portal Branch into Left Lobe of Liver
  portalTubes.push(buildTubeCm([
    [-3.6, 112.2, 12.7],
    [-1.6, 113.8, 13.4],
    [1.2, 114.6, 13.6],
  ], 0.32, 14, 8));

  // Splenic Vein (脾靜脈): from splenic hilum across posterior stomach/pancreas to portal confluence
  portalTubes.push(buildTubeCm([
    [8.6, 111.8, 9.8],
    [5.8, 110.4, 10.6],
    [3.0, 109.2, 11.2],
    [0.5, 108.4, 11.6],
  ], 0.34, 18, 8));

  // Superior Mesenteric Vein (腸繫膜上靜脈 SMV) & Mesenteric Tributaries
  portalTubes.push(buildTubeCm([
    [-3.2, 91.0, 14.0],
    [-0.8, 97.0, 14.4],
    [0.4, 103.0, 13.4],
    [0.5, 108.4, 11.6],
  ], 0.38, 22, 8));
  for (const [bx, by, tx, ty] of [
    [0.2, 104.5, 3.8, 101.5],
    [0.0, 100.0, 4.2, 96.5],
    [-0.4, 98.5, -4.6, 97.5],
  ]) {
    portalTubes.push(buildTubeCm([
      [bx, by, 13.8],
      [tx, ty, 14.4],
    ], 0.20, 10, 6));
  }

  // Inferior Mesenteric Vein (腸繫膜下靜脈 IMV): draining left colon & rectum into splenic vein
  portalTubes.push(buildTubeCm([
    [1.2, 86.5, 11.0],
    [4.0, 92.0, 12.6],
    [4.4, 99.0, 12.6],
    [3.6, 105.0, 11.8],
    [3.0, 109.2, 11.2],
  ], 0.26, 22, 8));

  // Left Gastric (Coronary) Vein (胃左靜脈) draining lesser curvature of stomach into portal trunk
  portalTubes.push(buildTubeCm([
    [3.6, 114.2, 13.6],
    [1.6, 112.4, 12.8],
    [-0.8, 109.6, 12.0],
  ], 0.22, 14, 6));
  const hepatic_portal_system = finalizeCmGeos(portalTubes);

  // --- C4. Upper Limb Superficial & Deep Veins (上肢深淺靜脈：頭靜脈・貴要靜脈・肘正中靜脈・肱／腋／鎖骨下靜脈) ---
  const upperVeinTubes = [];
  for (const sign of [1, -1]) {
    // Subclavian -> Axillary -> Brachial Deep Vein
    upperVeinTubes.push(buildTubeCm([
      [sign * 2.9, 135.6, 11.8],
      [sign * 6.5, 135.0, 10.5],
      [sign * 11.5, 133.6, 9.1],
      [sign * 16.2, 129.4, 8.2],
      [sign * 18.8, 119.0, 7.2],
      [sign * 21.0, 105.0, 7.5],
    ], 0.34, 26, 8));

    // Cephalic Vein (頭靜脈 — lateral superficial pathway from dorsal thumb/wrist along radial forearm, lateral biceps & deltopectoral groove)
    upperVeinTubes.push(buildTubeCm([
      [sign * 28.4, 76.5, 15.2],
      [sign * 27.4, 82.8, 13.0],
      [sign * 25.8, 91.0, 10.5],
      [sign * 24.0, 99.0, 8.6],
      [sign * 22.8, 105.5, 7.8],
      [sign * 21.4, 115.5, 7.6],
      [sign * 19.4, 125.8, 8.5],
      [sign * 15.0, 132.5, 9.8],
      [sign * 11.5, 133.6, 9.1],
    ], 0.24, 30, 8));

    // Basilic Vein (貴要靜脈 — medial superficial pathway from ulnar hand/forearm ascending medially into axillary vein)
    upperVeinTubes.push(buildTubeCm([
      [sign * 25.2, 75.8, 13.2],
      [sign * 24.0, 82.2, 11.5],
      [sign * 22.4, 90.5, 9.0],
      [sign * 21.0, 98.5, 7.6],
      [sign * 20.2, 105.5, 7.2],
      [sign * 18.2, 116.5, 7.1],
      [sign * 16.2, 129.4, 8.2],
    ], 0.25, 26, 8));

    // Median Cubital Vein (肘正中靜脈 — oblique anastomosis across the cubital fossa)
    upperVeinTubes.push(buildTubeCm([
      [sign * 23.5, 101.2, 8.3],
      [sign * 21.8, 103.8, 7.9],
      [sign * 20.2, 105.5, 7.2],
    ], 0.22, 12, 6));

    // Dorsal Venous Network of Hand (手背靜脈網)
    upperVeinTubes.push(buildTubeCm([
      [sign * 28.4, 76.5, 15.2],
      [sign * 28.0, 73.2, 15.2],
      [sign * 26.5, 73.0, 14.0],
      [sign * 25.2, 75.8, 13.2],
    ], 0.18, 14, 6));
  }
  const upper_limb_veins = finalizeCmGeos(upperVeinTubes);

  // --- C5. Lower Limb Superficial & Deep Veins (下肢深淺靜脈：大隱靜脈・小隱靜脈・股靜脈・膕靜脈・髂靜脈) ---
  const lowerVeinTubes = [];
  for (const sign of [1, -1]) {
    // Common Iliac -> External Iliac -> Femoral -> Popliteal -> Posterior Tibial Deep Vein
    lowerVeinTubes.push(buildTubeCm([
      [-0.9, 96.2, 9.7],
      [sign * 3.0, 91.5, 9.6],
      [sign * 5.3, 85.8, 10.4],
      [sign * 7.0, 80.2, 10.8],
      [sign * 7.7, 70.0, 9.9],
      [sign * 7.8, 59.0, 8.6],
      [sign * 7.8, 47.5, 6.8],
      [sign * 8.0, 39.5, 5.9],
      [sign * 8.0, 26.0, 5.3],
      [sign * 7.7, 14.5, 5.2],
      [sign * 7.3, 5.8, 6.0],
    ], 0.42, 34, 10));

    // Internal Iliac Vein (髂內靜脈)
    lowerVeinTubes.push(buildTubeCm([
      [sign * 3.0, 91.5, 9.6],
      [sign * 3.8, 86.2, 7.9],
      [sign * 3.2, 81.5, 7.5],
    ], 0.26, 14, 8));

    // Deep Femoral Vein (股深靜脈)
    lowerVeinTubes.push(buildTubeCm([
      [sign * 7.2, 77.5, 10.5],
      [sign * 9.6, 70.5, 8.9],
      [sign * 9.8, 61.0, 8.3],
    ], 0.26, 16, 8));

    // Great Saphenous Vein (大隱靜脈 — medial dorsal foot -> anterior to medial malleolus -> medial leg/knee/thigh -> saphenofemoral junction)
    lowerVeinTubes.push(buildTubeCm([
      [sign * 8.2, 2.2, 14.8],
      [sign * 6.8, 6.2, 7.8],
      [sign * 6.8, 18.0, 7.5],
      [sign * 6.8, 30.0, 7.6],
      [sign * 6.6, 41.0, 7.8],
      [sign * 6.5, 54.5, 9.6],
      [sign * 6.6, 68.0, 10.8],
      [sign * 7.0, 79.2, 11.0],
    ], 0.28, 32, 8));

    // Small Saphenous Vein (小隱靜脈 — lateral foot -> posterior to lateral malleolus -> posterior calf -> popliteal vein)
    lowerVeinTubes.push(buildTubeCm([
      [sign * 10.6, 2.0, 13.8],
      [sign * 10.2, 5.8, 6.2],
      [sign * 9.1, 17.5, 4.8],
      [sign * 8.6, 29.5, 5.1],
      [sign * 8.0, 39.5, 5.9],
    ], 0.22, 22, 8));

    // Dorsal Venous Arch of Foot (足背靜脈弓)
    lowerVeinTubes.push(buildTubeCm([
      [sign * 8.2, 2.2, 14.8],
      [sign * 9.5, 1.6, 16.8],
      [sign * 10.6, 2.0, 13.8],
    ], 0.20, 12, 6));
  }
  const lower_limb_veins = finalizeCmGeos(lowerVeinTubes);

  return {
    heart_ventricles,
    heart_atria,
    aortic_arch,
    pulmonary_vessels,
    coronary_vessels,
    carotid_vertebral_arteries,
    thoracic_abdominal_aorta,
    upper_limb_arteries,
    lower_limb_arteries,
    vena_cava,
    jugular_cranial_veins,
    hepatic_portal_system,
    upper_limb_veins,
    lower_limb_veins,
  };
}
