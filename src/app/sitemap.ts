import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://freecellwithfriends.com';

  return [
    { url: `${baseUrl}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/help`, lastModified: new Date(), priority: 0.8 },
  ];
}