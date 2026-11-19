import { setLanguage, resolveLanguage, translateDocument, t } from './i18n.js';
import { CATEGORIES, STRUCTURES } from './neuro-data.js';
import { createNeuroViewer } from './neuro-viewer.js';

// Setup language
const query = new URLSearchParams(location.search);
const hash = new URLSearchParams(location.hash.slice(1));
let currentLang = resolveLanguage({
  requested: query.get('lang') || hash.get('lang'),
  preferred: navigator.languages?.length ? navigator.languages : [navigator.language],
});
setLanguage(currentLang);
translateDocument(document.documentElement);

const langToggle = document.getElementById('language-toggle');
if (langToggle) {
  langToggle.textContent = currentLang === 'zh-Hant' ? 'English' : '中文';
  langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'zh-Hant' ? 'en' : 'zh-Hant';
    const url = new URL(location.href);
    url.searchParams.set('lang', nextLang);
    location.href = url.toString();
  });
}

// DOM Elements
const stage = document.getElementById('stage');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.getElementById('loading-text');

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
const silhouetteCheckbox = document.getElementById('silhouette-toggle');
const silhouetteSlider = document.getElementById('silhouette-slider');

const zoomInBtn = document.getElementById('btn-zoom-in');
const zoomOutBtn = document.getElementById('btn-zoom-out');
const dragModeBtn = document.getElementById('btn-drag-mode');
const resetViewBtn = document.getElementById('btn-reset-view');

let currentSelectedStructure = null;

// Initialize Neuro 3D Viewer
const viewer = createNeuroViewer({
  container: stage,
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

    const cat = CATEGORIES.find(c => c.id === structure.category);
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

// Build Sidebar Checklist UI
const structureListContainer = document.getElementById('structure-hierarchy');
if (structureListContainer) {
  structureListContainer.innerHTML = '';

  for (const cat of CATEGORIES) {
    if (cat.id === 'silhouette') continue; // Handled separately in top section

    const catStructures = STRUCTURES.filter(s => s.category === cat.id);
    if (catStructures.length === 0) continue;

    const groupSection = document.createElement('section');
    groupSection.className = 'category-group';
    groupSection.setAttribute('data-category', cat.id);

    // Category Header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'category-header';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'category-title';
    titleDiv.innerHTML = `<span class="cat-icon">${cat.icon}</span> <span class="cat-name">${currentLang === 'en' ? cat.nameEn : cat.nameZh}</span>`;

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
      cb.checked = true;
      cb.setAttribute('data-structure-id', item.id);
      cb.addEventListener('change', () => {
        viewer.toggleStructure(item.id, cb.checked);
      });

      const colorDot = document.createElement('span');
      colorDot.className = 'color-dot';
      colorDot.style.backgroundColor = item.color;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'structure-name';
      nameSpan.textContent = currentLang === 'en' ? item.nameEn : item.nameZh;

      const focusBtn = document.createElement('button');
      focusBtn.type = 'button';
      focusBtn.className = 'item-focus-btn';
      focusBtn.title = currentLang === 'en' ? 'Select & Inspect' : '選取並查看';
      focusBtn.setAttribute('aria-label', currentLang === 'en' ? `Select ${item.nameEn}` : `選取 ${item.nameZh}`);
      focusBtn.innerHTML = '🔍';
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

// Sidebar Mobile Toggle
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

if (sidebarClose && sidebar) {
  sidebarClose.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}
