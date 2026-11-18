import {
  ANATOMICAL_SYSTEMS,
  isSystemActive,
  setSystemActive,
  soloSystem,
  enableAllSystems,
  disableAllSystems,
} from './systems.js';
import { applyPreset, saveSettings } from './settings.js';
import { t, getLanguage } from './i18n.js';
import './ui-systems.css';

/**
 * Creates the BodyVista-inspired Systems Dock and Mode Controls.
 */
export function createSystemsUI({
  stage,
  settings,
  onChange = () => {},
  onSnap = () => {},
  onOrbitToggle = () => {},
  isFrozen = () => false,
  isOrbitMode = () => false,
}) {
  if (!stage) throw new Error('Systems UI requires a stage container.');

  const doc = stage.ownerDocument;
  const dock = doc.createElement('section');
  dock.className = 'systems-dock';
  dock.setAttribute('aria-label', t('人體系統選擇器'));

  // Header: Mode Switchers + Batch Actions
  const header = doc.createElement('div');
  header.className = 'systems-dock-header';

  // Mode Switches
  const modeGroup = doc.createElement('div');
  modeGroup.className = 'mode-switches';

  function makeModeButton(id, icon, labelText, titleText, isActive = false) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = `mode-btn${isActive ? ' active' : ''}`;
    btn.id = id;
    btn.title = titleText;
    const iconSpan = doc.createElement('span');
    iconSpan.textContent = icon;
    const textSpan = doc.createElement('span');
    textSpan.textContent = labelText;
    btn.append(iconSpan, textSpan);
    return btn;
  }

  const liveBtn = makeModeButton('mode-live-btn', '📷', t('即時追蹤'), t('鏡頭即時追蹤人體姿態'), true);
  const snapBtn = makeModeButton('mode-snap-btn', '📸', t('拍照凍結'), t('定格當前畫面，可 360 度旋轉縮放檢視'));
  const orbitBtn = makeModeButton('mode-orbit-btn', '🌐', t('自由 3D'), t('自由 3D 觀察模式'));

  modeGroup.append(liveBtn, snapBtn, orbitBtn);

  // Batch Actions
  const batchGroup = doc.createElement('div');
  batchGroup.className = 'batch-actions';

  const allBtn = doc.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'batch-btn';
  allBtn.textContent = t('全選');
  allBtn.title = t('開啟所有人體系統');

  const noneBtn = doc.createElement('button');
  noneBtn.type = 'button';
  noneBtn.className = 'batch-btn';
  noneBtn.textContent = t('清空');
  noneBtn.title = t('關閉所有系統');

  const resetBtn = doc.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'batch-btn';
  resetBtn.textContent = t('骨骼標配');
  resetBtn.title = t('重設為骨骼標準配置');

  batchGroup.append(allBtn, resetBtn, noneBtn);
  header.append(modeGroup, batchGroup);

  // Systems List (horizontal scrollable bar)
  const list = doc.createElement('div');
  list.className = 'systems-list';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', t('人體各系統選擇'));

  const cardMap = new Map();

  for (const sys of ANATOMICAL_SYSTEMS) {
    const card = doc.createElement('button');
    card.type = 'button';
    card.className = 'system-card';
    card.dataset.system = sys.id;
    card.style.setProperty('--sys-color', sys.color);
    card.style.setProperty('--sys-accent', sys.accent);
    card.style.setProperty('--sys-glow', `${sys.accent}40`);

    const lang = getLanguage();
    const titleText = lang === 'en' ? sys.nameEn : sys.nameZh;
    const descText = lang === 'en' ? sys.descriptionEn : sys.descriptionZh;
    card.title = `${titleText}：${descText}`;

    const dot = doc.createElement('span');
    dot.className = 'system-dot';

    const icon = doc.createElement('span');
    icon.className = 'system-icon';
    icon.textContent = sys.icon;

    const name = doc.createElement('span');
    name.className = 'system-name';
    name.textContent = titleText;

    const solo = doc.createElement('button');
    solo.type = 'button';
    solo.className = 'solo-btn';
    solo.textContent = 'Solo';
    solo.title = t(`單獨顯示${titleText}`);
    solo.setAttribute('aria-label', t(`單獨顯示${titleText}`));

    // Clicking solo button stops propagation and exclusively activates this system
    solo.addEventListener('click', (e) => {
      e.stopPropagation();
      soloSystem(settings, sys.id);
      saveSettings(settings);
      sync();
      onChange();
    });

    // Main card click toggles system on/off
    card.addEventListener('click', () => {
      const active = isSystemActive(settings, sys.id);
      setSystemActive(settings, sys.id, !active);
      saveSettings(settings);
      sync();
      onChange();
    });

    card.append(dot, icon, name, solo);
    list.append(card);
    cardMap.set(sys.id, card);
  }

  dock.append(header, list);
  stage.append(dock);

  // Event handlers for mode & batch
  allBtn.addEventListener('click', () => {
    enableAllSystems(settings);
    saveSettings(settings);
    sync();
    onChange();
  });

  noneBtn.addEventListener('click', () => {
    disableAllSystems(settings);
    saveSettings(settings);
    sync();
    onChange();
  });

  resetBtn.addEventListener('click', () => {
    applyPreset(settings, 'skeletal');
    saveSettings(settings);
    sync();
    onChange();
  });

  snapBtn.addEventListener('click', () => {
    onSnap();
    sync();
  });

  liveBtn.addEventListener('click', () => {
    if (isFrozen()) {
      onSnap(); // unpause
    }
    sync();
  });

  orbitBtn.addEventListener('click', () => {
    onOrbitToggle();
    sync();
  });

  function sync() {
    for (const [sysId, card] of cardMap) {
      const active = isSystemActive(settings, sysId);
      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', String(active));
    }

    const frozen = isFrozen();
    liveBtn.classList.toggle('active', !frozen);
    snapBtn.classList.toggle('active', frozen);
    snapBtn.classList.toggle('snap-active', frozen);
    orbitBtn.classList.toggle('active', isOrbitMode());
  }

  sync();

  return {
    dock,
    sync,
    dispose: () => dock.remove(),
  };
}
