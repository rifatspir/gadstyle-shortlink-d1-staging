
import Link from 'next/link';
import Image from 'next/image';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.gadstylebd.app';
const APP_STORE_URL = process.env.IOS_APP_STORE_URL || 'https://www.apple.com/app-store/';
const WEBSITE_URL = 'https://www.gadstyle.com/';

export default function HomePage() {
  return (
    <main className="promo-page">
      <section className="promo-hero card">
        <div className="promo-copy">
          <p className="eyebrow">Gadstyle app</p>
          <h1>Shop Gadstyle faster on mobile.</h1>
          <p className="promo-text">
            Shortlink server provided for the Gadstyle app. Browse faster, open product links directly in the app,
            and continue seamlessly on mobile with product, category, brand, and shortlink support.
          </p>

          <div className="promo-actions">
            <a className="store-button store-play" href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
              <span className="store-kicker">Get it on</span>
              <strong>Google Play</strong>
            </a>
            <a className="store-button store-apple" href={APP_STORE_URL} target="_blank" rel="noreferrer">
              <span className="store-kicker">Download on the</span>
              <strong>App Store</strong>
            </a>
            <a className="ghost-button website-button" href={WEBSITE_URL} target="_blank" rel="noreferrer">
              Visit website
            </a>
          </div>

          <div className="promo-points">
            <div className="promo-point"><strong>ID-based links</strong><span>/p, /c, /b, /s stay unchanged</span></div>
            <div className="promo-point"><strong>Fast app opens</strong><span>Built for Gadstyle app deeplinks</span></div>
            <div className="promo-point"><strong>Safe fallback</strong><span>Invalid paths can return visitors here</span></div>
          </div>
        </div>

        <div className="promo-visual" aria-hidden="true">
          <div className="promo-device-stack">
            <div className="promo-device promo-device-back" />
            <div className="promo-device promo-device-mid" />
            <div className="promo-device promo-device-front">
              <div className="promo-device-notch" />
              <div className="promo-screen">
                <div className="promo-logo-block">
                  <Image
                    src="/icon-512.png"
                    alt="Gadstyle Shortlink"
                    width={88}
                    height={88}
                    className="promo-icon"
                    priority
                  />
                  <Image
                    src="/gadstyle-shortlink-logo.png"
                    alt="Gadstyle Shortlink"
                    width={522}
                    height={128}
                    className="promo-logo"
                    priority
                  />
                </div>
                <div className="promo-screen-card">
                  <span className="promo-chip">Open in app</span>
                  <h3>Product, category, brand, and shortlink ready</h3>
                  <p>Optimized for app.gadstyle.com direct and short routes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="promo-bottom card">
        <div>
          <h2>Built as a mobile-first landing and fallback page</h2>
          <p className="muted-text">
            Root visits can promote the app, while admin stays protected at <Link href="/admin">/admin</Link>.
            Invalid unmatched paths can safely return here without affecting shortlink generation or resolution.
          </p>
        </div>
      </section>
    </main>
  );
}
