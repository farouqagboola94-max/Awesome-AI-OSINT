(function (root) {
  'use strict';
  const PAGE_FIELDS = {purpose:'Page purpose',pacing:'Pacing and emotional beat',layout:'Page layout',turn:'Page-turn or transition'};
  const PANEL_FIELDS = {size:'Panel size and layout',shot:'Shot and camera angle',setting:'Location and background',characters:'Positions and expressions',action:'Visible action / staging',sfx:'Sound effects',lighting:'Lighting and colour',transition:'Transition to next panel'};
  const IMAGE_FIELDS = {focus:'Visual priority',reference:'Approved artwork or continuity reference',artDirection:'Image-specific direction',status:'Production status'};
  const IMAGE_RULES = ['Create one clean comic-art image for this panel group.','Use only the source evidence and production notes below. Do not add characters, events, injuries, powers, props, locations or time changes.','Keep Bayo Adeyemi and the existing Lagos Noir visual language consistent with approved Catalyst artwork.','Do not render dialogue, captions, sound effects, logos, watermarks or readable text into the image. Lettering is applied separately.','If the source contains several drawable moments, produce a storyboard thumbnail sheet or split it into consecutive images before final art.'];
  const clean = value => String(value || '').replace(/\s+/gu,' ').trim();
  const plain = node => clean(node ? node.textContent : '');
  const make = (doc, tag, className, text) => {const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  function fingerprint(value) {
    let a=2166136261,b=5381;
    for(let i=0;i<value.length;i++){a=Math.imul(a^value.charCodeAt(i),16777619);b=Math.imul(b,33)^value.charCodeAt(i);}
    return (a>>>0).toString(16)+'-'+(b>>>0).toString(16)+'-'+value.length;
  }
  function readIssues(doc) {
    const issues=[];
    for(let number=1;number<=4;number++) {
      const region=doc.getElementById('panel-i'+number);
      if(!region)throw new Error('Published issue '+number+' was not found.');
      const chapters=Array.from(region.querySelectorAll('.story-chapter'));
      if(!chapters.length)throw new Error('The published story structure has changed.');
      const issue={id:'i'+number,number,title:plain(region.querySelector('.reader-issue-title')),art:'../assets/cover-issue'+number+'.webp',sourcePageLabel:plain(region.querySelector('.reader-pages')),sequences:[],pages:[],cliffhanger:plain(region.querySelector('.cliffhanger-text')),cliffhangerLabel:plain(region.querySelector('.cliffhanger-label'))};
      chapters.forEach((chapter,sIndex)=>{
        const sequence={id:issue.id+'-s'+(sIndex+1),title:plain(chapter.querySelector('.chapter-title')),label:plain(chapter.querySelector('.chapter-label')),blocks:[],panels:[]};
        Array.from(chapter.children).forEach(child=>{
          if(child.classList.contains('chapter-label')||child.classList.contains('chapter-title'))return;
          const text=plain(child);if(!text)return;
          let block;
          if(child.classList.contains('panel-dialogue')) {
            block={kind:'dialogue',speaker:plain(child.querySelector('.speaker')),text:plain(child.querySelector('.speech-bubble'))};
          } else if(child.classList.contains('ase-activation-box')) {
            block={kind:'system',text:Array.from(child.children).map(plain).filter(Boolean).join('\n')};
          } else {
            block={kind:child.classList.contains('panel-narration')?'narration':'prose',text};
          }
          if(!block.text)throw new Error('A source block could not be read.');
          block.id=sequence.id+'-b'+(sequence.blocks.length+1);
          sequence.blocks.push(block);
          // A narrative/visual source beat starts a group. Its following lettering stays attached.
          if(!sequence.panels.length||block.kind==='prose'||block.kind==='narration')sequence.panels.push({id:sequence.id+'-p'+(sequence.panels.length+1),blocks:[]});
          sequence.panels[sequence.panels.length-1].blocks.push(block);
        });
        if(!sequence.blocks.length)throw new Error('An empty source sequence was found.');
        for(let index=0;index<sequence.panels.length;index+=4) {
          const panels=sequence.panels.slice(index,index+4);
          issue.pages.push({id:sequence.id+'-w'+(index/4+1),number:issue.pages.length+1,sequence:sequence.id,title:sequence.title,label:sequence.label,part:index/4+1,panels});
        }
        issue.sequences.push(sequence);
      });
      issue.signature=fingerprint(JSON.stringify({title:issue.title,sequences:issue.sequences.map(s=>({title:s.title,label:s.label,blocks:s.blocks})),cliffhanger:issue.cliffhanger,cliffhangerLabel:issue.cliffhangerLabel}));
      issues.push(issue);
    }
    return issues;
  }
  function storyText(issue) {
    const lines=[issue.title,''];
    issue.sequences.forEach(s=>{lines.push(s.label,s.title,'');s.blocks.forEach(b=>lines.push(b.speaker?b.speaker+'\n'+b.text:b.text,''));});
    lines.push(issue.cliffhangerLabel,issue.cliffhanger);
    return lines.join('\n');
  }
  function validNotes(issue,input) {
    if(!input||input.schemaVersion!==1||input.issue!==issue.id||input.sourceSignature!==issue.signature)throw new Error('This backup belongs to a different issue or source version. The story has not been changed.');
    if(!input.notes||typeof input.notes!=='object'||Array.isArray(input.notes))throw new Error('This is not a notes backup.');
    const allowed=new Map();
    issue.pages.forEach(p=>{allowed.set(p.id,PAGE_FIELDS);p.panels.forEach(panel=>allowed.set(panel.id,{...PANEL_FIELDS,...IMAGE_FIELDS}));});
    const result=Object.create(null);
    if(Object.keys(input.notes).length>allowed.size)throw new Error('The backup contains unexpected notes.');
    for(const [id,values] of Object.entries(input.notes)) {
      const fields=allowed.get(id);
      if(!fields||!values||typeof values!=='object'||Array.isArray(values))throw new Error('The backup contains an unrecognized page or panel.');
      result[id]=Object.create(null);
      for(const [key,value] of Object.entries(values)) {
        if(!Object.prototype.hasOwnProperty.call(fields,key)||typeof value!=='string'||value.length>6000)throw new Error('The backup contains an invalid production note.');
        result[id][key]=value;
      }
    }
    return result;
  }
  function notesLines(id,fields,notes) {
    return Object.entries(fields).map(([key,label])=>label+': '+((notes[id]&&notes[id][key])||'[Not specified]'));
  }
  function imagePrompt(issue,page,panel,panelNumber,notes={}) {
    const direction=notes[panel.id]||{};
    const source=panel.blocks.map(block=>block.kind==='dialogue'?(block.speaker+' '+block.text):block.text).join('\n');
    return ['CATALYST: THE AWAKENING — IMAGE PRODUCTION BRIEF','Issue '+issue.number+' / Working page '+page.number+' / Panel group '+panelNumber,'Source sequence: '+page.label,'','IMAGE RULES',...IMAGE_RULES,'','SOURCE EVIDENCE — preserve this event exactly',source,'','PANEL DIRECTION','Panel size and layout: '+(direction.size||'[Not specified]'),'Shot and camera angle: '+(direction.shot||'[Not specified]'),'Location and background: '+(direction.setting||'[Not specified]'),'Character positions and expressions: '+(direction.characters||'[Not specified]'),'Visible action / staging: '+(direction.action||'[Not specified]'),'Lighting and colour: '+(direction.lighting||'[Not specified]'),'Visual priority: '+(direction.focus||'[Not specified]'),'Approved artwork or continuity reference: '+(direction.reference||'[Not specified]'),'Image-specific direction: '+(direction.artDirection||'[Not specified]'),'Production status: '+(direction.status||'Brief only'),'','CONTINUITY CHECK','Match only the published story source. Flag an ambiguity for review instead of inventing a visual fact.'].join('\n');
  }
  function exportImagePrompts(issue,notes={}) {
    const lines=['# Catalyst: The Awakening','# Issue '+issue.number+': '+issue.title,'','## Image production prompt pack','Every prompt is grounded in the existing published source. These are production briefs, not story revisions.',''];
    issue.pages.forEach(page=>{lines.push('## WORKING PAGE '+page.number+': '+page.title,'');page.panels.forEach((panel,index)=>lines.push('### PANEL GROUP '+(index+1),'',imagePrompt(issue,page,panel,index+1,notes),''));});
    return lines.join('\n');
  }
  function exportScript(issue,notes={}) {
    const lines=['# Catalyst: The Awakening','# Issue '+issue.number+': '+issue.title,'','Working page and panel plan. Original story wording and order preserved. Working page numbers are not final print pagination.','Production directions are separate annotations; unspecified directions have not been invented.','','Source fingerprint: '+issue.signature,''];
    issue.pages.forEach(p=>{
      lines.push('## WORKING PAGE '+p.number+': '+p.title,'Source: '+p.label,'',...notesLines(p.id,PAGE_FIELDS,notes),'');
      p.panels.forEach((panel,index)=>{
        lines.push('### PANEL GROUP '+(index+1),'');
        panel.blocks.forEach(b=>{lines.push(b.kind==='dialogue'?b.speaker:b.kind==='system'?'SYSTEM LETTERING (original)':b.kind==='narration'?'NARRATION / VISUAL SOURCE (original)':'STORY SOURCE (original)',b.text,'');});
        lines.push('Production directions:',...notesLines(panel.id,PANEL_FIELDS,notes),'');
      });
    });
    lines.push('## ORIGINAL ISSUE ENDING',issue.cliffhangerLabel,issue.cliffhanger,'','## CONTINUITY REVIEW','- Original blocks remain in source order.','- No names, dialogue, events, powers or issue endings have been rewritten.','- Resolve multi-action source groups into drawn panels before final lettering.','- Review page turns and speech-balloon density without changing story wording.');
    return lines.join('\n');
  }
  function writingPrompt(issue,options) {
    return ['You are the comic production writer and storyboard director for Catalyst: The Awakening.','Apply a page-by-page, panel-by-panel script framework to the supplied Bayo Adeyemi story. Change presentation and production directions only.','',
      'NON-NEGOTIABLE STORY PRESERVATION',
      '- Keep Bayo Adeyemi as the protagonist. Use only this supplied continuity.',
      '- Preserve every supplied word of dialogue, narration, system lettering and story text, in its original order. Do not paraphrase, shorten, polish slang, add speeches, remove text or invent an ending.',
      '- Preserve characters, ages, relationships, locations, powers, numbers, costs, event order and mysteries. Do not import other Catalyst lore.',
      '- Split source passages into consecutive lettering boxes when necessary without deleting or inserting words. If a passage is prose rather than lettering, retain it verbatim under SOURCE and add staging separately.',
      '- Do not silently resolve contradictions in the source. Put any continuity question in an editorial note.',
      '- Add only camera, composition, panel sizing, staging, light and transitions that illustrate existing events. Mark those as PRODUCTION DIRECTION. Do not introduce new events, injuries, deaths, abilities or relationships.',
      '', 'PROJECT', 'Title: '+issue.title,'Issue: '+issue.number,'Target pages: '+options.pages,'Format: '+options.format,'Visual direction: preserve the existing Lagos Noir comic and its established artwork.','Additional production direction: '+(options.direction||'None.'),
      '', 'FOR EVERY PAGE','PAGE [number]','Page purpose:','Pacing and emotional beat:','Layout:','Page-turn / transition:',
      '', 'FOR EVERY PANEL','PANEL [number]','Panel size and layout:','Shot and camera angle:','Location and background:','Character positions and expressions:','Visible action:','Original source passage: [verbatim, mapped to its source sequence]','Dialogue: [verbatim, with original speaker]','Caption or narration: [verbatim]','System lettering: [verbatim when present]','Sound effects: [preserve any supplied wording; mark proposed additions separately]','Lighting and colour:','Transition to the next panel:',
      '', 'QUALITY CHECK','Show one drawable moment per panel. Use a split sequence where the source requires multiple moments. Preserve all source passages. Flag overcrowded lettering and offer more space rather than cutting text. Check the original ending, character continuity, power costs, source coverage and page-turn placement. If the target page count cannot fit the preserved text, report that conflict instead of omitting material.',
      '', 'BEGIN ORIGINAL STORY',storyText(issue),'END ORIGINAL STORY'].join('\n');
  }
  const api={readIssues,storyText,validNotes,exportScript,exportImagePrompts,imagePrompt,writingPrompt,PAGE_FIELDS,PANEL_FIELDS,IMAGE_FIELDS};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(!root.document)return;
  const doc=root.document;
  const $=id=>doc.getElementById(id);
  let issues=[],issue=null,pageIndex=0,notes=Object.create(null),dirty=false,loaded=false;
  const cache=new Map();
  const storageKey=()=> 'catalyst-script-notes-v1:'+issue.id+':'+issue.signature;
  const pack=()=>({schemaVersion:1,issue:issue.id,sourceSignature:issue.signature,notes});
  const tell=text=>{$('save-status').textContent=text;};
  function loadNotes() {
    if(cache.has(issue.id)){({notes,dirty}=cache.get(issue.id));return;}
    notes=Object.create(null);dirty=false;
    try {const raw=root.localStorage.getItem(storageKey());if(raw)notes=validNotes(issue,JSON.parse(raw));}
    catch {tell('Saved notes couldn’t be loaded. You can still work and export a backup.');}
  }
  function noteFields(id,fields,className) {
    const box=make(doc,'div',className);
    Object.entries(fields).forEach(([key,label])=>{
      const wrap=make(doc,'label','',label);
      const input=doc.createElement('textarea');input.rows=key==='action'?3:2;input.maxLength=6000;input.value=(notes[id]&&notes[id][key])||'';
      input.placeholder='Production note only';input.dataset.noteId=id;input.dataset.field=key;
      if(key==='action')wrap.className='full';wrap.append(input);box.append(wrap);
    });return box;
  }
  function renderBlock(block) {
    const el=make(doc,'div','original-block '+block.kind);
    if(block.kind==='dialogue'){el.append(make(doc,'span','speaker',block.speaker),make(doc,'div','speech',block.text));}
    else el.textContent=block.text;
    return el;
  }
  function renderPage(focus=false) {
    const page=issue.pages[pageIndex],storyView=$('view-select').value==='story';
    const article=$('page-content');article.replaceChildren();
    const header=make(doc,'header','page-heading');header.append(make(doc,'p','sequence','Working page '+page.number+' / Source sequence '+(issue.sequences.findIndex(s=>s.id===page.sequence)+1)),make(doc,'h2','',page.title),make(doc,'p','source-label',page.label));article.append(header);
    if(!storyView)article.append(noteFields(page.id,PAGE_FIELDS,'page-notes'));
    page.panels.forEach((panel,index)=>{
      const section=make(doc,'section','panel');
      if(!storyView){const top=make(doc,'div','panel-header');top.append(make(doc,'h3','','Panel group '+(index+1)),make(doc,'span','source-tag','Original text'));section.append(top);}
      panel.blocks.forEach(block=>section.append(renderBlock(block)));
      if(!storyView) {
        const dialogueWords=panel.blocks.filter(b=>b.kind==='dialogue'||b.kind==='system').reduce((sum,b)=>sum+b.text.split(/\s+/u).length,0);
        if(dialogueWords>75)section.append(make(doc,'p','overflow-note','Dense lettering: '+dialogueWords+' words. Plan additional panels or lettering space; keep the original text.'));
        const details=make(doc,'details','');details.append(make(doc,'summary','','Production directions'),noteFields(panel.id,PANEL_FIELDS,'direction-fields'));section.append(details);
        const imageDetails=make(doc,'details','image-brief');
        imageDetails.append(make(doc,'summary','','Image production brief'));
        const imageBody=make(doc,'div','image-brief-body');
        imageBody.append(make(doc,'p','image-rule','This prompt plans the image from the published scene. It never changes the story or adds lettering to the art.'));
        const prompt=doc.createElement('textarea');prompt.rows=10;prompt.readOnly=true;prompt.className='image-prompt';prompt.value=imagePrompt(issue,page,panel,index+1,notes);imageBody.append(prompt);
        const copy=make(doc,'button','copy-image-prompt','Copy image prompt');copy.type='button';copy.dataset.copyPrompt=prompt.value;imageBody.append(copy,noteFields(panel.id,IMAGE_FIELDS,'image-fields'));
        imageDetails.append(imageBody);section.append(imageDetails);
      }
      article.append(section);
    });
    if(pageIndex===issue.pages.length-1){const ending=make(doc,'aside','cliffhanger');ending.append(make(doc,'h3','',issue.cliffhangerLabel),make(doc,'p','',issue.cliffhanger));article.append(ending);}
    $('page-counter').textContent=page.number+' / '+issue.pages.length;
    $('previous').disabled=pageIndex===0;$('next').disabled=pageIndex===issue.pages.length-1;
    $('page-select').value=String(pageIndex);
    Array.from($('page-list').children).forEach((button,i)=>{if(i===pageIndex)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    const url=new URL(root.location.href);url.searchParams.set('issue',issue.id);url.searchParams.set('page',String(page.number));root.history.replaceState(null,'',url);
    if(focus)article.focus({preventScroll:false});
  }
  function setIssue(id,initialPage=0) {
    if(issue)cache.set(issue.id,{notes,dirty});
    issue=issues.find(i=>i.id===id)||issues[0];pageIndex=Math.max(0,Math.min(issue.pages.length-1,Number.isInteger(initialPage)?initialPage:0));tell('');loadNotes();
    $('issue-select').value=issue.id;$('issue-number').textContent='Issue '+String(issue.number).padStart(2,'0');$('issue-title').textContent=issue.title;
    $('issue-art').hidden=false;$('issue-art').src=issue.art;$('issue-art').alt='Existing cover reference for '+issue.title;
    $('target-pages').value=parseInt(issue.sourcePageLabel,10)||24;
    $('source-link').href='../read/issue-'+issue.number;
    $('page-list').replaceChildren();$('page-select').replaceChildren();
    issue.pages.forEach((p,index)=>{
      const button=make(doc,'button','');button.type='button';button.append(make(doc,'span','',String(p.number).padStart(2,'0')),make(doc,'span','',p.title+(p.part>1?' (continued)':'')));button.addEventListener('click',()=>{pageIndex=index;renderPage(true);});$('page-list').append(button);
      const option=make(doc,'option','','Page '+p.number+': '+p.title);option.value=String(index);$('page-select').append(option);
    });
    $('brief-output').value='';$('copy-brief').disabled=true;$('download-brief').disabled=true;
    renderPage();
  }
  function download(name,text,type) {
    const url=URL.createObjectURL(new Blob([text],{type}));const link=make(doc,'a','');link.href=url;link.download=name;doc.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function saveNotes(){try{root.localStorage.setItem(storageKey(),JSON.stringify(pack()));dirty=false;cache.set(issue.id,{notes,dirty});tell('Notes saved on this device.');}catch{tell('This browser couldn’t save notes. Export a notes backup to keep your work.');}}
  function preparePrint(){
    const output=$('print-output');output.replaceChildren();
    issue.pages.forEach(page=>{
      const article=make(doc,'article','print-page');
      article.append(make(doc,'p','print-heading','Catalyst: The Awakening / Issue '+issue.number+' / Working page '+page.number),make(doc,'h2','',page.title),make(doc,'p','print-note',page.label),make(doc,'p','print-warning','Original story text. Working pagination; production notes are separate.'));
      notesLines(page.id,PAGE_FIELDS,notes).forEach(line=>article.append(make(doc,'p','print-note',line)));
      page.panels.forEach((panel,index)=>{
        const section=make(doc,'section','print-panel');section.append(make(doc,'h3','','Panel group '+(index+1)));
        panel.blocks.forEach(b=>{if(b.speaker)section.append(make(doc,'div','print-label',b.speaker));section.append(make(doc,'div','print-block',b.text));});
        notesLines(panel.id,PANEL_FIELDS,notes).forEach(line=>section.append(make(doc,'p','print-note',line)));article.append(section);
      });
      if(page.number===issue.pages.length){article.append(make(doc,'h3','print-cliffhanger',issue.cliffhangerLabel),make(doc,'p','print-block',issue.cliffhanger));}
      output.append(article);
    });
  }
  async function boot(){
    if(loaded)return;$('load-status').hidden=false;$('load-error').hidden=true;
    try {
      const response=await fetch(new URL('../index.html',root.location.href),{cache:'no-cache',credentials:'same-origin'});
      if(!response.ok)throw new Error('Story unavailable');
      const source=await response.text();
      // DOMParser never executes source scripts. Only text in the four public story regions is read.
      issues=readIssues(new DOMParser().parseFromString(source,'text/html'));
      $('issue-select').replaceChildren();issues.forEach(i=>{const option=make(doc,'option','','Issue '+i.number+': '+i.title);option.value=i.id;$('issue-select').append(option);});
      const params=new URL(root.location.href).searchParams;setIssue(params.get('issue'),Number(params.get('page')||1)-1);
      $('studio').hidden=false;$('load-status').hidden=true;loaded=true;
    }catch{ $('load-status').hidden=true;$('load-error').hidden=false; }
  }
  $('retry').addEventListener('click',boot);
  $('issue-art').addEventListener('error',()=>{$('issue-art').hidden=true;});
  $('issue-select').addEventListener('change',event=>setIssue(event.target.value));
  $('view-select').addEventListener('change',()=>renderPage());
  $('page-select').addEventListener('change',event=>{pageIndex=Number(event.target.value);renderPage(true);});
  $('previous').addEventListener('click',()=>{if(pageIndex>0){pageIndex--;renderPage(true);}});
  $('next').addEventListener('click',()=>{if(pageIndex<issue.pages.length-1){pageIndex++;renderPage(true);}});
  $('page-content').addEventListener('input',event=>{
    const {noteId,field}=event.target.dataset;if(!noteId||!field)return;
    if(!notes[noteId])notes[noteId]=Object.create(null);notes[noteId][field]=event.target.value;dirty=true;tell('Unsaved notes on this device.');
  });
  $('page-content').addEventListener('click',async event=>{
    const button=event.target.closest('[data-copy-prompt]');if(!button)return;
    try {await root.navigator.clipboard.writeText(button.dataset.copyPrompt);button.textContent='Image prompt copied';setTimeout(()=>{button.textContent='Copy image prompt';},1600);}
    catch {tell('Select the image prompt and copy it on your device.');}
  });
  $('save-notes').addEventListener('click',saveNotes);
  $('export-notes').addEventListener('click',()=>{download('catalyst-'+issue.id+'-production-notes.json',JSON.stringify(pack(),null,2),'application/json');tell('Notes backup exported.');});
  $('export-md').addEventListener('click',()=>download('catalyst-'+issue.id+'-panel-script.md',exportScript(issue,notes),'text/markdown;charset=utf-8'));
  $('export-images').addEventListener('click',()=>download('catalyst-'+issue.id+'-image-production-prompts.md',exportImagePrompts(issue,notes),'text/markdown;charset=utf-8'));
  $('print-script').addEventListener('click',()=>{preparePrint();root.print();});
  root.addEventListener('beforeprint',()=>{if(issue)preparePrint();});
  $('import-notes').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{
      if(file.size>2000000)throw new Error('Choose a notes backup smaller than 2 MB.');
      const imported=validNotes(issue,JSON.parse(await file.text()));
      if(Object.keys(notes).length&&!root.confirm('Replace the production notes for this issue with this backup? The published story stays unchanged.'))return;
      notes=imported;dirty=true;renderPage();tell('Backup imported. Save notes on this device when ready.');
    }catch(error){tell(error instanceof SyntaxError?'This file is not valid JSON. Choose an exported notes backup.':error.message);}
    finally{event.target.value='';}
  });
  $('brief-open').addEventListener('click',()=>{$('brief-status').textContent='';$('brief-dialog').showModal();});
  $('brief-form').addEventListener('submit',event=>{
    event.preventDefault();const pages=Number($('target-pages').value);
    if(!Number.isInteger(pages)||pages<1||pages>200){$('brief-status').textContent='Choose a whole page count from 1 to 200.';return;}
    $('brief-output').value=writingPrompt(issue,{pages,format:$('comic-format').value,direction:$('production-direction').value.trim()});$('copy-brief').disabled=false;$('download-brief').disabled=false;$('brief-status').textContent='Prompt prepared with the complete original issue.';
  });
  $('copy-brief').addEventListener('click',async()=>{try{await root.navigator.clipboard.writeText($('brief-output').value);$('brief-status').textContent='Prompt copied.';}catch{$('brief-output').focus();$('brief-output').select();$('brief-status').textContent='Select Copy on your device, or download the prompt.';}});
  $('download-brief').addEventListener('click',()=>download('catalyst-'+issue.id+'-writing-framework.txt',$('brief-output').value,'text/plain;charset=utf-8'));
  doc.addEventListener('keydown',event=>{
    if(!loaded||$('brief-dialog').open||/^(INPUT|TEXTAREA|SELECT|BUTTON)$/u.test(event.target.tagName)||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key==='ArrowRight'&&pageIndex<issue.pages.length-1){event.preventDefault();pageIndex++;renderPage(true);}
    if(event.key==='ArrowLeft'&&pageIndex>0){event.preventDefault();pageIndex--;renderPage(true);}
  });
  root.addEventListener('beforeunload',event=>{if(dirty||Array.from(cache.values()).some(entry=>entry.dirty)){event.preventDefault();event.returnValue='';}});
  boot();
})(typeof window!=='undefined'?window:globalThis);
