"""Package private source outside Git into the protected URL namespace."""
import json,re,shutil,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'design-templates/catalyst-awakening-comic'
def build(source):
 source=Path(source).resolve();target=SITE/'production-reader';target.mkdir(exist_ok=True)
 data=json.loads((source/'reader/manifest.json').read_text())
 for issue in data['issues']:
  assert sum(p['isStory'] for p in issue['pages'])==150
  for page in issue['pages']:
   if page['image']:
    original=(source/'reader'/page['image']).resolve();assert original.is_relative_to(source)
    relative=Path('folio-art')/f'issue{issue["number"]:02}'/(page['folioId']+original.suffix)
    dest=target/relative;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(original,dest);page['image']=relative.as_posix()
  # Cover paths are separately remapped into the same protected namespace.
  def remap(value):
   if isinstance(value,dict):
    for k,v in list(value.items()):
     if k in ('image','src') and isinstance(v,str) and v:
      origin=(source/'reader'/v).resolve()
      if origin.is_file() and origin.is_relative_to(source):
       rel=Path('covers')/f'issue{issue["number"]:02}'/origin.name;out=target/rel;out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(origin,out);value[k]=rel.as_posix()
     else:remap(v)
   elif isinstance(value,list):
    for v in value:remap(v)
  if isinstance(issue.get('cover'),str):
   original=(source/'reader'/issue['cover']).resolve();assert original.is_file() and original.is_relative_to(source)
   rel=Path('covers')/f'issue{issue["number"]:02}'/original.name;dest=target/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(original,dest);issue['cover']=rel.as_posix()
  else:remap(issue.get('cover',{}))
 html=(source/'reader/reader-source/index.template.html').read_text()
 html=html.replace("connect-src 'none'","connect-src 'self' https://oxnpmgbwwsjfseirfxej.supabase.co")
 html=html.replace("script-src 'self'","script-src 'self' https://cdn.jsdelivr.net")
 html=html.replace('</head>','<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js" defer></script><script src="/production-session.js" defer></script></head>')
 html=html.replace('LOCAL EDITORIAL PROOF','PROTECTED PRODUCTION REVIEW')
 html=html.replace('</header>','<button id="production-sign-out">Sign out</button></header>',1)
 html=html.replace('This local proof has no sign-in or deployment protection; do not publish it to a public static host.','Production access is checked on every page and image request. This is a work in progress awaiting final art, lettering and device review.')
 html=html.replace('{{DATA}}',json.dumps(data,ensure_ascii=False).replace('</','<\\/'))
 (target/'index.html').write_text(html);(target/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
 for name in ['reader.js','reader-core.js','reader.css']:shutil.copy2(source/'reader'/name,target/name)
 fonts=source/'reader/assets/fonts'
 if fonts.exists():shutil.copytree(fonts,target/'assets/fonts',dirs_exist_ok=True)
 print(json.dumps(dict(assembly_folios=sum(len(i['pages']) for i in data['issues']),images=sum(bool(p['image']) for i in data['issues'] for p in i['pages']))))
if __name__=='__main__':build(sys.argv[1])
