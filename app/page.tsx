
import Image from 'next/image';

const getEnvValue = (key: string, fallback: string) => {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : fallback;
};

const PLAY_STORE_URL = getEnvValue(
  'PLAY_STORE_URL',
  'https://play.google.com/store/apps/details?id=com.gadstylebd.app',
);
const APP_STORE_URL = getEnvValue('IOS_APP_STORE_URL', 'https://www.apple.com/app-store/');
const WEBSITE_URL = getEnvValue('WEBSITE_URL', 'https://www.gadstyle.com/');

const PLAY_STORE_KICKER = getEnvValue('PLAY_STORE_KICKER', 'Get it on');
const PLAY_STORE_LABEL = getEnvValue('PLAY_STORE_LABEL', 'Google Play');
const APP_STORE_KICKER = getEnvValue('APP_STORE_KICKER', 'Download on the');
const APP_STORE_LABEL = getEnvValue('APP_STORE_LABEL', 'App Store');

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
              <span className="store-kicker">{PLAY_STORE_KICKER}</span>
              <strong>{PLAY_STORE_LABEL}</strong>
            </a>
            <a className="store-button store-apple" href={APP_STORE_URL} target="_blank" rel="noreferrer">
              <span className="store-kicker">{APP_STORE_KICKER}</span>
              <strong>{APP_STORE_LABEL}</strong>
            </a>
            <a className="ghost-button website-button" href={WEBSITE_URL} target="_blank" rel="noreferrer">
              Visit website
            </a>
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
    </main>
  );
}
