import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translate,setLanguage,getLanguage,getLocale} from '../src/i18n.js';
import {makeState,mergeCatalogueUpdates,validEAN} from '../src/model.js';
const catalogue=JSON.parse(readFileSync(new URL('../src/products.json',import.meta.url)));
test('catalogue migration adds coffee once without touching existing records',()=>{
 const old=makeState(catalogue.filter(p=>p.ean!=='7038010003813'));
 old.products[0].stock=7;const sales=JSON.stringify(old.sales);
 mergeCatalogueUpdates(old,catalogue);mergeCatalogueUpdates(old,catalogue);
 assert.equal(old.products.filter(p=>p.ean==='7038010003813').length,1);
 assert.equal(old.products[0].stock,7);assert.equal(JSON.stringify(old.sales),sales);
});
test('migration preserves an existing custom coffee record',()=>{
 const s=makeState(catalogue);const p=s.products.find(p=>p.ean==='7038010003813');p.price=15;p.stock=3;
 mergeCatalogueUpdates(s,catalogue);assert.equal(p.price,15);assert.equal(p.stock,3);assert.ok(validEAN(p.ean));
});
test('translation handles navigation, counts and stock errors',()=>{
 assert.equal(translate('♧   Waste / Svinn','nb'),'♧  Svinn');
 assert.equal(translate('1 products','nb'),'1 vare');
 assert.equal(translate('2 products','nb'),'2 varer');
 assert.equal(translate('Only 4 units are in stock.','nb'),'Det er bare 4 enheter på lager.');
 assert.equal(translate('TINE IsKaffe Cappuccino 330ml','nb'),'TINE IsKaffe Cappuccino 330ml');
});
test('language toggles both ways and rejects unsupported locale',()=>{
 setLanguage('nb');assert.equal(getLocale(),'nb-NO');assert.equal(translate('Inventory'),'Varebeholdning');
 setLanguage('xx');assert.equal(getLanguage(),'nb');setLanguage('en');assert.equal(translate('Inventory'),'Inventory');assert.equal(getLocale(),'en-GB');
});
