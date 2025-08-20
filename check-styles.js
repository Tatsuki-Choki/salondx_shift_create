import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the app to load
  await page.waitForTimeout(2000);
  
  // Take screenshots of different views
  console.log('Taking screenshots...');
  
  // Admin Dashboard
  await page.screenshot({ path: 'admin-dashboard.png', fullPage: false });
  console.log('✓ Admin dashboard screenshot saved');
  
  // Click on Staff Management
  const staffButton = await page.locator('button:has-text("スタッフ管理")').first();
  if (await staffButton.isVisible()) {
    await staffButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'staff-management.png', fullPage: false });
    console.log('✓ Staff management screenshot saved');
  }
  
  // Click on Shift Creation
  const shiftButton = await page.locator('button:has-text("シフト作成")').first();
  if (await shiftButton.isVisible()) {
    await shiftButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'shift-calendar.png', fullPage: false });
    console.log('✓ Shift calendar screenshot saved');
  }
  
  // Switch to Staff view
  const staffViewButton = await page.locator('button:has-text("スタッフ")').last();
  if (await staffViewButton.isVisible()) {
    await staffViewButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'staff-view.png', fullPage: false });
    console.log('✓ Staff view screenshot saved');
  }
  
  // Check styles
  console.log('\nChecking styles...');
  
  // Check if Tailwind styles are applied
  const bodyElement = await page.locator('body').first();
  const bgColor = await bodyElement.evaluate(el => window.getComputedStyle(el).backgroundColor);
  console.log(`Body background color: ${bgColor}`);
  
  // Check if main containers exist
  const hasMainContainer = await page.locator('.min-h-screen').count() > 0;
  console.log(`Main container with min-h-screen: ${hasMainContainer ? '✓' : '✗'}`);
  
  // Check if cards have proper styling
  const cards = await page.locator('.bg-white.rounded-lg').count();
  console.log(`Cards with proper styling found: ${cards}`);
  
  // Check if buttons have hover effects
  const buttons = await page.locator('button').count();
  console.log(`Total buttons found: ${buttons}`);
  
  // Check font family
  const fontFamily = await page.evaluate(() => {
    const body = document.querySelector('body');
    return window.getComputedStyle(body).fontFamily;
  });
  console.log(`Font family: ${fontFamily}`);
  
  // Check if responsive grid is working
  const grids = await page.locator('.grid').count();
  console.log(`Grid layouts found: ${grids}`);
  
  // Check shadow styles
  const shadowElements = await page.locator('.shadow-sm').count();
  console.log(`Elements with shadow-sm: ${shadowElements}`);
  
  await browser.close();
  
  console.log('\n✅ Style check complete! Screenshots saved in the project directory.');
})();