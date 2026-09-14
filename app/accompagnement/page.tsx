import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../_seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Déroulement de l’accompagnement conjugal",
  description: "Première séance, cycle recommandé, cadre des échanges et accompagnement en visioconférence ou à Netanya.",
  pathname: "/accompagnement",
});

const sections = [
  ["La première séance", "La première rencontre sert principalement à comprendre l’histoire du couple, la situation actuelle et les attentes de chacun. Des premières orientations peuvent être proposées lorsque la situation le permet, mais elle ne constitue pas une promesse de résolution immédiate."],
  ["Un travail progressif", "Les difficultés conjugales se construisent souvent dans le temps. Un cycle initial de six séances est généralement recommandé pour travailler réellement, mettre en pratique des outils et dresser un bilan. Chaque couple reste libre de poursuivre ou d’interrompre l’accompagnement."],
  ["Un échange respectueux", "Chacun dispose d’un temps de parole sans être interrompu. Les insultes, menaces, humiliations et propos violents ne sont pas acceptés. Une séance peut être suspendue lorsque le cadre n’est plus respecté."],
  ["La cohérence du suivi", "Il est demandé de ne pas entreprendre simultanément un second suivi conjugal sans en parler préalablement. Cette règle ne concerne pas un suivi médical, psychologique, rabbinique, juridique ou tout autre accompagnement spécialisé."],
  ["Les conseils extérieurs", "Il est recommandé d’éviter de multiplier les conseils de proches, qui peuvent être partiels ou contradictoires. Un conseil extérieur important peut être apporté en séance avant d’être mis en application."],
  ["En visioconférence", "Chaque participant s’installe dans un endroit calme et privé, avec une connexion stable et, si nécessaire, des écouteurs. Aucun enregistrement ou capture n’est effectué sans l’accord de tous."],
] as const;

export default function AccompagnementPage() {
  return (
    <main className="bg-white px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-green-800">Un cadre clair avant de commencer</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Comment se déroule l’accompagnement ?</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-700">L’objectif est de permettre à chacun de s’exprimer, de comprendre ce qui entretient les difficultés et d’avancer dans une direction cohérente, sans jugement ni promesse irréaliste.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map(([title, body]) => <section key={title} className="rounded-2xl border bg-gray-50 p-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 leading-relaxed text-gray-700">{body}</p></section>)}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/tarifs" className="rounded-xl bg-green-800 px-6 py-3 font-semibold text-white">Voir les tarifs et le parcours</Link>
          <Link href="/contact" className="rounded-xl border px-6 py-3 font-semibold">Prendre contact</Link>
        </div>
      </div>
    </main>
  );
}
