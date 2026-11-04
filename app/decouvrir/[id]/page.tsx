import {notFound} from 'next/navigation';
import {callGrowthHub,growthConfig} from '../../../lib/growth-bridge';
import GrowthExperiment from '../../../components/GrowthExperiment';
import {safeTest,type GrowthTest} from '../../../lib/growth-shared';
import '../../ressources/resources.css';
export const metadata={title:'Découvrir notre accompagnement et nos solutions',robots:{index:false,follow:true}};
export const dynamic='force-dynamic';
export default async function Discover({params}:{params:Promise<{id:string}>}){const {id}=await params;const r=await callGrowthHub('public-tests').catch(()=>({tests:[]}));const t=(r.tests as GrowthTest[]).find(t=>t.id===id);if(!t||!safeTest(t))notFound();if(t.status==='paused')return <main className="growth-resources"><h1>Découvrez notre offre</h1><a className="gr-button" href="/">Voir la présentation</a></main>;return <GrowthExperiment test={t}/>}
