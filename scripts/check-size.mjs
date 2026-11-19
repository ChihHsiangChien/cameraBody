import { readdir, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const root = resolve('dist');
async function list(path) {
  const out = [];
  for (const item of await readdir(path, { withFileTypes: true })) {
    const file = resolve(path, item.name);
    if (item.isDirectory()) out.push(...await list(file));
    else if (item.isFile()) out.push({ path: relative(root, file).split(sep).join('/'), bytes: (await stat(file)).size });
    else throw new Error(`Unexpected nonregular deployment asset: ${file}`);
  }
  return out;
}
const files = await list(root);
const totalBytes = files.reduce((sum, f) => sum + f.bytes, 0);
const budgetBytes = 15_000_000;
if (totalBytes > budgetBytes) throw new Error(`Deployment exceeds 15 MB budget: ${totalBytes}`);
if (files.some((f) => /(^|\/)(original|tools|tests|node_modules)\//.test(f.path))) {
  throw new Error('Development-only files leaked into deployment');
}
console.log(JSON.stringify({ files: files.length, totalBytes, budgetBytes }, null, 2));
