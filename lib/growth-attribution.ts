// Propagate only coarse public campaign labels through our own public pages.
// No identifiers, visitor storage, arbitrary query contents or external destinations.
export function growthLink(href:string,current:string){
 try{const source=new URL(current);const target=new URL(href,source.origin);if(target.origin!==source.origin)return href;
 const permitted:Record<string,string[]>={utm_source:['direct','google','facebook','instagram','linkedin','youtube','partner','partenaire','email','other','ressources'],utm_medium:['social','organic','referral','email','cpc'],utm_campaign:['guides','presentation','organique','acquisition','other']};
 for(const [key,values] of Object.entries(permitted)){const value=(source.searchParams.get(key)||'').toLowerCase();if(values.includes(value))target.searchParams.set(key,value);}
 return target.pathname+target.search+target.hash;
 }catch{return href;}
}
