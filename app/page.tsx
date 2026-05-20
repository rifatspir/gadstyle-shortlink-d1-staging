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

const HERO_SCREENS = [
  {
    key: 'cart',
    src: '/homepage-showcase/cart-screen.webp',
    alt: 'Gadstyle iPhone app cart screen preview',
    className: 'promo-device-left',
  },
  {
    key: 'home',
    src: '/homepage-showcase/home-screen.webp',
    alt: 'Gadstyle iPhone app home screen preview',
    className: 'promo-device-center',
  },
  {
    key: 'search',
    src: '/homepage-showcase/search-screen.webp',
    alt: 'Gadstyle iPhone app search screen preview',
    className: 'promo-device-right',
  },
] as const;

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

        <div className="promo-visual" aria-label="Gadstyle app preview on iPhone-style devices">
          <div className="promo-device-stack">
            {HERO_SCREENS.map((screen, index) => (
              <div key={screen.key} className={`promo-device ${screen.className}`}>
                <div className="promo-device-frame">
                  <div className="promo-device-notch" />
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={640}
                    height={1390}
                    className="promo-device-image"
                    priority={index === 1}
                    sizes="(max-width: 680px) 205px, (max-width: 1040px) 240px, 282px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
