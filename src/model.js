const newId = () => globalThis.crypto?.randomUUID?.() ?? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2,'0')).join('');
// Pure domain functions shared by the UI and automated tests.
export const dayKey = (d = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export function validEAN(value) {
 if(!/^(\d{8}|\d{13})$/.test(value)) return false;
 const digits=[...value].map(Number),last=digits.pop();
 return (10-digits.reverse().reduce((s,n,i)=>s+n*(i%2===0?3:1),0)%10)%10===last;
}
export function makeState(products) {
 const sales=[];
 for(let d=6;d>=0;d--) for(let i=0;i<products.length;i++) {
  const date=new Date();date.setDate(date.getDate()-d);
  sales.push({id:`seed-${d}-${i}`,productId:products[i].id,date:dayKey(date),quantity:3+(i*3+d*2)%17,unitPrice:products[i].price,demo:true});
 }
 return {version:2,products:structuredClone(products),sales,waste:[],orders:[],counts:[],showPrices:false};
}
export function incoming(state,id) {return state.orders.filter(o=>!o.received).reduce((n,o)=>n+(o.lines.find(l=>l.productId===id)?.quantity||0),0)}
export function suggestion(state,p){return Math.max(0,p.target-p.stock-incoming(state,p.id))}
export function positiveInteger(value){let n=Number(value);if(!Number.isSafeInteger(n)||n<=0)throw new Error('Enter a positive whole number.');return n}
export function recordMovement(state,{type,productId,quantity,date,reason}) {
 const p=state.products.find(p=>p.id===productId);if(!p)throw new Error('Product not found.');
 const n=positiveInteger(quantity);
 if(n>p.stock)throw new Error(`Only ${p.stock} units are in stock.`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>dayKey())throw new Error('Choose today or an earlier date.');
 if(!['sale','waste'].includes(type))throw new Error('Unknown movement.');
 if(type==='waste'&&!['Expired','Damaged','Quality','Other'].includes(reason))throw new Error('Select a waste reason.');
 const row={id:newId(),productId,quantity:n,date,unitPrice:p.price,...(type==='waste'?{reason}:{})};
 p.stock-=n;(type==='sale'?state.sales:state.waste).push(row);return row;
}
export function createOrder(state){const lines=state.products.filter(p=>suggestion(state,p)>0).map(p=>({productId:p.id,quantity:suggestion(state,p)}));if(!lines.length)throw new Error('No replenishment needed.');state.orders.unshift({id:newId(),date:dayKey(),lines,received:false})}
export function receiveOrder(state,id){const o=state.orders.find(o=>o.id===id);if(!o||o.received)throw new Error('This order cannot be received again.');o.lines.forEach(l=>state.products.find(p=>p.id===l.productId).stock+=l.quantity);o.received=true}
export function totals(rows){return {units:rows.reduce((s,r)=>s+r.quantity,0),value:rows.reduce((s,r)=>s+r.quantity*r.unitPrice,0)}}
export function saveProduct(state,input,id){
 const p={...input};p.name=String(p.name).trim();p.ean=String(p.ean).trim();p.placement=String(p.placement).trim();
 if(!p.name||!p.placement)throw new Error('Name and placement are required.');
 if(!validEAN(p.ean))throw new Error('Enter a valid EAN-8 or EAN-13, including its check digit.');
 if(state.products.some(x=>x.ean===p.ean&&x.id!==id))throw new Error('This EAN is already in the catalogue.');
 for(const k of ['stock','target']){p[k]=Number(p[k]);if(!Number.isSafeInteger(p[k])||p[k]<0)throw new Error('Stock and target must be non-negative whole numbers.')}
 if(p.expiry&&!/^\d{4}-\d{2}-\d{2}$/.test(p.expiry))throw new Error('Invalid expiry date.');
 p.price=Number(p.price);if(!Number.isFinite(p.price)||p.price<0)throw new Error('Price must be zero or higher.');p.price=Math.round(p.price*100)/100;
 if(id){const old=state.products.find(x=>x.id===id);if(!old)throw new Error('Unknown product.');if(old.stock!==p.stock)state.counts.push({productId:id,date:dayKey(),before:old.stock,after:p.stock});Object.assign(old,p)}
 else state.products.push({...p,id:newId(),image:'',source:'',imageSource:''});
}

// Add the newly introduced product without resetting an existing store or duplicating EANs.
export function mergeCatalogueUpdates(state,catalogue){
 const coffee=catalogue.find(p=>p.ean==='7038010003813');
 if(coffee&&!state.products.some(p=>p.ean===coffee.ean))state.products.push(structuredClone(coffee));
 return state;
}
