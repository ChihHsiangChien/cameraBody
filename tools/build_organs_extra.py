#!/usr/bin/env python3
"""Build public/anatomy/organs-extra.{bin,json} from real BodyParts3D 3.0 OBJ surfaces.

Shares the exact torso coordinate frame from public/anatomy/body.json and leaves
all existing immutable anatomy bundles untouched.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

import fast_simplification
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "tools/cache"
OUT = ROOT / "public/anatomy"
BASE = "https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/"
SOURCES = {
    "BodyParts3D_3.0_obj_99.zip": ("BodyParts3D_3.0_obj_99.zip", "2125f6d761b14ead4ee64f71713f56f3f0f29982693ff20aac63474470cb92f4"),
    "v3_parts_list_e.txt": ("parts_list_e.txt", "824a34ed939a53375037d0d68b88ad2b63b1f0ae15a585632af2a63c2ab2e4af"),
    "v3_composite_parts.txt": ("composite_parts.txt", "17cd3611eb6b46558f983f890273fdb19f93806150ed95f6611acf4b81e90bc2"),
}
ATTRIBUTION = (
    "BodyParts3D, © The Database Center for Life Science, "
    "licensed under CC Attribution-Share Alike 2.1 Japan. Simplified, quantized, and aligned."
)

# 22 real BodyParts3D 3.0 meshes mapped to the exact shared torso coordinate frame.
SPECS = [
    ("extra_pancreas", ["pancreas", "pancreatic duct"], 3500, "Pancreas & pancreatic duct"),
    ("extra_adrenals", ["right adrenal gland", "left adrenal gland"], 2000, "Adrenal glands"),
    ("extra_thymus", ["right lobe of thymus", "left lobe of thymus"], 2500, "Thymus"),
    ("extra_pituitary", ["pituitary gland"], 1200, "Pituitary gland"),
    ("extra_pineal", ["pineal body"], 800, "Pineal gland"),
    ("extra_hypothalamus", ["hypothalamus"], 1500, "Hypothalamus"),
    ("extra_gonads", ["right testis", "left testis", "right epididymis", "left epididymis"], 3000, "Testes & epididymides"),
    ("extra_bladder", ["urinary bladder"], 3500, "Urinary bladder"),
    ("extra_ureters", ["right ureter", "left ureter"], 2500, "Ureters"),
    ("extra_urethra", ["urethra"], 1500, "Urethra"),
    ("extra_renal_arteries", ["right renal artery", "left renal artery"], 1800, "Renal arteries"),
    ("extra_renal_veins", ["right renal vein", "left renal vein"], 1800, "Renal veins"),
    ("extra_aorta", ["aorta"], 5000, "Aorta"),
    ("extra_vena_cava", ["superior vena cava", "inferior vena cava"], 4000, "Superior & inferior vena cava"),
    ("extra_pulmonary_vessels", ["pulmonary artery", "pulmonary vein"], 3500, "Pulmonary vessels"),
    ("extra_coronary_vessels", ["right coronary artery", "left coronary artery", "coronary sinus"], 3000, "Coronary vessels"),
    ("extra_diaphragm", ["diaphragm"], 4000, "Diaphragm"),
    ("extra_trachea_bronchi", ["trachea", "bronchus"], 4500, "Trachea & bronchi"),
    ("extra_thyroid_cartilage", ["thyroid cartilage"], 1800, "Thyroid cartilage"),
    ("extra_intercostals", ["external intercostal muscle", "internal intercostal muscle", "innermost intercostal muscle"], 5500, "Intercostal muscles"),
    ("extra_esophagus", ["esophagus"], 2500, "Esophagus"),
    ("extra_gallbladder", ["gallbladder"], 1500, "Gallbladder"),
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch_sources() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    for local, (remote, expected) in SOURCES.items():
        path = CACHE / local
        if not path.exists():
            print(f"Downloading {remote} ...", flush=True)
            temporary = path.with_suffix(path.suffix + ".partial")
            subprocess.run(
                ["curl", "--fail", "--location", "--retry", "2", "--silent", "--show-error", "--output", str(temporary), BASE + remote],
                check=True,
            )
            if sha(temporary.read_bytes()) != expected:
                raise ValueError(f"Downloaded source checksum mismatch: {remote}")
            temporary.replace(path)
        if sha(path.read_bytes()) != expected:
            raise ValueError(f"Cached source checksum mismatch: {local}; refusing to use changed source")


class Atlas:
    def __init__(self):
        self.zip = zipfile.ZipFile(CACHE / "BodyParts3D_3.0_obj_99.zip")
        self.files = {Path(n.replace("\\", "/")).stem: n for n in self.zip.namelist() if n.endswith(".obj")}
        self.names = {}
        for row in (CACHE / "v3_parts_list_e.txt").read_text().splitlines()[1:]:
            fields = row.split("\t")
            if len(fields) == 2:
                self.names[fields[1].lower()] = fields[0]
        self.children = {}
        for row in (CACHE / "v3_composite_parts.txt").read_text().splitlines()[1:]:
            parent, _, child, _ = row.split("\t")
            self.children.setdefault(parent, set()).add(child)
        self.cache = {}

    def elements(self, concept: str, visited=None) -> set[str]:
        if concept in self.files:
            return {concept}
        visited = set() if visited is None else visited
        if concept in visited:
            raise ValueError(f"Cycle in source composite hierarchy: {concept}")
        out = set()
        for child in sorted(self.children.get(concept, [])):
            out |= self.elements(child, visited | {concept})
        if not out:
            raise ValueError(f"No actual source surface for {concept}")
        return out

    def load_element(self, element: str):
        if element not in self.cache:
            vertices, faces = [], []
            for line in self.zip.read(self.files[element]).decode().splitlines():
                if line.startswith("v "):
                    vertices.append([float(v) for v in line.split()[1:4]])
                elif line.startswith("f "):
                    polygon = [int(p.split("/")[0]) for p in line.split()[1:]]
                    polygon = [p - 1 if p > 0 else len(vertices) + p for p in polygon]
                    faces.extend([polygon[0], polygon[i], polygon[i + 1]] for i in range(1, len(polygon) - 1))
            raw = np.asarray(vertices, dtype=np.float64)
            # Header unit is mm; source +X=subject left, +Z=superior, -Y=anterior.
            # Proper rotation (determinant +1), then mm -> cm.
            verts = raw[:, [0, 2, 1]] * np.array([0.1, 0.1, -0.1])
            faces = np.asarray(faces, dtype=np.int32)
            if not len(verts) or not len(faces) or not np.isfinite(verts).all():
                raise ValueError(f"Invalid OBJ: {element}")
            if faces.min() < 0 or faces.max() >= len(verts):
                raise ValueError(f"Invalid OBJ index: {element}")
            self.cache[element] = (verts, faces)
        return self.cache[element]

    def combine(self, names):
        ids = set()
        concepts = []
        for name in names:
            key = name.lower()
            if key not in self.names:
                raise KeyError(f"Concept not found in parts_list_e.txt: {name}")
            concept = self.names[key]
            concepts.append({"id": concept, "name": name})
            ids |= self.elements(concept)
        vv, ff, offset = [], [], 0
        for element in sorted(ids):
            vertices, faces = self.load_element(element)
            vv.append(vertices)
            ff.append(faces + offset)
            offset += len(vertices)
        return np.concatenate(vv), np.concatenate(ff), sorted(ids), concepts


def loop_subdivide(vertices: np.ndarray, faces: np.ndarray):
    """Apply one iteration of Loop subdivision with non-manifold edge safeguards."""
    nv = len(vertices)
    edge_opp: dict[tuple[int, int], list[int]] = {}
    adj: list[set[int]] = [set() for _ in range(nv)]

    valid_faces = []
    for f in faces:
        i0, i1, i2 = int(f[0]), int(f[1]), int(f[2])
        if i0 == i1 or i1 == i2 or i2 == i0:
            continue
        valid_faces.append((i0, i1, i2))
        for u, v, opp in ((i0, i1, i2), (i1, i2, i0), (i2, i0, i1)):
            e = (u, v) if u < v else (v, u)
            edge_opp.setdefault(e, []).append(opp)
            adj[u].add(v)
            adj[v].add(u)

    boundary_adj: list[list[int]] = [[] for _ in range(nv)]
    non_manifold_verts = set()
    edge_mid_idx: dict[tuple[int, int], int] = {}
    new_edge_verts = []

    for e, opps in edge_opp.items():
        u, v = e
        edge_mid_idx[e] = nv + len(new_edge_verts)
        if len(opps) == 2:
            pos = 0.375 * (vertices[u] + vertices[v]) + 0.125 * (vertices[opps[0]] + vertices[opps[1]])
        elif len(opps) == 1:
            pos = 0.5 * (vertices[u] + vertices[v])
            boundary_adj[u].append(v)
            boundary_adj[v].append(u)
        else:
            pos = 0.5 * (vertices[u] + vertices[v])
            non_manifold_verts.add(u)
            non_manifold_verts.add(v)
        new_edge_verts.append(pos)

    updated_verts = np.array(vertices, dtype=np.float64, copy=True)
    for v in range(nv):
        if v in non_manifold_verts:
            continue
        b_nbs = boundary_adj[v]
        if len(b_nbs) == 2:
            updated_verts[v] = 0.75 * vertices[v] + 0.125 * (vertices[b_nbs[0]] + vertices[b_nbs[1]])
        elif len(b_nbs) == 0:
            nbs = adj[v]
            n = len(nbs)
            if n >= 3:
                beta = 3.0 / 16.0 if n == 3 else 3.0 / (8.0 * n)
                nb_sum = vertices[list(nbs)].sum(axis=0)
                updated_verts[v] = (1.0 - n * beta) * vertices[v] + beta * nb_sum

    all_verts = np.vstack([updated_verts, np.asarray(new_edge_verts, dtype=np.float64)])
    new_faces = []
    for i0, i1, i2 in valid_faces:
        m01 = edge_mid_idx[(i0, i1) if i0 < i1 else (i1, i0)]
        m12 = edge_mid_idx[(i1, i2) if i1 < i2 else (i2, i1)]
        m20 = edge_mid_idx[(i2, i0) if i2 < i0 else (i0, i2)]
        new_faces.append((i0, m01, m20))
        new_faces.append((m01, i1, m12))
        new_faces.append((m20, m12, i2))
        new_faces.append((m01, m12, m20))

    return all_verts, np.asarray(new_faces, dtype=np.int32)


def main():
    fetch_sources()
    atlas = Atlas()

    body_meta = json.loads((OUT / "body.json").read_text(encoding="utf-8"))
    torso_entry = next(m for m in body_meta["meshes"] if m["name"] == "torso_skel")
    sf = torso_entry["sourceFrame"]
    frame_origin = np.asarray(sf["originCm"], dtype=np.float64)
    # basisColumnsCm stores column vectors in rows ([col0, col1, col2]), so .T restores [e1, e2, e3] columns.
    frame_basis = np.asarray(sf["basisColumnsCm"], dtype=np.float64).T

    binary = bytearray()
    meshes = []
    source_count = set()

    for name, sources, budget, label in SPECS:
        vertices, faces, element_ids, concepts = atlas.combine(sources)
        source_count.update(element_ids)
        source_triangles = len(faces)

        vertices, remap = np.unique(vertices, axis=0, return_inverse=True)
        faces = remap[faces].astype(np.int32)
        if len(faces) < 350:
            vertices, faces = loop_subdivide(vertices, faces)
            vertices, faces = loop_subdivide(vertices, faces)
        elif len(faces) < 900:
            vertices, faces = loop_subdivide(vertices, faces)
        if len(faces) > budget:
            vertices, faces = fast_simplification.simplify(vertices, faces, target_count=budget, agg=7.0)
        if len(faces) > budget or len(vertices) > 65535:
            raise ValueError(f"Mesh budget exceeded: {name} ({len(faces)} > {budget}, {len(vertices)} verts)")

        local = np.linalg.solve(frame_basis, (vertices - frame_origin).T).T
        if not np.isfinite(local).all():
            raise ValueError(f"Non-finite normalized vertices: {name}")

        minimum, maximum = local.min(0), local.max(0)
        size = maximum - minimum
        if np.any(size <= 0):
            raise ValueError(f"Degenerate mesh bounds: {name}")

        quantized = np.rint((local - minimum) / size * 65535).clip(0, 65535).astype("<u2")
        off_v = len(binary)
        binary += quantized.tobytes()
        off_i = len(binary)
        binary += np.asarray(faces, dtype="<u2").tobytes()

        entry = {
            "name": name,
            "layer": "organsExtra",
            "frame": "torso",
            "label": label,
            "nv": int(len(local)),
            "ni": int(faces.size),
            "min": minimum.tolist(),
            "size": size.tolist(),
            "offV": int(off_v),
            "offI": int(off_i),
            "triangleBudget": int(budget),
            "sourceTriangles": int(source_triangles),
            "sourceElements": element_ids,
            "sourceConcepts": concepts,
            "sourceFrame": sf,
        }
        meshes.append(entry)

        cm_min = vertices.min(0)
        cm_max = vertices.max(0)
        cm_center = (cm_min + cm_max) * 0.5
        viewer_center = [
            round(float(cm_center[0] * 0.01), 4),
            round(float(cm_center[1] * 0.01 - 1.15), 4),
            round(float(cm_center[2] * 0.01 - 0.08), 4),
        ]
        print(
            f"{name:24s}: {source_triangles:6d} -> {len(faces):5d} tris, {len(local):5d} verts | "
            f"cm Y=[{cm_min[1]:6.2f}, {cm_max[1]:6.2f}] X=[{cm_min[0]:6.2f}, {cm_max[0]:6.2f}] Z=[{cm_min[2]:6.2f}, {cm_max[2]:6.2f}] | "
            f"viewer={viewer_center}",
            flush=True,
        )

    if len(binary) > 750_000:
        raise ValueError(f"organs-extra.bin exceeds 750,000 bytes: {len(binary)}")

    meta = {
        "schemaVersion": 1,
        "format": "quantized-uint16-le",
        "meshes": meshes,
        "binaryBytes": len(binary),
        "binarySha256": sha(binary),
        "attribution": ATTRIBUTION,
        "license": "CC-BY-SA-2.1-JP",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.1/jp/",
        "source": {
            "dataset": "BodyParts3D",
            "version": "3.0",
            "archiveDate": "2011-09-15",
            "sourceUnit": "mm",
            "outputUnit": "cm",
            "transform": "[x, z, -y] / 10",
            "downloads": [{"url": BASE + remote, "sha256": expected} for remote, expected in SOURCES.values()],
            "elementCount": len(source_count),
            "officialLicensePage": "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html",
        },
    }

    (OUT / "organs-extra.bin").write_bytes(bytes(binary))
    (OUT / "organs-extra.json").write_text(json.dumps(meta, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(f"Built organs-extra: {len(meshes)} meshes, {len(binary):,} bytes, sha256={sha(binary)}")


if __name__ == "__main__":
    main()
