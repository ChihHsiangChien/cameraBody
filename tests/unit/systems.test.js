import { describe, expect, test } from 'vitest';
import { DEFAULTS } from '../../src/settings.js';
import {
  ANATOMICAL_SYSTEMS,
  SYSTEM_IDS,
  systemById,
  systemForPart,
  isSystemActive,
  setSystemActive,
  soloSystem,
  enableAllSystems,
  disableAllSystems,
} from '../../src/systems.js';

describe('anatomical systems definition and toggles', () => {
  test('defines all 9 core systems', () => {
    expect(SYSTEM_IDS).toEqual([
      'skeletal', 'muscular', 'cardiovascular', 'respiratory',
      'digestive', 'urinary', 'nervous', 'sensory', 'skin'
    ]);
    expect(ANATOMICAL_SYSTEMS.length).toBe(9);
  });

  test('systemById retrieves correct systems', () => {
    expect(systemById('cardiovascular').nameZh).toBe('心血管系統');
    expect(systemById('respiratory').icon).toBe('🫁');
    expect(systemById('unknown')).toBeNull();
  });

  test('systemForPart categorizes anatomical structures properly', () => {
    expect(systemForPart({ name: 'heart', layer: 'organs' }).id).toBe('cardiovascular');
    expect(systemForPart({ name: 'left lung', layer: 'organs' }).id).toBe('respiratory');
    expect(systemForPart({ name: 'liver', layer: 'organs' }).id).toBe('digestive');
    expect(systemForPart({ name: 'kidney', layer: 'organs' }).id).toBe('urinary');
    expect(systemForPart({ name: 'biceps brachii', kind: 'muscle' }).id).toBe('muscular');
    expect(systemForPart({ name: 'femur', kind: 'bone' }).id).toBe('skeletal');
    expect(systemForPart({ name: 'median nerve', kind: 'nerve' }).id).toBe('nervous');
    expect(systemForPart({ name: 'eyeball', layer: 'eyes' }).id).toBe('sensory');
    expect(systemForPart({ name: 'skin outline', layer: 'outline' }).id).toBe('skin');
  });

  test('setSystemActive and isSystemActive toggle layers and organs', () => {
    const settings = { ...DEFAULTS, organs: false, organHeart: true };
    expect(isSystemActive(settings, 'cardiovascular')).toBe(false);

    setSystemActive(settings, 'cardiovascular', true);
    expect(settings.organs).toBe(true);
    expect(settings.organHeart).toBe(true);
    expect(isSystemActive(settings, 'cardiovascular')).toBe(true);

    setSystemActive(settings, 'cardiovascular', false);
    expect(settings.organHeart).toBe(false);
    expect(isSystemActive(settings, 'cardiovascular')).toBe(false);
  });

  test('soloSystem isolates target system', () => {
    const settings = { ...DEFAULTS };
    soloSystem(settings, 'respiratory');
    expect(settings.organLungs).toBe(true);
    expect(settings.organHeart).toBe(false);
    expect(settings.organDigestive).toBe(false);
    expect(settings.skull).toBe(false);
    expect(settings.spine).toBe(false);
    expect(isSystemActive(settings, 'respiratory')).toBe(true);
    expect(isSystemActive(settings, 'cardiovascular')).toBe(false);
    expect(isSystemActive(settings, 'skeletal')).toBe(false);
  });

  test('enableAllSystems and disableAllSystems operate on all systems', () => {
    const settings = { ...DEFAULTS };
    disableAllSystems(settings);
    for (const id of SYSTEM_IDS) {
      expect(isSystemActive(settings, id)).toBe(false);
    }

    enableAllSystems(settings);
    for (const id of SYSTEM_IDS) {
      expect(isSystemActive(settings, id)).toBe(true);
    }
  });
});
