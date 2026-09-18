import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

/** Include the real compiled entry/chunks/styles, not just public/ placeholders. */
export function pwaPrecache(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'gleason-offline-precache', apply: 'build',
    configResolved(value) { config = value; },
    closeBundle() {
      const directory = resolve(config.root, config.build.outDir);
      const walk = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap((entry): string[] =>
        entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)]);
      const files = walk(directory).filter((path) => !path.endsWith('.map') && !['sw.js', 'precache-manifest.json'].includes(relative(directory, path))).sort();
      const hash = createHash('sha256');
      for (const file of files) { hash.update(relative(directory, file)); hash.update(readFileSync(file)); }
      const version = JSON.parse(readFileSync(join(config.root, 'package.json'), 'utf8')).version;
      const cacheName = `gleason-shell-v${version}-${hash.digest('hex').slice(0, 16)}`;
      const urls = ['/', ...files.map((path) => `/${relative(directory, path).split('\\').join('/')}`)];
      const template = readFileSync(join(config.root, 'public/sw.js'), 'utf8');
      if (!template.includes('__PRECACHE_MANIFEST__')) throw new Error('Missing service worker precache placeholder');
      writeFileSync(join(directory, 'sw.js'), template.replace('__PRECACHE_MANIFEST__', JSON.stringify({ cacheName, urls })));
      writeFileSync(join(directory, 'precache-manifest.json'), JSON.stringify({ cacheName, urls }, null, 2));
    },
  };
}
