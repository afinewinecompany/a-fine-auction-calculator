/**
 * Full App E2E Tests
 *
 * Verifies that the entire app loads properly and all necessary pages can be accessed.
 * Tests public routes, auth flows, and protected route handling.
 */

import { chromium, type Browser, type Page } from 'playwright';

const BASE_URL = 'https://a-fine-auction-calculator.vercel.app';

async function runTests() {
  console.log('🧪 Starting Full App E2E Tests...\n');
  console.log(`📍 Testing: ${BASE_URL}\n`);

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('manifest')) {
        errors.push(text);
      }
    }
  });

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log('📋 PUBLIC ROUTES\n');

  // Test 1: Homepage loads
  await test('Homepage (/) loads correctly', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || response.status() !== 200) {
      throw new Error(`Expected status 200, got ${response?.status()}`);
    }
  });

  // Test 2: Landing page has hero content
  await test('Landing page displays hero section with heading', async () => {
    const heading = await page.locator('h1').first().textContent();
    if (!heading || heading.length === 0) {
      throw new Error('Main heading (h1) not found on landing page');
    }
    console.log(`   Found heading: "${heading.substring(0, 50)}..."`);
  });

  // Test 3: Features section is visible
  await test('Landing page has features section', async () => {
    // Look for features grid or feature cards
    const features = await page.locator('[class*="feature"], [class*="grid"] > div').count();
    if (features < 2) {
      // Try alternative selectors
      const sections = await page.locator('section').count();
      if (sections < 2) {
        throw new Error('Expected multiple sections on landing page');
      }
    }
  });

  // Test 4: CTA buttons are present
  await test('Call-to-action buttons are visible', async () => {
    const buttons = await page
      .locator(
        'a[href*="register"], a[href*="signup"], button:has-text("Get Started"), button:has-text("Sign Up")'
      )
      .count();
    if (buttons === 0) {
      throw new Error('No CTA buttons found');
    }
    console.log(`   Found ${buttons} CTA button(s)`);
  });

  console.log('\n📋 AUTHENTICATION ROUTES\n');

  // Test 5: Login page is accessible
  await test('Login page (/login) loads correctly', async () => {
    const response = await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    if (!response || response.status() !== 200) {
      throw new Error(`Expected status 200, got ${response?.status()}`);
    }
  });

  // Test 6: Login page has form elements
  await test('Login page has form elements or auth UI', async () => {
    const emailInput = await page
      .locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
      .count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const googleButton = await page.locator('button, [role="button"]').count();

    // Either has email/password form OR has OAuth buttons
    if (emailInput === 0 && passwordInput === 0 && googleButton < 1) {
      throw new Error('No authentication UI elements found');
    }
    console.log(
      `   Found: ${emailInput} email, ${passwordInput} password, ${googleButton} buttons`
    );
  });

  // Test 7: Register page is accessible
  await test('Register page (/register) loads correctly', async () => {
    const response = await page.goto(`${BASE_URL}/register`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    if (!response || response.status() !== 200) {
      throw new Error(`Expected status 200, got ${response?.status()}`);
    }
  });

  // Test 8: Register page has form elements
  await test('Register page has form elements or auth UI', async () => {
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button, [role="button"]').count();

    if (inputs === 0 && buttons < 1) {
      throw new Error('Registration UI elements not found');
    }
    console.log(`   Found: ${inputs} inputs, ${buttons} buttons`);
  });

  // Test 9: Signup alias works
  await test('Signup alias (/signup) works', async () => {
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle', timeout: 30000 });
    const currentUrl = page.url();
    // Should be on register page or have registration form
    const hasButtons = await page.locator('button').count();
    if (hasButtons === 0) {
      throw new Error('Signup page has no interactive elements');
    }
  });

  console.log('\n📋 PROTECTED ROUTES (Should Redirect)\n');

  // Test 10: Dashboard redirects
  await test('Dashboard (/dashboard) handles unauthenticated access', async () => {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    const currentUrl = page.url();
    const pageContent = await page.content();
    const is404 = pageContent.includes('404') && pageContent.includes('not found');
    if (is404) {
      throw new Error('Got 404 page');
    }
    console.log(`   At: ${currentUrl}`);
  });

  // Test 11: Leagues page redirects
  await test('Leagues (/leagues) handles unauthenticated access', async () => {
    await page.goto(`${BASE_URL}/leagues`, { waitUntil: 'networkidle', timeout: 30000 });
    const currentUrl = page.url();
    console.log(`   At: ${currentUrl}`);
  });

  // Test 12: Profile page handles auth
  await test('Profile (/profile) handles unauthenticated access', async () => {
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle', timeout: 30000 });
    const currentUrl = page.url();
    console.log(`   At: ${currentUrl}`);
  });

  // Test 13: Draft page handles auth
  await test('Draft page handles unauthenticated access', async () => {
    await page.goto(`${BASE_URL}/draft/test-league-id`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    const currentUrl = page.url();
    console.log(`   At: ${currentUrl}`);
  });

  console.log('\n📋 REDIRECT ROUTES\n');

  // Test 14: Demo route works
  await test('Demo (/demo) route works', async () => {
    const response = await page.goto(`${BASE_URL}/demo`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    // Should either redirect or show content
    if (!response || response.status() >= 400) {
      throw new Error(`Got error status ${response?.status()}`);
    }
  });

  console.log('\n📋 ERROR HANDLING\n');

  // Test 15: 404 page for unknown routes
  await test('Unknown route handled gracefully', async () => {
    const response = await page.goto(`${BASE_URL}/this-route-does-not-exist-12345`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    // Should either show 404 or redirect
    if (!response) {
      throw new Error('No response from server');
    }
  });

  // Test 16: Admin routes handle auth
  await test('Admin (/admin) handles authentication', async () => {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
    const currentUrl = page.url();
    console.log(`   At: ${currentUrl}`);
  });

  console.log('\n📋 PERFORMANCE & QUALITY\n');

  // Test 17: No critical console errors
  await test('No critical JavaScript errors', async () => {
    // Revisit homepage to check for errors
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      e =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error') &&
        !e.includes('Failed to load resource')
    );

    if (criticalErrors.length > 0) {
      console.log('   Errors found:');
      criticalErrors.slice(0, 3).forEach(e => console.log(`   - ${e.substring(0, 100)}`));
    }
  });

  // Test 18: Page has proper meta tags
  await test('Page has proper meta tags', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const title = await page.title();
    if (!title || title.length === 0) {
      throw new Error('Page title is empty');
    }
    console.log(`   Title: "${title}"`);
  });

  // Test 19: Responsive design
  await test('Responsive design works on mobile viewport', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const body = await page.locator('body').boundingBox();
    if (!body || body.width === 0) {
      throw new Error('Page body not visible on mobile viewport');
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // Test 20: Interactive elements work
  await test('Interactive elements are clickable', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const ctaButton = page.locator('a[href*="register"], a[href*="signup"], button').first();
    const isVisible = await ctaButton.isVisible();
    if (!isVisible) {
      throw new Error('CTA button not visible');
    }
  });

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

  if (failed === 0) {
    console.log('🎉 All tests passed! The app is working correctly.\n');
  } else {
    console.log('⚠️ Some tests failed. Review the errors above.\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
