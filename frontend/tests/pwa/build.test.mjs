import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../../dist/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('precache-manifest.json',root),'utf8'));
const source=await readFile(new URL('sw.js',root),'utf8');

test('first install precaches every compiled script and stylesheet plus offline shell',async()=>{
  assert.match(manifest.cacheName,/^gleason-shell-v\d+\.\d+\.\d+-[0-9a-f]{16}$/);
  const html=await readFile(new URL('index.html',root),'utf8');
  for(const [,url] of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) assert.ok(manifest.urls.includes(url),url);
  assert.ok(manifest.urls.some(url=>url.endsWith('.js')));
  assert.ok(manifest.urls.some(url=>url.endsWith('.css')));
  assert.ok(manifest.urls.includes('/'));
  assert.ok(manifest.urls.includes('/offline-packs/core-world-v1.json'));
  for(const url of manifest.urls) assert.ok((await stat(new URL(url==='/'?'index.html':url.slice(1),root))).size>0);
  assert.ok(!source.includes('__PRECACHE_MANIFEST__'));
});

test('offline navigation and assets use the installed cache; activation preserves unrelated caches',async()=>{
  const handlers={},saved=new Map(),deleted=[];
  const cache={addAll:async urls=>{for(const url of urls)saved.set(url,{url})},match:async request=>saved.get(typeof request==='string'?request:new URL(request.url).pathname)};
  const self={location:{origin:'https://test.invalid'},clients:{claim:async()=>{}},addEventListener:(type,fn)=>{handlers[type]=fn}};
  vm.runInNewContext(source,{self,URL,caches:{open:async()=>cache,keys:async()=>['unrelated-cache','gleason-shell-old',manifest.cacheName],delete:async key=>{deleted.push(key)}},fetch:async()=>{throw new TypeError('Test-only offline network')}});
  let pending;
  handlers.install({waitUntil:p=>{pending=p}});await pending;
  handlers.activate({waitUntil:p=>{pending=p}});await pending;
  assert.deepEqual(deleted,['gleason-shell-old']);
  handlers.fetch({request:{method:'GET',url:'https://test.invalid/route',mode:'navigate'},respondWith:p=>{pending=p}});
  assert.equal((await pending).url,'/');
  const asset=manifest.urls.find(url=>url.endsWith('.js'));
  handlers.fetch({request:{method:'GET',url:`https://test.invalid${asset}`,mode:'cors'},respondWith:p=>{pending=p}});
  assert.equal((await pending).url,asset);
  let intercepted=false;
  handlers.fetch({request:{method:'GET',url:'https://test.invalid/api/v1/search'},respondWith:()=>{intercepted=true}});
  assert.equal(intercepted,false);
});
