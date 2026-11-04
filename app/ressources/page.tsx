import {GrowthCTA} from '../../components/GrowthMetrics';
import type {Metadata} from 'next';
import articles from '../../data/growth/articles.json';
import config from '../../data/growth/config.json';
export const metadata:Metadata={title:'Ressources et conseils pratiques',description:'Des repères concrets pour préparer votre démarche et découvrir les solutions disponibles.',alternates:{canonical:'/ressources'},openGraph:{title:'Ressources et conseils pratiques',url:'/ressources'}};
export default function Resources(){return <main><p className="gr-eyebrow">{config.brand} · Ressources</p><h1>Des repères pour passer à l’étape suivante.</h1><p>{config.intro}</p><div className="gr-grid">{articles.map(a=><article className="gr-card" key={a.slug}><h2><a href={'/ressources/'+a.slug}>{a.title}</a></h2><p>{a.description}</p><small>Mise à jour : {a.updatedAt}</small></article>)}</div><aside className="gr-cta"><h2>{config.ctaTitle}</h2><p>{config.ctaText}</p><GrowthCTA href={config.ctaHref}>{config.ctaLabel}</GrowthCTA></aside></main>}
