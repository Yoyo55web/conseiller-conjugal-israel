import {callGrowthHub,telemetryResponse} from '../../../lib/growth-bridge';
export const dynamic='force-dynamic';
export async function GET(){try{const r=await callGrowthHub('public-tests');return telemetryResponse(r)}catch{return telemetryResponse({tests:[]},503)}}
