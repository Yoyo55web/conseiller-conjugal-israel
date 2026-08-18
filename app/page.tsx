import type { Metadata } from "next";
import HomeV2 from "./_components/HomeV2";
import { buildMetadata } from "./_seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Conseiller conjugal en Israël – Netanya & visio",
  description:
    "Accompagnement conjugal confidentiel : gestion des conflits, communication, crise, préparation au mariage. Présentiel à Netanya, visio en français partout.",
  pathname: "/",
});

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yoni Berrebi",
  jobTitle: "Conseiller conjugal",
  url: "https://www.conseiller-conjugal-israel.com/qui-sommes-nous",
  telephone: "+972585360510",
  email: "conseiller.conjugal.israel@gmail.com",
  knowsLanguage: ["fr"],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomeV2 />
    </>
  );
}
