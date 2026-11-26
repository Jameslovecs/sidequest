import { origins, restaurants } from './data.js';
export const SF_ZONE = 'America/Los_Angeles';
export function today(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone:SF_ZONE,year:'numeric',month:'2-digit',day:'2-digit' }).format(now); }
export function addDays(date, n) { const d=new Date(date+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
export function defaults(now = new Date()) { return {date:addDays(today(now),1),time:'19:00',party:2,budget:85,origin:'ferry',cuisine:'Any',vibe:'date',travel:25,buffer:10}; }
export function normalize(input, now = new Date()) {
  const d=defaults(now); const s={...d};
  if (!input || typeof input!=='object') return s;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input.date) && !isNaN(Date.parse(input.date+'T12:00:00Z')) && new Date(input.date+'T12:00:00Z').toISOString().slice(0,10)===input.date) s.date=input.date;
  if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time)) s.time=input.time;
  for (const [key,min,max] of [['party',1,10],['budget',15,300],['travel',5,180],['buffer',0,60]]) if (Number.isFinite(Number(input[key]))) s[key]=Math.max(min,Math.min(max,Math.round(Number(input[key]))));
  if (origins.some(o=>o.id===input.origin)) s.origin=input.origin;
  if (['Any','Italian','Californian','Japanese','Greek'].includes(input.cuisine)) s.cuisine=input.cuisine;
  if (['any','date','friends','casual','vegan'].includes(input.vibe)) s.vibe=input.vibe;
  return s;
}
// Deliberately small, deterministic parser. Unrecognized details stay in the prompt.
export function parsePrompt(text, state=defaults(), now=new Date()) {
  const s={...state}; const t=text.toLowerCase(); const recognized=[];
  const set=(key,value,label)=>{s[key]=value;recognized.push(label);};
  const cost=t.match(/(?:\$|usd\s*)(\d{2,3})|(?:budget|under|人均|预算)\s*(\d{2,3})/);
  if(cost) set('budget',Number(cost[1]||cost[2]),'budget');
  const party=t.match(/(?:for|party of|table for)\s*(\d{1,2}|two|three|four|five|six)\b|(\d{1,2})\s*(?:people|guests|人)/);
  if(party) {const words={two:2,three:3,four:4,five:5,six:6}; set('party',words[party[1]]||Number(party[1]||party[2]),'guests');}
  const time=t.match(/\b(1[0-2]|[1-9])(?::([0-5]\d))?\s*(pm|am)\b/) || t.match(/(?:at\s+|晚上\s*)([01]?\d|2[0-3])(?::([0-5]\d)|\s*点)/);
  if(time) {let h=Number(time[1]); if(time[3]==='pm' && h<12)h+=12; if(time[3]==='am'&&h===12)h=0; if(t.includes('晚上')&&h<12)h+=12; set('time',`${String(h).padStart(2,'0')}:${time[2]||'00'}`,'time');}
  const date=t.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if(date) set('date',date[1],'date');
  else if(/tomorrow|明天/.test(t)) set('date',addDays(today(now),1),'date');
  else if(/tonight|today|今天|今晚/.test(t)) set('date',today(now),'date');
  else {const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];const idx=days.findIndex(x=>t.includes(x)); const cn=t.match(/周([日一二三四五六])/); const target=idx>=0?idx:cn?'日一二三四五六'.indexOf(cn[1]):-1; if(target>=0){const dow=new Date(today(now)+'T12:00:00Z').getUTCDay();set('date',addDays(today(now),(target-dow+7)%7||7),'date');}}
  for (const [pattern,value] of [[/italian|pasta|意大利/,'Italian'],[/japanese|sushi|日料|寿司/,'Japanese'],[/greek|希腊/,'Greek'],[/californian|california food/,'Californian']]) if(pattern.test(t))set('cuisine',value,'cuisine');
  for (const [pattern,value] of [[/date night|romantic|girlfriend|boyfriend|约会|女朋友/,'date'],[/friends|catch.up|朋友/,'friends'],[/casual|quick|随便/,'casual'],[/vegan|纯素/,'vegan']]) if(pattern.test(t))set('vibe',value,'vibe');
  for(const [pattern,id] of [[/ferry/,'ferry'],[/union square/,'union'],[/salesforce/,'salesforce'],[/caltrain/,'caltrain'],[/hayes|patricia/,'hayes'],[/mission bart|16th.*bart/,'mission']])if(pattern.test(t))set('origin',id,'starting point');
  return {state:normalize(s,now),recognized:[...new Set(recognized)]};
}
export function rankRestaurants(s) {
  return restaurants.filter(r=>r.allowance<=s.budget && s.party<=r.maxParty && (s.cuisine==='Any'||s.cuisine===r.cuisine) && (s.vibe!=='vegan'||r.tags.includes('vegan')))
    .map(r=>({...r,score:(r.tags.includes(s.vibe)?10:0)+(r.cuisine===s.cuisine?5:0)})).sort((a,b)=>b.score-a.score||a.allowance-b.allowance);
}
export function links(s,r) {
  const o=origins.find(o=>o.id===s.origin)||origins[0];
  const maps=new URL('https://www.google.com/maps/dir/');
  maps.search=new URLSearchParams({api:'1',origin:o.address,destination:r.address,travelmode:'driving'});
  const uber=new URL('https://m.uber.com/ul/');
  uber.search=new URLSearchParams({action:'setPickup','pickup[latitude]':o.lat,'pickup[longitude]':o.lng,'pickup[nickname]':o.name,'pickup[formatted_address]':o.address,'dropoff[latitude]':r.lat,'dropoff[longitude]':r.lng,'dropoff[nickname]':r.name,'dropoff[formatted_address]':r.address});
  return {maps:maps.href,uber:uber.href,booking:r.url};
}
// Convert a San Francisco wall-clock time to UTC, independently of visitor timezone.
export function sfInstant(date,time) {
  const target=Date.parse(`${date}T${time}:00Z`); let utc=target;
  for(let i=0;i<3;i++) {const parts=new Intl.DateTimeFormat('en-CA',{timeZone:SF_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(utc));const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));const wall=Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);utc+=target-wall;}
  return new Date(utc);
}
export function timeline(s) {
  const dinner=sfInstant(s.date,s.time); const arrive=new Date(+dinner-s.buffer*60000); const leave=new Date(+arrive-s.travel*60000);
  const format=d=>new Intl.DateTimeFormat('en-US',{timeZone:SF_ZONE,hour:'numeric',minute:'2-digit'}).format(d);
  return {dinner,arrive,leave,dinnerLabel:format(dinner),arriveLabel:format(arrive),leaveLabel:format(leave)};
}
export function calendar(s,r) {
  const t=timeline(s); const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const esc=v=>String(v).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const description=`Unconfirmed dinner plan for ${s.party}. Book separately at ${r.url}\nLeave at ${t.leaveLabel} Pacific; ${s.travel} min travel allowance plus ${s.buffer} min buffer. Check live traffic before leaving.`;
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sidequest//Dinner and Ride//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${s.date}-${s.time.replace(':','')}-${r.id}@sidequest.local`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(t.dinner)}`,`DTEND:${stamp(new Date(+t.dinner+90*60000))}`,`SUMMARY:${esc('Dinner plan: '+r.name+' (unconfirmed)')}`,`LOCATION:${esc(r.address)}`,`DESCRIPTION:${esc(description)}`,'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR'];
  // RFC 5545: fold at 75 UTF-8 octets, preserving Unicode code points.
  return lines.map(line=>{let out='',column=0;for(const ch of line){const bytes=new TextEncoder().encode(ch).length;if(column+bytes>75){out+='\r\n ';column=1;}out+=ch;column+=bytes;}return out;}).join('\r\n')+'\r\n';
}
export function encodePlan(s,id) {return '#plan='+encodeURIComponent(JSON.stringify({v:1,state:normalize(s),restaurant:id}));}
export function decodePlan(hash) { try { if(!hash.startsWith('#plan=')||hash.length>5000)return null;const data=JSON.parse(decodeURIComponent(hash.slice(6)));if(data.v!==1||!restaurants.some(r=>r.id===data.restaurant))return null;return {state:normalize(data.state),restaurant:data.restaurant};}catch{return null;} }
