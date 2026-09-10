jest.mock('./env', () => ({ SITE_URL: 'https://www.muhammedajmal.com' }));

import { AUTHOR_HEADSHOT_URL, SITE_NAME, pageMetadata } from './metadata';

describe('page metadata', () => {
  it('builds canonical, Open Graph, and Twitter values from one page definition', () => {
    const metadata = pageMetadata({
      title: 'Contact',
      description: 'Contact the practice.',
      path: '/contact',
    });

    expect(metadata.title).toBe('Contact');
    expect(metadata.alternates).toEqual({ canonical: 'https://www.muhammedajmal.com/contact' });
    expect(metadata.openGraph).toMatchObject({
      title: `Contact | ${SITE_NAME}`,
      url: 'https://www.muhammedajmal.com/contact',
      type: 'website',
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('supports absolute titles and noindex routes', () => {
    const metadata = pageMetadata({
      title: 'Private result',
      description: 'Private.',
      path: '/results',
      absoluteTitle: true,
      index: false,
    });

    expect(metadata.title).toEqual({ absolute: 'Private result' });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(AUTHOR_HEADSHOT_URL).toBe('https://www.muhammedajmal.com/images/muhammed-ajmal.jpg');
  });
});
