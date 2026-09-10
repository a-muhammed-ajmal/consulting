import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Site-default Open Graph image. A per-article override lives alongside the article.
// Literal hex is unavoidable here: ImageResponse is rendered by Satori, which cannot read
// the CSS custom properties in globals.css. These values match the design tokens exactly
// (--color-brand #0066FF, --color-accent #FFCC00, --color-ink #000033,
//  --color-muted #475569, --color-brand-tint #E6F0FF).

export const alt = 'Muhammed Ajmal · Business Operations & Growth Consultant';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const logoData = await readFile(
    join(process.cwd(), 'public', 'logos', 'muhammedajmalcom-lockup-640.png'),
    'base64',
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* ImageResponse requires a native image element; next/image is not supported by Satori. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${logoData}`}
            alt=""
            width={398}
            height={134}
            style={{
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            color: '#000033',
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
            letterSpacing: '-2px',
          }}
        >
          Build a business that grows beyond the founder.
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 48, height: 4, background: '#0066FF', marginRight: 20 }} />
          <span style={{ color: '#475569', fontSize: 24, fontWeight: 600 }}>
            Business Operations &amp; Growth Consultant · Dubai, UAE
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
