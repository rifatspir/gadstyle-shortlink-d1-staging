
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Gadstyle App Download',
    template: '%s | Gadstyle App Download',
  },
  description:
    'Download the Gadstyle app for faster mobile shopping in Bangladesh. Browse gadgets, electronics, accessories, home products, flash deals, coupons, order tracking, categories, brands, and direct product links from your phone.',
  applicationName: 'Gadstyle App Download',
  openGraph: {
    title: 'Gadstyle App Download',
    description:
      'Download the Gadstyle app for faster shopping, flash deals, coupons, order tracking, categories, brands, and direct product links.',
    siteName: 'Gadstyle App Download',
    type: 'website',
    images: [
      {
        url: '/gadstyle-app-download-preview.png',
        width: 1200,
        height: 630,
        alt: 'Gadstyle App Download preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadstyle App Download',
    description:
      'Download the Gadstyle app for faster shopping, flash deals, coupons, order tracking, and direct product links.',
    images: ['/gadstyle-app-download-preview.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/gadstyle-app-icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/gadstyle-app-icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <footer className="site-footer">
          <span>Developed by </span>
          <a href="https://marbwp.com/" target="_blank" rel="noreferrer">MARB</a>
        </footer>
      </body>
    </html>
  );
}
