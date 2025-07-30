import config from "@/config";

export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: any;
  canonicalUrlRelative?: string;
  extraTags?: any;
} = {}) => {
  return {
    title: title || config.appName,
    description: description || config.appDescription,
    keywords: keywords || [config.appName],
    applicationName: config.appName,
    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),
    
    openGraph: {
      title: openGraph?.title || title || config.appName,
      description: openGraph?.description || description || config.appDescription,
      url: openGraph?.url || `https://${config.domainName}${canonicalUrlRelative || "/"}`,
      siteName: openGraph?.siteName || config.appName,
      images: [
        {
          url: openGraph?.images?.[0]?.url || `https://${config.domainName}/opengraph-image.png`,
          width: openGraph?.images?.[0]?.width || 1200,
          height: openGraph?.images?.[0]?.height || 660,
        },
      ],
      locale: openGraph?.locale || "zh_CN",
      type: openGraph?.type || "website",
    },
    
    twitter: {
      title: openGraph?.title || title || config.appName,
      description: openGraph?.description || description || config.appDescription,
      images: [openGraph?.images?.[0]?.url || `https://${config.domainName}/opengraph-image.png`],
      card: "summary_large_image",
      creator: "@marc_louvion",
    },
    
    ...extraTags,
  };
};