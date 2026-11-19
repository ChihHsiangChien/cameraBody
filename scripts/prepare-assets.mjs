import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { buildTime } from './build-time.mjs';

await mkdir('LICENSES', { recursive: true });
await cp('node_modules/three/LICENSE', 'LICENSES/three-MIT.txt');
await rm('public/licenses', { recursive: true, force: true });
await mkdir('public/licenses', { recursive: true });
await cp('LICENSES', 'public/licenses', { recursive: true });
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
await writeFile(
  'public/version.json',
  JSON.stringify({ version, commit: process.env.BUILD_SHA || 'local', builtAt: buildTime().toISOString() }) + '\n'
);
console.log('Licenses synced and version.json generated.');
