/**
 * Screenshot and visual check of the homepage
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://a-fine-auction-calculator.vercel.app';

async function checkHomepage() {
  console.log('📸 Taking screenshots of the app...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport to desktop
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Homepage
  console.log('1. Loading homepage...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'e2e/screenshots/homepage-desktop.png', fullPage: true });
  console.log('   Screenshot saved: e2e/screenshots/homepage-desktop.png');

  // Get page structure
  console.log('\n📋 Page Structure Analysis:\n');

  // Check hero section
  const h1Text = await page.locator('h1').first().textContent();
  console.log(`Hero H1: "${h1Text}"`);

  const h2Text = await page.locator('h2').first().textContent();
  console.log(`Hero H2: "${h2Text}"`);

  // Check sections
  const sections = await page.locator('section').count();
  console.log(`Sections found: ${sections}`);

  // Check for common layout issues
  const body = await page.locator('body').boundingBox();
  console.log(`Body width: ${body?.width}px, height: ${body?.height}px`);

  // Check for horizontal scroll (layout issue indicator)
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Has horizontal scroll (layout issue): ${hasHorizontalScroll}`);

  // Check main content areas
  const mainContent = await page.locator('main, [role="main"], .container').count();
  console.log(`Main content containers: ${mainContent}`);

  // Check for broken images
  const images = await page.locator('img').all();
  let brokenImages = 0;
  for (const img of images) {
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    if (naturalWidth === 0) brokenImages++;
  }
  console.log(`Images: ${images.length} total, ${brokenImages} broken`);

  // Check CSS classes on key elements
  const heroSection = await page.locator('section').first();
  const heroClasses = await heroSection.getAttribute('class');
  console.log(`\nHero section classes: ${heroClasses}`);

  // Check for any visible error messages
  const errorElements = await page.locator('[class*="error"], [class*="Error"], .text-red').count();
  console.log(`Error elements visible: ${errorElements}`);

  // Check navigation
  const navLinks = await page.locator('nav a, header a').count();
  console.log(`Navigation links: ${navLinks}`);

  // Check buttons styling
  const buttons = await page.locator('button, a[href*="register"]').all();
  console.log(`\nButtons found: ${buttons.length}`);
  for (let i = 0; i < Math.min(buttons.length, 5); i++) {
    const btn = buttons[i];
    const text = await btn.textContent();
    const classes = await btn.getAttribute('class');
    console.log(`  Button ${i + 1}: "${text?.trim()}" - classes: ${classes?.substring(0, 80)}...`);
  }

  // Mobile view
  console.log('\n📱 Mobile view check...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'e2e/screenshots/homepage-mobile.png', fullPage: true });
  console.log('   Screenshot saved: e2e/screenshots/homepage-mobile.png');

  // Check mobile layout
  const mobileHasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Mobile has horizontal scroll: ${mobileHasHorizontalScroll}`);

  await browser.close();
  console.log('\n✅ Screenshot check complete!');
}

checkHomepage().catch(console.error);
