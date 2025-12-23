import fs from 'fs';
import path from 'path';
import url from 'url';

// ESM equivalent of __dirname
const currentFilePath = url.fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const { readFileSync, existsSync } = fs;
const { resolve } = path;

describe('Vercel Deployment Configuration', () => {
  const projectRoot = resolve(currentDirPath, '../..');
  const vercelConfigPath = resolve(projectRoot, 'vercel.json');

  test('vercel.json file exists', () => {
    expect(existsSync(vercelConfigPath)).toBe(true);
  });

  test('vercel.json is valid JSON', () => {
    const content = readFileSync(vercelConfigPath, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  test('vercel.json contains rewrites for SPA routing', () => {
    const content = readFileSync(vercelConfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config.rewrites).toBeDefined();
    expect(Array.isArray(config.rewrites)).toBe(true);
    expect(config.rewrites.length).toBeGreaterThan(0);

    // Check for catch-all rewrite to index.html for SPA routing
    const hasIndexRewrite = config.rewrites.some(
      (rewrite: { source: string; destination: string }) =>
        rewrite.source === '/(.*)' && rewrite.destination === '/index.html'
    );
    expect(hasIndexRewrite).toBe(true);
  });

  test('package.json has correct build command', () => {
    const packageJsonPath = resolve(projectRoot, 'package.json');
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts.build).toBeDefined();
    expect(packageJson.scripts.build).toContain('vite build');
  });

  test('vite.config.ts exists', () => {
    const viteConfigPath = resolve(projectRoot, 'vite.config.ts');
    expect(existsSync(viteConfigPath)).toBe(true);
  });

  test('dist directory is configured as build output', () => {
    const viteConfigPath = resolve(projectRoot, 'vite.config.ts');
    const content = readFileSync(viteConfigPath, 'utf-8');

    // Check that dist is the default or explicitly configured output directory
    // By default, Vite uses 'dist' but we verify it's not overridden to something else
    const hasCustomOutDir = content.includes("outDir: '") && !content.includes("outDir: 'dist'");
    expect(hasCustomOutDir).toBe(false);
  });
});

describe('Build Output Validation', () => {
  test('build script is defined in package.json', () => {
    const packageJsonPath = resolve(currentDirPath, '../..', 'package.json');
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    expect(packageJson.scripts.build).toBe('tsc -b && vite build');
  });

  test('preview script is defined for local testing', () => {
    const packageJsonPath = resolve(currentDirPath, '../..', 'package.json');
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    expect(packageJson.scripts.preview).toBeDefined();
    expect(packageJson.scripts.preview).toContain('vite preview');
  });
});

describe('React Router Configuration', () => {
  test('index.html exists in public or root', () => {
    const projectRoot = resolve(currentDirPath, '../..');
    const indexHtmlPath = resolve(projectRoot, 'index.html');

    expect(existsSync(indexHtmlPath)).toBe(true);
  });

  test('index.html contains root div for React mounting', () => {
    const projectRoot = resolve(currentDirPath, '../..');
    const indexHtmlPath = resolve(projectRoot, 'index.html');
    const content = readFileSync(indexHtmlPath, 'utf-8');

    expect(content).toContain('id="root"');
  });
});
