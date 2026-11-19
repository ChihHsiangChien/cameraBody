import * as THREE from 'three';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  mergeBufferGeometries,
  meshInCm,
  splitGeometryByComponents,
} from '../neuro-builder.js';

export const ENDOCRINE_META = Object.freeze({
  id: 'endocrine',
  titleZh: '內分泌系統 3D 專頁',
  titleEn: '3D Endocrine System',
  subtitleZh: '下視丘・腦下垂體・松果體・甲狀腺與副甲狀腺・胸腺・腎上腺・胰島・性腺',
  subtitleEn: 'Hypothalamus · Pituitary · Pineal · Thyroid & Parathyroid · Thymus · Adrenal · Pancreas · Gonads',
});

export const ENDOCRINE_CATEGORIES = Object.freeze([
  {
    id: 'cranialEndocrine',
    icon: '●',
    nameZh: '顱內中樞內分泌腺 (下視丘・腦下垂體・松果體)',
    nameEn: 'Cranial Neuroendocrine Glands (Hypothalamus, Pituitary, Pineal)',
    color: '#e879f9',
  },
  {
    id: 'cervicalThoracicEndocrine',
    icon: '◆',
    nameZh: '頸部與胸腔內分泌腺 (甲狀腺・副甲狀腺・胸腺)',
    nameEn: 'Cervical & Thoracic Endocrine Glands (Thyroid, Parathyroid, Thymus)',
    color: '#e05a47',
  },
  {
    id: 'abdominalPelvicEndocrine',
    icon: '✦',
    nameZh: '腹腔與骨盆內分泌腺 (腎上腺・胰島・性腺)',
    nameEn: 'Abdominal & Pelvic Endocrine Glands (Adrenal, Pancreas, Gonads)',
    color: '#fb923c',
  },
  {
    id: 'contextOrgans',
    icon: '❖',
    nameZh: '毗鄰參照器官 (腦幹間腦・雙腎參照)',
    nameEn: 'Adjacent Reference Organs (Brainstem & Kidneys)',
    color: '#b89c8e',
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

export const ENDOCRINE_STRUCTURES = Object.freeze([
  // --- 1. 顱內中樞內分泌腺 (Cranial Neuroendocrine Glands) ---
  {
    id: 'hypothalamus',
    category: 'cranialEndocrine',
    nameZh: '下視丘 (神經內分泌最高整合中樞・下視丘-垂體軸)',
    nameEn: 'Hypothalamus (Master Neuroendocrine Integration Center)',
    pinZh: '下視丘 (神經內分泌中樞)',
    pinEn: 'Hypothalamus',
    anchorL: [0.0000, 0.4000, 0.0300],
    bundle: 'custom',
    meshes: ['endo_hypothalamus'],
    color: '#f472b6',
    descZh: '位於間腦腹側、第三腦室下方與視交叉上方，為連接神經系統與內分泌系統的最高整合中樞；分泌多種釋放激素 (TRH, CRH, GnRH, GHRH) 與抑制激素 (Somatostatin, Dopamine) 經垂體門脈系統精準調控腦下垂體前葉，並合成催產素與抗利尿激素 (ADH) 送往腦下垂體後葉。',
    descEn: 'Ventral diencephalic neuroendocrine command center above the optic chiasm; secretes releasing and inhibiting hormones (TRH, CRH, GnRH, GHRH, somatostatin, dopamine) via the hypophyseal portal system and synthesizes oxytocin and ADH/vasopressin.',
  },
  {
    id: 'pituitaryGland',
    category: 'cranialEndocrine',
    nameZh: '腦下垂體 (前葉腺垂體與後葉神經垂體・蝶骨蝶鞍主控腺體)',
    nameEn: 'Pituitary Gland / Hypophysis (Anterior & Posterior Lobes)',
    pinZh: '腦下垂體 (主控腺體)',
    pinEn: 'Pituitary Gland (Hypophysis)',
    anchorL: [0.0000, 0.3870, 0.0340],
    bundle: 'custom',
    meshes: ['endo_pituitary'],
    color: '#e879f9',
    descZh: '藉漏斗柄懸垂於下視丘下方並坐落於蝶骨蝶鞍垂體窩內，譽為「內分泌主控腺體」：前葉（腺垂體）分泌生長激素 (GH)、促甲狀腺素 (TSH)、促腎上腺皮質素 (ACTH)、濾泡刺激素 (FSH)、黃體成長激素 (LH) 與泌乳素 (PRL)；後葉（神經垂體）儲存並釋放抗利尿激素 (ADH) 與催產素 (Oxytocin)。',
    descEn: 'Suspended from the hypothalamus by the infundibulum within the sella turcica of the sphenoid bone; the anterior lobe (adenohypophysis) secretes GH, TSH, ACTH, FSH, LH, and PRL, while the posterior lobe (neurohypophysis) releases ADH and oxytocin.',
  },
  {
    id: 'pinealGland',
    category: 'cranialEndocrine',
    nameZh: '松果體 (上視丘背側・分泌褪黑激素調節晝夜節律)',
    nameEn: 'Pineal Gland / Epiphysis Cerebri (Melatonin & Circadian Rhythm)',
    pinZh: '松果體 (褪黑激素)',
    pinEn: 'Pineal Gland',
    anchorL: [0.0000, 0.4010, -0.0040],
    bundle: 'custom',
    meshes: ['endo_pineal'],
    color: '#a855f7',
    descZh: '位於間腦背側上視丘（第三腦室後壁、中腦上丘上方），形似松果；其松果體細胞受視交叉上核 (SCN) 光暗訊號調控，於夜間合成並分泌「褪黑激素 (Melatonin)」，負責調節人體生理時鐘、晝夜節律與睡眠覺醒週期。',
    descEn: 'Small pinecone-shaped midline gland of the dorsal epithalamus superior to the midbrain colliculi; pinealocytes synthesize and secrete melatonin in response to dark-light signals from the suprachiasmatic nucleus to regulate circadian rhythms and sleep cycles.',
  },

  // --- 2. 頸部與胸腔內分泌腺 (Cervical & Thoracic Endocrine Glands) ---
  {
    id: 'thyroidGland',
    category: 'cervicalThoracicEndocrine',
    nameZh: '甲狀腺 (左右側葉與峽部・分泌甲狀腺素 T3/T4 與降鈣素)',
    nameEn: 'Thyroid Gland (Left/Right Lobes & Isthmus — T3, T4, Calcitonin)',
    pinZh: '甲狀腺 (T3/T4 代謝調控)',
    pinEn: 'Thyroid Gland',
    anchorL: [0.0130, 0.2380, 0.0380],
    bundle: 'custom',
    meshes: ['endo_thyroid'],
    color: '#e05a47',
    descZh: '位於頸部前側（第 5 頸椎至第 1 胸椎高度）、環狀軟骨與氣管上段前方，為人體最大純內分泌腺，呈蝴蝶形左右兩葉與中央峽部；濾泡細胞分泌甲狀腺素 (T4) 與三碘甲狀腺素 (T3) 調控全身基礎代謝率、產熱與生長發育，濾泡傍 C 細胞則分泌降鈣素 (Calcitonin) 降低血鈣。',
    descEn: 'Butterfly-shaped gland spanning C5–T1 anterior to the upper trachea with left and right lobes joined by the isthmus; follicular cells secrete T3 and T4 to govern basal metabolic rate and development, while parafollicular C-cells secrete calcitonin.',
  },
  {
    id: 'parathyroidGlands',
    category: 'cervicalThoracicEndocrine',
    nameZh: '副甲狀腺 (上下兩對共四枚・分泌副甲狀腺素 PTH 調控血鈣)',
    nameEn: 'Parathyroid Glands (Superior & Inferior Pairs — PTH Calcium Homeostasis)',
    pinZh: '副甲狀腺 (血鈣平衡)',
    pinEn: 'Parathyroid Glands (4)',
    anchorL: [-0.0160, 0.2380, 0.0200],
    bundle: 'custom',
    meshes: ['endo_parathyroid'],
    color: '#facc15',
    descZh: '貼附於甲狀腺左右兩葉背面包膜上的四枚扁圓豆狀小腺體（左右上下共 4 枚）；主細胞敏銳偵測血鈣濃度並分泌「副甲狀腺素 (PTH)」，透過促進蝕骨細胞釋出骨鈣、增加腎小管鈣再吸收並活化維生素 D 以提升血鈣與維持神經肌肉興奮性穩定。',
    descEn: 'Four lentil-sized glands embedded on the posterior surface of the left and right thyroid lobes; chief cells monitor serum calcium and secrete parathyroid hormone (PTH) to raise blood calcium via bone resorption, renal calcium reabsorption, and vitamin D activation.',
  },
  {
    id: 'thymusGland',
    category: 'cervicalThoracicEndocrine',
    nameZh: '胸腺 (前上縱膈左右兩葉・分泌胸腺素促進 T 淋巴球成熟)',
    nameEn: 'Thymus Gland (Anterior Superior Mediastinum — Thymosin & T-Cell Maturation)',
    pinZh: '胸腺 (T細胞免疫內分泌)',
    pinEn: 'Thymus Gland',
    anchorL: [0.0210, 0.1390, 0.0640],
    bundle: 'custom',
    meshes: ['endo_thymus'],
    color: '#f59e0b',
    descZh: '位於胸腔前上縱膈（胸骨柄後方、心包膜與主動脈弓前方），由不對稱之左右兩扁長葉組成；兼具免疫與內分泌雙重功能，分泌胸腺素 (Thymosin)、胸腺生成素 (Thymopoietin) 等激素，誘導骨髓遷入之前驅細胞分化為具免疫辨識能力的成熟 T 淋巴球。',
    descEn: 'Bilobed lymphoid and endocrine organ situated in the anterior superior mediastinum behind the manubrium sterni; secretes thymosin and thymopoietin to drive the differentiation, selection, and immunocompetence of T-lymphocytes.',
  },

  // --- 3. 腹腔與骨盆內分泌腺 (Abdominal & Pelvic Endocrine Glands) ---
  {
    id: 'adrenalGlands',
    category: 'abdominalPelvicEndocrine',
    nameZh: '左右腎上腺 (皮質分泌皮質醇與醛固酮・髓質分泌腎上腺素)',
    nameEn: 'Left & Right Adrenal (Suprarenal) Glands (Cortex & Medulla)',
    pinZh: '左右腎上腺 (皮質醇・腎上腺素)',
    pinEn: 'Adrenal (Suprarenal) Glands',
    anchorL: [-0.0480, -0.0490, -0.0080],
    bundle: 'custom',
    meshes: ['endo_adrenals'],
    color: '#fb923c',
    descZh: '位於左右雙腎上極上方（左呈半月形、右呈金字塔三角形），分為兩層獨立內分泌構造：外層「腎上腺皮質」（球狀帶分泌醛固酮調控鹽水血壓、束狀帶分泌皮質醇抗壓與升糖、網狀帶分泌雄性素 DHEA）與內層「腎上腺髓質」（受交感神經刺激分泌腎上腺素與正腎上腺素，啟動戰或逃反應）。',
    descEn: 'Paired retroperitoneal glands capping the superior poles of both kidneys; outer adrenal cortex secretes aldosterone (mineralocorticoid), cortisol (glucocorticoid), and androgens, while inner adrenal medulla secretes epinephrine and norepinephrine for sympathetic fight-or-flight response.',
  },
  {
    id: 'pancreasIslets',
    category: 'abdominalPelvicEndocrine',
    nameZh: '胰臟與蘭氏胰島 (α 細胞升糖素・β 細胞胰島素・δ 細胞體抑素)',
    nameEn: 'Pancreas & Islets of Langerhans (Insulin, Glucagon & Somatostatin)',
    pinZh: '胰臟與蘭氏胰島 (胰島素／升糖素)',
    pinEn: 'Pancreatic Islets of Langerhans',
    anchorL: [0.0020, -0.0920, 0.0490],
    bundle: 'custom',
    meshes: ['endo_pancreas'],
    color: '#fcd34d',
    descZh: '橫臥於胃後方的後腹膜腔（第 1–2 腰椎高度，分胰頭、胰頸、胰體與胰尾），內部散佈約 100–200 萬個內分泌「蘭氏胰島 (Islets of Langerhans)」：α 細胞分泌升糖素 (Glucagon) 促進肝醣分解升糖，β 細胞分泌胰島素 (Insulin) 促進細胞攝取葡萄糖降糖，δ 細胞分泌體抑素 (Somatostatin) 協同維持血糖恆定。',
    descEn: 'Elongated retroperitoneal gland extending from the duodenal C-loop to the splenic hilum at L1–L2; houses 1–2 million endocrine Islets of Langerhans whose alpha cells secrete glucagon, beta cells secrete insulin, and delta cells secrete somatostatin to maintain blood glucose homeostasis.',
  },
  {
    id: 'gonadsEndocrine',
    category: 'abdominalPelvicEndocrine',
    nameZh: '性腺 (睪丸與附睪・男性參照模型，分泌性激素)',
    nameEn: 'Gonads (Testes & Epididymides — Male Reference Model, Sex Hormone Secretion)',
    pinZh: '性腺 (性激素分泌)',
    pinEn: 'Gonads (Endocrine Sex Hormones)',
    anchorL: [0.0000, -0.4430, 0.0720],
    bundle: 'custom',
    meshes: ['endo_gonads'],
    color: '#ec4899',
    descZh: '受下視丘-腦下垂體-性腺軸 (HPG axis: GnRH → FSH / LH) 調控之生殖內分泌腺體：本成人男性參照模型呈現雙側睪丸與附睪，萊氏間質細胞 (Leydig cells) 分泌睪固酮 (Testosterone) 主導第二性徵、精子生成與骨質代謝（女性對應性腺為卵巢，分泌雌激素與黃體素）。',
    descEn: 'Reproductive endocrine glands governed by the hypothalamic-pituitary-gonadal (HPG) axis (FSH & LH); shown on the adult male reference anatomy as paired testes and epididymides whose Leydig cells secrete testosterone (homologous to ovarian estrogen/progesterone secretion in females).',
  },

  // --- 4. 毗鄰參照器官 (Adjacent Context Organs) ---
  {
    id: 'endocrineContext',
    category: 'contextOrgans',
    nameZh: '毗鄰參照構造 (間腦腦幹與雙腎參照位置)',
    nameEn: 'Adjacent Reference Structures (Brainstem/Diencephalon & Kidneys)',
    bundle: 'custom',
    meshes: ['endo_context_organs'],
    color: '#b89c8e',
    opacity: 0.34,
    transparent: true,
    depthWrite: false,
    descZh: '以半透明提供顱內腦幹間腦（下視丘、腦下垂體、松果體之立體對位基準）以及腹腔後壁左右雙腎（腎上腺與胰臟之立體對位基準）的解剖位置參照。',
    descEn: 'Translucent anatomical reference structures (brainstem/diencephalon and left/right kidneys) providing spatial landmarks without obscuring the cranial and retroperitoneal endocrine glands.',
  },

  // --- 5. 脊椎骨各節段 (Vertebral Column) ---
  {
    id: 'cervicalSpine',
    category: 'spine',
    nameZh: '頸椎 (C1–C7：甲狀腺與副甲狀腺後方骨骼基準)',
    nameEn: 'Cervical Vertebrae (C1–C7)',
    bundle: 'body',
    meshes: ['cervical_skel'],
    color: '#e5ded2',
    descZh: '由寰椎 (C1) 至隆椎 (C7) 共 7 節頸椎組成；甲狀腺與四枚副甲狀腺即位於 C5–T1 椎體前方的氣管兩側。',
    descEn: 'Seven cervical vertebrae (C1–C7); the thyroid and parathyroid glands lie anterior to C5–T1.',
  },
  {
    id: 'thoracicSpine',
    category: 'spine',
    nameZh: '胸椎 (T1–T12：十二節胸椎，已與肋骨分離)',
    nameEn: 'Thoracic Vertebrae (T1–T12, Separated from Ribs)',
    bundle: 'custom',
    meshes: ['spine_thoracic'],
    color: '#dfd7ca',
    descZh: '由第 1 至第 12 胸椎 (T1–T12) 獨立組成；上胸椎與胸骨之間為胸腺所在之前上縱膈，下胸椎 (T11–T12) 為腎上腺後方骨骼基準。',
    descEn: 'Twelve thoracic vertebrae (T1–T12) isolated from the ribcage.',
  },
  {
    id: 'lumbarSpine',
    category: 'spine',
    nameZh: '腰椎 (L1–L5：胰臟與腎上腺後方骨骼基準)',
    nameEn: 'Lumbar Vertebrae (L1–L5, Separated from Pelvis)',
    bundle: 'custom',
    meshes: ['spine_lumbar'],
    color: '#dad1c3',
    descZh: '由第 1 至第 5 腰椎 (L1–L5) 獨立組成；胰臟橫跨於第 1–2 腰椎前方，左右腎上腺位於第 11 胸椎至第 1 腰椎兩側。',
    descEn: 'Five lumbar vertebrae (L1–L5); the pancreas crosses anterior to L1–L2 while the adrenal glands sit at T11–L1.',
  },
  {
    id: 'sacrumSpine',
    category: 'spine',
    nameZh: '薦椎與尾椎 (Sacrum：骨盆後壁中軸骨)',
    nameEn: 'Sacrum (S1–S5, Separated from Hip Bones)',
    bundle: 'custom',
    meshes: ['spine_sacrum'],
    color: '#d5ccbe',
    descZh: '由 5 節薦椎融合而成之三角形骨盆後壁中軸骨。',
    descEn: 'Triangular axial bone formed by five fused sacral vertebrae (S1–S5).',
  },

  // --- 6. 頭骨 (Skull) ---
  {
    id: 'cranium',
    category: 'skull',
    nameZh: '顱骨 (蝶骨蝶鞍保護腦下垂體與下視丘)',
    nameEn: 'Cranium (Sphenoid Sella Turcica Housing Pituitary)',
    bundle: 'head',
    meshes: ['cranium'],
    color: '#dfd8cc',
    descZh: '構成顱腔保護大腦、下視丘與松果體；顱底中央的蝶骨蝶鞍 (Sella turcica) 形成垂體窩，專門容納並保護腦下垂體。',
    descEn: 'Cranial skeleton enclosing the brain; the sella turcica (hypophyseal fossa) of the sphenoid bone cradles and protects the pituitary gland.',
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

  // --- 7. 胸廓肋骨・骨盆・四肢與雙手骨骼 (Skeleton) ---
  {
    id: 'ribcageSternum',
    category: 'skeleton',
    nameZh: '胸廓：十二對肋骨與胸骨 (胸骨柄後方保護胸腺)',
    nameEn: 'Ribcage: 12 Pairs of Ribs & Sternum',
    bundle: 'custom',
    meshes: ['skel_ribcage'],
    color: '#d4ccc0',
    descZh: '由左右 12 對肋骨與前方胸骨組成；胸骨柄 (Manubrium) 與上段胸骨體正後方即為前上縱膈的胸腺位置。',
    descEn: 'Twelve pairs of ribs and sternum; the manubrium sterni directly shields the thymus gland in the anterior superior mediastinum.',
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
    nameZh: '骨盆：左右髖骨 (保護骨盆腔與性腺構造)',
    nameEn: 'Pelvis: Left & Right Hip Bones (Ilium, Ischium, Pubis)',
    bundle: 'custom',
    meshes: ['skel_pelvis'],
    color: '#d0c8bc',
    descZh: '由左右兩側髖骨（髂骨、坐骨、恥骨）組成，圍成骨盆腔保護性腺與骨盆臟器。',
    descEn: 'Bilateral pelvic hip bones (ilium, ischium, pubis) enclosing the pelvic cavity.',
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

  // --- 8. 人體外框背景 (Silhouette) ---
  {
    id: 'silhouetteMesh',
    category: 'silhouette',
    nameZh: '人體外框輪廓',
    nameEn: 'Human Body Outline',
    bundle: 'head',
    meshes: ['skin'],
    color: '#38bdf8',
    descZh: '半透明人體外框輪廓背景，提供從顱內下視丘、腦下垂體、頸部甲狀腺、胸腔胸腺至腹腔腎上腺、胰島與性腺的全身空間參照。',
    descEn: 'Translucent human body silhouette contour providing full-body spatial reference for all endocrine glands.',
  },
]);

/** Sweep a smooth 3D tube in BodyParts3D cm coordinates. */
function buildTubeCm(points, radiusCm = 0.25, tubularSegments = 20, radialSegments = 10) {
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
 * Build all custom viewer-space geometries for the 3D Endocrine System page:
 * - endo_hypothalamus (bilateral hypothalamic nuclei & tuber cinereum in ventral diencephalon)
 * - endo_pituitary (infundibular stalk + anterior adenohypophysis & posterior neurohypophysis in sella turcica)
 * - endo_pineal (pineal gland / epiphysis cerebri in dorsal epithalamus)
 * - endo_thyroid (butterfly-shaped left & right thyroid lobes, isthmus & pyramidal lobe at C5–T1)
 * - endo_parathyroid (4 superior & inferior parathyroid glands on posterior thyroid lobes)
 * - endo_thymus (bilobed thymus gland in anterior superior mediastinum behind manubrium)
 * - endo_adrenals (left crescentic & right pyramidal adrenal cortex + medulla atop kidneys)
 * - endo_pancreas (pancreatic head, neck, body, tail & Islets of Langerhans clusters at L1–L2)
 * - endo_gonads (bilateral pelvic gonadal endocrine structures + gonadal vascular/ductal stalks)
 * - endo_context_organs (brainstem reference from headGeos.hindbrain + bilateral kidneys from bodyGeos.organs_kidneys)
 */
export function buildEndocrineSystemGeometries({
  headGeos,
  headCmMatrix,
  bodyMeta,
  bodyGeos,
  extraMeta = null,
  extraGeos = null,
  cmToViewer = makeCmToViewerMatrix(),
}) {
  const finalizeCm = geo => {
    const out = geo.clone().applyMatrix4(cmToViewer);
    out.computeVertexNormals();
    out.computeBoundingBox();
    out.computeBoundingSphere();
    return out;
  };

  // 1. Hypothalamus (endo_hypothalamus)
  const extraHypo = meshInCm(extraMeta, extraGeos, 'extra_hypothalamus');
  const endo_hypothalamus = finalizeCm(
    extraHypo ||
      mergeBufferGeometries([
        buildEllipsoidCm([0.58, 155.85, 10.55], [0.68, 0.95, 1.05], [0.22, 0.08, -0.15], 22, 16),
        buildEllipsoidCm([-0.58, 155.85, 10.55], [0.68, 0.95, 1.05], [0.22, -0.08, 0.15], 22, 16),
        buildEllipsoidCm([0.0, 155.15, 10.85], [0.55, 0.55, 0.65], [0.35, 0, 0], 18, 14),
      ])
  );

  // 2. Pituitary Gland / Hypophysis (endo_pituitary)
  const extraPituitary = meshInCm(extraMeta, extraGeos, 'extra_pituitary');
  const endo_pituitary = finalizeCm(
    extraPituitary ||
      mergeBufferGeometries([
        buildTubeCm([[0.0, 155.05, 10.92], [0.0, 154.55, 11.20], [0.0, 154.10, 11.42]], 0.20, 12, 10),
        buildEllipsoidCm([0.0, 153.95, 11.62], [0.72, 0.52, 0.48], [0.15, 0, 0], 22, 16),
        buildEllipsoidCm([0.0, 153.98, 11.15], [0.52, 0.44, 0.36], [-0.15, 0, 0], 20, 14),
      ])
  );

  // 3. Pineal Gland / Epiphysis Cerebri (endo_pineal)
  const extraPineal = meshInCm(extraMeta, extraGeos, 'extra_pineal');
  const endo_pineal = finalizeCm(
    extraPineal ||
      mergeBufferGeometries([
        buildEllipsoidCm([0.0, 155.35, 7.65], [0.46, 0.48, 0.68], [-0.38, 0, 0], 22, 16),
        buildTubeCm([[0.35, 155.55, 8.25], [0.0, 155.42, 7.92], [-0.35, 155.55, 8.25]], 0.14, 10, 8),
      ])
  );

  // 4 & 5. Thyroid Gland & 4 Parathyroid Glands anchored to real thyroid_cartilage + upper trachea bounds
  const cartilageCm = meshInCm(extraMeta, extraGeos, 'extra_thyroid_cartilage');
  let tx = -0.06;
  let ty = 138.85;
  let tz = 10.75;
  if (cartilageCm) {
    cartilageCm.computeBoundingBox();
    const bb = cartilageCm.boundingBox;
    tx = (bb.min.x + bb.max.x) * 0.5 - 0.12;
    ty = bb.min.y - 1.45;
    tz = (bb.min.z + bb.max.z) * 0.5 - 0.15;
  }

  const thyroidParts = [
    buildEllipsoidCm([tx + 1.38, ty, tz + 0.15], [0.72, 1.65, 0.92], [0.10, 0.28, -0.15], 24, 18),
    buildEllipsoidCm([tx + 1.55, ty + 1.05, tz - 0.10], [0.48, 0.85, 0.65], [0.08, 0.22, -0.20], 18, 14),
    buildEllipsoidCm([tx - 1.38, ty, tz + 0.15], [0.72, 1.65, 0.92], [0.10, -0.28, 0.15], 24, 18),
    buildEllipsoidCm([tx - 1.55, ty + 1.05, tz - 0.10], [0.48, 0.85, 0.65], [0.08, -0.22, 0.20], 18, 14),
    buildEllipsoidCm([tx, ty - 0.55, tz + 0.98], [1.10, 0.58, 0.36], [0.08, 0, 0], 20, 14),
    buildEllipsoidCm([tx + 0.28, ty + 0.32, tz + 0.95], [0.24, 0.58, 0.22], [0.05, 0, -0.12], 14, 10),
  ];
  const endo_thyroid = finalizeCm(mergeBufferGeometries(thyroidParts));

  const parathyroidParts = [
    buildEllipsoidCm([tx + 1.52, ty + 0.78, tz - 0.72], [0.34, 0.44, 0.30], [0, 0.2, 0], 16, 12),
    buildEllipsoidCm([tx + 1.40, ty - 0.92, tz - 0.65], [0.36, 0.46, 0.32], [0, 0.2, 0], 16, 12),
    buildEllipsoidCm([tx - 1.52, ty + 0.78, tz - 0.72], [0.34, 0.44, 0.30], [0, -0.2, 0], 16, 12),
    buildEllipsoidCm([tx - 1.40, ty - 0.92, tz - 0.65], [0.36, 0.46, 0.32], [0, -0.2, 0], 16, 12),
  ];
  const endo_parathyroid = finalizeCm(mergeBufferGeometries(parathyroidParts));

  // 6. Thymus Gland (endo_thymus)
  const extraThymus = meshInCm(extraMeta, extraGeos, 'extra_thymus');
  const endo_thymus = finalizeCm(
    extraThymus ||
      mergeBufferGeometries([
        buildEllipsoidCm([0.92, 130.25, 14.15], [1.10, 3.10, 0.78], [0.20, 0.12, -0.14], 24, 18),
        buildEllipsoidCm([-0.92, 130.10, 14.15], [1.10, 3.05, 0.78], [0.20, -0.12, 0.14], 24, 18),
        buildEllipsoidCm([0.0, 129.90, 14.25], [0.95, 1.65, 0.65], [0.20, 0, 0], 18, 14),
      ])
  );

  // 7. Left & Right Adrenal (Suprarenal) Glands (endo_adrenals)
  const extraAdrenals = meshInCm(extraMeta, extraGeos, 'extra_adrenals');
  const endo_adrenals = finalizeCm(
    extraAdrenals ||
      mergeBufferGeometries([
        buildEllipsoidCm([4.35, 112.15, 7.70], [1.60, 1.30, 0.88], [0.08, -0.15, 0.48], 24, 18),
        buildEllipsoidCm([-5.25, 110.65, 7.48], [1.55, 1.40, 0.88], [0.08, 0.15, -0.42], 24, 18),
      ])
  );

  // 8. Pancreas & Islets of Langerhans (endo_pancreas)
  const extraPancreas = meshInCm(extraMeta, extraGeos, 'extra_pancreas');
  const endo_pancreas = finalizeCm(
    extraPancreas ||
      mergeBufferGeometries([
        buildEllipsoidCm([-1.35, 106.35, 11.15], [1.85, 2.15, 1.25], [0.10, 0.15, -0.25], 24, 18),
        buildTubeCm([[-1.35, 106.45, 11.20], [0.45, 107.45, 11.45], [2.55, 108.35, 11.15], [4.75, 109.15, 10.35], [6.85, 109.95, 9.35]], 1.18, 28, 14),
      ])
  );

  // 9. Gonads — Bilateral Testes & Epididymides (endo_gonads)
  const extraGonads = meshInCm(extraMeta, extraGeos, 'extra_gonads');
  const endo_gonads = finalizeCm(
    extraGonads ||
      mergeBufferGeometries([
        buildEllipsoidCm([1.85, 70.60, 15.10], [1.15, 1.55, 1.05], [0.18, -0.22, -0.15], 24, 18),
        buildEllipsoidCm([-1.85, 70.60, 15.10], [1.15, 1.55, 1.05], [0.18, 0.22, 0.15], 24, 18),
      ])
  );

  // 10. Context Reference Organs: Brainstem (Pons/Midbrain & Medulla from headGeos.hindbrain) + Kidneys (bodyGeos.organs_kidneys)
  const contextPartsCm = [];
  if (bodyMeta && bodyGeos?.organs_kidneys) {
    const kidneyEntry = bodyMeta.meshes.find(m => m.name === 'organs_kidneys');
    if (kidneyEntry?.sourceFrame) {
      contextPartsCm.push(
        bodyGeos.organs_kidneys.clone().applyMatrix4(makeCmMatrix(kidneyEntry.sourceFrame))
      );
    }
  }
  if (headGeos?.hindbrain && headCmMatrix) {
    // Include the brainstem (pons/midbrain + medulla) so cranial endocrine glands (hypothalamus, pituitary, pineal) have clear anatomical context
    const splitHind = splitGeometryByComponents(headGeos.hindbrain, ({ minZ, minY }) => {
      if (minZ < -10.0) return 'cerebellum';
      if (minY < -1.0) return 'medulla';
      return 'pons';
    });
    if (splitHind.pons) contextPartsCm.push(splitHind.pons.clone().applyMatrix4(headCmMatrix));
    if (splitHind.medulla) contextPartsCm.push(splitHind.medulla.clone().applyMatrix4(headCmMatrix));
  }
  if (contextPartsCm.length === 0) {
    contextPartsCm.push(buildEllipsoidCm([0, 106, 7.5], [1, 1, 1]));
  }
  const endo_context_organs = finalizeCm(mergeBufferGeometries(contextPartsCm));

  return {
    endo_hypothalamus,
    endo_pituitary,
    endo_pineal,
    endo_thyroid,
    endo_parathyroid,
    endo_thymus,
    endo_adrenals,
    endo_pancreas,
    endo_gonads,
    endo_context_organs,
  };
}
