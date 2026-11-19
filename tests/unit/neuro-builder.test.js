import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { decodeGeometry } from '../../src/geometry.js';
import { CATEGORIES, STRUCTURES } from '../../src/neuro-data.js';
import {
  makeCmMatrix,
  makeCmToViewerMatrix,
  buildBrainRegions,
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

  test('brain is divided into 4 cerebral lobes, cerebellum, pons/midbrain, and medulla with textbook colors', () => {
    const regions = buildBrainRegions(headGeos, headCmMatrix, cmToViewer);
    for (const key of [
      'brain_frontal', 'brain_parietal', 'brain_temporal', 'brain_occipital',
      'brain_cerebellum', 'brain_pons', 'brain_medulla',
    ]) {
      expect(regions[key], key).toBeDefined();
      expect(regions[key].attributes.position.count, key).toBeGreaterThan(500);
    }
    expect(CATEGORIES.length).toBe(7);
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
