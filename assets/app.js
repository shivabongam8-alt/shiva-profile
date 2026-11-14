'use strict';
const $=s=>document.querySelector(s),E=(t,p={},...k)=>{const e=document.createElement(t);for(const n in p)n=='dataset'?Object.assign(e.dataset,p[n]):e[n]=p[n];e.append(...k.flat().filter(Boolean));return e};
let D,EDIT=false,dirty=false,TOKEN,REPO,BR,PEND={},IMG={};
/* Section types: f = fields [key,kind] (t text, p paragraph, i image, g tags); L = repeatable lists */
const SC={
 hero:{n:'Intro',f:[['name','t'],['role','t'],['tagline','p'],['photo','i']],L:{buttons:{n:'button',f:[['label','t'],['url','u']],new:{label:'Button',url:'#'}}}},
 about:{n:'About',f:[['title','t'],['body','p'],['photo','i']],L:{facts:{n:'fact',f:[['label','t'],['value','t']],new:{label:'Label',value:'Value'}}}},
 skills:{n:'Skills',f:[['title','t']],L:{items:{n:'group',f:[['name','t'],['tags','g']],new:{name:'Group',tags:'Tag, Tag'}}}},
 projects:{n:'Projects',f:[['title','t']],L:{items:{n:'project',f:[['image','i'],['title','t'],['text','p'],['tags','g'],['url','u']],new:{image:'',title:'New project',text:'Describe it.',tags:'Tag',url:''}}}},
 timeline:{n:'Experience',f:[['title','t']],L:{items:{n:'entry',f:[['role','t'],['org','t'],['period','t'],['text','p']],new:{role:'Role',org:'Organisation',period:'Year – Year',text:'What you did.'}}}},
 gallery:{n:'Gallery',f:[['title','t']],L:{items:{n:'photo',f:[['image','i'],['caption','t']],new:{image:'',caption:'Caption'}}}},
 text:{n:'Text block',f:[['title','t'],['body','p']],L:{}},
 contact:{n:'Contact',f:[['title','t'],['body','p']],L:{links:{n:'link',f:[['label','t'],['url','u']],new:{label:'Link',url:'https://'}}}}
};
const gp=p=>p.split('.').reduce((o,k)=>o?.[k],D),sp=(p,v)=>{const a=p.split('.'),l=a.pop();a.reduce((o,k)=>o[k],D)[l]=v};
const safe=u=>/^(https?:|mailto:|tel:|#|\/|\.)/i.test(u)?u:'#';
const mark=()=>{dirty=true;const s=$('#st');if(s)s.textContent='Unsaved changes'};
const toast=m=>{const t=$('#toast');t.textContent=m;t.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',6000)};

function fld(p,v,kd,k){
 if(kd=='i'){if(!EDIT&&!v){const sc=gp(p.split('.').slice(0,2).join('.'));return sc?.type=='hero'?E('figure',{className:'img k-'+k,ariaHidden:'true'},E('b',{className:'mono',textContent:(D.site.name||'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()})):null}const f=E('figure',{className:'img k-'+k},v?E('img',{src:IMG[v]||v,alt:'',loading:'lazy'}):E('span',{textContent:'Click to add a photo'}));if(EDIT){f.dataset.act='img';f.dataset.p=p}return f}
 if(!EDIT&&!v)return null;
 if(kd=='g'&&!EDIT)return E('div',{className:'tags k-'+k},v.split(',').map(x=>x.trim()).filter(Boolean).map(x=>E('span',{textContent:x})));
 const d=p.split('.').length==3,tag=kd=='p'?'div':k=='title'&&d?'h2':k=='name'&&d?'h1':'span';
 const e=E(tag,{className:'f k-'+k+(kd=='p'?' p':''),textContent:v||''});
 if(EDIT){try{e.contentEditable='plaintext-only'}catch{e.contentEditable=true}Object.assign(e.dataset,{p,k:kd,ph:kd=='g'?'tag, tag':k})}
 return e}
const ctl=(p,i,url)=>[E('button',{textContent:'↑',title:'Move up',dataset:{act:'up',p,i}}),E('button',{textContent:'↓',title:'Move down',dataset:{act:'down',p,i}}),url&&E('button',{textContent:'Link',title:'Edit link',dataset:{act:'url',p:p+'.'+i}}),E('button',{textContent:'✕',title:'Delete',dataset:{act:'del',p,i}})];
function row(lp,j,it,L){if(!EDIT&&L.n=='photo'&&!it.image)return null;const hu=L.new.url!==undefined,a=hu&&!EDIT&&it.url;
 return E(a?'a':'div',{className:'row',href:a?safe(it.url):undefined},EDIT&&E('div',{className:'ictl'},ctl(lp,j,hu)),L.f.filter(f=>f[1]!='u').map(([k,kd])=>fld(lp+'.'+j+'.'+k,it[k],kd,k)))}

function render(){
 const r=document.documentElement.style;r.setProperty('--a',D.site.a);r.setProperty('--b',D.site.b);
 document.title=D.site.title;$('meta[name=description]').content=D.site.description||'';document.body.classList.toggle('edit',EDIT);
 const vis=D.sections.filter(s=>EDIT||!s.hide);
 $('#nav').replaceChildren(E('b',{className:'brand'},fld('site.name',D.site.name,'t','name')||''),E('span',{className:'sp'}),vis.filter(s=>s.title&&s.type!='hero').map(s=>E('a',{href:'#'+s.id,textContent:s.title})),D.site.edit!==false&&!EDIT&&E('button',{textContent:'Edit',dataset:{act:'edit'}}));
 $('#app').replaceChildren(...vis.map(s=>{const i=D.sections.indexOf(s),S=SC[s.type],P='sections.'+i;
  return E('section',{id:s.id,className:'sec t-'+s.type+(s.hide?' off':'')},
   EDIT&&E('div',{className:'sctl'},E('button',{textContent:s.hide?'Show':'Hide',dataset:{act:'hide',p:'sections',i}}),ctl('sections',i)),
   S.f.map(([k,kd])=>fld(P+'.'+k,s[k],kd,k)),
   Object.entries(S.L).map(([lk,L])=>E('div',{className:'list '+lk},(s[lk]||[]).map((it,j)=>row(P+'.'+lk,j,it,L)),EDIT&&E('button',{className:'add',textContent:'+ Add '+L.n,dataset:{act:'add',p:P+'.'+lk,t:s.type,l:lk}}))))}));
 bar()}

function bar(){const b=$('#bar');b.hidden=!EDIT;if(!EDIT)return;
 if(!b.dataset.on){b.dataset.on=1;b.innerHTML=`<span id="st">Editing</span><input type="color" id="c1" title="Accent colour 1"><input type="color" id="c2" title="Accent colour 2"><select id="add"><option value="">Add section…</option>${Object.entries(SC).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('')}</select><button data-act="discard">Discard</button><button data-act="forget">Forget token</button><button data-act="exit">Exit</button><button class="pri" data-act="save">Save &amp; publish</button>`;
  $('#add').onchange=e=>{const t=e.target.value;if(!t)return;const S=SC[t];D.sections.push({id:t+Date.now().toString(36),type:t,title:S.n,...Object.fromEntries(Object.entries(S.L).map(([k,L])=>[k,[structuredClone(L.new)]]))});e.target.value='';mark();render();scrollTo({top:document.body.scrollHeight})}}
 $('#c1').value=D.site.a;$('#c2').value=D.site.b}

/* ---- editing events ---- */
document.addEventListener('input',e=>{const t=e.target;if(!EDIT)return;
 if(t.dataset.p){sp(t.dataset.p,t.innerText.replace(/\n$/,''));mark()}
 else if(t.id=='c1'||t.id=='c2'){const k=t.id=='c1'?'a':'b';D.site[k]=t.value;document.documentElement.style.setProperty('--'+k,t.value);mark()}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&['t','g'].includes(e.target.dataset?.k))e.preventDefault()});
document.addEventListener('paste',e=>{if(e.target.dataset?.p){e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))}});
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,p=b.dataset.p,n=+b.dataset.i;
 if(a=='edit')return login();if(!EDIT)return;
 if(a=='img'){const f=E('input',{type:'file',accept:'image/*'});f.onchange=async()=>{if(!f.files[0])return;const u=await shrink(f.files[0]),ext=({'image/webp':'webp','image/png':'png','image/gif':'gif','image/svg+xml':'svg'})[u.slice(5,u.indexOf(';'))]||'jpg',path='assets/uploads/'+Date.now().toString(36)+'.'+ext;IMG[path]=u;PEND[path]=u.split(',')[1];sp(p,path);mark();render()};return f.click()}
 if(a=='url'){const o=gp(p),v=prompt('Link address (https://…, mailto:…, or #section)',o.url||'');if(v!==null){o.url=v.trim();mark()}return}
 if(a=='save')return save();
 if(a=='discard'){if(confirm('Throw away all unsaved changes?')){dirty=false;location.reload()}return}
 if(a=='exit'){if(!dirty||confirm('You have unsaved changes. Leave anyway?')){dirty=false;location.reload()}return}
 if(a=='forget'){localStorage.removeItem('pf');return toast('Token removed from this browser.')}
 const arr=gp(p);
 if(a=='hide')arr[n].hide=!arr[n].hide;
 else if(a=='up'&&n>0)[arr[n-1],arr[n]]=[arr[n],arr[n-1]];
 else if(a=='down'&&n<arr.length-1)[arr[n+1],arr[n]]=[arr[n],arr[n+1]];
 else if(a=='del'){if(!confirm('Delete this?'))return;arr.splice(n,1)}
 else if(a=='add')arr.push(structuredClone(SC[b.dataset.t].L[b.dataset.l].new));
 mark();render()});

function shrink(file){return new Promise(async res=>{
 if(/svg|gif/.test(file.type)){const r=new FileReader();r.onload=()=>res(r.result);return r.readAsDataURL(file)}
 const bm=await createImageBitmap(file),s=Math.min(1,1600/Math.max(bm.width,bm.height)),c=E('canvas',{width:Math.round(bm.width*s),height:Math.round(bm.height*s)});
 c.getContext('2d').drawImage(bm,0,0,c.width,c.height);res(c.toDataURL('image/webp',.85))})}

/* ---- password-protected GitHub token (AES-GCM + PBKDF2, stored only in this browser) ---- */
const b64=u=>btoa(String.fromCharCode(...new Uint8Array(u))),ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(pw,salt){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
const gh=async(path,o={})=>{const r=await fetch('https://api.github.com/repos/'+REPO+path,{...o,headers:{Authorization:'Bearer '+TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...o.headers},body:o.body&&JSON.stringify(o.body)});if(!r.ok)throw Error((await r.json().catch(()=>({}))).message||'GitHub error '+r.status);return r};
const guess=()=>{const m=location.hostname.match(/^(.+)\.github\.io$/);return m?m[1]+'/'+(location.pathname.split('/')[1]||location.hostname):''};

async function login(){
 const V=JSON.parse(localStorage.pf||'null'),d=$('#dlg');
 d.innerHTML=`<form><h2>${V?'Unlock editor':'Set up editor'}</h2>${V?'':`<p>Paste a GitHub fine-grained token with <b>Contents: read &amp; write</b> access to this repository only. It is encrypted with your password and never leaves this browser except to talk to GitHub.</p><label>GitHub token<input name="t" type="password" autocomplete="off" required></label><label>Repository<input name="r" value="${guess()}" placeholder="owner/repository" required></label><label>Branch<input name="b" value="main"></label>`}<label>${V?'Password':'Choose a password (8+ characters)'}<input name="w" type="password" minlength="8" required autofocus></label><p id="er"></p><div><button type="button" id="cx">Cancel</button><button class="pri">${V?'Unlock':'Save &amp; unlock'}</button></div></form>`;
 d.showModal();$('#cx').onclick=()=>d.close();
 d.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target),w=f.get('w'),er=$('#er');er.textContent='';
  try{let v=V;
   if(!V){TOKEN=f.get('t').trim();REPO=f.get('r').trim();BR=(f.get('b')||'main').trim();
    if((await(await gh('')).json()).permissions?.push===false)throw Error('This token cannot write to the repository.');
    const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(w,salt),new TextEncoder().encode(TOKEN));
    v={s:b64(salt),i:b64(iv),c:b64(ct),r:REPO,b:BR};localStorage.pf=JSON.stringify(v)}
   else{REPO=v.r;BR=v.b;try{TOKEN=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(v.i)},await key(w,ub(v.s)),ub(v.c)))}catch{await new Promise(r=>setTimeout(r,1200));throw Error('Wrong password.')}}
   try{D=JSON.parse(await(await gh('/contents/content/site.json?ref='+BR,{headers:{Accept:'application/vnd.github.raw+json'}})).text())}catch{}
   d.close();EDIT=true;render()
  }catch(x){er.textContent=x.message}}}

/* ---- publish: one atomic commit with content + new images ---- */
async function save(){
 const st=$('#st');st.textContent='Publishing…';
 try{const ref=(await(await gh('/git/ref/heads/'+BR)).json()).object.sha,base=(await(await gh('/git/commits/'+ref)).json()).tree.sha,tree=[];
  for(const[p,c,enc]of[['content/site.json',JSON.stringify(D,null,2)+'\n','utf-8'],...Object.entries(PEND).map(([p,c])=>[p,c,'base64'])])
   tree.push({path:p,mode:'100644',type:'blob',sha:(await(await gh('/git/blobs',{method:'POST',body:{content:c,encoding:enc}})).json()).sha});
  const t=await(await gh('/git/trees',{method:'POST',body:{base_tree:base,tree}})).json(),
   c=await(await gh('/git/commits',{method:'POST',body:{message:'Update portfolio (site editor)',tree:t.sha,parents:[ref]}})).json();
  await gh('/git/refs/heads/'+BR,{method:'PATCH',body:{sha:c.sha}});
  PEND={};dirty=false;st.textContent='Published';toast('Saved to GitHub. The live site updates in about a minute.')
 }catch(x){st.textContent='Unsaved changes';toast('Could not publish: '+x.message)}}

(async()=>{D=await(await fetch('content/site.json',{cache:'no-store'})).json();render();if(location.hash=='#edit')login()})().catch(()=>{$('#app').textContent='Could not load content/site.json'});
