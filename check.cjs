const fs=require('fs'),vm=require('vm'),assert=require('assert');
const M=require('./dist/model.js');
for(const [id,type] of Object.entries({adjust:'adjust',keep:'keep',danger:'hold',missing:'hold',fault:'hold',stale:'hold'}))assert.equal(M.analyze(M.scenario(id),M.defaults).type,type,id);
assert.equal(M.analyze(M.scenario('adjust'),{...M.defaults,shorten:0}).type,'hold');
assert.equal(M.analyze(M.scenario('adjust'),M.defaults).best.method,'하단 단축');
assert.equal(M.evaluate(M.scenario('adjust'),2.5,5),null);
assert.deepEqual(M.exposure({samples:[{temp:29,oxygen:5,salinity:29,minutes:10},{temp:25,oxygen:2,salinity:29,minutes:10}]}),{hot:10,low:10,salt:0});
assert(!M.validFarm({...M.defaults,seabed:5}));
const nodes={},node=s=>nodes[s]??={dataset:{},innerHTML:'',value:'',textContent:'',classList:{add(){},remove(){}},focus(){}};
const saved={},ctx={document:{querySelector:node,querySelectorAll:()=>[],documentElement:{}},localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v},setTimeout:()=>{},console};vm.createContext(ctx);
for(const f of ['icons','metric-icons','model','app'])vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),ctx);
for(const p of ['home','depths','recommend','compare','method','action','records','device','settings']){vm.runInContext(`go('${p}')`,ctx);assert(node('#screen').innerHTML.length>100,p)}
assert.equal(vm.runInContext("validateAction('하단 단축',2,4)",ctx),'');assert(vm.runInContext("validateAction('전체 인양',1,4.5)",ctx));
vm.runInContext("log('하단 단축',{after:'2~4m',memo:'<script>'})",ctx);assert(node('#screen').innerHTML.includes('&lt;script&gt;'));assert(saved['gul-v3-history']);
vm.runInContext("changeScenario('fault');go('recommend')",ctx);assert(node('#screen').innerHTML.includes('지금은 추천을 보류'));
console.log('PASS: six scenarios, physical limits, exposure, nine screens, action validation, escaped persistent records');
