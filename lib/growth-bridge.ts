import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import configJson from '../data/growth/config.json';
import {publicRoute,channelFor,campaignFor,type GrowthConfig} from './growth-shared';
export const growthConfig=configJson as GrowthConfig;
const HUB='https://www.dialogora.com/api/growth-ledger';
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function readAuthorized(req:Request){const key=process.env.GROWTH_METRICS_SECRET;return !!key&&equal(req.headers.get('authorization')||'','Bearer '+key);}
export async function callGrowthHub(action:string,payload:Record<string,unknown>={}){
 const secret=process.env.GROWTH_COUNTER_SECRET;if(!secret)throw Error('COUNTER_NOT_CONFIGURED');const raw=JSON.stringify({projectId:growthConfig.projectId,action,...payload}),stamp=String(Date.now());const signature=createHmac('sha256',secret).update(stamp+'\n'+raw).digest('hex');
 const r=await fetch(HUB,{method:'POST',headers:{'Content-Type':'application/json','X-Growth-Time':stamp,'X-Growth-Signature':signature},body:raw,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('COUNTER_UNAVAILABLE');return r.json();
}
export function dateInIsrael(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function visitor(req:Request){const secret=process.env.GROWTH_COUNTER_SECRET;if(!secret)throw Error('COUNTER_NOT_CONFIGURED');const cookie=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('yg_visit='))?.slice(9)||'';let [id,expires,signature]=cookie.split('.');const current=!!id&&/^[a-f0-9-]{36}$/.test(id)&&Number(expires)>Date.now()&&equal(signature||'',createHmac('sha256',secret).update(id+'.'+expires).digest('hex'));
 if(!current){id=randomUUID();expires=String(Date.now()+86400000);signature=createHmac('sha256',secret).update(id+'.'+expires).digest('hex');}
 const day=dateInIsrael();const session=createHmac('sha256',secret).update(day+':'+id).digest('hex');return {day,session,cookie:current?'':`yg_visit=${id}.${expires}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`};
}
export function validateEvent(input:unknown){const b=input as Record<string,unknown>;if(!b||!['view','cta'].includes(String(b.kind))||typeof b.path!=='string'||!publicRoute(b.path)||typeof b.eventId!=='string'||!/^[a-f0-9-]{36}$/.test(b.eventId))return null;return {kind:String(b.kind),route:publicRoute(b.path),eventId:b.eventId,channel:channelFor(String(b.source||'')),campaign:campaignFor(String(b.campaign||'')),testId:typeof b.testId==='string'?b.testId:'',variant:typeof b.variant==='string'?b.variant:''};}
export function telemetryResponse(value:unknown,status=200,extra:Record<string,string>={}){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow',...extra}});}
