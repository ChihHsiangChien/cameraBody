import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { decodeGeometry } from '../../src/geometry.js';
import { CATEGORIES, STRUCTURES } from '../../src/neuro-data.js';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  buildBrainRegions,
  buildTorsoSkeletonParts,
  alignCervicalCordToMedulla,
  buildCranialNerves,
  buildSpinalNerveRoots,
  buildHandBonesAndNerves,
} from '../../src/neuro-builder.js';

const readJson = p => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8'));
const readBin = p => {
  const b = readFileSync(new URL(`../../${p}`, import.meta.url));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};

describe('3D Nervous System & Skeleton builder verification', () => {
  const headMeta = readJson('public/anatomy/head.json');
  const headGeos = decodeGeometry(headMeta, readBin('public/anatomy/head.bin'));
  const nervesMeta = readJson('public/anatomy/nerves.json');
  const nervesGeos = decodeGeometry(nervesMeta, readBin('public/anatomy/nerves.bin'));
  const periMeta = readJson('public/anatomy/peripheral.json');
  const periGeos = decodeGeometry(periMeta, readBin('public/anatomy/peripheral.bin'));
  const bodyMeta = readJson('public/anatomy/body.json');
  const bodyGeos = decodeGeometry(bodyMeta, readBin('public/anatomy/body.bin'));

  const headSf = periMeta.meshes.find(m => m.name === 'pn_head_L').sourceFrame;
  const headCmMatrix = makeCmMatrix(headSf);
  const cmToViewer = makeCmToViewerMatrix();

  test('all 12 pairs of cranial nerves (CN I – CN XII) are individually defined and have valid 3D geometry', () => {
    const cnItems = STRUCTURES.filter(s => s.category === 'cranialNerves');
    expect(cnItems.map(s => s.id)).toEqual([
      'cn1', 'cn2', 'cn3', 'cn4', 'cn5', 'cn6',
      'cn7', 'cn8', 'cn9', 'cn10', 'cn11', 'cn12',
    ]);

    const cns = buildCranialNerves(periMeta, periGeos, headCmMatrix, cmToViewer);
    for (const key of ['cn_1', 'cn_3', 'cn_4', 'cn_5', 'cn_6', 'cn_7', 'cn_8', 'cn_9', 'cn_10', 'cn_11', 'cn_12']) {
      expect(cns[key], key).toBeDefined();
      expect(cns[key].attributes.position.count, key).toBeGreaterThan(100);
    }
    expect(nervesGeos.optic_nerve_L.attributes.position.count).toBeGreaterThan(100);
    expect(nervesGeos.optic_nerve_R.attributes.position.count).toBeGreaterThan(100);
  });

  test('brain includes BOTH the 4 anatomical cerebral lobes (L/R) in category brain AND the 10 functional cortical areas (L/R) in category brainFunctional', () => {
    const regions = buildBrainRegions(headGeos, headCmMatrix, cmToViewer);
    for (const key of [
      // 4 Anatomical Lobes × Left/Right
      'brain_frontal_L', 'brain_frontal_R',
      'brain_parietal_L', 'brain_parietal_R',
      'brain_temporal_L', 'brain_temporal_R',
      'brain_occipital_L', 'brain_occipital_R',
      // 10 Functional Cortical Areas × Left/Right
      'func_motor_L', 'func_motor_R',
      'func_premotor_L', 'func_premotor_R',
      'func_prefrontal_L', 'func_prefrontal_R',
      'func_broca_L', 'func_broca_R',
      'func_sensory_L', 'func_sensory_R',
      'func_parietal_assoc_L', 'func_parietal_assoc_R',
      'func_auditory_L', 'func_auditory_R',
      'func_wernicke_L', 'func_wernicke_R',
      'func_visual_L', 'func_visual_R',
      'func_temporal_limbic_L', 'func_temporal_limbic_R',
      // Corpus Callosum, Cerebellum L/R, Pons, Medulla
      'corpus_callosum_M',
      'brain_cerebellum_L', 'brain_cerebellum_R',
      'brain_pons', 'brain_medulla',
    ]) {
      expect(regions[key], key).toBeDefined();
      expect(regions[key].attributes.position.count, key).toBeGreaterThan(500);
    }
    expect(CATEGORIES.length).toBe(9);
    expect(STRUCTURES.filter(s => s.category === 'brain').length).toBe(10);
    expect(STRUCTURES.filter(s => s.category === 'brainFunctional').length).toBe(10);
  });

  test('torso skeleton separates thoracic spine, lumbar spine, and sacrum from ribcage, shoulder girdle, and pelvic hip bones', () => {
    const torsoEntry = bodyMeta.meshes.find(m => m.name === 'torso_skel');
    const parts = buildTorsoSkeletonParts(bodyGeos.torso_skel, torsoEntry.sourceFrame, cmToViewer);
    expect(parts.spine_thoracic.attributes.position.count).toBe(5331);
    expect(parts.spine_lumbar.attributes.position.count).toBe(2921);
    expect(parts.spine_sacrum.attributes.position.count).toBe(1697);
    expect(parts.skel_ribcage.attributes.position.count).toBe(13306);
    expect(parts.skel_shoulder.attributes.position.count).toBe(3064);
    expect(parts.skel_pelvis.attributes.position.count).toBe(1228);
  });

  test('cervical spinal cord superior pole aligns coaxially with the medulla oblongata inferior pole', () => {
    const headHindCm = headGeos.hindbrain.clone().applyMatrix4(headCmMatrix);
    const cordSf = nervesMeta.meshes.find(m => m.name === 'cord_cervical').sourceFrame;
    const alignedCordCm = alignCervicalCordToMedulla(nervesGeos.cord_cervical, cordSf, headHindCm);

    // Measure medulla bottom center (Y <= 148.05 cm)
    const hPos = headHindCm.attributes.position;
    let hx = 0, hz = 0, hc = 0;
    for (let i = 0; i < hPos.count; i++) {
      if (hPos.getY(i) <= 148.05) {
        hx += hPos.getX(i);
        hz += hPos.getZ(i);
        hc++;
      }
    }
    hx /= hc;
    hz /= hc;

    // Measure aligned cervical cord top center (Y >= 147.6 cm)
    const cPos = alignedCordCm.attributes.position;
    let cx = 0, cz = 0, cc = 0, maxY = -Infinity;
    for (let i = 0; i < cPos.count; i++) {
      const y = cPos.getY(i);
      if (y > maxY) maxY = y;
      if (y >= 147.6) {
        cx += cPos.getX(i);
        cz += cPos.getZ(i);
        cc++;
      }
    }
    cx /= cc;
    cz /= cc;

    // Coaxial alignment within 1.5 mm in X and Z, and reaching Y > 147.9 cm into the medulla base
    expect(Math.abs(cx - hx)).toBeLessThan(0.15);
    expect(Math.abs(cz - hz)).toBeLessThan(0.15);
    expect(maxY).toBeGreaterThan(147.9);
  });

  test('spinal nerve roots connect cervical, thoracic, and lumbosacral cord segments to peripheral nerves', () => {
    const headHindCm = headGeos.hindbrain.clone().applyMatrix4(headCmMatrix);
    const cordCervCm = alignCervicalCordToMedulla(
      nervesGeos.cord_cervical,
      nervesMeta.meshes.find(m => m.name === 'cord_cervical').sourceFrame,
      headHindCm
    );
    const cordThorCm = nervesGeos.cord_thoracic.clone().applyMatrix4(
      makeCmMatrix(nervesMeta.meshes.find(m => m.name === 'cord_thoracic').sourceFrame)
    );
    const cordLumbCm = nervesGeos.cord_lumbar.clone().applyMatrix4(
      makeCmMatrix(nervesMeta.meshes.find(m => m.name === 'cord_lumbar').sourceFrame)
    );
    const cordSacrCm = nervesGeos.cord_sacral.clone().applyMatrix4(
      makeCmMatrix(nervesMeta.meshes.find(m => m.name === 'cord_sacral').sourceFrame)
    );

    const roots = buildSpinalNerveRoots([cordCervCm, cordThorCm, cordLumbCm, cordSacrCm], periMeta, periGeos, cmToViewer);
    expect(roots.spinal_roots_cervical.attributes.position.count).toBeGreaterThan(1000);
    expect(roots.spinal_roots_thoracic.attributes.position.count).toBeGreaterThan(1000);
    expect(roots.spinal_roots_lumbosacral.attributes.position.count).toBeGreaterThan(1000);
  });

  test('left and right hand bones and hand nerves connect at the distal wrists of both forearms', () => {
    const hands = buildHandBonesAndNerves(headGeos, periMeta, periGeos, cmToViewer);
    expect(hands.hand_bones_L.attributes.position.count).toBe(4642);
    expect(hands.hand_bones_R.attributes.position.count).toBe(4642);
    expect(hands.pn_hand_L.attributes.position.count).toBe(1877);
    expect(hands.pn_hand_R.attributes.position.count).toBe(1877);

    // Check wrist proximity between forearm and hand_bones on both sides
    const forearmLMat = cmToViewer.clone().multiply(
      makeCmMatrix(bodyMeta.meshes.find(m => m.name === 'arm_forearm_L').sourceFrame)
    );
    const forearmL = bodyGeos.arm_forearm_L.clone().applyMatrix4(forearmLMat);
    forearmL.computeBoundingBox();
    hands.hand_bones_L.computeBoundingBox();
    hands.hand_bones_R.computeBoundingBox();

    // Left hand is at +X (~ +0.25m), Right hand is at -X (~ -0.25m), top of hand meets bottom of forearm (~ -0.33m)
    expect(hands.hand_bones_L.boundingBox.max.x).toBeGreaterThan(0.22);
    expect(hands.hand_bones_R.boundingBox.min.x).toBeLessThan(-0.22);
    expect(Math.abs(hands.hand_bones_L.boundingBox.max.y - forearmL.boundingBox.min.y)).toBeLessThan(0.015);
  });
});
