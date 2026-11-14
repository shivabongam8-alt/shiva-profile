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
 if(!b.dataset.on){b.dataset.on=1;b.innerHTML=`<span id="st">Editing</span><input type="color" id="c1" title="Accent colour 1"><input type="color" id="c2" title="Accent colour 2"><select id="add"><option value="">Add section…</option>${Object.entries(SC).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('')}</select><button data-act="discard">Discard</button><button data-act="exit">Exit</button><button class="pri" data-act="save">Save &amp; publish</button>`;
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
 if(a=='edit')return login(false);if(!EDIT)return;
 if(a=='img'){const f=E('input',{type:'file',accept:'image/*'});f.onchange=async()=>{if(!f.files[0])return;const u=await shrink(f.files[0]),ext=({'image/webp':'webp','image/png':'png','image/gif':'gif','image/svg+xml':'svg'})[u.slice(5,u.indexOf(';'))]||'jpg',path='assets/uploads/'+Date.now().toString(36)+'.'+ext;IMG[path]=u;PEND[path]=u.split(',')[1];sp(p,path);mark();render()};return f.click()}
 if(a=='url'){const o=gp(p),v=prompt('Link address (https://…, mailto:…, or #section)',o.url||'');if(v!==null){o.url=v.trim();mark()}return}
 if(a=='save')return save();
 if(a=='discard'){if(confirm('Throw away all unsaved changes?')){dirty=false;location.reload()}return}
 if(a=='exit'){if(!dirty||confirm('You have unsaved changes. Leave anyway?')){dirty=false;location.reload()}return}
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

/* ---- authenticator-app login: a free Cloudflare Worker checks the 6-digit code and commits for you ---- */
const API=(window.EDITOR_API||'').replace(/\/$/,''),SES={t:''};
const guess=()=>window.EDITOR_REPO||(()=>{const m=location.hostname.match(/^(.+)\.github\.io$/);return m?m[1]+'/'+(location.pathname.split('/')[1]||location.hostname):''})();
const post=async(path,body)=>{const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(Error(j.error||'Request failed ('+r.status+')'),{status:r.status});return j};
async function login(again){
 const d=$('#dlg');
 d.innerHTML=API?`<form><h2>${again?'Session expired':'Unlock editor'}</h2><p>Enter the 6-digit code from your authenticator app.</p><label>Code<input name="c" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required autofocus></label><p id="er"></p><div><button type="button" id="cx">Cancel</button><button class="pri">Unlock</button></div></form>`:`<form><h2>Editor not set up</h2><p>Add your Worker address to <b>assets/config.js</b> (see SETUP.md), then reload.</p><div><button type="button" id="cx" class="pri">OK</button></div></form>`;
 d.showModal();$('#cx').onclick=()=>d.close();if(!API)return;
 d.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const er=$('#er');er.textContent='';
  try{SES.t=(await post('/login',{code:new FormData(ev.target).get('c')})).session;
   if(again){d.close();return save()}
   try{const r=await fetch('https://api.github.com/repos/'+guess()+'/contents/content/site.json?ref='+(window.EDITOR_BRANCH||'main'),{headers:{Accept:'application/vnd.github.raw+json'}});if(r.ok)D=JSON.parse(await r.text())}catch{}
   d.close();EDIT=true;render()
  }catch(x){er.textContent=x.message}}}

/* ---- publish: the Worker makes one atomic commit with content + new images ---- */
async function save(){
 const st=$('#st');st.textContent='Publishing…';
 try{await post('/save',{session:SES.t,files:[{path:'content/site.json',content:JSON.stringify(D,null,2)+'\n',encoding:'utf-8'},...Object.entries(PEND).map(([path,content])=>({path,content,encoding:'base64'}))]});
  PEND={};dirty=false;st.textContent='Published';toast('Saved to GitHub. The live site updates in about a minute.')
 }catch(x){st.textContent='Unsaved changes';if(x.status==401)return login(true);toast('Could not publish: '+x.message)}}

(async()=>{D=await(await fetch('content/site.json',{cache:'no-store'})).json();render();if(location.hash=='#edit')login()})().catch(()=>{$('#app').textContent='Could not load content/site.json'});
