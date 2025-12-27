import type { Metadata } from "next";
import HomeV2 from "./_components/HomeV2";
import { buildMetadata } from "./_seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Conseiller conjugal en Israël – Netanya & visio",
  description:
    "Accompagnement conjugal confidentiel : gestion des conflits, communication, crise, préparation au mariage. Présentiel à Netanya, visio en français partout.",
  pathname: "/",
});

export default function Page() {
  return <HomeV2 />;
}
