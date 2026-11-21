import { setLanguage, resolveLanguage, translateDocument, t } from './i18n.js';
import { createNeuroViewer, SYSTEM_PAGES } from './neuro-viewer.js';

// Setup language and initial system page from URL (?page= or #page=)
const query = new URLSearchParams(location.search);
const hash = new URLSearchParams(location.hash.slice(1));
let currentLang = resolveLanguage({
  requested: query.get('lang') || hash.get('lang'),
  preferred: navigator.languages?.length ? navigator.languages : [navigator.language],
});
setLanguage(currentLang);
translateDocument(document.documentElement);

const requestedPage = query.get('page') || hash.get('page') || 'nervous';
let currentPageId = SYSTEM_PAGES[requestedPage] ? requestedPage : 'nervous';

const langToggle = document.getElementById('language-toggle');
if (langToggle) {
  langToggle.textContent = currentLang === 'en' ? '中文' : 'English';
  langToggle.lang = currentLang === 'en' ? 'zh-Hant' : 'en';
  langToggle.setAttribute('aria-label', currentLang === 'en' ? '將介面切換為中文' : 'Switch the interface to English');
  langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'zh' : 'en';
    const url = new URL(location.href);
    url.searchParams.set('lang', nextLang);
    url.searchParams.set('page', currentPageId);
    location.href = url.toString();
  });
}

// DOM Elements
const stage = document.getElementById('stage');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.getElementById('loading-text');

const brandMainTitle = document.querySelector('.brand-main-title');
const brandSubTitle = document.querySelector('.brand-sub-title');
const brainModeSection = document.querySelector('.brain-mode-section');

const sidebar = document.getElementById('neuro-sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const searchInput = document.getElementById('structure-search');

const inspector = document.getElementById('structure-inspector');
const inspectorTitle = document.getElementById('inspector-title');
const inspectorCategory = document.getElementById('inspector-category');
const inspectorEn = document.getElementById('inspector-en');
const inspectorDesc = document.getElementById('inspector-desc');
const inspectorHideBtn = document.getElementById('inspector-hide-btn');
const inspectorCloseBtn = document.getElementById('inspector-close-btn');

const ghostBonesCheckbox = document.getElementById('ghost-bones-toggle');
const calloutPinsCheckbox = document.getElementById('callout-pins-toggle');
const brainPinsCheckbox = document.getElementById('brain-pins-toggle');
const silhouetteCheckbox = document.getElementById('silhouette-toggle');
const silhouetteSlider = document.getElementById('silhouette-slider');

const zoomInBtn = document.getElementById('btn-zoom-in');
const zoomOutBtn = document.getElementById('btn-zoom-out');
const dragModeBtn = document.getElementById('btn-drag-mode');
const resetViewBtn = document.getElementById('btn-reset-view');

let currentSelectedStructure = null;

// Initialize Multi-System 3D Viewer
const viewer = createNeuroViewer({
  container: stage,
  lang: currentLang,
  initialPage: currentPageId,
  onProgress: ({ percent, text, error }) => {
    if (loadingProgress) loadingProgress.style.width = `${percent}%`;
    if (loadingText) loadingText.textContent = t(text);
    if (percent >= 100 && !error) {
      setTimeout(() => {
        if (loadingOverlay) {
          loadingOverlay.classList.add('fade-out');
          setTimeout(() => { loadingOverlay.hidden = true; }, 400);
        }
      }, 300);
    }
  },
  onSelect: structure => {
    currentSelectedStructure = structure;
    if (!structure) {
      if (inspector) inspector.hidden = true;
      return;
    }
    if (!inspector) return;

    const activeConfig = SYSTEM_PAGES[currentPageId] || SYSTEM_PAGES.nervous;
    const cat = activeConfig.categories.find(c => c.id === structure.category);
    if (inspectorCategory) {
      inspectorCategory.textContent = `${cat?.icon || ''} ${currentLang === 'en' ? cat?.nameEn : cat?.nameZh}`;
      inspectorCategory.style.borderColor = structure.color;
      inspectorCategory.style.color = structure.color;
    }
    if (inspectorTitle) inspectorTitle.textContent = currentLang === 'en' ? structure.nameEn : structure.nameZh;
    if (inspectorEn) inspectorEn.textContent = structure.nameEn;
    if (inspectorDesc) inspectorDesc.textContent = currentLang === 'en' ? structure.descEn : structure.descZh;

    inspector.hidden = false;
  },
});

// Inspector Actions
if (inspectorCloseBtn) {
  inspectorCloseBtn.addEventListener('click', () => {
    viewer.selectStructure(null);
  });
}

if (inspectorHideBtn) {
  inspectorHideBtn.addEventListener('click', () => {
    if (currentSelectedStructure) {
      const checkbox = document.querySelector(`input[data-structure-id="${currentSelectedStructure.id}"]`);
      if (checkbox) checkbox.checked = false;
      viewer.toggleStructure(currentSelectedStructure.id, false);
      viewer.selectStructure(null);
    }
  });
}

// Render Sidebar Checklist UI for the active system
function renderStructureHierarchy(pageId) {
  const structureListContainer = document.getElementById('structure-hierarchy');
  if (!structureListContainer) return;
  structureListContainer.replaceChildren();

  const pageConfig = SYSTEM_PAGES[pageId] || SYSTEM_PAGES.nervous;
  const categories = pageConfig.categories;
  const structures = pageConfig.structures;

  for (const cat of categories) {
    if (cat.id === 'silhouette') continue; // Handled separately in top section

    const catStructures = structures.filter(s => s.category === cat.id);
    if (catStructures.length === 0) continue;

    const groupSection = document.createElement('section');
    groupSection.className = 'category-group';
    groupSection.setAttribute('data-category', cat.id);

    // Category Header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'category-header';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'category-title';
    const iconSpan = document.createElement('span');
    iconSpan.className = 'cat-icon';
    iconSpan.textContent = cat.icon || '●';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'cat-name';
    nameSpan.textContent = currentLang === 'en' ? cat.nameEn : cat.nameZh;
    titleDiv.append(iconSpan, document.createTextNode(' '), nameSpan);

    const groupActions = document.createElement('div');
    groupActions.className = 'group-actions';

    const btnAll = document.createElement('button');
    btnAll.type = 'button';
    btnAll.className = 'mini-btn';
    btnAll.textContent = currentLang === 'en' ? 'All' : '全選';
    btnAll.addEventListener('click', () => {
      for (const s of catStructures) {
        const cb = document.querySelector(`input[data-structure-id="${s.id}"]`);
        if (cb) cb.checked = true;
        viewer.toggleStructure(s.id, true);
      }
    });

    const btnNone = document.createElement('button');
    btnNone.type = 'button';
    btnNone.className = 'mini-btn';
    btnNone.textContent = currentLang === 'en' ? 'None' : '全關';
    btnNone.addEventListener('click', () => {
      for (const s of catStructures) {
        const cb = document.querySelector(`input[data-structure-id="${s.id}"]`);
        if (cb) cb.checked = false;
        viewer.toggleStructure(s.id, false);
      }
    });

    groupActions.appendChild(btnAll);
    groupActions.appendChild(btnNone);
    groupHeader.appendChild(titleDiv);
    groupHeader.appendChild(groupActions);
    groupSection.appendChild(groupHeader);

    // Item List
    const itemsList = document.createElement('ul');
    itemsList.className = 'structure-items';

    for (const item of catStructures) {
      const li = document.createElement('li');
      li.className = 'structure-item';
      li.setAttribute('data-search-text', `${item.nameZh} ${item.nameEn}`.toLowerCase());

      const label = document.createElement('label');
      label.className = 'structure-label';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = viewer.isStructureVisible(item.id);
      cb.setAttribute('data-structure-id', item.id);
      cb.addEventListener('change', () => {
        viewer.toggleStructure(item.id, cb.checked);
      });

      const colorDot = document.createElement('span');
      colorDot.className = 'color-dot';
      colorDot.setAttribute('data-dot-id', item.id);
      colorDot.style.backgroundColor = item.color;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'structure-name';
      nameSpan.textContent = currentLang === 'en' ? item.nameEn : item.nameZh;

      const focusBtn = document.createElement('button');
      focusBtn.type = 'button';
      focusBtn.className = 'item-focus-btn';
      focusBtn.title = currentLang === 'en' ? 'Select & Inspect' : '選取並查看';
      focusBtn.setAttribute('aria-label', currentLang === 'en' ? `Select ${item.nameEn}` : `選取 ${item.nameZh}`);
      focusBtn.textContent = '⌖';
      focusBtn.addEventListener('click', e => {
        e.stopPropagation();
        viewer.selectStructure(item.id);
      });

      label.appendChild(cb);
      label.appendChild(colorDot);
      label.appendChild(nameSpan);
      li.appendChild(label);
      li.appendChild(focusBtn);
      itemsList.appendChild(li);
    }

    groupSection.appendChild(itemsList);
    structureListContainer.appendChild(groupSection);
  }
}

function updatePageUI(pageId, historyMode = 'replace') {
  const pageConfig = SYSTEM_PAGES[pageId] || SYSTEM_PAGES.nervous;
  currentPageId = pageConfig.meta.id;

  // Update System Page Navigation Tabs
  document.querySelectorAll('.system-page-tab').forEach(tab => {
    const tabPage = tab.getAttribute('data-system-page');
    const isActive = tabPage === currentPageId;
    if (tabPage) {
      tab.setAttribute('href', currentLang === 'en' ? `?page=${tabPage}&lang=en` : `?page=${tabPage}`);
    }
    tab.classList.toggle('active', isActive);
    if (isActive) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });

  // Update Brand Main Title and Subtitle
  if (brandMainTitle) {
    brandMainTitle.textContent = currentLang === 'en' ? pageConfig.meta.titleEn : pageConfig.meta.titleZh;
  }
  if (brandSubTitle) {
    brandSubTitle.textContent = currentLang === 'en' ? pageConfig.meta.subtitleEn : pageConfig.meta.subtitleZh;
  }
  document.title = currentLang === 'en'
    ? `${pageConfig.meta.titleEn} | Interactive Anatomy Explorer`
    : `${pageConfig.meta.titleZh}｜互動人體解剖探索`;

  // Update Header Preset Button Labels dynamically
  const isNervous = currentPageId === 'nervous';
  const presetLabels = {
    all: t('全部顯示'),
    nervesOnly: isNervous ? t('僅神經系統') : t('僅器官系統'),
    nervesAndSpine: isNervous ? t('神經＋脊椎') : t('器官＋脊椎'),
    nervesAndSkeleton: isNervous ? t('神經＋全身骨骼') : t('器官＋全身骨骼'),
  };
  document.querySelectorAll('.preset-btn').forEach(btn => {
    const presetKey = btn.getAttribute('data-preset');
    if (presetLabels[presetKey]) {
      btn.textContent = presetLabels[presetKey];
    }
    btn.classList.toggle('active', presetKey === 'all');
  });

  // Show Brain Hemispheres section only when on nervous page
  if (brainModeSection) {
    brainModeSection.hidden = !isNervous;
  }

  // Update back-view button label dynamically
  const backViewBtn = document.querySelector('.view-btn[data-view="back"]');
  if (backViewBtn) {
    backViewBtn.textContent = isNervous ? t('背面 (脊髓與脊神經)') : t('背面 (脊椎與內臟)');
  }

  // Re-render structure hierarchy
  renderStructureHierarchy(currentPageId);

  // Sync top controls
  if (ghostBonesCheckbox) ghostBonesCheckbox.checked = viewer.getGhostBones();
  if (calloutPinsCheckbox) calloutPinsCheckbox.checked = viewer.getShowBrainPins();
  if (brainPinsCheckbox) brainPinsCheckbox.checked = viewer.getShowBrainPins();
  if (silhouetteCheckbox) silhouetteCheckbox.checked = true;
  if (searchInput) searchInput.value = '';

  // Update URL query ?page=<pageId>
  if (historyMode) {
    const url = new URL(location.href);
    url.searchParams.set('page', currentPageId);
    if (historyMode === 'push' && typeof history.pushState === 'function') {
      history.pushState({ page: currentPageId }, '', url.toString());
    } else if (historyMode === 'replace' && typeof history.replaceState === 'function') {
      history.replaceState({ page: currentPageId }, '', url.toString());
    }
  }
}

// Initial UI render
updatePageUI(currentPageId, 'replace');

// Dedicated System Page Switcher Tabs
document.querySelectorAll('.system-page-tab').forEach(tab => {
  tab.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const targetPage = tab.getAttribute('data-system-page');
    if (!targetPage || targetPage === currentPageId) return;
    viewer.setSystemPage(targetPage);
    updatePageUI(targetPage, 'push');
  });
});

// Sync UI on browser Back/Forward navigation
window.addEventListener('popstate', () => {
  const q = new URLSearchParams(location.search);
  const h = new URLSearchParams(location.hash.slice(1));
  const nextReq = q.get('page') || h.get('page') || 'nervous';
  const nextPage = SYSTEM_PAGES[nextReq] ? nextReq : 'nervous';
  if (nextPage === currentPageId) return;
  viewer.setSystemPage(nextPage);
  updatePageUI(nextPage, false);
});

// Search Filter
if (searchInput) {
  searchInput.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const items = document.querySelectorAll('.structure-item');
    for (const item of items) {
      const match = !q || item.getAttribute('data-search-text')?.includes(q);
      item.hidden = !match;
    }
  });
}

// Preset Buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = btn.getAttribute('data-preset');
    viewer.applyPreset(preset);

    // Sync all checkboxes
    document.querySelectorAll('input[data-structure-id]').forEach(cb => {
      const id = cb.getAttribute('data-structure-id');
      cb.checked = viewer.isStructureVisible(id);
    });

    if (ghostBonesCheckbox) {
      ghostBonesCheckbox.checked = viewer.getGhostBones();
    }
  });
});

// Ghost Bones Toggle
if (ghostBonesCheckbox) {
  ghostBonesCheckbox.addEventListener('change', () => {
    viewer.setGhostBones(ghostBonesCheckbox.checked);
  });
}

// Brain Hemisphere Selector ('both' | 'L' | 'R')
document.querySelectorAll('.hemi-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.hemi-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const hemi = btn.getAttribute('data-hemi');
    viewer.setBrainHemisphere(hemi);
  });
});

// 3D Callout Pins Toggles (both general and brain section checkboxes stay synced)
function setPinsVisibility(visible) {
  viewer.setShowBrainPins(visible);
  if (calloutPinsCheckbox) calloutPinsCheckbox.checked = visible;
  if (brainPinsCheckbox) brainPinsCheckbox.checked = visible;
}

if (calloutPinsCheckbox) {
  calloutPinsCheckbox.addEventListener('change', () => {
    setPinsVisibility(calloutPinsCheckbox.checked);
  });
}

if (brainPinsCheckbox) {
  brainPinsCheckbox.addEventListener('change', () => {
    setPinsVisibility(brainPinsCheckbox.checked);
  });
}

// Brain Partition Mode Selector ('both' | 'anatomical' | 'functional')
document.querySelectorAll('.brain-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.brain-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.getAttribute('data-brain-mode');
    viewer.setBrainPartitionMode(mode);

    // Sync all structure checkboxes and pins toggle
    document.querySelectorAll('input[data-structure-id]').forEach(cb => {
      const id = cb.getAttribute('data-structure-id');
      cb.checked = viewer.isStructureVisible(id);
    });
    const showPins = viewer.getShowBrainPins();
    if (calloutPinsCheckbox) calloutPinsCheckbox.checked = showPins;
    if (brainPinsCheckbox) brainPinsCheckbox.checked = showPins;
  });
});

// Silhouette Controls
if (silhouetteCheckbox) {
  silhouetteCheckbox.addEventListener('change', () => {
    viewer.toggleStructure('silhouetteMesh', silhouetteCheckbox.checked);
  });
}

if (silhouetteSlider) {
  silhouetteSlider.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    viewer.setSilhouetteOpacity(val);
  });
}

// Navigation & Camera Preset Buttons
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const viewKey = btn.getAttribute('data-view');
    viewer.setView(viewKey);
  });
});

if (zoomInBtn) zoomInBtn.addEventListener('click', () => viewer.zoomIn());
if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => viewer.zoomOut());
if (resetViewBtn) resetViewBtn.addEventListener('click', () => viewer.setView('default'));

if (dragModeBtn) {
  dragModeBtn.addEventListener('click', () => {
    const current = viewer.getDragMode();
    const next = current === 'orbit' ? 'pan' : 'orbit';
    viewer.setDragMode(next);
    dragModeBtn.classList.toggle('active', next === 'pan');
    dragModeBtn.title = next === 'pan'
      ? (currentLang === 'en' ? 'Mode: Pan (Drag to move)' : '模式：平移（拖曳移動視角）')
      : (currentLang === 'en' ? 'Mode: Orbit (Drag to rotate)' : '模式：旋轉（拖曳環視視角）');
  });
}

// Sidebar Toggle (Desktop Collapse & Mobile Drawer)
function isSidebarOpen() {
  if (!sidebar) return false;
  if (window.innerWidth <= 900) {
    return sidebar.classList.contains('open');
  }
  return !sidebar.classList.contains('collapsed');
}

function updateSidebarToggleState(open) {
  if (!sidebarToggle) return;
  sidebarToggle.classList.toggle('active', open);
  sidebarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  const labelKey = open ? '關閉控制面板' : '開啟控制面板';
  sidebarToggle.setAttribute('aria-label', t(labelKey));
  sidebarToggle.title = t(labelKey);
}

function setSidebarOpen(open) {
  if (!sidebar) return;
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('open', open);
    sidebar.classList.toggle('collapsed', !open);
  } else {
    sidebar.classList.toggle('collapsed', !open);
    sidebar.classList.toggle('open', open);
  }
  updateSidebarToggleState(open);

  if (viewer?.resize) {
    viewer.resize();
  }
}

function toggleSidebar() {
  setSidebarOpen(!isSidebarOpen());
}

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    toggleSidebar();
  });
}

if (sidebarClose && sidebar) {
  sidebarClose.addEventListener('click', () => {
    setSidebarOpen(false);
  });
}

if (sidebar) {
  sidebar.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'margin-right' || e.propertyName === 'transform') {
      if (viewer?.resize) {
        viewer.resize();
      } else {
        window.dispatchEvent(new Event('resize'));
      }
    }
  });
}

// Initial state sync based on viewport
const initialSidebarOpen = window.innerWidth > 900;
setSidebarOpen(initialSidebarOpen);

let prevWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const currentWidth = window.innerWidth;
  if (prevWidth > 900 && currentWidth <= 900) {
    setSidebarOpen(false);
  } else if (prevWidth <= 900 && currentWidth > 900) {
    setSidebarOpen(true);
  }
  prevWidth = currentWidth;
});
