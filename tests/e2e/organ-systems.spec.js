import { test, expect } from '@playwright/test';

const SYSTEM_PAGES = [
  { id: 'nervous', titleZh: '神經系統 3D 專頁' },
  { id: 'circulatory', titleZh: '循環系統 3D 專頁' },
  { id: 'respiratory', titleZh: '呼吸系統 3D 專頁' },
  { id: 'urinary', titleZh: '泌尿系統 3D 專頁' },
  { id: 'endocrine', titleZh: '內分泌系統 3D 專頁' },
  { id: 'digestive', titleZh: '消化系統 3D 專頁' },
];

test.describe('Human Anatomy 3D Organ System Pages', () => {
  test('renders real anchor links, switches all 6 pages cleanly, and hides 3D labels by default', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#loading-overlay.fade-out', { state: 'attached', timeout: 25000 });

    // 1. All 6 system navigation links exist with proper ?page= hrefs
    for (const sys of SYSTEM_PAGES) {
      const link = page.locator(`a.system-page-tab[data-system-page="${sys.id}"]`);
      await expect(link).toHaveAttribute('href', new RegExp(`\\?page=${sys.id}`));
    }

    // 2. Verify all 6 dedicated system pages via SPA anchor clicks
    for (const sys of SYSTEM_PAGES) {
      if (sys.id !== 'nervous') {
        await page.click(`a.system-page-tab[data-system-page="${sys.id}"]`);
        await expect(page).toHaveURL(new RegExp(`\\?page=${sys.id}`));
      }
      await expect(page.locator('.brand-main-title')).toHaveText(sys.titleZh);
      await expect(page.locator('#callout-pins-toggle')).not.toBeChecked();
      if (sys.id === 'nervous') {
        await expect(page.locator('#brain-pins-toggle')).not.toBeChecked();
      }

      const visiblePins = await page.evaluate(() =>
        [...document.querySelectorAll('.brain-pin')].filter(el => !el.hidden && el.offsetParent !== null).length
      );
      expect(visiblePins, `${sys.id} default visible pins`).toBe(0);

      const canvas = page.locator('#stage canvas');
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      expect(box.width).toBeGreaterThan(300);
      expect(box.height).toBeGreaterThan(300);

      if (sys.id === 'urinary') {
        const sidebarText = await page.locator('#structure-hierarchy').textContent();
        expect(sidebarText).not.toMatch(/腎上腺|adrenal/i);
      }
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('supports direct ?page= routing, pin toggle ON/OFF, and bilingual EN/ZH switching', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    // Direct URL entry to Endocrine System
    await page.goto('/?page=endocrine', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#loading-overlay.fade-out', { state: 'attached', timeout: 25000 });
    await expect(page.locator('.brand-main-title')).toHaveText('內分泌系統 3D 專頁');

    // Toggle 3D pins ON -> >0, then OFF -> 0
    await page.click('#callout-pins-toggle');
    await page.waitForTimeout(300);
    const pinsOnCount = await page.evaluate(() =>
      [...document.querySelectorAll('.brain-pin')].filter(el => !el.hidden && el.offsetParent !== null).length
    );
    expect(pinsOnCount).toBeGreaterThan(0);

    await page.click('#callout-pins-toggle');
    const pinsOffCount = await page.evaluate(() =>
      [...document.querySelectorAll('.brain-pin')].filter(el => !el.hidden && el.offsetParent !== null).length
    );
    expect(pinsOffCount).toBe(0);

    // Switch to English via header toggle
    await Promise.all([
      page.waitForURL(/\?.*lang=en/),
      page.click('#language-toggle'),
    ]);
    await page.waitForSelector('#loading-overlay.fade-out', { state: 'attached', timeout: 25000 });
    await expect(page.locator('.brand-main-title')).toHaveText('3D Endocrine System');
    await expect(page.locator('#language-toggle')).toHaveText('中文');

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('toggles structure control panel visibility on desktop and mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#loading-overlay.fade-out', { state: 'attached', timeout: 25000 });

    const sidebar = page.locator('#neuro-sidebar');
    const toggleBtn = page.locator('#sidebar-toggle');
    const closeBtn = page.locator('#sidebar-close');

    // Desktop default: open
    await expect(sidebar).toHaveClass(/open/);
    await expect(sidebar).not.toHaveClass(/collapsed/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(toggleBtn).toHaveClass(/active/);

    // Toggle to hide
    await toggleBtn.click();
    await expect(sidebar).toHaveClass(/collapsed/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(toggleBtn).not.toHaveClass(/active/);

    // Toggle to show again
    await toggleBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    // Close via close button in panel header
    await closeBtn.click();
    await expect(sidebar).toHaveClass(/collapsed/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Mobile view test
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(sidebar).toHaveClass(/collapsed/);

    await toggleBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    await closeBtn.click();
    await expect(sidebar).toHaveClass(/collapsed/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });
});
