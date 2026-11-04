export type GrowthConfig={projectId:string;brand:string;domain:string;intro:string;ctaTitle:string;ctaText:string;ctaLabel:string;ctaHref:string};
export type GrowthTest={id:string;name:string;status:'active'|'paused'|'completed';variants:{id:string;headline:string;cta:string}[];winner?:string;startedAt:string;minVisitors:number};
export function publicRoute(path:string):string{
 if(path==='/')return 'home';if(path==='/tarifs')return 'pricing';if(path==='/contact')return 'contact';if(path==='/creer-agent')return 'create-agent';if(path==='/demonstration')return 'demo';if(/^\/ressources(?:\/[a-z0-9-]+)?\/?$/.test(path))return 'resources';if(/^\/decouvrir\/[a-zA-Z0-9-]+\/?$/.test(path))return 'discovery';if(/^\/(secteurs\/[a-z0-9-]+|qualification-leads-ia|chatbot-ia-site-web|agent-ia-whatsapp|consultation-netanya|preparation-au-mariage)$/.test(path))return 'offering';return '';
}
export function channelFor(source:string){const s=source.toLowerCase();if(['google','facebook','instagram','linkedin','youtube','partner','email','direct'].includes(s))return s;return s?'other':'direct';}
export function campaignFor(value:string){return ['guides','presentation','organique','acquisition'].includes(value)?value:'other';}
export function activeTest(tests:GrowthTest[]){return tests.find(t=>t.status==='active')||tests.find(t=>t.status==='completed'&&t.winner)||null;}
export function safeTest(t:GrowthTest|undefined){return !!t&&/^[a-zA-Z0-9-]{3,100}$/.test(t.id)&&t.variants.length===2&&t.variants.every(v=>['a','b'].includes(v.id));}
