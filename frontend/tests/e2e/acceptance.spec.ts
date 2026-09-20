import { test as base, expect, type Page } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

type Servers = { url: string; stop: () => Promise<void> };
const test = base.extend<{ servers: Servers }>({
  servers: async ({}, use) => {
    const temporary = await mkdtemp(join(tmpdir(), 'gleason-test-only-'));
    const backend = spawn(resolve('../backend/.venv/bin/python'), [resolve('../scripts/e2e_backend.py'), '--database', join(temporary,'test-only.db')], { stdio: ['ignore','pipe','pipe'] });
    let logs=''; backend.stderr.on('data', data=>{logs+=data});
    const dist=resolve('dist');
    const server=createServer(async(req,res)=>{
      try {
        const pathname=new URL(req.url??'/', 'http://localhost').pathname;
        const file=resolve(dist, '.'+(pathname==='/'?'/index.html':pathname));
        if(!file.startsWith(dist+'/')){res.writeHead(403).end();return;}
        const content=await readFile(file);
        const extension=file.split('.').pop()??'';
        const types:Record<string,string>={html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',webmanifest:'application/manifest+json',png:'image/png'};
        res.setHeader('Content-Type',types[extension]??'application/octet-stream');
        res.setHeader('Cache-Control','no-store');res.end(content);
      }catch{res.writeHead(404).end();}
    });
    server.listen(0,'127.0.0.1');await once(server,'listening');
    let stopped=false;
    const stop=async()=>{
      if(stopped)return;stopped=true;
      const close=new Promise<void>(done=>server.close(()=>done()));server.closeAllConnections();await close;
      if(backend.exitCode===null){backend.kill('SIGTERM');await once(backend,'exit');}
    };
    try {
      await expect.poll(async()=>{
        if(backend.exitCode!==null)throw new Error(logs);
        try{return (await fetch('http://127.0.0.1:8000/api/v1/health')).status;}catch{return 0;}
      },{timeout:30000}).toBe(200);
      const address=server.address();if(!address||typeof address==='string')throw new Error('No test server port');
      await use({url:`http://127.0.0.1:${address.port}`,stop});
    }finally{await stop();await rm(temporary,{recursive:true,force:true});}
  },
});

async function english(page:Page,url:string){await page.goto(url);await page.getByRole('button',{name:'English',exact:true}).click();}
async function locate(page:Page,name:string){
  await page.getByRole('textbox',{name:'Search query'}).fill(name);
  await page.getByRole('button',{name:'Search',exact:true}).click();
  const result=page.locator('.search-result').filter({has:page.getByText(name,{exact:true})});
  await result.getByRole('button',{name:'Locate on models'}).click();
  await expect(page.locator('.place-provenance')).toContainText(name);
}
const captureA=(page:Page)=>page.getByRole('button',{name:'Use current point as start'}).click();
const captureB=(page:Page)=>page.getByRole('button',{name:'Use current point as end'}).click();
const calculate=(page:Page)=>page.getByRole('button',{name:'Calculate distance & bearings'}).click();

test('projection markers stay inside map viewports for Arabic and English search in RTL and LTR',async({page,servers})=>{
  await page.goto(servers.url);
  for(const locale of ['ar','en']){
    if(locale==='en')await page.getByRole('button',{name:'English',exact:true}).click();
    for(const query of ['TEST Doha','اختبار الدوحة']){
      await page.getByRole('textbox',{name:locale==='ar'?'نص البحث':'Search query'}).fill(query);
      await page.getByRole('button',{name:locale==='ar'?'بحث':'Search',exact:true}).click();
      await page.getByRole('button',{name:locale==='ar'?'اعرض على النماذج':'Locate on models',exact:true}).click();
      for(const card of await page.locator('.projection-card').all()){
        const map=card.locator('.projection-map');await map.scrollIntoViewIfNeeded();
        await expect(card).toHaveAttribute('data-selected-latitude','25.285447');
        await expect.poll(async()=>{
          const m=await map.boundingBox(),p=await card.locator('.projection-selection-marker').boundingBox();
          return Boolean(m&&p&&p.x>=m.x&&p.y>=m.y&&p.x+p.width<=m.x+m.width&&p.y+p.height<=m.y+m.height);
        }).toBe(true);
        await expect(card.locator('.projection-selection-marker')).toBeInViewport();
      }
    }
  }
});

test('WGS84 renders an opaque shaded ellipsoid surface before overlays',async({page,servers})=>{
  await page.addInitScript(()=>{
    const draw=WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays=function(mode,first,count){
      draw.call(this,mode,first,count);
      if(mode===this.TRIANGLES && count>1000){
        const pixel=new Uint8Array(4);
        this.readPixels(Math.floor(this.drawingBufferWidth*.53),Math.floor(this.drawingBufferHeight*.54),1,1,this.RGBA,this.UNSIGNED_BYTE,pixel);
        (window as unknown as {surfacePixel:number[]}).surfacePixel=Array.from(pixel);
      }
    };
  });
  await english(page,servers.url);
  await expect(page.locator('.reference-card')).toHaveAttribute('data-mode','webgl3d');
  await expect.poll(()=>page.evaluate(()=>{
    const p=(window as unknown as {surfacePixel?:number[]}).surfacePixel;
    return Boolean(p&&p[3]===255&&p[1]>35&&p[2]>60);
  })).toBe(true);
  await locate(page,'TEST Doha');
  await expect(page.locator('.reference-focus-dot')).toBeVisible();
  await page.screenshot({path:'test-results/opaque-globe-and-markers.png',fullPage:true});
});

test('one production install supports cold navigation and calculations with both servers stopped',async({page,context,servers})=>{
  await english(page,servers.url);
  await locate(page,'TEST Doha');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect.poll(()=>page.locator('.globe-layer-controls small').textContent()).toContain('3');
  const precached=await page.evaluate(async()=>{const keys=await caches.keys();const cache=await caches.open(keys.find(k=>k.startsWith('gleason-shell-'))!);return (await cache.keys()).map(r=>r.url);});
  expect(precached.some(url=>url.endsWith('.js'))).toBe(true);
  expect(precached.some(url=>url.endsWith('.css'))).toBe(true);
  await context.setOffline(true);await servers.stop();
  const offline=await context.newPage();await page.close();
  await english(offline,servers.url);
  await locate(offline,'TEST Doha');await captureA(offline);
  await expect(offline.locator('.projection-selection-readout')).toHaveCount(2);
  await expect(offline.locator('.projection-selection-readout').first()).toContainText('25.285447');
  await expect(offline.locator('.place-provenance')).toContainText('TEST_ONLY_SYNTHETIC_POINT');
  await expect(offline.locator('.place-provenance')).toContainText('test-v1');
  await locate(offline,'TEST Amman');await captureB(offline);await calculate(offline);
  await expect(offline.locator('.geodesic-result')).toContainText('1692.602 km');
  await expect(offline.locator('.geodesic-provenance')).toContainText('geographiclib-geodesic (browser)');
  await offline.getByText('ECEF coordinates',{exact:true}).click();
  await expect(offline.locator('.reference-readout details')).toContainText('EPSG:4978');
  await offline.screenshot({path:'test-results/offline-reference.png',fullPage:true});
});

test('selected marker follows geography, remains pickable off-center and hides behind the globe',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');
  await expect(page.locator('.reference-card')).toHaveAttribute('data-mode','webgl3d');
  const canvas=page.locator('canvas.reference-globe');await canvas.scrollIntoViewIfNeeded();
  const bounds=(await canvas.boundingBox())!;
  const marker=page.locator('.reference-focus-dot');const before=(await marker.boundingBox())!;
  const x=bounds.x+bounds.width*.25,y=bounds.y+bounds.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+60,y,{steps:12});await page.mouse.up();
  await expect.poll(async()=>Math.abs((await marker.boundingBox())!.x-before.x)).toBeGreaterThan(20);
  const moved=(await marker.boundingBox())!;
  await page.mouse.click(moved.x+moved.width/2,moved.y+moved.height/2);
  await expect.poll(async()=>Number((await page.locator('.reference-readout').textContent())!.match(/Lat ([\d.-]+)/)![1])).toBeCloseTo(25.285447,2);
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+Math.PI/.008,y,{steps:30});await page.mouse.up();
  await expect(marker).toHaveCount(0);
});

test('mobile layer controls work with keyboard, persist, and use readable labels',async({page,servers})=>{
  await page.setViewportSize({width:390,height:844});await english(page,servers.url);
  const panel=page.locator('.globe-layer-controls');await expect(panel).toBeVisible();
  const cities=page.getByRole('checkbox',{name:'Cities',exact:true});await cities.focus();await page.keyboard.press('Space');await expect(cities).not.toBeChecked();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await expect.poll(()=>page.locator('.reference-globe-label').count()).toBeGreaterThan(0);
  const sizes=await page.locator('.reference-globe-label').evaluateAll(nodes=>nodes.map(n=>parseFloat(getComputedStyle(n).fontSize)));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await page.screenshot({path:'test-results/mobile-layers.png',fullPage:true});
  await page.reload();await page.getByRole('button',{name:'English',exact:true}).click();await expect(cities).not.toBeChecked();
  await panel.locator('summary').click();await expect(cities).not.toBeVisible();
  await panel.locator('summary').focus();await page.keyboard.press('Enter');await expect(cities).toBeVisible();
});

test('a newly saved region refreshes globe data immediately without reloading',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');
  await page.getByRole('checkbox',{name:'Saved-pack airports'}).check();
  await expect(page.locator('.globe-layer-controls small')).toContainText('3');
  await page.getByRole('button',{name:'Save QA offline'}).click();
  await expect(page.locator('.phase3-search')).toContainText('QA saved for offline use');
  await expect(page.locator('.globe-layer-controls small')).toContainText('4');
});

test('recapturing B invalidates an in-flight result for the previous pair',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');await captureA(page);
  await locate(page,'TEST Amman');await captureB(page);
  let release!:()=>void,started!:()=>void;
  const hold=new Promise<void>(resolve=>{release=resolve});const began=new Promise<void>(resolve=>{started=resolve});
  let calls=0;
  await page.route('**/reference/wgs84/geodesic-inverse',async route=>{
    if(calls++===0){started();await hold;}
    await route.fulfill({response:await route.fetch()});
  });
  await calculate(page);await began;
  await locate(page,'TEST Doha');await captureB(page);
  const completed=page.waitForResponse(response=>response.url().endsWith('/geodesic-inverse'));
  release();await completed;
  await expect(page.locator('.geodesic-result')).toHaveCount(0);
  await calculate(page);await expect(page.locator('.geodesic-result')).toContainText('0.000 km');
  await expect(page.locator('.geodesic-provenance')).toContainText('pyproj');
});

test('WebGL-disabled fallback remains selectable and readable',async({page,servers})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(String(type).startsWith('webgl'))return null;
      return original.apply(this,[type,...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await english(page,servers.url);await expect(page.locator('.reference-card')).toHaveAttribute('data-mode','fallback2d');
  const svg=page.locator('.reference-fallback svg');await svg.scrollIntoViewIfNeeded();const box=(await svg.boundingBox())!;
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await expect(page.locator('.reference-readout')).toContainText('Lat 0.000000°');
  await expect(page.locator('.reference-readout')).toContainText('Lon 0.000000°');
  await expect(page.locator('.projection-selection-readout').first()).toContainText('Lat 0.000000°');
  await expect(page.locator('.projection-selection-readout').last()).toContainText('Lon 0.000000°');
  await expect.poll(()=>page.locator('.reference-map-label').count()).toBeGreaterThan(0);
});

test('search and all model picks synchronize markers once while cameras and language changes do not select',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');
  const shell=page.locator('.app-shell');
  await expect(shell).toHaveAttribute('data-selection-revision','1');
  const cards=page.locator('.projection-card');
  await expect(cards).toHaveCount(2);
  for(const card of await cards.all()){
    await expect(card).toHaveAttribute('data-selected-latitude','25.285447');
    await expect(card.locator('.projection-selection-readout')).toContainText('TEST Doha');
    await expect(card.locator('.projection-selection-marker')).toBeVisible();
  }
  const yaw=await page.locator('.reference-card').getAttribute('data-view-yaw');
  const pitch=await page.locator('.reference-card').getAttribute('data-view-pitch');
  let revision=1;
  for(const model of ['gleason','ae']){
    const card=page.locator(`.projection-card[data-model="${model}"]`);
    const map=card.locator('.projection-map');await map.scrollIntoViewIfNeeded();
    const box=(await map.boundingBox())!;
    const click={x:box.x+box.width/2+30,y:box.y+box.height/2+25};
    await page.mouse.click(click.x,click.y);
    await expect(shell).toHaveAttribute('data-selection-revision',String(++revision));
    await expect(page.locator('.place-provenance')).toHaveCount(0);
    await expect(page.locator('.reference-card')).toHaveAttribute('data-view-yaw',yaw!);
    await expect(page.locator('.reference-card')).toHaveAttribute('data-view-pitch',pitch!);
    const lat=await card.getAttribute('data-selected-latitude');
    const lon=await card.getAttribute('data-selected-longitude');
    for(const view of await page.locator('.projection-card, .reference-card').all()){
      await expect(view).toHaveAttribute('data-selected-latitude',lat!);
      await expect(view).toHaveAttribute('data-selected-longitude',lon!);
    }
    // Marker is actually projected onto the clicked geographic point, not only a text update.
    await expect.poll(async()=>{const marker=(await card.locator('.projection-selection-marker').boundingBox())!;return Math.hypot(marker.x+marker.width/2-click.x,marker.y+marker.height/2-click.y)}).toBeLessThan(2);
  }
  const canvas=page.locator('canvas.reference-globe');await canvas.scrollIntoViewIfNeeded();
  const box=(await canvas.boundingBox())!;
  await page.mouse.click(box.x+box.width/2+20,box.y+box.height/2);
  await expect(shell).toHaveAttribute('data-selection-revision',String(++revision));
  const lat=await page.locator('.reference-card').getAttribute('data-selected-latitude');
  for(const card of await cards.all())await expect(card).toHaveAttribute('data-selected-latitude',lat!);
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2,{steps:10});await page.mouse.up();
  await expect(shell).toHaveAttribute('data-selection-revision',String(revision));
  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await expect(shell).toHaveAttribute('data-selection-revision',String(revision));
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  for(const card of await cards.all())await expect(card).toHaveAttribute('data-selected-latitude',lat!);
});

test('shared selection retains search provenance and clears it on each model free pick',async({page,servers})=>{
  await english(page,servers.url);
  for (const [index,model] of ['gleason','ae'].entries()) {
    await locate(page,'TEST Doha');
    await expect(page.locator('.place-provenance')).toContainText('test-v1');
    const map=page.locator('.projection-map').nth(index);
    await map.scrollIntoViewIfNeeded();
    const box=(await map.boundingBox())!;
    await page.mouse.click(box.x+box.width/2+20,box.y+box.height/2+20);
    await expect(page.locator('.inspector .metric').first()).toContainText(model);
    await expect(page.locator('.place-provenance')).toHaveCount(0);
    await expect(page.locator('.search-result.selected')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Use current point as start'})).toBeEnabled();
  }
  await locate(page,'TEST Doha');
  const globe=page.locator('canvas.reference-globe');await globe.scrollIntoViewIfNeeded();
  const box=(await globe.boundingBox())!;
  await page.mouse.click(box.x+box.width/2+30,box.y+box.height/2);
  await expect(page.locator('.place-provenance')).toHaveCount(0);
  await expect(page.locator('.inspector .metric').first()).toContainText('wgs84');
  await expect(page.getByRole('button',{name:'Use current point as start'})).toBeEnabled();
  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(page.locator('.inspector')).toContainText('المفتش الجغرافي');
  await expect(page.locator('.place-provenance')).toHaveCount(0);
});


test('P5.4 model laboratory explains meaning before optional technical details',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');
  const lab=page.locator('.model-laboratory');await expect(lab).toBeVisible();
  await expect(lab.locator('.model-lab-card')).toHaveCount(3);
  await expect(lab).toContainText('One geographic point → three independent representations');
  await expect(lab).toContainText('They are not distances between cities');

  const gleason=lab.locator('.model-lab-card[data-model="gleason"]');
  const ae=lab.locator('.model-lab-card[data-model="ae"]');
  const wgs84=lab.locator('.model-lab-card[data-model="wgs84"]');

  await expect(gleason).toHaveAttribute('data-status','available');
  await expect(gleason.locator('.model-lab-meaning')).toContainText('Point position in the Gleason model');
  await expect(gleason.locator('.model-lab-meaning')).toContainText('not metres or kilometres');
  await expect(gleason.locator('.model-lab-result')).toContainText('normalized-radius');

  await expect(ae).toHaveAttribute('data-status','available');
  await expect(ae.locator('.model-lab-meaning')).toContainText('Azimuthal Equidistant projection');
  await expect(ae.locator('.model-lab-meaning')).toContainText('not a distance to another city');
  await expect(ae.locator('.model-lab-result')).toContainText('metre');

  await expect(wgs84).toHaveAttribute('data-status','unavailable');
  await expect(wgs84.locator('.model-lab-meaning')).toContainText('three-dimensional coordinates are unavailable');
  await expect(wgs84.locator('.model-lab-meaning')).toContainText('did not silently assume a 0 m height');
  await expect(wgs84.locator('.model-lab-result')).toContainText('height-required');

  const technical=gleason.locator('details.model-lab-technical');
  await expect(technical).not.toHaveAttribute('open','');
  await technical.locator('summary').click();
  await expect(technical).toHaveAttribute('open','');
  await expect(technical).toContainText('GH-0.2.0');
  await expect(technical).toContainText('COMPUTED_RESULT');
  await expect(technical).toContainText('DERIVED');
  await expect(technical).toContainText('gleason-1893-upload-v1');

  await expect(lab).toContainText('Ellipsoidal height: Unknown');
  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(lab).toContainText('نفس النقطة الجغرافية ← ثلاث طرق مستقلة لتمثيلها');
  await expect(gleason.locator('.model-lab-meaning')).toContainText('موقع النقطة على نموذج Gleason');
  await expect(wgs84.locator('.model-lab-meaning')).toContainText('لم يفترض البرنامج ارتفاعًا وهميًا يساوي 0 متر');
  await expect(lab).toContainText('إظهار التفاصيل التقنية');

  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});


test('P5.5 comparability contract rejects incompatible model quantities without normalization',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');
  const panel=page.locator('.model-comparability');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.model-comparison-card')).toHaveCount(3);
  await expect(panel).toContainText('Similar numbers');
  await expect(panel).toContainText('same unit');
  await expect(panel.locator('[data-comparison-status="comparable"]')).toHaveCount(0);

  const gleasonAe=panel.locator('[data-comparison-pair="gleason-ae"]');
  await expect(gleasonAe).toHaveAttribute('data-comparison-status','not-comparable');
  await expect(gleasonAe).toHaveAttribute('data-conversion-applied','false');
  await expect(gleasonAe).toHaveAttribute('data-reasons',/different-units/);
  await expect(gleasonAe).toHaveAttribute('data-reasons',/undefined-cross-model-scale/);
  await expect(gleasonAe).toContainText('normalized-radius');
  await expect(gleasonAe).toContainText('metres or kilometres');

  const aeWgs=panel.locator('[data-comparison-pair="ae-wgs84"]');
  await expect(aeWgs).toHaveAttribute('data-comparison-status','not-comparable');
  await expect(aeWgs).toHaveAttribute('data-conversion-applied','false');
  await expect(aeWgs).toHaveAttribute('data-reasons',/different-meaning/);
  await expect(aeWgs).toContainText('planar coordinates are not the same quantity as 3D ECEF coordinates');

  await expect(panel).toContainText('No conversion or normalization was applied between models.');
  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(panel).toContainText('عقد قابلية المقارنة');
  await expect(panel).toContainText('لا يكفي تشابه الأرقام');
  await expect(panel).toContainText('لا توجد قاعدة مقياس موثقة');
  await expect(panel).toContainText('لم يُطبّق أي تحويل أو تطبيع بين النماذج.');

  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});


test('P5.6 navigation stays camera-local and preserves geographic selection',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');
  const shell=page.locator('.app-shell');
  await expect(shell).toHaveAttribute('data-selection-revision','1');

  const gleason=page.locator('.projection-card[data-model="gleason"]');
  const ae=page.locator('.projection-card[data-model="ae"]');
  const gToolbar=gleason.locator('.navigation-toolbar');
  const aToolbar=ae.locator('.navigation-toolbar');
  const gZoom0=Number(await gleason.getAttribute('data-view-zoom'));
  const aZoom0=await ae.getAttribute('data-view-zoom');
  const globe=page.locator('.reference-card');
  const globeZoom0=await globe.getAttribute('data-view-zoom');
  const globeYaw0=await globe.getAttribute('data-view-yaw');

  await gToolbar.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect.poll(async()=>Number(await gleason.getAttribute('data-view-zoom'))).toBeGreaterThan(gZoom0);
  await expect(ae).toHaveAttribute('data-view-zoom',aZoom0!);
  await expect(globe).toHaveAttribute('data-view-zoom',globeZoom0!);
  await expect(shell).toHaveAttribute('data-selection-revision','1');

  const rotation0=Number(await gleason.getAttribute('data-view-rotation'));
  await gToolbar.getByRole('button',{name:'Rotate right',exact:true}).click();
  await expect.poll(async()=>Number(await gleason.getAttribute('data-view-rotation'))).not.toBe(rotation0);
  await expect(globe).toHaveAttribute('data-view-yaw',globeYaw0!);
  await expect(shell).toHaveAttribute('data-selection-revision','1');

  await gToolbar.getByRole('button',{name:'Focus selected',exact:true}).click();
  await expect(shell).toHaveAttribute('data-selection-revision','1');

  const gMap=gleason.locator('.projection-map');await gMap.scrollIntoViewIfNeeded();
  const gBox=(await gMap.boundingBox())!;
  await gToolbar.getByRole('button',{name:'Zoom to area',exact:true}).click();
  await expect(gleason).toHaveAttribute('data-area-mode','true');
  const areaZoom0=Number(await gleason.getAttribute('data-view-zoom'));
  await page.mouse.move(gBox.x+gBox.width*.3,gBox.y+gBox.height*.3);
  await page.mouse.down();
  await page.mouse.move(gBox.x+gBox.width*.7,gBox.y+gBox.height*.7,{steps:12});
  await page.mouse.up();
  await expect.poll(async()=>Number(await gleason.getAttribute('data-view-zoom'))).toBeGreaterThan(areaZoom0);
  await expect(shell).toHaveAttribute('data-selection-revision','1');
  await gToolbar.getByRole('button',{name:'Zoom to area',exact:true}).click();
  await expect(gleason).toHaveAttribute('data-area-mode','false');

  const wheelZoom0=Number(await ae.getAttribute('data-view-zoom'));
  const aMap=ae.locator('.projection-map');await aMap.scrollIntoViewIfNeeded();
  const aBox=(await aMap.boundingBox())!;
  await page.mouse.move(aBox.x+aBox.width/2,aBox.y+aBox.height/2);
  await page.mouse.wheel(0,-700);
  await expect.poll(async()=>Number(await ae.getAttribute('data-view-zoom'))).toBeGreaterThan(wheelZoom0);
  await expect(shell).toHaveAttribute('data-selection-revision','1');

  const refToolbar=globe.locator('.reference-navigation-toolbar');
  const refZoom0=Number(await globe.getAttribute('data-view-zoom'));
  await refToolbar.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect.poll(async()=>Number(await globe.getAttribute('data-view-zoom'))).toBeGreaterThan(refZoom0);
  const yaw0=Number(await globe.getAttribute('data-view-yaw'));
  await refToolbar.getByRole('button',{name:'Rotate right',exact:true}).click();
  await expect.poll(async()=>Number(await globe.getAttribute('data-view-yaw'))).not.toBe(yaw0);
  const pitch0=Number(await globe.getAttribute('data-view-pitch'));
  await refToolbar.getByRole('button',{name:'Tilt up',exact:true}).click();
  await expect.poll(async()=>Number(await globe.getAttribute('data-view-pitch'))).toBeGreaterThan(pitch0);
  await expect(shell).toHaveAttribute('data-selection-revision','1');

  await refToolbar.getByRole('button',{name:'Focus selected',exact:true}).click();
  await expect(shell).toHaveAttribute('data-selection-revision','1');
  const canvas=globe.locator('canvas.reference-globe');await canvas.scrollIntoViewIfNeeded();
  const marker=globe.locator('.reference-focus-dot');await expect(marker).toBeVisible();
  const markerBox=(await marker.boundingBox())!;
  await page.mouse.click(markerBox.x+markerBox.width/2,markerBox.y+markerBox.height/2);
  await expect(shell).toHaveAttribute('data-selection-revision','2');
  await expect.poll(async()=>Number(await globe.getAttribute('data-selected-latitude'))).toBeCloseTo(25.285447,3);

  const beforeAreaRevision=await shell.getAttribute('data-selection-revision');
  const canvasBox=(await canvas.boundingBox())!;
  await refToolbar.getByRole('button',{name:'Zoom to area',exact:true}).click();
  await expect(globe).toHaveAttribute('data-area-mode','true');
  const refAreaZoom0=Number(await globe.getAttribute('data-view-zoom'));
  await page.mouse.move(canvasBox.x+canvasBox.width*.38,canvasBox.y+canvasBox.height*.38);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x+canvasBox.width*.62,canvasBox.y+canvasBox.height*.62,{steps:10});
  await page.mouse.up();
  await expect(globe).toHaveAttribute('data-area-mode','false');
  await expect.poll(async()=>Number(await globe.getAttribute('data-view-zoom'))).toBeGreaterThan(refAreaZoom0);
  await expect(shell).toHaveAttribute('data-selection-revision',beforeAreaRevision!);

  const refWheel0=Number(await globe.getAttribute('data-view-zoom'));
  await canvas.hover();
  await page.mouse.wheel(0,600);
  await expect.poll(async()=>Number(await globe.getAttribute('data-view-zoom'))).toBeLessThan(refWheel0);
  await expect(shell).toHaveAttribute('data-selection-revision',beforeAreaRevision!);

  await gToolbar.getByRole('button',{name:'Fit full model',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(shell).toHaveAttribute('data-selection-revision',beforeAreaRevision!);

  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(gleason.locator('.navigation-toolbar').getByRole('button',{name:'تكبير إلى منطقة',exact:true})).toBeVisible();
  await expect(globe.locator('.reference-navigation-toolbar').getByRole('button',{name:'التركيز على المحدد',exact:true})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('P5.6 WGS84 fallback exposes zoom/focus while declaring 3D rotation unavailable',async({page,servers})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(String(type).startsWith('webgl'))return null;
      return original.apply(this,[type,...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await english(page,servers.url);await locate(page,'TEST Doha');
  const shell=page.locator('.app-shell');
  const globe=page.locator('.reference-card[data-mode="fallback2d"]');
  const toolbar=globe.locator('.reference-navigation-toolbar');
  await expect(toolbar.getByRole('button',{name:'Rotate left',exact:true})).toBeDisabled();
  await expect(toolbar.getByRole('button',{name:'Tilt up',exact:true})).toBeDisabled();
  const zoom0=Number(await globe.getAttribute('data-view-zoom'));
  await toolbar.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect.poll(async()=>Number(await globe.getAttribute('data-view-zoom'))).toBeGreaterThan(zoom0);
  await toolbar.getByRole('button',{name:'Focus selected',exact:true}).click();
  await expect(shell).toHaveAttribute('data-selection-revision','1');
  await toolbar.getByRole('button',{name:'Fit full model',exact:true}).click();
  await expect(globe).toHaveAttribute('data-view-zoom','1.0000');
  await expect(shell).toHaveAttribute('data-selection-revision','1');
});


test('P5.7 blocks heterogeneous differences and exposes future services as unavailable',async({page,servers})=>{
  await english(page,servers.url);await locate(page,'TEST Doha');
  const lab=page.locator('.model-laboratory');
  const comparison=lab.locator('.model-comparability');
  const differenceBlocks=comparison.locator('.model-comparison-difference');
  await expect(differenceBlocks).toHaveCount(3);
  await expect(comparison.locator('[data-difference-status="available"]')).toHaveCount(0);
  await expect(comparison.locator('[data-difference-status="blocked"]')).toHaveCount(3);
  await expect(comparison).toContainText('No numeric difference is shown because the quantities are not homogeneous');
  await expect(lab).toContainText('intentionally shows no numeric cross-model difference');

  const future=lab.locator('.future-contracts');
  await expect(future).toBeVisible();
  await expect(future.locator('.future-contract-card')).toHaveCount(3);
  await expect(future.locator('[data-service-status="unavailable"]')).toHaveCount(3);
  await expect(future.locator('[data-future-service="time"]')).toContainText('phases 9–10');
  await expect(future.locator('[data-future-service="layer-sync"]')).toContainText('phase 16');
  await expect(future.locator('[data-future-service="route"]')).toContainText('Planned phase: 6');
  await expect(future.locator('[data-future-service="route"]')).toContainText('P6.3 implements WGS84 geodesic ruler/distance');
  await expect(future.locator('[data-future-service="route"]')).toContainText('route drawing/provider paths');

  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(comparison).toContainText('لا يُعرض فرق عددي لأن الكميتين غير متجانستين');
  await expect(future).toContainText('عقود الخدمات المستقبلية');
  await expect(future.locator('[data-future-service="route"]')).toContainText('P6.3');
  await expect(future.locator('[data-service-status="unavailable"]')).toHaveCount(3);

  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});


test('P5.8 restores installed-pack identity offline and discards malformed state',async({page,context,servers})=>{
  await english(page,servers.url);
  await locate(page,'TEST Doha');
  const shell=page.locator('.app-shell');
  await expect(shell).toHaveAttribute('data-selection-revision','1');

  await expect.poll(()=>page.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open('gleason-platform',1);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    try{
      return await new Promise<string|null>((resolve,reject)=>{
        const tx=db.transaction('key-value','readonly');
        const req=tx.objectStore('key-value').get('phase5-shared-state-v1');
        req.onsuccess=()=>resolve(req.result?.selection?.kind??null);
        req.onerror=()=>reject(req.error);
      });
    }finally{db.close();}
  })).toBe('place');

  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await servers.stop();

  const restored=await context.newPage();
  await page.close();
  await english(restored,servers.url);
  const restoredShell=restored.locator('.app-shell');
  await expect(restoredShell).toHaveAttribute('data-persistence-status','restored-place');
  await expect(restoredShell).toHaveAttribute('data-selection-revision','0');
  await expect(restored.locator('.place-provenance')).toContainText('TEST Doha');
  await expect(restored.locator('.place-provenance')).toContainText('TEST_ONLY_SYNTHETIC_POINT');
  await expect(restored.locator('.persistence-status')).toContainText('Place restored from an installed local pack.');
  await expect(restored.locator('.reference-focus-dot')).toBeVisible();

  await restored.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open('gleason-platform',1);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    try{
      await new Promise<void>((resolve,reject)=>{
        const tx=db.transaction('key-value','readwrite');
        tx.objectStore('key-value').put({schemaVersion:1,selection:{kind:'place'}},'phase5-shared-state-v1');
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
      });
    }finally{db.close();}
  });
  await restored.reload();
  await expect(restored.locator('.app-shell')).toHaveAttribute('data-persistence-status','discarded-invalid');
  await expect(restored.locator('.place-provenance')).toHaveCount(0);
  // Locale is intentionally not part of P5.8 shared-state persistence, so a
  // full reload returns to the app default Arabic locale. Switch explicitly
  // before asserting the English explanation.
  await restored.getByRole('button',{name:'English',exact:true}).click();
  await expect(restored.locator('.persistence-status')).toContainText('Malformed or invalid local state was ignored.');
});


test('P5.9 phase regression covers polar and antimeridian selections with visible provenance and boundaries',async({page,servers})=>{
  await english(page,servers.url);
  const fixtures=[
    ['TEST North East Edge',89.5,179.9],
    ['TEST North West Edge',89.5,-179.9],
    ['TEST South East Edge',-89.5,179.9],
    ['TEST South West Edge',-89.5,-179.9],
  ] as const;

  for(const [name,latitude,longitude] of fixtures){
    await locate(page,name);
    const cards=page.locator('.projection-card');
    await expect(cards).toHaveCount(2);
    for(const card of await cards.all()){
      await expect(card).toHaveAttribute('data-selected-latitude',String(latitude));
      await expect(card).toHaveAttribute('data-selected-longitude',String(longitude));
    }
    const globe=page.locator('.reference-card');
    await expect(globe).toHaveAttribute('data-selected-latitude',String(latitude));
    await expect(globe).toHaveAttribute('data-selected-longitude',String(longitude));
    await expect(globe.locator('.reference-navigation-toolbar').getByRole('button',{name:'Focus selected',exact:true})).toBeEnabled();

    const provenance=page.locator('.place-provenance');
    await expect(provenance).toContainText(name);
    await expect(provenance).toContainText('test-v1');
    await expect(provenance).toContainText('TEST_ONLY_SYNTHETIC_POINT');

    const lab=page.locator('.model-laboratory');
    await expect(lab.locator('.model-lab-card')).toHaveCount(3);
    await expect(lab).toContainText('normalized-radius');
    await expect(lab.locator('[data-service-status="unavailable"]')).toHaveCount(3);
    await expect(lab.locator('[data-difference-status="available"]')).toHaveCount(0);
  }

  // Source evidence remains visible and distinct from place-source provenance.
  const technical=page.locator('details.model-lab-technical');
  await technical.nth(0).locator('summary').click();
  await expect(technical.nth(0)).toContainText('gleason-1893-upload-v1');
  await technical.nth(2).locator('summary').click();
  await expect(technical.nth(2)).toContainText('PROJ/proj4js');

  // The final Phase 5 regression package explicitly checks bilingual/mobile state.
  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.inspector')).toContainText('المفتش الجغرافي');
  await expect(page.locator('.place-provenance')).toContainText('test-v1');
  await expect(page.locator('.future-contracts')).toContainText('غير متاح');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});


test('P6.2 direct-map mode appends picks from all three models and supports more than three points',async({page,servers})=>{
  await english(page,servers.url);
  const panel=page.locator('.ordered-route-panel');
  await expect(panel).toHaveAttribute('data-route-max-points','50');

  await locate(page,'TEST Doha');
  await panel.getByRole('button',{name:'Add current point',exact:true}).click();
  await panel.getByRole('button',{name:'Add points directly on maps',exact:true}).click();
  await expect(panel).toHaveAttribute('data-map-add-mode','true');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-route-map-add-mode','true');

  const gleasonMap=page.locator('.projection-card[data-model="gleason"] .projection-map');
  await gleasonMap.scrollIntoViewIfNeeded();
  const gBox=(await gleasonMap.boundingBox())!;
  await page.mouse.click(gBox.x+gBox.width*.52,gBox.y+gBox.height*.48);
  await expect(panel).toHaveAttribute('data-route-point-count','2');

  const aeMap=page.locator('.projection-card[data-model="ae"] .projection-map');
  await aeMap.scrollIntoViewIfNeeded();
  const aBox=(await aeMap.boundingBox())!;
  await page.mouse.click(aBox.x+aBox.width*.48,aBox.y+aBox.height*.52);
  await expect(panel).toHaveAttribute('data-route-point-count','3');

  const globe=page.locator('.reference-card');
  const canvas=globe.locator('canvas.reference-globe');
  await canvas.scrollIntoViewIfNeeded();
  const cBox=(await canvas.boundingBox())!;
  await page.mouse.click(cBox.x+cBox.width*.5,cBox.y+cBox.height*.5);
  await expect(panel).toHaveAttribute('data-route-point-count','4');
  await expect(panel).toHaveAttribute('data-route-segment-count','3');
  await expect(panel.locator('.ordered-route-point')).toHaveCount(4);
  await expect(panel.locator('.ordered-route-point').nth(1)).toHaveAttribute('data-source-model','gleason');
  await expect(panel.locator('.ordered-route-point').nth(2)).toHaveAttribute('data-source-model','ae');
  await expect(panel.locator('.ordered-route-point').nth(3)).toHaveAttribute('data-source-model','wgs84');
  await expect(panel).toContainText('4 / 50');
  await expect(panel.locator('.ordered-route-segments')).toHaveAttribute('data-has-numeric-measurement','false');

  await panel.getByRole('button',{name:'Add points directly on maps',exact:true}).click();
  await expect(panel).toHaveAttribute('data-map-add-mode','false');
});

test('P6.2 ordered route state supports edit/undo/clear and remains transient across reload',async({page,servers})=>{
  await english(page,servers.url);
  const panel=page.locator('.ordered-route-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-route-point-count','0');
  await expect(panel).toHaveAttribute('data-route-persistent','false');
  await expect(panel.locator('.ordered-route-segments')).toHaveAttribute('data-has-numeric-measurement','false');

  await locate(page,'TEST Doha');
  await panel.getByRole('button',{name:'Add current point',exact:true}).click();
  await locate(page,'TEST Amman');
  await panel.getByRole('button',{name:'Add current point',exact:true}).click();

  await expect(panel).toHaveAttribute('data-route-point-count','2');
  await expect(panel).toHaveAttribute('data-route-segment-count','1');
  await expect(panel.locator('.ordered-route-point')).toHaveCount(2);
  await expect(panel.locator('.ordered-route-point').nth(0)).toContainText('TEST Doha');
  await expect(panel.locator('.ordered-route-point').nth(1)).toContainText('TEST Amman');
  await expect(panel.locator('.ordered-route-segment')).toHaveText('A → B');
  await expect(panel).toContainText('P6.2 keeps segment identity only');

  await panel.getByRole('button',{name:'Move A down',exact:true}).click();
  await expect(panel.locator('.ordered-route-point').nth(0)).toContainText('TEST Amman');
  await expect(panel.locator('.ordered-route-point').nth(1)).toContainText('TEST Doha');

  await panel.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(panel.locator('.ordered-route-point').nth(0)).toContainText('TEST Doha');
  await expect(panel.locator('.ordered-route-point').nth(1)).toContainText('TEST Amman');

  await panel.getByRole('button',{name:'Remove B',exact:true}).click();
  await expect(panel).toHaveAttribute('data-route-point-count','1');
  await panel.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(panel).toHaveAttribute('data-route-point-count','2');

  await panel.getByRole('button',{name:'Clear route',exact:true}).click();
  await expect(panel).toHaveAttribute('data-route-point-count','0');
  await panel.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(panel).toHaveAttribute('data-route-point-count','2');

  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(panel).toContainText('المسار المرتب');
  await expect(panel).toContainText('تظهر مسافة WGS84 العددية في لوحة P6.3 المنفصلة.');
  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);

  await page.reload();
  const restoredPanel=page.locator('.ordered-route-panel');
  await expect(restoredPanel).toHaveAttribute('data-route-point-count','0');
  await expect(restoredPanel).toHaveAttribute('data-route-persistent','false');
});


test('P6.3 WGS84 ruler reports live segment and open-polyline totals with explicit identity',async({page,servers})=>{
  await english(page,servers.url);
  const panel=page.locator('.ordered-route-panel');
  const ruler=page.locator('.wgs84-route-distance-panel');

  await expect(ruler).toHaveAttribute('data-measurement-status','idle');
  await expect(ruler).toHaveAttribute('data-measurement-method','wgs84-geodesic');
  await expect(ruler).toHaveAttribute('data-measurement-unit','metre');

  await locate(page,'TEST Doha');
  await panel.getByRole('button',{name:'Add current point',exact:true}).click();
  await locate(page,'TEST Amman');
  await panel.getByRole('button',{name:'Add current point',exact:true}).click();

  await expect(ruler).toHaveAttribute('data-measurement-status','ready');
  await expect(ruler).toHaveAttribute('data-route-segment-count','1');
  await expect(ruler.locator('.wgs84-route-distance-segment')).toHaveCount(1);
  for(const view of await page.locator('.reference-card,.projection-card').all()){
    await expect(view).toHaveAttribute('data-route-guide','visual-only');
    await expect(view).toHaveAttribute('data-route-guide-points','2');
    await expect(view).toHaveAttribute('data-route-guide-segments','1');
  }
  await expect(ruler.locator('[data-route-guide-semantics="visual-only"]')).toContainText('visual guide');
  await expect(ruler).toContainText('wgs84-geodesic');
  await expect(ruler).toContainText('open-polyline');
  await expect(ruler).toContainText('wgs84-ellipsoid');
  await expect(ruler.locator('.wgs84-route-distance-provenance')).toContainText(/pyproj|geographiclib-geodesic/);
  const twoPointTotal=Number(await ruler.getAttribute('data-route-distance-m'));
  expect(twoPointTotal).toBeGreaterThan(0);

  await locate(page,'TEST North East Edge');
  await panel.getByRole('button',{name:'Add current point',exact:true}).click();
  await expect(ruler).toHaveAttribute('data-measurement-status','ready');
  await expect(ruler).toHaveAttribute('data-route-segment-count','2');
  await expect(ruler.locator('.wgs84-route-distance-segment')).toHaveCount(2);
  for(const view of await page.locator('.reference-card,.projection-card').all()){
    await expect(view).toHaveAttribute('data-route-guide-points','3');
    await expect(view).toHaveAttribute('data-route-guide-segments','2');
  }
  const threePointTotal=Number(await ruler.getAttribute('data-route-distance-m'));
  expect(threePointTotal).toBeGreaterThan(twoPointTotal);

  await panel.getByRole('button',{name:'Move C up',exact:true}).click();
  await expect(ruler.locator('.wgs84-route-distance-segment').first()).toHaveAttribute(
    'data-route-segment-id',
    'route-segment:route-point-1->route-point-3',
  );
  await expect(ruler).toHaveAttribute('data-measurement-status','ready');
  await expect(ruler).toHaveAttribute('data-route-segment-count','2');

  await page.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(ruler).toContainText('مسطرة ومسافة WGS84');
  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
