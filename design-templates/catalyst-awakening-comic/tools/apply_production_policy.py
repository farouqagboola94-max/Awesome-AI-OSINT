"""Apply the approved showcase/production boundary after page generation."""
import json,re,sys
from html.parser import HTMLParser
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
class Bounds(HTMLParser):
 def __init__(self,text,target):
  super().__init__(convert_charrefs=False);self.text=text;self.target=target;self.depth=0;self.start=None;self.end=None;self.lines=[0]
  for m in re.finditer('\n',text):self.lines.append(m.end())
 def position(self):
  line,col=self.getpos();return self.lines[line-1]+col
 def handle_starttag(self,tag,attrs):
  if tag=='section':
   if self.depth:self.depth+=1
   elif dict(attrs).get('id')==self.target:self.start=self.position();self.depth=1
 def handle_endtag(self,tag):
  if tag=='section' and self.depth:
   self.depth-=1
   if not self.depth:self.end=self.position()+len('</section>')
def replace_section(text,id,replacement):
 p=Bounds(text,id);p.feed(text)
 if p.start is None:return text
 assert p.end is not None
 return text[:p.start]+replacement+text[p.end:]

TEASER='''<section id="read" style="padding:6rem max(24px,8vw);background:#0c121c;color:#f3edde"><p>CATALYST · THE AWAKENING</p><h2>Two stories. One locked plot.</h2><p>Issue 01: Awaken, O City and Issue 02: Ṣàngó’s Daughter each contain 150 scripted story pages. Illustration, lettering and release review are in progress.</p><p>The earlier 88/86-page editions are archived production drafts. They are not the current release editions.</p><p><a href="/production-access.html" style="color:#edba53">Approved reviewers: open the protected production reader →</a></p><p>Explore the characters and approved artwork on this public showcase while production continues.</p></section>'''

def apply():
 p=ROOT/'index.html';s=Path(sys.argv[1]).read_text() if len(sys.argv)>1 else p.read_text();s=replace_section(s,'read',TEASER)
 s=replace_section(s,'comics','''<section id="comics" style="padding:5rem max(24px,8vw);background:#101721;color:#f3edde"><p>THE CURRENT EDITIONS</p><h2>Production is in progress</h2><p>Issue 01 · Awaken, O City · 150 story pages scripted</p><p>Issue 02 · Ṣàngó’s Daughter · 150 story pages scripted</p><p>Artwork and lettering are under review. Public release follows completion of the protected-reader, device and print checks.</p><a href="#read" style="color:#edba53">See production status →</a></section>''')
 s=re.sub(r'Issue #01 features an 88-page unified storyboard, Issue #02 Arranged Review v1 in active development','Issues #01 and #02 each have 150 scripted story pages with artwork and lettering in development',s)
 s=s.replace('zero-data offline reading of all 88 pages &amp; soundscapes','approved public previews and soundscapes. Production editions require approved online access')
 s=s.replace('Issue #1 — Out Now','Issue #1 — In Production').replace('4</div>\n          <div class="label">Issues Released','0</div>\n          <div class="label">Issues Released')
 s=re.sub(r'(<div class="num">)4(</div>\s*<div[^>]*>ISSUES RELEASED)',r'\g<1>0\2',s,flags=re.I)
 s=s.replace('READ ISSUE #1','PRODUCTION STATUS').replace('Read Issue #1','Production status')
 s=s.replace('Neo-Lagos, 2047.','Lagos. The current story calendar is under editorial review.')
 def structured(m):
  def clean(value):
   if isinstance(value,dict):
    result={k:clean(v) for k,v in value.items() if k!='datePublished'}
    if result.get('@type')=='ComicIssue' and str(result.get('issueNumber')) in ('1','2'):
     result['isAccessibleForFree']=False
     result['creativeWorkStatus']='InProduction'
    return result
   if isinstance(value,list):return [clean(v) for v in value]
   return value
  try:return m.group(1)+json.dumps(clean(json.loads(m.group(2).replace("\\'","'"))),ensure_ascii=False)+m.group(3)
  except json.JSONDecodeError:return m.group(0)
 s=re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)',structured,s,flags=re.S)
 p.write_text('\n'.join(line.rstrip() for line in s.splitlines())+'\n')
 # No private proof navigation or bytes are kept by the service worker.
 sw=ROOT/'sw.js';s=sw.read_text()
 s=re.sub(r"const CACHE = '[^']+';","const CACHE = 'catalyst-protected-production-v1';",s)
 s=s.replace("path.startsWith('/private/') || /^\\/read\\/issue-1-(comic|book)(?:\\.html)?$/.test(path)","path.startsWith('/private/') || path.startsWith('/production-') || path.startsWith('/read/issue-1') || path.startsWith('/read/issue-2') || path.startsWith('/script-studio')")
 # Retire all old document/image caches once, including old proof responses.
 s=s.replace("if (key !== CACHE && key !== IMG_CACHE)","if (key !== CACHE)")
 sw.write_text(s)
 info={'release':'Protected production candidate','date':'2026-10-23','showcase':'public','production_reader':'approved accounts only','issues':{'1':{'story_pages':150,'release_status':'in production'},'2':{'story_pages':150,'release_status':'in production'}},'historical_web_drafts':{'1':88,'2':86},'real_device_qa':'pending','live_deployment':'pending'}
 (ROOT/'production-release.json').write_text(json.dumps(info,ensure_ascii=False,indent=2))
 print('Applied public showcase and protected production labels; old editions retained as drafts.')
if __name__=='__main__':apply()
