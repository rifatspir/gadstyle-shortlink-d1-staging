"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  appHost: string;
  appPath: string;
  canonicalUrl: string;
  headline: string;
};

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.gadstylebd.app";

export function OpenAppLanding({ appHost, appPath, canonicalUrl, headline }: Props) {
  const [status, setStatus] = useState("Trying to open the Gadstyle app…");

  const appUrl = useMemo(() => `https://${appHost}${appPath}`, [appHost, appPath]);
  const intentUrl = useMemo(() => {
    const cleanPath = appPath.startsWith("/") ? appPath : `/${appPath}`;
    return `intent://${appHost}${cleanPath}#Intent;scheme=https;package=com.gadstylebd.app;S.browser_fallback_url=${encodeURIComponent(canonicalUrl)};end`;
  }, [appHost, appPath, canonicalUrl]);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    let fallbackTimer: number | undefined;

    if (isAndroid) {
      fallbackTimer = window.setTimeout(() => {
        setStatus("App not found. Opening the website fallback…");
        window.location.replace(intentUrl);
      }, 200);
      return () => {
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
      };
    }

    if (isIOS) {
      setStatus("Install the iOS app later, or continue on the website for now.");
      return;
    }

    setStatus("Continue in the app on mobile, or open the website from this browser.");
  }, [intentUrl]);

  return (
    <main className="fallback-shell">
      <section className="fallback-card">
        <p className="eyebrow">Gadstyle App Link</p>
        <h1>{headline}</h1>
        <p className="muted-text fallback-copy">{status}</p>

        <div className="fallback-actions">
          <a className="primary-button" href={intentUrl}>Open in Android App</a>
          <a className="ghost-button" href={PLAY_STORE_URL}>Install Android App</a>
          <a className="ghost-button" href={canonicalUrl}>Continue on Website</a>
        </div>

        <div className="fallback-meta">
          <p><strong>App link:</strong> {appUrl}</p>
          <p><strong>Website fallback:</strong> {canonicalUrl}</p>
        </div>
      </section>
    </main>
  );
}
