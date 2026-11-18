import { defineConfig } from 'vitest/config';

if (!Map.groupBy) {
  Map.groupBy = (iterable, callback) => {
    const map = new Map();
    let i = 0;
    for (const item of iterable) {
      const key = callback(item, i++);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  };
}
if (!Object.groupBy) {
  Object.groupBy = (iterable, callback) => {
    const obj = {};
    let i = 0;
    for (const item of iterable) {
      const key = callback(item, i++);
      if (!obj[key]) obj[key] = [];
      obj[key].push(item);
    }
    return obj;
  };
}

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.js'], environment: 'node', testTimeout: 20000 },
});
