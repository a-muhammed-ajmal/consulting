import { SITE_URL } from "./env";
import { SITE_NAME, AUTHOR_HEADSHOT_URL } from "./metadata";
import type { Article } from "./articles";

/**
 * Structured data (schema.org / JSON-LD) builders.
 *
 * Rendered into a <script type="application/ld+json"> tag. Everything here is true today:
 * no aggregateRating, no review, no employee counts, no fabricated ratings.
 *
 * Serialise with JSON.stringify(...).replace(/</g, "\\u003c") when embedding, to neutralise
 * any "<" that could break out of the script tag.
 */

/** The practice as a person + professional service. Used on /about. */
export function personAndServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/about#person`,
        name: "Muhammed Ajmal",
        jobTitle: "Business Operations & Growth Consultant",
        url: `${SITE_URL}/about`,
        image: AUTHOR_HEADSHOT_URL,
        knowsLanguage: ["English", "Arabic", "Hindi", "Malayalam", "Tamil", "Kannada"],
        sameAs: ["https://www.linkedin.com/in/muhammed-ajmal-consultant/"],
        worksFor: { "@id": `${SITE_URL}#service` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}#service`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logos/muhammedajmalcom-mark-512.png`,
        description:
          "Business operations and growth consultancy for founder-led UAE SMEs, applying systems thinking, execution, and applied AI to reduce founder dependency.",
        areaServed: ["United Arab Emirates"],
        founder: { "@id": `${SITE_URL}/about#person` },
        provider: { "@id": `${SITE_URL}/about#person` },
      },
    ],
  };
}

/**
 * The five-stage commercial path as a Service with an OfferCatalog. Used on /services.
 *
 * No price, no aggregateRating and no offer availability: fees are scoped only after the
 * Audit (Anchor §6 "Sprint and Build"), so publishing any figure here would be a claim
 * the practice cannot support.
 */
export function serviceJsonLd(stages: readonly { name: string; description: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services#service`,
    name: "Business operations and growth consulting",
    serviceType: "Business operations and growth consulting",
    description:
      "A single evidence-led progression for founder-led UAE SMEs, from a free founder-dependency self-report through to an ongoing operating retainer.",
    provider: { "@id": `${SITE_URL}#service` },
    areaServed: ["United Arab Emirates"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Commercial path",
      itemListElement: stages.map((stage, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: stage.name,
          description: stage.description,
        },
      })),
    },
  };
}

/** FAQPage built from the published question and answer pairs. */
export function faqJsonLd(faqs: readonly { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/services#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** BlogPosting for an article. */
export function articleJsonLd(article: Article) {
  const url = `${SITE_URL}/insights/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: `${SITE_URL}/about`,
      image: AUTHOR_HEADSHOT_URL,
    },
    publisher: {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}#service`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logos/muhammedajmalcom-mark-512.png`,
    },
    mainEntityOfPage: url,
    articleSection: article.category,
  };
}

/** Breadcrumb trail for an article page. */
export function articleBreadcrumbJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/insights` },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/insights/${article.slug}`,
      },
    ],
  };
}

/** Serialises a JSON-LD object safely for embedding in a script tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
