
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function PromoRedirect() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(2);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSeconds((current) => (current > 1 ? current - 1 : current));
    }, 1000);

    const timer = window.setTimeout(() => {
      router.replace('/');
    }, 1800);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(timer);
    };
  }, [router]);

  return (
    <main className="promo-redirect-wrap">
      <section className="card promo-redirect-card">
        <div className="promo-spinner" aria-hidden="true" />
        <p className="eyebrow">Redirecting</p>
        <h1>That page was not found.</h1>
        <p className="muted-text">
          Sending you to the Gadstyle app landing page in {seconds} second{seconds === 1 ? '' : 's'}.
        </p>
      </section>
    </main>
  );
}
