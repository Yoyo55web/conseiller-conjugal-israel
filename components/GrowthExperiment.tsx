'use client';
import {useEffect,useRef,useState} from 'react';
import {measurementConsent,trackGrowth} from './GrowthMetrics';
import {type GrowthTest} from '../lib/growth-shared';
import {growthLink} from '../lib/growth-attribution';
import config from '../data/growth/config.json';
export default function GrowthExperiment({test}:{test:GrowthTest}){const [variant,setVariant]=useState(test.variants[0]);const counted=useRef('');const [target,setTarget]=useState(config.ctaHref);
 useEffect(()=>{setTarget(growthLink(config.ctaHref,location.href));const record=()=>{let id=test.winner||'a';if(test.status==='active'&&measurementConsent()==='granted'){try{id=sessionStorage.getItem('yg-test-'+test.id)||'';if(!id){id=crypto.getRandomValues(new Uint8Array(1))[0]<128?'a':'b';sessionStorage.setItem('yg-test-'+test.id,id)}}catch{id='a';}}const v=test.variants.find(v=>v.id===id)||test.variants[0];setVariant(v);if(measurementConsent()==='granted'&&counted.current!==v.id){counted.current=v.id;trackGrowth('view',test.status==='active'?test.id:'',test.status==='active'?v.id:'')}};record();const event=config.projectId==='counselor'?'cci-analytics-consent-change':'yg-analytics-consent-change';window.addEventListener(event,record);return()=>window.removeEventListener(event,record);},[test]);
 return <main className="growth-resources"><nav aria-label="Navigation"><a href="/">Accueil</a><a href="/ressources">Ressources</a></nav><p className="gr-eyebrow">{config.brand}</p><h1>{variant.headline}</h1><p>{config.intro}</p><section className="gr-cta"><h2>{config.ctaTitle}</h2><p>{config.ctaText}</p><a className="gr-button" href={target} onClick={()=>{trackGrowth('cta',test.status==='active'?test.id:'',test.status==='active'?variant.id:'')}}>{variant.cta}</a></section></main>;
}
