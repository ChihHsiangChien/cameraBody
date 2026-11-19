import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { decodeGeometry } from '../../src/geometry.js';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  buildTorsoSkeletonParts,
  buildHandBonesAndNerves,
} from '../../src/neuro-builder.js';
import {
  CIRCULATORY_META,
  CIRCULATORY_CATEGORIES,
  CIRCULATORY_STRUCTURES,
  buildCirculatorySystemGeometries,
} from '../../src/systems/circulatory.js';
import {
  RESPIRATORY_META,
  RESPIRATORY_CATEGORIES,
  RESPIRATORY_STRUCTURES,
  buildRespiratorySystemGeometries,
} from '../../src/systems/respiratory.js';
import {
  URINARY_META,
  URINARY_CATEGORIES,
  URINARY_STRUCTURES,
  buildUrinarySystemGeometries,
} from '../../src/systems/urinary.js';
import {
  ENDOCRINE_META,
  ENDOCRINE_CATEGORIES,
  ENDOCRINE_STRUCTURES,
  buildEndocrineSystemGeometries,
} from '../../src/systems/endocrine.js';
import {
  DIGESTIVE_META,
  DIGESTIVE_CATEGORIES,
  DIGESTIVE_STRUCTURES,
  buildDigestiveSystemGeometries,
} from '../../src/systems/digestive.js';

const readJson = p => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8'));
const readBin = p => {
  const b = readFileSync(new URL(`../../${p}`, import.meta.url));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};

function assertValidBufferGeometry(geo, label) {
  expect(geo, `${label} geometry should be defined`).toBeDefined();
  const pos = geo.attributes?.position;
  expect(pos, `${label} position attribute`).toBeDefined();
  expect(pos.count, `${label} position.count > 0`).toBeGreaterThan(0);

  for (let i = 0; i < pos.array.length; i++) {
    if (!Number.isFinite(pos.array[i])) {
      throw new Error(`${label} has non-finite vertex coordinate at index ${i}`);
    }
  }

  if (!geo.attributes.normal) {
    geo.computeVertexNormals();
  }
  const norm = geo.attributes?.normal;
  expect(norm, `${label} normal attribute`).toBeDefined();
  expect(norm.count, `${label} normal.count === position.count`).toBe(pos.count);
  for (let i = 0; i < norm.array.length; i++) {
    if (!Number.isFinite(norm.array[i])) {
      throw new Error(`${label} has non-finite vertex normal at index ${i}`);
    }
  }
}

describe('Dedicated 3D Organ Systems & Skeleton modules verification', () => {
  const headMeta = readJson('public/anatomy/head.json');
  const headGeos = decodeGeometry(headMeta, readBin('public/anatomy/head.bin'));
  const periMeta = readJson('public/anatomy/peripheral.json');
  const periGeos = decodeGeometry(periMeta, readBin('public/anatomy/peripheral.bin'));
  const bodyMeta = readJson('public/anatomy/body.json');
  const bodyGeos = decodeGeometry(bodyMeta, readBin('public/anatomy/body.bin'));
  const musclesMeta = readJson('public/anatomy/muscles.json');
  const musclesGeos = decodeGeometry(musclesMeta, readBin('public/anatomy/muscles.bin'));

  const headSf = periMeta.meshes.find(m => m.name === 'pn_head_L').sourceFrame;
  const headCmMatrix = makeCmMatrix(headSf);
  const cmToViewer = makeCmToViewerMatrix();

  const torsoEntry = bodyMeta.meshes.find(m => m.name === 'torso_skel');
  const torsoPartsGeos = buildTorsoSkeletonParts(bodyGeos.torso_skel, torsoEntry.sourceFrame, cmToViewer);
  const handGeos = buildHandBonesAndNerves(headGeos, periMeta, periGeos, cmToViewer);

  const sharedGeos = {
    ...torsoPartsGeos,
    ...handGeos,
    ...headGeos,
    ...bodyGeos,
    ...musclesGeos,
  };

  function verifySystemModule({
    systemName,
    meta,
    expectedId,
    categories,
    expectedCategoryIds,
    structures,
    expectedStructureIds,
    customGeos,
  }) {
    expect(meta).toBeDefined();
    expect(meta.id).toBe(expectedId);
    expect(meta.titleZh).toBeTruthy();
    expect(meta.titleEn).toBeTruthy();
    expect(meta.subtitleZh).toBeTruthy();
    expect(meta.subtitleEn).toBeTruthy();

    expect(Array.isArray(categories)).toBe(true);
    const catIds = categories.map(c => c.id);
    for (const expectedCat of expectedCategoryIds) {
      expect(catIds, `${systemName} category ${expectedCat}`).toContain(expectedCat);
    }

    expect(Array.isArray(structures)).toBe(true);
    const structIds = structures.map(s => s.id);
    for (const expectedStruct of expectedStructureIds) {
      expect(structIds, `${systemName} structure ${expectedStruct}`).toContain(expectedStruct);
    }

    // Verify every custom geometry built by the builder
    expect(customGeos).toBeDefined();
    for (const [meshName, geo] of Object.entries(customGeos)) {
      assertValidBufferGeometry(geo, `${systemName} customGeo.${meshName}`);
    }

    // Verify every structure's meshes resolve to valid non-empty BufferGeometry
    for (const s of structures) {
      expect(catIds, `${systemName} structure ${s.id} has valid category ${s.category}`).toContain(s.category);
      expect(Array.isArray(s.meshes), `${systemName} structure ${s.id} meshes array`).toBe(true);
      expect(s.meshes.length, `${systemName} structure ${s.id} has >= 1 mesh`).toBeGreaterThan(0);

      for (const mName of s.meshes) {
        const geo = customGeos[mName] || sharedGeos[mName];
        assertValidBufferGeometry(geo, `${systemName} structure(${s.id}).mesh(${mName})`);
      }
    }
  }

  test('1. Circulatory System + Skeleton exports metadata, categories, structures, and valid 3D geometries', () => {
    expect(typeof buildCirculatorySystemGeometries).toBe('function');
    const customGeos = buildCirculatorySystemGeometries({
      bodyMeta,
      bodyGeos,
      cmToViewer,
    });

    verifySystemModule({
      systemName: 'circulatory',
      meta: CIRCULATORY_META,
      expectedId: 'circulatory',
      categories: CIRCULATORY_CATEGORIES,
      expectedCategoryIds: ['heart', 'arteries', 'veins', 'spine', 'skull', 'skeleton', 'silhouette'],
      structures: CIRCULATORY_STRUCTURES,
      expectedStructureIds: [
        'heartVentricles',
        'heartAtria',
        'aorticArch',
        'pulmonaryVessels',
        'coronaryVessels',
        'carotidVertebralArteries',
        'thoracicAbdominalAorta',
        'upperLimbArteries',
        'lowerLimbArteries',
        'venaCava',
        'jugularCranialVeins',
        'hepaticPortalSystem',
        'upperLimbVeins',
        'lowerLimbVeins',
      ],
      customGeos,
    });
  });

  test('2. Respiratory System + Skeleton + Respiratory Muscles exports airways, lungs, respiratory muscles, and skeleton', () => {
    expect(typeof buildRespiratorySystemGeometries).toBe('function');
    const customGeos = buildRespiratorySystemGeometries({
      bodyMeta,
      bodyGeos,
      musclesMeta,
      musclesGeos,
      cmToViewer,
    });

    verifySystemModule({
      systemName: 'respiratory',
      meta: RESPIRATORY_META,
      expectedId: 'respiratory',
      categories: RESPIRATORY_CATEGORIES,
      expectedCategoryIds: [
        'airways',
        'lungs',
        'respiratoryMuscles',
        'spine',
        'skull',
        'skeleton',
        'silhouette',
      ],
      structures: RESPIRATORY_STRUCTURES,
      expectedStructureIds: [
        'nasalPharynx',
        'larynxCartilages',
        'tracheaBronchi',
        'rightLungUpper',
        'rightLungMiddle',
        'rightLungLower',
        'leftLungUpper',
        'leftLungLower',
        'diaphragmMuscle',
        'intercostalMuscles',
        'neckAccessoryMuscles',
        'abdominalExpiratoryMuscles',
      ],
      customGeos,
    });

    const respMuscles = RESPIRATORY_STRUCTURES.filter(s => s.category === 'respiratoryMuscles');
    expect(respMuscles.map(s => s.id)).toEqual(
      expect.arrayContaining([
        'diaphragmMuscle',
        'intercostalMuscles',
        'neckAccessoryMuscles',
        'abdominalExpiratoryMuscles',
      ])
    );
  });

  test('3. Urinary System + Skeleton exports kidneys, urinary tract, renal vessels, and skeleton with valid 3D geometries', () => {
    expect(typeof buildUrinarySystemGeometries).toBe('function');
    const customGeos = buildUrinarySystemGeometries({
      bodyMeta,
      bodyGeos,
      cmToViewer,
    });

    verifySystemModule({
      systemName: 'urinary',
      meta: URINARY_META,
      expectedId: 'urinary',
      categories: URINARY_CATEGORIES,
      expectedCategoryIds: [
        'kidneys',
        'urinaryTract',
        'renalVessels',
        'spine',
        'skull',
        'skeleton',
        'silhouette',
      ],
      structures: URINARY_STRUCTURES,
      expectedStructureIds: [
        'leftKidney',
        'rightKidney',
        'renalPelvisCalyces',
        'adrenalCaps',
        'ureters',
        'urinaryBladder',
        'urethraSphincter',
        'renalArteries',
        'renalVeins',
      ],
      customGeos,
    });
  });

  test('4. Endocrine System + Skeleton exports cranial, cervical/thoracic, abdominal/pelvic endocrine glands and skeleton', () => {
    expect(typeof buildEndocrineSystemGeometries).toBe('function');
    const customGeos = buildEndocrineSystemGeometries({
      headGeos,
      headCmMatrix,
      bodyMeta,
      bodyGeos,
      cmToViewer,
    });

    verifySystemModule({
      systemName: 'endocrine',
      meta: ENDOCRINE_META,
      expectedId: 'endocrine',
      categories: ENDOCRINE_CATEGORIES,
      expectedCategoryIds: [
        'cranialEndocrine',
        'cervicalThoracicEndocrine',
        'abdominalPelvicEndocrine',
        'contextOrgans',
        'spine',
        'skull',
        'skeleton',
        'silhouette',
      ],
      structures: ENDOCRINE_STRUCTURES,
      expectedStructureIds: [
        'hypothalamus',
        'pituitaryGland',
        'pinealGland',
        'thyroidGland',
        'parathyroidGlands',
        'thymusGland',
        'adrenalGlands',
        'pancreasIslets',
        'gonadsEndocrine',
        'endocrineContext',
      ],
      customGeos,
    });
  });

  test('5. Digestive System + Skeleton exports upper GI, hepatobiliary/pancreas, small intestine, large intestine, and skeleton', () => {
    expect(typeof buildDigestiveSystemGeometries).toBe('function');
    const customGeos = buildDigestiveSystemGeometries({
      bodyMeta,
      bodyGeos,
      cmToViewer,
    });

    verifySystemModule({
      systemName: 'digestive',
      meta: DIGESTIVE_META,
      expectedId: 'digestive',
      categories: DIGESTIVE_CATEGORIES,
      expectedCategoryIds: [
        'upperGI',
        'hepatobiliaryPancreas',
        'smallIntestine',
        'largeIntestine',
        'spine',
        'skull',
        'skeleton',
        'silhouette',
      ],
      structures: DIGESTIVE_STRUCTURES,
      expectedStructureIds: [
        'salivaryPharynx',
        'esophagus',
        'stomach',
        'liverRightLobe',
        'liverLeftLobe',
        'gallbladderBiliary',
        'pancreas',
        'duodenum',
        'jejunum',
        'ileum',
        'cecumAppendix',
        'transverseColon',
        'descendingSigmoidRectum',
      ],
      customGeos,
    });
  });
});
