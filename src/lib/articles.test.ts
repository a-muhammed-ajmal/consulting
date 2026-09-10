import {
  ARTICLES,
  CATEGORIES,
  articleFullText,
  getArticle,
  getArticlesByCategory,
  getReadingTime,
} from './articles';

describe('article registry', () => {
  it('keeps slugs unique, dates valid, and categories resolvable', () => {
    expect(new Set(ARTICLES.map((article) => article.slug)).size).toBe(ARTICLES.length);
    for (const article of ARTICLES) {
      expect(Number.isNaN(Date.parse(article.publishedAt))).toBe(false);
      expect(Number.isNaN(Date.parse(article.updatedAt))).toBe(false);
      expect(Date.parse(article.updatedAt)).toBeGreaterThanOrEqual(Date.parse(article.publishedAt));
      expect(CATEGORIES.some((category) => category.slug === article.categorySlug)).toBe(true);
    }
  });

  it('resolves articles and categories without inventing missing records', () => {
    const article = ARTICLES[0];
    expect(getArticle(article.slug)).toBe(article);
    expect(getArticle('missing')).toBeUndefined();
    expect(getArticlesByCategory(article.categorySlug)).toContain(article);
    expect(getArticlesByCategory('missing')).toEqual([]);
  });

  it('builds reading-time input from every substantive article section', () => {
    const article = ARTICLES[0];
    const text = articleFullText(article);
    expect(text).toContain(article.title);
    expect(text).toContain(article.founderTrap.body);
    expect(text).toContain(article.theFix.stages[0].body);
    expect(text).toContain(article.payoff.pullQuote);
    expect(getReadingTime(article)).toBeGreaterThan(0);
  });
});
