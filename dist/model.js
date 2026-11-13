/* Demonstration rules, not validated biological safety thresholds or a trained AI. */
const RiskModel = (() => {
  const defaults = {top:3,bottom:5,seabed:8,clearance:1,lift:2,lower:2,shorten:1};
  const labels = {adjust:'조절 검토',keep:'현 배치 유지',hold:'추천 보류'};
  function scenario(id) {
    const rows = [
      [1,26.5,6.2],[2,26.2,6.0],[3,25.8,5.8],[4,25.5,2.8],[5,24.8,2.4],[6,24.5,2.3],[7,24.2,2.2]
    ].map(([depth,temp,oxygen])=>({depth,temp,oxygen,salinity:29.5,quality:'ok'}));
    if(id==='heat') rows.forEach(r=>{r.temp=r.depth<=4?29.5-r.depth*0.2:26.5-(r.depth-5)*0.5;r.oxygen=5.8;});
    if(id==='keep') rows.forEach(r=>r.oxygen=5.8);
    if(id==='danger') rows.forEach(r=>{r.temp=26;r.oxygen=2.4;});
    if(id==='missing') rows.find(r=>r.depth===4).quality='missing';
    if(id==='fault') rows[4].quality='fault';
    // Six ten-minute intervals ending at 10:30, each carrying a simulated measurement.
    rows.forEach(r=>{r.samples=Array.from({length:6},()=>({temp:r.temp,oxygen:r.oxygen,salinity:r.salinity,minutes:10}));});
    return {id,rows,stale:id==='stale',measured:'10:30',received:id==='stale'?'연결 끊김':'10:31'};
  }
  function validFarm(f){return Object.values(f).every(Number.isFinite)&&f.top>=1&&f.bottom>f.top&&f.clearance>=0&&f.seabed>0&&f.bottom+f.clearance<=f.seabed&&[f.lift,f.lower,f.shorten].every(x=>x>=0);}
  function exposure(row){return row.samples.reduce((a,s)=>({hot:a.hot+(s.temp>=28?s.minutes:0),low:a.low+(s.oxygen<3?s.minutes:0),salt:a.salt+((s.salinity<20||s.salinity>35)?s.minutes:0)}),{hot:0,low:0,salt:0});}
  function evaluate(data,top,bottom){
    const rows=data.rows.filter(r=>r.depth>=top&&r.depth<=bottom);
    if(!rows.length||rows[0].depth!==top||rows.at(-1).depth!==bottom||rows.some((r,i)=>r.quality!=='ok'||(i&&r.depth-rows[i-1].depth>1)))return null;
    const exposures=rows.map(exposure);
    return {hot:Math.max(...exposures.map(e=>e.hot)),low:Math.max(...exposures.map(e=>e.low)),salt:Math.max(...exposures.map(e=>e.salt)),score:exposures.reduce((s,e)=>s+e.hot+e.low+e.salt,0)/rows.length};
  }
  function analyze(data,f){
    const hold=reason=>({type:'hold',reason,current:null,best:null,candidates:[]});
    if(!validFarm(f))return hold('양식장 수심과 작업 가능 범위를 확인해 주세요.');
    if(data.stale)return hold('최신 측정값이 없어 배치안을 판단할 수 없어요.');
    const current=evaluate(data,f.top,f.bottom);
    if(!current)return hold('현재 굴 구간에 측정 누락 또는 센서 이상이 있어요.');
    const defs=[{top:f.top,bottom:f.bottom,method:'유지',amount:0}];
    for(let n=1;n<=Math.min(f.lift,f.top-1);n++)defs.push({top:f.top-n,bottom:f.bottom-n,method:'전체 인양',amount:n});
    for(let n=1;n<=Math.min(f.lower,f.seabed-f.clearance-f.bottom);n++)defs.push({top:f.top+n,bottom:f.bottom+n,method:'전체 침하',amount:n});
    if(f.shorten>=1&&f.bottom-f.top>1)defs.push({top:f.top,bottom:f.bottom-1,method:'하단 단축',amount:1});
    const candidates=defs.filter(c=>c.top>=1&&c.bottom+f.clearance<=f.seabed).map(c=>({...c,risk:evaluate(data,c.top,c.bottom)}));
    const usable=candidates.filter(c=>c.risk).sort((a,b)=>a.risk.score-b.risk.score||a.amount-b.amount);
    const best=usable[0];
    // Never trade a newly introduced hazard for improvement in another hazard.
    const better=usable.find(c=>c.amount&&c.risk.score<current.score&&c.risk.hot<=current.hot&&c.risk.low<=current.low&&c.risk.salt<=current.salt);
    if(better&&better.risk.score===0)return {type:'adjust',reason:current.hot>0?'더 서늘한 아래쪽 구간을 검토해요. 산소 상태도 확인했어요.':'산소가 부족한 하층을 벗어나 위쪽 구간을 검토해요. 수온도 확인했어요.',current,best:better,candidates};
    if(current.score===0)return {type:'keep',reason:'확인된 후보 중 현재 배치가 상대적으로 유리해요. 이동할 필요가 뚜렷하지 않아요.',current,best:usable.find(c=>!c.amount),candidates};
    return {type:'hold',reason:best?.risk.score>0?'확인된 모든 후보에 위험이 남아 있어요. 무리한 이동을 권고하지 않아요.':'개선이 확인된 실행 가능한 후보가 없어요.',current,best:null,candidates};
  }
  return {defaults,labels,scenario,validFarm,exposure,evaluate,analyze};
})();
if(typeof module!=='undefined')module.exports=RiskModel;
