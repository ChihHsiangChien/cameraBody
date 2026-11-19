import { readFileSync, readdirSync } from 'node:fs';
import { afterEach, describe, expect, test } from 'vitest';
import { createTranslator, resolveLanguage, setLanguage, getLanguage, t } from '../../src/i18n.js';

const english = createTranslator('en');
const chinese = createTranslator('zh');
const hasChinese = (text) => /[\u4e00-\u9fff]/.test(text);
const withoutName = (text) => text.replaceAll('吳易澄', '');
afterEach(() => setLanguage('zh'));

describe('interface language', () => {
  test('the URL wins, then the stored choice, then the browser; Chinese browsers and unknown ones get Chinese', () => {
    expect(resolveLanguage({ requested: 'en', stored: 'zh', preferred: ['zh-TW'] })).toBe('en');
    expect(resolveLanguage({ requested: 'fr', stored: 'en', preferred: ['zh-TW'] })).toBe('en');
    expect(resolveLanguage({ stored: 'auto', preferred: ['zh-TW', 'en'] })).toBe('zh');
    expect(resolveLanguage({ stored: 'auto', preferred: ['zh-Hans-CN'] })).toBe('zh');
    expect(resolveLanguage({ stored: 'auto', preferred: ['en-US', 'zh-TW'] })).toBe('en');
    expect(resolveLanguage({ stored: 'auto', preferred: ['ja'] })).toBe('en');
    expect(resolveLanguage({ stored: 'auto', preferred: [] })).toBe('zh');
    expect(resolveLanguage()).toBe('zh');
  });

  test('Chinese is returned untouched and an unknown text is never dropped', () => {
    expect(chinese('載入解剖模型中...')).toBe('載入解剖模型中...');
    expect(english('載入解剖模型中...')).toBe('Loading anatomical models...');
    expect(english('沒有收錄的句子')).toBe('沒有收錄的句子');
    expect(english('constructor')).toBe('constructor');
    expect(english(undefined)).toBeUndefined();
    setLanguage('en');
    expect(getLanguage()).toBe('en');
    expect(t('正面')).toBe('Front');
    setLanguage('nonsense');
    expect(getLanguage()).toBe('zh');
    expect(t('正面')).toBe('正面');
  });

  test('every Chinese text and label in the page has English', () => {
    const html = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
    const texts = [...html.matchAll(/>([^<>]+)</g)].map((match) => match[1].replace(/\s+/g, ' ').trim());
    const labels = [...html.matchAll(/(?:aria-label|title|content|alt|placeholder)="([^"]*)"/g)].map((match) => match[1]);
    const untranslated = [...new Set([...texts, ...labels])].filter((text) => hasChinese(withoutName(text)) && hasChinese(withoutName(english(text))));
    expect(untranslated).toEqual([]);
  });

  test('every Chinese message written by the application code has English', () => {
    const directory = new URL('../../src/', import.meta.url);
    const skipped = ['i18n.js', 'neuro-data.js', 'neuro-viewer.js'];
    const untranslated = [];
    for (const file of readdirSync(directory).filter((name) => name.endsWith('.js') && !skipped.includes(name))) {
      const code = readFileSync(new URL(file, directory), 'utf8').replace(/\/\/.*$/gm, '');
      for (const [, , literal] of code.matchAll(/(['`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
        if (!hasChinese(literal)) continue;
        for (const piece of literal.split(/\$\{[^}]*\}/).filter(hasChinese)) {
          if (hasChinese(english(piece)) && !/^(將介面切換為中文|中文)$/.test(piece)) untranslated.push(`${file}: ${piece}`);
        }
      }
    }
    expect(untranslated).toEqual([]);
  });
});
