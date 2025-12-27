// app/_seo/metadata.ts
import type { Metadata } from "next";

const SITE_URL = "https://www.conseiller-conjugal-israel.com";

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
  };
}
