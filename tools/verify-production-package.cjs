/* Prevent a source-only Git build from removing the separately held artwork. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../design-templates/catalyst-awakening-comic/production-reader');
const manifest=path.join(root,'manifest.json');
if(!fs.existsSync(manifest))throw Error('Complete protected edition required. Assemble the privately supplied 150-page archive before deployment.');
const data=JSON.parse(fs.readFileSync(manifest,'utf8'));let count=0;
for(const issue of data.issues){
 assert.equal(issue.pages.filter(p=>p.isStory).length,150);
 assert.equal(new Set(issue.pages.map(p=>p.folioId)).size,issue.pages.length);
 for(const page of issue.pages){
  if(page.artReview)throw Error('Visual correction pending: Issue '+issue.number+' / '+page.folioId);
  if(!page.image)throw Error('Illustration missing: Issue '+issue.number+' / '+page.folioId);
  const target=path.resolve(root,page.image);assert.ok(target.startsWith(root+path.sep));assert.ok(fs.statSync(target).size>10000);count++;
 }
 assert.ok(fs.existsSync(path.resolve(root,issue.cover)));
}
assert.equal(count,302);console.log('PASS: 302 protected folios, two 150-story-page sequences, all artwork and covers present.');
