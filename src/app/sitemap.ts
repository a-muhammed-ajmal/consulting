import { MetadataRoute } from 'next';
import { ARTICLES, CATEGORIES } from '@/lib/articles';
import { SITE_URL } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/services`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/insights`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/diagnostic`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Generated from the article registry, so future articles are included automatically.
  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${base}/insights/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Only categories that actually have articles behind them.
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.filter((c) =>
    ARTICLES.some((a) => a.categorySlug === c.slug),
  ).map((c) => ({
    url: `${base}/insights/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes];
}
