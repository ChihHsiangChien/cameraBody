import * as THREE from 'three';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  mergeBufferGeometries,
} from '../neuro-builder.js';

export const DIGESTIVE_META = Object.freeze({
  id: 'digestive',
  titleZh: '消化系統 3D 專頁',
  titleEn: '3D Digestive System',
  subtitleZh: '口腔食道・胃・肝膽胰・小腸・大腸・骨骼系統',
  subtitleEn: 'Esophagus · Stomach · Liver, Gallbladder & Pancreas · Intestines · Skeleton',
});

export const DIGESTIVE_CATEGORIES = Object.freeze([
  {
    id: 'upperGI',
    icon: '●',
    nameZh: '上消化道 (口腔唾液腺・咽・食道・胃)',
    nameEn: 'Upper GI Tract (Salivary Glands, Pharynx, Esophagus, Stomach)',
    color: '#e88d72',
  },
  {
    id: 'hepatobiliaryPancreas',
    icon: '◆',
    nameZh: '肝臟・膽囊膽道・胰臟 (Hepatobiliary & Pancreas)',
    nameEn: 'Hepatobiliary System & Pancreas (Liver, Gallbladder, Pancreas)',
    color: '#9e3b33',
  },
  {
    id: 'smallIntestine',
    icon: '✦',
    nameZh: '小腸各段 (十二指腸・空腸・迴腸)',
    nameEn: 'Small Intestine (Duodenum, Jejunum, Ileum)',
    color: '#e59885',
  },
  {
    id: 'largeIntestine',
    icon: '❖',
    nameZh: '大腸各段 (盲腸與闌尾・升橫降乙狀結腸・直腸)',
    nameEn: 'Large Intestine (Cecum, Appendix, Colon & Rectum)',
    color: '#c98c76',
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

export const DIGESTIVE_STRUCTURES = Object.freeze([
  // --- 1. 上消化道 (Upper GI Tract: Oral Cavity, Salivary Glands, Pharynx, Esophagus, Stomach) ---
  {
    id: 'salivaryPharynx',
    category: 'upperGI',
    nameZh: '口腔與三大唾液腺（腮腺・頷下腺・舌下腺）及咽部',
    nameEn: 'Oral Cavity, Salivary Glands (Parotid, Submandibular, Sublingual) & Pharynx',
    pinZh: '唾液腺與咽部',
    pinEn: 'Salivary Glands & Pharynx',
    anchorL: [0.048, 0.332, 0.042],
    bundle: 'custom',
    meshes: ['dig_salivary_pharynx'],
    color: '#f4978e',
    descZh: '包含口腔舌部、三對大唾液腺（位於耳前下頷支後方的腮腺與腮腺管、下頷骨體下方的頷下腺、口底前部的舌下腺，每日分泌約 1–1.5 公升含澱粉酶唾液）以及口咽、喉咽吞嚥通道。',
    descEn: 'Comprises the oral cavity and tongue, the three paired major salivary glands (parotid with Stensen duct, submandibular with Wharton duct, and sublingual glands secreting amylase-rich saliva), and the oropharynx and laryngopharynx.',
  },
  {
    id: 'esophagus',
    category: 'upperGI',
    nameZh: '食道 (頸段・胸段・穿過橫膈食道裂孔之腹段與賁門括約肌)',
    nameEn: 'Esophagus (Cervical, Thoracic, Diaphragmatic Hiatus & Abdominal Segments)',
    pinZh: '食道',
    pinEn: 'Esophagus',
    anchorL: [0.004, 0.145, 0.015],
    bundle: 'custom',
    meshes: ['dig_esophagus'],
    color: '#e57c73',
    descZh: '長約 25 公分之肌性管道，起自第六頸椎 (C6) 環咽肌下緣，沿氣管後方與胸椎前方下行穿過後縱膈，於第十胸椎 (T10) 穿過橫膈食道裂孔進入腹腔，經下食道括約肌連於胃賁門。',
    descEn: 'A 25 cm muscular tube descending from the cricopharyngeus (C6) posterior to the trachea through the posterior mediastinum, piercing the diaphragmatic esophageal hiatus at T10 to enter the gastric cardia.',
  },
  {
    id: 'stomach',
    category: 'upperGI',
    nameZh: '胃 (賁門・胃底・胃體・胃竇與幽門括約肌)',
    nameEn: 'Stomach (Cardia, Fundus, Body, Pyloric Antrum & Pylorus)',
    pinZh: '胃 (賁門・胃體・幽門)',
    pinEn: 'Stomach',
    anchorL: [0.052, -0.025, 0.072],
    bundle: 'custom',
    meshes: ['dig_stomach'],
    color: '#e88d72',
    descZh: '位於左上腹橫膈下方之 J 型囊狀消化器官，分為賁門、胃底、胃體与幽門部（胃竇、幽門管與幽門括約肌）；胃壁具三層平滑肌與胃皺襞，分泌鹽酸、胃蛋白酶原與內在因子將食團攪拌為食糜。',
    descEn: 'J-shaped muscular organ in the left upper abdomen divided into the cardia, fundus, body, and pyloric antrum/sphincter; secretes hydrochloric acid, pepsinogen, and intrinsic factor to churn food into chyme.',
  },

  // --- 2. 肝臟・膽囊膽道・胰臟 (Hepatobiliary System & Pancreas) ---
  {
    id: 'liverRightLobe',
    category: 'hepatobiliaryPancreas',
    nameZh: '肝臟右葉 (人體最大實質消化腺・分泌膽汁與代謝解毒)',
    nameEn: 'Right Lobe of Liver (Bile Secretion, Metabolic & Detoxification Hub)',
    pinZh: '肝臟右葉',
    pinEn: 'Right Lobe of Liver',
    anchorL: [-0.068, -0.012, 0.065],
    bundle: 'custom',
    meshes: ['dig_liver_right'],
    color: '#9e3b33',
    descZh: '位於右上腹季肋區、緊貼橫膈右側穹窿下方，為肝臟體積最大之主葉（以鐮狀韌帶與左葉分界）；接收肝門靜脈與肝固有動脈雙重血流，負責合成膽汁、肝醣儲存、血漿蛋白合成與解毒代謝。',
    descEn: 'The largest division of the liver occupying the right hypochondrium beneath the right hemidiaphragm, lateral to the falciform ligament; performs bile synthesis, glycogen storage, plasma protein production, and detoxification.',
  },
  {
    id: 'liverLeftLobe',
    category: 'hepatobiliaryPancreas',
    nameZh: '肝臟左葉 (含方葉與尾狀葉・跨越上腹延伸至胃前上方)',
    nameEn: 'Left Lobe of Liver (Including Quadrate & Caudate Lobes)',
    pinZh: '肝臟左葉',
    pinEn: 'Left Lobe of Liver',
    anchorL: [0.024, 0.008, 0.075],
    bundle: 'custom',
    meshes: ['dig_liver_left'],
    color: '#ad453c',
    descZh: '位於鐮狀韌帶左側並橫越上腹區延伸至胃前上方，內側面包含鄰接膽囊窩的方葉與鄰接下腔靜脈的尾狀葉；由左肝管匯集膽汁與右肝管合成總肝管。',
    descEn: 'Medial and left anatomical division of the liver extending across the epigastrium anterior to the stomach, including the quadrate and caudate lobes; drains bile via the left hepatic duct.',
  },
  {
    id: 'gallbladderBiliary',
    category: 'hepatobiliaryPancreas',
    nameZh: '膽囊與膽道系統 (左右肝管・總肝管・膽囊管與總膽管)',
    nameEn: 'Gallbladder & Biliary Tree (Hepatic, Cystic & Common Bile Ducts)',
    pinZh: '膽囊與總膽管',
    pinEn: 'Gallbladder & Bile Ducts',
    anchorL: [-0.045, -0.068, 0.078],
    bundle: 'custom',
    meshes: ['dig_gallbladder_biliary'],
    color: '#16a34a',
    descZh: '梨形膽囊（分膽囊底、體、頸部）貼附於肝右葉臟面膽囊窩，負責儲存並濃縮肝臟分泌之膽汁；進食油脂後受膽囊收縮素 (CCK) 刺激收縮，經膽囊管與總肝管匯合成總膽管，注入十二指腸降部大乳頭以乳化脂肪。',
    descEn: 'Pear-shaped gallbladder nestled in the visceral fossa of the right liver lobe, concentrating bile and releasing it via the cystic duct and common bile duct into the descending duodenum to emulsify dietary lipids.',
  },
  {
    id: 'pancreas',
    category: 'hepatobiliaryPancreas',
    nameZh: '胰臟 (胰頭・胰體・胰尾與主胰管，橫臥胃後方分泌消化酶)',
    nameEn: 'Pancreas (Head, Uncinate Process, Body, Tail & Main Pancreatic Duct)',
    pinZh: '胰臟 (外分泌消化酶)',
    pinEn: 'Pancreas',
    anchorL: [0.022, -0.074, 0.048],
    bundle: 'custom',
    meshes: ['dig_pancreas'],
    color: '#f3c969',
    descZh: '橫臥於上腹後腹膜腔（胃後方）之長條形混合腺體：胰頭與鉤突被十二指腸 C 型彎環抱，胰體橫越腹主動脈前方，胰尾延伸至脾門；外分泌腺泡分泌含碳酸氫鹽與胰澱粉酶、胰脂肪酶、胰蛋白酶之胰液，經主胰管注入十二指腸。',
    descEn: 'Retroperitoneal gland extending transversely behind the stomach from the C-loop of the duodenum (head and uncinate process) across the midline (neck and body) to the splenic hilum (tail); secretes bicarbonate and digestive enzymes via the main pancreatic duct.',
  },

  // --- 3. 小腸各段 (Small Intestine: Duodenum, Jejunum, Ileum) ---
  {
    id: 'duodenum',
    category: 'smallIntestine',
    nameZh: '十二指腸 (球部・降部・水平部・升部，接收總膽管與胰管開口)',
    nameEn: 'Duodenum (Superior Bulb, Descending, Horizontal & Ascending Parts)',
    pinZh: '十二指腸',
    pinEn: 'Duodenum',
    anchorL: [-0.056, -0.098, 0.045],
    bundle: 'custom',
    meshes: ['dig_duodenum'],
    color: '#eca18c',
    descZh: '小腸起始段（長約 25–30 公分），呈 C 字形環抱胰頭，分為上部（十二指腸球部，緊接胃幽門）、降部（內側壁具肝胰壺腹／十二指腸大乳頭接收膽汁與胰液）、水平部與升部（延續為空腸）。',
    descEn: 'C-shaped first division of the small intestine (25–30 cm) curving around the head of the pancreas; divided into superior bulb, descending (receiving the hepatopancreatic ampulla of Vater), horizontal, and ascending parts.',
  },
  {
    id: 'jejunum',
    category: 'smallIntestine',
    nameZh: '空腸 (位於左上與中央腹腔・環狀皺襞與絨毛最發達之主要營養吸收段)',
    nameEn: 'Jejunum (Upper-Left & Central Small Intestine Coils — Primary Nutrient Absorption)',
    pinZh: '空腸 (主要營養吸收)',
    pinEn: 'Jejunum',
    anchorL: [0.042, -0.172, 0.078],
    bundle: 'custom',
    meshes: ['dig_jejunum'],
    color: '#e59885',
    descZh: '起自十二指腸空腸曲（Treitz 韌帶），盤曲於左上腹與中央臍區（約佔小腸近端五分之二）；管徑較粗、管壁較厚、血管豐富且環狀皺襞與小腸絨毛最為密集，是醣類、胺基酸與脂肪酸最主要的消化吸收部位。',
    descEn: 'Proximal two-fifths of the mesenteric small intestine coiled primarily in the left upper and umbilical regions; features thick walls, tall circular folds (plicae circulares), and dense villi for maximum absorption of carbohydrates, amino acids, and lipids.',
  },
  {
    id: 'ileum',
    category: 'smallIntestine',
    nameZh: '迴腸 (位於中下與右下腹腔・吸收維生素 B12 與膽鹽並經迴盲瓣入盲腸)',
    nameEn: 'Ileum (Lower & Right Small Intestine Coils — Vitamin B12 & Bile Salt Absorption)',
    pinZh: '迴腸',
    pinEn: 'Ileum',
    anchorL: [-0.028, -0.262, 0.068],
    bundle: 'custom',
    meshes: ['dig_ileum'],
    color: '#de8c7a',
    descZh: '承接空腸並盤曲於中下腹、骨盆腔與右下腹（約佔小腸遠端五分之三），黏膜下層富含集合淋巴小結（Peyer 氏斑）執行腸道免疫，專門吸收維生素 B12 與膽鹽，末端於右下髂窩經迴盲瓣開口於盲腸。',
    descEn: 'Distal three-fifths of the small intestine occupying the lower abdomen and right iliac region; characterized by Peyer patches (lymphoid nodules), specialized for absorbing vitamin B12 and bile salts before terminating at the ileocecal valve.',
  },

  // --- 4. 大腸各段 (Large Intestine: Cecum & Appendix, Transverse Colon, Descending/Sigmoid/Rectum) ---
  {
    id: 'cecumAppendix',
    category: 'largeIntestine',
    nameZh: '盲腸・闌尾與升結腸 (位於右側腹腔至右結腸肝曲)',
    nameEn: 'Cecum, Vermiform Appendix & Ascending Colon',
    pinZh: '盲腸・闌尾與升結腸',
    pinEn: 'Cecum, Appendix & Ascending Colon',
    anchorL: [-0.088, -0.195, 0.045],
    bundle: 'custom',
    meshes: ['dig_cecum_ascending'],
    color: '#c98c76',
    descZh: '大腸起始段：盲腸位於右下髂窩，於迴盲瓣下方連有富含淋巴組織之蚓狀突起「闌尾 (Vermiform Appendix)」；向上延續為升結腸，沿右側腹後壁上行至肝右葉下方轉折形成結腸右曲（肝曲）。',
    descEn: 'Right-sided large intestine beginning with the pouch-like cecum and worm-like vermiform appendix in the right iliac fossa, continuing upward as the retroperitoneal ascending colon to the right colic (hepatic) flexure beneath the liver.',
  },
  {
    id: 'transverseColon',
    category: 'largeIntestine',
    nameZh: '橫結腸 (由右肝曲橫越上腹腔至左脾曲・具結腸帶與結腸袋)',
    nameEn: 'Transverse Colon (Hepatic Flexure to Splenic Flexure)',
    pinZh: '橫結腸',
    pinEn: 'Transverse Colon',
    anchorL: [0.015, -0.115, 0.092],
    bundle: 'custom',
    meshes: ['dig_transverse_colon'],
    color: '#d1947e',
    descZh: '起自右上腹結腸肝曲，由橫結腸繫膜懸吊呈弓形橫越上腹腔（胃大彎下方、小腸前方），向左上延伸至脾臟下方形成位置較高的結腸左曲（脾曲）；表面具明顯三條結腸帶 (Taeniae coli) 與結腸袋 (Haustra)。',
    descEn: 'Intraperitoneal arch of the colon suspended by the transverse mesocolon, spanning across the upper abdomen from the right hepatic flexure to the higher left splenic flexure; features prominent taeniae coli and haustral sacculations.',
  },
  {
    id: 'descendingSigmoidRectum',
    category: 'largeIntestine',
    nameZh: '降結腸・乙狀結腸與直腸肛管 (吸收水分電解質並形成糞便排出)',
    nameEn: 'Descending Colon, Sigmoid Colon & Rectum / Anal Canal',
    pinZh: '降結腸・乙狀結腸與直腸',
    pinEn: 'Descending, Sigmoid Colon & Rectum',
    anchorL: [0.082, -0.210, 0.038],
    bundle: 'custom',
    meshes: ['dig_descending_sigmoid_rectum'],
    color: '#bf826c',
    descZh: '自左季肋區脾曲沿左側腹壁垂直下行為降結腸，至左髂嵴進入骨盆腔彎曲呈 S 形乙狀結腸，並於第三薦椎 (S3) 前方延續為直腸（含直腸壺腹）與肛管（內外肛門括約肌），負責吸收剩餘水分與電解質並控制排便反射。',
    descEn: 'Descends from the left splenic flexure along the left flank as the descending colon, curves through the pelvis as the S-shaped sigmoid colon, and continues along the sacral concavity as the rectum and anal canal for water absorption and defecation.',
  },

  // --- 5. 脊椎骨各節段 (Vertebral Column) ---
  {
    id: 'cervicalSpine',
    category: 'spine',
    nameZh: '頸椎 (C1–C7：咽部與頸段食道後方支撐)',
    nameEn: 'Cervical Vertebrae (C1–C7)',
    bundle: 'body',
    meshes: ['cervical_skel'],
    color: '#e5ded2',
    descZh: '由 C1 至 C7 七節頸椎組成，構成咽部與頸段食道後方骨性支撐（食道即起自第六頸椎 C6 高度）。',
    descEn: 'Seven cervical vertebrae (C1–C7) forming the posterior skeletal support for the pharynx and cervical esophagus (which begins at the C6 level).',
  },
  {
    id: 'thoracicSpine',
    category: 'spine',
    nameZh: '胸椎 (T1–T12：胸段食道後方縱膈中軸，已與肋骨分離)',
    nameEn: 'Thoracic Vertebrae (T1–T12, Separated from Ribs)',
    bundle: 'custom',
    meshes: ['spine_thoracic'],
    color: '#dfd7ca',
    descZh: '由 T1 至 T12 十二節胸椎獨立組成，胸段食道即貼沿胸椎椎體前方後縱膈下行，並於 T10 高度穿過橫膈食道裂孔，T12 高度緊鄰肝、胃與腹腔幹。',
    descEn: 'Twelve thoracic vertebrae (T1–T12) isolated from the ribs; the thoracic esophagus descends anterior to the thoracic vertebral bodies before piercing the diaphragm at T10.',
  },
  {
    id: 'lumbarSpine',
    category: 'spine',
    nameZh: '腰椎 (L1–L5：胰臟・十二指腸與腹膜後消化器官中軸支撐)',
    nameEn: 'Lumbar Vertebrae (L1–L5, Separated from Pelvis)',
    bundle: 'custom',
    meshes: ['spine_lumbar'],
    color: '#dad1c3',
    descZh: '由 L1 至 L5 五節粗壯腰椎組成，L1–L3 椎體前方即為胰臟、十二指腸 C 型環與腸繫膜根部附著處。',
    descEn: 'Five lumbar vertebrae (L1–L5) supporting the posterior abdominal wall directly behind the pancreas, duodenal C-loop, and root of the mesentery.',
  },
  {
    id: 'sacrumSpine',
    category: 'spine',
    nameZh: '薦椎與尾椎 (Sacrum：直腸後方骨盆後壁，已與髖骨分離)',
    nameEn: 'Sacrum (S1–S5, Separated from Hip Bones)',
    bundle: 'custom',
    meshes: ['spine_sacrum'],
    color: '#d5ccbe',
    descZh: '由五節薦椎融合而成，其前方凹陷（薦曲）直接容納乙狀結腸末端與直腸。',
    descEn: 'Fused sacral vertebrae forming the posterior pelvic concavity that directly cradles the rectosigmoid junction and rectum.',
  },

  // --- 6. 頭骨 (Skull) ---
  {
    id: 'cranium',
    category: 'skull',
    nameZh: '顱骨 (包含上頷骨・硬腭構成口腔頂部)',
    nameEn: 'Cranium (Including Maxilla & Hard Palate)',
    bundle: 'head',
    meshes: ['cranium'],
    color: '#dfd8cc',
    descZh: '包含腦顱與面顱上頷骨、腭骨（共同構成口腔頂部硬腭與上排齒槽弓），並提供咀嚼肌群與咽部上端之骨性附著點。',
    descEn: 'Cranial and facial skeleton including the maxillae and palatine bones forming the hard palate (roof of the oral cavity) and upper dental arch.',
  },
  {
    id: 'jaw',
    category: 'skull',
    nameZh: '下頜骨 (支撐口腔底・咀嚼運動與三大唾液腺毗鄰骨)',
    nameEn: 'Mandible (Lower Jaw Supporting Mastication & Salivary Glands)',
    bundle: 'head',
    meshes: ['jaw'],
    color: '#dfd8cc',
    descZh: '面顱唯一可活動之骨骼，藉顳顎關節執行咀嚼研磨食物；腮腺位於下頜支後緣，頷下腺與舌下腺則緊貼下頜骨體內側頷下窩與舌下窩。',
    descEn: 'Movable lower jaw bone executing mastication; directly cradles the parotid gland along its posterior ramus and the submandibular and sublingual glands along its medial body.',
  },

  // --- 7. 胸廓肋骨・骨盆・四肢與雙手骨骼 (Skeleton) ---
  {
    id: 'ribcageSternum',
    category: 'skeleton',
    nameZh: '胸廓：十二對肋骨與胸骨 (保護肝臟與胃部，可單獨隱藏)',
    nameEn: 'Ribcage: 12 Pairs of Ribs & Sternum',
    bundle: 'custom',
    meshes: ['skel_ribcage'],
    color: '#d4ccc0',
    descZh: '由 12 對肋骨與胸骨組成，下部肋弓（第 7–12 肋）環繞保護右上腹的肝臟、膽囊以及左上腹的胃底與脾臟；隱藏此項即可無遮擋觀察肝、膽、胃與食道。',
    descEn: 'Thoracic cage of 12 rib pairs and sternum whose lower costal margin shelters the liver, gallbladder, and gastric fundus; hide to inspect upper GI and hepatobiliary organs without obstruction.',
  },
  {
    id: 'shoulderGirdle',
    category: 'skeleton',
    nameZh: '肩帶：左右鎖骨與肩胛骨',
    nameEn: 'Shoulder Girdle: Clavicles & Scapulae',
    bundle: 'custom',
    meshes: ['skel_shoulder'],
    color: '#d2cabe',
    descZh: '由前方鎖骨與後方肩胛骨組成，連接中軸胸廓與雙側上肢。',
    descEn: 'Bilateral clavicles and scapulae connecting the thoracic cage to the upper limbs.',
  },
  {
    id: 'pelvisBones',
    category: 'skeleton',
    nameZh: '骨盆：左右髖骨 (承托迴腸・盲腸闌尾・乙狀結腸與直腸)',
    nameEn: 'Pelvis: Left & Right Hip Bones (Ilium, Ischium, Pubis)',
    bundle: 'custom',
    meshes: ['skel_pelvis'],
    color: '#d0c8bc',
    descZh: '由左右髖骨（髂骨、坐骨、恥骨）組成：右髂窩承托盲腸與闌尾，左髂窩承托降結腸與乙狀結腸，真骨盆腔則容納迴腸下段與直腸。',
    descEn: 'Bilateral pelvic hip bones whose right iliac fossa cradles the cecum and appendix, left iliac fossa supports the sigmoid colon, and pelvic cavity houses the terminal ileum and rectum.',
  },
  {
    id: 'upperLimbBones',
    category: 'skeleton',
    nameZh: '上肢骨骼 (肱骨・橈骨・尺骨)',
    nameEn: 'Upper Limb Bones (Humerus, Radius, Ulna)',
    bundle: 'body',
    meshes: ['arm_humerus_L', 'arm_humerus_R', 'arm_forearm_L', 'arm_forearm_R'],
    color: '#cfc7ba',
    descZh: '包含左右上臂肱骨以及前臂橈骨與尺骨。',
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
    descZh: '完整左右雙手骨骼，每側包含 8 塊腕骨、5 根掌骨與 14 節指骨。',
    descEn: 'Complete bilateral hand skeletons comprising 8 carpals, 5 metacarpals, and 14 phalanges per hand.',
  },
  {
    id: 'lowerLimbBones',
    category: 'skeleton',
    nameZh: '下肢與足部骨骼 (股骨・脛腓骨・足骨)',
    nameEn: 'Lower Limb & Foot Bones',
    bundle: 'body',
    meshes: ['leg_femur_L', 'leg_femur_R', 'leg_shin_L', 'leg_shin_R', 'foot_L', 'foot_R'],
    color: '#cfc7ba',
    descZh: '包含大腿股骨、小腿脛骨與腓骨，以及足部跗骨、蹠骨與趾骨。',
    descEn: 'Bilateral femur, tibia, fibula, tarsals, metatarsals, and phalanges.',
  },

  // --- 8. 人體外框背景 (Body Silhouette) ---
  {
    id: 'silhouetteMesh',
    category: 'silhouette',
    nameZh: '人體外框輪廓',
    nameEn: 'Human Body Outline',
    bundle: 'head',
    meshes: ['skin'],
    color: '#38bdf8',
    descZh: '半透明人體外框輪廓背景，提供上下消化道、肝膽胰與全身骨骼在人體空間中的相對位置參照。',
    descEn: 'Translucent human body silhouette providing spatial anatomical context for the digestive tract and skeleton.',
  },
]);

/**
 * Build a smooth variable-radius 3D tubular mesh along a spline in BodyParts3D cm space,
 * with optional elliptical cross-section flattening (`scaleZ`) and rounded end-caps.
 */
function buildVariableTubeCm(controlPoints, {
  tubularSegments = 28,
  radialSegments = 14,
  scaleZ = 1.0,
  capEnds = true,
} = {}) {
  const pts = controlPoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const radii = controlPoints.map(p => p[3] ?? 0.45);
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  const frames = curve.computeFrenetFrames(tubularSegments, false);

  const ringCount = tubularSegments + 1;
  const positions = [];
  const indices = [];

  function sampleRadius(t) {
    const scaled = t * (radii.length - 1);
    const i0 = Math.min(radii.length - 1, Math.floor(scaled));
    const i1 = Math.min(radii.length - 1, i0 + 1);
    const f = scaled - i0;
    return radii[i0] * (1 - f) + radii[i1] * f;
  }

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const center = curve.getPointAt(t);
    const r = sampleRadius(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    for (let j = 0; j < radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const cos = Math.cos(theta) * r;
      const sin = Math.sin(theta) * r;
      const vx = center.x + N.x * cos + B.x * sin;
      const vy = center.y + N.y * cos + B.y * sin;
      const vz = center.z + (N.z * cos + B.z * sin) * scaleZ;
      positions.push(vx, vy, vz);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    const r0 = i * radialSegments;
    const r1 = (i + 1) * radialSegments;
    for (let j = 0; j < radialSegments; j++) {
      const jNext = (j + 1) % radialSegments;
      const a = r0 + j;
      const b = r1 + j;
      const c = r1 + jNext;
      const d = r0 + jNext;
      indices.push(a, b, c, a, c, d);
    }
  }

  if (capEnds) {
    const pStart = curve.getPointAt(0);
    const tStart = curve.getTangentAt(0);
    const rStart = radii[0];
    const startCenterIdx = positions.length / 3;
    positions.push(
      pStart.x - tStart.x * rStart * 0.25,
      pStart.y - tStart.y * rStart * 0.25,
      pStart.z - tStart.z * rStart * 0.25 * scaleZ
    );
    for (let j = 0; j < radialSegments; j++) {
      const jNext = (j + 1) % radialSegments;
      indices.push(startCenterIdx, jNext, j);
    }

    const pEnd = curve.getPointAt(1);
    const tEnd = curve.getTangentAt(1);
    const rEnd = radii[radii.length - 1];
    const endCenterIdx = positions.length / 3;
    const lastRingOffset = (ringCount - 1) * radialSegments;
    positions.push(
      pEnd.x + tEnd.x * rEnd * 0.25,
      pEnd.y + tEnd.y * rEnd * 0.25,
      pEnd.z + tEnd.z * rEnd * 0.25 * scaleZ
    );
    for (let j = 0; j < radialSegments; j++) {
      const jNext = (j + 1) % radialSegments;
      indices.push(endCenterIdx, lastRingOffset + j, lastRingOffset + jNext);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  geo.computeVertexNormals();
  return geo;
}

/** Build an oriented, organically sculpted ellipsoid in BodyParts3D cm space. */
function buildEllipsoidCm(center, radii, eulerRad = [0, 0, 0], widthSegs = 14, heightSegs = 10) {
  const geo = new THREE.SphereGeometry(1, widthSegs, heightSegs);
  const mat = new THREE.Matrix4()
    .makeTranslation(center[0], center[1], center[2])
    .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(eulerRad[0], eulerRad[1], eulerRad[2])))
    .multiply(new THREE.Matrix4().makeScale(radii[0], radii[1], radii[2]));
  geo.applyMatrix4(mat);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Partition an indexed BufferGeometry's triangles into named buckets using a triangle centroid classifier.
 */
function splitGeometryByTriangles(geometry, classifyTriangle) {
  const pos = geometry.attributes.position;
  const idx = geometry.index.array;
  const nv = pos.count;
  const trisByBucket = new Map();

  for (let i = 0; i < idx.length; i += 3) {
    const i0 = idx[i], i1 = idx[i + 1], i2 = idx[i + 2];
    const cx = (pos.getX(i0) + pos.getX(i1) + pos.getX(i2)) / 3;
    const cy = (pos.getY(i0) + pos.getY(i1) + pos.getY(i2)) / 3;
    const cz = (pos.getZ(i0) + pos.getZ(i1) + pos.getZ(i2)) / 3;
    const bucket = classifyTriangle({ cx, cy, cz, i0, i1, i2 });
    if (!bucket) continue;
    if (!trisByBucket.has(bucket)) trisByBucket.set(bucket, []);
    trisByBucket.get(bucket).push(i0, i1, i2);
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
 * 1. Build Oral Cavity (Tongue), Paired Major Salivary Glands (Parotid, Submandibular, Sublingual + Ducts),
 *    and Pharynx (Nasopharynx, Oropharynx, Laryngopharynx) in BodyParts3D cm.
 */
function buildSalivaryAndPharynxCm() {
  const parts = [];

  // A. Muscular Tongue & Oral Floor inside the mandibular arch (Y = 145.6..148.2, Z = 11.0..16.8)
  parts.push(buildVariableTubeCm([
    [0.0, 146.7, 16.6, 0.72], // Apex of tongue behind incisors
    [0.0, 147.4, 15.2, 1.35], // Anterior body of tongue
    [0.0, 147.8, 13.5, 1.55], // Dorsum of tongue
    [0.0, 147.1, 11.8, 1.38], // Root of tongue sloping into oropharynx
    [0.0, 145.8, 11.0, 1.05], // Vallecula / epiglottic base
  ], { tubularSegments: 18, radialSegments: 14, scaleZ: 0.72 }));

  // B. Pharynx (Nasopharynx -> Oropharynx -> Laryngopharynx tapering to C6 cricopharyngeus at Y = 141.2)
  parts.push(buildVariableTubeCm([
    [0.0, 151.4, 10.2, 1.15], // Nasopharynx (behind nasal choanae)
    [0.0, 149.2, 10.0, 1.35], // Soft palate / velopharyngeal transition
    [0.0, 147.0, 9.85, 1.42], // Oropharynx (posterior to tongue root)
    [0.0, 144.6, 9.60, 1.28], // Laryngopharynx / piriform recesses
    [0.0, 142.6, 9.40, 0.96], // Lower laryngopharynx
    [0.0, 141.1, 9.25, 0.76], // Pharyngoesophageal junction (C6 upper esophageal sphincter)
  ], { tubularSegments: 22, radialSegments: 14, scaleZ: 0.65 }));

  // C. Three Paired Major Salivary Glands (Parotid, Submandibular, Sublingual) + excretory ducts
  for (const sign of [1, -1]) {
    // 1) Parotid Gland (腮腺): lobulated wedge along posterior mandibular ramus (X = ±5.05, Y = 147.2..150.6, Z = 9.9..12.1)
    parts.push(buildEllipsoidCm([sign * 5.05, 149.1, 10.9], [0.82, 1.65, 1.15], [0.15, sign * 0.18, -sign * 0.12]));
    parts.push(buildEllipsoidCm([sign * 4.85, 147.7, 11.4], [0.72, 1.05, 0.92], [0.1, sign * 0.12, 0]));
    // Accessory parotid lobule
    parts.push(buildEllipsoidCm([sign * 4.75, 149.0, 12.6], [0.42, 0.55, 0.62]));
    // Stensen's Parotid Duct (腮腺管) curving over masseter and piercing buccinator opposite upper 2nd molar
    parts.push(buildVariableTubeCm([
      [sign * 4.95, 148.9, 11.8, 0.16],
      [sign * 4.80, 148.7, 13.1, 0.15],
      [sign * 4.35, 148.5, 14.2, 0.14],
      [sign * 3.15, 148.3, 14.6, 0.13],
    ], { tubularSegments: 14, radialSegments: 8 }));

    // 2) Submandibular Gland (頷下腺): superficial & deep lobes in submandibular triangle (X = ±2.95, Y = 144.2, Z = 13.0)
    parts.push(buildEllipsoidCm([sign * 2.95, 144.2, 12.9], [0.85, 0.72, 1.18], [0.22, sign * 0.25, 0]));
    parts.push(buildEllipsoidCm([sign * 2.45, 144.8, 13.6], [0.58, 0.52, 0.85], [0.18, sign * 0.20, 0]));
    // Wharton's Submandibular Duct (頷下腺管) running forward & medially to sublingual caruncle
    parts.push(buildVariableTubeCm([
      [sign * 2.45, 144.9, 13.7, 0.14],
      [sign * 1.75, 145.4, 14.9, 0.13],
      [sign * 0.95, 145.9, 15.9, 0.12],
      [sign * 0.38, 146.2, 16.4, 0.11],
    ], { tubularSegments: 12, radialSegments: 8 }));

    // 3) Sublingual Gland (舌下腺): almond-shaped gland in floor of mouth behind mandibular symphysis
    parts.push(buildEllipsoidCm([sign * 1.25, 145.8, 15.6], [0.48, 0.44, 0.95], [0.15, sign * 0.38, 0]));
  }

  return mergeBufferGeometries(parts);
}

/**
 * 2. Build the Esophagus (cervical, thoracic, diaphragmatic hiatus at T10, abdominal esophagus & cardia junction)
 *    connecting seamlessly from the pharynx (Y = 141.2 cm) to the stomach cardia ([0.85, 116.7, 10.8] cm).
 */
function buildEsophagusCm() {
  const parts = [];

  // Main muscular esophageal tube with anatomical constrictions (C6 cricopharyngeus, T4 aortic/bronchial, T10 diaphragmatic hiatus)
  parts.push(buildVariableTubeCm([
    [0.00, 141.3, 9.25, 0.78], // Upper esophageal sphincter (C6)
    [-0.12, 138.0, 9.05, 0.86], // Lower cervical esophagus (slight leftward inflection)
    [-0.18, 134.0, 8.85, 0.90], // Superior mediastinum (T1–T3)
    [0.05, 130.0, 9.10, 0.82], // Aortic & left main bronchus constriction (T4–T5)
    [-0.22, 125.5, 9.55, 0.94], // Mid-thoracic posterior mediastinum (T6–T8)
    [0.10, 121.5, 10.10, 0.96], // Lower thoracic esophagus curving anteriorly (T9)
    [0.45, 118.8, 10.55, 0.84], // Diaphragmatic esophageal hiatus constriction (T10)
    [0.78, 117.3, 10.85, 0.98], // Abdominal esophagus & Lower Esophageal Sphincter (LES)
    [1.18, 116.2, 11.15, 1.18], // Cardia junction blending directly into organs_stomach
  ], { tubularSegments: 36, radialSegments: 16, scaleZ: 0.78 }));

  // Diaphragmatic esophageal hiatus muscular collar / phrenoesophageal ring at T10 (Y = 118.8 cm)
  parts.push(buildEllipsoidCm([0.45, 118.8, 10.55], [1.22, 0.42, 1.02], [0.18, 0, -0.15]));

  return mergeBufferGeometries(parts);
}

/**
 * 3. Build the Stomach from body.json's `organs_stomach` plus anatomical pyloric sphincter collar
 *    bridging the pylorus [-2.75, 108.45, 15.59] to the duodenal bulb [-3.65, 109.6, 13.8].
 */
function buildStomachCm(stomachCmGeo) {
  const pyloricBridge = buildVariableTubeCm([
    [-1.45, 107.65, 16.35, 1.48], // Pyloric antrum
    [-2.35, 108.25, 15.75, 1.18], // Pyloric canal
    [-2.85, 108.65, 15.25, 0.98], // Pyloric sphincter constriction ring
    [-3.35, 109.25, 14.35, 1.12], // Pyloroduodenal junction into duodenal bulb
  ], { tubularSegments: 14, radialSegments: 14 });

  return mergeBufferGeometries([stomachCmGeo, pyloricBridge]);
}

/**
 * 4. Split `organs_liver` along the anatomical falciform ligament plane (X = -1.15 + (Y - 112) * 0.08)
 *    into Right Lobe (`dig_liver_right`) and Left Lobe (`dig_liver_left`, including quadrate/caudate medial region),
 *    plus an interior septum cap along the falciform plane so each lobe looks solid when viewed alone.
 */
function buildLiverLobesCm(liverCmGeo) {
  const split = splitGeometryByTriangles(liverCmGeo, ({ cx, cy }) => {
    const falciformX = -1.15 + (cy - 112.0) * 0.08;
    return cx < falciformX ? 'dig_liver_right' : 'dig_liver_left';
  });

  // Add a smooth medial parenchymal cap along the falciform division plane so both lobes appear closed when soloed
  const rightCap = buildEllipsoidCm([-1.05, 113.2, 13.6], [0.45, 5.2, 4.1], [0.1, 0, 0.08]);
  const leftCap = buildEllipsoidCm([-0.85, 113.5, 13.8], [0.42, 4.8, 3.8], [0.1, 0, 0.08]);

  return {
    dig_liver_right: mergeBufferGeometries([split.dig_liver_right, rightCap].filter(Boolean)),
    dig_liver_left: mergeBufferGeometries([split.dig_liver_left, leftCap].filter(Boolean)),
  };
}

/**
 * 5. Build the Gallbladder (fundus, body, infundibulum, neck) & Extrahepatic Biliary Tree
 *    (Right & Left Hepatic Ducts, Common Hepatic Duct, Spiral Cystic Duct, Common Bile Duct to Ampulla of Vater).
 */
function buildGallbladderAndBiliaryCm() {
  const parts = [];

  // A. Pear-shaped Gallbladder (膽囊) nestled in the gallbladder fossa under the right liver lobe
  parts.push(buildVariableTubeCm([
    [-4.95, 106.95, 16.55, 0.25], // Rounded anterior tip of fundus
    [-4.75, 107.25, 16.15, 1.18], // Gallbladder fundus projecting at inferior liver border
    [-4.40, 108.05, 15.20, 1.12], // Gallbladder body
    [-3.95, 108.95, 14.20, 0.86], // Infundibulum (Hartmann's pouch)
    [-3.55, 109.65, 13.45, 0.48], // Gallbladder neck tapering into cystic duct
    [-3.15, 109.95, 13.05, 0.24], // Origin of cystic duct
  ], { tubularSegments: 24, radialSegments: 16 }));

  // B. Spiral Cystic Duct (膽囊管 with spiral valves of Heister) joining Common Hepatic Duct
  parts.push(buildVariableTubeCm([
    [-3.15, 109.95, 13.05, 0.22],
    [-2.85, 109.80, 12.75, 0.20],
    [-2.55, 109.35, 12.60, 0.19],
    [-2.35, 108.85, 12.55, 0.20],
  ], { tubularSegments: 14, radialSegments: 10 }));

  // C. Right Hepatic Duct (右肝管) draining right liver lobe
  parts.push(buildVariableTubeCm([
    [-4.35, 112.40, 12.55, 0.16],
    [-3.45, 111.65, 12.50, 0.19],
    [-2.40, 110.95, 12.48, 0.22],
  ], { tubularSegments: 12, radialSegments: 10 }));

  // D. Left Hepatic Duct (左肝管) draining left liver lobe
  parts.push(buildVariableTubeCm([
    [-0.25, 112.60, 13.10, 0.16],
    [-1.25, 111.75, 12.80, 0.19],
    [-2.40, 110.95, 12.48, 0.22],
  ], { tubularSegments: 12, radialSegments: 10 }));

  // E. Common Hepatic Duct (總肝管) -> Common Bile Duct (總膽管 CBD) descending behind duodenal bulb into descending duodenum
  parts.push(buildVariableTubeCm([
    [-2.40, 110.95, 12.48, 0.25], // Porta hepatis confluence (Common Hepatic Duct)
    [-2.35, 109.85, 12.52, 0.25], // Lower common hepatic duct
    [-2.35, 108.85, 12.55, 0.28], // Cystic duct junction -> Common Bile Duct (CBD)
    [-2.85, 107.45, 12.40, 0.27], // Retroduodenal CBD behind duodenal bulb
    [-3.65, 105.95, 12.15, 0.25], // Intrapancreatic CBD grooving posterior pancreatic head
    [-4.75, 104.85, 12.05, 0.24], // Hepatopancreatic ampulla of Vater (肝胰壺腹)
    [-5.55, 104.55, 12.10, 0.30], // Major duodenal papilla opening into descending duodenum
  ], { tubularSegments: 24, radialSegments: 10 }));

  return mergeBufferGeometries(parts);
}

/**
 * 6. Build the Pancreas (Uncinate Process, Head nestled inside the duodenal C-loop, Neck, Body, Tail reaching left to spleen,
 *    plus the anterior ridge of the Main Pancreatic Duct of Wirsung).
 */
function buildPancreasCm() {
  const parts = [];

  // A. Main Parenchyma of Pancreas (Head inside duodenal C-loop -> Neck -> Body behind stomach -> Tail near spleen)
  parts.push(buildVariableTubeCm([
    [-3.75, 102.75, 12.75, 0.92], // Inferior head & uncinate process nestled inside inferior duodenum
    [-4.15, 104.60, 12.55, 1.48], // Right border of pancreatic head hugged by descending duodenum
    [-3.15, 106.35, 12.65, 1.62], // Central pancreatic head
    [-1.45, 107.15, 12.95, 1.28], // Pancreatic neck (anterior to superior mesenteric vessels)
    [0.65,  107.75, 12.85, 1.38], // Mid-body of pancreas crossing midline over L1
    [2.95,  108.35, 12.25, 1.26], // Lateral body of pancreas posterior to stomach bed
    [5.25,  109.15, 11.35, 1.05], // Proximal tail of pancreas
    [7.25,  110.05, 10.35, 0.78], // Distal tail of pancreas approaching splenic hilum
    [8.35,  110.55, 9.75,  0.42], // Tip of pancreatic tail
  ], { tubularSegments: 34, radialSegments: 16, scaleZ: 0.66 }));

  // B. Uncinate Process hook (胰臟鉤突) extending medially behind superior mesenteric vessels
  parts.push(buildVariableTubeCm([
    [-3.55, 103.55, 12.60, 0.95],
    [-2.35, 103.35, 12.35, 0.85],
    [-1.15, 103.65, 12.15, 0.58],
  ], { tubularSegments: 12, radialSegments: 12, scaleZ: 0.62 }));

  // C. Organic lobulated texture accents along head & body
  const lobules = [
    [[-3.6, 105.3, 12.9], [1.15, 1.35, 0.82]],
    [[-2.2, 106.8, 13.1], [1.05, 1.10, 0.78]],
    [[-0.3, 107.5, 13.0], [1.15, 1.02, 0.76]],
    [[1.8,  108.0, 12.6], [1.12, 0.98, 0.74]],
    [[4.1,  108.7, 11.8], [1.05, 0.92, 0.70]],
    [[6.2,  109.6, 10.8], [0.92, 0.82, 0.62]],
  ];
  for (const [c, r] of lobules) {
    parts.push(buildEllipsoidCm(c, r, [0.1, -0.25, 0.18]));
  }

  // D. Main Pancreatic Duct (Wirsung's duct 主胰管) & Accessory Duct (Santorini) slightly proud on anterior surface
  parts.push(buildVariableTubeCm([
    [7.55,  110.15, 10.65, 0.13],
    [4.85,  109.05, 11.85, 0.15],
    [1.85,  108.05, 13.05, 0.17],
    [-0.95, 107.35, 13.45, 0.19],
    [-2.85, 106.15, 13.15, 0.21],
    [-4.15, 105.05, 12.55, 0.22],
    [-5.45, 104.55, 12.15, 0.24], // Joins CBD at major duodenal papilla
  ], { tubularSegments: 24, radialSegments: 8 }));

  return mergeBufferGeometries(parts);
}

/**
 * 7. Split `organs_intestine` into:
 *    - `dig_duodenum`: Duodenum (superior duodenal bulb + C-loop component #13 + duodenojejunal flexure)
 *    - `dig_jejunum`: Jejunum (upper-left & upper-central small intestine coils)
 *    - `dig_ileum`: Ileum (lower-central & right-lower small intestine coils + terminal ileum & ileocecal junction)
 *    - `dig_cecum_ascending`: Cecum, Vermiform Appendix & Ascending Colon up to right hepatic flexure
 *    - `dig_transverse_colon`: Transverse Colon from right hepatic flexure across upper abdomen to left splenic flexure
 *    - `dig_descending_sigmoid_rectum`: Descending Colon, Sigmoid Colon & Rectum / Anal Canal
 */
function buildIntestineDivisionsCm(intestineCmGeo) {
  const pos = intestineCmGeo.attributes.position;
  const idx = intestineCmGeo.index.array;
  const nv = pos.count;

  // First identify connected components of `organs_intestine`
  const adj = Array.from({ length: nv }, () => []);
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    adj[a].push(b, c);
    adj[b].push(a, c);
    adj[c].push(a, b);
  }

  const compOf = new Int32Array(nv).fill(-1);
  const compMeta = [];

  for (let i = 0; i < nv; i++) {
    if (compOf[i] >= 0) continue;
    const cid = compMeta.length;
    const q = [i];
    compOf[i] = cid;
    let sx = 0, sy = 0, sz = 0, count = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;

    while (q.length > 0) {
      const u = q.pop();
      const x = pos.getX(u), y = pos.getY(u), z = pos.getZ(u);
      sx += x; sy += y; sz += z; count++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      for (const v of adj[u]) {
        if (compOf[v] < 0) {
          compOf[v] = cid;
          q.push(v);
        }
      }
    }

    const cx = sx / count, cy = sy / count, cz = sz / count;
    const spanX = maxX - minX;
    const spanY = maxY - minY;

    // Classify component type:
    // - Full colon tube & 3 taeniae coli all span the entire abdominal frame (count >= 300, spanX > 14, spanY > 18)
    // - Duodenum C-loop component (#13) has count ~ 229, Y in [100, 110.2], Z in [10.4, 16.1], spanX ~ 11.9
    // - Small intestine coils (54 components) each have count <= 120
    let kind = 'small_coil';
    if (count >= 300 && spanX > 14.0 && spanY > 18.0) {
      kind = 'colon_frame';
    } else if (count >= 180 && maxY > 109.0) {
      kind = 'duodenum';
    }

    compMeta.push({ cid, count, cx, cy, cz, minX, maxX, minY, maxY, minZ, maxZ, kind });
  }

  // Partition every triangle of `organs_intestine` into one of the 6 anatomical divisions
  const divisions = splitGeometryByTriangles(intestineCmGeo, ({ cx, cy, cz, i0 }) => {
    const comp = compMeta[compOf[i0]];

    if (comp.kind === 'duodenum') {
      return 'dig_duodenum';
    }

    if (comp.kind === 'small_coil') {
      // Anatomical oblique mesenteric plane from left-upper (jejunum) to right-lower (ileum):
      // Proximal 2/5 in left upper & umbilical region -> Jejunum; distal 3/5 in lower & right iliac region -> Ileum
      const score = comp.cy + comp.cx * 0.65;
      return score >= 93.8 ? 'dig_jejunum' : 'dig_ileum';
    }

    // `colon_frame` (colon wall + 3 taeniae coli): split cleanly at right hepatic flexure & left splenic flexure
    // 1) Cecum & Ascending Colon (right flank X < -5.8 up to hepatic flexure at Y ~ 103.4)
    if (cx < -5.8 && (cy < 103.4 || (cy < 105.0 && cz < 12.6))) {
      return 'dig_cecum_ascending';
    }
    // 2) Transverse Colon (arching anteriorly across upper abdomen from hepatic flexure to splenic flexure)
    if (cy > 98.2 && cx <= 7.8 && (cx < 5.0 || cz >= 13.0)) {
      return 'dig_transverse_colon';
    }
    // 3) Descending Colon (left flank), Sigmoid Colon (left pelvis), and Rectum (midline posterior pelvis)
    return 'dig_descending_sigmoid_rectum';
  });

  // Enhance Duodenum with superior duodenal bulb bridge from stomach pylorus [-2.85, 108.65, 15.25] to descending duodenum [-3.85, 110.0, 12.95]
  const duodenalBulb = buildVariableTubeCm([
    [-2.95, 108.75, 15.10, 1.05], // Pyloric junction
    [-3.45, 109.75, 14.20, 1.18], // Duodenal bulb (ampulla)
    [-3.85, 110.05, 13.10, 1.02], // Superior duodenal flexure into descending duodenum
  ], { tubularSegments: 12, radialSegments: 14 });

  // Enhance Ileum with terminal ileum segment joining the medial cecum at the ileocecal valve [-7.2, 91.5, 12.8]
  const terminalIleum = buildVariableTubeCm([
    [-4.35, 87.20, 13.55, 0.78],
    [-5.45, 88.85, 13.35, 0.76],
    [-6.55, 90.45, 13.05, 0.74],
    [-7.55, 91.45, 12.65, 0.82], // Ileocecal valve junction
  ], { tubularSegments: 14, radialSegments: 12 });

  // Enhance Cecum & Ascending Colon with a well-defined cecal pouch base and the Vermiform Appendix (闌尾)
  const cecalPouch = buildEllipsoidCm([-8.35, 90.45, 12.45], [1.45, 1.65, 1.38], [0.1, 0, -0.15]);
  const vermiformAppendix = buildVariableTubeCm([
    [-7.75, 89.65, 12.15, 0.34], // Appendiceal orifice at posteromedial cecum below ileocecal valve
    [-7.35, 88.45, 11.95, 0.31], // Proximal appendix
    [-6.75, 87.25, 12.15, 0.29], // Mid-body of vermiform appendix curving toward pelvic brim
    [-6.15, 86.45, 12.55, 0.26], // Distal tip of appendix
  ], { tubularSegments: 16, radialSegments: 10 });

  // Enhance Descending, Sigmoid & Rectum with lower rectal ampulla & anal canal descending to [0.0, 81.2, 6.4]
  const rectalAmpullaAnalCanal = buildVariableTubeCm([
    [-0.35, 86.65, 7.15, 1.15], // Upper rectum from organs_intestine end
    [-0.12, 84.85, 6.55, 1.35], // Rectal ampulla following sacral concavity
    [0.00,  83.05, 6.45, 1.05], // Anorectal flexure
    [0.00,  81.15, 6.25, 0.72], // Anal canal & external anal sphincter
  ], { tubularSegments: 14, radialSegments: 14 });

  return {
    dig_duodenum: mergeBufferGeometries([divisions.dig_duodenum, duodenalBulb].filter(Boolean)),
    dig_jejunum: divisions.dig_jejunum,
    dig_ileum: mergeBufferGeometries([divisions.dig_ileum, terminalIleum].filter(Boolean)),
    dig_cecum_ascending: mergeBufferGeometries([divisions.dig_cecum_ascending, cecalPouch, vermiformAppendix].filter(Boolean)),
    dig_transverse_colon: divisions.dig_transverse_colon,
    dig_descending_sigmoid_rectum: mergeBufferGeometries([divisions.dig_descending_sigmoid_rectum, rectalAmpullaAnalCanal].filter(Boolean)),
  };
}

/**
 * Build all custom viewer-space geometries for the 5. Digestive System + Skeleton dedicated module.
 */
export function buildDigestiveSystemGeometries({ bodyMeta, bodyGeos, cmToViewer = makeCmToViewerMatrix() }) {
  const liverEntry = bodyMeta.meshes.find(m => m.name === 'organs_liver');
  const stomachEntry = bodyMeta.meshes.find(m => m.name === 'organs_stomach');
  const intestineEntry = bodyMeta.meshes.find(m => m.name === 'organs_intestine');

  const liverCmGeo = bodyGeos.organs_liver.clone().applyMatrix4(makeCmMatrix(liverEntry.sourceFrame));
  const stomachCmGeo = bodyGeos.organs_stomach.clone().applyMatrix4(makeCmMatrix(stomachEntry.sourceFrame));
  const intestineCmGeo = bodyGeos.organs_intestine.clone().applyMatrix4(makeCmMatrix(intestineEntry.sourceFrame));

  const cmGeometries = {
    dig_salivary_pharynx: buildSalivaryAndPharynxCm(),
    dig_esophagus: buildEsophagusCm(),
    dig_stomach: buildStomachCm(stomachCmGeo),
    ...buildLiverLobesCm(liverCmGeo),
    dig_gallbladder_biliary: buildGallbladderAndBiliaryCm(),
    dig_pancreas: buildPancreasCm(),
    ...buildIntestineDivisionsCm(intestineCmGeo),
  };

  const viewerGeometries = {};
  for (const [name, geoCm] of Object.entries(cmGeometries)) {
    const g = geoCm.clone().applyMatrix4(cmToViewer);
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
    viewerGeometries[name] = g;
  }

  return viewerGeometries;
}
