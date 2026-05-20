'use client';

import { useEffect } from 'react';

type SmartDownloadFallbackLoggerProps = {
  source: string;
  deviceType: 'desktop' | 'unknown';
  enabled?: boolean;
};

export function SmartDownloadFallbackLogger({ source, deviceType, enabled = true }: SmartDownloadFallbackLoggerProps) {
  useEffect(() => {
    if (!enabled) return;

    const payload = JSON.stringify({
      destination: 'fallback',
      device_type: deviceType,
      source,
    });

    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon('/api/download-events', new Blob([payload], { type: 'application/json' }));
      if (sent) return;
    }

    fetch('/api/download-events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      cache: 'no-store',
      keepalive: true,
    }).catch(() => {
      // Reporting is best-effort and must never affect the landing page.
    });
  }, [deviceType, enabled, source]);

  return null;
}
