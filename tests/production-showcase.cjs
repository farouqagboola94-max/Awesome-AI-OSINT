const assert=require('node:assert/strict'),path=require('node:path');
const {startServer,chromium}=require('../design-templates/catalyst-awakening-comic/tests/lib/harness');
(async()=>{const site=await startServer(),browser=await chromium.launch();let checks=0;
 try{for(const spec of [{name:'desktop',viewport:{width:1440,height:1000}},{name:'phone viewport',viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
  const {name,...options}=spec,context=await browser.newContext({serviceWorkers:'block',...options}),page=await context.newPage();await page.route(/jsdelivr|unpkg|supabase|paystack|googleapis|gstatic/,r=>r.abort());const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(site.base+'/',{waitUntil:'load'});assert.ok(await page.locator('h1').count());assert.match(await page.locator('#read').innerText(),/150 scripted story pages/);assert.equal(await page.locator('#panel-i1').count(),0);assert.equal(await page.locator('#panel-i2').count(),0);assert.equal(await page.locator('#read .issue-panel').count(),0);checks+=5;
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);checks++;
  await page.goto(site.base+'/production-access.html');assert.ok(await page.locator('#production-login').isVisible());await page.locator('#email').fill('reader@example.invalid');await page.locator('#password').fill('fixture-only');await page.locator('#sign-in').click();assert.match(await page.locator('#access-status').innerText(),/unavailable/);checks+=2;
  assert.deepEqual(errors,[]);checks++;await context.close();
 }}finally{await browser.close();await site.stop();}
 console.log('PASS: '+checks+' public showcase and production sign-in checks across desktop and phone viewport emulation.');
})().catch(e=>{console.error(e);process.exit(1);});
