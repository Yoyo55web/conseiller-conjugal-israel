// app/_seo/metadata.ts
import type { Metadata } from "next";

const SITE_URL = "https://www.conseiller-conjugal-israel.com";
const DEFAULT_SOCIAL_IMAGE = "/images/hero-abstract3.png";

type BuildMetadataArgs = {
  title: string;
  description: string;
  pathname: string; // ex: "/" ou "/contact"
};

export function buildMetadata({
  title,
  description,
  pathname,
}: BuildMetadataArgs): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: pathname,
      siteName: "Conseiller conjugal Israël",
      title,
      description,
      images: [
        {
          url: DEFAULT_SOCIAL_IMAGE,
          width: 1536,
          height: 1024,
          alt: "Conseiller conjugal francophone en Israël",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}
