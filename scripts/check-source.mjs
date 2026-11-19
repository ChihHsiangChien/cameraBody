import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const dirs = ['src', 'src/systems'];
for (const dir of dirs) {
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.js')) continue;
    const relPath = `${dir}/${file}`;
    const result = spawnSync(process.execPath, ['--check', relPath], { encoding: 'utf8' });
    if (result.status) throw new Error(result.stderr);
    const source = await readFile(relPath, 'utf8');
    if (/\binnerHTML\b|\beval\s*\(|new\s+Function\b/.test(source)) {
      throw new Error(`Unsafe API in ${relPath}`);
    }
  }
}
console.log('JavaScript syntax and prohibited source APIs: passed.');
