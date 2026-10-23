const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,devices}=require('playwright');
const SITE=path.resolve(__dirname,'../design-templates/catalyst-awakening-comic');
const data=JSON.parse(fs.readFileSync(SITE+'/production-reader/manifest.json','utf8'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel.endsWith('/'))rel+='index.html';
 if(rel==='/production-session.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end('/* Reader component test: auth is independently verified by production-access.test.mjs. */');return;}
 const p=path.resolve(SITE,'.'+rel);if(!p.startsWith(SITE+path.sep)||!fs.existsSync(p)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res);
});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch();let checks=0;const results=[];
 try{for(const spec of [{name:'desktop Chromium',viewport:{width:1440,height:1000}},{name:'phone emulation',...devices['Pixel 7']}]){
  const {name,...opts}=spec,ctx=await browser.newContext(opts),page=await ctx.newPage();await page.route(/cdn\.jsdelivr\.net/,r=>r.abort());const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/production-reader/',{waitUntil:'load'});await page.waitForSelector('#page-title');
  for(const issue of data.issues){await page.selectOption('#issue',String(issue.number));for(const p of issue.pages){await page.selectOption('#jump',String(p.number));const text=await page.locator('#page-position').innerText();assert.match(text,p.isStory?new RegExp('Story page '+p.storyNumber+' of 150'):/Front matter/);checks++;if(p.image){await page.locator('#art').evaluate(im=>im.complete?Promise.resolve():new Promise(r=>{im.onload=r;im.onerror=r;}));assert.ok(await page.locator('#art').evaluate(im=>im.naturalWidth>0),p.folioId);checks++;}}}
  await page.selectOption('#issue','1');await page.selectOption('#jump','1');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#jump').inputValue(),'2');checks++;
  await page.locator('#art-open').click();await page.locator('#zoom-in').click();assert.equal(await page.locator('#zoom-value').innerText(),'125%');await page.locator('#zoom-fit').click();assert.equal(await page.locator('#zoom-value').innerText(),'Fit');await page.locator('#art-close').click();checks+=2;
  await page.locator('#view-story').click();assert.ok(await page.locator('#story').isVisible());assert.ok((await page.locator('#story-content').innerText()).length>1000);checks++;
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'horizontal overflow');assert.deepEqual(errors,[]);checks+=2;
  results.push({surface:name,checks,authentication:'separate handler and database tests; no live account used',physical_device:false});await ctx.close();
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({status:'PASS',checks,results},null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1);});
