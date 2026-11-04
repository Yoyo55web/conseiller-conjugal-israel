import {GrowthCTA} from '../../../components/GrowthMetrics';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import articles from '../../../data/growth/articles.json';
import config from '../../../data/growth/config.json';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const a=articles.find(a=>a.slug===slug);return a?{title:a.title,description:a.description,alternates:{canonical:'/ressources/'+slug},openGraph:{title:a.title,description:a.description,url:'/ressources/'+slug}}:{robots:{index:false,follow:false}}}
export default async function Article({params}:Props){const {slug}=await params;const a=articles.find(a=>a.slug===slug);if(!a)notFound();return <main><article className="gr-body"><p className="gr-eyebrow">{config.brand} · Guide pratique</p><h1>{a.title}</h1><p><small>Mise à jour : {a.updatedAt}</small></p>{a.body.split(/\n\s*\n/).map((p,i)=>p.startsWith('## ')?<h2 key={i}>{p.slice(3)}</h2>:<p key={i}>{p}</p>)}<aside className="gr-cta"><h2>{config.ctaTitle}</h2><p>{config.ctaText}</p><GrowthCTA href={config.ctaHref}>{config.ctaLabel}</GrowthCTA></aside></article></main>}
