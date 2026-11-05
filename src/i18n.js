import norwegian from './nb.json' with {type:'json'};
export const supportedLanguages=['en','nb'];
let language='en';try{const saved=globalThis.localStorage?.getItem('shelfwise-language');if(supportedLanguages.includes(saved))language=saved}catch{}
export const getLanguage=()=>language;
export const getLocale=()=>language==='nb'?'nb-NO':'en-GB';
export function setLanguage(value){if(!supportedLanguages.includes(value))return;language=value;try{globalThis.localStorage?.setItem('shelfwise-language',value)}catch{}}
// Stable English message keys. Business data and select values stay unchanged.
export function translate(text,lang=language){
 if(lang!=='nb')return text;
 const s=String(text),key=s.trim();let value=norwegian[key];
 if(value===undefined){
 const patterns=[
 [/^(\d+) products$/,(_,n)=>`${n} ${n==='1'?'vare':'varer'}`],
 [/^(\d+) units · demo ledger$/,(_,n)=>`${n} enheter · demoregister`],
 [/^(.+) at retail value$/,(_,n)=>`${n} i utsalgsverdi`],
 [/^(\d+) units in stock$/,(_,n)=>`${n} enheter på lager`],
 [/^(.+) · editable demo price$/,(_,n)=>`${n} · redigerbar demopris`],
 [/^(.+) \((\d+) in stock\)$/,(_,name,n)=>`${name} (${n} på lager)`],
 [/^Only (\d+) units are in stock\.$/,(_,n)=>`Det er bare ${n} enheter på lager.`],
 [/^Order #(\d+) · (.+)$/,(_,n,d)=>`Bestilling #${n} · ${d}`],
 [/^(◫|▦|↗|♧|≡|⇥|◷|ⓘ|＋|↓|▥|●)\s+(.+)$/,(_,icon,label)=>`${icon}  ${norwegian[label]??label}`],
 [/^Workspace\s+\/\s*$/,()=> 'Arbeidsområde / ']
 ];
 for(const [regex,replace] of patterns)if(regex.test(key)){value=key.replace(regex,replace);break}
 }
 return value===undefined?s:s.slice(0,s.indexOf(key))+value+s.slice(s.indexOf(key)+key.length);
}
// Translate each freshly rendered view, with original text retained for static chrome.
// No observer or HTML rewriting: event handlers, typed values and data attributes survive.
const originals=new WeakMap(),attributeOriginals=new WeakMap();
export function localize(root=document.body){
 root.querySelectorAll('option').forEach(o=>{if(!o.hasAttribute('value'))o.setAttribute('value',o.textContent)});
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(node.parentElement?.closest('script,style,[data-no-i18n]'))continue;
  const prior=originals.get(node);const source=prior&&prior.rendered===node.nodeValue?prior.source:node.nodeValue;
  const rendered=translate(source);node.nodeValue=rendered;originals.set(node,{source,rendered});
 }
 root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el=>{
  if(el.closest('[data-no-i18n]'))return;
  let saved=attributeOriginals.get(el)||{};
  for(const attr of ['placeholder','aria-label','title'])if(el.hasAttribute(attr)){
   saved[attr]??=el.getAttribute(attr);el.setAttribute(attr,translate(saved[attr]));
  }
  attributeOriginals.set(el,saved);
 });
 document.documentElement.lang=language;document.title=language==='nb'?'Shelfwise · Butikkdrift':'Shelfwise · Retail workspace';
}
