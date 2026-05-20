import Image from 'next/image';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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

const BOT_USER_AGENT_PATTERN = /(bot|crawl|spider|slurp|facebookexternalhit|telegrambot|whatsapp|twitterbot|linkedinbot|preview)/i;

type SmartDownloadDecision = {
  targetUrl: string | null;
  destination: 'play_store' | 'app_store' | 'fallback';
  deviceType: 'android' | 'ios' | 'desktop' | 'unknown' | 'bot';
  shouldLog: boolean;
};

const getSmartDownloadDecision = (userAgent: string): SmartDownloadDecision => {
  if (!userAgent) {
    return { targetUrl: null, destination: 'fallback', deviceType: 'unknown', shouldLog: true };
  }

  if (BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return { targetUrl: null, destination: 'fallback', deviceType: 'bot', shouldLog: false };
  }

  const normalizedUserAgent = userAgent.toLowerCase();

  if (normalizedUserAgent.includes('android')) {
    return { targetUrl: PLAY_STORE_URL, destination: 'play_store', deviceType: 'android', shouldLog: true };
  }

  if (
    normalizedUserAgent.includes('iphone') ||
    normalizedUserAgent.includes('ipad') ||
    normalizedUserAgent.includes('ipod') ||
    (normalizedUserAgent.includes('macintosh') && normalizedUserAgent.includes('mobile'))
  ) {
    return { targetUrl: APP_STORE_URL, destination: 'app_store', deviceType: 'ios', shouldLog: true };
  }

  return { targetUrl: null, destination: 'fallback', deviceType: 'desktop', shouldLog: true };
};

const normalizeSource = (value: string | null) => {
  if (!value) return 'direct';
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).hostname.replace(/^www\./, '').toLowerCase() || 'direct';
    } catch {
      return 'direct';
    }
  }
  return value.toLowerCase().replace(/[^a-z0-9._:-]/g, '').slice(0, 120) || 'direct';
};

const getSearchValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const getSmartDownloadSource = (requestHeaders: Headers, params: Record<string, string | string[] | undefined>) => {
  const utmSource = getSearchValue(params.utm_source)?.trim();
  if (utmSource) return normalizeSource(`utm:${utmSource}`);
  return normalizeSource(requestHeaders.get('referer'));
};

const logSmartDownloadEvent = async (decision: SmartDownloadDecision, source: string) => {
  if (!decision.shouldLog) return;

  const apiBaseUrl = process.env.SHORTLINK_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!apiBaseUrl) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 650);

  try {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    const secret = process.env.SMART_DOWNLOAD_LOG_SECRET?.trim();
    if (secret) headers['x-smart-download-secret'] = secret;

    await fetch(`${apiBaseUrl}/api/download-events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        destination: decision.destination,
        device_type: decision.deviceType,
        source,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch {
    // Redirect/report logging must never block the public landing page.
  } finally {
    clearTimeout(timeout);
  }
};


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

function LandingHomePage() {
  return (
    <main className="promo-page">
      <section className="promo-hero card">
        <div className="promo-copy">
          <p className="eyebrow">Gadstyle App Download</p>
          <h1>Download the Gadstyle App.</h1>
          <p className="promo-text">
            Shop Gadstyle faster from your phone with quick access to gadgets, mobile accessories, electronics,
            home products, flash deals, coupons, order tracking, categories, brands, and direct product links.
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

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const params = searchParams ? await searchParams : {};
  const decision = getSmartDownloadDecision(requestHeaders.get('user-agent') ?? '');
  const source = getSmartDownloadSource(requestHeaders, params);

  await logSmartDownloadEvent(decision, source);

  if (decision.targetUrl) {
    redirect(decision.targetUrl);
  }

  return <LandingHomePage />;
}
