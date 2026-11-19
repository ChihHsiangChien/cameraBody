# Human Anatomy 3D

[**Open Live App (GitHub Pages)**](https://chihhsiangchien.github.io/human-anatomy-3d/) · [繁體中文說明](README.zh-TW.md) · [Repository](https://github.com/ChihHsiangChien/human-anatomy-3d)

A zero-camera, browser-based interactive 3D human anatomy atlas featuring **6 dedicated organ-system pages** built with Three.js and real medical 3D surface meshes from BodyParts3D 3.0, Human Reference Atlas, and Z-Anatomy. Everything runs locally in your browser—no camera permission needed and no data uploaded.

## Dedicated Organ-System Pages

Switch systems anytime from the top navigation bar or open any dedicated page directly via URL (`?page=<id>`):

| Page | Direct URL | Included 3D Structures |
| --- | --- | --- |
| **Nervous System + Skeleton** (Default) | [`?page=nervous`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=nervous) | Anatomical cerebral lobes (Frontal, Parietal, Temporal, Occipital, Cerebellum, Corpus Callosum, Brainstem), **10 Brodmann functional cortical areas** with L/R/Both hemisphere toggle & partition mode switcher, **all 12 pairs of cranial nerves (CN I–XII)** individually toggleable, aligned spinal cord & dorsal/ventral nerve roots, peripheral nerves, independent vertebral segments (C/T/L/S), skull, ribcage, limbs & bilateral hand bones |
| **1. Circulatory System + Skeleton** | [`?page=circulatory`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=circulatory) | Heart ventricles & atria, real BodyParts3D aorta (arch, thoracic, abdominal), superior & inferior vena cava, pulmonary vessels & coronary arteries/sinus, carotid/vertebral arteries & jugular/dural sinuses, hepatic portal system, upper & lower limb arteries/veins, and full skeleton |
| **2. Respiratory System + Skeleton + Respiratory Muscles** | [`?page=respiratory`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=respiratory) | Nasal cavity, paranasal sinuses & pharynx, real BodyParts3D thyroid cartilage & larynx, trachea & complete bronchial tree, all **5 separated lung lobes** (R upper/middle/lower, L upper/lower), real BodyParts3D **double-domed diaphragm**, translucent real **intercostal muscles**, accessory inspiratory neck muscles, translucent abdominal expiratory muscles, and full skeleton |
| **3. Urinary System + Skeleton** | [`?page=urinary`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=urinary) | Left & right kidneys (T11–L3), real BodyParts3D renal calyces & pelvis, bilateral ureters, Loop-smoothed urinary bladder, urethra, abdominal aorta/renal arteries & IVC/renal veins, and full skeleton *(strictly urinary tract structures—adrenal glands are placed exclusively in the Endocrine System)* |
| **4. Endocrine System** | [`?page=endocrine`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=endocrine) | Real BodyParts3D hypothalamus, pituitary gland, pineal gland, bilobed thymus, bilateral adrenal glands, **pancreas & main pancreatic duct**, **male reference gonads (testes & epididymides)**, butterfly thyroid & 4 parathyroid glands fitted below thyroid cartilage, over translucent brainstem & kidney reference context and full skeleton |
| **5. Digestive System + Skeleton** | [`?page=digestive`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=digestive) | Oral cavity, tongue, major salivary glands & pharynx, real BodyParts3D esophagus, stomach, right & left liver lobes, real gallbladder & biliary tree, real pancreas & pancreatic duct, separated duodenum, jejunum, ileum, cecum/appendix, colon segments & rectum, and full skeleton |

## Interactive Controls & Features

- **Direct 3D Navigation**: Drag to orbit 360°, scroll or pinch to zoom, toggle **Orbit / Pan** mode (`↻`), or jump to **Front / Back / Side / Focus Head / Focus Spine** presets.
- **Granular Structure Visibility & Click Inspector**: Toggle individual organs, vessels, nerves, or skeletal segments on/off, filter via category **All / None** buttons or real-time search, and click any 3D structure to inspect its Chinese/English name and anatomical description.
- **Clean Default View (Labels Off by Default)**: Floating 3D leader-line text labels default to **OFF** on every organ-system page for unobstructed 3D inspection, and can be toggled on/off anytime with **Show 3D structure callout labels** (or the Brain functional labels toggle on the nervous page).
- **Translucent Silhouette & Ghost Bones**: Adjust the outer human body contour opacity slider and toggle semi-transparent **Ghost bones mode** to see deep internal organs and nerves clearly through the ribcage, spine, and skull.
- **Bilingual Interface (`zh` / `en`)**: Follows browser language automatically, switches dynamically with the header **English / 中文** button, or opens directly via `?lang=en` / `?lang=zh`.

## Local Development, Build & Verification

Node.js **22.12 or newer** is required.

```sh
npm ci
npm run dev
```

Run checks and production build:

```sh
npm run lint
npm test
BASE_PATH=/human-anatomy-3d/ npm run build
```

Production builds output static files to `dist/` and check bundle size budgets (`50 MB` total, `30 MB` excluding MediaPipe WASM). Pushes to `main` automatically build and deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (`BASE_PATH=/${{ github.event.repository.name }}/`).

### Rebuilding Companion Organ Assets (`public/anatomy/organs-extra.*`)

The static runtime needs no Python. To regenerate the 22 companion organ meshes (`public/anatomy/organs-extra.bin` and `public/anatomy/organs-extra.json`) directly from the pinned official BodyParts3D 3.0 archive (`BodyParts3D_3.0_obj_99.zip`, SHA-256 verified):

```sh
python3 -m venv tools/.venv
tools/.venv/bin/pip install numpy fast-simplification
tools/.venv/bin/python tools/build_organs_extra.py
```

Downloaded source archives are cached under `tools/cache/` (gitignored). Existing base bundles in `public/anatomy/` (`body.*`, `head.*`, `muscles.*`, `joints.*`, `nerves.*`, `peripheral.*`) remain untouched and verified byte-for-byte by `tests/unit/rebuild-immutable.test.js`.

## Data Provenance, Attribution & Licenses

Application source code is licensed under the **MIT License** (see [LICENSE](LICENSE)), building upon:
- **[3D Anatomy Camera](https://github.com/keanu77/3D_anatomy_camera)** by **吳易澄** ([sportsmedicine.tw](https://sportsmedicine.tw/)), Copyright (c) 2026 吳易澄 (MIT License)
- **[BodyVista](https://github.com/FreedomIntelligence/BodyVista)** by **FreedomAI** (MIT License; see [LICENSES/BodyVista.md](LICENSES/BodyVista.md))
- Concept inspired by Hashem Al-Ghaili's X-Ray Mirror ([original post](https://x.com/HashemGhaili/status/2120202746121085321)).

Anatomical models and reference texts retain their respective dataset licenses and are **not covered by the code's MIT license**:

| Material | Source and License |
| --- | --- |
| Body, head, hand, muscle, joint, optic & `organs-extra.*` meshes in `public/anatomy/` | [BodyParts3D 3.0, © DBCLS](LICENSES/BodyParts3D.md), CC BY-SA 2.1 Japan |
| Spinal cord segments in `nerves.*` | [Human Reference Atlas / HuBMAP](LICENSES/HRA-spinal-cord.md), CC BY 4.0 ([DOI:10.48539/HBM366.MTJD.685](https://doi.org/10.48539/HBM366.MTJD.685)) |
| Peripheral nerves in `peripheral.*` | [Z-Anatomy](LICENSES/Z-Anatomy.md), CC BY-SA 4.0 (with underlying BodyParts3D attribution) |
| Reference descriptions in `structure-info.json` | [English Wikipedia contributors](LICENSES/Wikipedia.md), CC BY-SA 4.0 |
| Three.js | MIT License ([LICENSES/three-MIT.txt](LICENSES/three-MIT.txt)) |

## Educational Notice / Limits

This viewer presents an adult male educational reference anatomy derived from public datasets. It is not a patient-specific medical scan, does not deform biomechanically, and is intended solely for anatomy education—not for clinical diagnosis or treatment.
