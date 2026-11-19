import * as THREE from 'three';

const NORM_SCALE = 0.01; // cm to meters
const OFFSET_Y = -1.15;  // meters
const OFFSET_Z = -0.08;  // meters

/** Matrix mapping local mesh coordinates into BodyParts3D centimeters. */
export function makeCmMatrix(sourceFrame) {
  const c0 = sourceFrame.basisColumnsCm[0];
  const c1 = sourceFrame.basisColumnsCm[1];
  const c2 = sourceFrame.basisColumnsCm[2];
  const o = sourceFrame.originCm;
  return new THREE.Matrix4().set(
    c0[0], c1[0], c2[0], o[0],
    c0[1], c1[1], c2[1], o[1],
    c0[2], c1[2], c2[2], o[2],
    0,     0,     0,     1
  );
}

/** Matrix mapping BodyParts3D centimeters into normalized viewer meters. */
export function makeCmToViewerMatrix() {
  return new THREE.Matrix4()
    .makeTranslation(0, OFFSET_Y, OFFSET_Z)
    .multiply(new THREE.Matrix4().makeScale(NORM_SCALE, NORM_SCALE, NORM_SCALE));
}

/** Combine an array of BufferGeometries into a single indexed BufferGeometry. */
export function mergeBufferGeometries(geometries) {
  const valid = geometries.filter(g => g && g.attributes?.position?.count > 0);
  if (valid.length === 0) return new THREE.BufferGeometry();
  if (valid.length === 1) return valid[0].clone();

  let totalVerts = 0;
  let totalIndices = 0;
  for (const g of valid) {
    totalVerts += g.attributes.position.count;
    totalIndices += g.index ? g.index.count : g.attributes.position.count;
  }

  const positions = new Float32Array(totalVerts * 3);
  const indices = totalVerts > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);

  let vertOffset = 0;
  let idxOffset = 0;
  for (const g of valid) {
    const pos = g.attributes.position.array;
    positions.set(pos, vertOffset * 3);
    const nv = g.attributes.position.count;

    if (g.index) {
      const idx = g.index.array;
      for (let i = 0; i < idx.length; i++) {
        indices[idxOffset + i] = idx[i] + vertOffset;
      }
      idxOffset += idx.length;
    } else {
      for (let i = 0; i < nv; i++) {
        indices[idxOffset + i] = vertOffset + i;
      }
      idxOffset += nv;
    }
    vertOffset += nv;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

/** Extract a sub-geometry from an indexed BufferGeometry given an array of { start, count } index ranges. */
export function extractIndexRanges(geometry, ranges) {
  if (!geometry || !geometry.index || !ranges?.length) return null;
  const srcPos = geometry.attributes.position;
  const srcIdx = geometry.index.array;

  const remap = new Int32Array(srcPos.count).fill(-1);
  const newCoords = [];
  const newIndices = [];

  for (const { start, count } of ranges) {
    const end = Math.min(srcIdx.length, start + count);
    for (let i = start; i < end; i++) {
      const oldV = srcIdx[i];
      let newV = remap[oldV];
      if (newV < 0) {
        newV = newCoords.length / 3;
        remap[oldV] = newV;
        newCoords.push(srcPos.getX(oldV), srcPos.getY(oldV), srcPos.getZ(oldV));
      }
      newIndices.push(newV);
    }
  }

  if (newIndices.length === 0) return null;
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newCoords), 3));
  const IndexArray = newCoords.length / 3 > 65535 ? Uint32Array : Uint16Array;
  out.setIndex(new THREE.BufferAttribute(new IndexArray(newIndices), 1));
  out.computeVertexNormals();
  out.computeBoundingBox();
  out.computeBoundingSphere();
  return out;
}

/** Split an indexed BufferGeometry into named buckets by classifying each connected component. */
export function splitGeometryByComponents(geometry, classifyComponent) {
  const pos = geometry.attributes.position;
  const idx = geometry.index.array;
  const nv = pos.count;

  const adj = Array.from({ length: nv }, () => []);
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    adj[a].push(b, c);
    adj[b].push(a, c);
    adj[c].push(a, b);
  }

  const compOf = new Int32Array(nv).fill(-1);
  const compBucket = [];

  for (let i = 0; i < nv; i++) {
    if (compOf[i] >= 0) continue;
    const compId = compBucket.length;
    const q = [i];
    compOf[i] = compId;

    let sx = 0, sy = 0, sz = 0, count = 0;
    let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;

    while (q.length > 0) {
      const u = q.pop();
      const x = pos.getX(u), y = pos.getY(u), z = pos.getZ(u);
      sx += x; sy += y; sz += z; count++;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;

      const neighbors = adj[u];
      for (let k = 0; k < neighbors.length; k++) {
        const v = neighbors[k];
        if (compOf[v] < 0) {
          compOf[v] = compId;
          q.push(v);
        }
      }
    }

    const bucket = classifyComponent({
      cx: sx / count,
      cy: sy / count,
      cz: sz / count,
      minY, maxY, minZ, maxZ, count,
    });
    compBucket.push(bucket);
  }

  // Group triangle ranges by bucket
  const trisByBucket = new Map();
  for (let i = 0; i < idx.length; i += 3) {
    const bucket = compBucket[compOf[idx[i]]];
    if (!trisByBucket.has(bucket)) trisByBucket.set(bucket, []);
    trisByBucket.get(bucket).push(idx[i], idx[i + 1], idx[i + 2]);
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
 * Split head.json's cerebrum & hindbrain into:
 * - 8 Functional Cortical Areas × Left/Right Hemispheres (_L and _R)
 * - Midline Corpus Callosum (corpus_callosum_M)
 * - Left & Right Cerebellar Hemispheres (brain_cerebellum_L, brain_cerebellum_R)
 * - Pons/Midbrain (brain_pons) & Medulla Oblongata (brain_medulla)
 */
export function buildBrainRegions(headGeos, headCmMatrix, cmToViewer) {
  const fullHeadTransform = cmToViewer.clone().multiply(headCmMatrix);

  // 1. Classify cerebrum (in canonical head cm space) into 8 functional areas × L/R hemispheres + corpus callosum
  const functionalAreas = splitGeometryByComponents(headGeos.cerebrum, ({ cx, cy, cz }) => {
    if (Math.abs(cx) <= 0.15) return 'corpus_callosum_M';
    const side = cx > 0 ? 'L' : 'R';
    let area = 'func_temporal_limbic';
    if (cz <= -12.15) {
      area = 'func_visual';
    } else if (cy > 9.5 && cz < -6.0 && cz > -7.8) {
      area = 'func_motor';
    } else if (cy > 9.5 && cz <= -7.8 && cz > -9.5) {
      area = 'func_sensory';
    } else if (cy >= 6.8 && cz <= -8.5 && cz > -12.15) {
      area = 'func_parietal_assoc';
    } else if (Math.abs(cx) > 5.0 && cy >= 3.5 && cy < 7.5 && cz <= -6.5 && cz > -10.0) {
      area = 'func_wernicke_auditory';
    } else if (Math.abs(cx) > 3.6 && cy >= 5.0 && cy < 9.2 && cz > -4.5) {
      area = 'func_broca';
    } else if (cz > -5.2 && cy >= 4.0) {
      area = 'func_prefrontal';
    }
    return `${area}_${side}`;
  });

  // 2. Classify hindbrain into Left/Right Cerebellum, Pons/Midbrain, and Medulla Oblongata
  const hind = splitGeometryByComponents(headGeos.hindbrain, ({ cx, minY, minZ }) => {
    if (minZ < -10.0) return cx >= 0 ? 'brain_cerebellum_L' : 'brain_cerebellum_R';
    if (minY < -1.0) return 'brain_medulla';
    return 'brain_pons';
  });

  const regions = { ...functionalAreas, ...hind };
  for (const g of Object.values(regions)) {
    g.applyMatrix4(fullHeadTransform);
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
  }
  return regions;
}

/**
 * Split body.json's torso_skel into separate Vertebrae (Thoracic T1-T12, Lumbar L1-L5, Sacrum)
 * and separate Ribcage/Sternum, Shoulder Girdle (Clavicles/Scapulae), and Pelvic Hip Bones.
 */
export function buildTorsoSkeletonParts(torsoGeo, torsoSf, cmToViewer) {
  const torsoCm = torsoGeo.clone().applyMatrix4(makeCmMatrix(torsoSf));
  const parts = splitGeometryByComponents(torsoCm, ({ cx, cy, cz, count }) => {
    if (Math.abs(cx) < 1.0) {
      if (cz > 12.0) return 'skel_ribcage';     // Sternum (manubrium, body, xiphoid)
      if (cy > 107.5) return 'spine_thoracic'; // Thoracic vertebrae T1–T12
      if (cy > 92.0) return 'spine_lumbar';    // Lumbar vertebrae L1–L5
      return 'spine_sacrum';                   // Sacrum
    }
    if (cy < 95.0) return 'skel_pelvis';       // Left & right pelvic hip bones
    if (count > 1000 && Math.abs(cx) > 10.0) return 'skel_shoulder'; // Scapulae
    if (cy > 134.8 && Math.abs(cx) > 7.0) return 'skel_shoulder';    // Clavicles
    return 'skel_ribcage';                     // 12 pairs of ribs
  });

  for (const g of Object.values(parts)) {
    g.applyMatrix4(cmToViewer);
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
  }
  return parts;
}

/**
 * Realign upper cervical spinal cord (cord_cervical) in BodyParts3D cm space so that
 * its superior pole meets the inferior pole of the medulla oblongata coaxially (posterior to the dens of C2),
 * eliminating the C1 atlas anterior offset.
 */
export function alignCervicalCordToMedulla(cordCervicalGeo, cordSf, headMedullaCmGeo) {
  const cordCmMat = makeCmMatrix(cordSf);
  const geo = cordCervicalGeo.clone().applyMatrix4(cordCmMat);

  // Measure target medulla inferior rim center (Y <= 148.05 cm)
  const medPos = headMedullaCmGeo.attributes.position;
  let sumX = 0, sumZ = 0, medCount = 0;
  for (let i = 0; i < medPos.count; i++) {
    const y = medPos.getY(i);
    if (y <= 148.05) {
      sumX += medPos.getX(i);
      sumZ += medPos.getZ(i);
      medCount++;
    }
  }
  const targetX = medCount > 0 ? sumX / medCount : -0.086;
  const targetZ = medCount > 0 ? sumZ / medCount : 6.88;

  // Compute slice centers of cord_cervical from Y = 141.5 to 147.75 cm
  const pos = geo.attributes.position;
  const yStart = 141.5;
  const yEnd = 147.75;
  const numBins = 25;
  const binX = new Float64Array(numBins);
  const binZ = new Float64Array(numBins);
  const binC = new Int32Array(numBins);

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y >= yStart) {
      const b = Math.min(numBins - 1, Math.max(0, Math.floor(((y - yStart) / (yEnd - yStart)) * numBins)));
      binX[b] += pos.getX(i);
      binZ[b] += pos.getZ(i);
      binC[b]++;
    }
  }
  for (let b = 0; b < numBins; b++) {
    if (binC[b] > 0) {
      binX[b] /= binC[b];
      binZ[b] /= binC[b];
    } else if (b > 0) {
      binX[b] = binX[b - 1];
      binZ[b] = binZ[b - 1];
    }
  }

  // Smoothly shift upper cervical slices to align coaxially with the medulla base
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > yStart) {
      const u = Math.min(1, Math.max(0, (y - yStart) / (yEnd - yStart)));
      const s = u * u * (3 - 2 * u); // cubic smoothstep
      const b = Math.min(numBins - 1, Math.max(0, Math.floor(u * numBins)));
      const curCx = binX[b];
      const curCz = binZ[b];

      pos.setX(i, pos.getX(i) + (targetX - curCx) * s);
      pos.setZ(i, pos.getZ(i) + (targetZ - curCz) * s);
      // Extend top 0.35 cm so it tucks cleanly into the medulla inferior surface (medMinY ~ 147.65 cm)
      pos.setY(i, y + 0.35 * (u * u));
    }
  }

  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/** Sweep a smooth 3D tube along an array of [x, y, z] points (in BodyParts3D cm). */
function buildTubeCm(points, radiusCm = 0.16, tubularSegments = 18, radialSegments = 6) {
  const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5);
  return new THREE.TubeGeometry(curve, tubularSegments, radiusCm, radialSegments, false);
}

/**
 * Extract all 12 pairs of Cranial Nerves (CN I – CN XII):
 * - CN I, III, IV, V, VI, VII, VIII, IX, XII from pn_head_L & pn_head_R index ranges
 * - CN X (Vagus) & CN XI (Accessory) as bilateral anatomical 3D pathways from medulla/cord through jugular foramen
 */
export function buildCranialNerves(periMeta, periGeos, headCmMatrix, cmToViewer) {
  const fullHeadTransform = cmToViewer.clone().multiply(headCmMatrix);
  const entryL = periMeta.meshes.find(m => m.name === 'pn_head_L');
  const entryR = periMeta.meshes.find(m => m.name === 'pn_head_R');
  const geoL = periGeos.pn_head_L;
  const geoR = periGeos.pn_head_R;

  const matchRules = {
    cn_1: /olfactory nerve/i,
    cn_3: /oculomotor nerve/i,
    cn_4: /trochlear nerve/i,
    cn_5: /trigeminal|ophthalmic|maxillary|mandibular|buccal|inferior alveolar|lingual|mental|mylohyoid/i,
    cn_6: /abducens nerve/i,
    cn_7: /facial nerve|chorda tympani/i,
    cn_8: /vestibulocochlear|vestibular/i,
    cn_9: /glossopharyngeal/i,
    cn_12: /hypoglossal/i,
  };

  const result = {};

  for (const [cnKey, regex] of Object.entries(matchRules)) {
    const rangesL = (entryL.parts || []).filter(p => regex.test(p.name));
    const rangesR = (entryR.parts || []).filter(p => regex.test(p.name));
    const subL = extractIndexRanges(geoL, rangesL);
    const subR = extractIndexRanges(geoR, rangesR);
    const merged = mergeBufferGeometries([subL, subR].filter(Boolean));
    merged.applyMatrix4(fullHeadTransform);
    merged.computeVertexNormals();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    result[cnKey] = merged;
  }

  // Build CN X (Vagus Nerve - 迷走神經) bilateral in BodyParts3D cm
  const cn10Tubes = [];
  for (const sign of [1, -1]) {
    // Main vagus trunk: medulla postolivary sulcus -> jugular foramen -> carotid sheath -> thorax -> esophageal/gastric plexus
    cn10Tubes.push(buildTubeCm([
      [sign * 0.48, 149.8, 7.15],
      [sign * 1.45, 149.3, 7.65],
      [sign * 2.35, 148.4, 8.25],
      [sign * 2.55, 145.0, 8.85],
      [sign * 2.45, 140.0, 9.45],
      [sign * 2.15, 134.5, 10.20],
      [sign * 1.85, 127.5, 10.75],
      [sign * 1.50, 119.5, 10.65],
      [sign * 1.15, 111.5, 10.80],
      [sign * 1.45, 105.0, 12.10],
    ], 0.17, 28, 6));
    // Superior laryngeal branch (喉上神經)
    cn10Tubes.push(buildTubeCm([
      [sign * 2.48, 146.2, 8.65],
      [sign * 2.10, 143.5, 10.20],
      [sign * 1.15, 141.2, 12.10],
    ], 0.11, 12, 6));
    // Cardiac / pulmonary vagal branches (心肺迷走支)
    cn10Tubes.push(buildTubeCm([
      [sign * 1.95, 129.0, 10.55],
      [sign * 2.85, 124.5, 11.40],
      [sign * 3.60, 120.5, 12.10],
    ], 0.12, 12, 6));
  }
  const cn10Geo = mergeBufferGeometries(cn10Tubes);
  cn10Geo.applyMatrix4(cmToViewer);
  cn10Geo.computeVertexNormals();
  cn10Geo.computeBoundingBox();
  cn10Geo.computeBoundingSphere();
  result.cn_10 = cn10Geo;

  // Build CN XI (Accessory Nerve - 副神經) bilateral in BodyParts3D cm
  const cn11Tubes = [];
  for (const sign of [1, -1]) {
    // Spinal accessory root ascending alongside cervical cord C5 -> C1 -> foramen magnum
    cn11Tubes.push(buildTubeCm([
      [sign * 0.48, 142.2, 7.38],
      [sign * 0.56, 144.8, 7.22],
      [sign * 0.62, 147.2, 7.05],
      [sign * 0.68, 149.1, 7.25],
      [sign * 1.55, 149.0, 7.65],
      [sign * 2.50, 148.2, 8.10],
    ], 0.13, 18, 6));
    // External branch descending to sternocleidomastoid and trapezius
    cn11Tubes.push(buildTubeCm([
      [sign * 2.50, 148.2, 8.10],
      [sign * 3.85, 145.2, 8.15],
      [sign * 5.45, 141.8, 6.85],
      [sign * 7.35, 138.2, 4.95],
      [sign * 9.45, 134.5, 3.10],
      [sign * 10.80, 129.5, 1.85],
    ], 0.15, 22, 6));
  }
  const cn11Geo = mergeBufferGeometries(cn11Tubes);
  cn11Geo.applyMatrix4(cmToViewer);
  cn11Geo.computeVertexNormals();
  cn11Geo.computeBoundingBox();
  cn11Geo.computeBoundingSphere();
  result.cn_11 = cn11Geo;

  return result;
}

/**
 * Find medial root origins of a peripheral nerve mesh (in BodyParts3D cm) and connect them
 * to the spinal cord centerline via dorsal & ventral spinal nerve roots (and cauda equina for lumbosacral).
 */
export function buildSpinalNerveRoots(cordCmGeos, periMeta, periGeos, cmToViewer) {
  // 1. Sample spinal cord centerline (Y from 106.0 to 148.0 cm)
  const cordSampleBins = 85;
  const yMinCord = 106.0;
  const yMaxCord = 148.0;
  const cordX = new Float64Array(cordSampleBins);
  const cordZ = new Float64Array(cordSampleBins);
  const cordC = new Int32Array(cordSampleBins);

  for (const g of cordCmGeos) {
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const b = Math.min(cordSampleBins - 1, Math.max(0, Math.floor(((y - yMinCord) / (yMaxCord - yMinCord)) * cordSampleBins)));
      cordX[b] += pos.getX(i);
      cordZ[b] += pos.getZ(i);
      cordC[b]++;
    }
  }
  for (let b = 0; b < cordSampleBins; b++) {
    if (cordC[b] > 0) {
      cordX[b] /= cordC[b];
      cordZ[b] /= cordC[b];
    } else if (b > 0) {
      cordX[b] = cordX[b - 1];
      cordZ[b] = cordZ[b - 1];
    }
  }

  function getCordCenterAtY(y) {
    const clampedY = Math.max(yMinCord, Math.min(yMaxCord, y));
    const b = Math.min(cordSampleBins - 1, Math.max(0, Math.floor(((clampedY - yMinCord) / (yMaxCord - yMinCord)) * (cordSampleBins - 1))));
    return [cordX[b], clampedY, cordZ[b]];
  }

  // Helper: extract connected-component medial endpoints in BodyParts3D cm
  function getMedialEndpoints(meshName, maxAbsX, maxZ) {
    const entry = periMeta.meshes.find(m => m.name === meshName);
    const geo = periGeos[meshName].clone().applyMatrix4(makeCmMatrix(entry.sourceFrame));
    const pos = geo.attributes.position;
    const idx = geo.index.array;
    const nv = pos.count;

    const adj = Array.from({ length: nv }, () => []);
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i], b = idx[i + 1], c = idx[i + 2];
      adj[a].push(b, c); adj[b].push(a, c); adj[c].push(a, b);
    }

    const visited = new Uint8Array(nv);
    const endpoints = [];
    for (let i = 0; i < nv; i++) {
      if (visited[i]) continue;
      const comp = [];
      const q = [i];
      visited[i] = 1;
      while (q.length) {
        const u = q.pop();
        comp.push(u);
        for (const v of adj[u]) if (!visited[v]) { visited[v] = 1; q.push(v); }
      }
      let bestV = -1, bestScore = Infinity;
      for (const v of comp) {
        const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
        if (Math.abs(x) <= maxAbsX && z <= maxZ) {
          const score = Math.abs(x) + Math.max(0, z - 7.5) * 0.4;
          if (score < bestScore) { bestScore = score; bestV = v; }
        }
      }
      if (bestV >= 0) {
        endpoints.push([pos.getX(bestV), pos.getY(bestV), pos.getZ(bestV)]);
      }
    }
    endpoints.sort((a, b) => b[1] - a[1]);
    return endpoints;
  }

  // Helper to build dorsal + ventral rootlet pair connecting cord at yCord to foramen target [tx, ty, tz]
  function addRootPair(tubes, yCord, target, radius = 0.16) {
    const [tx, ty, tz] = target;
    const sign = tx >= 0 ? 1 : -1;
    const [cx, cy, cz] = getCordCenterAtY(yCord);
    const midX = cx + (tx - cx) * 0.55;
    const midY = cy + (ty - cy) * 0.55;
    const midZ = cz + (tz - cz) * 0.55;

    // Ventral root (anterior-lateral exit from cord)
    tubes.push(buildTubeCm([
      [cx + sign * 0.22, cy, cz + 0.18],
      [midX, midY, midZ + 0.16],
      [tx, ty, tz],
    ], radius * 0.82, 10, 6));

    // Dorsal root (posterior-lateral exit + dorsal root ganglion swelling near foramen)
    tubes.push(buildTubeCm([
      [cx + sign * 0.24, cy + 0.12, cz - 0.18],
      [midX + sign * 0.08, midY, midZ - 0.15],
      [tx, ty, tz],
    ], radius, 10, 6));
  }

  // A. Cervical Spinal Roots (C1–C4 upper cervical plexus + C5–T1 brachial plexus roots)
  const cervicalTubes = [];
  for (const meshName of ['pn_brachial_L', 'pn_brachial_R']) {
    const pts = getMedialEndpoints(meshName, 2.8, 10.0);
    for (const pt of pts) {
      const yCord = Math.min(147.2, pt[1] + 0.55);
      addRootPair(cervicalTubes, yCord, pt, 0.17);
    }
  }
  // Also add C1–C4 cervical spinal roots & cervical plexus loops (above C5, Y = 144.8 to 147.3 cm)
  for (const sign of [1, -1]) {
    const cLevels = [147.2, 146.2, 145.2];
    const loopPts = [];
    for (const yL of cLevels) {
      const [cx, cy, cz] = getCordCenterAtY(yL);
      const exitPt = [cx + sign * 1.95, cy - 0.35, cz + 0.65];
      addRootPair(cervicalTubes, yL, exitPt, 0.15);
      loopPts.push(exitPt);
    }
    // Connect C1-C4 lateral branches into cervical plexus loop joining C5 at [±1.4, 144.2, 8.2]
    loopPts.push([sign * 1.45, 144.15, 8.20]);
    cervicalTubes.push(buildTubeCm(loopPts, 0.14, 16, 6));
  }

  // B. Thoracic Spinal Roots (T1–T12 connecting cord_thoracic to all intercostal nerves)
  const thoracicTubes = [];
  for (const meshName of ['pn_trunk_L', 'pn_trunk_R']) {
    const pts = getMedialEndpoints(meshName, 2.2, 8.0);
    for (const pt of pts) {
      const yCord = Math.min(138.2, Math.max(111.5, pt[1] + 0.95));
      addRootPair(thoracicTubes, yCord, pt, 0.15);
    }
  }

  // C. Lumbosacral Spinal Roots & Cauda Equina (connecting cord_lumbar & cord_sacral to pn_lumbosacral_L/R)
  const lumbosacralTubes = [];
  for (const meshName of ['pn_lumbosacral_L', 'pn_lumbosacral_R']) {
    const pts = getMedialEndpoints(meshName, 4.0, 9.5);
    for (const pt of pts) {
      const [tx, ty, tz] = pt;
      const sign = tx >= 0 ? 1 : -1;
      // Map foramen height ty in [84, 108.5] to spinal cord origin in [106.3, 114.6] (lumbar & sacral cord)
      const u = Math.max(0, Math.min(1, (ty - 84.5) / (108.5 - 84.5)));
      const yCord = 106.3 + u * (114.6 - 106.3);
      const [cx, cy, cz] = getCordCenterAtY(yCord);

      if (cy - ty > 2.2) {
        // Descending Cauda Equina nerve root inside vertebral canal before exiting foramen
        const canalX = cx + sign * (0.22 + (1 - u) * 0.35);
        const canalMidY = (cy + ty) * 0.5;
        const canalMidZ = cz * 0.45 + tz * 0.55;
        lumbosacralTubes.push(buildTubeCm([
          [cx + sign * 0.22, cy, cz],
          [canalX, canalMidY, canalMidZ],
          [cx + sign * 0.75, ty + 0.75, tz - 0.2],
          [tx, ty, tz],
        ], 0.16, 16, 6));
      } else {
        addRootPair(lumbosacralTubes, yCord, pt, 0.17);
      }
    }
  }

  const finalize = tubes => {
    const g = mergeBufferGeometries(tubes);
    g.applyMatrix4(cmToViewer);
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
    return g;
  };

  return {
    spinal_roots_cervical: finalize(cervicalTubes),
    spinal_roots_thoracic: finalize(thoracicTubes),
    spinal_roots_lumbosacral: finalize(lumbosacralTubes),
  };
}

/** Flip triangle index winding (0, 1, 2) -> (0, 2, 1) after a reflection matrix so normals face outward. */
function flipWinding(geometry) {
  const idx = geometry.index.array;
  for (let i = 0; i < idx.length; i += 3) {
    const tmp = idx[i + 1];
    idx[i + 1] = idx[i + 2];
    idx[i + 2] = tmp;
  }
}

/**
 * Build complete Left and Right Hand Bones (hand_bones_L, hand_bones_R) and Left and Right Hand Nerves
 * positioned at the distal ends of the forearms in the reference pose.
 */
export function buildHandBonesAndNerves(headGeos, periMeta, periGeos, cmToViewer) {
  const handPartNames = [
    'hand_palm',
    'hand_b_1_2', 'hand_b_2_3', 'hand_b_3_4',
    'hand_b_5_6', 'hand_b_6_7', 'hand_b_7_8',
    'hand_b_9_10', 'hand_b_10_11', 'hand_b_11_12',
    'hand_b_13_14', 'hand_b_14_15', 'hand_b_15_16',
    'hand_b_17_18', 'hand_b_18_19', 'hand_b_19_20',
  ];

  const mirrorX = new THREE.Matrix4().makeScale(-1, 1, 1);

  const rightBoneGeos = [];
  const leftBoneGeos = [];
  const rightNerveGeos = [];
  const leftNerveGeos = [];

  for (const partName of handPartNames) {
    const nerveName = `pn_${partName}`;
    const nerveEntry = periMeta.meshes.find(m => m.name === nerveName);
    if (!nerveEntry?.sourceFrame) continue;

    const cmMatR = makeCmMatrix(nerveEntry.sourceFrame);
    const viewerMatR = cmToViewer.clone().multiply(cmMatR);
    const viewerMatL = cmToViewer.clone().multiply(mirrorX).multiply(cmMatR);

    const boneGeo = headGeos[partName];
    if (boneGeo) {
      const bR = boneGeo.clone().applyMatrix4(viewerMatR);
      rightBoneGeos.push(bR);

      const bL = boneGeo.clone().applyMatrix4(viewerMatL);
      flipWinding(bL);
      leftBoneGeos.push(bL);
    }

    const nerveGeo = periGeos[nerveName];
    if (nerveGeo) {
      const nR = nerveGeo.clone().applyMatrix4(viewerMatR);
      rightNerveGeos.push(nR);

      const nL = nerveGeo.clone().applyMatrix4(viewerMatL);
      flipWinding(nL);
      leftNerveGeos.push(nL);
    }
  }

  return {
    hand_bones_R: mergeBufferGeometries(rightBoneGeos),
    hand_bones_L: mergeBufferGeometries(leftBoneGeos),
    pn_hand_R: mergeBufferGeometries(rightNerveGeos),
    pn_hand_L: mergeBufferGeometries(leftNerveGeos),
  };
}
