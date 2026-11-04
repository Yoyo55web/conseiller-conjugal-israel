import type {ReactNode} from 'react';
import './resources.css';
export default function ResourceLayout({children}:{children:ReactNode}){return <div className="growth-resources"><nav aria-label="Navigation des ressources"><a href="/">Accueil</a><a href="/ressources">Toutes les ressources</a></nav>{children}</div>}
