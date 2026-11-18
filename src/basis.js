// Column-major affine bases shared by the anatomy renderer and deterministic tests.
const EPS = 1e-8;
export const add = (a,b) => a.map((v,i)=>v+b[i]);
export const sub = (a,b) => a.map((v,i)=>v-b[i]);
export const scale = (a,s) => a.map(v=>v*s);
export const dot = (a,b) => a.reduce((v,n,i)=>v+n*b[i],0);
export const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const length = a => Math.hypot(...a);
export const normalize = a => { const n=length(a); return n>EPS?scale(a,1/n):null; };
export const midpoint = (a,b) => scale(add(a,b),0.5);
export function palmNormal(wrist,indexMcp,littleMcp,side) {
  if (!['L','R'].includes(side) || ![wrist,indexMcp,littleMcp].every(p=>p?.length===3&&p.every(Number.isFinite))) return null;
  const normal=normalize(cross(sub(indexMcp,wrist),sub(littleMcp,wrist)));
  // In anatomical position the index MCP is lateral to the little MCP.
  // Correct the winding so a forward-facing palm gives the anterior axis.
  return normal?scale(normal,side==='L'?-1:1):null;
}
export function makeBasis(x,y,z,o) {
  if (![...x,...y,...z,...o].every(Number.isFinite)) return null;
  return [...x,0,...y,0,...z,0,...o,1];
}
export function landmarkToPoint(p,width,height) {
  return [p.x*width,(1-p.y)*height,-p.z*width];
}
/** Extrapolates hip joint locations (landmarks 23, 24) when only the upper body (head, neck, shoulders)
 * is visible. Uses anatomical proportions from reference geometry:
 * torso vertical span = 1.562 * shoulderWidth; hip width = 0.631 * shoulderWidth. */
export function estimateHips(shoulderL, shoulderR, headPoint = null) {
  if (!shoulderL || !shoulderR || !Array.isArray(shoulderL) || !Array.isArray(shoulderR) || ![...shoulderL, ...shoulderR].every(Number.isFinite)) return null;
  const shoulderVec = sub(shoulderL, shoulderR);
  const shoulderWidth = length(shoulderVec);
  if (shoulderWidth < EPS) return null;

  const shoulderMid = midpoint(shoulderL, shoulderR);
  let down = null;

  if (headPoint && Array.isArray(headPoint) && headPoint.every(Number.isFinite)) {
    const neckVec = sub(shoulderMid, headPoint);
    const ortho = sub(neckVec, scale(shoulderVec, dot(neckVec, shoulderVec) / dot(shoulderVec, shoulderVec)));
    down = normalize(ortho);
    if (down && down[1] > 0) down = scale(down, -1);
  }

  if (!down) {
    const ortho = sub([0, -1, 0], scale(shoulderVec, dot([0, -1, 0], shoulderVec) / dot(shoulderVec, shoulderVec)));
    down = normalize(ortho) ?? [0, -1, 0];
  }

  const torsoLength = shoulderWidth * 1.562;
  const hipMid = add(shoulderMid, scale(down, torsoLength));
  const shoulderDir = normalize(shoulderVec);
  const halfHipWidth = shoulderWidth * 0.631 * 0.5;

  return {
    23: add(hipMid, scale(shoulderDir, halfHipWidth)),
    24: sub(hipMid, scale(shoulderDir, halfHipWidth)),
  };
}
export function torsoBasis(points) {
  if (!points || typeof points !== 'object') return null;
  let p23 = points[23], p24 = points[24];
  if ((!p23 || !p24) && points[11] && points[12]) {
    const hips = estimateHips(points[11], points[12], points[0]);
    if (hips) {
      p23 = hips[23];
      p24 = hips[24];
    }
  }
  if (!points[11] || !points[12] || !p23 || !p24) return null;
  const origin=midpoint(p23,p24);
  const x=sub(points[11],points[12]);
  const y=sub(midpoint(points[11],points[12]),origin);
  const n=normalize(cross(x,y));
  if (!n || length(x)<EPS || length(y)<EPS) return null;
  return makeBasis(x,y,scale(n,Math.sqrt(length(x)*length(y))),origin);
}
export function boneBasis(start,end,roll=[0,0,1]) {
  if (!start || !end) return null;
  const delta=sub(end,start), n=length(delta);
  if (!Number.isFinite(n) || n<EPS) return null;
  const x=scale(delta,1/n);
  let y=normalize(sub(roll,scale(x,dot(roll,x))));
  if (!y) {
    const reference=Math.abs(x[0])<0.8?[1,0,0]:[0,1,0];
    y=normalize(sub(reference,scale(x,dot(reference,x))));
  }
  if (!y) return null;
  return makeBasis(delta,scale(y,n),scale(cross(x,y),n),start);
}
export function footBasis(ankle,heel,toe) {
  if (!ankle || !heel || !toe) return null;
  const x=sub(toe,heel),y=sub(ankle,heel),n=normalize(cross(x,y));
  if (!n) return null;
  return makeBasis(x,y,scale(n,Math.sqrt(length(x)*length(y))),heel);
}
export function transformPoint(matrix,p) {
  return [0,1,2].map(i=>matrix[i]*p[0]+matrix[i+4]*p[1]+matrix[i+8]*p[2]+matrix[i+12]);
}
export function segmentVisible(landmarks,ids,threshold=0.5) {
  if (!landmarks || !ids || !Array.isArray(ids)) return false;
  return ids.every(i=>landmarks[i] && [landmarks[i].x,landmarks[i].y,landmarks[i].z].every(Number.isFinite) && (landmarks[i].visibility??1)>=threshold && (landmarks[i].presence??1)>=threshold);
}
/** True when a tracked hand is far larger than every arm segment the pose shows. A close-up of a hand
 * makes the pose model report a small, confident figure inside it; its scores cannot tell it from a
 * person, but its arms are a fraction of the hand they should carry. The arm is measured in the picture:
 * the depth of that figure is noise, and added 204 px to a forearm 90 px long. The hand keeps its depth,
 * which the hand tracker measures well, so a hand turned towards the camera is not taken for a small one.
 * Measured over 780 results: at most 0.42 for the figure, 1.4 and more for a person. */
export function poseContradictsHands(pose,hands,width,height,limit=0.5) {
  if (!Array.isArray(pose) || pose.length!==33 || !Array.isArray(hands)) return false;
  const point=p=>p && [p.x,p.y,p.z].every(Number.isFinite)?landmarkToPoint(p,width,height):null;
  let hand=0;
  for (const landmarks of hands) {
    const wrist=point(landmarks?.[0]),tip=point(landmarks?.[12]);
    if (wrist && tip) hand=Math.max(hand,length(sub(tip,wrist)));
  }
  if (!(hand>0)) return false;
  let arm=0,seen=false;
  for (const ends of [[13,15],[14,16],[11,13],[12,14]]) {
    if (!segmentVisible(pose,ends)) continue;
    const a=point(pose[ends[0]]),b=point(pose[ends[1]]);
    seen=true;arm=Math.max(arm,Math.hypot(b[0]-a[0],b[1]-a[1]));
  }
  return seen && arm<limit*hand;
}
