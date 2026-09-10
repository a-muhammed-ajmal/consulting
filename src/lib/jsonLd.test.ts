jest.mock('./env', () => ({ SITE_URL: 'https://www.muhammedajmal.com' }));

import { ARTICLES } from './articles';
import {
  articleBreadcrumbJsonLd,
  articleJsonLd,
  faqJsonLd,
  jsonLdScript,
  personAndServiceJsonLd,
  serviceJsonLd,
} from './jsonLd';

describe('JSON-LD builders', () => {
  it('connects the person to a professional service with public provenance and a logo', () => {
    const data = personAndServiceJsonLd();
    expect(data['@graph']).toEqual(expect.arrayContaining([
      expect.objectContaining({
        '@type': 'Person',
        sameAs: ['https://www.linkedin.com/in/muhammed-ajmal-consultant/'],
      }),
      expect.objectContaining({
        '@type': 'ProfessionalService',
        logo: 'https://www.muhammedajmal.com/logos/muhammedajmalcom-mark-512.png',
      }),
    ]));
  });

  it('builds service, FAQ, article, and breadcrumb structures from supplied content', () => {
    expect(serviceJsonLd([{ name: 'Audit', description: 'Evidence review' }]))
      .toMatchObject({ '@type': 'Service', hasOfferCatalog: { itemListElement: [{ position: 1 }] } });
    expect(faqJsonLd([{ question: 'Why?', answer: 'Evidence.' }]))
      .toMatchObject({ '@type': 'FAQPage', mainEntity: [{ name: 'Why?' }] });

    const article = ARTICLES[0];
    expect(articleJsonLd(article)).toMatchObject({
      '@type': 'BlogPosting',
      headline: article.title,
      publisher: { '@type': 'ProfessionalService', '@id': 'https://www.muhammedajmal.com#service' },
    });
    expect(articleBreadcrumbJsonLd(article).itemListElement).toHaveLength(3);
  });

  it('neutralises markup-breaking less-than characters during serialization', () => {
    const serialized = jsonLdScript({ value: '</script><script>alert(1)</script>' });
    expect(serialized).not.toContain('<');
    expect(serialized).toContain('\\u003c/script>');
  });
});
