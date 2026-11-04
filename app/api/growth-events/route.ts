import {growthConfig,visitor,validateEvent,callGrowthHub,telemetryResponse} from '../../../lib/growth-bridge';
import type {GrowthTest} from '../../../lib/growth-shared';
export const dynamic='force-dynamic';export const runtime='nodejs';
export async function POST(req:Request){
 if(req.headers.get('origin')!==growthConfig.domain)return telemetryResponse({error:'Origin rejected'},403);
 if(Number(req.headers.get('content-length')||0)>2048)return telemetryResponse({error:'Payload too large'},413);
 try{const raw=await req.text();if(raw.length>2048)return telemetryResponse({error:'Payload too large'},413);const event=validateEvent(JSON.parse(raw));if(!event)return telemetryResponse({error:'Invalid event'},400);
 if(event.testId){const {tests}=await callGrowthHub('public-tests');const test=(tests as GrowthTest[]).find(t=>t.id===event.testId&&t.status==='active');if(!test||!test.variants.some(v=>v.id===event.variant))return telemetryResponse({error:'Test not active'},409);}
 const v=visitor(req);await callGrowthHub('event',{...event,day:v.day,session:v.session,qa:false});return telemetryResponse({ok:true},202,v.cookie?{'Set-Cookie':v.cookie}:{});
 }catch{return telemetryResponse({error:'Measurement unavailable'},503);}
}

export async function DELETE(req:Request){if(req.headers.get('origin')!==growthConfig.domain)return telemetryResponse({error:'Origin rejected'},403);return telemetryResponse({ok:true},200,{'Set-Cookie':'yg_visit=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'});}
